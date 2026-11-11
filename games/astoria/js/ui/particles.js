// Floating motes of moonlight drifting over every screen.
import { st } from '../core/GameState.js';

export function startParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = 0; let hgt = 0; let dpr = 1;
  const motes = [];
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = c.clientWidth; hgt = c.clientHeight;
    c.width = w * dpr; c.height = hgt * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
  const make = () => ({ x: Math.random() * w, y: hgt + Math.random() * hgt * 0.3, r: Math.random() * 1.6 + 0.4, vy: -(Math.random() * 0.25 + 0.08), vx: (Math.random() - 0.5) * 0.12, a: Math.random() * 0.5 + 0.2, t: Math.random() * 6.28 });
  for (let i = 0; i < 36; i++) { const m = make(); m.y = Math.random() * hgt; motes.push(m); }
  const tick = () => {
    const reduce = st()?.settings.reduceMotion;
    ctx.clearRect(0, 0, w, hgt);
    const n = reduce ? 12 : 36;
    for (let i = 0; i < n; i++) {
      const m = motes[i];
      m.t += 0.01; m.x += m.vx + Math.sin(m.t) * 0.08; m.y += m.vy * (reduce ? 0.4 : 1);
      if (m.y < -10) Object.assign(m, make());
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, `rgba(226,210,255,${m.a})`);
      g.addColorStop(1, 'rgba(226,210,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
