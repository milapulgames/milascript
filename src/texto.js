Mila.Modulo({
  define:"Mila.Texto",
  usa:["base", "lista"],
  necesita:["js","tipo"]
});

Mila.Texto._Definir_EnPrototipo_ = function(nombre, prototipo, posicionDeThis=0) {
  // Define en un prototipo una función de instancia a partir de otra función definida en este módulo.
    // nombre es una cadena de texto correspondiente al nombre de la función a definir (la misma que la que ya está definida).
    // prototipo es el objeto en cuyo prototipo se definirá la función.
    // posicionDeThis es un entero correspondiente a la posición del argumento que corresponde a la instancia this en la invocación a la función del módulo (0 si se omite).
  // PRE: Hay una función con el nombre dado en este módulo (Mila.Texto).
  Mila.JS.DefinirFuncionDeInstanciaAPartirDe_({
    prototipo,
    nombre,
    cantidadDeParametros: Mila.Texto[nombre].length-1,
    posicionDeThis,
    funcionAInvocar: `Mila.Texto.${nombre}`
  });
};

Mila.Texto.longitud = function(texto) {
  Mila.Contrato({
    Proposito: [
      "Describir la longitud del texto dado.",
      Mila.Tipo.Entero
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto]
    ]
  });
  return texto.length;
};
Mila.Texto._Definir_EnPrototipo_('longitud', String);

Mila.Texto.esVacio = function(texto) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el texto dado está vacío.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto]
    ]
  });
  return texto.length == 0;
};
Mila.Texto._Definir_EnPrototipo_('esVacio', String);

Mila.Texto.empiezaCon_ = function(texto, prefijo) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el texto dado empieza con el prefijo dado.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [prefijo, Mila.Tipo.Texto]
    ]
  });
  return texto.startsWith(prefijo);
};
Mila.Texto._Definir_EnPrototipo_('empiezaCon_', String);

// Alias
Mila.Texto.comienzaCon_ = Mila.Texto.empiezaCon_;
Mila.Texto._Definir_EnPrototipo_('comienzaCon_', String);

// Alias
Mila.Texto.iniciaCon_ = Mila.Texto.empiezaCon_;
Mila.Texto._Definir_EnPrototipo_('iniciaCon_', String);

Mila.Texto.terminaCon_ = function(texto, sufijo) {
  Mila.Contrato({
    Proposito: [
      "Indicar si el texto dado termina con el sufijo dado.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [sufijo, Mila.Tipo.Texto]
    ]
  });
  return texto.endsWith(sufijo);
};
Mila.Texto._Definir_EnPrototipo_('terminaCon_', String);

// Alias
Mila.Texto.finalizaCon_ = Mila.Texto.terminaCon_;
Mila.Texto._Definir_EnPrototipo_('finalizaCon_', String);

Mila.Texto.subTextoEntre_Y_ = function(texto, inicio, fin) {
  Mila.Contrato({
    Proposito: [
      "Describe el texto resultante de recortar el texto dado entre las posiciones dadas, ambas inclusive.",
      Mila.Tipo.Texto
    ],
    Precondiciones: [
      "La posición inicial es mayor o igual a 1.", inicio >= 1,
      "La posición final es menor o igual a la longitud del texto.", fin <= Mila.Texto.longitud(texto),
      "La posición final es mayor o igual a la posición inicial.", fin >= inicio
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [inicio, Mila.Tipo.Entero],
      [fin, Mila.Tipo.Entero]
    ]
  });
  return texto.substring(inicio-1,fin);
};
Mila.Texto._Definir_EnPrototipo_('subTextoEntre_Y_', String);

Mila.Texto.subTextoDesde_ = function(texto, inicio) {
  Mila.Contrato({
    Proposito: [
      "Describe los caracteres del texto dado desde la posición dada, inclusive.",
      Mila.Tipo.Texto
    ],
    Precondiciones: [
      "La posición es mayor o igual a 1.", inicio >= 1
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [inicio, Mila.Tipo.Entero]
    ]
  });
  return Mila.Texto.subTextoEntre_Y_(texto, inicio, Mila.Texto.longitud(texto));
};
Mila.Texto._Definir_EnPrototipo_('subTextoDesde_', String);

// Alias
Mila.Texto.subTextoAPartirDe_ = Mila.Texto.subTextoDesde_;
Mila.Texto._Definir_EnPrototipo_('subTextoAPartirDe_', String);

Mila.Texto.subTextoHasta_ = function(texto, fin) {
  Mila.Contrato({
    Proposito: [
      "Describe los caracteres del texto dado hasta la posición dada, inclusive.",
      Mila.Tipo.Texto
    ],
    Precondiciones: [
      "La posición es menor o igual a la longitud del texto.", fin <= Mila.Texto.longitud(texto)
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [fin, Mila.Tipo.Entero]
    ]
  });
  return Mila.Texto.subTextoEntre_Y_(texto, 1, fin);
};
Mila.Texto._Definir_EnPrototipo_('subTextoHasta_', String);

Mila.Texto.sinLosPrimeros_ = function(texto, cantidad) {
  Mila.Contrato({
    Proposito: [
      "Describe el texto resultante de quitarle al texto dado sus primeros *cantidad* caracteres.",
      Mila.Tipo.Texto
    ],
    Precondiciones: [
      "La cantidad es mayor o igual a 0.", cantidad >= 0,
      "La longitud del texto es mayor o igual a la cantidad.", Mila.Texto.longitud(texto) >= cantidad
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [cantidad, Mila.Tipo.Entero]
    ]
  });
  return (Mila.Texto.longitud(texto) == cantidad) ? "" : Mila.Texto.subTextoEntre_Y_(texto, cantidad+1, Mila.Texto.longitud(texto));
};
Mila.Texto._Definir_EnPrototipo_('sinLosPrimeros_', String);

Mila.Texto.sinLosUltimos_ = function(texto, cantidad) {
  Mila.Contrato({
    Proposito: [
      "Describe el texto resultante de quitarle al texto dado sus últimos *cantidad* caracteres.",
      Mila.Tipo.Texto
    ],
    Precondiciones: [
      "La cantidad es mayor o igual a 0.", cantidad >= 0,
      "La longitud del texto es mayor o igual a la cantidad.", Mila.Texto.longitud(texto) >= cantidad
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [cantidad, Mila.Tipo.Entero]
    ]
  });
  return (Mila.Texto.longitud(texto) == cantidad) ? "" : Mila.Texto.subTextoEntre_Y_(texto, 1, Mila.Texto.longitud(texto)-cantidad);
};
Mila.Texto._Definir_EnPrototipo_('sinLosUltimos_', String);

Mila.Texto.contieneA_ = function(texto, subcadena) {
  Mila.Contrato({
    Proposito: [
      "Indice si la subcadena dada aparece en el texto dado.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [subcadena, Mila.Tipo.Texto]
    ]
  });
  return texto.includes(subcadena);
};
Mila.Texto._Definir_EnPrototipo_('contieneA_', String);

Mila.Texto.esSubcadenaDe_ = function(subcadena, texto) {
  Mila.Contrato({
    Proposito: [
      "Indice si la subcadena dada aparece en el texto dado.",
      Mila.Tipo.Booleano
    ],
    Parametros: [
      [subcadena, Mila.Tipo.Texto],
      [texto, Mila.Tipo.Texto]
    ]
  });
  return texto.includes(subcadena);
};
Mila.Texto._Definir_EnPrototipo_('esSubcadenaDe_', String);

Mila.Texto.primeraApariciónDe_ = function(texto, subcadena) {
  Mila.Contrato({
    Proposito: [
      "Describe el índice de la primera aparición de la subcadena dada en el texto dado o Nada si la subcadena dada no aparece en el texto dado.",
      Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Nada])
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [subcadena, Mila.Tipo.Texto]
    ]
  });
  let índice = texto.indexOf(subcadena);
  return índice < 0 ? Mila.Nada : índice + 1;
};
Mila.Texto._Definir_EnPrototipo_('primeraApariciónDe_', String);

Mila.Texto.primeraApariciónDe_Desde_ = function(texto, subcadena, posición) {
  Mila.Contrato({
    Proposito: [
      "Describe el índice de la primera aparición de la subcadena dada en el texto dado, a partir de la posición dada o Nada si la subcadena dada no aparece en el texto dado a partir de la posición dada.",
      Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Nada])
    ],
    Precondiciones: [
      "La posición es mayor o igual a 1.", posición >= 1,
      "La longitud del texto es mayor o igual a la posición.", Mila.Texto.longitud(texto) >= posición
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [subcadena, Mila.Tipo.Texto],
      [posición, Mila.Tipo.Entero]
    ]
  });
  let índice = texto.indexOf(subcadena, posición-1);
  return índice < 0 ? Mila.Nada : índice + 1;
};
Mila.Texto._Definir_EnPrototipo_('primeraApariciónDe_Desde_', String);

Mila.Texto.primeraApariciónDe_NoEscapeadaCon_ = function(texto, subcadena, secuenciaDeEscape) {
  Mila.Contrato({
    Proposito: [
      "Describe el índice de la primera aparición de la subcadena dada en el texto dado que no esté precedida por la secuencia de escape dada o Nada si la subcadena dada no aparece en el texto dado no siendo precedida por la secuencia de escape dada.",
      Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Nada])
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [subcadena, Mila.Tipo.Texto],
      [secuenciaDeEscape, Mila.Tipo.Texto]
    ]
  });
  return Mila.Texto.primeraApariciónDe_Desde_NoEscapeadaCon_(texto, subcadena, 1, secuenciaDeEscape);
};
Mila.Texto._Definir_EnPrototipo_('primeraApariciónDe_NoEscapeadaCon_', String);

Mila.Texto.primeraApariciónDe_Desde_NoEscapeadaCon_ = function(texto, subcadena, posición, secuenciaDeEscape) {
  Mila.Contrato({
    Proposito: [
      "Describe el índice de la primera aparición de la subcadena dada en el texto dado a partir de la posición dada que no esté precedida por la secuencia de escape dada o Nada si la subcadena dada no aparece en el texto dado a partir de la posición dada no siendo precedida por la secuencia de escape dada.",
      Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Nada])
    ],
    Parametros: [
      [texto, Mila.Tipo.Texto],
      [subcadena, Mila.Tipo.Texto],
      [posición, Mila.Tipo.Entero],
      [secuenciaDeEscape, Mila.Tipo.Texto]
    ]
  });
  let posiciónActual = Mila.Texto.primeraApariciónDe_Desde_(texto, subcadena, posición);
  while (Mila.Tipo.esAlgo(posiciónActual) && !(
    posiciónActual > 1 &&
    !está_EscapeadaPor_EnLaPosición_De_(subcadena, secuenciaDeEscape, posiciónActual, texto)
  )) {
    posiciónActual = Mila.Texto.primeraApariciónDe_Desde_(texto, subcadena, posiciónActual+1);
  }
  return posiciónActual;
};
Mila.Texto._Definir_EnPrototipo_('primeraApariciónDe_Desde_NoEscapeadaCon_', String);

const está_EscapeadaPor_EnLaPosición_De_ = function(subcadena, secuenciaDeEscape, posiciónSubcadena, texto) {
  let posiciónActual = Mila.Texto.primeraApariciónDe_(texto, secuenciaDeEscape);
  while (Mila.Tipo.esAlgo(posiciónActual) &&
    posiciónActual <= posiciónSubcadena &&
    !( // Está incluida la subcadena en la secuencia de escape
      posiciónActual <= posiciónSubcadena &&
      posiciónActual + secuenciaDeEscape.length >= posiciónSubcadena + subcadena.length
    )
  ) {
    posiciónActual = Mila.Texto.primeraApariciónDe_Desde_(texto, secuenciaDeEscape, posiciónActual + 1);
  }
  return Mila.Tipo.esAlgo(posiciónActual) && posiciónActual <= posiciónSubcadena;
};

Mila.Tipo.Registrar({
  nombre:'PropiedadesReemplazoTexto',
  es: {
    "indicadorInicioAgujero":Mila.Tipo.Texto,
    "escapeInicioAgujero":Mila.Tipo.Texto,
    "indicadorFinAgujero":Mila.Tipo.Texto,
    "escapeFinAgujero":Mila.Tipo.Texto,
    "mapaReemplazos":Mila.Tipo.Funcion, // Función a aplicar con cada agujero
    "?mapaTextos":Mila.Tipo.Funcion, // Función a aplicar con cada porción de texto entre agujeros
      // Si no se proporciona, reemplaza las secuencias de escape por sus respectivos indicadores
    "?composiciónFinal":Mila.Tipo.Funcion, // Función a aplicar con la lista de porciones de
     // texto y resultados de reemplazos de agujeros. Si no se proporciona, es un join.
  },
  inferible: false
});

Mila.Texto.aplicandoReemplazosCon_ = function(textoConAgujeros, propiedades) {
  Mila.Contrato({
    Propósito: ["Describe el dato resultante de aplicarle al texto con agujeros dado los reemplazos descriptos en el mapa de propiedades dado.", Mila.Tipo.Cualquiera],
    Parámetros: [
      [textoConAgujeros, Mila.Tipo.Texto],
      [propiedades, Mila.Tipo.PropiedadesReemplazoTexto]
    ]
  });
  let construcciónFinal = [];
  let índiceActual = 1;
  let inicioPróximoAgujero = Mila.Texto.primeraApariciónDe_NoEscapeadaCon_(
    textoConAgujeros,
    propiedades.indicadorInicioAgujero,
    propiedades.escapeInicioAgujero
  );
  const mapaTextos = 'mapaTextos' in propiedades
    ? propiedades.mapaTextos
    : (texto) => texto
        .replaceAll(propiedades.escapeInicioAgujero, propiedades.indicadorInicioAgujero)
        .replaceAll(propiedades.escapeFinAgujero, propiedades.indicadorFinAgujero)
  ;
  while(
    Mila.Tipo.esAlgo(inicioPróximoAgujero)
  ) {
    if (inicioPróximoAgujero > índiceActual) {
      construcciónFinal.push(mapaTextos(Mila.Texto.subTextoEntre_Y_(textoConAgujeros, índiceActual, inicioPróximoAgujero-1)));
    }
    let finAgujero = Mila.Texto.primeraApariciónDe_Desde_NoEscapeadaCon_(
      textoConAgujeros,
      propiedades.indicadorFinAgujero,
      inicioPróximoAgujero + 1,
      propiedades.escapeFinAgujero
    );
    if (Mila.Tipo.esNada(finAgujero)) {
      Mila.Fallar("Texto mal formado");
      return Nada;
    }
    construcciónFinal.push(propiedades.mapaReemplazos(Mila.Texto.subTextoEntre_Y_(
      textoConAgujeros,
      inicioPróximoAgujero + propiedades.indicadorInicioAgujero.length,
      finAgujero -1
    )));
    índiceActual = finAgujero + propiedades.indicadorFinAgujero.length;
    inicioPróximoAgujero = Mila.Texto.primeraApariciónDe_Desde_NoEscapeadaCon_(
      textoConAgujeros,
      propiedades.indicadorInicioAgujero,
      índiceActual,
      propiedades.escapeInicioAgujero
    );
  }
  if (índiceActual <= textoConAgujeros.length) {
    construcciónFinal.push(mapaTextos(Mila.Texto.subTextoDesde_(textoConAgujeros, índiceActual)));
  }
  const funciónFinal = 'composiciónFinal' in propiedades
    ? propiedades.composiciónFinal
    : (lista) => lista.transformados(Mila.Tipo.aTexto).join("")
  ;
  return funciónFinal(construcciónFinal);
};
Mila.Texto._Definir_EnPrototipo_('aplicandoReemplazosCon_', String);