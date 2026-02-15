/*  Sobre este archivo
  Aquí se define el tipo ResultadoParcial, usado como tipo de retorno en funciones que pueden fallar.
  Tras invocar a una función parcial, se debe verificar el resultado de la operación con la función 'falló' que indica si
    el resultado parcial es un error o no.
  En caso de no haber error, el resultado puede tener un campo 'contenido' con el verdadero resultado de la operación.
*/

Mila.Modulo({
  define:"Mila.Error",
  usa:["base"],
  necesita:["tipo","js"]
});

Mila.Fallar = function(error) {
  Mila.Contrato({
    Proposito: "Falla e informa el error dado.",
    Parámetros: [
      [error, Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Error])]
    ]
  });
  console.error(error);
};

Mila.Advertir = function(advertencia) {
  Mila.Contrato({
    Proposito: "Falla e informa la advertencia dada.",
    Parámetros: [
      [error, Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Error])]
    ]
  });
  console.warn(advertencia);
};

Mila.Error._Error = Error

Mila.Tipo.Registrar({
  nombre: "Error",
  prototipo: Mila.Error._Error,
  es: 'esUnError',
  strTipo: "Error",
  strInstancia: function(elemento) {
    return `${elemento.name}`;
  }
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