/* Starts everything up, runs the touch spots, Settings and the sleep timer. */
(function () {
  var $ = M.$;

  /* ---------- Connection status (shown in Settings and "run diagnostics") ---------- */
  M.statuses = {};
  M.status = function (key, ok, text) { M.statuses[key] = { ok: ok, text: text }; renderStatus(); };
  function renderStatus() {
    var box = $('statusList'); if (!box) return;
    box.innerHTML = '';
    Object.keys(M.statuses).forEach(function (k) {
      var s = M.statuses[k], d = document.createElement('div');
      d.className = s.ok ? 'ok' : 'off'; d.textContent = (s.ok ? '● ' : '○ ') + s.text; box.appendChild(d);
    });
  }

  /* ---------- Touch spots: tap, double-tap, hold ---------- */
  var spotActions = {
    1: { tap: function () { M.listen(); }, double: function () { M.cancelListening(); }, hold: function () { M.runCommand('secret mode', { silentEcho: true }); } },
    // Spot 2 is the "media" spot: music normally, videos when the video shelf or a video is on screen
    2: { tap: function () { if (M.current === 'videos') M.shelfMove(1); else if (M.current === 'video') M.toggleVideo(); else M.musicToggle(); },
         double: function () { if (M.current === 'videos') M.shelfMove(-1); else if (M.current === 'video') M.backToShelf(); else { M.musicNext(); M.show('music'); } },
         hold: function () { if (M.current === 'videos') M.shelfPlay(); else if (M.current === 'video') M.closeVideo(); else M.show('music'); } },
    3: { tap: function () { M.nextScreen(1); }, double: function () { M.nextScreen(-1); }, hold: function () { M.show('home'); } },
    4: { tap: function () { M.cycleColor(); }, double: function () { M.setLights({ mode: 'party' }); M.toast('Party mode'); }, hold: function () { M.setLights({ on: !M.settings.lights.on }); M.toast(M.settings.lights.on ? 'Lights on' : 'Lights off'); } }
  };
  M.onSpot = function (n, kind) {
    var wasAsleep = $('mirror').classList.contains('sleeping');
    M.poke();
    if (wasAsleep) return;                 // first touch just wakes the mirror
    var a = spotActions[n]; if (a && a[kind]) a[kind]();
    var el = document.querySelector('.spot[data-spot="' + n + '"]');
    if (el) { el.classList.add('pressed'); setTimeout(function () { el.classList.remove('pressed'); }, 250); }
  };
  document.querySelectorAll('.spot[data-spot]').forEach(function (b) {
    var n = +b.getAttribute('data-spot'), downAt = 0, holdTimer = null, tapTimer = null, held = false;
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault(); downAt = Date.now(); held = false;
      holdTimer = setTimeout(function () { held = true; clearTimeout(tapTimer); tapTimer = null; M.onSpot(n, 'hold'); }, 650);
    });
    function up() {
      clearTimeout(holdTimer);
      if (held || !downAt) { downAt = 0; return; }
      downAt = 0;
      if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; M.onSpot(n, 'double'); }
      else tapTimer = setTimeout(function () { tapTimer = null; M.onSpot(n, 'tap'); }, 320);
    }
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', function () { clearTimeout(holdTimer); downAt = 0; });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); M.onSpot(n, 'tap'); } });
  });
  // Keyboard keys 1–4 act like the touch spots (handy when testing on a laptop)
  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (/^[1-4]$/.test(e.key)) M.onSpot(+e.key, e.shiftKey ? 'hold' : 'tap');
    if (e.key === '/') { e.preventDefault(); M.openTypebar(); }
  });

  /* ---------- Typing commands ---------- */
  M.openTypebar = function () { var f = $('typebar'); f.hidden = false; $('typeInput').focus(); };
  $('kbdBtn').onclick = function () { var f = $('typebar'); if (f.hidden) M.openTypebar(); else f.hidden = true; };
  $('typebar').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('typeInput').value.trim(); if (!v) return;
    $('typeInput').value = '';
    M.runCommand(v);
  });
  $('gearBtn').onclick = function () { M.show(M.current === 'settings' ? 'home' : 'settings'); };
  M.handleHeard = function (text) { M.show('assistant'); M.runCommand(text); };

  /* ---------- Sleep after a while with nothing happening ---------- */
  var lastPoke = Date.now();
  M.poke = function () { lastPoke = Date.now(); if ($('mirror').classList.contains('sleeping')) M.wake(); };
  M.sleep = function () { $('mirror').classList.add('sleeping'); };
  M.wake = function () { $('mirror').classList.remove('sleeping'); lastPoke = Date.now(); };
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { lastPoke = Date.now(); if ($('mirror').classList.contains('sleeping')) M.wake(); }, true); });

  /* ---------- Settings screen ---------- */
  var themeInfo = [['dream', 'Dream', '#b49cff'], ['minimal', 'Minimal', '#ffffff'], ['cyberpunk', 'Cyberpunk', '#f472b6'], ['retro', 'Retro', '#4ade80'], ['space', 'Space', '#67e8f9'], ['sunset', 'Sunset', '#fdba74']];
  var dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], dayLong = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  M.renderSettings = function () {
    var S = M.settings;
    var g = $('themeGrid'); g.innerHTML = '';
    themeInfo.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'theme-btn'; b.style.setProperty('--c', t[2]);
      b.setAttribute('aria-pressed', S.theme === t[0] ? 'true' : 'false');
      b.innerHTML = '<b>8:07</b>' + t[1];
      b.onclick = function () { S.theme = t[0]; M.save(); M.applyTheme(); M.renderSettings(); };
      g.appendChild(b);
    });
    $('setMirrorMode').checked = !!S.mirrorMode;
    $('setLedPreview').checked = !!S.ledPreview;
    $('setName').value = S.name || '';
    $('setCity').value = S.city.name;
    $('setWake').checked = !!S.wake;
    $('setGestures').checked = !!S.gestures;
    $('setPair').value = S.pairing;
    var sel = $('setVoice'); sel.innerHTML = '';
    var auto = document.createElement('option'); auto.value = ''; auto.textContent = 'Best available'; sel.appendChild(auto);
    M.voices.forEach(function (v) { var o = document.createElement('option'); o.value = v.voiceURI; o.textContent = v.name + ' (' + v.lang + ')'; if (v.voiceURI === S.voiceURI) o.selected = true; sel.appendChild(o); });
    var ed = $('ttEditor'); ed.innerHTML = '';
    dayKeys.forEach(function (k) {
      var l = document.createElement('label'); l.textContent = dayLong[k];
      var ta = document.createElement('textarea'); ta.id = 'tt-' + k;
      ta.value = (S.timetable[k] || []).map(function (c) { return c[0] + (c[2] ? '-' + c[2] : '') + ' ' + c[1]; }).join('\n');
      l.appendChild(ta); ed.appendChild(l);
    });
    $('videoList').value = (S.videos || []).map(function (v) { return v.title + ' | ' + v.url; }).join('\n');
    $('setFamily').value = (S.family && S.family.members || []).join(', ');
    $('setYtKey').value = S.youtubeKey || '';
    var mq = S.mqtt || {};
    $('setMqttHost').value = mq.host || ''; $('setMqttUser').value = mq.user || ''; $('setMqttPass').value = mq.pass || '';
    $('songCount').textContent = M.playlist.length ? M.playlist.length + ' song(s) ready' : 'No songs yet. Add a few MP3s.';
    renderStatus();
  };
  function bindSettings() {
    var S = M.settings;
    $('setMirrorMode').onchange = function (e) { S.mirrorMode = e.target.checked; M.save(); M.applyTheme(); };
    $('setLedPreview').onchange = function (e) { S.ledPreview = e.target.checked; M.save(); M.renderLedPreview(); };
    $('setName').onchange = function (e) { S.name = e.target.value.trim().slice(0, 30); M.save(); M.tickClock(); };
    $('setCityBtn').onclick = function () {
      var name = $('setCity').value.trim(); if (!name) return;
      $('cityStatus').textContent = 'Looking up ' + name + '…';
      M.findCity(name).then(function (c) { S.city = c; M.save(); $('cityStatus').textContent = 'Set to ' + c.name; M.loadWeather(); })
        .catch(function () { $('cityStatus').textContent = 'Couldn\'t look that up here. It will work once the mirror is online.'; });
    };
    $('setVoice').onchange = function (e) { S.voiceURI = e.target.value; M.save(); };
    $('voiceTest').onclick = function () { M.speak('Hi! This is how I sound. It\'s ' + M.fmtTime(new Date()) + '.'); };
    $('setWake').onchange = function (e) { S.wake = e.target.checked; M.save(); if (S.wake) M.startWake(); else M.stopAllListening(); };
    $('setGestures').onchange = function (e) { S.gestures = e.target.checked; M.save(); if (S.gestures) M.startGestures(); else M.stopGestures(); };
    $('pairSave').onclick = function () {
      var v = $('setPair').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (v.length < 4) { M.toast('Use at least 4 letters or numbers'); return; }
      S.pairing = v; M.save(); M.connectMessenger(); M.toast('Pairing code saved');
    };
    $('ttSave').onclick = function () {
      var bad = [];
      dayKeys.forEach(function (k) {
        var lines = $('tt-' + k).value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), list = [];
        lines.forEach(function (line) {
          var m = line.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?\s*(?:(?:-|–|to)\s*(\d{1,2})[:.](\d{2})\s*(am|pm)?)?\s+(.+)$/i);
          if (!m) { bad.push(dayLong[k] + ': "' + line + '"'); return; }
          var h = +m[1]; if (m[3]) { h = h % 12 + (/pm/i.test(m[3]) ? 12 : 0); }
          var entry = [M.pad(h) + ':' + m[2], m[7].trim()];
          if (m[4]) { var h2 = +m[4]; if (m[6]) { h2 = h2 % 12 + (/pm/i.test(m[6]) ? 12 : 0); } entry.push(M.pad(h2) + ':' + m[5]); }
          list.push(entry);
        });
        list.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
        S.timetable[k] = list;
      });
      S.timetableIsSample = false; M.save(); M.renderToday();
      $('ttStatus').textContent = bad.length ? 'Saved, but I skipped: ' + bad.join(', ') + '. Use the format 10:30-12:30 Maths.' : 'Saved!';
    };
    $('setClose').onclick = function () { M.show('home'); };
    $('videoSave').onclick = function () {
      var out = [], bad = 0;
      $('videoList').value.split('\n').forEach(function (line) {
        var p = line.split('|'); if (!line.trim()) return;
        if (p.length < 2 || !M.youtubeId(p[1].trim())) { bad++; return; }
        out.push({ title: p[0].trim() || 'Video', url: p[1].trim() });
      });
      S.videos = out; M.save(); if (M.shareVideos) M.shareVideos();
      $('videoStatus').textContent = 'Saved ' + out.length + ' video' + (out.length === 1 ? '' : 's') + (bad ? ', skipped ' + bad + ' line(s) without a YouTube link' : '') + '.';
    };
    $('ytKeySave').onclick = function () {
      S.youtubeKey = $('setYtKey').value.trim(); M.save(); if (M.shareVideos) M.shareVideos();
      $('ytKeyStatus').textContent = S.youtubeKey ? 'Saved. Try "search YouTube for cats".' : 'Key removed.';
    };
    $('mqttSave').onclick = function () {
      var host = $('setMqttHost').value.trim(), user = $('setMqttUser').value.trim(), pass = $('setMqttPass').value;
      if (host && (!user || !pass)) { $('mqttStatus').textContent = 'Add the username and password too.'; return; }
      S.mqtt = host ? { host: host, user: user, pass: pass } : {}; M.save(); M.connectMessenger();
      $('mqttStatus').textContent = host ? 'Saved. Connecting to your private messenger… Use the same details in Mirror Home and the ESP32.' : 'Using the free public messenger.';
    };
    $('videoFiles').addEventListener('change', function (e) { M.addLocalVideos(e.target.files); $('videoStatus').textContent = 'Added ' + e.target.files.length + ' video file(s) until the page reloads.'; });
    $('familySave').onclick = function () {
      var list = $('setFamily').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 8);
      if (!list.length) return;
      S.family.members = list; M.save(); if (M.onMessengerReady) M.onMessengerReady(); M.toast('Family saved');
    };
  }

  /* ---------- Start ---------- */
  function start() {
    M.applyTheme();
    M.tickClock(); setInterval(M.tickClock, 1000);
    M.renderToday(); M.renderReminders(); M.renderMessages(); M.renderEventLine();
    setInterval(function () {
      M.renderToday(); M.renderEventLine();
      if (Date.now() - lastPoke > M.config.idleMinutes * 60000 && !M.isPlaying() && M.current !== 'settings') { M.show('home'); }
    }, 30000);
    bindSettings();
    M.initMusic();
    M.loadWeather(); setInterval(M.loadWeather, 15 * 60000);
    M.connectMessenger();
    M.renderLedPreview();
    M.status('mic', false, M.canHear ? 'Microphone ready (tap AI to talk)' : 'Voice input not available here, type instead');
    if (!M.settings.gestures) M.status('gestures', false, 'Gestures off');
    if (M.canHear && M.settings.wake) M.startWake();
    if (M.settings.gestures) M.startGestures();
    M.status('commands', true, M.commandCount() + ' built-in command phrasings loaded');
    M.bubble('bot', 'Hi! Tap AI and talk, or tap the keyboard to type. Try "what can you do".');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
