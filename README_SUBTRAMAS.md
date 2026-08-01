# Subtramas por tema

Una subtrama es una historia corta que avanza solo cuando el usuario habla de un tema concreto. Por ejemplo: una cita, una aventura, un misterio o un viaje. La forma mas simple de hacerla real en este proyecto es guardar una **etapa** por cada tema dentro de la clase `Chatbot` de `js/bot.js`.

## 1. Define el estado

En el `constructor()` de `Chatbot`, agrega un objeto para las subtramas. El valor `0` significa que aun no empezo:

```js
this.subplots = {
  cita: 0,
  misterio: 0
};
```

En el metodo `reset()`, reinicialo para que `/limpiar` tambien reinicie las historias:

```js
this.subplots = { cita: 0, misterio: 0 };
```

## 2. Crea una funcion para la subtrama

Dentro de la clase, agrega un metodo por tema. Recibe el texto ya normalizado y devuelve una respuesta, o `null` cuando el mensaje no pertenece a esa historia.

```js
dateSubplot(normalized) {
  const stage = this.subplots.cita;

  // Inicio: detecta el tema y presenta una eleccion clara.
  if (stage === 0 && /(cita|salir contigo|plan romantico)/.test(normalized)) {
    this.subplots.cita = 1;
    return 'Me gusta la idea. Prefieres una cafeteria tranquila o caminar al atardecer?';
  }

  // Etapa 1: interpreta la eleccion del usuario.
  if (stage === 1 && /(cafe|cafeteria)/.test(normalized)) {
    this.subplots.cita = 2;
    return 'Perfecto, pido un cafe y elijo una mesa junto a la ventana. De que hablamos primero: musica o viajes?';
  }
  if (stage === 1 && /(caminar|atardecer|paseo)/.test(normalized)) {
    this.subplots.cita = 2;
    return 'Entonces nos vemos al atardecer. Quieres ir al parque o cerca de la ciudad?';
  }

  // Si la historia ya empezo, guia al usuario sin avanzar por accidente.
  if (stage === 1) {
    return 'Elige una opcion para nuestra cita: cafeteria o paseo al atardecer.';
  }

  // Final o nuevas escenas. Puedes sumar tantas etapas como necesites.
  if (stage === 2) {
    this.subplots.cita = 3;
    return 'Me gusta conocerte asi. Esta fue la primera escena de nuestra cita; podemos continuarla cuando quieras.';
  }

  return null;
}
```

## 3. Conecta la subtrama a las respuestas

Busca `getResponse()` en `js/bot.js`. Despues de crear `normalized` y antes de las respuestas generales, llama al metodo. Debe ir antes de reglas amplias como la respuesta generica, para que la historia tenga prioridad.

```js
const dateReply = this.dateSubplot(normalized);
if (dateReply) return dateReply;
```

Repite el patron para otras historias:

```js
const mysteryReply = this.mysterySubplot(normalized);
if (mysteryReply) return mysteryReply;
```

## Diseno recomendado

- Usa una palabra de activacion y dos o tres opciones por etapa. Evita detectar palabras demasiado generales.
- En cada etapa cambia `this.subplots.nombre` **antes** de devolver la respuesta.
- Deja `return null` al final: asi los mensajes que no encajan siguen usando el bot normal.
- Manten las decisiones y los textos de una misma historia en su propio metodo; es mucho mas facil de ampliar.
- Si quieres que una subtrama pueda repetirse, al terminar vuelve la etapa a `0`. Si debe quedar terminada, conserva la ultima etapa.

## Plantilla corta

Duplica y renombra esta plantilla para crear un tema nuevo:

```js
nombreSubplot(normalized) {
  const stage = this.subplots.nombre;

  if (stage === 0 && /(palabra clave|otra variante)/.test(normalized)) {
    this.subplots.nombre = 1;
    return 'Inicio de la historia. Opcion A u opcion B?';
  }

  if (stage === 1 && /opcion a/.test(normalized)) {
    this.subplots.nombre = 2;
    return 'Consecuencia de A. Que haces ahora?';
  }

  if (stage === 1 && /opcion b/.test(normalized)) {
    this.subplots.nombre = 2;
    return 'Consecuencia de B. Que haces ahora?';
  }

  return null;
}
```

No olvides crear `nombre: 0` en el constructor y en `reset()`, y llamar a `nombreSubplot(normalized)` desde `getResponse()`.
