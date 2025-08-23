Mila.Modulo({
  necesita:["../tipo","../pantalla","panel","desplegable"]
});

Mila.Pantalla.nuevoPanelDesplegable = function(funcionDeContenido, atributos={}) {
  return Mila.Pantalla.desplegableAPartirDe_(Mila.Pantalla.nuevoPanel(atributos), funcionDeContenido);
};