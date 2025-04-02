Mila.Modulo({
  define:"Mila.Documentacion",
  usa:["tipo","lista"]
});

Mila.Documentacion.mensajes = {
  propositoVacio: "El propósito es una lista vacía",
  proposito1NoEsTexto: "El propósito tiene 1 elemento pero este no es un texto",
  proposito2Pero1NoEsTexto: "El propósito tiene 2 elementos pero el primero no es un texto",
  proposito2Pero2NoEsTipo: "El propósito tiene 2 elementos pero el segundo no define un tipo",
  propositoMasDe2: "El propósito tiene más de 2 elementos",
  precondicionNoEsTipoNiCondicion: "Una de las precondiciones no es un texto ni una condición",
  precondicionNoSeCumple: "Una de las precondiciones no se cumple",
  precondicionNoSePuedeVerificar: "Una de las precondiciones no se pudo verificar",
  parametrosNoEsLista: "La lista de parámetros no es una lista",
  parametroMasDe3: "El parámetro %I es una lista con más de 3 elementos",
  parametro2NoEsTipo: "El segundo elemento del parámetro %I no define un tipo: %EXPR",
  errorTipoArgumento: "El argumento %I (%ARG) no es del tipo esperado (%TYPE)"
};

Mila.Documentacion.ajustes = {
  analizarContratos: false
};

Mila.Contrato = function(dataContrato) {
  // Directiva para declarar el contrato de una función o un procedimiento.

  if (!Mila.Documentacion.analizandoContratos()) { return; }

  // Deshabilito para evitar recursión infinita
  Mila.Documentacion.DejarDeAnalizarContratos();

  const estado = Mila.Documentacion.estadoEjecucion();

  Mila.Documentacion._contratoMalFormado(dataContrato, estado) ||
  Mila.Documentacion._hayErroresDeTiposEnArgumentos(
    Mila.Documentacion._parametrosEn_(dataContrato), estado
  ) ||
  !Mila.Documentacion._seCumplenLasPrecondiciones(
    Mila.Documentacion._precondicionesEn_(dataContrato), estado
  );

  // Vuelvo a habilitar
  Mila.Documentacion.EmpezarAAnalizarContratos();
};

Mila.Documentacion._clavesProposito = ['proposito','prop','post'];

Mila.Documentacion._clavesParametros = ['parametros','param','params'];
Mila.Documentacion._parametrosEn_ = function(dataContrato) {
  let resultado = [];
  for (let clave of Object.keys(dataContrato)) {
    if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesParametros)) {
      resultado = resultado.concat(dataContrato[clave]);
    }
  }
  return resultado;
};
Mila.Documentacion._hayErroresDeTiposEnArgumentos = function(parametros, estado) {
  if (
    (parametros.length == 1 || parametros.length == 2)
    && !Array.isArray(parametros[0])
  ) {
    parametros = [parametros];
  }
  let i=0;
  for (let parametro of parametros) {
    i++;
    if (Mila.Documentacion._hayErrorDeTipoEnArgumento(parametro)) {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.errorTipoArgumento
        .replace("%I", i).replace("%ARG", Mila.Tipo.aTexto(parametro[0])).replace("%TYPE", Mila.Tipo.aTexto(parametro[1]))
      );
      return true;
    }
  }
  return false;
};

Mila.Documentacion._hayErrorDeTipoEnArgumento = function(parametro) {
  return parametro.length == 2 && !Mila.Tipo.esDeTipo_(parametro[0], parametro[1]);
};

Mila.Documentacion._clavesPrecondiciones = ['precondiciones','pre'];
Mila.Documentacion._precondicionesEn_ = function(dataContrato) {
  let resultado = [];
  for (let clave of Object.keys(dataContrato)) {
    if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesPrecondiciones)) {
      let nuevasPrecondiciones =
        Array.isArray(dataContrato[clave])
        ? dataContrato[clave]
        : [dataContrato[clave]]
      ;
      resultado = resultado.concat(nuevasPrecondiciones);
    }
  }
  return resultado;
};
Mila.Documentacion._seCumplenLasPrecondiciones = function(precondiciones, estado) {
  for (let precondicion of precondiciones) {
    if (typeof precondicion == typeof true && !precondicion) {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.precondicionNoSeCumple)
      return true;
    } else if (typeof precondicion == typeof (()=>true)) {
      try {
        if (!precondicion()) {
          Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.precondicionNoSeCumple)
          return true;
        }
      } catch (error) {
        Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.precondicionNoSePuedeVerificar)
        return true;
      }
    }
  }
  return false;
};

Mila.Documentacion._contratoMalFormado = function(dataContrato, estado) {
  for (let clave of Object.keys(dataContrato)) {
    if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesProposito)) {
      if (Mila.Documentacion._propositoMalFormado(dataContrato[clave], estado)) {
        return true;
      }
    } else if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesParametros)) {
      if (Mila.Documentacion._parametrosMalFormados(dataContrato[clave], estado)) {
        return true;
      }
    } else if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesPrecondiciones)) {
      if (Mila.Documentacion._precondicionesMalFormadas(dataContrato[clave], estado)) {
        return true;
      }
    } else {
      Mila.Documentacion.Advertencia(estado, `Clave desconocida en el contrato: ${clave}`)
      return true;
    }
  }
  return false;
};

Mila.Documentacion._propositoMalFormado = function(proposito, estado) {
  if (!Array.isArray(proposito)) {
    proposito = [proposito];
  }
  if (proposito.length == 0) {
    Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.propositoVacio)
    return true;
  } else if (proposito.length == 1) {
    if (typeof proposito[0] != typeof "") {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.proposito1NoEsTexto)
      return true;
    }
  } else if (proposito.length == 2) {
    if (typeof proposito[0] != typeof "") {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.proposito2Pero1NoEsTexto)
      return true;
    }
    if (
      !Mila.Tipo.esUnTipo(proposito[1]) &&
      !Mila.Tipo.esElIdentificadorDeUnTipo(proposito[1])
    ) {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.proposito2Pero2NoEsTipo)
      return true;
    }
  } else {
    Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.propositoMasDe2)
    return true;
  }
  return false;
};

Mila.Documentacion._parametrosMalFormados = function(parametros, estado) {
  if (!Array.isArray(parametros)) {
    Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.parametrosNoEsLista)
    return true;
  }
  if (
    (parametros.length == 1 || parametros.length == 2 || parametros.length == 3)
    && !Array.isArray(parametros[0])
  ) {
    parametros = [parametros];
  }
  let i=0;
  for (let parametro of parametros) {
    i++;
    if (!Array.isArray(parametros)) {
      parametro = [parametro];
    }
    if (parametro.length > 3) {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.parametroMasDe3
        .replace("%I", i)
      );
      return true;
    } else if (parametro.length > 1) {
      if (
        !Mila.Tipo.esUnTipo(parametro[1]) &&
        !Mila.Tipo.esElIdentificadorDeUnTipo(parametro[1])
      ) {
        Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.parametro2NoEsTipo
          .replace("%I", i).replace("%EXPR", Mila.Tipo.aTexto(parametro[1]))
        );
        return true;
      }
    }
  }
  return false;
};

Mila.Documentacion._precondicionesMalFormadas = function(precondiciones, estado) {
  if (!Array.isArray(precondiciones)) {
    precondiciones = [precondiciones];
  }
  for (let precondicion of precondiciones) {
    if (
      typeof precondicion != typeof "" &&
      typeof precondicion != typeof true &&
      typeof precondicion != typeof (()=>true)
    ) {
      Mila.Documentacion.Advertencia(estado, Mila.Documentacion.mensajes.precondicionNoEsTipoNiCondicion)
      return true;
    }
  }
  return false;
};

Mila.Documentacion.estadoEjecucion = function() {
  return {funcion: new Error().stack.split("\n    ").splice(3,1)
    .map(x => x.substring(3, x.indexOf(" ",3)))[0]
  };
};

Mila.Documentacion.Advertencia = function(estado, mensaje) {
  Mila.Advertencia(`[${estado.funcion}] ${mensaje}`);
};

Mila.Documentacion.analizandoContratos = function() {
  return Mila.Documentacion.ajustes.analizarContratos;
};

Mila.Documentacion.EmpezarAAnalizarContratos = function() {
  Mila.Documentacion.ajustes.analizarContratos = true;
};

Mila.Documentacion.DejarDeAnalizarContratos = function() {
  Mila.Documentacion.ajustes.analizarContratos = false;
};

Mila.Documentacion.Ejecutar_SinAnalizarContratos = function(funcion) {
  const estadoAnterior = Mila.Documentacion.ajustes.analizarContratos;
  Mila.Documentacion.DejarDeAnalizarContratos();
  const resultado = funcion();
  Mila.Documentacion.ajustes.analizarContratos = estadoAnterior;
  return resultado;
};

Mila.Documentacion._perteneceClaveIgnorandoVariantes = function(clave, lista) {
  return lista.includes(
    clave.toLowerCase()
      .replace('á','a')
      .replace('é','e')
      .replace('í','i')
      .replace('ó','o')
      .replace('ú','u')
      .replace('ñ','n')
  );
};