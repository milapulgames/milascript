# milascript
Repositorio oficial del lenguaje de programación milascript.

## Guía rápida

### Instalación

#### Ejecución local

1. Instalar [Node](https://nodejs.org/).
2. Clonar el repositorio:
    > `git clone https://github.com/milapulgames/milascript.git`
3. Agregar la siguiente línea al archivo `~/.bash_aliases`, reemplazando `<REPO>` por la ruta absoluta al repositorio clonado:
    > `alias mila="node <REPO>/src/mila.js"`

Listo. Ahora se puede ejecutar un archivo de milascript con `mila` seguido del nombre del archivo. Los archivos que se encuentran en la carpeta _scripts_ se pueden ejecutar sin necesidad de pasar la ruta completa al archivo. Es decir, para ejecutar por ejemplo el script _new_, se puede ejecutar simplemente `mila new` en cualquier ubicación.

#### Ejecución en el navegador

1. Clonar el repositorio:
    > `git clone https://github.com/milapulgames/milascript.git`
2. Crear un archivo html con el siguiente contenido (reemplazando `<ARCHIVO>` por el nombre del archivo a cargar y `<REPO>` por la ruta relativa al repositorio clonado):

```html
<html>
  <script type="module" src="<REPO>/src/mila.js"></script>
  <script type="module">
    Mila.Cargar("<ARCHIVO>");
  </script>
</html>
```

3. Levantar un servidor local.

    a) Con Python: `python3 -m http.server`

    b) Con Node: `npx http-server`

4. Abrir en el navagador la url que imprimió el servidor.

### Estructura de un proyecto

Un proyecto milascript puede ser tan simple como un único script (o un archivo html con un único script). Para proyectos más complejos se recomienda la siguiente estructura:

* `src`
    * `milascript` (repositorio como submódulo o enlace suave al repositorio)
    * `otros móudulos milascript` (ídem)
    * `archivos del proyecto`

Si el proyecto está pensado para correr en un navegador, agregar también:

* `build`
    * `milascript` (repositorio como submódulo con https, no son ssh)
    * `otros móudulos milascript` (ídem)

Nota: Al importar proyectos **se asume siempre** que los archivos están en la carpeta _src_.

#### Ejemplos

TODO

### Creación de un proyecto

* Para crear un nuevo proyecto con la estructura sugerida, ejecutar `mila new <RUTA>`, reemplazando `<RUTA>` por la ruta a la carpeta del proyecto. Si es una carpeta que ya existe se inicializa el proyecto en ella. Si es una carpeta que no existe, se crea y luego se inicializa el proyecto adentro. Si no se pasa ningún argumento se usa la carpeta actual.

### Compilación

* Para crear un documento html que importe todos los archivos necesarios, ejecutar `mila build <RUTA>`, reemplazando `<RUTA>` por el archivo principal. Se creará el documento html con el mismo nombre que el archivo original (pero con extensión `.html`) y en la misma ubicación.

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
* `src/error.js`: Módulo Error de milascript.
* `src/lista.js`: Módulo Lista de milascript.
* `src/objeto.js`: Módulo Objeto de milascript.
* `src/test.js`: Módulo Test de milascript.
* `src/texto.js`: Módulo Texto de milascript.
* `src/tipo.js`: Módulo Tipo de milascript.
* `src/tiempo.js`: Módulo Tiempo de milascript.
* `src/geometria.js`: Módulo Geometria de milascript.
* `src/lienzo.js`: Módulo Lienzo de milascript.
* `src/pantalla.js`: Módulo Pantalla de milascript.
---
* `src/test/lista.js`: Tests del módulo Lista de milascript.
* `src/test/objeto.js`: Tests del módulo Objeto de milascript.
* `src/test/texto.js`: Tests del módulo Texto de milascript.
* `src/test/tipo.js`: Tests del módulo Tipo de milascript.
* `src/test/tiempo.js`: Tests del módulo Tiempo de milascript.
* `src/test/geometria.js`: Tests del módulo Geometria de milascript.
---
* `scripts/build.js`: Compilador de milascript, implementado en milascript.

## Proyectos que usan milascript

* milaventuras

* milabloques (...)

* simu_aele (OK)

* pequescript (OK)

* REDA-ar.github.io (OK)