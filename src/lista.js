Mila.Modulo({
  define:"Mila.Lista",
  necesita:["documentacion","js"],
  usa:"tipo"
});

Mila.Lista._Definir_EnPrototipo_ = function(nombre, prototipo, posicionDeThis=0) {
  // Define en un prototipo una función de instancia a partir de otra función definida en este módulo.
    // nombre es una cadena de texto correspondiente al nombre de la función a definir (la misma que la que ya está definida).
    // prototipo es el objeto en cuyo prototipo se definirá la función.
    // posicionDeThis es un entero correspondiente a la posición del argumento que corresponde a la instancia this en la invocación a la función del módulo (0 si se omite).
  // PRE: Hay una función con el nombre dado en este módulo (Mila.Lista).
  Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
    prototipo,
    nombre,
    cantidadDeParametros: Mila.Lista[nombre].length-1,
    posicionDeThis,
    funcionAInvocar: `Mila.Lista.${nombre}`
  });
};

Mila.Lista.esVacia = function(lista) {
  // Indica si la lista dada está vacía.
    // lista es una lista de elementos, la cual se indica si está vacía.
  return lista.length == 0;
};
Mila.Lista._Definir_EnPrototipo_('esVacia', Array);

Mila.Lista.primero = function(lista) {
  // Describe el primer elemento de la lista dada.
    // lista es una lista de elementos, aquella para la cual se describe su primer elemento.
  // PRE: La lista dada tiene al menos un elemento.
  return lista[0];
};
Mila.Lista._Definir_EnPrototipo_('primero', Array);

Mila.Lista.sinElPrimero = function(lista) {
  // Describe la lista dada sin su primer elemento.
    // lista es una lista de elementos, aquella de la cual se quita el primer elemento.
  // PRE: La lista dada tiene al menos un elemento.
  return lista.slice(1);
};
Mila.Lista._Definir_EnPrototipo_('sinElPrimero', Array);

Mila.Lista.SacarPrimero = function(lista) {
  // Saca el primer elemento de la lista dada.
    // lista es una lista de elementos, aquella de la cual se quita el primer elemento.
  // PRE: La lista dada tiene al menos un elemento.
  lista.shift();
};
Mila.Lista._Definir_EnPrototipo_('SacarPrimero', Array);

Mila.Lista.ultimo = function(lista) {
  // Describe el último elemento de la lista dada.
    // lista es una lista de elementos, aquella para la cual se describe su último elemento.
  // PRE: La lista dada tiene al menos un elemento.
  return lista[lista.length-1];
};
Mila.Lista._Definir_EnPrototipo_('ultimo', Array);

Mila.Lista.sinElUltimo = function(lista) {
  // Describe la lista dada sin su último elemento.
    // lista es una lista de elementos, aquella de la cual se quita el último elemento.
  // PRE: La lista dada tiene al menos un elemento.
  return lista.slice(0,lista.length-1);
};
Mila.Lista._Definir_EnPrototipo_('sinElUltimo', Array);

Mila.Lista.SacarUltimo = function(lista) {
  // Saca el último elemento de la lista dada.
    // lista es una lista de elementos, aquella de la cual se quita el último elemento.
  // PRE: La lista dada tiene al menos un elemento.
  lista.pop();
};
Mila.Lista._Definir_EnPrototipo_('SacarUltimo', Array);

Mila.Lista.sinLosPrimeros_ = function(lista, cantidad) {
  // Describe la lista dada sin sus primeros *cantidad* elementos.
    // lista es una lista de elementos, aquella de la cual se quitan sus primeros elementos.
    // cantidad es un entero correspondiente a la cantidad de elementos que se quitan.
  // PRE: *cantidad* es mayor o igual a 0.
  // PRE: La lista dada tiene al menos *cantidad* elementos.
  return Mila.Lista.subListaEntre_Y_(lista, cantidad+1, Mila.Lista.longitud(lista));
};
Mila.Lista._Definir_EnPrototipo_('sinLosPrimeros_', Array);

Mila.Lista.sinLosUltimos_ = function(lista, cantidad) {
  // Describe la lista dada sin sus últimos *cantidad* elementos.
    // lista es una lista de elementos, aquella de la cual se quitan sus últimos elementos.
    // cantidad es un entero correspondiente a la cantidad de elementos que se quitan.
  // PRE: *cantidad* es mayor o igual a 0.
  // PRE: La lista dada tiene al menos *cantidad* elementos.
  return Mila.Lista.subListaEntre_Y_(lista, 1, Mila.Lista.longitud(lista)-cantidad);
};
Mila.Lista._Definir_EnPrototipo_('sinLosUltimos_', Array);

Mila.Lista.SacarLosPrimeros_ = function(lista, cantidad) {
  // Saca los primeros *cantidad* elementos de la lista dada.
    // lista es una lista de elementos, aquella de la cual se quitan sus primeros elementos.
    // cantidad es un entero correspondiente a la cantidad de elementos que se quitan.
  // PRE: *cantidad* es mayor o igual a 0.
  // PRE: La lista dada tiene al menos *cantidad* elementos.
  for (let i=0; i<cantidad; i++) {
    Mila.Lista.SacarPrimero(lista);
  }
};
Mila.Lista._Definir_EnPrototipo_('SacarLosPrimeros_', Array);

Mila.Lista.SacarLosUltimos_ = function(lista, cantidad) {
  // Saca los últimos *cantidad* elementos de la lista dada.
    // lista es una lista de elementos, aquella de la cual se quitan sus últimos elementos.
    // cantidad es un entero correspondiente a la cantidad de elementos que se quitan.
  // PRE: *cantidad* es mayor o igual a 0.
  // PRE: La lista dada tiene al menos *cantidad* elementos.
  for (let i=0; i<cantidad; i++) {
    Mila.Lista.SacarUltimo(lista);
  }
};
Mila.Lista._Definir_EnPrototipo_('SacarLosUltimos_', Array);

Mila.Lista.esSingular = function(lista) {
  // Indica si la lista dada es singular (tiene exactamente un elemento).
    // lista es una lista de elementos, la cual se indica si es singular.
  return lista.length == 1;
};
Mila.Lista._Definir_EnPrototipo_('esSingular', Array);

Mila.Lista.contieneA_ = function(lista, elemento) {
  // Indica si la lista dada contiene al menos una vez al elemento dado.
    // lista es una lista de elementos, la cual se indica si contiene al elemento dado.
    // elemento puede ser cualquier dato.
  return lista.includes(elemento);
};
Mila.Lista._Definir_EnPrototipo_('contieneA_', Array);

Mila.Lista.posicionDe_ = function(lista, elemento) {
  // Describe la posición de la primera aparición del elemento dado en la lista dada.
    // lista es una lista de elementos, aquella para la cual se describe la posición en la que se encuentra el elemento dado.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  return lista.indexOf(elemento) + 1;
};
Mila.Lista._Definir_EnPrototipo_('posicionDe_', Array);

Mila.Lista.elementoEnPosicion_ = function(lista, posicion) {
  // Describe el elemento en la posicion dada de la lista dada.
    // lista es una lista de elementos, aquella para la cual se describe a su elemento en la posición dada.
    // posición es un entero, correspondiente a la posición solicitada.
  // PRE: *posicion* es mayor a 0.
  // PRE: La lista dada contiene al menos *posicion* elementos.
  return lista[posicion-1];
};
Mila.Lista._Definir_EnPrototipo_('elementoEnPosicion_', Array);

Mila.Lista.sinElElementoEnPosicion_ = function(lista, posicion) {
  // Describe la lista dada sin el elemento en la posicion dada.
    // lista es una lista de elementos, aquella de la cual se quita un elemento.
    // posición es un entero, correspondiente a la posición del elemento a quitar.
  // PRE: *posicion* es mayor a 0.
  // PRE: La lista dada contiene al menos *posicion* elementos.
  return lista.toSpliced(posicion-1,1);
};
Mila.Lista._Definir_EnPrototipo_('sinElElementoEnPosicion_', Array);

Mila.Lista.SacarElementoEnPosicion_ = function(lista, posicion) {
  // Saca el elemento en la posicion dada de la lista dada.
    // lista es una lista de elementos, aquella de la cual se quita un elemento.
    // posición es un entero, correspondiente a la posición del elemento a quitar.
  // PRE: *posicion* es mayor a 0.
  // PRE: La lista dada contiene al menos *posicion* elementos.
  lista.splice(posicion-1,1);
};
Mila.Lista._Definir_EnPrototipo_('SacarElementoEnPosicion_', Array);

Mila.Lista.cantidadDeAparicionesDe_ = function(lista, elemento) {
  // Describe la cantidad de apariciones del elemento dado en la lista dada.
    // lista es una lista de elementos, aquella para la cual se descibe la cantidad de veces que contiene al elemento dado.
    // elemento puede ser cualquier dato.
  return Mila.Lista.fold(lista, function(x, rec) {return (x==elemento ? 1 : 0) + rec}, 0);
};
Mila.Lista._Definir_EnPrototipo_('cantidadDeAparicionesDe_', Array);

Mila.Lista.longitud = function(lista) {
  // Describe la cantidad de elementos en la lista dada.
    // lista es una lista de elementos, aquella para la cual se describe su longitud.
  return lista.length;
};
Mila.Lista._Definir_EnPrototipo_('longitud', Array);

Mila.Lista.cons = function(lista, elemento) {
  // Describe la lista dada con el elemento dado a la cabeza.
    // lista es una lista de elementos, aquella a la cual se agrega el elemento.
    // elemento puede ser cualquier dato.
  return [elemento].concat(lista);
};
Mila.Lista._Definir_EnPrototipo_('cons', Array);

Mila.Lista.snoc = function(lista, elemento) {
  // Describe la lista dada con el elemento dado al final.
    // lista es una lista de elementos, aquella a la cual se agrega el elemento.
    // elemento puede ser cualquier dato.
  return lista.concat([elemento]);
};
Mila.Lista._Definir_EnPrototipo_('snoc', Array);

Mila.Lista.Agregar_AlPrincipio = function(lista, elemento) {
  // Agrega el elemento dado al principio de la lista dada.
    // lista es una lista de elementos, aquella a la cual se agrega el elemento.
    // elemento puede ser cualquier dato.
  lista.unshift(elemento);
};
Mila.Lista._Definir_EnPrototipo_('Agregar_AlPrincipio', Array);

Mila.Lista.Agregar_AlFinal = function(lista, elemento) {
  // Agrega el elemento dado al final de la lista dada.
    // lista es una lista de elementos, aquella a la cual se agrega el elemento.
    // elemento puede ser cualquier dato.
  lista.push(elemento);
};
Mila.Lista._Definir_EnPrototipo_('Agregar_AlFinal', Array);

Mila.Lista.Insertar_EnPosicion_ = function(lista, elemento, posicion) {
  // Inserta el elemento dado en la posición dada de la lista dada.
    // lista es una lista de elementos, aquella en la cual se inserta el elemento.
    // elemento puede ser cualquier dato.
    // posición es un entero, correspondiente a la posición en la que insertar el elemento.
  // PRE: *posicion* es mayor o igual a 0.
  // PRE: La lista dada contiene al menos *posicion*-1 elementos.
  lista.splice(posicion, 0, elemento);
};
Mila.Lista._Definir_EnPrototipo_('Insertar_EnPosicion_', Array);

Mila.Lista.concatenadaCon_ = function(lista1, lista2) {
  // Describe la concatenación entre las listas dadas.
    // Tanto lista1 como lista2 son listas de elementos.
  return lista1.concat(lista2);
};
Mila.Lista._Definir_EnPrototipo_('concatenadaCon_', Array);

Mila.Lista.ConcatenarCon_ = function(lista1, lista2) {
  // Concatena los elementos de la segunda lista dada al final de la primera lista dada.
    // Tanto lista1 como lista2 son listas de elementos.
  lista2.forEach(function(elemento) {
    Mila.Lista.Agregar_AlFinal(lista1, elemento);
  });
};
Mila.Lista._Definir_EnPrototipo_('ConcatenarCon_', Array);

Mila.Lista.mismosElementosQue_ = function(lista1, lista2) {
  // Indica si las listas dadas tienen exactamente los mismos elementos y en las mismas cantidades. Es decir, si una es una permutación de la otra.
    // Tanto lista1 como lista2 son listas de elementos.
  return (
    Mila.Lista.todosCumplen_(lista1, (elemento) =>
      Mila.Lista.cantidadDeAparicionesDe_(lista1, elemento) == Mila.Lista.cantidadDeAparicionesDe_(lista2, elemento)
    ) &&
    Mila.Lista.todosCumplen_(lista2, (elemento) =>
      Mila.Lista.cantidadDeAparicionesDe_(lista2, elemento) == Mila.Lista.cantidadDeAparicionesDe_(lista1, elemento)
    )
  );
};
Mila.Lista._Definir_EnPrototipo_('mismosElementosQue_', Array);

Mila.Lista.sinLaPrimeraAparicionDe_ = function(lista, elemento) {
  // Describe la lista dada sin la primera aparición del elemento dado.
    // lista es una lista de elementos, aquella de la cual se quita un elemento, en caso de que este pertenezca a ella.
    // elemento puede ser cualquier dato.
  return Mila.Lista.contieneA_(lista, elemento)
    ? Mila.Lista.sinElElementoEnPosicion_(lista, Mila.Lista.posicionDe_(lista, elemento))
    : lista
};
Mila.Lista._Definir_EnPrototipo_('sinLaPrimeraAparicionDe_', Array);

Mila.Lista.SacarPrimeraAparicionDe_ = function(lista, elemento) {
  // Saca la primera aparición del elemento dado de la lista dada.
    // lista es una lista de elementos, aquella de la cual se quita un elemento.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  Mila.Lista.SacarElementoEnPosicion_(lista, Mila.Lista.posicionDe_(lista, elemento))
};
Mila.Lista._Definir_EnPrototipo_('SacarPrimeraAparicionDe_', Array);

Mila.Lista.subListaEntre_Y_ = function(lista, inicio, fin) {
  // Describe los elementos de la lista dada que están entre las posiciones *inicio* y *fin*, inclusive.
    // lista es una lista de elementos, aquella de la cual se obtiene una sublista.
    // inicio es un entero correspondiente a la posición del primer elemento de la sublista.
    // fin es un entero correspondiente a la posición del último elemento de la sublista.
  // PRE: *inicio* es mayor a 0.
  // PRE: *inicio* es menor o igual a *fin* - 1.
  // PRE: La lista dada contiene al menos *fin* elementos.
  return lista.slice(inicio-1, fin);
};
Mila.Lista._Definir_EnPrototipo_('subListaEntre_Y_', Array);

Mila.Lista.elementosAntesDe_ = function(lista, elemento) {
  // Describe los elementos de la lista dada que aparecen antes de la primera aparición del elemento dado.
    // lista es una lista de elementos, aquella de la cual se obtienen sus primeros elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  return Mila.Lista.subListaEntre_Y_(lista, 1, Mila.Lista.posicionDe_(lista, elemento)-1);
};
Mila.Lista._Definir_EnPrototipo_('elementosAntesDe_', Array);

Mila.Lista.elementosDespuesDe_ = function(lista, elemento) {
  // Describe los elementos de la lista dada que aparecen después de la primera aparición del elemento dado.
    // lista es una lista de elementos, aquella de la cual se obtienen sus primeros elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  return Mila.Lista.subListaEntre_Y_(lista, Mila.Lista.posicionDe_(lista, elemento)+1, Mila.Lista.longitud(lista));
};
Mila.Lista._Definir_EnPrototipo_('elementosDespuesDe_', Array);

Mila.Lista.SacarElementosAntesDe_ = function(lista, elemento) {
  // Saca de la lista dada los elementos que aparecen antes de la primera aparición del elemento dado.
    // lista es una lista de elementos, aquella de la cual se quitan sus primeros elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  while (Mila.Tipo.esDistintoA_(Mila.Lista.primero(lista), elemento)) {
    Mila.Lista.SacarPrimero(lista);
  };
};
Mila.Lista._Definir_EnPrototipo_('SacarElementosAntesDe_', Array);

Mila.Lista.SacarElementosDespuesDe_ = function(lista, elemento) {
  // Saca de la lista dada los elementos que aparecen después de la primera aparición del elemento dado.
    // lista es una lista de elementos, aquella de la cual se quitan sus últimos elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  const cantidadASacar = Mila.Lista.longitud(lista) - Mila.Lista.posicionDe_(lista, elemento);
  for (let i=0; i < cantidadASacar; i++) {
    Mila.Lista.SacarUltimo(lista);
  }
};
Mila.Lista._Definir_EnPrototipo_('SacarElementosDespuesDe_', Array);

Mila.Lista.elementosDesde_ = function(lista, elemento) {
  // Describe los elementos de la lista dada desde la primera aparición del elemento dado (incluyéndolo).
    // lista es una lista de elementos, aquella de la cual se obtienen sus últimos elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  return Mila.Lista.subListaEntre_Y_(lista, Mila.Lista.posicionDe_(lista, elemento), Mila.Lista.longitud(lista));
};
Mila.Lista._Definir_EnPrototipo_('elementosDesde_', Array);

Mila.Lista.elementosHasta_ = function(lista, elemento) {
  // Describe los elementos de la lista dada hasta la primera aparición del elemento dado (incluyéndolo).
    // lista es una lista de elementos, aquella de la cual se obtienen sus primeros elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  return Mila.Lista.subListaEntre_Y_(lista, 1, Mila.Lista.posicionDe_(lista, elemento));
};
Mila.Lista._Definir_EnPrototipo_('elementosHasta_', Array);

Mila.Lista.SacarElementosDesde_ = function(lista, elemento) {
  // Saca de la lista dada los elementos desde la primera aparición del elemento dado (incluyéndolo).
    // lista es una lista de elementos, aquella de la cual se quitan sus últimos elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  Mila.Lista.SacarElementosDespuesDe_(lista, elemento);
  Mila.Lista.SacarUltimo(lista);
};
Mila.Lista._Definir_EnPrototipo_('SacarElementosDesde_', Array);

Mila.Lista.SacarElementosHasta_ = function(lista, elemento) {
  // Saca de la lista dada los elementos hasta la primera aparición del elemento dado (incluyéndolo).
    // lista es una lista de elementos, aquella de la cual se quitan sus primeros elementos.
    // elemento puede ser cualquier dato.
  // PRE: La lista dada contiene al menos una vez al elemento dado.
  Mila.Lista.SacarElementosAntesDe_(lista, elemento);
  Mila.Lista.SacarPrimero(lista);
};
Mila.Lista._Definir_EnPrototipo_('SacarElementosHasta_', Array);

Mila.Lista.transformados = function(lista, funcion) {
  // Describe la lista dada tras aplicarle la función dada a cada uno de sus elementos.
    // lista es una lista de elementos, a cuyos elementos se les aplica la función dada.
    // funcion es una función que toma un elemento y devuelve otro.
  return Mila.Lista.fold(lista, function(x, rec) { return rec.snoc(funcion(x))}, []);
};
Mila.Lista._Definir_EnPrototipo_('transformados', Array);

Mila.Lista.losQueCumplen = function(lista, condicion) {
  // Describe los elementos de la lista dada que cumplen la condición dada.
    // lista es una lista de elementos, aquella de la cual se obtienen los elementos que cumplen la condición.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return lista.fold(function(x, rec) { return condicion(x) ? rec.snoc(x) : rec}, []);
};
Mila.Lista._Definir_EnPrototipo_('losQueCumplen', Array);

Mila.Lista.losQueNoCumplen = function(lista, condicion) {
  // Describe los elementos de la lista dada que no cumplen la condición dada.
    // lista es una lista de elementos, aquella de la cual se obtienen los elementos que no cumplen la condición.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return lista.fold(function(x, rec) { return condicion(x) ? rec : rec.snoc(x)}, []);
};
Mila.Lista._Definir_EnPrototipo_('losQueNoCumplen', Array);

Mila.Lista.Transformar = function(lista, funcion) {
  // Aplica la función dada a cada elemento de la lista dada.
    // lista es una lista de elementos, a cuyos elementos se les aplica la función dada.
    // funcion es una función que toma un elemento y devuelve otro.
  for (let i=0; i<Mila.Lista.longitud(lista); i++) {
    let elementoActual = Mila.Lista.primero(lista);
    Mila.Lista.SacarPrimero(lista);
    Mila.Lista.Agregar_AlFinal(lista, funcion(elementoActual));
  };
};
Mila.Lista._Definir_EnPrototipo_('Transformar', Array);

Mila.Lista.SacarLosQueCumplen = function(lista, condicion) {
  // Saca los elementos de la lista dada que cumplen la condición dada.
    // lista es una lista de elementos, aquella de la cual se quitan los elementos que cumplen la condición.
    // condicion es una función que toma un elemento y devuelve un booleano.
  const cantidadDeElementos = Mila.Lista.longitud(lista);
  for (let i=0; i<cantidadDeElementos; i++) {
    let elementoActual = Mila.Lista.primero(lista);
    Mila.Lista.SacarPrimero(lista);
    if (!condicion(elementoActual)) {
      Mila.Lista.Agregar_AlFinal(lista, elementoActual);
    };
  };
};
Mila.Lista._Definir_EnPrototipo_('SacarLosQueCumplen', Array);

Mila.Lista.SacarLosQueNoCumplen = function(lista, condicion) {
  // Saca los elementos de la lista dada que no cumplen la condición dada.
    // lista es una lista de elementos, aquella de la cual se quitan los elementos que no cumplen la condición.
    // condicion es una función que toma un elemento y devuelve un booleano.
  const cantidadDeElementos = Mila.Lista.longitud(lista);
  for (let i=0; i<cantidadDeElementos; i++) {
    let elementoActual = Mila.Lista.primero(lista);
    Mila.Lista.SacarPrimero(lista);
    if (condicion(elementoActual)) {
      Mila.Lista.Agregar_AlFinal(lista, elementoActual);
    };
  };
};
Mila.Lista._Definir_EnPrototipo_('SacarLosQueNoCumplen', Array);

Mila.Lista.algunoCumple_ = function(lista, condicion) {
  // Indica si algún elemento de la lista dada cumple la condición dada.
    // lista es una lista de elementos, la cual se indica si alguno de sus elementos cumple la condición dada.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return Mila.Lista.fold(lista, function(x, rec) { return condicion(x) || rec; }, false);
};
Mila.Lista._Definir_EnPrototipo_('algunoCumple_', Array);

Mila.Lista.algunoNoCumple_ = function(lista, condicion) {
  // Indica si algún elemento de la lista dada no cumple la condición dada.
    // lista es una lista de elementos, la cual se indica si alguno de sus elementos no cumple la condición dada.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return Mila.Lista.fold(lista, function(x, rec) { return !condicion(x) || rec; }, false);
};
Mila.Lista._Definir_EnPrototipo_('algunoNoCumple_', Array);

Mila.Lista.todosCumplen_ = function(lista, condicion) {
  // Indica si todos los elementos de la lista dada cumplen la condición dada.
    // lista es una lista de elementos, la cual se indica si todos sus elementos cumplen la condición dada.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return Mila.Lista.fold(lista, function(x, rec) { return condicion(x) && rec; }, true);
};
Mila.Lista._Definir_EnPrototipo_('todosCumplen_', Array);

Mila.Lista.ningunoCumple_ = function(lista, condicion) {
  // Indica si ningún elemento de la lista dada cumple la condición dada.
    // lista es una lista de elementos, la cual se indica si ninguno de sus elementos cumple la condición dada.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return Mila.Lista.fold(lista, function(x, rec) { return !condicion(x) && rec; }, true);
};
Mila.Lista._Definir_EnPrototipo_('ningunoCumple_', Array);

Mila.Lista.elQueCumple_ = function(lista, condicion) {
  // Describe el primer elemento de la lista dada que cumple la condición dada.
    // lista es una lista de elementos, para la cual se describe su primer elemento que cumple la condición dada.
    // condicion es una función que toma un elemento y devuelve un booleano.
  // PRE: Hay algún elemento en la lista dada que cumple la condición dada.
  return Mila.Lista.fold1(lista, function(x, rec) {
    return condicion(x) ? x : rec
  });
};
Mila.Lista._Definir_EnPrototipo_('elQueCumple_', Array);

Mila.Lista.cantidadQueCumple_ = function(lista, condicion) {
  // Describe la cantidad de elementos de la lista dada que cumplen la condición dada.
    // lista es una lista de elementos, para la cual se describe su cantidad de elementos que cumplen la condición dada.
    // condicion es una función que toma un elemento y devuelve un booleano.
  return Mila.Lista.fold(lista, function(x, rec) { return rec + unoSi_CeroSiNo(condicion(x)); }, 0);
};
Mila.Lista._Definir_EnPrototipo_('cantidadQueCumple_', Array);

Mila.Lista.minimo = function(lista) {
  // Describe el mínimo elemento de la lista dada.
    // lista es una lista de elementos, para la cual se describe su mínimo elemento.
  // PRE: Hay al menos un elemento en la lista dada.
  // PRE: Todos los elementos de la lista dada son del mismo tipo.
  // PRE: El tipo de los elementos de la lista dada define una relación de orden.
  return Mila.Lista.mejorSegun_(lista, minimoEntre_Y_);
};
Mila.Lista._Definir_EnPrototipo_('minimo', Array);

Mila.Lista.maximo = function(lista) {
  // Describe el máximo elemento de la lista dada.
    // lista es una lista de elementos, para la cual se describe su máximo elemento.
  // PRE: Hay al menos un elemento en la lista dada.
  // PRE: Todos los elementos de la lista dada son del mismo tipo.
  // PRE: El tipo de los elementos de la lista dada define una relación de orden.
  return Mila.Lista.mejorSegun_(lista, maximoEntre_Y_);
};
Mila.Lista._Definir_EnPrototipo_('maximo', Array);

Mila.Lista.mejorSegun_ = function(lista, comparador) {
  // Describe el mejor elemento de la lista dada según el comparador dado.
    // lista es una lista de elementos, para la cual se describe su mejor elemento.
    // comparador es una función que toma dos elementos y devuelve uno de ellos.
  // PRE: Hay al menos un elemento en la lista dada.
  return Mila.Lista.fold1(lista, function(x, rec) { return comparador(x, rec); });
};
Mila.Lista._Definir_EnPrototipo_('mejorSegun_', Array);

Mila.Lista.fold = function(lista, funcion, casoBase) {
  // Describe el resultado de la recursión estructural sobre la lista dada con *casoBase* como caso base y la función dada como caso recursivo.
    // lista es una lista de elementos, para la cual se describe el resultado de la recursión estructural.
    // funcion es una función que toma un elemento y el resultado del llamado recursivo y devuelve un nuevo resultado.
    // casoBase puede ser cualquier dato.
  return lista.reduce(function(rec, x) { return funcion(x, rec); }, casoBase);
};
Mila.Lista._Definir_EnPrototipo_('fold', Array);

Mila.Lista.fold1 = function(lista, funcion) {
  // Describe el resultado de la recursión estructural sobre la lista dada con el último elemento de la misma como caso base y la función dada como caso recursivo.
    // lista es una lista de elementos, para la cual se describe el resultado de la recursión estructural.
    // funcion es una función que toma un elemento y el resultado del llamado recursivo y devuelve un nuevo resultado.
  // PRE: Hay al menos un elemento en la lista dada.
  return Mila.Lista.sinElUltimo(lista).reduce(function(rec, x) { return funcion(x, rec); }, Mila.Lista.ultimo(lista));
};
Mila.Lista._Definir_EnPrototipo_('fold1', Array);