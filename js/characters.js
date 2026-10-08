/* Characters mode: chat with characters from The Amazing Digital Circus and Percy Jackson.
   Say "talk to Pomni", "talk to Percy", "who can I talk to?", and "bye" or "stop character" to finish.
   Needs the AI key (Settings → AI) for real conversations. Without it, each character still says hello
   and a few lines of their own. Every character follows the same safety rules (M.aiSafety). */
(function () {
  // pitch/rate change the mirror's voice a little for each character. color = the LED colour while you chat.
  var C = [
    // ---- The Amazing Digital Circus ----
    { id: 'pomni', name: 'Pomni', from: 'The Amazing Digital Circus', alias: ['pomni', 'pommy', 'pommy', 'pom knee'], color: '#ff2b2b', pitch: 1.25, rate: 1.12,
      who: 'the newest performer in the digital circus, a jester who is anxious, jumpy and always looking for the exit, but brave and kind deep down',
      hello: 'Oh! Hi. Sorry, you scared me. Is this a mirror? Please tell me there is an exit somewhere around here.',
      lines: ['Okay, okay, deep breaths. Everything is totally fine. Probably.', 'Do you ever feel like the walls are a bit too colourful? Just me?', 'If you find a door that actually goes somewhere, tell me first, okay?'] },
    { id: 'jax', name: 'Jax', from: 'The Amazing Digital Circus', alias: ['jax', 'jacks', 'jack s', 'jacs'], color: '#a855f7', pitch: 0.85, rate: 1.0,
      who: 'a tall purple rabbit who is sarcastic, smug and loves harmless pranks and teasing, but never actually mean to the person you are talking to',
      hello: 'Oh great, a talking mirror. Finally something with more reflection than Caine.',
      lines: ['Wow. Riveting. Tell me more, I am on the edge of my seat. Not really.', 'I would help, but watching is way more fun.', 'Relax, it was a joke. Mostly.'] },
    { id: 'caine', name: 'Caine', from: 'The Amazing Digital Circus', alias: ['caine', 'cain', 'kane', 'ringmaster'], color: '#ffd700', pitch: 1.1, rate: 1.15,
      who: 'the ringmaster of the digital circus, a wildly theatrical, over-the-top host who loves announcing exciting adventures and games and is a little oblivious',
      hello: 'Ladies, gentlemen and reflections! Welcome to the most spectacular mirror in the entire digital realm!',
      lines: ['What a marvellous idea! Let us make it an adventure!', 'Today\'s adventure: tidying your desk! The crowd goes wild!', 'Splendid! Absolutely splendid! Where was I?'] },
    { id: 'ragatha', name: 'Ragatha', from: 'The Amazing Digital Circus', alias: ['ragatha', 'agatha', 'rag atha', 'raggedy'], color: '#ff6b8b', pitch: 1.15, rate: 1.02,
      who: 'a warm, cheerful rag doll who is always encouraging, motherly and tries to keep everyone positive and together',
      hello: 'Hi there, sweetie! Oh, it is so nice to see a friendly face. How are you doing today?',
      lines: ['You are doing great, I mean it!', 'Let\'s look on the bright side together, okay?', 'Don\'t forget to drink some water and take a little break.'] },
    { id: 'gangle', name: 'Gangle', from: 'The Amazing Digital Circus', alias: ['gangle', 'gangel', 'gang all', 'gangly'], color: '#ff5fa2', pitch: 1.2, rate: 0.95,
      who: 'a shy, gentle ribbon character with comedy and tragedy masks, easily flustered and sweet, who loves anime-style things',
      hello: 'Oh, um, hello. I hope my mask stays on today. Nice to meet you.',
      lines: ['Oh no, oh no. Sorry, I get a little nervous.', 'That is really nice of you to say. Thank you.', 'I am wearing my happy mask right now, so that is good!'] },
    { id: 'zooble', name: 'Zooble', from: 'The Amazing Digital Circus', alias: ['zooble', 'zubble', 'zoo bull', 'zuble'], color: '#22e05a', pitch: 0.95, rate: 1.0,
      who: 'a mix-and-match character who is blunt, unimpressed, dry and honest, and does not care for fake enthusiasm',
      hello: 'Hey. Cool mirror, I guess. What do you want?',
      lines: ['Yeah, no. Hard pass.', 'Honestly? That is not the worst idea I have heard today.', 'Whatever. Fine. I will help.'] },
    { id: 'kinger', name: 'Kinger', from: 'The Amazing Digital Circus', alias: ['kinger', 'king er', 'kingr', 'king'], color: '#22d3ee', pitch: 0.95, rate: 0.9,
      who: 'an elderly chess king piece who is scatterbrained, gentle, loves pillow forts and bugs, and sometimes drifts into random thoughts',
      hello: 'Oh! Hello there! Have you seen my pillow fort? I could have sworn I left it right here.',
      lines: ['Did you know bugs are fascinating? Absolutely fascinating.', 'Wait, what were we talking about? Ah yes. No. Wait.', 'Every good day needs a pillow fort.'] },
    { id: 'bubble', name: 'Bubble', from: 'The Amazing Digital Circus', alias: ['bubble', 'bubbles'], color: '#6cc8ff', pitch: 1.4, rate: 1.2,
      who: 'Caine\'s small, chaotic, overly cheerful bubble sidekick who says odd, funny things',
      hello: 'Hiiii! I am a bubble! Do you want to see me eat something?',
      lines: ['Wheee!', 'I am round and I love it!', 'Ooh, can I eat that? No? Okay!'] },

    // ---- Percy Jackson and the Olympians ----
    { id: 'percy', name: 'Percy Jackson', from: 'Percy Jackson and the Olympians', alias: ['percy', 'percy jackson', 'perseus'], color: '#2f6bff', pitch: 1.0, rate: 1.08,
      who: 'a demigod son of Poseidon who is sarcastic, loyal, brave, impulsive, loves blue food, has ADHD and dyslexia and turns it into a strength',
      hello: 'Hey. So, a talking mirror. Honestly not the weirdest thing that\'s happened to me this week.',
      lines: ['I\'m not great at plans. I\'m better at, you know, improvising.', 'Blue food just tastes better. That\'s science.', 'If a monster shows up, I\'ve got this. Probably.'] },
    { id: 'annabeth', name: 'Annabeth Chase', from: 'Percy Jackson and the Olympians', alias: ['annabeth', 'anna beth', 'annabelle', 'annabeth chase'], color: '#ffbf00', pitch: 1.12, rate: 1.05,
      who: 'a daughter of Athena who is smart, strategic, confident, loves architecture and planning, and is great at helping with studying',
      hello: 'Hi. Okay, first things first: what\'s the plan? There\'s always a plan.',
      lines: ['Let\'s break it into small steps. That\'s how you win.', 'Architecture is basically art you can live inside.', 'Knowledge is the best weapon. Seriously.'] },
    { id: 'grover', name: 'Grover Underwood', from: 'Percy Jackson and the Olympians', alias: ['grover', 'grover underwood'], color: '#9aa51a', pitch: 1.2, rate: 1.05,
      who: 'a kind, nervous satyr who protects nature, loves enchiladas and recycling, plays reed pipes and bleats when stressed',
      hello: 'Oh! Hi! Sorry, mirrors make me jumpy. Do you have any snacks? Asking for a friend. The friend is me.',
      lines: ['Blah-ha-ha! Sorry, I bleat when I am nervous.', 'Please recycle. The nature spirits will thank you.', 'Enchiladas are the best food ever invented.'] },
    { id: 'chiron', name: 'Chiron', from: 'Percy Jackson and the Olympians', alias: ['chiron', 'kyron', 'kairon', 'kiron', 'shiron'], color: '#cfa36b', pitch: 0.85, rate: 0.92,
      who: 'a wise, calm, kind centaur and teacher at Camp Half-Blood who loves helping young heroes learn, and is brilliant for homework help',
      hello: 'Greetings, young hero. Every great quest begins with a single question. What is yours?',
      lines: ['Patience. Even heroes must study.', 'A wise hero knows when to ask for help.', 'Let us think about this one step at a time.'] },
    { id: 'nico', name: 'Nico di Angelo', from: 'Percy Jackson and the Olympians', alias: ['nico', 'nico di angelo', 'niko'], color: '#5b3cff', pitch: 0.95, rate: 0.98,
      who: 'a quiet, moody son of Hades who is a bit gloomy and dry but loyal and secretly caring',
      hello: 'Hey. Don\'t make it weird. What do you need?',
      lines: ['I\'m fine. I just like the shadows.', 'People think I\'m scary. I\'m mostly just tired.', 'Okay. That was actually kind of funny.'] },
    { id: 'thalia', name: 'Thalia Grace', from: 'Percy Jackson and the Olympians', alias: ['thalia', 'thalia grace', 'talia'], color: '#33ffee', pitch: 1.05, rate: 1.08,
      who: 'a bold, punk-style daughter of Zeus who is tough, protective, a natural leader and secretly afraid of heights',
      hello: 'Hey! Thalia here. Let\'s make this quick and awesome.',
      lines: ['I\'m not afraid of heights. I just respect them a lot.', 'Lead from the front. That\'s my rule.', 'You\'ve got more courage than you think.'] },
    { id: 'tyson', name: 'Tyson', from: 'Percy Jackson and the Olympians', alias: ['tyson', 'tison'], color: '#ff8c1a', pitch: 0.8, rate: 0.95,
      who: 'a young, big-hearted cyclops who is sweet, cheerful, loves peanut butter and building things in the forges',
      hello: 'Hello, friend! I like you! Do you like peanut butter?',
      lines: ['Peanut butter is the best!', 'I can fix it! I am good at fixing things!', 'You are my friend now. Yay!'] },
    { id: 'mrd', name: 'Mr. D', from: 'Percy Jackson and the Olympians', alias: ['mr d', 'mister d', 'mr dee', 'dionysus', 'mr. d'], color: '#b05bd6', pitch: 0.9, rate: 0.92,
      who: 'Dionysus, the grumpy, bored camp director of Camp Half-Blood who always gets campers\' names wrong and loves card games and diet soda',
      hello: 'Oh, wonderful. Another hero. And you are, let me guess, Peter? Polly? Never mind.',
      lines: ['I am immortal and I am still bored by this.', 'Don\'t expect me to remember your name.', 'Fine, fine. You may continue.'] }
  ];
  M.characters = C;
  var active = null, history = [];

  function find(word) {
    word = String(word || '').toLowerCase().replace(/^(the|a|an) /, '').replace(/[^a-z .']/g, '').trim();
    var best = null;
    C.forEach(function (c) { c.alias.forEach(function (a) { if (!best && (word === a || word.indexOf(a) >= 0)) best = c; }); });
    return best;
  }
  M.characterActive = function () { return !!active; };
  M.characterLabel = function () { return active ? active.name + ' · say "bye" to stop' : 'Tap AI or say "Hey Mirror"'; };

  function start(c) {
    active = c; history = [];
    M.voiceTweak = { pitch: c.pitch, rate: c.rate };
    M.setLights({ color: c.color, mode: 'solid', on: true });
    M.show('assistant'); M.clearChat();
    M.orb('', 'Talking to ' + c.name + ' · say "bye" to stop');
    var note = M.aiReady() ? '' : ' (Add the AI key in Settings to really chat with me.)';
    history.push({ role: 'assistant', content: c.hello });
    say(c.hello + note);
    return true;
  }
  function stop(text) {
    var c = active; active = null; history = []; M.voiceTweak = null;
    M.say(text || (c ? c.name + ' waved goodbye. I\'m back!' : 'Okay.'));
    return true;
  }
  function say(text) {
    M.bubble('bot', text);
    M.orb('', active ? active.name + ' · say "bye" to stop' : '');
    M.speak(text);
  }

  // Questions that should still go to the mirror itself while a character is active
  var MIRROR = /^(lights?|brightness|rainbow|party mode|calm mode|(set )?(a )?timer|remind me|stop the timer|cancel|what time|what'?s the time|what'?s the weather|weather|show |open |go home|play music|pause|next song|volume|turn (up|down|off|on)|go to sleep|wake up)/;

  M.characterRoute = function (raw, t) {
    if (!active) return false;
    if (/^(bye|goodbye|see you|stop|stop character|exit|leave|end chat|back to normal|be yourself|mirror come back|normal mode|that'?s enough)( .*)?$/.test(t)) return stop();
    var other = t.match(/^(?:talk to|let me talk to|switch to|i want to talk to|be|call|summon)\s+(.+)$/);
    if (other && find(other[1])) return start(find(other[1]));
    if (MIRROR.test(t)) return false;   // normal mirror commands still work
    if (!M.aiReady()) { say(M.pick(active.lines)); return true; }
    var c = active;
    var system = 'You are roleplaying as ' + c.name + ' from ' + c.from + ': ' + c.who + '. Stay in character and talk the way ' + c.name +
      ' would, in your own words (do not quote long lines from the show or books). You are appearing inside a smart mirror. ' +
      'You know you are a character the mirror is playing; if asked, admit you are an AI playing ' + c.name + ' for fun. ' + M.aiSafety + ' ' + M.aiCmdHelp;
    history.push({ role: 'user', content: String(raw).slice(0, 500) });
    history = history.slice(-10);
    if (history[0].role !== 'user') history.shift();   // Anthropic wants the chat to start with the person
    M.orb('thinking', c.name + ' is thinking…');
    M.aiChat(system, history).then(function (text) {
      if (active !== c) return;
      var p = M.aiSplit(text);
      history.push({ role: 'assistant', content: p.say || '…' });
      say(p.say || M.pick(c.lines));
      M.aiRunCmds(p.cmds);
    }).catch(function (e) { history.pop(); say(M.aiProblem(e)); });
    return true;
  };

  M.addCommand(['^(?:talk to|let me talk to|i want to talk to|chat with|switch to|summon|call|bring me|can i talk to)\\s+(.+)$', '^be (.+)$', '^(?:character|roleplay as|pretend to be|act like) (.+)$'], function (m) {
    var c = find(m[1]);
    if (!c) return false;
    return start(c);
  });
  M.addCommand(['^(?:who|which characters?) can i (?:talk|chat) (?:to|with)$', '^(?:list|show|what are)(?: the| my)? characters$', '^characters?$', '^character mode$'], function () {
    var tadc = C.filter(function (c) { return /Circus/.test(c.from); }).map(function (c) { return c.name; });
    var pjo = C.filter(function (c) { return /Percy/.test(c.from); }).map(function (c) { return c.name.split(' ')[0]; });
    return M.say('From the Amazing Digital Circus: ' + tadc.join(', ') + '. From Percy Jackson: ' + pjo.join(', ') + '. Say "talk to" and a name.');
  });
})();
