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
  M.speak = function (text, done) {
    if (!window.speechSynthesis || !text) { if (done) done(); return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.replace(/[•›]/g, ''));
      var v = pickVoice(); if (v) u.voice = v;
      u.rate = M.settings.personality === 'dramatic' ? 0.9 : 1.02;
      u.pitch = M.settings.personality === 'dramatic' ? 1.15 : 1;
      var paused = (mode !== 'idle');
      if (paused) stopRec();            // don't let the mirror hear itself
      u.onend = u.onerror = function () { if (done) done(); if (wantWake) setTimeout(M.startWake, 300); };
      speechSynthesis.speak(u);
    } catch (e) { if (done) done(); }
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
    if (window.speechSynthesis) speechSynthesis.cancel();
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
    if (window.speechSynthesis) speechSynthesis.cancel();
    M.orb('', 'Cancelled');
    if (wantWake) setTimeout(M.startWake, 400);
  };
  M.stopAllListening = function () { wantWake = false; stopRec(); };
})();
