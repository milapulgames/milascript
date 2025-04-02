Mila.Modulo({
  define:"Mila.JS",
  necesita:["documentacion"],
  usa:"tipo"
});

// Modificación de prototipos

Mila.JS.DefinirFuncionEnPrototipo_ = function(configuracion) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función",
    Parametros: [
      configuracion /*
        !funcion, la función que se invocará en el prototipo.
        !prototipo, el objeto en cuyo prototipo se definirá la función.
        ?nombre, una cadena de texto correspondiente al nombre con el que se accederá
          a la función en el prototipo.
          * Si no se incluye se usa el nombre de la función.
      */
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

Mila.JS.DefinirFuncionDeInstancia_ = function(configuracion) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función de instancia",
    Parametros: [
      configuracion /*
        !prototipo, el objeto en cuyo prototipo se definirá la función.
        !nombre, una cadena de texto correspondiente al nombre con el
          que se accederá a la función en el prototipo.
        !codigo, una cadena de texto correspondiente al cuerpo de la función.
        ?parametros, una lista de cadenas de texto correspondientes a los
          nombres de los parámetros que espera la función.
          * En caso de no inlcuirse este campo, se asume que la función no toma parámetros.
      */
    ]
  });
  const prototipo = configuracion.prototipo;
  const nombre = configuracion.nombre;
  const codigo = `return ${configuracion.codigo};`;
  const parametros = configuracion.parametros || [];
  const funcion = Function.apply(this, parametros.concat([codigo]));
  Mila.JS.DefinirFuncionEnPrototipo_({nombre, prototipo, funcion});
};

Mila.JS.DefinirFuncionDeInstanciaAPartirDe_ = function(configuracion) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función de instancia a partir de otra función\
      que toma a la instancia como argumento",
    Parametros: [
      configuracion /*
        !prototipo: el objeto en cuyo prototipo se definirá la función.
        !nombre: una cadena de texto correspondiente al nombre con el que se accederá a
          la función en el prototipo.
        ?cantidadDeParametros, un entero correspondiente a la cantidad de parámetros que espera la función.
          * En caso de no incluirse este campo, se asume que la función no toma parámetros.
        !funcionAInvocar, una cadena de texto correspondiente a la representación textual de la
          función a la que invocar (esta debe esperar un parámetro más que la que se
          está definiendo, correspondiente a la instancia this).
        ?posicionDeThis, un entero correspondiente a la posición del argumento que corresponde
          a la instancia this en la invocación a la otra función.
          * En caso de no inlcuirse este campo, se asume que es el primer argumento.
      */
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
  Mila.JS.DefinirFuncionDeInstancia_({prototipo, nombre, codigo, parametros});
};