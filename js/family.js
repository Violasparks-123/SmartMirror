/* Family messages + shared shopping list, synced with the Mirror Home phone app. */
(function () {
  if (!M.settings.family) M.settings.family = { members: ['Mom', 'Dad'], messages: [], shopping: [] };
  var F = M.settings.family;
  var aliases = {
    mom: /^(mom|mum|mummy|mommy|mama|amma|ammi|mother|maa?)$/i,
    dad: /^(dad|daddy|papa|pappa|nanna|nana|appa|abba|father|baba)$/i
  };
  function findMember(word) {
    word = String(word || '').trim();
    var direct = F.members.filter(function (m) { return m.toLowerCase() === word.toLowerCase(); })[0];
    if (direct) return direct;
    for (var k in aliases) if (aliases[k].test(word)) {
      var hit = F.members.filter(function (m) { return aliases[k].test(m); })[0];
      if (hit) return hit;
    }
    return null;
  }
  M.familyMembers = function () { return F.members.slice(); };

  function share() {
    M.publishRetained('family', { members: F.members, messages: F.messages.slice(-30), shopping: F.shopping });
  }
  M.onMessengerReady = function () { share(); if (M.shareVideos) M.shareVideos(); };
  function save() { M.save(); share(); M.renderMessages(); }

  M.addMessage = function (from, to, text) {
    F.messages.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), from: from, to: to, text: String(text).slice(0, 300), ts: Date.now(), read: false });
    if (F.messages.length > 60) F.messages = F.messages.slice(-60);
    save();
  };

  M.renderMessages = function () {
    var card = M.$('msgCard'), box = M.$('msgList');
    if (!card) return;
    var mine = F.messages.filter(function (m) { return m.to === 'Mirror' && !m.read; });
    card.hidden = !mine.length;
    box.innerHTML = '';
    mine.slice(-3).forEach(function (m) {
      var d = document.createElement('div');
      d.textContent = m.from + ': ' + m.text;
      box.appendChild(d);
    });
  };

  /* Messages coming in from Mirror Home */
  M.onMqtt = function (kind, msg) {
    if (kind === 'to-mirror' && msg.text) {
      var from = findMember(msg.from) || String(msg.from || 'Someone').slice(0, 20);
      M.addMessage(from, 'Mirror', msg.text);
      M.lightsPulse();
      M.say('New message from ' + from + ': ' + String(msg.text).slice(0, 300));
    }
    if (kind === 'shop' && msg.op) {
      var item = String(msg.item || '').trim().slice(0, 60);
      if (msg.op === 'add' && item) addItem(item);
      if (msg.op === 'remove' && item) removeItem(item);
      if (msg.op === 'toggle' && item) { F.shopping.forEach(function (x) { if (x.item.toLowerCase() === item.toLowerCase()) x.done = !x.done; }); save(); }
      if (msg.op === 'clear') { F.shopping = []; save(); }
      if (msg.op === 'clearDone') { F.shopping = F.shopping.filter(function (x) { return !x.done; }); save(); }
    }
    if (kind === 'video' && msg.url && M.playVideo) {
      var vt = String(msg.title || 'Video').slice(0, 80), vu = String(msg.url);
      if (msg.save) { if (M.youtubeId(vu)) { M.saveVideo({ title: vt, url: vu }, !!msg.song); M.showShelf(false, msg.song ? 'songs' : 'videos'); } }
      else if (msg.remove) M.removeSaved(vu);
      else M.playVideo(vu, vt);
    }
    if (kind === 'video-search' && msg.q && M.searchVideos) M.searchVideos(String(msg.q).slice(0, 80));
    if (kind === 'read' && msg.id) { F.messages.forEach(function (m) { if (m.id === msg.id) m.read = true; }); save(); }
  };

  function addItem(item) {
    item = M.cap(item.replace(/^(some|a|an|the|more) /, ''));
    if (!F.shopping.some(function (x) { return x.item.toLowerCase() === item.toLowerCase() && !x.done; })) F.shopping.push({ item: item, done: false });
    save(); return item;
  }
  function removeItem(item) {
    var before = F.shopping.length;
    F.shopping = F.shopping.filter(function (x) { return x.item.toLowerCase().indexOf(item.toLowerCase()) < 0; });
    save(); return before !== F.shopping.length;
  }

  /* ---------- Voice commands ---------- */
  M.addCommand(['^(?:send (?:a )?(?:message|msg|text|note) to|message|text|tell|ask|remind|let) (\\w+)(?: know)?(?: (?:to|that|saying|say|about))?:? (.+)$'], function (m) {
    var who = findMember(m[1]);
    if (!who) return false;                       // "remind me to…" etc. are handled elsewhere
    var text = m[2].trim();
    if (text.length < 2) return M.say('What should I tell ' + who + '?');
    M.addMessage(M.settings.name || 'Mirror', who, M.cap(text));
    M.lightsPulse();
    return M.say('Sent to ' + who + ': "' + M.cap(text) + '". They\'ll see it in Mirror Home.');
  });
  M.addCommand(['(any|new|check|read|show)( my)?( new)? messages', 'do i have (any )?(new )?messages', '^messages$', 'did (anyone|mom|dad|someone) (message|text) me'], function () {
    var mine = F.messages.filter(function (m) { return m.to === 'Mirror' && !m.read; });
    if (!mine.length) return M.say('No new messages.');
    var text = mine.map(function (m) { return 'From ' + m.from + ': ' + m.text; }).join('. ');
    mine.forEach(function (m) { m.read = true; }); save();
    return M.say(text + '.');
  });
  M.addCommand(['(clear|delete) (all )?(my )?messages'], function () { F.messages = []; save(); return M.say('Messages cleared.'); });

  M.addCommand(['^add (.+?) to (the |my |our )?(shopping|grocery|groceries|shop) ?(list)?$', '^(?:we need|we\'?re out of|we are out of|we ran out of|restock|buy) (?:some |more )?(.+)$', '^put (.+?) on (the )?(shopping|grocery) list$'], function (m) {
    var raw = m[1].replace(/ (please|thanks)$/, '');
    var items = raw.split(/,| and /).map(function (x) { return x.trim(); }).filter(Boolean);
    var added = items.map(addItem);
    return M.say('Added ' + added.join(', ') + ' to the shopping list.');
  });
  M.addCommand(['(what\'?s|what is|read|show)( on)? (the |my |our )?(shopping|grocery) list', '^(shopping|grocery) list$', 'what do we need to buy'], function () {
    var open = F.shopping.filter(function (x) { return !x.done; });
    return M.say(open.length ? 'The shopping list has: ' + open.map(function (x) { return x.item; }).join(', ') + '.' : 'The shopping list is empty.');
  });
  M.addCommand(['(remove|delete|take|cross off|tick off) (.+?) (from|off) (the |my |our )?(shopping|grocery) list'], function (m) {
    return M.say(removeItem(m[2]) ? 'Removed ' + m[2] + '.' : m[2] + ' wasn\'t on the list.');
  });
  M.addCommand(['(clear|empty|reset) (the |my |our )?(shopping|grocery) list'], function () { F.shopping = []; save(); return M.say('Shopping list cleared.'); });
  M.addCommand(['who( is|\'s) in (my|the) family', 'family members'], function () { return M.say('Mirror Home is set up for: ' + F.members.join(', ') + '.'); });
})();
