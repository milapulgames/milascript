Mila.Modulo({usa:['../objeto','../test']});

const soloA = "let a={x:1,y:2}";
const noEnumA = ";Object.defineProperty(a,'hx',{enumerable:false,value:-1})";
const aConNoEnum = soloA+noEnumA;
const aB = soloA+";let b={z:3};Object.setPrototypeOf(a,b)";
const noEnumB = ";Object.defineProperty(b,'hz',{enumerable:false,value:-3})";
const aBConNoEnum = aB+noEnumA+noEnumB;
const mensajesNoEnumerablesDeObject = Object.getOwnPropertyNames(Object);

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:"let a={};a.clavesDefinidas()", o:[],                                d:"clavesDefinidas devuelve la lista vacía con un objeto vacío"},
  {i:soloA+";a.clavesDefinidas()", o:['x','y'],                           d:"clavesDefinidas devuelve la lista con las claves definidas"},
  {i:soloA+";a.clavesDefinidas();a", o:{x:1,y:2},                         d:"clavesDefinidas no modifica el objeto"},
  {i:aConNoEnum+";a.clavesDefinidas()", o:['x','y'],                      d:"clavesDefinidas no incluye las no enumerables"},
  {i:aConNoEnum+";a.clavesDefinidas(true)", o:['x','y','hx'],             d:"clavesDefinidas incluye las no enumerables"},
  {i:aB+";a.clavesDefinidas()", o:['x','y'],                              d:"clavesDefinidas no incluye las del prototipo (1)"},
  {i:aBConNoEnum+";a.clavesDefinidas()", o:['x','y'],                     d:"clavesDefinidas no incluye las del prototipo (2)"},
  {i:aBConNoEnum+";a.clavesDefinidas(true)", o:['x','y','hx'],            d:"clavesDefinidas no incluye las del prototipo (3)"},
  // valoresContenidos
  {i:"let a={};a.mensajesQueSabeResponder()", o:[],                       d:"mensajesQueSabeResponder devuelve la lista vacía con un objeto vacío"},
  {i:soloA+";a.mensajesQueSabeResponder()", o:['x','y'],                  d:"mensajesQueSabeResponder devuelve la lista con las claves definidas"},
  {i:soloA+";a.mensajesQueSabeResponder();a", o:{x:1,y:2},                d:"mensajesQueSabeResponder no modifica el objeto"},
  {i:aConNoEnum+";a.mensajesQueSabeResponder()", o:['x','y'],             d:"mensajesQueSabeResponder no incluye las no enumerables"},
  {i:aConNoEnum+";a.mensajesQueSabeResponder(true)",
    o:['x','y','hx'].concat(mensajesNoEnumerablesDeObject),               d:"mensajesQueSabeResponder incluye las no enumerables"},
  {i:aB+";a.mensajesQueSabeResponder()", o:['x','y','z'],                 d:"mensajesQueSabeResponder no incluye las del prototipo (1)"},
  {i:aBConNoEnum+";a.mensajesQueSabeResponder()", o:['x','y','z'],        d:"mensajesQueSabeResponder no incluye las del prototipo (2)"},
  {i:aBConNoEnum+";a.mensajesQueSabeResponder(true)",
    o:['x','y','z','hx','hz'].concat(mensajesNoEnumerablesDeObject),      d:"mensajesQueSabeResponder no incluye las del prototipo (3)"},
]));