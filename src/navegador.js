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
  return resultado[1]
    .replaceAll("%20", ' ')
    .replaceAll("%C3%A1", 'á')
    .replaceAll("%C3%A9", 'é')
    .replaceAll("%C3%AD", 'í')
    .replaceAll("%C3%B3", 'ó')
    .replaceAll("%C3%BA", 'ú')
    .replaceAll("%C3%81", 'Á')
    .replaceAll("%C3%89", 'É')
    .replaceAll("%C3%8D", 'Í')
    .replaceAll("%C3%93", 'Ó')
    .replaceAll("%C3%9A", 'Ú')
    .replaceAll("%C3%91", 'Ñ')
    .replaceAll("%C3%B1", 'ñ')
  ;
};