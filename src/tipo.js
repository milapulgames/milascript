Mila.Modulo({
  define:"Mila.Tipo",
  necesita:["base","objeto"],
  usa:["lista"]
});

Mila.Tipo._Definir_EnPrototipo_ = function(nombre, prototipo, posicionDeThis=0) {
  // Define en un prototipo una función de instancia a partir de otra función definida en este módulo.
    // nombre es una cadena de texto correspondiente al nombre de la función a definir (la misma que la que ya está definida).
    // prototipo es el objeto en cuyo prototipo se definirá la función.
    // posicionDeThis es un entero correspondiente a la posición del argumento que corresponde a la instancia this en la invocación a la función del módulo (0 si se omite).
  // PRE: Hay una función con el nombre dado en este módulo (Mila.Tipo).
  Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
    prototipo,
    nombre,
    cantidadDeParametros: Mila.Tipo[nombre].length-1,
    posicionDeThis,
    funcionAInvocar: `Mila.Tipo.${nombre}`
  });
};

Mila.Tipo._tipos = {}; // Mapa de tipos definidos.
Mila.Tipo._tiposPorPrototipo = {}; // Mapa de tipos asociados a un prototipo (las claves son los prototipos y los valores sus tipos asociados).
Mila.Tipo._tiposSinPrototipo = []; // Lista de tipos que no están asociados a ningún prototipo (más que Object).

Mila.Tipo._Tipo = function(dataTipo) {
  // Constructor del prototipo para el tipo Tipo.
  for (let clave in dataTipo) {
    this[clave] = dataTipo[clave];
  }
};

Mila.Tipo.Registrar = function(dataTipo) {
  // Registra un tipo a partir de la información dada.
    // dataTipo es un objeto que determina las características del tipo.
      // Debe incluir el campo nombre, una cadena de texto correspondiente al nombre del tipo.
      // Puede incluir el campo prototipo, un objeto a cuyo prototipo asociar el tipo definido.
        // En caso de no inlcuirse este campo, el tipo no se asocia a ningún prototipo.
      // Debe incluir el campo es que permita determinar si un elemento es del tipo.
        // Si se incluye el campo prototipo, el campo es puede ser una función que tome un elemento del prototipo y devuelva si el elemento
        // es del tipo o puede ser una cadena de texto correspondiente al nombre de la función que determina si un elemento es del tipo
        // (la implementación de la función únicamente verificará que el elemento tenga el prototipo adecuado).
        // Si no se incluye el campo prototipo, el campo es debe ser una función que tome un elemento y devuelva si el elemento es del tipo.
      // Puede incluir el campo igualdad que puede ser una función que tome dos elementos del tipo y devuelva si los elementos son
        // observacionalmente iguales o una lista de nombres de campos correspondientes a los campos que deben ser iguales.
        // En caso de no inlcuirse este campo, se asume que el tipo no tiene relación de equivalencia.
      // Puede incluir el campo orden, una función que toma dos elementos del tipo y devuelve si el primero está antes que el segundo en la
        // relación de orden del tipo.
        // En caso de no inlcuirse este campo, se asume que el tipo no tiene relación de orden.
      // Debe incluir el campo strTipo, una función que devuelve la representación textual del tipo.
      // Debe incluir el campo strInstancia, una función que toma un elemento del tipo y devuelve su representación textual.
        // Si se incluye el campo prototipo este campo puede omitirse y se utiliza en su lugar la función toString del prototipo.
  // Falla si ya se registró antes un tipo con el mismo nombre.
  // Falla si el nombre colisiona con algún campo ya existente.
  if (dataTipo.nombre in Mila.Tipo._tipos) {
    Mila.Error(`Ya se registró un tipo con el nombre ${dataTipo.nombre}.`);
  } else if (dataTipo.nombre in Mila.Tipo) {
    Mila.Error(`No se puede registrar un tipo con el nombre ${dataTipo.nombre} porque ese campo ya está en uso.`);
  } else {
    const nuevoTipo = new Mila.Tipo._Tipo(dataTipo);
    Mila.Tipo._tipos[nuevoTipo.nombre] = nuevoTipo;
    Mila.Tipo[nuevoTipo.nombre] = nuevoTipo;
    if ('prototipo' in nuevoTipo) {
      Mila.Tipo._tiposPorPrototipo[nuevoTipo.prototipo.name] = nuevoTipo;
      if ('strInstancia' in nuevoTipo) {
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: 'toString',
          codigo: `Mila.Tipo._tipos.${nuevoTipo.nombre}.strInstancia(this)`
        });
      } else {
        nuevoTipo.strInstancia = function(elemento) { return nuevoTipo.prototipo.prototype.toString.call(elemento); }
      }
      if (typeof nuevoTipo.es == 'string') {
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: nuevoTipo.es,
          codigo: `true`
        });
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: Object,
          nombre: nuevoTipo.es,
          codigo: `false`
        });
        nuevoTipo.es = function(elemento) {
          return Object.getPrototypeOf(elemento) === nuevoTipo.prototipo.prototype;
        };
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: 'tipo',
          codigo: `Mila.Tipo._tipos.${nuevoTipo.nombre}`
        });
      } else if (typeof nuevoTipo.es == 'function') {
        nuevoTipo.validacionAdicional = nuevoTipo.es
        Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
          prototipo: nuevoTipo.prototipo,
          nombre: nuevoTipo.es.name,
          funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.es`
        });
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: Object,
          nombre: nuevoTipo.es.name,
          codigo: `false`
        });
        nuevoTipo.es = function(elemento) {
          return Object.getPrototypeOf(elemento) === nuevoTipo.prototipo.prototype && nuevoTipo.validacionAdicional(elemento);
        };
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: 'tipo',
          codigo: `Mila.Tipo._tipos.${nuevoTipo.nombre}.validacionAdicional(this) ? Mila.Tipo._tipos.${nuevoTipo.nombre} : Mila.Tipo._tipoSinPrototipo(this)`
        });
      }
    } else {
      if (nuevoTipo.nombre != "Registro") {
        // Este es el tipo por defecto así que no lo incluyo.
        Mila.Tipo._tiposSinPrototipo.push(nuevoTipo.nombre);
      }
      if (typeof nuevoTipo.es == 'function' && nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
        Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
          prototipo: Object,
          nombre: nuevoTipo.es.name,
          funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.es`
        });
      }
    }
    if ('igualdad' in nuevoTipo) {
      if (Array.isArray(nuevoTipo.igualdad)) {
        const campos = nuevoTipo.igualdad;
        nuevoTipo.igualdad = function(elemento1, elemento2) {
          return campos.every(x => Mila.Tipo.esIgualA_(elemento1[x], elemento2[x]));
        };
      }
    } else {
      nuevoTipo.igualdad = (elemento1, elemento2) =>
        Mila.Error(`Los elementos de tipo ${nuevoTipo.nombre} no se pueden comparar por igualdad.`);
    }
    if (!('orden' in nuevoTipo)) {
      nuevoTipo.orden = (elemento1, elemento2) =>
        Mila.Error(`Los elementos de tipo ${nuevoTipo.nombre} no tienen relación de orden.`);
    }
  }
};

// Observadores de tipos

Mila.Tipo.tipo = function(elemento) {
  // Describe el tipo del elemento dado.
    // elemento puede ser cualquier dato.
  if (Mila.Tipo.esNada(elemento)) {
    return Mila.Tipo.Nada;
  }
  let prototipo = Object.getPrototypeOf(elemento);
  if (prototipo !== null && prototipo.constructor.name in Mila.Tipo._tiposPorPrototipo) {
    return Mila.Tipo._tiposPorPrototipo[prototipo.constructor.name];
  }
  return Mila.Tipo._tipoSinPrototipo(elemento);
};

Mila.Tipo._tipoSinPrototipo = function(elemento) {
  // Describe el tipo del elemento dado, que no está asociado a ningún prototipo.
    // elemento puede ser cualquier dato.
  // PRE: El tipo del elemento dado no está asociado a un prototipo.
  for (let nombreTipo of Mila.Tipo._tiposSinPrototipo) {
    if (Mila.Tipo._tipos[nombreTipo].es(elemento)) {
      return Mila.Tipo._tipos[nombreTipo];
    }
  }
  return Mila.Tipo.Registro;
};
Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
  prototipo: Object,
  nombre: 'tipo',
  funcionAInvocar: `Mila.Tipo._tipoSinPrototipo`
});

Mila.Tipo.esUnTipo = function(elemento) {
  // Indica si el elemento dado es un tipo.
    // elemento puede ser cualquier dato.
  return Mila.Tipo.esAlgo(elemento) && Object.getPrototypeOf(elemento) == Mila.Tipo._Tipo.prototype && elemento.nombre in Mila.Tipo._tipos;
};
Mila.Tipo._Definir_EnPrototipo_('esUnTipo', Object);

Mila.Tipo.esElIdentificadorDeUnTipo = function(elemento) {
  // Indica si el elemento dado es un identificador de tipo.
    // elemento puede ser cualquier dato (si no es un texto el resultado es falso).
  return Object.getPrototypeOf(elemento) == String.prototype && elemento in Mila.Tipo._tipos;
};
Mila.Tipo._Definir_EnPrototipo_('esElIdentificadorDeUnTipo', Object);

Mila.Tipo.esDeTipo_ = function(elemento, tipoOIdentificadorDeTipo) {
  // Indica si el elemento dado es del tipo dado.
    // elemento puede ser cualquier dato.
    // tipoOIdentificadorDeTipo puede ser un tipo o un indentificador de tipo (una cadena de texto correspondiente al nombre del tipo).
  let tipo = Mila.Tipo.esElIdentificadorDeUnTipo(tipoOIdentificadorDeTipo)
    ? Mila.Tipo._tipos[tipoOIdentificadorDeTipo]
    : tipoOIdentificadorDeTipo
  ;
  return tipo.es(elemento);
};
Mila.Tipo._Definir_EnPrototipo_('esDeTipo_', Object);

Mila.Tipo.esNada = function(elemento) {
  // Indica si el elemento dado es un valor nulo.
  return elemento === Mila.Nada || elemento === null || elemento === undefined ||
  (Object.getPrototypeOf(elemento) == Number.prototype && isNaN(elemento));
};

Mila.Tipo.esAlgo = function(elemento) {
  // Indica si el elemento dado describe algo (no es un valor nulo).
  return !Mila.Tipo._tipos.Nada.es(elemento);
};
Mila.Tipo._Definir_EnPrototipo_('esAlgo', Object);

Mila.Tipo.aTexto = function(elemento) {
  // Describe la representación textual del elemento dado.
  return Mila.Tipo.tipo(elemento).strInstancia(elemento);
}
Mila.Tipo._Definir_EnPrototipo_('aTexto', Object);

Mila.Tipo.esIgualA_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es observacionalmente igual al segundo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de equivalencia.
  return Mila.Tipo.tipo(elemento1).igualdad(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esIgualA_', Object);

Mila.Tipo.esDistintoA_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es observacionalmente distinto al segundo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de equivalencia.
  return !Mila.Tipo.esIgualA_(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esDistintoA_', Object);

Mila.Tipo.esDelMismoTipoQue_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es del mismo tipo que el segundo.
    // elemento1 y elemento2 pueden ser datos cualesquiera.
  return Mila.Tipo.esIgualA_(Mila.Tipo.tipo(elemento1), Mila.Tipo.tipo(elemento2));
};
Mila.Tipo._Definir_EnPrototipo_('esDelMismoTipoQue_', Object);

Mila.Tipo.esDeOtroTipoQue_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es un tipo diferente al del segundo.
    // elemento1 y elemento2 pueden ser datos cualesquiera.
  return !Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esDeOtroTipoQue_', Object);

Mila.Tipo.esMenorA_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es menor al segundo según la relación de orden del tipo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de orden.
  return Mila.Tipo.tipo(elemento1).orden(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esMenorA_', Object);

Mila.Tipo.esMayorA_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es mayor al segundo según la relación de orden del tipo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de orden.
  return Mila.Tipo.tipo(elemento1).orden(elemento2, elemento1);
};
Mila.Tipo._Definir_EnPrototipo_('esMayorA_', Object);

Mila.Tipo.esMenorOIgualA_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es menor o igual al segundo según la relación de orden del tipo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de orden y una relación de equivalencia.
  return Mila.Tipo.tipo(elemento1).igualdad(elemento1, elemento2) || Mila.Tipo.tipo(elemento1).orden(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esMenorOIgualA_', Object);

Mila.Tipo.esMayorOIgualA_ = function(elemento1, elemento2) {
  // Indica si el primer elemento dado es mayor o igual al segundo según la relación de orden del tipo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de orden y una relación de equivalencia.
  return Mila.Tipo.tipo(elemento1).igualdad(elemento1, elemento2) || Mila.Tipo.tipo(elemento1).orden(elemento2, elemento1);
};
Mila.Tipo._Definir_EnPrototipo_('esMayorOIgualA_', Object);

Mila.Tipo.estaEntre_Y_Inclusive = function(elemento, limiteInferior, limiteSuperior) {
  // Indica si el primer elemento dado está entre los otros dos según la relación de orden del tipo.
    // elemento1 y elemento2 pueden ser datos cualesquiera pero del mismo tipo.
  // PRE: Los elementos dados son del mismo tipo.
  // PRE: El tipo de los elementos dados tiene definida una relación de orden y una relación de equivalencia.
  return Mila.Tipo.esMayorOIgualA_(elemento, limiteInferior) && Mila.Tipo.esMenorOIgualA_(elemento, limiteSuperior);
};
Mila.Tipo._Definir_EnPrototipo_('estaEntre_Y_Inclusive', Object);

// Tipo Tipo: el tipo de los tipos.

Mila.Tipo.Registrar({
  nombre: "Tipo",
  prototipo: Mila.Tipo._Tipo,
  es: Mila.Tipo.esUnTipo,
  igualdad: function(elemento1, elemento2) {
    return elemento1.nombre == elemento2.nombre;
  },
  strTipo: function() {
    return "Tipo";
  },
  strInstancia: function(elemento) {
    return elemento.strTipo();
  }
});

// Tipo Nada: el tipo de los valores nulos (null, undefined, NaN).

Mila.Nada = {};

Mila.Tipo.Registrar({
  nombre: "Nada",
  es: function esNada(elemento) {
    return Mila.Tipo.esNada(elemento);
  },
  igualdad: function(elemento1, elemento2) {
    return true;
  },
  strTipo: function() {
    return "Nada";
  },
  strInstancia: function(elemento) {
    return "Nada";
  } 
});

// Tipo Booleano: el tipo de los valores de verdad Cierto y Falso.

Mila.Tipo.Registrar({
  nombre: "Booleano",
  prototipo: Boolean,
  es: "esUnBooleano",
  igualdad: function(elemento1, elemento2) {
    return elemento1 == elemento2;
  },
  strTipo: function() {
    return "Booleano";
  },
  strInstancia: function(elemento) {
    return elemento.valueOf() ? "Cierto" : "Falso";
  }
});

// Tipo Número: el tipo de los números, tanto enteros como flotantes.

Mila.Tipo.Registrar({
  nombre: "Numero",
  prototipo: Number,
  es: function esUnNumero(elemento) {
    return !isNaN(elemento);
  },
  igualdad: function(elemento1, elemento2) {
    return elemento1 == elemento2;
  },
  orden: function(elemento1, elemento2) {
    return elemento1 < elemento2;
  },
  strTipo: function() {
    return "Número";
  }
});

// Tipo Texto: el tipo de las cadenas de texto.

Mila.Tipo.Registrar({
  nombre: "Texto",
  prototipo: String,
  es: "esUnTexto",
  igualdad: function(elemento1, elemento2) {
    return elemento1 == elemento2;
  },
  orden: function(elemento1, elemento2) {
    return elemento1 < elemento2;
  },
  strTipo: function() {
    return "Texto";
  },
  strInstancia: function(elemento) {
    return elemento.valueOf();
  }
});

// Tipo Función: el tipo de las funciones.

Mila.Tipo.Registrar({
  nombre: "Funcion",
  prototipo: Function,
  es: "esUnaFuncion",
  igualdad: function(elemento1, elemento2) {
    return Mila.Tipo.esIgualA_(Mila.Tipo.aTexto(elemento1), Mila.Tipo.aTexto(elemento2));
  },
  strTipo: function() {
    return "Función";
  }
});

// Tipo Registro: el tipo de todos los demás objetos que tienen a Object como prototipo.

Mila.Tipo.Registrar({
  nombre: "Registro",
  es: function esUnRegistro(elemento) {
    return Object.getPrototypeOf(elemento) == Object.prototype &&
      Mila.Tipo.esIgualA_(Mila.Tipo._tipoSinPrototipo(elemento), Mila.Tipo.Registro);
  },
  igualdad: function(elemento1, elemento2) {
    return(
      Mila.Objeto.defineLasMismasClavesQue_YConLosMismosTipos(elemento1, elemento2)
      &&
      Mila.Objeto.clavesDefinidas(elemento1).todosCumplen_((clave) => Mila.Tipo.esIgualA_(elemento1[clave], elemento2[clave]))
    );
  },
  strTipo: function() {
    return "Registro";
  },
  strInstancia: function(elemento) {
    return `{${Mila.Objeto.clavesDefinidas(elemento).map(function(k) {
      return `${k}:${Mila.Tipo.aTexto(elemento[k])}`
    }).join(', ')}}`;
  }
});