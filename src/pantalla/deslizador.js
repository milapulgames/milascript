Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosDeslizador',
  es: {
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevoDeslizador = function(atributos={}) {
  let nuevoDeslizador = new Mila.Pantalla._Deslizador();
  nuevoDeslizador.Inicializar(atributos);
  return nuevoDeslizador;
};

Mila.Pantalla._Deslizador = function Deslizador() {};
Object.setPrototypeOf(Mila.Pantalla._Deslizador.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Deslizador.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('input');
    this._nodoHtml.setAttribute("type","range");
    this._nodoHtml.style.position = 'fixed';
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'Deslizador',
  prototipo: Mila.Pantalla._Deslizador
});