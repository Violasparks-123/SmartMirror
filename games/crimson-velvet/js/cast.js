/* cast.js — CAST: the character archive. Profiles open up as you get to know people. */
(function () {
  var CV = window.CV, D = CV.DATA;

  CV.isKnown = function (id) {
    var c = D.characters[id], S = CV.S;
    if (S.ch < (c.appearsFrom || 0)) return false;
    if (c.hiddenUntil && !S.flags[c.hiddenUntil]) return false;
    return true;
  };

  function heardQuotes(c) {
    var out = [], L = CV.S.log;
    for (var i = 0; i < c.quotes.length; i++) {
      for (var j = 0; j < L.length; j++) if (L[j].t === c.quotes[i]) { out.push(c.quotes[i]); break; }
    }
    return out;
  }
  function list(arr) { var h = '<ul class="dot-list">'; for (var i = 0; i < arr.length; i++) h += '<li>' + CV.esc(arr[i]) + '</li>'; return h + '</ul>'; }
  function sealed(txt) { return '<p class="sealed"><span class="seal-wax"></span>' + CV.esc(txt) + '</p>'; }
  function routePips(id) {
    var max = CV.ROUTE_MAX[id]; if (!max) return '';
    var r = Math.min(CV.S.route[id] || 0, max), h = '<span class="route-pips" aria-label="Route ' + r + ' of ' + max + '">';
    for (var i = 0; i < max; i++) h += '<i class="' + (i < r ? 'on' : '') + '"></i>';
    return h + '</span>';
  }

  CV.cast = {
    render: function () {
      var S = CV.S, ui = CV.ui, order = D.castOrder;
      if (!ui.castSel || !CV.isKnown(ui.castSel)) ui.castSel = 'beatrix';
      if (!ui.castTab) ui.castTab = 'profile';
      var h = '<section class="page page-cast"><header class="page-head"><h1>Cast</h1><p class="page-sub">The people of Vesper Conservatory</p></header>';
      h += '<div class="cast-strip" role="list">';
      for (var i = 0; i < order.length; i++) {
        var id = order[i], c = D.characters[id], known = CV.isKnown(id);
        if (!known) {
          h += '<div class="cast-card unknown" role="listitem"><div class="portrait is-fallback cast-portrait">' + CV.cameo(id, '?') + '</div><span class="cast-name">Not yet known</span></div>';
          continue;
        }
        var missing = c.missingUntil && !S.flags[c.missingUntil];
        h += '<button type="button" role="listitem" class="cast-card' + (ui.castSel === id ? ' on' : '') + (missing ? ' missing' : '') + '" data-act="cast-sel" data-arg="' + id + '">' +
          CV.portrait(id, 'cast-portrait') + '<span class="cast-name">' + CV.esc(c.name) + '</span>' +
          '<span class="cast-meta">' + (missing ? '<span class="rel-badge rel-missing">Missing</span>' : CV.relBadge(id)) + '</span></button>';
      }
      h += '</div>';
      h += CV.cast.profileHTML(ui.castSel) + '</section>';
      document.getElementById('page').innerHTML = h;
    },

    profileHTML: function (id) {
      var S = CV.S, c = D.characters[id], met = !!S.met[id], t = S.trust[id] || 0, tab = CV.ui.castTab;
      var missing = c.missingUntil && !S.flags[c.missingUntil];
      var h = '<div class="profile">';
      h += '<div class="profile-frame">' + CV.portrait(id, 'profile-portrait') +
        '<div class="profile-symbol"><span class="symbol-label">Symbol</span>' + CV.esc(c.symbol) + '</div></div>';
      h += '<div class="profile-sheet parchment">';
      h += '<div class="profile-title"><h2>' + CV.esc(c.name) + '</h2><span class="profile-tag">' + CV.esc(c.tag) + '</span></div>';
      h += '<div class="profile-tabs" role="tablist">' +
        ['profile', 'relationships', 'visit'].map(function (k) {
          return '<button type="button" role="tab" aria-selected="' + (tab === k) + '" class="ptab' + (tab === k ? ' on' : '') + '" data-act="cast-tab" data-arg="' + k + '">' + k.charAt(0).toUpperCase() + k.slice(1) + '</button>';
        }).join('') + '</div>';
      h += '<div class="profile-body">';

      if (tab === 'profile') {
        h += '<p class="profile-line"><b>' + CV.esc(c.role) + '</b>' + (met || missing ? ' · Age ' + c.age : '') + '</p>';
        if (met || id === 'celeste' || id === 'adrian') {
          h += '<div class="facts"><span><i>Born</i>' + CV.esc(c.birthday) + '</span><span><i>Height</i>' + CV.esc(c.height) + '</span><span><i>Archetype</i>' + CV.esc(c.archetype) + '</span></div>';
          h += '<div class="swatches">'; for (var p = 0; p < c.palette.length; p++) h += '<span class="swatch" style="background:' + c.palette[p][1] + '" title="' + CV.esc(c.palette[p][0]) + '"></span>'; h += '<span class="swatch-note">' + c.palette.map(function (x) { return x[0]; }).join(' · ') + '</span></div>';
        }
        h += '<h4>Appearance</h4><p>' + CV.esc(c.appearance) + '</p>';
        if (met) {
          h += '<details class="fold"><summary>Wardrobe</summary>' + list(c.wardrobe) + '</details>';
          h += '<h4>Personality</h4><p>' + CV.esc(c.personality) + '</p>';
          h += '<div class="two-col"><div><h4>Likes</h4>' + list(c.likes) + '</div><div><h4>Dislikes</h4>' + list(c.dislikes) + '</div></div>';
          if (t >= 35) {
            h += '<h4>Little habits</h4>' + list(c.habits);
            h += '<p class="voice"><span>Speaks</span>' + CV.esc(c.voice.speech) + '<span>Humour</span>' + CV.esc(c.voice.humour) + '<span>Feelings</span>' + CV.esc(c.voice.emotion) + '</p>';
          } else h += sealed('Habits and manner — get to know them better.');
          if (t >= 55 || (S.route[id] || 0) >= 1) h += '<h4>Underneath</h4><p>' + CV.esc(c.psych) + '</p>';
          else h += sealed('What drives them — earn more of their trust.');
          var q = heardQuotes(c);
          if (q.length) { h += '<h4>In their words</h4>'; for (var k = 0; k < q.length; k++) h += '<blockquote>“' + CV.esc(q[k]) + '”</blockquote>'; }
        } else if (missing) {
          h += '<p class="profile-missing">Officially: withdrew voluntarily, seven years ago. Records sealed.</p>';
        } else h += sealed('You haven’t really spoken yet.');
        h += '<h4>Secrets uncovered</h4>';
        var any = false;
        for (var s = 0; s < c.secrets.length; s++) if (S.flags[c.secrets[s].flag]) { any = true; h += '<p class="secret">❦ ' + CV.esc(c.secrets[s].text) + '</p>'; }
        var hidden = 0; for (var s2 = 0; s2 < c.secrets.length; s2++) if (!S.flags[c.secrets[s2].flag]) hidden++;
        if (hidden) h += sealed(hidden + (hidden === 1 ? ' secret' : ' secrets') + ' still sealed.');
        else if (!any) h += '<p class="empty-note">None.</p>';
        var done = c.route && (S.route[id] || 0) >= (CV.ROUTE_MAX[id] || 99);
        if (done || S.ending) h += '<h4>Arc</h4><p>' + CV.esc(c.development) + '</p>';
      }

      if (tab === 'relationships') {
        if (!met) h += sealed('You haven’t met yet.');
        else {
          var r = CV.relState(id);
          h += '<div class="rel-head">' + CV.relBadge(id) + CV.trustMeter(id, true) + '<span class="trust-num">' + t + '</span></div><p class="rel-desc">' + CV.esc(r.desc) + '</p>';
          if (c.route) h += '<p class="route-line"><span>Personal route</span>' + routePips(id) + '</p>';
          h += '<h4>What they remember</h4>';
          var mem = S.mem[id] || [];
          if (!mem.length) h += '<p class="empty-note">Nothing you’ve done has stuck with them yet.</p>';
          for (var m = 0; m < mem.length; m++) h += '<p class="memory">— ' + CV.esc(mem[m]) + '</p>';
        }
        h += '<h4>Among the others</h4>';
        CV.each(c.relationships, function (other, txt) {
          if (!CV.isKnown(other)) return;
          h += '<div class="web-row">' + CV.portrait(other, 'mini-portrait') + '<div><b>' + CV.esc(D.characters[other].name) + '</b><p>' + CV.esc(txt) + '</p></div></div>';
        });
      }

      if (tab === 'visit') {
        var where = CV.npcLocation(id);
        if (missing) h += '<p>Nobody knows where she is.</p>';
        else if (!where) h += '<p class="empty-note">You don’t know where to find them right now.</p>';
        else {
          var L = D.locations[where];
          h += '<p>Usually found at <b>' + CV.esc(L.name) + '</b>' + (CV.locUnlocked(where) ? '.' : ' — somewhere you can’t go yet.') + '</p>';
          var scs = [];
          for (var z = 0; z < L.scenes.length; z++) if (L.scenes[z].who === id && !L.scenes[z].auto && CV.sceneAvailable(L.scenes[z])) scs.push(L.scenes[z].label);
          if (scs.length) h += '<p class="detail-new">✦ ' + CV.esc(scs.join(' · ')) + '</p>';
          if (CV.locUnlocked(where)) h += '<button type="button" class="btn-primary" data-act="travel" data-arg="' + where + '">Go to ' + CV.esc(L.name) + '</button>';
        }
      }
      h += '</div></div></div>';
      return h;
    }
  };
})();
