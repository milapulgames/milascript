Mila.Modulo({
  define:"Mila.Archivo"
});

// Primitivas de entorno

/*
  Mila.Archivo._accesoArchivo : La misma del intérprete (ver el archivo mila.js).
  Mila.Archivo._escrituraArchivo : Toma una primera cadena de texto correspondiente a la ruta de un archivo, una segunda cadena de texto
    correspondiente al contenido a escribir y una función de un parámetro. Abre el archivo y escribe en él el contenido dado. En caso
    de error invoca a la función pasándole como argumento un objeto que representa el resultado de la operación.
    El objeto tendrá el campo 'error' cuyo valor será el error que ocurrió.
    No funciona en el navegador.
  Mila.Archivo._solicitudArchivo : Solicita al usuario seleccionar una ruta. Tomo una función de un parámetro, correspondiente a la función a
    ejecutar con el contenido (como texto) del archivo seleccionado.
*/

Mila.Archivo._accesoArchivo = Mila._accesoArchivo;

if (Mila.entorno().enNodeJs()) {
  Mila.Archivo._escrituraArchivo = function(ruta, contenido, funcionFalla=(x=>{})) {
    Mila.fs().writeFile(ruta, contenido, (error) => {
      const resultado = {};
      if (error) {
        resultado.error = error;
        funcionFalla(resultado);
      }
    });
  };
  Mila.Archivo._solicitudArchivo = function(funcion) {
    // TODO
  };
} else {
  Mila.Archivo._escrituraArchivo = function(ruta, contenido, funcionFalla) {
    Mila.Error("No se puede escribir un archivo desde el navegador");
  };
  Mila.Archivo._solicitudArchivo = function(funcion) {
    const selector = document.createElement('input');
    selector.type = 'file';
    selector.onchange = e => {
      let archivoSeleccionado = e.target.files[0];
      let lector = new FileReader();
      lector.readAsText(archivoSeleccionado, 'UTF-8');
      lector.onload = readerEvent => {
        let contenidoArchivo = readerEvent.target.result;
        if (funcion.length == 2) {
          funcion(archivoSeleccionado.name, contenidoArchivo);
        } else {
          funcion(contenidoArchivo);
        }
      };
    };
    selector.click();
  };
}

Mila.Archivo.AbrirArchivo_YLuego_ = function(ruta, funcion) {
  // Toma una cadena de texto correspondiente a la ruta de un archivo y una función de un parámetro.
  // Abre el archivo y luego invoca a la función pasándole como argumento un objeto que representa el resultado de la operación.
  // El objeto puede tener el campo 'error' si ocurrió un error al abrir el archivo y su valor será el error que ocurrió.
  // El objeto puede tener el campo 'contenido' si el archivo se abrió correctamente
  //   y su valor será una cadena de texto correspondiente al contenido del archivo.
  Mila.Archivo._accesoArchivo(ruta, funcion);
};

Mila.Archivo.Escribir_EnElArchivo_ = function(contenido, ruta, funcionFalla) {
  // Toma una primera cadena de texto correspondiente al contenido a escribir, una segunda cadena de texto correspondiente
  //   a la ruta de un archivo y una función de un parámetro. Abre el archivo en la ruta dada y escribe en él el contenido dado.
  // En caso de error invoca a la función pasándole como argumento un objeto que representa el resultado de la operación.
  // El objeto tendrá el campo 'error' cuyo valor será el error que ocurrió.
  // No funciona en el navegador.
  Mila.Archivo._escrituraArchivo(ruta, contenido, funcionFalla);
};

Mila.Archivo.SolicitarArchivoYLuego_ = function(funcion) {
  // Solicita al usuario seleccionar una ruta. Toma una función de un parámetro, correspondiente a la función a ejecutar
  //   con el contenido (como texto) del archivo seleccionado.
  // Si la función es de dos paráemtros se pasa primero el nombre del archivo seleccionado y luego su contenido.
  Mila.Archivo._solicitudArchivo(funcion);
};