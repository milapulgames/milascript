Mila.Módulo({
  define:"Mila.Función",
  usa:["tipo"]
});

Mila.Función.identidad = function() {
  Mila.Contrato({
    Propósito:[
      "Describe la función identidad",
      Mila.Tipo.Funcion
    ]
  });
  return elemento => elemento;
};

Mila.Función.constante = function(elemento) {
  Mila.Contrato({
    Propósito:[
      "Describe la función constante que devuelve siempre el elemento dado",
      Mila.Tipo.Función
    ],
    Parámetros:[
      [elemento, Mila.Tipo.Cualquiera]
    ]
  });
  return x => elemento;
};