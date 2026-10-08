/* Screens, messages on screen, themes and the on-screen light preview. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  M.$ = $;
  M.screens = ['home', 'weather', 'schedule', 'music', 'videos'];   // the order "Screens" cycles through
  M.current = 'home';

  M.show = function (name) {
    if (!$('screen-' + name)) return;
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === 'screen-' + name); });
    M.current = name;
    if (name === 'settings' && M.renderSettings) M.renderSettings();
    if (name === 'schedule' && M.renderSchedule) M.renderSchedule();
  };
  M.nextScreen = function (dir) {
    var i = M.screens.indexOf(M.current);
    if (i < 0) i = 0; else i = (i + (dir || 1) + M.screens.length) % M.screens.length;
    M.show(M.screens[i]);
  };

  var toastTimer;
  M.toast = function (text, ms) {
    var t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 3200);
  };

  M.bubble = function (who, text) {
    var chat = $('chat');
    var b = document.createElement('div');
    b.className = 'bubble ' + who;
    b.textContent = text;
    chat.appendChild(b);
    while (chat.children.length > 6) chat.removeChild(chat.firstChild);
  };
  M.clearChat = function () { $('chat').innerHTML = ''; };

  M.orb = function (state, label) {
    var o = $('orb');
    o.classList.toggle('listening', state === 'listening');
    o.classList.toggle('thinking', state === 'thinking');
    if (label != null) $('orbLabel').textContent = label;
  };

  M.applyTheme = function () {
    var m = $('mirror');
    m.setAttribute('data-theme-name', M.settings.theme);
    m.classList.toggle('mirror-mode', !!M.settings.mirrorMode);
  };

  /* On-screen preview of the LED strip (the real strip is driven by lights.js) */
  M.renderLedPreview = function (beat) {
    var f = $('ledFrame'), L = M.settings.lights;
    if (!M.settings.ledPreview || !L.on || L.mode === 'off') { f.style.setProperty('--led-strength', 0); f.className = 'led-frame'; return; }
    f.className = 'led-frame' + (L.mode === 'rainbow' || L.mode === 'party' ? ' rainbow' : '') + (L.mode === 'listening' ? ' chase' : '');
    f.style.setProperty('--led', L.color);
    var strength = Math.max(0.15, L.brightness / 100);
    if (beat) strength = 1;
    f.style.setProperty('--led-strength', strength);
  };

  /* Home: reminders */
  M.renderReminders = function () {
    var box = $('reminderList');
    box.innerHTML = '';
    var r = M.settings.reminders;
    if (!r.length) { var e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No reminders. Say "remind me to…"'; box.appendChild(e); return; }
    r.slice(0, 5).forEach(function (x) { var d = document.createElement('div'); d.textContent = '› ' + x.text; box.appendChild(d); });
  };

  /* Clock + greeting */
  M.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  M.fmtTime = function (d) { var h = d.getHours() % 12 || 12; return h + ':' + M.pad(d.getMinutes()); };
  M.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  M.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  M.tickClock = function () {
    var d = new Date();
    $('clock').textContent = M.fmtTime(d);
    $('date').textContent = M.dayNames[d.getDay()] + ', ' + d.getDate() + ' ' + M.monthNames[d.getMonth()];
    var h = d.getHours(), name = M.settings.name ? ', ' + M.settings.name : '';
    $('greet').textContent = (h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night') + name;
  };
})();
