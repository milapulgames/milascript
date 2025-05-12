Mila.Modulo({
  define:"Mila.Evento.Tecla",
  necesita:["../tipo"]
});

Mila.Evento.Tecla.codigoEventoJs = function(eventoJs) {
  // Este es un código equivalente al scancode (con un poco más de detalle porque distingue, por ejemplo ctrl-izq y ctrl-der).
  // Representa a una tecla del teclado pero el nombre no necesariamente coincide con lo que esa tecla genera al escribir, ya que
  // es independiente de la distribución del teclado seleccionada.
  return eventoJs.code;
};