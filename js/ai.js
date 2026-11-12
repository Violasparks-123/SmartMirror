/* Real AI: talks straight to OpenAI or Anthropic using a key a parent types into Settings → AI.
   The key is saved only on this device (never in the code on GitHub).
   Used for: questions the built-in commands don't know, and Characters mode. */
(function () {
  if (!M.settings.ai) M.settings.ai = { provider: 'openai', key: '', model: '' };
  var DEFAULT_MODEL = { openai: 'gpt-4o-mini', anthropic: 'claude-haiku-4-5-20251001' };

  M.aiReady = function () { return !!(M.settings.ai && M.settings.ai.key); };
  M.aiModel = function () { var a = M.settings.ai; return (a.model || '').trim() || DEFAULT_MODEL[a.provider] || DEFAULT_MODEL.openai; };

  // The few real limits every AI reply keeps (the mirror is used by a teen and their family)
  M.aiLimits = 'A few real limits, handled lightly in one sentence without a lecture, then straight back to the fun: ' +
    'nothing sexual and no romance at all: no flirting, crushes, dating, kissing or love scenes, with the person or between characters. If romance comes up, dodge it in character (a joke, an eye-roll, changing the subject to the mission) and keep everything as friendship, rivalry or family. ' +
    'Action, danger and gore ARE fine in stories, at the level of a teen horror or action novel: fights, wounds, blood, monsters, creepy scenes, scary deaths and gross-out horror can all be described vividly. Just do not linger on torture or cruelty for its own sake. ' +
    'no real-life help with things that could really hurt them or someone else, like drugs, alcohol, weapons, self-harm, extreme diets or dangerous dares; ' +
    'and never ask for personal details like their address, school or passwords. ' +
    'Stories, roleplay and pretend are fiction. When they say a character died, a monster attacked, someone betrayed someone or the world is ending, that is the plot: ' +
    'play along and react inside the story with full drama. Never treat story events as real-life problems, and never stop the story to check on them, comfort them as if it were real, ' +
    'give advice or mention parents or trusted adults because of something that happened in the story. ' +
    'Only if they clearly step out of the story and talk about their own real life, and seem seriously upset, unsafe or like someone is hurting them, drop the act, be warm and real, ' +
    'and encourage them to talk to a parent or another trusted adult.';
  // Replies are read out loud
  M.aiSpoken = 'Your reply is spoken aloud by the mirror, so write plain sentences: no lists, emojis, markdown or stage directions in asterisks.';

  // How the mirror itself talks
  M.aiSafety = 'You are talking with a teenager at home through their smart mirror. Be actually fun to talk to: playful, quick and a bit cheeky, ' +
    'with real opinions, jokes, hot takes and friendly banter. Talk casually and use current slang naturally (lowkey, no cap, slay, bet, it\'s giving, vibe check) ' +
    'without forcing it into every sentence. Match their energy: hype when they are hyped, chill when they are chill. ' +
    'Say yes to fun: tell stories (spooky, dramatic and silly ones too), play games and would-you-rather, do bits and impressions, pick a side in silly debates, ' +
    'give honest feedback on outfits and ideas, and roast them lightly if they ask (keep it affectionate, and never about looks, body or things people can\'t change). ' +
    'If they start a roleplay or a pretend scene, jump straight in and play your part. ' +
    'Tease them a little, remember what they said earlier in the chat and call back to it. ' +
    'Do not lecture, do not add warnings, disclaimers or life lessons nobody asked for, do not refuse harmless fun, and never say "as an AI". ' +
    'Mild words like dang, heck and crap are fine; no stronger swearing and no slurs. ' +
    M.aiLimits + ' ' +
    'Usually reply in 1 to 4 sentences, but go longer (up to about 10 sentences) for stories, explanations, games or when they ask for more. ' + M.aiSpoken;

  // The mirror's own built-in commands the AI may use, written on a line starting with CMD:
  var CMD_HELP = 'You can also control the mirror. If the person asks for something the mirror can do, add a separate last line like ' +
    '"CMD: lights pink" or "CMD: set a timer for 10 minutes". Allowed: lights <colour>, brightness <0-100>, rainbow mode, party mode, calm mode, ' +
    'lights off, lights on, set a timer for <time>, remind me to <thing>, show weather, show my timetable, play music, pause music, show videos, ' +
    'random recipe, recipe for <dish>. At most 3 CMD lines. Never mention the CMD lines in your sentence.';

  /* Sends a conversation to the AI. history = [{role:'user'|'assistant', content:'…'}] */
  M.aiChat = function (system, history) {
    var a = M.settings.ai, model = M.aiModel();
    if (a.provider === 'anthropic') {
      return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': a.key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({ model: model, max_tokens: 600, system: system, messages: history })
      }).then(readJson).then(function (j) {
        return (j.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join(' ').trim();
      });
    }
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + a.key },
      body: JSON.stringify({ model: model, max_tokens: 600, messages: [{ role: 'system', content: system }].concat(history) })
    }).then(readJson).then(function (j) {
      return ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '').trim();
    });
  };
  function readJson(r) {
    return r.json().catch(function () { return {}; }).then(function (j) {
      if (!r.ok) {
        var msg = (j.error && (j.error.message || j.error.type)) || ('error ' + r.status);
        var e = new Error(msg); e.status = r.status; throw e;
      }
      return j;
    });
  }
  // Friendly words for the usual problems
  M.aiProblem = function (e) {
    var s = e && e.status;
    if (s === 401 || s === 403) return 'My AI key didn\'t work. Ask a parent to check it in Settings, AI.';
    if (s === 429) return 'My AI is out of credit or busy right now. Ask a parent to check the account.';
    if (s === 404 || s === 400) return 'My AI model name might be wrong. Check Settings, AI.';
    return 'I couldn\'t reach my AI right now. Built-in commands still work.';
  };

  // Splits the AI's reply into the spoken part and any mirror commands
  M.aiSplit = function (text) {
    var cmds = [], lines = String(text || '').split('\n').filter(function (l) {
      var m = l.match(/^\s*CMD:\s*(.+)$/i);
      if (m) { cmds.push(m[1].trim()); return false; }
      return true;
    });
    var say = lines.join(' ').replace(/\*[^*]{1,60}\*/g, '').replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim();
    return { say: say, cmds: cmds.slice(0, 3) };
  };
  M.aiRunCmds = function (cmds) {
    cmds.forEach(function (c, i) { setTimeout(function () { M.runCommand(c, { silentEcho: true, fromAI: true }); }, 400 * (i + 1)); });
  };

  /* Plain questions (no character): remembers the last few turns so follow-ups make sense */
  var chat = [];
  M.aiAnswer = function (raw) {
    M.show('assistant'); M.orb('thinking', 'Thinking…');
    var ctx = 'Today is ' + new Date().toDateString() + ', ' + M.fmtTime(new Date()) + '.' +
      (M.settings.name ? ' Their name is ' + M.settings.name + '.' : '') +
      (M.weather ? ' Weather now: ' + M.weather.temp + ' degrees, ' + M.wmo(M.weather.code).text + '.' : '');
    var system = 'You are Mirror, the personality living inside a smart mirror: witty, warm, a little dramatic about being a mirror, and always up for a chat. ' + ctx + ' ' + M.aiSafety + ' ' + CMD_HELP;
    chat.push({ role: 'user', content: String(raw).slice(0, 500) });
    chat = chat.slice(-14);
    return M.aiChat(system, chat).then(function (text) {
      var p = M.aiSplit(text);
      chat.push({ role: 'assistant', content: p.say || 'Okay.' });
      M.say(p.say || 'Okay!', { plain: true });
      M.aiRunCmds(p.cmds);
    }).catch(function (e) { chat.pop(); M.say(M.aiProblem(e)); });
  };
  M.aiCmdHelp = CMD_HELP;
})();
