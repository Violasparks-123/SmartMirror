/* Real AI: talks straight to OpenAI or Anthropic using a key a parent types into Settings → AI.
   The key is saved only on this device (never in the code on GitHub).
   Used for: questions the built-in commands don't know, and Characters mode. */
(function () {
  if (!M.settings.ai) M.settings.ai = { provider: 'openai', key: '', model: '' };
  var DEFAULT_MODEL = { openai: 'gpt-4o-mini', anthropic: 'claude-haiku-4-5-20251001' };

  M.aiReady = function () { return !!(M.settings.ai && M.settings.ai.key); };
  M.aiModel = function () { var a = M.settings.ai; return (a.model || '').trim() || DEFAULT_MODEL[a.provider] || DEFAULT_MODEL.openai; };

  // Safety rules every AI reply follows (the mirror is used by a teen and their family)
  M.aiSafety = 'The person talking to you is a young teenager using a smart mirror at home. Keep everything friendly, kind and age-appropriate: ' +
    'no romance or flirting, no swearing, nothing graphic or frightening, nothing dangerous. If they seem upset, unsafe or in trouble, ' +
    'answer gently and warmly and suggest talking to a parent or another trusted adult. Never ask for personal details like address, school or passwords. ' +
    'Your reply is spoken aloud by the mirror, so keep it short (1 to 3 sentences), with no lists, emojis, markdown or stage directions in asterisks.';

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
        body: JSON.stringify({ model: model, max_tokens: 300, system: system, messages: history })
      }).then(readJson).then(function (j) {
        return (j.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join(' ').trim();
      });
    }
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + a.key },
      body: JSON.stringify({ model: model, max_tokens: 300, messages: [{ role: 'system', content: system }].concat(history) })
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
    var system = 'You are Mirror, a friendly, upbeat smart mirror assistant. ' + ctx + ' ' + M.aiSafety + ' ' + CMD_HELP;
    chat.push({ role: 'user', content: String(raw).slice(0, 500) });
    chat = chat.slice(-8);
    return M.aiChat(system, chat).then(function (text) {
      var p = M.aiSplit(text);
      chat.push({ role: 'assistant', content: p.say || 'Okay.' });
      M.say(p.say || 'Okay!', { plain: true });
      M.aiRunCmds(p.cmds);
    }).catch(function (e) { chat.pop(); M.say(M.aiProblem(e)); });
  };
  M.aiCmdHelp = CMD_HELP;
})();
