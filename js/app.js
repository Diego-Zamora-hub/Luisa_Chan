import { Chatbot } from './bot.js';

const bot = new Chatbot();
const conversation = document.querySelector('#conversation');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const clearButton = document.querySelector('#clearButton');
const modeButton = document.querySelector('#modeButton');
const imageInput = document.querySelector('#imageInput');
const attachButton = document.querySelector('#attachButton');
const emojiButton = document.querySelector('#emojiButton');
const emojiPicker = document.querySelector('#emojiPicker');
let isReplying = false;

function now() { return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function scrollToEnd() { conversation.scrollTop = conversation.scrollHeight; }
function addMessage(text, sender) {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble';
  bubble.append(document.createTextNode(text));
  const time = document.createElement('span'); time.className = 'message-time'; time.textContent = now(); bubble.append(time);
  row.append(bubble); conversation.append(row); scrollToEnd();
}
function addImageMessage(src, sender, caption = '') {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble image-bubble';
  const image = document.createElement('img'); image.src = src; image.alt = caption || 'Imagen compartida';
  image.addEventListener('error', () => {
    image.remove();
    const placeholder = document.createElement('div'); placeholder.className = 'image-placeholder';
    placeholder.textContent = `Imagen pendiente: reemplaza ${src.split('/').pop()} en la carpeta assets.`;
    bubble.prepend(placeholder);
  }, { once: true });
  bubble.append(image);
  if (caption) { const label = document.createElement('span'); label.className = 'image-caption'; label.textContent = caption; bubble.append(label); }
  const time = document.createElement('span'); time.className = 'message-time'; time.textContent = now(); bubble.append(time);
  row.append(bubble); conversation.append(row); scrollToEnd();
}
function addVideoMessage(src, sender, caption = '') {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble image-bubble';
  const video = document.createElement('video'); video.src = src; video.controls = true; video.preload = 'metadata'; video.setAttribute('playsinline', '');
  const showPlaceholder = () => { video.remove(); const placeholder = document.createElement('div'); placeholder.className = 'image-placeholder'; placeholder.textContent = `Video pendiente: reemplaza ${src.split('/').pop()} en la carpeta assets.`; bubble.prepend(placeholder); };
  video.addEventListener('error', showPlaceholder, { once: true }); bubble.append(video);
  if (caption) { const label = document.createElement('span'); label.className = 'image-caption'; label.textContent = caption; bubble.append(label); }
  const time = document.createElement('span'); time.className = 'message-time'; time.textContent = now(); bubble.append(time);
  row.append(bubble); conversation.append(row); scrollToEnd();
}
function showTyping() { const item = document.createElement('div'); item.className = 'typing'; item.id = 'typing'; item.innerHTML = '<span>Escribiendo</span><span class="typing-dots"><i></i><i></i><i></i></span>'; conversation.append(item); scrollToEnd(); }
function clearConversation(withWelcome = true) {
  conversation.innerHTML = '';
  if (withWelcome) {
    const stamp = document.createElement('div');
    stamp.className = 'day-stamp';
    stamp.textContent = 'Hoy';
    conversation.append(stamp);
    addMessage('¡Hola! Soy Chantreapp. Activa el Modo Novia si quieres que me ponga más intensa y explícita contigo ♡', 'bot');
  }
}
async function sendMessage(text) {
  const value = text.trim(); if (!value || isReplying) return;
  addMessage(value, 'user'); input.value = ''; isReplying = true; input.disabled = true; showTyping();
  await new Promise(resolve => setTimeout(resolve, 650 + Math.min(value.length * 8, 700)));
  document.querySelector('#typing')?.remove(); const response = bot.getResponse(value);
  if (response?.type === 'clear') clearConversation(false);
  else if (response?.type === 'activate-girlfriend') modeButton.click();
  else if (typeof response === 'object' && response.image) { addMessage(response.text, 'bot'); addImageMessage(response.image, 'bot', response.caption); }
  else if (typeof response === 'object' && response.video) { addMessage(response.text, 'bot'); addVideoMessage(response.video, 'bot', response.caption); }
  else addMessage(response, 'bot');
  isReplying = false; input.disabled = false; input.focus();
}
form.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
clearButton.addEventListener('click', () => clearConversation());
attachButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => { const file = imageInput.files?.[0]; if (!file) return; addImageMessage(URL.createObjectURL(file), 'user', file.name); imageInput.value = ''; });
emojiButton.addEventListener('click', () => { emojiPicker.hidden = !emojiPicker.hidden; });
emojiPicker.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { input.value += button.textContent; input.focus(); emojiPicker.hidden = true; }));
modeButton.addEventListener('click', () => {
  const enabled = !document.body.classList.contains('girlfriend-mode');
  document.body.classList.toggle('girlfriend-mode', enabled);
  modeButton.setAttribute('aria-pressed', String(enabled));
  modeButton.innerHTML = enabled ? '<span aria-hidden="true">♥</span> Modo Novia' : '<span aria-hidden="true">♡</span> Modo Novia';
  modeButton.title = enabled ? 'Desactivar modo Novia' : 'Activar modo Novia';
  bot.setMode(enabled ? 'girlfriend' : 'standard');
  addMessage(
    enabled
      ? 'Modo Novia activado ♡ Ahora puedo hablarte sin filtros: más sucia, más explícita y lista para lo que se te antoje. Dime qué quieres hacer conmigo...'
      : 'Modo normal activado. Volvemos al estilo más tranquilo.',
    'bot'
  );
});
document.querySelectorAll('[data-message]').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.message)));
clearConversation(); input.focus();
