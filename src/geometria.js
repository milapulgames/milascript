Mila.Módulo({
  define:"Mila.Geometria",
  usa:["base"],
  necesita:["tipo"]
});

Mila.Geometria.puntoEn__ = function(x, y) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo punto ubicado en las coordenadas dadas",
      Mila.Tipo.Punto
    ],
    Parámetros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero]
    ]
  });
  return new Mila.Geometria._Punto(x, y);
};

Mila.Geometria.rectánguloEn__De_x_ = function(x, y, ancho, alto) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo rectángulo ubicado en las coordenadas dadas y de las dimensiones dadas",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [x, Mila.Tipo.Numero], [y, Mila.Tipo.Numero],
      [ancho, Mila.Tipo.Numero], [alto, Mila.Tipo.Numero]
    ]
  });
  return new Mila.Geometria._Rectángulo(x, y, ancho, alto);
};

Mila.Geometria.rectánguloCentradoEn__De_x_ = function(x, y, ancho, alto) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo rectangulo centrado en las coordenadas dadas y de las dimensiones dadas",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [x, Mila.Tipo.Numero], [y, Mila.Tipo.Numero],
      [ancho, Mila.Tipo.Numero], [alto, Mila.Tipo.Numero]
    ]
  });
  return Mila.Geometria.rectánguloEn__De_x_(x-ancho/2, y-alto/2, ancho, alto);
};

Mila.Geometria.cuadradoCentradoEn__DeLado_ = function(x, y, lado) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo cuadrado centrado en las coordenadas dadas y con el tamaño de lado dado",
      Mila.Tipo.Cuadrado
    ],
    Parámetros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero],
      [lado, Mila.Tipo.Numero]
    ]
  });
  return Mila.Geometria.rectánguloCentradoEn__De_x_(x, y, lado, lado);
};

Mila.Geometria.rectánguloCompleto = function() {
  Mila.Contrato({
    Propósito: [
      "Describir un rectángulo completo (es decir, infinito)",
      Mila.Tipo.Rectángulo
    ]
  });
  return Mila.Geometria.rectánguloCentradoEn__De_x_(-Infinity, -Infinity, Infinity, Infinity);
};

Mila.Geometria.círculoEn__DeRadio_ = function(x, y, radio) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo círculo centrado en las coordenadas dadas y con el radio dado",
      Mila.Tipo.Círculo
    ],
    Parámetros: [
      [x, Mila.Tipo.Numero],
      [y, Mila.Tipo.Numero],
      [radio, Mila.Tipo.Numero]
    ]
  });
  return new Mila.Geometria._Círculo(x, y, radio)
};

Mila.Geometria._Figura = function Figura() {};

Mila.Geometria._Figura.prototype.copia = function() {
  Mila.Contrato({
    Propósito: [
      "Describir una nueva figura idéntica a esta",
      Mila.Tipo.Figura
    ]
  });
  return new Mila.Geometria._Figura();
};

Mila.Geometria._Figura.prototype.trasladado_En_ = function(cantidad, eje) {
  Mila.Contrato({
    Propósito: [
      "Describir una nueva figura igual a esta pero trasladada en el eje dado tanto como la cantidad dada",
      Mila.Tipo.Figura
    ],
    Parámetros: [
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
    Propósito: "Trasladar esta figura en el eje dado tanto como la cantidad dada",
    Parámetros: [
      [cantidad, Mila.Tipo.Numero],
      [eje, Mila.Tipo.Texto]
    ]
  });
  if (!this.defineLaClave_(eje)) {
    this[eje] = 0;
  }
  this[eje] += cantidad;
};

Mila.Geometria._Figura.prototype.CambiarAnchoA_ = function(nuevoAncho) {
  Mila.Contrato({
    Propósito: "Cambiar el ancho de esta figura por el dado",
    Parámetros: [
      [nuevoAncho, Mila.Tipo.Numero]
    ],
    Precondiciones: [
      "Esta figura contiene el campo ancho",
      'ancho' in this
    ]
  });
  this.ancho = nuevoAncho;
};

Mila.Geometria._Figura.prototype.CambiarAltoA_ = function(nuevoAlto) {
  Mila.Contrato({
    Propósito: "Cambiar el alto de esta figura por el dado",
    Parámetros: [
      [nuevoAlto, Mila.Tipo.Numero]
    ],
    Precondiciones: [
      "Esta figura contiene el campo alto",
      'alto' in this
    ]
  });
  this.alto = nuevoAlto;
};

Mila.Geometria._Punto = function Punto(x, y) {
  this.x = x;
  this.y = y;
};
Object.setPrototypeOf(Mila.Geometria._Punto.prototype, Mila.Geometria._Figura.prototype);

Mila.Geometria._Punto.prototype.copia = function() {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo punto idéntico a este",
      Mila.Tipo.Punto
    ]
  });
  return Mila.Geometria.puntoEn__(this.x,this.y);
};

Mila.Geometria._Rectángulo = function Rectángulo(x, y, ancho, alto) {
  this.x = x;
  this.y = y;
  this.ancho = ancho;
  this.alto = alto;
};
Object.setPrototypeOf(Mila.Geometria._Rectángulo.prototype, Mila.Geometria._Figura.prototype);

Mila.Geometria._Rectángulo.prototype.copia = function() {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo rectángulo idéntico a este",
      Mila.Tipo.Rectángulo
    ]
  });
  return Mila.Geometria.rectánguloEn__De_x_(this.x, this.y, this.ancho, this.alto);
};

Mila.Geometria._Rectángulo.prototype.centro = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el centro de este rectángulo",
      Mila.Tipo.Punto
    ]
  });
  return Mila.Geometria.puntoEn__(this.x + this.ancho/2, this.y + this.alto/2);
};

Mila.Geometria._Círculo = function Círculo(x, y, radio) {
  this.x = x;
  this.y = y;
  this.radio = radio;
};
Object.setPrototypeOf(Mila.Geometria._Círculo.prototype, Mila.Geometria._Figura.prototype);

Mila.Geometria._Círculo.prototype.copia = function() {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo círulo idéntico a este",
      Mila.Tipo.Círculo
    ]
  });
  return Mila.Geometria.círculoEn__DeRadio_(this.x,this.y,this.radio);
};

Mila.Geometria._Círculo.prototype.centro = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el centro de este círculo",
      Mila.Tipo.Punto
    ]
  });
  return Mila.Geometria.puntoEn__(this.x, this.y);
};

Mila.Tipo.Registrar({
  nombre: "Figura",
  prototipo: Mila.Geometria._Figura,
  copia: (elemento) => elemento.copia(),
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
  nombre: "Rectángulo",
  prototipo: Mila.Geometria._Rectángulo,
  es: 'esUnRectángulo',
  igualdad: ['x', 'y', 'ancho', 'alto'],
  strTipo: "Rectángulo",
  strInstancia: function(elemento) {
    return `Rectángulo en (${elemento.x},${elemento.y}) de ${elemento.ancho}x${elemento.alto}`;
  },
  subtipoDe: "Figura"
});

Mila.Tipo.Registrar({
  nombre: "Cuadrado",
  subtipoDe: "Rectángulo",
  es: function esUnCuadrado(elemento) {
    return elemento.ancho == elemento.alto;
  },
  igualdad: ['x', 'y', 'ancho'],
  strInstancia: function(elemento) {
    return `Cuadrado en (${elemento.x},${elemento.y}) de lado ${elemento.ancho}`;
  }
});

Mila.Tipo.Registrar({
  nombre: "Círculo",
  prototipo: Mila.Geometria._Círculo,
  es: 'esUnCírculo',
  igualdad: ['x', 'y', 'radio'],
  strTipo: "Círculo",
  strInstancia: function(elemento) {
    return `Círuclo en (${elemento.x},${elemento.y}) de radio ${elemento.radio}`;
  },
  subtipoDe: "Figura"
});

Mila.Geometria.áreaDom_ = function(dom) {
  Mila.Contrato({
    Propósito: [
      "Describir el rectángulo que ocupa el elemento dado en pantalla. No incluye los márgenes externos (el 'margin') pero sí los bordes y los márgenes internos (el 'padding').",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [dom]
    ]
  });
  let rectánguloDom = dom.getBoundingClientRect();
  return Mila.Geometria.rectánguloEn__De_x_(
    rectánguloDom.left,
    rectánguloDom.top,
    Math.floor(rectánguloDom.width),
    Math.floor(rectánguloDom.height)
  );
};