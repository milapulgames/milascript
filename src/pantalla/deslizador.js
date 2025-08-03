Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosDeslizador',
  es: {
    "?valor":Mila.Tipo.Numero
  },
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
  nuevoDeslizador.CambiarValorA_('valor' in atributos
    ? atributos.valor
    : 50
  );
  return nuevoDeslizador;
};

Mila.Pantalla._Deslizador = function Deslizador() {};
Object.setPrototypeOf(Mila.Pantalla._Deslizador.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Deslizador.prototype.CambiarValorA_ = function(nuevoValor) {
  Mila.Contrato({
    Proposito: "Reemplazar el valor de este deslizador por el dado",
    Parametros: [
      [nuevoValor, Mila.Tipo.Numero]
    ]
  });
  this._valor = nuevoValor;
  if ('_nodoHtml' in this) {
    this._nodoHtml.value = `'${this._valor}'`;
  }
};

Mila.Pantalla._Deslizador.prototype.valor = function() {
  Mila.Contrato({
    Proposito: ["Describir el valor de este deslizador", Mila.Tipo.Numero]
  });
  if ('_nodoHtml' in this) {
    this._valor = Number.parseInt(this._nodoHtml.value);
  }
  return this._valor;
};

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
    this._nodoHtml.value = `${this._valor}`;
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'Deslizador',
  prototipo: Mila.Pantalla._Deslizador,
  subtipoDe: Mila.Tipo.ElementoVisual
});