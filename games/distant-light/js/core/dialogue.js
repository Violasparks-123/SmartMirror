/* The dialogue box: typewriter text, advancing, auto/skip, choices, the backlog,
   and the "rewrite" mechanic where a line edits itself and can be remembered. */
DL.Dialogue = (() => {
  const { $, el, wait, format, plain } = DL.util;
  const box = () => $('#textbox');
  const nameEl = () => $('#namebox');
  const textEl = () => $('#text');

  let waiter = null;       // resolves the current "click to continue"
  let typing = null;       // { finish() } while text is still appearing
  let locked = false;      // ignore clicks during scripted moments
  let auto = false, skip = false;
  const log = [];

  /* ---------- input ---------- */
  function advance() {
    if (locked || DL.Screens.blocking()) return;
    DL.Audio.init();
    if (typing) { typing.finish(); return; }
    if (waiter) { const w = waiter; waiter = null; w(); }
  }

  function bind() {
    $('#catcher').addEventListener('click', advance);
    box().addEventListener('click', (e) => { if (!e.target.closest('#recall')) advance(); });
    document.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (DL.Screens.blocking()) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if ($('#choices').hidden) { e.preventDefault(); advance(); }
      } else if (e.key === 'Control' && !e.repeat) {
        setSkip(true, true);
      } else if (e.key.toLowerCase() === 'r' && !$('#recall').hidden) {
        $('#recall').click();
      }
    });
    document.addEventListener('keyup', (e) => { if (e.key === 'Control') setSkip(false); });
  }

  function setAuto(v) {
    auto = v; if (v) skip = false;
    syncQuick();
    if (v && waiter && !typing) scheduleAuto();
  }
  let skipHeld = false;
  function setSkip(v, held) {
    skip = v; skipHeld = !!held && v;
    if (v) auto = false;
    syncQuick();
    if (v && !locked && $('#recall').hidden) { if (typing) typing.finish(); if (waiter) { const w = waiter; waiter = null; w(); } }
  }
  function syncQuick() {
    const a = document.querySelector('#quick [data-q="auto"]'), k = document.querySelector('#quick [data-q="skip"]');
    if (a) a.classList.toggle('on', auto);
    if (k) k.classList.toggle('on', skip);
  }

  /* ---------- typewriter ---------- */
  function wrapChars(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const spans = [];
    for (const n of nodes) {
      const frag = document.createDocumentFragment();
      for (const ch of n.textContent) {
        const sp = document.createElement('span');
        sp.className = 'ch';
        sp.textContent = ch;
        frag.appendChild(sp);
        spans.push(sp);
      }
      n.parentNode.replaceChild(frag, n);
    }
    return spans;
  }

  function typeHTML(html) {
    const t = textEl();
    t.innerHTML = html;
    const spans = wrapChars(t);
    const cps = DL.State.settings.textSpeed;
    if (skip || cps >= 95) { spans.forEach((s) => s.classList.add('on')); return Promise.resolve(); }
    return new Promise((resolve) => {
      const start = performance.now();
      let shown = 0, raf = 0;
      const done = () => { cancelAnimationFrame(raf); spans.forEach((s) => s.classList.add('on')); typing = null; resolve(); };
      typing = { finish: done };
      const tick = (now) => {
        const target = Math.min(spans.length, Math.floor(((now - start) / 1000) * cps) + 1);
        while (shown < target) spans[shown++].classList.add('on');
        if (shown >= spans.length) done();
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  }

  let autoTimer = null;
  function scheduleAuto(len = 40) {
    clearTimeout(autoTimer);
    const ms = DL.State.settings.autoDelay * 1000 + len * 28;
    autoTimer = setTimeout(() => { if (auto && waiter && !locked && $('#recall').hidden) { const w = waiter; waiter = null; w(); } }, ms);
  }

  function waitAdvance(len) {
    $('#nextind').classList.add('on');
    return new Promise((resolve) => {
      waiter = () => { $('#nextind').classList.remove('on'); DL.Audio.sfx('blip'); resolve(); };
      // Never skip or auto-advance past a line you could still remember.
      const recallOpen = () => !$('#recall').hidden;
      if (skip && !recallOpen()) setTimeout(() => { if (waiter && skip && !recallOpen()) { const w = waiter; waiter = null; w(); } }, 45);
      else if (auto && !recallOpen()) scheduleAuto(len);
    });
  }

  /* ---------- say ---------- */
  async function say(line) {
    const s = DL.State.s;
    box().hidden = false;
    box().classList.remove('recovered');
    const n = nameEl();
    n.textContent = line.label || '';
    n.className = (line.plate || '') + (line.glitchName ? ' glitchname' : '');
    const t = textEl();
    t.className = line.who ? `who-${line.who}` : 'narration';
    DL.Stage.focus(line.who && DL.Stage.has(line.who) ? line.who : null);

    const html = format(line.text, s);
    await typeHTML(html);
    const entry = { label: line.label || '', plate: line.plate || 'none', html };
    log.push(entry);
    if (log.length > 160) log.shift();

    if (line.rewrite) await rewrite(line, entry, html);
    await waitAdvance(t.textContent.length);
    if (line.rewrite) cleanupRewrite(line);
  }

  let recallCleanup = null;
  async function rewrite(line, entry, trueHTML) {
    const s = DL.State.s;
    const rw = line.rewrite;
    const t = textEl();
    locked = true;
    if (skip) setSkip(false);
    if (auto) setAuto(false);
    const truePlain = t.textContent;
    const fakeHTML = format(rw.fake, s);
    const fakePlain = plain(rw.fake, s);
    await wait(rw.delay ?? 750);
    DL.Audio.sfx('static');
    DL.FX.tear(200, 0.45);
    t.classList.add('scrambling');
    await DL.FX.scramble(t, truePlain, fakePlain, 650);
    t.classList.remove('scrambling');
    t.innerHTML = fakeHTML;
    t.classList.add('rewritten');
    entry.html = fakeHTML;
    locked = false;

    if (rw.noRecall || !rw.frag || DL.State.hasFrag(rw.frag)) return;
    const btn = $('#recall');
    btn.hidden = false;
    if (!DL.State.s.flags.recallTaught) {
      DL.State.s.flags.recallTaught = true;
      DL.Screens.toast('Something changed. Tap “Remember” before you move on.', 'blue', 4200);
    }
    const onRecall = async (e) => {
      e.stopPropagation();
      btn.hidden = true;
      locked = true;
      DL.Audio.sfx('chime');
      t.classList.remove('rewritten');
      t.classList.add('scrambling');
      await DL.FX.scramble(t, fakePlain, truePlain, 520);
      t.classList.remove('scrambling');
      t.innerHTML = trueHTML;
      box().classList.add('recovered');
      if (!s.frags.includes(rw.frag)) s.frags.push(rw.frag);
      entry.html = trueHTML; entry.true = true;
      DL.Screens.toast(`Line remembered · ${s.frags.length} / ${DL.Data.FRAG_TOTAL}`, 'blue');
      if (rw.frag && rw.trust !== 0) DL.State.add({ trust: rw.trust ?? 1 });
      locked = false;
    };
    btn.addEventListener('click', onRecall, { once: true });
    recallCleanup = () => btn.removeEventListener('click', onRecall);
  }

  function cleanupRewrite(line) {
    const btn = $('#recall');
    if (!btn.hidden) {
      btn.hidden = true;
      const s = DL.State.s;
      if (line.rewrite.frag && !s.frags.includes(line.rewrite.frag) && !s.missed.includes(line.rewrite.frag)) s.missed.push(line.rewrite.frag);
    }
    if (recallCleanup) { recallCleanup(); recallCleanup = null; }
    textEl().classList.remove('rewritten');
    box().classList.remove('recovered');
  }

  /* ---------- choices ---------- */
  function choose(options, prompt) {
    if (skip && !skipHeld) setSkip(false);
    if (auto) setAuto(false);
    const wrap = $('#choices');
    wrap.innerHTML = '';
    if (prompt) wrap.appendChild(el('div', 'prompt', format(prompt, DL.State.s)));
    return new Promise((resolve) => {
      const buttons = [];
      options.forEach((o, i) => {
        const b = el('button', 'choice' + (o.locked ? ' locked' : ''));
        b.type = 'button';
        b.style.animationDelay = i * 60 + 'ms';
        const label = format(o.text, DL.State.s);
        b.innerHTML = `<span class="lbl">${label}</span>${o.locked ? `<span class="why">${format(o.why || '', DL.State.s)}</span>` : ''}<span class="key">${i + 1}</span>`;
        if (o.hover) {
          const alt = format(o.hover, DL.State.s);
          b.addEventListener('mouseenter', () => { b.querySelector('.lbl').innerHTML = alt; DL.Audio.sfx('static'); });
          b.addEventListener('mouseleave', () => { b.querySelector('.lbl').innerHTML = label; });
        } else {
          b.addEventListener('mouseenter', () => DL.Audio.sfx('blip'));
        }
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          if (o.locked) { DL.Audio.sfx('thud'); return; }
          DL.Audio.sfx('select');
          finish(i);
        });
        wrap.appendChild(b);
        buttons.push(b);
      });
      const onKey = (e) => {
        if (DL.Screens.blocking()) return;
        const k = parseInt(e.key, 10);
        if (k >= 1 && k <= options.length && !options[k - 1].locked) { DL.Audio.sfx('select'); finish(k - 1); }
      };
      function finish(i) {
        document.removeEventListener('keydown', onKey);
        wrap.hidden = true;
        wrap.innerHTML = '';
        const picked = options[i];
        log.push({ label: DL.State.s.name, plate: 'cream', html: '→ ' + format(picked.text, DL.State.s) });
        resolve(i);
      }
      document.addEventListener('keydown', onKey);
      wrap.hidden = false;
      setTimeout(() => buttons.find((b) => !b.classList.contains('locked'))?.focus({ preventScroll: true }), 50);
    });
  }

  function hide() { box().hidden = true; $('#choices').hidden = true; DL.Stage.focus(null); }
  function reset() { hide(); log.length = 0; setAuto(false); setSkip(false); waiter = null; typing = null; locked = false; }

  return {
    bind, say, choose, hide, reset, advance, setAuto, setSkip,
    get log() { return log; }, get auto() { return auto; }, get skip() { return skip; },
    set locked(v) { locked = v; }, get locked() { return locked; },
  };
})();
