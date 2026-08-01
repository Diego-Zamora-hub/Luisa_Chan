# Audios del bot

Coloca aquí tus audios reales, por ejemplo:

- `saludo.mp3`
- `animo.mp3`

Las rutas y los textos de respaldo se configuran en `js/bot.js`, dentro de `AUDIO_RESPONSES`.

## Sonidos del modo Novia

Puedes añadir `modo_novia_activado.mp3` y `modo_novia_desactivado.mp3`. Sus rutas se cambian desde `MODE_SOUNDS` en `js/app.js`.

Si un MP3 no está disponible, la interfaz muestra un botón para reproducir el texto configurado usando la síntesis de voz del navegador.

## Sonidos de mensajes

Los efectos al enviar y recibir mensajes se configuran en `MESSAGE_SOUNDS` dentro de `js/app.js`.

- `efecto_mensaje_mandar.mp3`: se reproduce al enviar un mensaje o adjunto.
- `efecto_mensaje_recibir.mp3`: se reproduce cuando llega una respuesta de Luisa.

Puedes reemplazar estos archivos conservando el nombre, o cambiar sus rutas en `MESSAGE_SOUNDS`.
