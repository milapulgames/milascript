Mila.Modulo({
  define:"Mila.Pantalla.Arrastrable",
  necesita:["../tipo","../pantalla"],
  usa:"../evento"
});

Mila.Tipo.Registrar({
  nombre:'AtributosElementoArrastrable',
  es: {
    "?elementoVisual":Mila.Tipo.ElementoVisual,
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
  return nuevoArrastrable;
};

Mila.Pantalla._ElementoArrastrable = function ElementoArrastrable() {};
Object.setPrototypeOf(Mila.Pantalla._ElementoArrastrable.prototype, Mila.Pantalla._ElementoVisual.prototype);

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
    const esteElemento = this;
    Mila.Evento.Registrar(`Pantalla.Arrastrable_Iniciar_${this._idÚnico}`,
       Mila.Evento.deClicSobreElementos(this),
      function(evento) {
        Mila.Pantalla.Arrastrable.IniciarArrastre(esteElemento, evento);
      }
    );
  }
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
  Mila.Pantalla.Arrastrable.actual = {
    xMouseInicial:evento.atributo_('posiciónEnX'),
    yMouseInicial:evento.atributo_('posiciónEnY'),
    elemento,
    xElementoInicial:elemento.posiciónX(),
    yElementoInicial:elemento.posiciónY()
  };
  Mila.Evento.Habilitar('Pantalla.Arrastrable_Mover');
  Mila.Evento.Habilitar('Pantalla.Arrastrable_Soltar');
};

Mila.Pantalla.Arrastrable.Mover = function(posiciónEnX, posiciónEnY) {
  const arrastre = Mila.Pantalla.Arrastrable.actual;
  arrastre.elemento.CambiarPosiciónXA_(
    arrastre.xElementoInicial + (posiciónEnX - arrastre.xMouseInicial)
  );
  arrastre.elemento.CambiarPosiciónYA_(
    arrastre.yElementoInicial + (posiciónEnY - arrastre.yMouseInicial)
  );
};

Mila.Pantalla.Arrastrable.FinalizarArrastre = function(posiciónEnX, posiciónEnY) {
  Mila.Evento.Deshabilitar('Pantalla.Arrastrable_Mover');
  Mila.Evento.Deshabilitar('Pantalla.Arrastrable_Soltar');
  Mila.Pantalla.Arrastrable.Mover(posiciónEnX, posiciónEnY);
  Mila.Pantalla.Arrastrable.actual = Mila.Nada;
};