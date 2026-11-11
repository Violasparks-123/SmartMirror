/* Game library: your own games, living inside the mirror.
   Say "games" to open the shelf, "play Astoria" to start one, "close game" to leave.
   Inside a game you can touch the screen, or play hands-free:
     "next"            → continue the story
     "choose 2"        → pick the second answer
     "show numbers"    → puts a number on everything you could tap; then say "tap 5"
     "scroll down/up", "type Neha"
   Spot 2: tap = next, double-tap = show numbers, hold = close the game.
   To add another game: put its folder in /games and add one line to the list below. */
(function () {
  var $ = M.$;
  var GAMES = [
    { id: 'crimson-velvet', title: 'Crimson Velvet', alias: ['crimson velvet', 'crimson', 'velvet'],
      url: 'games/crimson-velvet/index.html', cover: 'games/crimson-velvet/assets/backgrounds/velvet_ballroom.jpg',
      next: '[data-act="dlg-next"]', choices: '.vn-choice' },
    { id: 'astoria', title: 'Astoria: The Moonlit Veil', alias: ['astoria', 'the moonlit veil', 'moonlit veil', 'a story a'],
      url: 'games/astoria/index.html', cover: 'games/astoria/assets/img/gala_hero.jpg',
      next: '.dlg-box', choices: '.choice-btn:not(.locked)' }
  ];
  M.games = GAMES;
  var sel = 0, current = null, numbered = [], badgeTimer = null;

  /* ---------- The shelf ---------- */
  M.renderGames = function () {
    var box = $('gameShelf'); if (!box) return;
    box.innerHTML = '';
    GAMES.forEach(function (g, i) {
      var t = document.createElement('div'); t.className = 'tile' + (i === sel ? ' sel' : '');
      t.innerHTML = '<div class="noimg">▶</div><img alt="" loading="lazy"><div class="no">' + (i + 1) + '</div><div class="tt"></div>';
      var im = t.querySelector('img'); im.onerror = function () { im.remove(); }; im.src = g.cover;
      t.querySelector('.tt').textContent = g.title;
      t.addEventListener('click', function () { M.gamePlay(i); });
      box.appendChild(t);
    });
  };
  M.showGames = function () { M.renderGames(); M.show('games'); return true; };
  M.gameMove = function (dir) { sel = (sel + dir + GAMES.length) % GAMES.length; M.renderGames(); };
  function find(words) {
    words = String(words || '').replace(/^(the|my|a) /, '').replace(/ game$/, '').trim();
    for (var i = 0; i < GAMES.length; i++) for (var j = 0; j < GAMES[i].alias.length; j++) {
      var a = GAMES[i].alias[j]; if (words === a || words.indexOf(a) === 0) return i;
    }
    return -1;
  }

  /* ---------- Opening and closing ---------- */
  M.gamePlay = function (i) {
    if (i == null) i = sel;
    var g = GAMES[i]; if (!g) return M.say('There\'s no game number ' + (i + 1) + '.');
    sel = i; clearBadges();
    var f = $('gameFrame');
    if (current !== g) { current = g; f.src = g.url; }       // already open (you asked the mirror something): carry on where you were
    $('gameBar').textContent = g.title + ' · Spot 2: tap = next, hold = close · say "choose 1", "show numbers" or "close game"';
    M.show('game');
    M.toast('Say "next", "choose 1" or "show numbers"', 5000);
    return true;
  };
  // Closing unloads the game (so its music stops). Both games save by themselves, so you pick up where you left off.
  function unload() { clearBadges(); if (current) { current = null; $('gameFrame').src = 'about:blank'; } }
  M.closeGame = function () { unload(); M.showGames(); return true; };
  // Leaving the game screen any other way closes it too, except when the mirror is just answering a question
  var show = M.show;
  M.show = function (name) {
    if (current && M.current === 'game' && name !== 'game' && name !== 'assistant') unload();
    return show(name);
  };
  M.gameOpen = function () { return M.current === 'game' && !!current; };

  /* ---------- Reaching into the game (it lives on the same website, so the mirror can press its buttons) ---------- */
  function doc() { try { return $('gameFrame').contentDocument; } catch (e) { return null; } }
  function win() { try { return $('gameFrame').contentWindow; } catch (e) { return null; } }
  function visible(el) {
    var d = doc(), w = win(); if (!d || !w || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > w.innerHeight || r.right < 0 || r.left > w.innerWidth) return false;
    var cs = w.getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05 || cs.pointerEvents === 'none' || el.disabled) return false;
    // is it really on top at its middle (not hidden under a pop-up)?
    var x = Math.min(Math.max(r.left + r.width / 2, 1), w.innerWidth - 1), y = Math.min(Math.max(r.top + r.height / 2, 1), w.innerHeight - 1);
    var top = d.elementFromPoint(x, y);
    return !!top && (top === el || el.contains(top) || top.contains(el));
  }
  function all(selector) { var d = doc(); if (!d) return []; return Array.prototype.slice.call(d.querySelectorAll(selector)).filter(visible); }
  function press(el) {
    var w = win(); if (!el || !w) return;
    var r = el.getBoundingClientRect(), o = { bubbles: true, cancelable: true, view: w, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    try { el.dispatchEvent(new w.PointerEvent('pointerdown', o)); el.dispatchEvent(new w.PointerEvent('pointerup', o)); } catch (e) {}
    try { el.dispatchEvent(new w.MouseEvent('mousedown', o)); el.dispatchEvent(new w.MouseEvent('mouseup', o)); } catch (e) {}
    el.click();
    M.poke();
  }

  M.gameNext = function () {
    if (!M.gameOpen()) return false;
    clearBadges();
    var n = all(current.next);
    if (n.length) { press(n[n.length - 1]); return true; }
    var c = all(current.choices);
    if (c.length) { M.toast('Pick one: say "choose 1" to "choose ' + c.length + '"'); return true; }
    return M.gameNumbers();     // nothing obvious to continue: show what can be tapped
  };
  M.gameChoose = function (n) {
    if (!M.gameOpen()) return false;
    var c = all(current.choices);
    if (!c.length) return tapNumber(n);
    if (n < 1 || n > c.length) { M.toast('There are ' + c.length + ' choices'); return true; }
    clearBadges(); press(c[n - 1]); return true;
  };

  /* "Show numbers": a number on everything tappable, like Voice Control on an iPad */
  var TAPPABLE = 'button, a[href], [role="button"], [data-act], [onclick], input, select, textarea, summary, label, [tabindex]:not([tabindex="-1"])';
  M.gameNumbers = function () {
    if (!M.gameOpen()) return false;
    clearBadges();
    var d = doc(), w = win(); if (!d) return true;
    var list = all(TAPPABLE);
    // things that only look tappable (pointer cursor), e.g. a dialogue box you tap to continue
    Array.prototype.slice.call(d.querySelectorAll('div, li, span, img, section, article')).forEach(function (el) {
      if (list.length > 60 || list.indexOf(el) >= 0) return;
      if (w.getComputedStyle(el).cursor === 'pointer' && visible(el) && !list.some(function (x) { return x.contains(el) || el.contains(x); })) list.push(el);
    });
    // keep the innermost of nested buttons, and read them top-to-bottom, left-to-right
    list = list.filter(function (el) { return !list.some(function (x) { return x !== el && el.contains(x); }); });
    list.sort(function (a, b) { var A = a.getBoundingClientRect(), B = b.getBoundingClientRect(); return Math.abs(A.top - B.top) > 14 ? A.top - B.top : A.left - B.left; });
    numbered = list.slice(0, 40);
    if (!numbered.length) { M.toast('Nothing to tap right now'); return true; }
    var layer = d.createElement('div'); layer.id = 'mirror-numbers';
    layer.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483647;pointer-events:none;';
    numbered.forEach(function (el, i) {
      var r = el.getBoundingClientRect(), b = d.createElement('div');
      b.textContent = i + 1;
      b.style.cssText = 'position:absolute;min-width:26px;height:26px;padding:0 7px;border-radius:13px;display:grid;place-items:center;' +
        'font:700 15px/1 -apple-system,system-ui,sans-serif;color:#fff;background:rgba(124,92,224,.95);border:1.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.6);' +
        'left:' + Math.max(2, Math.min(w.innerWidth - 34, r.left + 4)) + 'px;top:' + Math.max(2, Math.min(w.innerHeight - 30, r.top + 4)) + 'px;';
      layer.appendChild(b);
    });
    d.body.appendChild(layer);
    clearTimeout(badgeTimer); badgeTimer = setTimeout(clearBadges, 30000);
    M.toast('Say "tap" and a number');
    return true;
  };
  function clearBadges() {
    clearTimeout(badgeTimer); numbered = [];
    var d = doc(), l = d && d.getElementById('mirror-numbers'); if (l) l.remove();
  }
  function tapNumber(n) {
    if (!numbered.length) M.gameNumbers();
    var el = numbered[n - 1];
    if (!el) { M.toast('No number ' + n); return true; }
    clearBadges();
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(checkbox|radio|button|submit|range)$/.test(el.type || '')) { el.focus(); M.toast('Now say "type" and your words'); return true; }
    press(el); return true;
  }
  function scroll(dir) {
    var d = doc(), w = win(); if (!d) return true;
    var best = d.scrollingElement, bestArea = 0;
    Array.prototype.slice.call(d.querySelectorAll('*')).forEach(function (el) {
      if (el.scrollHeight > el.clientHeight + 20 && /(auto|scroll)/.test(w.getComputedStyle(el).overflowY) && visible(el)) {
        var a = el.clientWidth * el.clientHeight; if (a > bestArea) { bestArea = a; best = el; }
      }
    });
    if (best) best.scrollBy({ top: dir * w.innerHeight * 0.6, behavior: 'smooth' });
    clearBadges(); return true;
  }
  function type(text) {
    var d = doc(), w = win(); if (!d) return true;
    var el = d.activeElement && /^(INPUT|TEXTAREA)$/.test(d.activeElement.tagName) ? d.activeElement : all('input[type="text"], input:not([type]), textarea')[0];
    if (!el) { M.toast('There\'s nowhere to type right now'); return true; }
    var proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value');
    var value = text.charAt(0).toUpperCase() + text.slice(1);
    if (setter && setter.set) setter.set.call(el, value); else el.value = value;
    el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true }));
    return true;
  }
  // touching the game counts as "someone is here", so the mirror doesn't fall asleep mid-story
  $('gameFrame').addEventListener('load', function () {
    var d = doc(); if (!d) return;
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { d.addEventListener(ev, function () { M.poke(); }, true); });
  });

  /* ---------- Voice and typed commands while the shelf or a game is on screen ---------- */
  var N = '(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)';
  var words = { to: 2, too: 2, for: 4, won: 1, ate: 8, tree: 3 };   // what the microphone often hears instead
  function num(s) { return words[s] != null ? words[s] : M.num(s); }
  M.gameRoute = function (t) {
    var m;
    if (M.current === 'games') {
      if (/^(next|down|right)( one| game)?$/.test(t)) { M.gameMove(1); return true; }
      if (/^(back|previous|up|left)( one| game)?$/.test(t)) { M.gameMove(-1); return true; }
      if (/^(play|open|start)( this| that| it)?( one| game)?$|^(this one|that one|select)$/.test(t)) return M.gamePlay();
      if ((m = t.match(new RegExp('^(?:play |open |start )?(?:number |game )?' + N + '$')))) return M.gamePlay(num(m[1]) - 1);
      return false;
    }
    if (!M.gameOpen()) return false;
    if (/^(close|exit|quit|leave|stop|end)( the| this| my)? game$|^(back to )?(the )?(games|game library|game shelf)$|^go back to (the )?games$/.test(t)) return M.closeGame();
    if (/^(next|continue|go on|keep going|carry on|skip|okay|ok|tap|tap it|press it|go)$/.test(t)) return M.gameNext();
    if ((m = t.match(new RegExp('^(?:choose|choice|option|pick|select|answer|i choose|i pick)(?: number| option)? (' + N.slice(1, -1) + '|to|too|for|won|ate|tree)$')))) return M.gameChoose(num(m[1]));
    if (/^(show |show me |the )?numbers?$|^what can i (tap|press|do)$/.test(t)) return M.gameNumbers();
    if (/^(hide|clear|no) numbers?$/.test(t)) { clearBadges(); return true; }
    if ((m = t.match(new RegExp('^(?:tap|press|click|hit|touch|number)(?: on)?(?: number)? (' + N.slice(1, -1) + '|to|too|for|won|ate|tree)$')))) return tapNumber(num(m[1]));
    if ((m = t.match(new RegExp('^' + N + '$')))) return numbered.length ? tapNumber(num(m[1])) : M.gameChoose(num(m[1]));
    if (/^(scroll )?(down|further|more)$/.test(t)) return scroll(1);
    if (/^(scroll )?up$/.test(t)) return scroll(-1);
    if ((m = t.match(/^(?:type|write|enter|my name is) (.+)$/))) return type(m[1]);
    return false;   // anything else (lights, timers, questions) goes to the mirror as usual
  };

  /* ---------- From anywhere ---------- */
  M.addCommand(['^(?:open |show |show me |my |the )*(?:games?|game library|game shelf|game list)$', '^(?:what|which) games (?:do you have|can i play)$', '^(?:let\'?s |i want to )?play a game$'], function () { return M.showGames(); });
  M.addCommand(['^(?:play|open|start|launch|load)(?: the| my)? (.+)$'], function (m) { var i = find(m[1]); if (i < 0) return false; return M.gamePlay(i); });
  M.addCommand(['^(?:back to|resume|return to|continue)(?: the| my)? game$'], function () { if (!current) return M.showGames(); return M.gamePlay(GAMES.indexOf(current)); });
  M.addCommand(['^(?:close|exit|quit|stop|end)(?: the| my)? game$'], function () { if (!current) return false; return M.closeGame(); });
})();
