Mila.Modulo({
  necesita:["tipo","pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosPanel',
  es: {
    "?elementos":Mila.Tipo.Lista,
    "?disposicion":Mila.Tipo.O([Mila.Pantalla.Disposicion,Mila.Pantalla.ClaveDisposicion]),
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevoPanel = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describe un nuevo panel a partir de los atributos dados",
      Mila.Tipo.Panel
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosPanel]
    ]
  });
  let nuevoPanel = new Mila.Pantalla._Panel();
  nuevoPanel.Inicializar(atributos, Mila.Pantalla.ComportamientoEspacio.Maximizar);
  nuevoPanel.CambiarElementosA_('elementos' in atributos
    ? atributos.elementos
    : []
  );
  nuevoPanel.CambiarDisposicionA_('disposicion' in atributos
    ? (atributos.disposicion.esDeTipo_(Mila.Pantalla.ClaveDisposicion)
      ? Mila.Pantalla[`Disposicion${atributos.disposicion}`]
      : atributos.disposicion
    )
    : Mila.Pantalla.DisposicionVertical
  );
  return nuevoPanel;
};

Mila.Pantalla._Panel = function Panel() {};
Object.setPrototypeOf(Mila.Pantalla._Panel.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Panel.prototype.AgregarElemento_ = function(nuevoElemento) {
  this._elementos.push(nuevoElemento);
};

Mila.Pantalla._Panel.prototype.CambiarElementosA_ = function(nuevosElementos) {
  this._elementos = nuevosElementos.esUnaLista() ? nuevosElementos : [nuevosElementos];
};

Mila.Pantalla._Panel.prototype.CambiarDisposicionA_ = function(nuevaDisposicion) {
  this._disposicion = nuevaDisposicion;
};

Mila.Pantalla._Panel.prototype.PlasmarEnHtml = function(nodoMadre) {
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('div');
    this._nodoHtml.style.border = 'solid 1px green';
    this._nodoHtml.style.margin = '0';
    this._nodoHtml.style.padding = '0';
    this._nodoHtml.style.position = 'fixed';
    nodoMadre.appendChild(this._nodoHtml);
    for (let elemento of this._elementos) {
      elemento.PlasmarEnHtml(this._nodoHtml);
    }
  }
};

Mila.Pantalla._Panel.prototype.QuitarDelHtml = function() {
  for (let elemento of this._elementos) {
    elemento.QuitarDelHtml();
  }
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Panel.prototype.MinimizarAncho = function() {
  // PRE: existe _nodoHtml
  this._nodoHtml.style.width = `${this._elementos.esVacia()
    ? 0
    : this._elementos.transformados(x=>x.anchoHtml()).maximo()
  }px`;
};

Mila.Pantalla._Panel.prototype.MinimizarAlto = function() {
  // PRE: existe _nodoHtml
  this._nodoHtml.style.height = `${this._elementos.esVacia()
    ? 0
    : this._elementos.transformados(x=>x.altoHtml()).maximo()
  }px`;
};

Mila.Pantalla._Panel.prototype.Redimensionar = function(rectanguloCompleto) {
  let resultado = this.rectanguloInterno(rectanguloCompleto);
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.width = `${Math.abs(resultado.ancho)}px`;
    this._nodoHtml.style.height = `${Math.abs(resultado.alto)}px`;
    this._disposicion.OrganizarElementos_En_(this._elementos, resultado);
    resultado = this.rectanguloMinimo(resultado);
  }
  return resultado;
};

Mila.Tipo.Registrar({
  nombre:'Panel',
  prototipo: Mila.Pantalla._Panel
});