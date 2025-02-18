Mila.Modulo({
  define:"Mila.Ajustes"
});

Mila.Ajustes.nuevo = function(ajustes) {
  const resultado = {
    _claves: Object.keys(ajustes)
  };
  for (let clave of resultado._claves) {
    resultado[`_${clave}`] = Object.assign({valorActual: ajustes[clave].inicial}, ajustes[clave]);
    resultado[clave] = function() {
      return resultado[`_${clave}`].valorActual;
    }
  }
  resultado.Ajustar_A_ = function(clave, valor) {
    resultado[`_${clave}`].valorActual = valor;
  };
  resultado.todos = function() {
    const todosLosAjustes = {};
    for (let clave of this._claves) {
      todosLosAjustes[clave] = this[clave]();
    }
    return todosLosAjustes;
  };
  resultado.existe_ = function(clave) {
    return this._claves.includes(clave);
  };
  return resultado;
};