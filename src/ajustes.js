Mila.Modulo({
  define:"Mila.Ajustes"
});

Mila.Ajustes.nuevo = function(ajustes) {
  return new Mila.Ajustes._Ajustes(ajustes);
};

Mila.Ajustes._Ajustes = function Ajustes(ajustes) {
  this._claves = Object.keys(ajustes);
  for (let clave of this._claves) {
    this[`_${clave}`] = Object.assign({valorActual: ajustes[clave].inicial}, ajustes[clave]);
    this[clave] = function() {
      return this[`_${clave}`].valorActual;
    }
  }
};

Mila.Ajustes._Ajustes.prototype.Ajustar_A_ = function(clave, valor) {
  this[`_${clave}`].valorActual = valor;
};

Mila.Ajustes._Ajustes.prototype.todos = function() {
  const todosLosAjustes = {};
  for (let clave of this._claves) {
    todosLosAjustes[clave] = this[clave]();
  }
  return todosLosAjustes;
};

Mila.Ajustes._Ajustes.prototype.existe_ = function(clave) {
  return this._claves.includes(clave);
};