Mila.Modulo({
  necesita:["../tipo","../lista","../pantalla"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosPanel',
  es: {
    "?elementos":Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)]),
    "?disposicion":Mila.Tipo.O([Mila.Tipo.Disposicion,Mila.Pantalla.ClaveDisposicion])
  },
  subtipoDe: "AtributosElementoVisual",
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
  nuevoPanel.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    grosorBorde:1
  });
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
    this._nodoHtml.style.border = `solid ${this._grosorBorde}px green`;
    this._nodoHtml.style.margin = '0';
    this._nodoHtml.style.padding = '0';
    this._nodoHtml.style.position = 'absolute';
    this._nodoHtml.style.overflow = 'auto';
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

Mila.Pantalla._Panel.prototype.MinimizarAncho = function(anchoInvertido, rectanguloCompleto) {
  Mila.Contrato({
    Proposito: "Minimizar el ancho del elemento html de este panel",
    Parametros: [
      [anchoInvertido, Mila.Tipo.Booleano, "Si es cierto, hay que aumentar la coordenada x además de reducir el ancho"],
      [rectanguloCompleto, Mila.Tipo.Rectangulo, "Área total disponible (necesaria en el caso de que el ancho esté invertido)"]
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este panel",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  const anchuraMinima = this.anchoBarraScroll() + (this._elementos.esVacia()
    ? 0
    : (this._disposicion.eje == Mila.Pantalla.Eje.Horizontal
      ? this._elementos.transformados(x=>x.anchoHtml()).fold((x,y)=>x+y,0)
      : this._elementos.transformados(x=>x.anchoHtml()).maximo()
    )
  );
  this._nodoHtml.style.width = `${anchuraMinima}px`;
  if (anchoInvertido) {
    this._nodoHtml.style.top = `${rectanguloCompleto.x + rectanguloCompleto.ancho - anchuraMinima - 2*this._grosorBorde}px`;
  }
};

Mila.Pantalla._Panel.prototype.MinimizarAlto = function(altoInvertido, rectanguloCompleto) {
  Mila.Contrato({
    Proposito: "Minimizar el alto del elemento html de este panel",
    Parametros: [
      [altoInvertido, Mila.Tipo.Booleano, "Si es cierto, al minimizar hay que aumentar la coordenada y además de reducir el alto"],
      [rectanguloCompleto, Mila.Tipo.Rectangulo, "Área total disponible (necesaria en el caso de que el alto esté invertido)"]
    ],
    Precondiciones: [
      "Se está ejecutando en el navegador",
      Mila.entorno().enNavegador(),
      "Hay un elemento html asociado a este panel",
      '_nodoHtml' in this /* && this._nodoHtml es de tipo nodo dom */
    ]
  });
  const alturaMinima = this.altoBarraScroll() + (this._elementos.esVacia()
    ? 0
    : (this._disposicion.eje == Mila.Pantalla.Eje.Horizontal
      ? this._elementos.transformados(x=>x.altoHtml()).maximo()
      : this._elementos.transformados(x=>x.altoHtml()).fold((x,y)=>x+y,0)
    )
  );
  this._nodoHtml.style.height = `${alturaMinima}px`;
  if (altoInvertido) {
    this._nodoHtml.style.top = `${rectanguloCompleto.y + rectanguloCompleto.alto - alturaMinima - 2*this._grosorBorde}px`;
  }
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
    this._disposicion.OrganizarElementos_En_(this._elementos,
      Mila.Geometria.rectanguloEn__De_x_(
        0,
        0,
        resultado.ancho,
        resultado.alto
      )
    );
    resultado = this.rectanguloMinimo(resultado, rectanguloCompleto.ancho < 0, rectanguloCompleto.alto < 0);
  }
  return resultado;
};

Mila.Tipo.Registrar({
  nombre:'Panel',
  prototipo: Mila.Pantalla._Panel,
  subtipoDe: Mila.Tipo.ElementoVisual
});