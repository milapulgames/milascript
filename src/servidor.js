Mila.Módulo({
  define:"Mila.Servidor",
  necesita:["tipo"],
  usa:["texto","archivo","error"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosServidor',
  es: {
    "?local":Mila.Tipo.Booleano, // Por defecto, verdadero.
    // Si no se pasa, o se pasa Mila.Nada, se busca alguno disponible a partir del 8000.
    "?puerto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada]),
    // Un objeto cuyas claves son los mensajes que se pueden recibir y
      // sus valores las funciones que se ejecutan para cada uno (que reciben
      // el json enviado por el cliente y devuelven el json a responder).
    "?mensajes":Mila.Tipo.Registro,
    // Una función que recibe un texto correspondiente a la ruta solicitada y:
      // Si la ruta puede ser accedida por un cliente, devuelve un texto correspondiente a
        // la ruta a devolver (puede ser la misma que la solicitada u otra).
      // Si no, devuelve Mila.Nada.
    "?archivos":Mila.Tipo.Funcion,
    // Objeto para configurar SSL. Los campos son las rutas a los archivos.
    "?ssl":Mila.Tipo.RegistroCon_({
      "clave":Mila.Tipo.Texto,
      "certificado":Mila.Tipo.Texto
    })
  },
  inferible: false
});

Mila.Servidor.Escuchar = function(atributosServidor) {
  Mila.Contrato({
    Proposito: "Levanta un servidor y empieza a escuchar mensajes.",
    Precondiciones: [
      "Se está ejecutando en node",
      Mila.entorno().enNodeJs()
    ],
    Parametros: [
      [atributosServidor, Mila.Tipo.AtributosServidor]
    ]
  });
  const ipLocal = (
    ('local' in atributosServidor)
      &&
    !atributosServidor.local
  )
    ? '0.0.0.0'
    : 'localhost'
  ;
  let puerto = ('puerto' in atributosServidor) ? atributosServidor.puerto : Mila.Nada;
  puerto = puerto.esAlgo() ? puerto : Mila.Servidor.puertoDisponible();
  const mensajes = ('mensajes' in atributosServidor) ? atributosServidor.mensajes : {};
  const archivos = ('archivos' in atributosServidor)
    ? atributosServidor.archivos
    : (rutaOriginal) => Mila.Nada
  ;
  if ('ssl' in atributosServidor) {
    Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_(
      atributosServidor.ssl.clave,
      () => {
        Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_(
          atributosServidor.ssl.certificado,
          () => {
            Mila.Archivo.AbrirArchivo_YLuego_(
              atributosServidor.ssl.clave,
              (resultadoClave) => {
                if (resultadoClave.falló()) {
                  Mila.Fallar(Mila.Error.deAperturaDeArchivo(atributosServidor.ssl.clave));
                } else {
                  Mila.Archivo.AbrirArchivo_YLuego_(
                    atributosServidor.ssl.certificado,
                    (resultadoCertificado) => {
                      if (resultadoCertificado.falló()) {
                        Mila.Fallar(Mila.Error.deAperturaDeArchivo(atributosServidor.ssl.certificado));
                      } else {
                        Mila.https().createServer(
                          {
                            key:resultadoClave.contenido,
                            cert:resultadoCertificado.contenido
                          }, Mila.Servidor._fAtenderPetición(mensajes, archivos)
                        ).listen(puerto, ipLocal);
                      }
                    }
                  );
                }
              }
            );
          },
          () => {
            Mila.Fallar(Mila.Error.deArchivoInexistente(atributosServidor.ssl.clave));
          }
        );
      },
      () => {
        Mila.Fallar(Mila.Error.deArchivoInexistente(atributosServidor.ssl.certificado));
      }
    );
  } else {
    Mila.http().createServer(
      Mila.Servidor._fAtenderPetición(mensajes, archivos)
    ).listen(puerto, ipLocal);
  }
};

Mila.Servidor._fAtenderPetición = function(mensajes, archivos) {
  return async function(req, res) {
    let pedido = decodeURI(req.url).subTextoDesde_(2);
    if (pedido.terminaCon_('/')) {
      pedido = pedido.sinLosUltimos_(1);
    }
    if (req.method == "GET") {
      let rutaSolicitada = archivos(pedido);
      if (rutaSolicitada.esAlgo()) {
        Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_(
          rutaSolicitada,
          () => {
            Mila.Servidor._ResponderConArchivo(res, rutaSolicitada)
          },
          () => {
            Mila.Servidor._errorArchivoNoEncontrado(res, pedido);
          }
        );
      } else {
        Mila.Servidor._errorArchivoInválido(res, pedido);
      }
    } else if (req.method == "POST") {
      if (mensajes.defineLaClave_(pedido)) {
        Mila.Servidor._ProcesarPOST(req, res, mensajes[pedido]);
      } else {
        Mila.Servidor._errorMensajeInválido(res, pedido);
      }
    } else {
      Mila.Servidor._errorMétodoInválido(res, req.method);
    }
  };
};

Mila.Servidor._ProcesarPOST = function(req, res, función) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      Mila.Servidor._ResponderConContenido(res, función(JSON.parse(body)));
    } catch (err) {
      Mila.Servidor._errorJsonInválido(res);
    }
  });
};

Mila.Servidor._ResponderConArchivo = function(res, ruta) {
  res.writeHead(200, Mila.Servidor._encabezadoPara_(ruta));
  Mila.fs().createReadStream(ruta).pipe(res);
};

Mila.Servidor._ResponderConContenido = function(res, contenido) {
  res.writeHead(200, Mila.Servidor._encabezadoPara_(".json"));
  res.end(JSON.stringify(contenido));
};

Mila.Servidor._errorArchivoNoEncontrado = function(res, ruta) {
  res.writeHead(404, Mila.Servidor._encabezadoError());
  res.end(`Archivo ${ruta} no encontrado.`);
};

Mila.Servidor._errorArchivoInválido = function(res, ruta) {
  res.writeHead(404, Mila.Servidor._encabezadoError());
  res.end(`Archivo ${ruta} inválido.`);
};

Mila.Servidor._errorMensajeInválido = function(res, mensaje) {
  res.writeHead(404, Mila.Servidor._encabezadoError());
  res.end(`Mensaje ${mensaje} inválido.`);
};

Mila.Servidor._errorMétodoInválido = function(res, método) {
  res.writeHead(404, Mila.Servidor._encabezadoError());
  res.end(`Método ${método} inválido.`);
};

Mila.Servidor._errorJsonInválido = function(res) {
  res.writeHead(400, Mila.Servidor._encabezadoError());
  res.end('JSON inválido.');
};

Mila.Servidor._encabezadoPara_ = function(archivo) {
  return { "Content-Type": Mila.Servidor._tipoMimePara_[
    (
      archivo.esAlgo()
        &&
      Mila.Servidor._tipoMimePara_.defineLaClave_(Mila.Archivo.extensiónDe_(archivo))
    )
      ? Mila.Archivo.extensiónDe_(archivo)
      : "default"
  ] };
};

Mila.Servidor._encabezadoError = function() {
  return Mila.Servidor._encabezadoPara_(".txt");
};

Mila.Servidor._tipoMimePara_ = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  txt: "text/plain; charset=UTF-8",
  md: "text/plain; charset=UTF-8"
};

Mila.Servidor.puertoDisponible = function() {
  // TODO: buscar uno disponible.
  return 8000;
};

Mila.Tipo.Registrar({
  nombre:'PeticiónServidor',
  es: {
    "ip":Mila.Tipo.Texto,
    "puerto":Mila.Tipo.Entero,
    "mensaje":Mila.Tipo.Texto
  },
  inferible: false
});

Mila.Servidor.Pedir_Con_YLuego_ = function(petición, contenido, función) {
  Mila.Contrato({
    Proposito: "Inicia un pedido con la petición dada y el contenido dado. Cuando recibe una respuesta ejecuta la función dada pasándole la respuesta recibida (o Mila.Nada si no se recibió ninguna).",
    Parametros: [
      [petición, Mila.Tipo.O([Mila.Tipo.Texto,Mila.Tipo.PeticiónServidor])],
      [contenido, Mila.Tipo.Registro],
      [función, Mila.Tipo.Funcion]
    ]
  });
  let url = petición.esUnTexto()
    ? petición
    : `http://${petición.ip}:${petición.puerto}/${petición.mensaje}/`
  ;
  Mila.Servidor._pedidoAsincrónico(url, contenido, función);
};

Mila.Servidor._pedidoAsincrónico = async function (url, contenido, función) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: Mila.Servidor._encabezadoPara_(".json"),
      body: JSON.stringify(contenido)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    función(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};