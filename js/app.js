import { Chatbot } from './bot.js';

const bot = new Chatbot();
const introScreen = document.querySelector('#introScreen');
const introStart = document.querySelector('#introStart');
const conversation = document.querySelector('#conversation');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const quickActions = document.querySelector('.quick-actions');
const clearButton = document.querySelector('#clearButton');
const modeButton = document.querySelector('#modeButton');
const pageIcon = document.querySelector('#pageIcon');
const attachmentInput = document.querySelector('#attachmentInput');
const attachButton = document.querySelector('#attachButton');
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
// Espera visible antes de cada respuesta: 0,9 s como minimo y hasta 1,8 s.
const RESPONSE_DELAY = { minimum: 900, perCharacter: 14, maximumExtra: 900 };
const PAGE_ICONS = { standard: 'assets/iconos/Luisa_icon_1.ico', girlfriend: 'assets/iconos/Luisa_icon_2.ico' };
// Personaliza estas dos rutas con los sonidos que prefieras.
const MODE_SOUNDS = {
  girlfriendOn: 'assets/audio/audio_modo_novia_on.m4a',
  girlfriendOff: 'assets/audio/audio_modo_novia_off.mp3'
};
// Reemplaza estas rutas por tus propios archivos para personalizar los sonidos del chat.
const MESSAGE_SOUNDS = {
  sent: 'assets/audio/efecto_mensaje_mandar.mp3',
  received: 'assets/audio/efecto_mensaje_recibir.mp3'
};
const messageSoundPlayers = Object.fromEntries(
  Object.entries(MESSAGE_SOUNDS).map(([type, source]) => {
    const player = new Audio(source);
    player.preload = 'auto';
    player.load();
    return [type, player];
  })
);
const QUICK_ACTIONS = {
  default: [
    ['Ver comandos', '/ayuda'], ['Cuéntame un chiste', 'Cuéntame un chiste'], ['Ver hora', '/hora'],
    ['Probar cálculo', '¿Cuánto es 250 más 45?'], ['Pedir un audio', 'Manda un audio de saludo'], ['Ver una foto', 'Muéstrame una foto']
  ],
  math: [
    ['Otro cálculo', '¿Cuánto es 120 más 80?'], ['Multiplicar', 'Multiplica 12 por 8'],
    ['Calculadora', '/calcular (12 + 8) * 2'], ['Ver hora', '/hora']
  ],
  audio: [
    ['Audio de saludo', 'Manda un audio de saludo'], ['Audio de ánimo', 'Manda un audio de ánimo'],
    ['Crear un audio', '/audio Hola, ¿cómo estás?'], ['Ver comandos', '/ayuda']
  ],
  media: [
    ['Ver una foto', 'Muéstrame una foto'], ['Ver un video', 'Manda un video'],
    ['Pedir pack', 'Quiero tu pack'], ['Pedir audio', 'Manda un audio de saludo']
  ],
  greeting: [
    ['Decir mi nombre', 'Me llamo '], ['Qué puedes hacer', '¿Qué puedes hacer?'],
    ['Cuéntame un chiste', 'Cuéntame un chiste'], ['Ver comandos', '/ayuda']
  ]
};
const PLAY_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>';
const PAUSE_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
const STOP_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1"/></svg>';

introStart.addEventListener('click', () => {
  introScreen.classList.add('is-leaving');
  window.setTimeout(() => { introScreen.hidden = true; input.focus(); }, 620);
}, { once: true });

function now() { return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function scrollToEnd() { conversation.scrollTop = conversation.scrollHeight; }
function updatePageIcon(isGirlfriend) { pageIcon.href = isGirlfriend ? PAGE_ICONS.girlfriend : PAGE_ICONS.standard; }
function playModeSound(enabled) {
  const sound = new Audio(enabled ? MODE_SOUNDS.girlfriendOn : MODE_SOUNDS.girlfriendOff);
  sound.preload = 'auto';
  sound.play().catch(() => { /* El archivo puede no haberse configurado. */ });
}
function playMessageSound(type) {
  const sound = messageSoundPlayers[type];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => { /* El archivo puede no haberse configurado o el navegador bloqueó el audio. */ });
}
function getQuickActions(context = '') {
  const text = String(context).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/(audio|voz|escuchar|mp3|m4a)/.test(text)) return QUICK_ACTIONS.audio;
  if (/(foto|imagen|video|pack|muestrame|muestra)/.test(text)) return QUICK_ACTIONS.media;
  if (/(calcula|calculo|sumar|suma|multiplica|divide|cuanto es|\d+\s*(mas|menos|por|entre|[+*\/-]))/.test(text)) return QUICK_ACTIONS.math;
  if (/(hola|como te llamas|me llamo|nombre)/.test(text)) return QUICK_ACTIONS.greeting;
  return QUICK_ACTIONS.default;
}
function renderQuickActions(context = '') {
  quickActions.replaceChildren();
  getQuickActions(context).forEach(([label, message]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label;
    button.addEventListener('click', () => sendMessage(message));
    quickActions.append(button);
  });
}
function setAngryMode(enabled) {
  isAngry = enabled;
  document.body.classList.toggle('angry-mode', enabled);
  if (enabled) {
    document.body.classList.remove('girlfriend-mode');
    updatePageIcon(false);
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
function addNativeAudioMessage({ src = '', speech = '', caption = '' }, sender) {
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
function addAudioMessage({ src = '', speech = '', caption = '' }, sender) {
  const row = document.createElement('div'); row.className = `message-row ${sender}`;
  const bubble = document.createElement('div'); bubble.className = 'bubble audio-bubble';
  const label = document.createElement('span'); label.className = 'audio-label'; label.textContent = caption || 'Mensaje de voz';
  const addSpeechControl = () => {
    if (!speech || bubble.querySelector('.speech-play')) return;
    const play = document.createElement('button'); play.type = 'button'; play.className = 'speech-play'; play.textContent = 'Escuchar voz';
    play.addEventListener('click', () => speakText(speech)); bubble.prepend(play);
  };
  if (src) {
    const player = document.createElement('audio'); player.preload = 'metadata'; player.src = src;
    const controls = document.createElement('div'); controls.className = 'voice-player';
    const profile = document.createElement('div'); profile.className = 'voice-profile';
    if (sender === 'bot') {
      const image = document.createElement('img'); image.src = avatarImage.currentSrc || avatarImage.src || DEFAULT_AVATAR; image.alt = 'Foto de perfil de Luisa';
      image.addEventListener('error', () => { profile.textContent = 'L'; }, { once: true }); profile.append(image);
    } else profile.textContent = 'Tu';
    const microphone = document.createElement('span'); microphone.className = 'voice-mic'; microphone.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="3" width="8" height="13" rx="4"/><path d="M5 12a7 7 0 0 0 14 0M12 19v3m-3 0h6"/></svg>'; profile.append(microphone);
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'voice-control'; toggle.setAttribute('aria-label', 'Reproducir audio'); toggle.innerHTML = PLAY_ICON_SVG;
    const waveform = document.createElement('div'); waveform.className = 'voice-waveform';
    const barHeights = [12, 20, 8, 14, 26, 17, 32, 11, 19, 24, 13, 28, 8, 18, 36, 22, 12, 26, 9, 31, 15, 20, 29, 11, 24, 17, 33, 13, 21, 9, 27, 16, 23, 12];
    const bars = barHeights.map(height => { const bar = document.createElement('i'); bar.style.height = `${height}px`; waveform.append(bar); return bar; });
    const track = document.createElement('input'); track.className = 'voice-progress'; track.type = 'range'; track.min = '0'; track.max = '100'; track.value = '0'; track.step = '0.1'; track.setAttribute('aria-label', 'Progreso del audio'); waveform.append(track);
    const meta = document.createElement('div'); meta.className = 'voice-meta';
    const duration = document.createElement('span'); duration.className = 'voice-duration'; duration.textContent = '0:00';
    const sentAt = document.createElement('span'); sentAt.className = 'voice-sent-at'; sentAt.textContent = now(); meta.append(duration, sentAt);
    const formatTime = seconds => {
      if (!Number.isFinite(seconds)) return '0:00';
      const minutes = Math.floor(seconds / 60); const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${remaining}`;
    };
    const sync = () => { const ratio = player.duration ? (player.currentTime / player.duration) * 100 : 0; track.value = String(ratio); duration.textContent = formatTime(player.currentTime || player.duration); bars.forEach((bar, index) => bar.classList.toggle('is-played', index < bars.length * ratio / 100)); };
    const reset = () => { player.pause(); player.currentTime = 0; sync(); toggle.innerHTML = PLAY_ICON_SVG; toggle.setAttribute('aria-label', 'Reproducir audio'); };
    toggle.addEventListener('click', () => { if (player.paused) player.play().catch(() => {}); else player.pause(); });
    track.addEventListener('input', () => { if (player.duration) player.currentTime = (Number(track.value) / 100) * player.duration; });
    player.addEventListener('loadedmetadata', () => { duration.textContent = formatTime(player.duration); });
    player.addEventListener('timeupdate', sync);
    player.addEventListener('play', () => { toggle.innerHTML = PAUSE_ICON_SVG; toggle.setAttribute('aria-label', 'Pausar audio'); });
    player.addEventListener('pause', () => { if (!player.ended) { toggle.innerHTML = PLAY_ICON_SVG; toggle.setAttribute('aria-label', 'Reproducir audio'); } });
    player.addEventListener('ended', reset);
    player.addEventListener('error', () => { controls.remove(); player.remove(); addSpeechControl(); }, { once: true });
    controls.append(toggle, waveform, meta, profile); bubble.append(player, controls);
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
  renderQuickActions();
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
  renderQuickActions(value);
  addMessage(value, 'user'); playMessageSound('sent'); input.value = ''; isReplying = true; input.disabled = true; showTyping();
  const delay = RESPONSE_DELAY.minimum + Math.min(value.length * RESPONSE_DELAY.perCharacter, RESPONSE_DELAY.maximumExtra);
  await new Promise(resolve => setTimeout(resolve, delay));
  document.querySelector('#typing')?.remove(); const response = bot.getResponse(value); playMessageSound('received');
  renderQuickActions(`${value} ${typeof response === 'string' ? response : response?.text || ''}`);
  if (response?.type === 'clear') clearConversation(false);
  else if (response?.type === 'angry') { setAngryMode(true); addMessage(response.text, 'bot'); }
  else if (response?.type === 'activate-girlfriend') modeButton.click();
  else if (typeof response === 'object' && response.images) { addMessage(response.text, 'bot'); response.images.forEach(image => addImageMessage(image.path, 'bot', image.caption)); }
  else if (typeof response === 'object' && response.image) { addMessage(response.text, 'bot'); addImageMessage(response.image, 'bot', response.caption); }
  else if (typeof response === 'object' && response.video) { addMessage(response.text, 'bot'); addVideoMessage(response.video, 'bot', response.caption); }
  else if (typeof response === 'object' && response.audio) { if (response.text) addMessage(response.text, 'bot'); addAudioMessage(response.audio, 'bot'); }
  else addMessage(response, 'bot');
  isReplying = false; input.disabled = false; input.focus();
}
form.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
clearButton.addEventListener('click', () => { bot.reset(); clearConversation(); });
attachButton.addEventListener('click', () => attachmentInput.click());
attachmentInput.addEventListener('change', () => {
  const file = attachmentInput.files?.[0]; if (!file) return;
  if (file.type.startsWith('image/')) addImageMessage(URL.createObjectURL(file), 'user', file.name);
  else if (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|webm)$/i.test(file.name)) {
    addAudioMessage({ src: URL.createObjectURL(file), caption: file.name }, 'user');
    setTimeout(() => { playMessageSound('received'); addMessage('Recibí tu audio. Para dictar texto directamente en el mensaje, usa el botón del micrófono.', 'bot'); }, 350);
  }
  attachmentInput.value = '';
  playMessageSound('sent');
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
  updatePageIcon(enabled);
  modeButton.setAttribute('aria-pressed', String(enabled));
  modeButton.innerHTML = enabled ? '<span aria-hidden="true">♥</span> Modo Novia' : '<span aria-hidden="true">♡</span> Modo Novia';
  modeButton.title = enabled ? 'Desactivar modo Novia' : 'Activar modo Novia';
  bot.setMode(enabled ? 'girlfriend' : 'standard');
  playModeSound(enabled);
  addMessage(
    enabled
      ? 'Modo Novia activado ♡ Ahora puedo hablarte sin filtros: más sucia, más explícita y lista para lo que se te antoje. Dime qué quieres hacer conmigo...'
      : 'Modo normal activado. Volvemos al estilo más tranquilo.',
    'bot'
  );
});
renderQuickActions();

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
