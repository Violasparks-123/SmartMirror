/* files.js — FILES: the evidence archive. Each item renders as its own kind of document.
 * Choose "Connect with…" on one item, then pick another, to look for a link between them. */
(function () {
  var CV = window.CV, D = CV.DATA;

  function rows(r, cls) {
    var h = '<table class="' + cls + '">';
    for (var i = 0; i < r.length; i++) {
      h += '<tr>'; for (var j = 0; j < r[i].length; j++) h += '<td>' + CV.esc(r[i][j]) + '</td>'; h += '</tr>';
    }
    return h + '</table>';
  }

  CV.renderDoc = function (e) {
    var d = e.doc, h = '', i;
    if (d.type === 'letter') {
      if (d.sealed && !CV.S.flags[e.doc.locked]) return '<div class="doc doc-letter sealed-letter"><div class="wax-seal"></div><p class="doc-hand">For B. Only when it’s safe.</p><p class="doc-note">The final section is still sealed.</p></div>';
      h += '<div class="doc doc-letter' + (d.typed ? ' typed' : '') + (d.hand ? ' hand' : '') + '">';
      if (d.salutation) h += '<p class="doc-salute">' + CV.esc(d.salutation) + '</p>';
      for (i = 0; i < d.lines.length; i++) h += '<p>' + CV.esc(d.lines[i]) + '</p>';
      if (d.sign) h += '<p class="doc-sign">' + CV.esc(d.sign) + '</p>';
      if (d.enclosure) h += '<div class="doc-enclosure"><span>Enclosed, handwritten:</span>' + CV.esc(d.enclosure) + '</div>';
      return h + '</div>';
    }
    if (d.type === 'form') {
      h += '<div class="doc doc-form"><div class="doc-header">' + CV.esc(d.header) + '</div>' + rows(d.rows, 'form-rows');
      h += '<div class="form-sign"><span class="form-sign-label">Signature of student</span><span class="form-sign-val">' + CV.esc(d.sign) + '</span><span class="form-sign-note">' + CV.esc(d.signNote) + '</span></div>';
      return h + '<p class="doc-footer">' + CV.esc(d.footer) + '</p></div>';
    }
    if (d.type === 'report' || d.type === 'log' || d.type === 'ledger') {
      h += '<div class="doc doc-' + d.type + '"><div class="doc-header">' + CV.esc(d.header) + '</div>' + rows(d.rows, d.type + '-rows');
      if (d.footer) h += '<p class="doc-footer">' + CV.esc(d.footer) + '</p>';
      return h + '</div>';
    }
    if (d.type === 'clipping') {
      h += '<div class="doc doc-clipping"><div class="clip-mast">' + CV.esc(d.header) + '</div><h3 class="clip-head">' + CV.esc(d.headline) + '</h3>';
      for (i = 0; i < d.lines.length; i++) h += '<p>' + CV.esc(d.lines[i]) + '</p>';
      return h + '</div>';
    }
    if (d.type === 'photo') {
      h += '<div class="doc doc-photo' + (d.torn ? ' torn-' + d.torn : '') + '"><div class="photo-print">' + CV.evIcon(d.img, 'photo-img') + '</div><p class="photo-cap">' + CV.esc(d.caption) + '</p>';
      if (d.back) h += '<div class="photo-back"><span>Written on the back:</span>' + CV.esc(d.back) + '</div>';
      return h + '</div>';
    }
    if (d.type === 'object') {
      return '<div class="doc doc-object">' + CV.evIcon(d.img || e.icon, 'object-img') + '<div class="inscription">' + CV.esc(d.inscription) + '</div><p>' + CV.esc(d.caption) + '</p></div>';
    }
    return '';
  };

  CV.files = {
    render: function () {
      var S = CV.S, ui = CV.ui;
      if (!ui.filesCat) ui.filesCat = 'all';
      if (!ui.filesSel || !S.ev[ui.filesSel]) ui.filesSel = S.evOrder[S.evOrder.length - 1] || null;
      var total = CV.keys(D.evidence).length;
      var h = '<section class="page page-files"><header class="page-head"><h1>Files</h1><p class="page-sub">' + S.evOrder.length + ' of ' + total + ' items · ' + S.connOrder.length + ' of ' + D.connections.length + ' connections</p></header>';
      h += '<div class="files-cats">';
      var cats = [['all', 'All']]; CV.each(D.evidenceCategories, function (k, v) { cats.push([k, v]); });
      for (var c = 0; c < cats.length; c++) h += '<button type="button" class="chip' + (ui.filesCat === cats[c][0] ? ' on' : '') + '" data-act="files-cat" data-arg="' + cats[c][0] + '">' + CV.esc(cats[c][1]) + '</button>';
      h += '<button type="button" class="chip' + (ui.filesCat === 'board' ? ' on' : '') + '" data-act="files-cat" data-arg="board">Case board</button></div>';

      if (ui.filesCat === 'board') { h += CV.files.boardHTML() + '</section>'; document.getElementById('page').innerHTML = h; return; }

      h += '<div class="files-layout"><div class="files-list">';
      if (ui.connectFrom) h += '<div class="connect-banner">Connecting <b>' + CV.esc(D.evidence[ui.connectFrom].title) + '</b> — choose a second item. <button type="button" class="btn-ghost" data-act="connect-cancel">Cancel</button></div>';
      var shown = 0;
      for (var i = S.evOrder.length - 1; i >= 0; i--) {
        var id = S.evOrder[i], e = D.evidence[id], st = S.ev[id];
        if (ui.filesCat !== 'all' && e.cat !== ui.filesCat) continue;
        shown++;
        h += '<button type="button" class="file-item' + (ui.filesSel === id ? ' on' : '') + (ui.connectFrom && ui.connectFrom !== id ? ' connectable' : '') + '" data-act="' + (ui.connectFrom ? 'connect-pick' : 'files-sel') + '" data-arg="' + id + '">' +
          CV.evIcon(e.icon) + '<span class="file-text"><span class="file-title">' + CV.esc(e.title) + '</span><span class="file-meta">' + CV.esc(D.evidenceCategories[e.cat]) + '</span></span>' +
          (!st.examined ? '<span class="file-new">new</span>' : '') + (st.connected ? '<span class="file-linked" title="Connected">∞</span>' : '') + '</button>';
      }
      if (!shown) h += '<p class="empty-note">Nothing filed here yet.</p>';
      h += '</div><div class="files-viewer">';
      if (CV.ui.connectResult) h += CV.files.resultHTML();
      if (ui.filesSel) h += CV.files.viewerHTML(ui.filesSel);
      else h += '<div class="parchment empty-doc"><p>No evidence yet. Explore, inspect and ask.</p></div>';
      h += '</div></div></section>';
      document.getElementById('page').innerHTML = h;
    },

    viewerHTML: function (id) {
      var S = CV.S, e = D.evidence[id], st = S.ev[id];
      if (!st.examined) { st.examined = true; CV.changed(); }
      var h = '<article class="evidence-sheet">';
      h += '<div class="ev-head"><span class="ev-id">File No. ' + (S.evOrder.indexOf(id) + 1) + ' \u00b7 ' + CV.esc(D.evidenceCategories[e.cat]) + '</span><h2>' + CV.esc(e.title) + '</h2></div>';
      h += CV.renderDoc(e);
      h += '<dl class="ev-meta"><dt>Category</dt><dd>' + CV.esc(D.evidenceCategories[e.cat]) + '</dd><dt>Source</dt><dd>' + CV.esc(e.source) + '</dd><dt>Found at</dt><dd>' + CV.esc(e.found) + '</dd><dt>Date</dt><dd>' + CV.esc(e.date) + '</dd>';
      var ppl = []; for (var i = 0; i < e.people.length; i++) if (CV.isKnown(e.people[i])) ppl.push(D.characters[e.people[i]].name);
      h += '<dt>People</dt><dd>' + (ppl.length ? CV.esc(ppl.join(', ')) : '—') + '</dd>';
      var rel = [];
      for (var c = 0; c < D.connections.length; c++) {
        var cn = D.connections[c];
        if (S.conn[cn.id] && (cn.a === id || cn.b === id)) rel.push(cn.title + ' (with ' + D.evidence[cn.a === id ? cn.b : cn.a].title + ')');
      }
      h += '<dt>Connected</dt><dd>' + (rel.length ? CV.esc(rel.join('; ')) : 'Not yet') + '</dd></dl>';
      h += '<p class="ev-note"><span>First impression:</span> ' + CV.esc(e.notes) + '</p>';
      h += '<label class="ev-notes-label" for="ev-notes">Your notes</label><textarea id="ev-notes" class="ev-notes" data-note="' + id + '" rows="3" placeholder="Write what you think this means…">' + CV.esc(S.notes[id] || '') + '</textarea>';
      h += '<div class="ev-actions"><button type="button" class="btn-primary" data-act="connect-start" data-arg="' + id + '">Connect with…</button></div>';
      return h + '</article>';
    },

    resultHTML: function () {
      var r = CV.ui.connectResult; CV.ui.connectResult = null;
      if (r.ok) return '<div class="connect-result ok"><span class="cr-kicker">Connection</span><h3>' + CV.esc(r.c.title) + '</h3><p>' + CV.esc(r.c.text) + '</p></div>';
      if (r.already) return '<div class="connect-result"><p>You’ve already connected these: <b>' + CV.esc(r.c.title) + '</b>.</p></div>';
      return '<div class="connect-result no"><p>You lay them side by side. Nothing between them speaks to you — not yet, anyway.</p></div>';
    },

    boardHTML: function () {
      var S = CV.S, h = '<div class="case-board">';
      if (!S.connOrder.length) h += '<p class="empty-note board-empty">No connections yet. Open an item and choose “Connect with…”. No single document will solve this.</p>';
      for (var i = 0; i < S.connOrder.length; i++) {
        var c = null; for (var k = 0; k < D.connections.length; k++) if (D.connections[k].id === S.connOrder[i]) c = D.connections[k];
        h += '<div class="board-card" style="transform:rotate(' + ((i % 3) - 1) * 1.2 + 'deg)"><span class="pin"></span><h3>' + CV.esc(c.title) + '</h3><p class="board-pair">' + CV.esc(D.evidence[c.a].title) + ' ↔ ' + CV.esc(D.evidence[c.b].title) + '</p><p>' + CV.esc(c.text) + '</p></div>';
      }
      var left = D.connections.length - S.connOrder.length;
      if (left > 0) h += '<div class="board-card ghost"><h3>' + left + ' more to find</h3><p>Some only appear once you hold both halves.</p></div>';
      return h + '</div>';
    }
  };
})();
