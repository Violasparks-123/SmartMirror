/* RIN'S MAKEOVER (着せ替え): Stardust Beauty, the day before the photo club exhibition.
   Same feel as the twins' Saturday fitting: one look, hair, makeup and accessory.

   Rin has two meters:
   - Comfort: does she still feel like Rin? (lavender, soft, a bit of camera)
   - Spotlight: does she look like "the kind of person people photograph"?
   Pass needs both. The shop mirror is haunted: Haruka's reflection keeps swapping
   things on Rin for pink ones. Spot it and put it back.

   DL.RinFitting.play({ thrift }) resolves to
     { result: 'perfect' | 'ok' | 'fail' | 'doom', R, B, pinks, sabotages, picks }
   'fail' = a story consequence; 'doom' (out of time, or the mirror took over) = game over.
   DL.RinFitting.doom() plays what happens then. */
DL.RinFitting = (() => {
  const { el, esc, wait, format, clamp } = DL.util;
  const CATS = [
    { id: 'look', name: 'Look', jp: 'コーデ' },
    { id: 'hair', name: 'Hair', jp: 'ヘア' },
    { id: 'makeup', name: 'Makeup', jp: 'メイク' },
    { id: 'acc', name: 'Accessory', jp: '小物' },
  ];
  const S = (n) => `assets/studio/${n}.webp`, W = (n) => `assets/wardrobe/${n}.webp`;
  // r = Rin's comfort, b = spotlight (how much people will look), pink = Haruka's taste
  const I = (id, cat, img, name, desc, r, b, line, pink) => ({ id, cat, img, name, desc, r, b, line, pink: !!pink });
  const ITEMS = [
    I('rl_witch', 'look', S('dress_witch'), 'Lilac Witch', 'Ruffled lilac tutu, black lace, little hearts', 3, 3, 'It’s ridiculous. I love it. Is that allowed?'),
    I('rl_corset', 'look', S('top_lilac'), 'Lavender Clockwork', 'Lilac corset dripping with crystals and brass', 2, 3, 'I look like a camera someone built by hand.'),
    I('rl_denim', 'look', S('look_denim'), 'Denim & Lace', 'Denim vest, lace shirt, blue skirt, cat bag', 2, 1, 'Comfy. Like something I’d actually wear.'),
    I('rl_piano', 'look', S('top_piano'), 'Piano Girl Tee', 'Soft yellow tee with a girl carrying a case', 3, 0, 'It’s so me it’s embarrassing. Nobody will look twice.'),
    I('rl_violet', 'look', S('dress_violet'), 'Violet Sequins', 'Purple sequins, butterflies, chains', 1, 3, 'Everyone will look. Everyone. Oh no.'),
    I('rl_leo', 'look', S('top_leobow'), 'Pink Leopard Bow', 'Pink polka halter with a leopard bow', -2, 2, 'This is… somebody else’s outfit.', true),
    I('rh_own', 'hair', W('hair_lilac'), 'Lilac Curls', 'Her own lavender, curled for once', 3, 1, 'It’s still my hair. Just… braver.'),
    I('rh_jewels', 'hair', S('hair_jewels'), 'Crystal Bead Veil', 'Lilac hair strung with glass beads', 2, 3, 'I’ll sparkle in every photo. Even the ones I take.'),
    I('rh_jelly', 'hair', W('hair_jelly'), 'Jellyfish Pearls', 'Lilac bob with strings of pearls', 2, 2, 'Pearls that move. Like light in water.'),
    I('rh_midnight', 'hair', S('hair_midnight'), 'Midnight Waves', 'Deep blue curls', 1, 2, 'Blue. Like Hikaru. Is that weird?'),
    I('rh_candy', 'hair', S('hair_candy'), 'Carousel Candy', 'Hot pink curls with a tiny carousel on top', -2, 3, 'That’s the loudest thing I’ve ever seen.', true),
    I('rm_galaxy', 'makeup', W('mk_galaxy'), 'Galaxy', 'Purple and blue glitter like a night sky', 3, 2, 'Like a long exposure of the stars.'),
    I('rm_swirl', 'makeup', S('mk_swirl'), 'Lilac Swirl', 'Lilac liner swirls and pearl drops', 2, 3, 'Like a frame around my eyes. Photographers love frames.'),
    I('rm_crystal', 'makeup', S('mk_crystal'), 'Crystal Brows', 'Crystals and glass blush', 1, 3, 'Very sparkly. Very… visible.'),
    I('rm_none', 'makeup', W('mk_mint'), 'Barely There', 'A little mint shadow, nothing else', 2, 0, 'Nobody will notice. That’s what I’m used to.'),
    I('rm_leo', 'makeup', W('mk_leopard'), 'Leopard Kiss', 'Leopard liner and dark glitter lips', -2, 2, 'I look like I’m about to bite someone.', true),
    I('ra_glasses', 'acc', S('x_glasses'), 'Star-chain Glasses', 'Her glasses, with tiny stars hanging off them', 3, 2, 'My glasses! But brave.'),
    I('ra_fan', 'acc', S('x_fan'), 'Mother-of-pearl Fan', 'An antique fan that shines like a rainbow', 2, 3, 'I could hide behind it. Or not. Either way.'),
    I('ra_angel', 'acc', S('jw_angel'), 'Amethyst Angel', 'Gold wings and an amethyst the size of a sweet', 1, 3, 'Heavier than my camera. That’s saying something.'),
    I('ra_beads', 'acc', S('jw_beads'), 'Garden Beads', 'A bracelet of glass flowers', 3, 1, 'Small, pretty, mine.'),
    I('ra_bangles', 'acc', S('jw_bangles'), 'Pink Zebra Bangles', 'A stack of pink and black bangles', -1, 2, 'These jingle every time I move. People will hear me coming.', true),
  ];
  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  const PASS = 5, PERFECT_R = 9, PERFECT_B = 8, TIME = 150;
  const empty = () => ({ look: null, hair: null, makeup: null, acc: null });

  let root = null;

  const sum = (p, key) => CATS.reduce((n, c) => n + (p[c.id] ? byId[p[c.id]][key] : 0), 0);
  const pinks = (p) => CATS.filter((c) => p[c.id] && byId[p[c.id]].pink).length;
  const hearts = (v) => clamp(Math.round(v / 2.2), 0, 5);
  const meter = (v, sym) => Array.from({ length: 5 }, (_, i) => `<i class="${i < hearts(v) ? 'on' : ''}">${sym}</i>`).join('');

  function shell() {
    const r = el('div', 'fitting screen fade round-rin');
    r.innerHTML = `
      <div class="fit-tint"></div>
      <aside class="fit-model">
        <div class="fit-brief"><b>Rin wants</b><span>To look like “the kind of person people photograph”. But still like <em>Rin</em>: lavender, soft, a bit of camera. Nothing pink.</span></div>
        <div class="fit-portrait"><div class="fit-figure"><img src="assets/sprites/rin.webp" alt="Rin" draggable="false"></div>
          <div class="rin-mirror" aria-hidden="true"><img src="assets/sprites/rin_face.webp" alt=""></div>
          <div class="fit-bubble" hidden></div></div>
        <div class="fit-meter-row"><span class="fit-meter-label">Comfort</span><span class="fit-meter m-r"></span></div>
        <div class="fit-meter-row"><span class="fit-meter-label">Spotlight</span><span class="fit-meter m-b"></span></div>
        <div class="fit-slots"></div>
      </aside>
      <section class="fit-main">
        <header class="fit-head"><h2>Style Rin <small>凛・着せ替え</small></h2><div class="fit-clock" role="timer" aria-live="off"></div></header>
        <nav class="fit-tabs" aria-label="Categories"></nav>
        <div class="fit-grid"></div>
        <footer class="fit-foot"><div class="fit-other"></div><button type="button" class="btn primary fit-done">Done ✿ To the mirror</button></footer>
      </section>`;
    document.querySelector('#screens').appendChild(r);
    return r;
  }

  function play(opts = {}) {
    return new Promise((resolve) => {
      const s = DL.State.s || { name: 'you' };
      const items = ITEMS.slice();
      // Something you bought at Kaze Thrift comes along in her bag
      const T = DL.Studio && opts.thrift && opts.thrift.outfit && DL.Studio.GAMES.thrift.items.find((i) => i.id === opts.thrift.outfit);
      if (T && T.img && !T.pink) {
        const it = I('rl_thrift', 'look', S(T.img), T.name + ' (thrift)', 'The one you found together at Kaze Thrift', 3, 2, 'The one we found! It feels like ours.');
        items.unshift(it); byId[it.id] = it;
      }
      const st = { tab: 'look', picks: empty(), swapped: {}, sabotages: 0, timeLeft: TIME, done: false, warned: false, s1: false, s2: false, bubbleTimer: null };
      DL.RinFitting._st = st;
      root = shell();
      const $ = (q) => root.querySelector(q);

      function say(who, text, ms = 4200) {
        const b = $('.fit-bubble');
        b.className = `fit-bubble from-${who}`;
        b.innerHTML = `<b>${{ rin: 'Rin', haruka: 'Haruka', mirror: '???' }[who] || ''}</b><span>${format(text, s)}</span>`;
        b.hidden = false;
        clearTimeout(st.bubbleTimer);
        st.bubbleTimer = setTimeout(() => { b.hidden = true; }, ms);
      }

      function render() {
        const R = sum(st.picks, 'r'), B = sum(st.picks, 'b');
        $('.m-r').innerHTML = meter(R, '♪');
        $('.m-b').innerHTML = meter(B, '✦');
        $('.fit-slots').innerHTML = CATS.map((c) => {
          const it = st.picks[c.id] ? byId[st.picks[c.id]] : null, sw = st.swapped[c.id];
          return `<div class="fit-slot ${it ? 'filled' : ''} ${sw ? 'swapped' : ''}" data-cat="${c.id}">
            <button type="button" class="fit-slot-btn" data-tab="${c.id}">${it ? `<img src="${it.img}" alt="">` : `<span class="ph">${c.jp}</span>`}</button>
            <span class="fit-slot-name">${it ? esc(it.name) : c.name}</span>
            ${sw ? `<button type="button" class="fit-undo" data-undo="${c.id}">↺ Put it back</button>` : ''}</div>`;
        }).join('');
        $('.fit-tabs').innerHTML = CATS.map((c) => `<button type="button" class="fit-tab ${st.tab === c.id ? 'on' : ''} ${st.picks[c.id] ? 'done' : ''}" data-tab="${c.id}">${c.name}<small>${c.jp}</small></button>`).join('');
        $('.fit-grid').className = `fit-grid cat-${st.tab === 'acc' ? 'bag' : st.tab}`;
        $('.fit-grid').innerHTML = items.filter((i) => i.cat === st.tab).map((i) => {
          const on = st.picks[st.tab] === i.id;
          return `<button type="button" class="fit-card ${on ? 'on' : ''}" data-item="${i.id}" aria-pressed="${on}">
            <span class="img"><img src="${i.img}" alt="" loading="lazy"></span><span class="name">${esc(i.name)}</span><span class="desc">${esc(i.desc)}</span>
            ${i.id === 'rl_thrift' ? '<span class="tag-hers">From Kaze Thrift</span>' : ''}${on ? '<span class="tag-on">✓</span>' : ''}</button>`;
        }).join('');
        $('.fit-done').disabled = !CATS.every((c) => st.picks[c.id]);
        const p = pinks(st.picks);
        $('.fit-other').innerHTML = `<span class="lbl">In the mirror</span><span class="tipline">${p ? `<b class="warn">${p} pink piece${p > 1 ? 's' : ''} on Rin.</b> She didn’t choose ${p > 1 ? 'them' : 'it'}.` : 'Just Rin. For now.'}</span>`;
      }

      function pick(id) {
        const it = byId[id];
        DL.Audio.sfx('select');
        st.picks[it.cat] = id;
        delete st.swapped[it.cat];
        render();
        say('rin', it.line);
        const filled = CATS.filter((c) => st.picks[c.id]).length;
        if (filled >= 2 && !st.s1) { st.s1 = true; setTimeout(() => haunt(1), 1700); }
        if (filled === 4 && !st.s2) { st.s2 = true; setTimeout(() => haunt(2), 1200); }
        const next = CATS.find((c) => !st.picks[c.id]);
        if (next && next.id !== st.tab) setTimeout(() => { if (!st.done) { st.tab = next.id; render(); } }, 520);
      }

      // The mirror shows Haruka for a moment, and something on Rin turns pink
      function haunt(n) {
        if (st.done || st.timeLeft < 12) return;
        const cands = CATS.map((c) => c.id).filter((cat) => st.picks[cat] && !byId[st.picks[cat]].pink && !st.swapped[cat]);
        if (!cands.length) return;
        cands.sort((a, b) => byId[st.picks[b]].r - byId[st.picks[a]].r);
        const cat = cands[0];
        const pinkItem = ITEMS.find((i) => i.cat === cat && i.pink);
        st.swapped[cat] = st.picks[cat];
        st.picks[cat] = pinkItem.id;
        st.sabotages++;
        DL.Audio.sfx('static');
        const m = $('.rin-mirror');
        m.classList.add('haunt'); m.querySelector('img').src = 'assets/sprites/haruka_face.webp';
        setTimeout(() => { if (root) { m.classList.remove('haunt'); m.querySelector('img').src = 'assets/sprites/rin_face.webp'; } }, 2200);
        render();
        say(n === 1 ? 'mirror' : 'rin', n === 1 ? 'In the mirror, Haruka is standing behind Rin, smiling, holding something pink.' : '…{name}? I didn’t pick that. Did you pick that?', 4600);
      }

      function undo(cat) {
        if (!st.swapped[cat]) return;
        st.picks[cat] = st.swapped[cat];
        delete st.swapped[cat];
        DL.Audio.sfx('chime');
        render();
        say('rin', 'Thank you. I thought I was imagining it.');
      }

      let last = performance.now();
      const clock = setInterval(() => {
        const now = performance.now(), dt = (now - last) / 1000; last = now;
        if (document.hidden || st.done) return;
        st.timeLeft = Math.max(0, st.timeLeft - dt);
        const t = Math.ceil(st.timeLeft), c = $('.fit-clock');
        c.innerHTML = `Exhibition in <b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b>`;
        c.classList.toggle('urgent', t <= 30);
        if (t <= 30 && !st.warned) { st.warned = true; say('rin', 'The exhibition opens soon. Everyone’s going to be there. Everyone.'); DL.Audio.sfx('thud'); }
        if (st.timeLeft <= 0) finish('timeout');
      }, 200);

      root.addEventListener('click', (e) => {
        const card = e.target.closest('[data-item]'), tab = e.target.closest('[data-tab]'), un = e.target.closest('[data-undo]');
        if (un) { e.stopPropagation(); undo(un.dataset.undo); return; }
        if (card) { pick(card.dataset.item); return; }
        if (tab) { st.tab = tab.dataset.tab; DL.Audio.sfx('blip'); render(); }
      });
      $('.fit-done').addEventListener('click', () => finish('done'));

      async function finish(how) {
        if (st.done) return;
        st.done = true; clearInterval(clock); clearTimeout(st.bubbleTimer);
        const R = sum(st.picks, 'r'), B = sum(st.picks, 'b'), p = pinks(st.picks);
        let result;
        if (how === 'timeout' || p >= 3) result = 'doom';
        else if (R >= PERFECT_R && B >= PERFECT_B && p === 0) result = 'perfect';
        else if (R >= PASS && B >= PASS && p <= 1) result = 'ok';
        else result = 'fail';
        if (how === 'timeout') { say('mirror', 'Time’s up. She’ll finish it herself.', 3000); DL.Audio.sfx('thud'); await wait(1600); }
        root.remove(); root = null;
        if (how !== 'timeout') await mirror(st.picks, { R, B, p, result });
        resolve({ result, R, B, pinks: p, sabotages: st.sabotages, picks: Object.assign({}, st.picks) });
      }

      render();
      say('rin', 'I don’t know how to be looked at. Help?');
    });
  }

  /* ---------- the mirror ---------- */
  function mirror(picks, r) {
    return new Promise((resolve) => {
      const bad = r.result === 'fail' || r.result === 'doom';
      const line = r.result === 'perfect' ? 'I look like someone people would want to photograph. …I want to be in the picture this time.'
        : r.result === 'ok' ? 'It’s nice. It’s still a bit me-hiding. But nice.'
          : r.p >= 2 ? 'That isn’t me in the mirror. Who is that?' : r.R < PASS ? 'I don’t recognise myself. I don’t think I want to go.' : 'Nobody’s going to see me. Same as always.';
      const m = el('div', `mirror screen fade ${bad ? 'fail' : ''}`);
      m.innerHTML = `<h2>The mirror <small>鏡</small></h2>
        <div class="mirror-pair solo"><figure class="mirror-card rin ${bad ? 'bad' : ''}">
          <div class="mirror-fig"><img src="assets/sprites/rin.webp" alt="Rin">${r.p ? '<img class="mirror-ghost" src="assets/sprites/haruka.webp" alt="">' : ''}</div>
          <div class="mirror-items">${CATS.map((c) => { const it = byId[picks[c.id]]; return `<span class="${it.pink ? 'match' : ''}"><img src="${it.img}" alt=""><small>${esc(it.name)}</small></span>`; }).join('')}</div>
          <figcaption><span class="fit-meter">Comfort ${meter(r.R, '♪')}</span><span class="fit-meter">Spotlight ${meter(r.B, '✦')}</span><q>${format(line, DL.State.s)}</q></figcaption>
        </figure></div>
        <button type="button" class="btn ${bad ? 'dark' : 'primary'} mirror-go">${bad ? '…' : 'To the exhibition ✿'}</button>`;
      document.querySelector('#screens').appendChild(m);
      DL.Audio.sfx(bad ? 'static' : 'chime');
      if (bad) setTimeout(() => m.classList.add('cracked'), 900);
      m.querySelector('.mirror-go').addEventListener('click', () => { DL.Audio.sfx('select'); m.remove(); resolve(); });
    });
  }

  /* ---------- total fail: Rin becomes the exhibit ---------- */
  function doom() {
    return new Promise((resolve) => {
      const s = DL.State.s;
      const r = shell();
      r.className = 'fitting screen round-doll round-rin-doom';
      const $ = (q) => r.querySelector(q);
      $('.fit-brief').innerHTML = '<b>Haruka wants</b><span>A girl people photograph. Forever.</span>';
      $('.fit-head h2').innerHTML = 'Style Rin <small>展示品</small>';
      $('.fit-clock').innerHTML = 'Exhibition in <b>0:00</b>'; $('.fit-clock').classList.add('urgent');
      const pinkItems = ITEMS.filter((i) => i.pink);
      $('.fit-tabs').innerHTML = CATS.map((c) => `<button type="button" class="fit-tab on">${c.name}<small>${c.jp}</small></button>`).join('');
      $('.fit-grid').className = 'fit-grid cat-look';
      $('.fit-grid').innerHTML = Array.from({ length: 8 }, (_, k) => { const i = pinkItems[k % pinkItems.length]; return `<button type="button" class="fit-card"><span class="img"><img src="${i.img}" alt=""></span><span class="name">${esc(i.name)}</span><span class="desc">Pink</span></button>`; }).join('');
      $('.fit-done').disabled = true; $('.fit-done').textContent = 'Hold still';
      $('.fit-other').innerHTML = '<span class="lbl">In the mirror</span><span class="tipline"><b class="warn">Haruka. Only Haruka.</b></span>';
      const slots = (k) => CATS.map((c, i) => `<div class="fit-slot ${i < k ? 'filled swapped' : ''}"><span class="fit-slot-btn">${i < k ? `<img src="${pinkItems[i].img}" alt="">` : `<span class="ph">${c.jp}</span>`}</span><span class="fit-slot-name">${i < k ? esc(pinkItems[i].name) : c.name}</span></div>`).join('');
      $('.fit-slots').innerHTML = slots(0);
      const fig = $('.fit-figure');
      const tint = el('div', 'doom-tint'); fig.appendChild(tint);
      const lines = ['Hold still, Hoshino.', 'Pink suits everyone. It suits you best.', 'Now you’re the kind of girl people photograph.', 'Smile, Hoshino. Smile forever.'];
      let k = 0;
      const step = () => {
        if (k >= 4) return;
        k++;
        DL.Audio.sfx('static');
        $('.fit-slots').innerHTML = slots(k);
        tint.style.opacity = String(Math.min(0.85, k * 0.22));
        fig.style.filter = `saturate(${1 + k * 0.25}) brightness(${1 + k * 0.03})`;
        $('.fit-portrait').classList.toggle('framed', k >= 3);
        const b = $('.fit-bubble');
        b.className = 'fit-bubble from-haruka'; b.innerHTML = `<b>Haruka</b><span>${format(lines[k - 1], s)}</span>`; b.hidden = false;
        if (k === 4) setTimeout(async () => { await DL.FX.tear(700, 1.4); r.remove(); resolve(); }, 1600);
      };
      const t = setInterval(() => { if (k >= 4) clearInterval(t); else step(); }, 1500);
      setTimeout(step, 600);
    });
  }

  return { play, doom, ITEMS, CATS };
})();
