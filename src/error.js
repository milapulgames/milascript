/*  Sobre este archivo
  Aquí se define el tipo ResultadoParcial, usado como tipo de retorno en funciones que pueden fallar.
  Tras invocar a una función parcial, se debe verificar el resultado de la operación con la función 'falló' que indica si
    el resultado parcial es un error o no.
  En caso de no haber error, el resultado puede tener un campo 'contenido' con el verdadero resultado de la operación.
*/

Mila.Modulo({
  define:"Mila.Error",
  usa:["base"],
  necesita:["tipo","js","idioma","archivo"]
});

Mila.Fallar = function(error) {
  Mila.Contrato({
    Proposito: "Falla e informa el error dado.",
    Parámetros: [
      [error, Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Error])]
    ]
  });
  console.log(error.descripción());
  console.error(error);
};

Mila.Advertir = function(advertencia) {
  Mila.Contrato({
    Proposito: "Falla e informa la advertencia dada.",
    Parámetros: [
      [advertencia, Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Error])]
    ]
  });
  console.warn(advertencia);
};

Mila.Error.declarados = {}; // Mapa de errores declarados

Mila.Error._descripción = function(error) {
  let clase = error.name;
  if (clase in Mila.Error.declarados) {
    return ((Mila.Idioma.idiomaSeleccionado().esAlgo() && Mila.Idioma.existeLaClave_(`ERROR_${clase}`))
      ? Mila.Idioma.traducciónDeClave_(`ERROR_${clase}`)
      : clase + Mila.Error.declarados[clase].parámetros.map((parámetro) => " " + error[parámetro[0]].aTexto()).join("")
    ).aplicandoReemplazosCon_({
      indicadorInicioAgujero:"{",
      escapeInicioAgujero:"{{",
      indicadorFinAgujero:"}",
      escapeFinAgujero:"}}",
      mapaReemplazos:(claveAgujero) => error[claveAgujero]
    });
  }
  return clase;
};
Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
  prototipo: Error,
  nombre: 'descripción',
  cantidadDeParametros: 0,
  posicionDeThis: 0,
  funcionAInvocar: 'Mila.Error._descripción'
});

Mila.Error.Declarar = function(nombreTipo, nombreFunción, parámetros=[], optDescripción) {
  Mila.Error.declarados[nombreTipo] = {
    parámetros
  };
  eval(`Mila.Error._${nombreTipo} = function ${nombreTipo}() {};`);
  eval(`Object.setPrototypeOf(Mila.Error._${nombreTipo}.prototype, Error.prototype);`);
  eval(`Mila.Error.${nombreFunción} = function(${parámetros.map(p => p[0]).join(", ")}) {\n` +
    `  const nuevoError = new Mila.Error._${nombreTipo}();\n` +
    `  nuevoError.name = '${nombreTipo}';\n` +
    parámetros.map(p => `  nuevoError.${p[0]} = ${p[0]};\n`).join("") +
    `  return nuevoError;\n` +
    `};`
  );
  if (Mila.Tipo.esAlgo(optDescripción)) {
    if (Mila.Idioma.idiomaSeleccionado().esAlgo()) {
      Mila.Idioma.AgregarTraducibles_({
        [`ERROR_${nombreTipo}`]: optDescripción
      });
    }
  }
};

Mila.Error._Error = Error

Mila.Tipo.Registrar({
  nombre: "Error",
  prototipo: Mila.Error._Error,
  es: 'esUnError',
  strTipo: "Error",
  strInstancia: Mila.Error._descripción
});

Mila.Error._ResultadoParcial = function ResultadoParcial() {};

Mila.Tipo.Registrar({
  nombre: "ResultadoParcial",
  prototipo: Mila.Error._ResultadoParcial,
  strTipo: "ResultadoParcial",
  strInstancia: function(elemento) {
    return elemento.falló() ? elemento.error.toString() : elemento.contenido.aTexto()
  }
});

Mila.Error.resultadoParcialOk = function(contenido=Mila.Nada) {
  Mila.Contrato({
    Proposito: ["Describe un resultado parcial que tuvo éxito y su resultado es el contenido dado.", Mila.Tipo.ResultadoParcial],
    Parámetros: [
      contenido // Opcional
    ]
  });
  const resultado = new Mila.Error._ResultadoParcial();
  if (contenido.esAlgo()) {
    resultado.contenido = contenido;
  }
  return resultado;
};

Mila.Error.resultadoParcialFallo = function(error) {
  Mila.Contrato({
    Proposito: ["Describe un resultado parcial que falló con el error dado.", Mila.Tipo.ResultadoParcial],
    Parámetros: [
      [error, Mila.Tipo.Error]
    ]
  });
  const resultado = new Mila.Error._ResultadoParcial();
  resultado.error = error;
  return resultado;
};

Mila.Error._ResultadoParcial.prototype.falló = function() {
  Mila.Contrato({
    Proposito: ["Indica si este resultado parcial falló.", Mila.Tipo.Booleano],
  });
  return 'error' in this;
};

Mila.Idioma.AgregarDirectorio_(Mila.Archivo.rutaAPartirDe_(['$milascript','msg','error']), "ERROR");

Mila.Error.Declarar('TamañoListaDistinto', 'deTamañoListaDistinto', [
  ['lista', Mila.Tipo.Lista],
  ['tamañoEsperado', Mila.Tipo.Entero]
]);