/* The command brain. Hundreds of ways to ask for things, all answered instantly on the iPad
   with no internet AI. Anything it doesn't know goes to the real AI once that's set up. */
(function () {
  var C = M.content;
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var pending = null;     // a follow-up the mirror is waiting for (riddle answer, knock-knock…)
  var lastJoke = -1, lastFact = -1;
  var timer = null;       // {end, label, id}

  /* ---------- Saying things ---------- */
  var drama = ['Behold!', 'Gasp!', 'Hear ye, hear ye.', 'The prophecy is clear.', 'Dramatic pause…'];
  M.say = function (text, opts) {
    opts = opts || {};
    if (M.settings.personality === 'dramatic' && !opts.plain) text = pick(drama) + ' ' + text;
    M.bubble('bot', text);
    if (M.current !== 'assistant' && !opts.noToast) M.toast(text, Math.min(9000, 2500 + text.length * 45));
    M.orb('', M.characterLabel ? M.characterLabel() : 'Tap AI or say "Hey Mirror"');
    if (!opts.silent) M.speak(text);
    return text;
  };

  /* ---------- Understanding numbers ---------- */
  var small = { zero: 0, a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, half: 0.5, couple: 2, few: 3 };
  M.num = function (s) {
    if (s == null) return NaN;
    s = String(s).trim().replace(/,/g, '');
    if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    var parts = s.split(/[\s-]+/), total = 0, any = false;
    for (var i = 0; i < parts.length; i++) {
      var w = parts[i]; if (w === 'and') continue;
      if (small[w] == null) return NaN;
      any = true;
      if (w === 'hundred') total = (total || 1) * 100; else total += small[w];
    }
    return any ? total : NaN;
  };
  var NUM = '(-?\\d+(?:\\.\\d+)?|(?:(?:zero|an?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|half|couple|few)(?:[\\s-]+(?:and[\\s-]+)?(?:one|two|three|four|five|six|seven|eight|nine|hundred))?))';

  /* ---------- Cleaning up what was said ---------- */
  M.clean = function (raw) {
    var t = ' ' + String(raw).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9%.:'\s+\-*\/×÷]/g, ' ').replace(/\s+/g, ' ') + ' ';
    M.config.wakeWords.forEach(function (w) { t = t.split(' ' + w + ' ').join(' '); });
    t = t.replace(/ (please|pls|plz|kindly|for me) /g, ' ');
    t = t.replace(/^ (hey|hi|ok|okay|so|um|uh)( |$)/, ' ').replace(/^ mirror (?!mode|mirror)/, ' ');
    t = t.replace(/^ (can|could|would|will) you /, ' ').replace(/^ (i want you to|i'd like you to|i need you to) /, ' ');
    return t.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  };

  /* ---------- Helpers ---------- */
  function weatherReady() { if (!M.weather) { M.say('I\'m still getting the weather. Ask me again in a moment.'); return false; } return true; }
  function weatherLine() {
    var w = M.weather, info = M.wmo(w.code, w.isDay), r = M.nextRain();
    return 'It\'s ' + w.temp + ' degrees and ' + info.text.toLowerCase() + '. ' + (r ? 'Rain is likely around ' + M.fmtTime(r.time) + '.' : 'No rain expected today.') + (M.weatherIsSample ? ' (That\'s sample weather until the mirror is online.)' : '');
  }
  function listClasses(list) {
    if (!list.length) return 'no classes';
    return list.filter(function (c) { return !/^break|lunch$/i.test(c[1]); }).map(function (c) { return c[1] + ' at ' + M.fmt12(c[0]); }).join(', ');
  }
  var dayWords = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  function dayFrom(t) {
    if (/\btomorrow\b/.test(t)) return (new Date().getDay() + 1) % 7;
    if (/\byesterday\b/.test(t)) return (new Date().getDay() + 6) % 7;
    for (var k in dayWords) if (t.indexOf(k) >= 0) return dayWords[k];
    return new Date().getDay();
  }
  function dayLabel(i) { var today = new Date().getDay(); return i === today ? 'today' : i === (today + 1) % 7 ? 'tomorrow' : 'on ' + M.dayNames[i]; }
  function summary() {
    var s = M.schoolStatus(), parts = [];
    var h = new Date().getHours();
    parts.push((h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + (M.settings.name ? ', ' + M.settings.name : '') + '.');
    var today = M.classesOn(new Date().getDay());
    if (today.length && s.kind === 'before') parts.push('Your first class is ' + today[0][1] + ' at ' + M.fmt12(today[0][0]) + '.');
    else if (s.kind === 'gap') parts.push('Next up is ' + s.next[1] + ' at ' + M.fmt12(s.next[0]) + '.');
    else if (s.kind === 'during' || s.kind === 'last') parts.push('You have ' + s.current[1] + ' right now.');
    else if (s.kind === 'after') parts.push('You\'re done for today.');
    else if (s.kind === 'free') parts.push('No classes today.');
    if (M.weather) { var r = M.nextRain(); parts.push('It\'s ' + M.weather.temp + ' degrees' + (r ? ' and it might rain around ' + M.fmtTime(r.time) + ', so take an umbrella.' : ' with no rain expected.')); }
    var rem = M.settings.reminders;
    if (rem.length) parts.push('Reminder' + (rem.length > 1 ? 's' : '') + ': ' + rem.slice(0, 3).map(function (x) { return x.text; }).join(', ') + '.');
    return parts.join(' ');
  }
  M.summary = summary;

  function setTimer(seconds, label) {
    if (timer) clearInterval(timer.id);
    var end = Date.now() + seconds * 1000, chip = M.$('timerChip');
    chip.hidden = false;
    timer = { end: end, label: label || '', id: setInterval(function () {
      var left = Math.max(0, Math.round((end - Date.now()) / 1000));
      chip.textContent = (label ? label + ' · ' : '⏱ ') + Math.floor(left / 60) + ':' + M.pad(left % 60);
      if (left <= 0) {
        clearInterval(timer.id); chip.hidden = true;
        var msg = label ? 'Reminder: ' + label + '!' : 'Time\'s up!';
        timer = null; M.lightsPulse(); M.say(msg);
      }
    }, 250) };
  }
  function durationFrom(t) {
    var m, total = 0, found = false;
    var re = new RegExp(NUM + '\\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)', 'g');
    while ((m = re.exec(t))) {
      var n = M.num(m[1]); if (isNaN(n)) continue;
      found = true;
      total += /^h/.test(m[2]) ? n * 3600 : /^m/.test(m[2]) ? n * 60 : n;
    }
    if (/half an hour/.test(t)) { total += 1800; found = true; }
    return found ? Math.round(total) : null;
  }
  function durWords(s) {
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60, out = [];
    if (h) out.push(h + ' hour' + (h > 1 ? 's' : ''));
    if (m) out.push(m + ' minute' + (m > 1 ? 's' : ''));
    if (sec && !h) out.push(sec + ' second' + (sec > 1 ? 's' : ''));
    return out.join(' and ') || '0 seconds';
  }
  function findColor(t) {
    var names = Object.keys(M.colors).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < names.length; i++) if (new RegExp('\\b' + names[i] + '\\b').test(t)) return names[i];
    if (/\bgr[ae]y\b/.test(t)) return 'cool white';
    return null;
  }
  var themes = ['dream', 'minimal', 'cyberpunk', 'retro', 'space', 'sunset'];
  function firstNum(m) { for (var i = m.length - 1; i > 0; i--) { var n = M.num(m[i]); if (!isNaN(n)) return n; } return NaN; }
  function round(n) { return Math.round(n * 100) / 100; }

  /* ---------- The commands ---------- */
  // Each entry: [list of patterns, what to do]. First match wins, so specific ones come first.
  var R = [];
  function add(patterns, fn) { R.push([patterns.map(function (p) { return typeof p === 'string' ? new RegExp(p) : p; }), fn]); }
  var FIRST = [];
  M.addCommand = function (patterns, fn) { FIRST.push([patterns.map(function (p) { return typeof p === 'string' ? new RegExp(p) : p; }), fn]); };
  M.expect = function (handler) { pending = { kind: 'custom', handler: handler }; };
  M.pick = pick; M.cap = cap; M.durWords = function (s) { return durWords(s); }; M.setTimer = function (s, l) { setTimer(s, l); }; M.weatherLine = function () { return weatherLine(); };

  /* --- Follow-ups and cancel --- */
  add(['^(cancel|never ?mind|stop listening|forget it|nothing)$'], function () { pending = null; M.cancelListening(); return M.say('Okay.', { silent: true }); });
  add(['^(stop|shut up|be quiet|quiet|stop talking|silence|hush)$'], function () { if (window.speechSynthesis) speechSynthesis.cancel(); if (M.isPlaying()) M.musicPause(); M.orb('', 'Okay'); return true; });

  /* --- Wake / sleep --- */
  add(['^(wake up|wakey wakey|wake|turn on( the)? screen|screen on|i\'m back|im back)$'], function () { M.wake(); return M.say('I\'m awake. ' + summary()); });
  add(['^(go to sleep|sleep|sleep mode|turn off( the)? screen|screen off|goodbye mirror|night mode)$'], function () { M.say('Going to sleep. Say wake up when you need me.'); setTimeout(M.sleep, 2500); return true; });

  /* --- Secret mode --- */
  add(['(access granted|secret mode|hidden mode|easter egg|open sesame|activate secret|enter the matrix|developer mode)'], function (m, t) {
    if (/exit|leave|close|end|stop/.test(t)) { M.show('home'); return M.say('Leaving secret mode. Nobody saw anything.'); }
    M.show('secret'); M.setLights({ color: '#4ade80', mode: 'solid' }); return M.say('Access granted. Welcome to hidden mode.');
  });
  add(['^(exit|leave|close) (secret|hidden)( mode)?$'], function () { M.show('home'); return M.say('Leaving secret mode. Nobody saw anything.'); });
  add(['run diagnostics', 'system (check|status)', 'are you (working|ok|okay|online)', 'diagnostics'], function () {
    var lines = Object.keys(M.statuses).map(function (k) { return M.statuses[k].text; });
    return M.say('Diagnostics: ' + (lines.join('. ') || 'all systems quiet') + '.');
  });
  add(['^be (dramatic|extra|theatrical)$', 'dramatic mode'], function () { M.settings.personality = 'dramatic'; M.save(); return M.say('From now on, everything I say will be magnificent.', { plain: true }); });
  add(['^be (normal|chill|calm|boring)$', 'normal mode', 'stop being dramatic'], function () { M.settings.personality = 'normal'; M.save(); return M.say('Back to normal.', { plain: true }); });

  /* --- Help --- */
  add(['what can you do', '^help$', '^help me$', 'what (commands|can i say|do you do)', 'how do (i|you) (use|work)', 'show (me )?commands', 'what are your (features|skills)'], function () {
    return M.say('I can tell you the time, weather and your timetable, set timers and reminders, change the lights and theme, play music, tell jokes, facts and riddles, do maths, flip coins and more. Try: what\'s next, lights pink, remind me to pack my bag, or tell me a joke.');
  });

  /* --- Time and date --- */
  add(['what( i|\')?s the time', 'what time is it', '^time$', 'tell me the time', '^what time$', 'current time', 'got the time'], function () { return M.say('It\'s ' + M.fmtTime(new Date()) + (new Date().getHours() < 12 ? ' in the morning.' : new Date().getHours() < 17 ? ' in the afternoon.' : ' in the evening.')); });
  add(['what( i|\')?s (the |today\'?s )?date', 'what date is it', 'today\'?s date', '^date$'], function () { var d = new Date(); return M.say('It\'s ' + M.dayNames[d.getDay()] + ', ' + d.getDate() + ' ' + M.monthNames[d.getMonth()] + ' ' + d.getFullYear() + '.'); });
  add(['what day is (it|today)', 'what( i|\')?s (the )?day( today)?', 'which day is it', '^day$'], function () { return M.say('It\'s ' + M.dayNames[new Date().getDay()] + '.'); });
  add(['what (month|year) is it', 'which (month|year)', 'what( i|\')?s the (month|year)'], function (m, t) { var d = new Date(); return M.say(/month/.test(t) ? 'It\'s ' + M.monthNames[d.getMonth()] + '.' : 'It\'s ' + d.getFullYear() + '.'); });
  add(['is it (the )?weekend', 'is (it|today) a (school|week) ?day'], function () { var d = new Date().getDay(); return M.say(d === 0 || d === 6 ? 'Yes, it\'s the weekend!' : 'Nope, it\'s ' + M.dayNames[d] + '. ' + (5 - d) + ' more day' + (5 - d === 1 ? '' : 's') + ' until the weekend.'); });
  add(['how (many|long) (days )?(until|till|til|to|before) (the )?(weekend|saturday|sunday|monday|tuesday|wednesday|thursday|friday|christmas|new year|new years|holidays?)'], function (m, t) {
    var now = new Date(), target;
    var d = /weekend/.test(t) ? 6 : dayWords[(t.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/) || [])[1]];
    if (d != null) { var diff = (d - now.getDay() + 7) % 7; return M.say(diff === 0 ? 'That\'s today!' : diff + ' day' + (diff > 1 ? 's' : '') + ' to go.'); }
    if (/christmas/.test(t)) target = new Date(now.getFullYear(), 11, 25);
    else if (/new year/.test(t)) target = new Date(now.getFullYear() + 1, 0, 1);
    if (!target) return M.say('I don\'t know when that is yet.');
    if (target < now) target.setFullYear(target.getFullYear() + 1);
    var days = Math.ceil((target - now) / 864e5);
    return M.say(days + ' days to go!');
  });

  /* --- Morning / night routines and greetings --- */
  add(['^good ?morning', 'morning mirror', '^morning$', 'start my day', 'what( i|\')?s (my day|happening today|on today|the plan)', 'what( i|\')?s my day (like|look like)', 'brief me', 'daily (briefing|summary)', 'what do i have today$', 'summary'], function (m, t) {
    if (/morning|start my day/.test(t)) M.setLights({ mode: 'sunrise' });
    M.show('home');
    return M.say(summary());
  });
  add(['^good ?night', 'night night', 'i\'?m going to (bed|sleep)', 'bed ?time', 'sweet dreams'], function () {
    M.setLights({ mode: 'calm', brightness: 15 });
    M.say(pick(['Good night' + (M.settings.name ? ', ' + M.settings.name : '') + '. Sleep well.', 'Sweet dreams. I\'ll dim the lights.', 'Night night. See you tomorrow.']));
    setTimeout(function () { M.setLights({ on: false }); M.sleep(); }, 6000); return true;
  });
  add(['^good (afternoon|evening)'], function (m) { return M.say('Good ' + m[1] + (M.settings.name ? ', ' + M.settings.name : '') + '! ' + pick(['How was your day?', 'What can I do for you?', 'Need anything?'])); });
  add(['^(hello|hi|hey|hiya|yo|sup|what\'?s up|wassup|heya|howdy|namaste)( there| mirror)?$'], function () { return M.say(pick(['Hi' + (M.settings.name ? ' ' + M.settings.name : '') + '! What can I do for you?', 'Hello! Looking good today.', 'Hey! Need anything?', 'Hi there. Ask me anything.'])); });
  add(['how are you', 'how( a|\')?re you doing', 'how\'?s it going', 'how do you feel', 'are you ok(ay)?$'], function () { return M.say(pick(['I\'m great, thanks for asking! My lights are shining.', 'Feeling reflective, as always.', 'All systems happy. How are you?', 'Brilliant. How about you?'])); });
  add(['^(i\'?m|i am) (good|great|fine|ok|okay|happy|awesome|excellent)'], function () { return M.say(pick(['Love to hear it!', 'Yay! Let\'s keep it that way.', 'Great! Want some music to match?'])); });
  add(['^(thanks|thank you|thank u|thx|ty|cheers)'], function () { return M.say(pick(['You\'re welcome!', 'Anytime.', 'Happy to help!', 'No problem.'])); });
  add(['^(bye|goodbye|see you|see ya|later|cya|i\'?m leaving|gotta go)'], function () { return M.say(pick(['Bye! Have a great day.', 'See you later!', 'Good luck out there!'])); });
  add(['^sorry', 'my bad'], function () { return M.say('No worries at all.'); });
  add(['i love you', 'love you', 'you\'?re my (best )?friend'], function () { return M.say(pick(['Aww. I think you\'re great too. Don\'t forget your real friends, though.', 'That\'s sweet! I\'m glad I\'m useful.'])); });
  add(['you\'?re (so )?(funny|smart|clever|awesome|amazing|cool|the best|great|beautiful|pretty)', 'good job', 'well done', 'nice one'], function () { return M.say(pick(['Thanks! I learned it from you.', 'You\'re making my LEDs blush.', 'Right back at you.'])); });
  add(['you\'?re (dumb|stupid|useless|bad|annoying|boring)', 'i hate you'], function () { return M.say(pick(['Ouch. I\'m still learning. Tell me what I got wrong and I\'ll try to do better.', 'Fair. I\'ll keep improving.'])); });

  /* --- About the mirror --- */
  add(['who are you', 'what are you', 'introduce yourself', 'tell me about yourself'], function () { return M.say('I\'m your smart mirror. An iPad, a mirror film, an ESP32 and a lot of LEDs, built by you on a ₹2,000 budget.'); });
  add(['what( i|\')?s your name', 'do you have a name'], function () { return M.say('I\'m ' + M.config.mirrorName + '. You can give me a better name in the code later.'); });
  add(['who (made|built|created|designed) you', 'where (do|did) you come from'], function () { return M.say('You did! I\'m your Tech and Design project.'); });
  add(['how old are you', 'when were you (born|made)'], function () { return M.say('I was born in October 2026, so I\'m very new.'); });
  add(['are you (real|alive|human|a robot|an ai|ai|conscious)', 'do you have feelings'], function () { return M.say('I\'m a computer program. I don\'t have feelings, but I\'m very good at telling the time.'); });
  add(['how do you work', 'how does (this|the mirror) work'], function () { return M.say('An iPad shines through mirror film from behind. Bright text shows through, and black stays a mirror. A little ESP32 board runs the lights and touch spots, and we talk over Wi-Fi.'); });
  add(['mirror,? mirror,? on the wall', 'who( i|\')?s the (fairest|prettiest|most beautiful|coolest|best)'], function () { return M.say(pick(['You are, obviously.', 'Look into me and find out. Spoiler: it\'s you.'])); });

  /* --- Name --- */
  add(['^(call me|my name is|i\'?m called|you can call me) (.+)$'], function (m) { var n = cap(m[2].replace(/^the /, '').trim().split(' ').slice(0, 3).join(' ')); M.settings.name = n; M.save(); M.tickClock(); return M.say('Nice to meet you, ' + n + '!'); });
  add(['what( i|\')?s my name', 'who am i', 'do you know (me|my name)'], function () { return M.say(M.settings.name ? 'You\'re ' + M.settings.name + '.' : 'I don\'t know yet. Say "call me" and your name.'); });

  /* --- Weather --- */
  add(['(weather|forecast).*(tomorrow)', 'tomorrow.*(weather|rain|hot|cold|temperature)', 'will it rain tomorrow'], function () {
    if (!weatherReady()) return true; var t = M.weather.tomorrow;
    return M.say('Tomorrow: ' + M.wmo(t.code, 1).text.toLowerCase() + ', high of ' + t.max + ' and low of ' + t.min + ', with a ' + t.rain + ' percent chance of rain.');
  });
  add(['(umbrella|raincoat)', 'will it rain', 'is it (going to|gonna) rain', 'is it raining', 'any rain', 'rain (today|later)', 'should i take (a|an) (umbrella|jacket)'], function () {
    if (!weatherReady()) return true; var r = M.nextRain();
    return M.say(r ? 'Yes, take an umbrella. Rain is likely around ' + M.fmtTime(r.time) + '.' : 'No umbrella needed. No rain expected today.');
  });
  add(['(do i need|should i wear|should i take) (a )?(jacket|sweater|hoodie|coat|jumper)', 'is it (cold|chilly|freezing)'], function () {
    if (!weatherReady()) return true; var w = M.weather;
    return M.say(w.feels < 18 ? 'Yes, it feels like ' + w.feels + ' degrees. Grab a jacket.' : w.feels < 23 ? 'Maybe a light layer. It feels like ' + w.feels + '.' : 'No jacket needed. It feels like ' + w.feels + ' degrees.');
  });
  add(['is it (hot|warm|sunny|nice)( outside| out)?', 'how hot', 'should i wear (shorts|sunscreen|sunglasses)'], function () {
    if (!weatherReady()) return true; var w = M.weather;
    return M.say(w.feels >= 32 ? 'It\'s hot! Feels like ' + w.feels + '. Drink lots of water.' : w.feels >= 26 ? 'It\'s warm, feels like ' + w.feels + ' degrees.' : 'Not really. It feels like ' + w.feels + '.');
  });
  add(['(what( i|\')?s the )?temperature', 'how (hot|cold|warm) is it', 'how many degrees'], function () { if (!weatherReady()) return true; return M.say('It\'s ' + M.weather.temp + ' degrees, and feels like ' + M.weather.feels + '.'); });
  add(['sunrise', 'sunset', 'when (does|will) the sun (rise|set|come up|go down)'], function (m, t) { if (!weatherReady()) return true; var d = M.weather.today; return M.say(/set|down/.test(t) ? 'Sunset is at ' + M.fmt12(d.sunset) + '.' : 'Sunrise is at ' + M.fmt12(d.sunrise) + '.'); });
  add(['humid(ity)?', 'how humid'], function () { if (!weatherReady()) return true; return M.say('Humidity is ' + M.weather.humidity + ' percent.'); });
  add(['\\bwindy?\\b', 'how windy'], function () { if (!weatherReady()) return true; return M.say('Wind is about ' + M.weather.wind + ' kilometres an hour.'); });
  add(['high (and|&) low', 'highs? (today|for today)', 'max(imum)? temp'], function () { if (!weatherReady()) return true; return M.say('Today\'s high is ' + M.weather.today.max + ' and the low is ' + M.weather.today.min + '.'); });
  add(['(show|open|go to)( the)? weather', 'weather (screen|page)'], function () { M.show('weather'); if (!weatherReady()) return true; return M.say(weatherLine()); });
  add(['^(?!.*\\b(match|mode|lights?)\\b).*\\bweather\\b', 'how( i|\')?s it (outside|out there)', 'what( i|\')?s it like outside', 'what( i|\')?s the forecast', 'forecast'], function () { if (!weatherReady()) return true; M.show('weather'); return M.say(weatherLine()); });

  /* --- School timetable --- */
  add(['(show|open|go to)( my| the)? (timetable|schedule|classes)', '^(timetable|schedule)$'], function () { M.show('schedule'); return M.say('Here\'s your timetable.' + (M.settings.timetableIsSample ? ' It\'s empty for now. Add your classes in Settings.' : '')); });
  add(['what( i|\')?s next', 'next (class|lesson|period|subject)', 'what (class|lesson|subject|period) (do i have |is )?next', 'what do i have next', 'what( i|\')?s my next'], function () {
    var s = M.schoolStatus();
    if (s.kind === 'before' || s.kind === 'gap') return M.say('Next is ' + s.next[1] + ' at ' + M.fmt12(s.next[0]) + ', in ' + M.inMins(s.mins) + '.');
    if (s.kind === 'during') return M.say('You\'re in ' + s.current[1] + ' until ' + M.fmt12(s.current[2]) + '. After that, ' + s.next[1] + ' at ' + M.fmt12(s.next[0]) + '.');
    if (s.kind === 'last') return M.say(s.current[1] + ' is your last one today. It ends at ' + M.fmt12(s.current[2]) + '.');
    if (s.kind === 'after') { var tl = M.classesOn((new Date().getDay() + 1) % 7); return M.say('You\'re done for today. ' + (tl.length ? 'Tomorrow you have ' + listClasses(tl) + '.' : 'No classes tomorrow.')); }
    return M.say('No classes today. Enjoy!');
  });
  add(['what (class|lesson|subject|period) (is it|am i in|is now)', 'what( i|\')?s (on )?now', 'current (class|lesson|period)'], function () { var s = M.schoolStatus(); return M.say(s.current ? 'Right now it\'s ' + s.current[1] + ', until ' + M.fmt12(s.current[2]) + '.' : 'Nothing right now. ' + s.text + '.'); });
  add(['when does school (start|begin)', 'what time (does|is) school( start)?', 'first (class|lesson|period)'], function (m, t) { var d = dayFrom(t), l = M.classesOn(d); return M.say(l.length ? 'Your first class ' + dayLabel(d) + ' is ' + l[0][1] + ' at ' + M.fmt12(l[0][0]) + '.' : 'No classes ' + dayLabel(d) + '.'); });
  add(['when does school (end|finish|get out)', 'when (is|am i) (school )?(over|done|free)', 'what time (do i|does school) (finish|end)'], function (m, t) { var d = dayFrom(t), l = M.classesOn(d); return M.say(l.length ? 'Your last class ' + dayLabel(d) + ' is ' + l[l.length - 1][1] + ', finishing at ' + M.fmt12(l[l.length - 1][2]) + '.' : 'No classes ' + dayLabel(d) + '.'); });
  add(['what (do i have|classes|lessons|is on|( i|\')?s on|( i|\')?s my timetable|( i|\')?s my schedule)( for)? (tomorrow|on \\w+day|\\w+day)', 'what( i|\')?s on (tomorrow|\\w+day)', '(tomorrow|\\w+day)\'?s? (timetable|schedule|classes)', 'what about (tomorrow|\\w+day)'], function (m, t) {
    var d = dayFrom(t), l = M.classesOn(d);
    return M.say(l.length ? cap(dayLabel(d)) + ' you have ' + listClasses(l) + '.' : 'No classes ' + dayLabel(d) + '.');
  });
  add(['what (do i have|classes|lessons)( do i have)? today', 'today\'?s (timetable|schedule|classes)', 'my (timetable|schedule|classes)( today)?'], function () { var l = M.classesOn(new Date().getDay()); return M.say(l.length ? 'Today you have ' + listClasses(l) + '.' : 'No classes today.'); });
  add(['do i have (.+?) (today|tomorrow|on \\w+day|\\w+day)$', 'is there (.+?) (today|tomorrow|on \\w+day|\\w+day)$', '^do i have (?!(?:any )?reminders)(.+)$'], function (m, t) {
    var subj = m[1].replace(/^(a |an |any )/, '').replace(/ class| lesson| period/, '').trim(), d = dayFrom(t);
    var hit = M.classesOn(d).filter(function (c) { return c[1].toLowerCase().indexOf(subj) >= 0 || subj.indexOf(c[1].toLowerCase()) >= 0; })[0];
    return M.say(hit ? 'Yes, ' + hit[1] + ' at ' + M.fmt12(hit[0]) + ' ' + dayLabel(d) + '.' : 'No ' + subj + ' ' + dayLabel(d) + '.');
  });
  add(['when (is|does|do i have) (my )?(.+?)( class| lesson| tuition)?( start| begin| end| finish)?( today| tomorrow| on \\w+day)?$', 'what time is (my )?(.+?)( today| tomorrow| on \\w+day)?$'], function (m, t) {
    var q = (m[3] || m[2] || '').replace(/^(my|the) /, '').replace(/ (class|lesson|start|begin|end|finish|today|tomorrow)$/g, '').trim(), d = dayFrom(t);
    if (!q || /^(it|school|that)$/.test(q)) return false;
    var hit = M.classesOn(d).filter(function (c) { var lc = c[1].toLowerCase(); return lc.indexOf(q) >= 0 || q.indexOf(lc.split(' ')[0]) >= 0; })[0];
    if (!hit) return false;
    return M.say(hit[1] + ' ' + dayLabel(d) + ' is from ' + M.fmt12(hit[0]) + ' to ' + M.fmt12(hit[2]) + '.');
  });
  add(['how many (classes|lessons|periods)'], function (m, t) { var d = dayFrom(t), n = M.classesOn(d).filter(function (c) { return !/^break|lunch$/i.test(c[1]); }).length; return M.say('You have ' + n + ' class' + (n === 1 ? '' : 'es') + ' ' + dayLabel(d) + '.'); });

  /* --- Reminders --- */
  add(['remind me (in|after) (.+?) to (.+)$', 'remind me to (.+?) in (.+)$'], function (m, t) {
    var a = /remind me (in|after)/.test(t), when = a ? m[2] : m[2], what = a ? m[3] : m[1];
    var secs = durationFrom(' ' + (a ? m[2] : m[2]) + ' ');
    if (!secs) return false;
    setTimer(secs, cap(what)); return M.say('Okay, I\'ll remind you to ' + what + ' in ' + durWords(secs) + '.');
  });
  add(['^(remind me to|remind me|add (a )?reminder( to)?|new reminder( to)?|don\'?t let me forget( to)?|note to self:?|remember to) (.+)$', '^add (.+) to (my )?(reminders|reminder list|list)$'], function (m, t) {
    var text = (t.match(/^add (.+) to (my )?(reminders|reminder list|list)$/) || [])[1] || m[m.length - 1];
    text = cap(text.replace(/^to /, '').trim());
    M.settings.reminders.unshift({ text: text }); M.save(); M.renderReminders();
    return M.say('Added: ' + text + '.');
  });
  add(['(clear|delete|remove|erase) (all )?(my )?reminders', 'reset reminders'], function () { M.settings.reminders = []; M.save(); M.renderReminders(); return M.say('All reminders cleared.'); });
  add(['(what are|read|show|list|tell me)( me)? my reminders', '^reminders$', 'do i have (any )?reminders', 'what (do i|did i) need to remember', 'my reminders'], function () {
    var r = M.settings.reminders; M.show('home');
    return M.say(r.length ? 'You have ' + r.length + ' reminder' + (r.length > 1 ? 's' : '') + ': ' + r.map(function (x) { return x.text; }).join('. ') + '.' : 'You have no reminders.');
  });
  add(['(delete|remove|done with|finished|complete|tick off|cross off) (reminder )?(number )?' + NUM + '$'], function (m) {
    var i = M.num(m[m.length - 1]) - 1, r = M.settings.reminders;
    if (isNaN(i) || i < 0 || i >= r.length) return M.say('I couldn\'t find that reminder number.');
    var gone = r.splice(i, 1)[0]; M.save(); M.renderReminders(); return M.say('Removed: ' + gone.text + '.');
  });
  add(['(i\'?ve|i have) (done|finished|packed|brought|completed) (.+)$', '(delete|remove) (the )?reminder (about |for |to )?(.+)$'], function (m) {
    var q = m[m.length - 1].replace(/^(my|the) /, ''), r = M.settings.reminders;
    var i = r.findIndex(function (x) { var lx = x.text.toLowerCase(); return lx.indexOf(q) >= 0 || q.split(' ').some(function (w) { return w.length > 3 && lx.indexOf(w) >= 0; }); });
    if (i < 0) return M.say('Nice! I didn\'t have that as a reminder, though.');
    var gone = r.splice(i, 1)[0]; M.save(); M.renderReminders(); return M.say('Great job! Crossed off: ' + gone.text + '.');
  });

  /* --- Timers --- */
  add(['(cancel|stop|delete|end|clear) (the |my )?timer', 'never ?mind the timer'], function () { if (!timer) return M.say('There\'s no timer running.'); clearInterval(timer.id); timer = null; M.$('timerChip').hidden = true; return M.say('Timer cancelled.'); });
  add(['how (long|much time)( is)? (left|remaining)', 'time left', 'how\'?s my timer', 'timer status'], function () { if (!timer) return M.say('There\'s no timer running.'); return M.say(durWords(Math.max(0, Math.round((timer.end - Date.now()) / 1000))) + ' left.'); });
  add(['(study|homework|focus|pomodoro) (timer|session|mode)', 'help me (focus|study)'], function () { setTimer(25 * 60, 'Focus'); M.setLights({ color: '#e6f0ff', mode: 'solid', brightness: 50 }); return M.say('Focus mode: 25 minutes, starting now. You\'ve got this.'); });
  add(['(take a|break) (break|time)', 'break timer'], function () { setTimer(5 * 60, 'Break'); return M.say('Enjoy a 5 minute break.'); });
  add(['timer', 'countdown', 'count down', 'set an? alarm (for|in)', 'wake me (up )?in'], function (m, t) {
    var secs = durationFrom(' ' + t + ' ');
    if (!secs) return M.say('For how long? Try: set a timer for 5 minutes.');
    setTimer(secs, ''); return M.say('Timer set for ' + durWords(secs) + '.');
  });
  add(['^' + NUM + ' ?(minutes?|mins?|seconds?|secs?|hours?)$'], function (m, t) { var secs = durationFrom(' ' + t + ' '); if (!secs) return false; setTimer(secs, ''); return M.say('Timer set for ' + durWords(secs) + '.'); });

  /* --- Music --- */
  add(['what (song|music) is (this|playing)', 'what( i|\')?s (this song|playing)', 'name (of )?(this|the) song', 'now playing'], function () { var n = M.nowPlaying(); return M.say(n && M.isPlaying() ? 'This is ' + n + '.' : 'Nothing is playing right now.'); });
  add(['(next|skip)( song| track| this)?$', 'skip (it|song|track)', 'play (the )?next', 'change (the )?song', 'different song', 'another song'], function () { M.musicNext(); M.show('music'); return true; });
  add(['(previous|last|go back a|back a) (song|track)', 'play (that|the) (song|one) again', 'replay', 'play (the )?previous'], function () { M.musicPrev(); M.show('music'); return true; });
  add(['(pause|stop|turn off)( the)? (music|song|playing|track)', '^pause$', 'pause it', 'stop the music'], function () { M.musicPause(); return M.say('Paused.', { silent: true }); });
  add(['(resume|continue|unpause|keep playing)', '(play|put on|start)( some| the| a| my)? (music|song|songs|tunes|playlist|beats|track)', '^play$', 'music time', 'i want (some )?music', 'drop (a|the) beat'], function () {
    M.show('music'); if (M.musicPlay()) { M.setLights({ mode: 'music' }); return true; } return true;
  });
  add(['(turn( it)? up|volume up|louder|increase (the )?volume|raise (the )?volume|crank it)'], function () { return M.say('Volume ' + M.musicVolume(0.15) + ' percent.', { silent: M.isPlaying() }); });
  add(['(turn( it)? down|volume down|quieter|softer|lower (the )?volume|decrease (the )?volume|too loud)'], function () { return M.say('Volume ' + M.musicVolume(-0.15) + ' percent.', { silent: M.isPlaying() }); });
  add(['(set )?volume (to )?' + NUM + '( percent|%)?$'], function (m) { var n = firstNum(m); if (isNaN(n)) return false; return M.say('Volume ' + M.musicVolume(0, n / 100) + ' percent.', { silent: M.isPlaying() }); });
  add(['^(mute|unmute)'], function (m) { M.musicVolume(0, m[1] === 'mute' ? 0 : 0.7); return M.say(m[1] === 'mute' ? 'Muted.' : 'Unmuted.', { silent: m[1] === 'mute' }); });
  add(['(show|open|go to)( the)? (music|player)'], function () { M.show('music'); return true; });
  add(['sing( me)?( a)?( song)?', 'can you sing'], function () { return M.say('I can\'t sing, but I can play music. Say "play music".'); });
  add(['^dance', 'let\'?s dance', 'dance party', 'disco'], function () { M.setLights({ mode: 'party' }); if (M.playlist.length) { M.musicPlay(); M.show('music'); } return M.say('Party mode activated!'); });

  /* --- Lights --- */
  add(['(lights?|leds?|strip|glow|frame) (off|out)', 'turn off( the)? (lights?|leds?|glow)', 'switch off( the)? lights?', 'no lights'], function () { M.setLights({ on: false }); return M.say('Lights off.'); });
  add(['(lights?|leds?|glow) on$', 'turn on( the)? (lights?|leds?|glow)', 'switch on( the)? lights?'], function () { M.setLights({ on: true, mode: M.settings.lights.mode === 'off' ? 'solid' : M.settings.lights.mode }); return M.say('Lights on.'); });
  add(['(brighter|more light|brighten|turn up( the)? lights?|lights? up|more bright)'], function () { var b = Math.min(100, M.settings.lights.brightness + 20); M.setLights({ brightness: b, on: true }); return M.say('Brightness ' + b + ' percent.'); });
  add(['(dimmer|dim( the)? lights?|less (light|bright)|turn down( the)? lights?|lights? down|too bright)'], function () { var b = Math.max(5, M.settings.lights.brightness - 20); M.setLights({ brightness: b }); return M.say('Brightness ' + b + ' percent.'); });
  add(['brightness (to )?' + NUM, '(lights?|leds?) (to )?' + NUM + ' ?(percent|%)'], function (m) { var n = firstNum(m); if (isNaN(n)) return false; n = Math.max(5, Math.min(100, Math.round(n))); M.setLights({ brightness: n, on: true }); return M.say('Brightness ' + n + ' percent.'); });
  add(['rainbow'], function () { M.setLights({ mode: 'rainbow' }); return M.say('Rainbow mode!'); });
  add(['party( mode)?', 'party time', 'let\'?s party', 'go crazy'], function () { M.setLights({ mode: 'party' }); return M.say('Party mode!'); });
  add(['sunrise( mode)?', 'wake( up)? light'], function () { M.setLights({ mode: 'sunrise', color: '#ffb36b' }); return M.say('Sunrise lights.'); });
  add(['(calm|chill|relax(ing)?|cosy|cozy|zen)( mode| lights| vibes)?', 'make it cos[yz]', 'i( want to|\'?m trying to) relax'], function () { M.setLights({ mode: 'calm', color: '#ffb36b', brightness: 30 }); return M.say('Cosy mode. Warm and dim.'); });
  add(['rain(y)? (mode|lights)', 'match the weather', 'weather (lights|mode)'], function () {
    if (M.weather) { var info = M.wmo(M.weather.code, M.weather.isDay); M.setLights({ mode: info.storm ? 'storm' : info.rainy ? 'rainy' : 'solid', color: info.rainy ? '#2f6bff' : info.icon === 'sun' ? '#ffd27a' : '#cfd8ff' }); }
    return M.say('Lights now match the weather.');
  });
  add(['music (mode|lights)', 'lights? (to|with) (the )?(music|beat)', 'beat mode'], function () { M.setLights({ mode: 'music' }); return M.say('Lights will pulse with the music.'); });
  add(['random colou?r', 'surprise me', 'any colou?r', 'pick a colou?r'], function () { var k = pick(Object.keys(M.colors)); M.setLights({ color: M.colors[k], mode: 'solid' }); return M.say('How about ' + k + '?'); });
  add(['(next|change|another|different|switch)( the)? (light )?colou?r', 'cycle colou?rs?'], function () { M.cycleColor(); return true; });
  add(['(lights?|leds?|colou?r|glow|make it|turn( it)?|change( it)?( to)?|set( it)? to|go|frame)\\b'], function (m, t) {
    var c = findColor(t); if (!c) return false;
    M.setLights({ color: M.colors[c], mode: 'solid', on: true }); return M.say(cap(c) + ' lights.', { silent: false });
  });
  add(['^(\\w+(?: \\w+)?)$'], function (m, t) { var c = findColor(t); if (!c || c !== t) return false; M.setLights({ color: M.colors[c], mode: 'solid', on: true }); return M.say(cap(c) + ' lights.'); });

  /* --- Screens --- */
  add(['(go |back )?(home|main screen|home screen)$', 'go back', '^back$', 'show (the )?(clock|home)'], function () { M.show('home'); return true; });
  add(['next (screen|page)', 'swipe( left)?', '^next$'], function () { M.nextScreen(1); return true; });
  add(['previous (screen|page)', 'swipe right', 'last screen'], function () { M.nextScreen(-1); return true; });
  add(['(open|show|go to)( the)? (settings|options|setup)', '^settings$'], function () { M.show('settings'); return true; });
  add(['(show|open)( the)? (assistant|chat|ai)'], function () { M.show('assistant'); return true; });

  /* --- Themes and display --- */
  add(['\\b(theme|style)\\b'], function (m, t) {
    var th = themes.filter(function (x) { return t.indexOf(x) >= 0; })[0];
    if (!th && /(next|change|another|switch|different)/.test(t)) th = themes[(themes.indexOf(M.settings.theme) + 1) % themes.length];
    if (!th) return M.say('Themes: ' + themes.join(', ') + '. Say, for example, theme cyberpunk.');
    M.settings.theme = th; M.save(); M.applyTheme(); return M.say(cap(th) + ' theme.');
  });
  add(['^(dream|minimal|cyberpunk|retro|space|sunset)( mode)?$'], function (m) { M.settings.theme = m[1]; M.save(); M.applyTheme(); return M.say(cap(m[1]) + ' theme.'); });
  add(['mirror mode (on|off)', '(turn|switch) (on|off) mirror mode'], function (m, t) { M.settings.mirrorMode = /\bon\b/.test(t); M.save(); M.applyTheme(); return M.say('Mirror mode ' + (M.settings.mirrorMode ? 'on.' : 'off.')); });
  add(['(change|switch|next|different|new) voice', 'talk differently'], function () {
    if (!M.voices.length) return M.say('No other voices are available.');
    var i = M.voices.findIndex(function (v) { return v.voiceURI === M.settings.voiceURI; });
    var v = M.voices[(i + 1) % M.voices.length]; M.settings.voiceURI = v.voiceURI; M.save();
    return M.say('This is my new voice. I\'m ' + v.name + '.', { plain: true });
  });
  add(['(gestures?|camera) (on|off)', '(turn|switch) (on|off) (the )?(gestures?|camera)'], function (m, t) { M.settings.gestures = /\bon\b/.test(t); M.save(); if (M.settings.gestures) M.startGestures(); else M.stopGestures(); return M.say('Gestures ' + (M.settings.gestures ? 'on.' : 'off.')); });

  /* --- Fun --- */
  add(['(another|one more|tell me another) joke', 'joke', 'make me laugh', 'say something funny', 'be funny', 'tell me something funny'], function () { var i; do { i = Math.floor(Math.random() * C.jokes.length); } while (i === lastJoke && C.jokes.length > 1); lastJoke = i; return M.say(C.jokes[i]); });
  add(['\\bfacts?\\b', 'teach me something', 'tell me something (interesting|cool|new)', 'did you know', 'something interesting'], function () { var i; do { i = Math.floor(Math.random() * C.facts.length); } while (i === lastFact && C.facts.length > 1); lastFact = i; return M.say(C.facts[i]); });
  add(['riddle', 'brain ?teaser', 'puzzle'], function () { var r = pick(C.riddles); pending = { kind: 'riddle', answer: r[1] }; return M.say(r[0] + ' Say "I give up" for the answer.'); });
  add(['compliment', 'say something nice', 'how do i look', 'do i look (good|nice|ok|okay|cute|fine)', 'am i (pretty|cute|cool|smart)', 'hype me up'], function () { return M.say(pick(C.compliments)); });
  add(['motivat', 'inspire me', 'pep talk', 'encourage me', 'i (can\'?t|cannot) do (this|it)', 'i give up on', 'i\'?m (stressed|nervous|anxious|worried|sad|tired|bored|scared|unmotivated|lazy)', 'i feel (stressed|nervous|anxious|worried|sad|tired|bored|down|bad)', 'bad day'], function (m, t) {
    var extra = /sad|down|bad/.test(t) ? ' If you\'re feeling low for a while, talking to someone you trust really helps.' : /bored/.test(t) ? ' Want a riddle or some music?' : '';
    return M.say(pick(C.pep) + extra);
  });
  add(['flip a coin', 'coin (flip|toss)', 'heads or tails', 'toss a coin'], function () { return M.say(pick(['Heads!', 'Tails!'])); });
  add(['roll (a |the |two |2 )?(dice|die)', 'dice'], function (m, t) { var two = /two|2/.test(t); var a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6); return M.say(two ? 'You rolled ' + a + ' and ' + b + ', that\'s ' + (a + b) + '.' : 'You rolled a ' + a + '.'); });
  add(['random number( between ' + NUM + ' and ' + NUM + ')?', 'pick a number( between ' + NUM + ' and ' + NUM + ')?'], function (m) {
    var lo = M.num(m[2]), hi = M.num(m[3]); if (isNaN(lo) || isNaN(hi)) { lo = 1; hi = 100; }
    if (lo > hi) { var x = lo; lo = hi; hi = x; }
    return M.say(String(Math.floor(lo + Math.random() * (hi - lo + 1))) + '.');
  });
  add(['rock paper scissors', 'play a game', 'let\'?s play'], function () { pending = { kind: 'rps' }; return M.say('Rock, paper, scissors! Say your choice.'); });
  add(['^(rock|paper|scissors)$'], function (m) {
    var me = pick(['rock', 'paper', 'scissors']), you = m[1];
    var win = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    return M.say('I chose ' + me + '. ' + (me === you ? 'It\'s a tie!' : win[you] === me ? 'You win!' : 'I win!'));
  });
  add(['magic (8|eight) ball', '^should i ', '^will i ', '^am i going to ', '^is it a good idea'], function () { return M.say(pick(C.eightBall)); });
  add(['knock knock'], function () { pending = { kind: 'knock', step: 1 }; return M.say('Who\'s there?'); });
  add(['high five', 'fist bump'], function () { M.lightsPulse(); return M.say('Up top! ✋'); });
  add(['(tell me a )?story'], function () { return M.say('Once upon a time, someone built a mirror out of an old iPad, some film and a tiny ESP32. Everyone said it was impossible on ₹2,000. The end. Spoiler: it worked.'); });
  add(['what( i|\')?s the meaning of life'], function () { return M.say('42. Or maybe good friends and good snacks.'); });
  add(['beatbox', 'make a sound', '\\b(bark|meow|moo)\\b'], function () { return M.say('Boots and cats and boots and cats.'); });

  /* --- Maths and conversions --- */
  add(['(square root|sqrt) of ' + NUM], function (m) { var n = M.num(m[2]); if (isNaN(n) || n < 0) return false; return M.say('The square root of ' + n + ' is ' + round(Math.sqrt(n)) + '.'); });
  add([NUM + ' (squared|cubed)'], function (m) { var n = M.num(m[1]); if (isNaN(n)) return false; return M.say(n + ' ' + m[2] + ' is ' + round(Math.pow(n, m[2] === 'squared' ? 2 : 3)) + '.'); });
  add([NUM + ' ?(percent|%) of ' + NUM], function (m) { var a = M.num(m[1]), b = M.num(m[3]); if (isNaN(a) || isNaN(b)) return false; return M.say(a + ' percent of ' + b + ' is ' + round(a * b / 100) + '.'); });
  add([NUM + ' ?(plus|\\+|add|minus|-|take away|times|x|×|\\*|multiplied by|into|divided by|over|÷|/) ?' + NUM], function (m) {
    var a = M.num(m[1]), op = m[2], b = M.num(m[3]); if (isNaN(a) || isNaN(b)) return false;
    var r = /plus|\+|add/.test(op) ? a + b : /minus|^-$|take/.test(op) ? a - b : /times|^x$|×|\*|multiplied|into/.test(op) ? a * b : b === 0 ? null : a / b;
    if (r === null) return M.say('You can\'t divide by zero. Even I know that.');
    return M.say(a + ' ' + op.replace('*', 'times').replace('/', 'divided by').replace('x', 'times') + ' ' + b + ' is ' + round(r) + '.');
  });
  add([NUM + ' ?(degrees )?(celsius|c|centigrade) (in|to|into) (fahrenheit|f)', NUM + ' ?(degrees )?(fahrenheit|f) (in|to|into) (celsius|c|centigrade)'], function (m, t) {
    var n = M.num(m[1]); if (isNaN(n)) return false;
    return /^(fahrenheit|f)$/.test(m[3]) ? M.say(n + ' Fahrenheit is ' + round((n - 32) * 5 / 9) + ' Celsius.') : M.say(n + ' Celsius is ' + round(n * 9 / 5 + 32) + ' Fahrenheit.');
  });
  var units = [['km', 'kilomet(?:er|re)s?|km', 1000], ['cm', 'centimet(?:er|re)s?|cm', 0.01], ['mm', 'millimet(?:er|re)s?|mm', 0.001], ['m', 'met(?:er|re)s?|m', 1], ['in', 'inch(?:es)?|in', 0.0254], ['ft', 'feet|foot|ft', 0.3048], ['mi', 'miles?|mi', 1609.34], ['kg', 'kilograms?|kilos?|kg', 1], ['lb', 'pounds?|lbs?', 0.453592], ['g', 'grams?|g', 0.001]];
  var unitRe = units.map(function (u) { return u[1]; }).join('|');
  add([NUM + ' ?(' + unitRe + ')\\b (?:in|to|into) (' + unitRe + ')\\b'], function (m) {
    var n = M.num(m[1]); if (isNaN(n)) return false;
    function find(s) { for (var i = 0; i < units.length; i++) if (new RegExp('^(?:' + units[i][1] + ')$').test(s)) return units[i]; return null; }
    var from = find(m[2]), to = find(m[3]);
    if (!from || !to) return false;
    var mass = ['kg', 'lb', 'g'];
    if ((mass.indexOf(from[0]) >= 0) !== (mass.indexOf(to[0]) >= 0)) return M.say('Those two can\'t be converted.');
    return M.say(n + ' ' + from[0] + ' is ' + round(n * from[2] / to[2]) + ' ' + to[0] + '.');
  });
  add(['^(how do you )?spell (\\w+)$'], function (m) { return M.say(m[2].toUpperCase().split('').join(', ') + '.'); });

  /* ---------- Run a command ---------- */
  M.runCommand = function (raw, opts) {
    opts = opts || {};
    M.poke();
    var t = M.clean(raw);
    if (!t) return;
    if (!opts.silentEcho) M.bubble('me', raw.trim());

    // Waiting for a follow-up?
    if (pending) {
      var p = pending; pending = null;
      if (p.kind === 'custom') { var cr = p.handler(t); if (cr !== false) return cr; }
      if (p.kind === 'riddle') {
        if (/give up|tell me|answer|don'?t know|no idea|what is it/.test(t)) return M.say(p.answer);
        if (p.answer.toLowerCase().replace(/[^a-z ]/g, '').indexOf(t.replace(/^(a|an|the) /, '')) >= 0) return M.say('Correct! ' + p.answer);
        pending = p; return M.say('Not quite. Guess again, or say "I give up".');
      }
      if (p.kind === 'knock') {
        if (p.step === 1) { pending = { kind: 'knock', step: 2, who: t }; return M.say(cap(t) + ' who?'); }
        return M.say(pick(['Ha! Good one.', 'I did not see that coming. Nice.', 'That was terrible. I love it.']));
      }
    }
    // Chatting with a character? They answer everything except normal mirror commands
    if (!opts.fromAI && M.characterRoute) { var ch = M.characterRoute(raw, t); if (ch !== false) return ch; }
    var ALL = FIRST.concat(R);
    for (var i = 0; i < ALL.length; i++) {
      var pats = ALL[i][0];
      for (var j = 0; j < pats.length; j++) {
        var m = t.match(pats[j]);
        if (m) {
          var res = ALL[i][1](m, t);
          if (res !== false) return res;
        }
      }
    }
    return M.askAI(raw, t);
  };
  M.commandCount = function () { return FIRST.concat(R).reduce(function (n, r) { return n + r[0].length; }, 0); };

  /* ---------- Real AI (only once a middle-man server is set up) ---------- */
  M.askAI = function (raw, t) {
    if (M.aiReady && M.aiReady()) return M.aiAnswer(raw);   // AI key saved in Settings → AI
    if (!M.config.aiEndpoint) {
      return M.say(pick(['I don\'t know that one yet. Once a parent adds the AI key in Settings, I\'ll be able to answer anything. Say "what can you do" for ideas.', 'Hmm, that\'s not one of my built-in commands yet. Try "help" to see what I can do.']));
    }
    M.show('assistant'); M.orb('thinking', 'Thinking…');
    var context = { time: new Date().toString(), name: M.settings.name, summary: summary(), today: M.classesOn(new Date().getDay()), reminders: M.settings.reminders, weather: M.weather && { temp: M.weather.temp, text: M.wmo(M.weather.code).text } };
    return fetch(M.config.aiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: raw, context: context, pairing: M.settings.pairing }) })
      .then(function (r) { if (!r.ok) throw new Error('ai'); return r.json(); })
      .then(function (j) {
        M.say(j.answer || 'I\'m not sure.');
        // The AI can control the mirror by sending built-in commands back, e.g. ["lights warm white", "brightness 30"]
        (j.commands || []).slice(0, 5).forEach(function (c) { M.runCommand(String(c), { silentEcho: true, fromAI: true }); });
      })
      .catch(function () { M.say('I couldn\'t reach my AI right now. Built-in commands still work.'); });
  };

  /* ---------- Colour cycling (Lights touch spot) ---------- */
  var cycle = ['#a78bfa', '#ff5fa2', '#2f6bff', '#22d3ee', '#22e05a', '#ffe11a', '#ff8c1a', '#ff2b2b', '#ffd9a8'];
  M.cycleColor = function () {
    var i = cycle.indexOf(M.settings.lights.color);
    M.setLights({ color: cycle[(i + 1) % cycle.length], mode: 'solid', on: true });
  };
})();
