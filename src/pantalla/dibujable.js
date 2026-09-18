// TODO: sobrescribir las funciones que modifican el estilo en el nodo (igual que con las posiciones x e y) para color de fondo, color de borde y grosor de borde. En lugar de modificar los campos background-color, border-color y border-width, que agreguen (o modifiquen si ya se agregó antes) un rectángulo y le apliquen fill, stroke y stroke-width respectivamente. También asegurarse que ninguno de estos campos (ni los nuevos ni los de las posiciones) sea asignado desde la inicialización de ElementoVisual (es decir, que no se asignen style.left, style.top, etc.).

Mila.Módulo({
  necesita:["../tipo","../pantalla"],
  usa:"../dibujo"
});

Mila.Tipo.Registrar({
  nombre:'AtributosDibujable',
  es: {
    dibujo:Mila.Tipo.Dibujo
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoDibujable = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo dibujable a partir de los atributos dados.",
      Mila.Tipo.Dibujable
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosDibujable]
    ]
  });
  let nuevoDibujable = new Mila.Pantalla._Dibujable();
  nuevoDibujable.Inicializar(atributos);
  nuevoDibujable.CambiarDibujoA_(atributos.dibujo);
  return nuevoDibujable;
};

Mila.Pantalla._Dibujable = function Dibujable() {
  this._transformación = {
    traslación:{x:0, y:0},
    rotación:{a:0, x:0, y:0},
    escala:{x:1, y:1}
  };
};
Object.setPrototypeOf(Mila.Pantalla._Dibujable.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Dibujable.prototype.CambiarDibujoA_ = function(nuevoDibujo) {
  Mila.Contrato({
    Proposito: "Reemplazar el dibujo de este dibujable por el dado.",
    Parametros: [
      [nuevoDibujo, Mila.Tipo.Dibujo]
    ]
  });
  const esteDibujable = this;
  this._dibujo = nuevoDibujo;
  Mila.Base.ReemplazarFuncion_De_Por_('CambiarEstilo_A_',nuevoDibujo, function(funciónOriginal) {
    return function(clave, nuevoValor) {
      esteDibujable.CambiarEstilo_A_(clave, nuevoValor);
      funciónOriginal.call(nuevoDibujo, clave, nuevoValor);
    };
  });
  this._hijos = (nuevoDibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Grupo))
    ? nuevoDibujo._grupo.transformados(dibujo => Mila.Pantalla.nuevoDibujable({dibujo}))
    : []
  ;
  if ('_nodoHtml' in this) {
    // TODO: REEMPLAZAR EL DIBUJO
  }
};

Mila.Pantalla._Dibujable.prototype.CambiarEstilo_A_ = function(clave, nuevoValor) {
  Mila.Contrato({
    Proposito: "Actualizar el estilo de este dibujable como consecuencia de un cambio de estilo en el dibujo asociado.",
    Parámetros: [
      [clave, Mila.Tipo.Texto], // una de las claves de EstiloDibujo
      [nuevoValor, Mila.Tipo.Cualquiera] // el que le corresponda a la clave
    ]
  });
  if ('_nodoDibujo' in this) {
    const nodoDibujo = this._nodoDibujo;
    if (clave.esIgualA_('colorBorde')) {
      nodoDibujo.setAttribute("stroke", nuevoValor);
    } else if (clave.esIgualA_('grosorBorde')) {
      nodoDibujo.setAttribute("stroke-width", nuevoValor);
    } else if (clave.esIgualA_('colorFondo')) {
      nodoDibujo.setAttribute("fill", nuevoValor);
    } else if (clave.esIgualA_('opacidadFondo')) {
      nodoDibujo.setAttribute("fill-opacity", nuevoValor);
    } else if (clave.esIgualA_('posiciónX')) {
      this._CambiarPosiciónXDeNodoHtmlA_(nuevoValor);
    } else if (clave.esIgualA_('posiciónY')) {
      this._CambiarPosiciónYDeNodoHtmlA_(nuevoValor);
    }
  }
};

Mila.Pantalla._Dibujable.prototype.dibujo = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el dibujo de este dibujable.",
      Mila.Tipo.Dibujo
    ]
  });
  return this._dibujo;
};

Mila.Pantalla._Dibujable.prototype.hijos = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la lista de hijos de este dibujable.",
      Mila.Tipo.ListaDe_(Mila.Tipo.Dibujable)
    ]
  });
  return this._hijos;
};

Mila.Pantalla._Dibujable.prototype.transformación = function() {
  Mila.Contrato({
    Propósito: [
      "Describir la transformación de este dibujable."//,
      // Transformación
    ]
  });
  return this._transformación;
};

Mila.Pantalla._Dibujable.prototype._CambiarPosiciónXDeNodoHtmlA_ = function(nuevaPosiciónX) {
  // Reemplaza la de ElementoVisual
  Mila.Contrato({
    Propósito: "Reemplazar la posición X del nodo html de este dibujo por la dada.",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este dibujo",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ],
    Parámetros: [
      [nuevaPosiciónX, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada])]
    ]
  });
  this._transformación.traslación.x = Mila.Tipo.esNada(nuevaPosiciónX) ? 0 : nuevaPosiciónX;
  this._ActualizarTransformaciónEnNodoHtml();
};

Mila.Pantalla._Dibujable.prototype._CambiarPosiciónYDeNodoHtmlA_ = function(nuevaPosiciónY) {
  // Reemplaza la de ElementoVisual
  Mila.Contrato({
    Propósito: "Reemplazar la posición Y del nodo html de este dibujo por la dada.",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este dibujo",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ],
    Parámetros: [
      [nuevaPosiciónY, Mila.Tipo.O([Mila.Tipo.Entero,Mila.Tipo.Nada])]
    ]
  });
  this._transformación.traslación.y = Mila.Tipo.esNada(nuevaPosiciónY) ? 0 : nuevaPosiciónY;
  this._ActualizarTransformaciónEnNodoHtml();
};

Mila.Pantalla._Dibujable.prototype._ActualizarTransformaciónEnNodoHtml = function() {
  Mila.Contrato({
    Proposito: "Actualizar la transformación del nodo html de este dibujable.",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este dibujo",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoDibujo.setAttribute("transform", this._transformaciónParaNodoHtml());
};

Mila.Pantalla._Dibujable.prototype._transformaciónParaNodoHtml = function() {
  Mila.Contrato({
    Proposito: [
      "Describir la descripción de la transformación para aplicar al nodo html de este dibujable.",
      Mila.Tipo.Texto
    ]
  });
  return Mila.Pantalla._transformaciónParaNodoHtmlAPartirDe_(this._transformación);
};

Mila.Pantalla._transformaciónParaNodoHtmlAPartirDe_ = function(transformación) {
  Mila.Contrato({
    Proposito: [
      "Describir la descripción de la transformación para aplicar a un nodo html a partir de la transformación dada.",
      Mila.Tipo.Texto
    ],
    Parametros: [
      transformación // Transformación
    ]
  });
  return `translate(${
    transformación.traslación.x
  } ${
    transformación.traslación.y
  }) rotate(${
    transformación.rotación.a
  } ${
    transformación.rotación.x
  } ${
    transformación.rotación.y
  }) scale(${
    transformación.escala.x
  } ${
    transformación.escala.y
  })`;
};

Mila.Pantalla._Dibujable.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este dibujable en el documento html como hijo del nodo dado.",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._transformación = Mila.Pantalla._transformaciónAPartirDeEstiloDibujo(this._dibujo.estilo());
    const nodoDibujo = Mila.Pantalla._nodoHtmlParaDibujo(this._dibujo);
    this._hijos.conCadaUno(hijo => {
      hijo.PlasmarEnHtml(nodoDibujo);
    })
    this._nodoDibujo = nodoDibujo;
    this._nodoDibujo.setAttribute("transform", Mila.Pantalla._transformaciónParaNodoHtmlAPartirDe_(this._transformación));
    if (Mila.Pantalla._es_NodoHtmlParaDibujable(nodoMadre)) {
      this._nodoHtml = nodoDibujo;
    } else {
      this._nodoHtml = Mila.Pantalla._nodoHtmlParaDibujable();
      this._nodoHtml.appendChild(nodoDibujo);
    }
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Pantalla._Dibujable.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar este dibujable del documento html.",
    Precondiciones: [
      "Se está ejecutando en el navegador.",
      Mila.entorno().enNavegador()
    ]
  });
  for (let hijo of this._hijos) {
    hijo.QuitarDelHtml();
  }
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
    delete this._nodoDibujo;
  }
};

Mila.Pantalla._transformaciónAPartirDeEstiloDibujo = function(estilo) {
  let x = 0;
  let y = 0;
  let escala = 1;
  if ('posiciónX' in estilo) {
    x += estilo.posiciónX;
  }
  if ('posiciónY' in estilo) {
    y += estilo.posiciónY;
  }
  if ('escala' in estilo) {
    escala *= estilo.escala;
  }
  return {
    traslación:{x,y}, rotación:{a:0, x:0, y:0}, escala:{x:escala, y:escala}
  };
};

Mila.Pantalla._nodoHtmlParaDibujo = function(dibujo) {
  Mila.Contrato({
    Proposito: "Describir un nodo html para el dibujo dado.",
      // Tipo nodo dom
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      [dibujo, Mila.Tipo.Dibujo]
    ]
  });
  let clase = Mila.Nada;
  if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Rectángulo)) {
    clase = 'rect';
  } else if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Círculo)) {
    clase = 'circle';
  } else if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.RutaSvg)) {
    clase = 'path';
  } else /* if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Grupo)) */ {
    clase = 'g';
  }
  const nodoDibujo = document.createElementNS("http://www.w3.org/2000/svg", clase);
  const estilo = dibujo.estilo();
  if ('colorBorde' in estilo) {
    nodoDibujo.setAttribute("stroke", estilo.colorBorde);
  }
  if ('grosorBorde' in estilo) {
    nodoDibujo.setAttribute("stroke-width", estilo.grosorBorde);
  }
  if ('colorFondo' in estilo) {
    nodoDibujo.setAttribute("fill", estilo.colorFondo);
  }
  if ('opacidadFondo' in estilo) {
    nodoDibujo.setAttribute("fill-opacity", estilo.opacidadFondo);
  }
  if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Rectángulo)) {
    const rectángulo = dibujo._rectángulo;
    nodoDibujo.setAttribute("x", rectángulo.x);
    nodoDibujo.setAttribute("y", rectángulo.y);
    nodoDibujo.setAttribute("width", rectángulo.ancho);
    nodoDibujo.setAttribute("height", rectángulo.alto);
  } else if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Círculo)) {
    const círculo = dibujo._círculo;
    nodoDibujo.setAttribute("cx", círculo.x);
    nodoDibujo.setAttribute("cy", círculo.y);
    nodoDibujo.setAttribute("r", círculo.radio);
  } else if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.RutaSvg)) {
    const rutaSvg = dibujo._rutaSvg
    if (!rutaSvg.esVacia()) {
      nodoDibujo.setAttribute("d", Mila.Svg.listaDeComandos_ComoTexto(rutaSvg));
    }
  } else /* if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Grupo)) */ {
    // Nada (se encargan los hijos)
  }
  return nodoDibujo;
};

Mila.Pantalla._nodoHtmlParaDibujable = function() {
  Mila.Contrato({
    Proposito: "Describir un nodo html para usar como campo _nodoHtml interno de un dibujable.",
      // Tipo nodo dom
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ]
  });
  const nodoHtml = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  nodoHtml.style.position = 'absolute';
  return nodoHtml;
};

Mila.Pantalla._es_NodoHtmlParaDibujable = function(nodoHtml) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el nodo html dado es apto dibujable (es svg, g, path, rect o circle).",
      Mila.Tipo.Booleano
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador.",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoHtml // Tipo nodo dom
    ]
  });
  return nodoHtml.sabeResponder_('tagName') && ['svg', 'g', 'path', 'rect', 'circle'].includes(nodoHtml.tagName.toLowerCase());
};

Mila.Tipo.Registrar({
  nombre:'Dibujable',
  prototipo: Mila.Pantalla._Dibujable,
  subtipoDe: Mila.Tipo.ElementoVisual
});