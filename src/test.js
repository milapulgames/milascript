Mila.Modulo({
  define:"Mila.Test",
  usa:["base"]
});

/*  Estructura de los tests (TODO: registrarlo como tipo)
  d: Descripción (string) - Descripción del test.
  i: Entrada (string | function) - El código a ejecutar.
  o (opcional): Salida (any) - El valor que se espera obtener como resultado de la ejecución.
  oX (opcional; sólo si no está 'o'): Salida (string) - Un texto que al evaluarlo se obtiene el resultado esperado.
  e (opcional): Errores a generar (string | [string]) - Los mensajes de error que se espera que genere la ejecución.
  w (opcional): Advertencias a generar (string | [string]) - Los mensajes de advertencia que se espera que genere la ejecución.
*/

Mila.Test.Evaluar_ = function(tests) {
  const advertencias = [];
  const errores = [];
  const Advertir = Mila.Advertir;
  const Fallar = Mila.Fallar;
  Mila.Advertir = function(advertencia) {
    advertencias.push(advertencia);
  }
  Mila.Fallar = function(error) {
    errores.push(error);
  }
  for (let test of tests) {
    advertencias.splice(0,advertencias.length);
    errores.splice(0,errores.length);
    let resultado = test.i.esUnaFuncion() ? test.i() : eval(test.i);
    if ('w' in test) {
      const advertenciasEsperadas = Array.isArray(test.w) ? test.w : [test.w];
      for (let w of advertenciasEsperadas) {
        let cantidadObtenida = advertencias.cantidadDeAparicionesDe_(w);
        let cantidadEsperada = advertenciasEsperadas.cantidadDeAparicionesDe_(w);
        if (cantidadObtenida != cantidadEsperada) {
          let vecesObtenida = `${cantidadObtenida} ${cantidadObtenida == 1 ? 'vez' : 'veces'}`
          let vecesEsperada = `${cantidadEsperada} ${cantidadEsperada == 1 ? 'vez' : 'veces'}`;
          Fallar(`Falló el test ${test.d}\n\tSe esperaba la advertencia ${w} ${vecesEsperada} pero ocurrió ${vecesObtenida}`);
        }
        advertencias.SacarLosQueCumplen(x => x == w);
      }
    }
    if ('e' in test) {
      const erroresEsperados = Array.isArray(test.e) ? test.e : [test.e];
      for (let e of erroresEsperados) {
        let cantidadObtenida = errores.cantidadDeAparicionesDe_(e);
        let cantidadEsperada = erroresEsperados.cantidadDeAparicionesDe_(e);
        if (cantidadObtenida != cantidadEsperada) {
          let vecesObtenida = `${cantidadObtenida} ${cantidadObtenida == 1 ? 'vez' : 'veces'}`
          let vecesEsperada = `${cantidadEsperada} ${cantidadEsperada == 1 ? 'vez' : 'veces'}`;
          Fallar(`Falló el test ${test.d}\n\tSe esperaba el error ${e} ${vecesEsperada} pero ocurrió ${vecesObtenida}`);
        }
        errores.SacarLosQueCumplen(x => x == e);
      }
    }
    if (advertencias.length > 0 || errores.length > 0) {
      let mensaje = `Falló el test ${test.d}\n\t`;
      if (errores.length > 0) {
        mensaje += `Ocurrieron los siguientes errores no esperados:\n\t\t${errores.join('\n\t\t')}\n\t\t`;
      }
      if (advertencias.length > 0) {
        mensaje += `Ocurrieron las siguientes advertencias no esperadas:\n\t\t${advertencias.join('\n\t\t')}\n\t\t`;
      }
      Fallar(mensaje);
    }
    let esperado = null;
    if ('o' in test) {
      esperado = test.o;
    } else if ('oX' in test) {
      esperado = eval(test.oX);
    }
    if (esperado !== null) {
      if (Mila.Tipo.esDeOtroTipoQue_(resultado, esperado)) {
        Fallar(`Falló el test ${test.d}\n\tSe esperaba algo de tipo <${Mila.Tipo.tipo(esperado)}> (${esperado}) pero se obtuvo algo de tipo <${Mila.Tipo.tipo(resultado)}> (${resultado})`);
      } else if (Mila.Tipo.esDistintoA_(resultado, esperado)) {
        Fallar(`Falló el test ${test.d}\n\tSe esperaba "${esperado}" pero se obtuvo "${resultado}"`);
      }
    }
  }
  Mila.Advertir = Advertir;
  Mila.Fallar = Fallar;
};