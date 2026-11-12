/* Small shared helpers. Everything in the game hangs off one global: DL. */
window.DL = window.DL || {};

DL.util = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function clock() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  const yen = (n) => '¥' + Math.round(n).toLocaleString('ja-JP');

  /* Fill {name}, {time}, {day} and run the tiny markup:
       *word*   → emphasis
       [[word]] → corrupted "system" text                              */
  function format(text, state) {
    let t = typeof text === 'function' ? text(state) : String(text);
    t = esc(t);
    const name = esc((state && state.name) || 'you');
    t = t.replace(/\{name\}/g, name)
      .replace(/\{time\}/g, clock())
      .replace(/\{day\}/g, state ? String(state.day) : '1')
      .replace(/\{NAME\}/g, name.toUpperCase());
    t = t.replace(/\[\[(.+?)\]\]/g, '<span class="g">$1</span>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return t;
  }

  /* Plain-text version (for scrambles and phone bubbles). */
  function plain(text, state) {
    const tmp = document.createElement('div');
    tmp.innerHTML = format(text, state);
    return tmp.textContent;
  }

  function once(target, type) {
    return new Promise((r) => target.addEventListener(type, r, { once: true }));
  }

  return { $, $$, el, wait, clamp, rand, randi, pick, esc, clock, yen, format, plain, once };
})();
