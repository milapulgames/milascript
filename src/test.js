Mila.Modulo({
  define:"Mila.Test"
});

Mila.Test.Evaluar_ = function(tests) {
  for (let test of tests) {
    let resultado = eval(test.i);
    let esperado = test.o;
    if (Mila.Tipo.esDeOtroTipoQue_(resultado, esperado)) {
      Mila.Error(`Falló el test ${test.d}\n\tSe esperaba algo de tipo <${Mila.Tipo.tipo(esperado)}> (${esperado}) pero se obtuvo algo de tipo <${Mila.Tipo.tipo(resultado)}> (${resultado})`);
    } else if (Mila.Tipo.esDistintoA_(resultado, esperado)) {
      Mila.Error(`Falló el test ${test.d}\n\tSe esperaba "${esperado}" pero se obtuvo "${resultado}"`);
    }
  }
};