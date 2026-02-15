Mila.Modulo({
  define:"Mila.Sistema",
  usa:["base","error","archivo"]
});

Mila.Sistema.EjecutarMila_ConArgumentos_YLuego_ = function(rutaScriptMila, argumentos, función) {
  Mila.Contrato({
    Propósito:"Ejecuta el script mila en la ruta dada con los argumentos dados y luego invoca a la función \
    dada con el resultado parcial de la operación. En caso de éxito, el contenido del resultado es un objeto \
    con los campos 'stdout' y 'stderr'.",
    Parámetros: [
      [rutaScriptMila, Mila.Tipo.Texto],
      [argumentos, Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.ListaDe_(Mila.Tipo.Texto)])],
      [función, Mila.Tipo.Funcion]
    ]
  });
  Mila.Sistema.Ejecutar_YLuego_(`node ${Mila.Archivo.rutaAPartirDe_([Mila._proyectos.milascript,"mila.js"])} ${rutaScriptMila} ${
    (argumentos.esUnTexto()) ? argumentos : argumentos.join(" ")
  }`, función);
};

Mila.Sistema.Ejecutar_YLuego_ = function(comando, función) {
  Mila.Contrato({
    Propósito:"Ejecuta el comando dado y luego invoca a la función dada con el resultado parcial de la operación. \
    En caso de éxito, el contenido del resultado es un objeto con los campos 'stdout' y 'stderr'.",
    Parámetros: [
      [comando, Mila.Tipo.Texto],
      [función, Mila.Tipo.Funcion]
    ]
  });
  Mila.exec(comando, (error, stdout, stderr) => {
    función((Mila.Tipo.esAlgo(error))
      ? Mila.Error.resultadoParcialFallo(error)
      : Mila.Error.resultadoParcialOk({stdout, stderr})
    );
  });
};