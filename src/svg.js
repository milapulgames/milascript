Mila.Módulo({
  define:'Mila.Svg',
  necesita:'base',
  usa:['archivo','lienzo']
});

Mila.Svg.clavesDeComandos = [
  'm',
  'M',
  'l',
  'L',
  'h',
  'H',
  'v',
  'V',
  'c',
  'C',
  'q',
  'Q',
  'z',
  'Z'
];

Mila.Svg.ClaseComandoSvg = Mila.Tipo.Variante("ClaseComandoSvg", Mila.Svg.clavesDeComandos);

Mila.Svg._ComandoSvg = function ComandoSvg() {};

Mila.Tipo.Registrar({
  nombre:'ComandoSvg',
  prototipo: Mila.Svg._ComandoSvg,
  strInstancia: function(comando) {
    return `${comando.clase()}{${comando.argumentos().join(",")}}`;
  },
  copia: Mila.Objeto.copia
});

Mila.Svg.nuevoComando = function(clase, argumentos) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo comando Svg de la clase dada y con los argumentos dados.",
      Mila.Tipo.ComandoSvg
    ],
    Parámetros: [
      [clase, Mila.Tipo.ClaseComandoSvg],
      [argumentos, Mila.Tipo.Lista]
    ]
  });
  const nuevoComando = new Mila.Svg._ComandoSvg();
  nuevoComando._clase = clase;
  nuevoComando._argumentos = argumentos;
  return nuevoComando;
};

Mila.Svg._ComandoSvg.prototype.clase = function() {
  Mila.Contrato({
    Propósito: ["Describe la clase de este comando Svg", Mila.Tipo.ClaseComandoSvg]
  });
  return this._clase;
};

Mila.Svg._ComandoSvg.prototype.argumentos = function() {
  Mila.Contrato({
    Propósito: [
      "Describe la lista de argumentos de este comando Svg", Mila.Tipo.Lista
    ]
  });
  return this._argumentos;
};

Mila.Svg._Svg = function Svg() {};

Mila.Tipo.Registrar({
  nombre:'Svg',
  prototipo: Mila.Svg._Svg,
  copia: Mila.Objeto.copia
});

Mila.Tipo.Registrar({
  nombre:'AtributosSvg',
  es: {
    "?comandos":Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg),
    "?grosorLínea":Mila.Tipo.Entero,
    "?colorLínea":Mila.Tipo.Texto,
    "?colorFondo":Mila.Tipo.Texto,
    "?opacidadFondo":Mila.Tipo.Numero,
    "?hijos":Mila.Tipo.ListaDe_(Mila.Tipo.Svg)
  },
  inferible: false,
  copia: Mila.Objeto.copia
});

Mila.Svg.atributosPorDefecto = {
  comandos: [],
  grosorLínea:1,
  colorLínea:"#0000",
  colorFondo:"#0000",
  opacidadFondo:1,
  hijos: []
};

Mila.Svg.nuevo = function(atributosSvg={}) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo Svg a partir de los atributos dados.", Mila.Tipo.Svg],
    Parámetros: [
      [atributosSvg, Mila.Tipo.AtributosSvg]
    ]
  });
  const nuevoSvg = new Mila.Svg._Svg();
  nuevoSvg.CambiarComandosA_((atributosSvg.defineLaClave_('comandos')
    ? atributosSvg
    : Mila.Svg.atributosPorDefecto
  ).comandos);
  nuevoSvg.CambiarGrosorLíneaA_((atributosSvg.defineLaClave_('grosorLínea')
    ? atributosSvg
    : Mila.Svg.atributosPorDefecto
  ).grosorLínea);
  nuevoSvg.CambiarColorLíneaA_((atributosSvg.defineLaClave_('colorLínea')
    ? atributosSvg
    : Mila.Svg.atributosPorDefecto
  ).colorLínea);
  nuevoSvg.CambiarColorFondoA_((atributosSvg.defineLaClave_('colorFondo')
    ? atributosSvg
    : Mila.Svg.atributosPorDefecto
  ).colorFondo);
  nuevoSvg.CambiarOpacidadFondoA_((atributosSvg.defineLaClave_('opacidadFondo')
    ? atributosSvg
    : Mila.Svg.atributosPorDefecto
  ).opacidadFondo);
  nuevoSvg.CambiarHijosA_((atributosSvg.defineLaClave_('hijos')
    ? atributosSvg
    : Mila.Svg.atributosPorDefecto
  ).hijos);
  return nuevoSvg;
};

Mila.Svg._Svg.prototype.CambiarComandosA_ = function(nuevosComandos) {
  Mila.Contrato({
    Propósito: "Cambiar la lista de comandos de este svg por la dada.",
    Parámetros: [
      [nuevosComandos, Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)]
    ]
  });
  this._comandos = nuevosComandos;
};

Mila.Svg._Svg.prototype.CambiarGrosorLíneaA_ = function(nuevoGrosorLínea) {
  Mila.Contrato({
    Propósito: "Cambiar el grosor de línea de este svg por el dado.",
    Parámetros: [
      [nuevoGrosorLínea, Mila.Tipo.Entero]
    ]
  });
  this._grosorLínea = nuevoGrosorLínea;
};

Mila.Svg._Svg.prototype.CambiarColorLíneaA_ = function(nuevoColorLínea) {
  Mila.Contrato({
    Propósito: "Cambiar el color de línea de este svg por el dado.",
    Parámetros: [
      [nuevoColorLínea, Mila.Tipo.Texto]
    ]
  });
  this._colorLínea = nuevoColorLínea;
};

Mila.Svg._Svg.prototype.CambiarColorFondoA_ = function(nuevoColorFondo) {
  Mila.Contrato({
    Propósito: "Cambiar el color de fondo de este svg por el dado.",
    Parámetros: [
      [nuevoColorFondo, Mila.Tipo.Texto]
    ]
  });
  this._colorFondo = nuevoColorFondo;
};

Mila.Svg._Svg.prototype.CambiarOpacidadFondoA_ = function(nuevaOpacidadFondo) {
  Mila.Contrato({
    Propósito: "Cambiar la opacidad del fondo de este svg por la dada.",
    Parámetros: [
      [nuevaOpacidadFondo, Mila.Tipo.Numero]
    ]
  });
  this._opacidadFondo = nuevaOpacidadFondo;
};

Mila.Svg._Svg.prototype.CambiarHijosA_ = function(nuevosHijos) {
  Mila.Contrato({
    Propósito: "Cambiar la lista de hijos de este svg por la dada.",
    Parámetros: [
      [nuevosHijos, Mila.Tipo.ListaDe_(Mila.Tipo.Svg)]
    ]
  });
  this._hijos = nuevosHijos;
};

Mila.Svg._Svg.prototype.comoDibujableParaLienzo = function() {
  Mila.Contrato({
    Propósito: [
      "Describe un dibujable para lienzo a partir de este svg.",
      Mila.Tipo.Dibujable
    ]
  });
  return {
    imagen:{clase:'svg', svg:this}
  };
};

Mila.Svg._Svg.prototype.comandos = function() {
  Mila.Contrato({
    Propósito: [
      "Describe la secuencia de comandos de este svg.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)
    ]
  });
  return this._comandos;
};

Mila.Svg._Svg.prototype.grosorLínea = function() {
  Mila.Contrato({
    Propósito: [
      "Describe el grosor de línea de este svg.",
      Mila.Tipo.Entero
    ]
  });
  return this._grosorLínea;
};

Mila.Svg._Svg.prototype.colorLínea = function() {
  Mila.Contrato({
    Propósito: [
      "Describe el color de línea de este svg.",
      Mila.Tipo.Texto
    ]
  });
  return this._colorLínea;
};

Mila.Svg._Svg.prototype.colorFondo = function() {
  Mila.Contrato({
    Propósito: [
      "Describe el color de fondo de este svg.",
      Mila.Tipo.Texto
    ]
  });
  return this._colorFondo;
};

Mila.Svg._Svg.prototype.opacidadFondo = function() {
  Mila.Contrato({
    Propósito: [
      "Describe la opacidad del fondo de este svg.",
      Mila.Tipo.Numero
    ]
  });
  return this._opacidadFondo;
};

Mila.Svg._Svg.prototype.hijos = function() {
  Mila.Contrato({
    Propósito: [
      "Describe la lista de hijos de este svg.",
      Mila.Tipo.ListaDe_(Mila.Tipo.Svg)
    ]
  });
  return this._hijos;
};

Mila.Svg._Svg.prototype.comandosComoTexto = function() {
  Mila.Contrato({
    Propósito: [
      "Describe la representación textual de la secuencia de comandos de este svg.",
      Mila.Tipo.Texto
    ]
  });
  return this._comandos.transformados(comando =>
    `${comando.clase()}${comando.argumentos().join(' ')}`
  ).join('');
};

Mila.Svg._Svg.prototype.Transladar__YEscalar_ = function(x, y, s) {
  Mila.Contrato({
    Propósito: "Translada y escala este svg a partir de los argumentos dados.",
    Parámetros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero],
      [s, Mila.Tipo.Numero]
    ]
  });
  if (!this._comandos.esVacia() && this._comandos[0].clase() == 'm') {
    this._comandos[0].argumentos()[0] += x;
    this._comandos[0].argumentos()[1] += y;
  }
  this._comandos.conCadaUno(comando => {
    comando.argumentos().Transformar(argumento => argumento * s);
  });
  this._hijos.conCadaUno(hijo => hijo.Transladar__YEscalar_(x, y, s));
};

Mila.Svg._Svg.prototype.transladado__YEscalado_ = function(x, y, s) {
  Mila.Contrato({
    Propósito: ["Describe un nuevo svg igual a esta pero transladado y escalado a partir de los argumentos dados.", Mila.Tipo.Svg],
    Parámetros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero],
      [s, Mila.Tipo.Numero]
    ]
  });
  const nuevo = this.copia();
  nuevo.Transladar__YEscalar_(x, y, s);
  return nuevo;
};

Mila.Svg.comandoDesdeTexto = function(texto) {
  Mila.Contrato({
    Propósito: [
      "Describe un comando Svg a partir del texto dado.",
      Mila.Tipo.ComandoSvg
    ],
    Parámetros: [
      [texto, Mila.Tipo.Texto]
    ],
    Precondiciones: [
      "El texto dado es la representación textual de un comando Svg."
    ]
  });
  const clase = texto[0];
  const argumentos = [];
  let inicioArgumento=1;
  let finArgumento = 1;
  while (finArgumento < texto.length) {
    if (!'-1234567890.'.includes(texto[finArgumento])) {
      if (finArgumento > inicioArgumento) {
        argumentos.push(texto.substring(inicioArgumento, finArgumento));
      }
      inicioArgumento = finArgumento;
    }
    finArgumento++;
  }
  if (finArgumento > inicioArgumento) {
    argumentos.push(texto.substring(inicioArgumento, finArgumento));
  }
  return Mila.Svg.nuevoComando(clase, argumentos);
};

Mila.Svg.secuenciaDeComandosDesdeTexto = function(texto) {
  Mila.Contrato({
    Propósito: [
      "Describe una secuencia de comandos Svg a partir del texto dado.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)
    ],
    Parámetros: [
      [texto, Mila.Tipo.Texto]
    ],
    Precondiciones: [
      "El texto dado es la representación textual de una secuencia de comandos Svg."
    ]
  });
  const secuenciaDeComandos = [];
  if (texto.esVacio()) {
    return secuenciaDeComandos;
  }
  let inicioComando=texto.primeraApariciónDeAlgunaDe_(Mila.Svg.clavesDeComandos);
  if (inicioComando.esAlgo() && inicioComando > 1) {
    Mostrar("Error al parsear comandos svg: caracteres inválidos antes del primer comando");
  }
  while (inicioComando.esAlgo()) {
    let finComando=texto.primeraApariciónDeAlgunaDe_Desde_(Mila.Svg.clavesDeComandos, inicioComando+1);
    secuenciaDeComandos.push(Mila.Svg.comandoDesdeTexto(texto.subTextoEntre_Y_(
      inicioComando, finComando.esAlgo() ? finComando-1 : texto.longitud()
    )));
    inicioComando = finComando;
  }
  return secuenciaDeComandos;
};

Mila.Svg.desdeNodoHtml = function(nodoHtml) {
  Mila.Contrato({
    Propósito: [
      "Describe un nuevo Svg a partir del nodo Html dado.",
      Mila.Tipo.Svg
    ],
    Parámetros: [
      [nodoHtml] // Dom
    ],
    Precondiciones: [
      "El nodo dado tiene tag 'svg', 'g' o 'path'",
      ['svg', 'g', 'path'].includes(nodoHtml.tagName.toLowerCase())
    ]
  });
  const atributos = Mila.Svg.atributosPorDefecto.copia();
  if (nodoHtml.hasAttribute('d')) {
    atributos.comandos = Mila.Svg.secuenciaDeComandosDesdeTexto(nodoHtml.getAttribute('d'));
  }
  if (nodoHtml.hasAttribute('stroke')) {
    const colorLínea = nodoHtml.getAttribute('stroke');
    atributos.colorLínea = (colorLínea === 'none') ? '#0000' : colorLínea;
  }
  if (nodoHtml.hasAttribute('fill')) {
    const colorFondo = nodoHtml.getAttribute('fill');
    atributos.colorFondo = (colorFondo === 'none') ? '#0000' : colorFondo;
  }
  if (nodoHtml.hasAttribute('fill-opacity')) {
    atributos.opacidadFondo = Number.parseFloat(nodoHtml.getAttribute('fill-opacity'));
  }
  for (let hijo of nodoHtml.childNodes) {
    if (['svg', 'g', 'path'].includes(hijo.tagName.toLowerCase())) {
      atributos.hijos.push(hijo);
    }
  }
  atributos.hijos.Transformar(Mila.Svg.desdeNodoHtml);
  return Mila.Svg.nuevo(atributos);
};

Mila.Svg.ExtraerDesdeArchivo_YLuego_ = function(rutaArchivo, función) {
  Mila.Contrato({
    Propósito: "Abre el archivo en la ruta dada e invoca a la función dada con el Svg contenido en dicho archivo.",
    Parámetros: [
      [rutaArchivo, Mila.Tipo.Texto],
      [función, Mila.Tipo.Funcion] // Que toma un Svg
    ],
    Precondiciones: [
      "Existe un archivo svg en la ruta dada."
    ]
  });
  Mila.Archivo.AbrirArchivo_YLuego_(rutaArchivo, function(resultado) {
    if (!resultado.falló()) {
      const dom = (new DOMParser()).parseFromString(resultado.contenido, "image/svg+xml");
      const hijos = [];
      for (let hijo of dom.childNodes) {
        if (['svg', 'g', 'path'].includes(hijo.tagName.toLowerCase())) {
          hijos.push(hijo);
        }
      }
      if (hijos.longitud() == 1) {
        función(Mila.Svg.desdeNodoHtml(hijos.primero()));
      } else {
        const atributos = Mila.Svg.atributosPorDefecto.copia();
        atributos.hijos.Transformar(Mila.Svg.desdeNodoHtml);
        función(Mila.Svg.nuevo(atributos));
      }
    } else {
      función(Mila.Svg.nuevo());
    }
  });
};