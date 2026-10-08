/* Saves the mirror's settings on this device (name, city, timetable, reminders, theme…). */
(function () {
  var KEY = 'smart-mirror-v1';
  function randomCode() {
    var c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
    return s;
  }
  // No personal info lives in the code (it's public on GitHub). The name and timetable are
  // typed into Settings on the iPad and saved only there.
  var emptyTimetable = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
  var defaults = {
    name: '',
    city: M.config.defaultCity,
    theme: 'dream',
    mirrorMode: false,
    ledPreview: true,
    voiceURI: '',
    wake: true,
    gestures: false,
    pairing: randomCode(),
    timetable: emptyTimetable,
    timetableIsSample: true,   // true = not filled in yet
    reminders: [],
    ttVersion: 3,
    personality: 'normal',
    lights: { color: '#a78bfa', brightness: 60, mode: 'solid', on: true }
  };
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object') {
        var merged = Object.assign({}, defaults, raw, { lights: Object.assign({}, defaults.lights, raw.lights || {}) });
        // Keep whatever timetable is already saved on this device
        if (!raw.timetable) { merged.timetable = JSON.parse(JSON.stringify(emptyTimetable)); merged.timetableIsSample = true; }
        return merged;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(defaults));
  }
  M.settings = load();
  M.save = function () { try { localStorage.setItem(KEY, JSON.stringify(M.settings)); } catch (e) {} };
  M.save();
})();
