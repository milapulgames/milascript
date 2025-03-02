Mila.Modulo({
  define:"Mila.Tiempo",
  usa:["base"],
  necesita:["tipo"]
});

Mila.Tiempo.nuevoMetronomo = function(periodo, funcion) {
  Mila.Contrato({
    Proposito: [
      "Describir un metrónomo que invoca a la función dada cada una cierta cantidad de tiempo dada por el período dado, en ms.",
      Mila.Tipo.Metronomo
    ],
    Precondiciones: [
      "El período dado es mayor a 0.", periodo > 0
    ],
    Parametros: [
      [periodo, Mila.Tipo.Numero],
      [funcion, Mila.Tipo.Funcion]
    ]
  });
  return new Mila.Tiempo._Metronomo(periodo, funcion);
};

Mila.Tiempo._Metronomo = function Metronomo(periodo, funcion) {
  this._periodo = periodo;
  this._funcion = funcion;
  this._encendido = false;
};

Mila.Tipo.Registrar({
  nombre: "Metronomo",
  prototipo: Mila.Tiempo._Metronomo,
  es: 'esUnMetronomo',
  igualdad: ['_periodo', '_funcion'],
  strTipo: "Metrónomo",
  strInstancia: function(elemento) {
    return `Metrónomo de ${elemento._periodo}ms`;
  }
});

Mila.Tiempo._Metronomo.prototype.Ejecutar = function() {
  Mila.Contrato({
    Proposito: "Poner a ejecutar este metrónomo.",
    Precondiciones: [
      "Este metrónomo no está en ejecución.", !this.estaEnEjecucion()
    ]
  });
  this._encendido = true;
  this._ejecucion = setInterval(this._funcion, this._periodo);
};

Mila.Tiempo._Metronomo.prototype.Detener = function() {
  Mila.Contrato({
    Proposito: "Detener la ejecución de este metrónomo.",
    Precondiciones: [
      "Este metrónomo está en ejecución.", this.estaEnEjecucion()
    ]
  });
  this._encendido = false;
  clearInterval(this._ejecucion);
  delete this._ejecucion;
};

Mila.Tiempo._Metronomo.prototype.estaEnEjecucion = function() {
  Mila.Contrato({
    Proposito: [
      "Indicar si este metrónomo está en ejecución.",
      Mila.Tipo.Booleano
    ]
  });
  return this._encendido;
};