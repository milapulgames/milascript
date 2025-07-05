Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosAreaTexto',
  es: {
    "?editable":Mila.Tipo.Booleano
  },
  subtipoDe: "AtributosElementoVisualTextual",
  inferible: false
});

Mila.Pantalla.nuevaAreaTexto = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva área de ingreso de texto a partir de los atributos dados",
      Mila.Tipo.AreaTexto
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosAreaTexto]
    ]
  });
  let nuevaAreaTexto = new Mila.Pantalla._AreaTexto();
  nuevaAreaTexto.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    grosorBorde: 1
  });
  nuevaAreaTexto.CambiarEditableA_('editable' in atributos
    ? atributos.editable
    : true
  );
  return nuevaAreaTexto;
};

Mila.Pantalla._AreaTexto = function AreaTexto() {};
Object.setPrototypeOf(Mila.Pantalla._AreaTexto.prototype, Mila.Pantalla._ElementoVisualTextual.prototype);

Mila.Pantalla._AreaTexto.prototype.CambiarTextoA_ = function(nuevoTexto) {
  Mila.Contrato({
    Proposito: "Reemplazar el texto de esta área de ingreso de texto por el dado",
    Parametros: [
      [nuevoTexto, Mila.Tipo.Texto]
    ]
  });
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.value = this._texto;
  }
};

Mila.Pantalla._AreaTexto.prototype.CambiarEditableA_ = function(nuevoValorEditable) {
  Mila.Contrato({
    Proposito: "Reemplazar la propiedad de editabilidad de esta área de ingreso de texto por la dada",
    Parametros: [
      [nuevoValorEditable, Mila.Tipo.Booleano]
    ]
  });
  this._editable = nuevoValorEditable;
  if ('_nodoHtml' in this) {
    this._nodoHtml.readonly = !this._editable;
  }
};

Mila.Pantalla._AreaTexto.prototype.texto = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el texto ingresado en esta área de texto",
      Mila.Tipo.Texto
    ]
  });
  if ('_nodoHtml' in this) {
    this._texto = this._nodoHtml.value;
  }
  return this._texto;
};

Mila.Pantalla._AreaTexto.prototype.esEditable = function() {
  Mila.Contrato({
    Proposito: [
      "Indicar si esta área de texto es editable",
      Mila.Tipo.Booleano
    ]
  });
  return this._editable;
};

Mila.Pantalla._AreaTexto.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar esta área de texto en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('textarea');
    this._nodoHtml.style.resize = 'none';
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style.margin = '0';
    this._nodoHtml.style.padding = '0';
    this._nodoHtml.value = this._texto;
    this._nodoHtml.readonly = !this._editable;
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'AreaTexto',
  prototipo: Mila.Pantalla._AreaTexto,
  subtipoDe: Mila.Tipo.ElementoVisual
});