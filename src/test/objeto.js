Mila.Modulo({usa:['../objeto','../test']});

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:"let a={};a.clavesDefinidas()", o:[],                            d:"clavesDefinidas devuelve la lista vacía con un objeto vacío"},
  {i:"let a={x:1,y:2};a.clavesDefinidas()", o:['x','y'],              d:"clavesDefinidas devuelve la lista con las claves definidas"},
  {i:"let a={x:1,y:2};a.clavesDefinidas();a", o:{x:1,y:2},            d:"clavesDefinidas no modifica el objeto"}
]));