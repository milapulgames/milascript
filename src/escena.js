Mila.Módulo({
  define:"Mila.Escena",
  necesita:["tipo","lista","geometria"]
});

Mila.Tipo.Registrar({
  nombre: "ElementoDeEscena",
  es: function esElementoDeEscena(elemento) {
    return Mila.Escena.esElementoDeEscena(elemento);
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosEscena',
  es: {
    "?contenido":Mila.Tipo.ListaDe_(Mila.Tipo.ElementoDeEscena),
    "?dimensiones":Mila.Tipo.O([Mila.Tipo.Nada, Mila.Tipo.Rectángulo])
  },
  inferible: false
});

Mila.Escena.nueva = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir una nueva escena a partir de los atributos dados.",
      Mila.Tipo.Escena
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosEscena]
    ]
  });
  let nuevaEscena = new Mila.Escena._Escena();
  nuevaEscena.CambiarContenidoA_('contenido' in atributos
    ? atributos.contenido
    : []
  );
  nuevaEscena.CambiarDimensionesA_('dimensiones' in atributos
    ? atributos.dimensiones
    : Mila.Nada
  );
  return nuevaEscena;
};

Mila.Escena._Escena = function Escena() {};

Mila.Escena._Escena.prototype.CambiarContenidoA_ = function(nuevoContenido) {
  Mila.Contrato({
    Proposito: "Reemplazar el contenido de esta escena por el dado.",
    Parametros: [
      [nuevoContenido, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoDeEscena)]
    ]
  });
  this._contenido = nuevoContenido;
};

Mila.Escena._Escena.prototype.CambiarDimensionesA_ = function(nuevasDimensiones) {
  Mila.Contrato({
    Proposito: "Reemplazar las dimensiones de esta escena por las dadas.",
    Parametros: [
      [nuevasDimensiones, Mila.Tipo.O([Mila.Tipo.Nada, Mila.Tipo.Rectángulo])]
    ]
  });
  this._dimensiones = nuevasDimensiones.esAlgo()
    ? nuevasDimensiones
    : Mila.Geometria.rectánguloCompleto()
  ;
};

Mila.Escena._Escena.prototype.contenido = function() {
  Mila.Contrato({
    Proposito: [
      "Describir la lista de elementos de esta escena.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ElementoDeEscena)
    ]
  });
  return this._contenido;
};

Mila.Escena._Escena.prototype.dimensiones = function() {
  Mila.Contrato({
    Proposito: [
      "Describir las dimensiones de esta escena.",
      Mila.Tipo.Rectángulo
    ]
  });
  return this._dimensiones;
};

Mila.Escena.esElementoDeEscena = function(elemento) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el elemento dado es un elemento de escena.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      elemento // Cualquier tipo
    ]
  });
  // TODO: pensar qué debería tener para poder estar en una escena.
  return true;
};

Mila.Tipo.Registrar({
  nombre:'Escena',
  prototipo: Mila.Escena._Escena
});