/*  Sobre este archivo
  Este es el intérprete de milascript. Permite ejecutar código milascript en una consola interactiva.
    actúa como punto de entrada al proyecto y además necesita escribir un archivo en el sistema de archivos local.
  Para ejecutarlo mediante NodeJs: Ejecutar en una terminal `mila interact` o simplemente `mila`.
  Para ejecutarlo en un navegador: NO DISPONIBLE POR EL MOMENTO
*/

Mila.Modulo({
  necesita:["../src/base"],
  usa:["../src/texto"]
});

const Imprimir = function(texto) {
  Mila.Contrato({
    // ...
  });
  console.log(texto);
};

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

const textoPorAhora = {
  antesDelCursor: "",
  despuesDelCursor: "",
  tmp:Mila.Nada,
  Reiniciar: function() {
    this.antesDelCursor = "";
    this.despuesDelCursor = "";
    this.tmp = Mila.Nada;
  },
  IngresarCaracter_: function(caracter) {
    this.antesDelCursor += caracter;
  },
  cursorAlInicio: function() {
    return this.antesDelCursor.length == 0;
  },
  cursorAlFinal: function() {
    return this.despuesDelCursor.length == 0;
  },
  MoverCursorDerecha: function() {
    this.antesDelCursor += this.despuesDelCursor[0];
    this.BorrarCaracterSiguiente();
  },
  MoverCursorIzquierda: function() {
    this.despuesDelCursor = this.antesDelCursor[this.antesDelCursor.length-1] + this.despuesDelCursor;
    this.BorrarCaracterAnterior();
  },
  BorrarCaracterAnterior: function() {
    this.antesDelCursor = this.antesDelCursor.sinLosUltimos_(1);
  },
  BorrarCaracterSiguiente: function() {
    this.despuesDelCursor = this.despuesDelCursor.sinLosPrimeros_(1);
  },
  contenido: function() {
    return this.antesDelCursor + this.despuesDelCursor;
  },
  PasarAHistorial_: function(elementoHistorial) {
    if (this.tmp.esNada()) {
      this.tmp = this.antesDelCursor + this.despuesDelCursor;
    }
    this.antesDelCursor = elementoHistorial;
    this.despuesDelCursor = "";
  },
  VolverDeHistorial: function() {
    this.antesDelCursor = this.tmp;
    this.despuesDelCursor = "";
    this.tmp = Mila.Nada;
  }
}

const es_CaracterImprimible = function(caracter) {
  let primerByte = caracter.charCodeAt(0);
  return (caracter.longitud() == 1 && ((primerByte >= 32 && primerByte <= 126) || (primerByte >= 160 && primerByte <= 591)));
};

const es_UnaSecuenciaDeCaracteresImprimibles = function(caracter) {
  // Por ejemplo, si se pega un contenido del portapapeles
  return true;
};

const entradaIngresada = function() {
  process.stdin.resume();
  return new Promise((resolve) => {
    const listener = function (data) {
      if (data == '\u001B\u005B\u0041') {                           // arriba
        if (cursorHistorial == -1 && historial.length > 0) {
          cursorHistorial = historial.length-1;
          ReemplazarPorHistorial();
        } else if (cursorHistorial > 0) {
          cursorHistorial--;
          ReemplazarPorHistorial();
        }
      } else if (data == '\u001B\u005B\u0042') {                    // abajo
        if (cursorHistorial >= 0) {
          if (cursorHistorial < historial.length-1) {
            cursorHistorial++;
            ReemplazarPorHistorial();
          } else {
            cursorHistorial = -1;
            ReemplazarPor_(textoPorAhora.tmp);
            textoPorAhora.VolverDeHistorial();
          }
        }
      } else if (data == '\u001B\u005B\u0043') {                    // derecha
        if (!textoPorAhora.cursorAlFinal()) {
          textoPorAhora.MoverCursorDerecha();
          process.stdout.moveCursor(1, 0);
        }
      } else if (data == '\u001B\u005B\u0044') {                    // izquierda
        if (!textoPorAhora.cursorAlInicio()) {
          textoPorAhora.MoverCursorIzquierda();
          process.stdout.moveCursor(-1, 0);
        }
      } else if (data == '\u0003') {                                // ctrl-c
        process.exit();
      } else if (data == '\u0004') {                                // ctrl-d
        process.exit();
      } else if (data == '\u001B\u005B\u0031\u003B\u0035\u0044') {  // ctrl-derecha
        // ...
      } else if (data == '\u001B\u005B\u0031\u003B\u0035\u0043') {  // ctrl-izquierda
        // ...
      } else if (data == '\u001B\u005B\u0048') {                    // inicio
        // ...
      } else if (data == '\u001B\u005B\u0046') {                    // fin
        // ...
      } else if (data == '\u001B\u005B\u0046') {                    // arroba
        // ...
      } else if (data == '\u0009') {                                // tab
        Autocompletar();
      } else if (data == '\u007F') {                                // backspace
        if (!textoPorAhora.cursorAlInicio()) {
          process.stdout.write("\b" + textoPorAhora.despuesDelCursor + " \b");
          process.stdout.moveCursor(-textoPorAhora.despuesDelCursor.length, 0);
          textoPorAhora.BorrarCaracterAnterior();
        }
      } else if (data == '\u001B') {                                // escape
        // ...
      } else if (data == '\u001B\u005B\u0033\u007E') {              // delete
        if (!textoPorAhora.cursorAlFinal()) {
          textoPorAhora.BorrarCaracterSiguiente();
          process.stdout.write(textoPorAhora.despuesDelCursor + " \b");
          process.stdout.moveCursor(-textoPorAhora.despuesDelCursor.length, 0);
        }
      } else if (data == '\u000D') {                                // enter
        Imprimir("");
        process.stdin.off("data", listener);
        resolve(textoPorAhora.contenido());
      } else if (es_CaracterImprimible(data)) {
        process.stdout.write(data + textoPorAhora.despuesDelCursor);
        process.stdout.moveCursor(-textoPorAhora.despuesDelCursor.length, 0);
        textoPorAhora.IngresarCaracter_(data);
      } else if (es_UnaSecuenciaDeCaracteresImprimibles(data)) {
        process.stdout.write(data + textoPorAhora.despuesDelCursor);
        process.stdout.moveCursor(-textoPorAhora.despuesDelCursor.length, 0);
        textoPorAhora.IngresarCaracter_(data);
      } else {
        Imprimir(data.length);
        for (let i=0; i<data.length; i++) {
          Imprimir(data.charCodeAt(i));
        }
      }
    };
    textoPorAhora.Reiniciar();
    process.stdin.on("data", listener);
  });
};

const Autocompletar = function() {
  // ...
};

const historial = [];
let cursorHistorial = -1;

const ReemplazarPor_ = function(texto) {
  LimpiarSalida();
  process.stdout.write(texto);
  textoPorAhora.PasarAHistorial_(texto);
};

const ReemplazarPorHistorial = function() {
  textoPorAhora.PasarAHistorial_(historial[cursorHistorial]);
  ReemplazarPor_(historial[cursorHistorial]);
};

const LimpiarSalida = function() {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write("> ");
};

const resultadoEvaluacion = function(expresion) {
  return eval(expresion);
};

async function run() {
  while (true) {
    process.stdout.write("> ");
    cursorHistorial = -1;
    let entrada = await entradaIngresada();
    if (entrada.length > 0){
      historial.push(entrada);
    }
    try {
      Imprimir(resultadoEvaluacion(entrada));
    } catch (error) {
      Imprimir(error);
    }
  }
};

run();
