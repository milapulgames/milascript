Mila.Modulo({
  define:"Mila.Pantalla",
  usa:["geometria","base"],
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
  nombre:'AtributosEtiqueta',
  es: {
    "?texto":Mila.Tipo.Texto
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosBoton',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?funcion":Mila.Tipo.Funcion
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosPanel',
  es: {
    "?elementos":Mila.Tipo.Lista,
    "?disposicion":Mila.Tipo.O([Mila.Pantalla.Disposicion,Mila.Pantalla.ClaveDisposicion]),
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevaEtiqueta = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describe una nueva etiqueta a partir de los atributos dados",
      Mila.Tipo.Etiqueta
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosEtiqueta]
    ]
  });
  let nuevaEtiqueta = new Mila.Pantalla._Etiqueta();
  nuevaEtiqueta.CambiarTextoA_('texto' in atributos
    ? atributos.texto
    : ''
  );
  return nuevaEtiqueta;
};

Mila.Pantalla.nuevoBoton = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describe un nuevo botón a partir de los atributos dados",
      Mila.Tipo.Boton
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosBoton]
    ]
  });
  let nuevoBoton = new Mila.Pantalla._Boton();
  nuevoBoton.CambiarTextoA_('texto' in atributos
    ? atributos.texto
    : ''
  );
  if ('funcion' in atributos) {
    nuevoBoton.CambiarFuncionA_(atributos.funcion);
  }
  return nuevoBoton;
};

Mila.Pantalla.nuevoPanel = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describe un nuevo panel a partir de los atributos dados",
      Mila.Tipo.Panel
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosPanel]
    ]
  });
  let nuevoPanel = new Mila.Pantalla._Panel();
  nuevoPanel.CambiarElementosA_('elementos' in atributos
    ? atributos.elementos
    : []
  );
  nuevoPanel.CambiarDisposicionA_('disposicion' in atributos
    ? (atributos.disposicion.esDeTipo_(Mila.Pantalla.ClaveDisposicion)
      ? Mila.Pantalla[`Disposicion${atributos.disposicion}`]
      : atributos.disposicion
    )
    : Mila.Pantalla.DisposicionVertical
  );
  nuevoPanel.CambiarAnchoA_('ancho' in atributos
    ? (atributos.ancho.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
      ? Mila.Pantalla.ComportamientoEspacio[atributos.ancho]
      : atributos.ancho
    )
    : Mila.Pantalla.ComportamientoEspacio.Maximizar
  );
  nuevoPanel.CambiarAltoA_('alto' in atributos
    ? (atributos.alto.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
      ? Mila.Pantalla.ComportamientoEspacio[atributos.alto]
      : atributos.alto
    )
    : Mila.Pantalla.ComportamientoEspacio.Maximizar
  );
  return nuevoPanel;
};

Mila.Pantalla._ElementoVisual = function ElementoVisual() {};

Mila.Pantalla._ElementoVisual.prototype.Redimensionar = function(rectangulo) {
  return rectangulo;
};

Mila.Pantalla._ElementoVisual.prototype.ancho = function() {
  if ('_ancho' in this) {
    return this._ancho;
  }
  return Mila.Nada;
};

Mila.Pantalla._ElementoVisual.prototype.alto = function() {
  if ('_alto' in this) {
    return this._alto;
  }
  return Mila.Nada;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAnchoA_ = function(nuevoAncho) {
  this._ancho = nuevoAncho;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAltoA_ = function(nuevoAlto) {
  this._alto = nuevoAlto;
};

Mila.Pantalla._Etiqueta = function Etiqueta() {};
Object.setPrototypeOf(Mila.Pantalla._Etiqueta.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Etiqueta.prototype.CambiarTextoA_ = function(nuevoTexto) {
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.innerHTML = this._texto;
  }
};

Mila.Pantalla._Etiqueta.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('span');
    this._nodoHtml.innerHTML = this._texto;
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Pantalla._Etiqueta.prototype.QuitarDelHtml = function() {
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Boton = function Boton() {};
Object.setPrototypeOf(Mila.Pantalla._Boton.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Boton.prototype.CambiarTextoA_ = function(nuevoTexto) {
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.innerHTML = this._texto;
  }
};

Mila.Pantalla._Boton.prototype.CambiarFuncionA_ = function(nuevaFuncion) {
  this._funcion = nuevaFuncion;
  if ('_nodoHtml' in this) {
    this._nodoHtml.addEventListener('click', funcion);
  }
};

Mila.Pantalla._Boton.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('button');
    this._nodoHtml.innerHTML = this._texto;
    if ('_funcion' in this) {
      this._nodoHtml.addEventListener('click', this._funcion);
    }
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Pantalla._Boton.prototype.QuitarDelHtml = function() {
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Panel = function Panel() {};
Object.setPrototypeOf(Mila.Pantalla._Panel.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Panel.prototype.AgregarElemento_ = function(nuevoElemento) {
  this._elementos.push(nuevoElemento);
};

Mila.Pantalla._Panel.prototype.CambiarElementosA_ = function(nuevosElementos) {
  this._elementos = nuevosElementos.esUnaLista() ? nuevosElementos : [nuevosElementos];
};

Mila.Pantalla._Panel.prototype.CambiarDisposicionA_ = function(nuevaDisposicion) {
  this._disposicion = nuevaDisposicion;
};

Mila.Pantalla._Panel.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('div');
    this._nodoHtml.style.border = 'solid 1px green';
    this._nodoHtml.style.margin = '0';
    this._nodoHtml.style.padding = '0';
    this._nodoHtml.style.position = 'fixed';
    nodoMadre.appendChild(this._nodoHtml);
    for (let elemento of this._elementos) {
      elemento.PlasmarEnHtml(this._nodoHtml);
    }
  }
};

Mila.Pantalla._Panel.prototype.QuitarDelHtml = function() {
  for (let elemento of this._elementos) {
    elemento.QuitarDelHtml();
  }
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Panel.prototype.Redimensionar = function(rectangulo) {
  let resultado = rectangulo;
  if ('_nodoHtml' in this) {
    let xInterno, yInterno;
    // Primero intento llenar todo
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
    this._nodoHtml.style.width = `${Math.abs(rectangulo.ancho)}px`;
    this._nodoHtml.style.height = `${Math.abs(rectangulo.alto)}px`;
    let rectanguloInterno = Mila.Geometria.rectanguloEn__De_x_(
      xInterno,
      yInterno,
      Math.abs(rectangulo.ancho),
      Math.abs(rectangulo.alto)
    );
    this._disposicion.OrganizarElementos_En_(this._elementos, rectanguloInterno);
    resultado = rectanguloInterno;
    // Después me fijo si sobra espacio
    if (this._ancho.esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar)) {
      this._nodoHtml.style.width = '';
    } else if (this._ancho.esUnNumero()) {
      this._nodoHtml.style.width = `${this._ancho}px`;
    }
    if (this._alto.esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar)) {
      this._nodoHtml.style.height = '';
    } else if (this._alto.esUnNumero()) {
      this._nodoHtml.style.height = `${this._alto}px`;
    }
    resultado = Mila.Geometria.areaDom_(this._nodoHtml);
  }
  return resultado;
};

Mila.Pantalla._Redimensionar = function() {
  if (Mila.Pantalla._pantallaActual.esAlgo()) {
    let pantallaActual = Mila.Pantalla._pantallas[Mila.Pantalla._pantallaActual];
    pantallaActual.Redimensionar(Mila.Pantalla.rectanguloPantalla());
  }
};

Mila.Pantalla.rectanguloPantalla = function() {
  // TODO: distinguir el caso que esté ejecutando en node
  const rectangulo = Mila.Geometria.areaDom_(document.body);
  rectangulo.ancho -= 2;
  rectangulo.alto -= 2;
  return rectangulo;
};

Mila.Pantalla.ancho = function() {
  return Mila.Pantalla.rectanguloPantalla().ancho;
};

Mila.Pantalla.alto = function() {
  return Mila.Pantalla.rectanguloPantalla().alto;
};

if (Mila.entorno().enNavegador()) {
  Mila.entorno().universo.addEventListener('resize', Mila.Pantalla._Redimensionar);
}

Mila.Pantalla.nueva = function(atributos, nombre=Mila.Nada) {
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

Mila.Tipo.Registrar({
  nombre:'Panel',
  prototipo: Mila.Pantalla._Panel
});

Mila.Tipo.Registrar({
  nombre:'Boton',
  prototipo: Mila.Pantalla._Boton
});

Mila.Tipo.Registrar({
  nombre:'Etiqueta',
  prototipo: Mila.Pantalla._Etiqueta
});