Mila.Módulo({
  necesita:["../tipo","../lista","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosPanel',
  es: {
    "?elementos":Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)]),
    "?disposicion":Mila.Tipo.O([
      Mila.Tipo.Disposicion,
      Mila.Pantalla.ClaveDisposicion,
      Mila.Tipo.Nada // Se espera que los elementos se organicen por su cuenta (es decir, que incluyan
        // los campos correspondientes a la posición y al tamaño, o se ubicarán en el origen ocupando
        // todo el espacio disponible).
    ])
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoPanel = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo panel a partir de los atributos dados",
      Mila.Tipo.Panel
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosPanel]
    ]
  });
  let nuevoPanel = new Mila.Pantalla._Panel();
  nuevoPanel.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar
  });
  nuevoPanel.CambiarElementosA_('elementos' in atributos
    ? atributos.elementos
    : []
  );
  nuevoPanel.CambiarDisposicionA_('disposicion' in atributos
    ? atributos.disposicion
    : Mila.Pantalla.DisposicionVertical
  );
  return nuevoPanel;
};

Mila.Pantalla._Panel = function Panel() {};
Object.setPrototypeOf(Mila.Pantalla._Panel.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Panel.prototype.AgregarElemento_ = function(nuevoElemento) {
  Mila.Contrato({
    Proposito: "Agregar el elemento dado a este panel",
    Parametros: [
      [nuevoElemento, Mila.Tipo.ElementoVisual]
    ]
  });
  nuevoElemento._elementoMadre = this;
  this._elementos.push(nuevoElemento);
  this._cambióElContenido = true;
  if ('_nodoHtml' in this) {
    nuevoElemento.PlasmarEnHtml(this._nodoHtml);
    Mila.Pantalla._SolicitarRedimensión();
  }
};

Mila.Pantalla._Panel.prototype.CambiarElementosA_ = function(nuevosElementos) {
  Mila.Contrato({
    Proposito: "Reemplazar los elementos de a este panel por los dados",
    Parametros: [
      [nuevosElementos, Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)])]
    ]
  });
  for (let e of this._elementos || []) {
    e._elementoMadre = Mila.Nada;
  }
  if ('_nodoHtml' in this) {
    for (let e of this._elementos || []) {
      e.QuitarDelHtml();
    }
  }
  this._elementos = nuevosElementos.esUnaLista() ? nuevosElementos : [nuevosElementos];
  for (let e of this._elementos) {
    e._elementoMadre = this;
  }
  this._cambióElContenido = true;
  if ('_nodoHtml' in this) {
    for (let e of this._elementos) {
      e.PlasmarEnHtml(this._nodoHtml);
    }
    Mila.Pantalla._SolicitarRedimensión();
  }
};

Mila.Pantalla._Panel.prototype.CambiarDisposicionA_ = function(nuevaDisposicion) {
  Mila.Contrato({
    Proposito: "Reemplazar la disposición de a este panel por la dada",
    Parametros: [
      [nuevaDisposicion, Mila.Tipo.O([Mila.Pantalla.ClaveDisposicion, Mila.Tipo.Disposicion])]
    ]
  });
  this._disposicion = (nuevaDisposicion.esDeTipo_(Mila.Pantalla.ClaveDisposicion)
    ? Mila.Pantalla[`Disposicion${nuevaDisposicion}`]
    : nuevaDisposicion
  );
  this._cambióElContenido = true;
};

Mila.Pantalla._Panel.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este panel en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('div');
    this._nodoHtml.style.margin = '0';
    this._nodoHtml.style.padding = '0';
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style.overflow = 'auto';
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
    for (let elemento of this._elementos) {
      elemento.PlasmarEnHtml(this._nodoHtml);
    }
  }
};

Mila.Pantalla._Panel.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar este panel del documento html",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ]
  });
  for (let elemento of this._elementos) {
    elemento.QuitarDelHtml();
  }
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Panel.prototype._RedimensionarContenidoInternoEn_ = function(rectánguloExterno) {
  Mila.Contrato({
    Propósito: "Redimensiona el contenido interno de este panel para que entre en el rectángulo dado.",
    Parámetros: [
      [rectánguloExterno, Mila.Tipo.Rectángulo]
    ]
  });
  let rectánguloInterno = this._rectánguloInternoParaExterno_(rectánguloExterno);
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.height = `${Math.abs(rectánguloInterno.alto)}px`;
    this._nodoHtml.style.width = `${Math.abs(rectánguloInterno.ancho)}px`;
  }
  if (rectánguloInterno.ancho < 0) {
    rectánguloInterno.x = -rectánguloInterno.ancho;
  } else {
    rectánguloInterno.x = this.margenInternoIzquierdo();
  }
  if (rectánguloInterno.alto < 0) {
    rectánguloInterno.y = -rectánguloInterno.alto;
  } else {
    rectánguloInterno.y = this.margenInternoSuperior();
  }
  if (this._disposicion.esAlgo()) {
    this._disposicion.OrganizarElementos_En_(this._elementos, rectánguloInterno);
  } else {
    this._elementos.conCadaUno(x => x.Redimensionar(rectánguloInterno));
  }
};

Mila.Pantalla._Panel.prototype._ReposicionarContenidoInternoDe_A_ = function(rectánguloAnterior, rectánguloNuevo) {
  Mila.Contrato({
    Propósito: "Reposiciona el contenido interno de este panel tras haber cambiado su área desde el primer rectángulo dado al segundo rectángulo dado.",
    Parámetros: [
      [rectánguloAnterior, Mila.Tipo.Rectángulo]
      [rectánguloNuevo, Mila.Tipo.Rectángulo]
    ]
  });
  const inicioYAnterior = rectánguloAnterior.y + Math.min(rectánguloAnterior.alto, 0);
  const inicioYActual = rectánguloNuevo.y + Math.min(rectánguloNuevo.alto, 0);
  if (!this._enDisposiciónVerticalInverida && inicioYAnterior != inicioYActual) {
    this._elementos.conCadaUno(function(elemento) {
      elemento._posiciónY -= (inicioYActual - inicioYAnterior);
      if ('_nodoHtml' in elemento) {
        elemento._nodoHtml.style.top = `${elemento._posiciónY}px`;
      }
    });
  }
  const inicioXAnterior = rectánguloAnterior.x + Math.min(rectánguloAnterior.ancho, 0);
  const inicioXActual = rectánguloNuevo.x + Math.min(rectánguloNuevo.ancho, 0);
  if (!this._enDisposiciónHorizontalInvertida && inicioXAnterior != inicioXActual) {
    this._elementos.conCadaUno(function(elemento) {
      elemento._posiciónX -= (inicioXActual - inicioXAnterior);
      if ('_nodoHtml' in elemento) {
        elemento._nodoHtml.style.left = `${elemento._posiciónX}px`;
      }
    });
  }
};

Mila.Pantalla._Panel.prototype._MinimizarAnchoDeRectángulo_ = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: "Minimiza el ancho del rectángulo dado para que entre este panel. También lo adapta para que sea positivo.",
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  Mila.Pantalla._ElementoVisual.prototype._MinimizarAnchoDeRectángulo_.call(this, rectánguloCompleto);
  for (let elemento of this._elementos) {
    let redimensiónAnterior = elemento._últimaRedimensión.resultado.copia();
    redimensiónAnterior.ancho = rectánguloCompleto.ancho - this.todosLosMárgenesHorizontales();
    if (this._enDisposiciónHorizontalInvertida) {
      redimensiónAnterior.y = 0;
    }
    elemento.Redimensionar(redimensiónAnterior);
  }
};

Mila.Pantalla._Panel.prototype._MinimizarAltoDeRectángulo_ = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: "Minimiza el alto del rectángulo dado para que entre este panel. También lo adapta para que sea positivo.",
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  Mila.Pantalla._ElementoVisual.prototype._MinimizarAltoDeRectángulo_.call(this, rectánguloCompleto);
  for (let elemento of this._elementos) {
    let redimensiónAnterior = elemento._últimaRedimensión.resultado.copia();
    redimensiónAnterior.alto = rectánguloCompleto.alto - this.todosLosMárgenesVerticales();
    if (this._enDisposiciónVerticalInverida) {
      redimensiónAnterior.y = 0;
    }
    elemento.Redimensionar(redimensiónAnterior);
  }
};

Mila.Pantalla._Panel.prototype._anchoMínimo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el ancho mínimo que necesita este panel. Inlcuye el margen externo (el 'margin'), el borde y el margen interno (el 'padding').",
      Mila.Tipo.Entero
    ],
  });
  return this.altoBarraScroll() + (this._elementos.esVacia()
    ? 0
    : (this._disposicion.esAlgo()
      ? (this._disposicion.eje == Mila.Pantalla.Eje.Vertical
        ? this._elementos.transformados(x=>x._anchoMínimoExterno()).maximo()
        : this._elementos.transformados(x=>x._anchoMínimoExterno()).fold((x,y)=>x+y,0)
      ) : this._elementos.transformados(x=>
        (this._enDisposiciónHorizontalInvertida ? 0 : x.posiciónX()) + x._anchoMínimoExterno()).maximo()
    )
  );
};

Mila.Pantalla._Panel.prototype._altoMínimo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el alto mínimo de este panel. Inlcuye el margen externo (el 'margin'), el borde y el margen interno (el 'padding').",
      Mila.Tipo.Entero
    ],
  });
  return this.altoBarraScroll() + (this._elementos.esVacia()
    ? 0
    : (this._disposicion.esAlgo()
      ? (this._disposicion.eje == Mila.Pantalla.Eje.Horizontal
        ? this._elementos.transformados(x=>x._altoMínimoExterno()).maximo()
        : this._elementos.transformados(x=>x._altoMínimoExterno()).fold((x,y)=>x+y,0)
      ) : this._elementos.transformados(x=>
        (this._enDisposiciónVerticalInverida ? 0 : x.posiciónY()) + x._altoMínimoExterno()).maximo()
    )
  );
};

Mila.Tipo.Registrar({
  nombre:'Panel',
  prototipo: Mila.Pantalla._Panel,
  subtipoDe: Mila.Tipo.ElementoVisual
});