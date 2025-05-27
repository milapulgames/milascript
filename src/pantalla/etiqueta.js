Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosEtiqueta',
  es: {},
  subtipoDe: "AtributosElementoVisualTextual",
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
  return nuevaEtiqueta;
};

Mila.Pantalla._Etiqueta = function Etiqueta() {};
Object.setPrototypeOf(Mila.Pantalla._Etiqueta.prototype, Mila.Pantalla._ElementoVisualTextual.prototype);

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
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style['text-align'] = 'center';
    this._nodoHtml.style['text-wrap-mode'] = 'nowrap';
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'Etiqueta',
  prototipo: Mila.Pantalla._Etiqueta,
  subtipoDe: Mila.Tipo.ElementoVisual
});