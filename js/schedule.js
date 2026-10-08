/* The timetable: today's classes, what's on now, what's next, tomorrow.
   Each class is [start, subject, end], e.g. ['10:30', 'Maths', '12:30']. */
(function () {
  var keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  M.dayKey = function (i) { return keys[i]; };
  function mins(hhmm) { var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1]); }
  M.mins = mins;
  M.classesOn = function (dayIndex) {
    return (M.settings.timetable[keys[dayIndex]] || []).map(function (c) {
      // classes saved without an end time last an hour
      var end = c[2] || (function () { var e = mins(c[0]) + 60; return M.pad(Math.floor(e / 60) % 24) + ':' + M.pad(e % 60); })();
      return [c[0], c[1], end];
    }).sort(function (a, b) { return mins(a[0]) - mins(b[0]); });
  };
  M.fmt12 = function (hhmm) { var p = String(hhmm).split(':'), h = +p[0]; return (h % 12 || 12) + (p[1] === '00' ? '' : ':' + p[1]) + (h < 12 ? ' am' : ' pm'); };
  M.inMins = function (n) {
    if (n < 60) return n + ' min';
    var h = Math.floor(n / 60), m = n % 60;
    return h + ' hr' + (h > 1 ? 's' : '') + (m ? ' ' + m + ' min' : '');
  };
  M.dayEnd = function (dayIndex) { var l = M.classesOn(dayIndex); return l.length ? l[l.length - 1][2] : null; };

  // What's happening right now?
  M.schoolStatus = function () {
    var d = new Date(), list = M.classesOn(d.getDay()), now = d.getHours() * 60 + d.getMinutes();
    if (!list.length) return { kind: 'free', text: 'No classes today' };
    var current = list.filter(function (c) { return mins(c[0]) <= now && now < mins(c[2]); })[0] || null;
    var next = list.filter(function (c) { return mins(c[0]) > now; })[0] || null;
    if (!current && !next) return { kind: 'after', text: 'All done for today' };
    if (current) {
      var left = mins(current[2]) - now;
      return { kind: next ? 'during' : 'last', current: current, next: next, mins: next ? mins(next[0]) - now : null,
        text: current[1] + ' now · ends in ' + M.inMins(left) + (next ? ' · then ' + next[1] + ' at ' + M.fmt12(next[0]) : '') };
    }
    var first = mins(list[0][0]) > now && next === list[0];
    return { kind: first ? 'before' : 'gap', next: next, mins: mins(next[0]) - now, text: next[1] + ' in ' + M.inMins(mins(next[0]) - now) };
  };

  function fill(box, list, highlightNow) {
    box.innerHTML = '';
    if (!list.length) { var e = document.createElement('div'); e.className = 'empty'; e.style.gridColumn = '1 / -1'; e.textContent = 'No classes'; box.appendChild(e); return; }
    var now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
    list.forEach(function (c) {
      var on = highlightNow && mins(c[0]) <= nowM && nowM < mins(c[2]);
      var done = highlightNow && nowM >= mins(c[2]);
      var t = document.createElement('div'); t.className = 't' + (on ? ' now' : ''); t.textContent = c[0] + '–' + c[2];
      var s = document.createElement('div'); s.className = on ? 'now' : ''; s.textContent = c[1];
      if (done) { t.style.opacity = s.style.opacity = '0.45'; }
      box.appendChild(t); box.appendChild(s);
    });
  }

  M.renderToday = function () {
    var d = new Date();
    fill(M.$('todayList'), M.classesOn(d.getDay()), true);
    M.$('nextLine').textContent = M.schoolStatus().text;
  };
  M.renderSchedule = function () {
    var d = new Date();
    M.$('schedTodayHead').textContent = 'Today · ' + M.dayNames[d.getDay()];
    fill(M.$('schedToday'), M.classesOn(d.getDay()), true);
    var t = (d.getDay() + 1) % 7;
    M.$('schedTomHead').textContent = 'Tomorrow · ' + M.dayNames[t];
    fill(M.$('schedTomorrow'), M.classesOn(t), false);
    M.$('ttSampleNote').hidden = !M.settings.timetableIsSample;
  };
})();
