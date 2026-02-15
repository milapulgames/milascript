Mila.Modulo({usa:['../texto','../test']});

const N = Mila.Nada;

Mila.alIniciar(() => Mila.Test.Evaluar_([
  {i:'let a="";a.longitud();', o:0,                    d:"longitud de un texto vacío devuelve 0"},
  {i:'let a="0";a.longitud();', o:1,                   d:"longitud de un texto con un caracter devuelve 1"},
  {i:'let a="505";a.longitud();', o:3,                 d:"longitud de un texto con tres caracteres devuelve 3"},
  {i:'let a="áÑ¡";a.longitud();', o:3,                 d:"la longitud de un texto no se ve afectada por caracteres especiales"},
  {i:'let a="";a.esVacio();', o:true,                  d:"esVacio de un texto vacío devuelve true"},
  {i:'let a="0";a.esVacio();', o:false,                d:"esVacio de un texto con un caracter devuelve false"},
  {i:'let a="";a.empiezaCon_("");', o:true,            d:"empiezaCon_ de un texto vacío devuelve true con otro texto vacío"},
  {i:'let a="";a.empiezaCon_("a");', o:false,          d:"empiezaCon_ de un texto vacío devuelve false con un texto no vacío"},
  {i:'let a="a";a.empiezaCon_("");', o:true,           d:"empiezaCon_ de un texto no vacío devuelve true con un texto vacío"},
  {i:'let a="a";a.empiezaCon_("a");', o:true,          d:"empiezaCon_ de un texto de un caracter devuelve true con sí mismo"},
  {i:'let a="a";a.empiezaCon_("b");', o:false,         d:"empiezaCon_ de un texto de un caracter devuelve false con otro de texto de un caracter pero que es distinto"},
  {i:'let a="a";a.empiezaCon_("ab");', o:false,        d:"empiezaCon_ de un texto de un caracter devuelve false con un texto más largo (1)"},
  {i:'let a="a";a.empiezaCon_("ba");', o:false,        d:"empiezaCon_ de un texto de un caracter devuelve false con un texto más largo (2)"},
  {i:'let a="ab";a.empiezaCon_("");', o:true,          d:"empiezaCon_ de un texto de dos caracteres devuelve true con un texto vacío"},
  {i:'let a="ab";a.empiezaCon_("a");', o:true,         d:"empiezaCon_ de un texto de dos caracteres devuelve true con su primer caracter"},
  {i:'let a="ab";a.empiezaCon_("b");', o:false,        d:"empiezaCon_ de un texto de dos caracteres devuelve false con su segundo caracter"},
  {i:'let a="ab";a.empiezaCon_("ab");', o:true,        d:"empiezaCon_ de un texto de dos caracteres devuelve true con sí mismo"},
  {i:'let a="";a.terminaCon_("");', o:true,            d:"terminaCon_ de un texto vacío devuelve true con otro texto vacío"},
  {i:'let a="";a.terminaCon_("a");', o:false,          d:"terminaCon_ de un texto vacío devuelve false con un texto no vacío"},
  {i:'let a="a";a.terminaCon_("");', o:true,           d:"terminaCon_ de un texto no vacío devuelve true con un texto vacío"},
  {i:'let a="a";a.terminaCon_("a");', o:true,          d:"terminaCon_ de un texto de un caracter devuelve true con sí mismo"},
  {i:'let a="a";a.terminaCon_("b");', o:false,         d:"terminaCon_ de un texto de un caracter devuelve false con otro de texto de un caracter pero que es distinto"},
  {i:'let a="a";a.terminaCon_("ab");', o:false,        d:"terminaCon_ de un texto de un caracter devuelve false con un texto más largo (1)"},
  {i:'let a="a";a.terminaCon_("ba");', o:false,        d:"terminaCon_ de un texto de un caracter devuelve false con un texto más largo (2)"},
  {i:'let a="ab";a.terminaCon_("");', o:true,          d:"terminaCon_ de un texto de dos caracteres devuelve true con un texto vacío"},
  {i:'let a="ab";a.terminaCon_("b");', o:true,         d:"terminaCon_ de un texto de dos caracteres devuelve true con su segundo caracter"},
  {i:'let a="ab";a.terminaCon_("a");', o:false,        d:"terminaCon_ de un texto de dos caracteres devuelve false con su primer caracter"},
  {i:'let a="ab";a.terminaCon_("ab");', o:true,        d:"terminaCon_ de un texto de dos caracteres devuelve true con sí mismo"},
  // subTextoEntre_Y_
  // subTextoDesde_
  // subTextoHasta_
  // sinLosPrimeros_
  // sinLosUltimos_
  // contieneA_
  // esSubcadenaDe_
  // primeraApariciónDe_
  // primeraApariciónDe_Desde_
  // primeraApariciónDe_NoEscapeadaCon_
  {i:'let a="abc";a.primeraApariciónDe_Desde_NoEscapeadaCon_("b",1,"-b");', o:2,        d:""},
  {i:'let a="abc";a.primeraApariciónDe_Desde_NoEscapeadaCon_("b",2,"-b");', o:2,        d:""},
  {i:'let a="abc";a.primeraApariciónDe_Desde_NoEscapeadaCon_("b",3,"-b");', o:N,        d:""},
  {i:'let a="a-ba";a.primeraApariciónDe_Desde_NoEscapeadaCon_("b",1,"-b");', o:N,       d:""},
  {i:'let a="a-bab";a.primeraApariciónDe_Desde_NoEscapeadaCon_("b",1,"-b");', o:5,      d:""},
  {i:'let a="a|b";a.primeraApariciónDe_Desde_NoEscapeadaCon_("|",1,"||");', o:2,        d:""},
  {i:'let a="a||b";a.primeraApariciónDe_Desde_NoEscapeadaCon_("|",1,"||");', o:N,       d:""},
  {i:'let a="a{w}b";a.aplicandoReemplazosCon_({\
    indicadorInicioAgujero:"{",\
    escapeInicioAgujero:"{{",\
    indicadorFinAgujero:"}",\
    escapeFinAgujero:"}}",\
    mapaReemplazos:(x) => ""\
  });', o:"ab",                                                                         d:""},
  {i:'let a="a{{w}}b";a.aplicandoReemplazosCon_({\
    indicadorInicioAgujero:"{",\
    escapeInicioAgujero:"{{",\
    indicadorFinAgujero:"}",\
    escapeFinAgujero:"}}",\
    mapaReemplazos:(x) => ""\
  });', o:"a{w}b",                                                                      d:""},
  {i:'let a="{{a{w}}q}b";a.aplicandoReemplazosCon_({\
    indicadorInicioAgujero:"{",\
    escapeInicioAgujero:"{{",\
    indicadorFinAgujero:"}",\
    escapeFinAgujero:"}}",\
    mapaReemplazos:(x) => ""\
  });', o:"{ab",                                                                        d:""},
  {i:'let a="a|w|b";a.aplicandoReemplazosCon_({\
    indicadorInicioAgujero:"|",\
    escapeInicioAgujero:"||",\
    indicadorFinAgujero:"|",\
    escapeFinAgujero:"||",\
    mapaReemplazos:(x) => ""\
  });', o:"ab",                                                                         d:""},
  {i:'let a="a||w||b";a.aplicandoReemplazosCon_({\
    indicadorInicioAgujero:"|",\
    escapeInicioAgujero:"||",\
    indicadorFinAgujero:"|",\
    escapeFinAgujero:"||",\
    mapaReemplazos:(x) => ""\
  });', o:"a|w|b",                                                                      d:""},
  {i:'let a="||a|w||q|b";a.aplicandoReemplazosCon_({\
    indicadorInicioAgujero:"|",\
    escapeInicioAgujero:"||",\
    indicadorFinAgujero:"|",\
    escapeFinAgujero:"||",\
    mapaReemplazos:(x) => ""\
  });', o:"|ab",                                                                        d:""}
]));