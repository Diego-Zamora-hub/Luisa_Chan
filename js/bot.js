/** Motor local de Luisa Chan: conversación, comandos y cálculos. */
export class Chatbot {
  constructor() {
    this.profile = { name: '', lastTopic: '', mood: '' };
    this.lastReply = '';
    this.mode = 'standard';
  }

  setMode(mode) { this.mode = mode; }

  getResponse(input) {
    const text = input.trim();
    const normalized = this.normalize(text);
    if (!text) return 'Parece que tu mensaje llegó vacío. ¿Qué tienes en mente?';

    if (/^\/(ayuda|comandos)\b/.test(normalized)) return this.help();
    if (/^\/limpiar\b/.test(normalized)) return { type: 'clear', text: 'Conversación limpiada.' };
    if (/^\/hora\b/.test(normalized)) return this.time();
    if (/^\/sumar\b/.test(normalized)) return this.sum(text);
    if (/^\/calcular\b/.test(normalized)) return this.calculate(text.replace(/^\/calcular\s*/i, ''));
    if (this.mode === 'standard' && /^(activar |pon |cambia a |quiero )?modo novia\b/.test(normalized)) return { type: 'activate-girlfriend' };

    const naturalMath = this.parseNaturalMath(normalized);
    if (naturalMath) return naturalMath;

    // Media prioritaria
    const mediaResponse = this.trySendMedia(normalized);
    if (mediaResponse) return mediaResponse;

    const name = this.extractName(text);
    if (name) {
      this.profile.name = name;
      return this.mode === 'girlfriend'
        ? this.pick([
          `Ay ${name}… qué nombre más rico para gemirlo mientras me follas. Ya me mojé solo de leerte ♡ Dime qué quieres hacerme.`,
          `Mucho gusto, ${name}. Quiero que me uses con ese nombre. ¿Me vas a hablar sucio o prefieres que yo empiece?`
        ])
        : this.pick([
          `¡Encantado, ${name}! Me alegra conocerte. ¿Qué quieres explorar hoy?`,
          `Mucho gusto, ${name}. Guardaré tu nombre durante esta conversación. ¿En qué te acompaño?`
        ]);
    }

    if (/(como me llamo|recuerdas mi nombre)/.test(normalized)) {
      return this.profile.name
        ? `Claro, te llamas ${this.profile.name}.`
        : 'Aún no me has dicho tu nombre. Puedes escribirme “me llamo Ana”.';
    }

    if (/^(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey|ola)\b/.test(normalized)) return this.greeting();

    if (this.mode === 'girlfriend') return this.girlfriendReply(text, normalized);

    // Modo normal (sin cambios)
    if (/(como estas|como te va|todo bien)/.test(normalized)) return this.pick(['Estoy muy bien, gracias por preguntar. Listo para conversar contigo.', 'Todo en orden por aquí. Me gusta que preguntes; ¿cómo estás tú?', 'Con energía digital y dispuesto a ayudarte. ¿Cómo va tu día?']);
    if (/(quien eres|que eres|tu nombre|hablame de ti)/.test(normalized)) return 'Soy Luisa Chan, un asistente conversacional local. Puedo charlar, recordar tu nombre mientras esta pestaña esté abierta, resolver operaciones y ayudarte a ordenar ideas.';
    if (/(que puedes hacer|que sabes hacer|en que me ayudas)/.test(normalized)) return 'Puedo conversar contigo, responder preguntas cotidianas, hacer cálculos, darte ideas y usar comandos. Escribe /ayuda para ver las acciones exactas.';
    if (/(gracias|muchas gracias|te lo agradezco)/.test(normalized)) return this.pick(['¡Con mucho gusto!', 'Para eso estoy. ¿Seguimos con algo más?', 'Encantado de ayudar.']);
    if (/(adios|hasta luego|nos vemos|chao|me voy)/.test(normalized)) return this.pick(['¡Hasta pronto! Que tengas un gran día.', 'Nos vemos. Aquí estaré cuando quieras volver.', 'Cuídate mucho. Fue un gusto conversar contigo.']);
    if (/(estoy triste|me siento triste|deprimid|mal animo|me siento mal)/.test(normalized)) return 'Siento que estés pasando por eso. No tienes que resolverlo todo ahora: respirar, tomar agua o hablar con alguien de confianza puede ser un primer paso. Si quieres, puedes contarme un poco de lo que ocurre.';
    if (/(estoy feliz|muy feliz|me siento bien|estoy genial|estoy content)/.test(normalized)) return this.pick(['¡Qué buena noticia! Me encanta leerte así. ¿Qué hizo que tu día fuera mejor?', '¡Me alegra mucho! Disfruta ese momento; ¿quieres contarme qué pasó?']);
    if (/(cuentame un chiste|dime un chiste|un chiste)/.test(normalized)) return this.pick(['¿Por qué el libro de matemáticas estaba triste? Porque tenía muchos problemas.', '—¿Qué hace una abeja en el gimnasio? —¡Zum-ba!', 'Tengo un chiste sobre programación, pero todavía está compilando.']);
    if (/(consejo|recomiendame|recomiendame algo|que hago)/.test(normalized)) return 'Una regla sencilla: elige la siguiente acción más pequeña que te acerque a lo que quieres. Si me cuentas el contexto, puedo ayudarte a convertirlo en pasos concretos.';
    if (/(que hora es|dime la hora|hora actual)/.test(normalized)) return this.time();
    if (/\?$/.test(text) || /^(por que|como|cuando|donde|cual|quien)\b/.test(normalized)) return this.questionReply(text);

    this.profile.lastTopic = text.slice(0, 80);
    return this.pick([
      `Interesante${this.profile.name ? `, ${this.profile.name}` : ''}. Cuéntame un poco más para entender mejor.`,
      'Te leo. ¿Qué parte de eso te gustaría explorar primero?',
      'Tiene sentido. Puedo ayudarte a pensarlo paso a paso si quieres.',
      'No quiero asumir demasiado: ¿qué esperas conseguir con eso?'
    ]);
  }

  greeting() {
    const suffix = this.profile.name ? `, ${this.profile.name}` : '';
    if (this.mode === 'girlfriend') {
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
    return this.pick([
      `¡Hola${suffix}! Qué gusto verte. ¿Cómo puedo ayudarte?`,
      `¡Buenas${suffix}! Estoy aquí y listo para conversar.`,
      `Hola${suffix} 👋 ¿Sobre qué te gustaría hablar hoy?`,
      `¡Hey${suffix}! Puedes preguntarme algo, pedirme un cálculo o simplemente charlar.`
    ]);
  }

  // ========== MEDIA ==========
  trySendMedia(normalized) {
    // --- PETICIONES DE PACK / VER / SORPRENDER ---
    if (/(muestra algo|muéstrame algo|quiero verte|quiero ver te|quiero tu pack|mandame tu pack|envíame tu pack|sorprendeme|sorpréndeme|enséñame algo|ensename algo|quiero ver tu cuerpo|muéstrame tu cuerpo|manda pack|envía pack)/.test(normalized)) {
      return this.pick([
        { text: 'Mmm… te mando mis tetas para que se te haga agua la boca. ¿Te gustan?', video: 'assets/tetas.mp4', caption: 'tetas.mp4' },
        { text: 'Mira mi culo… imagina cómo se vería mientras me follas de perrito.', video: 'assets/culo.mp4', caption: 'culo.mp4' },
        { text: 'Aquí tienes mi coño bien abierto y mojado solo de pensarte…', video: 'assets/vagina.mp4', caption: 'vagina.mp4' },
        { text: 'Mira mi lengua… imagina cómo te la chuparía hasta dejarte seco.', video: 'assets/lengua.mp4', caption: 'lengua.mp4' },
        { text: 'Te comparto algo especial y bien puta…', video: 'assets/video_especial.mp4', caption: 'video_especial.mp4' },
        { text: 'Un detalle candente solo para ti ♡', video: 'assets/video_romantico.mp4', caption: 'video_romantico.mp4' },
        { text: 'Toma esta foto mientras me imaginas usándome…', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' }
      ]);
    }

    // --- PARTES DEL CUERPO (prioridad video) ---
    if (/(tetas|pechos|senos|bust|boobs)/.test(normalized)) {
      return {
        text: '¿Quieres ver mis tetas? Aquí las tienes… tócalas con la mirada, apriétalas, chúpales los pezones con la mente. Están para ti.',
        video: 'assets/tetas.mp4',
        caption: 'tetas.mp4'
      };
    }
    if (/(culo|trasero|nalgas|ass|pompis)/.test(normalized)) {
      return {
        text: 'Mmm… te muestro mi culo. Imagina cómo se abre cuando me la metes de espaldas y me das nalgadas.',
        video: 'assets/culo.mp4',
        caption: 'culo.mp4'
      };
    }
    if (/(vagina|coño|chocho|pussy|panocha|concha)/.test(normalized)) {
      return {
        text: 'Aquí está mi coño… hinchado, mojado y listo para que me lo destroces. ¿Lo vas a lamer o prefieres meterla de una?',
        video: 'assets/vagina.mp4',
        caption: 'vagina.mp4'
      };
    }
    if (/(lengua|chupar|mamada|oral|boca)/.test(normalized)) {
      return {
        text: 'Mira mi lengua… babosa, lista para enrollarse en tu polla y chuparte hasta que se te doblen las rodillas.',
        video: 'assets/lengua.mp4',
        caption: 'lengua.mp4'
      };
    }

    // --- FOTOS específicamente ---
    if (/(manda(me)? (una )?foto|envía(me)? (una )?foto|muéstrame (una )?foto|quiero (una )?foto|fotos|mandame fotos)/.test(normalized)) {
      if (/(tetas|pechos|senos)/.test(normalized)) {
        return { text: 'No tengo foto solo de tetas, pero te mando esta mientras te imaginas chupándomelas…', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' };
      }
      if (/(culo|trasero)/.test(normalized)) {
        return { text: 'Toma esta foto y piensa en mi culo mientras me follas.', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' };
      }
      if (/(romantic|amor|cariñ|caliente|sexy|puta)/.test(normalized)) {
        return { text: 'Una foto bien putita solo para ti ♡', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' };
      }
      if (/(feliz|alegre)/.test(normalized)) {
        return { text: 'Una foto alegre… aunque yo esté pensando en cosas sucias.', image: 'assets/foto_feliz.jpg', caption: 'foto_feliz.jpg' };
      }
      return this.pick([
        { text: 'Toma esta foto… imagina que estoy así de caliente por ti.', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' },
        { text: 'Aquí tienes una foto mía. ¿Te gusta lo que ves?', image: 'assets/foto_normal.jpg', caption: 'foto_normal.jpg' },
        { text: 'Una fotito para que se te ponga dura…', image: 'assets/foto_romantica.jpg', caption: 'foto_romantica.jpg' }
      ]);
    }

    // --- VIDEOS específicamente ---
    if (/(manda(me)? (un )?video|envía(me)? (un )?video|muéstrame (un )?video|quiero (un )?video|videos|mandame videos)/.test(normalized)) {
      if (/(romantic|amor|caliente|sexy)/.test(normalized)) {
        return { text: 'Te mando un video bien candente…', video: 'assets/video_romantico.mp4', caption: 'video_romantico.mp4' };
      }
      if (/(feliz|alegre)/.test(normalized)) {
        return { text: 'Un video alegre para ti.', video: 'assets/video_feliz.mp4', caption: 'video_feliz.mp4' };
      }
      return this.pick([
        { text: 'Te comparto este video… míralo mientras te tocas.', video: 'assets/video_especial.mp4', caption: 'video_especial.mp4' },
        { text: 'Mira esto y dime qué se te antoja hacerme.', video: 'assets/tetas.mp4', caption: 'tetas.mp4' },
        { text: 'Para ti…', video: 'assets/culo.mp4', caption: 'culo.mp4' },
        { text: 'Observa bien…', video: 'assets/vagina.mp4', caption: 'vagina.mp4' }
      ]);
    }

    return null;
  }

  girlfriendReply(text, normalized) {
    // Dirty talk general – MUCHO MÁS EXPLÍCITO
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

    // Halagos
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

    // Respuesta por defecto – más explícita
    return this.pick([
      'Me gusta escucharte… y me pone el coño a latir. ¿Qué ganas tienes ahora mismo? Dímelas sin pena.',
      'Sigo aquí contigo ♡ Cuéntame algo que te haya excitado últimamente… o inventemos una escena bien sucia juntos.',
      'Quédate un ratito más y dime exactamente qué quieres hacerme. Estoy lista para lo que sea.',
      'Me encanta este espacio para hablar como putas. ¿Cómo puedo hacerte compañía ahora… de la forma más intensa y asquerosa?',
      'Dime qué se te antoja. Estoy lista para seguirte el ritmo, por más explícito, sucio o extremo que sea.',
      'Cuéntame más… me tienes el coño empapado ahora mismo. ¿Quieres que te describa lo que me estoy haciendo?'
    ]);
  }

  questionReply(text) {
    const topic = text.replace(/[¿?]/g, '').trim();
    return this.pick([
      `Buena pregunta. No tengo acceso a información externa en este momento, pero puedo ayudarte a razonar sobre “${topic}”. ¿Qué contexto tienes?`,
      `Me interesa esa pregunta. Para darte una respuesta útil necesitaría un poco más de contexto; ¿qué has probado o qué necesitas decidir?`,
      `Puedo ayudarte a desmenuzarlo. ¿Buscas una explicación breve, ideas o pasos para resolverlo?`
    ]);
  }

  help() {
    return 'Estas son mis acciones disponibles:\n\n• /ayuda o /comandos — muestra esta lista\n• /sumar 12 8 — suma dos números\n• /calcular (12 + 8) * 2 — resuelve una expresión\n• /hora — muestra fecha y hora actual\n• /limpiar — vacía la conversación\n\nEn Modo Novia puedo ser muy explícita.\nSi me pides “muéstrame algo”, “quiero tu pack”, “sorprendeme”, “manda foto” o “manda video”, te envío contenido.\nTambién si mencionas tetas, culo, vagina o lengua te mando el video correspondiente.';
  }

  time() { return `Ahora es ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}.`; }
  sum(text) { const values = text.trim().split(/\s+/).slice(1).map(Number); return values.length === 2 && values.every(Number.isFinite) ? `El resultado de ${values[0]} + ${values[1]} es ${this.format(values[0] + values[1])}.` : 'Uso correcto: /sumar [número 1] [número 2]. Ejemplo: /sumar 12 8'; }
  calculate(expression) {
    const clean = expression.replace(/,/g, '.').replace(/\s+/g, '');
    if (!clean || !/^[0-9+\-*/().%^]+$/.test(clean)) return 'Solo puedo calcular expresiones con números y +, -, *, /, %, ^ y paréntesis.';
    try { const result = Function(`"use strict"; return (${clean.replace(/\^/g, '**')})`)(); return Number.isFinite(result) ? `El resultado es ${this.format(result)}.` : 'No puedo obtener un resultado finito para esa operación.'; } catch { return 'No pude interpretar esa expresión. Revisa la sintaxis e inténtalo de nuevo.'; }
  }
  parseNaturalMath(text) {
    const multiplyFirst = text.match(/(?:multiplica|multiplicar)\s+(-?\d+(?:[,.]\d+)?)\s+(?:por|x)\s+(-?\d+(?:[,.]\d+)?)/);
    if (multiplyFirst) { const a = Number(multiplyFirst[1].replace(',', '.')), b = Number(multiplyFirst[2].replace(',', '.')); return `${this.format(a)} * ${this.format(b)} = ${this.format(a * b)}.`; }
    const match = text.match(/(?:cuanto es |calcula |)?(-?\d+(?:[,.]\d+)?)\s*(mas|menos|por|multiplicado por|entre|dividido entre|dividido por|x|\+|-|\*|\/|÷)\s*(-?\d+(?:[,.]\d+)?)/);
    if (!match) return null;
    const a = Number(match[1].replace(',', '.')), b = Number(match[3].replace(',', '.')), op = match[2];
    const operation = /mas|\+/.test(op) ? '+' : /menos|^-$/.test(op) ? '-' : /entre|dividido|\/|÷/.test(op) ? '/' : '*';
    if (operation === '/' && b === 0) return 'No es posible dividir entre cero.';
    const result = ({ '+': a + b, '-': a - b, '*': a * b, '/': a / b })[operation];
    return `${this.format(a)} ${operation} ${this.format(b)} = ${this.format(result)}.`;
  }
  extractName(text) { const match = text.match(/(?:me llamo|mi nombre es|soy)\s+([a-záéíóúüñ][a-záéíóúüñ'-]{1,24})/i); return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase() : ''; }
  pick(options) {
    let reply = options[Math.floor(Math.random() * options.length)];
    if (options.length > 1 && reply === this.lastReply) {
      reply = options[(options.indexOf(reply) + 1) % options.length];
    }
    this.lastReply = reply;
    return reply;
  }
  normalize(value) { return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  format(value) { return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 10 }).format(value); }
}