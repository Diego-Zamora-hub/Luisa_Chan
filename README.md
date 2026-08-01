![image alt](https://github.com/Diego-Zamora-hub/Luisa_Chan/blob/f1822878173b0d7cfdba4be9ac87f772aaa1440b/assets/iconos/Photoroom-20260801_073454957.png)

# Luisa Chan

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
- Si se menciona Manuela, Manu vinculada a otra IA, o “la otra IA”, Luisa entra en modo enojo: se bloquean fotos, videos y el modo Novia, y el chat adopta un estilo rojo. `/limpiar` o el botón de limpiar reinician ese estado.
- Respuestas con videos `.mp4` de contexto. Los reproductores aparecerán cuando se mencione un video, clip, paisaje, amor o algo alegre.
- Audios bidireccionales: adjunta `.mp3`, `.m4a`, `.wav`, `.ogg` o `.webm`, y usa el micrófono para dictar texto directamente en el mensaje. El bot puede enviar MP3 configurables o generar una locución desde texto.

## Audios del bot

### Sonidos del modo Novia

El cambio de modo reproduce un sonido al activar y otro al volver al modo normal. Coloca tus archivos en `assets/audio/` y ajusta las rutas `girlfriendOn` y `girlfriendOff` de `MODE_SOUNDS` en `js/app.js`. Por defecto usa los archivos ya incluidos `saludo.mp3` y `animo.mp3`.

Los mensajes de voz usan un reproductor similar al de WhatsApp, con avatar, reproducción/pausa, detener, barra de progreso y duración.

Hay dos formas de hacer que el bot envíe un audio:

- Escribe `/audio Tu texto aquí` para que use la síntesis de voz del navegador. No requiere archivos.
- Coloca un MP3 real en `assets/audio/` y configúralo en `AUDIO_RESPONSES` dentro de `js/bot.js`. Cada entrada define los `triggers` (cuándo se manda), `src` (ruta del MP3), `speech` (respaldo si no existe el archivo) y `caption`.

Por defecto puedes crear `assets/audio/saludo.mp3` y `assets/audio/animo.mp3`; después escribe “manda un audio de saludo” o “manda un audio de ánimo”. Si todavía no existen, el chat ofrece el botón para oír el texto configurado con la voz del navegador.

Los audios adjuntos por el usuario se pueden reproducir dentro del chat. El botón de micrófono usa el reconocimiento de voz del navegador para pasar lo que dices directamente al campo de mensaje; funciona en navegadores con Web Speech API (normalmente Chrome y Edge) y requiere permiso de micrófono. La transcripción de archivos ya grabados requeriría conectar un servicio de transcripción o una API de voz.

## Pack de imágenes

Las imágenes que se envían juntas al pedir `pack`, “sorprender” o “quiero verte” están configuradas en `PACK_IMAGES` dentro de `js/bot.js`. Por defecto incluye `assets/pack/foto1.jpeg` hasta `foto5.jpeg`.

Para agregar otra imagen al pack, colócala en `assets/pack/` y añade su ruta a ese arreglo. Tras enviar todas las imágenes del pack una vez, el bot responde con otro medio disponible en lugar de repetirlas. `/limpiar` habilita de nuevo el pack.

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
