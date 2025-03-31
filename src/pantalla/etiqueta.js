Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosEtiqueta',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevaEtiqueta = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva etiqueta a partir de los atributos dados",
      Mila.Tipo.Etiqueta
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosEtiqueta]
    ]
  });
  let nuevaEtiqueta = new Mila.Pantalla._Etiqueta();
  nuevaEtiqueta.Inicializar(atributos);
  nuevaEtiqueta.CambiarTextoA_('texto' in atributos
    ? atributos.texto
    : ''
  );
  return nuevaEtiqueta;
};

Mila.Pantalla._Etiqueta = function Etiqueta() {};
Object.setPrototypeOf(Mila.Pantalla._Etiqueta.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Etiqueta.prototype.CambiarTextoA_ = function(nuevoTexto) {
  Mila.Contrato({
    Proposito: "Reemplazar el texto de a esta etiqueta por el dado",
    Parametros: [
      [nuevoTexto, Mila.Tipo.Texto]
    ]
  });
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.innerHTML = this._texto;
  }
};

Mila.Pantalla._Etiqueta.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar esta etiqueta en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('span');
    this._nodoHtml.innerHTML = this._texto;
    this._nodoHtml.style.position = 'fixed';
    this._nodoHtml.style['text-align'] = 'center';
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'Etiqueta',
  prototipo: Mila.Pantalla._Etiqueta,
  subtipoDe: Mila.Tipo.ElementoVisual
});