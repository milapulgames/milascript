/*  Sobre este archivo
  Este es el compilador de milascript. Genera un archivo html que carga todos los módulos de milascript como si
    fueran archivos javascript. Debe ejecutarse en NodeJs ya que espera como argumento la ruta al archivo milascript que
    actúa como punto de entrada al proyecto y además necesita escribir un archivo en el sistema de archivos local.
  Para ejecutarlo mediante NodeJs: Ejecutar en una terminal `node src/mila.js scripts/build ` seguido de la ruta al
    archivo milascript a compilar (sin la extensión).
  Argumentos opcionales:
  - mila: ruta a la carpeta de fuentes milascript (donde debe estar mila.js y todos los otros archivos milascript necesarios).
      Si no se pasa este argumento se asume que la carpeta es milascript (o milascript/src).
      Si se pasa $ como este argumento se utiliza al carpeta desde donde se está ejecutando milascript ahora.
*/

Mila.Modulo({
  necesita:["../src/base"],
  usa:["../src/archivo"]
});

const build = function(nombre, ubicacionMila) {
  return function() {
    const archivosInlcuidos = [{ruta:`${ubicacionMila}mila`, tipo:"Mila"}];
    Mila._archivos = {};
    Mila.Base.ReemplazarFuncion_De_Por_("_Agregar_AlEntorno", Mila, function(funcionOriginal) {
      return function(proximoACargar) {
        const rutaArchivo = proximoACargar;
        archivosInlcuidos.push({ruta:rutaArchivo, tipo:Mila._archivos[proximoACargar].tipo});
        Mila._EmpezarACargar_(proximoACargar);
        Mila._InformarEjecucion_(proximoACargar);
      };
    });
    Mila.Base.ReemplazarFuncion_De_Por_("_DefinirArchivo_", Mila, function(funcionOriginal) {
      return function(configuracion) {};
    });
    Mila.Cargar(nombre);
    Mila.alIniciar(function() {
      const contenido = '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n  <script type="module">window.compilado = true;window.sinContratos = true;</script>\n'
        + archivosInlcuidos.transformados(function(archivo) {
          return `  <script${archivo.tipo == "Mila" ? ' type="module"' : ''} src="${rutaRelativa(
            (archivo.ruta in Mila._archivos && 'rutaReal' in Mila._archivos[archivo.ruta])
              ? Mila._archivos[archivo.ruta].rutaReal
              : archivo.ruta
          )}.js"></script>`;
        }).join("\n")
        + '\n  <style media="screen">\n    body {\n      margin: 0;\n      padding: 0;\n    }\n  </style>\n</head>\n<body>\n</body>\n</html>';
      Mila.Archivo.Escribir_EnElArchivo_(contenido, `${nombre}.html`);
    });
  };
};

const rutaRelativa = function(rutaOriginal) {
  return `${Mila.path().relative(Mila.path().resolve(),rutaOriginal)}`;
};

Mila.alIniciar(function() {
  if (Mila.entorno().enNavegador()) {
    Mila.Error("Este script se tiene que ejecutar en Node.");
  } else {
    const argumentos = Mila.entorno().argumentos;
    if (argumentos.lista.length == 0) {
      Mila.Error("No se pasa un archivo para compilar.");
    } else {
      const objetivo = argumentos.lista[0];
      let nombre = Mila._nombreDe_(objetivo);
      if (nombre.endsWith(".js")) {
        nombre = nombre.substring(0, nombre.length-3);
      }
      const rutaRaiz = Mila._ubicacionDe_(objetivo);
      if (rutaRaiz.length > 0) {
        Mila.os().chdir(rutaRaiz);
      }
      let ubicacionMila = "milascript";
      if ('mila' in argumentos) {
        ubicacionMila = argumentos.mila;
        if (ubicacionMila == "$") {
          ubicacionMila = Mila._proyectos["milascript"];
        } else {
          delete Mila._proyectos["milascript"];
        }
      } else {
        delete Mila._proyectos["milascript"];
      }
      ubicacionMila = Mila.path().resolve(ubicacionMila);
      ubicacionMila = rutaRelativa(ubicacionMila) + "/";
      const acceso = function(ruta, f_si, f_no) {
        Mila.fs().access(ruta, Mila.fs().constants.F_OK, (err) => {
          err ? f_no() : f_si();
        });
      }
      acceso(`${ubicacionMila}mila.js`, build(nombre, ubicacionMila), () =>
        acceso(`${ubicacionMila}src/mila.js`, build(nombre, `${ubicacionMila}src/`), () =>
          { Mila.Error("No se encuentran los fuentes de milascript en la ruta destino."); }
        )
      );
    }
  }
});

