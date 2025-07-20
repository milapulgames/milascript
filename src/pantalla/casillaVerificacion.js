Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosCasillaVerificacion',
  es: {
    "?marcada":Mila.Tipo.Booleano
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevaCasillaVerificacion = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva casilla de verificación a partir de los atributos dados",
      Mila.Tipo.CasillaVerificacion
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosCasillaVerificacion]
    ]
  });
  let nuevaCasillaVerificacion = new Mila.Pantalla._CasillaVerificacion();
  // Reescribo la función
  if ('funcion' in atributos) {
    const funcionOriginal = atributos.funcion;
    atributos.funcion = function() {
      this.CambiarMarcaA_(!this.marcada());
      funcionOriginal.call(this);
    }
  } else {
    atributos.funcion = function() {
      this.CambiarMarcaA_(!this.marcada());
    }
  }
  nuevaCasillaVerificacion.Inicializar(atributos);
  nuevaCasillaVerificacion.CambiarMarcaA_('marcada' in atributos
    ? atributos.marcada
    : false
  );
  return nuevaCasillaVerificacion;
};

Mila.Pantalla._CasillaVerificacion = function CasillaVerificacion() {};
Object.setPrototypeOf(Mila.Pantalla._CasillaVerificacion.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._CasillaVerificacion.prototype.CambiarMarcaA_ = function(nuevaMarca) {
  Mila.Contrato({
    Proposito: "Cambia el estado de marca de esta casilla de verificación por la marca dada",
    Parametros: [
      [nuevaMarca, Mila.Tipo.Booleano]
    ]
  });
  this._marcada = nuevaMarca;
  if ('_nodoHtml' in this) {
    this._nodoHtml.checked = nuevaMarca;
  }
};

Mila.Pantalla._CasillaVerificacion.prototype.marcada = function() {
  Mila.Contrato({
    Proposito: [
      "Indica si esta casilla de verificación está marcada",
      Mila.Tipo.Booleano
    ],
  });
  if ('_nodoHtml' in this) {
    this._marcada = this._nodoHtml.checked;
  }
  return this._marcada;
};

Mila.Pantalla._CasillaVerificacion.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar esta casilla de verificación en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('input');
    this._nodoHtml.setAttribute("type","checkbox");
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.checked = this._marcada;
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'CasillaVerificacion',
  prototipo: Mila.Pantalla._CasillaVerificacion,
  subtipoDe: Mila.Tipo.ElementoVisual
});