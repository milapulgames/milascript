Mila.Modulo({
  define:"Mila.Pantalla",
  usa:["base","pantalla/panel"],
  necesita:["tipo","geometria"]
});

Mila.Pantalla._pantallas = {};
Mila.Pantalla._pantallaActual = Mila.Nada;

Mila.Pantalla.Constantes = {
  grosorBarraScroll: 15.5,
  offsetVentana: 2 // Ojo: En Firefox es 3
}

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
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?colorFondo":Mila.Tipo.Texto,
    "?grosorBorde":Mila.Tipo.Entero,
    "?colorBorde":Mila.Tipo.Texto, // ¿Color?
    "?margenInterno":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectangulo]),
    "?margenExterno":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectangulo]),
    "?cssAdicional":Mila.Tipo.Registro,
    "?visible":Mila.Tipo.Booleano,
    "?funcion":Mila.Tipo.Funcion,
    "?destino":Mila.Tipo.Texto
  },
  inferible: false
});

Mila.Pantalla.AtributosElementoVisualPorDefecto = {
  ancho:Mila.Pantalla.ComportamientoEspacio.Minimizar,
  alto:Mila.Pantalla.ComportamientoEspacio.Minimizar,
  colorFondo:"#0000",
  grosorBorde:0,
  margenInterno:0,
  margenExterno:0,
  colorBorde:"#0000",
  cssAdicional:{},
  visible:true
};

Mila.Pantalla._ElementoVisual = function ElementoVisual() {};

Mila.Pantalla._ElementoVisual.prototype.Inicializar = function(atributos, porDefecto=Mila.Pantalla.AtributosElementoVisualPorDefecto) {
  Mila.Contrato({
    Proposito: "Inicializar este elemento visual asignando sus campos básicos",
    Parametros: [
      [atributos, Mila.Tipo.AtributosElementoVisual],
      [porDefecto, Mila.Tipo.AtributosElementoVisual]
    ]
  });
  const todosLosAtributos = Object.assign({}, Mila.Pantalla.AtributosElementoVisualPorDefecto, porDefecto, atributos);
  this.CambiarAnchoA_(todosLosAtributos.ancho);
  this.CambiarAltoA_(todosLosAtributos.alto);
  this.CambiarColorFondoA_(todosLosAtributos.colorFondo);
  this.CambiarGrosorBordeA_(todosLosAtributos.grosorBorde);
  this.CambiarColorBordeA_(todosLosAtributos.colorBorde);
  this.CambiarMargenInternoA_(todosLosAtributos.margenInterno);
  this.CambiarMargenExternoA_(todosLosAtributos.margenExterno);
  this.CambiarCssAdicionalA_(todosLosAtributos.cssAdicional);
  this.CambiarVisibilidadA_(todosLosAtributos.visible);
  let funcion = Mila.Nada;
  if ('funcion' in atributos) {
    funcion = atributos.funcion;
  }
  if ('destino' in atributos) {
    let funcionDestino = function() { open(atributos.destino); };
    funcion = funcion.esAlgo() ? function() {
      funcion();
      funcionDestino();
    } : funcionDestino;
  }
  if (funcion.esAlgo()) {
    this.CambiarFuncionA_(funcion);
  }
};

Mila.Tipo.Registrar({
  nombre:'AtributosElementoVisualTextual',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?tamanioLetra":Mila.Tipo.Entero,
    "?colorTexto":Mila.Tipo.Texto,
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.AtributosElementoVisualTextualPorDefecto = {
  tamanioLetra: 12,
  colorTexto: "#000"
};

Mila.Pantalla._ElementoVisualTextual = function ElementoVisualTextual() {};
Object.setPrototypeOf(Mila.Pantalla._ElementoVisualTextual.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._ElementoVisualTextual.prototype.Inicializar = function(atributos, porDefecto=Mila.Pantalla.AtributosElementoVisualTextualPorDefecto) {
  Mila.Contrato({
    Proposito: "Inicializar este elemento visual textual asignando sus campos básicos",
    Parametros: [
      [atributos, Mila.Tipo.AtributosElementoVisualTextual],
      [porDefecto, Mila.Tipo.AtributosElementoVisualTextual]
    ]
  });
  Mila.Pantalla._ElementoVisual.prototype.Inicializar.call(this, atributos, porDefecto);
  const todosLosAtributos = Object.assign({}, Mila.Pantalla.AtributosElementoVisualTextualPorDefecto, porDefecto, atributos);
  this.CambiarTamanioLetraA_(todosLosAtributos.tamanioLetra);
  this.CambiarColorTextoA_(todosLosAtributos.colorTexto);
  this.CambiarTextoA_('texto' in todosLosAtributos
    ? todosLosAtributos.texto
    : ''
  );
}

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
  let mHorizontal = 1;
  let mVertical = 1;
  if (this.ancho().esUnNumero()) {
    if (rectangulo.ancho < 0) {
      rectangulo.ancho = maximoEntre_Y_(-this.ancho(), rectangulo.ancho);
      mHorizontal = -1;
    } else {
      rectangulo.ancho = minimoEntre_Y_(this.ancho(), rectangulo.ancho);
    }
  }
  if (this.alto().esUnNumero()) {
    if (rectangulo.alto < 0) {
      rectangulo.alto = maximoEntre_Y_(-this.alto(), rectangulo.alto);
      mVertical = -1;
    } else {
      rectangulo.alto = minimoEntre_Y_(this.alto(), rectangulo.alto);
    }
  }
  // rectangulo.x += mHorizontal*(this.margenInternoIzquierdo() -2*this._grosorBorde);
  // rectangulo.y += mVertical*(this.margenInternoSuperior() - 2*this._grosorBorde);
  rectangulo.ancho -= mHorizontal*(2*this._grosorBorde +
    this.margenInternoIzquierdo() + this.margenInternoDerecho() +
    this.margenExternoIzquierdo() + this.margenExternoDerecho()
  );
  rectangulo.alto -= mVertical*(2*this._grosorBorde +
    this.margenInternoSuperior() + this.margenInternoInferior() +
    this.margenExternoSuperior() + this.margenExternoInferior()
  );
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

Mila.Pantalla._ElementoVisual.prototype.rectanguloMinimo = function(rectanguloCompleto, anchoInvertido=false, altoInvertido=false) {
  Mila.Contrato({
    Proposito: [
      "Describir el rectángulo mínimo ocupado por el elemento html asociado a este elemento visual",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [anchoInvertido, Mila.Tipo.Booleano, "Si es cierto, al minimizar hay que aumentar la coordenada x además de reducir el ancho"],
      [altoInvertido, Mila.Tipo.Booleano, "Si es cierto, al minimizar hay que aumentar la coordenada y además de reducir el alto"]
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
  if (this.ancho().esUnNumero()) {
    this._nodoHtml.style.width = `${this.ancho()}px`;
  } else if (this.ancho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar)) {
    this.MinimizarAncho(anchoInvertido, rectanguloCompleto);
  } else if (this.ancho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
    this._nodoHtml.style.width = `${rectanguloCompleto.ancho}px`;
  }
  if (this.alto().esUnNumero()) {
    this._nodoHtml.style.height = `${this.alto()}px`;
  } else if (this.alto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar)) {
    this.MinimizarAlto(altoInvertido, rectanguloCompleto);
  } else if (this.alto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
    this._nodoHtml.style.height = `${rectanguloCompleto.alto}px`;
  }
  const resultado = Mila.Geometria.areaDom_(this._nodoHtml);
  resultado.x -= this.margenExternoIzquierdo();
  resultado.y -= this.margenExternoSuperior();
  resultado.ancho += this.margenExternoDerecho();
  resultado.alto += this.margenExternoInferior();
  return resultado;
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
    resultado = this.rectanguloMinimo(resultado, rectanguloCompleto.ancho < 0, rectanguloCompleto.alto < 0);
  }
  resultado.x -= this.margenExternoIzquierdo();
  resultado.y -= this.margenExternoSuperior();
  resultado.ancho += this.margenExternoDerecho();
  resultado.alto += this.margenExternoInferior();
  return resultado;
};

Mila.Pantalla._ElementoVisual.prototype.Ocultar = function() {
  this.CambiarVisibilidadA_(false);
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.display = 'none';
  }
};

Mila.Pantalla._ElementoVisual.prototype.Mostrar = function() {
  this.CambiarVisibilidadA_(true);
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.display = 'block';
  }
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
  return Mila.Geometria.areaDom_(this._nodoHtml).ancho + this._grosorBorde +
    this.margenExternoDerecho() + this.margenExternoIzquierdo();
};

Mila.Pantalla._ElementoVisual.prototype.anchoBarraScroll = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el ancho en píxeles de la barra vertical de scroll del elemento html de este elemento visual",
      Mila.Tipo.Entero
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  return this._nodoHtml.scrollHeight > this._nodoHtml.clientHeight ? Mila.Pantalla.Constantes.grosorBarraScroll : 0;
};

Mila.Pantalla._ElementoVisual.prototype.MinimizarAncho = function(anchoInvertido, rectanguloCompleto) {
  Mila.Contrato({
    Proposito: "Minimizar el ancho del elemento html de este elemento visual",
    Parametros: [
      [anchoInvertido, Mila.Tipo.Booleano, "Si es cierto, hay que aumentar la coordenada x además de reducir el ancho"],
      [rectanguloCompleto, Mila.Tipo.Rectangulo, "Área total disponible (necesaria en el caso de que el ancho esté invertido)"]
    ],
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
  return Mila.Geometria.areaDom_(this._nodoHtml).alto + this._grosorBorde +
    this.margenExternoSuperior() + this.margenExternoInferior();
};

Mila.Pantalla._ElementoVisual.prototype.altoBarraScroll = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el alto en píxeles de la barra horizontal de scroll del elemento html de este elemento visual",
      Mila.Tipo.Entero
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  return this._nodoHtml.scrollWidth > this._nodoHtml.clientWidth ? Mila.Pantalla.Constantes.grosorBarraScroll : 0;
};

Mila.Pantalla._ElementoVisual.prototype.MinimizarAlto = function(altoInvertido, rectanguloCompleto) {
  Mila.Contrato({
    Proposito: "Minimizar el alto del elemento html de este elemento visual",
    Parametros: [
      [altoInvertido, Mila.Tipo.Booleano, "Si es cierto, al minimizar hay que aumentar la coordenada y además de reducir el alto"],
      [rectanguloCompleto, Mila.Tipo.Rectangulo, "Área total disponible (necesaria en el caso de que el alto esté invertido)"]
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style.height = '';
};

Mila.Pantalla._ElementoVisual.prototype.visible = function() {
  Mila.Contrato({
    Proposito: [
      "Indicar si este elemento visual es visible",
      Mila.Tipo.Booleano
    ],
  });
  return this._visible;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAnchoA_ = function(nuevoAncho) {
  Mila.Contrato({
    Proposito: "Reemplazar el ancho de este elemento visual por el dado",
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
    Proposito: "Reemplazar el alto de este elemento visual por el dado",
    Parametros: [
      [nuevoAlto, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])]
    ]
  });
  this._alto = nuevoAlto.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
    ? Mila.Pantalla.ComportamientoEspacio[nuevoAlto]
    : nuevoAlto
  ;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarColorFondoA_ = function(nuevoColorFondo) {
  Mila.Contrato({
    Proposito: "Reemplazar el color de fondo de este elemento visual por el dado",
    Parametros: [
      [nuevoColorFondo, Mila.Tipo.Texto]
    ]
  });
  this._colorFondo = nuevoColorFondo;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarGrosorBordeA_ = function(nuevoGrosorBorde) {
  Mila.Contrato({
    Proposito: "Reemplazar el grosor del borde de este elemento visual por el dado",
    Parametros: [
      [nuevoGrosorBorde, Mila.Tipo.Entero]
    ]
  });
  this._grosorBorde = nuevoGrosorBorde;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarColorBordeA_ = function(nuevoColorBorde) {
  Mila.Contrato({
    Proposito: "Reemplazar el color del borde de este elemento visual por el dado",
    Parametros: [
      [nuevoColorBorde, Mila.Tipo.Texto]
    ]
  });
  this._colorBorde = nuevoColorBorde;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarMargenInternoA_ = function(nuevoMargenInterno) {
  Mila.Contrato({
    Proposito: "Reemplazar el margen interno de este elemento visual por el dado",
    Parametros: [
      [nuevoMargenInterno, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectangulo])]
    ]
  });
  this._margenInterno = nuevoMargenInterno;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarMargenExternoA_ = function(nuevoMargenExterno) {
  Mila.Contrato({
    Proposito: "Reemplazar el margen externo de este elemento visual por el dado",
    Parametros: [
      [nuevoMargenExterno, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectangulo])]
    ]
  });
  this._margenExterno = nuevoMargenExterno;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarCssAdicionalA_ = function(nuevoCss) {
  Mila.Contrato({
    Proposito: "Reemplazar el diccionario css de este elemento visual por el dado",
    Parametros: [
      [nuevoCss, Mila.Tipo.Registro]
    ]
  });
  this._css = nuevoCss;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarVisibilidadA_ = function(nuevoValorVisibilidad) {
  Mila.Contrato({
    Proposito: "Reemplazar el valor de visibilidad de este elemento visual por el dado",
    Parametros: [
      [nuevoValorVisibilidad, Mila.Tipo.Booleano]
    ]
  });
  this._visible = nuevoValorVisibilidad;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarFuncionA_ = function(nuevaFuncion) {
  Mila.Contrato({
    Proposito: "Reemplazar la función de este elemento visual por la dada",
    Parametros: [
      [nuevaFuncion, Mila.Tipo.Funcion]
    ]
  });
  this._funcion = nuevaFuncion;
  if ('_nodoHtml' in this) {
    this._nodoHtml.addEventListener('click', funcion);
    this._nodoHtml.style['cursor'] = 'pointer';
  }
};

Mila.Pantalla._ElementoVisualTextual.prototype.CambiarTextoA_ = function(nuevoTexto) {
  Mila.Contrato({
    Proposito: "Reemplazar el texto de este elemento visual textual por el dado",
    Parametros: [
      [nuevoTexto, Mila.Tipo.Texto]
    ]
  });
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.innerHTML = this._texto;
  }
};

Mila.Pantalla._ElementoVisualTextual.prototype.CambiarTamanioLetraA_ = function(nuevoTamanioLetra) {
  Mila.Contrato({
    Proposito: "Reemplazar el tamaño de letra de este elemento visual textual por el dado",
    Parametros: [
      [nuevoTamanioLetra, Mila.Tipo.Entero]
    ]
  });
  this._tamanioLetra = nuevoTamanioLetra;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style['font-size'] = `${this._tamanioLetra}pt`;
  }
};

Mila.Pantalla._ElementoVisualTextual.prototype.CambiarColorTextoA_ = function(nuevoColorTexto) {
  Mila.Contrato({
    Proposito: "Reemplazar el color de texto de este elemento visual textual por el dado",
    Parametros: [
      [nuevoColorTexto, Mila.Tipo.Texto]
    ]
  });
  this._colorTexto = nuevoColorTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.color = `${this._colorTexto}pt`;
  }
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoIzquierdo = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen interno izquierdo de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.x;
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoDerecho = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen interno derecho de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.ancho;
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoSuperior = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen interno superior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.y;
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoInferior = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen interno inferior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.alto;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoIzquierdo = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen externo izquierdo de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.x;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoDerecho = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen externo derecho de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.ancho;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoSuperior = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen externo superior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.y;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoInferior = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el valor de margen externo inferior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.alto;
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

Mila.Pantalla._ElementoVisual.prototype.InicializarHtml = function() {
  Mila.Contrato({
    Proposito: "Inicializar el nodo Html de este elemento visual",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style.border = `solid ${this._grosorBorde}px ${this._colorBorde}`;
  this._nodoHtml.style['background-color'] = this._colorFondo;
  this._nodoHtml.style['padding-left'] = `${this.margenInternoIzquierdo()}px`;
  this._nodoHtml.style['padding-right'] = `${this.margenInternoDerecho()}px`;
  this._nodoHtml.style['padding-top'] = `${this.margenInternoSuperior()}px`;
  this._nodoHtml.style['padding-bottom'] = `${this.margenInternoInferior()}px`;
  this._nodoHtml.style['margin-left'] = `${this.margenExternoIzquierdo()}px`;
  this._nodoHtml.style['margin-right'] = `${this.margenExternoDerecho()}px`;
  this._nodoHtml.style['margin-top'] = `${this.margenExternoSuperior()}px`;
  this._nodoHtml.style['margin-bottom'] = `${this.margenExternoInferior()}px`;
  for (let k in this._css) {
    this._nodoHtml.style[k] = this._css[k];
  }
  if (!this._visible) {
    this._nodoHtml.style.display = 'none';
  }
  if ('_funcion' in this) {
    this._nodoHtml.addEventListener('click', this._funcion);
    this._nodoHtml.style['cursor'] = 'pointer';
  }
};

Mila.Pantalla._ElementoVisualTextual.prototype.InicializarHtml = function() {
  Mila.Contrato({
    Proposito: "Inicializar el nodo Html de este elemento visual textual",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual textual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style['font-size'] = `${this._tamanioLetra}pt`;
  this._nodoHtml.style.color = this._colorTexto;
  Mila.Pantalla._ElementoVisual.prototype.InicializarHtml.call(this);
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
  const rectangulo = Mila.Geometria.rectanguloEn__De_x_(0,0,window.innerWidth, window.innerHeight);
  rectangulo.ancho -= Mila.Pantalla.Constantes.offsetVentana;
  rectangulo.alto -= Mila.Pantalla.Constantes.offsetVentana;
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
    if (this.scrolleable) {
      // No vale la pena dividir el espacio
      return rectangulo;
    }
    let nuevoRectangulo = rectangulo.copia();
    nuevoRectangulo[limite.dimension] = nuevoRectangulo[limite.dimension] / cantidad;
    if (this.invertida()) {
      nuevoRectangulo[limite.coordenada] = rectangulo[limite.coordenada] + rectangulo[limite.dimension];
      nuevoRectangulo[limite.dimension] = -nuevoRectangulo[limite.dimension];
    }
    return nuevoRectangulo;
  };
  this.RecortarRectangulo = function(completo, ocupado) {
    if (ocupado[limite.dimension] > completo[limite.dimension]) {
      // Es más grande que el espacio disponible
      this.scrolleable = true;
    } else {
      completo[limite.dimension] -= ocupado[limite.dimension];
    }
    if (!this.invertida()) {
      completo[limite.coordenada] += ocupado[limite.dimension];
    } else if (this.scrolleable) {
      // Advertencia: no se puede mostrar correctamente porque se están cargando de abajo hacia arriba y no alcanza el espacio
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
  this.scrolleable = false;
  while (elementosRestantes.longitud() > 0 && !this.scrolleable) {
    let rectanguloActual = this.DividirRectangulo(rectanguloRestante, elementosRestantes.longitud());
    this.RecortarRectangulo(rectanguloRestante, elementosRestantes[0].Redimensionar(rectanguloActual));
    elementosRestantes = elementosRestantes.sinElPrimero();
    this.i++;
  }
  if (this.scrolleable) { // Tengo que repetir pero minimizando los elementos que se maximizan
    elementosRestantes = elementos;
    rectanguloRestante = rectangulo.copia();
    if (this.eje.esIgualA_(Mila.Pantalla.Eje.Horizontal)) {
      rectanguloRestante.CambiarAnchoA_(Infinity);
      rectanguloRestante.CambiarAltoA_(rectanguloRestante.alto - Mila.Pantalla.Constantes.grosorBarraScroll);
    } else {
      rectanguloRestante.CambiarAltoA_(Infinity);
      rectanguloRestante.CambiarAnchoA_(rectanguloRestante.ancho - Mila.Pantalla.Constantes.grosorBarraScroll);
    }
    this.i = 0;
    while (elementosRestantes.longitud() > 0) {
      let restaurar = [];
      if (this.eje.esIgualA_(Mila.Pantalla.Eje.Horizontal) && elementosRestantes[0].ancho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
        elementosRestantes[0].CambiarAnchoA_(Mila.Pantalla.ComportamientoEspacio.Minimizar);
        restaurar.push(function(elemento) {
          elemento.CambiarAnchoA_(Mila.Pantalla.ComportamientoEspacio.Maximizar);
        });
      }
      if (this.eje.esIgualA_(Mila.Pantalla.Eje.Vertical) && elementosRestantes[0].alto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
        elementosRestantes[0].CambiarAltoA_(Mila.Pantalla.ComportamientoEspacio.Minimizar);
        restaurar.push(function(elemento) {
          elemento.CambiarAltoA_(Mila.Pantalla.ComportamientoEspacio.Maximizar);
        });
      }
      this.RecortarRectangulo(rectanguloRestante, elementosRestantes[0].Redimensionar(rectanguloRestante));
      for (let f of restaurar) {
        f(elementosRestantes[0]);
      }
      elementosRestantes = elementosRestantes.sinElPrimero();
      this.i++;
    }
  }
  delete this.i;
};

Mila.Pantalla._solicitudesRedimension = 0;
Mila.Pantalla._ProgramarRedimension = function(nodo) {
  Mila.Pantalla._solicitudesRedimension++;
  nodo.addEventListener('load', Mila.Pantalla._cargadoNodoQueRequiereRedimensionar);
};

Mila.Pantalla._cargadoNodoQueRequiereRedimensionar = function() {
  Mila.Pantalla._solicitudesRedimension--;
  if (Mila.Pantalla._solicitudesRedimension == 0) {
    Mila.Pantalla._Redimensionar();
  }
};

Mila.Pantalla.Aviso = function(mensaje) {
  alert(mensaje);
};

Mila.Tipo.Registrar({
  nombre:'Disposicion',
  prototipo: Mila.Pantalla._Disposicion
});

Mila.Tipo.Registrar({
  nombre:'ElementoVisual',
  prototipo: Mila.Pantalla._ElementoVisual
});