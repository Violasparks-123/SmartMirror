/* visit.js — VISIT: the current location as a full scene, with people,
 * inspectable objects and conversations. Dialogue plays on the same stage. */
(function () {
  var CV = window.CV, D = CV.DATA;

  CV.visit = {
    render: function () {
      var page = document.getElementById('page'), S = CV.S;
      if (S.dlg) {
        page.innerHTML = '<section class="page page-visit has-vn"><div id="vn" class="vn"></div></section>';
        CV.dlg.render();
        return;
      }
      var loc = D.locations[S.loc];
      /* auto-start any scene that triggers on arrival */
      for (var a = 0; a < loc.scenes.length; a++) {
        var sc = loc.scenes[a];
        if (sc.auto && CV.sceneAvailable(sc)) { CV.dlg.start(sc.id); return CV.visit.render(); }
      }
      S.flags['visited_' + S.loc] = true;
      var bg = CV.bgAttr(loc.bg), h = '';
      h += '<section class="page page-visit"><div class="scene"><div class="scene-stage">';
      h += '<div class="scene-bg ' + bg.cls + '"' + bg.style + '><span class="fb-title">' + CV.esc(loc.name) + '</span></div><div class="scene-vignette"></div>';

      /* hotspots */
      var objs = [];
      for (var i = 0; i < loc.objects.length; i++) if (CV.objectVisible(loc.objects[i])) objs.push(loc.objects[i]);
      for (var j = 0; j < objs.length; j++) {
        var o = objs[j], seen = !!S.insp[o.id];
        h += '<button type="button" class="hotspot' + (seen ? ' seen' : ' fresh') + (CV.ui.inspect === o.id ? ' active' : '') + '" style="left:' + o.x + '%;top:' + o.y + '%" data-act="inspect" data-arg="' + o.id + '" aria-label="Inspect: ' + CV.esc(o.label) + '">' +
          '<span class="hotspot-ring"></span><span class="hotspot-label">' + CV.esc(o.label) + '</span></button>';
      }

      h += '<div class="scene-plaque"><div class="plaque-area">' + (loc.area === 'city' ? 'Vesper City' : 'Vesper Conservatory') + '</div>' +
        '<h2 class="plaque-name">' + CV.esc(loc.name) + '</h2><p class="plaque-desc">' + CV.esc(loc.desc) + '</p></div>';
      if (CV.ui.inspect) h += CV.visit.inspectHTML(CV.ui.inspect);
      h += '</div>';

      /* side panel: people, conversations, objects */
      h += '<aside class="scene-panel">';
      var people = CV.npcsAt(S.loc);
      h += '<h3 class="panel-head">Present</h3>';
      if (!people.length) h += '<p class="empty-note">Nobody is here. The room is listening anyway.</p>';
      else {
        h += '<div class="present-row">';
        for (var p = 0; p < people.length; p++) {
          var npc = people[p];
          h += '<button type="button" class="present-card" data-act="cast-open" data-arg="' + npc + '">' + CV.portrait(npc, 'present-portrait') +
            '<span class="present-name">' + CV.esc(CV.S.met[npc] ? CV.charName(npc) : (D.characters[npc].role)) + '</span>' +
            (CV.S.met[npc] ? CV.relBadge(npc) : '') + '</button>';
        }
        h += '</div>';
      }
      var avail = [];
      for (var s = 0; s < loc.scenes.length; s++) if (!loc.scenes[s].auto && CV.sceneAvailable(loc.scenes[s])) avail.push(loc.scenes[s]);
      h += '<h3 class="panel-head">Conversations</h3>';
      if (!avail.length) h += '<p class="empty-note">Nothing more to say here for now.</p>';
      for (var k = 0; k < avail.length; k++) {
        var who = avail[k].who;
        h += '<button type="button" class="scene-btn" data-act="scene" data-arg="' + avail[k].id + '">' +
          (D.characters[who] ? CV.portrait(who, 'mini-portrait') : '<span class="mini-mark">❦</span>') +
          '<span>' + CV.esc(avail[k].label) + '</span></button>';
      }
      h += '<h3 class="panel-head">Look around</h3>';
      if (!objs.length) h += '<p class="empty-note">Nothing here catches your eye.</p>';
      for (var q = 0; q < objs.length; q++) {
        h += '<button type="button" class="object-btn' + (S.insp[objs[q].id] ? ' seen' : '') + '" data-act="inspect" data-arg="' + objs[q].id + '"><span class="object-dot"></span>' + CV.esc(objs[q].label) + '</button>';
      }
      h += '<button type="button" class="btn-ghost panel-map" data-act="tab" data-arg="map">Leave — open the map</button>';
      h += '</aside>';

      h += '</div></section>';
      page.innerHTML = h;
    },

    findObject: function (id) {
      var loc = D.locations[CV.S.loc];
      for (var i = 0; i < loc.objects.length; i++) if (loc.objects[i].id === id) return loc.objects[i];
      return null;
    },

    inspect: function (id) {
      var S = CV.S, o = CV.visit.findObject(id);
      if (!o) return;
      var first = !S.insp[id];
      CV.ui.inspect = id;
      CV.ui.inspectFirst = first;
      if (first) {
        S.insp[id] = true; S.flags['insp_' + id] = true;
        if (o.fx && !o.choices) CV.apply(o.fx); else CV.changed();
      }
      CV.visit.render();
    },

    inspectHTML: function (id) {
      var S = CV.S, o = CV.visit.findObject(id);
      if (!o) return '';
      var text = (!CV.ui.inspectFirst && o.after) ? o.after : o.text;
      var h = '<div class="inspect-card" role="region" aria-label="' + CV.esc(o.label) + '"><div class="inspect-label">' + CV.esc(o.label) + '</div><p>' + CV.esc(text) + '</p>';
      if (o.choices && !S.flags['chose_' + id]) {
        h += '<div class="inspect-choices">';
        for (var i = 0; i < o.choices.length; i++) if (CV.cond(o.choices[i]['if'])) h += '<button type="button" class="vn-choice" data-act="obj-choice" data-arg="' + id + '|' + i + '"><span class="vn-choice-mark">▸</span><span class="vn-choice-text">' + CV.esc(o.choices[i].t) + '</span></button>';
        h += '</div>';
      }
      h += '<button type="button" class="btn-ghost inspect-close" data-act="inspect-close">Close</button></div>';
      return h;
    },

    objChoice: function (arg) {
      var parts = arg.split('|'), o = CV.visit.findObject(parts[0]), c = o && o.choices[+parts[1]];
      if (!c) return;
      if (c.fx) { CV.S.flags['chose_' + o.id] = true; CV.apply(c.fx); }
      CV.ui.inspect = null;
      CV.visit.render();
    }
  };
})();
