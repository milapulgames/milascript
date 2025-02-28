Mila.Modulo({
  define:"Mila.Lienzo",
  usa:["geometria"]
});

Mila.Lienzo.nuevo = function(contentido=[]) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo lienzo infinito con el contenido dado",
      Mila.Tipo.Lienzo
    ],
    Parametros: [
      contentido
    ]
  });
  return new Mila.Lienzo._Lienzo(contentido);
};

Mila.Lienzo._Lienzo = function(contentido=[]) {
  this._contenido = contentido;
  this._dimensiones = Mila.Geometria.rectanguloCompleto();
};

Mila.Lienzo._Lienzo.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Mostrar este lienzo en un documento HTML",
    Precondiciones: [
      "Se está ejecutando en un navegador", Mila.entorno().enNavegador(),
      "No se inicializó el nodo HTML de este lienzo antes", !('_nodoHtml' in this)
    ],
    Parametros: [
      nodoMadre
    ]
  });
  this._nodoHtml = document.createElement('canvas');
  this._nodoHtml.style.border = 'solid 1px red';
  this._nodoHtml.style.margin = '0';
  this._nodoHtml.style.padding = '0';
  this._nodoHtml.style.position = 'fixed';
  this._contexto = this._nodoHtml.getContext('2d');
  nodoMadre.appendChild(this._nodoHtml);
};

Mila.Lienzo._Lienzo.prototype.AgregarElemento_ = function(elemento) {
  Mila.Contrato({
    Proposito: "Agregar el elemento dado al contenido de este lienzo",
    Parametros: [
      elemento
    ]
  });
  this._contenido.push(elemento);
};

Mila.Lienzo._Lienzo.prototype.Dibujar = function() {
  Mila.Contrato({
    Proposito: "Dibujar el contenido de este lienzo"
  });
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
    Proposito: "Redimensionar este lienzo ajustándolo al rectángulo dado",
    Parametros: [
      [rectangulo, Mila.Tipo.Rectangulo]
    ]
  });
  this._dimensiones = rectangulo;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.left = `${rectangulo.x}px`;
    this._nodoHtml.style.top = `${rectangulo.y}px`;
    this._nodoHtml.width = rectangulo.ancho;
    this._nodoHtml.height = rectangulo.alto;
    this.Dibujar();
  }
};

Mila.Lienzo._Lienzo.prototype._BorrarTodo = function() {
  if ('_nodoHtml' in this) {
    let rectangulo = Mila.Geometria.rectanguloEn__De_x_(0, 0, this._nodoHtml.width, this._nodoHtml.height);
    this._DibujarRectangulo_Con_(rectangulo, {borde:Mila.Color.Blanco, fondo:Mila.Color.Blanco});
  }
};

Mila.Lienzo._Lienzo.prototype._DibujarElemento_ = function(elemento) {
  if ('imagen' in elemento) {
    let imagen = elemento.imagen;
    if (imagen.clase == 'rectangulo') {
      let rectangulo = imagen.rectangulo;
      if ('x' in elemento) {
        rectangulo = rectangulo.trasladado_En_(elemento.x, 'x');
      }
      if ('y' in elemento) {
        rectangulo = rectangulo.trasladado_En_(elemento.y, 'y');
      }
      this._DibujarRectangulo_Con_(rectangulo, imagen.atributos || {});
    }
    if (imagen.clase == 'circulo') {
      let circulo = imagen.circulo;
      if ('x' in elemento) {
        circulo = circulo.trasladado_En_(elemento.x, 'x');
      }
      if ('y' in elemento) {
        circulo = circulo.trasladado_En_(elemento.y, 'y');
      }
      this._DibujarCirculo_Con_(circulo, imagen.atributos || {});
    }
  }
};

Mila.Lienzo._Lienzo.prototype._DibujarRectangulo_Con_ = function(rectangulo, atributos) {
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
  strTipo: function() {
    return "Lienzo";
  },
  strInstancia: function(elemento) {
    return `${elemento._dimensiones} {\n${elemento._contentido.transformados(x => `\t${x}`).join('\n')}\n}`;
  }
});