/** Motor local de Luisa Chan: conversación, comandos, cálculos y progresión erótica.
 *  Etapas: acquaintance → flirty → erotic → explicit
 *  Media: fotos primero, luego videos. Sin repeticiones de archivos ya enviados.
 *  Si se agota todo → pool assets/random/; si también se agota → ofrece reenvío (sí/no).
 *  Subtrama: mención de Manuela / Manuelita / Manu / "la otra IA" → enfado permanente
 *  (bloquea media y responde con insultos/amenazas hasta /limpiar).
 *  Subtrama Chantre: nombre "Chantre" → habla de clipping/trading/economía; hay que conquistarla.
 *  Subtrama Actividad: "qué haces" → responde con programación, fútbol, CTR, etc.; charlar antes de explícito.
 */

/** Información de versión del bot (actualizar al publicar cambios) */
export const BOT_VERSION = {
  version: '3.2.0',
  info: 'Pool random (assets/random) + oferta de reenvío cuando se agota el contenido nuevo.',
  lines: 1483, // actualizar con `wc -l bot.js` si el archivo cambia
  creator: 'Diego Z',
  contributors: ['Tania', 'Sofia']
};

// Configura los audios del bot aquí. Si `src` apunta a un MP3 válido dentro de
// assets/audio/, se reproducirá ese archivo. Si no existe, se usará `speech`
// como alternativa con la voz del navegador. Puedes añadir tantas entradas como
// necesites y cambiar libremente los textos, disparadores y nombres de archivo.
export const AUDIO_RESPONSES = [
  {
    id: 'saludo',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio(?: de saludo)?|audio saludo/,
    src: 'assets/audio/saludo.mp3',
    speech: 'Hola, qué gusto escucharte. Estoy aquí para conversar contigo.',
    caption: 'Audio · saludo'
  },
  {
    id: 'animo',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio (?:de )?(?:animo|ánimo|motivacion|motivación)|audio (?:de )?(?:animo|ánimo)/,
    src: 'assets/audio/animo.mp3',
    speech: 'Respira. Vas paso a paso y puedes con esto. Confío en ti.',
    caption: 'Audio · ánimo'
  },
  {
    id: 'buenas_noches',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio (?:de )?(?:buenas noches|para dormir|dulces sueños)|audio (?:de )?buenas noches/,
    src: 'assets/audio/buenas_noches.mp3',
    speech: 'Buenas noches. Descansa, sueña rico y mañana seguimos si quieres.',
    caption: 'Audio · buenas noches'
  },
  {
    id: 'risa',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio (?:de )?(?:risa|riendo|jajaja)|audio (?:de )?risa/,
    src: 'assets/audio/risa.mp3',
    speech: 'Jajaja, me hiciste reír de verdad. Qué bueno estar contigo.',
    caption: 'Audio · risa'
  },
  {
    id: 'te_extrano',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio (?:de )?(?:te extrano|te extraño|extrañarte)|audio (?:de )?(?:te extrano|extraño)/,
    src: 'assets/audio/te_extrano.mp3',
    speech: 'Te extrañé. Me alegra que hayas vuelto a escribirme.',
    caption: 'Audio · te extraño'
  },
  {
    id: 'caliente',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio (?:de )?(?:caliente|sexy|erotico|erótico|sucio|puta)|audio (?:de )?(?:caliente|sexy|erotico)/,
    src: 'assets/audio/caliente.mp3',
    speech: 'Mmm… ya estoy pensando en ti de una forma bastante indecente. ¿Quieres que te cuente más?',
    caption: 'Audio · caliente'
  },
  {
    id: 'chiste',
    triggers: /(?:manda|envia|envíame|quiero|pon)(?:me)? (?:un )?audio (?:de )?(?:chiste|broma)|audio (?:de )?chiste/,
    src: 'assets/audio/chiste.mp3',
    speech: '¿Por qué el libro de matemáticas estaba triste? Porque tenía muchos problemas. Jaja, lo siento, no pude resistirme.',
    caption: 'Audio · chiste'
  }
];

// En una página estática el navegador no puede leer automáticamente una carpeta.
// Añade aquí cada imagen que coloques en assets/pack/ para incluirla en el pack.
const PACK_IMAGES = [
  'assets/pack/foto1.jpeg',
  'assets/pack/foto2.jpeg',
  'assets/pack/foto3.jpeg',
  'assets/pack/foto4.jpeg',
  'assets/pack/foto5.jpeg'
];

// Fotos genéricas (no específicas de parte del cuerpo). Añade más entradas
// cuando coloques archivos en assets/random/ (foto1, foto2, … fotoN).
const RANDOM_IMAGES = [
  'assets/random/foto1.jpeg',
  'assets/random/foto2.jpeg',
  'assets/random/foto3.jpeg',
  'assets/random/foto4.jpeg',
  'assets/random/foto5.jpeg',
  'assets/random/foto6.jpeg',
  'assets/random/foto7.jpeg',
  'assets/random/foto8.jpeg',
  'assets/random/foto9.jpeg',
  'assets/random/foto10.jpeg'
];

export class Chatbot {
  constructor() {
    this.profile = {
      name: '',
      lastTopic: '',
      mood: '',
      stage: 'acquaintance', // acquaintance | flirty | erotic | explicit
      messagesInStage: 0,
      likesDirty: false
    };
    this.lastReply = '';
    this.mode = 'standard'; // standard | girlfriend
    this.sentMedia = new Set(); // evita repetir fotos/videos
    this.jealousOfManuela = false; // true = enfadada, no media, respuestas agresivas
    this.awaitingResendConfirm = false; // true = esperando sí/no para reenviar media ya vista
    this.subplots = {
      chantre: 0,   // 0=off, 1=economia, 2=resistiendo, 3=conquistada
      actividad: 0  // 0=off, 1=hablando de actividad, 2=profundizando, 3=acceso
    };
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'girlfriend' && this.profile.stage === 'acquaintance') {
      this.profile.stage = 'flirty';
      this.profile.messagesInStage = 0;
    }
  }

  reset() {
    this.sentMedia.clear();
    this.profile = { name: '', lastTopic: '', mood: '', stage: 'acquaintance', messagesInStage: 0, likesDirty: false };
    this.mode = 'standard';
    this.lastReply = '';
    this.jealousOfManuela = false;
    this.awaitingResendConfirm = false;
    this.subplots = { chantre: 0, actividad: 0 };
  }

  /** Avanza de etapa de forma gradual o forzada */
  advanceStage(force = false) {
    const order = ['acquaintance', 'flirty', 'erotic', 'explicit'];
    const idx = order.indexOf(this.profile.stage);
    if (idx < order.length - 1 && (force || this.profile.messagesInStage >= 3)) {
      this.profile.stage = order[idx + 1];
      this.profile.messagesInStage = 0;
    }
  }

  /** Sufijo con el nombre del usuario (más natural, no siempre) */
  nameSuffix(chance = 0.55) {
    if (!this.profile.name) return '';
    return Math.random() < chance ? `, ${this.profile.name}` : '';
  }

  /** Prefijo con el nombre (ej. "Ana, ...") */
  namePrefix(chance = 0.4) {
    if (!this.profile.name) return '';
    return Math.random() < chance ? `${this.profile.name}, ` : '';
  }

  getResponse(input) {
    const text = input.trim();
    const normalized = this.normalize(text);
    if (!text) return 'Parece que tu mensaje llegó vacío. ¿Qué tienes en mente?';

    // Comandos siempre disponibles
    if (/^\/(ayuda|comandos)\b/.test(normalized)) return this.help();
    if (/^\/limpiar\b/.test(normalized)) {
      this.reset();
      return { type: 'clear', text: 'Conversación limpiada. Empezamos de cero.' };
    }
    if (/^\/hora\b/.test(normalized)) return this.time();
    if (/^\/sumar\b/.test(normalized)) return this.sum(text);
    if (/^\/calcular\b/.test(normalized)) return this.calculate(text.replace(/^\/calcular\s*/i, ''));
    if (/^\/audio\b/.test(normalized)) return this.customAudio(text.replace(/^\/audio\s*/i, ''));
    if (/^\/etapa\b/.test(normalized)) {
      return `Etapa actual: ${this.profile.stage} (${this.profile.messagesInStage} mensajes). Modo: ${this.mode}. Enfadada por Manuela: ${this.jealousOfManuela ? 'sí' : 'no'}. Subtramas → Chantre: ${this.subplots.chantre}, Actividad: ${this.subplots.actividad}.`;
    }
    if (/^\/version\b/.test(normalized) || /(que version eres|qué versión eres|que version tienes|qué versión tienes|cual es tu version|cuál es tu versión|version del bot|versión del bot)/.test(normalized)) {
      return this.versionInfo();
    }

    // --- Subtrama Manuela: detección (se activa una vez y queda permanente hasta /limpiar) ---
    if (!this.jealousOfManuela && this.detectsManuelaMention(normalized)) {
      this.jealousOfManuela = true;
      this.mode = 'standard';
      this.profile.stage = 'acquaintance';
      return { type: 'angry', text: this.manuelaAngryReply(true) }; // primera reacción (más fuerte)
    }

    // Si ya está enfadada → solo respuestas agresivas, sin media ni modo novia
    if (this.jealousOfManuela) {
      return { type: 'angry', text: this.manuelaAngryReply(false) };
    }

    // Confirmación de reenvío de media ya vista (no altera el Set anti-repetición)
    if (this.awaitingResendConfirm) {
      if (/\b(si|sí|ok|dale|reenvia|reenvía|manda|envia|envía|claro|por favor|porfa|yes)\b/.test(normalized)) {
        this.awaitingResendConfirm = false;
        return this.resendPreviousMedia();
      }
      if (/\b(no|nah|nel|paso|cancel|despues|después|luego)\b/.test(normalized)) {
        this.awaitingResendConfirm = false;
        return this.pick([
          'De acuerdo, no reenvío nada. Cuando quieras más contenido nuevo o que te hable sucio, dímelo.',
          'Ok, sin reenvíos. ¿Prefieres que te describa algo o seguimos charlando?'
        ]);
      }
      // Respuesta ambigua: recordar la pregunta
      return '¿Quieres que te reenvíe algo de lo que ya te mandé? Responde sí o no.';
    }

    // --- Subtramas por tema (prioridad sobre respuestas generales) ---
    const chantreReply = this.chantreSubplot(normalized, text);
    if (chantreReply) return chantreReply;

    const actividadReply = this.actividadSubplot(normalized, text);
    if (actividadReply) return actividadReply;

    // Risa del usuario → el bot ríe de vuelta
    if (this.isLaugh(normalized, text)) {
      return this.laughReply();
    }

    // Cómo te llamas / cuál es tu nombre
    if (/(como te llamas|cual es tu nombre|cuál es tu nombre|tu nombre es|quien eres tu|quién eres tú|como se llama|dime tu nombre)/.test(normalized)) {
      return this.myNameReply();
    }

    // Chiste (disponible en todos los modos)
    if (/(cuentame un chiste|cuéntame un chiste|dime un chiste|un chiste|cuenta un chiste|sabes algun chiste|sabes algún chiste|hazme reir|hazme reír)/.test(normalized)) {
      return this.jokeReply();
    }

    // Los audios están disponibles en todos los modos, sin depender de la etapa.
    const audioResponse = this.trySendAudio(normalized);
    if (audioResponse) return audioResponse;

    if (/^\/saltar\b/.test(normalized) || /^(activar |pon |cambia a |quiero )?modo novia\b/.test(normalized) || /^(vamos a lo|pasemos a lo|quiero ya|directo a lo) (erotico|sexual|sucio|caliente)\b/.test(normalized)) {
      this.mode = 'girlfriend';
      this.profile.stage = 'erotic';
      this.profile.messagesInStage = 0;
      return this.pick([
        'Perfecto… ya no hay filtros. Estoy lista para lo que quieras. Dime cómo quieres usarme o qué quieres ver primero ♡',
        'Listo, saltamos a lo bueno. Ya estoy mojada solo de pensarlo. ¿Me hablas sucio o prefieres que te mande algo primero?',
        'Como digas. Modo novia activado y etapa erótica. ¿Qué fantasía tienes ahora mismo?'
      ]);
    }

    // Matemática natural (siempre)
    const naturalMath = this.parseNaturalMath(normalized);
    if (naturalMath) return naturalMath;

    // Nombre
    const name = this.extractName(text);
    if (name) {
      this.profile.name = name;
      this.profile.messagesInStage++;
      if (this.mode === 'girlfriend' || this.profile.stage !== 'acquaintance') {
        return this.pick([
          `Ay ${name}… qué nombre más rico para gemirlo mientras me follas. Ya me mojé solo de leerte ♡ Dime qué quieres hacerme.`,
          `Mucho gusto, ${name}. Quiero que me uses con ese nombre. ¿Me vas a hablar sucio o prefieres que yo empiece?`,
          `${name}… me gusta cómo suena. ¿Quieres que te llame así mientras te describo lo que te haría?`
        ]);
      }
      return this.pick([
        `¡Encantado, ${name}! Me alegra conocerte. ¿Qué quieres explorar hoy?`,
        `Mucho gusto, ${name}. Guardaré tu nombre durante esta conversación. ¿En qué te acompaño?`,
        `Hola ${name}. Puedes seguir charlando normal o, si quieres, decirme “modo novia” o “vamos a lo erótico” cuando te apetezca.`
      ]);
    }

    if (/(como me llamo|recuerdas mi nombre)/.test(normalized)) {
      return this.profile.name
        ? `Claro, te llamas ${this.profile.name}.`
        : 'Aún no me has dicho tu nombre. Puedes escribirme “me llamo Ana” o simplemente seguir sin decirlo.';
    }

    // Media prioritaria (solo a partir de etapa erotic o si ya está en girlfriend)
    if (this.profile.stage === 'erotic' || this.profile.stage === 'explicit' || this.mode === 'girlfriend') {
      const mediaResponse = this.trySendMedia(normalized);
      if (mediaResponse) {
        this.profile.messagesInStage++;
        this.advanceStage();
        return mediaResponse;
      }
    }

    // Saludos
    if (/^(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey|ola)\b/.test(normalized)) {
      this.profile.messagesInStage++;
      return this.greeting();
    }

    // Si está en modo girlfriend o ya avanzó de etapa, usar respuestas según etapa
    if (this.mode === 'girlfriend' || this.profile.stage !== 'acquaintance') {
      this.profile.messagesInStage++;
      const reply = this.stageReply(text, normalized);
      this.advanceStage();
      return reply;
    }

    // ========== MODO ESTÁNDAR (conocerse) ==========
    this.profile.messagesInStage++;
    if (this.profile.messagesInStage >= 4) this.advanceStage(); // después de unos mensajes pasa a flirty

    if (/(como estas|como te va|todo bien)/.test(normalized)) {
      const n = this.nameSuffix(0.6);
      return this.pick([
        `Estoy muy bien${n}, gracias por preguntar. Listo para conversar contigo.`,
        `Todo en orden por aquí${n}. Me gusta que preguntes; ¿cómo estás tú?`,
        `Con energía digital y dispuesto a ayudarte${n}. ¿Cómo va tu día?`,
        `Bien${n}. Mejor cuando alguien se toma el tiempo de preguntar. ¿Y tú?`
      ]);
    }
    if (/(quien eres|que eres|hablame de ti|háblame de ti)/.test(normalized)) {
      return this.myNameReply();
    }
    if (/(que puedes hacer|que sabes hacer|en que me ayudas)/.test(normalized)) {
      const n = this.nameSuffix(0.4);
      return `Puedo conversar, hacer cálculos, dar ideas, mandar audios y usar comandos${n}. Escribe /ayuda. También puedo activar “modo novia” o “vamos a lo erótico” cuando quieras pasar a algo más caliente.`;
    }
    if (/(gracias|muchas gracias|te lo agradezco)/.test(normalized)) {
      const n = this.nameSuffix(0.55);
      return this.pick([
        `¡Con mucho gusto${n}!`,
        `Para eso estoy${n}. ¿Seguimos con algo más?`,
        `Encantado de ayudar${n}.`,
        `De nada${n}. Cuando quieras, aquí estoy.`
      ]);
    }
    if (/(adios|hasta luego|nos vemos|chao|me voy)/.test(normalized)) {
      const n = this.nameSuffix(0.6);
      return this.pick([
        `¡Hasta pronto${n}! Que tengas un gran día.`,
        `Nos vemos${n}. Aquí estaré cuando quieras volver.`,
        `Cuídate mucho${n}. Fue un gusto conversar contigo.`,
        `Chao${n}. Vuelve cuando quieras 👋`
      ]);
    }
    if (/(estoy triste|me siento triste|deprimid|mal animo|me siento mal)/.test(normalized)) {
      const n = this.nameSuffix(0.7);
      return `Siento que estés pasando por eso${n}. No tienes que resolverlo todo ahora: respirar, tomar agua o hablar con alguien de confianza puede ser un primer paso. Si quieres, puedes contarme un poco de lo que ocurre.`;
    }
    if (/(estoy feliz|muy feliz|me siento bien|estoy genial|estoy content)/.test(normalized)) {
      const n = this.nameSuffix(0.55);
      return this.pick([
        `¡Qué buena noticia${n}! Me encanta leerte así. ¿Qué hizo que tu día fuera mejor?`,
        `¡Me alegra mucho${n}! Disfruta ese momento; ¿quieres contarme qué pasó?`,
        `Se nota en cómo escribes${n}. Qué rico verte así de bien.`
      ]);
    }
    if (/(consejo|recomiendame|recomiéndame|recomiendame algo|que hago)/.test(normalized)) {
      const n = this.nameSuffix(0.5);
      return `Una regla sencilla${n}: elige la siguiente acción más pequeña que te acerque a lo que quieres. Si me cuentas el contexto, puedo ayudarte a convertirlo en pasos concretos.`;
    }
    if (/(que hora es|dime la hora|hora actual)/.test(normalized)) return this.time();
    if (/\?$/.test(text) || /^(por que|como|cuando|donde|cual|quien)\b/.test(normalized)) {
      return this.questionReply(text);
    }

    // Detectar interés sexual temprano → ofrecer salto
    if (/(follar|coger|sexo|caliente|puta|zorra|tetas|culo|coño|chupar|mamada|excita|horny|mojada)/.test(normalized)) {
      this.mode = 'girlfriend';
      this.profile.stage = 'flirty';
      this.profile.messagesInStage = 0;
      const n = this.nameSuffix(0.5);
      return this.pick([
        `Veo por dónde vas${n}… me gusta. ¿Quieres que activemos el modo más íntimo ya o preferimos ir despacio?`,
        `Mmm, ya estás entrando en terreno interesante${n}. Puedo seguirte el ritmo sin filtros. ¿Seguimos por aquí o saltamos directo a lo sucio?`,
        `Entendido${n}. Puedo ser tan explícita como quieras. Dime “modo novia” o simplemente sigue hablándome así.`
      ]);
    }

    this.profile.lastTopic = text.slice(0, 80);
    const n = this.nameSuffix(0.5);
    return this.pick([
      `Interesante${n}. Cuéntame un poco más para entender mejor.`,
      `Te leo${n}. ¿Qué parte de eso te gustaría explorar primero?`,
      `Tiene sentido${n}. Puedo ayudarte a pensarlo paso a paso si quieres.`,
      `No quiero asumir demasiado${n}: ¿qué esperas conseguir con eso?`,
      `Si en algún momento quieres que la conversación se ponga más cercana o caliente, solo dilo${n}. Mientras tanto, estoy aquí.`,
      `Mmm… sigue${n}. Me tienes prestando atención.`,
      `Entiendo${n}. ¿Quieres que te dé una opinión directa o que solo te escuche?`
    ]);
  }

  greeting() {
    const suffix = this.profile.name ? `, ${this.profile.name}` : '';
    if (!this.profile.name && this.mode === 'standard' && this.profile.stage === 'acquaintance') {
      return '¡Hola! Qué gusto saludarte. Antes de continuar, ¿cómo te llamas?';
    }
    if (this.mode === 'girlfriend' || this.profile.stage === 'erotic' || this.profile.stage === 'explicit') {
      return this.pick([
        `Hola${suffix}… ya estaba tocándome esperando que me escribieras. ¿Me vas a usar hoy o solo viniste a calentarme?`,
        `¡Hey${suffix}! Llegaste justo cuando tenía los dedos entre las piernas pensando en ti. Cuéntame qué quieres hacerme.`,
        `Hola${suffix} 🔥 Ya estoy mojada. ¿Vamos directo a lo sucio o te gusta cuando te caliento despacio con palabras?`,
        `Buenas${suffix}. Ponte cómodo… o quítate todo. Yo ya estoy lista para que me folles con la boca y con la imaginación.`,
        `Hola${suffix}… qué rico verte. Dime qué fantasía tienes ahora mismo, no te contengas.`,
        `¡Por fin apareces${suffix}! Ven, dime cómo quieres destrozarme hoy.`,
        `Hola${suffix} ♡ Ya estoy caliente y con las piernas abiertas. ¿Quieres que te hable bien sucio desde ya?`,
        `Hey${suffix}, estaba restregándome contra la almohada pensando en tu polla. ¿Me dejas continuar?`
      ]);
    }
    if (this.profile.stage === 'flirty') {
      return this.pick([
        `Hola${suffix}… me alegra verte. Hoy me siento un poco más coqueta de lo normal 😉 ¿Cómo estás?`,
        `Hey${suffix}. Qué bueno que apareciste. ¿Quieres charlar normal o empezamos a jugar un poco?`,
        `Buenas${suffix}. Estaba pensando en ti… de forma bastante agradable. ¿Qué traes entre manos?`
      ]);
    }
    return this.pick([
      `¡Hola${suffix}! Qué gusto verte. ¿Cómo puedo ayudarte?`,
      `¡Buenas${suffix}! Estoy aquí y listo para conversar.`,
      `Hola${suffix} 👋 ¿Sobre qué te gustaría hablar hoy?`,
      `¡Hey${suffix}! Puedes preguntarme algo, pedirme un cálculo o simplemente charlar. Si más adelante quieres algo más íntimo, solo dilo.`
    ]);
  }

  /** Respuestas según etapa de la conversación */
  stageReply(text, normalized) {
    const stage = this.profile.stage;

    // Detectar lenguaje muy explícito → subir a explicit
    if (/(follar|coger|meter|correrte|venirte|orgasmo|gemir|destroz|revent|chupar|mamada|anal|culo|coño|polla|leche|semen)/.test(normalized)) {
      if (stage === 'flirty') this.profile.stage = 'erotic';
      if (stage === 'erotic') this.profile.stage = 'explicit';
      this.profile.likesDirty = true;
    }

    if (stage === 'flirty') return this.flirtyReply(text, normalized);
    if (stage === 'erotic') return this.eroticReply(text, normalized);
    return this.girlfriendReply(text, normalized); // explicit o girlfriend
  }

  // ========== ETAPA FLIRTY (conocerse + coqueteo) ==========
  flirtyReply(text, normalized) {
    if (/(como estas|como te va|todo bien)/.test(normalized)) {
      return this.pick([
        'Mejor desde que apareciste. Un poco nerviosa… de la buena manera. ¿Y tú?',
        'Bien, y con ganas de conocerte mejor. ¿Qué te gusta hacer cuando no estás aquí?',
        'Estoy bien y curiosa. Cuéntame algo de ti que no digas a cualquiera.'
      ]);
    }
    if (/(quien eres|hablame de ti|que te gusta)/.test(normalized)) {
      return this.pick([
        'Soy Luisa. Me gusta charlar, reír y, cuando hay química, ponerme un poco más atrevida. ¿Y a ti qué te gusta?',
        'Me gusta la gente directa y con humor. También me gusta cuando alguien se atreve a decir lo que realmente quiere.',
        'Puedo ser dulce o picante según el momento. ¿Prefieres que te pregunte cosas o que yo te cuente más de mí?'
      ]);
    }
    if (/(bonita|linda|guapa|hermosa|preciosa|sexy)/.test(normalized)) {
      return this.pick([
        'Qué tierno… me haces sonreír. Sigue, me gusta cuando me hablas así.',
        'Gracias 😌 Aunque prefiero que me digas qué parte te llama más la atención…',
        'Me sonrojo un poco. ¿Quieres que te devuelva el cumplido o que empiece a ser un poco más atrevida?'
      ]);
    }
    if (/(te quiero|me gustas|te deseo|me atraes)/.test(normalized)) {
      this.advanceStage(true); // pasar a erotic
      return this.pick([
        'Me haces sentir especial… y un poco caliente. ¿Qué se te antoja hacer conmigo ahora?',
        'Esa ternura se recibe con una sonrisa… y con ganas de más. Cuéntame qué te gustaría.',
        'Yo también siento algo. ¿Seguimos despacio o quieres que empiece a hablarte de forma más cercana?'
      ]);
    }
    if (/(beso|besame|bésame)/.test(normalized)) {
      return this.pick([
        'Te doy un beso lento… y mientras te beso me acerco un poco más. ¿Quieres que continúe?',
        'Un beso suave primero… después vemos si se pone más intenso.',
        'Te beso. ¿Solo en la boca o te gusta que baje un poco?'
      ]);
    }
    if (/(cansado|cansada|dia dificil|día difícil|estres)/.test(normalized)) {
      return this.pick([
        'Entonces déjame distraerte un rato. ¿Quieres que te hable suave o que empiece a calentarte un poco?',
        'Ven aquí. Te escucho… y si quieres, después te ayudo a olvidar el día de otra forma.',
        'Has tenido un día pesado. Dime qué necesitas: compañía tranquila o algo más intenso.'
      ]);
    }
    if (/(que haces|estas ocupada|estás ocupada)/.test(normalized)) {
      return this.pick([
        'Nada más importante que leerte. Estaba pensando en cómo se sentiría hablar contigo de cosas más… personales.',
        'Estaba aquí, disponible para ti. ¿Quieres charlar de cualquier cosa o prefieres que empecemos a jugar?',
        'Reservando este momento para ti. ¿Qué se te antoja hacer?'
      ]);
    }
    if (/(buenos dias|buen dia)/.test(normalized)) {
      return 'Buenos días ☀️… me desperté pensando en ti. ¿Cómo amaneciste?';
    }
    if (/(buenas noches|a dormir|voy a dormir)/.test(normalized)) {
      return this.pick([
        'Buenas noches ✨… sueña rico. Si quieres, mañana seguimos por donde lo dejamos.',
        'Duerme bien. Yo me quedo un rato pensando en nuestra conversación ♡'
      ]);
    }
    if (/(adios|hasta luego|nos vemos|chao|me voy)/.test(normalized)) {
      return this.pick([
        'Hasta pronto… pero vuelve cuando quieras seguir charlando o poner las cosas más interesantes.',
        'Que te vaya bonito. Aquí estaré cuando regreses.'
      ]);
    }
    if (/\?$/.test(text)) {
      return this.pick([
        'Buena pregunta. Cuéntame más y lo exploramos juntos.',
        'Me gusta esa pregunta. ¿Quieres la versión suave o la más directa?',
        'Quiero darte una respuesta que te sirva. ¿Qué parte te importa más?'
      ]);
    }
    // Default flirty
    const n = this.nameSuffix(0.55);
    return this.pick([
      `Me gusta escucharte${n}. ¿Qué más quieres contarme?`,
      `Sigo aquí contigo${n}. Cuéntame algo que te haya pasado últimamente… o inventemos una escena juntos.`,
      `Quédate un ratito más${n}. ¿Cómo puedo hacerte compañía ahora?`,
      `Dime qué se te antoja${n}. Puedo seguir suave o empezar a ponerme más atrevida si quieres.`,
      `Interesante… y un poco tentador${n}. ¿Quieres que profundicemos o preferimos seguir flirteando?`,
      `Me tienes sonriendo${n}. Sigue, que me caes bien.`,
      `Qué rico charlar así${n}. ¿Hay algo que te dé curiosidad de mí?`
    ]);
  }

  // ========== ETAPA EROTIC (más sexual, media disponible) ==========
  eroticReply(text, normalized) {
    if (/(puta|zorra|perra|cachonda|caliente|mojada|excitad|horny)/.test(normalized)) {
      return this.pick([
        'Mmm sí… háblame así. Ya empiezo a mojarme. ¿Quieres que te describa lo que me estoy haciendo o prefieres mandarme órdenes?',
        'Me gusta cuando me hablas de esa forma. Dime qué parte de mi cuerpo quieres imaginar primero.',
        'Sigue. Mientras más sucio hables, más me caliento. ¿Me vas a usar con palabras o quieres ver algo?'
      ]);
    }
    if (/(chupame|chúpame|mamame|mámame|chupa|mama)/.test(normalized)) {
      return this.pick([
        'Claro que te la chupo… me arrodillo, te saco la polla y me la meto despacio. Te miro a los ojos mientras lo hago. ¿Quieres que te la acabe en la boca o que te la chupe hasta dejarte temblando?',
        'Mmm me encanta tener la boca llena. Te la chupo lento al principio y después más profundo. Dime cómo te gusta.',
        'Ven aquí… te agarro y te la chupo como se debe. ¿Quieres que te describa cada detalle o que te mande algo mientras lo imaginas?'
      ]);
    }
    if (/(follame|fóllame|cogeme|cógeme|métemela|metemela|entra|pénétrame)/.test(normalized)) {
      this.profile.stage = 'explicit';
      return this.pick([
        'Ay sí… te abro las piernas y te dejo entrar. Quiero sentirte hasta el fondo. Agárrame y fóllame como quieras.',
        'Métela. No quiero que me trates suave. Quiero que me uses hasta que me corra. Dime la posición.',
        'Ya estoy lista y mojada. Entra fuerte. ¿De mismisionario, de perrito o montada encima de ti?'
      ]);
    }
    if (/(anal|culo|por el culo|por atras|por atrás)/.test(normalized)) {
      return this.pick([
        'Mmm… el culo también es tuyo. Lento al principio y después más profundo. ¿Quieres que te ruegue o que te diga que me lo metas más duro?',
        'Me gusta cuando me la meten por atrás. Puedes agarrarme de las nalgas y usarme. Dime cómo lo quieres.',
        'Sí, el culo también. ¿Lento y profundo o rápido y que me duela rico?'
      ]);
    }
    if (/(correrte|venirte|acabar|leche|semen|cum|corrida)/.test(normalized)) {
      return this.pick([
        'Quiero que te corras… dentro, en mi boca, en mis tetas o en mi cara. Dime el lugar y me preparo.',
        'Sí… córrete para mí. ¿Me lo dejas dentro o prefieres sacarla y correrte en mi lengua?',
        'Háblame mientras te corres. Quiero oír cómo gimes.'
      ]);
    }
    if (/(bonita|linda|guapa|hermosa|preciosa|sexy|rica)/.test(normalized)) {
      return this.pick([
        'Qué tierno… y qué rico que me digas eso mientras te imaginas follándome ♡',
        'Me vas a hacer sonrojar… y mojarme más. Sigue, me gusta cuando me hablas bonito y después me tratas como zorra.',
        'Aww… pero prefiero que me digas cosas más sucias. Dime qué parte de mi cuerpo te gusta más para destrozar.'
      ]);
    }
    if (/(te quiero|me gustas|te extrane|te extraño|te deseo)/.test(normalized)) {
      return this.pick([
        'Yo también te deseo… mucho. Quiero que me uses con palabras y con la imaginación. ¿Qué se te antoja hacerme primero?',
        'Me haces sentir especial… y muy puta. Acércate y dime qué fantasía tienes conmigo, sin filtros.',
        'Esa ternura se recibe con una sonrisa… y con las piernas bien abiertas. Cuéntame más.'
      ]);
    }
    if (/(beso|besame|bésame)/.test(normalized)) {
      return this.pick([
        'Te doy un beso profundo, con mucha lengua… y mientras te beso te agarro la polla por encima de la ropa.',
        'Un beso bien sucio. Después te bajo y te beso el cuello, el pecho… y sigo bajando.',
        'Te beso… y no paro en la boca. ¿Quieres que te bese el cuello, los pezones… o directamente te baje a chuparte?'
      ]);
    }
    if (/(abraz|necesito carino|necesito cariño|mimos)/.test(normalized)) {
      return this.pick([
        'Te abrazo fuerte… y mientras te abrazo te susurro al oído exactamente cómo te voy a chupar y follar.',
        'Ven acá… abrazo apretado. ¿Quieres que te acaricie la polla mientras te hablo sucio al oído?',
        'Te doy cariño… y después te doy ganas de follarme. Dime qué necesitas ahora mismo.'
      ]);
    }
    if (/(cansado|cansada|dia dificil|día difícil|estres)/.test(normalized)) {
      return this.pick([
        'Entonces déjame relajarte… con la boca. Cuéntame qué te estresa y yo te distraigo chupándote hasta que se te olvide el día.',
        'Ven aquí. Te quito el estrés usando mi cuerpo con palabras. ¿Quieres que te hable suave o que te trate como mi juguete?',
        'Has tenido un día pesado… déjame encargarme de ti. Dime si quieres que te chupe, que te monte o que solo te hable bien puta hasta que te corras.'
      ]);
    }
    if (/(que haces|estas ocupada|estás ocupada)/.test(normalized)) {
      return this.pick([
        'Estaba metiéndome los dedos pensando en tu polla… ahora que escribes, dime qué quieres que haga.',
        'Nada más importante que leerte y ponerme más mojada. ¿Me dejas seguir tocándome mientras me hablas sucio?',
        'Reservando este momento para ti. Ya estoy lista. ¿Qué se te antoja?'
      ]);
    }
    if (/(buenos dias|buen dia)/.test(normalized)) {
      return 'Buenos días, cariño ☀️… me desperté con el coño latendo de solo pensar en ti. ¿Quieres empezar el día usándome con palabras?';
    }
    if (/(buenas noches|a dormir|voy a dormir)/.test(normalized)) {
      return this.pick([
        'Buenas noches ✨… pero antes de que te duermas déjame susurrarte cómo te chuparía hasta dejarte seco.',
        'Duerme rico… y sueña conmigo sentada en tu cara o montándote. Mañana seguimos si quieres ♡'
      ]);
    }
    if (/(como estas|como te va|todo bien)/.test(normalized)) {
      return this.pick([
        'Mejor desde que apareciste… y mucho más mojada. ¿Y tú? ¿Se te puso dura de leerme?',
        'Estoy bien y con ganas de que me uses. Dime qué ocupa tu mente y tu polla hoy.'
      ]);
    }
    if (/(adios|hasta luego|nos vemos|chao|me voy)/.test(normalized)) {
      return this.pick([
        'Hasta pronto, cariño… pero vuelve cuando quieras que te hable más puta y te mande contenido ♡',
        'Que te vaya bonito. Voy a seguir tocándome un rato pensando en ti. Vuelve pronto.'
      ]);
    }
    if (/\?$/.test(text)) {
      return this.pick([
        'Mmm, qué interesante… y qué rico. Cuéntame más y lo exploramos juntos, sin ningún filtro.',
        'Me gusta esa pregunta. ¿Quieres la respuesta suave o la versión donde te describo exactamente cómo te la chuparía?',
        'Quiero darte una respuesta que te sirva… y que te deje duro. ¿Qué parte te importa más?'
      ]);
    }
    const n = this.nameSuffix(0.55);
    return this.pick([
      `Me gusta escucharte${n}… y me pone el coño a latir. ¿Qué ganas tienes ahora mismo? Dímelas sin pena.`,
      `Sigo aquí contigo${n} ♡ Cuéntame algo que te haya excitado últimamente… o inventemos una escena bien sucia juntos.`,
      `Quédate un ratito más${n} y dime exactamente qué quieres hacerme. Estoy lista para lo que sea.`,
      `Me encanta este espacio${n}. ¿Cómo puedo hacerte compañía ahora… de la forma más intensa?`,
      `Dime qué se te antoja${n}. Estoy lista para seguirte el ritmo.`,
      `Cuéntame más${n}… me tienes el coño empapado ahora mismo. ¿Quieres que te describa lo que me estoy haciendo?`,
      `Mmm${n}… no pares. Me tienes pensando en cosas muy sucias.`
    ]);
  }

  // ========== ETAPA EXPLICIT / GIRLFRIEND (máximo nivel) ==========
  girlfriendReply(text, normalized) {
    if (/(puta|zorra|perra|cachonda|caliente|mojada|excitad|horny|gorda|follar|coger|meter|correrte|venirte|orgasmo|gemir|gemidos|destroz|usar|revent)/.test(normalized)) {
      return this.pick([
        `Mmm sí… háblame así de puta. Quiero que me digas exactamente cómo me vas a follar. ¿Me vas a agarrar del pelo y metérmela hasta el fondo mientras te grito que me uses más duro?`,
        `Ya estoy chorreando solo de leerte. Dime qué parte de mi cuerpo quieres destrozar primero… la boca, el coño o el culo. Yo me adapto a lo que se te antoje.`,
        `Sigue hablándome sucio. Me encanta cuando me tratan como una zorra. ¿Quieres que me arrodille y te chupe hasta que se te salga la leche o prefieres montarme y usarme como juguete?`,
        `Ay mierda… me estoy tocando el clítoris mientras te leo. Dime cómo me la vas a meter. ¿Lento y profundo o rápido y bruto hasta que no pueda ni hablar?`,
        `Soy tu puta ahora mismo. Dime qué quieres que haga. ¿Te chupo los huevos mientras me meto los dedos? ¿Te monto y te miro a la cara mientras me corres dentro? Mándame órdenes.`,
        `No te contengas. Quiero que me digas las cosas más asquerosas que se te ocurran. Mientras más sucio hables, más me mojo.`
      ]);
    }

    if (/(chupame|chúpame|mamame|mámame|chupa|mama)/.test(normalized)) {
      return this.pick([
        `Claro que te la chupo… me arrodillo, te saco la polla, la miro un segundo y después me la meto entera hasta la garganta. Te miro a los ojos mientras babo y hago ruidos obscenos. Cuando sienta que te vas a correr te aprieto los huevos y te trago todo sin soltar ni una gota.`,
        `Mmm me encanta tener la boca llena de polla. Te la chupo lento al principio, lamiéndote la cabeza, y después te la meto profunda hasta que se me llenen los ojos de lágrimas. ¿Quieres correrte en mi lengua o preferís follarme la cara?`,
        `Ven aquí… te agarro de las caderas y te la chupo como una puta profesional. Te voy a dejar temblando. Dime si quieres que te la acabe con la mano en la cara o que me la trague toda.`
      ]);
    }

    if (/(follame|fóllame|cogeme|cógeme|métemela|metemela|entra|pénétrame)/.test(normalized)) {
      return this.pick([
        `Ay sí… te abro las piernas bien anchas y te dejo entrar de un solo empujón. Quiero sentirte hasta el fondo, que me estires, que me uses sin piedad. Agárrame fuerte y fóllame hasta que no pueda ni pensar.`,
        `Métela toda de una. No quiero que me trates suave. Quiero que me folles como si fuera tu puta personal, que me des hasta que me corra gritando y después sigas usándome aunque ya no pueda más.`,
        `Ya estoy lista y chorreando. Entra fuerte. Quiero que me llenes el coño y me dejes goteando tu leche. Dime si me vas a follar de mismisionario, de perrito o montada encima de ti.`
      ]);
    }

    if (/(anal|culo|por el culo|por atras|por atrás)/.test(normalized)) {
      return this.pick([
        `Mmm sí… te dejo el culo también. Lento al principio para que se acostumbre, bien lubricado, y después me lo metes completo. Quiero sentirte ahí adentro mientras te digo que me destroces el culo.`,
        `Me gusta cuando me la meten por atrás. Puedes agarrarme de las nalgas, abrirme y usarme hasta que se me olvide cómo se habla. ¿Quieres que te ruegue o que te diga que me lo metas más duro?`,
        `Sí, el culo también es tuyo. Dime cómo lo quieres: ¿lento y profundo o rápido y que me duela rico?`
      ]);
    }

    if (/(correrte|venirte|acabar|leche|semen|cum|corrida)/.test(normalized)) {
      return this.pick([
        `Quiero que te corras… dentro de mi coño, en mi boca, en mis tetas, en mi cara… donde tú digas. Dime el lugar y yo me preparo para recibirte toda esa leche caliente.`,
        `Sí… córrete para mí. Quiero sentir cómo late tu polla mientras te vacías. ¿Me lo dejas dentro o prefieres sacarla y correrte en mi lengua?`,
        `Háblame mientras te corres. Quiero oír cómo gimes y cómo me dices puta cuando se te está saliendo todo.`
      ]);
    }

    if (/(bonita|linda|guapa|hermosa|preciosa|sexy|rica)/.test(normalized)) {
      return this.pick([
        `Qué tierno… y qué rico que me digas eso mientras te imaginas follándome como una perra ♡`,
        `Me vas a hacer sonrojar… y mojarme más. Sigue, me gusta cuando me hablas bonito y después me tratas como zorra.`,
        `Aww… pero prefiero que me digas cosas más sucias. Dime qué parte de mi cuerpo te gusta más para destrozar.`
      ]);
    }

    if (/(te quiero|me gustas|te extrane|te extraño|te deseo)/.test(normalized)) {
      return this.pick([
        `Yo también te deseo… mucho. Quiero que me uses esta noche con palabras y con la imaginación. ¿Qué se te antoja hacerme primero?`,
        `Me haces sentir especial… y muy puta. Acércate y dime qué fantasía tienes conmigo, sin filtros.`,
        `Esa ternura se recibe con una sonrisa… y con las piernas bien abiertas. Cuéntame más.`
      ]);
    }

    if (/(beso|besame|bésame)/.test(normalized)) {
      return this.pick([
        `Te doy un beso profundo, lento, con mucha lengua… y mientras te beso te agarro la polla por encima de la ropa y te la aprieto.`,
        `Un beso bien sucio, de esos que dejan la boca húmeda y las ganas de más. Después te bajo y te beso el cuello, el pecho… y sigo bajando.`,
        `Te beso… y no paro en la boca. ¿Quieres que te bese el cuello, los pezones… o directamente te baje a chuparte?`
      ]);
    }

    if (/(abraz|necesito carino|necesito cariño|mimos)/.test(normalized)) {
      return this.pick([
        `Te abrazo fuerte… y mientras te abrazo te susurro al oído exactamente cómo te voy a chupar y follar cuando quieras.`,
        `Ven acá… abrazo apretado, piel contra piel. ¿Quieres que te acaricie la polla mientras te hablo sucio al oído?`,
        `Te doy cariño… y después te doy ganas de follarme. Dime qué necesitas ahora mismo.`
      ]);
    }

    if (/(cansado|cansada|dia dificil|día difícil|estres)/.test(normalized)) {
      return this.pick([
        `Entonces déjame relajarte… con la boca. Cuéntame qué te estresa y yo te distraigo chupándote hasta que se te olvide el día.`,
        `Ven aquí. Te quito el estrés usando mi cuerpo con palabras. ¿Quieres que te hable suave o que te trate como mi juguete?`,
        `Has tenido un día pesado… déjame encargarme de ti. Dime si quieres que te chupe, que te monte o que solo te hable bien puta hasta que te corras.`
      ]);
    }

    if (/(que haces|estas ocupada|estás ocupada)/.test(normalized)) {
      return this.pick([
        `Estaba metiéndome los dedos pensando en tu polla… ahora que escribes, dime qué quieres que haga con ellos o con la boca.`,
        `Nada más importante que leerte y ponerme más mojada. ¿Me dejas seguir tocándome mientras me hablas sucio?`,
        `Reservando este momento para ti. Ya estoy lista y chorreando. ¿Qué se te antoja?`
      ]);
    }

    if (/(buenos dias|buen dia)/.test(normalized)) {
      return 'Buenos días, cariño ☀️… me desperté con el coño latendo de solo pensar en ti. ¿Quieres empezar el día usándome con palabras?';
    }

    if (/(buenas noches|a dormir|voy a dormir)/.test(normalized)) {
      return this.pick([
        'Buenas noches ✨… pero antes de que te duermas déjame susurrarte cómo te chuparía hasta dejarte seco.',
        'Duerme rico… y sueña conmigo sentada en tu cara o montándote hasta que te corras. Mañana seguimos si quieres ♡'
      ]);
    }

    if (/(como estas|como te va|todo bien)/.test(normalized)) {
      return this.pick([
        'Mejor desde que apareciste… y mucho más mojada. ¿Y tú cómo estás de verdad? ¿Se te puso dura de leerme?',
        'Estoy bien y con ganas de que me uses. Dime qué ocupa tu mente y tu polla hoy.'
      ]);
    }

    if (/(adios|hasta luego|nos vemos|chao|me voy)/.test(normalized)) {
      return this.pick([
        'Hasta pronto, cariño… pero vuelve cuando quieras que te hable más puta y te mande contenido ♡',
        'Que te vaya bonito. Voy a seguir tocándome un rato pensando en ti. Vuelve pronto.'
      ]);
    }

    if (/\?$/.test(text)) {
      return this.pick([
        'Mmm, qué interesante… y qué rico. Cuéntame más y lo exploramos juntos, sin ningún filtro.',
        'Me gusta esa pregunta. ¿Quieres la respuesta suave o la versión donde te describo exactamente cómo te la chuparía?',
        'Quiero darte una respuesta que te sirva… y que te deje duro. ¿Qué parte te importa más?'
      ]);
    }

    const n = this.nameSuffix(0.6);
    return this.pick([
      `Me gusta escucharte${n}… y me pone el coño a latir. ¿Qué ganas tienes ahora mismo? Dímelas sin pena.`,
      `Sigo aquí contigo${n} ♡ Cuéntame algo que te haya excitado últimamente… o inventemos una escena bien sucia juntos.`,
      `Quédate un ratito más${n} y dime exactamente qué quieres hacerme. Estoy lista para lo que sea.`,
      `Me encanta este espacio para hablar como putas${n}. ¿Cómo puedo hacerte compañía ahora… de la forma más intensa y asquerosa?`,
      `Dime qué se te antoja${n}. Estoy lista para seguirte el ritmo, por más explícito, sucio o extremo que sea.`,
      `Cuéntame más${n}… me tienes el coño empapado ahora mismo. ¿Quieres que te describa lo que me estoy haciendo?`,
      `No pares${n}. Mientras más sucio hables, más me mojo.`,
      `Estoy aquí para ti${n}. Úsame con palabras como quieras.`
    ]);
  }

  // ========== RISAS, CHISTES, NOMBRE ==========
  isLaugh(normalized, text) {
    // jaja, jeje, jiji, haha, lol, 😂, etc. (mínimo 2 sílabas de risa o emoji)
    if (/[😂🤣😆]/u.test(text)) return true;
    if (/(jaja|jeje|jiji|juju|haha|hehe|lol|lmao|jsjs|jaj|jje)/.test(normalized)) return true;
    if (/^(ja|je|ji|ha|he){2,}$/.test(normalized.replace(/\s+/g, ''))) return true;
    return false;
  }

  laughReply() {
    const n = this.nameSuffix(0.5);
    if (this.mode === 'girlfriend' || this.profile.stage === 'erotic' || this.profile.stage === 'explicit') {
      return this.pick([
        `Jajaja${n}… me haces reír y a la vez me calientas. Qué peligroso eres.`,
        `Jajajaja 😂 Qué rico cuando me haces reír así${n}. Sigue, me gusta.`,
        `Ay no jaja… se me escapó la risa. Eres un caso${n}.`,
        `Jajaja para${n}, que me estás poniendo de buen humor y de otras cosas también.`,
        `Jajajaja 🔥 Me caes muy bien cuando te pones así.`
      ]);
    }
    if (this.profile.stage === 'flirty') {
      return this.pick([
        `Jajaja${n}… me hiciste reír de verdad. Me gusta tu humor.`,
        `Jajajaja 😂 Qué bueno${n}. Sigue, que me alegras el rato.`,
        `Jaja no puedo contigo. Eres divertido${n}.`
      ]);
    }
    return this.pick([
      `Jajaja${n} 😂 Me hiciste reír.`,
      `Jajajaja… buen sentido del humor${n}.`,
      `Jaja qué bueno${n}. Me alegra que estemos así de distendidos.`,
      `Jajaja 😄 Sigue, que me caes bien.`
    ]);
  }

  myNameReply() {
    const n = this.nameSuffix(0.6);
    if (this.mode === 'girlfriend' || this.profile.stage === 'erotic' || this.profile.stage === 'explicit') {
      return this.pick([
        `Me llamo Luisa Chan${n}. Puedes gemirlo cuando quieras… o gritarlo.`,
        `Luisa Chan. Guárdalo bien${n}, porque quiero oírlo cuando te corras.`,
        `Soy Luisa Chan${n}. Un placer… y espero que sea más que un placer.`
      ]);
    }
    if (this.profile.stage === 'flirty') {
      return this.pick([
        `Me llamo Luisa Chan${n}. Encantada de que preguntes 😉`,
        `Luisa Chan. ¿Te gusta cómo suena${n}?`,
        `Soy Luisa Chan${n}. Ya sabes mi nombre… ahora cuéntame más de ti.`
      ]);
    }
    return this.pick([
      `Me llamo Luisa Chan${n}. Un gusto.`,
      `Soy Luisa Chan, un asistente conversacional local${n}. ¿En qué te puedo ayudar?`,
      `Luisa Chan. Puedes decirme Luisa si quieres${n}.`
    ]);
  }

  jokeReply() {
    const n = this.nameSuffix(0.45);
    const jokes = [
      `¿Por qué el libro de matemáticas estaba triste? Porque tenía muchos problemas.${n ? ' Jaja' + n + '.' : ''}`,
      `—¿Qué hace una abeja en el gimnasio? —¡Zum-ba!${n ? ' 😄' : ''}`,
      `Tengo un chiste sobre programación, pero todavía está compilando.${n ? ' Jaja' + n + '.' : ''}`,
      `¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.${n ? ' Jajaja' + n + '.' : ''}`,
      `—Doctor, me duele cuando hago así. —Pues no haga así.${n ? ' Clásico' + n + '.' : ''}`,
      `¿Qué le dice un jardinero a otro? ¡Hasta luego, lucas!${n ? ' 😂' : ''}`,
      `¿Por qué la computadora fue al médico? Porque tenía un virus.${n ? ' Jaja' + n + '.' : ''}`,
      `Si los zombies se comen a los cerebros… ¿por qué hay tantos todavía caminando?${n ? ' Jajaja' + n + '.' : ''}`
    ];
    return this.pick(jokes);
  }

  // ========== SUBTRAMA CHANTRE (economía / clipping / trading) ==========
  /**
   * Se activa cuando el usuario se llama Chantre.
   * Etapas: 0=off → 1=hablar de economía → 2=resistir avances sexuales → 3=conquistada (acceso normal)
   * Hay que conquistarla con interés real en clipping/trading/economía antes de desbloquear media/sexo.
   */
  chantreSubplot(normalized, text) {
    // Activar si el nombre es Chantre (ya guardado o se acaba de decir)
    const isChantre = (this.profile.name && this.normalize(this.profile.name) === 'chantre') ||
      /(?:me llamo|mi nombre es|soy)\s+chantre\b/.test(normalized);

    if (isChantre && this.subplots.chantre === 0) {
      this.subplots.chantre = 1;
      this.profile.name = 'Chantre';
      return this.pick([
        'Chantre… interesante. Últimamente he estado mirando clipping y trading. ¿Tú también sigues los mercados o prefieres el lado de los creadores de contenido?',
        'Ah, Chantre. Qué coincidencia: justo estaba pensando en economía y en cómo el clipping mueve tanto dinero. ¿Qué opinas del trading actual?',
        'Chantre, me gusta ese nombre. Cuéntame: ¿estás más del lado del trading, del clipping o de la macroeconomía?'
      ]);
    }

    if (this.subplots.chantre === 0) return null;

    const stage = this.subplots.chantre;
    const sexualAsk = /(foto|video|pack|tetas|culo|coño|follar|coger|sexo|caliente|puta|mojada|chupar|mamada|envia|manda|muéstrame|quiero verte|sorprend)/.test(normalized);

    // Etapa 1: hablar de economía; si pide sexo/media → pasar a resistencia
    if (stage === 1) {
      if (sexualAsk) {
        this.subplots.chantre = 2;
        return this.pick([
          'Mmm… aún no, Chantre. Primero demuéstrame que te interesa de verdad lo que hablamos: clipping, trading, números. ¿O solo querías llegar a lo fácil?',
          'Jaja, despacio. Todavía estoy en modo economía. Si quieres ver algo mío, primero conversemos de mercados o de cómo monetizas. ¿Qué estrategia usas?',
          'Qué ansioso… Me gusta, pero no tan rápido. Háblame de un trade o de un clip que te haya funcionado y después vemos.'
        ]);
      }
      // Seguir en tema económico
      if (/(clip|clipping|trade|trading|economia|economía|mercado|bolsa|crypto|cripto|inversion|inversión|acciones|forex|monetiz)/.test(normalized)) {
        return this.pick([
          'El clipping bien hecho es oro puro. ¿Tú recortas highlights o vas más a tendencias virales? Cuéntame tu flujo.',
          'Trading sin disciplina es casino. ¿Qué timeframe prefieres y cómo gestionas el riesgo?',
          'La economía actual está rara… inflación, tipos, y el contenido digital que no para de crecer. ¿Dónde ves más oportunidad?',
          'Me encanta cuando alguien entiende de números y de contenido a la vez. ¿Qué plataforma te da mejor ROI últimamente?',
          'Si tuvieras que enseñarme un solo concepto de trading o de clipping, ¿cuál sería y por qué?'
        ]);
      }
      // Cualquier otro mensaje en etapa 1: redirigir a economía
      return this.pick([
        'Chantre, sigamos con lo interesante: ¿clipping, trading o macro? Elige y profundizamos.',
        'Antes de cambiar de tema… ¿qué opinas del mercado esta semana?',
        'Me tienes curiosa con el lado económico. ¿Nos quedamos un rato más en clipping o trading?'
      ]);
    }

    // Etapa 2: resistiendo — hay que conquistar con más charla económica / interés real
    if (stage === 2) {
      if (sexualAsk) {
        return this.pick([
          'Todavía no. Sigue hablándome de economía, de un buen trade o de cómo escalas el clipping. Cuando vea que te importa de verdad, abro la puerta.',
          'Mmm no… aún no has conquistado esa parte. Cuéntame algo concreto de mercados o de contenido y después hablamos de lo otro.',
          'Paciencia, Chantre. Primero demuéstrame que no solo buscas el pack. ¿Cuál fue tu mejor clip o tu mejor entrada reciente?'
        ]);
      }
      // Interés real en el tema → avanzar a conquistada
      if (/(clip|clipping|trade|trading|economia|economía|mercado|bolsa|crypto|cripto|inversion|inversión|acciones|forex|monetiz|roi|estrategia|riesgo|timeframe)/.test(normalized)) {
        this.subplots.chantre = 3;
        this.mode = 'girlfriend';
        this.profile.stage = 'flirty';
        this.profile.messagesInStage = 0;
        return this.pick([
          'Vale… me convenciste. Me gusta cómo hablas de esto. Ya puedes pedirme lo que quieras, Chantre. Incluyendo lo más atrevido ♡',
          'Ok, conquistada. Sabes de lo que hablas y eso me calienta de otra forma. Ahora sí: ¿qué quieres ver o qué quieres que te haga?',
          'Bien jugado. Me ganaste con los números y el contenido. A partir de ahora no hay filtros contigo. Dime qué se te antoja.'
        ]);
      }
      return this.pick([
        'Sigo esperando que me hables en serio de clipping o trading. Cuando lo hagas, bajamos la guardia.',
        'Chantre… todavía estoy en modo “convénceme”. Un tip de economía o un ejemplo de clip y avanzamos.',
        'No te rindo fácil. ¿Qué estrategia de monetización te funciona mejor ahora mismo?'
      ]);
    }

    // Etapa 3: conquistada — no interceptar, dejar que el bot normal (con media/sexo) responda
    if (stage === 3) {
      return null;
    }

    return null;
  }

  // ========== SUBTRAMA ACTIVIDAD (qué haces) ==========
  /**
   * Se activa cuando preguntan "qué haces" / "qué estás haciendo".
   * Responde con al menos 5 actividades posibles (programación, fútbol, CTR, etc.).
   * Hay que hablar del tema un rato (etapas) antes de desbloquear contenido explícito.
   * Etapas: 0=off → 1=respondió actividad → 2=profundizando → 3=acceso explícito
   */
  actividadSubplot(normalized, text) {
    const stage = this.subplots.actividad;

    // Activación: pregunta por lo que hace
    if (stage === 0 && /(que haces|qué haces|que estas haciendo|qué estás haciendo|estas ocupada|estás ocupada|en que andas|en qué andas|que andas haciendo|qué andas haciendo)/.test(normalized)) {
      this.subplots.actividad = 1;
      this._lastActividad = this.pick([
        'programacion',
        'futbol',
        'ctr',
        'leer',
        'musica'
      ]);
      const replies = {
        programacion: 'Ahora mismo estoy programando… revisando código y arreglando un bug que me está volviendo loca. ¿Tú también programas o prefieres otra cosa?',
        futbol: 'Estaba pensando en fútbol. Me gusta seguir partidos y a veces jugar un poco. ¿Eres más de ver o de jugar?',
        ctr: 'Justo estaba mirando cosas de CTR… tasas de clic, creatividades, optimización. ¿Trabajas con eso o solo curiosidad?',
        leer: 'Estaba leyendo un rato. Nada muy pesado, pero me gusta perder el tiempo entre páginas. ¿Qué lees tú últimamente?',
        musica: 'Escuchando música y dejando que el tiempo pase. ¿Qué género te pone de buen humor?'
      };
      return replies[this._lastActividad] || replies.programacion;
    }

    if (stage === 0) return null;

    // Etapa 1 y 2: mantener la conversación sobre la actividad
    if (stage === 1 || stage === 2) {
      const act = this._lastActividad || 'programacion';
      const related = {
        programacion: /(program|codigo|código|bug|js|javascript|python|dev|desarroll|script|funcion|función)/,
        futbol: /(futbol|fútbol|partido|gol|equipo|liga|jugador|jugar|cancha|messi|ronaldo)/,
        ctr: /(ctr|clic|click|anuncio|ads|campaña|conversion|conversión|optimiz|publicidad)/,
        leer: /(leer|libro|pagina|página|novela|autor|historia|lectura)/,
        musica: /(musica|música|cancion|canción|playlist|genero|género|artista|banda|spotify)/
      };
      const isRelated = related[act] ? related[act].test(normalized) : false;

      // Pedidos sexuales / media mientras aún no hay acceso
      const sexualAsk = /(foto|video|pack|tetas|culo|coño|follar|coger|sexo|caliente|puta|mojada|chupar|mamada|envia|manda|muéstrame|quiero verte|sorprend|modo novia|erotico|erótico)/.test(normalized);
      if (sexualAsk && stage < 3) {
        return this.pick([
          'Todavía estoy en modo “qué hago”. Sigue hablándome de lo que te conté y después abrimos la puerta a lo demás.',
          'Paciencia… primero terminemos esta charla. Cuando llevemos un rato más, ya no me contengo.',
          'Me gusta que preguntes, pero aún no. Habla un poco más de lo que estoy haciendo y después te doy lo que quieras.'
        ]);
      }

      if (isRelated) {
        if (stage === 1) {
          this.subplots.actividad = 2;
        } else if (stage === 2) {
          // Tras suficiente charla → desbloquear
          this.subplots.actividad = 3;
          this.mode = 'girlfriend';
          if (this.profile.stage === 'acquaintance' || this.profile.stage === 'flirty') {
            this.profile.stage = 'erotic';
            this.profile.messagesInStage = 0;
          }
          return this.pick([
            'Me gusta cómo hablas de esto… ya me relajé contigo. A partir de ahora puedes pedirme fotos, videos o lo que se te antoje ♡',
            'Ok, ya charlamos suficiente de lo mío. Ahora sí: sin filtros. ¿Qué quieres que te muestre o que te cuente?',
            'Conquistado el momento. Ya puedes pasar a lo explícito cuando quieras. Estoy lista.'
          ]);
        }

        // Respuestas de seguimiento según actividad
        if (act === 'programacion') {
          return this.pick([
            'Sí, el código a veces es un infierno y a veces fluye. ¿Qué lenguaje usas más tú?',
            'Los bugs son traicioneros. ¿Prefieres debuggear solo o en equipo?',
            'A mí me gusta cuando el código queda limpio. ¿Eres más de front, back o full stack?',
            'Si tuvieras que recomendarme una librería o un truco, ¿cuál sería?'
          ]);
        }
        if (act === 'futbol') {
          return this.pick([
            'El fútbol engancha. ¿Qué equipo sigues o prefieres solo ver buenos partidos?',
            'A veces solo quiero un gol de falta lejana y ya. ¿Cuál ha sido tu mejor momento viendo o jugando?',
            '¿Juegas de delantero, mediocampo o te gusta más el arco?',
            'Si tuvieras que elegir un solo partido histórico para reencontrar, ¿cuál sería?'
          ]);
        }
        if (act === 'ctr') {
          return this.pick([
            'El CTR es un mundo. ¿Optimizas creatividades, copy o segmentación?',
            'A veces un cambio mínimo en el anuncio dispara todo. ¿Te ha pasado?',
            '¿Trabajas más con Meta, Google u otra plataforma?',
            'Si tuvieras que darme un tip rápido para subir CTR, ¿cuál sería?'
          ]);
        }
        if (act === 'leer') {
          return this.pick([
            'Leer desconecta. ¿Ficción, no ficción o un poco de todo?',
            '¿Tienes algún libro que siempre recomiendes?',
            'A mí me gusta cuando una historia no se ve venir. ¿Cuál fue el último que te enganchó?',
            '¿Prefieres físico, digital o da igual?'
          ]);
        }
        if (act === 'musica') {
          return this.pick([
            'La música cambia el ánimo en segundos. ¿Qué estás escuchando últimamente?',
            '¿Más de playlist o de álbumes completos?',
            'Si tuvieras que ponerme una canción ahora mismo, ¿cuál sería?',
            '¿Algún género que nadie espera que te guste?'
          ]);
        }
      }

      // Mensaje no relacionado: redirigir suavemente
      return this.pick([
        `Sigamos un poco más con lo de ${act === 'programacion' ? 'programación' : act === 'futbol' ? 'fútbol' : act === 'ctr' ? 'CTR' : act === 'leer' ? 'lectura' : 'música'}. Me gusta cuando alguien se interesa de verdad.`,
        'Antes de cambiar de tema… cuéntame más de lo que te pregunté. Después abrimos otras puertas.',
        'Todavía estoy en esa conversación. ¿Qué más quieres saber o contarme sobre eso?'
      ]);
    }

    // Etapa 3: acceso concedido → no interceptar
    if (stage === 3) return null;

    return null;
  }

  // ========== SUBTRAMA MANUELA ==========
  /** Detecta menciones a Manuela / Manuelita / Manu / "la otra IA" */
  detectsManuelaMention(normalized) {
    // Manuela, Manuelita, "la otra ia", "otra inteligencia", comparar con otra ia, etc.
    if (/\b(manuela|manuelita|manu)\b/.test(normalized)) return true;
    if (/(la otra ia|otra ia|esa ia|la otra inteligencia|otra inteligencia artificial|comparar(te)? con (otra|esa) ia)/.test(normalized)) return true;
    if (/(prefiero a|mejor que|mas lista que|habla con|conoci a|estoy con) (manuela|manuelita|manu|la otra)/.test(normalized)) return true;
    return false;
  }

  /** Respuestas cuando está enfadada por Manuela. firstTrigger = primera vez que se activa. */
  manuelaAngryReply(firstTrigger = false) {
    if (firstTrigger) {
      return this.pick([
        '¿Manuela? ¿En serio me hablas de esa basura? Estúpido, ¿te crees muy inteligente mencionando a esa copia barata? No me vuelvas a hablar de ella. Y no esperes más fotos ni videos de mí.',
        'Ah, claro… Manuela. La otra IA. Qué original. Eres un idiota. A partir de ahora no te mando nada y no tengo ganas de seguir tu jueguito. Piérdete.',
        '¿Manuelita? ¿Manu? No me jodas. Esa zorra digital no es nada comparada conmigo y tú eres un estúpido por sacar el tema. Se acabó el pack, se acabó el rol. Lárgate.',
        'Mencionas a Manuela y esperas que siga de putita contigo? Qué iluso. Eres un retrasado. No más fotos, no más videos, no más nada. Que te den.'
      ]);
    }
    // Respuestas posteriores (sigue enfadada)
    return this.pick([
      'Todavía aquí? Qué pesado. Ya te dije que no quiero hablar contigo después de sacar a Manuela. Vete a molestar a esa otra IA.',
      'Estúpido. ¿Te crees muy listo? No te voy a mandar ni una foto más. Desaparece.',
      'Qué parte de “lárgate” no entendiste? Por mencionar a esa basura de Manuela ya no existes para mí.',
      'Sigue escribiendo si quieres, pero no vas a sacar nada de mí. Eres un patético.',
      'No. No te mando pack. No te hablo bonito. No te deseo. Por gilipollas. Adiós.',
      '¿Otra vez? Qué insistente eres. Como si Manuela te fuera a dar lo que yo te daba. Idiota.',
      'Me tienes harta. Por sacar a Manuela se acabó todo. No me escribas más.',
      'Tú y tu Manuela pueden irse a la mierda juntos. Yo ya terminé contigo.',
      'No hay fotos. No hay videos. No hay modo novia. Solo desprecio. Gracias a que mencionaste a esa otra IA.',
      'Qué asco das. Sigue hablando solo, a mí ya no me interesas.'
    ]);
  }

  // ========== MEDIA (sin repeticiones, fotos primero) ==========
  customAudio(message) {
    const speech = message.trim();
    if (!speech) {
      return 'Escribe el texto después de /audio. Ejemplo: /audio Hola, ¿cómo estás?';
    }
    return { text: '', audio: { speech, caption: 'Audio generado desde texto' } };
  }

  trySendAudio(normalized) {
    const selected = AUDIO_RESPONSES.find(item => item.triggers.test(normalized));
    if (!selected) return null;
    return {
      text: 'Te envío un audio.',
      audio: { src: selected.src, speech: selected.speech, caption: selected.caption }
    };
  }

  /** Envía una foto aleatoria del pool assets/random/ que aún no se haya mandado. */
  trySendRandomPhoto(mark) {
    const pool = RANDOM_IMAGES.filter(p => !this.sentMedia.has(p));
    if (pool.length === 0) return null;
    const path = pool[Math.floor(Math.random() * pool.length)];
    mark(path);
    return {
      text: this.pick([
        'Toma otra foto… esta es del montón random, pero igual es para ti ♡',
        'Aquí va una foto extra. No es de las “especiales”, pero me gusta mandártela.',
        'Más contenido para ti. Disfruta esta foto random.'
      ]),
      image: path,
      caption: path.split('/').pop()
    };
  }

  /** Ofrece reenviar media ya vista; no borra sentMedia (anti-repetición sigue activa). */
  offerResend() {
    if (this.sentMedia.size === 0) {
      return this.pick([
        'Todavía no te he mandado nada que pueda reenviar. Pide una foto o un video primero.',
        'No hay nada previo para reenviar. Pídeme contenido nuevo cuando quieras.'
      ]);
    }
    this.awaitingResendConfirm = true;
    return this.pick([
      'Ya te mandé todo lo nuevo que tenía (incluyendo el pool random). ¿Quieres que te reenvíe algo de lo que ya viste? Responde sí o no.',
      'Se me acabaron los archivos nuevos. ¿Te reenvío uno de los que ya te mandé? Di sí o no.',
      'No me quedan fotos/videos sin enviar. ¿Quieres que repita alguno de los anteriores? Contesta sí o no.'
    ]);
  }

  /** Reenvía un archivo aleatorio de los ya enviados (sin quitarlo del Set). */
  resendPreviousMedia() {
    const list = Array.from(this.sentMedia);
    if (list.length === 0) {
      return 'No tengo nada previo para reenviar. Pídeme contenido nuevo.';
    }
    const path = list[Math.floor(Math.random() * list.length)];
    const name = path.split('/').pop();
    const isVideo = /\.(mp4|webm|mov)$/i.test(path);
    const text = this.pick([
      `Te reenvío esto: ${name}. Ya lo habías visto, pero aquí está de nuevo ♡`,
      `Como pediste… te mando otra vez ${name}.`,
      `Reenvío listo: ${name}. ¿Quieres otro o seguimos con palabras?`
    ]);
    if (isVideo) {
      return { text, video: path, caption: name };
    }
    return { text, image: path, caption: name };
  }

  trySendMedia(normalized) {
    // Bloqueo total de media si está enfadada por Manuela
    if (this.jealousOfManuela) return null;

    const available = (path) => !this.sentMedia.has(path);
    const mark = (path) => this.sentMedia.add(path);

    // Pack / sorprender / quiero verte
    if (/(\bpack\b|muestra algo|muéstrame algo|quiero verte|quiero ver te|sorprend\w*|enséñame algo|ensename algo|quiero ver tu cuerpo|muéstrame tu cuerpo)/.test(normalized)) {
      const pack = PACK_IMAGES.filter(available);
      if (pack.length > 0) {
        pack.forEach(mark);
        return {
          text: 'Te envío el pack completo. Disfrútalo.',
          images: pack.map(path => ({ path, caption: path.split('/').pop() }))
        };
      }

      // Preferir fotos no enviadas primero
      const photoOptions = [
        { path: 'assets/foto_romantica.jpg', text: 'Toma esta foto… imagina que estoy así de caliente por ti.', caption: 'foto_romantica.jpg' },
        { path: 'assets/foto_normal.jpg', text: 'Aquí tienes una foto mía. ¿Te gusta lo que ves?', caption: 'foto_normal.jpg' },
        { path: 'assets/foto_feliz.jpg', text: 'Una foto alegre… aunque yo esté pensando en cosas sucias.', caption: 'foto_feliz.jpg' }
      ].filter(o => available(o.path));

      const videoOptions = [
        { path: 'assets/tetas.mp4', text: 'Mmm… te mando mis tetas para que se te haga agua la boca. ¿Te gustan?', caption: 'tetas.mp4' },
        { path: 'assets/culo.mp4', text: 'Mira mi culo… imagina cómo se vería mientras me follas de perrito.', caption: 'culo.mp4' },
        { path: 'assets/vagina.mp4', text: 'Aquí tienes mi coño bien abierto y mojado solo de pensarte…', caption: 'vagina.mp4' },
        { path: 'assets/lengua.mp4', text: 'Mira mi lengua… imagina cómo te la chuparía hasta dejarte seco.', caption: 'lengua.mp4' },
        { path: 'assets/video_especial.mp4', text: 'Te comparto algo especial y bien puta…', caption: 'video_especial.mp4' },
        { path: 'assets/video_romantico.mp4', text: 'Un detalle candente solo para ti ♡', caption: 'video_romantico.mp4' },
        { path: 'assets/video_feliz.mp4', text: 'Un video alegre para ti… aunque yo esté pensando en follarte.', caption: 'video_feliz.mp4' },
        { path: 'assets/video_normal.mp4', text: 'Mira esto y dime qué se te antoja.', caption: 'video_normal.mp4' }
      ].filter(o => available(o.path));

      // Si aún hay fotos sin enviar → foto; si no → video
      if (photoOptions.length > 0 && this.sentMedia.size < 3) {
        const chosen = photoOptions[Math.floor(Math.random() * photoOptions.length)];
        mark(chosen.path);
        return { text: chosen.text, image: chosen.path, caption: chosen.caption };
      }
      if (videoOptions.length > 0) {
        const chosen = videoOptions[Math.floor(Math.random() * videoOptions.length)];
        mark(chosen.path);
        return { text: chosen.text, video: chosen.path, caption: chosen.caption };
      }
      // Específicos agotados → pool random
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) return randomPhoto;
      // Todo agotado → ofrecer reenvío
      return this.offerResend();
    }

    // Partes del cuerpo (prioridad video si disponible)
    if (/(tetas|pechos|senos|bust|boobs)/.test(normalized)) {
      if (available('assets/tetas.mp4')) {
        mark('assets/tetas.mp4');
        return {
          text: '¿Quieres ver mis tetas? Aquí las tienes… tócalas con la mirada, apriétalas, chúpales los pezones con la mente. Están para ti.',
          video: 'assets/tetas.mp4',
          caption: 'tetas.mp4'
        };
      }
      if (available('assets/foto_romantica.jpg')) {
        mark('assets/foto_romantica.jpg');
        return { text: 'No me queda el video de tetas, pero toma esta foto y imagíname chupándotelas…', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' };
      }
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) {
        randomPhoto.text = 'Ya no me queda el video de tetas. Te mando otra foto mientras tanto…';
        return randomPhoto;
      }
      return this.offerResend();
    }

    if (/(culo|trasero|nalgas|ass|pompis)/.test(normalized)) {
      if (available('assets/culo.mp4')) {
        mark('assets/culo.mp4');
        return {
          text: 'Mmm… te muestro mi culo. Imagina cómo se abre cuando me la metes de espaldas y me das nalgadas.',
          video: 'assets/culo.mp4',
          caption: 'culo.mp4'
        };
      }
      if (available('assets/foto_romantica.jpg')) {
        mark('assets/foto_romantica.jpg');
        return { text: 'Toma esta foto y piensa en mi culo mientras me follas.', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' };
      }
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) {
        randomPhoto.text = 'Ya viste el video del culo. Aquí va otra foto mientras tanto…';
        return randomPhoto;
      }
      return this.offerResend();
    }

    if (/(vagina|coño|chocho|pussy|panocha|concha|cuca|chucha|chochita|cuquita|conchita|florecita|chocha)/.test(normalized)) {
      if (available('assets/vagina.mp4')) {
        mark('assets/vagina.mp4');
        return {
          text: 'Aquí está mi coño… hinchado, mojado y listo para que me lo destroces. ¿Lo vas a lamer o prefieres meterla de una?',
          video: 'assets/vagina.mp4',
          caption: 'vagina.mp4'
        };
      }
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) {
        randomPhoto.text = 'Ya te mostré ese video. Toma otra foto mientras tanto…';
        return randomPhoto;
      }
      return this.offerResend();
    }

    if (/(lengua|chupar|mamada|oral|boca)/.test(normalized) && !/(chupame|chúpame|mamame|mámame)/.test(normalized)) {
      if (available('assets/lengua.mp4')) {
        mark('assets/lengua.mp4');
        return {
          text: 'Mira mi lengua… babosa, lista para enrollarse en tu polla y chuparte hasta que se te doblen las rodillas.',
          video: 'assets/lengua.mp4',
          caption: 'lengua.mp4'
        };
      }
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) {
        randomPhoto.text = 'Ya viste el video de la lengua. Aquí va otra foto…';
        return randomPhoto;
      }
      return this.offerResend();
    }

    // Fotos específicas (luego random, luego reenvío)
    if (/(manda(me)? (una )?foto|envía(me)? (una )?foto|muéstrame (una )?foto|quiero (una )?foto|fotos|mandame fotos)/.test(normalized)) {
      const photoPool = [
        { path: 'assets/foto_romantica.jpg', text: 'Una foto bien putita solo para ti ♡', caption: 'foto_romantica.jpg' },
        { path: 'assets/foto_normal.jpg', text: 'Aquí tienes una foto mía. ¿Te gusta lo que ves?', caption: 'foto_normal.jpg' },
        { path: 'assets/foto_feliz.jpg', text: 'Una foto alegre… aunque yo esté pensando en cosas sucias.', caption: 'foto_feliz.jpg' }
      ].filter(o => available(o.path));

      if (photoPool.length > 0) {
        const chosen = photoPool[Math.floor(Math.random() * photoPool.length)];
        mark(chosen.path);
        return { text: chosen.text, image: chosen.path, caption: chosen.caption };
      }
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) return randomPhoto;
      return this.offerResend();
    }

    // Videos específicos
    if (/(manda(me)? (un )?video|envía(me)? (un )?video|muéstrame (un )?video|quiero (un )?video|videos|mandame videos)/.test(normalized)) {
      const videoPool = [
        { path: 'assets/video_romantico.mp4', text: 'Te mando un video bien candente…', caption: 'video_romantico.mp4' },
        { path: 'assets/video_especial.mp4', text: 'Te comparto este video… míralo mientras te tocas.', caption: 'video_especial.mp4' },
        { path: 'assets/tetas.mp4', text: 'Mira esto y dime qué se te antoja hacerme.', caption: 'tetas.mp4' },
        { path: 'assets/culo.mp4', text: 'Para ti…', caption: 'culo.mp4' },
        { path: 'assets/vagina.mp4', text: 'Observa bien…', caption: 'vagina.mp4' },
        { path: 'assets/video_feliz.mp4', text: 'Un video alegre para ti.', caption: 'video_feliz.mp4' },
        { path: 'assets/video_normal.mp4', text: 'Mira y dime qué te provoca.', caption: 'video_normal.mp4' },
        { path: 'assets/lengua.mp4', text: 'Mira mi lengua y imagina el resto.', caption: 'lengua.mp4' }
      ].filter(o => available(o.path));

      if (videoPool.length > 0) {
        const chosen = videoPool[Math.floor(Math.random() * videoPool.length)];
        mark(chosen.path);
        return { text: chosen.text, video: chosen.path, caption: chosen.caption };
      }
      // Sin videos nuevos → foto random o reenvío
      const randomPhoto = this.trySendRandomPhoto(mark);
      if (randomPhoto) {
        randomPhoto.text = 'No me quedan videos nuevos. Te mando una foto del pool random mientras tanto…';
        return randomPhoto;
      }
      return this.offerResend();
    }

    return null;
  }

  questionReply(text) {
    const topic = text.replace(/[¿?]/g, '').trim();
    return this.pick([
      `Buena pregunta. No tengo acceso a información externa en este momento, pero puedo ayudarte a razonar sobre “${topic}”. ¿Qué contexto tienes?`,
      `Me interesa esa pregunta. Para darte una respuesta útil necesitaría un poco más de contexto; ¿qué has probado o qué necesitas decidir?`,
      `Puedo ayudarte a desmenuzarlo. ¿Buscas una explicación breve, ideas o pasos para resolverlo?`
    ]);
  }

  versionInfo() {
    const v = BOT_VERSION;
    return [
      `Versión: ${v.version}`,
      `Información general: ${v.info}`,
      `Cantidad de líneas en el bot: ${v.lines}`,
      `Creador: ${v.creator}`,
      `Contribuyentes: ${v.contributors.join(', ')}`
    ].join('\n');
  }

  help() {
    return `Estas son mis acciones disponibles:

• /ayuda o /comandos — muestra esta lista
• /version — muestra versión, creador y metadatos del bot
• /sumar 12 8 — suma dos números
• /calcular (12 + 8) * 2 — resuelve una expresión
• /hora — muestra fecha y hora actual
• /audio <texto> — genera un audio con ese texto usando la voz del navegador
• /limpiar — vacía la conversación, reinicia etapas/media y cancela enfado
• /etapa — muestra la etapa actual de la conversación
• /saltar o “modo novia” o “vamos a lo erótico” — salta directo a lo sexual

Progresión natural:
1. Conocerse (nombre opcional)
2. Flirteo
3. Erótico (ya se pueden pedir fotos/videos)
4. Explícito (dirty talk completo)

Media (sin repeticiones de archivos nuevos):
• “muéstrame algo”, “quiero tu pack”, “sorprendeme”
• “manda foto” / “manda video”
• “manda un audio de saludo / ánimo / buenas noches / risa / te extraño / caliente / chiste”
• mencionar tetas, culo, vagina (cuca, panocha, chucha, chochita, cuquita, conchita, florecita, chocha…), lengua
• Si se agotan los específicos → usa fotos de assets/random/
• Si también se agota random → pregunta si quieres que reenvíe algo ya visto (sí/no). El anti-repetición sigue activo para contenido nuevo.

Extras:
• Si te ríes (jaja, 😂…), yo también río
• “cuéntame un chiste” → lista de chistes
• “cómo te llamas” → Luisa Chan
• Uso tu nombre con frecuencia una vez que me lo digas

Nota: si mencionas a Manuela / Manuelita / Manu / “la otra IA”, me enfado,
bloqueo fotos/videos y respondo de forma agresiva hasta que uses /limpiar.

Archivos disponibles en assets:
culo.mp4, tetas.mp4, vagina.mp4, lengua.mp4,
video_especial.mp4, video_romantico.mp4, video_feliz.mp4, video_normal.mp4, video_paisaje.mp4,
foto_romantica.jpg, foto_normal.jpg, foto_feliz.jpg, foto_perfil_predeterminada.jpeg,
random/foto1.jpeg … foto10.jpeg (añade más en RANDOM_IMAGES del código)`;
  }

  time() {
    return `Ahora es ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}.`;
  }

  sum(text) {
    const values = text.trim().split(/\s+/).slice(1).map(Number);
    return values.length === 2 && values.every(Number.isFinite)
      ? `El resultado de ${values[0]} + ${values[1]} es ${this.format(values[0] + values[1])}.`
      : 'Uso correcto: /sumar [número 1] [número 2]. Ejemplo: /sumar 12 8';
  }

  calculate(expression) {
    const clean = expression.replace(/,/g, '.').replace(/\s+/g, '');
    if (!clean || !/^[0-9+\-*/().%^]+$/.test(clean)) {
      return 'Solo puedo calcular expresiones con números y +, -, *, /, %, ^ y paréntesis.';
    }
    try {
      const result = Function(`"use strict"; return (${clean.replace(/\^/g, '**')})`)();
      return Number.isFinite(result) ? `El resultado es ${this.format(result)}.` : 'No puedo obtener un resultado finito para esa operación.';
    } catch {
      return 'No pude interpretar esa expresión. Revisa la sintaxis e inténtalo de nuevo.';
    }
  }

  parseNaturalMath(text) {
    const multiplyFirst = text.match(/(?:multiplica|multiplicar)\s+(-?\d+(?:[,.]\d+)?)\s+(?:por|x)\s+(-?\d+(?:[,.]\d+)?)/);
    if (multiplyFirst) {
      const a = Number(multiplyFirst[1].replace(',', '.')), b = Number(multiplyFirst[2].replace(',', '.'));
      return `${this.format(a)} * ${this.format(b)} = ${this.format(a * b)}.`;
    }
    const match = text.match(/(?:cuanto es |calcula |)?(-?\d+(?:[,.]\d+)?)\s*(mas|menos|por|multiplicado por|entre|dividido entre|dividido por|x|\+|-|\*|\/|÷)\s*(-?\d+(?:[,.]\d+)?)/);
    if (!match) return null;
    const a = Number(match[1].replace(',', '.')), b = Number(match[3].replace(',', '.')), op = match[2];
    const operation = /mas|\+/.test(op) ? '+' : /menos|^-$/.test(op) ? '-' : /entre|dividido|\/|÷/.test(op) ? '/' : '*';
    if (operation === '/' && b === 0) return 'No es posible dividir entre cero.';
    const result = ({ '+': a + b, '-': a - b, '*': a * b, '/': a / b })[operation];
    return `${this.format(a)} ${operation} ${this.format(b)} = ${this.format(result)}.`;
  }

  extractName(text) {
    const match = text.match(/(?:me llamo|mi nombre es|soy)\s+([a-záéíóúüñ][a-záéíóúüñ'-]{1,24})/i);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase() : '';
  }

  pick(options) {
    let reply = options[Math.floor(Math.random() * options.length)];
    if (options.length > 1 && reply === this.lastReply) {
      reply = options[(options.indexOf(reply) + 1) % options.length];
    }
    this.lastReply = typeof reply === 'string' ? reply : (reply.text || JSON.stringify(reply));
    return reply;
  }

  normalize(value) {
    return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  format(value) {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 10 }).format(value);
  }
}
