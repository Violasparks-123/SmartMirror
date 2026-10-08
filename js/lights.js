/* Lights + messages: talks to the ESP32 and the phone remote through the MQTT messenger.
   Topics (xxxx = pairing code):
     smartmirror/xxxx/lights  ← mirror sends light state  {mode, color, brightness, on}
     smartmirror/xxxx/beat    ← mirror sends music beats  {level}
     smartmirror/xxxx/touch   → ESP32 sends touches        {spot: 1-4, kind: "tap"|"double"|"hold"}
     smartmirror/xxxx/cmd     → remote sends text commands {text}
     smartmirror/xxxx/state   ← mirror shares its state for the remote
     smartmirror/xxxx/to-mirror → Mirror Home sends family messages {from, text}
     smartmirror/xxxx/shop      → Mirror Home edits the shopping list {op, item}
     smartmirror/xxxx/video     → Mirror Home sends a video link {url, title}
     smartmirror/xxxx/video-search → Mirror Home asks the mirror to search YouTube {q}
     smartmirror/xxxx/videos    ← mirror shares saved videos + search results (retained)
     smartmirror/xxxx/family    ← mirror shares messages + shopping list (kept/retained) */
(function () {
  var client = null, connected = false, savedMode = null;
  function topic(name) { return M.config.topicRoot + '/' + M.settings.pairing + '/' + name; }
  M.topic = topic;

  function publish(name, obj) {
    if (client && connected) { try { client.publish(topic(name), JSON.stringify(obj)); } catch (e) {} }
  }
  M.publish = publish;
  // "Retained" messages are kept by the messenger, so an app that opens later still gets the latest copy
  M.publishRetained = function (name, obj) {
    if (client && connected) { try { client.publish(topic(name), JSON.stringify(obj), { retain: true }); } catch (e) {} }
  };
  M.isConnected = function () { return connected; };

  // Private messenger (EMQX or HiveMQ Cloud) if one is saved in Settings, otherwise the free public one.
  // Accepts "abc123.ala.eu-central-1.emqxsl.com" or a full wss:// address.
  M.mqttAddress = function () {
    var h = ((M.settings.mqtt || {}).host || '').trim();
    if (!h) return M.config.mqttUrl;
    if (/^wss?:\/\//.test(h)) return h;
    h = h.replace(/^(mqtts?|https?):\/\//, '').replace(/[:/].*$/, '');
    return 'wss://' + h + (/hivemq\.cloud$/.test(h) ? ':8884' : ':8084') + '/mqtt';   // HiveMQ Cloud uses 8884, EMQX uses 8084
  };
  M.connectMessenger = function () {
    if (client) { try { client.end(true); } catch (e) {} client = null; connected = false; }
    function go() {
      try {
        var opts = { clientId: 'mirror-' + Math.random().toString(16).slice(2, 10), reconnectPeriod: 5000, connectTimeout: 8000 };
        var priv = M.settings.mqtt || {};
        if (priv.host) { opts.username = priv.user; opts.password = priv.pass; }
        client = window.mqtt.connect(M.mqttAddress(), opts);
        client.on('connect', function () {
          connected = true;
          client.subscribe([topic('touch'), topic('cmd'), topic('to-mirror'), topic('shop'), topic('video'), topic('video-search'), topic('read')]);
          if (M.onMessengerReady) M.onMessengerReady();
          M.status('lights', true, 'Connected to lights and remote (code ' + M.settings.pairing + ', ' + ((M.settings.mqtt || {}).host ? 'private messenger' : 'public messenger') + ')');
          M.sendLights();
        });
        client.on('close', function () { connected = false; M.status('lights', false, 'Lights and remote not connected'); });
        client.on('error', function () { connected = false; });
        client.on('message', function (t, buf) {
          var msg; try { msg = JSON.parse(buf.toString()); } catch (e) { return; }
          if (t === topic('touch') && msg.spot) M.onSpot(+msg.spot, msg.kind || 'tap');
          if (t === topic('cmd') && msg.text) M.runCommand(String(msg.text).slice(0, 200), { source: 'remote' });
          if (M.onMqtt) M.onMqtt(t.split('/').pop(), msg);
        });
      } catch (e) { M.status('lights', false, 'Lights and remote unavailable here'); }
    }
    if (window.mqtt) return go();
    var s = document.createElement('script');
    s.src = M.config.mqttScript;
    s.onload = go;
    s.onerror = function () { M.status('lights', false, 'Lights and remote unavailable here (messenger blocked)'); };
    document.head.appendChild(s);
  };

  M.sendLights = function () {
    var L = M.settings.lights;
    publish('lights', { mode: L.on ? L.mode : 'off', color: L.color, brightness: L.brightness, on: L.on });
    publish('state', { screen: M.current, theme: M.settings.theme, lights: L });
    M.renderLedPreview();
  };
  M.setLights = function (patch) {
    Object.assign(M.settings.lights, patch);
    if (patch.mode && patch.mode !== 'off') M.settings.lights.on = true;
    if (patch.color && !patch.mode) M.settings.lights.mode = 'solid';
    M.save(); M.sendLights();
  };

  // Temporary effects that return to the normal lights afterwards
  M.lightsListening = function (on) {
    if (on) { savedMode = M.settings.lights.mode; M.settings.lights.mode = 'listening'; publish('lights', { mode: 'listening', color: M.settings.lights.color, brightness: M.settings.lights.brightness, on: true }); }
    else if (M.settings.lights.mode === 'listening') { M.settings.lights.mode = savedMode || 'solid'; savedMode = null; M.sendLights(); }
    M.renderLedPreview();
  };
  var lastBeat = 0;
  M.lightsBeat = function (level) {
    var now = performance.now();
    if (now - lastBeat < 120) return;
    lastBeat = now;
    publish('beat', { level: Math.round(level * 100) / 100 });
    M.renderLedPreview(true);
    setTimeout(function () { M.renderLedPreview(false); }, 110);
  };
  M.lightsPulse = function () { publish('lights', { mode: 'pulse', color: M.settings.lights.color, brightness: 100, on: true }); M.renderLedPreview(true); setTimeout(M.sendLights, 600); };

  M.colors = {
    red: '#ff2b2b', crimson: '#dc143c', maroon: '#a0102a', pink: '#ff5fa2', 'hot pink': '#ff3399', 'baby pink': '#ffb6d5', rose: '#ff6b8b', magenta: '#ff00cc', fuchsia: '#ff1aff',
    orange: '#ff8c1a', peach: '#ffb38a', coral: '#ff7f61', amber: '#ffbf00', gold: '#ffd700', yellow: '#ffe11a', lemon: '#fff44f',
    lime: '#a3ff1a', green: '#22e05a', mint: '#7dffc8', 'dark green': '#0f8a3a', emerald: '#2ee59d', olive: '#9aa51a', teal: '#1ad1c2', turquoise: '#33e6d6', aqua: '#33ffee', cyan: '#22d3ee',
    'sky blue': '#6cc8ff', 'light blue': '#8fd3ff', blue: '#2f6bff', 'dark blue': '#1a33cc', navy: '#1a2a99', 'royal blue': '#3355ff', indigo: '#5b3cff',
    purple: '#a855f7', violet: '#8b5cf6', lavender: '#c4b5fd', lilac: '#d6a6ff', plum: '#b05bd6',
    white: '#ffffff', 'warm white': '#ffd9a8', 'cool white': '#e6f0ff', cream: '#fff1cc'
  };
})();
