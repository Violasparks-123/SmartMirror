// AudioManager — a small generative soundtrack built with the Web Audio API,
// so the game needs no audio files. Each location has its own ambience:
// piano for the dashboard, bells and choir for the cathedral, a waltz for the
// ballroom, and so on. Starts on the first tap (browsers require a gesture).
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';

let ctx = null;
let master = null; let musicBus = null; let sfxBus = null;
let current = null;        // current scene key
let loopTimer = null;
let noiseBuf = null;
let ambientNodes = [];

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    const verb = ctx.createConvolver(); verb.buffer = impulse(2.8); verb.connect(musicBus);
    musicBus.verb = verb;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVolumes();
    return true;
  } catch { return false; }
}

function impulse(sec) {
  const len = ctx.sampleRate * sec;
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  return b;
}

function applyVolumes() {
  if (!ctx) return;
  const s = st()?.settings || { music: 0.45, sfx: 0.7 };
  musicBus.gain.setTargetAtTime(s.music * 0.55, ctx.currentTime, 0.3);
  sfxBus.gain.setTargetAtTime(s.sfx * 0.6, ctx.currentTime, 0.05);
}

// A soft piano-ish tone: two detuned partials with a quick attack and long decay.
function tone(freq, { t = ctx.currentTime, dur = 2.4, vol = 0.12, type = 'triangle', dest = musicBus, wet = 0.5, attack = 0.01 } = {}) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  const o1 = ctx.createOscillator(); o1.type = type; o1.frequency.value = freq;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.002;
  const g2 = ctx.createGain(); g2.gain.value = 0.25;
  o1.connect(g); o2.connect(g2); g2.connect(g);
  g.connect(dest);
  if (dest === musicBus && wet > 0) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(musicBus.verb); }
  o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}

function bell(freq, t = ctx.currentTime, vol = 0.07) {
  [1, 2.76, 5.4, 8.93].forEach((m, i) => tone(freq * m, { t, dur: 5 - i, vol: vol / (i + 1), type: 'sine', wet: 0.9 }));
}

function noise({ freq = 600, q = 0.6, vol = 0.03, type = 'bandpass', lfo = 0.08 } = {}) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  const l = ctx.createOscillator(); l.frequency.value = lfo;
  const lg = ctx.createGain(); lg.gain.value = vol * 0.7;
  l.connect(lg); lg.connect(g.gain);
  src.connect(f); f.connect(g); g.connect(musicBus);
  src.start(); l.start();
  ambientNodes.push(src, l);
}

function pad(notes, vol = 0.018) {
  notes.forEach((n, i) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = (i % 2 ? 6 : -6);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = ctx.createGain(); g.gain.value = 0;
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 3);
    o.connect(f); f.connect(g); g.connect(musicBus);
    const w = ctx.createGain(); w.gain.value = 0.6; g.connect(w); w.connect(musicBus.verb);
    o.start();
    ambientNodes.push(o);
  });
}

const SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76]; // A minor pentatonic-ish
const LULLABY = [64, 67, 71];

const SCENES = {
  home: { every: [1800, 3400], tick() { const n = SCALE[Math.floor(Math.random() * SCALE.length)]; tone(midi(n), { dur: 3.2, vol: 0.09 }); if (Math.random() < 0.3) tone(midi(n - 12), { dur: 4, vol: 0.06 }); } },
  // The hidden cove: slow surf and a low, unresolved drone.
  cove: { setup() { noise({ freq: 320, vol: 0.035, lfo: 0.09 }); noise({ freq: 1400, vol: 0.006, lfo: 0.13 }); pad([40, 47, 51], 0.01); }, every: [6000, 11000], tick() { tone(midi([64, 67, 71][Math.floor(Math.random() * 3)]), { dur: 4, vol: 0.025, type: 'sine', wet: 0.9 }); } },
  // Near-silence under a cutscene: just the sea.
  hush: { setup() { noise({ freq: 280, vol: 0.02, lfo: 0.07 }); }, every: [60000, 60000], tick() {} },
  cathedral: { setup() { noise({ freq: 400, vol: 0.02, lfo: 0.05 }); pad([45, 52, 57], 0.012); }, every: [5000, 9000], tick() { bell(midi([45, 50, 52][Math.floor(Math.random() * 3)])); } },
  royal: { setup() { pad([48, 55, 60, 64], 0.012); }, every: [600, 600], step: 0, tick() { const chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]; const c = chords[Math.floor(this.step / 8) % 4]; tone(midi(c[this.step % 3] + 12), { dur: 1.4, vol: 0.05, type: 'triangle' }); this.step++; } },
  library: { setup() { noise({ freq: 2400, vol: 0.006, q: 0.3, lfo: 0.03 }); }, every: [1000, 1000], step: 0, tick() { tone(1800, { dur: 0.05, vol: 0.02, type: 'square', wet: 0.1 }); if (this.step % 5 === 0) { const n = SCALE[Math.floor(Math.random() * 6)]; tone(midi(n), { dur: 3.5, vol: 0.07 }); } this.step++; } },
  woods: { setup() { noise({ freq: 500, vol: 0.03, lfo: 0.06 }); noise({ freq: 5200, vol: 0.004, q: 8, lfo: 3 }); }, every: [2500, 5000], tick() { if (Math.random() < 0.5) tone(midi(76 + Math.floor(Math.random() * 8)), { dur: 0.25, vol: 0.02, type: 'sine', wet: 0.8 }); else tone(midi(SCALE[Math.floor(Math.random() * 4)] - 12), { dur: 5, vol: 0.05, type: 'sine' }); } },
  ballroom: { setup() { pad([45, 52], 0.008); }, every: [420, 420], step: 0, tick() { const prog = [[45, 60, 64], [41, 57, 60], [43, 59, 62], [40, 56, 59]]; const bar = prog[Math.floor(this.step / 3) % 4]; const beat = this.step % 3; if (beat === 0) tone(midi(bar[0]), { dur: 1.2, vol: 0.08, type: 'triangle' }); else { tone(midi(bar[1] + 12), { dur: 0.5, vol: 0.035 }); tone(midi(bar[2] + 12), { dur: 0.5, vol: 0.035 }); } if (this.step % 12 === 0) tone(midi([76, 72, 74, 71][Math.floor(this.step / 12) % 4]), { dur: 2.2, vol: 0.05 }); this.step++; } },
  dialogue: { every: [2600, 4200], tick() { const n = LULLABY[Math.floor(Math.random() * 3)]; tone(midi(n - 12), { dur: 3.5, vol: 0.05 }); } },
};

function stopScene() {
  clearTimeout(loopTimer);
  ambientNodes.forEach((n) => { try { n.stop(ctx.currentTime + 0.5); } catch {} });
  ambientNodes = [];
}

function runScene(key) {
  const sc = SCENES[key];
  if (!sc) return;
  sc.step = 0;
  if (sc.setup) sc.setup();
  const loop = () => {
    if (current !== key) return;
    try { sc.tick(); } catch {}
    const [a, b] = sc.every;
    loopTimer = setTimeout(loop, a + Math.random() * (b - a));
  };
  loopTimer = setTimeout(loop, 400);
}

const SFX = {
  click() { tone(midi(79), { dur: 0.25, vol: 0.05, type: 'sine', dest: sfxBus }); },
  open() { tone(midi(72), { dur: 0.5, vol: 0.05, dest: sfxBus }); tone(midi(79), { t: ctx.currentTime + 0.06, dur: 0.6, vol: 0.04, dest: sfxBus }); },
  choice() { tone(midi(67), { dur: 0.6, vol: 0.06, dest: sfxBus }); },
  item() { [76, 81, 88].forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.07, dur: 0.8, vol: 0.05, type: 'sine', dest: sfxBus })); },
  memory() { LULLABY.forEach((n, i) => tone(midi(n + 12), { t: ctx.currentTime + i * 0.22, dur: 1.6, vol: 0.06, type: 'sine', dest: sfxBus })); },
  quest() { [69, 76].forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.12, dur: 1.2, vol: 0.06, dest: sfxBus })); },
  complete() { [64, 69, 72, 76].forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.1, dur: 1.4, vol: 0.06, dest: sfxBus })); },
  letter() { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2000; const g = ctx.createGain(); g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35); s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); s.stop(ctx.currentTime + 0.4); tone(midi(84), { t: ctx.currentTime + 0.1, dur: 0.6, vol: 0.03, type: 'sine', dest: sfxBus }); },
  levelup() { [60, 64, 67, 72, 76].forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.08, dur: 1.5, vol: 0.05, dest: sfxBus })); },
  travel() { bell(midi(57), ctx.currentTime, 0.05); },
  // A dull, chained clink: low tone with a short metallic rattle.
  locked() { tone(midi(43), { dur: 0.35, vol: 0.07, type: 'triangle', dest: sfxBus }); const s2 = ctx.createBufferSource(); s2.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 4; const g = ctx.createGain(); g.gain.setValueAtTime(0.04, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18); s2.connect(f); f.connect(g); g.connect(sfxBus); s2.start(); s2.stop(ctx.currentTime + 0.2); },
  // An earned choice: a soft rising chime.
  // The song stopping dead: a sharp intake, then nothing.
  cutoff() { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.4; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3); s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); s.stop(ctx.currentTime + 0.32); },
  earned() { [72, 79, 84].forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.06, dur: 0.9, vol: 0.045, type: 'sine', dest: sfxBus })); },
  summon() { [48, 55, 60, 67, 72, 79].forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.18, dur: 2.5, vol: 0.05, type: 'sine', dest: sfxBus })); },
};

export const Audio = {
  unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!current) this.scene('home');
  },

  scene(key) {
    if (!ctx || key === current) return;
    stopScene();
    current = key;
    if (st()?.settings.music > 0) runScene(key);
  },

  npcCue(motif) {
    if (!ctx) return;
    motif.forEach((n, i) => tone(midi(n), { t: ctx.currentTime + i * 0.11, dur: 1.1, vol: 0.04, type: 'sine', dest: sfxBus }));
  },

  sfx(name) { if (ctx && SFX[name]) { try { SFX[name](); } catch {} } },

  refreshVolumes() {
    applyVolumes();
    if (!ctx) return;
    const key = current; current = null;
    stopScene();
    if (key) this.scene(key);
  },

  init() {
    bus.on('sfx', (n) => this.sfx(n));
    const unlock = () => this.unlock();
    window.addEventListener('pointerdown', unlock, { once: false, passive: true });
    window.addEventListener('keydown', unlock, { once: false });
  },
};
