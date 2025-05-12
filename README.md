# milascript
Repositorio oficial del lenguaje de programación milascript.

## Guía rápida

### Instalación

#### Ejecución local

1. Instalar [Node](https://nodejs.org/).
2. Clonar el repositorio:
    > `git clone https://github.com/milapulgames/milascript.git`
3. Agregar la siguiente línea al archivo `~/.bash_aliases`, reemplazando `<REPO>` por la ruta absoluta al repositorio cloando:
    > `alias mila="node <REPO>/src/mila.js"`

Listo. Ahora se puede ejecutar un archivo de milascript con `mila` seguido del nombre del archivo.

#### Ejecución en el navegador

1. Crear un archivo html con el siguiente contenido (reemplazando `<ARCHIVO>` por el nombre del archivo a cargar):

```html
<html>
  <script type="module" src="mila.js"></script>
  <script type="module">
    Mila.Cargar("<ARCHIVO>");
  </script>
</html>
```

2. Levantar un servidor local.

    a) Con Python: `python3 -m http.server`

    b) Con Node: `npx http-server`

3. Abrir en el navagador la url que imprimió el servidor.

### Compilación

* Para crear un documento html que importe todos los archivos necesarios, ejecutar `mila scripts/build <RUTA>`, reemplazando `<RUTA>` por el archivo principal. Se creará el documentos html con el mismo nombre que el archivo original (pero con extensión `.html`) y en la misma ubicación.

## Estructura del repositorio

### Directorios

* `src`: Archivos de código fuente.
* `src/test`: Archivos de test de los módulos.
* `scripts`: Archivos para compilar y transpilar el código.

### Archivos

* `src/mila.js`: Intérprete de milascript, implementado en javascript.
* `src/ajustes.js`: Módulo Ajustes de milascript.
* `src/archivo.js`: Módulo Archivo de milascript.
* `src/base.js`: Módulo Base de milascript.
* `src/documentacion.js`: Módulo Documentacion de milascript.
* `src/lista.js`: Módulo Lista de milascript.
* `src/objeto.js`: Módulo Objeto de milascript.
* `src/test.js`: Módulo Test de milascript.
* `src/tipo.js`: Módulo Tipo de milascript.
* `src/tiempo.js`: Módulo Tiempo de milascript.
* `src/geometria.js`: Módulo Geometria de milascript.
* `src/lienzo.js`: Módulo Lienzo de milascript.
* `src/pantalla.js`: Módulo Pantalla de milascript.
---
* `src/test/lista.js`: Tests del módulo Lista de milascript.
* `src/test/objeto.js`: Tests del módulo Objeto de milascript.
* `src/test/tipo.js`: Tests del módulo Tipo de milascript.
* `src/test/tiempo.js`: Tests del módulo Tiempo de milascript.
* `src/test/geometria.js`: Tests del módulo Geometria de milascript.
---
* `scripts/build.js`: Compilador de milascript, implementado en milascript.