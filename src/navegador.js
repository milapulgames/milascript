Mila.Modulo({
  define:"Mila.Navegador",
  necesita:["base"]
});

Mila.Navegador.argumentoUrl = function(clave) {
  Mila.Contrato({
    Proposito: [
      "Describe el argumento url correspondiente a la clave dada o Nada si dicha clave no se encuentra",
      Mila.Tipo.O([Mila.Tipo.Texto, Mila.Tipo.Nada])
    ],
    Parametros: [
      [clave, Mila.Tipo.Texto]
    ]
  });
  let resultado = (
    new RegExp(
      "[\\?&]" + (clave.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]")) + "=([^&#]*)"
    )
  ).exec( location.href );
  if (Mila.Tipo.esNada(resultado)) {
    return Mila.Nada;
  }
  return decodeURIComponent(resultado[1]);
};