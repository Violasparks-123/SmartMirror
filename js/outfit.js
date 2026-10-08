/* Outfit check: looks at the COLOURS of your clothes with the front camera (no AI, nothing leaves the iPad)
   and scores how well they go together and whether they suit today's weather.
   It rates the outfit, never the person. */
(function () {
  function grab() {
    // Takes one photo from the front camera, then turns the camera straight off
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 360 }, audio: false }).then(function (stream) {
      var v = document.createElement('video');
      v.muted = true; v.setAttribute('playsinline', ''); v.srcObject = stream;
      return v.play().then(function () {
        return new Promise(function (res) { setTimeout(res, 900); });   // let the camera adjust its brightness
      }).then(function () {
        var c = document.createElement('canvas'); c.width = 160; c.height = 120;
        var g = c.getContext('2d'); g.drawImage(v, 0, 0, 160, 120);
        stream.getTracks().forEach(function (t) { t.stop(); });
        // Clothes area: the middle of the picture, lower half (below the face)
        return g.getImageData(40, 60, 80, 58).data;
      }).catch(function (e) { stream.getTracks().forEach(function (t) { t.stop(); }); throw e; });
    });
  }

  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    return [h, s, l];
  }
  function nameOf(h, s, l) {
    if (l < 0.13) return 'black';
    if (l > 0.88 && s < 0.35) return 'white';
    if (s < 0.16) return l < 0.45 ? 'dark grey' : 'grey';
    if (h >= 20 && h < 45 && s < 0.5 && l < 0.45) return 'brown';
    if (h >= 25 && h < 55 && s < 0.45 && l >= 0.55) return 'beige';
    if (h < 12 || h >= 345) return l < 0.32 ? 'maroon' : 'red';
    if (h < 40) return 'orange';
    if (h < 66) return 'yellow';
    if (h < 160) return l < 0.3 ? 'dark green' : 'green';
    if (h < 195) return 'teal';
    if (h < 250) return l < 0.32 ? 'navy' : 'blue';
    if (h < 290) return 'purple';
    return 'pink';
  }
  var neutrals = ['black', 'white', 'grey', 'dark grey', 'beige', 'brown', 'navy'];
  var hueOf = { red: 0, maroon: 0, orange: 28, yellow: 55, green: 120, 'dark green': 120, teal: 178, blue: 220, navy: 225, purple: 270, pink: 320 };

  function analyse(px) {
    var counts = {}, total = 0;
    for (var i = 0; i < px.length; i += 4) {
      var c = hsl(px[i], px[i + 1], px[i + 2]), n = nameOf(c[0], c[1], c[2]);
      counts[n] = (counts[n] || 0) + 1; total++;
    }
    var top = Object.keys(counts).map(function (k) { return [k, counts[k] / total]; }).sort(function (a, b) { return b[1] - a[1]; })
      .filter(function (x) { return x[1] > 0.12; }).slice(0, 3).map(function (x) { return x[0]; });
    if (!top.length) top = ['grey'];
    var bright = top.filter(function (c) { return neutrals.indexOf(c) < 0; });
    var score = 7, note = '';
    if (top.length === 1) { score = 8; note = 'All ' + top[0] + '. A clean, simple look.'; }
    else if (!bright.length) { score = 8.5; note = cap(top.join(' and ')) + '. Neutrals always work together.'; }
    else if (bright.length === 1) { score = 9; note = cap(bright[0]) + ' with ' + top.filter(function (c) { return c !== bright[0]; }).join(' and ') + '. One colour plus neutrals is a classic combo.'; }
    else {
      var d = Math.abs(hueOf[bright[0]] - hueOf[bright[1]]); d = Math.min(d, 360 - d);
      if (d < 50) { score = 8.5; note = cap(bright[0]) + ' and ' + bright[1] + ' are close on the colour wheel, so they blend nicely.'; }
      else if (d > 140) { score = 8; note = cap(bright[0]) + ' and ' + bright[1] + ' are opposites, so it\'s bold and eye-catching.'; }
      else { score = 7; note = cap(bright[0]) + ' and ' + bright[1] + ' together is a fun mix. A neutral piece like white or black would tie it together.'; }
      if (bright.length > 2) score -= 0.5;
    }
    return { colours: top, score: Math.max(6, Math.min(10, Math.round(score))), note: note };
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function weatherTip(colours) {
    if (!M.weather) return '';
    var w = M.weather, r = M.nextRain(), light = colours.some(function (c) { return c === 'white' || c === 'beige'; });
    var dark = colours.filter(function (c) { return /black|navy|dark/.test(c); }).length >= Math.ceil(colours.length / 2);
    if (r && light) return ' Heads up: rain is likely around ' + M.fmtTime(r.time) + ', and light colours show splashes.';
    if (r) return ' It might rain around ' + M.fmtTime(r.time) + ', so bring an umbrella.';
    if (w.feels >= 31 && dark) return ' It feels like ' + w.feels + ' degrees, and dark colours soak up heat, so something lighter would be cooler.';
    if (w.feels < 18) return ' It\'s chilly, about ' + w.feels + ' degrees. Add a layer.';
    return ' It suits today\'s weather.';
  }

  M.outfitCheck = function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return M.say('I can\'t use the camera here. ' + M.pick(M.content.compliments));
    M.say('Stand in front of me so I can see your outfit. Checking in 3, 2, 1…', { noToast: true });
    M.setLights({ color: '#ffffff', mode: 'solid', brightness: 100 });   // light you up for the camera
    setTimeout(function () {
      grab().then(function (px) {
        var a = analyse(px);
        M.lightsPulse();
        M.say('Colour match: ' + a.score + ' out of 10. ' + a.note + weatherTip(a.colours));
      }).catch(function () { M.say('I couldn\'t use the camera. Check camera permission in Settings. ' + M.pick(M.content.compliments)); });
    }, 2400);
    return true;
  };

  M.addCommand(['outfit', '(rate|check|score|judge) (my|this) (fit|clothes|look|style)', 'fit check', 'how do i look', 'how does (this|my outfit|my fit) look', 'do(es)? (my|these|this) (clothes|outfit|colou?rs?) (match|go together)', 'what do you think of my (clothes|outfit|fit)'], function () { return M.outfitCheck(); });
})();
