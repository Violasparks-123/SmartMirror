// Moonlit Manor — little sound effects made in code (no files needed).
window.SFX = (() => {
  let ctx = null, on = true, vol = 0.5;
  const ensure = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  function tone(freq, start, dur, type = "sine", gain = 0.15) {
    const c = ensure(); if (!c || !on) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain * vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  return {
    set enabled(v) { on = v; }, get enabled() { return on; },
    set volume(v) { vol = v; },
    click: () => tone(880, 0, 0.08, "triangle", 0.08),
    reward: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.35, "sine", 0.12)),
    level: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.5, "triangle", 0.12)),
    wrong: () => { tone(330, 0, 0.15, "square", 0.05); tone(262, 0.12, 0.2, "square", 0.05); },
    pop: () => tone(1320, 0, 0.12, "sine", 0.1),
    unlock: ensure,
  };
})();
