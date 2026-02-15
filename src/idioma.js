Mila.Modulo({
  define:"Mila.Idioma",
  usa:["base", "texto"]
});

Mila.Idioma.traduccionesPorIdioma = {};

Mila.Idioma.actual = Mila.Nada;

Mila.Idioma.Seleccionar = function(claveIdioma) {
  Mila.Contrato({
    Propósito:"Cambia el idioma actual por el dado.",
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma.traduccionesPorIdioma
    ],
    Parámetros:[
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  Mila.Idioma.actual = claveIdioma;
};

Mila.Idioma.DeclararNuevo_ = function(claveIdioma, optTraducciones={}) {
  Mila.Contrato({
    Propósito:"Declara un nuevo idioma con la clave dada. Si se pasa un mapa de traducciones se usa para inicializar las traducciones del idioma.",
    Precondiciones:[
      "El idioma dado no fue declarado antes.", !(claveIdioma in Mila.Idioma.traduccionesPorIdioma)
    ],
    Parámetros:[
      [claveIdioma, Mila.Tipo.Texto],
      [optTraducciones]
    ]
  });
  Mila.Idioma.traduccionesPorIdioma[claveIdioma] = Object.assign({}, optTraducciones);
};

Mila.Idioma.AgregarTraducibles_A_ = function(traducciones, claveIdioma) {
  Mila.Contrato({
    Propósito:"Agrega las traducciones dadas al idioma con la clave dada.",
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma.traduccionesPorIdioma
    ],
    Parámetros:[
      [claveIdioma, Mila.Tipo.Texto],
      [traducciones]
    ]
  });
  Object.assign(Mila.Idioma.traduccionesPorIdioma[claveIdioma], traducciones);
};

Mila.Idioma.traducciónDeClave_EnIdioma_ = function(claveTraducible, claveIdioma) {
  Mila.Contrato({
    Propósito:"Describe la traducción de la clave de traducible dada en el idioma de la clave de idioma dada.",
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma.traduccionesPorIdioma,
      "En el idioma dado existe la clave de traducible dada.", claveTraducible in Mila.Idioma.traduccionesPorIdioma[claveIdioma]
    ],
    Parámetros:[
      [claveTraducible, Mila.Tipo.Texto],
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  return Mila.Idioma.traduccionesPorIdioma[claveIdioma][claveTraducible];
};

Mila.Idioma.traducciónDeClave_ = function(claveTraducible) {
  Mila.Contrato({
    Propósito:"Describe la traducción de la clave de traducible dada en el idioma actual.",
    Precondiciones:[
      "Hay un idioma seleccionado.", Mila.Tipo.esAlgo(Mila.Idioma.actual),
      "En el idioma actual existe la clave de traducible dada.", claveTraducible in Mila.Idioma.traduccionesPorIdioma[Mila.Idioma.actual]
    ],
    Parámetros:[
      [claveTraducible, Mila.Tipo.Texto],
      [claveIdioma, Mila.Tipo.Texto]
    ]
  });
  return Mila.Idioma.traduccionesPorIdioma[Mila.Idioma.actual][claveTraducible];
};

Mila.Idioma.texto_LocalizadoEnIdioma_ = function(textoLocalizable, claveIdioma) {
  Mila.Contrato({
    Propósito:"Describe la traducción del texto localizable dado en el idioma de la clave de idioma dada.",
    Precondiciones:[
      "El idioma dado ya fue declarado antes.", claveIdioma in Mila.Idioma.traduccionesPorIdioma,
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
    Propósito:"Describe la traducción del texto localizable dado en el idioma actual.",
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