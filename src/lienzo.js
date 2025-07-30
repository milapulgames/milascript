Mila.Modulo({
  define:"Mila.Lienzo",
  usa:["geometria","objeto","lista"],
  necesita:["tipo","pantalla"]
});

Mila.Lienzo.nuevo = function(contentido=[]) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo lienzo infinito con el contenido dado",
      Mila.Tipo.Lienzo
    ],
    Parametros: [
      [contentido, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujable)]
    ]
  });
  return new Mila.Lienzo._Lienzo(contentido);
};

Mila.Lienzo._Lienzo = function Lienzo(contentido=[]) {
  this._contenido = contentido;
  this._dimensiones = Mila.Geometria.rectanguloCompleto();
  this._grosorBorde = 1;
};

Mila.Lienzo._Lienzo.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este lienzo en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en un navegador", Mila.entorno().enNavegador(),
      "No se inicializó el nodo HTML de este lienzo antes", !('_nodoHtml' in this)
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  this._nodoHtml = document.createElement('canvas');
  this._nodoHtml.style.border = `solid ${this._grosorBorde}px red`;
  this._nodoHtml.style.margin = '0';
  this._nodoHtml.style.padding = '0';
  this._nodoHtml.style.position = 'absolute';
  this._contexto = this._nodoHtml.getContext('2d');
  nodoMadre.appendChild(this._nodoHtml);
};

Mila.Lienzo._Lienzo.prototype.AgregarElemento_ = function(elemento) {
  Mila.Contrato({
    Proposito: "Agregar el elemento dado al contenido de este lienzo",
    Parametros: [
      [elemento, Mila.Tipo.Dibujable]
    ]
  });
  this._contenido.push(elemento);
};

Mila.Lienzo._Lienzo.prototype.Dibujar = function() {
  Mila.Contrato({
    Proposito: "Dibujar el contenido de este lienzo"
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
    Proposito: "Limpiar el contenido de este lienzo"
  });
  this._BorrarTodo();
  this._contenido = [];
};

Mila.Lienzo._Lienzo.prototype.Redimensionar = function(rectangulo) {
  Mila.Contrato({
    Proposito: [
      "Redimensionar este lienzo para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [rectangulo, Mila.Tipo.Rectangulo]
    ]
  });
  this._dimensiones = rectangulo;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.left = `${rectangulo.x}px`;
    this._nodoHtml.style.top = `${rectangulo.y}px`;
    this._nodoHtml.width = rectangulo.ancho-2*this._grosorBorde;
    this._nodoHtml.height = rectangulo.alto-2*this._grosorBorde;
    this.Dibujar();
  }
  return rectangulo;
};

Mila.Lienzo._Lienzo.prototype._BorrarTodo = function() {
  Mila.Contrato({
    Proposito: "Limpiar este lienzo"
  });
  if ('_nodoHtml' in this) {
    let rectangulo = Mila.Geometria.rectanguloEn__De_x_(0, 0, this._nodoHtml.width, this._nodoHtml.height);
    this._DibujarRectangulo_Con_(rectangulo, {borde:"#fff", fondo:"#fff"});
  }
};

Mila.Lienzo._Lienzo.prototype._DibujarElemento_ = function(elemento) {
  Mila.Contrato({
    Proposito: "Dibujar el elemento dado en este lienzo",
    Parametros: [
      [elemento, Mila.Tipo.Dibujable]
    ]
  });
  Mila.Lienzo._dibujables[elemento.imagen.clase].Dibujar(elemento, this);
};

Mila.Lienzo._Lienzo.prototype._DibujarRectangulo_Con_ = function(rectangulo, atributos) {
  Mila.Contrato({
    Proposito: "Dibujar el rectangulo dado con los atributos dados en este lienzo",
    Parametros: [
      [rectangulo, Mila.Tipo.Rectangulo],
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
      rectangulo.x,
      rectangulo.y,
      rectangulo.ancho,
      rectangulo.alto
    );
  }
  contexto.strokeRect(
    rectangulo.x,
    rectangulo.y,
    rectangulo.ancho,
    rectangulo.alto
  );
  contexto.restore();
};

Mila.Lienzo._Lienzo.prototype._DibujarCirculo_Con_ = function(circulo, atributos) {
  Mila.Contrato({
    Proposito: "Dibujar el círculo dado con los atributos dados en este lienzo",
    Parametros: [
      [rectangulo, Mila.Tipo.Circulo],
      [atributos, Mila.Tipo.AtributosDibujable]
    ]
  });
  let contexto = this._contexto;
  contexto.save();
  contexto.beginPath();
  if ('borde' in atributos) {
    contexto.strokeStyle = atributos.borde;
  }
  contexto.arc(circulo.x,circulo.y,circulo.r,0,2*Math.PI);
  contexto.stroke();
  contexto.closePath();
  contexto.restore();
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
  rectangulo: {
    es: function(elemento) { // PRE: elemento tiene imagen.clase = 'rectangulo'
      return elemento.imagen.defineLaClavePropia_("rectangulo") &&
        elemento.imagen.rectangulo.esUnRectangulo()
    },
    Dibujar: function(elemento, lienzo) {
      let rectangulo = elemento.imagen.rectangulo;
      if ('x' in elemento) {
        rectangulo = rectangulo.trasladado_En_(elemento.x, 'x');
      }
      if ('y' in elemento) {
        rectangulo = rectangulo.trasladado_En_(elemento.y, 'y');
      }
      lienzo._DibujarRectangulo_Con_(rectangulo, elemento.imagen.atributos || {});
    }
  },
  circulo: {
    es: function(elemento) { // PRE: elemento tiene imagen.clase = 'circulo'
      return elemento.imagen.defineLaClavePropia_("circulo") &&
        elemento.imagen.circulo.esUnCirculo()
    },
    Dibujar: function(elemento, lienzo) {
      let circulo = elemento.imagen.circulo;
      if ('x' in elemento) {
        circulo = circulo.trasladado_En_(elemento.x, 'x');
      }
      if ('y' in elemento) {
        circulo = circulo.trasladado_En_(elemento.y, 'y');
      }
      lienzo._DibujarCirculo_Con_(circulo, elemento.imagen.atributos || {});
    }
  }
};

Mila.Lienzo.esDibujable = function(elemento) {
  Mila.Contrato({
    Proposito: "Indicar si el elemento dado es dibujable",
    Parametros: [
      elemento // Cualquier tipo
    ]
  });
  return elemento.defineLaClavePropia_('imagen') &&
    elemento.imagen.defineLaClavePropia_('clase') &&
    Mila.Lienzo._dibujables.defineLaClavePropia_(elemento.imagen.clase) &&
    Mila.Lienzo._dibujables[elemento.imagen.clase].es(elemento)
  ;
};

Mila.Tipo.Registrar({
  nombre: "Dibujable",
  es: function esDibujable(elemento) {
    return Mila.Lienzo.esDibujable(elemento);
  },
  inferible: false
});