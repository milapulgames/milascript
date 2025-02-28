Mila.Modulo({usa:['../geometria','../test']});

const p = (args) => `Mila.Geometria.puntoEn__(${args});`
const origen = p('0,0');
const rect = (args) => `Mila.Geometria.rectanguloEn__De_x_(${args});`;
const rectNormal = rect('0,0,1,1');
const circ = (args) => `Mila.Geometria.circuloEn__DeRadio_(${args});`;
const circNormal = circ('0,0,1');

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:`let a=${origen}a.x`, o:0,                                             d:"La coordenada x del origen es 0"},
  {i:`let a=${origen}a.y`, o:0,                                             d:"La coordenada y del origen es 0"},
  {i:`let a=${origen}a.trasladado_En_(2,'x')`, oX:p('2,0'),                 d:"trasladado_En_ devuelve un punto trasladado en x"},
  {i:`let a=${origen}a.trasladado_En_(-3,'y')`, oX:p('0,-3'),               d:"trasladado_En_ devuelve un punto trasladado en y"},
  {i:`let a=${origen}a.trasladado_En_(2,'x');a`, oX:origen,                 d:"trasladado_En_ no modifica al punto receptor"},
  {i:`let a=${origen}a.Trasladar_En_(-2,'x');a`, oX:p('-2,0'),              d:"Trasladar_En_ traslada al punto en x"},
  {i:`let a=${origen}a.Trasladar_En_(3,'y');a`, oX:p('0,3'),                d:"Trasladar_En_ traslada al punto en y"},
  {i:`let a=${rect('0,0,10,10')}a.centro()`, oX:p('5,5'),                   d:"El centro de un rectángulo está a la mitad entre su origen y sus dimensiones"},
  {i:`let a=${circNormal}a.centro()`, oX:origen,                            d:"El centro de un círculo está en su origen"}
]));