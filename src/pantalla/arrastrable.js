Mila.Modulo({
  define:"Mila.Pantalla.Arrastrable",
  necesita:["../tipo","../pantalla"],
  usa:["../evento","../geometria"]
});

Mila.Pantalla.ComportamientoAgarre = Mila.Tipo.Variante("ComportamientoAgarre",
  ["Mover","Instanciar"]
);

Mila.Pantalla.ClaveComportamientoAgarre = Mila.Tipo.Registrar({
  nombre:'ClaveComportamientoAgarre',
  subtipoDe:Mila.Tipo.Texto,
  es: function(elemento) {
    return elemento in Mila.Pantalla.ComportamientoAgarre;
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosElementoArrastrable',
  es: {
    "?elementoVisual":Mila.Tipo.ElementoVisual,
    "?zonasSoltables":Mila.Tipo.O(Mila.Tipo.Nada, // Se puede soltar en cualquier lado
      Mila.Tipo.ListaDe_(Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.Rectangulo]))
    ),
    "?zonaArrastrable":Mila.Tipo.O([Mila.Tipo.Nada, // Se puede arrastrar por cualquier lado
      Mila.Tipo.ElementoVisual, Mila.Tipo.Rectangulo]
    ),
    "?comportamientoAgarre":Mila.Tipo.O([Mila.Tipo.ComportamientoAgarre, Mila.Tipo.ClaveComportamientoAgarre])
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoElementoArrastrable = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo elemento arrastrable a partir de los atributos dados",
      Mila.Tipo.ElementoArrastrable
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosElementoArrastrable]
    ]
  });
  let nuevoArrastrable = new Mila.Pantalla._ElementoArrastrable();
  nuevoArrastrable.Inicializar(atributos);
  nuevoArrastrable.CambiarElementoVisualA_('elementoVisual' in atributos
    ? atributos.elementoVisual
    : Mila.Nada
  );
  nuevoArrastrable.CambiarZonasSoltablesA_('zonasSoltables' in atributos
    ? atributos.zonasSoltables
    : Mila.Nada
  );
  nuevoArrastrable.CambiarZonaArrastrableA_('zonaArrastrable' in atributos
    ? atributos.zonaArrastrable
    : Mila.Nada
  );
  nuevoArrastrable.CambiarComportamientoAgarreA_('comportamientoAgarre' in atributos
    ? atributos.comportamientoAgarre
    : Mila.Pantalla.ComportamientoAgarre.Mover
  );
  return nuevoArrastrable;
};

Mila.Pantalla._ElementoArrastrable = function ElementoArrastrable() {};
Object.setPrototypeOf(Mila.Pantalla._ElementoArrastrable.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._ElementoArrastrable.prototype.atributos = function() {
  Mila.Contrato({
    Proposito: ["Describir los atributos de este elemento arrastrable", Mila.Tipo.AtributosElementoArrastrable]
  });
  return Object.assign({
    elementoVisual:this._elementoVisual,
    zonasSoltables:this._zonasSoltables,
    zonaArrastrable:this._zonaArrastrable,
    comportamientoAgarre:this._comportamientoAgarre
  }, Mila.Pantalla._ElementoVisual.prototype.atributos.call(this));
};

Mila.Pantalla._ElementoArrastrable.prototype.CambiarElementoVisualA_ = function(nuevoElementoVisual) {
  Mila.Contrato({
    Proposito: "Cambiar el elemento visual de este elemento arrastrable por el dado",
    Parametros: [
      [nuevoElementoVisual, Mila.Tipo.ElementoVisual]
    ]
  });
  this._elementoVisual = nuevoElementoVisual;
};

Mila.Pantalla._ElementoArrastrable.prototype.CambiarZonasSoltablesA_ = function(nuevosZonasSoltables) {
  Mila.Contrato({
    Proposito: "Cambiar las zonas soltables de este elemento arrastrable por las dados",
    Parametros: [
      [nuevosZonasSoltables, Mila.Tipo.O(Mila.Tipo.Nada, // Se puede soltar en cualquier lado
        Mila.Tipo.ListaDe_(Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.Rectangulo]))
      )]
    ]
  });
  this._zonasSoltables = nuevosZonasSoltables;
};

Mila.Pantalla._ElementoArrastrable.prototype.CambiarZonaArrastrableA_ = function(nuevaZonaArrastrable) {
  Mila.Contrato({
    Proposito: "Cambiar la zona arrastrable de este elemento arrastrable por la dada",
    Parametros: [
      [nuevaZonaArrastrable, Mila.Tipo.O([Mila.Tipo.Nada, // Se puede arrastrar por cualquier lado
        Mila.Tipo.ElementoVisual, Mila.Tipo.Rectangulo]
      )]
    ]
  });
  this._zonaArrastrable = nuevaZonaArrastrable;
};

Mila.Pantalla._ElementoArrastrable.prototype.CambiarComportamientoAgarreA_ = function(nuevoComportamientoAgarre) {
  Mila.Contrato({
    Proposito: "Cambiar el comportamiento de agarre de este elemento arrastrable por el dado",
    Parametros: [
      [nuevoComportamientoAgarre, Mila.Tipo.O([Mila.Tipo.ComportamientoAgarre, Mila.Tipo.ClaveComportamientoAgarre])]
    ]
  });
  this._comportamientoAgarre = (nuevoComportamientoAgarre.esDeTipo_(Mila.Tipo.ComportamientoAgarre))
    ? nuevoComportamientoAgarre
    : Mila.Pantalla.ComportamientoAgarre[nuevoComportamientoAgarre] // Es una clave
  ;
};

Mila.Pantalla._ElementoArrastrable.prototype.áreaArrastrable = function() {
  Mila.Contrato({
    Proposito: [
      "Describe el área sobre la cual este elemento arrastrable puede ser arrastrado",
      Mila.Tipo.Rectangulo
    ],
  });
  return (this._zonaArrastrable.esNada())
    ? Mila.Pantalla.rectanguloPantalla()
    : (
      (this._zonaArrastrable.esUnRectangulo())
        ? this._zonaArrastrable
        : this._zonaArrastrable.área()
    )
  ;
};

Mila.Pantalla._ElementoArrastrable.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este elemento arrastrable en el documento html como hijo del nodo dado",
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
    if (this._elementoVisual.esAlgo()) {
      this._elementoVisual.PlasmarEnHtml(this._nodoHtml);
    }
    const esteElemento = this;
    Mila.Evento.Registrar(`Pantalla.Arrastrable_Iniciar_${this._idÚnico}`,
       Mila.Evento.deClicSobreElementos(this),
      function(evento) {
        Mila.Pantalla.Arrastrable.IniciarArrastre(esteElemento, evento);
      }
    );
  }
};

Mila.Pantalla._ElementoArrastrable.prototype.Redimensionar = function(rectanguloCompleto) {
  Mila.Contrato({
    Proposito: [
      "Redimensionar este elemento arrastrable para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [rectanguloCompleto, Mila.Tipo.Rectangulo]
    ]
  });
  // if (this._elementoVisual.esNada()) {
    return Mila.Pantalla._ElementoVisual.prototype.Redimensionar.call(this, rectanguloCompleto);
  // }
  // return this._elementoVisual.Redimensionar(rectanguloCompleto);
};

Mila.Pantalla._ElementoArrastrable.prototype.copia = function() {
  Mila.Contrato({
    Proposito: [
      "Describir un elemento arrastrable idéntico a este.",
      Mila.Tipo.ElementoArrastrable
    ]
  });
  Mila.Pantalla.nuevoElementoArrastrable(this.atributos().copia());
};

Mila.Tipo.Registrar({
  nombre:'ElementoArrastrable',
  prototipo: Mila.Pantalla._ElementoArrastrable,
  subtipoDe: Mila.Tipo.ElementoVisual
});

Mila.alIniciar(function() {
  Mila.Evento.Registrar('Pantalla.Arrastrable_Mover',
    Mila.Evento.deMovimientoMouse(Mila.Nada, Mila.Nada),
    function(evento) {
      Mila.Pantalla.Arrastrable.Mover(evento.atributo_('posiciónEnX'), evento.atributo_('posiciónEnY'));
    }
  );
  Mila.Evento.Deshabilitar('Pantalla.Arrastrable_Mover');
  Mila.Evento.Registrar('Pantalla.Arrastrable_Soltar',
    Mila.Evento.deBotonMouse(Mila.Evento.Mouse.clicIzquierdo, false),
    function(evento) {
      Mila.Pantalla.Arrastrable.FinalizarArrastre(evento.atributo_('posiciónEnX'), evento.atributo_('posiciónEnY'));
    }
  );
  Mila.Evento.Deshabilitar('Pantalla.Arrastrable_Soltar');
});

Mila.Pantalla.Arrastrable.actual = Mila.Nada;

Mila.Pantalla.Arrastrable.IniciarArrastre = function(elemento, evento) {
  let desplazamientoRelativo = elemento._nodoHtml.parentNode.getBoundingClientRect();
  let inicioMouse = {x:evento.atributo_('posiciónEnX'), y:evento.atributo_('posiciónEnY')}
  Mila.Pantalla.Arrastrable.actual = {
    inicioMouse,
    xElementoInicial:elemento.posiciónX(),
    yElementoInicial:elemento.posiciónY(),
    desplazamientoRelativo:{x:desplazamientoRelativo.x, y:desplazamientoRelativo.y}
  };
  let elementoAMover = elemento;
  if (elemento._comportamientoAgarre == Mila.Pantalla.ComportamientoAgarre.Mover) {
    Mila.Pantalla.Arrastrable.actual.nodoMadre = elemento._nodoHtml.parentNode;
    document.body.appendChild(elementoAMover._nodoHtml);
  } else { // Instanciar
    elementoAMover = elemento.copia();
    elementoAMover.PlasmarEnHtml(document.body);
    elementoAMover.Redimensionar(Mila.Pantalla.rectanguloPantalla());
  }
  Mila.Pantalla.Arrastrable.actual.elemento = elementoAMover;
  Mila.Pantalla.Arrastrable.Mover(inicioMouse.x, inicioMouse.y);
  Mila.Evento.Habilitar('Pantalla.Arrastrable_Mover');
  Mila.Evento.Habilitar('Pantalla.Arrastrable_Soltar');
};

Mila.Pantalla.Arrastrable.Mover = function(posiciónEnX, posiciónEnY) {
  const arrastre = Mila.Pantalla.Arrastrable.actual;
  const elemento = arrastre.elemento;
  const nuevaPosición = {
    x:arrastre.desplazamientoRelativo.x + arrastre.xElementoInicial + (posiciónEnX - arrastre.inicioMouse.x),
    y:arrastre.desplazamientoRelativo.y + arrastre.yElementoInicial + (posiciónEnY - arrastre.inicioMouse.y)
  };
  if (elemento._zonaArrastrable.esAlgo()) {
    const zonaArrastrable = elemento.áreaArrastrable();
    nuevaPosición.x = Math.max(Math.min(nuevaPosición.x, zonaArrastrable.x+zonaArrastrable.ancho-elemento.ancho()), zonaArrastrable.x);
    nuevaPosición.y = Math.max(Math.min(nuevaPosición.y, zonaArrastrable.y+zonaArrastrable.alto-elemento.alto()), zonaArrastrable.y);
  }
  elemento.CambiarPosiciónXA_(nuevaPosición.x);
  elemento.CambiarPosiciónYA_(nuevaPosición.y);
};

Mila.Pantalla.Arrastrable.FinalizarArrastre = function(posiciónEnX, posiciónEnY) {
  Mila.Evento.Deshabilitar('Pantalla.Arrastrable_Mover');
  Mila.Evento.Deshabilitar('Pantalla.Arrastrable_Soltar');
  const arrastre = Mila.Pantalla.Arrastrable.actual;
  const elemento = arrastre.elemento;
  let desplazamientoRelativo = arrastre.desplazamientoRelativo;
  if (elemento._comportamientoAgarre == Mila.Pantalla.ComportamientoAgarre.Mover) {
    arrastre.nodoMadre.appendChild(elemento._nodoHtml);
  } else {
    desplazamientoRelativo = {x:0, y:0}
    elemento.CambiarComportamientoAgarreA_(Mila.Pantalla.ComportamientoAgarre.Mover);
  }
  arrastre.elemento.CambiarPosiciónXA_(elemento.posiciónX() - desplazamientoRelativo.x);
  arrastre.elemento.CambiarPosiciónYA_(elemento.posiciónY() - desplazamientoRelativo.y);
  Mila.Pantalla.Arrastrable.actual = Mila.Nada;
};