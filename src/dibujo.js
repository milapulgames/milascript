Mila.Módulo({
  define:"Mila.Dibujo",
  usa:["base","geometria","svg","pantalla/dibujable"],
  necesita:["tipo"]
});

Mila.Dibujo.ClaseDibujo = Mila.Tipo.Variante("ClaseDibujo", [
  'Rectángulo', // _rectángulo : Mila.Tipo.Rectángulo
  'Círculo',    // _círculo : Mila.Tipo.Círculo
  'RutaSvg',    // _rutaSvg : Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)
  'Grupo'       // _grupo : Mila.Tipo.ListaDe_(Mila.Tipo.Dibujo)
]);

Mila.Dibujo.deRectángulo_ = function(rectángulo, estilo={}) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo dibujo para el rectángulo dado con el estilo dado.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [rectángulo, Mila.Tipo.Rectángulo],
      [estilo, Mila.Tipo.EstiloDibujo]
    ]
  });
  const nuevoDibujo = new Mila.Dibujo._Dibujo(Mila.Dibujo.ClaseDibujo.Rectángulo, estilo);
  nuevoDibujo._rectángulo = rectángulo.copia();
  return nuevoDibujo;
};

Mila.Dibujo.deCírculo_ = function(círculo, estilo={}) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo dibujo para el círculo dado con el estilo dado.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [círculo, Mila.Tipo.Círculo],
      [estilo, Mila.Tipo.EstiloDibujo]
    ]
  });
  const nuevoDibujo = new Mila.Dibujo._Dibujo(Mila.Dibujo.ClaseDibujo.Círculo, estilo);
  nuevoDibujo._círculo = círculo.copia();
  return nuevoDibujo;
};

Mila.Dibujo.deRutaSvg_ = function(rutaSvg, estilo={}) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo dibujo para la ruta svg dada con el estilo dado.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [rutaSvg, Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)],
      [estilo, Mila.Tipo.EstiloDibujo]
    ]
  });
  const nuevoDibujo = new Mila.Dibujo._Dibujo(Mila.Dibujo.ClaseDibujo.RutaSvg, estilo);
  nuevoDibujo._rutaSvg = rutaSvg.copia();
  return nuevoDibujo;
};

Mila.Dibujo.deGrupo_ = function(grupo, estilo={}) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo dibujo a partir del grupo de dibujos dado con el estilo dado.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [grupo, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujo)],
      [estilo, Mila.Tipo.EstiloDibujo]
    ]
  });
  const nuevoDibujo = new Mila.Dibujo._Dibujo(Mila.Dibujo.ClaseDibujo.Grupo, estilo);
  nuevoDibujo._grupo = grupo;
  return nuevoDibujo;
};

Mila.Dibujo.desdeNodoHtml = function(nodoHtml) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo dibujo a partir del nodo html dado.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [nodoHtml] // Dom
    ],
    Precondiciones: [
      "El nodo dado es apto dibujable (es svg, g, path, rect o circle)",
      Mila.Pantalla._es_NodoHtmlParaDibujable(nodoHtml)
    ]
  });
  let nuevoDibujo = Mila.Nada;
  let claseNodo = nodoHtml.tagName.toLowerCase();
  let estilo = {};
  if (nodoHtml.hasAttribute('stroke')) {
    const colorBorde = nodoHtml.getAttribute('stroke');
    estilo.colorBorde = (colorBorde === 'none') ? '#0000' : colorBorde;
  }
  if (nodoHtml.hasAttribute('stroke-width')) {
    estilo.grosorBorde = Number.parseFloat(nodoHtml.getAttribute('stroke-width'));
  }
  if (nodoHtml.hasAttribute('fill')) {
    const colorFondo = nodoHtml.getAttribute('fill');
    estilo.colorFondo = (colorFondo === 'none') ? '#0000' : colorFondo;
  }
  if (nodoHtml.hasAttribute('fill-opacity')) {
    estilo.opacidadFondo = Number.parseFloat(nodoHtml.getAttribute('fill-opacity'));
  }
  if (claseNodo == 'rect') {
    if (nodoHtml.hasAttribute('x')) {
      x = nodoHtml.getAttribute('x');
    }
    if (nodoHtml.hasAttribute('y')) {
      y = nodoHtml.getAttribute('y');
    }
    if (nodoHtml.hasAttribute('width')) {
      w = nodoHtml.getAttribute('width');
    }
    if (nodoHtml.hasAttribute('height')) {
      h = nodoHtml.getAttribute('height');
    }
    nuevoDibujo = Mila.Dibujo.deRectángulo_(Mila.Geometria.rectánguloEn__De_x_(x, y, w, h), estilo);
  } else if (claseNodo == 'circle') {
    let cx = 0; let cy = 0; let r = 0;
    if (nodoHtml.hasAttribute('cx')) {
      cx = nodoHtml.getAttribute('cx');
    }
    if (nodoHtml.hasAttribute('cy')) {
      cy = nodoHtml.getAttribute('cy');
    }
    if (nodoHtml.hasAttribute('r')) {
      r = nodoHtml.getAttribute('r');
    }
    nuevoDibujo = Mila.Dibujo.deCírculo_(Mila.Geometria.círculoEn__DeRadio_(cx, cy, r), estilo);
  } else if (claseNodo == 'path') {
    let secuenciaDeComandos = [];
    if (nodoHtml.hasAttribute('d')) {
      secuenciaDeComandos = Mila.Svg.secuenciaDeComandosDesdeTexto(nodoHtml.getAttribute('d'));
    }
    nuevoDibujo = Mila.Dibujo.deRutaSvg_(secuenciaDeComandos, estilo);
  } else /* if (claseNodo == 'g' || claseNodo == 'svg) */ {
    let grupo = [];
    for (let hijo of nodoHtml.childNodes) {
      if (Mila.Pantalla._es_NodoHtmlParaDibujable(hijo)) {
        grupo.push(hijo);
      }
    }
    nuevoDibujo = Mila.Dibujo.deGrupo_(grupo.transformados(Mila.Dibujo.desdeNodoHtml), estilo);
  }
  return nuevoDibujo;
};

Mila.Dibujo._Dibujo = function Dibujo(clase, estilo={}) {
  this._clase = clase;
  this._estilo = estilo;
};

Mila.Dibujo._Dibujo.prototype.CambiarEstilo_A_ = function(clave, nuevoValor) {
  Mila.Contrato({
    Propósito: "Reemplazar el estilo de la clave dada de este dibujo por el valor dado.",
    Parámetros: [
      [clave, Mila.Tipo.Texto], // una de las claves de EstiloDibujo
      [nuevoValor, Mila.Tipo.Cualquiera] // el que le corresponda a la clave
    ]
  });
  this._estilo[clave] = nuevoValor;
};

Mila.Dibujo._Dibujo.prototype.clase = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la clase de este dibujo.",
      Mila.Tipo.ClaseDibujo
    ]
  });
  return this._clase;
};

Mila.Dibujo._Dibujo.prototype.estilo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el estilo de este dibujo.",
      Mila.Tipo.EstiloDibujo
    ]
  });
  return this._estilo;
};

Mila.Dibujo._Dibujo.prototype.CambiarPosiciónXA_ = function(nuevaPosiciónX) {
  Mila.Contrato({
    Propósito: "Reemplazar la posición X de este dibujo por la dada.",
    Parámetros: [
      [nuevaPosiciónX, Mila.Tipo.Entero]
    ]
  });
  this.CambiarEstilo_A_('posiciónX', nuevaPosiciónX);
};

Mila.Dibujo._Dibujo.prototype.CambiarPosiciónYA_ = function(nuevaPosiciónY) {
  Mila.Contrato({
    Propósito: "Reemplazar la posición Y de este dibujo por la dada.",
    Parámetros: [
      [nuevaPosiciónY, Mila.Tipo.Entero]
    ]
  });
  this.CambiarEstilo_A_('posiciónY', nuevaPosiciónY);
};

Mila.Dibujo._Dibujo.prototype.CambiarEscalaA_ = function(nuevaEscala) {
  Mila.Contrato({
    Propósito: "Reemplazar la escala de este dibujo por la dada.",
    Parámetros: [
      [nuevaEscala, Mila.Tipo.Numero]
    ]
  });
  this.CambiarEstilo_A_('escala', nuevaEscala);
};

Mila.Dibujo._Dibujo.prototype.CambiarColorFondoA_ = function(nuevoColorFondo) {
  Mila.Contrato({
    Propósito: "Reemplazar el color de fondo de este dibujo por el dado.",
    Parámetros: [
      [nuevoColorFondo, Mila.Tipo.Texto] // ¿Color?
    ]
  });
  this.CambiarEstilo_A_('colorFondo', nuevoColorFondo);
};

Mila.Dibujo._Dibujo.prototype.CambiarColorBordeA_ = function(nuevoColorBorde) {
  Mila.Contrato({
    Propósito: "Reemplazar el color de borde de este dibujo por el dado.",
    Parámetros: [
      [nuevoColorBorde, Mila.Tipo.Texto] // ¿Color?
    ]
  });
  this.CambiarEstilo_A_('colorBorde', nuevoColorBorde);
};

Mila.Dibujo._Dibujo.prototype.CambiarGrosorBordeA_ = function(nuevoGrosorBorde) {
  Mila.Contrato({
    Propósito: "Reemplazar el grosor de borde de este dibujo por el dado.",
    Parámetros: [
      [nuevoGrosorBorde, Mila.Tipo.Entero]
    ]
  });
  this.CambiarEstilo_A_('grosorBorde', nuevoGrosorBorde);
};

Mila.Dibujo._Dibujo.prototype.CambiarOpacidadFondoA_ = function(nuevaOpacidadFondo) {
  Mila.Contrato({
    Propósito: "Reemplazar la opacidad de fondo de este dibujo por la dada.",
    Parámetros: [
      [nuevaOpacidadFondo, Mila.Tipo.Numero]
    ]
  });
  this.CambiarEstilo_A_('opacidadFondo', nuevaOpacidadFondo);
};

Mila.Dibujo._Dibujo.prototype.posiciónX = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la posición en el eje x de este dibujo.",
      Mila.Tipo.Entero
    ]
  });
  return this.estilo().posiciónX;
};

Mila.Dibujo._Dibujo.prototype.posiciónY = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la posición en el eje y de este dibujo.",
      Mila.Tipo.Entero
    ]
  });
  return this.estilo().posiciónY;
};

Mila.Dibujo._Dibujo.prototype.escala = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la escala de este dibujo.",
      Mila.Tipo.Numero
    ]
  });
  return this.estilo().escala;
};

Mila.Dibujo._Dibujo.prototype.colorFondo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el color de fondo de este dibujo.",
      Mila.Tipo.Texto // ¿Color?
    ]
  });
  return this.estilo().colorFondo;
};

Mila.Dibujo._Dibujo.prototype.colorBorde = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el color de borde de este dibujo.",
      Mila.Tipo.Texto // ¿Color?
    ]
  });
  return this.estilo().colorBorde;
};

Mila.Dibujo._Dibujo.prototype.grosorBorde = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el grosor de borde de este dibujo.",
      Mila.Tipo.Entero
    ]
  });
  return this.estilo().grosorBorde;
};

Mila.Dibujo._Dibujo.prototype.opacidadFondo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la opacidad de fondo de este dibujo.",
      Mila.Tipo.Numero
    ]
  });
  return this.estilo().opacidadFondo;
};

Mila.Dibujo.copia = function(dibujoOriginal) {
  Mila.Contrato({
    Propósito: [
      "Describir una copia del dibujo dado.",
      Mila.Tipo.Dibujo
    ],
    Parámetros: [
      [dibujoOriginal, Mila.Tipo.Dibujo]
    ]
  });
  const estilo = dibujoOriginal.estilo().copia();
  if (dibujoOriginal.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Rectángulo)) {
    return Mila.Dibujo.deRectángulo_(dibujoOriginal._rectángulo, estilo);
  } else if (dibujoOriginal.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Círculo)) {
    return Mila.Dibujo.deCírculo_(dibujoOriginal._círculo, estilo);
  } else if (dibujoOriginal.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.RutaSvg)) {
    return Mila.Dibujo.deRutaSvg_(dibujoOriginal._rutaSvg, estilo);
  } else /* if (dibujoOriginal.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Grupo)) */ {
    return Mila.Dibujo.deGrupo_(dibujoOriginal._grupo, estilo);
  }
};

Mila.Tipo.Registrar({
  nombre: "Dibujo",
  prototipo: Mila.Dibujo._Dibujo,
  copia: Mila.Dibujo.copia,
  es: 'esUnDibujo'
});

Mila.Tipo.Registrar({
  nombre: "EstiloDibujo",
  es: {
    "?posiciónX":Mila.Tipo.Entero,
    "?posiciónY":Mila.Tipo.Entero,
    "?escala":Mila.Tipo.Numero,
    "?colorFondo":Mila.Tipo.Texto, // ¿Color?
    "?grosorBorde":Mila.Tipo.Entero,
    "?colorBorde":Mila.Tipo.Texto, // ¿Color?
    "?opacidadFondo":Mila.Tipo.Numero
  },
  inferible: false
});

Mila.Dibujo.estiloPorDefecto = {
  posiciónX:0,
  posiciónY:0,
  escala:1,
  colorFondo:"#0000",
  grosorBorde:1,
  colorBorde:"#0000",
  opacidadFondo:1
};