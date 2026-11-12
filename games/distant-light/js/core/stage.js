/* The stage: fits the 1280×720 scene into any window, swaps backgrounds,
   and places character sprites. */
DL.Stage = (() => {
  const { $, el, wait } = DL.util;
  const W = 1280, H = 720;
  let scale = 1;

  function fit() {
    const app = $('#app'), box = $('#stage-box'), stage = $('#stage');
    const cs = getComputedStyle(app);
    const aw = app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = app.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    scale = Math.max(0.1, Math.min(aw / W, ah / H));
    box.style.width = W * scale + 'px';
    box.style.height = H * scale + 'px';
    stage.style.transform = `scale(${scale})`;
    const hint = $('#rotate-hint');
    if (hint) hint.hidden = !(window.innerHeight > window.innerWidth * 1.15 && window.innerWidth < 700);
  }

  /* ---------- Backgrounds ---------- */
  const cache = new Map();
  function src(id, variant) { return variant ? `assets/glitch/${id}_${variant}.webp` : `assets/bg/${id}.webp`; }
  function preload(url) {
    if (cache.has(url)) return cache.get(url);
    const p = new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = url;
    });
    cache.set(url, p);
    return p;
  }

  let front = 'A', current = { id: null, variant: null }, currentImg = null;
  async function setBg(id, o = {}) {
    let variant = o.variant ?? null;
    if (o.variant === undefined && !o.clean) {
      const c = DL.State.corruption();
      if (c >= 3) variant = 'g1';
    }
    if (current.id === id && current.variant === variant && !o.force) return;
    const url = src(id, variant);
    const img = await preload(url);
    currentImg = img;
    const nextKey = front === 'A' ? 'B' : 'A';
    const a = $('#bg' + front), b = $('#bg' + nextKey);
    b.style.transition = `opacity ${o.fade ?? 600}ms ease`;
    b.style.backgroundImage = `url("${url}")`;
    b.classList.toggle('kenburns', !!o.kenburns);
    b.classList.add('on');
    a.classList.remove('on');
    front = nextKey;
    current = { id, variant };
    if (o.wait !== false) await wait(Math.min(o.fade ?? 600, 700));
  }
  /* Flash a different version of the current background for a moment. */
  async function flicker(variant = 'g2', ms = 110) {
    if (!current.id) return;
    const url = src(current.id, variant);
    await preload(url);
    const a = $('#bg' + front);
    const prev = a.style.backgroundImage, prevT = a.style.transition;
    a.style.transition = 'none';
    a.style.backgroundImage = `url("${url}")`;
    await wait(ms);
    a.style.backgroundImage = prev;
    a.style.transition = prevT;
  }
  function clearBg() {
    $('#bgA').classList.remove('on'); $('#bgB').classList.remove('on');
    current = { id: null, variant: null };
  }

  /* ---------- Sprites ---------- */
  const POS = { farleft: 0.17, left: 0.28, center: 0.5, right: 0.72, farright: 0.83 };
  const sprites = new Map();

  function show(who, expr = 'neutral', pos, o = {}) {
    let sp = sprites.get(who);
    const x = POS[pos || (sp && sp.pos) || 'center'] ?? 0.5;
    const art = DL.Sprites.art(who);
    if (!sp) {
      const node = el('div', 'sprite enter' + (art ? ' art' : ''));
      node.dataset.who = who;
      node.innerHTML = DL.Sprites.html(who, expr, o.acc || '');
      node.style.left = x * W + 'px';
      if (art) {
        node.style.width = art.w + 'px';
        node.style.height = art.h + 'px';
        node.style.marginLeft = -art.w * art.anchor + 'px';
        node.style.bottom = art.bottom + 'px';
      }
      $('#sprites').appendChild(node);
      sp = { node, expr, pos: pos || 'center', acc: o.acc || '' };
      sprites.set(who, sp);
      if (art) setMood(node, expr);
      requestAnimationFrame(() => requestAnimationFrame(() => node.classList.remove('enter')));
    } else {
      sp.node.classList.remove('erasing');
      const accChanged = o.acc !== undefined && o.acc !== sp.acc;
      if (accChanged) sp.acc = o.acc;
      if (art) {
        if (accChanged) sp.node.innerHTML = DL.Sprites.html(who, expr || sp.expr, sp.acc);
        if (expr && (expr !== sp.expr || accChanged)) setMood(sp.node, expr);
        if (expr && expr !== sp.expr) { const img = sp.node.querySelector('img.art'), want = DL.Sprites.srcFor(who, expr); if (img && want && !img.src.endsWith(want)) img.src = want; }
        if (expr) sp.expr = expr;
      } else if (expr && (expr !== sp.expr || accChanged)) {
        sp.node.innerHTML = DL.Sprites.html(who, expr, sp.acc);
        sp.expr = expr;
      }
      if (pos) { sp.pos = pos; sp.node.style.left = x * W + 'px'; }
    }
    layout();
    // Visual options stick until a later show() changes them (dialogue lines only change the expression).
    if ('flip' in o) sp.node.classList.toggle('flip', !!o.flip);
    if ('ghost' in o) sp.node.classList.toggle('ghost', !!o.ghost);
    if ('glitch' in o) sp.node.classList.toggle('glitching', !!o.glitch);
    if ('opacity' in o) sp.node.style.opacity = o.opacity ?? '';
  }

  /* With three people on stage, push the side characters further out so nobody hides anybody. */
  function layout() {
    const spread = sprites.size >= 3;
    for (const [, sp] of sprites) {
      let pos = sp.pos;
      if (spread && pos === 'left') pos = 'farleft';
      if (spread && pos === 'right') pos = 'farright';
      sp.node.style.left = (POS[pos] ?? 0.5) * W + 'px';
    }
  }

  /* Hand-drawn portraits have one face, so expressions become a little movement. */
  function setMood(node, expr) {
    node.className = node.className.replace(/\bmood-\S+/g, '').trim();
    void node.offsetWidth; // restart the animation even if the mood repeats
    node.classList.add('mood-' + (expr || 'neutral'));
  }

  async function hide(who, o = {}) {
    const sp = sprites.get(who);
    if (!sp) return;
    sprites.delete(who);
    layout();
    if (o.erase) {
      sp.node.classList.add('erasing');
      DL.Audio.sfx('tear');
      await wait(DL.State.settings.reduceFlash ? 900 : 2400);
    } else {
      sp.node.classList.add('enter');
      await wait(380);
    }
    sp.node.remove();
  }
  function hideAll() {
    for (const [, sp] of sprites) sp.node.remove();
    sprites.clear();
  }
  function focus(who) {
    for (const [k, sp] of sprites) sp.node.classList.toggle('dim', !!who && k !== who && sprites.has(who));
  }
  function has(who) { return sprites.has(who); }

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 200));

  return {
    fit, setBg, flicker, clearBg, preload, src, show, hide, hideAll, focus, has,
    get current() { return current; }, get img() { return currentImg; }, W, H,
  };
})();
