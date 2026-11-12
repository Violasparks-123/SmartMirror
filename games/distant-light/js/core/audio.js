/* All sound is generated in the browser (no audio files).
   Moods: 'calm' (school days), 'uneasy' (same tune, notes slipping), 'drone' (horror),
   'sweet' (good ending), 'none'. Starts only after the first click, as browsers require. */
DL.Audio = (() => {
  let ctx = null, master, musicBus, sfxBus, timer = null;
  let mood = 'none', nextTime = 0, step = 0;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; return; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.connect(master);
    musicBus = ctx.createGain(); musicBus.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.connect(comp);
    applyVolumes();
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
    timer = setInterval(schedule, 30);
  }

  function applyVolumes() {
    if (!ctx) return;
    const st = DL.State.settings;
    musicBus.gain.setTargetAtTime((st.music / 100) * 0.42, ctx.currentTime, 0.1);
    sfxBus.gain.setTargetAtTime((st.sfx / 100) * 0.55, ctx.currentTime, 0.05);
  }

  function tone(freq, t, dur, o = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    if (o.detune) osc.detune.setValueAtTime(o.detune, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    const peak = o.gain ?? 0.1, a = o.attack ?? 0.01;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; osc.connect(f); node = f; }
    node.connect(g); g.connect(o.bus || musicBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  let noiseBuf = null;
  function noise(t, dur, o = {}) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.ftype || 'bandpass'; f.frequency.value = o.freq || 1800; f.Q.value = o.q || 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  // Note helpers (MIDI → Hz)
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Chords for the school-day theme (C major: I – vi – IV – V) and the uneasy minor version.
  const CALM = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];
  const UNEASY = [[57, 60, 64, 69], [53, 57, 60, 65], [52, 55, 59, 64], [57, 60, 63, 69]];
  const SWEET = [[65, 69, 72, 76], [62, 65, 69, 74], [58, 62, 65, 70], [60, 64, 67, 72]];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 3];

  function schedule() {
    if (!ctx || mood === 'none') return;
    const ahead = ctx.currentTime + 0.18;
    while (nextTime < ahead) {
      playStep(nextTime, step);
      const bpm = mood === 'calm' ? 88 : mood === 'sweet' ? 76 : mood === 'uneasy' ? 70 : 40;
      nextTime += 60 / bpm / 2;
      step++;
    }
  }

  function playStep(t, i) {
    const bar = Math.floor(i / 8) % 4, beat = i % 8;
    if (mood === 'calm' || mood === 'sweet') {
      const ch = (mood === 'calm' ? CALM : SWEET)[bar];
      tone(hz(ch[ARP[beat]] + 12), t, 0.9, { type: 'triangle', gain: 0.05, lp: 3200 });
      if (beat === 0) {
        tone(hz(ch[0] - 12), t, 3.2, { type: 'sine', gain: 0.06, attack: 0.4 });
        tone(hz(ch[2]), t, 3.2, { type: 'sine', gain: 0.025, attack: 0.6 });
      }
      if (mood === 'sweet' && beat === 4) tone(hz(ch[3] + 24), t, 1.6, { type: 'sine', gain: 0.02 });
    } else if (mood === 'uneasy') {
      if (Math.random() < 0.15) return; // missing notes
      const ch = UNEASY[bar];
      const wrong = Math.random() < 0.18 ? (Math.random() < 0.5 ? -45 : 38) : 0; // notes slipping out of tune
      tone(hz(ch[ARP[beat]] + 12), t, 1.1, { type: 'triangle', gain: 0.045, detune: wrong, lp: 2400 });
      if (beat === 0) tone(hz(ch[0] - 12), t, 3.8, { type: 'sine', gain: 0.06, attack: 0.6, detune: -8 });
    } else if (mood === 'drone') {
      if (i % 8 === 0) {
        tone(55, t, 7, { type: 'sawtooth', gain: 0.03, attack: 2, lp: 220 });
        tone(58.3, t, 7, { type: 'sawtooth', gain: 0.025, attack: 2.5, lp: 200 });
      }
      if (Math.random() < 0.12) tone(hz(84 + Math.floor(Math.random() * 7)), t, 2.4, { type: 'sine', gain: 0.012, attack: 0.8, detune: Math.random() * 60 - 30 });
      if (i % 16 === 7) noise(t, 2.2, { freq: 600, q: 0.4, gain: 0.02, bus: musicBus });
    }
  }

  function setMood(m) {
    if (m === mood) return;
    mood = m;
    if (!ctx) return;
    nextTime = ctx.currentTime + 0.1; step = 0;
  }

  function sfx(name) {
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    switch (name) {
      case 'blip': tone(1320, t, 0.06, { type: 'sine', gain: 0.05, bus: sfxBus }); break;
      case 'select': tone(784, t, 0.12, { type: 'sine', gain: 0.08, bus: sfxBus }); tone(1175, t + 0.07, 0.18, { type: 'sine', gain: 0.07, bus: sfxBus }); break;
      case 'chime': [1319, 1760, 2093, 2637].forEach((f, k) => tone(f, t + k * 0.09, 1.6, { type: 'sine', gain: 0.06, bus: sfxBus })); break;
      case 'static': noise(t, 0.45, { freq: 2600, q: 0.3, gain: 0.22 }); tone(110, t, 0.25, { type: 'square', gain: 0.03, bus: sfxBus, lp: 900 }); break;
      case 'tear': for (let k = 0; k < 5; k++) tone(200 + Math.random() * 1600, t + k * 0.04, 0.04, { type: 'square', gain: 0.03, bus: sfxBus }); noise(t, 0.25, { freq: 4000, gain: 0.12 }); break;
      case 'ping': tone(1047, t, 0.25, { type: 'sine', gain: 0.07, bus: sfxBus }); tone(1568, t + 0.1, 0.35, { type: 'sine', gain: 0.06, bus: sfxBus }); break;
      case 'send': tone(660, t, 0.08, { type: 'sine', gain: 0.05, bus: sfxBus, slide: 990 }); break;
      case 'page': noise(t, 0.35, { freq: 3200, q: 0.5, gain: 0.08, ftype: 'highpass' }); break;
      case 'thud': tone(90, t, 0.6, { type: 'sine', gain: 0.18, slide: 40, bus: sfxBus }); break;
      case 'bell': [523, 659, 784, 1047].forEach((f, k) => tone(f, t + k * 0.32, 1.2, { type: 'sine', gain: 0.05, bus: sfxBus })); break;
      case 'coin': tone(1568, t, 0.08, { type: 'square', gain: 0.03, bus: sfxBus, lp: 3000 }); tone(2093, t + 0.07, 0.2, { type: 'square', gain: 0.03, bus: sfxBus, lp: 3000 }); break;
      default: break;
    }
  }

  return { init, setMood, sfx, applyVolumes, get mood() { return mood; } };
})();
