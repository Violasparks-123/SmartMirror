/* events.js — the game state, conditions, effects and event triggers.
 * Every other system reads and changes the game ONLY through this file,
 * so stats, journal and dialogue always agree with each other. */
(function () {
  var CV = window.CV, D = CV.DATA;

  /* ---------- small helpers used everywhere ---------- */
  CV.esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  CV.each = function (o, fn) { for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) fn(k, o[k]); };
  CV.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  CV.keys = function (o) { var r = []; CV.each(o, function (k) { r.push(k); }); return r; };

  var listeners = {};
  CV.on = function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  CV.emit = function (ev, a) { var l = listeners[ev] || []; for (var i = 0; i < l.length; i++) l[i](a); };

  /* ---------- state ---------- */
  CV.newState = function () {
    var s = {
      v: 1, loc: D.startLocation, cred: 30, heat: 0,
      trust: {}, met: {}, rel: {}, mem: {}, route: {},
      ev: {}, evOrder: [], conn: {}, connOrder: [], flags: {}, morals: [],
      journal: {}, jOrder: [], insp: {}, done: {}, notes: {},
      log: [], dlg: null, ending: null, ch: 0, chSeen: 0, started: Date.now(), updated: Date.now(),
      vars: { celeste_truth: 0, original_ledger_found: false, evelyn_stance: 'unknown', adrian_suspicion: 0,
              truth_revealed: false, celeste_identity_protected: true, scholarship_fraud_exposed: false }
    };
    CV.each(D.characters, function (id) { s.trust[id] = id === 'celeste' ? 25 : 20; s.route[id] = 0; s.mem[id] = []; });
    for (var i = 0; i < D.journalStart.length; i++) { s.journal[D.journalStart[i]] = true; s.jOrder.push(D.journalStart[i]); }
    s.flags['loc_' + D.startLocation] = true;
    return s;
  };

  /* ---------- conditions ---------- */
  function all(list, test) { if (!list) return true; for (var i = 0; i < list.length; i++) if (!test(list[i])) return false; return true; }
  CV.cond = function (c, S) {
    S = S || CV.S;
    if (!c) return true;
    if (!all(c.f, function (x) { return !!S.flags[x]; })) return false;
    if (!all(c.nf, function (x) { return !S.flags[x]; })) return false;
    if (!all(c.ev, function (x) { return !!S.ev[x]; })) return false;
    if (!all(c.noev, function (x) { return !S.ev[x]; })) return false;
    if (!all(c.conn, function (x) { return !!S.conn[x]; })) return false;
    if (c.tmin) { for (var a in c.tmin) if ((S.trust[a] || 0) < c.tmin[a]) return false; }
    if (c.tmax) { for (var b in c.tmax) if ((S.trust[b] || 0) > c.tmax[b]) return false; }
    if (c.cred != null && S.cred < c.cred) return false;
    if (c.heatMin != null && S.heat < c.heatMin) return false;
    if (c.heatMax != null && S.heat > c.heatMax) return false;
    if (c.chmin != null && S.ch < c.chmin) return false;
    if (c.chmax != null && S.ch > c.chmax) return false;
    if (c.count) { var n = 0; for (var q = 0; q < c.count.f.length; q++) if (S.flags[c.count.f[q]]) n++; if (n < c.count.n) return false; }
    if (c.v) { for (var vk in c.v) { var want = c.v[vk], have = S.vars[vk]; if (typeof want === 'number' ? (have || 0) < want : have !== want) return false; } }
    if (c.rel) { for (var r in c.rel) if (CV.relState(r, S).id !== c.rel[r]) return false; }
    if (c.any) {
      var ok = false;
      for (var i = 0; i < c.any.length; i++) if (CV.cond(c.any[i], S)) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  };

  /* ---------- effects ---------- */
  CV.apply = function (fx, opts) {
    if (!fx) return;
    var S = CV.S, quiet = opts && opts.quiet, i;
    if (fx.t) CV.each(fx.t, function (npc, d) { S.trust[npc] = CV.clamp((S.trust[npc] || 0) + d, 0, 100); S.met[npc] = true; });
    if (fx.cred) S.cred = CV.clamp(S.cred + fx.cred, 0, 100);
    if (fx.heat) S.heat = CV.clamp(S.heat + fx.heat, 0, 100);
    if (fx.set) for (i = 0; i < fx.set.length; i++) S.flags[fx.set[i]] = true;
    if (fx.unset) for (i = 0; i < fx.unset.length; i++) delete S.flags[fx.unset[i]];
    if (fx.ev) for (i = 0; i < fx.ev.length; i++) CV.addEvidence(fx.ev[i], quiet);
    if (fx.j) {
      var added = false;
      for (i = 0; i < fx.j.length; i++) if (!S.journal[fx.j[i]] && D.journal[fx.j[i]]) { S.journal[fx.j[i]] = true; S.jOrder.push(fx.j[i]); added = true; }
      if (added && !quiet) CV.toast('Journal updated', 'journal');
    }
    if (fx.loc) for (i = 0; i < fx.loc.length; i++) {
      if (!S.flags['loc_' + fx.loc[i]]) { S.flags['loc_' + fx.loc[i]] = true; if (!fx.toast && !quiet) CV.toast('New location: ' + D.locations[fx.loc[i]].name, 'map'); }
    }
    if (fx.rel) CV.each(fx.rel, function (npc, v) { if (v) S.rel[npc] = v; else delete S.rel[npc]; });
    if (fx.mem) CV.each(fx.mem, function (npc, txt) { (S.mem[npc] = S.mem[npc] || []).push(txt); });
    if (fx.moral) S.morals.push({ axis: fx.moral.axis, label: fx.moral.label, ch: S.ch });
    if (fx.route) CV.each(fx.route, function (npc, d) { S.route[npc] = (S.route[npc] || 0) + d; });
    if (fx.v) CV.each(fx.v, function (k, val) {
      if (typeof val === 'number' && typeof S.vars[k] === 'number' && k !== 'evelyn_stance') S.vars[k] = CV.clamp(S.vars[k] + val, 0, 100);
      else S.vars[k] = val;
    });
    if (fx.toast && !quiet) CV.toast(fx.toast, 'info');
    CV.checkChapter();
    if (fx.ending) CV.endings.resolve();
    CV.changed();
  };

  CV.addEvidence = function (id, quiet) {
    var S = CV.S, e = D.evidence[id];
    if (!e || S.ev[id]) return;
    S.ev[id] = { found: true, examined: false };
    S.evOrder.push(id);
    if (!quiet) CV.toast('Evidence acquired — ' + e.title, 'files');
  };

  CV.tryConnect = function (a, b) {
    var S = CV.S;
    for (var i = 0; i < D.connections.length; i++) {
      var c = D.connections[i];
      if ((c.a === a && c.b === b) || (c.a === b && c.b === a)) {
        if (S.conn[c.id]) return { already: true, c: c };
        S.conn[c.id] = true; S.connOrder.push(c.id); S.flags[c.id] = true;
        S.ev[a].connected = true; S.ev[b].connected = true;
        CV.apply(c.fx);
        CV.toast('Connection made — ' + c.title, 'files');
        return { ok: true, c: c };
      }
    }
    return { ok: false };
  };

  /* ---------- derived values ---------- */
  CV.chapter = function (S) {
    S = S || CV.S;
    var c = D.chapters[S.ch] || D.chapters[0];
    return { n: c.n, label: c.label, t: c.title };
  };
  /* advance through chapters whose requirements are now met */
  CV.checkChapter = function () {
    var S = CV.S, moved = false;
    while (S.ch < D.chapters.length - 1 && D.chapters[S.ch].advance && CV.cond(D.chapters[S.ch].advance)) {
      var rid = 'r_' + S.ch;
      if (D.journal[rid] && !S.journal[rid]) { S.journal[rid] = true; S.jOrder.push(rid); }
      S.ch++; moved = true;
    }
    if (moved) CV.emit('chapter', S.ch);
  };

  CV.locUnlocked = function (id, S) {
    S = S || CV.S;
    var L = D.locations[id];
    return !!S.flags['loc_' + id] || CV.cond(L.unlock, S);
  };

  CV.sceneAvailable = function (sc) {
    return !CV.S.done[sc.id] && CV.cond(sc['if']);
  };
  CV.objectVisible = function (o) { return CV.cond(o['if']); };

  CV.npcsAt = function (locId) {
    var L = D.locations[locId], out = [];
    for (var i = 0; i < L.present.length; i++) if (CV.cond(L.present[i]['if'])) out.push(L.present[i].npc);
    return out;
  };
  CV.npcLocation = function (npc) {
    for (var i = 0; i < D.locationOrder.length; i++) {
      var id = D.locationOrder[i];
      if (CV.npcsAt(id).indexOf(npc) >= 0) return id;
    }
    return null;
  };
  CV.locHasNew = function (locId) {
    var L = D.locations[locId], i;
    for (i = 0; i < L.scenes.length; i++) if (CV.sceneAvailable(L.scenes[i])) return true;
    for (i = 0; i < L.objects.length; i++) if (!CV.S.insp[L.objects[i].id] && CV.objectVisible(L.objects[i])) return true;
    return false;
  };

  CV.charName = function (id) {
    var c = D.characters[id];
    if (!c) return id === 'you' ? 'You' : '';
    if (c.hiddenUntil && !CV.S.flags[c.hiddenUntil]) return c.hiddenName || '—';
    return c.name;
  };

  /* ---------- travel ---------- */
  CV.travel = function (locId) {
    var S = CV.S;
    if (!CV.locUnlocked(locId)) return false;
    S.loc = locId;
    S.flags['visited_' + locId] = true;
    CV.changed();
    return true;
  };

  /* ---------- persistence ---------- */
  var saveTimer = null;
  CV.changed = function () {
    if (!CV.S) return;
    CV.S.updated = Date.now();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { CV.storage.save('auto', CV.S); }, 250);
    CV.emit('change');
  };
  CV.saveNow = function () { if (CV.S) CV.storage.save('auto', CV.S); };

  /* ---------- toasts ---------- */
  CV.toast = function (msg, kind) {
    var root = document.getElementById('toasts');
    if (!root) return;
    var t = document.createElement('div');
    t.className = 'toast toast-' + (kind || 'info');
    t.innerHTML = '<span class="toast-mark"></span><span>' + CV.esc(msg) + '</span>';
    root.appendChild(t);
    while (root.children.length > 3) root.removeChild(root.firstChild);
    setTimeout(function () { t.className += ' show'; }, 20);
    setTimeout(function () { t.className = t.className.replace(' show', ''); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400); }, 3600);
  };
})();
