Mila.Módulo({
  necesita:["../base"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosDesplegable',
  es: {
    // El elmento visual a convertir en desplegable.
    "elementoVisual":Mila.Tipo.ElementoVisual,
    // ¿Inicia desplegado? Por defecto, no.
    "?desplegado":Mila.Tipo.Booleano,
    // Función a ejecutar la primera vez que se despliega.
    "?PrimerDespliegue":Mila.Tipo.Funcion,
    // Función a ejecutar cada vez que se despliega.
    "?Desplegar":Mila.Tipo.Funcion,
    // Función a ejecutar cada vez que se pliega.
    "?Plegar":Mila.Tipo.Funcion
  },
  inferible: false
});

Mila.Tipo.Registrar({
  nombre:'Desplegable',
  es:{
    Desplegar:Mila.Tipo.Funcion,
    Plegar:Mila.Tipo.Funcion,
    desplegado:Mila.Tipo.Funcion
  }
});

Mila.Pantalla.desplegableAPartirDe_ = function(atributos) {
  Mila.Contrato({
    Proposito: [
      "Describir al un nuevo desplegable a partir de los atributos dados.",
      Mila.Tipo.Desplegable
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosDesplegable]
    ]
  });
  const elementoVisual = atributos.elementoVisual;
  elementoVisual._desplegado = ('desplegado' in atributos) && atributos.desplegado;
  let primerDespliegue = Mila.Nada;
  if (elementoVisual._desplegado) {
    if ('PrimerDespliegue' in atributos) {
      atributos.PrimerDespliegue();
    }
  } else {
    elementoVisual.Ocultar();
    if ('PrimerDespliegue' in atributos) {
      primerDespliegue = atributos.PrimerDespliegue;
    }
  }
  const Deplegar = function() {
    if (elementoVisual._desplegado) { return; }
    elementoVisual.Mostrar();
    elementoVisual._desplegado = true;
    Mila.Pantalla._SolicitarRedimensión();
  };
  const Plegar = function() {
    if (!elementoVisual._desplegado) { return; }
    elementoVisual.Ocultar();
    elementoVisual._desplegado = false;
    Mila.Pantalla._SolicitarRedimensión();
  };
  elementoVisual.desplegado = function() {
    return elementoVisual._desplegado;
  };
  elementoVisual.Desplegar = ('Desplegar' in atributos)
    ? function() {
      atributos.Desplegar();
      Deplegar();
    }
    : Deplegar
  ;
  if (primerDespliegue.esAlgo()) {
    const despliegueNormal = elementoVisual.Desplegar;
    elementoVisual.Desplegar = function() {
      primerDespliegue();
      despliegueNormal();
      elementoVisual.Desplegar = despliegueNormal;
    };
  }
  elementoVisual.Plegar = ('Plegar' in atributos)
    ? function() {
      atributos.Plegar();
      Plegar();
    }
    : Plegar
  ;
  return elementoVisual;
};
