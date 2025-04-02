Mila.Modulo({
  define:"Mila.Base",
  necesita:["documentacion","tipo","js","objeto","lista"]
});

// Funciones útiles

Mila.Base.vale = function(condicion) {
  Mila.Contrato({
    Proposito: ["Indicar si la condición dada vale.", Mila.Tipo.Booleano],
    Parametros: [
      [condicion, Mila.Tipo.O([Mila.Tipo.Booleano, Mila.Tipo.Funcion])]
      // Si es una función tiene que no tomar argumentos y devolver un booleano
    ]
  });
  return condicion.esUnaFuncion()
    ? condicion()
    : condicion
  ;
};
Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
  nombre: 'vale',
  prototipo: Boolean,
  funcionAInvocar: "Mila.Base.vale"
});
Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
  nombre: 'vale',
  prototipo: Function,
  funcionAInvocar: "Mila.Base.vale"
});

Mila.Base.RegistrarFuncion_ = function(funcion) {
  Mila.Contrato({
    Proposito: "Registrar la función dada como función global que será accedida a través de su nombre.\
      Falla si ya se registró antes una función global con el mismo nombre.",
    Parametros: [
      [funcion, Mila.Tipo.Funcion]
    ]
  });
  let nombre = funcion.name;
  if (nombre in Mila.entorno().universo) {
    Mila.Error(`Ya se registró una función global con el nombre ${nombre}`);
  } else {
    Mila.entorno().universo[nombre] = funcion;
  }
};

Mila.Base.RegistrarFuncion_(
  function unoSi_CeroSiNo(condicion) {
    Mila.Contrato({
      Proposito: [
        "Describir uno si se cumple la condición dada y cero si no.",
        Mila.Tipo.Entero
      ],
      Parametros: [
        [condicion, Mila.Tipo.O([Mila.Tipo.Booleano, Mila.Tipo.Funcion])]
        // Si es una función tiene que no tomar argumentos y devolver un booleano
      ]
    });
    return Mila.Base.vale(condicion) ? 1 : 0;
  }
);

Mila.Base.RegistrarFuncion_(
  function minimoEntre_Y_(elemento1, elemento2) {
    Mila.Contrato({
      Proposito: "Describir el mínimo elemento entre los dos elementos dados",
      Precondiciones: [
        "Los elementos dados son del mismo tipo",
        Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
        "El tipo de los elementos dados define una relación de orden",
        Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento1))
      ],
      Parametros: [
        elemento1, // cualquier tipo
        elemento2 // cualquier tipo
      ]
    });
    return elemento1.esMenorOIgualA_(elemento2) ? elemento1 : elemento2;
  }
);

Mila.Base.RegistrarFuncion_(
  function maximoEntre_Y_(elemento1, elemento2) {
    Mila.Contrato({
      Proposito: "Describir el máximo elemento entre los dos elementos dados",
      Precondiciones: [
        "Los elementos dados son del mismo tipo",
        Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
        "El tipo de los elementos dados define una relación de orden",
        Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento1))
      ],
      Parametros: [
        elemento1, // cualquier tipo
        elemento2 // cualquier tipo
      ]
    });
    return elemento1.esMayorOIgualA_(elemento2) ? elemento1 : elemento2;
  }
);

Mila.Base.RegistrarFuncion_(
  function Mostrar(elemento) {
    Mila.Contrato({
      Proposito: "Mostrar una represetanción textual del elemento dado",
      Parametros: [
        elemento // cualquier tipo
      ]
    });
    for (let linea of Mila.Tipo.aTexto(elemento).split('\n')) {
      console.log(linea);
    }
  }
);
Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
  nombre: 'Mostrar',
  prototipo: Object,
  funcionAInvocar: "Mostrar"
});

Mila.Base.ReemplazarFuncion_De_Por_ = function(nombreFuncion, objeto, nuevaFuncion) {
  Mila.Contrato({
    Proposito: "Reemplazar la función con el nombre dado en el objeto dado por la función dada",
    Precondiciones: [
      "El objeto dado tiene definida una función con el nombre dado",
      objeto.defineLaClave_(nombreFuncion)
    ],
    Parametros: [
      [nombreFuncion, Mila.Tipo.Texto],
      objeto, // cualquier tipo
      [nuevaFuncion, Mila.Tipo.Funcion, "Toma como parámetro la función original y devuelve la nueva función"]
    ]
  });
  const funcionOriginal = objeto[nombreFuncion];
  objeto[nombreFuncion] = nuevaFuncion(funcionOriginal);
};