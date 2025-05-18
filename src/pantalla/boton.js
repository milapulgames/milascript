Mila.Modulo({
  necesita:["../tipo","../pantalla"],
  usa:["../geometria"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosBoton',
  es: {},
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
  nuevoBoton.Inicializar(atributos, {grosorBorde:2, colorBorde:"#000",
    margenInterno:Mila.Geometria.rectanguloEn__De_x_(5,0,5,0),
    cssAdicional:{'border-radius':'5px'}
  });
  return nuevoBoton;
};

Mila.Pantalla._Boton = function Boton() {};
Object.setPrototypeOf(Mila.Pantalla._Boton.prototype, Mila.Pantalla._ElementoVisualTextual.prototype);

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
    this._nodoHtml = document.createElement('a');
    this._nodoHtml.innerHTML = this._texto;
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style['font-size'] = `${this._tamanioLetra}pt`;
    this._nodoHtml.style['cursor'] = 'pointer';
    nodoMadre.appendChild(this._nodoHtml);
    this.InicializarHtml();
  }
};

Mila.Tipo.Registrar({
  nombre:'Boton',
  prototipo: Mila.Pantalla._Boton,
  subtipoDe: Mila.Tipo.ElementoVisual
});