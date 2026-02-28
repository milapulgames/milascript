Mila.Modulo({
  define:"Mila.Evento.Mouse",
  necesita:["../tipo"]
});

Mila.Evento.Mouse.clicIzquierdo = 0;

Mila.Evento.Mouse.codigoEventoJs = function(eventoJs) {
  return eventoJs.button;
};