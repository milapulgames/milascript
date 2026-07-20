Mila.Módulo({
  define:"Mila.Lienzo",
  usa:["geometria","objeto","lista","svg"],
  necesita:["tipo","pantalla"]
});

Mila.Lienzo.nuevo = function(contentido=[]) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo lienzo infinito con el contenido dado.",
      Mila.Tipo.Lienzo
    ],
    Parámetros: [
      [contentido, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujable)]
    ]
  });
  return new Mila.Lienzo._Lienzo(contentido);
};

Mila.Lienzo._Lienzo = function Lienzo(contentido=[]) {
  this._contenido = contentido;
  this._dimensiones = Mila.Geometria.rectánguloCompleto();
  this._grosorBorde = 1;
};

Mila.Lienzo._Lienzo.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Propósito: "Plasmar este lienzo en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en un navegador.", Mila.entorno().enNavegador(),
      "No se inicializó el nodo HTML de este lienzo antes.", !('_nodoHtml' in this)
    ],
    Parámetros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  this._nodoHtml = document.createElement('canvas');
  this._nodoHtml.style.margin = '0';
  this._nodoHtml.style.padding = '0';
  this._nodoHtml.style.position = 'absolute';
  this._contexto = this._nodoHtml.getContext('2d');
  nodoMadre.appendChild(this._nodoHtml);
};

Mila.Lienzo._Lienzo.prototype.CambiarContenidoA_ = function(nuevoContenido) {
  Mila.Contrato({
    Propósito: "Cambiar el contenido de este lienzo por el dado.",
    Parámetros: [
      [nuevoContenido, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujable)]
    ]
  });
  this._contenido = nuevoContenido;
};

Mila.Lienzo._Lienzo.prototype.AgregarElemento_ = function(elemento) {
  Mila.Contrato({
    Propósito: "Agregar el elemento dado al contenido de este lienzo.",
    Parámetros: [
      [elemento, Mila.Tipo.Dibujable]
    ]
  });
  this._contenido.push(elemento);
};

Mila.Lienzo._Lienzo.prototype.Dibujar = function() {
  Mila.Contrato({
    Propósito: "Dibujar el contenido de este lienzo."
  });
  this._BorrarTodo();
  if ('_nodoHtml' in this) {
    for (let elemento of this._contenido) {
      this._DibujarElemento_(elemento);
    }
  }
};

Mila.Lienzo._Lienzo.prototype.Limpiar = function() {
  Mila.Contrato({
    Propósito: "Limpiar el contenido de este lienzo."
  });
  this._BorrarTodo();
  this._contenido = [];
};

Mila.Lienzo._Lienzo.prototype.Redimensionar = function(rectángulo) {
  Mila.Contrato({
    Propósito: [
      "Redimensionar este lienzo para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [rectángulo, Mila.Tipo.Rectángulo]
    ]
  });
  this._dimensiones = rectángulo;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.left = `${rectángulo.x}px`;
    this._nodoHtml.style.top = `${rectángulo.y}px`;
    this._nodoHtml.width = rectángulo.ancho-2*this._grosorBorde;
    this._nodoHtml.height = rectángulo.alto-2*this._grosorBorde;
    this.Dibujar();
  }
  return rectángulo;
};

Mila.Lienzo._Lienzo.prototype._BorrarTodo = function() {
  Mila.Contrato({
    Propósito: "Limpiar este lienzo."
  });
  if ('_nodoHtml' in this) {
    let rectángulo = Mila.Geometria.rectánguloEn__De_x_(0, 0, this._nodoHtml.width, this._nodoHtml.height);
    this._DibujarRectangulo_Con_(rectángulo, {borde:"#fff", fondo:"#fff"});
  }
};

Mila.Lienzo._Lienzo.prototype._DibujarElemento_ = function(elemento) {
  Mila.Contrato({
    Propósito: "Dibujar el elemento dado en este lienzo.",
    Parámetros: [
      [elemento, Mila.Tipo.Dibujable]
    ]
  });
  Mila.Lienzo._dibujables[elemento.imagen.clase].Dibujar(elemento, this);
};

Mila.Lienzo._Lienzo.prototype._DibujarRectangulo_Con_ = function(rectángulo, atributos) {
  Mila.Contrato({
    Propósito: "Dibujar el rectángulo dado con los atributos dados en este lienzo.",
    Parámetros: [
      [rectángulo, Mila.Tipo.Rectángulo],
      [atributos, Mila.Tipo.AtributosDibujable]
    ]
  });
  let contexto = this._contexto;
  contexto.save();
  contexto.beginPath();
  if ('borde' in atributos) {
    contexto.strokeStyle = atributos.borde;
  }
  if ('fondo' in atributos) {
    contexto.fillStyle = atributos.fondo;
    contexto.fillRect(
      rectángulo.x,
      rectángulo.y,
      rectángulo.ancho,
      rectángulo.alto
    );
  }
  contexto.strokeRect(
    rectángulo.x,
    rectángulo.y,
    rectángulo.ancho,
    rectángulo.alto
  );
  contexto.restore();
};

Mila.Lienzo._Lienzo.prototype._DibujarCírculo_Con_ = function(círculo, atributos) {
  Mila.Contrato({
    Propósito: "Dibujar el círculo dado con los atributos dados en este lienzo.",
    Parámetros: [
      [círculo, Mila.Tipo.Círculo],
      [atributos, Mila.Tipo.AtributosDibujable]
    ]
  });
  let contexto = this._contexto;
  contexto.save();
  contexto.beginPath();
  if ('borde' in atributos) {
    contexto.strokeStyle = atributos.borde;
  }
  contexto.arc(círculo.x,círculo.y,círculo.r,0,2*Math.PI);
  contexto.stroke();
  if ('fondo' in atributos) {
    contexto.fillStyle = atributos.fondo;
    contexto.fill();
  }
  contexto.closePath();
  contexto.restore();
};

Mila.Lienzo._Lienzo.prototype._DibujarSvg_ = function(svg) {
  Mila.Contrato({
    Propósito: "Dibujar el svg dado en este lienzo.",
    Parámetros: [
      [svg, Mila.Tipo.Svg]
    ]
  });
  let contexto = this._contexto;
  contexto.save();
  contexto.beginPath();
  const datos = new Path2D(svg.comandosComoTexto());
  contexto.lineWidth = svg.grosorLínea()
  contexto.strokeStyle = svg.colorLínea();
  contexto.stroke(datos);
  contexto.globalAlpha = svg.opacidadFondo();
  contexto.fillStyle = svg.colorFondo();
  contexto.fill(datos);
  contexto.closePath();
  contexto.restore();
  svg.hijos().conCadaUno(hijo => this._DibujarSvg_(hijo));
};

Mila.Tipo.Registrar({
  nombre: "Lienzo",
  prototipo: Mila.Lienzo._Lienzo,
  es: 'esUnLienzo',
  igualdad: ['_contenido','_dimensiones'],
  strInstancia: function(elemento) {
    return `${elemento._dimensiones} {\n${elemento._contentido.transformados(x => `\t${x}`).join('\n')}\n}`;
  },
  subtipoDe: Mila.Tipo.ElementoVisual
});

Mila.Tipo.Registrar({
  nombre:'AtributosDibujable',
  es: {
    "?borde":Mila.Tipo.Texto,
    "?fondo":Mila.Tipo.Texto,
  },
  inferible: false
});

Mila.Lienzo._dibujables = {
  rectángulo: {
    es: function(elemento) { // PRE: elemento tiene imagen.clase = 'rectángulo'
      const imagen = elemento.campo_ConIndirección('imagen');
      return imagen.defineLaClave_("rectángulo") && imagen.rectángulo.esUnRectángulo()
    },
    Dibujar: function(elemento, lienzo) {
      const imagen = elemento.campo_ConIndirección('imagen');
      let rectángulo = imagen.rectángulo;
      if (elemento.defineLaClave_('x')) {
        rectángulo = rectángulo.trasladado_En_(elemento.campo_ConIndirección('x'), 'x');
      }
      if (elemento.defineLaClave_('y')) {
        rectángulo = rectángulo.trasladado_En_(elemento.campo_ConIndirección('y'), 'y');
      }
      lienzo._DibujarRectangulo_Con_(rectángulo, imagen.atributos || {});
    },
    EscalarEn_: function(elemento, escala) {
      elemento.imagen.rectángulo.x *= escala;
      elemento.imagen.rectángulo.y *= escala;
      elemento.imagen.rectángulo.ancho *= escala;
      elemento.imagen.rectángulo.alto *= escala;
    }
  },
  círculo: {
    es: function(elemento) { // PRE: elemento tiene imagen.clase = 'círculo'
      const imagen = elemento.campo_ConIndirección('imagen');
      return imagen.defineLaClave_("círculo") && imagen.círculo.esUnCírculo()
    },
    Dibujar: function(elemento, lienzo) {
      const imagen = elemento.campo_ConIndirección('imagen');
      let círculo = imagen.círculo;
      if (elemento.defineLaClave_('x')) {
        círculo = círculo.trasladado_En_(elemento.campo_ConIndirección('x'), 'x');
      }
      if (elemento.defineLaClave_('y')) {
        círculo = círculo.trasladado_En_(elemento.campo_ConIndirección('y'), 'y');
      }
      lienzo._DibujarCírculo_Con_(círculo, imagen.atributos || {});
    },
    EscalarEn_: function(elemento, escala) {
      elemento.imagen.círculo.x *= escala;
      elemento.imagen.círculo.y *= escala;
      elemento.imagen.círculo.radio *= escala;
    }
  },
  svg: {
    es: function(elemento) { // PRE: elemento tiene imagen.clase = 'svg'
      const imagen = elemento.campo_ConIndirección('imagen');
      return imagen.defineLaClave_('svg') &&
        imagen.campo_ConIndirección('svg').esDeTipo_(Mila.Tipo.Svg)
      ;
    },
    Dibujar: function(elemento, lienzo) {
      const imagen = elemento.campo_ConIndirección('imagen');
      const svg = imagen.campo_ConIndirección('svg').transladado__YEscalado_(
        elemento.defineLaClave_('x') ? elemento.campo_ConIndirección('x') : 0,
        elemento.defineLaClave_('y') ? elemento.campo_ConIndirección('y') : 0,
        elemento.defineLaClave_('s') ? elemento.campo_ConIndirección('s') : 1
      );
      lienzo._DibujarSvg_(svg);
    },
    EscalarEn_: function(elemento, escala) {
      elemento.campo_ConIndirección('imagen')
        .campo_ConIndirección('svg')
        .Transladar__YEscalar_(0,0,escala)
      ;
    }
  }
};

Mila.Lienzo.esDibujable = function(elemento) {
  Mila.Contrato({
    Propósito: [
      "Indicar si el elemento dado es dibujable.",
      Mila.Tipo.Booleano
    ],
    Parámetros: [
      elemento // Cualquier tipo
    ]
  });
  if (elemento.defineLaClave_('imagen')) {
    const imagen = elemento.campo_ConIndirección('imagen');
    return imagen.defineLaClave_('clase') &&
      Mila.Lienzo._dibujables.defineLaClave_(imagen.clase) &&
      Mila.Lienzo._dibujables[imagen.clase].es(elemento)
    ;
  }
  return false;
};

Mila.Lienzo.EscalarDibujable_En_ = function(dibujable, escala) {
  Mila.Contrato({
    Propósito: "Escalar el dibujable dado en la escala dada.",
    Parámetros: [
      [dibujable, Mila.Tipo.Dibujable],
      [escala, Mila.Tipo.Numero]
    ]
  });
  Mila.Lienzo._dibujables[dibujable.imagen.clase].EscalarEn_(dibujable, escala);
};

Mila.Lienzo.copiaDeDibujable_ = function(dibujableOriginal) {
  Mila.Contrato({
    Propósito: ["Describe una copia del dibujable dado.", Mila.Tipo.Dibujable],
    Parámetros: [[dibujableOriginal, Mila.Tipo.Dibujable]]
  });
  const nuevo = {};
  nuevo.x = dibujableOriginal.defineLaClave_('x') ? dibujableOriginal.campo_ConIndirección('x') : 0;
  nuevo.y = dibujableOriginal.defineLaClave_('y') ? dibujableOriginal.campo_ConIndirección('y') : 0;
  nuevo.s = dibujableOriginal.defineLaClave_('s') ? dibujableOriginal.campo_ConIndirección('s') : 1;
  nuevo.imagen = dibujableOriginal.campo_ConIndirección('imagen').copia();
  return nuevo;
};

Mila.Tipo.Registrar({
  nombre: "Dibujable",
  es: function esDibujable(elemento) {
    return Mila.Lienzo.esDibujable(elemento);
  },
  inferible: false
});