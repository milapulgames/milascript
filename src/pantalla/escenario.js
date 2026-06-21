Mila.Módulo({
  define:"Mila.Pantalla.Escenario",
  necesita:["../tipo","../pantalla","../cámara","../escena"],
  usa:["../lienzo","../lista"]
});

Mila.Tipo.Registrar({
  nombre:'AtributosEscenario',
  es: {
    "escena":Mila.Tipo.Escena,
    "cámara":Mila.Tipo.Cámara
  },
  subtipoDe: "AtributosElementoVisual",
  inferible: false
});

Mila.Pantalla.nuevoEscenario = function(atributos={}) {
  Mila.Contrato({
    Proposito: [
      "Describir un nuevo escenario a partir de los atributos dados.",
      Mila.Tipo.Escenario
    ],
    Parametros: [
      [atributos, Mila.Tipo.AtributosEscenario]
    ]
  });
  let nuevoEscenario = new Mila.Pantalla._Escenario();
  nuevoEscenario.Inicializar(atributos, {
    ancho:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    alto:Mila.Pantalla.ComportamientoEspacio.Maximizar,
    grosorBorde:1, colorBorde:"#000"
  });
  nuevoEscenario.CambiarEscenaA_(atributos.escena);
  nuevoEscenario.CambiarCámaraA_(atributos.cámara);
  nuevoEscenario._lienzo = Mila.Lienzo.nuevo();
  return nuevoEscenario;
};

Mila.Pantalla._Escenario = function Escenario() {};
Object.setPrototypeOf(Mila.Pantalla._Escenario.prototype, Mila.Pantalla._ElementoVisual.prototype);

Mila.Pantalla._Escenario.prototype.CambiarEscenaA_ = function(nuevaEscena) {
  Mila.Contrato({
    Proposito: "Reemplazar la escena de a este escenario por la dada.",
    Parametros: [
      [nuevaEscena, Mila.Tipo.Escena]
    ]
  });
  this._escena = nuevaEscena;
};

Mila.Pantalla._Escenario.prototype.CambiarCámaraA_ = function(nuevaCámara) {
  Mila.Contrato({
    Proposito: "Reemplazar la cámara de a este escenario por la dada.",
    Parametros: [
      [nuevaCámara, Mila.Tipo.Cámara]
    ]
  });
  this._cámara = nuevaCámara;
};

Mila.Pantalla._Escenario.prototype.MoverCámara__ = function(movimientoEnX, movimientoEnY) {
  Mila.Contrato({
    Proposito: "Mover la cámara de este escenario según los movimientos dados en cada eje.",
    Parametros: [
      [movimientoEnX, Mila.Tipo.Numero],
      [movimientoEnY, Mila.Tipo.Numero]
    ]
  });
  this._cámara.Mover__(movimientoEnX, movimientoEnY);
  this._Refrescar();
};

Mila.Pantalla._Escenario.prototype.ZoomearCámaraEn_ = function(factor) {
  Mila.Contrato({
    Proposito: "Zoomear la cámara de este escenario en el factor dado.",
    Parametros: [
      [factor, Mila.Tipo.Numero]
    ]
  });
  this._cámara.ZoomearEn_(factor);
  this._Refrescar();
};

Mila.Pantalla._Escenario.prototype._Refrescar = function() {
  Mila.Contrato({
    Proposito: "Refrescar este escenario."
  });
  const cámara = this._cámara;
  this._lienzo.CambiarContenidoA_(this._escena.contenido().transformados(
    elemento => {
      const elementoADibujar = elemento.copia();
      if (elementoADibujar.defineLaClave_('x')) {
        elementoADibujar.x -= cámara.posición().x;
        elementoADibujar.x *= cámara.zoom()/100;
      }
      if (elementoADibujar.defineLaClave_('y')) {
        elementoADibujar.y -= cámara.posición().y;
        elementoADibujar.y *= cámara.zoom()/100;
      }
      if (elementoADibujar.esDibujable()) {
        Mila.Lienzo.EscalarDibujable_En_(elementoADibujar, cámara.zoom()/100);
      }
      return elementoADibujar;
    }
  ));
  this._lienzo.Dibujar();
};

Mila.Pantalla._Escenario.prototype.Redimensionar = function(rectánguloCompleto) {
  Mila.Contrato({
    Propósito: [
      "Redimensionar este escenario para que entre en el rectángulo dado.\
        Devuelve el rectángulo ocupado tras redimensionar.",
      Mila.Tipo.Rectángulo
    ],
    Parámetros: [
      [rectánguloCompleto, Mila.Tipo.Rectángulo]
    ]
  });
  return this._lienzo.Redimensionar(rectánguloCompleto);
};

Mila.Pantalla._Escenario.prototype.PlasmarEnHtml = function(nodoMadre) {
  Mila.Contrato({
    Proposito: "Plasmar este escenario en el documento html como hijo del nodo dado.",
    Precondiciones: [
      "Se está ejecutando en el navegador.",
      Mila.entorno().enNavegador()
    ],
    Parametros: [
      nodoMadre // Tipo nodo dom
    ]
  });
  this._lienzo.PlasmarEnHtml(nodoMadre);
  this._Refrescar();
};

Mila.Pantalla._Escenario.prototype.QuitarDelHtml = function() {
  Mila.Contrato({
    Proposito: "Quitar este escenario del documento html.",
    Precondiciones: [
      "Se está ejecutando en el navegador.",
      Mila.entorno().enNavegador()
    ]
  });
  this._lienzo.QuitarDelHtml();
};

Mila.Tipo.Registrar({
  nombre:'Escenario',
  prototipo: Mila.Pantalla._Escenario,
  subtipoDe: Mila.Tipo.ElementoVisual
});