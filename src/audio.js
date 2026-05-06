Mila.Módulo({
  define:"Mila.Audio",
  necesita:["tipo","objeto"],
  usa:["texto","lista"]
});

// for (let n of ["Do","Re","Mi","Fa","Sol","La","Si"]) {
//   for (let i of [0,1,2,3,4,5,6,7,8,9]) {
//     Mila.Audio.Reproducir(Mila.Audio.nota(`${n}${i}`), {durante:100, encolar:true});
//   }
// }
// for (let i of [0,1,2,3,4,5,6,7,8,9]) {
//   for (let n of ["Do","Re","Mi","Fa","Sol","La","Si"]) {
//     Mila.Audio.Reproducir(Mila.Audio.nota(`${n}${i}`), {durante:100, encolar:true});
//   }
// }

Mila.Audio.nuevoCanal = function() {
  Mila.Contrato({
    Propósito:["Describir un nuevo canal de audio.", Mila.Tipo.CanalAudio]
  });
  let nuevoCanal = new Mila.Audio._CanalAudio();
  Mila.Audio.canales[`canal_${1+Mila.Audio.canales.clavesDefinidas().longitud()}`] = nuevoCanal;
  return nuevoCanal;
};

Mila.Audio._CanalAudio = function CanalAudio() {
  this._contexto = new AudioContext();
  this._reproduciendo = false;
  this._colaDeReproducciones = [];
  this._salida = this._contexto.destination;
};

Mila.Audio.canales = {};

Mila.Audio.canalActual = Mila.Nada;

Mila.Audio.canalPorDefecto = new Mila.Audio._CanalAudio();

Mila.Audio.todosLosCanales = function(incluyendoElCanalPorDefecto=false) {
  Mila.Contrato({
    Propósito:["Describe una lista con todos los canales.", Mila.Tipo.ListaDe_(Mila.Tipo.CanalAudio)],
    Parámetros: [
      [incluyendoElCanalPorDefecto, Mila.Tipo.Booleano]
    ]
  });
  let todosLosCanales = Mila.Audio.canales.valoresContenidos();
  todosLosCanales.Agregar_Si_(Mila.Audio.canalPorDefecto, incluyendoElCanalPorDefecto);
  return todosLosCanales;
};

Mila.Audio.canalSeleccionado = function() {
  Mila.Contrato({
    Propósito:["Describe el canal actual (o el canal por defecto si no hay ninguno).", Mila.Tipo.CanalAudio]
  });
  return Mila.Audio.canalActual.esAlgo()
    ? Mila.Audio.canalActual
    : Mila.Audio.canalPorDefecto
  ;
};

Mila.Audio.Reproducir = function(elementoSonoro, opcionesReproducción={}) {
  Mila.Contrato({
    Propósito:"Reproducir el elemento sonoro dado con las opciones de reproducción dadas.",
    Parámetros: [
      [elementoSonoro, Mila.Tipo.ElementoSonoro],
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción]
    ]
  });
  Mila.Audio.canalSeleccionado().Reproducir(elementoSonoro, opcionesReproducción);
};

Mila.Audio.ReproducirFrecuencia = function(frecuencia, opcionesReproducción={}) {
  Mila.Contrato({
    Propósito:"Reproducir una nota con la frecuencia dada con las opciones de reproducción dadas.",
    Parámetros: [
      [frecuencia, Mila.Tipo.Entero],
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción]
    ]
  });
  Mila.Audio.canalSeleccionado().ReproducirFrecuencia(frecuencia, opcionesReproducción);
};

Mila.Audio.ReproducirNotaMusical = function(notaMusical, opcionesReproducción={}) {
  Mila.Contrato({
    Propósito:"Reproducir la nota musical dada con las opciones de reproducción dadas.",
    Parámetros: [
      [notaMusical, Mila.Tipo.VariantesNotaMusical],
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción]
    ]
  });
  Mila.Audio.canalSeleccionado().ReproducirNotaMusical(notaMusical, opcionesReproducción);
};

Mila.Audio.EstablecerVolumenEn_ = function(volumen) {
  Mila.Contrato({
    Propósito:"Cambiar el volumen por el dado.",
    Parámetros: [
      [volumen, Mila.Tipo.Numero]
    ],
    Precondiciones: [
      "El nivel de volumen dado está entre 0 y 100",
      0 <= volumen && volumen <= 100
    ]
  });
  Mila.Audio.canalSeleccionado().EstablecerVolumenEn_(volumen);
};

Mila.Audio.Detener = function() {
  Mila.Contrato({
    Propósito:"Detener el audio de todos los canales."
  });
  for (let canal of Mila.Audio.todosLosCanales(true)) {
    canal.Detener();
  }
};

Mila.Audio._CanalAudio.prototype.Reproducir = function(elementoSonoro, opcionesReproducción={}) {
  Mila.Contrato({
    Propósito:"Reproducir el elemento sonoro dado en este canal con las opciones de reproducción dadas.",
    Parámetros: [
      [elementoSonoro, Mila.Tipo.ElementoSonoro],
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción]
    ]
  });
  if (elementoSonoro.esUnEntero()) {
    this.ReproducirFrecuencia(elementoSonoro, opcionesReproducción);
  } else if (elementoSonoro.esUnaNotaMusical()) {
    this.ReproducirNotaMusical(elementoSonoro, opcionesReproducción);
  } else { // es un texto
    // TODO
  }
};

Mila.Audio._CanalAudio.prototype.ReproducirFrecuencia = function(frecuencia, opcionesReproducción={}) {
  Mila.Contrato({
    Propósito:"Reproducir una nota con la frecuencia dada en este canal con las opciones de reproducción dadas.",
    Parámetros: [
      [frecuencia, Mila.Tipo.Entero],
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción]
    ]
  });
  const esteCanal = this;
  this._ConfigurarReproducción(opcionesReproducción, function() {
    let oscilador = esteCanal.oscilador();
    oscilador.frequency.setValueAtTime(frecuencia, esteCanal._contexto.currentTime);
    oscilador.connect(esteCanal._salida);
    esteCanal._reproduciendo = true;
  });
};

Mila.Audio._CanalAudio.prototype.ReproducirNotaMusical = function(notaMusical, opcionesReproducción={}) {
  Mila.Contrato({
    Propósito:"Reproducir la nota musical dada en este canal con las opciones de reproducción dadas.",
    Parámetros: [
      [notaMusical, Mila.Tipo.VariantesNotaMusical],
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción]
    ]
  });
  this.ReproducirFrecuencia(Mila.Audio.frecuenciaDeNota(notaMusical), opcionesReproducción);
};

Mila.Audio._CanalAudio.prototype._ConfigurarReproducción = function(opcionesReproducción, función) {
  Mila.Contrato({
    Propósito:"Configurar este canal con las opciones de reproducción dadas.",
    Parámetros: [
      [opcionesReproducción, Mila.Tipo.OpcionesReproducción],
      [función, Mila.Tipo.Funcion, "Función a ejecutar tras la configuración (o a encolar si se debe encolar)."]
    ]
  });
  const esteCanal = this;
  const funciónCompleta = function() {
    if (esteCanal.defineLaClave_('_detenciónProgramada')) {
      clearTimeout(esteCanal._detenciónProgramada);
      delete esteCanal._detenciónProgramada;
    }
    if (opcionesReproducción.defineLaClave_('volumen')) {
      esteCanal.EstablecerVolumenEn_(opcionesReproducción.volumen);
    }
    if (opcionesReproducción.defineLaClave_('durante')) {
      esteCanal._detenciónProgramada = setTimeout(() => {esteCanal._FinalizarReproducción()}, opcionesReproducción.durante);
    }
    función();
  };
  if (esteCanal._reproduciendo && opcionesReproducción.defineLaClave_('encolar') && opcionesReproducción.encolar) {
    esteCanal._EncolarReproducción_(funciónCompleta);
  } else {
    funciónCompleta();
  }
};

Mila.Audio._CanalAudio.prototype.EstablecerVolumenEn_ = function(volumen) {
  Mila.Contrato({
    Propósito:"Cambiar el volumen de este canal por el dado.",
    Parámetros: [
      [volumen, Mila.Tipo.Numero]
    ],
    Precondiciones: [
      "El nivel de volumen dado está entre 0 y 100",
      0 <= volumen && volumen <= 100
    ]
  });
  let controlVolumen = this.controlVolumen();
  controlVolumen.gain.value = volumen / 100;
};

Mila.Audio._CanalAudio.prototype.Detener = function() {
  Mila.Contrato({
    Propósito:"Detener cualquier reproducción en este canal."
  });
  if (this.estáReproduciendo()) {
    let oscilador = this.oscilador();
    oscilador.disconnect(this._salida);
    this._reproduciendo = false;
  }
};

Mila.Audio._CanalAudio.prototype._FinalizarReproducción = function() {
  Mila.Contrato({
    Propósito:"Finaliza la reproducción actual de este canal y comienza la siguiente en la cola (si es que hay alguna)."
  });
  if (this.estáReproduciendo()) {
    this.Detener();
  }
  if (!this._colaDeReproducciones.esVacia()) {
    let siguienteReproducción = this._colaDeReproducciones.primero();
    this._colaDeReproducciones.SacarPrimero();
    siguienteReproducción();
  }
};

Mila.Audio._CanalAudio.prototype._EncolarReproducción_ = function(funciónDeReproducción) {
  Mila.Contrato({
    Propósito:"Encola la función de reproducción dada en este canal.",
    Parámetros: [
      [funciónDeReproducción, Mila.Tipo.Funcion]
    ],
  });
  this._colaDeReproducciones.Agregar_AlFinal(funciónDeReproducción);
};

Mila.Audio._CanalAudio.prototype.estáReproduciendo = function() {
  Mila.Contrato({
    Propósito:["Indica si este canal está reproduciendo algún sonido.", Mila.Tipo.Booleano]
  });
  return this._reproduciendo;
};

Mila.Audio._CanalAudio.prototype.oscilador = function() {
  Mila.Contrato({
    Propósito:["Describir el oscilador de este canal. Si no existee, lo crea.", OscillatorNode]
  });
  if (this.defineLaClave_('_oscilador')) {
    return this._oscilador;
  }
  this._oscilador = this._contexto.createOscillator();
  this._oscilador.type = "square";
  this._oscilador.start();
  return this._oscilador;
};

Mila.Audio._CanalAudio.prototype.controlVolumen = function() {
  Mila.Contrato({
    Propósito:["Describir el control de volumen de este canal. Si no existee, lo crea.", GainNode]
  });
  if (this.defineLaClave_('_controlVolumen')) {
    return this._controlVolumen;
  }
  this._controlVolumen = this._contexto.createGain();
  this._controlVolumen.connect(this._salida);
  this._salida = this._controlVolumen;
  return this._controlVolumen;
};

const mapaNotasAmericanaFrancesa = {
  "Do":"C", "Re":"D", "Mi":"E", "Fa":"F", "Sol":"G", "La":"A", "Si":"B"
};

const clavesNotasMusicalesNotaciónAmericana = mapaNotasAmericanaFrancesa.clavesDefinidas();

const clavesNotasMusicalesNotaciónFrancesa = mapaNotasAmericanaFrancesa.valoresContenidos();

Mila.Audio.nota = function(textoNotaMusicalOClaveNotaMusical, escalaOModificador1=Mila.Nada, escalaOModificador2=Mila.Nada) {
  Mila.Contrato({
    Propósito:["Describe una nota musical a partir de los argumentos dados.", Mila.Tipo.NotaMusical],
    Parámetros: [
      [textoNotaMusicalOClaveNotaMusical, Mila.Tipo.VariantesNotaMusical],
      [escalaOModificador1, Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Texto, Mila.Tipo.Nada])],
      [escalaOModificador2, Mila.Tipo.O([Mila.Tipo.Entero, Mila.Tipo.Texto, Mila.Tipo.Nada])]
    ]
  });
  let clave = textoNotaMusicalOClaveNotaMusical;
  if (clave.esUnaNotaMusical()) {
    return clave;
  }
  if (clave.esUnTexto()) { // Puede ser la nota completa o sólo la clave
    if (!(
      clavesNotasMusicalesNotaciónAmericana.contieneA_(clave) ||
      clavesNotasMusicalesNotaciónFrancesa.contieneA_(clave)
    )) {
      return Mila.Audio.notaDesdeTexto(clave); // Es la nota completa
    }
    clave = Mila.Audio.ClaveNotaMusical[clave]; // Es sólo la clave
  } else { // clave es un registro
    return new Mila.Audio._NotaMusical(clave);
  }
  // clave es una clave de nota musical
  let escala = 4;
  let sostenido = false;
  let bemol = false;
  if (escalaOModificador1.esAlgo()) {
    if (escalaOModificador1.esUnTexto()) {
      sostenido = sostenido && escalaOModificador1 == "#";
      bemol = bemol && escalaOModificador1 == "b";
    } else { // escalaOModificador1 es un entero
      escala = escalaOModificador1;
    }
    if (escalaOModificador2.esAlgo()) {
      if (escalaOModificador2.esUnTexto()) {
        sostenido = sostenido && escalaOModificador2 == "#";
        bemol = bemol && escalaOModificador2 == "b";
      } else { // escalaOModificador2 es un entero
        escala = escalaOModificador2;
      }
    }
  }
  return new Mila.Audio._NotaMusical({
    clave,
    escala,
    sostenido,
    bemol
  });
};

Mila.Audio.notaDesdeTexto = function(notaComoTexto) {
  Mila.Contrato({
    Propósito:["Describe la nota musical correspondiente al texto dado.", Mila.Tipo.NotaMusical],
    Parámetros: [
      [notaComoTexto, Mila.Tipo.Texto]
    ]
  });
  let clave = Mila.Nada;
  for (let claveAmericana of clavesNotasMusicalesNotaciónAmericana) {
    if (notaComoTexto.empiezaCon_(claveAmericana)) {
      clave = claveAmericana;
    }
  }
  if (clave.esNada()) {
    for (let claveFrancesa of clavesNotasMusicalesNotaciónFrancesa) {
      if (notaComoTexto.empiezaCon_(claveFrancesa)) {
        clave = claveFrancesa;
      }
    } 
  }
  if (clave.esAlgo()) {
    let sostenido = false;
    let bemol = false;
    let restoDelTexto = notaComoTexto.sinLosPrimeros_(clave.longitud()).trim();
    if (restoDelTexto.empiezaCon_("#")) {
      sostenido = true;
      restoDelTexto = restoDelTexto.sinLosPrimeros_(1).trim();
    } else if (restoDelTexto.empiezaCon_("b")) {
      bemol = true;
      restoDelTexto = restoDelTexto.sinLosPrimeros_(1).trim();
    }
    return new Mila.Audio._NotaMusical({
      clave: Mila.Audio.ClaveNotaMusical[clave],
      escala: (restoDelTexto.longitud() == 0) ? 4 : Number.parseInt(restoDelTexto),
      sostenido,
      bemol
    });
  }
  return new Mila.Audio._NotaMusical({clave: Mila.Audio.ClaveNotaMusical.C, escala: 4});
};

Mila.Audio.frecuenciaDeNota = function(notaMusical) {
  Mila.Contrato({
    Propósito:["Describe la frecuencia de la nota musical dada.", Mila.Tipo.Entero],
    Parámetros: [
      [notaMusical, Mila.Tipo.O([Mila.Tipo.NotaMusical, Mila.Tipo.ClaveNotaMusical, Mila.Tipo.Texto])]
    ]
  });
  return Mila.Audio.nota(notaMusical).frecuencia();
};

Mila.Tipo.Registrar({
  nombre: "CanalAudio",
  prototipo: Mila.Audio._CanalAudio,
  es: 'esUnCanalDeAudio'
});

Mila.Tipo.Registrar({
  nombre:'OpcionesReproducción',
  es: {
    "?durante":Mila.Tipo.Entero,
    "?volumen":Mila.Tipo.Numero,
    "?encolar":Mila.Tipo.Booleano
  },
  inferible: false
});

Mila.Audio.ClaveNotaMusical = Mila.Tipo.Variante("ClaveNotaMusical",
  clavesNotasMusicalesNotaciónAmericana.concatenadaCon_(clavesNotasMusicalesNotaciónFrancesa)
);

Mila.Audio._NotaMusical = function NotaMusical(registroNotaMusical) {
  this.clave = registroNotaMusical.clave;
  this.escala = ('escala' in registroNotaMusical) ? registroNotaMusical.escala : 4;
  this.sostenido = ('sostenido' in registroNotaMusical) && registroNotaMusical.sostenido;
  this.bemol = ('bemol' in registroNotaMusical) && registroNotaMusical.bemol;
};

Mila.Audio._NotaMusical.prototype.frecuencia = function() {
  Mila.Contrato({
    Propósito:["Describe la frecuencia de esta nota.", Mila.Tipo.Entero]
  });
  let semiTonoInterno = {
    "A":0,  "La":0,
    "B":2,  "Si":2,
    "C":-9,  "Do":-9,
    "D":-7,  "Re":-7,
    "E":-5,  "Mi":-5,
    "F":-4,  "Fa":-4,
    "G":-2, "Sol":-2
  }[this.clave.aTexto()];
  if (this.sostenido) {
    semiTonoInterno++;
  } else if (this.bemol) {
    semiTonoInterno--;
  }
  semiTonoInterno += 12*(this.escala);
  semiTonoInterno -= 48;
  return 440 * Math.pow(2,(semiTonoInterno/12));
};

Mila.Tipo.Registrar({
  nombre: "NotaMusical",
  prototipo: Mila.Audio._NotaMusical,
  es: 'esUnaNotaMusical',
  igualdad: ['clave','escala','sostenido','bemol'],
  strInstancia: function(elemento) {
    return `${elemento.clave.aTexto()}${
      (elemento.sostenido) ? "#" : ((elemento.bemol) ? "b" : "")
    }${elemento.escala}`;
  }
});

Mila.Tipo.Alias("NotaMusicalComoRegistro",
  Mila.Tipo.RegistroCon_({
    "clave":Mila.Tipo.ClaveNotaMusical,
    "?escala":Mila.Tipo.Entero,
    "?sostenido":Mila.Tipo.Booleano,
    "?bemol":Mila.Tipo.Booleano
  })
);

Mila.Tipo.Alias("VariantesNotaMusical",
  Mila.Tipo.O([
    Mila.Tipo.NotaMusical,
    Mila.Tipo.ClaveNotaMusical,
    Mila.Tipo.NotaMusicalComoRegistro,
    Mila.Tipo.Texto
  ])
);

Mila.Audio.ElementoSonoro = Mila.Tipo.Alias("ElementoSonoro",
  Mila.Tipo.O([
    Mila.Tipo.Entero,       // Frecuencia
    Mila.Tipo.NotaMusical,  // Nota
    Mila.Tipo.Texto         // Nombre de pista
  ])
);