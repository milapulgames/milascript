Mila.Módulo({
  define:"Mila.Cámara",
  necesita:["tipo","geometria"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosCámara',
  es: {
    "?posición":Mila.Tipo.Punto,
    "?zoom":Mila.Tipo.Numero
  },
  inferible: false
});

Mila.Cámara.nueva = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva cámara a partir de los atributos dados.",
      Mila.Tipo.Cámara
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosCámara]
    ]
  });
  let nuevaCámara = new Mila.Cámara._Cámara();
  nuevaCámara.CambiarPosiciónA_('posición' in atributos
    ? atributos.posición
    : Mila.Geometria.puntoEn__(0,0)
  );
  nuevaCámara.CambiarZoomA_('zoom' in atributos
    ? atributos.zoom
    : 100
  );
  return nuevaCámara;
};

Mila.Cámara._Cámara = function Cámara() {};

Mila.Cámara._Cámara.prototype.CambiarPosiciónA_ = function(nuevaPosición) {
  Mila.Contrato({
    Proposito: "Reemplazar la posición de esta cámara por la dada.",
    Parametros: [
      [nuevaPosición, Mila.Tipo.Punto]
    ]
  });
  this._posición = nuevaPosición;
};

Mila.Cámara._Cámara.prototype.CambiarZoomA_ = function(nuevoZoom) {
  Mila.Contrato({
    Proposito: "Reemplazar el zoom de esta cámara por el dado.",
    Parametros: [
      [nuevoZoom, Mila.Tipo.Numero]
    ]
  });
  this._zoom = nuevoZoom;
};

Mila.Cámara._Cámara.prototype.posición = function() {
  Mila.Contrato({
    Proposito: [
      "Describir la posición de esta cámara.",
      Mila.Tipo.Punto
    ]
  });
  return this._posición;
};

Mila.Cámara._Cámara.prototype.zoom = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el zoom de esta cámara.",
      Mila.Tipo.Numero
    ]
  });
  return this._zoom;
};

Mila.Cámara._Cámara.prototype.Mover__ = function(movimientoEnX, movimientoEnY) {
  Mila.Contrato({
    Proposito: "Mover esta cámara según los movimientos dados en cada eje.",
    Parametros: [
      [movimientoEnX, Mila.Tipo.Numero],
      [movimientoEnY, Mila.Tipo.Numero]
    ]
  });
  this._posición.Trasladar_En_(movimientoEnX/this._zoom*100, "x");
  this._posición.Trasladar_En_(movimientoEnY/this._zoom*100, "y");
};

Mila.Cámara._Cámara.prototype.ZoomearEn_ = function(factor) {
  Mila.Contrato({
    Proposito: "Zoomear esta cámara en el factor dado.",
    Parametros: [
      [factor, Mila.Tipo.Numero]
    ]
  });
  this._zoom *= factor;
};

Mila.Tipo.Registrar({
  nombre:'Cámara',
  prototipo: Mila.Cámara._Cámara
});