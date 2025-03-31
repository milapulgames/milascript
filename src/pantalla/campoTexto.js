Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosCampoTexto',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevoCampoTexto = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo campo de ingreso de texto a partir de los atributos dados",
      Mila.Tipo.CampoTexto
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosCampoTexto]
    ]
  });
  let nuevoCampoTexto = new Mila.Pantalla._CampoTexto();
  nuevoCampoTexto.Inicializar(atributos);
  nuevoCampoTexto.CambiarTextoA_('texto' in atributos
    ? atributos.texto
    : ''
  );
  return nuevoCampoTexto;
};

Mila.Pantalla._CampoTexto = function CampoTexto() {};
Object.setPrototypeOf(Mila.Pantalla._CampoTexto.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._CampoTexto.prototype.CambiarTextoA_ = function(nuevoTexto) {
  Mila.Contrato({
    Proposito: "Reemplazar el texto de a este campo de texto por el dado",
    Parametros: [
      [nuevoTexto, Mila.Tipo.Texto]
    ]
  });
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.value = this._texto;
  }
};

Mila.Pantalla._CampoTexto.prototype.texto = function() {
  Mila.Contrato({
    Proposito: [
      "Describir el texto ingresado en este campo de texto",
      Mila.Tipo.Texto
    ]
  });
  if ('_nodoHtml' in this) {
    this._texto = this._nodoHtml.value;
  }
  return this._texto;
};

Mila.Pantalla._CampoTexto.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este campo de texto en el documento html como hijo del nodo dado",
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
    this._nodoHtml.style.position = 'fixed';
    this._nodoHtml.value = this._texto;
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'CampoTexto',
  prototipo: Mila.Pantalla._CampoTexto,
  subtipoDe: Mila.Tipo.ElementoVisual
});