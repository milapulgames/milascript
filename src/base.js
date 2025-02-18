Mila.Modulo({
  define:"Mila.Base",
  usa:["documentacion","tipo"]
});

// Modificación de prototipos

Mila.Base.DefinirFuncionEnPrototipo_ = function(configuracion) {
  // Define una función en un prototipo.
    // configuracion es un objeto que determina cómo definir la función.
      // Debe incluir el campo funcion, la función que se invocará en el prototipo.
      // Debe incluir el campo prototipo, el objeto en cuyo prototipo se definirá la función.
      // Puede incluir el campo nombre, una cadena de texto correspondiente al nombre con el que se accederá a la función en el prototipo.
        // Si no se incluye se usa el nombre de la función.
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
  // Define en un prototipo una función de instancia.
    // configuracion es un objeto que determina cómo definir la función.
      // Debe incluir el campo prototipo, el objeto en cuyo prototipo se definirá la función.
      // Debe incluir el campo nombre, una cadena de texto correspondiente al nombre con el que se accederá a la función en el prototipo.
      // Debe incluir el campo codigo, una cadena de texto correspondiente al cuerpo de la función.
      // Puede incluir el campo parametros, una lista de cadenas de texto correspondientes a los nombres de los parámetros que espera la función.
        // En caso de no inlcuirse este campo, se asume que la función no toma parámetros.
  const prototipo = configuracion.prototipo;
  const nombre = configuracion.nombre;
  const codigo = `return ${configuracion.codigo};`;
  const parametros = configuracion.parametros || [];
  const funcion = Function.apply(this, parametros.concat([codigo]));
  Mila.Base.DefinirFuncionEnPrototipo_({nombre, prototipo, funcion});
};

Mila.Base.DefinirFuncionDeInstanciaAPartirDe_ = function(configuracion) {
  // Define en un prototipo una función de instancia a partir de otra función que toma a la instancia como argumento.
    // configuracion es un objeto que determina cómo definir la función.
      // Debe incluir el campo prototipo, el objeto en cuyo prototipo se definirá la función.
      // Debe incluir el campo nombre, una cadena de texto correspondiente al nombre con el que se accederá a la función en el prototipo.
      // Puede incluir el campo cantidadDeParametros, un entero correspondiente a la cantidad de parámetros que espera la función.
        // En caso de no incluirse este campo, se asume que la función no toma parámetros.
      // Debe incluir el campo funcionAInvocar, una cadena de texto correspondiente a la representación textual de la función a la que invocar
        // (esta debe esperar un parámetro más que la que se está definiendo, correspondiente a la instancia this).
      // Puede incluir el campo posicionDeThis, un entero correspondiente a la posición del argumento que corresponde a la instancia this en la invocación a la otra función.
        // En caso de no inlcuirse este campo, se asume que es el primer argumento.
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
  // Indica si la condición dada vale.
    // condicion es un booleano o una función que no toma argumentos y devuelve un booleano.
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
  // Registra la funcion dada como una función global que será accedida a través de su nombre.
    // funcion es una función cualquiera.
  let nombre = funcion.name;
  if (nombre in Mila.entorno().universo) {
    Mila.Error(`Ya se registró una función global con el nombre ${nombre}`);
  } else {
    Mila.entorno().universo[nombre] = funcion;
  }
};

Mila.Base.RegistrarFuncion_(
  function unoSi_CeroSiNo(condicion) {
    // Describe uno si se cumple la condición dada y cero si no.
      // condicion es un booleano o una función que no toma argumentos y devuelve un booleano.
    return Mila.Base.vale(condicion) ? 1 : 0;
  }
);

Mila.Base.RegistrarFuncion_(
  function minimoEntre_Y_(elemento1, elemento2) {
    // Describe el mínimo elemento entre los dos elementos dados.
    // PRE: Los elementos dados son del mismo tipo.
    // PRE: El tipo de los elementos dados define una relación de orden.
    return elemento1.esMenorOIgualA_(elemento2) ? elemento1 : elemento2;
  }
);

Mila.Base.RegistrarFuncion_(
  function maximoEntre_Y_(elemento1, elemento2) {
    // Describe el máximo elemento entre los dos elementos dados.
    // PRE: Los elementos dados son del mismo tipo.
    // PRE: El tipo de los elementos dados define una relación de orden.
    return elemento1.esMayorOIgualA_(elemento2) ? elemento1 : elemento2;
  }
);

Mila.Base.ReemplazarFuncion_De_Por_ = function(nombreFuncion, objeto, nuevaFuncion) {
  // Reemplaza la función con el nombre dado en el objeto dado por la función dada.
    // nombreFuncion es una cadena de texto correspondiente al nombre de la función a reemplazar.
    // objeto es un objeto, en el cual se reemplazará la función con el nombre dado.
    // nuevaFuncion es una función que toma como parámetro la función original y devuelve la nueva función.
  // PRE: el objeto dado tiene definida una función con el nombre dado.
  const funcionOriginal = objeto[nombreFuncion];
  objeto[nombreFuncion] = nuevaFuncion(funcionOriginal);
};