Mila.Modulo({
  necesita:["tipo","pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosBoton',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?funcion":Mila.Tipo.Funcion,
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevoBoton = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describe un nuevo botón a partir de los atributos dados",
      Mila.Tipo.Boton
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosBoton]
    ]
  });
  let nuevoBoton = new Mila.Pantalla._Boton();
  nuevoBoton.Inicializar(atributos);
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
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.innerHTML = this._texto;
  }
};

Mila.Pantalla._Boton.prototype.CambiarFuncionA_ = function(nuevaFuncion) {
  this._funcion = nuevaFuncion;
  if ('_nodoHtml' in this) {
    this._nodoHtml.addEventListener('click', funcion);
  }
};

Mila.Pantalla._Boton.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('button');
    this._nodoHtml.innerHTML = this._texto;
    this._nodoHtml.style.position = 'fixed';
    if ('_funcion' in this) {
      this._nodoHtml.addEventListener('click', this._funcion);
    }
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'Boton',
  prototipo: Mila.Pantalla._Boton
});