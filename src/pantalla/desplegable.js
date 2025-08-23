Mila.Modulo({
  necesita:["../base"]
});

Mila.Tipo.Registrar({
  nombre:'Desplegable',
  es:{
    Desplegar:Mila.Tipo.Funcion,
    Plegar:Mila.Tipo.Funcion,
    desplegado:Mila.Tipo.Funcion
  }
});

Mila.Pantalla.desplegableAPartirDe_ = function(contenedor, funcionDeContenido) {
  Mila.Contrato({
    Proposito: [
      "Describir al contenedor dado tras convertirlo en un desplegable con el contenido generado por la función dada",
      Mila.Tipo.Desplegable
    ],
    Precondiciones:[
      "El primer parámetro es un contenedor (sabe responder al mensaje CambiarElementosA_)",
      contenedor.sabeResponder_('CambiarElementosA_')
    ],
    Parametros: [
      [contenedor, Mila.Tipo.ElementoVisual],
      [funcionDeContenido, Mila.Tipo.Funcion]
      // [contenido, Mila.Tipo.O([
      //   Mila.Tipo.ElementoVisual,
      //   Mila.Tipo.ListaDe_(Mila.Tipo.ElementoVisual)
      // ])]
    ]
  });
  contenedor._desplagado = false;
  contenedor.Desplegar = function() {
    if (this._desplagado) { return; }
    contenedor.CambiarElementosA_(funcionDeContenido());
    this._desplagado = true;
  };
  contenedor.Plegar = function() {
    if (!this._desplagado) { return; }
    contenedor.CambiarElementosA_([]);
    this._desplagado = false;
  };
  contenedor.desplegado = function() {
    return this._desplagado;
  };
  return contenedor;
};
