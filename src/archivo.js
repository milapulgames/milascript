Mila.Modulo({
  define:"Mila.Archivo",
  necesita:["error"]
});

// Primitivas de entorno

/*
  Mila.Archivo._accesoArchivo : La misma del intérprete (ver el archivo mila.js).
  Mila.Archivo._escrituraArchivo : Toma una primera cadena de texto correspondiente a la ruta de un archivo, una segunda cadena de texto
    correspondiente al contenido a escribir y una función de un parámetro. Abre el archivo y escribe en él el contenido dado. Luego invoca
    a la función pasándole el resultado parcial de la operación (un objeto de tipo ResultadoParcial).
    No funciona en el navegador.
  Mila.Archivo._solicitudArchivo : Solicita al usuario seleccionar una ruta. Tomo una función de un parámetro, correspondiente a la función a
    ejecutar con el contenido (como texto) del archivo seleccionado.
    Si la función es de dos parámetros se pasa primero el nombre del archivo seleccionado y luego su contenido.
*/

Mila.Archivo._invocaciónA_ConResultadoParcial = function(funciónOriginal) {
  return (error) => {
    funciónOriginal(Mila.Tipo.esAlgo(error)
      ? Mila.Error.resultadoParcialFallo(error)
      : Mila.Error.resultadoParcialOk()
    );
  }
};

Mila.Archivo._accesoArchivo = function(ruta, funcion) {
  // Sólo convierte el resultado a uno de tipo ResultadoParcial
  Mila._accesoArchivo(ruta, function(resultado) {
    funcion('error' in resultado
      ? Mila.Error.resultadoParcialFallo(resultado.error)
      : Mila.Error.resultadoParcialOk(resultado.contenido)
    );
  });
};

if (Mila.entorno().enNodeJs()) {
  Mila.Archivo._escrituraArchivo = function(ruta, contenido, función) {
    Mila.fs().writeFile(ruta, contenido, Mila.Archivo._invocaciónA_ConResultadoParcial(función));
  };
  Mila.Archivo._solicitudArchivo = function(función) {
    // TODO
  };
} else {
  Mila.Archivo._escrituraArchivo = function(ruta, contenido, función) {
    Mila.Fallar("No se puede escribir un archivo desde el navegador");
  };
  Mila.Archivo._solicitudArchivo = function(función) {
    const selector = document.createElement('input');
    selector.type = 'file';
    selector.onchange = e => {
      let archivoSeleccionado = e.target.files[0];
      let lector = new FileReader();
      lector.readAsText(archivoSeleccionado, 'UTF-8');
      lector.onload = readerEvent => {
        let contenidoArchivo = readerEvent.target.result;
        if (función.length == 2) {
          función(archivoSeleccionado.name, contenidoArchivo);
        } else {
          función(contenidoArchivo);
        }
      };
    };
    selector.click();
  };
}

Mila.Archivo.AbrirArchivo_YLuego_ = function(ruta, función) {
  // Toma una cadena de texto correspondiente a la ruta de un archivo y una función de un parámetro.
  // Abre el archivo y luego invoca a la función pasándole como argumento el resultado parcial de la
  //   operación (un objeto de tipo ResultadoParcial).
  // PRE: existe un archivo con acceso de lectura en la ruta dada.
  Mila.Archivo._accesoArchivo(ruta, función);
};

Mila.Archivo.Escribir_EnElArchivo_YLuego_ = function(contenido, ruta, función) {
  // Toma una primera cadena de texto correspondiente al contenido a escribir, una segunda cadena de texto correspondiente
  //   a la ruta de un archivo y una función de un parámetro. Abre el archivo en la ruta dada, escribe en él el contenido dado
  //   y luego invoca a la función pasándole como argumento el resultado parcial de la operación (un objeto de tipo ResultadoParcial).
  // PRE: existe un archivo con acceso de escritura en la ruta dada o se puede crear un archivo en la ruta dada.
  // No funciona en el navegador.
  Mila.Archivo._escrituraArchivo(ruta, contenido, función);
};

Mila.Archivo.SolicitarArchivoYLuego_ = function(función) {
  // Solicita al usuario seleccionar una ruta. Toma una función de un parámetro, correspondiente a la función a ejecutar
  //   con el contenido (como texto) del archivo seleccionado.
  // Si la función es de dos parámetros se pasa primero el nombre del archivo seleccionado y luego su contenido.
  Mila.Archivo._solicitudArchivo(función);
};

// Alias de Mila._nombreDe_ (ver el archivo mila.js).
Mila.Archivo.nombreDe_ = Mila._nombreDe_;

// Alias de Mila._ubicacionDe_ (ver el archivo mila.js).
Mila.Archivo.ubicacionDe_ = Mila._ubicacionDe_;

// Alias de Mila._rutaActual (ver el archivo mila.js).
Mila.Archivo.rutaActual = Mila._rutaActual;

// Alias de Mila._rutaAbsoluta (ver el archivo mila.js).
Mila.Archivo.ruta_Absoluta = Mila._ruta_Absoluta;

Mila.Archivo.ruta_RelativaA_ = function(rutaDestino, rutaOrigen) {
  // Describe la ruta correspondiente a la primera ruta dada, relativa a la segunda ruta dada.
  // No funciona en el navegador.
  return Mila.path().relative(rutaOrigen, rutaDestino);
};

Mila.Archivo.ruta_Relativa = function(ruta) {
  // Describe la ruta correspondiente a la ruta dada, relativa al directorio actual.
  // No funciona en el navegador.
  return Mila.Archivo.ruta_RelativaA_(ruta, Mila.Archivo.rutaActual());
};

// Alias de Mila._rutaAPartirDe_ (ver el archivo mila.js).
Mila.Archivo.rutaAPartirDe_ = Mila._rutaAPartirDe_;

Mila.Archivo.NavegarA_ = function(ruta) {
  // Cambia el direcorio actual por la ruta dada.
  // PRE: existe una carpeta en la ruta dada.
  // No funciona en el navegador.
  Mila.os().chdir(ruta);
};

Mila.Archivo.SiExisteRuta_Entonces_YSiNo_ = function(ruta, funciónSi, funciónNo) {
  // Determina si existe un archivo o una carpeta en la ruta dada. En caso afirmativo invoca a la primera función dada.
  //   En caso negativo invoca a la segunda función dada.
  // No funciona en el navegador.
  Mila.fs().access(ruta, Mila.fs().constants.F_OK, (error) =>
    Mila.Tipo.esAlgo(error)
    ? funciónNo()
    : funciónSi()
  );
};

// Alias de Mila._SiExisteArchivo_Entonces_YSiNo_ (ver el archivo mila.js).
Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_ = Mila._SiExisteArchivo_Entonces_YSiNo_;

Mila.Archivo.SiExisteCarpeta_Entonces_YSiNo_ = function(ruta, funciónSi, funciónNo) {
  // Determina si existe una carpeta en la ruta dada. En caso afirmativo invoca a la primera función dada.
  //   En caso negativo invoca a la segunda función dada.
  // No funciona en el navegador.
  Mila.fs().stat(ruta, (error, stats) =>
    Mila.Tipo.esAlgo(error) || !stats.isDirectory()
    ? funciónNo()
    : funciónSi()
  );
};

Mila.Archivo.ConElContenidoDeLaCarpeta_Hacer_ = function(ruta, función) {
  // Toma una cadena de texto correspondiente a la ruta de una carpeta y una función de un parámetro. Obtiene
  //   la lista de nombres de archivos y carpetas en la carpeta de la ruta dada e invoca a la función dada con esa lista.
  // No funciona en el navegador.
  Mila.fs().readdir(ruta, (error, contenidoCarpeta) => {
    if (Mila.Tipo.esNada(error)) {
      función(contenidoCarpeta);
    }
  });
};

Mila.Archivo.ConLosArchivosEnLaCarpeta_Hacer_ = function(ruta, función) {
  // Toma una cadena de texto correspondiente a la ruta de una carpeta y una función de un parámetro. Obtiene
  //   la lista de nombres de archivos en la carpeta de la ruta dada e invoca a la función dada con esa lista.
  // No funciona en el navegador.
  Mila.Archivo.ConElContenidoDeLaCarpeta_Hacer_(ruta, (contenidoCarpeta => {
    const archivosEnLaCarpeta = [];
    const filtro = function(contenidoRestante) {
      if (contenidoRestante.esVacia()) {
        función(archivosEnLaCarpeta);
      } else {
        Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_(contenidoRestante.primero(),
          () => {
            archivosEnLaCarpeta.push(contenidoRestante.primero());
            filtro(contenidoRestante.sinElPrimero());
          },
          () => {
            filtro(contenidoRestante.sinElPrimero());
          }
        );
      }
    };
    filtro(contenidoCarpeta);
  }))
};

Mila.Archivo.ConLasCarpetasEnLaCarpeta_Hacer_ = function(ruta, función) {
  // Toma una cadena de texto correspondiente a la ruta de una carpeta y una función de un parámetro. Obtiene
  //   la lista de nombres de carpetas en la carpeta de la ruta dada e invoca a la función dada con esa lista.
  // No funciona en el navegador.
  Mila.Archivo.ConElContenidoDeLaCarpeta_Hacer_(ruta, (contenidoCarpeta => {
    const carpetasEnLaCarpeta = [];
    const filtro = function(contenidoRestante) {
      if (contenidoRestante.esVacia()) {
        función(carpetasEnLaCarpeta);
      } else {
        Mila.Archivo.SiExisteCarpeta_Entonces_YSiNo_(contenidoRestante.primero(),
          () => {
            carpetasEnLaCarpeta.push(contenidoRestante.primero());
            filtro(contenidoRestante.sinElPrimero());
          },
          () => {
            filtro(contenidoRestante.sinElPrimero());
          }
        );
      }
    };
    filtro(contenidoCarpeta);
  }))
};

Mila.Archivo.SiLaCarpeta_EstáVacía_YSiNo_ = function(ruta, funciónSi, funciónNo) {
  // Toma una cadena de texto correspondiente a la ruta de una carpeta y dos funciones. Si la carpeta está vacía
  //  ejecuta la primera función y si no ejecuta la segunda.
  // No funciona en el navegador.
  Mila.Archivo.ConElContenidoDeLaCarpeta_Hacer_(ruta, (contenidoCarpeta) =>
    contenidoCarpeta.esVacia()
    ? funciónSi()
    : funciónNo()
  );
};

Mila.Archivo.CrearCarpeta_YLuego_ = function(ruta, función) {
  // Toma una cadena de texto correspondiente a una ruta y una función de un parámetro. Intenta crear una carpeta en la ruta
  //   dada y luego invoca a la función pasándole como argumento el resultado parcial de la operación (un objeto de tipo ResultadoParcial).
  // PRE: no existe una carpeta en la ruta dada.
  // No funciona en el navegador.
  Mila.fs().mkdir(ruta, {recursive: true}, Mila.Archivo._invocaciónA_ConResultadoParcial(función));
};

Mila.Archivo.CrearEnlaceA_En_YLuego_ = function(destino, nombre, función) {
  // Toma una primera cadena de texto correspondiente a la ruta de una archivo o una carpeta existente, una segunda
  //   cadena de texto correspondiente a la ruta del enlace a crear y una función de un parámetro. Intenta crear un enlace
  //   con el nombre de la segunda cadena de texto apuntando a la ruta de la primera cadena de texto y luego invoca a la función
  //   pasándole como argumento el resultado parcial de la operación (un objeto de tipo ResultadoParcial).
  // PRE: no existe un archivo ni una carpeta con el nombre dado
  // PRE: existe una carpeta o un archivo en la ruta destino dada.
  // No funciona en el navegador.
  Mila.fs().symlink(destino, nombre, Mila.Archivo._invocaciónA_ConResultadoParcial(función));
};

Mila.Archivo.CopiarArchivo_En_YLuego_ = function(archivoACopiar, destino, función) {
  // Toma una primera cadena de texto correspondiente a la ruta del archivo a copiar, una segunda cadena de texto
  //   correspondiente al destino del nuevo archivo y una función de un parámetro. Copia el archivo que está en la primera
  //   ruta dada, lo pega en la segunda ruta dada y luego invoca a la función dada pasándole como argumento el resultado
  //   parcial de la operación (un objeto de tipo ResultadoParcial).
  // PRE: existe un archivo en la primera ruta dada.
  // PRE: existe una carpeta en la segunda ruta dada.
  // No funciona en el navegador.
  Mila.fs().copyFile(archivoACopiar, destino, Mila.Archivo._invocaciónA_ConResultadoParcial(función));
};

Mila.Archivo.CopiarCarpeta_En_YLuego_ = function(carpetaACopiar, destino, función) {
  // Toma una primera cadena de texto correspondiente a la ruta de la carpeta a copiar, una segunda cadena de texto
  //   correspondiente al destino de la nueva carpeta y una función de un parámetro. Copia la carpeta que está en la primera
  //   ruta dada, lo pega en la segunda ruta dada y luego invoca a la función dada pasándole como argumento el resultado
  //   parcial de la operación (un objeto de tipo ResultadoParcial).
  // PRE: existe una carpeta en la primera ruta dada.
  // PRE: existe una carpeta en la segunda ruta dada.
  // No funciona en el navegador.
  let nombreCarpeta = Mila.Archivo.nombreDe_(carpetaACopiar);
  let carpetaDestino = Mila.Archivo.rutaAPartirDe_([destino, nombreCarpeta]);
  Mila.Archivo.SiExisteCarpeta_Entonces_YSiNo_(carpetaDestino,
    () => función(Mila.Error.resultadoParcialFallo(Mila.Error.deCarpetaYaExistente(carpetaDestino))),
    () => {
      Mila.Archivo.CrearCarpeta_YLuego_(carpetaDestino, (resultado) => {
        if (resultado.falló()) {
          función(resultado);
        } else {
          Mila.fs().cp(carpetaACopiar, carpetaDestino, {recursive: true}, Mila.Archivo._invocaciónA_ConResultadoParcial(función));
        }
      });
    }
  );
};

Mila.Error.Declarar('CarpetaYaExiste', 'deCarpetaYaExistente', [
  ['ruta', Mila.Tipo.Texto]
]);