Mila.Modulo({
  define:"Mila.Geometria",
  usa:["base"],
  necesita:["tipo"]
});

Mila.Geometria.puntoEn__ = function(x, y) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo punto ubicado en las coordenadas dadas",
      Mila.Tipo.Punto
    ],
    Parametros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero]
    ]
  });
  return new Mila.Geometria._Punto(x, y);
};

Mila.Geometria.rectanguloEn__De_x_ = function(x, y, ancho, alto) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo rectangulo ubicado en las coordenadas dadas y de las dimensiones dadas",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [x, Mila.Tipo.Numero], [y, Mila.Tipo.Numero],
      [ancho, Mila.Tipo.Numero], [alto, Mila.Tipo.Numero]
    ]
  });
  return new Mila.Geometria._Rectangulo(x, y, ancho, alto);
};

Mila.Geometria.rectanguloCentradoEn__De_x_ = function(x, y, ancho, alto) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo rectangulo centrado en las coordenadas dadas y de las dimensiones dadas",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [x, Mila.Tipo.Numero], [y, Mila.Tipo.Numero],
      [ancho, Mila.Tipo.Numero], [alto, Mila.Tipo.Numero]
    ]
  });
  return Mila.Geometria.rectanguloEn__De_x_(x-ancho/2, y-alto/2, ancho, alto);
};

Mila.Geometria.cuadradoCentradoEn__DeLado_ = function(x, y, lado) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo cuadrado centrado en las coordenadas dadas y con el tamaño de lado dado",
      Mila.Tipo.Cuadrado
    ],
    Parametros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero],
      [lado, Mila.Tipo.Numero]
    ]
  });
  return Mila.Geometria.rectanguloCentradoEn__De_x_(x, y, lado, lado);
};

Mila.Geometria.rectanguloCompleto = function() {
  Mila.Contrato({
    Proposito: [
      "Describir un rectángulo completo (es decir, infinito)",
      Mila.Tipo.Rectangulo
    ]
  });
  return Mila.Geometria.rectanguloCentradoEn__De_x_(-Infinity, -Infinity, Infinity, Infinity);
};

Mila.Geometria.circuloEn__DeRadio_ = function(x, y, radio) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo círculo centrado en las coordenadas dadas y con el radio dado",
      Mila.Tipo.Circulo
    ],
    Parametros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero],
      [radio, Mila.Tipo.Numero]
    ]
  });
  return new Mila.Geometria._Circulo(x, y, radio)
};

Mila.Geometria._Figura = function Figura() {};

Mila.Geometria._Figura.prototype.copia = function() {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva figura idéntica a esta",
      Mila.Tipo.Figura
    ]
  });
  return new Mila.Geometria._Figura();
};

Mila.Geometria._Figura.prototype.trasladado_En_ = function(cantidad, eje) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva figura igual a esta pero trasladada en el eje dado tanto como la cantidad dada",
      Mila.Tipo.Figura
    ],
    Parametros: [
      [cantidad, Mila.Tipo.Numero],
      [eje, Mila.Tipo.Texto]
    ]
  });
  const nuevaFigura = this.copia()
  nuevaFigura.Trasladar_En_(cantidad, eje);
  return nuevaFigura;
};

Mila.Geometria._Figura.prototype.Trasladar_En_ = function(cantidad, eje) {
  Mila.Contrato({
    Proposito: "Trasladar esta figura en el eje dado tanto como la cantidad dada",
    Parametros: [
      [cantidad, Mila.Tipo.Numero],
      [eje, Mila.Tipo.Texto]
    ]
  });
  if (!this.defineLaClave_(eje)) {
    this[eje] = 0;
  }
  this[eje] += cantidad;
};


Mila.Geometria._Punto = function Punto(x, y) {
  this.x = x;
  this.y = y;
};
Object.setPrototypeOf(Mila.Geometria._Punto.prototype, Mila.Geometria._Figura.prototype);

Mila.Geometria._Punto.prototype.copia = function() {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo punto idéntico a este",
      Mila.Tipo.Punto
    ]
  });
  return Mila.Geometria.puntoEn__(this.x,this.y);
};

Mila.Geometria._Rectangulo = function Rectangulo(x, y, ancho, alto) {
  this.x = x;
  this.y = y;
  this.ancho = ancho;
  this.alto = alto;
};
Object.setPrototypeOf(Mila.Geometria._Rectangulo.prototype, Mila.Geometria._Figura.prototype);

Mila.Geometria._Rectangulo.prototype.copia = function() {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo rectángulo idéntico a este",
      Mila.Tipo.Rectangulo
    ]
  });
  return Mila.Geometria.rectanguloEn__De_x_(this.x, this.y, this.ancho, this.alto);
};

Mila.Geometria._Rectangulo.prototype.centro = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el centro de este rectángulo",
      Mila.Tipo.Punto
    ]
  });
  return Mila.Geometria.puntoEn__(this.x + this.ancho/2, this.y + this.alto/2);
};

Mila.Geometria._Circulo = function Circulo(x, y, radio) {
  this.x = x;
  this.y = y;
  this.radio = radio;
};
Object.setPrototypeOf(Mila.Geometria._Circulo.prototype, Mila.Geometria._Figura.prototype);

Mila.Geometria._Circulo.prototype.copia = function() {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo círulo idéntico a este",
      Mila.Tipo.Circulo
    ]
  });
  return Mila.Geometria.circuloEn__DeRadio_(this.x,this.y,this.radio);
};

Mila.Geometria._Circulo.prototype.centro = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el centro de este círculo",
      Mila.Tipo.Punto
    ]
  });
  return Mila.Geometria.puntoEn__(this.x, this.y);
};

Mila.Tipo.Registrar({
  nombre: "Figura",
  prototipo: Mila.Geometria._Figura,
  es: 'esUnaFigura'
});

Mila.Tipo.Registrar({
  nombre: "Punto",
  prototipo: Mila.Geometria._Punto,
  es: 'esUnPunto',
  igualdad: ['x', 'y'],
  strInstancia: function(elemento) {
    return `(${elemento.x},${elemento.y})`;
  },
  subtipoDe: "Figura"
});

Mila.Tipo.Registrar({
  nombre: "Rectangulo",
  prototipo: Mila.Geometria._Rectangulo,
  es: 'esUnRectangulo',
  igualdad: ['x', 'y', 'ancho', 'alto'],
  strTipo: "Rectángulo",
  strInstancia: function(elemento) {
    return `Rectángulo en (${elemento.x},${elemento.y}) de ${elemento.ancho}x${elemento.alto}`;
  },
  subtipoDe: "Figura"
});

Mila.Tipo.Registrar({
  nombre: "Cuadrado",
  subtipoDe: "Rectangulo",
  es: function esUnCuadrado(elemento) {
    return elemento.ancho == elemento.alto;
  },
  igualdad: ['x', 'y', 'ancho'],
  strInstancia: function(elemento) {
    return `Cuadrado en (${elemento.x},${elemento.y}) de lado ${elemento.ancho}`;
  }
});

Mila.Tipo.Registrar({
  nombre: "Circulo",
  prototipo: Mila.Geometria._Circulo,
  es: 'esUnCirculo',
  igualdad: ['x', 'y', 'radio'],
  strTipo: "Círculo",
  strInstancia: function(elemento) {
    return `Círuclo en (${elemento.x},${elemento.y}) de radio ${elemento.radio}`;
  },
  subtipoDe: "Figura"
});

Mila.Geometria.areaDom_ = function(dom) {
  let rectanguloDom = dom.getBoundingClientRect();
  return Mila.Geometria.rectanguloEn__De_x_(rectanguloDom.left, rectanguloDom.top, Math.floor(rectanguloDom.width), Math.floor(rectanguloDom.height));
};