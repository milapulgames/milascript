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
Mila.Tipo._tiposParametricos = {}; // Mapa de objetos usados como base para los tipos paramétricos.
Mila.Tipo._tiposPorPrototipo = {}; // Mapa de tipos asociados a un prototipo (las claves son los prototipos y los valores son los nombres de sus tipos asociados).
Mila.Tipo._tiposSinPrototipo = []; // Lista de nombres de tipos que no están asociados a ningún prototipo (más que Object).

Mila.Tipo._Tipo = function Tipo(dataTipo) {
  // Constructor del prototipo para el tipo Tipo.
  for (let clave in dataTipo) {
    if (!['puedeSer','tipoPara'].includes(clave)) { // Sólo para las definiciones de los tipos paramétricos
      this[clave] = dataTipo[clave];
    }
  }
};

Mila.Tipo.Registrar = function(dataTipo) {
  // Registra un tipo a partir de la información dada.
    // dataTipo es un objeto que determina las características del tipo.
      // Debe incluir el campo nombre, una cadena de texto correspondiente al nombre del tipo.
      // Puede incluir el campo prototipo, un objeto a cuyo prototipo asociar el tipo definido.
        // En caso de no inlcuirse este campo, el tipo no se asocia a ningún prototipo.
      // Puede incluir el campo subtipoDe, un tipo o un identificador de tipo correspondiente al tipo del cual el tipo que se está registrando
        // es subtipo. Los campos que no se declaren se heredan de él (excepto prototipo).
      // Puede incluir el campo esSubtipoDe_, una función que tome un tipo y devuelva si el tipo que se está registrando es subtipo de él.
        // En caso de no inlcuirse este campo, la función simplemente verifica que el tipo dado pertenezca a la lista de subtipos de este.
      // Puede incluir el campo es que permita determinar si un elemento es del tipo.
        // Si se incluye el campo prototipo, el campo es puede ser una función que tome un elemento del prototipo y devuelva si el elemento
          // es del tipo o puede ser una cadena de texto correspondiente al nombre de la función que determina si un elemento es del tipo
          // (la implementación de la función únicamente verificará que el elemento tenga el prototipo adecuado). Omitir este campo tiene
          // el mismo efecto que pasar una cadena de texto.
        // Si se incluye el campo subtipoDe, el campo es no se puede omitir y debe ser una función que tome un elemento del supertipo y
          // devuelva si el elemento  es también del tipo que se está registrando.
        // Si no se incluye el campo prototipo, el campo es no se puede omitir y puede ser una función que tome un elemento y devuelva
          // si el elemento es del tipo  o un objeto cuyas claves sean los campos que el elemento debe tener y sus significados los
          // tipos de dichos campos.
      // Puede incluir el campo igualdad que puede ser una función que tome dos elementos del tipo y devuelva si los elementos son
        // observacionalmente iguales o una lista de nombres de campos correspondientes a los campos que deben ser iguales.
        // En caso de no inlcuirse este campo, se asume que el tipo no tiene relación de equivalencia.
      // Puede incluir el campo orden, una función que toma dos elementos del tipo y devuelve si el primero está antes que el segundo en la
        // relación de orden del tipo.
        // En caso de no inlcuirse este campo, se asume que el tipo no tiene relación de orden.
      // Puede incluir el campo strTipo que puede ser un texto correspondiente a la representación textual del tipo o una función
        // que tome como parámetro al tipo y devuelva dicha representación.
        // En caso de no inlcuirse este campo, se asume que la representación textual del tipo es igual a su nombre.
      // Puede incluir el campo strInstancia, una función que toma un elemento del tipo y devuelve su representación textual.
        // En caso de no inlcuirse este campo, si se incluye el campo prototipo (ya sea en este o en alguno de sus supertipos) se utiliza
          // en su lugar la función toString del prototipo y si no, se utiliza la función strInstancia del tipo Registro.
      // Puede incluir el campo parametros, una lista de textos correspondientes a los nombres de los parámetros en caso de que se esté
        // registrando un tipo paramétrico. En tal caso, se pueden incluir además los campos puedeSer (una función que toma un elemento
        // y devuelve un booleano correspondiente a si el elemento puede ser del tipo paramétrico, para alguna combinación de parámetros)
        // y tipoPara (una función que toma un elemento y, asumiendo que el resultado de puedeSer con dicho elemento es verdadero, devuelve
        // una instanciación del tipo paramétrico para tal elemento).
      // Si incluye el campo parametros puede incluir también el campo inicializacion, un texto que se agregará como código a la función de
        // inicialización del tipo cuando se parametrice.
      // Puede incluir el campo inferible, un booleano que indique si este tipo se debe tener en cuenta al inferir el tipo de una expresión.
        // En caso de no inlcuirse este campo, se asume que sí.
  // Falla si ya se registró antes un tipo con el mismo nombre.
  // Falla si el nombre colisiona con algún campo ya existente.
  // Falla si se pasa el campo prototipo y ya se registró antes un tipo con ese mismo prototipo.
  if (dataTipo.nombre in Mila.Tipo._tipos) {
    Mila.Error(`Ya se registró un tipo con el nombre ${dataTipo.nombre}.`);
  } else if (dataTipo.nombre in Mila.Tipo) {
    Mila.Error(`No se puede registrar un tipo con el nombre ${dataTipo.nombre} porque ese campo ya está en uso.`);
  } else {
    if ('parametros' in dataTipo && 'prototipo' in dataTipo) {
      Mila.Error(`No se puede registrar un tipo paramétrico con prototipo.`);
    }
    const nuevoTipo = Object.assign({}, dataTipo);
    nuevoTipo.subtipos = [];
    nuevoTipo.supertipos = [];
    let supertipo = null;
    if ('subtipoDe' in nuevoTipo) {
      supertipo = Mila.Tipo.esUnTipo(nuevoTipo.subtipoDe) ? nuevoTipo.subtipoDe : Mila.Tipo._tipos[nuevoTipo.subtipoDe];
      for (let clave of ['igualdad','orden','strInstancia']) { // Claves heredadas a los subtipos
        if (!(clave in nuevoTipo)) {
          nuevoTipo[clave] = supertipo[clave];
        }
      }
      supertipo.subtipos.push(nuevoTipo.nombre);
      nuevoTipo.supertipos.push(supertipo.nombre);
    }
    if ('prototipo' in nuevoTipo) {
      if (!('name' in nuevoTipo.prototipo) || (nuevoTipo.prototipo.name.length == 0)) {
        Mila.Error(`Prototipo inválido: debe tener un nombre (la función se debe definir "... .NOMBRE = function NOMBRE() {...")`);
      }
      if (nuevoTipo.prototipo.name in Mila.Tipo._tiposPorPrototipo) {
        Mila.Error(`Ya se registró un tipo con el prototipo ${nuevoTipo.prototipo.name}.`);
      }
      Mila.Tipo._tiposPorPrototipo[nuevoTipo.prototipo.name] = nuevoTipo.nombre;
      if ('strInstancia' in nuevoTipo) {
        Mila.Base.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: 'toString',
          codigo: `Mila.Tipo._tipos.${nuevoTipo.nombre}.strInstancia(this)`
        });
      } else {
        nuevoTipo.strInstancia = function(elemento) { return nuevoTipo.prototipo.prototype.toString.call(elemento); }
      }
      nuevoTipo.validacionAdicionalPrototipo = function(elemento) { return true; };
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
      } else if (typeof nuevoTipo.es == 'function') {
        nuevoTipo.validacionAdicionalPrototipo = nuevoTipo.es;
        if (nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
          Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
            prototipo: nuevoTipo.prototipo,
            nombre: nuevoTipo.es.name,
            funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.validacionAdicionalPrototipo`
          });
          Mila.Base.DefinirFuncionDeInstancia_({
            prototipo: Object,
            nombre: nuevoTipo.es.name,
            codigo: `false`
          });
        }
      }
      nuevoTipo.es = Mila.Tipo._esTipoPrototipo(nuevoTipo, nuevoTipo.prototipo.prototype);
      Mila.Base.DefinirFuncionDeInstancia_({
        prototipo: nuevoTipo.prototipo,
        nombre: 'tipo',
        codigo: `Mila.Tipo._tipoConPrototipo("${nuevoTipo.nombre}", this)`
      });
    } else {
      if (supertipo !== null) {
        Mila.Tipo._Registrar_ComoSubtipoDe_(nuevoTipo, supertipo);
      } else {
        if (nuevoTipo.nombre != "Registro") {
          // Este es el tipo por defecto así que no lo incluyo.
          Mila.Tipo._tiposSinPrototipo.push(nuevoTipo.nombre);
        }
        if (typeof nuevoTipo.es == 'object') {
          const definicion = nuevoTipo.es;
          nuevoTipo.es = function(elemento) {
            return Mila.Objeto.todosCumplen_(definicion, function(clave, valor) {
              return (
                clave.startsWith("?") &&
                (!elemento.defineLaClave_(clave.substr(1)) || Mila.Tipo.esDeTipo_(elemento[clave.substr(1)], valor)))
              || (
                !clave.startsWith("?") && elemento.defineLaClave_(clave) && Mila.Tipo.esDeTipo_(elemento[clave], valor)
              );
            });
          }
        } else if (typeof nuevoTipo.es == 'function' && nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
          Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
            prototipo: Object,
            nombre: nuevoTipo.es.name,
            funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.es`
          });
        }
      }
      if (!('strInstancia' in nuevoTipo)) {
        nuevoTipo.strInstancia = function(elemento) { return Mila.Tipo.Registro.strInstancia(elemento); };
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
    if ('strTipo' in nuevoTipo) {
      if (typeof nuevoTipo.strTipo == 'string') {
        const strTipo = nuevoTipo.strTipo;
        nuevoTipo.strTipo = function(tipo) { return strTipo; };
      }
    } else {
      nuevoTipo.strTipo = function(tipo) { return nuevoTipo.nombre; };
    }
    if (!('inferible' in nuevoTipo)) {
      nuevoTipo.inferible = true;
    }
    let definicionTipo;
    if ('parametros' in nuevoTipo) {
      definicionTipo = Mila.Tipo._tipoParametrico(nuevoTipo);
    } else {
      definicionTipo = new Mila.Tipo._Tipo(nuevoTipo);
    }
    Mila.Tipo._tipos[nuevoTipo.nombre] = definicionTipo;
    Mila.Tipo[nuevoTipo.nombre] = definicionTipo;
    return definicionTipo;
  }
};

Mila.Tipo._tipoParametrico = function(nuevoTipo) {
  Mila.Tipo._tiposParametricos[nuevoTipo.nombre] = nuevoTipo;
  let codigo = `const resultado = new Mila.Tipo._Tipo(Mila.Tipo._tiposParametricos.${nuevoTipo.nombre});`;
  for (let parametro of nuevoTipo.parametros) {
    codigo += `\nresultado.${parametro} = ${parametro};`
  }
  if ('inicializacion' in nuevoTipo) {
    codigo += `\n${nuevoTipo.inicializacion}`;
  }
  codigo += `\nreturn resultado;`
  return Function.apply(this, nuevoTipo.parametros.concat([codigo]));
};

Mila.Tipo._Registrar_ComoSubtipoDe_ = function(nuevoTipo, supertipo) {
  nuevoTipo.validacionAdicionalTipo = nuevoTipo.es;
  if ('prototipo' in supertipo) {
    const prototipo = supertipo.prototipo;
    nuevoTipo.prototipo = prototipo;
    nuevoTipo.validacionAdicionalPrototipo = function(elemento) {
      return supertipo.es(elemento) && nuevoTipo.validacionAdicionalTipo.call(this, elemento.valueOf());
    };
    if (nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
      Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
        prototipo: prototipo,
        nombre: nuevoTipo.es.name,
        funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.validacionAdicionalPrototipo`
      });
      Mila.Base.DefinirFuncionDeInstancia_({
        prototipo: Object,
        nombre: nuevoTipo.es.name,
        codigo: `false`
      });
    }
    nuevoTipo.es = function(elemento) {
      return Object.getPrototypeOf(elemento) === prototipo.prototype && nuevoTipo.validacionAdicionalPrototipo.call(this, elemento);
    };
  } else {
    if (nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
      Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
        prototipo: Object,
        nombre: nuevoTipo.es.name,
        funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.es`
      });
    }
    nuevoTipo.es = function(elemento) {
      return supertipo.es(elemento) && nuevoTipo.validacionAdicionalTipo(elemento);
    };
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
  if (prototipo !== null &&
    prototipo.constructor.name in Mila.Tipo._tiposPorPrototipo &&
    Mila.Tipo.esInferible(Mila.Tipo._tiposPorPrototipo[prototipo.constructor.name])
  ) {
    return Mila.Tipo._tipoConPrototipo(Mila.Tipo._tiposPorPrototipo[prototipo.constructor.name], elemento);
  }
  if ('tipo' in elemento) {
    return elemento.tipo();
  }
  return Mila.Tipo._tipoSinPrototipo(elemento);
};

Mila.Tipo._tipoConPrototipo = function(idTipo, elemento) {
  const tipo = Mila.Tipo._tipos[idTipo];
  if (tipo.validacionAdicionalPrototipo(elemento.valueOf())) {
    for (let idSubtipo of Mila.Lista.losQueCumplen(tipo.subtipos, Mila.Tipo.esInferible)) {
      let subtipo = Mila.Tipo._tipoConPrototipoSub(idSubtipo, elemento.valueOf());
      if (subtipo !== null) {
        return subtipo;
      }
    }
    return tipo;
  }
  return Mila.Tipo._tipoSinPrototipo(elemento);
};

Mila.Tipo._tipoConPrototipoSub = function(idSubtipo, elemento) {
  const tipo = Mila.Tipo._tipos[idSubtipo];
  if (idSubtipo in Mila.Tipo._tiposParametricos) { // Es un tipo parámetrico
    if (
      'puedeSer' in Mila.Tipo._tiposParametricos[idSubtipo] &&
      'tipoPara' in Mila.Tipo._tiposParametricos[idSubtipo] &&
      Mila.Tipo._tiposParametricos[idSubtipo].puedeSer(elemento)
    ) {
      return Mila.Tipo._tiposParametricos[idSubtipo].tipoPara(elemento);
    }
  } else if ('validacionAdicionalTipo' in tipo && tipo.validacionAdicionalTipo(elemento)) {
    for (let idSubtipo of Mila.Lista.losQueCumplen(tipo.subtipos, Mila.Tipo.esInferible)) {
      let subtipo = Mila.Tipo._tipoConPrototipoSub(idSubtipo, elemento);
      if (subtipo !== null) {
        return subtipo;
      }
    }
    return tipo;
  }
  return null;
};

Mila.Tipo._esTipoPrototipo = function(tipo, prototipo) {
  return function(elemento) {
    return Object.getPrototypeOf(elemento) === prototipo && tipo.validacionAdicionalPrototipo(elemento) ||
      Mila.Lista.algunoCumple_(tipo.subtipos, x => Mila.Tipo._tipos[x].es(elemento))
    ;
  };
};

Mila.Tipo._tipoSinPrototipo = function(elemento, lista=Mila.Tipo._tiposSinPrototipo) {
  // Describe el tipo del elemento dado, que no está asociado a ningún prototipo.
    // elemento puede ser cualquier dato.
    // lista es una lista de textos, correspondientes a los ids de los tipos entre los cuales buscar.
  // PRE: El tipo del elemento dado no está asociado a un prototipo.
  let resultado = Mila.Tipo.Registro;
  for (let nombreTipo of Mila.Lista.losQueCumplen(lista, Mila.Tipo.esInferible)) {
    if (nombreTipo in Mila.Tipo._tiposParametricos) { // Es un tipo parámetrico
      if (
        'puedeSer' in Mila.Tipo._tiposParametricos[nombreTipo] &&
        'tipoPara' in Mila.Tipo._tiposParametricos[nombreTipo] &&
        Mila.Tipo._tiposParametricos[nombreTipo].puedeSer(elemento)
      ) {
        return Mila.Tipo._tiposParametricos[nombreTipo].tipoPara(elemento);
      }
    } else if ('es' in Mila.Tipo._tipos[nombreTipo] && Mila.Tipo._tipos[nombreTipo].es(elemento)) {
      if (Mila.Tipo._tipos[nombreTipo].subtipos.length > 0) {
        resultado = Mila.Tipo._tipoSinPrototipo(elemento, Mila.Tipo._tipos[nombreTipo].subtipos);
      }
      return resultado ==  Mila.Tipo.Registro ? Mila.Tipo._tipos[nombreTipo] : resultado;
    }
  }
  return resultado;
};
Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
  prototipo: Object,
  nombre: 'tipo',
  funcionAInvocar: `Mila.Tipo._tipoSinPrototipo`
});

Mila.Tipo.esInferible = function(tipoOIdentificadorDeTipo) {
  // Indica si el tipo dado se debe tener en cuenta al inferir el tipo de una expresión.
    // tipoOIdentificadorDeTipo puede ser un tipo o un indentificador de tipo (una cadena de texto correspondiente al nombre del tipo).
  const tipo = Mila.Tipo.esElIdentificadorDeUnTipo(tipoOIdentificadorDeTipo)
    ? (tipoOIdentificadorDeTipo in Mila.Tipo._tiposParametricos
        ? Mila.Tipo._tiposParametricos[tipoOIdentificadorDeTipo]
        : Mila.Tipo._tipos[tipoOIdentificadorDeTipo]
    )
    : tipoOIdentificadorDeTipo;
  return tipo.inferible;
};

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

Mila.Tipo.esSubtipoDe_ = function(tipo1, tipo2) {
  // Indica si el primer tipo dado es subtipo del segundo.
    // tipo1 y tipo2 son tipos.
  return tipo2.subtipos.includes(tipo1.nombre) ||
    Mila.Lista.algunoCumple_(tipo2.subtipos, x => Mila.Tipo.esSubtipoDe_(tipo1, Mila.Tipo[x])) ||
    (tipo1.hasOwnProperty('esSubtipoDe_') && tipo1.esSubtipoDe_(tipo2));
};
Mila.Tipo._Definir_EnPrototipo_('esSubtipoDe_', Mila.Tipo._Tipo);

Mila.Tipo.esSupertipoDe_ = function(tipo1, tipo2) {
  // Indica si el primer tipo dado es supertipo del segundo.
    // tipo1 y tipo2 son tipos.
  return Mila.Tipo.esSubtipoDe_(tipo2, tipo1);
};
Mila.Tipo._Definir_EnPrototipo_('esSupertipoDe_', Mila.Tipo._Tipo);

Mila.Tipo.unificaCon_ = function(tipo1, tipo2) {
  // Indica si el primer tipo dado unifica con el segundo.
    // tipo1 y tipo2 son tipos.
  return Mila.Tipo.esIgualA_(tipo1, tipo2) || Mila.Tipo.esSubtipoDe_(tipo1, tipo2) || Mila.Tipo.esSubtipoDe_(tipo2, tipo1) ||
    Mila.Lista.algunoCumple_(tipo1.supertipos, x => Mila.Tipo.unificaCon_(Mila.Tipo[x], tipo2));
};
Mila.Tipo._Definir_EnPrototipo_('unificaCon_', Mila.Tipo._Tipo);

Mila.Tipo.tipoUnificadoEntre_Y_ = function(tipo1, tipo2) {
  // Describe el tipo más específico resultante de la unificación de los dos tipos dados.
    // tipo1 y tipo2 son tipos.
  // PRE: tipo1 y tipo2 unifican entre sí.
  if (Mila.Tipo.esIgualA_(tipo1, tipo2) || Mila.Tipo.esSubtipoDe_(tipo2, tipo1)) {
    return tipo1;
  };
  if (Mila.Tipo.esSubtipoDe_(tipo1, tipo2)) {
    return tipo2;
  }
  return Mila.Tipo[Mila.Lista.elQueCumple_(tipo1.supertipos, x => Mila.Tipo.unificaCon_(x, tipo2))];
};

Mila.Tipo.hayTipoUnificableEn_ = function(lista) {
  // Indica si hay un tipo tal que todos los elementos de la lista dada sean de ese tipo.
    // lista es una lista de elementos cualesquiera.
  if (lista.length == 0) {
    return true;
  }
  let tipoPorAhora = Mila.Tipo.tipo(lista[0]);
  for (let x of Mila.Lista.sinElPrimero(lista)) {
    const nuevoTipo = Mila.Tipo.tipo(x);
    if (!Mila.Tipo.unificaCon_(nuevoTipo, tipoPorAhora)) {
      return false;
    }
    tipoPorAhora = Mila.Tipo.tipoUnificadoEntre_Y_(tipoPorAhora, nuevoTipo);
  }
  return true;
};

Mila.Tipo.tipoUnificadoEn_ = function(lista) {
  // Describe el tipo más específico tal que todos los elementos de la lista dada sean de ese tipo.
    // lista es una lista de elementos cualesquiera.
  // PRE: existe un tipo tal que todos los elementos de la lista dada sean de ese tipo.
  if (lista.length == 0) {
    return Mila.Tipo.Registro;
  }
  let tipoPorAhora = Mila.Tipo.tipo(lista[0]);
  for (let x of Mila.Lista.sinElPrimero(lista)) {
    const nuevoTipo = Mila.Tipo.tipo(x);
    tipoPorAhora = Mila.Tipo.tipoUnificadoEntre_Y_(tipoPorAhora, nuevoTipo);
  }
  return tipoPorAhora;
};

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
    return elemento1.nombre == elemento2.nombre &&
      Mila.Lista.todosCumplen_(elemento1.parametros || [], x => Mila.Tipo.esIgualA_(elemento1[x], elemento2[x]));
  },
  strInstancia: function(elemento) {
    return elemento.strTipo(elemento);
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
  strTipo: "Número"
});

// Tipo Entero: el tipo de los números enteros.

Mila.Tipo.Registrar({
  nombre: "Entero",
  subtipoDe: "Numero",
  es: function esUnEntero(numero) {
    return Number.isInteger(numero);
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
  strTipo: "Función"
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
  strInstancia: function(elemento) {
    return `{${Mila.Objeto.clavesDefinidas(elemento).map(function(k) {
      return `${k}:${Mila.Tipo.aTexto(elemento[k])}`
    }).join(', ')}}`;
  }
});

// Tipo Disyunción: la forma de representar un tipo que puede ser alguno de una lista de tipos.

Mila.Tipo.Registrar({
  nombre: "O",
  parametros: ['_subs'],
  es: function(elemento) {
    return Mila.Lista.algunoCumple_(this._subs, x => Mila.Tipo.esDeTipo_(elemento, x));
  },
  inicializacion: "Mila.Tipo._InicializarDisyuncion(resultado, _subs);",
  strTipo: function(tipo) {
    return Mila.Lista.transformados(tipo._subs, Mila.Tipo.aTexto).join(" | ");
  },
  strInstancia: function(elemento) {
    return Mila.Tipo.tipo(elemento).strInstancia(elemento);
  },
  inferible: false
});

// Tipo Alias: la forma de representar un tipo que puede ser alguno de una lista de tipos.

Mila.Tipo.Registrar({
  nombre: "Alias",
  parametros: ['_nombre','_tipo'],
  es: function(elemento) {
    return Mila.Tipo.esDeTipo_(elemento, this._tipo);
  },
  inicializacion: "Mila.Tipo._InicializarAlias(resultado, _nombre, _tipo);",
  strTipo: function(tipo) {
    return tipo._nombre;
  },
  strInstancia: function(elemento) {
    return this._tipo.strInstancia(elemento);
  },
  inferible: false
});

// Tipo Variante: la forma de representar un tipo variante (un enumerado).

Mila.Tipo.Registrar({
  nombre: "Variante",
  parametros: ['_nombre','_casos'],
  es: function(elemento) {
    return Mila.Lista.algunoCumple_(this._casos, x => Mila.Tipo.esIgualA_(elemento, this[x]));
  },
  inicializacion: "Mila.Tipo._GenerarVariantes(resultado, _casos, _nombre);",
  igualdad: function(elemento1, elemento2) {
    return elemento1 === elemento2;
  },
  strTipo: function(tipo) {
    return tipo._nombre;
  },
  strInstancia: function(elemento) {
    return this._tipo.strInstancia(elemento);
  },
  AgregarCasos: function(nuevosCasos) {
    const esteTipo = this;
    for (let caso of nuevosCasos) {
      if (!esteTipo._casos.includes(caso)) {
        esteTipo._casos.push(caso);
      }
      esteTipo[caso] = {
        tipo:function() { return esteTipo; },
        aTexto:function() { return caso; }
      };
    }
  }
});

Mila.Tipo._InicializarDisyuncion = function(tipo, subtipos) {
  Mila.Tipo._ReemplazarIdentificadoresPorTipos(subtipos, subtipos);
};

Mila.Tipo._InicializarAlias = function(tipo, nombre, subtipo) {
  Mila.Tipo._ReemplazarIdentificadoresPorTipos(tipo, {_tipo: subtipo});
  Mila.Tipo._RegistrarTipo(tipo, nombre);
};

Mila.Tipo._GenerarVariantes = function(tipo, casos, nombre) {
  tipo.AgregarCasos(casos);
  Mila.Tipo._RegistrarTipo(tipo, nombre);
};

Mila.Tipo._RegistrarTipo = function(tipo, nombre) {
  if (!(nombre in Mila.Tipo)) {
    Mila.Tipo[nombre] = tipo;
  }
  if (!(nombre in Mila.Tipo._tipos)) {
    Mila.Tipo._tipos[nombre] = tipo;
  }
};

Mila.Tipo._ReemplazarIdentificadoresPorTipos = function(tipo, subtipos) {
  for (let k in subtipos) {
    if (Mila.Tipo.esElIdentificadorDeUnTipo(subtipos[k])) {
      tipo[k] = Mila.Tipo._tipos[subtipos[k]];
    }
  }
};