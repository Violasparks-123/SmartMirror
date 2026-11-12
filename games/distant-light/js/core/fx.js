/* Glitch and atmosphere effects. "Reduce flashing" in Settings swaps every hard flash
   for a slow, gentle version and turns off the random flickers. */
DL.FX = (() => {
  const { $, wait, rand, randi } = DL.util;
  const calm = () => DL.State.settings.reduceFlash;

  async function flash(color = '#fff', ms = 160) {
    const f = $('#flash');
    f.style.background = color;
    const peak = calm() ? 0.35 : 0.9;
    const dur = calm() ? Math.max(ms * 3, 500) : ms;
    f.animate([{ opacity: 0 }, { opacity: peak, offset: 0.15 }, { opacity: 0 }], { duration: dur, easing: 'ease-out' });
    await wait(dur);
  }

  async function fade(color = '#000', to = 1, ms = 600) {
    const f = $('#flash');
    f.style.background = color;
    const from = parseFloat(getComputedStyle(f).opacity) || 0;
    const a = f.animate([{ opacity: from }, { opacity: to }], { duration: ms, fill: 'forwards', easing: 'ease' });
    await wait(ms);
    a.commitStyles?.();
    a.cancel();
    f.style.opacity = to;
  }

  async function shake(ms = 420, mag = 10) {
    if (calm()) mag = Math.min(mag, 3);
    const frames = [];
    for (let i = 0; i < 8; i++) frames.push({ transform: `translate(${rand(-mag, mag)}px, ${rand(-mag / 2, mag / 2)}px)` });
    frames.push({ transform: 'none' });
    $('#shake').animate(frames, { duration: ms, easing: 'linear' });
    await wait(ms);
  }

  /* Screen tear: redraw the background in torn strips with split colour channels. */
  async function tear(ms = 520, strength = 1) {
    const cv = $('#fx'), g = cv.getContext('2d');
    const img = DL.Stage.img;
    DL.Audio.sfx('tear');
    if (calm()) { await flash('#fff', 200); return; }
    const end = performance.now() + ms;
    while (performance.now() < end) {
      g.clearRect(0, 0, cv.width, cv.height);
      if (img) {
        const n = randi(6, 12);
        for (let i = 0; i < n; i++) {
          const y = rand(0, cv.height), h = rand(4, 40) * strength;
          const dx = rand(-60, 60) * strength;
          const sy = (y / cv.height) * img.height, sh = (h / cv.height) * img.height;
          g.globalAlpha = 0.9;
          g.drawImage(img, 0, sy, img.width, sh, dx, y, cv.width, h);
          g.globalCompositeOperation = 'lighter';
          g.globalAlpha = 0.35;
          g.fillStyle = Math.random() < 0.5 ? 'rgba(255,60,150,1)' : 'rgba(60,150,255,1)';
          g.fillRect(dx + rand(-8, 8), y, cv.width, h);
          g.globalCompositeOperation = 'source-over';
        }
      }
      g.globalAlpha = 1;
      await wait(randi(40, 70));
    }
    g.clearRect(0, 0, cv.width, cv.height);
  }

  /* Static: a small noise canvas scaled up over the scene. */
  let noiseLevel = 0, noiseTimer = null;
  function noise(level = 0) {
    noiseLevel = level;
    const cv = $('#noise');
    cv.style.opacity = level ? Math.min(0.5, level * 0.12) : 0;
    if (level && !noiseTimer) {
      const g = cv.getContext('2d');
      const data = g.createImageData(cv.width, cv.height);
      noiseTimer = setInterval(() => {
        if (document.hidden) return;
        for (let i = 0; i < data.data.length; i += 4) {
          const v = Math.random() * 255;
          data.data[i] = data.data[i + 1] = data.data[i + 2] = v; data.data[i + 3] = 255;
        }
        g.putImageData(data, 0, 0);
      }, calm() ? 250 : 80);
    } else if (!level && noiseTimer) { clearInterval(noiseTimer); noiseTimer = null; }
  }

  function scan(on) { $('#scan').classList.toggle('on', !!on); }
  function tint(kind) {
    const t = $('#tint');
    t.className = 'layer' + (kind ? ' ' + kind : '');
  }
  function vignette(kind) { $('#vignette').className = 'layer' + (kind === 'heavy' ? ' heavy' : ''); }

  /* Random small glitches while the world is unstable. */
  let ambientTimer = null, ambientLevel = 0, ambientPaused = 0;
  function ambient(level) {
    ambientLevel = level;
    clearTimeout(ambientTimer);
    if (level < 2) return;
    const loop = async () => {
      ambientTimer = setTimeout(async () => {
        if (!document.hidden && !ambientPaused && ambientLevel >= 2) {
          if (calm()) await DL.Stage.flicker('g1', 600);
          else {
            DL.Audio.sfx('static');
            await DL.Stage.flicker(Math.random() < 0.6 ? 'g2' : 'g1', randi(70, 140));
            if (ambientLevel >= 3 && Math.random() < 0.35) tear(180, 0.6);
          }
        }
        loop();
      }, rand(ambientLevel >= 3 ? 6000 : 9000, ambientLevel >= 3 ? 12000 : 18000));
    };
    loop();
  }
  function pauseAmbient(p) { ambientPaused += p ? 1 : -1; if (ambientPaused < 0) ambientPaused = 0; }

  /* Scramble text from one string to another, character by character. */
  const GLYPHS = '▓▒░█▚▞#%&@*+=?/\\|<>01ﾊﾙｶﾋｶﾙ';
  async function scramble(node, from, to, ms = 650) {
    const steps = calm() ? 4 : 14;
    const len = Math.max(from.length, to.length);
    for (let i = 1; i <= steps; i++) {
      const p = i / steps;
      let out = '';
      for (let k = 0; k < len; k++) {
        const settled = Math.random() < p * 1.1;
        if (settled) out += to[k] ?? '';
        else out += Math.random() < 0.5 ? (from[k] ?? '') : GLYPHS[randi(0, GLYPHS.length - 1)];
      }
      node.textContent = out;
      await wait(ms / steps);
    }
    node.textContent = to;
  }

  /* Apply the standard look for a corruption level. */
  function applyLevel(level, o = {}) {
    scan(level >= 2);
    noise(level >= 3 ? 1.2 : level >= 2 ? 0.5 : 0);
    vignette(level >= 3 ? 'heavy' : '');
    ambient(o.noAmbient ? 0 : level);
  }

  function reset() {
    tint(null); scan(false); noise(0); vignette(''); ambient(0);
    const f = $('#flash'); f.getAnimations().forEach((a) => a.cancel()); f.style.opacity = 0;
  }

  return { flash, fade, shake, tear, noise, scan, tint, vignette, ambient, pauseAmbient, scramble, applyLevel, reset };
})();
