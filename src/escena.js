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
  nombre: "ElementoEscenificable",
  es: function esElementoDeEscena(elemento) {
    return Mila.Escena.esElementoEscenificable(elemento);
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'AtributosEscena',
  es: {
    "?contenido":Mila.Tipo.ListaDe_(Mila.Tipo.ElementoEscenificable),
    "?dimensiones":Mila.Tipo.O([Mila.Tipo.Nada, Mila.Tipo.Rectángulo])
  },
  inferible: false
});

Mila.Escena.nueva = function(atributos={}) {
  Mila.Contrato({
    Propósito: [
      "Describir una nueva escena a partir de los atributos dados.",
      Mila.Tipo.Escena
    ],
    Parámetros: [
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
    Propósito: "Reemplazar el contenido de esta escena por el dado.",
    Parámetros: [
      [nuevoContenido, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoEscenificable)]
    ]
  });
  this._contenido = nuevoContenido.transformados(Mila.Escena.comoElementoDeEscena);
};

Mila.Escena._Escena.prototype.CambiarDimensionesA_ = function(nuevasDimensiones) {
  Mila.Contrato({
    Propósito: "Reemplazar las dimensiones de esta escena por las dadas.",
    Parámetros: [
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
    Propósito: [
      "Describir la lista de elementos de esta escena.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ElementoDeEscena)
    ]
  });
  return this._contenido;
};

Mila.Escena._Escena.prototype.dimensiones = function() {
  Mila.Contrato({
    Propósito: [
      "Describir las dimensiones de esta escena.",
      Mila.Tipo.Rectángulo
    ]
  });
  return this._dimensiones;
};

Mila.Escena.esElementoDeEscena = function(elemento) {
  Mila.Contrato({
    Propósito: [
      "Indicar si el elemento dado es un elemento de escena.",
      Mila.Tipo.Booleano
    ],
    Parámetros: [
      elemento // Cualquier tipo
    ]
  });
  // TODO: pensar qué debería tener para poder estar en una escena.
  return true;
};

Mila.Escena.esElementoEscenificable = function(elemento) {
  Mila.Contrato({
    Propósito: [
      "Indicar si el elemento dado es un elemento escenificable (es decir, si se puede convertir en un elemento de escena).",
      Mila.Tipo.Booleano
    ],
    Parámetros: [
      elemento // Cualquier tipo
    ]
  });
  // TODO: pensar qué debería tener para poder concertirse en un elemento de una escena.
  // Por ahora es que sea un ElementoVisual o que sea un dibujable de Lienzo
  return true;
};

Mila.Escena.comoElementoDeEscena = function(elementoEscenificable) {
  Mila.Contrato({
    Propósito:["Describe al elemento escenificable dado como un elemento de escena.", Mila.Tipo.ElementoDeEscena],
    Parámetros: [
      elementoEscenificable, Mila.Tipo.ElementoEscenificable
    ]
  });
  const resultado = {
    x:0, y:0, elementoOriginal:elementoEscenificable
  };
  if (elementoEscenificable.esDeTipo_(Mila.Tipo.ElementoVisual)) {
    resultado.x = elementoEscenificable.posiciónX();
    resultado.y = elementoEscenificable.posiciónY();
  } else if (elementoEscenificable.esDibujable()) {
    if (elementoEscenificable.defineLaClave_('x')) {
      resultado.x = elementoEscenificable.x;
    }
    if (elementoEscenificable.defineLaClave_('y')) {
      resultado.y = elementoEscenificable.y;
    }
  }
  return resultado;
};

Mila.Tipo.Registrar({
  nombre:'Escena',
  prototipo: Mila.Escena._Escena
});