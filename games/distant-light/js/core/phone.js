/* The phone: evening group chats and DMs. Messages arrive one by one;
   some of them edit themselves too. */
DL.Phone = (() => {
  const { el, wait, format, plain, clock } = DL.util;
  let root = null, msgs = null, replies = null, hurry = false;

  function speaker(from) {
    const C = DL.Data.CHAR[from] || {};
    return { label: typeof C.name === 'function' ? C.name(DL.State.s) : (C.name || from), plate: C.plate || 'none' };
  }

  async function open(title, o = {}) {
    if (root) close(true);
    DL.Dialogue.hide();
    root = el('div', 'phone-wrap screen fade');
    const color = o.color || 'linear-gradient(135deg, var(--pink), var(--blue))';
    root.innerHTML = `<div class="phone" role="dialog" aria-label="Phone">
        <div class="screen-in">
          <div class="bar"><span>${clock()}</span><span>◔ ▮▮▮</span></div>
          <div class="head">${o.avatar
            ? `<div class="avatar face" style="background-image:url('${o.avatar}')" role="img" aria-label=""></div>`
            : `<div class="avatar" style="background:${color}">${DL.util.esc(o.initial || title.trim()[0] || '?')}</div>`}
            <div><b>${format(title, DL.State.s)}</b><span>${format(o.sub || '', DL.State.s)}</span></div></div>
          <div class="msgs"></div>
          <div class="replies"></div>
        </div></div>`;
    document.querySelector('#screens').appendChild(root);
    msgs = root.querySelector('.msgs');
    replies = root.querySelector('.replies');
    msgs.addEventListener('click', () => { hurry = true; });
    DL.Audio.sfx('ping');
    await wait(450);
  }

  function scroll() { msgs.scrollTop = msgs.scrollHeight; }

  async function typingDots(ms) {
    const t = el('div', 'typing', '<i></i><i></i><i></i>');
    msgs.appendChild(t); scroll();
    const end = performance.now() + (DL.Dialogue.skip ? 120 : ms);
    hurry = false;
    while (performance.now() < end && !hurry) await wait(40);
    t.remove();
  }

  async function msg(from, text, o = {}) {
    const s = DL.State.s;
    const mine = from === 'me';
    const plainText = plain(text, s);
    if (!mine) await typingDots(o.typing ?? Math.min(1700, 450 + plainText.length * 22));
    const b = el('div', 'bubble ' + (mine ? 'me' : 'them'));
    const who = speaker(from);
    const face = DL.Sprites.face(from);
    const head = !mine && o.group ? `<span class="from ${who.plate}">${face ? `<img class="mini" src="${face}" alt="">` : ''}${DL.util.esc(who.label)}</span>` : '';
    if (o.deleted) {
      b.classList.add('deleted');
      b.innerHTML = head + 'This message was deleted.';
    } else {
      const vn = o.voice ? `<span class="vn"><i class="play">▶</i><span class="wave">${Array.from({ length: 22 }, (_, k) => `<b style="height:${4 + Math.round(Math.abs(Math.sin(k * 1.7 + plainText.length)) * 16)}px"></b>`).join('')}</span><small>0:${String(Math.min(59, 3 + Math.round(plainText.length / 9))).padStart(2, '0')}</small></span>` : '';
      if (o.voice) b.classList.add('voice');
      b.innerHTML = head + vn + `<span class="t">${format(text, s)}</span>`;
    }
    msgs.appendChild(b); scroll();
    DL.Audio.sfx(mine ? 'send' : 'ping');
    DL.Dialogue.log.push({ label: mine ? s.name : who.label, plate: mine ? 'cream' : who.plate, html: o.deleted ? '<i>(deleted)</i>' : format(text, s) });

    if (o.deleteAfter) {
      await wait(DL.Dialogue.skip ? 300 : o.deleteAfter);
      DL.Audio.sfx('static');
      b.classList.add('deleted');
      b.innerHTML = head + 'This message was deleted.';
    }
    if (o.rewrite) await rewrite(b, head, text, o.rewrite);
    await wait(DL.Dialogue.skip ? 60 : 280);
  }

  async function rewrite(b, head, text, rw) {
    const s = DL.State.s;
    const span = b.querySelector('.t');
    const truePlain = plain(text, s), fakePlain = plain(rw.fake, s);
    await wait(rw.delay ?? 1100);
    DL.Audio.sfx('static');
    await DL.FX.scramble(span, truePlain, fakePlain, 600);
    span.innerHTML = format(rw.fake, s);
    b.classList.add('rewritten');
    if (rw.noRecall || !rw.frag) return;
    const btn = el('button', 'recall-mini', '↺ Remember');
    btn.type = 'button';
    b.appendChild(btn); scroll();
    let recovered = false;
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      btn.remove();
      DL.Audio.sfx('chime');
      await DL.FX.scramble(span, fakePlain, truePlain, 500);
      span.innerHTML = format(text, s);
      b.classList.remove('rewritten');
      b.classList.add('recovered');
      if (!s.frags.includes(rw.frag)) s.frags.push(rw.frag);
      DL.State.add({ trust: 1 });
      recovered = true;
      DL.Screens.toast(`Line remembered · ${s.frags.length} / ${DL.Data.FRAG_TOTAL}`, 'blue');
    });
    // Hold the conversation here until the player moves on.
    await choiceButtons([{ text: 'Keep reading' }]);
    if (!recovered) { btn.remove(); if (!s.missed.includes(rw.frag)) s.missed.push(rw.frag); }
  }

  function note(text) {
    const n = el('div', 'note', format(text, DL.State.s));
    msgs.appendChild(n); scroll();
    return wait(DL.Dialogue.skip ? 60 : 650);
  }

  function choiceButtons(options, cls) {
    replies.innerHTML = '';
    return new Promise((resolve) => {
      options.forEach((o, i) => {
        const b = el('button', cls || '', format(o.text, DL.State.s) + (o.locked ? ` <small>(${format(o.why || '', DL.State.s)})</small>` : ''));
        b.type = 'button';
        if (o.locked) b.disabled = true;
        b.addEventListener('click', () => { DL.Audio.sfx('select'); replies.innerHTML = ''; resolve(i); });
        replies.appendChild(b);
      });
      replies.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
    });
  }

  async function reply(options) {
    const i = await choiceButtons(options);
    const o = options[i];
    if (o.send !== false) await msg('me', o.send || o.text);
    return i;
  }

  async function close(immediate) {
    if (!root) return;
    if (!immediate) await choiceButtons([{ text: 'Put the phone down' }], 'close');
    root.remove();
    root = null; msgs = null; replies = null;
  }

  return { open, msg, note, reply, close, get active() { return !!root; } };
})();
