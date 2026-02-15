/*  Sobre este archivo
  Este es el compilador de milascript. Genera un archivo html que carga todos los módulos de milascript como si
    fueran archivos javascript. Debe ejecutarse en NodeJs ya que espera como argumento la ruta al archivo milascript que
    actúa como punto de entrada al proyecto y además necesita escribir un archivo en el sistema de archivos local.
  Para ejecutarlo mediante NodeJs: Ejecutar en una terminal `mila build ` seguido de la ruta al archivo milascript
    a compilar (sin la extensión).
  Argumentos opcionales:
  - mila: ruta a la carpeta de fuentes milascript (donde debe estar mila.js y todos los otros archivos milascript necesarios).
      Si no se pasa este argumento se asume que la carpeta es build/milascript/src en el caso de que exista la carpeta 'build' o
        milascript/src en otro caso.
      Si se pasa $ como este argumento se utiliza al carpeta desde donde se está ejecutando milascript ahora.
  - docs: ¿ejecutar contratos?
      Si no se pasa este argumento se asume que sí.
  - name: nombre del archivo compilado (sin la extensión).
      Si no se pasa este argumento se usa 'index' en el caso de que exista la carpeta 'build' o
        el nombre del script a compilar en otro caso.
  - dst: carpeta destino.
      Si no se pasa este argumento se la carpeta 'build' en el caso de que exista o
        la carpeta en la que se encuentra el script a compilar en otro caso.
*/

Mila.Modulo({
  necesita:["../src/base"],
  usa:["../src/archivo","../src/texto"]
});

const data = {
  usandoDestinoBuild: false
};

const build = function(nombre, ubicacionMila, argumentos) {
  return function() {
    const archivosInlcuidos = [{ruta:Mila.Archivo.rutaAPartirDe_([ubicacionMila, 'mila']), tipo:"Mila"}];
    const conContratos = (('docs' in argumentos) ? argumentos.docs : true);
    Mila._archivos = {};
    Mila._rutasDeArchivos = {};
    Mila.Base.ReemplazarFuncion_De_Por_("_Agregar_AlEntorno", Mila, function(funcionOriginal) {
      return function(proximoACargar) {
        const rutaArchivo = proximoACargar;
        archivosInlcuidos.push({ruta:rutaArchivo, tipo:Mila._tipoDeArchivo(proximoACargar)});
        Mila._EmpezarACargar_(proximoACargar);
        Mila._InformarEjecucion_(proximoACargar);
      };
    });
    Mila.Base.ReemplazarFuncion_De_Por_("_DefinirArchivo_", Mila, function(funcionOriginal) {
      return function(configuración) { /*configuración.código = "//";*/ };
    });
    Mila.Cargar(nombre);
    Mila.alIniciar(function() {
      let nombreFinal = (('name' in argumentos) ? argumentos.name : nombre);
      let rutaDestino = (('dst' in argumentos) ? argumentos.dst : '');
      let rutaFinal = Mila.Archivo.rutaAPartirDe_([rutaDestino, nombreFinal])
      if (data.usandoDestinoBuild) {
        for (let nombreProyecto in Mila._proyectos) {
          Mila._proyectos[nombreProyecto] = Mila.Archivo.ruta_Absoluta(Mila.Archivo.rutaAPartirDe_([argumentos.dst, nombreProyecto, 'src']));
        }
        archivosInlcuidos[0].ruta = Mila.Archivo.rutaAPartirDe_(['$milascript', 'mila']);
      }
      const rutaRealDe_ = (data.usandoDestinoBuild)
        ? function(rutaOriginal) {
          return Mila._ruta_NavegandoProyectos(rutaOriginal)
        }
        : function(rutaOriginal) {
          return (Mila._archivo_Existe(rutaOriginal) && 'rutaReal' in Mila._dataDeArchivo(rutaOriginal))
            ? Mila._rutaRealDeArchivo(rutaOriginal)
            : rutaOriginal
          ;
        }
      ;
      const contenido = `<!DOCTYPE HTML>\n<html>\n<head>\n  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n  <script type="module">window.compilado = true;window.sinContratos = ${!conContratos};</script>\n`
        + archivosInlcuidos.transformados(function(archivo) {
          return `  <script${archivo.tipo == "Mila" ? ' type="module"' : ''} src="${
            Mila.Archivo.ruta_RelativaA_((rutaRealDe_(archivo.ruta)), rutaDestino)
          }.js"></script>`;
        }).join("\n")
        + '\n  <style media="screen">\n    body {\n      margin: 0;\n      padding: 0;\n    }\n  </style>\n</head>\n<body>\n</body>\n</html>';
      // console.log(Mila._archivos.clavesDefinidas().transformados(x => `${x} :: ${
      //   'aliasDe' in Mila._archivos[x]
      //   ? Mila._archivos[x].aliasDe
      //   : Mila._archivos[x].rutaReal
      // }`));
      Mila.Archivo.Escribir_EnElArchivo_YLuego_(contenido, `${rutaFinal}.html`, resultado => {
        if (resultado.falló()) {
          Mila.Fallar("No se pudo guardar el archivo");
        }
      });
    });
  };
};

const buildearConDestino = function(optRutaDestino, argumentos) {
  if (optRutaDestino.esAlgo()) {
    argumentos.dst = Mila.Archivo.ruta_Absoluta(optRutaDestino);
  }
  const objetivo = argumentos.lista[0];
  let nombre = Mila.Archivo.nombreDe_(objetivo);
  if (nombre.terminaCon_(".js")) {
    nombre = nombre.sinLosUltimos_(3);
  }
  const rutaRaiz = Mila.Archivo.ubicacionDe_(objetivo);
  if (rutaRaiz.longitud() > 0) {
    Mila.Archivo.NavegarA_(rutaRaiz);
  }
  let ubicacionMila = Mila.Archivo.rutaAPartirDe_(["milascript", "src"]);
  if ('mila' in argumentos) {
    ubicacionMila = argumentos.mila;
    if (ubicacionMila == "$") {
      ubicacionMila = Mila._proyectos["milascript"];
    }
  }
  ubicacionMila = Mila.Archivo.ruta_Absoluta(ubicacionMila);
  ubicacionMila = Mila.Archivo.ruta_Relativa(ubicacionMila);
  Mila._proyectos["milascript"] = Mila.Archivo.ruta_Absoluta("./" + ubicacionMila);
  Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_(
    Mila.Archivo.rutaAPartirDe_([ubicacionMila, 'mila.js']),
      build(nombre, ubicacionMila, argumentos),
      () => Mila.Fallar("No se encuentran los fuentes de milascript en la ruta destino.")
  );
};

Mila.alIniciar(function() {
  if (Mila.entorno().enNavegador()) {
    Mila.Fallar("Este script se tiene que ejecutar en Node.");
  } else {
    const argumentos = Mila.entorno().argumentos;
    if (argumentos.lista.length == 0) {
      Mila.Fallar("No se pasa un archivo para compilar.");
    } else {
      if ('dst' in argumentos) {
        buildearConDestino(argumentos.dst, argumentos);
      } else {
        Mila.Archivo.SiExisteCarpeta_Entonces_YSiNo_(
          'build',
          () => {
            if (!('name' in argumentos)) {
              argumentos.name = 'index';
            }
            data.usandoDestinoBuild = true;
            buildearConDestino('build', argumentos);
          },
          () => {
            buildearConDestino(Mila.Nada, argumentos);
          }
        );
      }
    }
  }
});

