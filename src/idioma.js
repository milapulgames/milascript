Mila.Modulo({
  define:"Mila.Idioma",
  usa:["base", "texto", "archivo"]
});

Mila.Idioma._traduccionesPorIdioma = {};

Mila.Idioma.actual = Mila.Nada;

Mila.Idioma.Seleccionar = function(claveIdioma) {
  Mila.Contrato({
    Propósito:"Cambia el idioma actual por el dado.",
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma._traduccionesPorIdioma
    ],
    Parámetros:[
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  Mila.Idioma.actual = claveIdioma;
  Mila.Idioma.AgregarDesdeDirectorios();
};

Mila.Idioma.idiomaSeleccionado = function() {
  Mila.Contrato({
    Propósito:[
      "Describe el idioma seleccionado o Nada si no se seleccionó ningún idioma todavía.",
      Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Nada])
    ],
  });
  return Mila.Idioma.actual;
};

Mila.Idioma.DeclararNuevo_ = function(claveIdioma, optTraducciones={}) {
  Mila.Contrato({
    Propósito:"Declara un nuevo idioma con la clave dada. Si se pasa un mapa de traducciones se usa para inicializar las traducciones del idioma.",
    Precondiciones:[
      "El idioma dado no fue declarado antes.", !(claveIdioma in Mila.Idioma._traduccionesPorIdioma)
    ],
    Parámetros:[
      [claveIdioma, Mila.Tipo.Texto],
      [optTraducciones]
    ]
  });
  Mila.Idioma._traduccionesPorIdioma[claveIdioma] = Object.assign({}, optTraducciones);
};

Mila.Idioma.Declarar_SiNoExiste = function(claveIdioma) {
  Mila.Contrato({
    Propósito:"Declara un nuevo idioma con la clave dada, si no existe ya",
    Parámetros:[
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  if (!(claveIdioma in Mila.Idioma._traduccionesPorIdioma)) {
    Mila.Idioma.DeclararNuevo_(claveIdioma);
  }
};

Mila.Idioma.AgregarTraducibles_A_ = function(traducciones, claveIdioma) {
  Mila.Contrato({
    Propósito:"Agrega las traducciones dadas al idioma con la clave dada.",
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma._traduccionesPorIdioma
    ],
    Parámetros:[
      [traducciones],
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  Object.assign(Mila.Idioma._traduccionesPorIdioma[claveIdioma], traducciones);
};

Mila.Idioma.AgregarTraducibles_ = function(traducciones) {
  Mila.Contrato({
    Propósito:"Agrega las traducciones dadas al idioma actual.",
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
    ],
    Parámetros:[
      [traducciones]
    ]
  });
  Object.assign(Mila.Idioma._traduccionesPorIdioma[Mila.Idioma.actual], traducciones);
};

Mila.Idioma.existeLaClave_EnIdioma_ = function(claveTraducible, claveIdioma) {
  Mila.Contrato({
    Propósito:[
      "Indica si existe la clave de traducible dada en el idioma de la clave de idioma dada.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma._traduccionesPorIdioma
    ],
    Parámetros:[
      [claveTraducible, Mila.Tipo.Texto],
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  return claveTraducible in Mila.Idioma._traduccionesPorIdioma[claveIdioma];
};

Mila.Idioma.existeLaClave_ = function(claveTraducible) {
  Mila.Contrato({
    Propósito:[
      "Indica si existe la clave de traducible dada en el idioma actual.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
    ],
    Parámetros:[
      [claveTraducible, Mila.Tipo.Texto]
    ]
  });
  return claveTraducible in Mila.Idioma._traduccionesPorIdioma[Mila.Idioma.actual];
};

Mila.Idioma.traducciónDeClave_EnIdioma_ = function(claveTraducible, claveIdioma) {
  Mila.Contrato({
    Propósito:[
      "Describe la traducción de la clave de traducible dada en el idioma de la clave de idioma dada.",
      Mila.Tipo.Texto
    ],
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma._traduccionesPorIdioma,
      "En el idioma dado existe la clave de traducible dada.", Mila.Idioma.existeLaClave_EnIdioma_(claveTraducible, claveIdioma)
    ],
    Parámetros:[
      [claveTraducible, Mila.Tipo.Texto],
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  return Mila.Idioma._traduccionesPorIdioma[claveIdioma][claveTraducible];
};

Mila.Idioma.traducciónDeClave_ = function(claveTraducible) {
  Mila.Contrato({
    Propósito:[
      "Describe la traducción de la clave de traducible dada en el idioma actual.",
      Mila.Tipo.Texto
    ],
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
      "En el idioma actual existe la clave de traducible dada.", Mila.Idioma.existeLaClave_(claveTraducible)
    ],
    Parámetros:[
      [claveTraducible, Mila.Tipo.Texto]
    ]
  });
  return Mila.Idioma._traduccionesPorIdioma[Mila.Idioma.actual][claveTraducible];
};

Mila.Idioma.texto_LocalizadoEnIdioma_ = function(textoLocalizable, claveIdioma) {
  Mila.Contrato({
    Propósito:[
      "Describe la traducción del texto localizable dado en el idioma de la clave de idioma dada.",
      Mila.Tipo.Texto
    ],
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma._traduccionesPorIdioma,
      "Todas las claves traducibles del texto localizable dado existen en el idioma dado."
    ],
    Parámetros:[
      [textoLocalizable, Mila.Tipo.Texto],
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  return textoLocalizable.aplicandoReemplazosCon_({
    indicadorInicioAgujero:"|",
    escapeInicioAgujero:"||",
    indicadorFinAgujero:"|",
    escapeFinAgujero:"||",
    mapaReemplazos:(claveAgujero) => Mila.Idioma.traducciónDeClave_EnIdioma_(claveAgujero, claveIdioma)
  });
};

Mila.Idioma.texto_Localizado = function(textoLocalizable) {
  Mila.Contrato({
    Propósito:[
      "Describe la traducción del texto localizable dado en el idioma actual.",
      Mila.Tipo.Texto
    ],
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
      "Todas las claves traducibles del texto localizable dado existen en el idioma actual."
    ],
    Parámetros:[
      [textoLocalizable, Mila.Tipo.Texto]
    ]
  });
  Mila.Idioma.texto_LocalizadoEnIdioma_(textoLocalizable, Mila.Idioma.actual);
};

Mila.Idioma._directorios = [];

Mila.Idioma.AgregarDirectorio_ = function(ruta, optPrefijo="") {
  Mila.Contrato({
    Propósito:"Agrega el directorio en la ruta dada a la lista de directorios con archivos de traducción. Si se pasa un segundo argumento, se usa como prefijo de todas las claves definidas en los archivos dentro del directorio",
    Precondiciones:[
      "Existe un directorio en la ruta dada",
    ],
    Parámetros:[
      [ruta, Mila.Tipo.Texto],
      [optPrefijo, Mila.Tipo.Texto]
    ]
  });
  let prefijo = optPrefijo.length > 0 ? `${optPrefijo}_` : '';
  const registroDirectorio = {ruta, prefijo, cargados:[]};
  Mila.Idioma._directorios.push(registroDirectorio);
  if (Mila.Idioma.idiomaSeleccionado().esAlgo()) {
    Mila.Idioma.AgregarDesdeDirectorio_(registroDirectorio);
  }
};

Mila.Idioma.AgregarDesdeDirectorios = function() {
  Mila.Contrato({
    Propósito:"Agrega los traducibles definidos en los archivo de traducción para el idioma actual en los directorios registrados",
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
    ]
  });
  for (let registroDirectorio of Mila.Idioma._directorios) {
    if (!registroDirectorio.cargados.includes(Mila.Idioma.idiomaSeleccionado())) {
      Mila.Idioma.AgregarDesdeDirectorio_(registroDirectorio);
    }
  }
};

Mila.Idioma.AgregarDesdeDirectorio_ = function(registroDirectorio) {
  Mila.Contrato({
    Propósito:"Agrega los traducibles definidos en el archivo de traducción para el idioma actual en el directorio correspondiente al registro dado",
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
    ],
    Parámetros:[
      [registroDirectorio, Mila.Tipo.RegistroCon_({
        "ruta":Mila.Tipo.Texto,
        "prefijo":Mila.Tipo.Texto,
        "cargados":Mila.Tipo.ListaDe_(Mila.Tipo.Texto)
      })]
    ]
  });
  const rutaArchivo = Mila.Archivo.rutaAPartirDe_([registroDirectorio.ruta, `${Mila.Idioma.idiomaSeleccionado()}.js`]);
  Mila.Archivo.SiExisteArchivo_Entonces_YSiNo_(
    rutaArchivo,
    () => Mila.Archivo.AbrirArchivo_YLuego_(rutaArchivo,
      function(resultado) {
        if (!resultado.falló()) {
          let traducciones = {};
          eval(`traducciones = ${resultado.contenido};`);
          Mila.Idioma.AgregarTraducibles_(
            traducciones.fold((clave, valor, rec) => rec.conLaClave_YElValor_(`${registroDirectorio.prefijo}${clave}`, valor), {})
          );
        }
      }
    ), () => {}
  );
  registroDirectorio.cargados.Agregar_SiNoEstá(Mila.Idioma.idiomaSeleccionado());
};