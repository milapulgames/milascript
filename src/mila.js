/*  Sobre este archivo
  Este es el intérprete de milascript. Se puede utilizar a través de un navegador web o mediante NodeJs.
  Para ejecutarlo en un navegador web: Crear un archivo html que incluya en el encabezado un script de tipo módulo
    y cuyo archivo fuente sea este. Luego se pueden cargar archivos de milascript invocando al procedimiento Mila.Cargar,
    pasándole como argumento la cadena de texto correspondiente a la ruta del archivo a cargar (sin la extensión).
  Para ejecutarlo mediante NodeJs: Ejecutar en una terminal `node mila.js ` seguido del nombre del archivo milascript a cargar.
    Se le pueden pasar argumentos tanto al script `mila.js` como al archivo milascript a cargar. Los argumentos pueden ser textos
    sin el caracter ':' (se almacenan en Mila.entorno().argumentos.lista) o pares clave - valor usando el caracter ':' para separar la
    clave del valor (se almacenan como claves de Mila.entorno().argumentos). Si el argumento comienza con el caracter ':' se usa el resto
    como clave y el valor es el booleano 'true'. Si uno de los argumentos tiene clave 'args' se usa su valor como ruta a un archivo json
    de argumentos, de donde se obtendrán todos los argumentos que no se hayan pasado a mano. El mismo archivo puede tener también una
    clave 'lista' con una lista de textos que se agregarán a los pasados a mano. Si existe un archivo json con el mismo nombre que el archivo milascript a cargar, se utiliza como archivo de argumentos.
*/

// Entorno de ejecución

const entorno = { /*
    id (string): Identificador del entorno. Puede ser "Navegador" o "NodeJs".
    universo (objeto): El objeto global (window en el navegador, global o globalThis en NodeJs).
    compilado (booleano): Se está ejecutando un html compilado (ya incluye todos los scripts necesarios).
  */
  enNavegador: function() {
    // Indica si se está ejecutando en el navegador.
    return this.id === "Navegador";
  },
  enNodeJs: function() {
    // Indica si se está ejecutando en NodeJs.
    return this.id === "NodeJs";
  },
  rutaMila: function() {
    // Describe la ruta a los fuentes de milascript
    return ('milascript' in Mila._proyectos)
      ? Mila._proyectos.milascript
      : '.'
    ;
  }
};

entorno.id = (typeof window === "object" && typeof process === "undefined")
  ? "Navegador"
  : "NodeJs"
;

entorno.universo =
  typeof globalThis === "object" ? globalThis
: typeof window === "object" ? window
: typeof global === "object" ? global
: null
;

entorno.compilado = ('compilado' in entorno.universo)
  ? entorno.universo.compilado
  : false
;

entorno.universo.Mila = {
  entorno: function() {
    // Describe el entorno de ejecución actual.
    return entorno;
  }
};

// Primitivas de entorno

/*
  Mila._accesoArchivo : Toma una cadena de texto correspondiente a la ruta de un archivo y una función de un parámetro.
    Abre el archivo y luego invoca a la función pasándole como argumento un objeto que representa el resultado de la operación.
    El objeto puede tener el campo 'error' si ocurrió un error al abrir el archivo y su valor será el error que ocurrió.
    El objeto puede tener el campo 'contenido' si el archivo se abrió correctamente
      y su valor será una cadena de texto correspondiente al contenido del archivo.
  Mila._AgregarCódigo : Toma una cadena de texto correspondiente a un fragmento de código Javascript,
      lo agrega al entorno de ejecución actual y lo ejecuta.
    También toma una segunda cadena de texto correspondiente al tipo de archivo de donde se extrajo el fragmento de código.
    Este segundo argumento puede ser "Mila" si el archivo original era un archivo de milascript o "JS" si era un archivo de Javascript.
*/

if (entorno.enNodeJs()) {
  Mila._os = process;
  Mila._fs = await import("node:fs");
  Mila._path = await import("node:path");
  const { exec } = await import("child_process")
  Mila._accesoArchivo = function(ruta, funcion) {
    Mila._fs.readFile(ruta, "utf8", (error, contenido) => {
      const resultado = {};
      if (error) {
        resultado.error = error;
      } else {
        resultado.contenido = contenido;
      }
      funcion(resultado);
    });
  };
  const vm = await import("node:vm");
  Mila._AgregarCódigo = function(código, tipo) {
    const script = new vm.Script(código);
    script.runInThisContext();
  };
  Mila.os = function() { return Mila._os; }
  Mila.fs = function() { return Mila._fs; }
  Mila.path = function() { return Mila._path; }
  Mila.exec = exec;
} else {
  Mila._accesoArchivo = function(ruta, funcion) {
    if (Mila._contenidoArchivoTemporal.ruta === ruta) {
      // Tengo el contenido cacheado
      funcion({contenido:Mila._contenidoArchivoTemporal.contenido});
    } else {
      let pedido = new XMLHttpRequest();
      try {
        pedido.open("GET", ruta, true);
        pedido.onreadystatechange = function() {
          if (pedido.readyState == 4) {
            const resultado = {};
            if (pedido.status == 200) {
              resultado.contenido = pedido.responseText;
            } else {
              resultado.error = pedido.status;
            }
            funcion(resultado);
          }
        };
        pedido.send("");
      } catch (e) {
        funcion({error: e});
      }
    }
  };
  Mila._AgregarCódigo = function(código, tipo) {
    let script = document.createElement("script");
    if (tipo == "Mila") {
      script.setAttribute("type", "module");
    }
    script.text = código;
    document.head.appendChild(script);
  };
  Mila.os = function() { Mila._Fallar("No disponible en el navegador"); }
  Mila.fs = function() { Mila._Fallar("No disponible en el navegador"); }
  Mila.path = function() { Mila._Fallar("No disponible en el navegador"); }
}

// Archivos

Mila._archivos = {}; // Mapa de archivos incluidos (puede haber varios nombres para un mismo archivo).
Mila._rutasDeArchivos = {}; // Mapa de rutas reales de los archivos importados (acá no puede haber repetidos).
Mila._archivosPendientes = {
  siguientes: [], // Lista de rutas de archivos que están esperando a ser cargados (entran en RECIEN_AGREGADO y salen
  // en AGREGANDO_AL_ENTORNO o en ALIAS).
  cargandoAhora: [] // Lista de rutas de archivos que están siendo cargados ahora (entran en AGREGANDO_AL_ENTORNO y
  // salen en CONTENIDO_EJECUTADO).
};

const ESTADO_RECIEN_AGREGADO = 0; // Apenas se solicita cargar u otro módulo lo importa (todavía no se hizo el pedido).
const ESTADO_ESPERANDO_CONTENIDO = 1; // Cuando se manda el pedido del contenido.
const ESTADO_CONTENIDO_RECIBIDO = 2; // Mientras se procesa el contenido recibido.
const ESTADO_ESPERANDO_DEPENDENCIAS = 3; // Mientras se espera que las dependencias se carguen (a partir de acá ya existe su configuración).
const ESTADO_DEPENDENCIAS_CUMPLIDAS = 4; // Ya se cargaron las dependencias, esperando el turno para agregarse al entorno.
const ESTADO_AGREGANDO_AL_ENTORNO = 5; // Agregando el código al entorno de ejecución.
const ESTADO_CONTENIDO_EJECUTADO = 6; // Después de que se haya ejecutado el código.
const ESTADO_ALIAS = 7; // Usado para declarar que el estado de este archivo no importa y hay que mirar en lugar el de su alias (en el campo 'aliasDe').

Mila._DeclararNuevoArchivo = function(rutaArchivo, tipoArchivo, aPedidoDe) {
  Mila._archivos[Mila._claveArchivoParaRuta(rutaArchivo)] = {
    estado: ESTADO_RECIEN_AGREGADO,
    tipo: tipoArchivo,
    dependientes: (aPedidoDe === null ? [] : [aPedidoDe])
  };
};

Mila._DeclararNuevaRutaDeArchivo = function(rutaReal, rutaArchivo) {
  Mila._rutasDeArchivos[Mila._claveArchivoParaRuta(rutaReal)] = rutaArchivo;
};

Mila._AsignarEstadoArchivo = function(rutaArchivo, estado) {
  Mila._dataDeArchivo(rutaArchivo).estado = estado;
};

Mila._AsignarRutaRealArchivo = function(rutaArchivo, rutaReal) {
  Mila._dataDeArchivo(rutaArchivo).rutaReal = rutaReal;
};

Mila._AsignarConfiguraciónArchivo = function(rutaArchivo, configuración) {
  Mila._dataDeArchivo(rutaArchivo).configuración = configuración;
};

Mila._AsignarAliasDeArchivo = function(rutaArchivo, alias) {
  Mila._dataDeArchivo(rutaArchivo).aliasDe = alias;
};

Mila._dataDeArchivo = function(rutaArchivo) {
  return Mila._archivos[Mila._claveArchivoParaRuta(rutaArchivo)];
};

Mila._dataDeRutaArchivo = function(rutareal) {
  return Mila._rutasDeArchivos[Mila._claveArchivoParaRuta(rutareal)];
};

Mila._tipoDeArchivo = function(rutaArchivo) {
  return Mila._dataDeArchivo(rutaArchivo).tipo;
};

Mila._aliasDeArchivo = function(rutaArchivo) {
  return Mila._dataDeArchivo(rutaArchivo).aliasDe;
};

Mila._estadoDeArchivo = function(rutaArchivo) {
  return Mila._dataDeArchivo(rutaArchivo).estado;
};

Mila._configuraciónDeArchivo = function(rutaArchivo) {
  return Mila._dataDeArchivo(rutaArchivo).configuración;
};

Mila._rutaRealDeArchivo = function(rutaArchivo) {
  return Mila._dataDeArchivo(rutaArchivo).rutaReal;
};

Mila._dependientesDeArchivo = function(rutaArchivo) {
  return Mila._dataDeArchivo(rutaArchivo).dependientes;
};

Mila._claveArchivoParaRuta = function(rutaArchivo) {
  return `__${rutaArchivo}__`;
};

Mila.Modulo = function(configuración) {
  // Declara un nuevo módulo a partir de la configuración dada.
    // configuración es el objeto de configuración de un archivo de código milascript.
  // Falla si la configuración dada define un módulo que ya fue definido antes.
  Mila._DefinirArchivo_(configuración);
  if ('define' in configuración) {
    Mila._RegistrarModulo_En_(configuración.define, entorno.universo, []);
  }
};

Mila.Cargar = function(rutaArchivo) {
  // Carga el archivo de código milascript que se encuentra en la ruta dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo de código milascript.
  // Falla si el archivo ya fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  const nombreArchivo = Mila._nombreDe_(rutaArchivo);
  const ubicacionArchivo = Mila._ruta_NavegandoProyectos(Mila._ubicacionDe_(rutaArchivo));
  Mila._CargarArchivoMila_En_(nombreArchivo, ubicacionArchivo);
};

Mila.CargarScript = function(rutaArchivo) {
  // Carga el archivo de código Javascript que se encuentra en la ruta dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo de código Javascript.
  // Falla si el archivo ya fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  Mila._CargarArchivoJs_En_(rutaArchivo, "./");
};

Mila._CargarArchivoMila_En_ = function(rutaArchivo, ubicacion, aPedidoDe=null) {
  // Carga el archivo de código milascript que se encuentra en la ruta dada, en la ubicación dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo de código milascript.
    // ubicacion es una cadena de texto correspondiente a la ubicación desde donde se acccede a la ruta.
    // aPedidoDe es una cadena de texto correspondiente al archivo que inició el pedido y requiere a este otro para funcionar
      // (null si se carga a mano o si no es un requisito fuerte).
  // Falla si el archivo ya fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  Mila._CargarArchivo_DeTipo_En_(rutaArchivo, "Mila", ubicacion, aPedidoDe);
};

Mila._CargarArchivoJs_En_ = function(rutaArchivo, ubicacion, aPedidoDe=null) {
  // Carga el archivo de código Javascript que se encuentra en la ruta dada, en la ubicación dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo de código Javascript.
    // ubicacion es una cadena de texto correspondiente a la ubicación desde donde se acccede a la ruta.
    // aPedidoDe es una cadena de texto correspondiente al archivo que inició el pedido y requiere a este otro para funcionar
      // (null si se carga a mano o si no es un requisito fuerte).
  // Falla si el archivo ya fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  Mila._CargarArchivo_DeTipo_En_(rutaArchivo, "JS", ubicacion, aPedidoDe);
};

Mila._CargarArchivo_DeTipo_En_ = function(rutaArchivo, tipoArchivo, ubicacion, aPedidoDe=null) {
  // Carga el archivo del tipo dado que se encuentra en la ruta dada, en la ubicación dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo de código milascript.
    // tipo es una cadena de texto correspondiente al tipo de archivo solicitado
      // (puede ser "Mila" si el archivo es de milascript o "JS" si es de Javascript).
    // ubicacion es una cadena de texto correspondiente a la ubicación desde donde se acccede a la ruta.
    // aPedidoDe es una cadena de texto correspondiente al archivo que inició el pedido y requiere a este otro para funcionar
      // (null si se carga a mano o si no es un requisito fuerte).
  // Falla si el archivo ya fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  let rutaCompleta = Mila._rutaCompletaA_Desde_(rutaArchivo, ubicacion);
  if (Mila._archivo_Existe(rutaCompleta)) {
    Mila._Fallar(`El archivo ${rutaCompleta} ya fue solicitado.`);
    return;
  }
  Mila._EncolarArchivo_DeTipo_(rutaCompleta, tipoArchivo, aPedidoDe);
  Mila._PedirContenidoArchivo_(rutaCompleta);
};

Mila._PedirContenidoArchivo_ = function(rutaArchivo) {
  // Inicia un pedido para obtener el contenido del archivo que se encuentra en la ruta dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  // PRE: El archivo dado no fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  Mila._AsignarEstadoArchivo(rutaArchivo, ESTADO_ESPERANDO_CONTENIDO);
  let rutaReal = Mila._ruta_NavegandoProyectos(rutaArchivo);
  if (Mila._ValidarAlias(rutaArchivo, rutaReal)) {
    return;
  }
  Mila._DeclararNuevaRutaDeArchivo(rutaReal, rutaArchivo);
  Mila._accesoArchivo(`${rutaReal}.js`, function(resultado) {
    if ('contenido' in resultado) {
      Mila._AsignarRutaRealArchivo(rutaArchivo, rutaReal);
      Mila._RecibirContenidoArchivo_(rutaArchivo, resultado.contenido);
    } else {
      Mila._Fallar(`No se pudo cargar el archivo ${rutaArchivo} (${rutaReal}).`);
      Mila._MostrarError(resultado.error);
    }
  });
};

Mila._RecibirContenidoArchivo_ = function(rutaArchivo, contenido) {
  // Procesa el contenido dado, correspondiente al archivo que se encuentra en la ruta dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // contenido es una cadena de texto correspondiente al contenido del archivo.
  // PRE: El contenido dado corresponde al archivo que se encuentra en la ruta dada.
  Mila._AsignarEstadoArchivo(rutaArchivo, ESTADO_CONTENIDO_RECIBIDO);
  let configuración = {};
  if (Mila._tipoDeArchivo(rutaArchivo) == "Mila") {
    let inicioEncabezado = contenido.indexOf('Mila.Modulo({');
    if (inicioEncabezado < 0) {
      configuración.código = contenido;
    } else {
      let finEncabezado = contenido.indexOf('});');
      eval(`configuración = {${contenido.substring(inicioEncabezado+13,finEncabezado)}};`);
      configuración.código = contenido.substring(finEncabezado+3);
    }
  } else { // tipo = "JS"
    configuración = {código:contenido, pendientes:[]};
  }
  Mila._Ajustar_Para_(configuración, rutaArchivo);
  Mila._DefinirArchivo_(configuración);
  Mila._AsignarConfiguraciónArchivo(rutaArchivo, configuración);
  Mila._CargarDependenciasArchivo_(rutaArchivo, configuración);
};

Mila._CargarDependenciasArchivo_ = function(rutaArchivo, configuración) {
  // Registra las dependencias del archivo dado e inicia los pedidos correspondientes para cumplirlas.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // configuración es el objeto de configuración del archivo dado.
  for (let archivoImportado of configuración.usa) {
    if (!Mila._archivo_Existe(archivoImportado)) {
      Mila._CargarArchivoMila_En_(archivoImportado, '');
    }
  }
  for (let archivoImportado of configuración.usaJs) {
    if (!Mila._archivo_Existe(archivoImportado)) {
      Mila._CargarArchivoJs_En_(archivoImportado, '');
    }
  }
  configuración.pendientes = [];
  for (let archivoImportado of configuración.necesita) {
    if (Mila._archivo_Existe(archivoImportado)) {
      Mila._RegistrarDependenciaDe_A_(rutaArchivo, archivoImportado);
      if (!Mila._archivo_YaFueEjecutado(archivoImportado)) {
        configuración.pendientes.push(archivoImportado);
      }
    } else {
      Mila._CargarArchivoMila_En_(archivoImportado, '', rutaArchivo);
      configuración.pendientes.push(archivoImportado);
    }
  }
  for (let archivoImportado of configuración.necesitaJs) {
    if (Mila._archivo_Existe(archivoImportado)) {
      Mila._RegistrarDependenciaDe_A_(rutaArchivo, archivoImportado);
      if (!Mila._archivo_YaFueEjecutado(archivoImportado)) {
        configuración.pendientes.push(archivoImportado);
      }
    } else {
      Mila._CargarArchivoJs_En_(archivoImportado, '', rutaArchivo);
      configuración.pendientes.push(archivoImportado);
    }
  }
  Mila._AsignarEstadoArchivo(rutaArchivo, ESTADO_ESPERANDO_DEPENDENCIAS);
  Mila._VerificarDependenciasCumplidasDe_(rutaArchivo);
  Mila._IntentarCargarProximo();
};

Mila._VerificarDependenciasCumplidasDe_ = function(rutaArchivo) {
  // Actualiza el objeto de configuración del archivo dado según las dependencias del mismo que ya se cumplieron.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  if (Mila._esta_EsperandoDependencias(rutaArchivo)) {
    let pendientes = Mila._pendientesDe_(rutaArchivo);
    while (pendientes.length > 0 && Mila._archivo_YaFueEjecutado(pendientes[0])) {
      pendientes.shift();
    }
    if (pendientes.length == 0) {
      Mila._CompletarDependenciasPendientesDe_(rutaArchivo);
    }
  }
};

Mila._pendientesDe_ = function(rutaArchivo) {
  // Describe la lista de pendientes del archivo correspondiente a la ruta dada.
  return Mila._configuraciónDeArchivo((Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ALIAS)
    ? Mila._aliasDeArchivo(rutaArchivo)
    : rutaArchivo
  ).pendientes;
};

Mila._CompletarDependenciasPendientesDe_ = function(rutaArchivo) {
  // Actualiza el estado del archivo dado, indicando que ya se cumplieron todas sus dependencias.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  Mila._dataDeArchivo(rutaArchivo).estado = ESTADO_DEPENDENCIAS_CUMPLIDAS;
};

Mila._Agregar_AlEntorno = function(rutaArchivo) {
  // Agrega el código del archivo dado al entorno de ejecución actual.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  // PRE: Todas las dependencias del archivo dado ya fueron satisfechas.
  Mila._EmpezarACargar_(rutaArchivo);
  const configuración = Mila._configuraciónDeArchivo(rutaArchivo);
  const tipo = Mila._tipoDeArchivo(rutaArchivo);
  Mila.Compilar_DeTipo_(configuración, tipo);
  if ('define' in configuración) {
    Mila._RegistrarModulo_En_(configuración.define, entorno.universo, []);
  }
  Mila._AgregarCódigo(configuración.código, tipo);
};

Mila._InformarEjecucion_ = function(rutaArchivo) {
  // Registra la finalización de la ejecución del archivo dado y, en el caso de que todos los archivos se hayan cargado ya,
    // intenta inicializar el sistema. Este procedimiento es invocado por los scripts de los archivos cargados.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  // Falla si el archivo dado no estaba siendo cargado.
  // Si no está en la lista, algo salió mal.
  if (!Mila._esta_SiendoCargadoAhora(rutaArchivo)) {
    Mila._Fallar(`Algo salió mal. El archivo ${rutaArchivo} se ejecutó antes de tiempo.`);
    return;
  }
  Mila._archivosPendientes.cargandoAhora = Mila._archivosPendientes.cargandoAhora.filter(x => x!=rutaArchivo);
  Mila._AsignarEstadoArchivo(rutaArchivo, ESTADO_CONTENIDO_EJECUTADO);
  Mila._BuscarProximoArchivoACargar(rutaArchivo);
  Mila._IntentarInicializar();
};

Mila._BuscarProximoArchivoACargar = function(rutaArchivo) {
  // Actualiza los objetos de configuración de los archivos pendientes que dependen del archivo dado, que acaba de ser cargado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  for (let dependiente of Mila._dependientesDeArchivo(rutaArchivo)) {
    Mila._VerificarDependenciasCumplidasDe_(dependiente);
  }
  if (Mila._quedanArchivosEnCola()) {
    Mila._IntentarCargarProximo();
  }
};

Mila._IntentarCargarProximo = function() {
  // Intenta cargar uno de los archivos pendientes (si es que hay alguno).
    // PRE: Hay al menos uno por cargar.
  let stackARevisar = [];
  Mila._CopiarDe_A_(Mila._archivosPendientes.siguientes, stackARevisar);
  while (!( // Hasta que:
    stackARevisar.length == 0 // Ya los miré todos
      ||
    Mila._sePuedeAgregar_AlEntorno(stackARevisar[0]) // Encuentro uno para agregar
      ||
    Mila._hayQueEsperarParaAnalizar_(stackARevisar[0]) // Encuentro uno que no puedo analizar todavía
  )) {
    Mila._CopiarDe_A_(Mila._dependenciasDe_(stackARevisar[0]), stackARevisar);
    stackARevisar.shift(); // Saco el primero
  }
  if (stackARevisar.length > 0 && Mila._sePuedeAgregar_AlEntorno(stackARevisar[0])) {
    Mila._Agregar_AlEntorno(stackARevisar[0]);
  }
};

Mila._IntentarInicializar = function() {
  // Intenta inicializar el sistema, lo cual hace si todos los archivos ya terminaron de cargarse.
  if (Mila._yaSePuedeInicializar()) {
    Mila._Inicializar();
  }
};

Mila._ValidarAlias = function(rutaArchivo, rutaReal) {
  if (Mila._rutaArchivo_Existe(rutaReal)) {
    Mila._AsignarEstadoArchivo(rutaArchivo, ESTADO_ALIAS);
    Mila._archivosPendientes.siguientes = Mila._archivosPendientes.siguientes.filter(x => x!=rutaArchivo);
    const alias = Mila._dataDeRutaArchivo(rutaReal);
    Mila._AsignarRutaRealArchivo(rutaArchivo, rutaReal);
    Mila._AsignarAliasDeArchivo(rutaArchivo, alias);
    const dependientesDelAlias = Mila._dependientesDeArchivo(alias);
    for (let dependiente of Mila._dependientesDeArchivo(rutaArchivo)) {
      if (!dependientesDelAlias.includes(dependiente)) {
        dependientesDelAlias.push(dependiente);
      }
    }
    Mila._BuscarProximoArchivoACargar(alias);
    Mila._IntentarInicializar();
    return true;
  }
  return false;
};

Mila._sePuedeAgregar_AlEntorno = function(archivo) {
  // Indica si el archivo dado ya se puede agregar al entorno.
  return Mila._seCumplenLasDependenciasDe_(archivo);
};

Mila._hayQueEsperarParaAnalizar_ = function(archivo) {
  // Indica si el archivo dado está bloqueado y no se puede analizar todavía.
  let estadoArchivo = Mila._estadoDeArchivo(Mila._estadoDeArchivo(archivo) == ESTADO_ALIAS
    ? Mila._aliasDeArchivo(archivo)
    : archivo
  );
  return estadoArchivo != ESTADO_ESPERANDO_DEPENDENCIAS &&
    estadoArchivo != ESTADO_DEPENDENCIAS_CUMPLIDAS // En estados anteriores todavía ni siquiera
    // se sabe cuáles son las dependencias. En estados siguientes, sí deberían estar cargadas pero
    // significa que ya se está procesando el archivo (así que no es válido como próximo a cargar).
};

Mila._dependenciasDe_ = function(archivo) {
  // Describe las dependencias del archivo dado.
  const dependencias = Mila._configuraciónDeArchivo((Mila._estadoDeArchivo(archivo) == ESTADO_ALIAS)
    ? Mila._aliasDeArchivo(archivo)
    : archivo
  ).pendientes;
  return dependencias.map(dependencia => (Mila._estadoDeArchivo(dependencia) == ESTADO_ALIAS)
    ? Mila._aliasDeArchivo(dependencia)
    : dependencia
  );
};

Mila._yaSePuedeInicializar = function() {
  // Indica si ya está todo listo para inicializar el sistema (si ya se cargaron todos los archivos).
  return !Mila._quedanArchivosEnCola() && Mila._archivosPendientes.cargandoAhora.length == 0;
};

Mila._quedanArchivosEnCola = function() {
  // Indica si queda algún archivo en la cola que no se haya cargado todavía.
  return Mila._archivosPendientes.siguientes.length > 0;
};

Mila._esta_SiendoCargadoAhora = function(rutaArchivo) {
  // Indica si el archivo dado está siendo cargado en este momento.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivosPendientes.cargandoAhora.includes(rutaArchivo);
};

Mila._CopiarDe_A_ = function(listaFuente, listaDestino) {
  // Copiar todos los elementos de la primera lista dada a la segunda lista dada.
  for (let elemento of listaFuente) {
    listaDestino.push(elemento);
  }
};

Mila._EmpezarACargar_ = function(rutaArchivo) {
  // Inicia el proceso de carga del archivo dado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  Mila._AsignarEstadoArchivo(rutaArchivo, ESTADO_AGREGANDO_AL_ENTORNO);
  Mila._archivosPendientes.cargandoAhora.push(rutaArchivo);
  Mila._archivosPendientes.siguientes = Mila._archivosPendientes.siguientes.filter(x => x!=rutaArchivo);
};

Mila._RegistrarDependenciaDe_A_ = function(ruta, dependencia) {
  // Registra al segundo archivo dado como una dependencia del primer archivo dado.
    // Tando rutaArchivo como dependencia son cadenas de texto correspondientes a las rutas absolutas de dos archivos.
  Mila._dependientesDeArchivo(dependencia).push(ruta);
};

Mila._Ajustar_Para_ = function(configuración, rutaArchivo) {
  // Completa el objeto de configuración dado para el archivo dado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // configuración es el objeto de configuración del archivo dado.
  configuración.rutaArchivo = rutaArchivo;
  configuración.ubicacion = Mila._ubicacionDe_(rutaArchivo);
  for (let campo of ['usa','necesita','usaJs','necesitaJs']) {
    let dato = (configuración[campo] || []);
    configuración[campo] = (Array.isArray(dato) ? dato : [dato]).map(
      x => Mila._rutaCompletaA_Desde_(x, configuración.ubicacion)
    );
  }
};

Mila.Compilar_DeTipo_ = function(configuración, tipo) {
  // Compila el código del archivo correspondiente al objeto de configuración dado, del tipo dado.
    // configuración es el objeto de configuración de un archivo.
    // tipo es una cadena de texto correspondiente al tipo de archivo cuyo código se compila
      // (puede ser "Mila" si el archivo es de milascript o "JS" si es de Javascript).
  let encabezado = [];
  let cierre = [
    `Mila._InformarEjecucion_("${configuración.rutaArchivo}");`
  ]
  if (tipo == "Mila") {
    if (entorno.enNodeJs()) {
      encabezado.push("((x) => {");
      cierre.push("})();");
    }
    if (!entorno.universo.compilado) { // REVISAR: ¿hace falta?
      encabezado.push(`const _miRuta = "${configuración.rutaArchivo}";`);
      encabezado.push(`const _miUbicacion = "${configuración.ubicacion}"`);
    }
  }
  configuración.código =
    encabezado.join("\n") + "\n" +
    configuración.código + "\n" +
    cierre.join("\n");
};

Mila._EncolarArchivo_DeTipo_ = function(rutaArchivo, tipoArchivo, aPedidoDe) {
  // Registra la incorporación al sistema del primer archivo dado, del tipo dado, que fue solicitado por el segundo archivo dado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // tipo es una cadena de texto correspondiente al tipo de archivo cuyo código se compila
      // (puede ser "Mila" si el archivo es de milascript o "JS" si es de Javascript).
    // aPedidoDe es una cadena de texto correspondiente al archivo que inició el pedido y requiere a este otro para funcionar
      // (null si se carga a mano o si no es un requisito fuerte).
  Mila._DeclararNuevoArchivo(rutaArchivo, tipoArchivo, aPedidoDe);
  Mila._archivosPendientes.siguientes.push(rutaArchivo);
};

Mila._archivo_Existe = function(rutaArchivo) {
  // Indica si el archivo dado ya existe en el sistema
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._claveArchivoParaRuta(rutaArchivo) in Mila._archivos;
};

Mila._rutaArchivo_Existe = function(rutaReal) {
  // Indica si algún archivo del sistema usa la ruta dada
    // rutaReal es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._claveArchivoParaRuta(rutaReal) in Mila._rutasDeArchivos;
};

Mila._esta_EsperandoContenido = function(rutaArchivo) {
  // Indica si del archivo dado ya se solicitó el contenido y se está esperando la respuesta.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivo_Existe(rutaArchivo) && (
    Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ESPERANDO_CONTENIDO ||
    (Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ALIAS &&
      Mila._estadoDeArchivo(Mila._aliasDeArchivo(rutaArchivo)) == ESTADO_ESPERANDO_CONTENIDO
    )
  );
};

Mila._esta_EsperandoDependencias = function(rutaArchivo) {
  // Indica si del archivo dado se está esperando que se cargue sus dependencias.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivo_Existe(rutaArchivo) && (
    Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ESPERANDO_DEPENDENCIAS ||
    (Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ALIAS &&
      Mila._estadoDeArchivo(Mila._aliasDeArchivo(rutaArchivo)) == ESTADO_ESPERANDO_DEPENDENCIAS
    )
  );
};

Mila._seCumplenLasDependenciasDe_ = function(rutaArchivo) {
  // Indica si del archivo dado se cumplen sus dependencias.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  let rutaAValidar = (Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ALIAS)
    ? Mila._aliasDeArchivo(rutaArchivo)
    : rutaArchivo
  ;
  if (Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ESPERANDO_DEPENDENCIAS) {
    Mila._VerificarDependenciasCumplidasDe_(rutaAValidar);
  }
  return Mila._estadoDeArchivo(rutaArchivo) == ESTADO_DEPENDENCIAS_CUMPLIDAS;
};

Mila._esta_SiendoAgregadoAlEntorno = function(rutaArchivo) {
  // Indica si el archivo dado está siendo agregado al entorno en este momento.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return (Mila._archivo_Existe(rutaArchivo) && (
    Mila._estadoDeArchivo(rutaArchivo) == ESTADO_AGREGANDO_AL_ENTORNO ||
    (Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ALIAS &&
      Mila._estadoDeArchivo(Mila._aliasDeArchivo(rutaArchivo)) == ESTADO_AGREGANDO_AL_ENTORNO
    )
  ));
};

Mila._archivo_YaFueEjecutado = function(rutaArchivo) {
  // Indica si el código del archivo dado ya fue ejecutado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return (Mila._archivo_Existe(rutaArchivo) && (
    Mila._estadoDeArchivo(rutaArchivo) == ESTADO_CONTENIDO_EJECUTADO ||
    (Mila._estadoDeArchivo(rutaArchivo) == ESTADO_ALIAS &&
      Mila._estadoDeArchivo(Mila._aliasDeArchivo(rutaArchivo)) == ESTADO_CONTENIDO_EJECUTADO
    )
  ));
};

Mila._DefinirArchivo_ = function(configuración) {
  // Registra la incorporación de un archivo a partir de su objeto de configuración.
    // configuración es el objeto de configuración de un archivo.
  // Falla si la configuración dada define un módulo que ya fue definido antes.
  if ('define' in configuración) {
    Mila._RegistrarModulo_(configuración.define);
  };
};

// Módulos

Mila._modulos = {}; // Mapa de los módulos cargados

Mila._RegistrarModulo_ = function(nombreModulo) {
  // Registra un módulo con el nombre dado.
    // nombreModulo es una cadena de texto correspondiente al nombre del módulo a registrar.
  // Falla si ya se registró un módulo con el mismo nombre.
  // Falla si el nombre colisiona con algún campo ya existente.
  if (nombreModulo in Mila._modulos) {
    Mila._Fallar(`Ya se registró un módulo con el nombre ${nombreModulo}.`);
  } else {
    Mila._modulos[nombreModulo] = {};
  }
};

Mila._RegistrarModulo_En_ = function(nombreModulo, moduloMadre, rutaModuloMadre) {
  // Registra un módulo con el nombre dado, como submódulo del módulo madre dado, cuya ruta es la ruta dada.
    // nombreModulo es una cadena de texto correspondiente al nombre del módulo a registrar.
    // moduloMadre es un objeto que representa al módulo madre del módulo a registrar.
    // rutaModuloMadre es una lista de cadenas de texto correspondiente a cada módulo de la ruta al módulo madre.
  // Falla si el nombre colisiona con algún campo ya existente.
  // Falla si el nombre hace referencia a un módulo madre inexistente.
  let iPunto = nombreModulo.indexOf(".");
  if (iPunto < 0) {
    if (nombreModulo in moduloMadre) {
      Mila._Fallar(`No se puede registrar un módulo con el nombre ${nombreModulo}${
        (rutaModuloMadre.length == 0) ? " " : ` en ${rutaModuloMadre.join(".")} `
      }porque ese campo ya está en uso.`);
    } else {
      moduloMadre[nombreModulo] = {};
    }
  } else {
    let nuevoModuloMadre = nombreModulo.substring(0,iPunto);
    if (nuevoModuloMadre in moduloMadre) {
      rutaModuloMadre.push(nuevoModuloMadre);
      Mila._RegistrarModulo_En_(
        nombreModulo.substring(iPunto+1),
        moduloMadre[nuevoModuloMadre],
        rutaModuloMadre
      );
    } else {
      Mila._Fallar(`No existe un módulo con el nombre ${nuevoModuloMadre}${
        (rutaModuloMadre.length == 0) ? "" : ` en ${rutaModuloMadre.join(".")}`
      }.`);
    }
  }
};

// Proyectos

Mila._proyectos = {}; // Mapa de otros proyectos importados

Mila._nombreProyectoEnRuta = function(ruta) {
  // Obtiene el nombre del proyecto a partir de una ruta.
  // PRE: ruta contiene "$" seguido de el nombre de un proyecto.
  let iDiagonal = ruta.indexOf("/", ruta.indexOf('$'));
  if (iDiagonal < 0) {
    Mila._Fallar(`Ruta inválida: ${ruta}`); // Aunque podría ser una forma de cargar un proyecto entero o su archivo principal...
  } else {
    return ruta.substring(ruta.indexOf('$') + 1, iDiagonal);
  }
};

Mila._RegistrarRutaProyecto = function(nombreProyecto, ubicacion) {
  // Registra el proyecto con el nombre dado a partir de la ubicación dada, si es que no se había registrado ya.
  if (!(nombreProyecto in Mila._proyectos)) {
    Mila._RegistrarProyecto(nombreProyecto, ubicacion);
  }
};

Mila._RegistrarProyecto = function(nombreProyecto, ubicacion) {
  // Registra el proyecto con el nombre dado en la ubicación dada.
  Mila._proyectos[nombreProyecto] = ubicacion
};

Mila._ruta_NavegandoProyectos = function(rutaArchivo) {
  let rutaReal = rutaArchivo;
  while (rutaReal.includes('$')) {
    let iDiagonal = rutaReal.indexOf("/", rutaReal.indexOf('$'));
    if (iDiagonal < 0) {
      Mila._Fallar(`Ruta inválida: ${rutaArchivo}`); // Aunque podría ser una forma de cargar un proyecto entero o su archivo principal...
    } else {
      let nombreProyecto = rutaReal.substring(rutaReal.indexOf('$') + 1, iDiagonal);
      Mila._RegistrarRutaProyecto(nombreProyecto,
        Mila._rutaAPartirDe_([Mila._ruta_Absoluta(rutaReal.substring(0,iDiagonal+1).replace('$','')),'src'])
      );
      rutaReal = Mila._rutaAPartirDe_([Mila._proyectos[nombreProyecto], rutaReal.substring(iDiagonal)]);
    }
  }
  return rutaReal;
};

// Errores y advertencias

Mila._MostrarError = function(error) {
  console.log(`Tipo: ${typeof error}`);
  console.log(`Prototipo: ${Object.getPrototypeOf(error)}`);
  console.log(error);
};

Mila._Fallar = function(mensaje) {
  // Falla e informa un error con el mensaje dado.
    // mensaje es una cadena de texto correspondiente a la descripción del error a informar.
  console.error(mensaje);
};

// Inicialización

Mila._inicializacion = []; // Lista de funciones a ejecutar cuando se terminen de cargar todos los módulos.

Mila.alIniciar = function(funcion) {
  // Registra la función dada para ser ejecutada al inicializarse el sistema.
    // funcion es una función que no toma parámetros.
  Mila._inicializacion.push(funcion);
};

Mila._Inicializar = function() {
  // Inicializa el sistema.
  if (entorno.universo.compilado) {
    // Actualizo los campos privados para reflejar la carga de los archivos como si se hubieran cargado con Mila.Cargar.
    for (let script of document.getElementsByTagName("script")) {
      let ruta = script.getAttribute('src');
      if (ruta !== null) {
        ruta = ruta.substring(0, ruta.length-3);
        let tipoScript = script.getAttribute('type') === 'module' ? 'Mila' : "JS";
        Mila._DeclararNuevoArchivo(ruta, tipoScript);
        Mila._DeclararNuevaRutaDeArchivo(ruta, ruta);
        Mila._AsignarEstadoArchivo(ruta, ESTADO_CONTENIDO_EJECUTADO);
      }
    }
  }
  Mila.EjecutarInicializacionesPendientes();
};

Mila.EjecutarInicializacionesPendientes = function() {
  // Ejecuta las funciones de inicialización registradas por los módulos.
  const funcionesAEjecutar = [];
  for (let funcion of Mila._inicializacion) {
    funcionesAEjecutar.push(funcion);
  }
  Mila._inicializacion = [];
  for (let funcion of funcionesAEjecutar) {
    funcion();
  }
};

Mila.ProcesarArgumentosMila = function(argumentos) {
  // Procesa los argumentos que le corresponden a milascript y no al script ejecutado
};

Mila._RegistrarRaizMila = function(rutaMila) {
  const ubicacion = rutaMila.length > "mila.js".length
    ? rutaMila.substring(0,rutaMila.length - "mila.js".length)
    : ""
  ;
  Mila._RegistrarProyecto("milascript", Mila._ruta_Absoluta(ubicacion));
};

// Funciones del módulo Archivo que necesito acá

Mila._rutaCompletaA_Desde_ = function(rutaArchivo, ubicacion) {
  // Describe la ruta absoluta del archivo que se encuentra en la ruta dada, relativa a la ubicación dada.
    // OJO: el resultado puede contener indicadores de proyecto ($milascript/).
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo.
    // ubicacion es una cadena de texto correspondiente a la ubicación desde donde se acccede a la ruta.
  let resultado = rutaArchivo;
  if (resultado.endsWith(".js")) {
    // Quito la extensión para unificar
    resultado = resultado.substring(0, resultado.length-3);
  }
  if (!resultado.startsWith('./')) {
    resultado = `${ubicacion}${resultado}`;
  }
  while (resultado.includes("/../") && !resultado.startsWith("./../")) {
    let ultimoDP = resultado.lastIndexOf("/../");
    let diagonalAnterior = resultado.slice(0,ultimoDP).lastIndexOf("/");
    resultado = resultado.slice(0,diagonalAnterior+1).concat(resultado.slice(ultimoDP+4));
  }
  if (resultado.startsWith('./')) {
    resultado = ubicacion + resultado.slice(2);
  }
  return resultado;
};

Mila._ubicacionDe_ = function(rutaOriginal) {
  // Describe la ubicación en la que se encuentra el archivo cuya ruta es la ruta dada.
    // rutaOriginal es una cadena de texto correspondiente a la ruta de un archivo.
  let ultimaDiagonal = rutaOriginal.lastIndexOf("/");
  return rutaOriginal.substring(0,ultimaDiagonal+1);
};

Mila._nombreDe_ = function(rutaOriginal) {
  // Describe el nombre del archivo o de la carpeta cuya ruta es la ruta dada.
    // rutaOriginal es una cadena de texto correspondiente a la ruta de un archivo o una carpeta.
  let ultimaDiagonal = rutaOriginal.lastIndexOf("/");
  return rutaOriginal.substring(ultimaDiagonal+1);
};

Mila._contenidoArchivoTemporal = {}; // En el navegador necesito dos accesos así que cachéo el contenido en el primero para devolverlo en el segundo.

Mila._SiExisteArchivo_Entonces_YSiNo_ = function(ruta, funcionSi, funcionNo) {
  // Determina si existe un archivo en la ruta dada. En caso afirmativo invoca a la primera función dada.
  //   En caso negativo invoca a la segunda función dada.
  if (entorno.enNodeJs()) {
    Mila.fs().stat(ruta, (error, stats) => {
      (error !== null && error !== undefined) || stats.isDirectory()
      ? funcionNo()
      : funcionSi()
    });
  } else {
    Mila._accesoArchivo(ruta, function(resultado) {
      if ('contenido' in resultado) {
        Mila._contenidoArchivoTemporal = {
          ruta, contenido:resultado.contenido
        }
        funcionSi();
      } else {
        funcionNo();
      }
    });
  }
};

Mila._rutaAPartirDe_ = function(rutas) {
  // Describe la ruta resultante de concatenar las rutas en la lista de rutas dada.
  let rutaPorAhora = "";
  if (entorno.enNodeJs()) {
    rutaPorAhora = Mila.path().join(...rutas);
  } else {
    rutaPorAhora = rutas[0];
    for (let ruta of rutas.splice(1)) {
      if (!rutaPorAhora.endsWith('/')) {
        rutaPorAhora += '/';
      }
      rutaPorAhora += ruta.substring(ruta.startsWith('/') ? 1 : 0);
    }
    if (rutaPorAhora.endsWith('/')) {
      rutaPorAhora = rutaPorAhora.substring(0, rutaPorAhora.length-2);
    }
  }
  return Mila._ruta_NavegandoProyectos(rutaPorAhora);
};

Mila._rutaActual = function() {
  // Describe la ruta absoluta correspondiente al directorio actual.
  // No funciona en el navegador.
  return Mila.path().resolve();
};

Mila._ruta_Absoluta = function(ruta) {
  // Describe la ruta absoluta correspondiente a la ruta dada.
  return (entorno.enNodeJs())
    ? Mila.path().resolve(ruta)
    : ruta
  ;
};

// MAIN

if (entorno.universo.compilado) {
  entorno.universo.addEventListener('load', Mila._Inicializar);
} else if (entorno.enNodeJs()) {
  for (let i=0; i<process.argv.length; i++) {
    if (process.argv[i].endsWith("mila.js")) {
      Mila._RegistrarRaizMila(process.argv[i]);

      const inicialización = function() {
        let funcionFalla = (rutaScript) => Mila._Fallar(`Ruta inválida: ${rutaScript}`);
        if (entorno.argumentos.lista.length == 0) {
          entorno.argumentos.lista = ['interact'];
          funcionFalla = (rutaScript) => Mila._Fallar(`No se pasa ningún script de Mila.`);
        }
        Mila.ProcesarArgumentosMila(entorno.argumentos);
        let rutaScript = entorno.argumentos.lista.splice(0,1)[0];
        Mila._SiExisteArchivo_Entonces_YSiNo_(
          `${rutaScript}.js`,
          () => Mila.Cargar(rutaScript),
          () => {
            let rutaScriptInterno = Mila._rutaAPartirDe_([entorno.rutaMila(),'..','scripts',`${rutaScript}.js`]);
            Mila._SiExisteArchivo_Entonces_YSiNo_(
              rutaScriptInterno,
              () => Mila.Cargar(rutaScriptInterno),
              funcionFalla
            )
          }
        );
      };

      let archivoDeArgumentos = null;
      entorno.argumentos = {lista:[]};
      for (let argumento of process.argv.slice(i+1)) {
        let iDosPuntos = argumento.indexOf(':');
        if (iDosPuntos < 0) {
          entorno.argumentos.lista.push(argumento);
        } else if (iDosPuntos == 0) {
          // Es un booleano
          entorno.argumentos[argumento.substring(1)] = true;
        } else if (argumento.substring(0,iDosPuntos) == 'args') {
          // Es un archivo de argumentos
          archivoDeArgumentos = `${argumento.substring(iDosPuntos+1)}.json`;
        } else {
          entorno.argumentos[argumento.substring(0,iDosPuntos)] = argumento.substring(iDosPuntos+1);
        }
      }
      i = process.argv.length;

      if (archivoDeArgumentos === null) {
        if (entorno.argumentos.lista.length == 0) {
          inicialización();
        } else {
          archivoDeArgumentos = `${entorno.argumentos.lista[0]}.json`;
          Mila._SiExisteArchivo_Entonces_YSiNo_(
            archivoDeArgumentos,
            () => {Mila._accesoArchivo(archivoDeArgumentos, (resultado) => {
              if ('contenido' in resultado) {
                let diccionario = JSON.parse(resultado.contenido);
                for (let clave in diccionario) {
                  if (clave == 'lista') {
                    for (let elemento of diccionario.lista) {
                      if (!entorno.argumentos.lista.includes(elemento)) {
                        entorno.argumentos.lista.push(elemento);
                      }
                    }
                  } else if (!(clave in entorno.argumentos)) {
                    entorno.argumentos[clave] = diccionario[clave];
                  }
                }
                inicialización();
              } else {
                Mila._Fallar(`No se pudo cargar el archivo ${archivoDeArgumentos}.`);
                Mila._MostrarError(resultado.error);
              }
              });},
            inicialización
          );
        }
      } else {
        Mila._SiExisteArchivo_Entonces_YSiNo_(
          archivoDeArgumentos,
          () => {Mila._accesoArchivo(archivoDeArgumentos, (resultado) => {
            if ('contenido' in resultado) {
              let diccionario = JSON.parse(resultado.contenido);
              for (let clave in diccionario) {
                if (clave == 'lista') {
                  for (let elemento of diccionario.lista) {
                    if (!entorno.argumentos.lista.includes(elemento)) {
                      entorno.argumentos.lista.push(elemento);
                    }
                  }
                } else if (!(clave in entorno.argumentos)) {
                  entorno.argumentos[clave] = diccionario[clave];
                }
              }
              inicialización();
            } else {
              Mila._Fallar(`No se pudo cargar el archivo ${archivoDeArgumentos}.`);
              Mila._MostrarError(resultado.error);
            }
            });},
          () => Mila._Fallar(`No se encuentra el archivo de argumentos en ${archivoDeArgumentos}.`)
        );
      }
    }
  }
}
