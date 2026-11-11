/* map.js — MAP: the Conservatory floor plan and the Vesper City map. */
(function () {
  var CV = window.CV, D = CV.DATA;

  function status(id) {
    var L = D.locations[id];
    if (!CV.locUnlocked(id)) return L.hidden ? 'hidden' : 'locked';
    if (CV.S.loc === id || (L.link && CV.S.loc === L.link)) return 'here';
    return 'open';
  }

  function wrapLabel(name, w) {
    var max = Math.max(6, Math.floor((w - 16) / 12.5)), words = name.split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      if ((cur + ' ' + words[i]).trim().length > max && cur) { lines.push(cur); cur = words[i]; } else cur = (cur + ' ' + words[i]).trim();
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  function planSVG() {
    var h = '<svg class="plan-svg" viewBox="0 0 1000 640" role="img" aria-label="Floor plan of Vesper Conservatory">';
    h += '<defs><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#6b4a3a" stroke-width="2" opacity=".45"/></pattern>' +
      '<filter id="ink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4"/></filter></defs>';
    h += '<rect x="20" y="20" width="960" height="600" rx="6" class="plan-wall"/>';
    /* corridors */
    h += '<path class="plan-corridor" d="M240 300 H400 M380 160 V170 M460 100 H480 M620 100 H640 M740 300 H760 M595 420 V440 M740 400 H760 M240 490 H480 M710 540 H730"/>';
    var order = D.locationOrder;
    for (var i = 0; i < order.length; i++) {
      var id = order[i], L = D.locations[id];
      if (L.area !== 'conservatory' || !L.plan) continue;
      var st = status(id), p = L.plan;
      if (st === 'hidden' && id !== 'forgotten_wing') continue;
      var isNew = st !== 'locked' && st !== 'hidden' && CV.locHasNew(id);
      var sel = CV.ui.mapSel === id;
      h += '<g class="room room-' + st + (sel ? ' selected' : '') + (isNew ? ' has-new' : '') + '" data-act="map-select" data-arg="' + id + '" tabindex="0" role="button" aria-label="' + CV.esc(L.name) + '">';
      h += '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="3" class="room-shape"/>';
      if (st === 'locked' || st === 'hidden') h += '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" fill="url(#hatch)" pointer-events="none"/>';
      var lines = (st === 'hidden') ? ['Sealed'] : (st === 'locked' ? ['?'] : wrapLabel(L.name, p.w));
      var cy = p.y + p.h / 2 - (lines.length - 1) * 10;
      for (var k = 0; k < lines.length; k++) h += '<text x="' + (p.x + p.w / 2) + '" y="' + (cy + k * 20 + 5) + '" class="room-label">' + CV.esc(lines[k]) + '</text>';
      if (st === 'here') h += '<circle cx="' + (p.x + 14) + '" cy="' + (p.y + 14) + '" r="6" class="here-dot"/>';
      if (isNew) h += '<text x="' + (p.x + p.w - 14) + '" y="' + (p.y + 20) + '" class="new-star">✦</text>';
      h += '</g>';
    }
    /* cartouche + compass */
    h += '<g class="plan-cartouche"><rect x="770" y="575" width="190" height="34" rx="2"/><text x="865" y="597">GROUND PLAN · VESPER</text></g>';
    h += '<g class="plan-compass" transform="translate(372,452)"><circle r="15"/><path d="M0-13 L4 0 L0 13 L-4 0Z"/><text y="-19">N</text></g>';
    return h + '</svg>';
  }

  function cityHTML() {
    var h = '<div class="city-frame"><div class="city-ratio"><img src="assets/map/city_map.jpg" alt="Map of Vesper City: Uptown, Midtown, Foggy Row and The Docks" class="city-img">';
    for (var i = 0; i < D.locationOrder.length; i++) {
      var id = D.locationOrder[i], L = D.locations[id];
      if (L.area !== 'city') continue;
      var st = status(id);
      if (st === 'hidden') continue;
      var isNew = st === 'open' && CV.locHasNew(id);
      h += '<button type="button" class="city-pin pin-' + st + (CV.ui.mapSel === id ? ' selected' : '') + (isNew ? ' has-new' : '') + '" style="left:' + L.pin.x + '%;top:' + L.pin.y + '%" data-act="map-select" data-arg="' + id + '">' +
        '<span class="pin-lamp"></span><span class="pin-label">' + CV.esc(st === 'locked' ? 'Unknown' : L.name) + '</span></button>';
    }
    return h + '</div></div>';
  }

  CV.map = {
    render: function () {
      var S = CV.S, ui = CV.ui;
      if (!ui.mapView) ui.mapView = D.locations[S.loc].area === 'city' ? 'city' : 'conservatory';
      if (!ui.mapSel) ui.mapSel = S.loc;
      var h = '<section class="page page-map"><header class="page-head"><h1>Map</h1>' +
        '<div class="seg"><button type="button" class="seg-btn' + (ui.mapView === 'conservatory' ? ' on' : '') + '" data-act="map-view" data-arg="conservatory">Vesper Conservatory</button>' +
        '<button type="button" class="seg-btn' + (ui.mapView === 'city' ? ' on' : '') + '" data-act="map-view" data-arg="city">Vesper City</button></div></header>';
      h += '<div class="map-layout"><div class="map-board">' + (ui.mapView === 'city' ? cityHTML() : '<div class="plan-frame">' + planSVG() + '</div>') +
        '<p class="map-legend"><span class="lg lg-here"></span>You are here <span class="lg lg-new">✦</span>Something new <span class="lg lg-locked"></span>Not yet accessible</p></div>';
      h += '<aside class="map-detail">' + CV.map.detailHTML(ui.mapSel) + '</aside></div></section>';
      document.getElementById('page').innerHTML = h;
    },

    detailHTML: function (id) {
      var L = D.locations[id];
      if (!L) return '';
      var st = status(id), h = '<div class="parchment detail-card">';
      if (st === 'locked' || st === 'hidden') {
        h += '<div class="detail-kicker">' + (L.area === 'city' ? 'Vesper City' : 'Vesper Conservatory') + '</div><h2>' + (st === 'hidden' ? 'Sealed' : 'Not yet') + '</h2>';
        h += '<p>' + (st === 'hidden' ? 'Officially sealed years ago. Nobody seems to agree on why.' : 'You have no reason to go there yet — or no way in.') + '</p></div>';
        return h;
      }
      var people = CV.npcsAt(L.link || id);
      h += '<div class="detail-kicker">' + (L.area === 'city' ? 'Vesper City' : 'Vesper Conservatory') + (st === 'here' ? ' · You are here' : '') + '</div>';
      h += '<h2>' + CV.esc(L.name) + '</h2><p>' + CV.esc(L.desc) + '</p>';
      if (people.length) {
        h += '<div class="detail-people">';
        for (var i = 0; i < people.length; i++) h += '<span class="detail-person">' + CV.portrait(people[i], 'mini-portrait') + CV.esc(CV.S.met[people[i]] ? CV.charName(people[i]) : D.characters[people[i]].role) + '</span>';
        h += '</div>';
      }
      if (CV.locHasNew(L.link || id)) h += '<p class="detail-new">✦ Something here is worth your attention.</p>';
      h += '<button type="button" class="btn-primary" data-act="travel" data-arg="' + id + '">' + (st === 'here' ? 'Return to the scene' : 'Go there') + '</button></div>';
      return h;
    }
  };
})();
