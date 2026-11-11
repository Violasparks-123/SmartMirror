/* journal.js — JOURNAL: full-page notebook. Blank page bases are drawn once;
 * the text is poured onto them and flows onto as many pages as it needs. */
(function () {
  var CV = window.CV, D = CV.DATA;
  var KIND = { confirmed: 'Confirmed', assumption: 'Assumption', contradiction: 'Contradiction', question: 'Question', theory: 'Theory', reflection: '' };

  function entriesFor(sec) {
    var S = CV.S, ids = [], i, supBy = {};
    for (i = 0; i < S.jOrder.length; i++) {
      var e = D.journal[S.jOrder[i]];
      if (e && e.supersedes && S.journal[e.supersedes]) supBy[e.supersedes] = S.jOrder[i];
    }
    var used = {}, out = [];
    var list = S.jOrder.slice();
    if (sec === 'timeline') list.sort(function (a, b) { return (D.journal[a].ts || '').localeCompare(D.journal[b].ts || ''); });
    for (i = 0; i < list.length; i++) {
      var id = list[i], en = D.journal[id];
      if (!en || en.sec !== sec || used[id]) continue;
      if (en.supersedes && supBy[en.supersedes] === id && S.journal[en.supersedes] && D.journal[en.supersedes].sec === sec) continue; /* rendered under its original */
      used[id] = true;
      if (supBy[id]) {
        out.push(entryHTML(en, true));
        var nid = supBy[id]; used[nid] = true; out.push(entryHTML(D.journal[nid], false, true));
      } else out.push(entryHTML(en));
    }
    return out;
  }
  function entryHTML(e, struck, revision) {
    var tag = KIND[e.kind] ? '<span class="jtag jtag-' + e.kind + '">' + KIND[e.kind] + '</span>' : '';
    if (struck) return '<div class="jentry struck">' + tag + '<p><s>' + CV.esc(e.text) + '</s></p></div>';
    return '<div class="jentry kind-' + e.kind + (revision ? ' revision' : '') + '">' + (revision ? '<span class="jrev">revised →</span>' : '') + tag + '<p>' + CV.esc(e.text) + '</p></div>';
  }

  CV.journal = {
    render: function () {
      var ui = CV.ui;
      if (!ui.jSec) ui.jSec = 'case';
      if (ui.jPage == null) ui.jPage = 0;
      var h = '<section class="page page-journal"><header class="page-head"><h1>Journal</h1><p class="page-sub">' + CV.esc(CV.chapter().label + ' — ' + CV.chapter().t) + '</p></header>';
      h += '<div class="journal-wrap"><nav class="ribbons" aria-label="Journal sections">';
      for (var i = 0; i < D.journalSections.length; i++) {
        var s = D.journalSections[i], n = entriesFor(s.id).length;
        h += '<button type="button" class="ribbon' + (ui.jSec === s.id ? ' on' : '') + '" data-act="j-sec" data-arg="' + s.id + '">' + CV.esc(s.title) + (n ? '<span class="ribbon-n">' + n + '</span>' : '') + '</button>';
      }
      h += '</nav><div class="book"><div class="spread"><div class="jpage left"><div class="jpage-text"></div><span class="jfolio"></span></div><div class="jpage right"><div class="jpage-text"></div><span class="jfolio"></span></div></div>' +
        '<div class="book-controls"><button type="button" class="btn-ghost" data-act="j-prev">← Previous</button><span class="book-count"></span><button type="button" class="btn-ghost" data-act="j-next">Next →</button></div></div></div></section>';
      document.getElementById('page').innerHTML = h;
      var custom = CV.hasAsset('journal/page.jpg');
      if (custom) { var pg = document.querySelectorAll('.jpage'); for (var c = 0; c < pg.length; c++) pg[c].style.backgroundImage = "url('assets/journal/page.jpg')"; }
      CV.journal.paginate();
    },

    paginate: function () {
      var ui = CV.ui, entries = entriesFor(ui.jSec);
      var secTitle = ''; for (var i = 0; i < D.journalSections.length; i++) if (D.journalSections[i].id === ui.jSec) secTitle = D.journalSections[i].title;
      var left = document.querySelector('.jpage.left .jpage-text'), right = document.querySelector('.jpage.right');
      if (!left) return;
      var single = !right || right.offsetWidth === 0;
      var box = left, maxH = box.clientHeight;
      var pages = [], cur = '<h2 class="jsec-title">' + CV.esc(secTitle) + '</h2>';
      if (!entries.length) cur += '<p class="jempty">Nothing written here yet.</p>';
      for (var k = 0; k < entries.length; k++) {
        box.innerHTML = cur + entries[k];
        if (box.scrollHeight > maxH + 2 && cur.length && cur.indexOf('jentry') >= 0) { pages.push(cur); cur = entries[k]; }
        else cur += entries[k];
      }
      pages.push(cur);
      var per = single ? 1 : 2, spreads = Math.ceil(pages.length / per);
      if (ui.jPage >= spreads) ui.jPage = spreads - 1;
      if (ui.jPage < 0) ui.jPage = 0;
      var a = ui.jPage * per;
      box.innerHTML = pages[a] || '';
      document.querySelector('.jpage.left .jfolio').textContent = a + 1;
      if (!single) {
        right.querySelector('.jpage-text').innerHTML = pages[a + 1] || '<p class="jempty jblank">❦</p>';
        right.querySelector('.jfolio').textContent = pages[a + 1] ? a + 2 : '';
      }
      var cnt = document.querySelector('.book-count');
      if (cnt) cnt.textContent = (ui.jPage + 1) + ' / ' + spreads;
      CV.journal.spreads = spreads;
    },

    turn: function (d) {
      var ui = CV.ui;
      ui.jPage = Math.max(0, Math.min((CV.journal.spreads || 1) - 1, ui.jPage + d));
      CV.journal.paginate();
    }
  };
})();
