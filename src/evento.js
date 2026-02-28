Mila.Modulo({
  define:"Mila.Evento",
  necesita:["tipo"],
  usa:["lista","pantalla","evento/tecla","evento/mouse"]
});

Mila.Evento.contextoGlobal = "GLOBAL";

Mila.Evento.Contexto = Mila.Tipo.Variante("ContextoEvento",
  [Mila.Evento.contextoGlobal]
);

Mila.Evento._registroEventos = { // Eventos registrados que desatan acciones en cada contexto
  [Mila.Evento.contextoGlobal]: {}
};

Mila.Evento._registroAcciones = { // Acciones registrados que pueden ser desatadas en cada contexto
  [Mila.Evento.contextoGlobal]: {}
};

Mila.Evento._eventosIntermediosEnProgreso = {}; // Para eventos compuestos, puede ser necesario guardar el estado temporal

Mila.Evento.RegistrarContexto = function(identificador) {
  Mila.Contrato({
    Proposito: "Registrar un nuevo contexto a partir del identificador dado",
    Precondiciones: [
      "No hay definido un contexto con el identificador dado",
      !Mila.Evento.Contexto.defineLaClavePropia_(identificador)
    ],
    Parametros: [
      [identificador, Mila.Tipo.Texto]
    ]
  });
  Mila.Evento.Contexto.AgregarCasos([identificador]);
  Mila.Evento._registroEventos[identificador] = {};
  Mila.Evento._registroAcciones[identificador] = {};
};

Mila.Evento.Registrar = function(nombre, evento, funcion, contexto=Mila.Evento.contextoGlobal) {
  Mila.Contrato({
    Proposito: "Registrar la función dada para que sea invocada cuando ocurre un evento como el dado.\
      Si ya se había registrado el nombre dado en el contexto dado se sobreescribe",
    Parametros: [
      [nombre, Mila.Tipo.Texto],
      [evento, Mila.Tipo.Evento],
      [funcion, Mila.Tipo.Funcion],
      [contexto, Mila.Evento.Contexto]
    ]
  });
  if (Mila.Evento._registroAcciones[contexto].defineLaClavePropia_(nombre)) {
    for (let iniciadorAnterior of Mila.Evento._registroAcciones[contexto][nombre].iniciadores) {
      delete Mila.Evento._registroEventos[contexto][iniciadorAnterior][nombre];
      if (Mila.Evento._registroEventos[contexto][iniciadorAnterior].clavesDefinidas().length == 0) {
        delete Mila.Evento._registroEventos[contexto][iniciadorAnterior];
      }
    }
  }
  Mila.Evento._registroAcciones[contexto][nombre] = {
    habilitado:true,
    iniciadores:[]
  };
  for (let iniciador of evento.iniciadores()) {
    const claveIniciador = iniciador.clase();
    if (!Mila.Evento._registroEventos[contexto].defineLaClavePropia_(claveIniciador)) {
      Mila.Evento._registroEventos[contexto][claveIniciador] = {};
    }
    Mila.Evento._registroEventos[contexto][claveIniciador][nombre] = {
      atributos: iniciador.atributos(),
      proximoEvento: evento.proximoEvento(iniciador),
      funcion
    };
    Mila.Evento._registroAcciones[contexto][nombre].iniciadores.push(claveIniciador);
  }
};

Mila.Evento.Habilitar = function(nombre, contexto=Mila.Evento.contextoGlobal) {
  Mila.Contrato({
    Proposito: "Habilita la acción con el nombre dado en el contexto dado",
    Precondiciones:[
      "Hay registrada una acción con el nombre dado en el contexto dado",
      Mila.Evento._registroAcciones[contexto].defineLaClavePropia_(nombre)
    ],
    Parametros: [
      [nombre, Mila.Tipo.Texto],
      [contexto, Mila.Evento.Contexto]
    ]
  });
  Mila.Evento._registroAcciones[contexto][nombre].habilitado = true;
};

Mila.Evento.Deshabilitar = function(nombre, contexto=Mila.Evento.contextoGlobal) {
  Mila.Contrato({
    Proposito: "Deshabilita la acción con el nombre dado en el contexto dado",
    Precondiciones:[
      "Hay registrada una acción con el nombre dado en el contexto dado",
      Mila.Evento._registroAcciones[contexto].defineLaClavePropia_(nombre)
    ],
    Parametros: [
      [nombre, Mila.Tipo.Texto],
      [contexto, Mila.Evento.Contexto]
    ]
  });
  Mila.Evento._registroAcciones[contexto][nombre].habilitado = false;
};

Mila.Evento.AtenderJs = function(eventoJs) {
  Mila.Contrato({
    Proposito: "Atender el evento dado lanzado por el navegador web",
    Parametros: [eventoJs /* Event */]
  });
  for (let evento of Mila.Evento.desdeJs(eventoJs)) {
    Mila.Evento.Atender(evento);
  }
};

Mila.Evento.Atender = function(evento) {
  Mila.Contrato({
    Proposito: "Atender el evento dado",
    Parametros: [evento, Mila.Tipo.Evento]
  });
  let clave = evento.clase();
  if (Mila.Evento._eventosIntermediosEnProgreso.defineLaClavePropia_(clave)) {
    const eventosIntermediosEnProgreso = Mila.Evento._eventosIntermediosEnProgreso[clave];
    delete Mila.Evento._eventosIntermediosEnProgreso[clave];
    for (let eventoIntermedio of eventosIntermediosEnProgreso) {
      if (Mila.Evento.coincideCon_(evento, eventoIntermedio.atributos)) {
        Mila.Evento.Procesar(eventoIntermedio, evento);
      }
    }
  }
  const registro = Mila.Evento._registroEventos[Mila.Evento.contextoActual];
  if (registro.defineLaClavePropia_(clave)) {
    for (let nombre in registro[clave]) {
      if (Mila.Evento._registroAcciones[Mila.Evento.contextoActual][nombre].habilitado) {
        let eventoEnRegistro = registro[clave][nombre];
        if (Mila.Evento.coincideCon_(evento, eventoEnRegistro.atributos)) {
          Mila.Evento.Procesar(eventoEnRegistro, evento);
        }
      }
    }
  }
};

Mila.Evento.Procesar = function(eventoEnRegistro, eventoOriginal) {
  Mila.Contrato({
    Proposito: "Procesar el evento representado a partir del elemento del registro de eventos dado",
    Parametros: [
      [eventoEnRegistro],
      [eventoOriginal, Mila.Tipo.Evento]
    ]
  });
  const eventosAnteriores = eventoEnRegistro.defineLaClavePropia_('eventosAnteriores') ? eventoEnRegistro.eventosAnteriores : [];
  eventosAnteriores.push(eventoOriginal);
  if (eventoEnRegistro.proximoEvento.esNada()) {
    Mila.Evento.Ejecutar(eventoEnRegistro.funcion, eventosAnteriores);
  } else {
    for (let iniciador of eventoEnRegistro.proximoEvento.iniciadores()) {
      Mila.Evento._eventosIntermediosEnProgreso[iniciador.clase()] = {
        atributos: iniciador.atributos(),
        proximoEvento:eventoEnRegistro.proximoEvento.proximoEvento(iniciador),
        funcion:eventoEnRegistro.funcion,
        eventosAnteriores
      };
    }
  }
};

const coincidenAtributos = function(evento, atributos, campos) {
  return campos.todosCumplen_(function(campo) {
    return atributos[campo].esNada() || evento.atributo_(campo).esIgualA_(atributos[campo]);
  });
};

Mila.Evento.coincideCon_ = function(evento, atributos) {
  // PRE: los atributos corresponden a los de un evento de la clase del dado (pero cuyos campos podrían ser Nada)
  // PRE: el evento es atómico
  switch (evento.clase()) {
    case "TextoIngresado":
      return coincidenAtributos(evento, atributos, ['textoIngresado']);
    case "Tecla":
      return coincidenAtributos(evento, atributos, ['presionada','codigoTecla']);
    case "BotonMouse":
      return coincidenAtributos(evento, atributos, ['presionado','numeroDeBoton']) &&
        (
          atributos.elementosCliqueados.esVacia()
          ||
          atributos.elementosCliqueados.algunoCumple_(x => evento.atributo_('elementosCliqueados').contieneA_(x))
        )
      ;
    case "MovimientoMouse":
      return coincidenAtributos(evento, atributos, ['posiciónEnX','posiciónEnY']);
    case "Tiempo":
      return coincidenAtributos(evento, atributos, ['cantidadDeMilisegundos']);
  }
  return false;
};

Mila.Evento.Ejecutar = function(funcion, eventos) { 
  if (eventos.length == 1) {
    funcion(eventos[0]);
  } else {
    Mila.Fallar(Mila.Error.deTamañoListaDistinto(eventos,1));
  }
};

Mila.Evento._Evento = function Evento(clase, atributos) {
  this._clase = clase;
  this._atributos = atributos;
};

Mila.Evento.nuevo = function(clase, atributos) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento genérico a partir de la clase dada y los atributos dados", Mila.Tipo.Evento],
    Parametros: [
      [clase, Mila.Tipo.Texto],
      [atributos]
    ]
  });
  const nuevo = new Mila.Evento._Evento(clase, atributos);
  return nuevo;
};

Mila.Evento.deTextoIngresado = function(textoIngresado) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que el texto dado fue ingresado por teclado", Mila.Tipo.Evento],
    Parametros: [
      [textoIngresado, Mila.Tipo.Texto]
    ]
  });
  return Mila.Evento.nuevo("TextoIngresado", {textoIngresado});
};

Mila.Evento.deTecla = function(codigoTecla, presionada=true) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que la tecla con código dado fue presionada", Mila.Tipo.Evento],
    Parametros: [
      [codigoTecla, Mila.Tipo.Entero, "El scancode de la tecla presionada"],
      [presionada, Mila.Tipo.Booleano, "Si fue presionada o liberada"]
    ]
  });
  return Mila.Evento.nuevo("Tecla", {codigoTecla, presionada});
};

Mila.Evento.deBotonMouse = function(numeroDeBoton, presionado=true) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que el botón dado del mouse fue presionado", Mila.Tipo.Evento],
    Parametros: [
      [numeroDeBoton, Mila.Tipo.Entero, "El número del botón presionado"],
      [presionado, Mila.Tipo.Booleano, "Si fue presionado o liberada"]
    ]
  });
  return Mila.Evento.nuevo("BotonMouse", {numeroDeBoton, presionado, elementosCliqueados:[],
    posiciónEnX: Mila.Nada, posiciónEnY: Mila.Nada
  });
};

Mila.Evento.deClicSobreElementos = function(elementosCliqueados, numeroDeBoton=Mila.Evento.Mouse.clicIzquierdo, presionado=true) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que se hizo clic sobre alguno de los elementos dados", Mila.Tipo.Evento],
    Parametros: [
      [elementosCliqueados, Mila.Tipo.O([Mila.Tipo.ElementoVisual, Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)]),
        "El elemento cliqueado o la lista de elementos cliqueados"
      ],
      [numeroDeBoton, Mila.Tipo.Entero, "El número del botón presionado"],
      [presionado, Mila.Tipo.Booleano, "Si fue presionado o liberada"]
    ]
  });
  return Mila.Evento.nuevo("BotonMouse", {numeroDeBoton, presionado,
    elementosCliqueados: elementosCliqueados.esUnaLista() ? elementosCliqueados : [elementosCliqueados],
    posiciónEnX: Mila.Nada, posiciónEnY: Mila.Nada
  });
};

Mila.Evento.deMovimientoMouse = function(posiciónEnX, posiciónEnY) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que el mouse se movió", Mila.Tipo.Evento],
    Parametros: [
      [posiciónEnX, Mila.Tipo.Entero, "Posición horizontal del puntero tras moverse"],
      [posiciónEnY, Mila.Tipo.Entero, "Posición vertical del puntero tras moverse"]
    ]
  });
  return Mila.Evento.nuevo("MovimientoMouse", {posiciónEnX, posiciónEnY});
};

Mila.Evento.deTiempoTranscurrido = function(cantidadDeMilisegundos) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que transcurrió la cantidad de milisegundos dada (o menos)", Mila.Tipo.Evento],
    Parametros: [
      [cantidadDeMilisegundos, Mila.Tipo.Entero, "Cuántos milisegundos transcurrieron"]
    ]
  });
  return Mila.Evento.nuevo("Tiempo", {cantidadDeMilisegundos});
};

Mila.Evento.aLaVez = function(eventos) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que todos los eventos dados están ocurriendo a la vez", Mila.Tipo.Evento],
    Parametros: [
      [eventos, Mila.Tipo.ListaDe_(Mila.Tipo.Evento)]
    ]
  });
  return Mila.Evento.nuevo("Conjuncion", {eventos});
};

Mila.Evento.juntoA = function(modificador, evento) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que todos ocurrió el evento dado con el modificador dado", Mila.Tipo.Evento],
    Parametros: [
      [modificador, Mila.Tipo.Evento],
      [evento, Mila.Tipo.Evento]
    ]
  });
  return Mila.Evento.nuevo("Modificacion", {modificador, evento});
};

Mila.Evento.algunoDe = function(eventos) {
  Mila.Contrato({
    Proposito: ["Describir un nuevo evento que indica que ocurrió alguno de los eventos dados", Mila.Tipo.Evento],
    Parametros: [
      [eventos, Mila.Tipo.ListaDe_(Mila.Tipo.Evento)]
    ]
  });
  return Mila.Evento.nuevo("Disyuncion", {eventos});
};


Mila.Evento.desdeJs = function(eventoJs) {
  Mila.Contrato({
    Proposito: ["Describir una lista de eventos a partir del evento js dado", Mila.Tipo.ListaDe_(Mila.Tipo.Evento)],
    Parametros: [
      [eventoJs /* Event */] 
    ]
  });
  switch (eventoJs.type) {
    case "keydown":
      return [ // Ya no hace falta generar todas variantes porque valido si un evento "coincideCon_" en lugar de validar si es idéntico así que esto podría ser el evento directamente (en lugar de una lista de eventos)
        // Mila.Evento.deTecla(Mila.Nada, Mila.Nada), // Evento de tecla genérico
        // Mila.Evento.deTecla(Mila.Nada, true), // Tecla presionada
        Mila.Evento.deTecla(Mila.Evento.Tecla.codigoEventoJs(eventoJs), true) // Evento real
      ];
    case "keyup":
      return [Mila.Evento.deTecla(Mila.Evento.Tecla.codigoEventoJs(eventoJs), false)];
    case "pointerdown":
      return [Mila.Evento.nuevo("BotonMouse", {
        numeroDeBoton:Mila.Evento.Mouse.codigoEventoJs(eventoJs),
        presionado:true,
        elementosCliqueados:Mila.Evento.elementosCliqueadosJs(eventoJs),
        posiciónEnX: eventoJs.clientX, posiciónEnY: eventoJs.clientY
      })];
    case "pointermove":
      return [Mila.Evento.deMovimientoMouse(eventoJs.clientX, eventoJs.clientY)];
    case "pointerup":
      return [Mila.Evento.nuevo("BotonMouse", {
        numeroDeBoton:Mila.Evento.Mouse.codigoEventoJs(eventoJs),
        presionado:false,
        elementosCliqueados:[],
        posiciónEnX: eventoJs.clientX, posiciónEnY: eventoJs.clientY
      })];
  }
  return [];
};

Mila.Evento.elementosCliqueadosJs = function(eventoJs) {
  return (Mila.Tipo.esAlgo(eventoJs.target))
    ? [Mila.Pantalla.elementoDeId_(eventoJs.target.getAttribute('id'))] // TODO: agregar también los elementos que lo contienen a este
    : []
  ;
};

Mila.Evento._Evento.prototype.clase = function() {
  return this._clase;
};

Mila.Evento._Evento.prototype.atributos = function() {
  return this._atributos;
};

Mila.Evento._Evento.prototype.atributo_ = function(claveAtributo) {
  return this._atributos[claveAtributo];
};

Mila.Evento._Evento.prototype.esAtomico = function() {
  return [
    "TextoIngresado",
    "Tecla",
    "BotonMouse",
    "MovimientoMouse",
    "Tiempo"
  ].includes(this._clase);
};

Mila.Evento._Evento.prototype.esCompuesto = function() {
  return [
    "Conjuncion",
    "Modificacion",
    "Disyuncion"
  ].includes(this._clase);
};

Mila.Evento._Evento.prototype.serializado = function() {
  switch (this._clase) {
    case "TextoIngresado":
      return `TEXTO(${this._atributos.textoIngresado})`;
    case "Tecla":
      return `TECLA_${this._atributos.presionada ? "PRESIONADA" : "SOLTADA"}(${this._atributos.codigoTecla})`;
    case "BotonMouse":
      return `MOUSE_${this._atributos.presionado ? "PRESIONADO" : "SOLTADO"}(${this._atributos.numeroDeBoton})${
        !this._atributos.elementosCliqueados.esVacia() ? " : " + this._atributos.elementosCliqueados.transformados(
          x=>x._idÚnico
        ).join(" ") : ""
      }`;
    case "MovimientoMouse":
      return `MOUSE_MOVIDO(${this._atributos.posiciónEnX},${this._atributos.posiciónEnY})`;
    case "Tiempo":
      return `TIEMPO(${this._atributos.cantidadDeMilisegundos})`;
    case "Conjuncion":
      return `Y(${this._atributos.eventos.map(x=>x.serializado()).join(",")})`;
    case "Modificacion":
      return `(${this._atributos.modificador.serializado()})+(${this._atributos.evento.serializado()})`;
    case "Disyuncion":
      return `O(${this._atributos.eventos.map(x=>x.serializado()).join(",")})`;
  }
};

Mila.Evento._Evento.prototype.iniciadores = function() {
  Mila.Contrato({
    Proposito: ["Describir la lista de eventos que pueden iniciar este evento", Mila.Tipo.ListaDe_(Mila.Tipo.Evento)]
  });
  switch (this._clase) {
    case "TextoIngresado":
      return [this];
    case "Tecla":
      return [this];
    case "BotonMouse":
      return [this];
    case "MovimientoMouse":
      return [this];
    case "Tiempo":
      return [this];
    case "Conjuncion":
      return this._atributos.eventos.map(x=>x.iniciadores()).concatenadas();
    case "Modificacion":
      return this._atributos.modificador.iniciadores();
    case "Disyuncion":
      return this._atributos.eventos.map(x=>x.iniciadores()).concatenadas();
  }
};

Mila.Evento._Evento.prototype.proximoEvento = function(eventoAnterior) {
  Mila.Contrato({
    Proposito: [
      "Describir el evento que debe ocurrir a continuación del dado para seguir desatando este evento\
        o Nada si este evento ya terminó de ocurrir",
      Mila.Tipo.O([Mila.Nada,Mila.Tipo.Evento])
    ],
    Precondiciones: ["El evento dado es uno de los que pueden iniciar este evento"]
  });
  switch (this._clase) {
    case "TextoIngresado":
      return Mila.Nada;
    case "Tecla":
      return Mila.Nada;
    case "BotonMouse":
      return Mila.Nada;
    case "MovimientoMouse":
      return Mila.Nada;
    case "Tiempo":
      return Mila.Nada;
    case "Conjuncion":
      let eventosRestantes = this._atributos.eventos.losQueNoCumplen(x=>x.iniciadores().contieneUnoComo_(eventoAnterior))
      return eventosRestantes.esVacia() ? Mila.Nada : Mila.Evento.aLaVez(eventosRestantes);
    case "Modificacion":
      let eventoParaModificador = this._atributos.modificador.proximoEvento(eventoAnterior);
      return eventoParaModificador.esNada() ? this._atributos.evento : Mila.Evento.juntoA(eventoParaModificador, this._atributos.evento);
    case "Disyuncion":
      return Mila.Nada;
  }
};

Mila.Tipo.Registrar({
  nombre:'Evento',
  prototipo: Mila.Evento._Evento,
  strInstancia: (elemento) => elemento.serializado()
});

Mila.alIniciar(function() {
  if (Mila.entorno().enNavegador()) {
    document.addEventListener('keydown', Mila.Evento.AtenderJs);
    document.addEventListener('keyup', Mila.Evento.AtenderJs);
    document.addEventListener('pointerdown', Mila.Evento.AtenderJs);
    document.addEventListener('pointermove', Mila.Evento.AtenderJs);
    document.addEventListener('pointerup', Mila.Evento.AtenderJs);
  } else {
    // TODO
  }
  Mila.Evento.contextoActual = Mila.Evento.contextoGlobal;
});