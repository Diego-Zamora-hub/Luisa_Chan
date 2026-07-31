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
const avatarButton = document.querySelector('#avatarButton');
const avatarInput = document.querySelector('#avatarInput');
const avatarImage = document.querySelector('#avatarImage');
const avatarFallback = document.querySelector('#avatarFallback');
const wallpaperButton = document.querySelector('#wallpaperButton');
const wallpaperPanel = document.querySelector('#wallpaperPanel');
const wallpaperClose = document.querySelector('#wallpaperClose');
const wallpaperInput = document.querySelector('#wallpaperInput');
let isReplying = false;

const STORAGE_KEYS = { avatar: 'chantreapp-avatar', wallpaper: 'chantreapp-wallpaper', wallpaperImage: 'chantreapp-wallpaper-image' };
// Foto de perfil predeterminada: coloca tu imagen en assets/foto_perfil_predeterminada.jpg
// (o cambia esta ruta) y se mostrará automáticamente mientras el usuario no suba una propia.
const DEFAULT_AVATAR = 'assets/foto_perfil_predeterminada.jpeg';
const DOUBLE_TICK_SVG = '<svg viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6.5 4.5 10 11 2" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 6.5 10 10 16.5 2" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function now() { return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function scrollToEnd() { conversation.scrollTop = conversation.scrollHeight; }
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

clearConversation(); input.focus();