Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosDeslizador',
  es: {},
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoDeslizador = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo deslizador a partir de los atributos dados",
      Mila.Tipo.Deslizador
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosDeslizador]
    ]
  });
  let nuevoDeslizador = new Mila.Pantalla._Deslizador();
  nuevoDeslizador.Inicializar(atributos);
  return nuevoDeslizador;
};

Mila.Pantalla._Deslizador = function Deslizador() {};
Object.setPrototypeOf(Mila.Pantalla._Deslizador.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Deslizador.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este deslizador en el documento html como hijo del nodo dado",
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
    this._nodoHtml.setAttribute("type","range");
    this._nodoHtml.style.position = 'absolute';
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'Deslizador',
  prototipo: Mila.Pantalla._Deslizador,
  subtipoDe: Mila.Tipo.ElementoVisual
});