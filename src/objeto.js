Mila.Modulo({
  define:"Mila.Objeto",
  necesita:["documentacion","js"],
  usa:["tipo","lista"]
});

Mila.Objeto._Definir_EnPrototipo_ = function(nombre, prototipo, posicionDeThis=0) {
  // Define en un prototipo una función de instancia a partir de otra función definida en este módulo.
    // nombre es una cadena de texto correspondiente al nombre de la función a definir (la misma que la que ya está definida).
    // prototipo es el objeto en cuyo prototipo se definirá la función.
    // posicionDeThis es un entero correspondiente a la posición del argumento que corresponde a la instancia this en la invocación a la función del módulo (0 si se omite).
  // PRE: Hay una función con el nombre dado en este módulo (Mila.Objeto).
  Mila.Base.DefinirFuncionDeInstanciaAPartirDe_({
    prototipo,
    nombre,
    cantidadDeParametros: Mila.Objeto[nombre].length-1,
    posicionDeThis,
    funcionAInvocar: `Mila.Objeto.${nombre}`
  });
};

Mila.Objeto.clavesDefinidas = function(objeto) {
  // Describe la lista de claves definidas en el objeto dado.
    // objeto puede ser cualquier dato.
  return Object.keys(objeto);
};
Mila.Objeto._Definir_EnPrototipo_('clavesDefinidas', Object);

Mila.Objeto.valoresContenidos = function(objeto) {
  // Describe la lista de valores contenidos en el objeto dado.
    // objeto puede ser cualquier dato.
  return Object.keys(objeto).transformados(x => objeto[x]);
};
Mila.Objeto._Definir_EnPrototipo_('valoresContenidos', Object);

Mila.Objeto.clavesDefinidasYSusTipos = function(objeto) {
  // Describe un objeto cuyas claves son las claves definidas en el objeto dado y sus valores son los tipos de los campos correspondientes a cada clave.
    // objeto puede ser cualquier dato.
  return Mila.Objeto.transformados(objeto, (clave, valor) => valor.tipo());
};
Mila.Objeto._Definir_EnPrototipo_('clavesDefinidasYSusTipos', Object);

Mila.Objeto.conLaClave_YElValor_ = function(objeto, clave, valor) {
  // Describe al objeto dado con la clave dada y el valor dado.
    // objeto puede ser cualquier dato.
    // clave es una cadena de texto correspondiente a la clave que se define.
    // valor puede ser cualquier dato, correspondiente al valor ques se define para la clave.
  return Object.assign({[clave]:valor}, objeto)
};
Mila.Objeto._Definir_EnPrototipo_('conLaClave_YElValor_', Object);

Mila.Objeto.sinLaClave_ = function(objeto, clave) {
  // Describe al objeto dado sin la clave dada.
    // objeto puede ser cualquier dato.
    // clave es una cadena de texto correspondiente a la clave que se quita.
  return Mila.Objeto.clavesDefinidas(objeto).sinLaPrimeraAparicionDe_(clave).fold(
    function(x, rec) {
      rec[x] = objeto[x];
      return rec;
    }, {}
  );
};
Mila.Objeto._Definir_EnPrototipo_('sinLaClave_', Object);

Mila.Objeto.defineLaClave_ = function(objeto, clave) {
  // Indica si el objeto dado tiene definida la clave dada.
    // objeto puede ser cualquier dato.
    // clave es una cadena de texto correspondiente a la clave que se consulta.
  return clave in objeto;
};
Mila.Objeto._Definir_EnPrototipo_('defineLaClave_', Object);

Mila.Objeto.defineLaClave_DeTipo_ = function(objeto, clave, tipo) {
  // Indica si el objeto dado tiene definida la clave dada y su valor es del tipo dado.
    // objeto puede ser cualquier dato.
    // clave es una cadena de texto correspondiente a la clave que se consulta.
    // tipo es un tipo o un identificador de tipo.
  return Mila.Objeto.defineLaClave_(objeto, clave) && objeto[clave].esDeTipo_(tipo);
};
Mila.Objeto._Definir_EnPrototipo_('defineLaClave_DeTipo_', Object);

Mila.Objeto.defineLasClaves_ = function(objeto, claves) {
  // Indica si el objeto dado tiene definidas las claves dadas.
    // objeto puede ser cualquier dato.
    // claves puede ser:
      // una cadena de texto correspondiente a la clave por la que se consulta si está definidas.
      // una lista de cadenas de texto correspondientes a las claves por las que se consulta si están definidas.
      // un objeto cuyas claves son las claves por las que se consulta si están definidas
        // y sus valores son los tipos que se espera que los valores definidos por esa claves tengan.
  return claves.esUnTexto() ? Mila.Objeto.defineLaClave_(objeto, claves)
    : claves.esUnaLista() ? claves.todosCumplen_((clave) => Mila.Objeto.defineLaClave_(objeto, clave))
    : Mila.Objeto.fold(claves, function(clave, valor, rec) {
      return Mila.Objeto.defineLaClave_DeTipo_(objeto, clave, valor) && rec
    }, true)
  ;
};
Mila.Objeto._Definir_EnPrototipo_('defineLasClaves_', Object);

Mila.Objeto.defineSoloLasClaves_ = function(objeto, claves) {
  // Indica si el objeto dado tiene definidas únicamente las claves dadas
    // objeto puede ser cualquier dato.
    // claves puede ser:
      // una cadena de texto correspondiente a la clave por la que se consulta si está definidas.
      // una lista de cadenas de texto correspondientes a las claves por las que se consulta si están definidas.
      // un objeto cuyas claves son las claves por las que se consulta si están definidas
        // y sus valores son los tipos que se espera que los valores definidos por esa claves tengan.
  return Mila.Objeto.defineLasClaves_(objeto, claves) && Mila.Objeto.defineLasClaves_(claves, Mila.Objeto.clavesDefinidas(objeto));
};
Mila.Objeto._Definir_EnPrototipo_('defineSoloLasClaves_', Object);

Mila.Objeto.defineLasMismasClavesQue_ = function(objeto1, objeto2) {
  // Indica si el primer objeto dado tiene definidas las mismas claves que el segundo.
    // Tanto objeto1 como objeto2 pueden ser datos cualesquiera.
  return Mila.Objeto.defineLasClaves_(objeto1, Mila.Objeto.clavesDefinidas(objeto2));
};
Mila.Objeto._Definir_EnPrototipo_('defineLasMismasClavesQue_', Object);

Mila.Objeto.defineLasMismasClavesQue_YConLosMismosTipos = function(objeto1, objeto2) {
  // Indica si el primer objeto dado tiene definidas las mismas claves que el segundo y además coinciden en los tipos de los campos.
    // Tanto objeto1 como objeto2 pueden ser datos cualesquiera.
  return Mila.Objeto.defineLasClaves_(objeto1, Mila.Objeto.clavesDefinidasYSusTipos(objeto2));
};
Mila.Objeto._Definir_EnPrototipo_('defineLasMismasClavesQue_YConLosMismosTipos', Object);

Mila.Objeto.cantidadDeClaves = function(objeto) {
  // Describe la cantidad de calves definidas por el objeto dado.
    // objeto puede ser cualquier dato.
  return Mila.Lista.longitud(Mila.Objeto.clavesDefinidas(objeto));
};
Mila.Objeto._Definir_EnPrototipo_('cantidadDeClaves', Object);

Mila.Objeto.transformados = function(objeto, funcion) {
  // Describe el resultado de aplicarle la función dada a cada valor del objeto dado.
    // objeto puede ser cualquier dato.
    // funcion es una función que toma una cadena de texto (correspondiente a la clave) y un elemento (correspondiente al valor) y devuelve otro elemento.
  return Mila.Objeto.fold(objeto, function(clave, valor, rec) {
    return Mila.Objeto.conLaClave_YElValor_(rec, clave, funcion(clave, valor));
  }, {});
};
Mila.Objeto._Definir_EnPrototipo_('transformados', Object);

Mila.Objeto.todosCumplen_ = function(objeto, condicion) {
  // Indica si todos los pares clave-valor del objeto dado cumplen la condicion dada.
    // objeto puede ser cualquier dato.
    // condicion es una función que toma una cadena de texto (correspondiente a la clave) y un elemento (correspondiente al valor) y devuelve un booleano.
  return Mila.Objeto.fold(objeto, function(clave, valor, rec) { return condicion(clave, valor) && rec; }, true);
};
Mila.Objeto._Definir_EnPrototipo_('todosCumplen_', Object);

Mila.Objeto.fold = function(objeto, funcion, casoBase) {
  // Describe el resultado de la recursión estructural sobre el objeto dado con *casoBase* como caso base y la función dada como caso recursivo.
    // objeto puede ser cualquier dato.
    // funcion es una función que toma una cadena de texto (correspondiente a la clave), un elemento (correspondiente al valor) y el resultado del llamado recursivo y devuelve un nuevo resultado.
    // casoBase puede ser cualquier dato.
  let clavesRestantes = Mila.Objeto.clavesDefinidas(objeto);
  return Mila.Lista.esVacia(clavesRestantes)
    ? casoBase
    : funcion(
      Mila.Lista.primero(clavesRestantes),
      objeto[Mila.Lista.primero(clavesRestantes)],
      Mila.Objeto.fold(Mila.Objeto.sinLaClave_(objeto, Mila.Lista.primero(clavesRestantes)), funcion, casoBase)
    )
  ;
};
Mila.Objeto._Definir_EnPrototipo_('fold', Object);