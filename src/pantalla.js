Mila.Modulo({
  define:"Mila.Pantalla",
  usa:["geometria","base","pantalla/panel"],
  necesita:["tipo"]
});

Mila.Pantalla._pantallas = {};
Mila.Pantalla._pantallaActual = Mila.Nada;

Mila.Pantalla.ComportamientoEspacio = Mila.Tipo.Variante("ComportamientoEspacio",
  ["Maximizar","Minimizar"]
);

Mila.Pantalla.ClaveComportamientoEspacio = Mila.Tipo.Registrar({
  nombre:'ClaveComportamientoEspacio',
  subtipoDe:Mila.Tipo.Texto,
  es: function(elemento) {
    return elemento in Mila.Pantalla.ComportamientoEspacio;
  },
  inferible: false
});

Mila.Pantalla.Eje = Mila.Tipo.Variante("Eje",
  ["Horizontal","Vertical"]
);

Mila.Pantalla.ClaveEje = Mila.Tipo.Registrar({
  nombre:'ClaveEje',
  subtipoDe:Mila.Tipo.Texto,
  es: function(elemento) {
    return elemento in Mila.Pantalla.Eje;
  },
  inferible: false
});

Mila.Pantalla.OrdenDisposicion = Mila.Tipo.Variante("OrdenDisposicion",
  ["Estandar","Invertida","Alternada"]
);

Mila.Pantalla.ClaveOrdenDisposicion = Mila.Tipo.Registrar({
  nombre:'ClaveOrdenDisposicion',
  subtipoDe:Mila.Tipo.Texto,
  es: function(elemento) {
    return elemento in Mila.Pantalla.OrdenDisposicion;
  },
  inferible: false
});

Mila.Pantalla.ClaveDisposicion = Mila.Tipo.Registrar({
  nombre:'ClaveDisposicion',
  subtipoDe:Mila.Tipo.Texto,
  es: function(elemento) {
    return `Disposicion${elemento}` in Mila.Pantalla;
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosElementoVisual',
  es: {
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla._ElementoVisual = function ElementoVisual() {};

Mila.Pantalla._ElementoVisual.prototype.Inicializar = function(atributos, porDefecto=Mila.Pantalla.ComportamientoEspacio.Minimizar) {
  Mila.Contrato({
    Proposito: "Inicializar este elemento visual asignando sus campos ancho y alto",
    Parametros: [
      [atributos, Mila.Tipo.AtributosElementoVisual],
      [porDefecto, Mila.Pantalla.ComportamientoEspacio]
    ]
  });
  this.CambiarAnchoA_('ancho' in atributos
    ? atributos.ancho
    : porDefecto
  );
  this.CambiarAltoA_('alto' in atributos
    ? atributos.alto
    : porDefecto
  );
};

Mila.Pantalla._ElementoVisual.prototype.rectanguloInterno = function(rectanguloCompleto) {
  Mila.Contrato({
    Proposito: [
      "Describir el rectángulo interno de este elemento visual tras redimensionarlo en el rectángulo dado",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [rectanguloCompleto, Mila.Tipo.Rectangulo]
    ]
  });
  let rectangulo = rectanguloCompleto.copia();
  if (this.ancho().esUnNumero()) {
    if (rectangulo.ancho < 0) {
      rectangulo.ancho = maximoEntre_Y_(-this.ancho(), rectangulo.ancho);
    } else {
      rectangulo.ancho = minimoEntre_Y_(this.ancho(), rectangulo.ancho);
    }
  }
  if (this.alto().esUnNumero()) {
    if (rectangulo.alto < 0) {
      rectangulo.alto = maximoEntre_Y_(-this.alto(), rectangulo.alto);
    } else {
      rectangulo.alto = minimoEntre_Y_(this.alto(), rectangulo.alto);
    }
  }
  let resultado = rectangulo;
  if ('_nodoHtml' in this) {
    let xInterno, yInterno;
    if (rectangulo.ancho < 0) {
      this._nodoHtml.style.left = '';
      this._nodoHtml.style.right = `${Mila.Pantalla.ancho() - rectangulo.x}px`;
      xInterno = rectangulo.x + rectangulo.ancho;
    } else {
      this._nodoHtml.style.right = '';
      this._nodoHtml.style.left = `${rectangulo.x}px`;
      xInterno = rectangulo.x;
    };
    if (rectangulo.alto < 0) {
      this._nodoHtml.style.top = '';
      this._nodoHtml.style.bottom = `${Mila.Pantalla.alto() - rectangulo.y}px`;
      yInterno = rectangulo.y + rectangulo.alto;
    } else {
      this._nodoHtml.style.bottom = '';
      this._nodoHtml.style.top = `${rectangulo.y}px`;
      yInterno = rectangulo.y;
    };
    resultado = Mila.Geometria.rectanguloEn__De_x_(
      xInterno,
      yInterno,
      Math.abs(rectangulo.ancho),
      Math.abs(rectangulo.alto)
    );
  }
  return resultado;
};

Mila.Pantalla._ElementoVisual.prototype.rectanguloMinimo = function(rectanguloCompleto) {
  Mila.Contrato({
    Proposito: [
      "Describir el rectángulo mínimo ocupado por el elemento html asociado a este elemento visual",
      Mila.Tipo.Rectangulo
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ],
    Parametros: [
      [rectanguloCompleto, Mila.Tipo.Rectangulo]
    ]
  });
  if (this.ancho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
    this._nodoHtml.style.width = `${rectanguloCompleto.ancho}px`;
  } else if (this.ancho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar)) {
    this.MinimizarAncho();
  } else if (this.ancho().esUnNumero()) {
    this._nodoHtml.style.width = `${this.ancho()}px`;
  }
  if (this.alto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
    this._nodoHtml.style.height = `${rectanguloCompleto.alto}px`;
  } else if (this.alto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar)) {
    this.MinimizarAlto();
  } else if (this.alto().esUnNumero()) {
    this._nodoHtml.style.height = `${this.alto()}px`;
  }
  return Mila.Geometria.areaDom_(this._nodoHtml);
};

Mila.Pantalla._ElementoVisual.prototype.Redimensionar = function(rectanguloCompleto) {
  Mila.Contrato({
    Proposito: [
      "Redimensionar este elemento visual para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [rectanguloCompleto, Mila.Tipo.Rectangulo]
    ]
  });
  let resultado = this.rectanguloInterno(rectanguloCompleto);
  if ('_nodoHtml' in this) {
    resultado = this.rectanguloMinimo(resultado);
  }
  return resultado;
};

Mila.Pantalla._ElementoVisual.prototype.ancho = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el ancho de este elemento visual.\
        Puede ser un número, un comportamiento (maximizar o minimizar) o nada.",
      Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Tipo.Nada])
    ],
  });
  if ('_ancho' in this) {
    return this._ancho;
  } else if ('_nodoHtml' in this) {
    return this.anchoHtml();
  }
  return Mila.Nada;
};

Mila.Pantalla._ElementoVisual.prototype.anchoHtml = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el ancho en píxeles del elemento html de este elemento visual",
      Mila.Tipo.Entero
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  return Mila.Geometria.areaDom_(this._nodoHtml).ancho;
};

Mila.Pantalla._ElementoVisual.prototype.MinimizarAncho = function() {
  Mila.Contrato({
    Proposito: "Minimizar el ancho del elemento html de este elemento visual",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style.width = '';
};

Mila.Pantalla._ElementoVisual.prototype.alto = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el alto de este elemento visual.\
        Puede ser un número, un comportamiento (maximizar o minimizar) o nada.",
      Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Tipo.Nada])
    ],
  });
  if ('_alto' in this) {
    return this._alto;
  } else if ('_nodoHtml' in this) {
    return this.altoHtml();
  }
  return Mila.Nada;
};

Mila.Pantalla._ElementoVisual.prototype.altoHtml = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el alto en píxeles del elemento html de este elemento visual",
      Mila.Tipo.Entero
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  return Mila.Geometria.areaDom_(this._nodoHtml).alto;
};

Mila.Pantalla._ElementoVisual.prototype.MinimizarAlto = function() {
  Mila.Contrato({
    Proposito: "Minimizar el alto del elemento html de este elemento visual",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style.height = '';
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAnchoA_ = function(nuevoAncho) {
  Mila.Contrato({
    Proposito: "Reemplazar el ancho de a este elemento visual por el dado",
    Parametros: [
      [nuevoAncho, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])]
    ]
  });
  this._ancho = nuevoAncho.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
    ? Mila.Pantalla.ComportamientoEspacio[nuevoAncho]
    : nuevoAncho
  ;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAltoA_ = function(nuevoAlto) {
  Mila.Contrato({
    Proposito: "Reemplazar el alto de a este elemento visual por el dado",
    Parametros: [
      [nuevoAlto, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])]
    ]
  });
  this._alto = nuevoAlto.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
    ? Mila.Pantalla.ComportamientoEspacio[nuevoAlto]
    : nuevoAlto
  ;
};

Mila.Pantalla._ElementoVisual.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar este elemento visual del documento html",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ]
  });
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Redimensionar = function() {
  Mila.Contrato({
    Proposito: "Redimensionar los elementos visibles"
  });
  if (Mila.Pantalla._pantallaActual.esAlgo()) {
    let pantallaActual = Mila.Pantalla._pantallas[Mila.Pantalla._pantallaActual];
    pantallaActual.Redimensionar(Mila.Pantalla.rectanguloPantalla());
  }
};

Mila.Pantalla.rectanguloPantalla = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el rectángulo correspondiente a la pantalla completa",
      Mila.Tipo.Rectangulo
    ]
  });
  // TODO: distinguir el caso que esté ejecutando en node
  const rectangulo = Mila.Geometria.areaDom_(document.body);
  rectangulo.ancho -= 2;
  rectangulo.alto -= 2;
  return rectangulo;
};

Mila.Pantalla.ancho = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el ancho en píxeles de la pantalla completa",
      Mila.Tipo.Entero
    ]
  });
  return Mila.Pantalla.rectanguloPantalla().ancho;
};

Mila.Pantalla.alto = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el alto en píxeles de la pantalla completa",
      Mila.Tipo.Entero
    ]
  });
  return Mila.Pantalla.rectanguloPantalla().alto;
};

if (Mila.entorno().enNavegador()) {
  Mila.entorno().universo.addEventListener('resize', Mila.Pantalla._Redimensionar);
}

Mila.Pantalla.nueva = function(atributos, nombre=Mila.Nada) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva pantalla. Si no se provee un nombre, se genera uno por defecto.",
      Mila.Tipo.Panel
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosPanel],
      [nombre, Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Nada])]
    ]
  });
  const nuevaPantalla = Mila.Pantalla.nuevoPanel(atributos);
  if (nombre.esNada()) {
    nombre = `Pantalla ${Mila.Pantalla._pantallas.cantidadDeClaves()+1}`;
  }
  Mila.Pantalla._pantallas[nombre] = nuevaPantalla;
  if (Mila.Pantalla._pantallaActual.esNada()) {
    Mila.Pantalla.CambiarA_(nombre);
  }
  return nuevaPantalla;
};

Mila.Pantalla.CambiarA_ = function(nombre) {
  Mila.Contrato({
    Proposito: "Cambiar la pantalla actual a la pantalla con el nombre dado",
    Precondiciones: [
      "Existe una pantalla con el nombre dado",
      nombre in Mila.Pantalla._pantallas
    ],
    Parametros: [
      [nombre, Mila.Tipo.Texto]
    ]
  });
  if (Mila.Pantalla._pantallaActual.esAlgo()) {
    if (Mila.Pantalla._pantallaActual.esIgualA_(nombre)) {
      return;
    }
    Mila.Pantalla._pantallas[Mila.Pantalla._pantallaActual].QuitarDelHtml();
  }
  Mila.Pantalla._pantallaActual = nombre;
  if (Mila.entorno().enNavegador()) {
    Mila.Pantalla._pantallas[Mila.Pantalla._pantallaActual].PlasmarEnHtml(document.body);
    Mila.Pantalla._Redimensionar();
  }
};

Mila.Pantalla._Disposicion = function Disposicion(eje, orden=Mila.Pantalla.OrdenDisposicion.Estandar) {
  this.eje = eje;
  this.orden = orden;
  const limite = this.eje.esIgualA_(Mila.Pantalla.Eje.Horizontal)
    ? {dimension:'ancho', coordenada:'x'}
    : {dimension:'alto', coordenada:'y'}
  ;
  this.invertida = function() {
    return this.orden.esIgualA_(Mila.Pantalla.OrdenDisposicion.Invertida) ||
      (this.orden.esIgualA_(Mila.Pantalla.OrdenDisposicion.Alternada) && this.i % 2 == 1);
  }
  this.DividirRectangulo = function(rectangulo, cantidad) {
    let nuevoRectangulo = rectangulo.copia();
    nuevoRectangulo[limite.dimension] = nuevoRectangulo[limite.dimension] / cantidad;
    if (this.invertida()) {
      nuevoRectangulo[limite.coordenada] = rectangulo[limite.coordenada] + rectangulo[limite.dimension];
      nuevoRectangulo[limite.dimension] = -nuevoRectangulo[limite.dimension];
    }
    return nuevoRectangulo;
  };
  this.RecortarRectangulo = function(completo, ocupado) {
    if (this.invertida()) {
      completo[limite.dimension] -= ocupado[limite.dimension];
    } else {
      completo[limite.coordenada] += ocupado[limite.dimension];
      completo[limite.dimension] -= ocupado[limite.dimension];
    }
  }
};

Mila.Pantalla.DisposicionHorizontal = new Mila.Pantalla._Disposicion(Mila.Pantalla.Eje.Horizontal);
Mila.Pantalla.DisposicionVertical = new Mila.Pantalla._Disposicion(Mila.Pantalla.Eje.Vertical);
Mila.Pantalla.DisposicionHorizontalInvertida = new Mila.Pantalla._Disposicion(Mila.Pantalla.Eje.Horizontal, Mila.Pantalla.OrdenDisposicion.Invertida);
Mila.Pantalla.DisposicionVerticalInvertida = new Mila.Pantalla._Disposicion(Mila.Pantalla.Eje.Vertical, Mila.Pantalla.OrdenDisposicion.Invertida);
Mila.Pantalla.DisposicionHorizontalAlternada = new Mila.Pantalla._Disposicion(Mila.Pantalla.Eje.Horizontal, Mila.Pantalla.OrdenDisposicion.Alternada);
Mila.Pantalla.DisposicionVerticalAlternada = new Mila.Pantalla._Disposicion(Mila.Pantalla.Eje.Vertical, Mila.Pantalla.OrdenDisposicion.Alternada);

Mila.Pantalla._Disposicion.prototype.OrganizarElementos_En_ = function(elementos, rectangulo) {
  Mila.Contrato({
    Proposito: "Organizar los elementos dados en el rectángulo dado",
    Parametros: [
      [elementos, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)],
      [rectangulo, Mila.Tipo.Rectangulo]
    ]
  });
  let elementosRestantes = elementos;
  let rectanguloRestante = rectangulo.copia();
  this.i = 0;
  while (elementosRestantes.longitud() > 0) {
    let rectanguloActual = this.DividirRectangulo(rectanguloRestante, elementosRestantes.longitud());
    this.RecortarRectangulo(rectanguloRestante, elementosRestantes[0].Redimensionar(rectanguloActual));
    elementosRestantes = elementosRestantes.sinElPrimero();
    this.i++;
  }
  delete this.i;
};

Mila.Tipo.Registrar({
  nombre:'Disposicion',
  prototipo: Mila.Pantalla._Disposicion
});

Mila.Tipo.Registrar({
  nombre:'ElementoVisual',
  prototipo: Mila.Pantalla._ElementoVisual
});