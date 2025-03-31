Mila.Modulo({
  necesita:["../tipo","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosCasillaVerificacion',
  es: {
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevaCasillaVerificacion = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva casilla de verificación a partir de los atributos dados",
      Mila.Tipo.CasillaVerificacion
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosCasillaVerificacion]
    ]
  });
  let nuevaCasillaVerificacion = new Mila.Pantalla._CasillaVerificacion();
  nuevaCasillaVerificacion.Inicializar(atributos);
  return nuevaCasillaVerificacion;
};

Mila.Pantalla._CasillaVerificacion = function CasillaVerificacion() {};
Object.setPrototypeOf(Mila.Pantalla._CasillaVerificacion.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._CasillaVerificacion.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar esta casilla de verificación en el documento html como hijo del nodo dado",
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
    this._nodoHtml.setAttribute("type","checkbox");
    this._nodoHtml.style.position = 'fixed';
    nodoMadre.appendChild(this._nodoHtml);
  }
};

Mila.Tipo.Registrar({
  nombre:'CasillaVerificacion',
  prototipo: Mila.Pantalla._CasillaVerificacion,
  subtipoDe: Mila.Tipo.ElementoVisual
});