Mila.Modulo({
  define:"Mila.Geometria",
  usa:["base"],
  necesita:["tipo"]
});

Mila.Geometria.puntoEn__ = function(x, y) {
  return new Mila.Geometria._Punto(x, y);
};

Mila.Geometria.rectanguloEn__De_x_ = function(x, y, ancho, alto) {
  return new Mila.Geometria._Rectangulo(x, y, ancho, alto);
};

Mila.Geometria.rectanguloCentradoEn__De_x_ = function(x, y, ancho, alto) {
  return Mila.Geometria.rectanguloEn__De_x_(x-ancho/2, y-alto/2, ancho, alto);
};

Mila.Geometria.cuadradoCentradoEn__DeLado_ = function(x, y, lado) {
  return Mila.Geometria.rectanguloCentradoEn__De_x_(x, y, lado, lado);
};

Mila.Geometria.circuloEn__DeRadio_ = function(x, y, radio) {
  return new Mila.Geometria._Circulo(x, y, radio)
};

Mila.Geometria._Punto = function(x, y) {
  this.x = x;
  this.y = y;
};

Mila.Geometria._Punto.prototype.trasladado_En_ = function(cantidad, eje) {
  const nuevoPunto = Mila.Geometria.puntoEn__(this.x,this.y);
  nuevoPunto.Trasladar_En_(cantidad, eje);
  return nuevoPunto;
};

Mila.Geometria._Punto.prototype.Trasladar_En_ = function(cantidad, eje) {
  this[eje] += cantidad;
};

Mila.Geometria._Rectangulo = function(x, y, ancho, alto) {
  this.x = x;
  this.y = y;
  this.ancho = ancho;
  this.alto = alto;
};

Mila.Geometria._Rectangulo.prototype.centro = function() {
  return Mila.Geometria.puntoEn__(this.x + this.ancho/2, this.y + this.alto/2);
};

Mila.Geometria._Rectangulo.prototype.trasladado_En_ = function(cantidad, eje) {
  const nuevoRectangulo = Mila.Geometria.rectanguloEn__De_x_(this.x, this.y, this.ancho, this.alto);
  nuevoRectangulo.Trasladar_En_(cantidad, eje);
  return nuevoRectangulo;
};

Mila.Geometria._Rectangulo.prototype.Trasladar_En_ = function(cantidad, eje) {
  this[eje] += cantidad;
};

Mila.Geometria._Circulo = function(x, y, radio) {
  this.x = x;
  this.y = y;
  this.radio = radio;
};

Mila.Geometria._Circulo.prototype.centro = function() {
  return Mila.Geometria.puntoEn__(this.x, this.y);
};

Mila.Geometria._Circulo.prototype.trasladado_En_ = function(cantidad, eje) {
  const nuevoCirculo = Mila.Geometria.circuloEn__DeRadio_(this.x,this.y,this.radio);
  nuevoCirculo.Trasladar_En_(cantidad, eje);
  return nuevoCirculo;
};

Mila.Geometria._Circulo.prototype.Trasladar_En_ = function(cantidad, eje) {
  this[eje] += cantidad;
};

Mila.Tipo.Registrar({
  nombre: "Punto",
  prototipo: Mila.Geometria._Punto,
  es: 'esUnPunto',
  igualdad: ['x', 'y'],
  strTipo: function() {
    return "Punto";
  },
  strInstancia: function(elemento) {
    return `(${elemento.x},${elemento.y})`;
  }
});

Mila.Tipo.Registrar({
  nombre: "Rectangulo",
  prototipo: Mila.Geometria._Rectangulo,
  es: 'esUnRectangulo',
  igualdad: ['x', 'y', 'ancho', 'alto'],
  strTipo: function() {
    return "Rectángulo";
  },
  strInstancia: function(elemento) {
    return `Rectángulo en (${elemento.x},${elemento.y}) de ${elemento.ancho}x${elemento.alto}`;
  }
});

Mila.Tipo.Registrar({
  nombre: "Cuadrado",
  prototipo: Mila.Geometria._Rectangulo,
  es: function esUnCuadrado(elemento) {
    return elemento.ancho == elemento.alto;
  },
  igualdad: ['x', 'y', 'ancho'],
  strTipo: function() {
    return "Cuadrado";
  },
  strInstancia: function(elemento) {
    return `Cuadrado en (${elemento.x},${elemento.y}) de lado ${elemento.ancho}`;
  }
});

Mila.Tipo.Registrar({
  nombre: "Circulo",
  prototipo: Mila.Geometria._Circulo,
  es: 'esUnCirculo',
  igualdad: ['x', 'y', 'radio'],
  strTipo: function() {
    return "Círculo";
  },
  strInstancia: function(elemento) {
    return `Círuclo en (${elemento.x},${elemento.y}) de radio ${elemento.radio}`;
  }
});