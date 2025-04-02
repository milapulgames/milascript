Mila.Modulo({
  define:"Mila.Texto",
  usa:["base"]
});

Mila.Texto._Definir_EnPrototipo_ = function(nombre, prototipo, posicionDeThis=0) {
  // Define en un prototipo una función de instancia a partir de otra función definida en este módulo.
    // nombre es una cadena de texto correspondiente al nombre de la función a definir (la misma que la que ya está definida).
    // prototipo es el objeto en cuyo prototipo se definirá la función.
    // posicionDeThis es un entero correspondiente a la posición del argumento que corresponde a la instancia this en la invocación a la función del módulo (0 si se omite).
  // PRE: Hay una función con el nombre dado en este módulo (Mila.Texto).
  Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
    prototipo,
    nombre,
    cantidadDeParametros: Mila.Texto[nombre].length-1,
    posicionDeThis,
    funcionAInvocar: `Mila.Texto.${nombre}`
  });
};

Mila.Texto.esVacio = function(texto) {
  // Indica si el texto dado está vacío.
    // texto es una cadena de texto, la cual se indica si está vacía.
  return texto.length == 0;
};
Mila.Texto._Definir_EnPrototipo_('esVacio', String);

