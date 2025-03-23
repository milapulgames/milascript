Mila.Modulo({
  necesita:["tipo","pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosAreaTexto',
  es: {
    "?texto":Mila.Tipo.Texto,
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevaAreaTexto = function(atributos={}) {
  let nuevaAreaTexto = new Mila.Pantalla._AreaTexto();
  nuevaAreaTexto.Inicializar(atributos, Mila.Pantalla.ComportamientoEspacio.Maximizar);
  nuevaAreaTexto.CambiarTextoA_('texto' in atributos
    ? atributos.texto
    : ''
  );
  return nuevaAreaTexto;
};

Mila.Pantalla._AreaTexto = function AreaTexto() {};
Object.setPrototypeOf(Mila.Pantalla._AreaTexto.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._AreaTexto.prototype.CambiarTextoA_ = function(nuevoTexto) {
  this._texto = nuevoTexto;
  if ('_nodoHtml' in this) {
    this._nodoHtml.value = this._texto;
  }
};

Mila.Pantalla._AreaTexto.prototype.texto = function() {
  if ('_nodoHtml' in this) {
    this._texto = this._nodoHtml.value;
  }
  return this._texto;
};

Mila.Pantalla._AreaTexto.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('textarea');
    this._nodoHtml.style.resize = 'none';
    this._nodoHtml.style.position = 'fixed';
    this._nodoHtml.value = this._texto;
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'AreaTexto',
  prototipo: Mila.Pantalla._AreaTexto
});