/*  Sobre este archivo
  Este es el intérprete de milascript. Se puede utilizar a través de un navegador web o mediante NodeJs.
  Para ejecutarlo en un navegador web: Crear un archivo html que incluya en el encabezado un script de tipo módulo
    y cuyo archivo fuente sea este. Luego se pueden cargar archivos de milascript invocando al procedimiento Mila.Cargar,
    pasándole como argumento la cadena de texto correspondiente a la ruta del archivo a cargar (sin la extensión).
  Para ejecutarlo mediante NodeJs: Ejecutar en una terminal `node mila.js ` seguido del nombre del archivo milascript a cargar.
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
  Mila._AgregarCodigo : Toma una cadena de texto correspondiente a un fragmento de código Javascript,
      lo agrega al entorno de ejecución actual y lo ejecuta.
    También toma una segunda cadena de texto correspondiente al tipo de archivo de donde se extrajo el fragmento de código.
    Este segundo argumento puede ser "Mila" si el archivo original era un archivo de milascript o "JS" si era un archivo de Javascript.
*/

if (entorno.enNodeJs()) {
  Mila._os = process;
  Mila._fs = await import("node:fs");
  Mila._path = await import("node:path");
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
  Mila._AgregarCodigo = function(codigo, tipo) {
    const script = new vm.Script(codigo);
    if (tipo == "Mila") {
      const contexto = {};
      vm.createContext(contexto);
      for (let campo of Object.getOwnPropertyNames(entorno.universo)) {
        Object.defineProperty(contexto, campo, {
          value: entorno.universo[campo],
          enumerable: entorno.universo.propertyIsEnumerable(campo),
          writable: true
        });
      }
      script.runInContext(contexto);
    } else { // tipo = "JS"
      script.runInThisContext();
    }
  };
  Mila.os = function() { return Mila._os; }
  Mila.fs = function() { return Mila._fs; }
  Mila.path = function() { return Mila._path; }
} else {
  Mila._accesoArchivo = function(ruta, funcion) {
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
  };
  Mila._AgregarCodigo = function(codigo, tipo) {
    let script = document.createElement("script");
    if (tipo == "Mila") {
      script.setAttribute("type", "module");
    }
    script.text = codigo;
    document.head.appendChild(script);
  };
  Mila.os = function() { Mila.Error("No disponible en el navegador"); }
  Mila.fs = function() { Mila.Error("No disponible en el navegador"); }
  Mila.path = function() { Mila.Error("No disponible en el navegador"); }
}

// Archivos

Mila._proyectos = {}; // Mapa de otros proyectos importados
Mila._archivos = {}; // Mapa de archivos incluidos.
Mila._archivosPendientes = {
  cargandoAhora: [], // Lista de rutas de archivos que están siendo cargados ahora.
  siguientes: [] // Lista de rutas de archivos que están esperando a ser cargados.
};

const ESTADO_RECIEN_AGREGADO = 0; // Apenas se solicita cargar u otro módulo lo importa (todavía no se hizo el pedido).
const ESTADO_ESPERANDO_CONTENIDO = 1; // Cuando se manda el pedido del contenido.
const ESTADO_CONTENIDO_RECIBIDO = 2; // Mientras se procesa el contenido recibido.
const ESTADO_ESPERANDO_DEPENDENCIAS = 3; // Mientras se espera que las dependencias se carguen (a partir de acá ya existe su configuracion).
const ESTADO_DEPENDENCIAS_CUMPLIDAS = 4; // Ya se cargaron las dependencias, esperando el turno para agregarse al entorno.
const ESTADO_AGREGANDO_AL_ENTORNO = 5; // Agregando el código al entorno de ejecución.
const ESTADO_CONTENIDO_EJECUTADO = 6; // Después de que se haya ejecutado el código.

Mila.Modulo = function(configuracion) {
  // Declara un nuevo módulo a partir de la configuración dada.
    // configuracion es el objeto de configuración de un archivo de código milascript.
  // Falla si la configuración dada define un módulo que ya fue definido antes.
  Mila._DefinirArchivo_(configuracion);
  if ('define' in configuracion) {
    Mila._RegistrarModulo_En_(configuracion.define, entorno.universo, []);
  }
};

Mila.Cargar = function(rutaArchivo) {
  // Carga el archivo de código milascript que se encuentra en la ruta dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo de código milascript.
  // Falla si el archivo ya fue solicitado antes.
  // Falla si el entorno no es capaz de acceder al archivo (por ejemplo si el archivo no existe o no se tiene acceso de lectura a él).
  Mila._raizProyecto = Mila._ubicacionDe_(rutaArchivo);
  const nombreArchivo = Mila._nombreDe_(rutaArchivo);
  Mila._CargarArchivoMila_En_(nombreArchivo, "./");
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
    Mila.Error(`El archivo ${rutaCompleta} ya fue solicitado.`);
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
  Mila._archivos[rutaArchivo].estado = ESTADO_ESPERANDO_CONTENIDO;
  let nombreProyecto = null;
  let rutaReal = rutaArchivo;
  if (rutaArchivo.startsWith('$')) {
    let iDiagonal = rutaArchivo.indexOf("/");
    if (iDiagonal < 0) {
      Mila.Error(`Ruta inválida: ${rutaArchivo}`); // Aunque podría ser una forma de cargar un proyecto entero o su archivo principal...
    } else {
      nombreProyecto = rutaArchivo.substring(1,iDiagonal);
      rutaReal = Mila._proyectos[nombreProyecto] + rutaArchivo.substring(iDiagonal + 1);
    }
  }
  Mila._accesoArchivo(`${rutaReal}.js`, function(resultado) {
    if ('contenido' in resultado) {
      Mila._archivos[rutaArchivo].rutaReal = rutaReal;
      Mila._RecibirContenidoArchivo_(rutaArchivo, resultado.contenido);
    } else if (
      nombreProyecto !== null &&
      rutaReal.includes(nombreProyecto) &&
      !(rutaReal.includes(`${nombreProyecto}/src`))
    ) {
      rutaReal = rutaReal.replace(nombreProyecto,`${nombreProyecto}/src`);
      Mila._accesoArchivo(`${rutaReal}.js`, function(resultado) {
        if ('contenido' in resultado) {
          Mila._archivos[rutaArchivo].rutaReal = rutaReal;
          Mila._RecibirContenidoArchivo_(rutaArchivo, resultado.contenido);
        } else {
          Mila.Error(`No se pudo cargar el archivo ${rutaArchivo}.`);
          Mila.MostrarError(resultado.error);
        }
      });
    } else {
      Mila.Error(`No se pudo cargar el archivo ${rutaArchivo}.`);
      Mila.MostrarError(resultado.error);
    }
  });
};

Mila._RecibirContenidoArchivo_ = function(rutaArchivo, contenido) {
  // Procesa el contenido dado, correspondiente al archivo que se encuentra en la ruta dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // contenido es una cadena de texto correspondiente al contenido del archivo.
  // PRE: El contenido dado corresponde al archivo que se encuentra en la ruta dada.
  Mila._archivos[rutaArchivo].estado = ESTADO_CONTENIDO_RECIBIDO;
  let configuracion;
  if (Mila._archivos[rutaArchivo].tipo == "Mila") {
    let inicioEncabezado = contenido.indexOf('Mila.Modulo({');
    let finEncabezado = contenido.indexOf('});');
    eval(`configuracion = {${contenido.substring(inicioEncabezado+13,finEncabezado)}};`);
    configuracion.codigo = contenido.substring(finEncabezado+3);
  } else { // tipo = "JS"
    configuracion = {codigo:contenido};
  }
  Mila._Ajustar_Para_(configuracion, rutaArchivo);
  Mila._DefinirArchivo_(configuracion);
  Mila._archivos[rutaArchivo].configuracion = configuracion;
  Mila._CargarDependenciasArchivo_(rutaArchivo, configuracion);
};

Mila._CargarDependenciasArchivo_ = function(rutaArchivo, configuracion) {
  // Registra las dependencias del archivo dado e inicia los pedidos correspondientes para cumplirlas.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // configuracion es el objeto de configuración del archivo dado.
  Mila._archivos[rutaArchivo].estado = ESTADO_ESPERANDO_DEPENDENCIAS;
  for (let archivoImportado of configuracion.usa) {
    if (!Mila._archivo_Existe(archivoImportado)) {
      Mila._CargarArchivoMila_En_(archivoImportado, '');
    }
  }
  for (let archivoImportado of configuracion.usaJs) {
    if (!Mila._archivo_Existe(archivoImportado)) {
      Mila._CargarArchivoJs_En_(archivoImportado, '');
    }
  }
  configuracion.pendientes = [];
  for (let archivoImportado of configuracion.necesita) {
    if (Mila._archivo_Existe(archivoImportado)) {
      Mila._RegistrarDependenciaDe_A_(rutaArchivo, archivoImportado);
      if (!Mila._archivo_YaFueEjecutado(archivoImportado)) {
        configuracion.pendientes.push(archivoImportado);
      }
    } else {
      Mila._CargarArchivoMila_En_(archivoImportado, '', rutaArchivo);
      configuracion.pendientes.push(archivoImportado);
    }
  }
  for (let archivoImportado of configuracion.necesitaJs) {
    if (Mila._archivo_Existe(archivoImportado)) {
      Mila._RegistrarDependenciaDe_A_(rutaArchivo, archivoImportado);
      if (!Mila._archivo_YaFueEjecutado(archivoImportado)) {
        configuracion.pendientes.push(archivoImportado);
      }
    } else {
      Mila._CargarArchivoJs_En_(archivoImportado, '', rutaArchivo);
      configuracion.pendientes.push(archivoImportado);
    }
  }
  Mila._VerificarDependenciasCumplidasDe_(rutaArchivo);
  Mila._IntentarCargarProximo();
};

Mila._VerificarDependenciasCumplidasDe_ = function(rutaArchivo) {
  // Actualiza el objeto de configuración del archivo dado según las dependencias del mismo que ya se cumplieron.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  let configuracion = Mila._archivos[rutaArchivo].configuracion;
  if (Mila._esta_EsperandoDependencias(rutaArchivo)) {
    while (configuracion.pendientes.length > 0 && Mila._archivo_YaFueEjecutado(configuracion.pendientes[0])) {
      configuracion.pendientes.shift();
    }
    if (configuracion.pendientes.length == 0) {
      Mila._CompletarDependenciasPendientesDe_(rutaArchivo);
    }
  }
};

Mila._CompletarDependenciasPendientesDe_ = function(rutaArchivo) {
  // Actualiza el estado del archivo dado, indicando que ya se cumplieron todas sus dependencias.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  Mila._archivos[rutaArchivo].estado = ESTADO_DEPENDENCIAS_CUMPLIDAS;
};

Mila._Agregar_AlEntorno = function(rutaArchivo) {
  // Agrega el código del archivo dado al entorno de ejecución actual.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  // PRE: Todas las dependencias del archivo dado ya fueron satisfechas.
  Mila._EmpezarACargar_(rutaArchivo);
  const configuracion = Mila._archivos[rutaArchivo].configuracion;
  const tipo = Mila._archivos[rutaArchivo].tipo;
  Mila.Compilar_DeTipo_(configuracion, tipo);
  if ('define' in configuracion) {
    Mila._RegistrarModulo_En_(configuracion.define, entorno.universo, []);
  }
  Mila._AgregarCodigo(configuracion.codigo, tipo);
};

Mila._InformarEjecucion_ = function(rutaArchivo) {
  // Registra la finalización de la ejecución del archivo dado y, en el caso de que todos los archivos se hayan cargado ya,
    // intenta inicializar el sistema. Este procedimiento es invocado por los scripts de los archivos cargados.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  // Falla si el archivo dado no estaba siendo cargado.
  Mila._archivos[rutaArchivo].estado = ESTADO_CONTENIDO_EJECUTADO;
  // Si no está en la lista, algo salió mal.
  if (!Mila._esta_SiendoCargadoAhora(rutaArchivo)) {
    Mila.Error(`Algo salió mal. El archivo ${rutaArchivo} se ejecutó antes de tiempo.`);
    return;
  }
  Mila._archivosPendientes.cargandoAhora = Mila._archivosPendientes.cargandoAhora.filter(x => x!=rutaArchivo);
  Mila._BuscarProximoArchivoACargar(rutaArchivo);
  Mila._IntentarInicializar();
};

Mila._IntentarInicializar = function() {
  // Intenta inicializar el sistema, lo cual hace si todos los archivos ya terminaron de cargarse.
  if (Mila._yaSePuedeInicializar()) {
    Mila._Inicializar();
  }
};

Mila._BuscarProximoArchivoACargar = function(rutaArchivo) {
  // Actualiza los objetos de configuración de los archivos pendientes que dependen del archivo dado, que acaba de ser cargado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  for (let dependiente of Mila._archivos[rutaArchivo].dependientes) {
    Mila._VerificarDependenciasCumplidasDe_(dependiente);
  }
  if (Mila._quedanArchivosEnCola()) {
    Mila._IntentarCargarProximo();
  }
};

Mila._IntentarCargarProximo = function() {
  // Intenta cargar uno de los archivos pendientes (si es que hay alguno).
  let proximoACargar = Mila._archivosPendientes.siguientes[0];
  while (!( // Hasta que:
    Mila._esta_EsperandoContenido(proximoACargar) ||
    Mila._esta_SiendoAgregadoAlEntorno(proximoACargar) ||
    Mila._seCumplenLasDependenciasDe_(proximoACargar)
  )) {
    proximoACargar = Mila._archivos[proximoACargar].configuracion.pendientes[0];
  }
  if (Mila._seCumplenLasDependenciasDe_(proximoACargar)) {
    Mila._Agregar_AlEntorno(proximoACargar);
  }
};

Mila._yaSePuedeInicializar = function() {
  // Inidica si ya está todo listo para inicializar el sistema (si ya se cargaron todos los archivos).
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

Mila._EmpezarACargar_ = function(rutaArchivo) {
  // Inicia el proceso de carga del archivo dado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  Mila._archivos[rutaArchivo].estado = ESTADO_AGREGANDO_AL_ENTORNO;
  Mila._archivosPendientes.cargandoAhora.push(rutaArchivo);
  Mila._archivosPendientes.siguientes = Mila._archivosPendientes.siguientes.filter(x => x!=rutaArchivo);
};

Mila._RegistrarDependenciaDe_A_ = function(ruta, dependencia) {
  // Registra al segundo archivo dado como una dependencia del primer archivo dado.
    // Tando rutaArchivo como dependencia son cadenas de texto correspondientes a las rutas absolutas de dos archivos.
  Mila._archivos[dependencia].dependientes.push(ruta);
};

Mila._rutaCompletaA_Desde_ = function(rutaArchivo, ubicacion) {
  // Describe la ruta absoluta del archivo que se encuentra en la ruta dada, relativa a la ubicación dada.
    // rutaArchivo es una cadena de texto correspondiente a la ruta relativa de un archivo.
    // ubicacion es una cadena de texto correspondiente a la ubicación desde donde se acccede a la ruta.
  let resultado = rutaArchivo;
  if (resultado.endsWith(".js")) {
    // Quito la extensión para unificar
    resultado = resultado.substring(0, resultado.length-3);
  }
  if (resultado.startsWith('/')) {
    resultado = `.${resultado}`;
  }
  if (resultado.startsWith('$')) {
    Mila._RegistrarRutaProyecto(rutaArchivo, ubicacion);
  } else if (!resultado.startsWith('./')) {
    resultado = `${ubicacion}${resultado}`;
  }
  while (resultado.includes("/../") && !resultado.startsWith("./../")) {
    let ultimoDP = resultado.lastIndexOf("/../");
    let diagonalAnterior = resultado.slice(0,ultimoDP).lastIndexOf("/");
    resultado = resultado.slice(0,diagonalAnterior+1).concat(resultado.slice(ultimoDP+4));
  }
  if (resultado.startsWith('./')) {
    resultado = (Mila._raizProyecto) + resultado.slice(2);
  }
  return resultado;
};

Mila._RegistrarRutaProyecto = function(rutaArchivo, ubicacion) {
  // Registra el proyecto definido en la ruta dada a partir de la ubicación dada, si es que no se había registrado ya.
  // PRE: rutaArchivo empieza con "$", seguido de el nombre de un proyecto.
  // PRE: el nombre del proyecto corresponde a un proyecto que ya fue inicializado antes o a un proyecto
    // cuyo código fuente está en la ubicación dada.
  let iDiagonal = rutaArchivo.indexOf("/");
  if (iDiagonal < 0) {
    Mila.Error(`Ruta inválida: ${rutaArchivo}`); // Aunque podría ser una forma de cargar un proyecto entero o su archivo principal...
  } else {
    let nombreProyecto = rutaArchivo.substring(1,iDiagonal);
    if (!(nombreProyecto in Mila._proyectos)) {
      Mila._RegistrarProyecto(nombreProyecto, ubicacion + nombreProyecto + "/");
    }
  }
};

Mila._RegistrarProyecto = function(nombreProyecto, ubicacion) {
  // Registra el proyecto con el nombre dado en la ubicación dada.
  Mila._proyectos[nombreProyecto] = ubicacion
};

Mila._Ajustar_Para_ = function(configuracion, rutaArchivo) {
  // Completa el objeto de configuración dado para el archivo dado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // configuracion es el objeto de configuración del archivo dado.
  configuracion.rutaArchivo = rutaArchivo;
  configuracion.ubicacion = Mila._ubicacionDe_(rutaArchivo);
  for (let campo of ['usa','necesita','usaJs','necesitaJs']) {
    let dato = (configuracion[campo] || []);
    configuracion[campo] = (Array.isArray(dato) ? dato : [dato]).map(
      x => Mila._rutaCompletaA_Desde_(x, configuracion.ubicacion)
    );
  }
};

Mila.Compilar_DeTipo_ = function(configuracion, tipo) {
  // Compila el código del archivo correspondiente al objeto de configuración dado, del tipo dado.
    // configuracion es el objeto de configuración de un archivo.
    // tipo es una cadena de texto correspondiente al tipo de archivo cuyo código se compila
      // (puede ser "Mila" si el archivo es de milascript o "JS" si es de Javascript).
  let encabezado = [];
  if (tipo == "Mila") {
    if (entorno.enNodeJs()) {
      encabezado.push("Object.setPrototypeOf(Object.getPrototypeOf([]), Array.prototype)");
      encabezado.push("Object.setPrototypeOf(Object.getPrototypeOf(function(){}), Function.prototype)");
    }
    if (!entorno.universo.compilado) {
      encabezado.push(`const _miRuta = "${configuracion.rutaArchivo}";`);
      encabezado.push(`const _miUbicacion = "${configuracion.ubicacion}"`);
    }
  }
  let cierre = [
    `Mila._InformarEjecucion_("${configuracion.rutaArchivo}");`
  ]
  configuracion.codigo =
    encabezado.join("\n") + "\n" +
    configuracion.codigo + "\n" +
    cierre.join("\n");
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

Mila._EncolarArchivo_DeTipo_ = function(rutaArchivo, tipoArchivo, aPedidoDe) {
  // Registra la incorporación al sistema del primer archivo dado, del tipo dado, que fue solicitado por el segundo archivo dado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
    // tipo es una cadena de texto correspondiente al tipo de archivo cuyo código se compila
      // (puede ser "Mila" si el archivo es de milascript o "JS" si es de Javascript).
    // aPedidoDe es una cadena de texto correspondiente al archivo que inició el pedido y requiere a este otro para funcionar
      // (null si se carga a mano o si no es un requisito fuerte).
  Mila._archivos[rutaArchivo] = {
    estado: ESTADO_RECIEN_AGREGADO,
    tipo: tipoArchivo,
    dependientes: (aPedidoDe === null ? [] : [aPedidoDe])
  };
  Mila._archivosPendientes.siguientes.push(rutaArchivo);
};

Mila._archivo_Existe = function(rutaArchivo) {
  // Indica si el archivo dado ya existe en el sistema
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return rutaArchivo in Mila._archivos;
};

Mila._esta_EsperandoContenido = function(rutaArchivo) {
  // Indica si del archivo dado ya se solicitó el contenido y se está esperando la respuesta.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivo_Existe(rutaArchivo) && Mila._archivos[rutaArchivo].estado == ESTADO_ESPERANDO_CONTENIDO;
};

Mila._esta_EsperandoDependencias = function(rutaArchivo) {
  // Indica si del archivo dado se está esperando que se cargue sus dependencias.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivo_Existe(rutaArchivo) && Mila._archivos[rutaArchivo].estado == ESTADO_ESPERANDO_DEPENDENCIAS;
};

Mila._seCumplenLasDependenciasDe_ = function(rutaArchivo) {
  // Indica si del archivo dado se cumplen sus dependencias.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  Mila._VerificarDependenciasCumplidasDe_(rutaArchivo);
  return Mila._archivos[rutaArchivo].estado == ESTADO_DEPENDENCIAS_CUMPLIDAS;
};

Mila._esta_SiendoAgregadoAlEntorno = function(rutaArchivo) {
  // Indica si el archivo dado está siendo agregado al entorno en este momento.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivos[rutaArchivo].estado == ESTADO_AGREGANDO_AL_ENTORNO;
};

Mila._archivo_YaFueEjecutado = function(rutaArchivo) {
  // Indica si el código del archivo dado ya fue ejecutado.
    // rutaArchivo es una cadena de texto correspondiente a la ruta absoluta de un archivo.
  return Mila._archivo_Existe(rutaArchivo) && Mila._archivos[rutaArchivo].estado == ESTADO_CONTENIDO_EJECUTADO;
};

Mila._DefinirArchivo_ = function(configuracion) {
  // Registra la incorporación de un archivo a partir de su objeto de configuración.
    // configuracion es el objeto de configuración de un archivo.
  // Falla si la configuración dada define un módulo que ya fue definido antes.
  if ('define' in configuracion) {
    Mila._RegistrarModulo_(configuracion.define);
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
    Mila.Error(`Ya se registró un módulo con el nombre ${nombreModulo}.`);
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
      Mila.Error(`No se puede registrar un módulo con el nombre ${nombreModulo}${
        (rutaModuloMadre.length == 0) ? " " : ` en ${rutaModuloMadre.join(".")} `
      }porque ese campo ya está en uso.`);
    } else {
      moduloMadre[nombreModulo] = {};
    }
  } else {
    let nuevoModuloMadre = nombreModulo.substring(0,iPunto);
    rutaModuloMadre.push(nuevoModuloMadre);
    if (nuevoModuloMadre in moduloMadre) {
      Mila._RegistrarModulo_En_(
        nombreModulo.substring(iPunto+1),
        moduloMadre[nuevoModuloMadre],
        rutaModuloMadre
      );
    } else {
      Mila.Error(`No existe un módulo con el nombre ${nuevoModuloMadre}${
        (rutaModuloMadre.length == 0) ? "" : ` en ${rutaModuloMadre.join(".")}`
      }.`);
    }
  }
};

// Errores y advertencias

Mila.MostrarError = function(error) {
  console.log(`Tipo: ${typeof error}`);
  console.log(`Prototipo: ${Object.getPrototypeOf(error)}`);
  console.log(error);
};

Mila.Error = function(mensaje) {
  // Falla e informa un error con el mensaje dado.
    // mensaje es una cadena de texto correspondiente a la descripción del error a informar.
  console.error(mensaje);
};

Mila.Advertencia = function(mensaje) {
  // Falla e informa una advertencia con el mensaje dado.
    // mensaje es una cadena de texto correspondiente a la descripción de la advertencia a informar.
  console.warn(mensaje);
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
  Mila._RegistrarProyecto("milascript", ubicacion);
};

if (entorno.universo.compilado) {
  entorno.universo.addEventListener('load', Mila._Inicializar);
} else if (entorno.enNodeJs()) {
  for (let i=0; i<process.argv.length; i++) {
    if (process.argv[i].endsWith("mila.js")) {
      Mila._RegistrarRaizMila(process.argv[i]);
      entorno.argumentos = {lista:[]};
      for (let argumento of process.argv.slice(i+1)) {
        let iDosPuntos = argumento.indexOf(':');
        if (iDosPuntos < 0) {
          entorno.argumentos.lista.push(argumento);
        } else {
          entorno.argumentos[argumento.substring(0,iDosPuntos)] = argumento.substring(iDosPuntos+1);
        }
      }
      if (entorno.argumentos.lista.length >= 1) {
        Mila.ProcesarArgumentosMila(entorno.argumentos);
        Mila.Cargar(entorno.argumentos.lista.splice(0,1)[0]);
      } else {
        Mila.Error(`No se pasa ningún script de Mila.`);
      }
      i = process.argv.length;
    }
  }
}
