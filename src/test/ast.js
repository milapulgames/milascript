Mila.Modulo({usa:['../ast','../test']});

const hoja = n => `Mila.AST.nuevoNodo({id:'${n}'})`;
const nodoTrivial = `${hoja('r')};`;
const nodo_ConHijos_ = (n, h) => `Mila.AST.nuevoNodo({id:'${n}',hijos:${h}})`;
const nodoBinario = `${nodo_ConHijos_('r',`{i:${hoja('i')},d:${hoja('d')}}`)};`;
const fold = (nodo, mapa) => `${nodo}.fold(${mapa})`;
const nodo__ConHijos_ = (n, t, h) => `Mila.AST.nuevoNodo({id:'${n}',tipoNodo:"${t}", hijos:${h}})`;
const token = (n, s) => `Mila.AST.nuevoNodo({id:'${n}',tipoNodo:"Token",campos:{valor:'${s}'}})`;
const asignacion = (v,e) => `${nodo__ConHijos_('a','Asignacion',`{variable:${token('var',v)},valor:${token('val',e)}}`)};`;
const mapaJs = '{Token:(nodo,rec) => nodo.valor(),Asignacion:(nodo,rec) => `${rec.variable}=${rec.valor};`}';
const aJs = nodo => fold(nodo,mapaJs);

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:`let a=${nodoTrivial}a.aTextoCompleto()`, o:"r",                       d:"aTextoCompleto con un nodo trivial"},
  {i:`let a=${nodoBinario}a.aTextoCompleto()`, o:"r\n  i:i\n  d:d",         d:"aTextoCompleto con un nodo binario"},
  {i:`let a=${asignacion('x',2)}a.aTextoCompleto()`,
    o:"a\n  variable:var\n  valor:val",                                     d:"aTextoCompleto con una asignación"},
    {i:`let a=${asignacion('x',2)}${aJs('a')}`,
      o:"x=2;",                                                             d:"generador Js para asignación"}
]));