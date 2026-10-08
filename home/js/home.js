/* Mirror Home: the family's phone app for the Smart Mirror.
   It talks to the mirror through the same MQTT messenger, using the mirror's pairing code.
     reads   smartmirror/CODE/family  (messages + shopping list, kept by the messenger)
     reads   smartmirror/CODE/videos  (saved videos + search results)
     sends   to-mirror {from, text} · shop {op, item} · video {url, title, save?, remove?}
             video-search {q} · cmd {text} · read {id} */
(function () {
  var MQTT_URL = 'wss://broker.hivemq.com:8884/mqtt';
  var MQTT_SCRIPT = 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
  var ROOT = 'smartmirror';
  var KEY = 'mirror-home-v1';
  var $ = function (id) { return document.getElementById(id); };

  var me = load();
  var client = null, connected = false;
  var family = { members: [], messages: [], shopping: [] };
  var videos = { saved: [], results: [], query: '', search: false };
  var seen = {};          // message ids already shown (so alerts only fire for new ones)
  var firstLoad = true, gotVideos = false;
  var tab = 'messages';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function store() { try { localStorage.setItem(KEY, JSON.stringify(me)); } catch (e) {} }
  // Same messenger as the mirror: private (EMQX or HiveMQ Cloud) if filled in, otherwise the free public one
  function address() {
    var h = (me.host || '').trim();
    if (!h) return MQTT_URL;
    if (/^wss?:\/\//.test(h)) return h;
    h = h.replace(/^(mqtts?|https?):\/\//, '').replace(/[:/].*$/, '');
    return 'wss://' + h + (/hivemq\.cloud$/.test(h) ? ':8884' : ':8084') + '/mqtt';   // HiveMQ Cloud uses 8884, EMQX uses 8084
  }
  function topic(n) { return ROOT + '/' + me.code + '/' + n; }
  function send(n, obj) {
    if (!connected) { flash('Not connected to the mirror yet.'); return false; }
    client.publish(topic(n), JSON.stringify(obj)); return true;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var flashTimer;
  function flash(text) { var b = $('banner'); b.textContent = text; b.hidden = false; clearTimeout(flashTimer); flashTimer = setTimeout(function () { b.hidden = true; }, 3500); }
  function same(a, b) { return String(a || '').toLowerCase() === String(b || '').toLowerCase(); }

  /* ---------- Setup ---------- */
  function showSetup() {
    $('setup').hidden = false; $('main').hidden = true;
    $('pairInput').value = me.code || ''; $('nameInput').value = me.name || '';
    $('hostInput').value = me.host || ''; $('userInput').value = me.user || ''; $('passInput').value = me.pass || '';
    $('privBox').open = !!me.host;
    $('whoLine').textContent = 'Not set up yet';
  }
  function showMain() {
    $('setup').hidden = true; $('main').hidden = false;
    $('whoLine').textContent = 'You are ' + me.name + ' · code ' + me.code + (me.host ? ' · private' : '');
    connect();
  }
  $('setupSave').onclick = function () {
    var code = $('pairInput').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    var name = $('nameInput').value.trim().slice(0, 20);
    if (code.length < 4) return flash('Type the pairing code from the mirror\'s Settings.');
    if (!name) return flash('Type your name, e.g. Mom.');
    var host = $('hostInput').value.trim(), user = $('userInput').value.trim(), pass = $('passInput').value;
    if (host && (!user || !pass)) return flash('Add the messenger username and password too.');
    me.code = code; me.name = name.charAt(0).toUpperCase() + name.slice(1);
    me.host = host; me.user = host ? user : ''; me.pass = host ? pass : ''; store();
    showMain();
  };
  $('resetSetup').onclick = function () { if (client) { try { client.end(true); } catch (e) {} client = null; } setConn(false); showSetup(); };

  /* ---------- Connection ---------- */
  function setConn(on, text) {
    connected = on; if ($('savedGrid')) renderVideos();
    $('conn').classList.toggle('on', on);
    $('connText').textContent = text || (on ? 'Connected' : 'Offline');
  }
  function connect() {
    if (client) { try { client.end(true); } catch (e) {} client = null; }
    setConn(false, 'Connecting…');
    function go() {
      var opts = { clientId: 'home-' + Math.random().toString(16).slice(2, 10), reconnectPeriod: 5000, connectTimeout: 8000 };
      if (me.host) { opts.username = me.user; opts.password = me.pass; }
      client = window.mqtt.connect(address(), opts);
      client.on('connect', function () { setConn(true); client.subscribe([topic('family'), topic('videos'), topic('state')]); });
      client.on('close', function () { setConn(false); });
      client.on('error', function () { setConn(false, 'Can\'t connect'); });
      client.on('message', function (t, buf) {
        var msg; try { msg = JSON.parse(buf.toString()); } catch (e) { return; }
        if (t === topic('family')) { family = msg; renderMessages(); renderShop(); firstLoad = false; }
        if (t === topic('videos')) { videos = msg; gotVideos = true; renderVideos(); }
      });
    }
    if (window.mqtt) return go();
    var s = document.createElement('script'); s.src = MQTT_SCRIPT; s.onload = go;
    s.onerror = function () { setConn(false, 'Messenger blocked'); flash('This page can\'t reach the messenger here. Open it from its web link.'); };
    document.head.appendChild(s);
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll('.tab').forEach(function (b) {
    b.onclick = function () {
      tab = b.getAttribute('data-tab');
      document.querySelectorAll('.tab').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      ['messages', 'shopping', 'videos', 'remote'].forEach(function (n) { $('tab-' + n).hidden = n !== tab; });
      if (tab === 'messages') markRead();
    };
  });

  /* ---------- Messages ---------- */
  function forMe(m) { return same(m.to, me.name); }
  function fromMe(m) { return same(m.from, me.name); }
  function fmt(ts) {
    if (!ts) return '';
    var d = new Date(ts), now = new Date();
    var t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return d.toDateString() === now.toDateString() ? t : d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ', ' + t;
  }
  function renderMessages() {
    var box = $('thread'); box.innerHTML = '';
    var list = (family.messages || []).filter(function (m) { return forMe(m) || fromMe(m) || same(m.to, 'Mirror') || same(m.to, 'Everyone'); });
    if (!list.length) box.appendChild(el('div', 'empty', 'No messages yet. Say "Hey Mirror, send a message to ' + me.name + '…" or write one below.'));
    var fresh = [];
    list.forEach(function (m) {
      var b = el('div', 'msg' + (fromMe(m) ? ' mine' : '') + (forMe(m) && !fromMe(m) ? ' forme' : ''));
      b.appendChild(el('div', 'meta', (fromMe(m) ? 'You' : m.from) + ' → ' + (forMe(m) ? 'you' : m.to) + ' · ' + fmt(m.ts)));
      b.appendChild(el('div', '', m.text));
      box.appendChild(b);
      if (m.id && !seen[m.id]) { seen[m.id] = 1; if (forMe(m) && !fromMe(m) && !m.read) fresh.push(m); }
    });
    box.scrollTop = box.scrollHeight;
    var unread = list.filter(function (m) { return forMe(m) && !fromMe(m) && !m.read; }).length;
    $('msgBadge').textContent = unread; $('msgBadge').hidden = !unread;
    if (!firstLoad) fresh.forEach(alertFor);
    if (tab === 'messages' && !document.hidden) markRead();
  }
  function markRead() {
    (family.messages || []).forEach(function (m) { if (m.id && forMe(m) && !fromMe(m) && !m.read) { m.read = true; send('read', { id: m.id }); } });
    $('msgBadge').hidden = true;
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && tab === 'messages') markRead(); });

  function alertFor(m) {
    flash('New message from ' + m.from + ': ' + m.text);
    if (navigator.vibrate) navigator.vibrate(150);
    if (window.Notification && Notification.permission === 'granted' && document.hidden) {
      try { new Notification('Message from ' + m.from, { body: m.text, tag: m.id }); } catch (e) {}
    }
  }
  function updateNotifyBtn() {
    var b = $('notifyBtn');
    if (!window.Notification) { b.textContent = 'Alerts: add this app to your Home Screen first'; b.disabled = true; return; }
    if (Notification.permission === 'granted') { b.textContent = 'Alerts are on'; b.disabled = true; }
    else if (Notification.permission === 'denied') { b.textContent = 'Alerts are blocked in Settings'; b.disabled = true; }
  }
  $('notifyBtn').onclick = function () {
    if (!window.Notification) return;
    Notification.requestPermission().then(updateNotifyBtn);
  };
  $('composeForm').onsubmit = function (e) {
    e.preventDefault();
    var text = $('composeInput').value.trim(); if (!text) return;
    if (send('to-mirror', { from: me.name, text: text.slice(0, 300) })) { $('composeInput').value = ''; flash('Sent to the mirror.'); }
  };

  /* ---------- Shopping ---------- */
  function renderShop() {
    var ul = $('shopList'); ul.innerHTML = '';
    var list = family.shopping || [];
    if (!list.length) { ul.appendChild(el('li', 'empty', 'The list is empty. Say "Hey Mirror, we need milk."')); }
    list.forEach(function (x) {
      var li = el('li', x.done ? 'done' : ''), lab = el('label'), cb = el('input');
      cb.type = 'checkbox'; cb.checked = !!x.done;
      cb.onchange = function () { send('shop', { op: 'toggle', item: x.item }); };
      lab.appendChild(cb); lab.appendChild(el('span', '', x.item)); li.appendChild(lab); ul.appendChild(li);
    });
    $('clearDone').hidden = !list.some(function (x) { return x.done; });
  }
  $('shopForm').onsubmit = function (e) {
    e.preventDefault();
    var item = $('shopInput').value.trim(); if (!item) return;
    if (send('shop', { op: 'add', item: item.slice(0, 60) })) $('shopInput').value = '';
  };
  $('clearDone').onclick = function () { send('shop', { op: 'clearDone' }); };

  /* ---------- Videos ---------- */
  function ytId(url) {
    var m = String(url).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  function card(v, opts) {
    var c = el('div', 'vcard'), id = ytId(v.url), img = el('img');
    img.alt = ''; img.loading = 'lazy'; img.onerror = function () { img.style.visibility = 'hidden'; }; if (id) img.src = 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
    c.appendChild(img); c.appendChild(el('div', 'vt', v.title));
    var row = el('div', 'vb'), play = el('button', 'play', 'Play');
    play.onclick = function () { if (send('video', { url: v.url, title: v.title })) flash('Playing on the mirror.'); };
    row.appendChild(play);
    if (opts.save) {
      var s = el('button', '', 'Save'); s.onclick = function () { if (send('video', { url: v.url, title: v.title, save: true })) flash('Saved to the mirror\'s videos.'); }; row.appendChild(s);
      var so = el('button', '', 'As song'); so.onclick = function () { if (send('video', { url: v.url, title: v.title, save: true, song: true })) flash('Saved to the mirror\'s songs.'); }; row.appendChild(so);
    }
    if (opts.remove) { var r = el('button', '', 'Remove'); r.onclick = function () { if (confirm('Remove "' + v.title + '" from the mirror?')) send('video', { url: v.url, title: v.title, remove: true }); }; row.appendChild(r); }
    c.appendChild(row); return c;
  }
  function renderVideos() {
    var sg = $('songGrid'); sg.innerHTML = '';
    (videos.songs || []).forEach(function (v) { sg.appendChild(card(v, { remove: true })); });
    if (!(videos.songs || []).length) sg.appendChild(el('p', 'muted', gotVideos ? 'No songs yet. Paste a link above and tap Save as song.' : 'Songs show up here once connected to the mirror.'));
    var g = $('savedGrid'); g.innerHTML = '';
    (videos.saved || []).forEach(function (v) { g.appendChild(card(v, { remove: true })); });
    if (!(videos.saved || []).length) g.appendChild(el('p', 'muted', gotVideos ? 'No saved videos yet. Add one above.' : (connected ? 'Waiting for the mirror… Make sure it\'s switched on and uses code ' + me.code + '.' : 'Not connected yet. The mirror\'s videos show up here once this app is opened from its web link.')));
    $('searchForm').hidden = !videos.search;
    var r = videos.results || [];
    $('resultsBox').hidden = !r.length;
    $('resultsHead').textContent = 'Results for "' + (videos.query || '') + '"';
    var rg = $('resultsGrid'); rg.innerHTML = '';
    r.forEach(function (v) { rg.appendChild(card(v, { save: true })); });
  }
  function pickedVideo() {
    var url = $('vidUrl').value.trim();
    if (!ytId(url)) { flash('That doesn\'t look like a YouTube link.'); return null; }
    return { url: url, title: $('vidTitle').value.trim() || 'Video' };
  }
  $('pasteBtn').onclick = function () {
    if (!navigator.clipboard || !navigator.clipboard.readText) return flash('Your browser can\'t paste here. Press and hold the box below, then tap Paste.');
    navigator.clipboard.readText().then(function (t) {
      t = (t || '').trim();
      if (!ytId(t)) return flash('What you copied isn\'t a YouTube link. In YouTube tap Share, then Copy link.');
      $('vidUrl').value = t; $('vidTitle').focus();
    }).catch(function () { flash('Tap "Allow Paste" when your phone asks, or press and hold the box below and tap Paste.'); });
  };
  $('vidPlay').onclick = function () { var v = pickedVideo(); if (v && send('video', v)) flash('Playing on the mirror.'); };
  function saveTo(song) {
    var v = pickedVideo(); if (!v) return;
    if (v.title === 'Video' && song) v.title = 'Song';
    if (send('video', { url: v.url, title: v.title, save: true, song: song })) { $('vidUrl').value = ''; $('vidTitle').value = ''; flash(song ? 'Saved. Say "Hey Mirror, my songs" to see it.' : 'Saved. It\'s on the mirror\'s video shelf now.'); }
  }
  $('vidSave').onclick = function () { saveTo(false); };
  $('songSave').onclick = function () { saveTo(true); };
  $('searchForm').onsubmit = function (e) {
    e.preventDefault();
    var q = $('searchInput').value.trim(); if (!q) return;
    if (send('video-search', { q: q.slice(0, 80) })) flash('Searching… results show here and on the mirror.');
  };

  /* ---------- Remote ---------- */
  var screens = [['Home', 'go home'], ['Weather', 'show weather'], ['Timetable', 'show my timetable'], ['Music', 'show music'], ['Videos', 'show videos'], ['Recipe idea', 'random recipe'], ['Joke', 'tell me a joke'], ['Sleep', 'go to sleep'], ['Wake', 'wake up']];
  screens.forEach(function (s) { var b = el('button', 'chip', s[0]); b.onclick = function () { send('cmd', { text: s[1] }); }; $('screenChips').appendChild(b); });
  var colours = [['red', '#ff2b2b'], ['orange', '#ff8c1a'], ['yellow', '#ffe11a'], ['green', '#22e05a'], ['teal', '#1ad1c2'], ['blue', '#2b6bff'], ['purple', '#9b5cff'], ['pink', '#ff5fa2'], ['white', '#ffffff']];
  colours.forEach(function (c) {
    var b = el('button', 'sw'); b.style.background = c[1]; b.setAttribute('aria-label', c[0] + ' lights');
    b.onclick = function () { send('cmd', { text: 'lights ' + c[0] }); }; $('swatches').appendChild(b);
  });
  [['Rainbow', 'rainbow mode'], ['Party', 'party mode'], ['Calm', 'calm mode'], ['Lights off', 'lights off'], ['Lights on', 'lights on']].forEach(function (m) {
    var b = el('button', 'chip', m[0]); b.onclick = function () { send('cmd', { text: m[1] }); }; $('modeChips').appendChild(b);
  });
  var brightTimer;
  $('bright').oninput = function (e) { clearTimeout(brightTimer); brightTimer = setTimeout(function () { send('cmd', { text: 'brightness ' + e.target.value }); }, 250); };
  $('cmdForm').onsubmit = function (e) {
    e.preventDefault();
    var t = $('cmdInput').value.trim(); if (!t) return;
    if (send('cmd', { text: t.slice(0, 200) })) { $('cmdInput').value = ''; flash('Sent: ' + t); }
  };

  /* ---------- Start ---------- */
  updateNotifyBtn();
  if (me.code && me.name) showMain(); else showSetup();
})();
