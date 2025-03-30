Mila.Modulo({
  define:"Mila.AST",
  usa:["objeto"],
  necesita:["base","tipo","lista","geometria"]
});

Mila.AST.TipoNodoAST = Mila.Tipo.Variante("TipoNodoAST",
  ["Nodo","Token","Identificador",
    "Comando","Expresion",
    "DefinicionProcedimiento","DefinicionFuncion",
    "BloqueComando","Operador",
    "Asignacion"
  ]
);

Mila.Tipo.Registrar({
  nombre:'Cursor',
  es: {
    "linea":Mila.Tipo.Entero,
    "columna":Mila.Tipo.Entero,
  },
  inferible: false
});

Mila.AST.UbicacionNodo = Mila.Tipo.Alias("UbicacionNodo",
  Mila.Tipo.O([Mila.Tipo.Nada, Mila.Tipo.Punto, Mila.Tipo.Cursor])
);

Mila.AST._NodoAST = function NodoAST(id, tipoNodo) {
  this.id = id;
  this.tipoNodo = tipoNodo;
  this.nivel = 0;
  this.apertura = [];
  this.clausura = [];
  this.hijos = {};
  this.campos = {};
};

Mila.Tipo.Registrar({
  nombre: "NodoAST",
  prototipo: Mila.AST._NodoAST,
  strInstancia: (x) => x.id
});

Mila.Tipo.Registrar({
  nombre:'AtributosNodoAST',
  es: {
    "?id":Mila.Tipo.Texto,
    "?tipoNodo":Mila.Tipo.Texto,
    "?hijos":Mila.Tipo.NodoAST,
    "?ubicacion":Mila.Tipo.UbicacionNodo,
    "?campos":Mila.Tipo.Registro
  },
  inferible: false
});

Mila.AST.nuevoNodo = function(atributos={}) {
  let nuevoNodo = new Mila.AST._NodoAST(
    'id' in atributos ? atributos.id : Mila.AST.nuevoIdPara_("Nodo"),
    'tipoNodo' in atributos ? atributos.tipoNodo : Mila.AST.TipoNodoAST.Nodo
  );
  nuevoNodo.CambiarHijosA_('hijos' in atributos ? atributos.hijos : {});
  nuevoNodo.CambiarUbicacionA_('ubicacion' in atributos ? atributos.ubicacion : Mila.Nada);
  nuevoNodo.CambiarCamposA_('campos' in atributos ? atributos.campos : {});
  return nuevoNodo;
};

Mila.AST.nuevoNodoDeTipo_ = function(tipoNodo) {
  return Mila.AST.nuevoNodo({tipoNodo});
};

Mila.AST._NodoAST.prototype.CambiarHijosA_ = function(nuevosHijos) {
  for (let hijoViejo in this.hijos) {
    if (!nuevosHijos.defineLaClave_(hijoViejo)) {
      delete this[hijoViejo];
    }
  }
  for (let hijoNuevo in nuevosHijos) {
    if (!this.hijos.defineLaClave_(hijoNuevo)) {
      this[hijoNuevo] = function() {
        return this.hijos[hijoNuevo];
      }
    }
  }
  this.hijos = nuevosHijos;
  this.NivelarHijos();
};

Mila.AST._NodoAST.prototype.CambiarUbicacionA_ = function(nuevaUbicacion) {
  this.ubicacion = nuevaUbicacion;
};

Mila.AST._NodoAST.prototype.CambiarNivelA_ = function(nuevoNivel) {
  this.nivel = nuevoNivel;
};

Mila.AST._NodoAST.prototype.CambiarCamposA_ = function(nuevosCampos) {
  for (let campoViejo in this.campos) {
    if (!nuevosCampos.defineLaClave_(campoViejo)) {
      delete this[campoViejo];
    }
  }
  for (let campoNuevo in nuevosCampos) {
    if (!this.campos.defineLaClave_(campoNuevo)) {
      this[campoNuevo] = function() {
        return this.campos[campoNuevo];
      }
    }
  }
  this.campos = nuevosCampos;
};

Mila.AST._NodoAST.prototype.NivelarHijos = function() {
  for (let hijo of this.hijos.valoresContenidos()) {
    hijo.CambiarNivelA_(this.nivel + 1);
    hijo.NivelarHijos();
  }
};

Mila.AST._NodoAST.prototype.fold = function(mapaDeFunciones) {
  let clave = this.tipoNodo.aTexto();
  if (!mapaDeFunciones.defineLaClave_(clave)) {
    clave = "Nodo";
  }
  return mapaDeFunciones[clave](this, this.hijos.transformados((clave, valor) => valor.fold(mapaDeFunciones)));
};

// Esto podría reemplazarse por una composición entre transformación a árbol (crear el tipo Arbol) y aTexto:
Mila.AST._NodoAST.prototype.aTextoCompleto = function() {
  const s = function(k) {
    let resultado = "";
    for (let i=0; i<k; i++) {
      resultado += "  ";
    }
    return resultado;
  };
  return this.fold({Nodo:(nodo, hijos) => `${nodo.aTexto()}${hijos.clavesDefinidas().esVacia() ? '' :
    `\n${hijos.clavesDefinidas().transformados(x => `${s(nodo.hijos[x].nivel)}${x}:${hijos[x]}`).join('\n')}`}`});
};

// Esto podría ir en un módulo aparte:
Mila.AST.idActual = {};
Mila.AST.nuevoIdPara_ = function(categoria) {
  if (!Mila.AST.idActual.defineLaClave_(categoria)) {
    Mila.AST.idActual[categoria] = 0;
  }
  Mila.AST.idActual[categoria]++;
  return `_${Mila.AST.idActual[categoria]}`;
};