Mila.Módulo({
  usa:["../objeto","../lista","dibujable"],
  necesita:["../tipo","../geometria","../pantalla","../dibujo"]
});

Mila.Pantalla.ModoHtmlLienzo = Mila.Tipo.Variante("ModoHtmlLienzo",
  ["Canvas","Svg"]
);

Mila.Pantalla.ClaveModoHtmlLienzo = Mila.Tipo.Registrar({
  nombre:'ClaveModoHtmlLienzo',
  subtipoDe:Mila.Tipo.Texto,
  es: function(elemento) {
    return elemento in Mila.Pantalla.ModoHtmlLienzo;
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosLienzo',
  es: {
    "?contenido":Mila.Tipo.O([Mila.Tipo.Dibujo, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujo)]),
    // "?dimensiones":Mila.Tipo.Rectángulo,
    "?modoHtml":Mila.Tipo.ModoHtmlLienzo
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoLienzo = function(atributos={}) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo lienzo a partir de los atributos dados.",
      Mila.Tipo.Lienzo
    ],
    Parámetros: [
      [atributos, Mila.Tipo.AtributosLienzo]
    ]
  });
  let nuevoLienzo = new Mila.Pantalla._Lienzo();
  nuevoLienzo.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar
  });
  nuevoLienzo.CambiarModoHtmlA_('modoHtml' in atributos
    ? atributos.modoHtml
    : Mila.Pantalla.ModoHtmlLienzo.Canvas
  );
  // nuevoLienzo.CambiarDimensionesA_('dimensiones' in atributos
  //   ? atributos.dimensiones
  //   : Mila.Geometria.rectánguloCompleto()
  // );
  nuevoLienzo.CambiarContenidoA_('contenido' in atributos
    ? atributos.contenido
    : []
  );
  return nuevoLienzo;
};

Mila.Pantalla._Lienzo = function Lienzo() {};
Object.setPrototypeOf(Mila.Pantalla._Lienzo.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Lienzo.prototype.CambiarModoHtmlA_ = function(modo) {
  Mila.Contrato({
    Propósito: "Cambiar el modo html de este lienzo por el dado.",
    Parámetros: [
      [modo, Mila.Tipo.O([Mila.Tipo.ModoHtmlLienzo, Mila.Tipo.ClaveModoHtmlLienzo])]
    ]
  });
  this._modoHtml = modo.esDeTipo_(Mila.Tipo.ClaveModoHtmlLienzo)
    ? Mila.Pantalla.ModoHtmlLienzo[modo] : modo
  ;
};

Mila.Pantalla._Lienzo.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Propósito: "Plasmar este lienzo en el documento html como hijo del nodo dado.",
    Precondiciones: [
      "Se está ejecutando en un navegador.", Mila.entorno().enNavegador(),
      "No se inicializó el nodo HTML de este lienzo antes.", !('_nodoHtml' in this)
    ],
    Parámetros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
    this._nodoHtml = document.createElement('canvas');
    this._nodoHtml.style.position = 'absolute';
    this._contexto = this._nodoHtml.getContext('2d');
    nodoMadre.appendChild(this._nodoHtml);
  } else { // this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)
    this._nodoHtml = Mila.Pantalla._nodoHtmlParaDibujable();
    nodoMadre.appendChild(this._nodoHtml);
  }
  this.InicializarHtml();
  this.Dibujar();
};

Mila.Pantalla._Lienzo.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar este lienzo del documento html",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ]
  });
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)) {
    this._contenido.conCadaUno(function(elemento) {
      elemento.QuitarDelHtml();
    });
  }
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Lienzo.prototype.CambiarContenidoA_ = function(nuevoContenido) {
  Mila.Contrato({
    Propósito: "Cambiar el contenido de este lienzo por el dado.",
    Parámetros: [
      [nuevoContenido, Mila.Tipo.O([Mila.Tipo.Dibujo, Mila.Tipo.ListaDe_(Mila.Tipo.Dibujo)])]
    ]
  });
  const contenido = nuevoContenido.esUnaLista()
    ? nuevoContenido
    : [nuevoContenido]
  ;
  this._contenido = this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)
    ? contenido
    : contenido.transformados(dibujo => Mila.Pantalla._dibujableParaDibujo_(dibujo))
  ;
};

Mila.Pantalla._Lienzo.prototype.AgregarElemento_ = function(dibujo) {
  Mila.Contrato({
    Propósito: "Agregar el dibujo dado al contenido de este lienzo.",
    Parámetros: [
      [dibujo, Mila.Tipo.Dibujo]
    ]
  });
  this._contenido.push(this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)
    ? dibujo
    : Mila.Pantalla._dibujableParaDibujo_(dibujo)
  );
};

Mila.Pantalla._dibujableParaDibujo_ = function(dibujo) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo dibujable para el dibujo dado.",
      Mila.Tipo.Dibujable
    ],
    Parámetros: [
      [dibujo, Mila.Tipo.Dibujo]
    ]
  });
  const dibujable = Mila.Pantalla.nuevoDibujable({dibujo});
  Mila.Base.ReemplazarFuncion_De_Por_("CambiarPosiciónXA_", dibujo, function(funcionOriginal) {
    return function(nuevaPosiciónX) {
      dibujable.CambiarPosiciónXA_(nuevaPosiciónX);
      funcionOriginal.call(dibujo, nuevaPosiciónX);
    };
  });
  Mila.Base.ReemplazarFuncion_De_Por_("CambiarPosiciónYA_", dibujo, function(funcionOriginal) {
    return function(nuevaPosiciónY) {
      dibujable.CambiarPosiciónYA_(nuevaPosiciónY);
      funcionOriginal.call(dibujo, nuevaPosiciónY);
    };
  });
  Mila.Base.ReemplazarFuncion_De_Por_("CambiarEscalaA_", dibujo, function(funcionOriginal) {
    return function(nuevaEscala) {
      dibujable._transformación.escala.x = nuevaEscala;
      dibujable._transformación.escala.y = nuevaEscala;
      funcionOriginal.call(dibujo, nuevaEscala);
      if ('_nodoHtml' in dibujable) {
        dibujable._ActualizarTransformaciónEnNodoHtml();
      }
    };
  });
  return dibujable;
};

Mila.Pantalla._Lienzo.prototype.contenido = function() {
  Mila.Contrato({
    Propósito: [
      "Describir el contenido de este lienzo.",
      Mila.Tipo.ListaDe_(Mila.Tipo.Dibujable)
    ]
  });
  return this._contenido;
};

Mila.Pantalla._Lienzo.prototype.Dibujar = function() {
  Mila.Contrato({
    Propósito: "Dibujar el contenido de este lienzo."
  });
  this._BorrarTodo();
  if ('_nodoHtml' in this) {
    const fDibujar = this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)
      ? this._DibujarDibujo_
      : this._DibujarDibujable_
    ;
    this._contenido.conCadaUno(elemento =>
      fDibujar.call(this, elemento)
    );
  }
};

Mila.Pantalla._Lienzo.prototype.Limpiar = function() {
  Mila.Contrato({
    Propósito: "Limpiar el contenido de este lienzo."
  });
  this._BorrarTodo();
  this._contenido = [];
};

Mila.Pantalla._Lienzo.prototype._RedimensionarHtml = function(rectángulo) {
  Mila.Contrato({
    Propósito: "Redimensionar el nodo html de este lienzo en el rectángulo dado.",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este lienzo",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ],
    Parámetros: [
      [rectángulo, Mila.Tipo.Rectángulo]
    ]
  });
  // this._dimensiones = rectángulo;
  this._nodoHtml.style.left = `${rectángulo.x}px`;
  this._nodoHtml.style.top = `${rectángulo.y}px`;
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
    this._nodoHtml.width = rectángulo.ancho;
    this._nodoHtml.height = rectángulo.alto;
    this.Dibujar();
  } else { // this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)
    this._nodoHtml.setAttribute("width",`${rectángulo.ancho}`);
    this._nodoHtml.setAttribute("height",`${rectángulo.alto}`);
  }
};

Mila.Pantalla._Lienzo.prototype._BorrarTodo = function() {
  Mila.Contrato({
    Propósito: "Limpiar este lienzo."
  });
  if ('_nodoHtml' in this) {
    if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
      let rectángulo = Mila.Geometria.rectánguloEn__De_x_(0, 0, this._nodoHtml.width, this._nodoHtml.height);
      this._DibujarDibujo_(Mila.Dibujo.deRectángulo_(rectángulo, {colorBorde:"#fff", colorFondo:"#fff"}));
    } else { // this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)
      this._nodoHtml.replaceChildren();
    }
  }
};

Mila.Pantalla._Lienzo.prototype._DibujarDibujo_ = function(dibujo, estiloHeredado={}) {
  Mila.Contrato({
    Propósito: "Dibujar el dibujo dado en este lienzo.",
    Parámetros: [
      [dibujo, Mila.Tipo.Dibujo]
    ]
  });
  const estilo = dibujo.estilo().copia();
  let escala = 1;
  if ('escala' in estilo) {
    escala *= estilo.escala;
  }
  if ('escala' in estiloHeredado) {
    escala *= estiloHeredado.escala;
    estilo.escala = escala;
  }
  let x = 0;
  if ('posiciónX' in estilo) {
    x += estilo.posiciónX;
  }
  if ('posiciónX' in estiloHeredado) {
    x += estiloHeredado.posiciónX;
  }
  let y = 0;
  if ('posiciónY' in estilo) {
    y += estilo.posiciónY;
  }
  if ('posiciónY' in estiloHeredado) {
    y += estiloHeredado.posiciónY;
  }
  if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Rectángulo)) {
    const rectángulo = dibujo._rectángulo;
    let contexto = this._contexto;
    contexto.save();
    contexto.beginPath();
    x += rectángulo.x;
    y += rectángulo.y;
    let ancho = rectángulo.ancho*escala;
    let alto = rectángulo.alto*escala;
    if ('colorBorde' in estilo) {
      contexto.strokeStyle = estilo.colorBorde;
    }
    if ('colorFondo' in estilo) {
      contexto.fillStyle = estilo.colorFondo;
      contexto.fillRect(x, y, ancho, alto);
    }
    contexto.strokeRect(x, y, ancho, alto);
    contexto.restore();
  } else if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Círculo)) {
    const círculo = dibujo._círculo;
    let contexto = this._contexto;
    contexto.save();
    contexto.beginPath();
    x += círculo.x;
    y += círculo.y;
    let radio = círculo.radio*escala;
    if ('colorBorde' in estilo) {
      contexto.strokeStyle = estilo.colorBorde;
    }
    contexto.arc(x,y,radio,0,2*Math.PI);
    contexto.stroke();
    if ('colorFondo' in estilo) {
      contexto.fillStyle = estilo.colorFondo;
      contexto.fill();
    }
    contexto.closePath();
    contexto.restore();
  } else if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.RutaSvg)) {
    const transformación = { // Transformación
      traslación:{x,y}, rotación:{a:0, x:0, y:0}, escala:{x:escala, y:escala}
    };
    let contexto = this._contexto;
    contexto.save();
    contexto.beginPath();
    const datos = new Path2D(
      Mila.Svg.listaDeComandos_ComoTexto(
        Mila.Svg.listaDeComandos_transformada_(
          dibujo._rutaSvg, transformación
        )
      )
    );
    contexto.lineWidth = 'grosorBorde' in estilo ? estilo.grosorBorde : 1;
    contexto.strokeStyle = 'colorBorde' in estilo ? estilo.colorBorde : '#0000';
    contexto.stroke(datos);
    contexto.globalAlpha = 'opacidadFondo' in estilo ? estilo.opacidadFondo : 1;
    contexto.fillStyle = 'colorFondo' in estilo ? estilo.colorFondo : '#0000';
    contexto.fill(datos);
    contexto.closePath();
    contexto.restore();
  } else /* if (dibujo.clase().esIgualA_(Mila.Dibujo.ClaseDibujo.Grupo)) */ {
    const grupo = dibujo._grupo;
    estilo.posiciónX = x;
    estilo.posiciónY = y;
    grupo.conCadaUno(dibujo => this._DibujarDibujo_(dibujo, estilo));
  }
};

Mila.Pantalla._Lienzo.prototype._DibujarDibujable_ = function(dibujable) {
  Mila.Contrato({
    Propósito: "Dibujar el dibujable dado en este lienzo.",
    Parámetros: [
      [dibujable, Mila.Tipo.Dibujable]
    ]
  });
  dibujable.PlasmarEnHtml(this._nodoHtml);
};

Mila.Tipo.Registrar({
  nombre: "Lienzo",
  prototipo: Mila.Pantalla._Lienzo,
  es: 'esUnLienzo',
  igualdad: ['_contenido'/*,'_dimensiones'*/],
  strInstancia: function(elemento) {
    // return `${elemento._dimensiones} {\n${
    return `{\n${
      elemento._contentido.transformados(x => `\t${x}`).join('\n')
    }\n}`;
  },
  subtipoDe: Mila.Tipo.ElementoVisual
});