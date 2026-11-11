/* assets.js — finds images by name, and draws designed fallbacks when one is missing.
 *
 * To add or replace art, drop files into the assets folder with these names:
 *   assets/portraits/<character>.jpg          e.g. julian.jpg, celeste.jpg
 *   assets/portraits/<character>_<mood>.jpg   e.g. julian_happy.jpg (optional)
 *   assets/backgrounds/<location>.jpg         e.g. old_archive.jpg
 * At start-up the game checks which files exist; anything missing gets a
 * designed cameo or backdrop instead of a broken image. */
(function () {
  var CV = window.CV, D = CV.DATA;
  var have = {};
  var KNOWN = ['portraits/detective.jpg', 'portraits/odette.jpg', 'portraits/evelyn.jpg',
    'backgrounds/front_steps.jpg', 'backgrounds/grand_theatre.jpg', 'backgrounds/velvet_ballroom.jpg',
    'backgrounds/velvet_note.jpg', 'backgrounds/cafe_etoile.jpg', 'map/city_map.jpg'];
  for (var i = 0; i < KNOWN.length; i++) have[KNOWN[i]] = true;

  function probe(path, done) {
    var img = new Image();
    img.onload = function () { have[path] = true; done(); };
    img.onerror = function () { done(); };
    img.src = 'assets/' + path;
  }

  /* check for optional art the player may have added */
  CV.probeAssets = function (cb) {
    var list = [], pending;
    CV.each(D.characters, function (id) {
      list.push('portraits/' + id + '.jpg');
      for (var e = 0; e < D.expressions.length; e++) list.push('portraits/' + id + '_' + D.expressions[e] + '.jpg');
    });
    CV.each(D.locations, function (id, L) { list.push('backgrounds/' + L.bg + '.jpg'); });
    list.push('backgrounds/railway_station.jpg', 'journal/page.jpg');
    var todo = [];
    for (var k = 0; k < list.length; k++) if (!have[list[k]]) todo.push(list[k]);
    pending = todo.length;
    if (!pending) return cb();
    var finished = false;
    var finish = function () { if (!finished) { finished = true; cb(); } };
    setTimeout(finish, 2500);
    for (var j = 0; j < todo.length; j++) probe(todo[j], function () { pending--; if (pending <= 0) finish(); });
  };
  CV.hasAsset = function (path) { return !!have[path]; };

  function initials(name) {
    var p = String(name).split(/\s+/), r = '';
    for (var i = 0; i < p.length && r.length < 2; i++) if (p[i]) r += p[i].charAt(0);
    return r || '?';
  }

  /* designed cameo for characters without artwork — tinted with their palette */
  CV.cameo = function (npc, name) {
    var c = D.characters[npc], col = c && c.palette ? c.palette[0][1] : '#6b1f34', col2 = c && c.palette ? c.palette[c.palette.length - 1][1] : '#b77b89';
    var gid = 'cg' + (npc || 'x');
    return '<div class="cameo"><svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><radialGradient id="' + gid + '" cx="50%" cy="36%" r="70%"><stop offset="0" stop-color="' + col + '" stop-opacity=".9"/><stop offset="1" stop-color="#120a0f"/></radialGradient></defs>' +
      '<rect width="100" height="125" fill="url(#' + gid + ')"/>' +
      '<ellipse cx="50" cy="60" rx="41" ry="53" fill="none" stroke="#b08d57" stroke-width="1" opacity=".75"/>' +
      '<ellipse cx="50" cy="60" rx="37" ry="49" fill="none" stroke="' + col2 + '" stroke-width=".5" opacity=".7"/>' +
      '<path d="M50 32c-9 0-15 7-15 16 0 7 3 12 7 15-11 4-19 13-21 26h58c-2-13-10-22-21-26 4-3 7-8 7-15 0-9-6-16-15-16z" fill="#0d070b" opacity=".88"/>' +
      '</svg><span class="cameo-initials">' + CV.esc(initials(name)) + '</span></div>';
  };

  CV.portraitPath = function (npc, mood) {
    var key = npc === 'you' ? D.player.portrait : (D.characters[npc] ? D.characters[npc].portrait : null);
    if (!key) return null;
    if (mood && mood !== 'neutral' && have['portraits/' + key + '_' + mood + '.jpg']) return 'assets/portraits/' + key + '_' + mood + '.jpg';
    return have['portraits/' + key + '.jpg'] ? 'assets/portraits/' + key + '.jpg' : null;
  };

  CV.portrait = function (npc, cls, mood) {
    var name = npc === 'you' ? 'You' : CV.charName(npc);
    var url = CV.portraitPath(npc, mood);
    var moodCls = mood ? ' mood-' + mood : '';
    if (!url) return '<div class="portrait is-fallback ' + (cls || '') + moodCls + '">' + CV.cameo(npc, name) + '</div>';
    return '<div class="portrait ' + (cls || '') + moodCls + '"><img src="' + url + '" alt="' + CV.esc(name) + '"></div>';
  };

  CV.bgAttr = function (bgKey) {
    var p = 'backgrounds/' + bgKey + '.jpg';
    if (have[p]) return { cls: 'has-bg', style: ' style="background-image:url(\'assets/' + p + '\')"' };
    return { cls: 'bg-fallback fb-' + bgKey, style: '' };
  };

  CV.evIcon = function (key, cls) {
    return '<img class="ev-icon ' + (cls || '') + '" src="assets/evidence/' + key + '.png" alt="">';
  };
})();
