Mila.Modulo({
  define:"Mila.Base",
  necesita:"documentacion",
  usa:["tipo"]
});

// Modificación de prototipos

Mila.Base.DefinirFuncionEnPrototipo_ = function(configuracion) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función",
    Parametros: [
      configuracion, Mila.Tipo.Registro, "\
      !funcion, la función que se invocará en el prototipo.\
      !prototipo, el objeto en cuyo prototipo se definirá la función.\
      ?nombre, una cadena de texto correspondiente al nombre con el que se accederá\
        a la función en el prototipo.\
        * Si no se incluye se usa el nombre de la función.\
      "
    ]
  });
  const funcion = configuracion.funcion;
  const prototipo = configuracion.prototipo;
  const nombre = configuracion.nombre || funcion.name;
  Object.defineProperty(prototipo.prototype, nombre, {
    value: funcion,
    enumerable: false,
    writable: true
  });
};

Mila.Base.DefinirFuncionDeInstancia_ = function(configuracion) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función de instancia",
    Parametros: [
      configuracion, Mila.Tipo.Registro, "\
      !prototipo, el objeto en cuyo prototipo se definirá la función.\
      !nombre, una cadena de texto correspondiente al nombre con el\
        que se accederá a la función en el prototipo.\
      !codigo, una cadena de texto correspondiente al cuerpo de la función.\
      ?parametros, una lista de cadenas de texto correspondientes a los\
        nombres de los parámetros que espera la función.\
        * En caso de no inlcuirse este campo, se asume que la función no toma parámetros.\
      "
    ]
  });
  const prototipo = configuracion.prototipo;
  const nombre = configuracion.nombre;
  const codigo = `return ${configuracion.codigo};`;
  const parametros = configuracion.parametros || [];
  const funcion = Function.apply(this, parametros.concat([codigo]));
  Mila.Base.DefinirFuncionEnPrototipo_({nombre, prototipo, funcion});
};

Mila.Base.DefinirFuncionDeInstanciaAPartirDe_ = function(configuracion) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función de instancia a partir de otra función\
      que toma a la instancia como argumento",
    Parametros: [
      configuracion, Mila.Tipo.Registro, "\
      !prototipo: el objeto en cuyo prototipo se definirá la función.\
      !nombre: una cadena de texto correspondiente al nombre con el que se accederá a\
        la función en el prototipo.\
      ?cantidadDeParametros, un entero correspondiente a la cantidad de parámetros que espera la función.\
        * En caso de no incluirse este campo, se asume que la función no toma parámetros.\
      !funcionAInvocar, una cadena de texto correspondiente a la representación textual de la\
        función a la que invocar (esta debe esperar un parámetro más que la que se\
        está definiendo, correspondiente a la instancia this).\
      ?posicionDeThis, un entero correspondiente a la posición del argumento que corresponde\
        a la instancia this en la invocación a la otra función.\
        * En caso de no inlcuirse este campo, se asume que es el primer argumento.\
      "
    ]
  });
  const prototipo = configuracion.prototipo;
  const nombre = configuracion.nombre;
  const cantidadDeParametros = configuracion.cantidadDeParametros || 0;
  const posicionDeThis = configuracion.posicionDeThis || 0;
  const funcionAInvocar = configuracion.funcionAInvocar;

  const parametros = [];
  const argumentos = [];
  if (cantidadDeParametros == 0) {
    argumentos.push("this");
  } else {
    for (let i=0; i<cantidadDeParametros; i++) {
      if (i==posicionDeThis) {
        argumentos.push("this");
      }
      parametros.push(`p${i}`);
      argumentos.push(`p${i}`);
    }
  }
  const codigo = `${funcionAInvocar}(${argumentos.join(", ")})`;
  Mila.Base.DefinirFuncionDeInstancia_({prototipo, nombre, codigo, parametros});
};

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
Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
  nombre: 'vale',
  prototipo: Boolean,
  funcionAInvocar: "Mila.Base.vale"
});
Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
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
Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
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
      objeto // cualquier tipo
      [nuevaFuncion, Mila.Tipo.Funcion, "Toma como parámetro la función original y devuelve la nueva función"]
    ]
  });
  const funcionOriginal = objeto[nombreFuncion];
  objeto[nombreFuncion] = nuevaFuncion(funcionOriginal);
};