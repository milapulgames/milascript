/*
  - puerto: Entero.
*/

Mila.Módulo({
  usa:["../src/servidor","../src/función"]
});

Mila.alIniciar(function() {
  if (Mila.entorno().enNavegador()) {
    Mila.Fallar("Este script se tiene que ejecutar en Node.");
  } else {
    const argumentos = Mila.entorno().argumentos;
    const puerto = 'puerto' in argumentos
      ? Number.parseInt(argumentos.puerto)
      : Mila.Nada
    ;
    Mila.Servidor.Escuchar({
      puerto,
      archivos: Mila.Función.identidad()
    });
  }
});