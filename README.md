# Chantreapp

Chatbot web interactivo inspirado en WhatsApp Web, construido con HTML, CSS y JavaScript modular. No requiere servidor ni instalación de dependencias.

## Ejecutar

Abre `index.html` en cualquier navegador moderno. Para desarrollo local también puedes usar una extensión de servidor estático, aunque no es obligatoria.

## Funcionalidades

- Conversación con interfaz responsiva, marcas de tiempo, autoscroll y estado “Escribiendo…”.
- Comandos: `/ayuda`, `/comandos`, `/sumar 5 7`, `/calcular (5+7)*2`, `/hora` y `/limpiar`.
- Reconocimiento de cálculos escritos en lenguaje natural, como “cuánto es 250 más 45” o “multiplica 12 por 8”.
- Arquitectura modular: `js/bot.js` contiene la lógica de respuestas y `js/app.js` controla la interfaz.
- Selector de emojis y botón para adjuntar imágenes desde tu equipo.
- Respuestas con imágenes de contexto para términos como flores, amor o paisaje. Los archivos reemplazables están en `assets/`.
- Modo Novia con estilo rosa y tono romántico. Se activa con el botón del encabezado o escribiendo `modo novia`.
- Respuestas con videos `.mp4` de contexto. Los reproductores aparecerán cuando se mencione un video, clip, paisaje, amor o algo alegre.

## Reemplazar imágenes de ejemplo

Sustituye los archivos vacíos `assets/foto_normal.jpg`, `assets/foto_feliz.jpg` y `assets/foto_romantica.jpg` por tus propias imágenes, conservando los mismos nombres. Si prefieres usar otros nombres, actualiza las rutas correspondientes en `js/bot.js`. Hasta que los reemplaces, el chat mostrará un aviso en lugar de una imagen rota.

Haz lo mismo con `video_normal.mp4`, `video_feliz.mp4`, `video_romantico.mp4`, `video_paisaje.mp4` y `video_especial.mp4`. Están vacíos a propósito y se reproducirán automáticamente cuando los sustituyas por MP4 válidos.

## Añadir más diálogos

Los diálogos están organizados en `js/bot.js`. Para añadir una respuesta, incorpora una condición dentro de `girlfriendReply()` (modo Novia) o `getResponse()` (modo normal), antes de la respuesta genérica:

```js
if (/(cafe|café)/.test(normalized)) {
  return this.pick([
    'Un café contigo y una charla tranquila suena como un plan perfecto.',
    '¿Cómo te gusta el café? Ese detalle dice mucho de una persona.'
  ]);
}
```

Usa expresiones separadas con `|` para reconocer variantes y `this.pick([ ... ])` para que el bot elija una respuesta distinta cada vez. Mantén las reglas más específicas antes de las generales.
