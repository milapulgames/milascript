Mila.Modulo({usa:['../tipo','../test']});

Mila.alIniciar(() => {
  Mila.Test.Evaluar_([
  {i:"Mila.Tipo.esNada(Mila.Nada)", o:true,                           d:"esNada devuelve true con un Nada (1)"},
  {i:"Mila.Nada.esNada()", o:true,                                    d:"esNada devuelve true con un Nada (2)"},
  {i:"Mila.Tipo.esNada(null)", o:true,                                d:"esNada devuelve true con un null"},
  {i:"Mila.Tipo.esNada(undefined)", o:true,                           d:"esNada devuelve true con un undefined"},
  {i:"Mila.Tipo.esNada(NaN)", o:true,                                 d:"esNada devuelve true con un NaN (1)"},
  {i:"(NaN).esNada()", o:true,                                        d:"esNada devuelve true con un NaN (2)"},
  {i:"(2).esNada()", o:false,                                         d:"esNada devuelve false con un número"},
  {i:"(true).esNada()", o:false,                                      d:"esNada devuelve false con un booleano"},
  {i:"('hola').esNada()", o:false,                                    d:"esNada devuelve false con un texto"},
  {i:"(x=>true).esNada()", o:false,                                   d:"esNada devuelve false con una función"},
  {i:"({}).esNada()", o:false,                                        d:"esNada devuelve false con un objeto"},
  {i:"([]).esNada()", o:false,                                        d:"esNada devuelve false con una lista"},
  {i:"(Mila.Tipo.Booleano).esNada()", o:false,                        d:"esNada devuelve false con un tipo"},
  {i:"Mila.Tipo.esAlgo(Mila.Nada)", o:false,                          d:"esAlgo devuelve false con un Nada (1)"},
  {i:"Mila.Nada.esAlgo()", o:false,                                   d:"esAlgo devuelve false con un Nada (2)"},
  {i:"Mila.Tipo.esAlgo(null)", o:false,                               d:"esAlgo devuelve false con un null"},
  {i:"Mila.Tipo.esAlgo(undefined)", o:false,                          d:"esAlgo devuelve false con un undefined"},
  {i:"Mila.Tipo.esAlgo(NaN)", o:false,                                d:"esAlgo devuelve false con un NaN (1)"},
  {i:"(NaN).esAlgo()", o:false,                                       d:"esAlgo devuelve false con un NaN (2)"},
  {i:"(2).esAlgo()", o:true,                                          d:"esAlgo devuelve true con un número"},
  {i:"(true).esAlgo()", o:true,                                       d:"esAlgo devuelve true con un booleano"},
  {i:"('hola').esAlgo()", o:true,                                     d:"esAlgo devuelve true con un texto"},
  {i:"(x=>true).esAlgo()", o:true,                                    d:"esAlgo devuelve true con una función"},
  {i:"({}).esAlgo()", o:true,                                         d:"esAlgo devuelve true con un objeto"},
  {i:"([]).esAlgo()", o:true,                                         d:"esAlgo devuelve true con una lista"},
  {i:"(Mila.Tipo.Booleano).esAlgo()", o:true,                         d:"esAlgo devuelve true con un tipo"},
  {i:"(Mila.Nada).tipo()", o:Mila.Tipo.Nada,                          d:"tipo devuelve el tipo Nada con Nada"},
  {i:"Mila.Tipo.tipo(null)", o:Mila.Tipo.Nada,                        d:"tipo devuelve el tipo Nada con null"},
  {i:"Mila.Tipo.tipo(undefined)", o:Mila.Tipo.Nada,                   d:"tipo devuelve el tipo Nada con undefined"},
  {i:"(NaN).tipo()", o:Mila.Tipo.Nada,                                d:"tipo devuelve el tipo Nada con NaN"},
  {i:"(true).tipo()", o:Mila.Tipo.Booleano,                           d:"tipo devuelve el tipo Booleano con un booleano"},
  {i:"('hola').tipo()", o:Mila.Tipo.Texto,                            d:"tipo devuelve el tipo Texto con un texto"},
  {i:"(x=>true).tipo()", o:Mila.Tipo.Funcion,                         d:"tipo devuelve el tipo Funcion con una función"},
  {i:"({}).tipo()", o:Mila.Tipo.Registro,                             d:"tipo devuelve el tipo Registro con un objeto"},
  {i:"(Mila.Tipo.Booleano).tipo()", o:Mila.Tipo.Tipo,                 d:"tipo devuelve el tipo Tipo con un tipo"},
  {i:"(Mila.Nada).esUnTipo()", o:false,                               d:"esUnTipo devuelve false con Nada"},
  {i:"Mila.Tipo.esUnTipo(null)", o:false,                             d:"esUnTipo devuelve false con null"},
  {i:"Mila.Tipo.esUnTipo(undefined)", o:false,                        d:"esUnTipo devuelve false con undefined"},
  {i:"(NaN).esUnTipo()", o:false,                                     d:"esUnTipo devuelve false con NaN"},
  {i:"(2).esUnTipo()", o:false,                                       d:"esUnTipo devuelve false con un número"},
  {i:"(true).esUnTipo()", o:false,                                    d:"esUnTipo devuelve false con un booleano"},
  {i:"('hola').esUnTipo()", o:false,                                  d:"esUnTipo devuelve false con un texto"},
  {i:"(x=>true).esUnTipo()", o:false,                                 d:"esUnTipo devuelve false con una función"},
  {i:"({}).esUnTipo()", o:false,                                      d:"esUnTipo devuelve false con un objeto"},
  {i:"([]).esUnTipo()", o:false,                                      d:"esUnTipo devuelve false con una lista"},
  {i:"(Mila.Tipo.Booleano).esUnTipo()", o:true,                       d:"esUnTipo devuelve true con un tipo"},
  {i:"('Booleano').esElIdentificadorDeUnTipo()", o:true,              d:"esElIdentificadorDeUnTipo devuelve true con un identificador de tipo"},
  {i:"(Mila.Tipo.Booleano).esElIdentificadorDeUnTipo()", o:false,     d:"esElIdentificadorDeUnTipo devuelve false con un tipo"},
  {i:"(true).esElIdentificadorDeUnTipo()", o:false,                   d:"esElIdentificadorDeUnTipo devuelve false con un dato que ni siquiera es un texto"},
  {i:"(true).esDeTipo_('Booleano')", o:true,                          d:"esDeTipo_ devuelve true al pasar el tipo correcto como texto"},
  {i:"(true).esDeTipo_(Mila.Tipo.Booleano)", o:true,                  d:"esDeTipo_ devuelve true al pasar el tipo correcto como tipo"},
  {i:"(2).esDeTipo_(Mila.Tipo.Booleano)", o:false,                    d:"esDeTipo_ devuelve false al pasar el tipo incorrecto (1)"},
  {i:"(true).esDeTipo_(Mila.Tipo.Numero)", o:false,                   d:"esDeTipo_ devuelve false al pasar el tipo incorrecto (2)"},
  {i:"(true).aTexto()", o:"Cierto",                                   d:"aTexto devuelve 'Cierto' con true"},
  {i:"(false).aTexto()", o:"Falso",                                   d:"aTexto devuelve 'Falso' con false"},
  {i:"(2).tipo()", o:Mila.Tipo.Entero,                                d:"tipo devuelve el tipo Entero con un entero"},
  {i:"(1.5).tipo()", o:Mila.Tipo.Numero,                              d:"tipo devuelve el tipo Numero con un flotante"},
  {i:"(Infinity).tipo()", o:Mila.Tipo.Numero,                         d:"tipo devuelve el tipo Numero con infinito"},
  {i:"(2).esDeTipo_('Numero')", o:true,                               d:"esDeTipo_ devuelve true al pasar el tipo correcto como texto aunque sea un supertipo"},
  {i:"(2).esDeTipo_(Mila.Tipo.Numero)", o:true,                       d:"esDeTipo_ devuelve true al pasar el tipo correcto como tipo aunque sea un supertipo"},
  {i:"(2).esDeTipo_('Entero')", o:true,                               d:"esDeTipo_ devuelve true al pasar el tipo correcto como texto en el caso del subtipo"},
  {i:"(2).esDeTipo_(Mila.Tipo.Entero)", o:true,                       d:"esDeTipo_ devuelve true al pasar el tipo correcto como tipo en el caso del subtipo"},
  {i:"(2).esUnNumero()", o:true,                                      d:"esUnNumero devuelve true con un número entero"},
  {i:"(2.5).esUnNumero()", o:true,                                    d:"esUnNumero devuelve true con un número decimal"},
  {i:"(2).esUnEntero()", o:true,                                      d:"esUnEntero devuelve true con un número entero"},
  {i:"(2.5).esUnEntero()", o:false,                                   d:"esUnEntero devuelve false con un número decimal"}
  ]);

  Mila.Tipo.Registrar({
    nombre:'Vehiculo',
    es: function esUnVehiculo(elemento) { return 'puertas' in elemento && 'ruedas' in elemento; },
    strTipo: "Vehículo",
    strInstancia: (elemento) => `Vehículo de ${elemento.puertas} puertas y ${elemento.ruedas} ruedas`
  });
  Mila.Tipo.Registrar({
    nombre:'Avion',
    subtipoDe: 'Vehiculo',
    es: function esUnAvion(elemento) { return 'alas' in elemento; },
    strTipo: "Avión",
    strInstancia: (elemento) => `Avión de ${elemento.alas} alas, ${elemento.puertas} puertas y ${elemento.ruedas} ruedas`
  });

  const v = "{puertas:2,ruedas:4}"; // Vehículo correcto
  const a = "{alas:3,puertas:1,ruedas:2}"; // Avión correcto
  const vMas = "{puertas:2,ruedas:4,asientos:1}"; // Vehículo correcto (y con campos adicionales)
  const noV = "{puertas:2,asientos:1}"; // Vehículo incorrecto (falta el campo 'ruedas')
  const noA = "{alas:3,puertas:1,asientos:4}"; // Avión incorrecto (falta el campo 'ruedas')

  Mila.Test.Evaluar_([
  {i:`let a=${v};Mila.Tipo.Vehiculo.es(a)`, o:true,                   d:"La función es de un tipo sin prototipo devuelve true (1)"},
  {i:`let a=${v};a.esUnVehiculo()`, o:true,                           d:"La función es de un tipo sin prototipo devuelve true (2)"},
  {i:`let a=${v};a.esDeTipo_("Vehiculo")`, o:true,                    d:"La función esDeTipo_ de un tipo sin prototipo devuelve true"},
  {i:`let a=${noV};Mila.Tipo.Vehiculo.es(a)`, o:false,                d:"La función es de un tipo sin prototipo devuelve false (1)"},
  {i:`let a=${noV};a.esUnVehiculo()`, o:false,                        d:"La función es de un tipo sin prototipo devuelve false (2)"},
  {i:`let a=${noV};a.esDeTipo_("Vehiculo")`, o:false,                 d:"La función esDeTipo_ de un tipo sin prototipo devuelve false"},
  {i:`let a=${vMas};Mila.Tipo.Vehiculo.es(a)`, o:true,                d:"La función es de un tipo sin prototipo devuelve true aunque sobren campos (1)"},
  {i:`let a=${vMas};a.esUnVehiculo()`, o:true,                        d:"La función es de un tipo sin prototipo devuelve true aunque sobren campos (2)"},
  {i:`let a=${vMas};a.esDeTipo_("Vehiculo")`, o:true,                 d:"La función esDeTipo_ de un tipo sin prototipo devuelve true aunque sobren campos"},
  {i:`let a=${a};Mila.Tipo.Vehiculo.es(a)`, o:true,                   d:"La función es de un tipo sin prototipo devuelve true con un subtipo (1)"},
  {i:`let a=${a};a.esUnVehiculo()`, o:true,                           d:"La función es de un tipo sin prototipo devuelve true con un subtipo (2)"},
  {i:`let a=${a};a.esDeTipo_("Vehiculo")`, o:true,                    d:"La función esDeTipo_ de un tipo sin prototipo devuelve true con un subtipo"},
  {i:`let a=${v};a.tipo()`, o:Mila.Tipo.Vehiculo,                     d:"La función tipo de un tipo sin prototipo devuelve el tipo correcto"},
  {i:`let a=${a};Mila.Tipo.Avion.es(a)`, o:true,                      d:"La función es de un subtipo sin prototipo devuelve true (1)"},
  {i:`let a=${a};a.esUnAvion()`, o:true,                              d:"La función es de un subtipo sin prototipo devuelve true (2)"},
  {i:`let a=${a};a.esDeTipo_("Avion")`, o:true,                       d:"La función esDeTipo_ de un subtipo sin prototipo devuelve true"},
  {i:`let a=${noA};Mila.Tipo.Avion.es(a)`, o:false,                   d:"La función es de un subtipo sin prototipo devuelve false (1)"},
  {i:`let a=${noA};a.esUnAvion()`, o:false,                           d:"La función es de un subtipo sin prototipo devuelve false (2)"},
  {i:`let a=${noA};a.esDeTipo_("Avion")`, o:false,                    d:"La función esDeTipo_ de un subtipo sin prototipo devuelve false"},
  {i:`let a=${a};a.tipo()`, o:Mila.Tipo.Avion,                        d:"La función tipo de un subtipo sin prototipo devuelve el tipo correcto"},
  {i:`let a=${v};Mila.Tipo.Avion.es(a)`, o:false,                     d:"La función es de un subtipo sin prototipo devuelve false con el supertipo (1)"},
  {i:`let a=${v};a.esUnAvion()`, o:false,                             d:"La función es de un subtipo sin prototipo devuelve false con el supertipo (2)"},
  {i:`let a=${v};a.esDeTipo_("Avion")`, o:false,                      d:"La función esDeTipo_ de un subtipo sin prototipo devuelve false con el supertipo"}
  ]);

  const Numero = "Mila.Tipo.Numero";
  const Entero = "Mila.Tipo.Entero";
  const Booleano = "Mila.Tipo.Booleano";
  const Vehiculo = "Mila.Tipo.Vehiculo";
  const Avion = "Mila.Tipo.Avion";

  Mila.Test.Evaluar_([
  {i:`Mila.Tipo.unificaCon_(${Numero},${Entero})`, o:true,                      d:"Los tipos Numero y Entero unifican entre sí (1)"},
  {i:`Mila.Tipo.unificaCon_(${Entero},${Numero})`, o:true,                      d:"Los tipos Numero y Entero unifican entre sí (2)"},
  {i:`${Entero}.unificaCon_(${Numero})`, o:true,                                d:"Los tipos Numero y Entero unifican entre sí (3)"},
  {i:`${Numero}.unificaCon_(${Entero})`, o:true,                                d:"Los tipos Numero y Entero unifican entre sí (4)"},
  {i:`Mila.Tipo.unificaCon_(${Numero},${Booleano})`, o:false,                   d:"Los tipos Numero y Booleano no unifican entre sí (1)"},
  {i:`Mila.Tipo.unificaCon_(${Booleano},${Numero})`, o:false,                   d:"Los tipos Numero y Booleano no unifican entre sí (2)"},
  {i:`${Booleano}.unificaCon_(${Numero})`, o:false,                             d:"Los tipos Numero y Booleano no unifican entre sí (3)"},
  {i:`${Numero}.unificaCon_(${Booleano})`, o:false,                             d:"Los tipos Numero y Booleano no unifican entre sí (4)"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Booleano},${Booleano})`, oX:Booleano,   d:"La unificación de Booleano con sigo mismo es Booleano"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Numero},${Numero})`, oX:Numero,         d:"La unificación de Numero con sigo mismo es Numero"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Entero},${Entero})`, oX:Entero,         d:"La unificación de Entero con sigo mismo es Entero"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Entero},${Numero})`, oX:Numero,         d:"La unificación entre Numero y Entero es Numero (1)"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Numero},${Entero})`, oX:Numero,         d:"La unificación entre Numero y Entero es Numero (2)"},
  {i:`Mila.Tipo.unificaCon_(${Vehiculo},${Avion})`, o:true,                     d:"Los tipos Vehiculo y Avion unifican entre sí (1)"},
  {i:`Mila.Tipo.unificaCon_(${Avion},${Vehiculo})`, o:true,                     d:"Los tipos Vehiculo y Avion unifican entre sí (2)"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Vehiculo},${Vehiculo})`, oX:Vehiculo,   d:"La unificación de Vehiculo con sigo mismo es Vehiculo"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Avion},${Avion})`, oX:Avion,            d:"La unificación de Avion con sigo mismo es Avion"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Vehiculo},${Avion})`, oX:Vehiculo,      d:"La unificación entre Vehiculo y Avion es Numero (1)"},
  {i:`Mila.Tipo.tipoUnificadoEntre_Y_(${Avion},${Vehiculo})`, oX:Vehiculo,      d:"La unificación entre Vehiculo y Avion es Numero (2)"}
  ]);
});