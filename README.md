# milascript
Repositorio oficial del lenguaje de programación milascript.

## Guía rápida

### Instalación

#### Ejecución local

1. Instalar [Node](https://nodejs.org/).
2. Clonar el repositorio.

    a) Con ssh: `git@github.com:milapulgames/milascript.git`

    b) Con https: `git clone https://github.com/milapulgames/milascript.git`
3. Agregar la siguiente línea al archivo `~/.bash_aliases`, reemplazando `<REPO>` por la ruta absoluta al repositorio clonado:
    > `alias mila="node <REPO>/src/mila.mjs"`

Listo. Ahora se puede ejecutar un archivo de milascript con `mila` seguido del nombre del archivo. Los archivos que se encuentran en la carpeta _scripts_ se pueden ejecutar sin necesidad de pasar la ruta completa al archivo. Es decir, para ejecutar por ejemplo el script _build_, se puede ejecutar simplemente `mila build` en cualquier ubicación.

#### Ejecución en el navegador

1. Clonar el repositorio.

    a) Con ssh: `git@github.com:milapulgames/milascript.git`

    b) Con https: `git clone https://github.com/milapulgames/milascript.git`
2. Crear un archivo html con el siguiente contenido (reemplazando `<ARCHIVO>` por el nombre del archivo a cargar y `<REPO>` por la ruta relativa al repositorio clonado):

```html
<html>
  <script type="module" src="<REPO>/src/mila.mjs"></script>
  <script type="module">
    Mila.Cargar("<ARCHIVO>");
  </script>
</html>
```

3. Levantar un servidor local.

    a) Con Python: `python3 -m http.server`

    b) Con Node: `npx http-server`
4. Abrir en el navagador la url que imprimió el servidor.

### Mi primer script de milascript

Un proyecto milascript puede ser tan simple como un único script (o un archivo html con un único script). El ejemplo más sencillo consiste en crear un script en la misma carpeta de milascript para hacer pruebas.

1. Crear el archivo `test.js` con el siguiente contenido:

```js
Mila.Módulo({});

console.log("Hola mundo!");
```

2. Ejecutarlo con `mila test`.

3. Compilarlo como un proyecto web con `mila build mila:src test`.

    > El argumento `mila:src` es para indicarle al compilador que busque los fuentes en la carpeta `src` (por defecto los busca en `milascript/src` ya que la idea es tener la carpeta `milascript` como submódulo de todo proyecto milascript).

4. Levantar un servidor (ya sea con Python o con Node) y accederlo a través del navegador.

### Importar módulos milascript

Aunque sea un único script, todo proyecto debe comenzar con la invocación a `Mila.Módulo`. El argumento es un objeto que puede tener los siguientes campos:

 * `define`: El nombre del módulo que se define en este archivo.

 * `usa`: Una lista con las rutas relativas a los archivos de los módulos que se usan (los módulos a importar por este).

 * `necesita`: Una lista con las rutas relativas a los archivos de los módulos que se necesitan (aquellos que deben estar cargados antes de cargar este).

La diferencia entre `usa` y `necesita` radica en si se hacen referencias al módulo durante la inicialización (en cuyo caso se necesita) o únicamente dentro de las funciones y procedimientos (entonces se usa pero no es necesario que se cargue antes). Es recomendable minimizar la cantidad de módulos necesarios para reducir la posibilidad de definir una dependencia circular. Una forma fácil de evitarlo es ejecutar la mayor parte del código del módulo durante la *inicialización* del proyecto, que ocurre una vez que se cargaron todos los archivos. Para ello, se debe invocar a `Mila.alIniciar` pasándole como argumento la función de inicialización del módulo. A continuación se muestra un ejemplo que utilizar el módulo `Mila.Pantalla.Etiqueta` para mostrar una etiqueta en la ventana del navegador.

```js
Mila.Módulo({
  usa:['src/pantalla/etiqueta']
});

Mila.alIniciar(() => {
  Mila.Pantalla.nueva({
    elementos:[Mila.Pantalla.nuevaEtiqueta({
      texto:"Hola mundo!"
    })]
  });
});
```

### Estructura de un proyecto

Para proyectos más complejos se recomienda la siguiente estructura:

* `src`
    * `milascript` (repositorio como submódulo o enlace suave al repositorio)
    * `otros móudulos milascript` (ídem)
    * `archivos del proyecto`

Si el proyecto está pensado para correr en un navegador, agregar también:

* `build`
    * `milascript` (repositorio como submódulo con https, no son ssh)
    * `otros móudulos milascript` (ídem)

Nota: Al importar proyectos **se asume siempre** que los archivos están en la carpeta _src_.

Para hacer referencia a archivos en otros módulos en las rutas de los campos `usa` y `necesita` del archivo de configuración se debe utilizar el símbolo `$` seguido del nombre del módulo. Por ejemplo, para importar el módulo `Mila.Pantalla.Etiqueta` (cuyo archivo se encuentra en `src/pantalla/etiqueta.js`) se debe utilizar la ruta `$milascript/pantalla/etiqueta`. Esto también funciona para cargar módulos invocando a `Mila.Cargar`.

#### Ejemplos

# TODO

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

* `src/mila.mjs`: Intérprete de milascript, implementado en javascript.
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
* `scripts/interact.js`: Intérprete interactivo de milascript, implementado en milascript.

## Proyectos que usan milascript

* milaventuras (FALLA EL BUILD: busca "src/milascript/tipo" en lugar de "milascript/src/tipo" y "milabloques/src/pequescript/src/todo" que falla porque milabloques está como submódulo en lugar de estar como enlace)

* milabloques (FALLA EL BUILD: algunas rutas quedan con "$")

* simu_aele (FALLA EL MÓDULO PANTALLA: no se renderizan correctamente los tamaños de las cosas)

* pequescript (OK)

* REDA-ar.github.io (FALLA EL BUILD: las rutas quedan con "$")