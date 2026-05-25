Mila.Módulo({
  define:"Mila.Pantalla",
  usa:["base","pantalla/panel"],
  necesita:["tipo","geometria"]
});

/* Notas:
  - Mila.Geometria.áreaDom_ devuelve el área que incluye el contenido, los márgenes interiores (el 'padding') y
      los bordes. No incluye los márgenes exteriores (el 'margin').
  - Las posiciones (x e y) y dimensiones (ancho y alto) de los elementos visuales se consideran para el
      contenido, incluyendo sus márgenes interiores (el 'padding') pero no sus bordes ni sus márgenes
      exteriores (el 'margin').
  - ...
*/

Mila.Pantalla._pantallas = {};
Mila.Pantalla._pantallaActual = Mila.Nada;

Mila.Pantalla.Constantes = {
  grosorBarraScroll: 18.5,
  offsetVentana: 2 // Ojo: En Firefox es 3
};

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
    "?posiciónX":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada]),
    "?posiciónY":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada]),
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?colorFondo":Mila.Tipo.Texto,
    "?grosorBorde":Mila.Tipo.Entero,
    "?colorBorde":Mila.Tipo.Texto, // ¿Color?
    "?margenInterno":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectángulo]),
    "?margenExterno":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectángulo]),
    "?cssAdicional":Mila.Tipo.Registro,
    "?visible":Mila.Tipo.Booleano,
    "?funcion":Mila.Tipo.Funcion, // Este elemento queda ligado a this
    "?destino":Mila.Tipo.Texto
  },
  inferible: false
});

Mila.Pantalla.AtributosElementoVisualPorDefecto = {
  posiciónX:Mila.Nada,
  posiciónY:Mila.Nada,
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
    Propósito: "Inicializar este elemento visual asignando sus campos básicos",
    Parámetros: [
      [atributos, Mila.Tipo.AtributosElementoVisual],
      [porDefecto, Mila.Tipo.AtributosElementoVisual]
    ]
  });
  const todosLosAtributos = Object.assign({}, Mila.Pantalla.AtributosElementoVisualPorDefecto, porDefecto, atributos);
  this.CambiarPosiciónXA_(todosLosAtributos.posiciónX);
  this.CambiarPosiciónYA_(todosLosAtributos.posiciónY);
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
    funcion = atributos.funcion.bind(this);
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
  this._elementoMadre = Mila.Nada;
  this._idÚnico = Mila.Pantalla.nuevoId();
  Mila.Pantalla.mapaElementos[this._idÚnico] = this;
};

Mila.Pantalla._ElementoVisual.prototype.atributos = function() {
  Mila.Contrato({
    Propósito: ["Describir los atributos de este elemento visual", Mila.Tipo.AtributosElementoVisual]
  });
  const atributos = {
    posiciónX:this.comportamientoPosiciónX(),
    posiciónY:this.comportamientoPosiciónY(),
    ancho:this.comportamientoAncho(),
    alto:this.comportamientoAlto(),
    colorFondo:this._colorFondo,
    grosorBorde:this._grosorBorde,
    colorBorde:this._colorBorde,
    margenInterno:this._margenInterno,
    margenExterno:this._margenExterno,
    cssAdicional:this._css,
    visible:this.visible()
  };
  if ('_funcion' in this) {
    atributos.funcion = this._funcion;
  }
  return atributos;
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
    Propósito: "Inicializar este elemento visual textual asignando sus campos básicos",
    Parámetros: [
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
};

Mila.Pantalla._ElementoVisualTextual.prototype.atributos = function() {
  Mila.Contrato({
    Propósito: ["Describir los atributos de este elemento visual textual", Mila.Tipo.AtributosElementoArrastrable]
  });
  return Object.assign({
    tamanioLetra: this._tamanioLetra,
    colorTexto: this._colorTexto
  }, Mila.Pantalla._ElementoVisual.prototype.atributos.call(this));
};

Mila.Pantalla._ElementoVisual.prototype.Redimensionar = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: [
      "Redimensionar este elemento visual para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  this._anchoDependeDeHtml = false;
  this._altoDependeDeHtml = false;
  const rectánguloExterno = this._rectánguloExterno_AjustadoPorConstantes(rectánguloCompleto);
  this._RedimensionarContenidoInternoEn_(rectánguloExterno);
  this._AjustarRectánguloExterno_AContenido(rectánguloExterno);
  const rectánguloInterno = this._rectánguloInternoParaExterno_(rectánguloExterno);
  this._posiciónX = rectánguloInterno.x;
  this._posiciónY = rectánguloInterno.y;
  this._alto = rectánguloInterno.alto;
  this._ancho = rectánguloInterno.ancho;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.left = `${rectánguloExterno.x}px`;
    this._nodoHtml.style.top = `${rectánguloExterno.y}px`;
    this._nodoHtml.style.width = (this._anchoDependeDeHtml ? '' : `${this._ancho}px`);
    this._nodoHtml.style.height = (this._altoDependeDeHtml ? '' :`${this._alto}px`);
  }
  this._últimaRedimensión = rectánguloExterno;
  return rectánguloExterno;
};

Mila.Pantalla._ElementoVisual.prototype._rectánguloExterno_AjustadoPorConstantes = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: [
      "Describir el rectángulo externo que este elemento visual podría llegar a ocupar limitado al rectángulo dado y ajustado únicamente por constantes (es decir, no tiene en cuenta los campos cuyos valores son 'Maximizar' o 'Minimizar'). Si el rectángulo dado es negativo en alguna de sus dimensiones, el resultado también lo es.",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  let rectángulo = rectánguloCompleto.copia();
  if (this.comportamientoPosiciónX().esUnNumero()) {
    let límiteHorizontal = (rectángulo.ancho < 0)
      ? rectángulo.x
      : rectángulo.x + rectángulo.ancho
    ;
    rectángulo.x = this.comportamientoPosiciónX()
      - this._grosorBorde
      - this.margenExternoIzquierdo();
    rectángulo.ancho = límiteHorizontal - rectángulo.x;
  }
  if (this.comportamientoPosiciónY().esUnNumero()) {
    let límiteVertical = (rectángulo.alto < 0)
      ? rectángulo.y
      : rectángulo.y + rectángulo.alto
    ;
    rectángulo.y = this.comportamientoPosiciónY()
      - this._grosorBorde
      - this.margenExternoSuperior();
    rectángulo.alto = límiteVertical - rectángulo.y;
  }
  if (this.comportamientoAncho().esUnNumero()) {
    if (rectángulo.ancho < 0) {
      rectángulo.ancho = maximoEntre_Y_(
        rectángulo.ancho,
        -(this.comportamientoAncho() + this.todosLosMárgenesHorizontales())
      );
    } else {
      rectángulo.ancho = minimoEntre_Y_(
        rectángulo.ancho,
        this.comportamientoAncho() + this.todosLosMárgenesHorizontales()
      );
    }
  }
  if (this.comportamientoAlto().esUnNumero()) {
    if (rectángulo.alto < 0) {
      rectángulo.alto = maximoEntre_Y_(
        rectángulo.alto,
        -(this.comportamientoAlto() + this.todosLosMárgenesVerticales())
      );
    } else {
      rectángulo.alto = minimoEntre_Y_(
        rectángulo.alto,
        this.comportamientoAlto() + this.todosLosMárgenesVerticales()
      );
    }
  }
  return rectángulo;
};

Mila.Pantalla._ElementoVisual.prototype._RedimensionarContenidoInternoEn_ = function(rectánguloExterno) {
  Mila.Contrato({
    Propósito: "Redimensiona el contenido interno de este elemento visual para que entre en el rectángulo dado. Cada subtipo debería implementar su propia versión de este procedimiento.",
    Parámetros: [
      [rectánguloExterno, Mila.Tipo.Rectángulo]
    ]
  });
  // No hace nada (responsabilidad del subtipo)
};

Mila.Pantalla._ElementoVisual.prototype._AjustarRectánguloExterno_AContenido = function(rectánguloExterno) {
  Mila.Contrato({
    Propósito: "Ajusta el rectángulo externo dado en función de los comportamientos ('Maximizar' o 'Minimizar') en cada dimensión de este elemento visual y su contenido interno. También lo adapta para que sea positivo en ambas dimensiones.",
    Parámetros: [
      [rectánguloExterno, Mila.Tipo.Rectángulo]
    ]
  });
  if (
    this.comportamientoAncho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar) ||
    (
      this.comportamientoAncho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar) &&
      !isFinite(rectánguloExterno.ancho)
    )
  ) {
    this._MinimizarAnchoDeRectángulo_(rectánguloExterno);
  } else if (rectánguloExterno.ancho < 0) {
    rectánguloExterno.x += rectánguloExterno.ancho;
    rectánguloExterno.ancho = Math.abs(rectánguloExterno.ancho);
  }
  if (
    this.comportamientoAlto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Minimizar) ||
    (
      this.comportamientoAlto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar) &&
      !isFinite(rectánguloExterno.alto)
    )
  ) {
    this._MinimizarAltoDeRectángulo_(rectánguloExterno);
  } else if (rectánguloExterno.alto < 0) {
    rectánguloExterno.y += rectánguloExterno.alto;
    rectánguloExterno.alto = Math.abs(rectánguloExterno.alto);
  }
};

Mila.Pantalla._ElementoVisual.prototype._MinimizarAnchoDeRectángulo_ = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: "Minimiza el ancho del rectángulo dado para que entre este elemento visual. También lo adapta para que sea positivo.",
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  const anchoMínimo = this._anchoMínimoExterno();
  if (rectánguloCompleto.ancho < 0) {
    rectánguloCompleto.x = rectánguloCompleto.x - anchoMínimo;
  }
  rectánguloCompleto.ancho = anchoMínimo;
};

Mila.Pantalla._ElementoVisual.prototype._MinimizarAltoDeRectángulo_ = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: "Minimiza el alto del rectángulo dado para que entre este elemento visual. También lo adapta para que sea positivo.",
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  const altoMínimo = this._altoMínimoExterno();
  if (rectánguloCompleto.alto < 0) {
    rectánguloCompleto.y = rectánguloCompleto.y - altoMínimo;
  }
  rectánguloCompleto.alto = altoMínimo;
};

Mila.Pantalla._ElementoVisual.prototype._rectánguloInternoParaExterno_ = function(rectánguloExterno) {
  Mila.Contrato({
    Propósito: [
      "Describir el rectángulo interno de este elemento visual cuando se lo limita al rectángulo externo dado.",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [rectánguloExterno, Mila.Tipo.Rectángulo]
    ]
  });
  let rectángulo = rectánguloExterno.copia();
  let mHorizontal = (rectángulo.ancho > 0 ? 1 : -1);
  let mVertical = (rectángulo.alto > 0 ? 1 : -1);
  rectángulo.x += mHorizontal*
    (this.margenExternoIzquierdo() + this._grosorBorde + this.margenInternoIzquierdo());
  rectángulo.y += mVertical*
    (this.margenExternoSuperior() + this._grosorBorde + this.margenInternoSuperior());
  rectángulo.ancho -= mHorizontal* (
    this.margenExternoIzquierdo() + this.margenExternoDerecho() +
    2*this._grosorBorde + this.margenInternoIzquierdo() + this.margenInternoDerecho()
  );
  rectángulo.alto -= mVertical* (
    this.margenExternoSuperior() + this.margenExternoInferior() +
    2*this._grosorBorde + this.margenInternoSuperior() + this.margenInternoInferior()
  );
  return rectángulo;
};

Mila.Pantalla._ElementoVisual.prototype.Ocultar = function() {
  this.CambiarVisibilidadA_(false);
};

Mila.Pantalla._ElementoVisual.prototype.Mostrar = function() {
  this.CambiarVisibilidadA_(true);
};

Mila.Pantalla._ElementoVisual.prototype.comportamientoPosiciónX = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el comportamiento de la posición en el eje X de este elemento visual.\
        Puede ser un número o nada.",
      Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Nada])
    ],
  });
  return this._comportamientoPosiciónX;
};

Mila.Pantalla._ElementoVisual.prototype.posiciónX = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la posición en el eje X de este elemento visual.",
      Mila.Tipo.Entero
    ],
  });
  return this._posiciónX;
};

Mila.Pantalla._ElementoVisual.prototype.posiciónXEnPantalla = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la posición en el eje X de este elemento visual respecto al origen de la pantalla .",
      Mila.Tipo.Entero
    ],
  });
  return this._posiciónX + (this._elementoMadre.esAlgo() ? this._elementoMadre.posiciónXEnPantalla() : 0);
};

Mila.Pantalla._ElementoVisual.prototype.comportamientoPosiciónY = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el comportamiento de la posición en el eje Y de este elemento visual.\
        Puede ser un número o nada.",
      Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Nada])
    ],
  });
  return this._comportamientoPosiciónY;
};

Mila.Pantalla._ElementoVisual.prototype.posiciónY = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la posición en el eje Y de este elemento visual respecto a su elemento madre.",
      Mila.Tipo.Entero
    ],
  });
  return this._posiciónY;
};

Mila.Pantalla._ElementoVisual.prototype.posiciónYEnPantalla = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la posición en el eje Y de este elemento visual respecto al origen de la pantalla .",
      Mila.Tipo.Entero
    ],
  });
  return this._posiciónY + (this._elementoMadre.esAlgo() ? this._elementoMadre.posiciónYEnPantalla() : 0);
};

Mila.Pantalla._ElementoVisual.prototype.comportamientoAncho = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el comportamiento del ancho de este elemento visual.\
        Puede ser un número, un comportamiento (maximizar o minimizar) o nada.",
      Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Tipo.Nada])
    ],
  });
  return this._comportamientoAncho;
};

Mila.Pantalla._ElementoVisual.prototype.ancho = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el ancho de este elemento visual.",
      Mila.Tipo.Entero
    ],
  });
  if (this.comportamientoAncho().esUnNumero()) {
    return this.comportamientoAncho();
  }
  if ('_nodoHtml' in this) {
    this._anchoDependeDeHtml = true;
    return this.anchoHtml();
  }
  return this._ancho;
};

Mila.Pantalla._ElementoVisual.prototype._anchoMínimo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el ancho mínimo de este elemento visual. Cada subtipo debería implementar su propia versión de esta función.",
      Mila.Tipo.Entero
    ],
  });
  // Describe lo mismo que ancho (responsabilidad del subtipo)
  return this.ancho();
};

Mila.Pantalla._ElementoVisual.prototype._anchoMínimoExterno = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el ancho mínimo de este elemento visual. Inlcuye el margen externo (el 'margin'), el borde y el margen interno (el 'padding').",
      Mila.Tipo.Entero
    ],
  });
  return this._anchoMínimo() + this.todosLosMárgenesHorizontales();
  ;
};

Mila.Pantalla._ElementoVisual.prototype.anchoHtml = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el ancho en píxeles del elemento html de este elemento visual. No incluye ningún margen.",
      Mila.Tipo.Entero
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  return Mila.Geometria.áreaDom_(this._nodoHtml).ancho - 2*this._grosorBorde
    - this.margenInternoDerecho() - this.margenInternoIzquierdo();
};

Mila.Pantalla._ElementoVisual.prototype.anchoBarraScroll = function() {
  Mila.Contrato({
    Propósito: [
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

Mila.Pantalla._ElementoVisual.prototype.comportamientoAlto = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el comportamiento del alto de este elemento visual.\
        Puede ser un número, un comportamiento (maximizar o minimizar) o nada.",
      Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Tipo.Nada])
    ],
  });
  return this._comportamientoAlto
};

Mila.Pantalla._ElementoVisual.prototype.alto = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el alto de este elemento visual.",
      Mila.Tipo.Entero
    ],
  });
  if (this.comportamientoAlto().esUnNumero()) {
    return this.comportamientoAlto();
  }
  if ('_nodoHtml' in this) {
    this._altoDependeDeHtml = true;
    return this.altoHtml();
  }
  return this._alto;
};

Mila.Pantalla._ElementoVisual.prototype._altoMínimo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el alto mínimo de este elemento visual. Cada subtipo debería implementar su propia versión de esta función.",
      Mila.Tipo.Entero
    ],
  });
  // Describe lo mismo que alto (responsabilidad del subtipo)
  return this.alto();
};

Mila.Pantalla._ElementoVisual.prototype._altoMínimoExterno = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el alto mínimo de este elemento visual. Inlcuye el margen externo (el 'margin'), el borde y el margen interno (el 'padding').",
      Mila.Tipo.Entero
    ],
  });
    return this._altoMínimo() + this.todosLosMárgenesVerticales();
};

Mila.Pantalla._ElementoVisual.prototype.altoHtml = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el alto en píxeles del elemento html de este elemento visual. No incluye ningún margen.",
      Mila.Tipo.Entero
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este elemento visual",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  return Mila.Geometria.áreaDom_(this._nodoHtml).alto - 2*this._grosorBorde
    - this.margenInternoSuperior() + this.margenInternoInferior();
};

Mila.Pantalla._ElementoVisual.prototype.altoBarraScroll = function() {
  Mila.Contrato({
    Propósito: [
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

Mila.Pantalla._ElementoVisual.prototype.visible = function() {
  Mila.Contrato({
    Propósito: [
      "Indicar si este elemento visual es visible",
      Mila.Tipo.Booleano
    ],
  });
  return this._visible;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarPosiciónXA_ = function(nuevaPosiciónX) {
  Mila.Contrato({
    Propósito: "Reemplazar (el comportamiento para) la posición X de este elemento visual por la dada",
    Parámetros: [
      [nuevaPosiciónX, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada])]
    ]
  });
  this._comportamientoPosiciónX = nuevaPosiciónX;
  this._posiciónX = Mila.Tipo.esNada(nuevaPosiciónX) ? 0 : nuevaPosiciónX;
  // TODO: Si es Nada, redimensionar
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.left = Mila.Tipo.esNada(nuevaPosiciónX) ? '' : `${nuevaPosiciónX}px`;
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarPosiciónYA_ = function(nuevaPosiciónY) {
  Mila.Contrato({
    Propósito: "Reemplazar la posición Y de este elemento visual por la dada",
    Parámetros: [
      [nuevaPosiciónY, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada])]
    ]
  });
  this._comportamientoPosiciónY = nuevaPosiciónY;
  this._posiciónY = Mila.Tipo.esNada(nuevaPosiciónY) ? 0 : nuevaPosiciónY;
  // TODO: Si es Nada, redimensionar
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.top = Mila.Tipo.esNada(nuevaPosiciónY) ? '' : `${nuevaPosiciónY}px`;
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAnchoA_ = function(nuevoAncho) {
  Mila.Contrato({
    Propósito: "Reemplazar el ancho de este elemento visual por el dado",
    Parámetros: [
      [nuevoAncho, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])]
    ]
  });
  this._comportamientoAncho = nuevoAncho.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
    ? Mila.Pantalla.ComportamientoEspacio[nuevoAncho]
    : nuevoAncho
  ;
  this._ancho = this._comportamientoAncho.esUnNumero() ? this._comportamientoAncho : 0;
  // TODO: Si no es un número, redimensionar (creo que debería redimensionar en cualquier caso...)
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.width = this._comportamientoAncho.esUnNumero() ? `${this._comportamientoAncho}px` : '';
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarAltoA_ = function(nuevoAlto) {
  Mila.Contrato({
    Propósito: "Reemplazar el alto de este elemento visual por el dado",
    Parámetros: [
      [nuevoAlto, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])]
    ]
  });
  this._comportamientoAlto = nuevoAlto.esDeTipo_(Mila.Pantalla.ClaveComportamientoEspacio)
    ? Mila.Pantalla.ComportamientoEspacio[nuevoAlto]
    : nuevoAlto
  ;
  this._alto = this._comportamientoAlto.esUnNumero() ? this._comportamientoAlto : 0;
  // TODO: Si no es un número, redimensionar (creo que debería redimensionar en cualquier caso...)
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.height = this._comportamientoAlto.esUnNumero() ? `${this._comportamientoAlto}px` : '';
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarColorFondoA_ = function(nuevoColorFondo) {
  Mila.Contrato({
    Propósito: "Reemplazar el color de fondo de este elemento visual por el dado",
    Parámetros: [
      [nuevoColorFondo, Mila.Tipo.Texto]
    ]
  });
  this._colorFondo = nuevoColorFondo;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style['background-color'] = this._colorFondo;
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarGrosorBordeA_ = function(nuevoGrosorBorde) {
  Mila.Contrato({
    Propósito: "Reemplazar el grosor del borde de este elemento visual por el dado",
    Parámetros: [
      [nuevoGrosorBorde, Mila.Tipo.Entero]
    ]
  });
  this._grosorBorde = nuevoGrosorBorde;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style['borderWidth'] = this._grosorBorde;
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarColorBordeA_ = function(nuevoColorBorde) {
  Mila.Contrato({
    Propósito: "Reemplazar el color del borde de este elemento visual por el dado",
    Parámetros: [
      [nuevoColorBorde, Mila.Tipo.Texto]
    ]
  });
  this._colorBorde = nuevoColorBorde;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style['borderColor'] = this._colorBorde;
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarMargenInternoA_ = function(nuevoMargenInterno) {
  Mila.Contrato({
    Propósito: "Reemplazar el margen interno de este elemento visual por el dado",
    Parámetros: [
      [nuevoMargenInterno, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectángulo])]
    ]
  });
  this._margenInterno = nuevoMargenInterno;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarMargenExternoA_ = function(nuevoMargenExterno) {
  Mila.Contrato({
    Propósito: "Reemplazar el margen externo de este elemento visual por el dado",
    Parámetros: [
      [nuevoMargenExterno, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Rectángulo])]
    ]
  });
  this._margenExterno = nuevoMargenExterno;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarCssAdicionalA_ = function(nuevoCss) {
  Mila.Contrato({
    Propósito: "Reemplazar el diccionario css de este elemento visual por el dado",
    Parámetros: [
      [nuevoCss, Mila.Tipo.Registro]
    ]
  });
  this._css = nuevoCss;
};

Mila.Pantalla._ElementoVisual.prototype.CambiarVisibilidadA_ = function(nuevoValorVisibilidad) {
  Mila.Contrato({
    Propósito: "Reemplazar el valor de visibilidad de este elemento visual por el dado",
    Parámetros: [
      [nuevoValorVisibilidad, Mila.Tipo.Booleano]
    ]
  });
  this._visible = nuevoValorVisibilidad;
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.display = this._visible ? 'block' : 'none';
  }
};

Mila.Pantalla._ElementoVisual.prototype.CambiarFuncionA_ = function(nuevaFuncion) {
  Mila.Contrato({
    Propósito: "Reemplazar la función de este elemento visual por la dada",
    Parámetros: [
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
    Propósito: "Reemplazar el texto de este elemento visual textual por el dado",
    Parámetros: [
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
    Propósito: "Reemplazar el tamaño de letra de este elemento visual textual por el dado",
    Parámetros: [
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
    Propósito: "Reemplazar el color de texto de este elemento visual textual por el dado",
    Parámetros: [
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
    Propósito: [
      "Describir el valor de margen interno izquierdo de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.x;
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoDerecho = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen interno derecho de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.ancho;
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoSuperior = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen interno superior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.y;
};

Mila.Pantalla._ElementoVisual.prototype.margenInternoInferior = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen interno inferior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenInterno.esUnNumero() ? this._margenInterno : this._margenInterno.alto;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoIzquierdo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen externo izquierdo de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.x;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoDerecho = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen externo derecho de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.ancho;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoSuperior = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen externo superior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.y;
};

Mila.Pantalla._ElementoVisual.prototype.margenExternoInferior = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el valor de margen externo inferior de este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return this._margenExterno.esUnNumero() ? this._margenExterno : this._margenExterno.alto;
};

Mila.Pantalla._ElementoVisual.prototype.todosLosMárgenesHorizontales = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la suma de todos lo márgenes (el externo, el borde y el interno) horizontales este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return 2*this._grosorBorde +
    this.margenExternoIzquierdo() + this.margenInternoIzquierdo() +
    this.margenExternoDerecho() + this.margenInternoDerecho()
  ;
};

Mila.Pantalla._ElementoVisual.prototype.todosLosMárgenesVerticales = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la suma de todos lo márgenes (el externo, el borde y el interno) verticales este elemento visual",
      Mila.Tipo.Entero
    ]
  });
  return 2*this._grosorBorde +
    this.margenExternoSuperior() + this.margenInternoSuperior() +
    this.margenExternoInferior() + this.margenInternoInferior()
  ;
};

Mila.Pantalla._ElementoVisual.prototype.áreaDeContenido = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el área que ocupa este elemento visual. No incluye márgenes.",
      Mila.Tipo.Rectángulo
    ]
  });
  return Mila.Geometria.rectánguloEn__De_x_(
    this.posiciónXEnPantalla(),
    this.posiciónYEnPantalla(),
    this.ancho(),
    this.alto()
  );
};

Mila.Pantalla._ElementoVisual.prototype.áreaTotal = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el área que ocupa este elemento visual. Incluye márgenes.",
      Mila.Tipo.Rectángulo
    ]
  });
  return Mila.Geometria.rectánguloEn__De_x_(
    this.posiciónXEnPantalla() - (this.margenExternoIzquierdo() + this._grosorBorde + this.margenInternoIzquierdo()),
    this.posiciónYEnPantalla() - (this.margenExternoSuperior() + this._grosorBorde + this.margenInternoSuperior()),
    this.ancho() + this.todosLosMárgenesHorizontales(),
    this.alto() + this.todosLosMárgenesVerticales()
  );
};

Mila.Pantalla._ElementoVisual.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Propósito: "Quitar este elemento visual del documento html",
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
    Propósito: "Inicializar el nodo Html de este elemento visual",
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
  this._nodoHtml.setAttribute('id', this._idÚnico);
};

Mila.Pantalla._ElementoVisualTextual.prototype.InicializarHtml = function() {
  Mila.Contrato({
    Propósito: "Inicializar el nodo Html de este elemento visual textual",
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
    Propósito: "Redimensionar los elementos visibles"
  });
  if (Mila.Pantalla._pantallaActual.esAlgo()) {
    let pantallaActual = Mila.Pantalla._pantallas[Mila.Pantalla._pantallaActual];
    pantallaActual.Redimensionar(Mila.Pantalla.rectánguloPantalla());
  }
};

Mila.Pantalla.rectánguloPantalla = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el rectángulo correspondiente a la pantalla completa",
      Mila.Tipo.Rectángulo
    ]
  });
  // TODO: distinguir el caso que esté ejecutando en node
  const rectangulo = Mila.Geometria.rectánguloEn__De_x_(0,0,window.innerWidth, window.innerHeight);
  rectangulo.ancho -= Mila.Pantalla.Constantes.offsetVentana;
  rectangulo.alto -= Mila.Pantalla.Constantes.offsetVentana;
  return rectangulo;
};

Mila.Pantalla.ancho = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el ancho en píxeles de la pantalla completa",
      Mila.Tipo.Entero
    ]
  });
  return Mila.Pantalla.rectánguloPantalla().ancho;
};

Mila.Pantalla.alto = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el alto en píxeles de la pantalla completa",
      Mila.Tipo.Entero
    ]
  });
  return Mila.Pantalla.rectánguloPantalla().alto;
};

if (Mila.entorno().enNavegador()) {
  Mila.entorno().universo.addEventListener('resize', Mila.Pantalla._Redimensionar);
}

Mila.Pantalla.nueva = function(atributos, nombre=Mila.Nada) {
  Mila.Contrato({
    Propósito: [
      "Describir una nueva pantalla. Si no se provee un nombre, se genera uno por defecto.",
      Mila.Tipo.Panel
    ],
    Parámetros: [
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
    Propósito: "Cambiar la pantalla actual a la pantalla con el nombre dado",
    Precondiciones: [
      "Existe una pantalla con el nombre dado",
      nombre in Mila.Pantalla._pantallas
    ],
    Parámetros: [
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
    Propósito: "Organizar los elementos dados en el rectángulo dado",
    Parámetros: [
      [elementos, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)],
      [rectangulo, Mila.Tipo.Rectángulo]
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
      if (this.eje.esIgualA_(Mila.Pantalla.Eje.Horizontal) && elementosRestantes[0].comportamientoAncho().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
        elementosRestantes[0].CambiarAnchoA_(Mila.Pantalla.ComportamientoEspacio.Minimizar);
        restaurar.push(function(elemento) {
          elemento.CambiarAnchoA_(Mila.Pantalla.ComportamientoEspacio.Maximizar);
        });
      }
      if (this.eje.esIgualA_(Mila.Pantalla.Eje.Vertical) && elementosRestantes[0].comportamientoAlto().esIgualA_(Mila.Pantalla.ComportamientoEspacio.Maximizar)) {
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

Mila.Pantalla.mapaElementos = {}; // Mapa de elementos por id

Mila.Pantalla.elementoDeId_ = function(idBuscado) {
  return Mila.Pantalla.mapaElementos[idBuscado];
};

Mila.Pantalla.nuevoId = function() {
  return `_${Mila.Base.nuevoIdPara_('Pantalla')}`;
};