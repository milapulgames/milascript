Mila.Modulo({
  necesita:["../tipo","../lista","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosWebIncrustada',
  es: {
    "url":Mila.Tipo.Texto
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevaWebIncrustada = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva web incrustada a partir de los atributos dados",
      Mila.Tipo.WebIncrustada
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosWebIncrustada]
    ]
  });
  let nuevaWebIncrustada = new Mila.Pantalla._WebIncrustada();
  nuevaWebIncrustada.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    grosorBorde:4
  });
  nuevaWebIncrustada.CambiarUrlA_(atributos.url);
  return nuevaWebIncrustada;
};

Mila.Pantalla._WebIncrustada = function WebIncrustada() {};
Object.setPrototypeOf(Mila.Pantalla._WebIncrustada.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._WebIncrustada.prototype.CambiarUrlA_ = function(nuevaUrl) {
  Mila.Contrato({
    Proposito: "Reemplazar la url de esta web incrustada por la dada",
    Parametros: [
      [nuevaUrl, Mila.Tipo.Texto]
    ]
  });
  this._url = nuevaUrl;
};

Mila.Pantalla._WebIncrustada.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar esta web incrustada en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('iframe');
    this._nodoHtml.setAttribute('src', this._url);
    this._nodoHtml.style.margin = '0';
    this._nodoHtml.style.padding = '0';
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style.overflow = 'auto';
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Pantalla._WebIncrustada.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar esta web incrustada del documento html",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ]
  });
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Tipo.Registrar({
  nombre:'WebIncrustada',
  prototipo: Mila.Pantalla._WebIncrustada,
  subtipoDe: Mila.Tipo.ElementoVisual
});