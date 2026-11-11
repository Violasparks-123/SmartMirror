/* app.js — starts the game, draws the title screen, handles navigation, saving and every button. */
(function () {
  var CV = window.CV, D = CV.DATA;
  CV.ui = { tab: 'visit' };

  var TABS = [['cast', 'Cast'], ['map', 'Map'], ['files', 'Files'], ['journal', 'Journal'], ['stats', 'Stats'], ['visit', 'Visit'], ['save', 'Save'], ['exit', 'Exit']];

  /* ---------------- rendering ---------------- */
  CV.go = function (tab) {
    if (tab === 'exit') { CV.saveNow(); return CV.showTitle(); }
    if (CV.S.ending && tab === 'visit') tab = 'ending';
    CV.ui.tab = tab;
    CV.ui.inspect = null; CV.ui.showLog = false;
    var nav = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < nav.length; i++) {
      var on = nav[i].getAttribute('data-arg') === tab || (tab === 'ending' && nav[i].getAttribute('data-arg') === 'visit');
      nav[i].className = 'nav-btn' + (on ? ' on' : '');
      nav[i].setAttribute('aria-current', on ? 'page' : 'false');
    }
    var page = document.getElementById('page');
    page.scrollTop = 0;
    page.className = 'page-host tab-' + tab;
    var R = { cast: CV.cast, map: CV.map, files: CV.files, journal: CV.journal, stats: CV.stats, visit: CV.visit, save: CV.savePage, ending: CV.endings };
    R[tab].render();
    CV.updateChrome();
  };
  CV.rerender = function () { CV.go(CV.ui.tab); };

  CV.updateChrome = function () {
    var S = CV.S; if (!S) return;
    var loc = D.locations[S.loc], ch = CV.chapter();
    document.getElementById('hdr-chapter').textContent = ch.label + ' — ' + ch.t;
    document.getElementById('hdr-place').textContent = loc.name;
    document.getElementById('bar-cred').style.width = S.cred + '%';
    document.getElementById('bar-heat').style.width = S.heat + '%';
    document.getElementById('num-cred').textContent = S.cred;
    document.getElementById('num-heat').textContent = S.heat;
    var newEv = 0; for (var i = 0; i < S.evOrder.length; i++) if (!S.ev[S.evOrder[i]].examined) newEv++;
    var fb = document.querySelector('.nav-btn[data-arg="files"] .nav-badge');
    if (fb) { fb.textContent = newEv || ''; fb.style.display = newEv ? '' : 'none'; }
  };
  CV.on('change', function () { if (document.getElementById('hdr-chapter')) CV.updateChrome(); });

  /* ---------------- chapter title cards ---------------- */
  CV.on('chapter', function (n) {
    var c = D.chapters[n]; if (!c) return;
    CV.ui.pendingCard = c;
  });
  CV.showPendingCard = function () {
    var c = CV.ui.pendingCard; if (!c) return;
    CV.ui.pendingCard = null;
    if (n8save(c)) {}
    var el = document.getElementById('chapter-card');
    el.innerHTML = '<div class="cc-inner"><div class="cc-label">' + CV.esc(c.label) + '</div><div class="cc-rule"></div><div class="cc-title">' + CV.esc(c.title) + '</div><div class="cc-hint">Click to continue</div></div>';
    el.className = 'chapter-card show';
    el.setAttribute('aria-hidden', 'false');
    clearTimeout(CV.ui.ccTimer);
    CV.ui.ccTimer = setTimeout(CV.hideCard, 4200);
  };
  function n8save(c) { if (c.n === 8 && !CV.S.flags.gala_saved) { CV.S.flags.gala_saved = true; CV.storage.save('gala', CV.S); } return false; }
  CV.hideCard = function () { var el = document.getElementById('chapter-card'); el.className = 'chapter-card'; el.setAttribute('aria-hidden', 'true'); };

  /* ---------------- modal (confirmations only) ---------------- */
  CV.confirm = function (msg, okLabel, cb) {
    var m = document.getElementById('modal');
    m.innerHTML = '<div class="modal-box parchment" role="dialog" aria-modal="true"><p>' + CV.esc(msg) + '</p><div class="modal-actions"><button type="button" class="btn-ghost" data-act="modal-no">Cancel</button><button type="button" class="btn-primary" data-act="modal-yes">' + CV.esc(okLabel) + '</button></div></div>';
    m.className = 'modal show';
    CV.ui.modalCb = cb;
  };
  function closeModal() { var m = document.getElementById('modal'); m.className = 'modal'; m.innerHTML = ''; }

  /* ---------------- title screen ---------------- */
  CV.showTitle = function () {
    document.getElementById('game').className = 'game hidden';
    var t = document.getElementById('title'), auto = CV.storage.load('auto');
    var h = '<div class="title-bg"></div><div class="title-inner">';
    h += '<div class="title-kicker">A Vesper City Mystery</div><h1 class="title-logo">Crimson<span>Velvet</span></h1><div class="title-rule"></div>';
    h += '<p class="title-tag">Elegant on the surface. Complicated underneath.</p><div class="title-menu">';
    if (auto && auto.state && !auto.state.ending) h += '<button type="button" class="btn-primary" data-act="continue">Continue<small>' + CV.esc(auto.meta.chapter || '') + ' · ' + CV.esc(D.locations[auto.meta.loc] ? D.locations[auto.meta.loc].name : '') + '</small></button>';
    h += '<button type="button" class="btn-' + (auto && !auto.state.ending ? 'ghost' : 'primary') + '" data-act="new-game">New game</button>';
    h += '<button type="button" class="btn-ghost" data-act="title-load">Load game</button></div>';
    if (CV.ui.titleLoad) h += '<div class="title-slots">' + CV.savePage.slotsHTML(true) + '</div>';
    h += '<p class="title-foot">Best with sound off and the lights low.</p></div>';
    t.innerHTML = h;
    t.className = 'title show';
  };

  function startGame(state, fresh) {
    CV.S = state;
    if (!CV.S.vars) CV.S.vars = CV.newState().vars;
    CV.ui = { tab: 'visit' };
    document.getElementById('title').className = 'title';
    document.getElementById('game').className = 'game';
    CV.go(state.ending ? 'ending' : 'visit');
    if (fresh) { CV.ui.pendingCard = D.chapters[0]; CV.showPendingCard(); }
    CV.saveNow();
  }

  /* ---------------- SAVE page ---------------- */
  function fmtDate(t) { var d = new Date(t); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  CV.savePage = {
    slotsHTML: function (fromTitle) {
      var h = '<div class="slots">';
      for (var i = 0; i < CV.storage.slots.length; i++) {
        var s = CV.storage.slots[i], d = CV.storage.load(s), manual = s !== 'auto' && s !== 'gala';
        h += '<div class="slot"><div class="slot-name">' + CV.storage.slotLabel(s) + '</div>';
        h += d ? '<div class="slot-meta">' + CV.esc(d.meta.chapter || '') + ' · ' + CV.esc(D.locations[d.meta.loc] ? D.locations[d.meta.loc].name : '') + '<br><span>' + fmtDate(d.meta.savedAt) + '</span></div>' : '<div class="slot-meta empty">Empty</div>';
        h += '<div class="slot-actions">';
        if (manual && !fromTitle) h += '<button type="button" class="btn-ghost" data-act="save-slot" data-arg="' + s + '">Save here</button>';
        if (d) h += '<button type="button" class="btn-ghost" data-act="load-slot" data-arg="' + s + '">Load</button>';
        if (d && manual && !fromTitle) h += '<button type="button" class="btn-ghost danger" data-act="del-slot" data-arg="' + s + '">Delete</button>';
        h += '</div></div>';
      }
      return h + '</div>';
    },
    render: function () {
      var h = '<section class="page page-save"><header class="page-head"><h1>Save &amp; Exit</h1><p class="page-sub">Progress is also saved automatically after every change.</p></header><div class="save-grid">';
      h += '<div class="parchment save-col"><h2>Save slots</h2>' + CV.savePage.slotsHTML(false) + '</div>';
      h += '<div class="parchment save-col"><h2>Export &amp; import</h2><p>Keep a copy of your save as a file, or move it to another device.</p>' +
        '<div class="btn-row"><button type="button" class="btn-primary" data-act="export">Export save</button><label class="btn-ghost file-label">Import save file<input type="file" accept=".json,application/json" id="import-file"></label></div>' +
        '<textarea id="io-text" class="io-text" rows="4" placeholder="Or paste exported save text here…"></textarea><button type="button" class="btn-ghost" data-act="import-text">Load pasted save</button>' +
        '<h2>Game</h2><div class="btn-row"><button type="button" class="btn-ghost" data-act="to-title">Return to title</button><button type="button" class="btn-ghost danger" data-act="reset">Reset game</button></div></div>';
      h += '</div></section>';
      document.getElementById('page').innerHTML = h;
      var f = document.getElementById('import-file');
      if (f) f.onchange = function () {
        var file = f.files && f.files[0]; if (!file) return;
        var r = new FileReader(); r.onload = function () { importText(String(r.result)); }; r.readAsText(file);
      };
    }
  };
  function importText(txt) {
    try {
      var data = JSON.parse(txt), st = data.state || data;
      if (!st || !st.flags || !st.trust || !st.loc) throw new Error('bad');
      CV.toast('Save imported.', 'info'); startGame(st, false);
    } catch (e) { CV.toast('That doesn’t look like a Crimson Velvet save.', 'info'); }
  }

  /* ---------------- actions ---------------- */
  var A = {
    tab: function (t) { CV.go(t); },
    'new-game': function () {
      var auto = CV.storage.load('auto');
      var start = function () { CV.storage.remove('gala'); startGame(CV.newState(), true); };
      if (auto && !auto.state.ending) CV.confirm('Start a new investigation? Your autosave will be replaced. Saves in numbered slots are kept.', 'Start over', start); else start();
    },
    'continue': function () { var a = CV.storage.load('auto'); if (a) startGame(a.state, false); },
    'title-load': function () { CV.ui.titleLoad = !CV.ui.titleLoad; CV.showTitle(); },
    'to-title': function () { CV.saveNow(); CV.ui.titleLoad = false; CV.showTitle(); },
    'save-slot': function (s) { CV.storage.save(s, CV.S); CV.toast('Saved to ' + CV.storage.slotLabel(s) + '.', 'info'); CV.rerender(); },
    'load-slot': function (s) { var d = CV.storage.load(s); if (d) { CV.toast('Loaded ' + CV.storage.slotLabel(s) + '.', 'info'); startGame(d.state, false); } },
    'del-slot': function (s) { CV.confirm('Delete ' + CV.storage.slotLabel(s) + '? This can’t be undone.', 'Delete', function () { CV.storage.remove(s); CV.rerender(); }); },
    reset: function () { CV.confirm('Reset the game? All progress in the current playthrough will be lost. Numbered save slots are kept.', 'Reset', function () { CV.storage.remove('auto'); CV.storage.remove('gala'); startGame(CV.newState(), true); }); },
    'export': function () {
      var txt = JSON.stringify({ game: 'crimson-velvet', meta: { savedAt: Date.now() }, state: CV.S });
      var io = document.getElementById('io-text'); if (io) io.value = txt;
      try {
        var blob = new Blob([txt], { type: 'application/json' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'crimson-velvet-save.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        CV.toast('If no file downloaded, copy the save text from the box below.', 'info');
      } catch (e) { CV.toast('Copy the save text from the box below.', 'info'); }
    },
    'import-text': function () { var io = document.getElementById('io-text'); if (io && io.value) importText(io.value); },
    'modal-yes': function () { var cb = CV.ui.modalCb; closeModal(); if (cb) cb(); },
    'modal-no': function () { closeModal(); },

    'cast-sel': function (id) { CV.ui.castSel = id; CV.cast.render(); },
    'cast-tab': function (t) { CV.ui.castTab = t; CV.cast.render(); },
    'cast-open': function (id) { if (!CV.isKnown(id)) return; CV.ui.castSel = id; CV.ui.castTab = 'profile'; CV.go('cast'); },

    'map-view': function (v) { CV.ui.mapView = v; CV.ui.mapSel = null; CV.map.render(); },
    'map-select': function (id) { CV.ui.mapSel = id; CV.map.render(); },
    travel: function (id) {
      var L = D.locations[id], dest = L.link || id;
      if (CV.S.dlg) { CV.toast('Finish your conversation first.', 'info'); return CV.go('visit'); }
      if (CV.travel(dest)) CV.go('visit');
    },

    scene: function (id) { CV.dlg.start(id); CV.visit.render(); },
    inspect: function (id) { CV.visit.inspect(id); },
    'inspect-close': function () { CV.ui.inspect = null; CV.visit.render(); },
    'obj-choice': function (arg) { CV.visit.objChoice(arg); },
    'dlg-next': function () { CV.dlg.advance(); },
    'dlg-choose': function (i) { CV.dlg.choose(+i); },
    'dlg-present': function (id) { CV.dlg.present(id); },
    'dlg-cancel': function () { CV.dlg.cancelPresent(); },
    'dlg-log': function () { CV.dlg.toggleLog(); },

    'files-cat': function (c) { CV.ui.filesCat = c; CV.files.render(); },
    'files-sel': function (id) { CV.ui.filesSel = id; CV.files.render(); },
    'connect-start': function (id) { CV.ui.connectFrom = id; if (CV.ui.filesCat === 'board') CV.ui.filesCat = 'all'; CV.files.render(); },
    'connect-cancel': function () { CV.ui.connectFrom = null; CV.files.render(); },
    'connect-pick': function (id) {
      var a = CV.ui.connectFrom; CV.ui.connectFrom = null;
      if (a === id) return CV.files.render();
      CV.ui.connectResult = CV.tryConnect(a, id);
      CV.ui.filesSel = id;
      CV.files.render();
    },

    'j-sec': function (s) { CV.ui.jSec = s; CV.ui.jPage = 0; CV.journal.render(); },
    'j-prev': function () { CV.journal.turn(-1); },
    'j-next': function () { CV.journal.turn(1); }
  };

  document.addEventListener('click', function (ev) {
    var el = ev.target;
    if (el && el.closest && document.getElementById('chapter-card').className.indexOf('show') >= 0 && el.closest('#chapter-card')) { CV.hideCard(); return; }
    while (el && el !== document && !el.getAttribute('data-act')) el = el.parentNode;
    if (!el || el === document) {
      /* clicking the dialogue box itself also advances */
      var box = ev.target.closest ? ev.target.closest('.vn-box') : null;
      if (box && !ev.target.closest('button')) A['dlg-next']();
      return;
    }
    var act = el.getAttribute('data-act');
    if (A[act]) { ev.preventDefault(); A[act](el.getAttribute('data-arg')); }
    if (CV.ui.pendingCard) CV.showPendingCard();
  });

  document.addEventListener('keydown', function (ev) {
    var tag = (ev.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') return;
    var m = document.getElementById('modal');
    if (m && m.className.indexOf('show') >= 0) { if (ev.key === 'Escape') closeModal(); return; }
    if (ev.key === 'Enter' || ev.key === ' ') {
      var focusBtn = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-act');
      if (ev.key === 'Enter' && focusBtn) return;
      if (CV.S && CV.S.dlg && CV.ui.tab === 'visit' && document.querySelector('.vn-continue')) { ev.preventDefault(); A['dlg-next'](); if (CV.ui.pendingCard) CV.showPendingCard(); }
      return;
    }
    if (/^[1-9]$/.test(ev.key) && CV.S && CV.S.dlg && CV.ui.tab === 'visit') {
      var btns = document.querySelectorAll('.vn-choice');
      var b = btns[+ev.key - 1]; if (b) { b.click(); }
      return;
    }
    if (ev.key === 'Escape') {
      if (CV.ui.inspect) A['inspect-close']();
      else if (CV.S && CV.S.dlg && CV.S.dlg.picker != null) A['dlg-cancel']();
      else if (CV.ui.showLog) A['dlg-log']();
    }
    if (ev.target.getAttribute && ev.target.getAttribute('role') === 'button' && ev.key === 'Enter') ev.target.click();
  });

  document.addEventListener('input', function (ev) {
    var id = ev.target.getAttribute && ev.target.getAttribute('data-note');
    if (id) { CV.S.notes[id] = ev.target.value; CV.changed(); }
  });

  var rz = null;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { if (CV.S && CV.ui.tab === 'journal') CV.journal.paginate(); }, 200);
  });

  /* ---------------- boot ---------------- */
  CV.boot = function () {
    var nav = document.getElementById('mainnav'), h = '';
    for (var i = 0; i < TABS.length; i++) h += '<button type="button" class="nav-btn" data-act="tab" data-arg="' + TABS[i][0] + '">' + TABS[i][1] + (TABS[i][0] === 'files' ? '<span class="nav-badge"></span>' : '') + '</button>';
    nav.innerHTML = h;
    CV.probeAssets(function () { CV.showTitle(); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', CV.boot); else CV.boot();
})();
