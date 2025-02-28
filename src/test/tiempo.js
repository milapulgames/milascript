Mila.Modulo({usa:['../tiempo','../test']});

const metronomo = (args) => `Mila.Tiempo.nuevoMetronomo(${args});`;
const metronomoNulo = metronomo('1000,x=>{}');

const advertencia = function(clave) {
  return Mila.Documentacion.mensajes[clave];
};

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:`let a=${metronomoNulo}a.estaEnEjecucion()`, o:false,                                            d:"estaEnEjecucion devuelve falso con un metronomo recién creado"},
  {i:`let a=${metronomoNulo}a.Ejecutar();a.estaEnEjecucion()`, o:true,                                d:"estaEnEjecucion devuelve verdadero con un metronomo en ejecución"},
  {i:`let a=${metronomoNulo}a.Ejecutar();a.Detener();a.estaEnEjecucion()`, o:false,                   d:"estaEnEjecucion devuelve falso con un metronomo detenido"},
  {i:`let a=${metronomoNulo}a.Ejecutar();a.Ejecutar()`, w:advertencia('precondicionNoSeCumple'),      d:"Ejecutar falla si el metrónomo ya está en ejecución"},
  {i:`let a=${metronomoNulo}a.Detener()`, w:advertencia('precondicionNoSeCumple'),                    d:"Detener falla si el metrónomo no está en ejecución"}
]));