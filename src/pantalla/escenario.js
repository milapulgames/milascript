Mila.Módulo({
  define:"Mila.Pantalla.Escenario",
  necesita:["../tipo","lienzo","../pantalla","../cámara","../escena"],
  usa:["../lista","../geometria","../dibujo"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosEscenario',
  es: {
    "escena":Mila.Tipo.Escena,
    "cámara":Mila.Tipo.Cámara,
    "?modoHtml":Mila.Tipo.ModoHtmlLienzo
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoEscenario = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo escenario a partir de los atributos dados.",
      Mila.Tipo.Escenario
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosEscenario]
    ]
  });
  let nuevoEscenario = new Mila.Pantalla._Escenario();
  nuevoEscenario.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    grosorBorde:1, colorBorde:"#000"
  });
  nuevoEscenario.CambiarModoHtmlA_('modoHtml' in atributos
    ? atributos.modoHtml
    : Mila.Pantalla.ModoHtmlLienzo.Canvas
  );
  nuevoEscenario._lienzo = Mila.Pantalla.nuevoLienzo({
    modoHtml:nuevoEscenario._modoHtml
  });
  nuevoEscenario.CambiarCámaraA_(atributos.cámara);
  nuevoEscenario.CambiarEscenaA_(atributos.escena);
  return nuevoEscenario;
};

Mila.Pantalla._Escenario = function Escenario() {};
Object.setPrototypeOf(Mila.Pantalla._Escenario.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Escenario.prototype.CambiarModoHtmlA_ = function(modo) {
  Mila.Contrato({
    Propósito: "Cambiar el modo html de este escenario por el dado.",
    Parámetros: [
      [modo, Mila.Tipo.O([Mila.Tipo.ModoHtmlLienzo, Mila.Tipo.ClaveModoHtmlLienzo])]
    ]
  });
  this._modoHtml = modo.esDeTipo_(Mila.Tipo.ClaveModoHtmlLienzo)
    ? Mila.Pantalla.ModoHtmlLienzo[modo] : modo
  ;
};

Mila.Pantalla._Escenario.prototype.CambiarCámaraA_ = function(nuevaCámara) {
  Mila.Contrato({
    Proposito: "Reemplazar la cámara de a este escenario por la dada.",
    Parametros: [
      [nuevaCámara, Mila.Tipo.Cámara]
    ]
  });
  this._cámara = nuevaCámara;
};

Mila.Pantalla._Escenario.prototype.CambiarEscenaA_ = function(nuevaEscena) {
  Mila.Contrato({
    Proposito: "Reemplazar la escena de a este escenario por la dada.",
    Parametros: [
      [nuevaEscena, Mila.Tipo.Escena]
    ]
  });
  this._escena = nuevaEscena;
  this._contenido = Mila.Pantalla._contenidoParaEscenario(nuevaEscena.contenido(), this);
  this._lienzo.CambiarContenidoA_(Mila.Pantalla._contenidoDeEscenarioParaLienzo(this));
};

Mila.Pantalla._Escenario.prototype.cámara = function() {
  Mila.Contrato({
    Proposito: [
      "Describir la cámara de este escenario.",
      Mila.Tipo.Cámara
    ]
  });
  return this._cámara;
};

Mila.Pantalla._Escenario.prototype.escena = function() {
  Mila.Contrato({
    Proposito: [
      "Describir la escena de este escenario.",
      Mila.Tipo.Escena
    ]
  });
  return this._escena;
};

Mila.Pantalla._contenidoParaEscenario = function(contenidoEscena, escenario) {
  Mila.Contrato({
    Proposito: [
      "Describir una lista con el contenido para el escenario dado a partir del contenido de la escena dada.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ElementoEscenario)
    ],
    Parametros: [
      [contenidoEscena, Mila.Tipo.Lista],
      [escenario, Mila.Tipo.Escenario]
    ]
  });
  return contenidoEscena.transformados(elementoEscena => Mila.Pantalla._nuevoElementoEscenario(elementoEscena, escenario));
};

Mila.Pantalla._nuevoElementoEscenario = function(elementoEscena, escenario) {
  Mila.Contrato({
    Proposito: [
      "Describir un elemento de escenario para el escenario dado a partir del elemento de escena dado.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ElementoEscenario)
    ],
    Parametros: [
      [elementoEscena, Mila.Tipo.Cualquiera],
      [escenario, Mila.Tipo.Escenario]
    ]
  });
  const cámara = escenario.cámara();
  const nuevoElementoEscenario = new Mila.Pantalla._ElementoEscenario(elementoEscena);
  if (elementoEscena.sabeResponder_('dibujo')) {
    nuevoElementoEscenario.EstablecerDibujo(Mila.Pantalla._dibujoParaElementoEscenaEnEscenario(elementoEscena, escenario));
    if (escenario._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)) {
      if (elementoEscena.sabeResponder_('CambiarPosiciónYA_')) {
        Mila.Base.ReemplazarFuncion_De_Por_('CambiarPosiciónYA_',elementoEscena, function(funciónOriginal) {
          return function(nuevaPosiciónY) {
            funciónOriginal.call(elementoEscena, nuevaPosiciónY);
            Mila.Pantalla._PosicionarDibujoSegúnCámara(nuevoElementoEscenario.dibujo(), cámara, "Vertical");
          };
        });
      }
      if (elementoEscena.sabeResponder_('CambiarPosiciónXA_')) {
        Mila.Base.ReemplazarFuncion_De_Por_('CambiarPosiciónXA_',elementoEscena, function(funciónOriginal) {
          return function(nuevaPosiciónX) {
            funciónOriginal.call(elementoEscena, nuevaPosiciónX);
            Mila.Pantalla._PosicionarDibujoSegúnCámara(nuevoElementoEscenario.dibujo(), cámara, "Horizontal");
          };
        });
      }
    }
  }
  return nuevoElementoEscenario;
};

Mila.Pantalla._dibujoParaElementoEscenaEnEscenario = function(elementoEscena, escenario) {
  Mila.Contrato({
    Proposito: [
      "Describir un dibujo para el escenario dado a partir del elemento de escena dado.",
      Mila.Tipo.Dibujo
    ],
    Parametros: [
      [elementoEscena, Mila.Tipo.Cualquiera],
      [escenario, Mila.Tipo.Escenario]
    ]
  });
  const cámara = escenario._cámara;
  const dibujoOriginal = elementoEscena.dibujo();
  const dibujo = Mila.Pantalla._copiaDeDibujoAsociandoCambios(dibujoOriginal, cámara);
  dibujo.elementoOriginal = elementoEscena;
  let escala = Mila.Pantalla._escalaDibujoSegúnCámara(elementoEscena, cámara);
  Mila.Pantalla._PosicionarDibujoSegúnCámara(dibujo, cámara, Mila.Nada);
  dibujo.CambiarEscalaA_(escala);
  return dibujo;
};

Mila.Pantalla._copiaDeDibujoAsociandoCambios = function(dibujoOriginal, cámara=Mila.Nada) {
  Mila.Contrato({
    Proposito: [
      "Describir una copia del dibujo dado que tenga asociados los cambios del dibujo original. Si se pasa también una cámara el posicionamiento se calcula a partir de ella y del elemento de escena asociado al dibujo resultante.",
      Mila.Tipo.Dibujo
    ],
    Parametros: [
      [dibujoOriginal, Mila.Tipo.Dibujo],
      [cámara, Mila.Tipo.O([Mila.Tipo.Nada, Mila.Tipo.Cámara])]
    ]
  });
  const claseDibujo = dibujoOriginal.clase();
  let dibujo;
  if (claseDibujo.esIgualA_(Mila.Dibujo.ClaseDibujo.Rectángulo)) {
    dibujo = Mila.Dibujo.deRectángulo_(dibujoOriginal._rectángulo, dibujoOriginal.estilo().copia());
  } else if (claseDibujo.esIgualA_(Mila.Dibujo.ClaseDibujo.Círculo)) {
    dibujo = Mila.Dibujo.deCírculo_(dibujoOriginal._círculo, dibujoOriginal.estilo().copia());
  } else if (claseDibujo.esIgualA_(Mila.Dibujo.ClaseDibujo.RutaSvg)) {
    dibujo = Mila.Dibujo.deRutaSvg_(dibujoOriginal._rutaSvg, dibujoOriginal.estilo().copia());
  } else { // claseDibujo.esIgualA_(Mila.Dibujo.ClaseDibujo.Grupo)
    dibujo = Mila.Dibujo.deGrupo_(dibujoOriginal._grupo.transformados(
      dibujo => Mila.Pantalla._copiaDeDibujoAsociandoCambios(dibujo, Mila.Nada)
    ), dibujoOriginal.estilo().copia());
  }
  if (cámara.esAlgo()) { // Es el dibujo raíz, asociado al elemento de la escena.
    Mila.Base.ReemplazarFuncion_De_Por_('CambiarEstilo_A_',dibujoOriginal, function(funciónOriginal) {
      return function(clave, nuevoValor) {
        if (clave.esIgualA_("posiciónX")) {
          Mila.Pantalla._PosicionarDibujoSegúnCámara(dibujo, cámara, "Horizontal");
          dibujo.estilo().posiciónX = nuevoValor;
        } else if (clave.esIgualA_("posiciónY")) {
          dibujo.estilo().posiciónY = nuevoValor;
          Mila.Pantalla._PosicionarDibujoSegúnCámara(dibujo, cámara, "Vertical");
        } else {
          dibujo.CambiarEstilo_A_(clave, nuevoValor);
        }
        funciónOriginal.call(dibujoOriginal, clave, nuevoValor);
      };
    });
  } else { // Es una parte del dibujo principal. Su transformación no se asocia al elemento de la escena.
    Mila.Base.ReemplazarFuncion_De_Por_('CambiarEstilo_A_',dibujoOriginal, function(funciónOriginal) {
      return function(clave, nuevoValor) {
        dibujo.CambiarEstilo_A_(clave, nuevoValor);
        funciónOriginal.call(dibujoOriginal, clave, nuevoValor);
      };
    });
  }
  return dibujo;
};

Mila.Pantalla._PosicionarDibujoSegúnCámara = function(dibujo, cámara, eje=Mila.Nada) {
  Mila.Contrato({
    Proposito: "Establecer la posición del dibujo dado en un escenario con la cámara dada.",
    Parametros: [
      [dibujo, Mila.Tipo.Dibujo],
      [cámara, Mila.Tipo.Cámara],
      [eje, Mila.Tipo.O([Mila.Tipo.Nada, Mila.Tipo.Eje, Mila.Tipo.ClaveEje])]
    ]
  });
  const elementoEscena = dibujo.elementoOriginal;
  let posición = Mila.Pantalla._posiciónDibujoSegúnCámara(elementoEscena, cámara);
  eje = eje.esAlgo() ? (eje.esDeTipo_(Mila.Tipo.Eje) ? eje : Mila.Tipo.Eje[eje]) : eje;
  if (eje.esNada() || eje.esIgualA_(Mila.Tipo.Eje.Horizontal)) {
    dibujo.CambiarPosiciónXA_(posición.x);
  }
  if (eje.esNada() || eje.esIgualA_(Mila.Tipo.Eje.Vertical)) {
    dibujo.CambiarPosiciónYA_(posición.y);
  }
};

Mila.Pantalla._contenidoDeEscenarioParaLienzo = function(escenario) {
  Mila.Contrato({
    Proposito: [
      "Describir el contenido para un lienzo a partir del contenido del escenario dado.",
      Mila.Tipo.ListaDe_(Mila.Tipo.Dibujo)
    ],
    Parametros: [
      [escenario, Mila.Tipo.Escenario]
    ]
  });
  return escenario._contenido
    .losQueCumplen(x => x.esDibujable())
    .transformados(elementoEscenario => elementoEscenario.dibujo())
  ;
};

Mila.Pantalla._escalaDibujoSegúnCámara = function(elementoEscena, cámara) {
  Mila.Contrato({
    Proposito: [
      "Describir la escala que le corresponde al dibujo del elemento de escena dado en un escenario con la cámara dada.",
      Mila.Tipo.Numero
    ],
    Parametros: [
      [elementoEscena, Mila.Tipo.Cualquiera],
      [cámara, Mila.Tipo.Cámara]
    ]
  });
  let escala = 1;
  if (elementoEscena.sabeResponder_('escala')) {
    escala *= elementoEscena.escala();
  }
  if (elementoEscena.sabeResponder_('dibujo')) {
    const estiloDibujo = elementoEscena.dibujo().estilo();
    if ('escala' in estiloDibujo) {
      escala *= estiloDibujo.escala;
    }
  }
  return escala * cámara.zoom()/100;
};

Mila.Pantalla._posiciónDibujoSegúnCámara = function(elementoEscena, cámara) {
  Mila.Contrato({
    Proposito: [
      "Describir la posición que le corresponde al dibujo del elemento de escena dado en un escenario con la cámara dada.",
      Mila.Tipo.Punto
    ],
    Parametros: [
      [elementoEscena, Mila.Tipo.Cualquiera],
      [cámara, Mila.Tipo.Cámara]
    ]
  });
  const estiloDibujo = elementoEscena.sabeResponder_('dibujo') ? elementoEscena.dibujo().estilo() : {};
  let posiciónX = 0;
  if (elementoEscena.sabeResponder_('posiciónEnX')) {
    posiciónX = elementoEscena.posiciónEnX();
  }
  if ('posiciónX' in estiloDibujo) {
    posiciónX += estiloDibujo.posiciónX;
  }
  posiciónX -= cámara.posición().x;
  posiciónX *= cámara.zoom()/100;
  let posiciónY = 0;
  if (elementoEscena.sabeResponder_('posiciónEnY')) {
    posiciónY = elementoEscena.posiciónEnY();
  }
  if ('posiciónY' in estiloDibujo) {
    posiciónY += estiloDibujo.posiciónY;
  }
  posiciónY -= cámara.posición().y;
  posiciónY *= cámara.zoom()/100;
  return Mila.Geometria.puntoEn__(posiciónX, posiciónY);
};

Mila.Pantalla._Escenario.prototype.MoverCámara__ = function(movimientoEnX, movimientoEnY) {
  Mila.Contrato({
    Proposito: "Mover la cámara de este escenario según los movimientos dados en cada eje.",
    Parametros: [
      [movimientoEnX, Mila.Tipo.Numero],
      [movimientoEnY, Mila.Tipo.Numero]
    ]
  });
  const cámara = this._cámara;
  cámara.Mover__(movimientoEnX, movimientoEnY);
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
    this._RefrescarCanvas();
  } else { // this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)
    this._contenido
      .losQueCumplen(x => x.esDibujable())
      .conCadaUno(elementoEscenario => {
        let posición = Mila.Pantalla._posiciónDibujoSegúnCámara(elementoEscenario.elementoOriginal(), cámara);
        let dibujo = elementoEscenario.dibujo();
        dibujo.CambiarPosiciónXA_(posición.x);
        dibujo.CambiarPosiciónYA_(posición.y);
      }
    );
  }
};

Mila.Pantalla._Escenario.prototype.CambiarPosiciónCámaraA_ = function(nuevaPosición) {
  Mila.Contrato({
    Proposito: "Reemplazar la posición de la cámara de este escenario por la dada.",
    Parametros: [
      [nuevaPosición, Mila.Tipo.Punto]
    ]
  });
  const cámara = this._cámara;
  cámara.CambiarPosiciónA_(nuevaPosición);
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
    this._RefrescarCanvas();
  } else { // this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)
    this._contenido
      .losQueCumplen(x => x.esDibujable())
      .conCadaUno(elementoEscenario => {
        let posición = Mila.Pantalla._posiciónDibujoSegúnCámara(elementoEscenario.elementoOriginal(), cámara);
        let dibujo = elementoEscenario.dibujo();
        dibujo.CambiarPosiciónXA_(posición.x);
        dibujo.CambiarPosiciónYA_(posición.y);
      }
    );
  }
};

Mila.Pantalla._Escenario.prototype.ZoomearCámaraEn_ = function(factor) {
  Mila.Contrato({
    Proposito: "Zoomear la cámara de este escenario en el factor dado.",
    Parametros: [
      [factor, Mila.Tipo.Numero]
    ]
  });
  const cámara = this._cámara;
  cámara.ZoomearEn_(factor);
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
    this._RefrescarCanvas();
  } else { // this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Svg)
    this._contenido
      .losQueCumplen(x => x.esDibujable())
      .conCadaUno(elementoEscenario => {
        let escala = Mila.Pantalla._escalaDibujoSegúnCámara(elementoEscenario.elementoOriginal(), cámara);
        let posición = Mila.Pantalla._posiciónDibujoSegúnCámara(elementoEscenario.elementoOriginal(), cámara);
        let dibujo = elementoEscenario.dibujo();
        dibujo.CambiarPosiciónXA_(posición.x);
        dibujo.CambiarPosiciónYA_(posición.y);
        dibujo.CambiarEscalaA_(escala);
      }
    );
  }
};

Mila.Pantalla._Escenario.prototype._RefrescarCanvas = function() {
  Mila.Contrato({
    Proposito: "Refrescar este escenario.",
    Precondiciones: [
      "El modo html de este escenario es Canvas",
      this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)
    ]
  });
  this._lienzo.CambiarContenidoA_(this._contenido
    .losQueCumplen(x => x.esDibujable())
    .transformados(elementoEscenario =>
      Mila.Pantalla._dibujoParaElementoEscenaEnEscenario(elementoEscenario.elementoOriginal(), this)
    )
  );
  this._lienzo.Dibujar();
};

Mila.Pantalla._Escenario.prototype.Redimensionar = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: [
      "Redimensionar este escenario para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  return this._lienzo.Redimensionar(rectánguloCompleto);
};

Mila.Pantalla._Escenario.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este escenario en el documento html como hijo del nodo dado.",
    Precondiciones: [
      "Se está ejecutando en el navegador.",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  this._lienzo.PlasmarEnHtml(nodoMadre);
  if (this._modoHtml.esIgualA_(Mila.Pantalla.ModoHtmlLienzo.Canvas)) {
    this._RefrescarCanvas();
  }
};

Mila.Pantalla._Escenario.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar este escenario del documento html.",
    Precondiciones: [
      "Se está ejecutando en el navegador.",
      Mila.entorno().enNavegador()
    ]
  });
  this._lienzo.QuitarDelHtml();
};

Mila.Tipo.Registrar({
  nombre:'Escenario',
  prototipo: Mila.Pantalla._Escenario,
  subtipoDe: Mila.Tipo.ElementoVisual
});

Mila.Pantalla._ElementoEscenario = function ElementoEscenario(elementoEscena) {
  this._elementoOriginal = elementoEscena;
};

Mila.Pantalla._ElementoEscenario.prototype.EstablecerDibujo = function(dibujo) {
  Mila.Contrato({
    Proposito: "Establecer al dibujo dado como el dibujo de este elemento de escenario.",
    Parametros: [
      [dibujo, Mila.Tipo.Dibujo]
    ]
  });
  this._dibujo = dibujo;
};

Mila.Pantalla._ElementoEscenario.prototype.esDibujable = function() {
  Mila.Contrato({
    Proposito: [
      "Indicar si este elemento de escenario es dibujable en el lienzo.",
      Mila.Tipo.Booleano
    ]
  });
  return '_dibujo' in this;
};

Mila.Pantalla._ElementoEscenario.prototype.dibujo = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el dibujo de este elemento de escenario.",
      Mila.Tipo.Dibujo
    ],
    Precondiciones: [
      "Este elemento de escenario es dibujable.",
      this.esDibujable()
    ]
  });
  return this._dibujo;
};

Mila.Pantalla._ElementoEscenario.prototype.elementoOriginal = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el elemento de escena original de este elemento de escenario.",
      Mila.Tipo.Cualquiera
    ]
  });
  return this._elementoOriginal;
};

Mila.Tipo.Registrar({
  nombre:'ElementoEscenario',
  prototipo: Mila.Pantalla._ElementoEscenario
});