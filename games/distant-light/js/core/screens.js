/* Every full-screen or pop-up interface: title, content note, name entry, planner,
   diary, shop, settings, backlog, confirmations, day cards, endings and credits. */
DL.Screens = (() => {
  const { $, el, wait, format, esc, yen } = DL.util;
  const layer = () => $('#screens');

  function blocking() { return !!layer().querySelector('.screen'); }

  function mount(node) { layer().appendChild(node); return node; }

  function toast(text, kind = '', ms = 2600) {
    const t = el('div', 'toast ' + kind, esc(text));
    t.style.animationDuration = ms + 'ms';
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), ms + 50);
  }

  /* ---------- HUD ---------- */
  const SLOT_NAMES = { morning: 'Morning', lunch: 'Lunch', after: 'After school', evening: 'Evening', night: 'Night' };
  function hud(show = true) {
    const h = $('#hud');
    h.hidden = !show;
    if (!show || !DL.State.s) return;
    const s = DL.State.s, x = s.xday && DL.Data.XDAYS && DL.Data.XDAYS[s.xday], d = (DL.Data.dayInfo ? DL.Data.dayInfo(s) : null) || DL.Data.DAYS[s.day - 1] || DL.Data.DAYS[0];
    const slot = x && x.town ? ({ lunch: x.am, after: x.pm, night: 'Night' }[s.phase] || 'Morning') : (SLOT_NAMES[s.phase] || '');
    $('#hud-day').innerHTML = `<span>${x ? x.label : 'Day ' + s.day}</span><span class="jp">${d.jp}</span><span>${d.date}</span><span class="slot">${slot}</span>`;
  }

  /* ---------- confirm ---------- */
  function confirm(title, text, yes = 'Yes', no = 'Cancel') {
    return new Promise((resolve) => {
      const m = mount(el('div', 'modal screen fade'));
      m.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><h2>${esc(title)}</h2><p>${esc(text)}</p>
        <div class="actions"><button type="button" class="btn small" data-a="no">${esc(no)}</button><button type="button" class="btn small primary" data-a="yes">${esc(yes)}</button></div></div>`;
      m.querySelector('[data-a=yes]').onclick = () => { m.remove(); resolve(true); };
      m.querySelector('[data-a=no]').onclick = () => { m.remove(); resolve(false); };
      m.querySelector('[data-a=no]').focus();
    });
  }

  /* ---------- content note ---------- */
  function warning() {
    return new Promise((resolve) => {
      const st = DL.State.settings;
      const m = mount(el('div', 'warning-screen screen fade'));
      m.innerHTML = `<div class="panel" role="dialog" aria-modal="true">
        <h2>Before you start <span class="jp">ご注意</span></h2>
        <p>遥かな光 (Distant Light) starts as a sweet school life sim. It doesn't stay that way.</p>
        <p>It's a psychological horror story with bullying, manipulation between sisters, unsettling images, and screen effects that flicker and flash. It also talks to you, the player, directly.</p>
        <label class="toggle" for="w-calm"><input type="checkbox" id="w-calm" ${st.reduceFlash ? 'checked' : ''}> Reduce flashing and screen shake</label>
        <p class="hint">You can change this any time in Settings.</p>
        <div class="actions"><button type="button" class="btn primary" id="w-ok">I understand</button></div></div>`;
      m.querySelector('#w-calm').onchange = (e) => { st.reduceFlash = e.target.checked; DL.State.saveSettings(); };
      m.querySelector('#w-ok').onclick = () => { DL.Audio.init(); DL.State.meta.warned = true; DL.State.saveMeta(); m.remove(); resolve(); };
      m.querySelector('#w-ok').focus();
    });
  }

  /* ---------- title ---------- */
  function title() {
    return new Promise((resolve) => {
      const meta = DL.State.meta;
      const last = meta.last;
      const bgId = last === 'good' ? 'station' : last === 'bad' ? 'sisters_room' : 'gate';
      const bgSrc = last === 'bad' ? DL.Stage.src('sisters_room', 'g1') : DL.Stage.src(bgId);
      const m = mount(el('div', 'title-screen screen fade' + (last === 'bad' ? ' dark' : '')));
      const gems = Object.keys(DL.Data.ENDINGS).map((k) => `<i class="gem ${meta.endings.includes(k) ? 'got' : ''}" title="${meta.endings.includes(k) ? esc(DL.Data.ENDINGS[k].title) : 'Not found yet'}"></i>`).join('');
      let whisper = '';
      if (meta.leftMidway) whisper = 'you left in the middle of the day. she noticed.';
      else if (last === 'bad') whisper = 'she kept the light on for you.';
      else if (last === 'neutral') whisper = 'it starts over sweet. it always does.';
      m.innerHTML = `
        <div class="bgimg kenburns" style="background-image:url('${bgSrc}')"></div>
        <div class="shade"></div><div class="glow"></div>
        <img class="title-logo ${last === 'bad' ? 'erased' : ''}" src="assets/ui/${last === 'bad' ? 'logo_erased' : 'logo'}.png" alt="遥かな光 Distant Light">
        <div class="title-menu">
          <button type="button" class="btn primary" data-a="new">${last === 'bad' ? 'Start over' : 'New game'}</button>
          <button type="button" class="btn" data-a="continue" ${DL.State.hasSave() || last === 'bad' ? '' : 'disabled'}>${last === 'bad' ? 'Stay' : 'Continue'}</button>
          <button type="button" class="btn" data-a="arcade">Arcade</button>
          <button type="button" class="btn" data-a="trophies">Trophies ${(meta.trophies || []).length}/${DL.Extras.TROPHIES.length}</button>
          <button type="button" class="btn" data-a="gallery">Endings ${meta.endings.length}/${Object.keys(DL.Data.ENDINGS).length}</button>
          <button type="button" class="btn" data-a="settings">Settings</button>
        </div>
        ${whisper ? `<div class="title-whisper">${esc(whisper)}</div>` : ''}
        <div class="title-foot"><span>Prototype · Sakuragaoka High, class 2-B</span><span class="endings">Endings ${gems}</span></div>`;
      m.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', async () => {
        DL.Audio.init();
        DL.Audio.sfx('select');
        const a = b.dataset.a;
        if (a === 'settings') { await settings(); return; }
        if (a === 'gallery') { await gallery(); return; }
        if (a === 'arcade') { await DL.Arcade.menu(); return; }
        if (a === 'trophies') { await DL.Apps.open('trophies', { only: true }); return; }
        if (meta.leftMidway) { meta.leftMidway = false; DL.State.saveMeta(); }
        m.remove();
        resolve(a);
      }));
      DL.Audio.setMood(last === 'bad' ? 'drone' : 'calm');
    });
  }

  /* ---------- name entry ---------- */
  function nameEntry() {
    return new Promise((resolve) => {
      const m = mount(el('div', 'modal screen fade'));
      m.innerHTML = `<form class="panel" id="name-form" autocomplete="off">
        <h2>Your name <span class="jp">名前</span></h2>
        <p>You're the new transfer student in class 2-B. What should everyone call you?</p>
        <input type="text" id="name-input" maxlength="12" value="Sora" aria-label="Your name" spellcheck="false">
        <div class="err" id="name-err"></div>
        <div class="actions"><button type="button" class="btn small" data-a="back">Back</button><button type="submit" class="btn primary">Start school</button></div>
      </form>`;
      const input = m.querySelector('#name-input'), err = m.querySelector('#name-err');
      setTimeout(() => { input.focus(); input.select(); }, 60);
      m.querySelector('[data-a=back]').onclick = () => { m.remove(); resolve(null); };
      m.querySelector('#name-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value.trim().replace(/\s+/g, ' ');
        if (!v) { err.textContent = 'Type at least one letter.'; return; }
        if (!/^[\p{L}\p{N} .'\-]+$/u.test(v)) { err.textContent = 'Use letters, numbers, spaces, dots or dashes.'; return; }
        if (/^(haruka|hikaru)$/i.test(v)) { err.textContent = 'That name is already taken. Twice, really.'; DL.Audio.sfx('static'); return; }
        m.remove();
        resolve(v);
      });
    });
  }

  /* ---------- which story? ---------- */
  function storyPick() {
    return new Promise((resolve) => {
      const m = mount(el('div', 'modal screen fade'));
      m.innerHTML = `<div class="panel story-pick">
        <h2>Which story? <span class="jp">物語</span></h2>
        <p>You can play the next week two ways.</p>
        <div class="story-cards">
          <button type="button" class="story-card original" data-mode="original">
            <span class="sc-jp">遥かな光</span><b>Distant Light</b>
            <small>The original story. Just you, the Amane twins, Rin, and the town that forgets.</small>
          </button>
          <button type="button" class="story-card mikage" data-mode="mikage">
            <span class="sc-jp">御影</span><b>Distant Light + the Mikage siblings</b>
            <small>Rei and Sei from 2-A join the story. Stalkers. Cannibals. A long table. Extra horror and 3 extra endings.</small>
          </button>
        </div>
        <label class="story-ext"><input type="checkbox" id="ext-week"><span><b>Extended week</b> <span class="jp">延長</span><br>
          <small>For players who want to see everything: Day 0 (moving day), a whole extra school week before the matsuri (seat change, PE, cooking, music class, cleaning day, plus free lunches and after-schools), the Sunday after the matsuri, 10 Sunday-only places, and a new ending.</small></span></label>
        <div class="actions"><button type="button" class="btn small" data-a="back">Back</button></div>
      </div>`;
      m.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => { DL.Audio.sfx('chime'); const ext = m.querySelector('#ext-week').checked; m.remove(); resolve({ mode: b.dataset.mode, extended: ext }); }; });
      m.querySelector('[data-a=back]').onclick = () => { m.remove(); resolve(null); };
    });
  }

  /* ---------- day card ---------- */
  async function dayCard(day, sub, o = {}) {
    const d = (DL.Data.dayInfo && DL.State.s) ? DL.Data.dayInfo(DL.State.s) : DL.Data.DAYS[day - 1];
    const m = mount(el('div', 'daycard screen'));
    m.innerHTML = `<div class="inner"><div class="num">${o.num ?? 'Day ' + day}</div><div class="bar"></div>
      <div class="jp">${o.jp ?? d.jp + '　' + d.date}</div><div class="en">${o.en ?? d.en}</div><div class="sub"></div></div>`;
    DL.Audio.sfx('bell');
    let skipped = false;
    m.addEventListener('click', () => { skipped = true; });
    const subEl = m.querySelector('.sub');
    const numEl = m.querySelector('.num');
    if (o.glitchTo) {
      await waitOrSkip(900, () => skipped);
      DL.Audio.sfx('static');
      await DL.FX.scramble(numEl, numEl.textContent, o.glitchTo, 500);
    }
    if (sub) {
      await waitOrSkip(500, () => skipped);
      subEl.innerHTML = format(sub, DL.State.s);
    }
    await waitOrSkip(DL.Dialogue.skip ? 300 : 1700, () => skipped);
    m.style.transition = 'opacity .4s'; m.style.opacity = 0;
    await wait(400);
    m.remove();
  }
  async function waitOrSkip(ms, isSkipped) {
    const end = performance.now() + ms;
    while (performance.now() < end && !isSkipped()) await wait(30);
  }

  /* ---------- planner ---------- */
  function statRow(label, val, max, cls, text) {
    const pct = Math.max(0, Math.min(100, (val / max) * 100));
    return `<div class="stat"><span class="label">${label}</span><div class="meter ${cls || ''}"><i style="width:${pct}%"></i></div><span class="val">${text ?? val}</span></div>`;
  }
  function pips(n, cls) {
    let h = `<div class="pips ${cls}">`;
    for (let i = 0; i < 10; i++) h += `<i class="${i < n ? 'on' : ''}"></i>`;
    return h + '</div>';
  }

  function sidePanel(s) {
    const d = DL.Data.DAYS[s.day - 1];
    const c = DL.State.corruption();
    const hikaruName = c >= 3 && !DL.State.hikaruHere() ? '<span style="font-family:var(--f-mono);color:var(--system)">H̷i̸k̵a̴r̷u̶</span>' : 'Hikaru';
    const suspKnown = !!s.flags.readNotebook || !!s.flags.suspKnown;
    const items = DL.Data.SHOP.filter((it) => s.items[it.id] > 0).map((it) => `<div class="it"><span>${it.name} × ${s.items[it.id]}</span>${it.use ? `<button type="button" data-use="${it.id}">${it.use}</button>` : ''}</div>`).join('') || '<div class="it"><span style="color:var(--ink-soft)">Nothing in your bag.</span></div>';
    let frags = '';
    if (s.flags.recallTaught) {
      frags = `<div class="frags">Remembered lines ${Array.from({ length: DL.Data.FRAG_TOTAL }, (_, i) => `<i class="${i < s.frags.length ? 'on' : ''}"></i>`).join('')}</div>`;
    }
    return `<h3>Day ${s.day} · ${d.jp}<small>${d.en} ${d.date}</small></h3>
      ${statRow('Grades', s.grades, 100)}
      ${statRow('Energy', s.energy, 100, 'energy')}
      <div class="stat"><span class="label">Money</span><span></span><span class="val">${yen(s.money)}</span></div>
      <div class="rel"><div class="top"><b style="color:var(--blue-deep)">${hikaruName}</b><span>trust</span></div>${pips(s.trust, 'blue')}</div>
      <div class="rel"><div class="top"><b style="color:var(--pink-deep)">Haruka</b><span>likes you</span></div>${pips(s.favor, 'pink')}</div>
      <div class="rel ${suspKnown ? '' : 'unknown'}"><div class="top"><b style="color:#8e2a52">Haruka's suspicion</b><span>${suspKnown ? 'of her sister' : '???'}</span></div>${pips(suspKnown ? s.susp : 10, 'red')}</div>
      <div class="items">${items}</div>${frags}`;
  }

  function planner(slot) {
    return new Promise((resolve) => {
      const s = DL.State.s;
      const c = DL.State.corruption();
      const m = mount(el('div', 'planner screen fade'));
      const locs = DL.Data.LOCATIONS.filter((l) => l.slot === slot && (!l.visible || l.visible(s)));
      const render = () => {
        const cards = locs.map((l) => {
          const why = l.block ? l.block(s) : '';
          const fx = Object.entries(l.gain || {}).map(([k, v]) => {
            const lab = k === 'money' ? (v > 0 ? '+' : '−') + yen(Math.abs(v)) : `${v > 0 ? '+' : '−'}${Math.abs(v)} ${k[0].toUpperCase() + k.slice(1)}`;
            return `<span class="chip ${v > 0 ? 'up' : 'down'}">${lab}</span>`;
          }).join('');
          const thumbVariant = c >= 3 ? DL.Stage.src(l.bg, 'g1') : `assets/thumb/${l.bg}.webp`;
          const hint = l.hint ? l.hint(s) : '';
          const creepy = hint.startsWith('!');
          return `<button type="button" class="card" data-loc="${l.id}" ${why ? 'disabled' : ''}>
            <div class="thumb" style="background-image:url('${thumbVariant}')"><span class="jp">${l.jp}</span></div>
            <div class="body"><span class="name">${l.name}</span><div class="chips">${fx}</div>
            <span class="hint ${creepy ? 'creepy' : ''}">${format(creepy ? hint.slice(1) : hint, s)}</span>
            ${why ? `<span class="why">${esc(why)}</span>` : ''}</div></button>`;
        }).join('');
        m.innerHTML = `<aside class="side">${sidePanel(s)}</aside>
          <section class="main"><h2>${slot === 'town' ? (s.phase === 'lunch' ? 'Where will you go this morning?' : 'Where to this afternoon?') : slot === 'lunch' ? 'Where will you eat lunch?' : 'What will you do after school?'}<small>${slot === 'town' ? '日曜日' : slot === 'lunch' ? '昼休み' : '放課後'}</small></h2>
          <div class="cards">${cards}</div></section>`;
        m.querySelectorAll('[data-loc]').forEach((b) => {
          b.addEventListener('mouseenter', () => DL.Audio.sfx('blip'));
          b.addEventListener('click', () => { DL.Audio.sfx('select'); m.remove(); resolve(b.dataset.loc); });
        });
        m.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => {
          const it = DL.Data.SHOP.find((x) => x.id === b.dataset.use);
          if (it && s.items[it.id] > 0) { s.items[it.id]--; it.onUse(s); DL.Audio.sfx('coin'); toast(it.used, 'lav'); render(); }
        }));
      };
      render();
    });
  }

  /* ---------- shop ---------- */
  function shop() {
    return new Promise((resolve) => {
      const s = DL.State.s;
      const price = (it) => (s.flags.bigDiscount ? Math.round(it.price * 0.7) : it.price);
      const m = mount(el('div', 'modal shop screen fade'));
      const render = () => {
        m.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><h2>Staff discount <span class="jp">コンビニ</span></h2>
          <p>Your shift is over. Mr. Oda says staff can buy one of anything at a discount. You have <b>${yen(s.money)}</b>.</p>
          <div>${DL.Data.SHOP.map((it) => `<div class="shop-item"><div><b>${it.name}</b><p>${it.desc}</p></div><span class="price">${yen(price(it))}</span>
            <button type="button" class="btn small" data-buy="${it.id}" ${s.money < price(it) ? 'disabled' : ''}>Buy</button></div>`).join('')}</div>
          <div class="actions"><button type="button" class="btn small primary" data-a="done">Done</button></div></div>`;
        m.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => {
          const it = DL.Data.SHOP.find((x) => x.id === b.dataset.buy);
          if (s.money >= price(it)) { s.money -= price(it); s.items[it.id] = (s.items[it.id] || 0) + 1; DL.Audio.sfx('coin'); toast(`Bought ${it.name}`, 'lav'); render(); }
        }));
        m.querySelector('[data-a=done]').onclick = () => { m.remove(); resolve(); };
      };
      render();
    });
  }

  /* ---------- diary ---------- */
  function diary() {
    return new Promise((resolve) => {
      const s = DL.State.s, x = s.xday && DL.Data.XDAYS && DL.Data.XDAYS[s.xday], d = (DL.Data.dayInfo ? DL.Data.dayInfo(s) : null) || DL.Data.DAYS[s.day - 1], start = s.dayStart || {};
      const deltas = [];
      const fmt = (k, label, money) => {
        const v = (s[k] ?? 0) - (start[k] ?? s[k] ?? 0);
        if (!v) return;
        deltas.push(`<span class="chip ${v > 0 ? 'up' : 'down'}">${label} ${v > 0 ? '+' : '−'}${money ? yen(Math.abs(v)) : Math.abs(v)}</span>`);
      };
      fmt('grades', 'Grades'); fmt('money', 'Money', true);
      const t = s.trust - (start.trust ?? s.trust), f = s.favor - (start.favor ?? s.favor);
      if (t > 0) deltas.push('<span class="chip up">Hikaru feels closer</span>'); if (t < 0) deltas.push('<span class="chip down">Hikaru pulled away</span>');
      if (f > 0) deltas.push('<span class="chip up">Haruka likes you more</span>'); if (f < 0) deltas.push('<span class="chip down">Haruka is cooler with you</span>');
      const nf = s.frags.length - (start.frags ?? s.frags.length);
      if (nf > 0) deltas.push(`<span class="chip up">Remembered ${nf} line${nf > 1 ? 's' : ''}</span>`);
      const lines = s.diary.length ? s.diary : ['Nothing much happened. That felt nice.'];
      const m = mount(el('div', 'diary screen fade'));
      m.innerHTML = `<article class="page"><div class="date">${x ? x.label : 'Day ' + s.day}<span class="jp">${d.jp} ${d.date}</span></div>
        ${lines.map((l) => l.startsWith('!h ') ? `<div class="entry other">${format(l.slice(3), s)}</div>` : l.startsWith('!b ') ? `<div class="entry other blue">${format(l.slice(3), s)}</div>` : `<div class="entry">${format(l, s)}</div>`).join('')}
        <div class="deltas">${deltas.join('')}</div>
        <div class="foot"><span class="hint" style="font-size:14px;color:var(--ink-soft)">Your game saves when you go to sleep.</span><button type="button" class="btn primary" id="sleep">Sleep ☾</button></div></article>`;
      DL.Audio.sfx('page');
      m.querySelector('#sleep').onclick = () => { DL.Audio.sfx('select'); m.remove(); resolve(); };
      m.querySelector('#sleep').focus({ preventScroll: true });
    });
  }

  /* ---------- endings gallery (achievements) ---------- */
  function gallery() {
    return new Promise((resolve) => {
      const got = DL.State.meta.endings;
      const all = Object.entries(DL.Data.ENDINGS);
      const name = DL.State.meta.lastName || 'you';
      const m = mount(el('div', 'modal screen fade'));
      m.innerHTML = `<div class="panel gallery" role="dialog" aria-modal="true"><h2>Endings <span class="jp">エンディング</span></h2>
        <p>${got.length} of ${all.length} found.</p>
        <div class="ach-grid">${all.map(([id, E]) => got.includes(id)
          ? `<div class="ach got ${E.dark || E.gameover || id === 'bad' ? 'dark' : ''}"><b>${esc(E.title)}</b><span class="jp">${E.jp}</span><p>${format(E.text, { name })}</p></div>`
          : `<div class="ach"><b>???</b><span class="jp">未発見</span><p>${esc(E.hint || 'Not found yet.')}</p></div>`).join('')}</div>
        <div class="actions"><button type="button" class="btn small primary" data-a="close">Close</button></div></div>`;
      m.querySelector('[data-a=close]').onclick = () => { m.remove(); resolve(); };
    });
  }

  /* ---------- settings ---------- */
  function settings() {
    return new Promise((resolve) => {
      const st = DL.State.settings;
      const m = mount(el('div', 'modal screen fade'));
      m.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><h2>Settings <span class="jp">設定</span></h2>
        <div class="row"><label for="s-speed">Text speed</label><input type="range" id="s-speed" min="15" max="95" step="5" value="${st.textSpeed}"><output id="o-speed"></output></div>
        <div class="row"><label for="s-auto">Auto wait</label><input type="range" id="s-auto" min="0.4" max="3" step="0.2" value="${st.autoDelay}"><output id="o-auto"></output></div>
        <div class="row"><label for="s-music">Music</label><input type="range" id="s-music" min="0" max="100" step="5" value="${st.music}"><output id="o-music"></output></div>
        <div class="row"><label for="s-sfx">Sound effects</label><input type="range" id="s-sfx" min="0" max="100" step="5" value="${st.sfx}"><output id="o-sfx"></output></div>
        <label class="toggle" for="s-calm"><input type="checkbox" id="s-calm" ${st.reduceFlash ? 'checked' : ''}> Reduce flashing and screen shake</label>
        <p class="hint">Keys: Space or Enter to continue, 1–4 to choose, hold Ctrl to skip, R to remember a changed line.</p>
        <div class="actions"><button type="button" class="btn small danger" data-a="wipe">Delete saves and endings</button><button type="button" class="btn small primary" data-a="close">Close</button></div></div>`;
      const bindRange = (id, key, out, f) => {
        const i = m.querySelector('#s-' + id), o = m.querySelector('#o-' + id);
        const show = () => { o.textContent = f(i.value); };
        show();
        i.addEventListener('input', () => { st[key] = parseFloat(i.value); show(); DL.State.saveSettings(); DL.Audio.applyVolumes(); });
      };
      bindRange('speed', 'textSpeed', 'o-speed', (v) => (v >= 95 ? 'Instant' : v));
      bindRange('auto', 'autoDelay', 'o-auto', (v) => parseFloat(v).toFixed(1) + 's');
      bindRange('music', 'music', 'o-music', (v) => v);
      bindRange('sfx', 'sfx', 'o-sfx', (v) => v);
      m.querySelector('#s-calm').onchange = (e) => { st.reduceFlash = e.target.checked; DL.State.saveSettings(); };
      m.querySelector('[data-a=close]').onclick = () => { m.remove(); resolve(); };
      m.querySelector('[data-a=wipe]').onclick = async () => {
        const ok = await confirm('Delete everything?', 'This removes your save, the endings you have found, and anything she remembers about you.', 'Delete', 'Keep');
        if (ok) { DL.State.wipeAll(); toast('Save data deleted'); m.remove(); resolve('wiped'); }
      };
      m.querySelector('[data-a=close]').focus();
    });
  }

  /* ---------- backlog ---------- */
  function backlog() {
    return new Promise((resolve) => {
      const m = mount(el('div', 'modal screen fade'));
      const items = DL.Dialogue.log.slice(-80).map((e) => `<div class="log-item ${e.true ? 'true' : ''}"><span class="who ${e.plate || 'none'}">${esc(e.label || '')}</span><span class="what">${e.html}</span></div>`).join('') || '<p>Nothing has been said yet.</p>';
      m.innerHTML = `<div class="panel" role="dialog" aria-modal="true" style="width:820px"><h2>Log <span class="jp">履歴</span></h2><div class="log-list">${items}</div>
        <div class="actions"><button type="button" class="btn small primary" data-a="close">Close</button></div></div>`;
      const panel = m.querySelector('.panel');
      setTimeout(() => { panel.scrollTop = panel.scrollHeight; }, 20);
      m.querySelector('[data-a=close]').onclick = () => { m.remove(); resolve(); };
      m.addEventListener('click', (e) => { if (e.target === m) { m.remove(); resolve(); } });
    });
  }

  /* ---------- endings ---------- */
  function ending(id) {
    return new Promise((resolve) => {
      const E = DL.Data.ENDINGS[id];
      const total = Object.keys(DL.Data.ENDINGS).length;
      const found = DL.State.meta.endings.length;
      const m = mount(el('div', `ending ${E.gameover ? 'bad gameover' : E.dark ? 'bad ' + id : id} screen`));
      const buttons = E.gameover
        ? `<div class="actions-row"><button type="button" class="btn primary" data-a="retry">${id === 'exhibit' ? 'Try the makeover again' : 'Try the fitting again'}</button><button type="button" class="btn dark" data-a="title">Back to title</button></div>`
        : `<button type="button" class="btn ${id === 'bad' || E.dark ? 'dark' : 'primary'}" data-a="go">${id === 'neutral' ? 'Wake up' : 'Credits'}</button>`;
      m.innerHTML = `<div class="inner"><div class="tag">${E.gameover ? 'Game over · ' : ''}Ending · ${found} of ${total} found</div><h1>${esc(E.title)}</h1><div class="jp">${E.jp}</div>
        <p>${format(E.text, DL.State.s)}</p>${buttons}</div>`;
      m.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => { DL.Audio.sfx('select'); m.remove(); resolve(b.dataset.a); }));
      m.querySelector('[data-a]').focus({ preventScroll: true });
    });
  }

  function credits() {
    return new Promise((resolve) => {
      const m = mount(el('div', 'credits screen'));
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      m.innerHTML = `<div class="roll" ${reduce ? 'style="animation:none;top:80px"' : ''}>
        <div style="font-size:40px">遥かな光</div><div style="font-size:18px;font-weight:500;letter-spacing:.3em">DISTANT LIGHT</div>
        <h4>Story, characters and art direction</h4><div>${esc(DL.Data.CREDITS.creator)}</div>
        <h4>Hikaru Amane</h4><div>the light, far away</div>
        <h4>Haruka Amane</h4><div>older by four minutes</div>
        <h4>Rin Hoshino</h4><div>photography club, 2-B</div>
        <h4>Backgrounds and logo</h4><div>${esc(DL.Data.CREDITS.art)}</div>
        <h4>Code, music, glitches and the Saturday fitting</h4><div>Claude, by Anthropic</div>
        <div style="font-size:16px;font-weight:500">who had a lovely time helping these ideas come to life</div>
        <h4>Thank you for playing</h4><div>${esc(DL.State.s ? DL.State.s.name : '')}</div>
      </div><button type="button" class="btn small skip">Back to title</button>`;
      const done = () => { clearTimeout(timer); m.remove(); resolve(); };
      const timer = setTimeout(done, reduce ? 12000 : 26500);
      m.querySelector('.skip').onclick = done;
    });
  }

  function clearAll() { layer().innerHTML = ''; }

  return { blocking, toast, hud, confirm, warning, title, nameEntry, storyPick, dayCard, planner, shop, diary, settings, backlog, ending, credits, clearAll };
})();
