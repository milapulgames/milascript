Mila.Modulo({
  define:"Mila.Tipo",
  necesita:["documentacion","js","objeto","lista"],
  usa:["error"]
});

Mila.Tipo._Definir_EnPrototipo_ = function(nombre, prototipo, posicionDeThis=0) {
  Mila.Contrato({
    Proposito: "Definir en un prototipo una función de instancia a partir de otra función definida en este módulo.",
    Precondiciones: [
      posicionDeThis >= 0,
      "Hay una función con el nombre dado en este módulo (Mila.Tipo).",
      nombre in Mila.Tipo // && es una función
    ],
    Parametros: [
      [nombre, Mila.Tipo.Texto, "nombre de la función a definir (la misma que la que ya está definida)."],
      [prototipo, Mila.Tipo.Registro],
      [posicionDeThis, Mila.Tipo.Entero]
    ]
  });
  Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
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
  Mila.Contrato({
    Proposito: "Registrar un tipo a partir de la información dada.",
    // Falla si ya se registró antes un tipo con el mismo nombre.
    // Falla si el nombre colisiona con algún campo ya existente.
    // Falla si se pasa el campo prototipo y ya se registró antes un tipo con ese mismo prototipo.
    Parametros: [
      [dataTipo, "DataTipo"]
    ]
  });
  return Mila.Documentacion.Ejecutar_SinAnalizarContratos(function() {
    return Mila.Tipo._Registrar(dataTipo);
  });
};

Mila.Tipo._Registrar = function(dataTipo) {
  if (dataTipo.nombre in Mila.Tipo._tipos) {
    Mila.Fallar(`Ya se registró un tipo con el nombre ${dataTipo.nombre}.`);
  } else if (dataTipo.nombre in Mila.Tipo) {
    Mila.Fallar(`No se puede registrar un tipo con el nombre ${dataTipo.nombre} porque ese campo ya está en uso.`);
  } else {
    if ('parametros' in dataTipo && 'prototipo' in dataTipo) {
      Mila.Fallar(`No se puede registrar un tipo paramétrico con prototipo.`);
    }
    const nuevoTipo = Object.assign({}, dataTipo);
    nuevoTipo.subtipos = [];
    nuevoTipo.supertipos = [];
    let supertipo = null;
    if ('subtipoDe' in nuevoTipo) {
      supertipo = Mila.Tipo.esUnTipo(nuevoTipo.subtipoDe) ? nuevoTipo.subtipoDe : Mila.Tipo._tipos[nuevoTipo.subtipoDe];
      for (let clave of ['igualdad','orden','strInstancia','copia']) { // Claves heredadas a los subtipos
        if (!(clave in nuevoTipo)) {
          nuevoTipo[clave] = supertipo[clave];
        }
      }
      supertipo.subtipos.push(nuevoTipo.nombre);
      nuevoTipo.supertipos.push(supertipo.nombre);
    }
    nuevoTipo.esOriginal = nuevoTipo.es;
    if ('prototipo' in nuevoTipo) {
      if (!('name' in nuevoTipo.prototipo) || (nuevoTipo.prototipo.name.length == 0)) {
        Mila.Fallar(`Prototipo inválido: debe tener un nombre (la función se debe definir "... .NOMBRE = function NOMBRE() {...")`);
      }
      if (nuevoTipo.prototipo.name in Mila.Tipo._tiposPorPrototipo) {
        Mila.Fallar(`Ya se registró un tipo con el prototipo ${nuevoTipo.prototipo.name}.`);
      }
      Mila.Tipo._tiposPorPrototipo[nuevoTipo.prototipo.name] = nuevoTipo.nombre;
      if ('strInstancia' in nuevoTipo) { //
        Mila.JS.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: 'toString',
          codigo: `Mila.Tipo._tipos.${nuevoTipo.nombre}.strInstancia(this)`
        });
      } else {
        nuevoTipo.strInstancia = function(elemento) { return nuevoTipo.prototipo.prototype.toString.call(elemento); }
      }
      nuevoTipo.validacionAdicionalPrototipo = function(elemento) { return true; };
      if (typeof nuevoTipo.es == 'string') {
        Mila.JS.DefinirFuncionDeInstancia_({
          prototipo: nuevoTipo.prototipo,
          nombre: nuevoTipo.es,
          codigo: `true`
        });
        Mila.JS.DefinirFuncionDeInstancia_({
          prototipo: Object,
          nombre: nuevoTipo.es,
          codigo: `false`
        });
      } else if (typeof nuevoTipo.es == 'function') {
        nuevoTipo.validacionAdicionalPrototipo = nuevoTipo.es;
        if (nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
          Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
            prototipo: nuevoTipo.prototipo,
            nombre: nuevoTipo.es.name,
            funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.validacionAdicionalPrototipo`
          });
          Mila.JS.DefinirFuncionDeInstancia_({
            prototipo: Object,
            nombre: nuevoTipo.es.name,
            codigo: `false`
          });
        }
      }
      nuevoTipo.es = Mila.Tipo._esTipoPrototipo(nuevoTipo, nuevoTipo.prototipo.prototype);
      Mila.JS.DefinirFuncionDeInstancia_({
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
          nuevoTipo.es = Mila.Tipo._esTipoRegistro(nuevoTipo.es);
        } else if (typeof nuevoTipo.es == 'function' && nuevoTipo.es.name.length > 0 && nuevoTipo.es.name != "es") {
          Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
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
          return campos.todosCumplen_(x => Mila.Tipo.esIgualA_(elemento1[x], elemento2[x]));
        };
      }
    } else {
      // nuevoTipo.igualdad = (elemento1, elemento2) =>
      //   Mila.Fallar(`Los elementos de tipo ${nuevoTipo.nombre} no se pueden comparar por igualdad.`);
    }
    if (!('orden' in nuevoTipo)) {
      // nuevoTipo.orden = (elemento1, elemento2) =>
      //   Mila.Fallar(`Los elementos de tipo ${nuevoTipo.nombre} no tienen relación de orden.`);
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
  Mila.Contrato({
    Proposito: [
      "Describir la función de inicialización de un tipo paramétrico a partir de la información dada.",
      Mila.Tipo.Funcion // Toma los parámetros del tipo parámetrico y devuelve una instancia del tipo.
    ],
    Parametros: [
      [nuevoTipo, Mila.Tipo.Registro] /*
        Los mismos campos de DataTipo más:
        ! subtipos
        ! supertipos
        ? validacionAdicionalPrototipo (si tiene prototipo)
      */
    ]
  });
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
  Mila.Contrato({
    Proposito: "Incorporar al objeto de configuración dado la información de tipado\
      para que sea subtipo del tipo dado.",
    Parametros: [
      [nuevoTipo, Mila.Tipo.Registro] /*
        Los mismos campos de DataTipo más:
        ! subtipos
        ! supertipos
      */,
      [supertipo, Mila.Tipo.Tipo]
    ]
  });
  const fEs = (typeof nuevoTipo.es == 'object') ? Mila.Tipo._esTipoRegistro(nuevoTipo.es) : nuevoTipo.es;
  nuevoTipo.validacionAdicionalTipo = fEs;
  if ('prototipo' in supertipo) {
    const prototipo = supertipo.prototipo;
    nuevoTipo.prototipo = prototipo;
    nuevoTipo.validacionAdicionalPrototipo = function(elemento) {
      return supertipo.es(elemento) && nuevoTipo.validacionAdicionalTipo.call(this, elemento.valueOf());
    };
    if (fEs.name.length > 0 && fEs.name != "es") {
      Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
        prototipo: prototipo,
        nombre: fEs.name,
        funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.validacionAdicionalPrototipo`
      });
      Mila.JS.DefinirFuncionDeInstancia_({
        prototipo: Object,
        nombre: fEs.name,
        codigo: `false`
      });
    }
    nuevoTipo.es = function(elemento) {
      return Object.getPrototypeOf(elemento) === prototipo.prototype && nuevoTipo.validacionAdicionalPrototipo.call(this, elemento);
    };
  } else {
    if (fEs.name.length > 0 && fEs.name != "es") {
      Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
        prototipo: Object,
        nombre: fEs.name,
        funcionAInvocar: `Mila.Tipo._tipos.${nuevoTipo.nombre}.es`
      });
    }
    nuevoTipo.es = function(elemento) {
      return supertipo.es(elemento) && nuevoTipo.validacionAdicionalTipo.call(this, elemento);
    };
  }
};

// Observadores de tipos

Mila.Tipo.tipo = function(elemento) {
  Mila.Contrato({
    Proposito: ["Describir el tipo del elemento dado.", Mila.Tipo.Tipo],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
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
  Mila.Contrato({
    Proposito: [
      "Describir el tipo del elemento dado intentando inferirlo a partir del tipo dado.",
      Mila.Tipo.Tipo
    ],
    Precondiciones: [
      "idTipo es el id de un tipo.",
      idTipo in Mila.Tipo._tipos,
      "El tipo al que hace referencia idTipo tiene un prototipo y es el del elemento dado.",
      'prototipo' in Mila.Tipo._tipos[idTipo] &&
      Object.getPrototypeOf(elemento) === Mila.Tipo._tipos[idTipo].prototipo.prototype
    ],
    Parametros: [
      [idTipo, Mila.Tipo.Texto],
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
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
  Mila.Contrato({
    Proposito: [
      "Describir el tipo del elemento dado intentando inferirlo a partir del tipo dado\
        o null si no es posible.",
      Mila.Tipo.O([Mila.Tipo.Tipo, Mila.Tipo.Nada])
    ],
    Precondiciones: [
      "idSubtipo es el id de un tipo.",
      idSubtipo in Mila.Tipo._tipos
    ],
    Parametros: [
      [idSubtipo, Mila.Tipo.Texto],
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
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
  Mila.Contrato({
    Proposito: [
      "Describir la función que determina si un elemento es del tipo dado, basándose en el prototipo dado.",
      Mila.Tipo.Funcion // Toma un elemento y devuelve un booleano
    ],
    Parametros: [
      [tipo, Mila.Tipo.Registro] /*
        Los mismos campos de DataTipo más:
        ! subtipos
        ! supertipos
      */,
      [prototipo, Mila.Tipo.Cualquiera]
    ]
  });
  return function(elemento) {
    if (Mila.Tipo.esNada(elemento)) {
      return false;
    }
    return (
      (
        Object.getPrototypeOf(elemento) === prototipo ||
        // En Node hay otro nivel de indirección en prototipos:
        Object.getPrototypeOf(Object.getPrototypeOf(elemento)) === prototipo
      ) &&
      tipo.validacionAdicionalPrototipo(elemento)) ||
      Mila.Lista.algunoCumple_(tipo.subtipos, x => Mila.Tipo._tipos[x].es(elemento))
    ;
  };
};

Mila.Tipo._tipoSinPrototipo = function(elemento, lista=Mila.Tipo._tiposSinPrototipo) {
  Mila.Contrato({
    Proposito: [
      "Describir el tipo del elemento dado, que no está asociado a ningún prototipo.",
      Mila.Tipo.Tipo
    ],
    Precondiciones: [
      "El tipo del elemento dado no está asociado a un prototipo."
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera] // pero no de los que están asociados a prototipos
      [lista, Mila.Tipo.ListaDe_(Mila.Tipo.Texto), "ids de tipos entre los cuales buscar"]
    ]
  });
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
Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
  prototipo: Object,
  nombre: 'tipo',
  funcionAInvocar: `Mila.Tipo._tipoSinPrototipo`
});

Mila.Tipo._esTipoRegistro = function(modelo) {
  return function(elemento) {
    return Mila.Objeto.todosCumplen_(modelo, function(clave, valor) {
      return (
        clave.startsWith("?") &&
        (!Mila.Objeto.defineLaClavePropia_(elemento, clave.substr(1)) || Mila.Tipo.esDeTipo_(elemento[clave.substr(1)], valor)))
      || (
        !clave.startsWith("?") && Mila.Objeto.defineLaClavePropia_(elemento, clave) && Mila.Tipo.esDeTipo_(elemento[clave], valor)
      );
    });
  };
};

Mila.Tipo.esInferible = function(tipoOIdentificadorDeTipo) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el tipo dado se debe tener en cuenta al inferir el tipo de una expresión.",
      Mila.Tipo.Booleano
    ],
    Precondiciones: [
      "Si tipoOIdentificadorDeTipo es un texto, entonces se corresponde al id de un tipo.",
      !Mila.Tipo.Texto.es(tipoOIdentificadorDeTipo) ||
        Mila.Tipo.esElIdentificadorDeUnTipo(tipoOIdentificadorDeTipo)
    ],
    Parametros: [
      [tipoOIdentificadorDeTipo, Mila.Tipo.O([Mila.Tipo.Tipo, Mila.Tipo.Texto])]
    ]
  });
  const tipo = Mila.Tipo.esElIdentificadorDeUnTipo(tipoOIdentificadorDeTipo)
    ? (tipoOIdentificadorDeTipo in Mila.Tipo._tiposParametricos
        ? Mila.Tipo._tiposParametricos[tipoOIdentificadorDeTipo]
        : Mila.Tipo._tipos[tipoOIdentificadorDeTipo]
    )
    : tipoOIdentificadorDeTipo;
  return tipo.inferible;
};

Mila.Tipo.esUnTipo = function(elemento) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el elemento dado es un tipo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.esAlgo(elemento) && Object.getPrototypeOf(elemento) == Mila.Tipo._Tipo.prototype && elemento.nombre in Mila.Tipo._tipos;
};
Mila.Tipo._Definir_EnPrototipo_('esUnTipo', Object);

Mila.Tipo.esElIdentificadorDeUnTipo = function(elemento) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el elemento dado es un identificador de tipo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
  return Object.getPrototypeOf(elemento) == String.prototype && elemento in Mila.Tipo._tipos;
};
Mila.Tipo._Definir_EnPrototipo_('esElIdentificadorDeUnTipo', Object);

Mila.Tipo.esDeTipo_ = function(elemento, tipoOIdentificadorDeTipo) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el elemento dado es del tipo dado.",
      Mila.Tipo.Booleano
    ],
    Precondiciones: [
      "Si tipoOIdentificadorDeTipo es un texto, entonces se corresponde al id de un tipo.",
      !Mila.Tipo.Texto.es(tipoOIdentificadorDeTipo) ||
        Mila.Tipo.esElIdentificadorDeUnTipo(tipoOIdentificadorDeTipo)
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera],
      [tipoOIdentificadorDeTipo, Mila.Tipo.O([Mila.Tipo.Tipo, Mila.Tipo.Texto])]
    ]
  });
  let tipo = Mila.Tipo.esElIdentificadorDeUnTipo(tipoOIdentificadorDeTipo)
    ? Mila.Tipo._tipos[tipoOIdentificadorDeTipo]
    : tipoOIdentificadorDeTipo
  ;
  return tipo.es(elemento);
};
Mila.Tipo._Definir_EnPrototipo_('esDeTipo_', Object);

Mila.Tipo.esNada = function(elemento) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el elemento dado es un vlaor nulo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
  return elemento === Mila.Nada || elemento === null || elemento === undefined ||
  (Object.getPrototypeOf(elemento) == Number.prototype && isNaN(elemento));
};

Mila.Tipo.esAlgo = function(elemento) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el elemento dado describe algo (no es un valor nulo).",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
  return !Mila.Tipo._tipos.Nada.es(elemento);
};
Mila.Tipo._Definir_EnPrototipo_('esAlgo', Object);

Mila.Tipo.aTexto = function(elemento) {
  Mila.Contrato({
    Proposito: [
      "Describir la representación textual del elemento dado.",
      Mila.Tipo.Texto
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.tipo(elemento).strInstancia(elemento);
}
Mila.Tipo._Definir_EnPrototipo_('aTexto', Object);

Mila.Tipo.esIgualA_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es observacionalmente igual al segundo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
      "El tipo de los elementos dados define una relación de equivalencia.",
      Mila.Tipo.defineRelacionDeEquivalencia(Mila.Tipo.tipo(elemento1))
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.tipo(elemento1).igualdad(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esIgualA_', Object);

Mila.Tipo.esDistintoA_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es observacionalmente distinto al segundo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
      "El tipo de los elementos dados define una relación de equivalencia.",
      Mila.Tipo.defineRelacionDeEquivalencia(Mila.Tipo.tipo(elemento1))
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return !Mila.Tipo.esIgualA_(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esDistintoA_', Object);

Mila.Tipo.esDelMismoTipoQue_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es del mismo tipo que el segundo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.esDeTipo_(elemento1, Mila.Tipo.tipo(elemento2)) ||
    Mila.Tipo.esDeTipo_(elemento2, Mila.Tipo.tipo(elemento1));
};
Mila.Tipo._Definir_EnPrototipo_('esDelMismoTipoQue_', Object);

Mila.Tipo.esDeOtroTipoQue_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es un tipo diferente al del segundo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return !Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esDeOtroTipoQue_', Object);

Mila.Tipo.esSubtipoDe_ = function(tipo1, tipo2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer tipo dado es subtipo del segundo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [tipo1, Mila.Tipo.Tipo],
      [tipo2, Mila.Tipo.Tipo]
    ]
  });
  return tipo2.subtipos.includes(tipo1.nombre) ||
    Mila.Lista.algunoCumple_(tipo2.subtipos, x =>
      Mila.Tipo.esUnTipo(Mila.Tipo[x]) &&
      Mila.Tipo.esSubtipoDe_(tipo1, Mila.Tipo[x])
    ) ||
    (tipo1.hasOwnProperty('esSubtipoDe_') && tipo1.esSubtipoDe_(tipo2));
};
Mila.Tipo._Definir_EnPrototipo_('esSubtipoDe_', Mila.Tipo._Tipo);

Mila.Tipo.esSupertipoDe_ = function(tipo1, tipo2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer tipo dado es supertipo del segundo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [tipo1, Mila.Tipo.Tipo],
      [tipo2, Mila.Tipo.Tipo]
    ]
  });
  return Mila.Tipo.esSubtipoDe_(tipo2, tipo1);
};
Mila.Tipo._Definir_EnPrototipo_('esSupertipoDe_', Mila.Tipo._Tipo);

Mila.Tipo.unificaCon_ = function(tipo1, tipo2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer tipo dado unifica con el segundo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [tipo1, Mila.Tipo.Tipo],
      [tipo2, Mila.Tipo.Tipo]
    ]
  });
  return Mila.Tipo.esIgualA_(tipo1, tipo2) || Mila.Tipo.esSubtipoDe_(tipo1, tipo2) || Mila.Tipo.esSubtipoDe_(tipo2, tipo1) ||
    Mila.Lista.algunoCumple_(tipo1.supertipos, x => Mila.Tipo.unificaCon_(Mila.Tipo[x], tipo2));
};
Mila.Tipo._Definir_EnPrototipo_('unificaCon_', Mila.Tipo._Tipo);

Mila.Tipo.defineRelacionDeEquivalencia = function(tipo) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el tipo dado define una relación de equivalencia.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [tipo, Mila.Tipo.Tipo]
    ]
  });
  return 'igualdad' in tipo;
};
Mila.Tipo._Definir_EnPrototipo_('defineRelacionDeEquivalencia', Mila.Tipo._Tipo);

Mila.Tipo.defineRelacionDeOrden = function(tipo) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el tipo dado define una relación de orden.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [tipo, Mila.Tipo.Tipo]
    ]
  });
  return 'orden' in tipo;
};
Mila.Tipo._Definir_EnPrototipo_('defineRelacionDeOrden', Mila.Tipo._Tipo);

Mila.Tipo.tipoUnificadoEntre_Y_ = function(tipo1, tipo2) {
  Mila.Contrato({
    Proposito: [
      "Describir el tipo más específico resultante de la unificación de los dos tipos dados.",
      Mila.Tipo.Tipo
    ],
    Precondiciones: [
      "tipo1 y tipo2 unifican entre sí.",
      Mila.Tipo.unificaCon_(tipo1, tipo2)
    ],
    Parametros: [
      [tipo1, Mila.Tipo.Tipo],
      [tipo2, Mila.Tipo.Tipo]
    ]
  });
  if (Mila.Tipo.esIgualA_(tipo1, tipo2) || Mila.Tipo.esSubtipoDe_(tipo2, tipo1)) {
    return tipo1;
  };
  if (Mila.Tipo.esSubtipoDe_(tipo1, tipo2)) {
    return tipo2;
  }
  return Mila.Tipo[Mila.Lista.elQueCumple_(tipo1.supertipos, x => Mila.Tipo.unificaCon_(x, tipo2))];
};

Mila.Tipo.hayTipoUnificableEn_ = function(lista) {
  Mila.Contrato({
    Proposito: [
      "Indicar si hay un tipo tal que todos los elementos de la lista dada sean de ese tipo.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [lista, Mila.Tipo.Lista]
    ]
  });
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
  Mila.Contrato({
    Proposito: [
      "Describir el tipo más específico tal que todos los elementos de la lista dada sean de ese tipo.",
      Mila.Tipo.Tipo
    ],
    Parametros: [
      [lista, Mila.Tipo.Lista]
    ]
  });
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
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es menor al segundo según la relación de orden del tipo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
      "El tipo de los elementos dados define una relación de orden.",
      Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento1))
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.tipo(elemento1).orden(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esMenorA_', Object);

Mila.Tipo.esMayorA_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es mayor al segundo según la relación de orden del tipo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
      "El tipo de los elementos dados define una relación de orden.",
      Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento1))
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.tipo(elemento1).orden(elemento2, elemento1);
};
Mila.Tipo._Definir_EnPrototipo_('esMayorA_', Object);

Mila.Tipo.esMenorOIgualA_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es menor al segundo según la relación de orden del tipo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
      "El tipo de los elementos dados define una relación de orden.",
      Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento1)),
      "El tipo de los elementos dados define una relación de equivalencia.",
      Mila.Tipo.defineRelacionDeEquivalencia(Mila.Tipo.tipo(elemento1))
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.tipo(elemento1).igualdad(elemento1, elemento2) || Mila.Tipo.tipo(elemento1).orden(elemento1, elemento2);
};
Mila.Tipo._Definir_EnPrototipo_('esMenorOIgualA_', Object);

Mila.Tipo.esMayorOIgualA_ = function(elemento1, elemento2) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado es menor al segundo según la relación de orden del tipo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento1, elemento2),
      "El tipo de los elementos dados define una relación de orden.",
      Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento1)),
      "El tipo de los elementos dados define una relación de equivalencia.",
      Mila.Tipo.defineRelacionDeEquivalencia(Mila.Tipo.tipo(elemento1))
    ],
    Parametros: [
      [elemento1, Mila.Tipo.Cualquiera],
      [elemento2, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.tipo(elemento1).igualdad(elemento1, elemento2) || Mila.Tipo.tipo(elemento1).orden(elemento2, elemento1);
};
Mila.Tipo._Definir_EnPrototipo_('esMayorOIgualA_', Object);

Mila.Tipo.estaEntre_Y_Inclusive = function(elemento, limiteInferior, limiteSuperior) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el primer elemento dado está entre los otros dos según la relación de orden del tipo.",
      Mila.Tipo.Booleano
    ],
    Precondiciones:[
      "Los elementos dados son del mismo tipo.",
      Mila.Tipo.esDelMismoTipoQue_(elemento, limiteInferior) &&
      Mila.Tipo.esDelMismoTipoQue_(elemento, limiteSuperior),
      "El tipo de los elementos dados define una relación de orden.",
      Mila.Tipo.defineRelacionDeOrden(Mila.Tipo.tipo(elemento)),
      "El tipo de los elementos dados define una relación de equivalencia.",
      Mila.Tipo.defineRelacionDeEquivalencia(Mila.Tipo.tipo(elemento))
    ],
    Parametros: [
      [elemento, Mila.Tipo.Cualquiera],
      [limiteInferior, Mila.Tipo.Cualquiera],
      [limiteSuperior, Mila.Tipo.Cualquiera]
    ]
  });
  return Mila.Tipo.esMayorOIgualA_(elemento, limiteInferior) && Mila.Tipo.esMenorOIgualA_(elemento, limiteSuperior);
};
Mila.Tipo._Definir_EnPrototipo_('estaEntre_Y_Inclusive', Object);

Mila.Tipo.copia = function(elemento) {
  // Describe una copia del elemento dado
  const tipo = Mila.Tipo.tipo(elemento);
  if (tipo.defineLaClavePropia_('copia')) {
    return tipo.copia(elemento);
  }
  return elemento;
}

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
  },
  copia: Mila.Objeto.copia
});

// Tipo Cualquiera: usado en contratos para indicar que puede ser de cualquier tipo.

Mila.Tipo.Registrar({
  nombre: "Cualquiera",
  es: x => true,
  inferible: false
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

// Tipo Lista: el tipo de las listas

Mila.Tipo.Registrar({
  nombre: "Lista",
  prototipo: Array,
  es: 'esUnaLista',
  igualdad: function(elemento1, elemento2) {
    if (Mila.Tipo.esDistintoA_(elemento1.length, elemento2.length)) {
      return false;
    }
    for (let i=0; i<elemento1.length; i++) {
      if (Mila.Tipo.esDistintoA_(elemento1[i], elemento2[i])) {
        return false;
      }
    }
    return true;
  },
  strInstancia: function(elemento) {
    return `[${elemento.transformados(Mila.Tipo.aTexto).join(",")}]`;
  },
  copia: Mila.Lista.copia
});

// Tipo ListaDe: el tipo de las listas cuyos elementos son todos del mismo tipo

Mila.Tipo.Registrar({
  nombre: "ListaDe_",
  parametros: ['_sub'],
  subtipoDe: "Lista",
  esSubtipoDe_: function(otroTipo) {
    return Mila.Tipo.esIgualA_(otroTipo, Mila.Tipo.Lista) ||
      (Mila.Tipo.esIgualA_(otroTipo.nombre, "ListaDe_") && Mila.Tipo.esSubtipoDe_(this._sub, otroTipo._sub));
  },
  puedeSer: function(elemento) {
    return elemento.length > 0 && Mila.Tipo.hayTipoUnificableEn_(elemento);
  },
  tipoPara: function(elemento) {
    return Mila.Tipo.ListaDe_(Mila.Tipo.tipoUnificadoEn_(elemento));
  },
  es: function(elemento) {
    return elemento.todosCumplen_(x => this._sub.es(x));
  },
  inicializacion: "Mila.Tipo._InicializarLista(resultado, _sub);",
  strTipo: function(tipo) {
    return `Lista de ${tipo._sub.aTexto()}`;
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
  strInstancia: function(elemento) {
    return `{${Mila.Objeto.clavesDefinidas(elemento).map(function(k) {
      return `${k}:${Mila.Tipo.aTexto(elemento[k])}`
    }).join(', ')}}`;
  },
  copia: Mila.Objeto.copia
});

// Tipo RegistroCon: el tipo de los registros con campos específicos

Mila.Tipo.Registrar({
  nombre: "RegistroCon_",
  subtipoDe: "Registro", // Para que herede igualdad y srtInstancia
  parametros: ['_def'],
  es: function(elemento) {
    return Mila.Tipo._esTipoRegistro(this._def)(elemento);
  },
  inicializacion: "Mila.Tipo._InicializarRegistro(resultado, _def);"
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
    return Mila.Lista.algunoCumple_(this._casos, x => this.igualdad(elemento, this[x]));
  },
  inicializacion: "Mila.Tipo._GenerarVariantes(resultado, _casos, _nombre);",
  igualdad: function(elemento1, elemento2) {
    return elemento1 === elemento2;
  },
  strTipo: function(tipo) {
    return tipo._nombre;
  },
  strInstancia: function(elemento) {
    return elemento.aTexto();
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

// Funciones auxiliares de tipos

Mila.Tipo._InicializarLista = function(tipo, subtipo) {
  Mila.Tipo._ReemplazarIdentificadoresPorTipos(tipo, {_sub: subtipo});
};

Mila.Tipo._InicializarRegistro = function(tipo, modelo) {
  Mila.Tipo._ReemplazarIdentificadoresPorTipos(tipo, {_def: modelo});
};

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

// Tipos auxiliares

Mila.Tipo.Registrar({
  nombre:"MapaTipos",
  es: function(elemento) {
    return elemento.valoresContenidos().todosCumplen_(x =>
      Mila.Tipo.esUnTipo(x) || Mila.Tipo.esElIdentificadorDeUnTipo(x)
    );
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:"DataTipo",
  es: function(elemento) {
    return Mila.Objeto.clavesDefinidas(elemento).todosCumplen_(x => [
      'nombre', 'prototipo', 'es',
      'subtipoDe', 'esSubtipoDe_',
      'igualdad', 'orden',
      'strTipo', 'strInstancia',
      'parametros', 'puedeSer', 'tipoPara', 'inicializacion',
      'inferible', 'copia'
    ].includes(x)) &&
    // Debe incluir el campo nombre, una cadena de texto correspondiente al nombre del tipo.
    Mila.Objeto.defineLaClavePropia_(elemento, 'nombre') && Mila.Tipo.esDeTipo_(elemento.nombre, Mila.Tipo.Texto) &&
    // Puede incluir el campo prototipo, un objeto a cuyo prototipo asociar el tipo definido.
      // En caso de no inlcuirse este campo, el tipo no se asocia a ningún prototipo.
    // Puede incluir el campo subtipoDe, un tipo o un identificador de tipo correspondiente al
      // tipo del cual el tipo que se está registrando es subtipo. Los campos que no se declaren
      // se heredan de él (excepto prototipo).
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'subtipoDe') ||
        (Mila.Tipo.esUnTipo(elemento.subtipoDe) || Mila.Tipo.esElIdentificadorDeUnTipo(elemento.subtipoDe))
      ) &&
    // Si incluye el campo subtipoDe puede incluir también el campo esSubtipoDe_, una función
      // que tome un tipo y devuelva si el tipo  que se está registrando es subtipo de él.
      // En caso de no inlcuirse este campo, la función simplemente verifica que el tipo dado
        // pertenezca a la lista de subtipos de este.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'esSubtipoDe_') || (
        Mila.Objeto.defineLaClavePropia_(elemento, 'subtipoDe') &&
        Mila.Tipo.esDeTipo_(elemento.esSubtipoDe_, Mila.Tipo.Funcion)
      )) &&
    // Puede incluir el campo es que permita determinar si un elemento es del tipo.
    (
      // Si se incluye el campo prototipo, el campo es puede ser una función que tome un
        // elemento del prototipo y devuelva si el elemento es del tipo o puede ser una
        // cadena de texto correspondiente al nombre de la función que determina si un elemento
        // es del tipo (la implementación de la función únicamente verificará que el elemento
        // tenga el prototipo adecuado). Omitir este campo tiene el mismo efecto que pasar una cadena de texto.
      (Mila.Objeto.defineLaClavePropia_(elemento, 'prototipo') && (
        !Mila.Objeto.defineLaClavePropia_(elemento, 'es') ||
        Mila.Tipo.esDeTipo_(elemento.es, Mila.Tipo.Funcion) ||
        Mila.Tipo.esDeTipo_(elemento.es, Mila.Tipo.Texto)
      // Si no se incluye el campo prototipo, el campo es no se puede omitir.
      )) || (!Mila.Objeto.defineLaClavePropia_(elemento, 'prototipo') && Mila.Objeto.defineLaClavePropia_(elemento, 'es') && (
        // Si se incluye el campo subtipoDe,
        (Mila.Objeto.defineLaClavePropia_(elemento, 'subtipoDe') && (
          // debe ser una función que tome un elemento del supertipo y devuelva si el elemento
            // es también del tipo que se está registrando.
          Mila.Tipo.esDeTipo_(elemento.es, Mila.Tipo.Funcion) ||
          // O, si el supertipo se define a partir de un registro, puede ser también un MapaTipos
          (
            (typeof
              (Mila.Tipo.esUnTipo(elemento.subtipoDe) ? elemento.subtipoDe : Mila.Tipo._tipos[elemento.subtipoDe])
            .esOriginal === 'object') &&
            Mila.Tipo.esDeTipo_(elemento.es, "MapaTipos")
          )
        )) ||
        // Si no, puede ser una función que tome un elemento y devuelva si el elemento es del tipo
          // o un objeto cuyas claves sean los campos que el elemento debe tener y sus significados los
          // tipos de dichos campos.
        (!Mila.Objeto.defineLaClavePropia_(elemento, 'subtipoDe') && (
          Mila.Tipo.esDeTipo_(elemento.es, Mila.Tipo.Funcion) ||
          Mila.Tipo.esDeTipo_(elemento.es, "MapaTipos"))
        )
      ))
    ) &&
    // Puede incluir el campo igualdad que puede ser una función que tome dos elementos del
      // tipo y devuelva si los elementos son observacionalmente iguales o una lista de nombres
      // de campos correspondientes a los campos que deben ser iguales.
      // En caso de no inlcuirse este campo, se asume que el tipo no tiene relación de equivalencia.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'igualdad') ||
        Mila.Tipo.esDeTipo_(elemento.igualdad, Mila.Tipo.Funcion) ||
        Mila.Tipo.esDeTipo_(elemento.igualdad, Mila.Tipo.ListaDe_(Mila.Tipo.Texto))
      ) &&
    // Puede incluir el campo orden, una función que toma dos elementos del tipo y devuelve si el
      // primero está antes que el segundo en la relación de orden del tipo.
      // En caso de no inlcuirse este campo, se asume que el tipo no tiene relación de orden.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'orden') ||
        Mila.Tipo.esDeTipo_(elemento.orden, Mila.Tipo.Funcion)
      ) &&
    // Puede incluir el campo strTipo que puede ser un texto correspondiente a la representación
      // textual del tipo o una función que tome como parámetro al tipo y devuelva dicha representación.
      // En caso de no inlcuirse este campo, se asume que la representación textual del tipo es
      // igual a su nombre.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'strTipo') ||
        Mila.Tipo.esDeTipo_(elemento.strTipo, Mila.Tipo.Texto) ||
        Mila.Tipo.esDeTipo_(elemento.strTipo, Mila.Tipo.Funcion)
      ) &&
    // Puede incluir el campo strInstancia, una función que toma un elemento del tipo y devuelve
      // su representación textual.
      // En caso de no inlcuirse este campo, si se incluye el campo prototipo (ya sea en este o
        // en alguno de sus supertipos) se utiliza en su lugar la función toString del prototipo
        // y si no, se utiliza la función strInstancia del tipo Registro.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'strInstancia') ||
        Mila.Tipo.esDeTipo_(elemento.strInstancia, Mila.Tipo.Funcion)
      ) &&
    // Puede incluir el campo parametros, una lista de textos correspondientes a los nombres
      // de los parámetros en caso de que se esté registrando un tipo paramétrico.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'parametros') ||
        Mila.Tipo.esDeTipo_(elemento.parametros, Mila.Tipo.ListaDe_(Mila.Tipo.Texto))
      ) &&
    // Si incluye el campo parametros puede incluir también:
      // * el campo puedeSer (una función que toma un elemento y devuelve un booleano
        // correspondiente a si el elemento puede ser del tipo paramétrico, para alguna
        // combinación de parámetros)
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'puedeSer') || (
        Mila.Objeto.defineLaClavePropia_(elemento, 'parametros') &&
        Mila.Tipo.esDeTipo_(elemento.puedeSer, Mila.Tipo.Funcion)
      )) &&
      // * el campo tipoPara (una función que toma un elemento y, asumiendo que el resultado
        // de puedeSer con dicho elemento es verdadero, devuelve una instanciación del tipo
        // paramétrico para tal elemento).
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'tipoPara') || (
        Mila.Objeto.defineLaClavePropia_(elemento, 'parametros') &&
        Mila.Tipo.esDeTipo_(elemento.tipoPara, Mila.Tipo.Funcion)
      )) &&
      // * el campo inicializacion, un texto que se  agregará como código a la función
        // de inicialización del tipo cuando se parametrice.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'inicializacion') || (
        Mila.Objeto.defineLaClavePropia_(elemento, 'parametros') &&
        Mila.Tipo.esDeTipo_(elemento.inicializacion, Mila.Tipo.Texto)
      )) &&
    // Puede incluir el campo inferible, un booleano que indique si este tipo se debe
      // tener en cuenta al inferir el tipo de una expresión.
      // En caso de no inlcuirse este campo, se asume que sí.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'inferible') ||
        Mila.Tipo.esDeTipo_(elemento.inferible, Mila.Tipo.Booleano)
      ) &&
    // Puede incluir el campo copia, una función que tome un elemento de este tipo
      // y devuelva un nuevo elemento idéntico.
      // En caso de no inlcuirse este campo, se devuelve al mismo elemento.
      (!Mila.Objeto.defineLaClavePropia_(elemento, 'copia') ||
        Mila.Tipo.esDeTipo_(elemento.copia, Mila.Tipo.Funcion)
      )
    ;
  }
});

// Recién después de haber inicializado el módulo de tipos se pueden validar los contratos
if (!('sinContratos' in Mila.entorno().universo)) {
  Mila.Documentacion.EmpezarAAnalizarContratos();
}