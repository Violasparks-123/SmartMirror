/* Voice: hearing you (speech recognition) and talking back (speech synthesis). */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  M.canHear = !!SR;
  var rec = null, mode = 'idle'; // idle | wake (waiting for "hey mirror") | command (listening to a question)
  var commandTimer = null, wantWake = false;

  /* ---------- Talking ---------- */
  M.voices = [];
  function loadVoices() {
    if (!window.speechSynthesis) return;
    M.voices = speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
  }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function pickVoice() {
    var v = M.voices.filter(function (x) { return x.voiceURI === M.settings.voiceURI; })[0];
    if (v) return v;
    // prefer an Enhanced/Premium/natural-sounding English voice
    return M.voices.filter(function (x) { return /enhanced|premium|natural|samantha|daniel|karen|serena/i.test(x.name); })[0] || M.voices[0] || null;
  }
  /* The built-in iPad voice (also the backup if the natural voice can't be reached) */
  function speakBuiltIn(text, done) {
    if (!window.speechSynthesis || !text) { if (done) done(); return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.replace(/[•›]/g, ''));
      var v = pickVoice(); if (v) u.voice = v;
      u.rate = M.settings.personality === 'dramatic' ? 0.9 : 1.02;
      u.pitch = M.settings.personality === 'dramatic' ? 1.15 : 1;
      if (M.voiceTweak) { u.rate = M.voiceTweak.rate; u.pitch = M.voiceTweak.pitch; }   // a character is talking
      u.onend = u.onerror = function () { finished(done); };
      speechSynthesis.speak(u);
    } catch (e) { finished(done); }
  }
  function finished(done) { if (done) done(); if (wantWake) setTimeout(M.startWake, 300); }

  /* ---------- The natural voice (OpenAI text-to-speech, uses the same key as the AI) ----------
     The audio is played through Web Audio. iPads only allow sound after a first touch,
     so the first tap anywhere "unlocks" it. */
  M.ttsVoices = ['marin', 'cedar', 'coral', 'nova', 'shimmer', 'sage', 'alloy', 'ballad', 'verse', 'ash', 'echo', 'fable', 'onyx'];
  var actx = null, playing = null, speakId = 0, ttsWarned = false;
  function audioCtx() {
    if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { actx = new AC(); } catch (e) { return null; } }
    return actx;
  }
  function unlock() {
    var c = audioCtx(); if (!c) return;
    try { if (c.state === 'suspended' && c.resume) c.resume(); var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) {}
  }
  ['touchend', 'pointerdown', 'mousedown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true }); });

  M.naturalVoiceReady = function () {
    var a = M.settings.ai || {};
    return M.settings.ttsOn !== false && a.provider !== 'anthropic' && !!(a.key || '').trim() && !!audioCtx() && !!window.fetch;
  };
  function ttsStyle() {
    var t = M.voiceTweak;
    if (t && t.name) return 'You are voicing ' + t.name + (t.from ? ' from ' + t.from : '') + '. Act it out like a voice actor: match their personality and react to the emotion of the line' + (t.who ? ' (' + t.who + ')' : '') + '.';
    if (M.settings.personality === 'dramatic') return 'Very dramatic and theatrical, like a stage actor, with big emotion.';
    return 'Warm, upbeat and expressive, like a fun friend chatting. Natural pace, not robotic.';
  }
  function ttsVoice() {
    var t = M.voiceTweak;
    if (t && t.voice) return t.voice;
    if (t && t.pitch) return t.pitch >= 1.15 ? 'coral' : t.pitch <= 0.9 ? 'onyx' : t.pitch < 1 ? 'ash' : 'shimmer';
    return M.settings.ttsVoice || 'marin';
  }
  function speakNatural(text, done) {
    var id = ++speakId, a = M.settings.ai;
    var body = { model: 'gpt-4o-mini-tts', voice: ttsVoice(), input: text.replace(/[•›*_#]/g, '').slice(0, 4000), instructions: ttsStyle(), response_format: 'mp3' };
    fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + a.key.trim() }, body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { var m = ''; try { m = JSON.parse(t).error.message; } catch (e) { m = 'error ' + r.status; } throw new Error(m); });
      return r.arrayBuffer();
    }).then(function (buf) {
      if (id !== speakId) return;               // something newer started talking
      var c = audioCtx();
      c.decodeAudioData(buf, function (audio) {
        if (id !== speakId) return;
        try { if (c.state === 'suspended' && c.resume) c.resume(); } catch (e) {}
        var src = c.createBufferSource(); src.buffer = audio; src.connect(c.destination);
        src.onended = function () { if (playing === src) { playing = null; finished(done); } };
        playing = src; src.start(0);
      }, function () { if (id === speakId) speakBuiltIn(text, done); });
    }).catch(function (e) {
      if (id !== speakId) return;
      if (!ttsWarned) {
        ttsWarned = true; var msg = String(e.message || e);
        M.toast(/scope|permission/i.test(msg) ? 'Your OpenAI key isn\'t allowed to make voices yet. Turn on its Audio permission on the OpenAI website. Using the iPad voice for now.'
          : 'Natural voice didn\'t work (' + msg.slice(0, 90) + '). Using the iPad voice for now.', 8000);
      }
      speakBuiltIn(text, done);
    });
  }

  M.stopSpeaking = function () {
    speakId++;
    if (playing) { var p = playing; playing = null; try { p.onended = null; p.stop(0); } catch (e) {} }
    if (window.speechSynthesis) speechSynthesis.cancel();
  };
  M.speak = function (text, done) {
    if (!text) { if (done) done(); return; }
    M.stopSpeaking();
    if (mode !== 'idle') stopRec();            // don't let the mirror hear itself
    if (M.naturalVoiceReady()) speakNatural(text, done); else speakBuiltIn(text, done);
  };

  /* ---------- Hearing ---------- */
  function stopRec() { try { if (rec) { rec.onend = null; rec.abort(); } } catch (e) {} rec = null; mode = 'idle'; }

  function newRec(continuous) {
    var r = new SR();
    r.lang = 'en-IN';
    r.interimResults = true;
    r.continuous = continuous;
    r.maxAlternatives = 1;
    return r;
  }

  // Background listening for the wake word
  M.startWake = function () {
    wantWake = !!M.settings.wake;
    if (!M.canHear || !wantWake || mode === 'command') return;
    stopRec();
    try {
      rec = newRec(true); mode = 'wake';
      rec.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var t = e.results[i][0].transcript.toLowerCase();
          var hit = M.config.wakeWords.filter(function (w) { return t.indexOf(w) >= 0; })[0];
          if (hit) {
            var rest = t.slice(t.indexOf(hit) + hit.length).trim();
            if (e.results[i].isFinal && rest.length > 2) { stopRec(); M.handleHeard(rest); return; }
            if (e.results[i].isFinal || rest.length === 0) { stopRec(); M.listen(); return; }
          }
        }
      };
      rec.onerror = function (ev) {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { wantWake = false; M.status('mic', false, 'Microphone not allowed'); }
      };
      rec.onend = function () { rec = null; if (mode === 'wake') { mode = 'idle'; if (wantWake) setTimeout(M.startWake, 400); } };
      rec.start();
      M.status('mic', true, 'Listening for "Hey Mirror"');
    } catch (e) { M.status('mic', false, 'Microphone unavailable here'); }
  };

  // Listen for one question/command
  M.listen = function () {
    if (!M.canHear) { M.openTypebar(); M.toast('Voice isn\'t available here. Type your command instead.'); return; }
    stopRec();
    M.stopSpeaking();
    M.show('assistant');
    M.orb('listening', 'Listening…');
    M.$('listenChip').hidden = false;
    M.lightsListening(true);
    var finalText = '';
    try {
      rec = newRec(false); mode = 'command';
      rec.onresult = function (e) {
        var t = '';
        for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        M.$('orbLabel').textContent = '“' + t + '”';
        if (e.results[e.results.length - 1].isFinal) finalText = t;
      };
      rec.onerror = function (ev) {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { M.status('mic', false, 'Microphone not allowed'); M.openTypebar(); }
      };
      rec.onend = function () {
        rec = null; mode = 'idle';
        M.$('listenChip').hidden = true;
        M.lightsListening(false);
        clearTimeout(commandTimer);
        if (finalText.trim()) M.handleHeard(finalText);
        else { M.orb('', 'I didn\'t catch that. Tap AI to try again.'); if (wantWake) setTimeout(M.startWake, 400); }
      };
      rec.start();
      commandTimer = setTimeout(function () { try { rec && rec.stop(); } catch (e) {} }, 9000);
    } catch (e) { mode = 'idle'; M.$('listenChip').hidden = true; M.lightsListening(false); M.openTypebar(); }
  };
  M.cancelListening = function () {
    stopRec(); clearTimeout(commandTimer);
    M.$('listenChip').hidden = true; M.lightsListening(false);
    M.stopSpeaking();
    M.orb('', 'Cancelled');
    if (wantWake) setTimeout(M.startWake, 400);
  };
  M.stopAllListening = function () { wantWake = false; stopRec(); };
})();
