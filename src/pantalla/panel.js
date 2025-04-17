Mila.Modulo({
  necesita:["../tipo","../lista","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosPanel',
  es: {
    "?elementos":Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)]),
    "?disposicion":Mila.Tipo.O([Mila.Tipo.Disposicion,Mila.Pantalla.ClaveDisposicion]),
    "?ancho":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio]),
    "?alto":Mila.Tipo.O([Mila.Tipo.Entero,Mila.Pantalla.ComportamientoEspacio,Mila.Pantalla.ClaveComportamientoEspacio])
  },
  inferible: false
});

Mila.Pantalla.nuevoPanel = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo panel a partir de los atributos dados",
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
    ? atributos.disposicion
    : Mila.Pantalla.DisposicionVertical
  );
  return nuevoPanel;
};

Mila.Pantalla._Panel = function Panel() {};
Object.setPrototypeOf(Mila.Pantalla._Panel.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Panel.prototype.AgregarElemento_ = function(nuevoElemento) {
  Mila.Contrato({
    Proposito: "Agregar el elemento dado a este panel",
    Parametros: [
      [nuevoElemento, Mila.Tipo.ElementoVisual]
    ]
  });
  this._elementos.push(nuevoElemento);
};

Mila.Pantalla._Panel.prototype.CambiarElementosA_ = function(nuevosElementos) {
  Mila.Contrato({
    Proposito: "Reemplazar los elementos de a este panel por los dados",
    Parametros: [
      [nuevosElementos, Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)])]
    ]
  });
  this._elementos = nuevosElementos.esUnaLista() ? nuevosElementos : [nuevosElementos];
};

Mila.Pantalla._Panel.prototype.CambiarDisposicionA_ = function(nuevaDisposicion) {
  Mila.Contrato({
    Proposito: "Reemplazar la disposición de a este panel por la dada",
    Parametros: [
      [nuevaDisposicion, Mila.Tipo.O([Mila.Pantalla.ClaveDisposicion, Mila.Tipo.Disposicion])]
    ]
  });
  this._disposicion = (nuevaDisposicion.esDeTipo_(Mila.Pantalla.ClaveDisposicion)
    ? Mila.Pantalla[`Disposicion${nuevaDisposicion}`]
    : nuevaDisposicion
  );
};

Mila.Pantalla._Panel.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este panel en el documento html como hijo del nodo dado",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
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
  Mila.Contrato({
    Proposito: "Quitar este panel del documento html",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador()
    ]
  });
  for (let elemento of this._elementos) {
    elemento.QuitarDelHtml();
  }
  if ('_nodoHtml' in this) {
    this._nodoHtml.remove();
    delete this._nodoHtml;
  }
};

Mila.Pantalla._Panel.prototype.MinimizarAncho = function() {
  Mila.Contrato({
    Proposito: "Minimizar el ancho del elemento html de este panel",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este panel",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style.width = `${this._elementos.esVacia()
    ? 0
    : (this._disposicion.eje == Mila.Pantalla.Eje.Horizontal
      ? this._elementos.transformados(x=>x.anchoHtml()).fold((x,y)=>x+y,0)
      : this._elementos.transformados(x=>x.anchoHtml()).maximo()
    )
  }px`;
};

Mila.Pantalla._Panel.prototype.MinimizarAlto = function() {
  Mila.Contrato({
    Proposito: "Minimizar el alto del elemento html de este panel",
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este panel",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  this._nodoHtml.style.height = `${this._elementos.esVacia()
    ? 0
    : (this._disposicion.eje == Mila.Pantalla.Eje.Horizontal
      ? this._elementos.transformados(x=>x.altoHtml()).maximo()
      : this._elementos.transformados(x=>x.altoHtml()).fold((x,y)=>x+y,0)
    )
  }px`;
};

Mila.Pantalla._Panel.prototype.Redimensionar = function(rectanguloCompleto) {
  Mila.Contrato({
    Proposito: [
      "Redimensionar este panel para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectangulo
    ],
    Parametros: [
      [rectanguloCompleto, Mila.Tipo.Rectangulo]
    ]
  });
  let resultado = this.rectanguloInterno(rectanguloCompleto);
  if ('_nodoHtml' in this) {
    this._nodoHtml.style.width = `${Math.abs(resultado.ancho)}px`;
    this._nodoHtml.style.height = `${Math.abs(resultado.alto)}px`;
    this._disposicion.OrganizarElementos_En_(this._elementos, resultado);
    resultado = this.rectanguloMinimo(resultado);
    if (rectanguloCompleto.alto < 0 || rectanguloCompleto.ancho < 0) {
      // Disposición invertida, tengo que volver a organizar mis elementos en el rectángulo final
      this._disposicion.OrganizarElementos_En_(this._elementos, resultado);
    }
  }
  return resultado;
};

Mila.Tipo.Registrar({
  nombre:'Panel',
  prototipo: Mila.Pantalla._Panel,
  subtipoDe: Mila.Tipo.ElementoVisual
});