Mila.Modulo({usa:['../lista','../test']});

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:"let a=[1,2,3,4,5];a.esVacia()", o:false,                            d:"esVacia devuelve falso con una lista no vacía"},
  {i:"let a=[];a.esVacia()", o:true,                                      d:"esVacia devuelve verdadero con una lista vacía"},
  {i:"let a=[1,2,3,4,5];a.primero()", o:1,                                d:"primero devuelve el primer elemento"},
  {i:"let a=[1,2,3,4,5];a.primero();a", o:[1,2,3,4,5],                    d:"primero no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.sinElPrimero()", o:[2,3,4,5],                   d:"sinElPrimero devuelve la lista sin el primer elemento"},
  {i:"let a=[1,2,3,4,5];a.sinElPrimero();a", o:[1,2,3,4,5],               d:"sinElPrimero no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.SacarPrimero();a", o:[2,3,4,5],                 d:"SacarPrimero quita el primer elemento"},
  {i:"let a=[1,2,3,4,5];a.ultimo()", o:5,                                 d:"ultimo devuelve el último elemento"},
  {i:"let a=[1,2,3,4,5];a.ultimo();a", o:[1,2,3,4,5],                     d:"ultimo no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.sinElUltimo()", o:[1,2,3,4],                    d:"sinElUltimo devuelve la lista sin el último elemento"},
  {i:"let a=[1,2,3,4,5];a.sinElUltimo();a", o:[1,2,3,4,5],                d:"sinElUltimo no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.SacarUltimo();a", o:[1,2,3,4],                  d:"SacarUltimo quita el último elemento"},
  {i:"let a=[1,2,3,4,5];a.sinLosPrimeros_(3)", o:[4,5],                   d:"sinLosPrimeros_ devuelve la lista sin sin los primeros elementos"},
  {i:"let a=[1,2,3,4,5];a.sinLosPrimeros_(3);a", o:[1,2,3,4,5],           d:"sinLosPrimeros_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.sinLosUltimos_(3)", o:[1,2],                    d:"sinLosUltimos_ devuelve la lista sin los últimos elementos"},
  {i:"let a=[1,2,3,4,5];a.sinLosUltimos_(3);a", o:[1,2,3,4,5],            d:"sinLosUltimos_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.SacarLosPrimeros_(3);a", o:[4,5],               d:"SacarLosPrimeros_ quita los primeros elementos"},
  {i:"let a=[1,2,3,4,5];a.SacarLosUltimos_(3);a", o:[1,2],                d:"SacarLosUltimos_ quita los últimos elementos"},
  {i:"let a=[1,2,3,4,5];a.esSingular()", o:false,                         d:"esSingular devuelve falso con una lista con más de un elemento"},
  {i:"let a=[];a.esSingular()", o:false,                                  d:"esSingular devuelve falso con una lista vacía"},
  {i:"let a=[2];a.esSingular()", o:true,                                  d:"esSingular devuelve verdadero con una lista singular"},
  {i:"let a=[];a.contieneA_(2)", o:false,                                 d:"contieneA_ devuelve falso con una lista vacía"},
  {i:"let a=[2];a.contieneA_(2)", o:true,                                 d:"contieneA_ devuelve verdadero con una lista que tiene una vez al elemento buscado"},
  {i:"let a=[2];a.contieneA_(3)", o:false,                                d:"contieneA_ devuelve falso con una lista no vacía pero que no contiene al elemento buscado"},
  {i:"let a=[2,2,2];a.contieneA_(2)", o:true,                             d:"contieneA_ devuelve verdadero sin importar cuántas veces aparezca el elemento buscado"},
  {i:"let a=[2];a.posicionDe_(2)", o:1,                                   d:"posicionDe_ devuelve la primera aparición del elemento buscado en una lista que sólo tiene ese elemento"},
  {i:"let a=[1,2,3];a.posicionDe_(2)", o:2,                               d:"posicionDe_ devuelve la primera aparición del elemento buscado en una lista que tiene además otros elementos"},
  {i:"let a=[2,2,2];a.posicionDe_(2)", o:1,                               d:"posicionDe_ devuelve la primera aparición del elemento buscado en una lista en la que aparece más de una vez"},
  {i:"let a=[2,2,2];a.posicionDe_(2);a", o:[2,2,2],                       d:"posicionDe_ no modifica la lista"},
  {i:"let a=[1,2,3];a.elementoEnPosicion_(2)", o:2,                       d:"elementoEnPosicion_ devuelve el elemento en la posición pedida"},
  {i:"let a=[1,2,3];a.elementoEnPosicion_(2);a", o:[1,2,3],               d:"elementoEnPosicion_ no modifica la lista"},
  {i:"let a=[4,5,6];a.sinElElementoEnPosicion_(2)", o:[4,6],              d:"sinElElementoEnPosicion_ devuelve la lista sin el elemento en la posición pedida"},
  {i:"let a=[4,5,6];a.sinElElementoEnPosicion_(2);a", o:[4,5,6],          d:"sinElElementoEnPosicion_ no modifica la lista"},
  {i:"let a=[4,5,6];a.SacarElementoEnPosicion_(2);a", o:[4,6],            d:"SacarElementoEnPosicion_ quita el elemento en la posición pedida"},
  {i:"let a=[2,3,3];a.cantidadDeAparicionesDe_(1)", o:0,                  d:"cantidadDeAparicionesDe_ devuelve 0 si el elemento buscado no se encuentra"},
  {i:"let a=[2,3,3];a.cantidadDeAparicionesDe_(2)", o:1,                  d:"cantidadDeAparicionesDe_ devuelve 1 si hay una única aparición"},
  {i:"let a=[2,3,3];a.cantidadDeAparicionesDe_(3)", o:2,                  d:"cantidadDeAparicionesDe_ considera todas las apariciones"},
  {i:"let a=[2,3,3];a.cantidadDeAparicionesDe_(3);a", o:[2,3,3],          d:"cantidadDeAparicionesDe_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.longitud()", o:5,                               d:"longitud devuelve la cantidad de elementos"},
  {i:"let a=[1,2,3,4,5];a.longitud();a", o:[1,2,3,4,5],                   d:"longitud no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.cons(6)", o:[6,1,2,3,4,5],                      d:"cons devuelve la lista con un elemento agregado al principio"},
  {i:"let a=[1,2,3,4,5];a.cons(6);a", o:[1,2,3,4,5],                      d:"cons no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.snoc(6)", o:[1,2,3,4,5,6],                      d:"snoc devuelve la lista con un elemento agregado al final"},
  {i:"let a=[1,2,3,4,5];a.snoc(6);a", o:[1,2,3,4,5],                      d:"snoc no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.Agregar_AlPrincipio(6);a", o:[6,1,2,3,4,5],     d:"Agregar_AlPrincipio agrega el elemento al principio de la lista"},
  {i:"let a=[1,2,3,4,5];a.Agregar_AlFinal(6);a", o:[1,2,3,4,5,6],         d:"Agregar_AlFinal agrega el elemento al final de la lista"},
  {i:"let a=[1,2,3];a.concatenadaCon_([4,5,6])", o:[1,2,3,4,5,6],         d:"concatenadaCon_ devuelve la lista concatenada con otra lista"},
  {i:"let a=[1,2,3];a.concatenadaCon_([4,5,6]);a", o:[1,2,3],             d:"concatenadaCon_ no modifica la lista"},
  {i:"let a=[1,2,3];a.ConcatenarCon_([4,5,6]);a", o:[1,2,3,4,5,6],        d:"ConcatenarCon_ concatena la segunda lista a la primera lista"},
  {i:"let a=[1,2,3];let b=[4,5,6];a.ConcatenarCon_(b);b", o:[4,5,6],          d:"ConcatenarCon_ no modifica la segunda lista"},
  // mismosElementosQue_
  {i:"let a=[1,2,3];a.sinLaPrimeraAparicionDe_(2)", o:[1,3],              d:"sinLaPrimeraAparicionDe_ devuelve la lista sin la primera aparición del elemento"},
  {i:"let a=[1,2,1];a.sinLaPrimeraAparicionDe_(1)", o:[2,1],              d:"sinLaPrimeraAparicionDe_ no quita otras apariciones del elemento"},
  {i:"let a=[1,2,3];a.sinLaPrimeraAparicionDe_(4)", o:[1,2,3],            d:"sinLaPrimeraAparicionDe_ devuelve la misma lista si el elemento no aparece"},
  {i:"let a=[1,2,3];a.sinLaPrimeraAparicionDe_(2);a", o:[1,2,3],          d:"sinLaPrimeraAparicionDe_ no modifica la lista"},
  {i:"let a=[1,2,3];a.SacarPrimeraAparicionDe_(2);a", o:[1,3],            d:"SacarPrimeraAparicionDe_ quita la primera aparición del elemento"},
  {i:"let a=[1,2,1];a.SacarPrimeraAparicionDe_(1);a", o:[2,1],            d:"SacarPrimeraAparicionDe_ no quita otras apariciones del elemento"},
  {i:"let a=[1,2,3,4,5];a.subListaEntre_Y_(2,4)", o:[2,3,4],              d:"subListaEntre_Y_ devuelve la lista recortada entre los límites pedidos"},
  {i:"let a=[1,2,3,4,5];a.subListaEntre_Y_(2,4);a", o:[1,2,3,4,5],        d:"subListaEntre_Y_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.elementosAntesDe_(3)", o:[1,2],                 d:"elementosAntesDe_ devuelve los elementos de la lista que están antes del pedido"},
  {i:"let a=[1,2,3,2,5];a.elementosAntesDe_(2)", o:[1],                   d:"elementosAntesDe_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.elementosAntesDe_(3);a", o:[1,2,3,4,5],         d:"elementosAntesDe_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.elementosDespuesDe_(3)", o:[4,5],               d:"elementosDespuesDe_ devuelve los elementos de la lista que están después del pedido"},
  {i:"let a=[1,2,3,2,5];a.elementosDespuesDe_(2)", o:[3,2,5],             d:"elementosDespuesDe_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.elementosDespuesDe_(3);a", o:[1,2,3,4,5],       d:"elementosDespuesDe_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.SacarElementosAntesDe_(3);a", o:[3,4,5],        d:"SacarElementosAntesDe_ quita los elementos que aparecen antes del pedido"},
  {i:"let a=[1,2,3,2,5];a.SacarElementosAntesDe_(2);a", o:[2,3,2,5],      d:"SacarElementosAntesDe_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.SacarElementosDespuesDe_(3);a", o:[1,2,3],      d:"SacarElementosDespuesDe_ quita los elementos que aparecen después del pedido"},
  {i:"let a=[1,2,3,2,5];a.SacarElementosDespuesDe_(2);a", o:[1,2],        d:"SacarElementosDespuesDe_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.elementosDesde_(3)", o:[3,4,5],                 d:"elementosDesde_ devuelve los elementos de la lista desde el pedido hasta el final"},
  {i:"let a=[1,2,3,2,5];a.elementosDesde_(2)", o:[2,3,2,5],               d:"elementosDesde_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.elementosDesde_(3);a", o:[1,2,3,4,5],           d:"elementosDesde_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.elementosHasta_(3)", o:[1,2,3],                 d:"elementosHasta_ devuelve los elementos de la lista desde el principio hasta el pedido"},
  {i:"let a=[1,2,3,2,5];a.elementosHasta_(2)", o:[1,2],                   d:"elementosHasta_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.elementosHasta_(3);a", o:[1,2,3,4,5],           d:"elementosHasta_ no modifica la lista"},
  {i:"let a=[1,2,3,4,5];a.SacarElementosDesde_(3);a", o:[1,2],            d:"SacarElementosDesde_ quita los elementos desde el pedido"},
  {i:"let a=[1,2,3,2,5];a.SacarElementosDesde_(2);a", o:[1],              d:"SacarElementosDesde_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=[1,2,3,4,5];a.SacarElementosHasta_(3);a", o:[4,5],            d:"SacarElementosHasta_ quita los elementos hasta el pedido"},
  {i:"let a=[1,2,3,2,5];a.SacarElementosHasta_(2);a", o:[3,2,5],          d:"SacarElementosHasta_ toma en cuenta únicamente la primera aparición"},
  {i:"let a=['2+2','!true'];a.transformados(eval)", o:[4,false],          d:"transformados devuelve la lista tras aplicar la función a cada elemento"},
  {i:"let a=['2+2','!true'];a.transformados(eval);a", o:["2+2","!true"],  d:"transformados no modifica la lista"},
  {i:"let a=[2,NaN,5];a.losQueCumplen(isFinite)", o:[2,5],                d:"losQueCumplen devuelve los elementos de la lista que cumplen"},
  {i:"let a=[2,NaN,5];a.losQueCumplen(isFinite);a", o:[2,NaN,5],          d:"losQueCumplen no modifica la lista"},
  {i:"let a=[2,NaN,5];a.losQueNoCumplen(isFinite)", o:[NaN],              d:"losQueNoCumplen devuelve los elementos de la lista que no cumplen"},
  {i:"let a=[2,NaN,5];a.losQueNoCumplen(isFinite);a", o:[2,NaN,5],        d:"losQueNoCumplen no modifica la lista"},
  {i:"let a=['2+2','!true'];a.Transformar(eval);a", o:[4,false],          d:"Transformar le aplica la función a cada elemento"},
  {i:"let a=[2,NaN,5];a.SacarLosQueCumplen(isFinite);a", o:[NaN],         d:"SacarLosQueCumplen saca los elementos que cumplen"},
  {i:"let a=[2,NaN,5];a.SacarLosQueNoCumplen(isFinite);a", o:[2,5],       d:"SacarLosQueNoCumplen saca los elementos que no cumplen"},
  {i:"let a=[NaN,NaN,NaN];a.algunoCumple_(isFinite)", o:false,            d:"algunoCumple_ devuelve falso si ninguno cumple"},
  {i:"let a=[NaN,2,NaN];a.algunoCumple_(isFinite)", o:true,               d:"algunoCumple_ devuelve verdadero si exactamente uno cumple"},
  {i:"let a=[2,NaN,5];a.algunoCumple_(isFinite)", o:true,                 d:"algunoCumple_ devuelve verdadero si más de uno cumple"},
  {i:"let a=[2,NaN,5];a.algunoCumple_(isFinite);a", o:[2,NaN,5],          d:"algunoCumple_ no modifica la lista"},
  {i:"let a=[2,5];a.algunoNoCumple_(isFinite)", o:false,                  d:"algunoNoCumple_ devuelve falso si todos cumplen"},
  {i:"let a=[2,NaN,5];a.algunoNoCumple_(isFinite)", o:true,               d:"algunoNoCumple_ devuelve verdadero si exactamente uno no cumple"},
  {i:"let a=[NaN,2,NaN];a.algunoNoCumple_(isFinite)", o:true,             d:"algunoNoCumple_ devuelve verdadero si más de uno no cumple"},
  {i:"let a=[2,NaN,5];a.algunoNoCumple_(isFinite);a", o:[2,NaN,5],        d:"algunoNoCumple_ no modifica la lista"},
  {i:"let a=[NaN,NaN,NaN];a.todosCumplen_(isFinite)", o:false,            d:"todosCumplen_ devuelve falso si ninguno cumple"},
  {i:"let a=[2,NaN,5];a.todosCumplen_(isFinite)", o:false,                d:"todosCumplen_ devuelve falso si alguno no cumple"},
  {i:"let a=[2,5];a.todosCumplen_(isFinite)", o:true,                     d:"todosCumplen_ devuelve verdadero si todos cumplen"},
  {i:"let a=[2,NaN,5];a.todosCumplen_(isFinite);a", o:[2,NaN,5],          d:"todosCumplen_ no modifica la lista"},
  {i:"let a=[2,5];a.ningunoCumple_(isFinite)", o:false,                   d:"ningunoCumple_ devuelve falso si todos cumplen"},
  {i:"let a=[2,NaN,5];a.ningunoCumple_(isFinite)", o:false,               d:"ningunoCumple_ devuelve falso si alguno cumple"},
  {i:"let a=[NaN,NaN,NaN];a.ningunoCumple_(isFinite)", o:true,            d:"ningunoCumple_ devuelve verdadero si ninguno cumple"},
  {i:"let a=[2,NaN,5];a.ningunoCumple_(isFinite);a", o:[2,NaN,5],         d:"ningunoCumple_ no modifica la lista"},
  {i:"let a=[2];a.elQueCumple_(isFinite)", o:2,                           d:"elQueCumple_ devuelve el primero que cumple en una lista que sólo tiene uno que cumple"},
  {i:"let a=[NaN,2,NaN];a.elQueCumple_(isFinite)", o:2,                   d:"elQueCumple_ devuelve el primero que cumple en una lista que tiene además otros que no cumplen"},
  {i:"let a=[2,NaN,5];a.elQueCumple_(isFinite)", o:2,                     d:"elQueCumple_ devuelve el primero que cumple en una lista en la que hay otros que cumplen"},
  {i:"let a=[2,NaN,5];a.elQueCumple_(isFinite);a", o:[2,NaN,5],           d:"elQueCumple_ no modifica la lista"},
  {i:"let a=[];a.cantidadQueCumple_(isFinite)", o:0,                      d:"cantidadQueCumple_ devuelve 0 para la lista vacía"},
  {i:"let a=[NaN,NaN,NaN];a.cantidadQueCumple_(isFinite)", o:0,           d:"cantidadQueCumple_ devuelve 0 si ninguno cumple"},
  {i:"let a=[2,NaN,5];a.cantidadQueCumple_(isFinite)", o:2,               d:"cantidadQueCumple_ devuelve la cantidad de elementos que cumplen"},
  {i:"let a=[2,NaN,5];a.cantidadQueCumple_(isFinite);a", o:[2,NaN,5],     d:"cantidadQueCumple_ no modifica la lista"},
  {i:"let a=[6,2,6];a.minimo()", o:2,                                     d:"minimo devuelve el mínimo de la lista"},
  {i:"let a=[6,2,6];a.minimo();a", o:[6,2,6],                             d:"minimo no modifica la lista"},
  {i:"let a=[2,6,2];a.maximo()", o:6,                                     d:"maximo devuelve el máximo de la lista"},
  {i:"let a=[2,6,2];a.maximo();a", o:[2,6,2],                             d:"maximo no modifica la lista"},
  {i:"let a=[2,6,2];a.mejorSegun_(maximoEntre_Y_)", o:6,                  d:"mejorSegun_ devuelve el máximo de la lista"},
  {i:"let a=[2,6,2];a.mejorSegun_(maximoEntre_Y_);a", o:[2,6,2],          d:"mejorSegun_ no modifica la lista"}
]));
