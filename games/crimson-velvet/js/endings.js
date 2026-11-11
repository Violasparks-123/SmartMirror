/* endings.js — works out which ending your whole playthrough has earned, and shows it. */
(function () {
  var CV = window.CV, D = CV.DATA;

  CV.endings = {
    resolve: function () {
      var S = CV.S;
      if (S.ending) return;
      for (var i = 0; i < D.endings.length; i++) {
        var e = D.endings[i];
        if (CV.cond(e.req)) {
          S.ending = e.id;
          if (e.vars) CV.each(e.vars, function (k, v) { S.vars[k] = v; });
          try {
            var seen = JSON.parse(window.localStorage.getItem('crimsonVelvet.endingsSeen') || '[]');
            if (seen.indexOf(e.id) < 0) seen.push(e.id);
            window.localStorage.setItem('crimsonVelvet.endingsSeen', JSON.stringify(seen));
          } catch (err) {}
          return;
        }
      }
    },

    get: function () {
      for (var i = 0; i < D.endings.length; i++) if (D.endings[i].id === CV.S.ending) return D.endings[i];
      return null;
    },

    render: function () {
      var S = CV.S, e = CV.endings.get();
      if (!e) { CV.go('visit'); return; }
      var h = '<section class="page page-ending"><div class="ending-card">';
      h += '<div class="ending-kicker">Ending ' + e.n + ' · ' + CV.esc(e.cat) + '</div><h1 class="ending-title">' + CV.esc(e.title) + '</h1><div class="ending-rule"></div>';
      for (var i = 0; i < e.text.length; i++) h += '<p>' + CV.esc(e.text[i]) + '</p>';
      h += '<h2>What became of them</h2><div class="codas">';
      for (var c = 0; c < D.castOrder.length; c++) {
        var id = D.castOrder[c], lines = D.codas[id];
        if (!lines || !CV.isKnown(id)) continue;
        for (var k = 0; k < lines.length; k++) {
          if (!lines[k]['if'] || CV.cond(lines[k]['if'])) {
            h += '<div class="coda">' + CV.portrait(id, 'coda-portrait') + '<div><b>' + CV.esc(D.characters[id].name) + '</b><p>' + CV.esc(lines[k].text) + '</p></div></div>';
            break;
          }
        }
      }
      h += '</div><p class="ending-question">The question was never only who lied. It was whether the truth could still repair what the lies destroyed.</p>';
      var seen = []; try { seen = JSON.parse(window.localStorage.getItem('crimsonVelvet.endingsSeen') || '[]'); } catch (err) {}
      var titles = {}; for (var s = 0; s < D.endings.length; s++) if (seen.indexOf(D.endings[s].id) >= 0) titles[D.endings[s].title] = true;
      h += '<p class="ending-tally">Endings discovered: ' + CV.keys(titles).length + ' of 5</p>';
      h += '<div class="ending-actions">';
      if (CV.storage.load('gala')) h += '<button type="button" class="btn-primary" data-act="load-slot" data-arg="gala">Return to the night of the Gala</button>';
      h += '<button type="button" class="btn-ghost" data-act="tab" data-arg="stats">See your stats</button><button type="button" class="btn-ghost" data-act="to-title">Title screen</button></div>';
      h += '</div></section>';
      document.getElementById('page').innerHTML = h;
    }
  };
})();
