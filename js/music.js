/* Music player with beat detection: the mirror listens to its own song and pulses the lights. */
(function () {
  var audio, ctx = null, analyser = null, data = null, raf = 0;
  M.playlist = [];   // [{title, url}]
  M.track = -1;
  var energyAvg = 0;

  function titleFrom(name) { return name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(); }

  M.initMusic = function () {
    audio = M.$('audio');
    (M.config.songs || []).forEach(function (u) { M.playlist.push({ title: titleFrom(u.split('/').pop()), url: u }); });
    audio.addEventListener('ended', function () { M.musicNext(); });
    audio.addEventListener('timeupdate', function () {
      var p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      M.$('songProgress').style.width = p + '%';
    });
    audio.addEventListener('play', function () { setIcon(true); startViz(); });
    audio.addEventListener('pause', function () { setIcon(false); });
    M.$('mPlay').onclick = function () { M.musicToggle(); };
    M.$('mNext').onclick = function () { M.musicNext(); };
    M.$('mPrev').onclick = function () { M.musicPrev(); };
    M.$('songFiles').addEventListener('change', function (e) {
      Array.prototype.forEach.call(e.target.files, function (f) { M.playlist.push({ title: titleFrom(f.name), url: URL.createObjectURL(f) }); });
      M.$('songCount').textContent = M.playlist.length + ' song' + (M.playlist.length === 1 ? '' : 's') + ' ready (added songs last until the page reloads)';
      if (M.track < 0 && M.playlist.length) load(0);
      M.toast('Added ' + e.target.files.length + ' song' + (e.target.files.length === 1 ? '' : 's'));
    });
    if (M.playlist.length) load(0);
    drawIdle();
  };

  function setIcon(playing) {
    M.$('mPlayIcon').innerHTML = playing ? '<path d="M9 5v14M15 5v14"/>' : '<path d="M7 4v16l13-8z"/>';
  }
  function load(i) {
    if (!M.playlist.length) return false;
    M.track = (i + M.playlist.length) % M.playlist.length;
    var t = M.playlist[M.track];
    audio.src = t.url;
    M.$('songTitle').textContent = t.title;
    M.$('songSub').textContent = 'Song ' + (M.track + 1) + ' of ' + M.playlist.length;
    return true;
  }
  function ensureAnalyser() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      var src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      data = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser); analyser.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }
  M.musicPlay = function () {
    if (!M.playlist.length) { M.say('There are no songs yet. Add some in Settings.'); return false; }
    if (M.track < 0) load(0);
    ensureAnalyser();
    var p = audio.play(); if (p && p.catch) p.catch(function () { M.toast('Tap Play to start the music'); });
    return true;
  };
  M.musicPause = function () { audio.pause(); };
  M.playTrack = function (i) { if (load(i)) M.musicPlay(); };
  M.musicToggle = function () { if (audio.paused) M.musicPlay(); else M.musicPause(); };
  M.musicNext = function () { if (load(M.track + 1)) M.musicPlay(); };
  M.musicPrev = function () { if (load(M.track - 1)) M.musicPlay(); };
  M.musicVolume = function (delta, abs) {
    var v = abs != null ? abs : audio.volume + delta;
    audio.volume = Math.max(0, Math.min(1, v));
    return Math.round(audio.volume * 100);
  };
  M.isPlaying = function () { return audio && !audio.paused; };
  M.nowPlaying = function () { return M.track >= 0 ? M.playlist[M.track].title : null; };

  /* Visualiser + beat detection */
  function drawIdle() {
    var c = M.$('viz'), g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    var col = getComputedStyle(M.$('mirror')).getPropertyValue('--accent').trim() || '#a78bfa';
    g.fillStyle = col;
    for (var i = 0; i < 32; i++) { var h = 6; g.fillRect(i * 19 + 4, c.height / 2 - h / 2, 9, h); }
  }
  function startViz() {
    cancelAnimationFrame(raf);
    var c = M.$('viz'), g = c.getContext('2d');
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!analyser || audio.paused) { if (audio.paused) { cancelAnimationFrame(raf); drawIdle(); } return; }
      analyser.getByteFrequencyData(data);
      g.clearRect(0, 0, c.width, c.height);
      var css = getComputedStyle(M.$('mirror'));
      var a1 = css.getPropertyValue('--accent').trim() || '#a78bfa', a2 = css.getPropertyValue('--accent2').trim() || '#67e8f9';
      for (var i = 0; i < 32; i++) {
        var v = data[i * 2] / 255, h = Math.max(4, v * c.height);
        g.fillStyle = i % 2 ? a1 : a2;
        g.fillRect(i * 19 + 4, (c.height - h) / 2, 9, h);
      }
      // Bass energy (lowest bins) → beat
      var e = 0; for (var k = 0; k < 6; k++) e += data[k];
      e = e / (6 * 255);
      energyAvg = energyAvg * 0.94 + e * 0.06;
      if (e > 0.35 && e > energyAvg * 1.25) {
        M.lightsBeat(e);
        var al = M.$('album'); al.classList.add('beat'); setTimeout(function () { al.classList.remove('beat'); }, 90);
      }
    }
    frame();
  }
})();
