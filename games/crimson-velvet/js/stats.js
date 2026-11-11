/* stats.js — STATS: the investigation at a glance. Every number shown is real game state. */
(function () {
  var CV = window.CV, D = CV.DATA;

  function gauge(label, v, cls, hint) {
    return '<div class="gauge ' + cls + '"><div class="gauge-top"><span>' + label + '</span><b>' + v + '</b></div><div class="gauge-bar"><i style="width:' + v + '%"></i></div>' + (hint ? '<p class="gauge-hint">' + hint + '</p>' : '') + '</div>';
  }
  function stripFinal(req) {
    var r = {}; CV.each(req, function (k, v) { r[k] = v; });
    if (r.f) r.f = r.f.filter(function (x) { return x.indexOf('final_') !== 0; });
    return r;
  }
  function suspicionWord(v) { return v >= 80 ? 'He knows you’re coming' : v >= 50 ? 'Watching you closely' : v >= 20 ? 'Aware of you' : 'Barely aware'; }

  CV.stats = {
    render: function () {
      var S = CV.S, V = S.vars;
      var evN = S.evOrder.length, evT = CV.keys(D.evidence).length, cN = S.connOrder.length, cT = D.connections.length;
      var locs = 0, locT = 0; for (var i = 0; i < D.locationOrder.length; i++) { var lid = D.locationOrder[i]; if (D.locations[lid].link) continue; locT++; if (S.flags['visited_' + lid]) locs++; }
      var prog = Math.round(((evN / evT) * 0.45 + (cN / cT) * 0.35 + (S.ch / 8) * 0.2) * 100);
      var h = '<section class="page page-stats"><header class="page-head"><h1>Stats</h1><p class="page-sub">' + CV.esc(CV.chapter().label + ' — ' + CV.chapter().t) + '</p></header><div class="stats-grid">';

      /* column 1: investigation */
      h += '<div class="stats-col parchment"><h2>The Investigation</h2>';
      h += gauge('Investigation progress', prog, 'g-progress');
      h += gauge('Credibility', S.cred, 'g-cred', 'How believable you are to people who matter.');
      h += gauge('Investigation heat', S.heat, 'g-heat', 'How much attention you are attracting.');
      h += '<table class="kv"><tr><td>Evidence</td><td>' + evN + ' / ' + evT + '</td></tr><tr><td>Connections</td><td>' + cN + ' / ' + cT + '</td></tr><tr><td>Places visited</td><td>' + locs + ' / ' + locT + '</td></tr>' +
        '<tr><td>Truth about Celeste</td><td>' + V.celeste_truth + ' discoveries</td></tr>' +
        '<tr><td>Original ledger</td><td>' + (V.original_ledger_found ? 'Found' : S.flags.ledger_destroyed ? 'Destroyed' : 'Missing') + '</td></tr>' +
        '<tr><td>Blackout reconstructed</td><td>' + (V.truth_revealed ? 'Yes' : 'Not yet') + '</td></tr>' +
        '<tr><td>Headmistress</td><td>' + CV.esc(V.evelyn_stance === 'unknown' ? (S.flags.met_evelyn ? 'Formal' : 'Not met') : V.evelyn_stance.charAt(0).toUpperCase() + V.evelyn_stance.slice(1)) + '</td></tr>' +
        (S.flags.k_adrian_named ? '<tr><td>Adrian Voss</td><td>' + suspicionWord(V.adrian_suspicion) + '</td></tr>' : '') +
        '</table>';
      var hints = D.chapterHints[S.ch] || [];
      if (hints.length && !S.ending) { h += '<h3>Still to do</h3><ul class="dot-list">'; for (var k = 0; k < hints.length; k++) h += '<li>' + CV.esc(hints[k]) + '</li>'; h += '</ul>'; }
      h += '</div>';

      /* column 2: relationships */
      h += '<div class="stats-col stats-rel"><h2>Relationships</h2>';
      for (var c = 0; c < D.castOrder.length; c++) {
        var id = D.castOrder[c], ch = D.characters[id];
        if (!CV.isKnown(id)) continue;
        var met = !!S.met[id], mem = S.mem[id] || [];
        h += '<div class="rel-entry">' + CV.portrait(id, 'rel-portrait') + '<div class="rel-body"><div class="rel-name"><b>' + CV.esc(ch.name) + '</b>' + (met ? CV.relBadge(id) : '<span class="rel-badge rel-unknown">' + (ch.missingUntil && !S.flags[ch.missingUntil] ? 'Missing' : 'Not met') + '</span>') + '</div>';
        if (met) {
          h += '<div class="rel-meter">' + CV.trustMeter(id) + '<span class="trust-num">' + (S.trust[id] || 0) + '</span>';
          if (CV.ROUTE_MAX[id]) { var r = Math.min(S.route[id] || 0, CV.ROUTE_MAX[id]); h += '<span class="route-mini">Route ' + r + '/' + CV.ROUTE_MAX[id] + '</span>'; }
          h += '</div>';
          if (mem.length) h += '<p class="rel-mem">“' + CV.esc(mem[mem.length - 1]) + '”</p>';
        }
        h += '</div></div>';
      }
      h += '</div>';

      /* column 3: decisions and endings */
      h += '<div class="stats-col parchment"><h2>Decisions</h2>';
      if (!S.morals.length) h += '<p class="empty-note">No defining choices yet.</p>';
      for (var m = 0; m < S.morals.length; m++) h += '<p class="decision"><span class="dec-axis">' + CV.esc(S.morals[m].axis) + '</span>' + CV.esc(S.morals[m].label) + '</p>';
      h += '<h2>Possible endings</h2>';
      var seen = {};
      for (var e = 0; e < D.endings.length; e++) {
        var en = D.endings[e];
        if (seen[en.title]) continue; seen[en.title] = true;
        var line;
        if (en.n === 4) line = 'Always possible';
        else if (en.n === 5) line = S.flags.k_second_copy ? (CV.cond(stripFinal(en.req)) ? 'Within reach' : 'Something is missing') : '???';
        else line = CV.cond(stripFinal(en.req)) ? 'Within reach' : 'Not yet';
        var title = (en.n === 5 && !S.flags.k_second_copy) ? 'A hidden ending' : en.title;
        h += '<div class="ending-row"><span class="end-cat">' + CV.esc(en.cat) + '</span><b>' + CV.esc(title) + '</b><span class="end-state ' + (line === 'Within reach' ? 'ok' : '') + '">' + line + '</span></div>';
      }
      h += '</div></div></section>';
      document.getElementById('page').innerHTML = h;
    }
  };
})();
