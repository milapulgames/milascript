Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosBoton',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?funcion":Mila.Tipo.Funcion
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoBoton = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo botón a partir de los atributos dados",
      Mila.Tipo.Boton
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosBoton]
    ]
  });
  let nuevoBoton = new Mila.Pantalla._Boton();
  nuevoBoton.Inicializar(atributos, {grosorBorde:2});
  nuevoBoton.CambiarTextoA_('texto' in atributos
    ? atributos.texto
    : ''
  );
  if ('funcion' in atributos) {
    nuevoBoton.CambiarFuncionA_(atributos.funcion);
  }
  return nuevoBoton;
};

Mila.Pantalla._Boton = function Boton() {};
Object.setPrototypeOf(Mila.Pantalla._Boton.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Boton.prototype.CambiarTextoA_ = function(nuevoTexto) {
  Mila.Contrato({
    Proposito: "Reemplazar el texto de a este botón por el dado",
    Parametros: [
      [nuevoTexto, Mila.Tipo.Texto]
    ]
  });
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.innerHTML = this._texto;
  }
};

Mila.Pantalla._Boton.prototype.CambiarFuncionA_ = function(nuevaFuncion) {
  Mila.Contrato({
    Proposito: "Reemplazar la función de a este botón por la dada",
    Parametros: [
      [nuevaFuncion, Mila.Tipo.Funcion]
    ]
  });
  this._funcion = nuevaFuncion;
  if ('_nodoHtml' in this) {
    this._nodoHtml.addEventListener('click', funcion);
  }
};

Mila.Pantalla._Boton.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este botón en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('button');
    this._nodoHtml.innerHTML = this._texto;
    this._nodoHtml.style.position = 'absolute';
    if ('_funcion' in this) {
      this._nodoHtml.addEventListener('click', this._funcion);
    }
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'Boton',
  prototipo: Mila.Pantalla._Boton,
  subtipoDe: Mila.Tipo.ElementoVisual
});