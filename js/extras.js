/* Extra features: French word of the day + quiz, maths quiz, breathing exercise,
   toothbrush timer, countdowns to events, water tracker. All offline. */
(function () {
  var S = M.settings;
  if (!S.events) S.events = [];
  if (!S.water) S.water = { date: '', count: 0 };
  function plain(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(); }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + M.pad(d.getMonth() + 1) + '-' + M.pad(d.getDate()); }

  /* ---------- French ---------- */
  var FR = [['bonjour', 'hello'], ['merci', 'thank you'], ['s\'il vous plaît', 'please'], ['au revoir', 'goodbye'], ['oui', 'yes'], ['non', 'no'],
    ['le miroir', 'the mirror'], ['la lumière', 'the light'], ['l\'école', 'school'], ['les devoirs', 'homework'], ['le livre', 'the book'], ['le stylo', 'the pen'],
    ['la pomme', 'the apple'], ['le pain', 'bread'], ['l\'eau', 'water'], ['le lait', 'milk'], ['le fromage', 'cheese'], ['le chat', 'the cat'], ['le chien', 'the dog'],
    ['la maison', 'the house'], ['la famille', 'the family'], ['la mère', 'the mother'], ['le père', 'the father'], ['la sœur', 'the sister'], ['le frère', 'the brother'],
    ['l\'ami', 'friend'], ['heureux', 'happy'], ['triste', 'sad'], ['fatigué', 'tired'], ['beau', 'beautiful'], ['grand', 'big'], ['petit', 'small'],
    ['rouge', 'red'], ['bleu', 'blue'], ['vert', 'green'], ['jaune', 'yellow'], ['noir', 'black'], ['blanc', 'white'], ['rose', 'pink'], ['violet', 'purple'],
    ['aujourd\'hui', 'today'], ['demain', 'tomorrow'], ['hier', 'yesterday'], ['le matin', 'the morning'], ['le soir', 'the evening'], ['la nuit', 'the night'],
    ['lundi', 'Monday'], ['mardi', 'Tuesday'], ['mercredi', 'Wednesday'], ['jeudi', 'Thursday'], ['vendredi', 'Friday'], ['samedi', 'Saturday'], ['dimanche', 'Sunday'],
    ['un', 'one'], ['deux', 'two'], ['trois', 'three'], ['quatre', 'four'], ['cinq', 'five'], ['six', 'six'], ['sept', 'seven'], ['huit', 'eight'], ['neuf', 'nine'], ['dix', 'ten'],
    ['la musique', 'music'], ['le soleil', 'the sun'], ['la pluie', 'rain'], ['il fait chaud', 'it\'s hot'], ['il fait froid', 'it\'s cold'], ['j\'ai faim', 'I\'m hungry'],
    ['bonne nuit', 'good night'], ['bonne chance', 'good luck'], ['je t\'aime', 'I love you'], ['comment ça va', 'how are you'], ['ça va bien', 'I\'m fine'],
    ['le parapluie', 'the umbrella'], ['les vêtements', 'clothes'], ['la chemise', 'the shirt'], ['le pantalon', 'trousers'], ['les chaussures', 'shoes']];
  function wordOfDay() { var d = new Date(), n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); return FR[n % FR.length]; }
  M.addCommand(['french word( of the day)?', 'word of the day', 'teach me (some |a )?french'], function () {
    var w = wordOfDay(); return M.say('Today\'s French word is "' + w[0] + '". It means ' + w[1] + '.');
  });
  M.addCommand(['how (do you|do i|to) say (.+?) in french', '^what(\'s| is) (.+?) in french', '^translate (.+?) (in)?to french', '^(.+?) in french$'], function (m) {
    var q = plain(m[m.length - 1].replace(/^(the|a|an) /, ''));
    var hit = FR.filter(function (p) { return plain(p[1]).replace(/^the /, '') === q || plain(p[1]) === q; })[0];
    return hit ? M.say(M.cap(m[m.length - 1]) + ' in French is "' + hit[0] + '".') : M.say('I don\'t know that one yet. I only know about ' + FR.length + ' French words so far.');
  });
  M.addCommand(['what does (.+?) mean( in english)?$', '^translate (.+?) (in)?to english'], function (m) {
    var q = plain(m[1]);
    var hit = FR.filter(function (p) { return plain(p[0]) === q || plain(p[0]).replace(/^(le|la|les|l) ?/, '') === q; })[0];
    return hit ? M.say('"' + hit[0] + '" means ' + hit[1] + '.') : false;
  });

  /* ---------- Quizzes ---------- */
  function runQuiz(name, makeQ, check) {
    var n = 0, score = 0, total = 5, q = makeQ();
    function ask() { return M.say('Question ' + (n + 1) + ' of ' + total + '. ' + q.text); }
    function handler(t) {
      if (/^(stop|quit|end|exit|cancel)( the)?( quiz)?$/.test(t)) return M.say('Quiz stopped. You got ' + score + ' out of ' + n + '.');
      var right = check(q, t);
      if (right === null) { M.expect(handler); return M.say('Say an answer, or "stop quiz".'); }
      if (right) score++;
      var fb = right ? M.pick(['Correct!', 'Yes!', 'Nice one!', 'Spot on!']) : 'Not quite. It\'s ' + q.answer + '.';
      n++;
      if (n >= total) {
        M.lightsPulse();
        return M.say(fb + ' Quiz over! You scored ' + score + ' out of ' + total + '. ' + (score === total ? 'Perfect score!' : score >= 3 ? 'Great job!' : 'Keep practising, you\'ll get there.'));
      }
      q = makeQ(); M.expect(handler);
      return M.say(fb + ' Question ' + (n + 1) + '. ' + q.text);
    }
    M.show('assistant'); M.expect(handler);
    M.say(name + ' quiz! 5 questions. Say "stop quiz" any time.', { noToast: true });
    setTimeout(ask, 2600);
    return true;
  }
  function mathsQ() {
    var k = Math.floor(Math.random() * 4), a, b;
    if (k === 0) { a = 2 + Math.floor(Math.random() * 11); b = 2 + Math.floor(Math.random() * 11); return { text: 'What is ' + a + ' times ' + b + '?', answer: a * b }; }
    if (k === 1) { a = 12 + Math.floor(Math.random() * 80); b = 12 + Math.floor(Math.random() * 80); return { text: 'What is ' + a + ' plus ' + b + '?', answer: a + b }; }
    if (k === 2) { a = 40 + Math.floor(Math.random() * 60); b = 5 + Math.floor(Math.random() * 35); return { text: 'What is ' + a + ' minus ' + b + '?', answer: a - b }; }
    b = 2 + Math.floor(Math.random() * 10); a = b * (2 + Math.floor(Math.random() * 10)); return { text: 'What is ' + a + ' divided by ' + b + '?', answer: a / b };
  }
  function mathsCheck(q, t) {
    var m = t.match(/-?\d+(\.\d+)?/), n = m ? parseFloat(m[0]) : M.num(t.replace(/^(it'?s|is|the answer is) /, ''));
    if (isNaN(n)) return null;
    return Math.abs(n - q.answer) < 0.01;
  }
  function frQ() { var p = M.pick(FR); return Math.random() < 0.5 ? { text: 'What\'s the French for "' + p[1] + '"?', answer: p[0], fr: true } : { text: 'What does "' + p[0] + '" mean in English?', answer: p[1], fr: false }; }
  function frCheck(q, t) {
    var a = plain(q.answer), s = plain(t).replace(/^(it means|it is|its|is|the answer is) /, '');
    if (!s) return null;
    var core = function (x) { return x.replace(/^(le|la|les|l|the|a|an|un|une) /, '').replace(/^l/, ''); };
    return s === a || core(s) === core(a) || (s.length > 3 && a.indexOf(s) >= 0);
  }
  M.addCommand(['(math|maths|times ?table|mental math|arithmetic) (quiz|test|game|practice)', 'quiz me( on)?( math| maths)?$', 'test my maths'], function () { return runQuiz('Maths', mathsQ, mathsCheck); });
  M.addCommand(['french (quiz|test|practice|game)', 'quiz me (on|in) french', 'test my french'], function () { return runQuiz('French', frQ, frCheck); });

  /* ---------- Breathing exercise ---------- */
  var breathTimers = [];
  M.addCommand(['breath(ing|e) (exercise|with me)', 'help me (calm down|relax|breathe)', 'calm me down', 'i need to (calm down|relax)', 'breathe$'], function () {
    breathTimers.forEach(clearTimeout); breathTimers = [];
    var prev = Object.assign({}, S.lights);
    M.show('assistant'); M.setLights({ mode: 'breathe', color: '#67e8f9', brightness: 60 });
    M.say('Let\'s breathe together. Follow the light. Three slow breaths.', { noToast: true });
    var t = 3500;
    for (var i = 0; i < 3; i++) {
      [['Breathe in…', 4000, 'listening'], ['Hold…', 4000, ''], ['Breathe out…', 6000, '']].forEach(function (s) {
        breathTimers.push(setTimeout(function () { M.orb(s[2], s[0]); M.speak(s[0].replace('…', '')); }, t));
        t += s[1];
      });
    }
    breathTimers.push(setTimeout(function () { M.setLights(prev); M.say('Well done. Feel a bit calmer?'); }, t));
    return true;
  });

  /* ---------- Toothbrush timer ---------- */
  var brushTimers = [];
  M.addCommand(['brush(ing)? (my )?teeth', 'tooth ?brush(ing)? timer', 'time to brush'], function () {
    brushTimers.forEach(clearTimeout); brushTimers = [];
    M.setTimer(120, 'Brushing');
    M.setLights({ color: '#22d3ee', mode: 'solid' });
    ['Switch to the top right.', 'Now the bottom left.', 'Last part, bottom right.'].forEach(function (msg, i) {
      brushTimers.push(setTimeout(function () { M.lightsPulse(); M.say(msg, { noToast: false }); }, (i + 1) * 30000));
    });
    return M.say('Two minutes of brushing. Start with the top left. I\'ll tell you when to switch.');
  });

  /* ---------- Countdowns ---------- */
  var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  function parseDate(s) {
    s = s.toLowerCase().replace(/(\d+)(st|nd|rd|th)/g, '$1').replace(/,/g, '').trim();
    var now = new Date(); now.setHours(0, 0, 0, 0);
    if (/^today$/.test(s)) return now;
    if (/^tomorrow$/.test(s)) return new Date(now.getTime() + 864e5);
    var wd = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].findIndex(function (d) { return s.indexOf(d) >= 0; });
    if (wd >= 0) { var diff = (wd - now.getDay() + 7) % 7 || 7; return new Date(now.getTime() + diff * 864e5); }
    var mi = months.findIndex(function (m) { return s.indexOf(m) >= 0 || s.indexOf(m.slice(0, 3) + ' ') >= 0 || s.endsWith(m.slice(0, 3)); });
    var dm = s.match(/\b(\d{1,2})\b/), ym = s.match(/\b(20\d\d)\b/);
    var d = null;
    if (mi >= 0 && dm) d = new Date(ym ? +ym[1] : now.getFullYear(), mi, +dm[1]);
    else { var sl = s.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/); if (sl) d = new Date(sl[3] ? (+sl[3] < 100 ? 2000 + +sl[3] : +sl[3]) : now.getFullYear(), +sl[2] - 1, +sl[1]); }
    if (!d || isNaN(d)) return null;
    if (d < now && !ym) d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  M.parseDate = parseDate;
  function daysTo(dateStr) { var now = new Date(); now.setHours(0, 0, 0, 0); return Math.round((new Date(dateStr) - now) / 864e5); }
  function iso(d) { return d.getFullYear() + '-' + M.pad(d.getMonth() + 1) + '-' + M.pad(d.getDate()); }
  M.nextEvent = function () {
    var up = S.events.filter(function (e) { return daysTo(e.date) >= 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return up[0] || null;
  };
  M.renderEventLine = function () {
    var el = M.$('eventLine'); if (!el) return;
    var e = M.nextEvent(), w = S.water.date === todayKey() ? S.water.count : 0, parts = [];
    if (e) { var n = daysTo(e.date); parts.push(n === 0 ? e.name + ' is today!' : n + ' day' + (n > 1 ? 's' : '') + ' until ' + e.name); }
    if (w) parts.push('Water ' + w + '/8');
    el.textContent = parts.join(' · ');
  };
  M.addCommand(['^(?:my |the |our )?(.+?) is (?:on |this |next )?(.+)$', '^(?:add (?:a )?(?:countdown|event) (?:for |to )?|count down to )(.+?) on (.+)$'], function (m) {
    var name = m[1].replace(/^(my|the|our) /, '').trim(), d = parseDate(m[2]);
    if (!d || name.split(' ').length > 5 || /^(what|when|who|where|why|how|which|is|it|this|that|today|tomorrow|there|he|she|they|i|you|weather|school)\b/.test(name)) return false;
    name = name.replace(/^(\w)/, function (c) { return c.toUpperCase(); });
    S.events = S.events.filter(function (e) { return e.name.toLowerCase() !== name.toLowerCase(); });
    S.events.push({ name: name, date: iso(d) }); M.save(); M.renderEventLine();
    var n = daysTo(iso(d));
    return M.say('Got it. ' + name + ' is on ' + M.dayNames[d.getDay()] + ', ' + d.getDate() + ' ' + M.monthNames[d.getMonth()] + '. That\'s ' + n + ' day' + (n === 1 ? '' : 's') + ' away.');
  });
  M.addCommand(['how (many|long) (days )?(until|till|til|to|before) (my |the |our )(.+)$', 'when is (my |the |our )(.+)$'], function (m) {
    var q = m[m.length - 1].toLowerCase().trim();
    var e = S.events.filter(function (x) { return x.name.toLowerCase().indexOf(q) >= 0 || q.indexOf(x.name.toLowerCase()) >= 0; })[0];
    if (!e) return false;
    var n = daysTo(e.date);
    return M.say(n === 0 ? e.name + ' is today!' : n > 0 ? n + ' day' + (n > 1 ? 's' : '') + ' until ' + e.name + '.' : e.name + ' has already happened.');
  });
  M.addCommand(['(what\'?s|what is) coming up', '(upcoming|my) (events|countdowns)'], function () {
    var up = S.events.filter(function (e) { return daysTo(e.date) >= 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return M.say(up.length ? up.map(function (e) { var n = daysTo(e.date); return e.name + ' in ' + n + ' day' + (n === 1 ? '' : 's'); }).join(', ') + '.' : 'Nothing coming up. Say, for example, "my exam is on 20 October".');
  });
  M.addCommand(['(delete|remove|cancel) (the )?(countdown|event) (for )?(.+)$'], function (m) {
    var q = m[5].toLowerCase(), before = S.events.length;
    S.events = S.events.filter(function (e) { return e.name.toLowerCase().indexOf(q) < 0; }); M.save(); M.renderEventLine();
    return M.say(before !== S.events.length ? 'Removed.' : 'I couldn\'t find that countdown.');
  });

  M.addCommand(['what (day|date) is (it )?tomorrow', 'tomorrow is what day', 'what( day| date)? was (it )?yesterday'], function (m, t) {
    var d = new Date(Date.now() + (/yesterday/.test(t) ? -1 : 1) * 864e5);
    return M.say((/yesterday/.test(t) ? 'Yesterday was ' : 'Tomorrow is ') + M.dayNames[d.getDay()] + ', ' + d.getDate() + ' ' + M.monthNames[d.getMonth()] + '.');
  });

  /* ---------- Water tracker ---------- */
  function water() { if (S.water.date !== todayKey()) S.water = { date: todayKey(), count: 0 }; return S.water; }
  M.addCommand(['i (drank|had|finished) (a |another |one |my )?(glass|bottle|cup)?( of)? water', 'log (a )?water', '^water( \\+1| plus one)?$', 'add (a )?(glass of )?water'], function () {
    var w = water(); w.count++; M.save(); M.renderEventLine();
    return M.say(w.count >= 8 ? 'That\'s ' + w.count + ' glasses. Goal reached, amazing!' : 'Nice! ' + w.count + ' of 8 glasses today.');
  });
  M.addCommand(['how much water', 'how many glasses'], function () { var w = water(); return M.say('You\'ve had ' + w.count + ' of 8 glasses today.'); });
})();
