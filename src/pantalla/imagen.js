Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosImagen',
  es: {
    ruta:Mila.Tipo.Texto
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevaImagen = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva imagen a partir de los atributos dados",
      Mila.Tipo.Imagen
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosImagen]
    ]
  });
  let nuevaImagen = new Mila.Pantalla._Imagen();
  nuevaImagen.Inicializar(atributos);
  nuevaImagen.CambiarRutaA_(atributos.ruta);
  return nuevaImagen;
};

Mila.Pantalla._Imagen = function Imagen() {};
Object.setPrototypeOf(Mila.Pantalla._Imagen.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Imagen.prototype.CambiarRutaA_ = function(nuevaRuta) {
  Mila.Contrato({
    Proposito: "Reemplazar la ruta de esta imagen por la dada",
    Parametros: [
      [nuevaRuta, Mila.Tipo.Texto]
    ]
  });
  this._ruta = nuevaRuta;
}

Mila.Pantalla._Imagen.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar esta imagen en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  if (!('_nodoHtml' in this)) {
    this._nodoHtml = document.createElement('img');
    this._nodoHtml.setAttribute('src', this._ruta)
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style['text-wrap-mode'] = 'nowrap';
    Mila.Pantalla._ProgramarRedimension(this._nodoHtml);
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'Imagen',
  prototipo: Mila.Pantalla._Imagen,
  subtipoDe: Mila.Tipo.ElementoVisual
});