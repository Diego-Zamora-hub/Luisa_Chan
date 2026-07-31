import { Chatbot } from './bot.js';

const bot = new Chatbot();
const conversation = document.querySelector('#conversation');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const clearButton = document.querySelector('#clearButton');
const modeButton = document.querySelector('#modeButton');
const imageInput = document.querySelector('#imageInput');
const attachButton = document.querySelector('#attachButton');
const audioInput = document.querySelector('#audioInput');
const audioAttachButton = document.querySelector('#audioAttachButton');
const recordButton = document.querySelector('#recordButton');
const emojiButton = document.querySelector('#emojiButton');
const emojiPicker = document.querySelector('#emojiPicker');
const avatarButton = document.querySelector('#avatarButton');
const avatarInput = document.querySelector('#avatarInput');
const avatarImage = document.querySelector('#avatarImage');
const avatarFallback = document.querySelector('#avatarFallback');
const wallpaperButton = document.querySelector('#wallpaperButton');
const wallpaperPanel = document.querySelector('#wallpaperPanel');
const wallpaperClose = document.querySelector('#wallpaperClose');
const wallpaperInput = document.querySelector('#wallpaperInput');
let isReplying = false;
let isAngry = false;

const STORAGE_KEYS = { avatar: 'chantreapp-avatar', wallpaper: 'chantreapp-wallpaper', wallpaperImage: 'chantreapp-wallpaper-image' };
// Foto de perfil predeterminada: coloca tu imagen en assets/foto_perfil_predeterminada.jpg
// (o cambia esta ruta) y se mostrará automáticamente mientras el usuario no suba una propia.
const DEFAULT_AVATAR = 'assets/foto_perfil_predeterminada.jpeg';
const DOUBLE_TICK_SVG = '<svg viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6.5 4.5 10 11 2" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 6.5 10 10 16.5 2" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function now() { return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function scrollToEnd() { conversation.scrollTop = conversation.scrollHeight; }
function setAngryMode(enabled) {
  isAngry = enabled;
  document.body.classList.toggle('angry-mode', enabled);
  if (enabled) {
    document.body.classList.remove('girlfriend-mode');
    modeButton.disabled = true;
    modeButton.setAttribute('aria-pressed', 'false');
    modeButton.title = 'No disponible mientras Luisa está enfadada';
    bot.setMode('standard');
  } else {
    modeButton.disabled = false;
    modeButton.title = 'Activar modo Novia';
  }
}
function appendTime(bubble, sender) {
  const time = document.createElement('span'); time.className = 'message-time';
  const stamp = document.createElement('span'); stamp.textContent = now(); time.append(stamp);
  if (sender === 'user') {
    const ticks = document.createElement('span'); ticks.className = 'message-ticks'; ticks.innerHTML = DOUBLE_TICK_SVG;
    time.append(ticks);
  }
  bubble.append(time);
}
function addMessage(text, sender) {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble';
  bubble.append(document.createTextNode(text));
  appendTime(bubble, sender);
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
  appendTime(bubble, sender);
  row.append(bubble); conversation.append(row); scrollToEnd();
}
function addVideoMessage(src, sender, caption = '') {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble image-bubble';
  const video = document.createElement('video'); video.src = src; video.controls = true; video.preload = 'metadata'; video.setAttribute('playsinline', '');
  const showPlaceholder = () => { video.remove(); const placeholder = document.createElement('div'); placeholder.className = 'image-placeholder'; placeholder.textContent = `Video pendiente: reemplaza ${src.split('/').pop()} en la carpeta assets.`; bubble.prepend(placeholder); };
  video.addEventListener('error', showPlaceholder, { once: true }); bubble.append(video);
  if (caption) { const label = document.createElement('span'); label.className = 'image-caption'; label.textContent = caption; bubble.append(label); }
  appendTime(bubble, sender);
  row.append(bubble); conversation.append(row); scrollToEnd();
}
function addAudioMessage({ src = '', speech = '', caption = '' }, sender) {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble audio-bubble';
  const player = document.createElement('audio'); player.controls = true; player.preload = 'metadata';
  const label = document.createElement('span'); label.className = 'audio-label'; label.textContent = caption || 'Audio';
  const addSpeechControl = () => {
    if (!speech || bubble.querySelector('.speech-play')) return;
    const play = document.createElement('button'); play.type = 'button'; play.className = 'speech-play'; play.textContent = '▶ Escuchar voz';
    play.addEventListener('click', () => speakText(speech)); bubble.prepend(play);
  };
  if (src) {
    player.src = src;
    player.addEventListener('error', () => { player.remove(); addSpeechControl(); }, { once: true });
    bubble.append(player);
  } else addSpeechControl();
  bubble.append(label); appendTime(bubble, sender); row.append(bubble); conversation.append(row); scrollToEnd();
}
function speakText(text) {
  if (!('speechSynthesis' in window)) { addMessage('Tu navegador no tiene síntesis de voz disponible.', 'bot'); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'es-CO'; utterance.rate = .98;
  window.speechSynthesis.speak(utterance);
}
function showTyping() { const item = document.createElement('div'); item.className = 'typing'; item.id = 'typing'; item.innerHTML = '<span>Escribiendo</span><span class="typing-dots"><i></i><i></i><i></i></span>'; conversation.append(item); scrollToEnd(); }
function clearConversation(withWelcome = true) {
  setAngryMode(false);
  conversation.innerHTML = '';
  if (withWelcome) {
    const stamp = document.createElement('div');
    stamp.className = 'day-stamp';
    stamp.textContent = 'Hoy';
    conversation.append(stamp);
    addMessage('¡Hola! Soy Luisa. Qué gusto saludarte, ¿cómo te llamas?', 'bot');
  }
}
async function sendMessage(text) {
  const value = text.trim(); if (!value || isReplying) return;
  addMessage(value, 'user'); input.value = ''; isReplying = true; input.disabled = true; showTyping();
  await new Promise(resolve => setTimeout(resolve, 650 + Math.min(value.length * 8, 700)));
  document.querySelector('#typing')?.remove(); const response = bot.getResponse(value);
  if (response?.type === 'clear') clearConversation(false);
  else if (response?.type === 'angry') { setAngryMode(true); addMessage(response.text, 'bot'); }
  else if (response?.type === 'activate-girlfriend') modeButton.click();
  else if (typeof response === 'object' && response.image) { addMessage(response.text, 'bot'); addImageMessage(response.image, 'bot', response.caption); }
  else if (typeof response === 'object' && response.video) { addMessage(response.text, 'bot'); addVideoMessage(response.video, 'bot', response.caption); }
  else if (typeof response === 'object' && response.audio) { if (response.text) addMessage(response.text, 'bot'); addAudioMessage(response.audio, 'bot'); }
  else addMessage(response, 'bot');
  isReplying = false; input.disabled = false; input.focus();
}
form.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
clearButton.addEventListener('click', () => { bot.reset(); clearConversation(); });
attachButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => { const file = imageInput.files?.[0]; if (!file) return; addImageMessage(URL.createObjectURL(file), 'user', file.name); imageInput.value = ''; });
audioAttachButton.addEventListener('click', () => audioInput.click());
audioInput.addEventListener('change', () => {
  const file = audioInput.files?.[0]; if (!file) return;
  addAudioMessage({ src: URL.createObjectURL(file), caption: file.name }, 'user');
  audioInput.value = '';
  setTimeout(() => addMessage('Recibí tu audio. Para dictar texto directamente en el mensaje, usa el botón del micrófono.', 'bot'), 350);
});
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null; let isDictating = false;
function stopDictation() {
  if (recognition && isDictating) recognition.stop();
}
function startDictation() {
  if (!SpeechRecognition) {
    addMessage('Tu navegador no admite dictado de voz. Usa Chrome o Edge para esta función.', 'bot');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'es-CO';
  recognition.continuous = true;
  recognition.interimResults = true;
  const initialText = input.value.trim();
  let finalText = initialText;
  recognition.addEventListener('result', event => {
    let interimText = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript.trim();
      if (event.results[index].isFinal) finalText = `${finalText} ${transcript}`.trim();
      else interimText += ` ${transcript}`;
    }
    input.value = `${finalText}${interimText}`.trim();
  });
  recognition.addEventListener('end', () => {
    isDictating = false; recordButton.classList.remove('is-recording');
    recordButton.title = 'Dictar mensaje'; recordButton.setAttribute('aria-label', 'Dictar mensaje'); input.focus();
  });
  recognition.addEventListener('error', event => {
    if (event.error !== 'aborted' && event.error !== 'no-speech') {
      addMessage(event.error === 'not-allowed' ? 'Necesito permiso para usar el micrófono.' : 'No pude transcribir el audio. Inténtalo de nuevo.', 'bot');
    }
  });
  isDictating = true; recordButton.classList.add('is-recording');
  recordButton.title = 'Detener dictado'; recordButton.setAttribute('aria-label', 'Detener dictado'); recognition.start();
}
recordButton.addEventListener('click', () => { if (isDictating) stopDictation(); else startDictation(); });
emojiButton.addEventListener('click', () => { emojiPicker.hidden = !emojiPicker.hidden; });
emojiPicker.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { input.value += button.textContent; input.focus(); emojiPicker.hidden = true; }));
modeButton.addEventListener('click', () => {
  if (isAngry) return;
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

// --- Foto de perfil personalizada ---
function applyAvatar(dataUrl) {
  if (dataUrl) { avatarImage.src = dataUrl; avatarImage.hidden = false; avatarFallback.hidden = true; }
  else { avatarImage.hidden = true; avatarImage.removeAttribute('src'); avatarFallback.hidden = false; }
}
avatarButton.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', () => {
  const file = avatarInput.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { const dataUrl = reader.result; applyAvatar(dataUrl); try { localStorage.setItem(STORAGE_KEYS.avatar, dataUrl); } catch { /* almacenamiento lleno o no disponible */ } };
  reader.readAsDataURL(file);
  avatarInput.value = '';
});
(function initAvatar() {
  let savedAvatar = null;
  try { savedAvatar = localStorage.getItem(STORAGE_KEYS.avatar); } catch { /* sin acceso a localStorage */ }
  if (savedAvatar) { applyAvatar(savedAvatar); return; }
  // Sin foto guardada por el usuario: intenta cargar la imagen predeterminada del proyecto.
  // Si el archivo no existe (404), se muestra la inicial "L" como respaldo.
  avatarImage.addEventListener('error', () => applyAvatar(null), { once: true });
  applyAvatar(DEFAULT_AVATAR);
})();

// --- Fondo de chat personalizable (estilo WhatsApp) ---
const WALLPAPER_CLASSES = ['wallpaper-default', 'wallpaper-plain', 'wallpaper-grid', 'wallpaper-lines', 'wallpaper-waves', 'wallpaper-hearts', 'wallpaper-custom'];
function applyWallpaper(name, customImage) {
  conversation.classList.remove(...WALLPAPER_CLASSES);
  conversation.style.backgroundImage = '';
  if (name === 'custom' && customImage) { conversation.classList.add('wallpaper-custom'); conversation.style.backgroundImage = `url(${customImage})`; }
  else { conversation.classList.add(`wallpaper-${name}`); }
  document.querySelectorAll('.wallpaper-swatch').forEach(swatch => swatch.classList.toggle('active', swatch.dataset.wallpaper === name));
}
function saveWallpaper(name, customImage) {
  try {
    localStorage.setItem(STORAGE_KEYS.wallpaper, name);
    if (customImage) localStorage.setItem(STORAGE_KEYS.wallpaperImage, customImage);
    else localStorage.removeItem(STORAGE_KEYS.wallpaperImage);
  } catch { /* almacenamiento lleno o no disponible */ }
}
wallpaperButton.addEventListener('click', () => { wallpaperPanel.hidden = !wallpaperPanel.hidden; });
wallpaperClose.addEventListener('click', () => { wallpaperPanel.hidden = true; });
document.querySelectorAll('.wallpaper-swatch').forEach(swatch => swatch.addEventListener('click', () => {
  const name = swatch.dataset.wallpaper; applyWallpaper(name); saveWallpaper(name); wallpaperPanel.hidden = true;
}));
wallpaperInput.addEventListener('change', () => {
  const file = wallpaperInput.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { const dataUrl = reader.result; applyWallpaper('custom', dataUrl); saveWallpaper('custom', dataUrl); wallpaperPanel.hidden = true; };
  reader.readAsDataURL(file);
  wallpaperInput.value = '';
});
document.addEventListener('click', event => {
  if (wallpaperPanel.hidden) return;
  if (wallpaperPanel.contains(event.target) || wallpaperButton.contains(event.target)) return;
  wallpaperPanel.hidden = true;
});
(function initWallpaper() {
  let savedName = 'default', savedImage = null;
  try { savedName = localStorage.getItem(STORAGE_KEYS.wallpaper) || 'default'; savedImage = localStorage.getItem(STORAGE_KEYS.wallpaperImage); } catch { /* sin acceso a localStorage */ }
  applyWallpaper(savedName, savedImage);
})();

clearConversation();
