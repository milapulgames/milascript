Mila.Módulo({
  define:'Mila.Svg',
  necesita:'base',
  usa:['archivo','dibujo']
});

Mila.Svg.clavesDeComandos = [
  'm',
  'M',
  'l',
  'L',
  'h',
  'H',
  'v',
  'V',
  'c',
  'C',
  'q',
  'Q',
  'z',
  'Z'
];

Mila.Svg.ClaseComandoSvg = Mila.Tipo.Variante("ClaseComandoSvg", Mila.Svg.clavesDeComandos);

Mila.Svg._ComandoSvg = function ComandoSvg() {};

Mila.Tipo.Registrar({
  nombre:'ComandoSvg',
  prototipo: Mila.Svg._ComandoSvg,
  strInstancia: function(comando) {
    return `${comando.clase().aTexto()}{${comando.argumentos().join(",")}}`;
  },
  copia: Mila.Objeto.copia
});

Mila.Svg.nuevoComando = function(clase, argumentos) {
  Mila.Contrato({
    Propósito: [
      "Describir un nuevo comando Svg de la clase dada y con los argumentos dados.",
      Mila.Tipo.ComandoSvg
    ],
    Parámetros: [
      [clase, Mila.Tipo.ClaseComandoSvg],
      [argumentos, Mila.Tipo.Lista]
    ]
  });
  const nuevoComando = new Mila.Svg._ComandoSvg();
  nuevoComando._clase = clase;
  nuevoComando._argumentos = argumentos;
  return nuevoComando;
};

Mila.Svg._ComandoSvg.prototype.clase = function() {
  Mila.Contrato({
    Propósito: ["Describe la clase de este comando Svg", Mila.Tipo.ClaseComandoSvg]
  });
  return this._clase;
};

Mila.Svg._ComandoSvg.prototype.argumentos = function() {
  Mila.Contrato({
    Propósito: [
      "Describe la lista de argumentos de este comando Svg", Mila.Tipo.Lista
    ]
  });
  return this._argumentos;
};

Mila.Svg.listaDeComandos_ComoTexto = function(listaDeComandos) {
  Mila.Contrato({
    Propósito: [
      "Describe la representación textual de la secuencia de comandos dada.",
      Mila.Tipo.Texto
    ],
    Parámetros: [
      [listaDeComandos, Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)]
    ]
  });
  return listaDeComandos.transformados(comando =>
    `${comando.clase().aTexto()}${comando.argumentos().join(' ')}`
  ).join('');
};

Mila.Svg.listaDeComandos_transformada_ = function(listaDeComandos, transformación) {
  Mila.Contrato({
    Propósito: [
      "Describe la la secuencia de comandos dada tras aplicarle la transformación dada.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)
    ],
    Parámetros: [
      [listaDeComandos, Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)],
      transformación // Transformación
    ]
  });
  if (listaDeComandos.esVacia()) {
    return [];
  }
  const x = transformación.traslación.x;
  const y = transformación.traslación.y;
  const s = transformación.escala.x; // Asumo que es la misma en x que en y.
  const listaTransformada = listaDeComandos.transformados(comando =>
    Mila.Svg.nuevoComando(
      comando.clase(),
      comando.argumentos().transformados(argumento => argumento * s)
    )
  );
  listaTransformada[0].argumentos()[0] += x;
  listaTransformada[0].argumentos()[1] += y;
  return listaTransformada;
};

Mila.Svg.comandoDesdeTexto = function(texto) {
  Mila.Contrato({
    Propósito: [
      "Describe un comando Svg a partir del texto dado.",
      Mila.Tipo.ComandoSvg
    ],
    Parámetros: [
      [texto, Mila.Tipo.Texto]
    ],
    Precondiciones: [
      "El texto dado es la representación textual de un comando Svg."
    ]
  });
  const clase = texto[0];
  const argumentos = [];
  let inicioArgumento=1;
  let finArgumento = 1;
  while (finArgumento < texto.length) {
    if (!'-1234567890.E'.includes(texto[finArgumento])) {
      if (finArgumento > inicioArgumento) {
        argumentos.push(texto.substring(inicioArgumento, finArgumento));
      }
      inicioArgumento = finArgumento;
    }
    finArgumento++;
  }
  if (finArgumento > inicioArgumento) {
    argumentos.push(texto.substring(inicioArgumento, finArgumento));
  }
  return Mila.Svg.nuevoComando(Mila.Svg.ClaseComandoSvg[clase], argumentos);
};

Mila.Svg.secuenciaDeComandosDesdeTexto = function(texto) {
  Mila.Contrato({
    Propósito: [
      "Describe una secuencia de comandos Svg a partir del texto dado.",
      Mila.Tipo.ListaDe_(Mila.Tipo.ComandoSvg)
    ],
    Parámetros: [
      [texto, Mila.Tipo.Texto]
    ],
    Precondiciones: [
      "El texto dado es la representación textual de una secuencia de comandos Svg."
    ]
  });
  const secuenciaDeComandos = [];
  if (texto.esVacio()) {
    return secuenciaDeComandos;
  }
  let inicioComando=texto.primeraApariciónDeAlgunaDe_(Mila.Svg.clavesDeComandos);
  if (inicioComando.esAlgo() && inicioComando > 1) {
    Mostrar("Error al parsear comandos svg: caracteres inválidos antes del primer comando");
  }
  while (inicioComando.esAlgo()) {
    let finComando=texto.primeraApariciónDeAlgunaDe_Desde_(Mila.Svg.clavesDeComandos, inicioComando+1);
    secuenciaDeComandos.push(Mila.Svg.comandoDesdeTexto(texto.subTextoEntre_Y_(
      inicioComando, finComando.esAlgo() ? finComando-1 : texto.longitud()
    )));
    inicioComando = finComando;
  }
  return secuenciaDeComandos;
};

Mila.Svg.ExtraerDesdeArchivo_YLuego_ = function(rutaArchivo, función) {
  Mila.Contrato({
    Propósito: "Abre el archivo en la ruta dada e invoca a la función dada con el Svg contenido en dicho archivo.",
    Parámetros: [
      [rutaArchivo, Mila.Tipo.Texto],
      [función, Mila.Tipo.Funcion] // Que toma un Dibujo
    ],
    Precondiciones: [
      "Existe un archivo svg en la ruta dada."
    ]
  });
  Mila.Archivo.AbrirArchivo_YLuego_(rutaArchivo, function(resultado) {
    if (!resultado.falló()) {
      const dom = (new DOMParser()).parseFromString(resultado.contenido, "image/svg+xml");
      función(Mila.Dibujo.desdeNodoHtml(dom.firstChild));
    }
  });
};