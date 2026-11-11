// Spatial scene: the Moonlit Gala rendered like a "spatial photo".
//
// • The ballroom is a single painting plus a depth map. A small WebGL shader
//   shifts every pixel by its own depth, so near pillars, chandeliers and the
//   floor slide against the far window as the view moves. Near things also
//   swell slightly (a true dolly effect), and focus falls off with distance.
// • Lucien, Astoria and the two rose bushes are separate cut-out layers that
//   float in front of the hall at their own depths, with soft contact shadows.
// • Moonlight motes drift at many depths through the whole volume.
// • The view moves with the pointer, a drag/swipe, device tilt, and scrolling,
//   and breathes gently on its own when idle.
//
// Without WebGL it falls back to plain layered parallax. Reduce-motion keeps
// the scene still.
import { h } from './dom.js';
import { st } from '../core/GameState.js';

const A = 'assets/spatial/';
const CW = 2200; const CH = 1228;               // canvas the layers were laid out on

// Floating layers. x/y/w in canvas units; z is depth (0 = hall's far wall, 1 = at the glass).
const LAYERS = [
  { id: 'lucien', src: `${A}lucien.webp`, x: 380, y: 160, w: 700, z: 0.62, shadow: true },
  // Astoria's size and position relative to Lucien are measured from the original gala artwork, so the pair keeps the proportions they were drawn with.
  { id: 'astoria', src: `${A}astoria.webp`, x: 825, y: 339, w: 825, z: 0.74, shadow: true },
  { id: 'roses_right', src: `${A}roses_right.webp`, x: 1857, y: 579, w: 343, z: 0.9, blur: 2.2 },
  { id: 'roses_left', src: `${A}roses_left.webp`, x: 0, y: 541, w: 881, z: 1.0, blur: 3.4 },
];

// ---------------------------------------------------------------- WebGL hall
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }`;
const FS = `
precision mediump float;
varying vec2 uv;
uniform sampler2D img; uniform sampler2D dep;
uniform vec2 view;       // camera offset (-1..1)
uniform vec4 crop;       // uv rect of the painting shown on screen: x, y, w, h
uniform float strength;  // parallax amount in uv
uniform float zoom;      // dolly
uniform float focus;     // focal depth
uniform float blurAmt;   // depth-of-field strength
uniform vec2 texel;
uniform float t;
float D(vec2 q){ return texture2D(dep, q).r; }
void main(){
  vec2 base = crop.xy + uv * crop.zw;
  // dolly: near pixels grow slightly as the camera leans in
  vec2 c = crop.xy + crop.zw * 0.5;
  vec2 q = base;
  // iterative parallax-occlusion search: find the surface the ray actually hits
  float d = D(q);
  for (int i = 0; i < 6; i++) {
    vec2 off = view * strength * (d - 0.35);
    q = base - off - (base - c) * zoom * (d - 0.35);
    d = mix(d, D(q), 0.65);
  }
  vec3 col = texture2D(img, q).rgb;
  // depth of field: blur by distance from the focal plane
  float b = clamp(abs(d - focus) * blurAmt, 0.0, 1.0) * 3.5;
  if (b > 0.15) {
    vec3 acc = col; float n = 1.0;
    for (int k = 0; k < 8; k++) {
      float a = float(k) * 0.785398;
      vec2 o = vec2(cos(a), sin(a)) * texel * b * 1.6;
      acc += texture2D(img, q + o).rgb; acc += texture2D(img, q + o * 0.5).rgb; n += 2.0;
    }
    col = acc / n;
  }
  // a little air between us and the far hall
  col = mix(col, vec3(0.16, 0.10, 0.27), (1.0 - d) * 0.10);
  // candlelight shimmer on the brightest parts (chandeliers)
  float lum = dot(col, vec3(0.3, 0.55, 0.15));
  col += smoothstep(0.62, 0.95, lum) * 0.06 * (0.5 + 0.5 * sin(t * 2.3 + q.x * 40.0 + q.y * 23.0));
  gl_FragColor = vec4(col, 1.0);
}`;

function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function makeGL(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['img', 'dep', 'view', 'crop', 'strength', 'zoom', 'focus', 'blurAmt', 'texel', 't'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  const tex = (unit, image) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    return t;
  };
  return { gl, U, tex };
}

// ---------------------------------------------------------------- stage
let S = null;

function build() {
  const canvas = h('canvas', { class: 'sp-gl', 'aria-hidden': 'true' });
  const fallback = h('img', { class: 'sp-flat', src: `${A}hall.jpg`, alt: '', draggable: 'false' });
  const world = h('div', { class: 'sp-world' });
  const layers = {};
  for (const L of LAYERS) {
    const img = h('img', { class: `sp-img sp-${L.id}`, src: L.src, alt: '', draggable: 'false', decoding: 'async' });
    const wrap = h('div', { class: `sp-layer spl-${L.id}${L.shadow ? ' has-shadow' : ''}` }, L.shadow ? h('div', { class: 'sp-shadow' }) : null, img);
    layers[L.id] = { def: L, wrap, img };
    world.appendChild(wrap);
  }
  const motes = h('canvas', { class: 'sp-motes', 'aria-hidden': 'true' });
  const el = h('div', { class: 'spatial', 'aria-hidden': 'true' }, fallback, canvas, world, motes, h('div', { class: 'sp-vignette' }));
  const s = {
    el, canvas, fallback, world, layers, motes,
    view: { x: 0, y: 0 }, target: { x: 0, y: 0 }, drag: null, tilt: null, scroll: 0, sScroll: 0,
    frame: { scale: 1, left: 0, top: 0, W: 0, H: 0 }, focusX: 0.5, focusY: 0.42, anchorX: 0.5,
    glr: null, ready: false, t0: performance.now(), hover: null,
    moteList: Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() * 6.28, v: 0.15 + Math.random() * 0.5 })),
  };
  // WebGL hall
  try {
    const glr = makeGL(canvas);
    if (glr) {
      Promise.all([loadImg(`${A}hall.jpg`), loadImg(`${A}hall_depth.png`)]).then(([img, dep]) => {
        glr.tex(0, img); glr.tex(1, dep);
        glr.gl.uniform1i(glr.U.img, 0); glr.gl.uniform1i(glr.U.dep, 1);
        glr.gl.uniform2f(glr.U.texel, 1 / img.width, 1 / img.height);
        s.glr = glr; s.ready = true; el.classList.add('gl-on');
      }).catch(() => {});
    }
  } catch { /* stay on the flat fallback */ }
  // input
  window.addEventListener('pointermove', (e) => {
    if (!el.isConnected || e.pointerType === 'touch') return;
    s.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    s.target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  window.addEventListener('deviceorientation', (e) => {
    if (!el.isConnected || e.gamma == null) return;
    if (!s.tilt) s.tilt = { g: e.gamma, b: e.beta };
    s.target.x = Math.max(-1, Math.min(1, (e.gamma - s.tilt.g) / 18));
    s.target.y = Math.max(-1, Math.min(1, (e.beta - s.tilt.b) / 18));
  }, { passive: true });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout(s)) : null;
  if (ro) ro.observe(el);
  requestAnimationFrame(() => tick(s));
  return s;
}

// Fit the 2200×1228 composition to the stage, keeping the couple in view.
function layout(s) {
  const W = s.el.clientWidth; const H = s.el.clientHeight;
  if (!W || !H) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.max(W / CW, H / CH) * 1.1;          // headroom for movement
  const sw = CW * scale; const sh = CH * scale;
  const left = Math.min(0, Math.max(W - sw, W * s.anchorX - s.focusX * sw));
  const top = Math.min(0, Math.max(H - sh, H * 0.46 - s.focusY * sh));
  s.frame = { scale, left, top, W, H };
  s.canvas.width = Math.round(W * dpr * 0.75); s.canvas.height = Math.round(H * dpr * 0.75);
  s.fallback.style.cssText = `width:${sw}px;height:${sh}px;left:${left}px;top:${top}px`;
  s.world.style.cssText = `width:${sw}px;height:${sh}px;left:${left}px;top:${top}px`;
  for (const { def, wrap } of Object.values(s.layers)) {
    wrap.style.left = `${(def.x / CW) * 100}%`; wrap.style.top = `${(def.y / CH) * 100}%`; wrap.style.width = `${(def.w / CW) * 100}%`;
  }
  s.motes.width = W; s.motes.height = H;
}

function tick(s) {
  requestAnimationFrame(() => tick(s));
  if (!s.el.isConnected) return;
  const reduce = st()?.settings.reduceMotion;
  const t = (performance.now() - s.t0) / 1000;
  // idle breathing (a slow figure-eight) so the scene is alive when untouched
  const idleX = reduce ? 0 : Math.sin(t * 0.21) * 0.32;
  const idleY = reduce ? 0 : Math.sin(t * 0.37) * 0.16;
  const tx = reduce ? 0 : s.target.x * 0.85 + idleX * (1 - Math.min(1, Math.abs(s.target.x)));
  const ty = reduce ? 0 : s.target.y * 0.85 + idleY;
  s.view.x += (tx - s.view.x) * 0.055;
  s.view.y += (ty - s.view.y) * 0.055;
  s.sScroll += (s.scroll - s.sScroll) * 0.15;
  const { W, H, scale } = s.frame;
  if (!W) return;
  const scrollPull = Math.min(1, s.sScroll / 500);          // menus rising over the scene
  const vx = s.view.x; const vy = s.view.y - scrollPull * 0.6;
  // pixels of travel for a layer at depth z (relative to the hall's mid plane)
  const travel = Math.min(120, W * 0.075);
  // ---- hall
  if (s.ready && s.glr) {
    const { gl, U } = s.glr;
    gl.viewport(0, 0, s.canvas.width, s.canvas.height);
    const cx = -s.frame.left / (CW * scale); const cy = -s.frame.top / (CH * scale);
    gl.uniform4f(U.crop, cx, cy, W / (CW * scale), H / (CH * scale));
    gl.uniform2f(U.view, vx, vy);
    gl.uniform1f(U.strength, (travel / (CW * scale)) * 1.5);
    gl.uniform1f(U.zoom, 0.035 + scrollPull * 0.02);
    gl.uniform1f(U.focus, 0.78 - scrollPull * 0.35);        // focus on the couple; slides back as menus rise
    gl.uniform1f(U.blurAmt, 1.6 + scrollPull * 2.5);
    gl.uniform1f(U.t, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } else {
    s.fallback.style.transform = `translate3d(${(-vx * travel * 0.25).toFixed(2)}px, ${(-vy * travel * 0.15).toFixed(2)}px, 0)`;
  }
  // ---- floating layers: translate by depth, slight scale for near ones, focus falloff
  for (const { def, wrap } of Object.values(s.layers)) {
    const z = def.z - 0.35;
    const x = -vx * travel * z;
    const y = -vy * travel * 0.6 * z - s.sScroll * z * 0.25;
    const sc = 1 + z * 0.02 * Math.abs(vx) + scrollPull * z * 0.03;
    const dof = def.blur ? def.blur + scrollPull * 3 : (s.hover && s.hover !== def.id ? 2.2 : scrollPull * 3.2 * (def.z - 0.55));
    wrap.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
    wrap.style.setProperty('--dof', `${Math.max(0, dof).toFixed(2)}px`);
  }
  // ---- moonlight motes through the volume
  const ctx = s.motes.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  for (const m of s.moteList) {
    if (!reduce) { m.y -= 0.0003 * m.v * (0.4 + m.z); m.s += 0.01; if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); } }
    const px = (m.x + Math.sin(m.s) * 0.01) * W - vx * travel * (m.z * 1.4 - 0.3);
    const py = m.y * H - vy * travel * 0.6 * (m.z * 1.4 - 0.3);
    const r = 0.6 + m.z * 2.6;
    const blur = Math.abs(m.z - 0.55) * 7;
    const g = ctx.createRadialGradient(px, py, 0, px, py, r + blur);
    const a = (0.35 + 0.4 * Math.sin(m.s * 1.7) ** 2) * (1 - Math.abs(m.z - 0.55) * 0.9);
    g.addColorStop(0, `rgba(236,222,255,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(236,222,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r + blur, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------------------------------------------------------------- public API
export function spatialStage({ focusX = 0.5, focusY = 0.42, anchorX = 0.5 } = {}) {
  if (!S) S = build();
  S.focusX = focusX; S.focusY = focusY; S.anchorX = anchorX;
  requestAnimationFrame(() => layout(S));
  return S;
}

export function bindSpatialScroll(el) {
  if (!S) return;
  const upd = () => { S.scroll = el.scrollTop; };
  el.addEventListener('scroll', upd, { passive: true }); upd();
  // Drag / swipe on empty parts of the screen to look around.
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || e.target.closest('button, a')) return;
    S.drag = { x: e.clientX, y: e.clientY, vx: S.target.x, vy: S.target.y };
  }, { passive: true });
  el.addEventListener('pointermove', (e) => {
    if (!S.drag) return;
    S.target.x = Math.max(-1, Math.min(1, S.drag.vx + (e.clientX - S.drag.x) / 160));
    S.target.y = Math.max(-1, Math.min(1, S.drag.vy + (e.clientY - S.drag.y) / 400));
  }, { passive: true });
  const end = () => { if (S.drag) { S.drag = null; setTimeout(() => { if (!S.drag) { S.target.x *= 0.4; S.target.y *= 0.4; } }, 1200); } };
  el.addEventListener('pointerup', end, { passive: true });
  el.addEventListener('pointercancel', end, { passive: true });
}

// iOS asks permission for motion sensors; call from a tap.
export async function enableTilt() {
  try {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') await D.requestPermission();
    return true;
  } catch { return false; }
}

const alphaCache = {};
function alphaMap(img) {
  if (alphaCache[img.src]) return alphaCache[img.src];
  if (!img.complete || !img.naturalWidth) return null;
  try {
    const c = document.createElement('canvas'); c.width = img.naturalWidth >> 2; c.height = img.naturalHeight >> 2;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, c.width, c.height);
    alphaCache[img.src] = { w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data };
  } catch { alphaCache[img.src] = { none: true }; }
  return alphaCache[img.src];
}

// Which character is under a screen point (pixel-accurate).
export function spatialPick(x, y) {
  if (!S || !S.el.isConnected) return null;
  for (const id of ['astoria', 'lucien']) {
    const { img } = S.layers[id];
    const r = img.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const m = alphaMap(img);
    if (!m || m.none) return id;
    const u = Math.floor(((x - r.left) / r.width) * m.w); const v = Math.floor(((y - r.top) / r.height) * m.h);
    if (m.data[(v * m.w + u) * 4 + 3] > 120) return id;
  }
  return null;
}

export function spatialHover(id) {
  if (!S) return;
  S.hover = id;
  S.el.classList.toggle('hover-lucien', id === 'lucien');
  S.el.classList.toggle('hover-astoria', id === 'astoria');
}
