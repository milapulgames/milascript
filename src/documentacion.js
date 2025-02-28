Mila.Modulo({
  define:"Mila.Documentacion",
  necesita:["tipo","ajustes"]
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
  parametroMasDe2: "Uno de los parámetros es una lista con más de 2 elementos",
  parametro2NoEsTipo: "El segundo elemento de uno de los parámetros no define un tipo",
  errorTipoArgumento: "Uno de los argumentos no es del tipo esperado"
};

Mila.Documentacion.ajustes = Mila.Ajustes.nuevo({
  analizarContratos: {
    tipo: "bool",
    inicial: true
  }
});

Mila.Contrato = function(dataContrato) {
  // Directiva para declarar el contrato de una función o un procedimiento.
  if (!Mila.Documentacion.ajustes.analizarContratos()) { return; }
  if (Mila.Documentacion._contratoMalFormado(dataContrato)) {
    return;
  } else if (Mila.Documentacion._hayErroresDeTiposEnArgumentos(Mila.Documentacion._parametrosEn_(dataContrato))) {
    return;
  } else if (!Mila.Documentacion._seCumplenLasPrecondiciones(Mila.Documentacion._precondicionesEn_(dataContrato))) {
    return;
  }
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
Mila.Documentacion._hayErroresDeTiposEnArgumentos = function(parametros) {
  if (
    (parametros.length == 1 || parametros.length == 2)
    && !Array.isArray(parametros[0])
  ) {
    parametros = [parametros];
  }
  for (let parametro of parametros) {
    if (Mila.Documentacion._hayErrorDeTipoEnArgumento(parametro)) {
      Mila.Advertencia(Mila.Documentacion.mensajes.errorTipoArgumento);
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
Mila.Documentacion._seCumplenLasPrecondiciones = function(precondiciones) {
  for (let precondicion of precondiciones) {
    if (typeof precondicion == typeof true && !precondicion) {
      Mila.Advertencia(Mila.Documentacion.mensajes.precondicionNoSeCumple)
      return true;
    } else if (typeof precondicion == typeof (()=>true)) {
      try {
        if (!precondicion()) {
          Mila.Advertencia(Mila.Documentacion.mensajes.precondicionNoSeCumple)
          return true;
        }
      } catch (error) {
        Mila.Advertencia(Mila.Documentacion.mensajes.precondicionNoSePuedeVerificar)
        return true;
      }
    }
  }
  return false;
};

Mila.Documentacion._contratoMalFormado = function(dataContrato) {
  for (let clave of Object.keys(dataContrato)) {
    if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesProposito)) {
      if (Mila.Documentacion._propositoMalFormado(dataContrato[clave])) {
        return true;
      }
    } else if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesParametros)) {
      if (Mila.Documentacion._parametrosMalFormados(dataContrato[clave])) {
        return true;
      }
    } else if (Mila.Documentacion._perteneceClaveIgnorandoVariantes(clave, Mila.Documentacion._clavesPrecondiciones)) {
      if (Mila.Documentacion._precondicionesMalFormadas(dataContrato[clave])) {
        return true;
      }
    } else {
      Mila.Advertencia(`Clave desconocida en el contrato: ${clave}`)
      return true;
    }
  }
  return false;
};

Mila.Documentacion._propositoMalFormado = function(proposito) {
  if (!Array.isArray(proposito)) {
    proposito = [proposito];
  }
  if (proposito.length == 0) {
    Mila.Advertencia(Mila.Documentacion.mensajes.propositoVacio)
    return true;
  } else if (proposito.length == 1) {
    if (typeof proposito[0] != typeof "") {
      Mila.Advertencia(Mila.Documentacion.mensajes.proposito1NoEsTexto)
      return true;
    }
  } else if (proposito.length == 2) {
    if (typeof proposito[0] != typeof "") {
      Mila.Advertencia(Mila.Documentacion.mensajes.proposito2Pero1NoEsTexto)
      return true;
    }
    if (
      !Mila.Tipo.esUnTipo(proposito[1]) &&
      !Mila.Tipo.esElIdentificadorDeUnTipo(proposito[1])
    ) {
      Mila.Advertencia(Mila.Documentacion.mensajes.proposito2Pero2NoEsTipo)
      return true;
    }
  } else {
    Mila.Advertencia(Mila.Documentacion.mensajes.propositoMasDe2)
    return true;
  }
  return false;
};

Mila.Documentacion._parametrosMalFormados = function(parametros) {
  if (!Array.isArray(parametros)) {
    Mila.Advertencia(Mila.Documentacion.mensajes.parametrosNoEsLista)
    return true;
  }
  if (
    (parametros.length == 1 || parametros.length == 2)
    && !Array.isArray(parametros[0])
  ) {
    parametros = [parametros];
  }
  for (let parametro of parametros) {
    if (!Array.isArray(parametros)) {
      parametro = [parametro];
    }
    if (parametro.length > 2) {
      Mila.Advertencia(Mila.Documentacion.mensajes.parametroMasDe2)
      return true;
    } else if (parametro.length == 2) {
      if (
        !Mila.Tipo.esUnTipo(parametro[1]) &&
        !Mila.Tipo.esElIdentificadorDeUnTipo(parametro[1])
      ) {
        Mila.Advertencia(Mila.Documentacion.mensajes.parametro2NoEsTipo)
        return true;
      }
    }
  }
  return false;
};

Mila.Documentacion._precondicionesMalFormadas = function(precondiciones) {
  if (!Array.isArray(precondiciones)) {
    precondiciones = [precondiciones];
  }
  for (let precondicion of precondiciones) {
    if (
      typeof precondicion != typeof "" &&
      typeof precondicion != typeof true &&
      typeof precondicion != typeof (()=>true)
    ) {
      Mila.Advertencia(Mila.Documentacion.mensajes.precondicionNoEsTipoNiCondicion)
      return true;
    }
  }
  return false;
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