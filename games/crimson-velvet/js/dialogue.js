/* dialogue.js — the branching dialogue engine (runs inside the VISIT page).
 * Remembers exactly where you are in a conversation, so a refresh or a
 * trip to FILES mid-scene picks up from the same line. */
(function () {
  var CV = window.CV, D = CV.DATA;

  var STYLE = { honest: 'Honest', evasive: 'Evasive', compassion: 'Empathy', confront: 'Confront', investigate: 'Inquire',
    manipulate: 'Manipulate', protect: 'Protect', silent: 'Silence', evidence: 'Evidence', polite: 'Courtesy' };

  function scene() { return CV.S.dlg ? D.scenes[CV.S.dlg.scene] : null; }
  function node() { var sc = scene(); return sc ? sc.nodes[CV.S.dlg.node] : null; }

  function visibleChoices(n) {
    var out = [];
    if (!n || !n.choices) return out;
    for (var i = 0; i < n.choices.length; i++) if (CV.cond(n.choices[i]['if'])) out.push({ c: n.choices[i], i: i });
    return out;
  }

  function logLine(s, t) {
    if (!t) return;
    var L = CV.S.log; L.push({ s: s, t: t });
    if (L.length > 160) L.splice(0, L.length - 160);
  }

  function goNode(id, guard) {
    var S = CV.S, sc = scene();
    guard = (guard || 0) + 1;
    if (guard > 30) { console.error('Dialogue loop at', id); return finish({ end: true }); }
    var n = sc.nodes[id];
    if (!n) { console.error('Missing dialogue node', S.dlg.scene, id); return finish({ end: true }); }
    S.dlg.node = id;
    if (n.fx) CV.apply(n.fx, { quiet: false });
    if (D.characters[n.s]) { S.met[n.s] = true; S.dlg.lastNpc = n.s; S.dlg.lastMood = n.e || 'neutral'; }
    if (n.branch) {
      for (var b = 0; b < n.branch.length; b++) if (!n.branch[b]['if'] || CV.cond(n.branch[b]['if'])) return goNode(n.branch[b].go, guard);
    }
    logLine(n.s, n.t);
    CV.changed();
    CV.dlg.render();
  }

  function finish(n) {
    var S = CV.S, id = S.dlg.scene, sc = D.scenes[id];
    var keepOpen = (n && n.unsetDone) || sc.repeatable;
    if (!keepOpen) { S.done[id] = true; S.flags['done_' + id] = true; }
    S.dlg = null;
    if (sc.onEnd) CV.apply(sc.onEnd); else { CV.checkChapter(); CV.changed(); }
    if (S.ending) { CV.go('ending'); return; }
    if (CV.ui.tab === 'visit') CV.visit.render();
    CV.emit('scene-end', id);
  }

  CV.dlg = {
    start: function (id) {
      var S = CV.S, sc = D.scenes[id];
      if (!sc) { CV.toast('That scene has not been written yet.', 'info'); return; }
      var info = CV.sceneInfo(id);
      S.dlg = { scene: id, node: sc.start, lastNpc: info && D.characters[info.who] ? info.who : null, lastMood: 'neutral', picker: null };
      if (id === 'gala_message' && !S.flags.gala_saved) { S.flags.gala_saved = true; CV.storage.save('gala', S); }
      if (info && D.characters[info.who]) S.met[info.who] = true;
      goNode(sc.start);
    },

    active: function () { return !!CV.S.dlg; },

    advance: function () {
      var n = node();
      if (!n || CV.S.dlg.picker != null) return;
      if (visibleChoices(n).length) return;
      if (n.end) return finish(n);
      if (n.next) return goNode(n.next);
      finish(n);
    },

    choose: function (i) {
      var n = node(), c = n && n.choices ? n.choices[i] : null;
      if (!c || !CV.cond(c['if'])) return;
      logLine('you', '▸ ' + c.t);
      if (c.present) {
        CV.S.dlg.picker = i; CV.changed(); CV.dlg.render(); return;
      }
      if (c.fx) CV.apply(c.fx);
      if (c.go) goNode(c.go); else finish(n);
    },

    present: function (evId) {
      var S = CV.S, n = node(), c = n.choices[S.dlg.picker];
      var target = c.present[evId] || c.present._default;
      S.dlg.picker = null;
      if (S.ev[evId]) S.ev[evId].examined = true;
      logLine('you', '(You show: ' + D.evidence[evId].title + ')');
      if (c.fx) CV.apply(c.fx);
      goNode(target);
    },

    cancelPresent: function () { CV.S.dlg.picker = null; CV.changed(); CV.dlg.render(); },

    toggleLog: function () { CV.ui.showLog = !CV.ui.showLog; CV.dlg.render(); },

    render: function () {
      var root = document.getElementById('vn');
      if (!root || !CV.S.dlg) return;
      var S = CV.S, sc = scene(), n = node();
      var info = CV.sceneInfo(S.dlg.scene) || {};
      var loc = D.locations[info.loc || S.loc] || D.locations[S.loc];
      var bg = CV.bgAttr(sc.bg || loc.bg);
      var speaker = n.s, isNpc = !!D.characters[speaker];
      var showNpc = isNpc ? speaker : S.dlg.lastNpc;
      var mood = isNpc ? (n.e || 'neutral') : S.dlg.lastMood;
      var h = '';
      h += '<div class="vn-bg ' + bg.cls + '"' + bg.style + '></div><div class="vn-vignette"></div>';
      h += '<div class="vn-top"><span class="vn-place">' + CV.esc(loc.name) + '</span><span class="vn-dot">—</span><span class="vn-chapter">' + CV.esc(CV.chapter().label) + '</span></div>';
      if (showNpc) h += '<div class="vn-figure' + (isNpc ? '' : ' dim') + '">' + CV.portrait(showNpc, 'vn-portrait', mood) + '</div>';
      if (speaker === 'you') h += '<div class="vn-you">' + CV.portrait('you', 'vn-you-portrait') + '</div>';

      var choices = visibleChoices(n);
      h += '<div class="vn-box' + (speaker === 'nar' ? ' is-narration' : '') + '">';
      if (speaker !== 'nar') h += '<div class="vn-name">' + CV.esc(speaker === 'you' ? 'You' : CV.charName(speaker)) + '</div>';
      h += '<p class="vn-text' + (n.canon ? ' is-canon' : '') + '">' + CV.esc(n.t) + '</p>';
      if (choices.length && S.dlg.picker == null) {
        h += '<ol class="vn-choices">';
        for (var k = 0; k < choices.length; k++) {
          var ch = choices[k].c;
          h += '<li><button type="button" class="vn-choice style-' + (ch.style || 'plain') + '" data-act="dlg-choose" data-arg="' + choices[k].i + '">' +
            '<span class="vn-choice-mark">▸</span><span class="vn-choice-text">' + CV.esc(ch.t) + '</span>' +
            (ch.style ? '<span class="vn-choice-tag">' + (STYLE[ch.style] || '') + '</span>' : '') + '</button></li>';
        }
        h += '</ol>';
      } else if (S.dlg.picker == null) {
        h += '<button type="button" class="vn-continue" data-act="dlg-next">' + (n.end ? 'End scene' : 'Continue') + ' <span>▸</span></button>';
      }
      h += '<div class="vn-tools"><button type="button" class="vn-tool" data-act="dlg-log">Log</button></div>';
      h += '</div>';

      if (S.dlg.picker != null) h += CV.dlg.pickerHTML();
      if (CV.ui.showLog) h += CV.dlg.logHTML();
      root.innerHTML = h;
      root.className = 'vn' + (speaker === 'nar' ? ' narrating' : '');
    },

    pickerHTML: function () {
      var S = CV.S, h = '<div class="vn-picker"><div class="vn-picker-head"><span>Present evidence</span><button type="button" class="btn-ghost" data-act="dlg-cancel">Back</button></div><div class="vn-picker-grid">';
      if (!S.evOrder.length) h += '<p class="empty-note">You haven’t collected anything to show yet.</p>';
      for (var i = 0; i < S.evOrder.length; i++) {
        var id = S.evOrder[i], e = D.evidence[id];
        h += '<button type="button" class="vn-pick" data-act="dlg-present" data-arg="' + id + '">' + CV.evIcon(e.icon) + '<span>' + CV.esc(e.title) + '</span></button>';
      }
      return h + '</div></div>';
    },

    logHTML: function () {
      var L = CV.S.log, h = '<div class="vn-log"><div class="vn-picker-head"><span>Conversation log</span><button type="button" class="btn-ghost" data-act="dlg-log">Close</button></div><div class="vn-log-body">';
      for (var i = Math.max(0, L.length - 80); i < L.length; i++) {
        var who = L[i].s === 'nar' ? '' : L[i].s === 'you' ? 'You' : CV.charName(L[i].s);
        h += '<p class="' + (L[i].s === 'nar' ? 'log-nar' : '') + '">' + (who ? '<b>' + CV.esc(who) + '</b> ' : '') + CV.esc(L[i].t) + '</p>';
      }
      return h + '</div></div>';
    }
  };

  /* which location + character a scene belongs to */
  var sceneIndex = null;
  CV.sceneInfo = function (id) {
    if (!sceneIndex) {
      sceneIndex = {};
      CV.each(D.locations, function (lid, L) { for (var i = 0; i < L.scenes.length; i++) sceneIndex[L.scenes[i].id] = { loc: lid, who: L.scenes[i].who, def: L.scenes[i] }; });
    }
    return sceneIndex[id];
  };
})();
