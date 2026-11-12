/* THE STUDIO: nine shopping / styling games that share one engine.
   A game is a definition: who you're styling (slots), what you pick (categories + items),
   an optional budget and clock, a picture built from your picks (preview), and hooks for
   its twist (tick, onPick, onSlot). DL.Studio.play(id, opts) resolves to the game's result.

   Product photos are the creator's references in assets/studio/ (tools/process_studio.py),
   purikura stickers are cut from their sticker sheet (tools/cut_stickers.py), and the girls
   are their portraits in assets/sprites/.

   Games: thrift, beauty, gifts, salon, nails, purikura, uniform, dollhouse, room. */
DL.Studio = (() => {
  const { el, esc, rand, pick, clamp, yen, format } = DL.util;

  /* ---------------- art helpers ---------------- */
  const PAL = {
    pink: '#f3a8c4', hotpink: '#e0588c', blush: '#ffc4d6', blue: '#a2cbef', navy: '#3f5f8f', sky: '#cfe6ff',
    lav: '#c7b6ea', plum: '#6b3f7a', cream: '#f4e4c6', white: '#fbf8f6', black: '#2a2430', mint: '#bfe8d6',
    brown: '#8a5a3c', gold: '#e2b85a', red: '#d24c5c', grey: '#b9b3c0', silver: '#d9dde6',
    leopard: 'repeating-radial-gradient(circle at 30% 30%, #6b3a1e 0 3px, #e7b46a 3px 9px)',
  };
  const col = (c) => PAL[c] || c || '#ddd';
  const IMG = (n) => `assets/studio/${n}.webp`;
  const STK = (n) => `assets/stickers/${n}.webp`;
  const SPR = { rin: 'assets/sprites/rin.webp', hikaru: 'assets/sprites/hikaru.webp', haruka: 'assets/sprites/haruka.webp' };
  const FACE = { rin: 'assets/sprites/rin_face.webp', hikaru: 'assets/sprites/hikaru_face.webp', haruka: 'assets/sprites/haruka_face.webp' };
  const LEO_SVG = '<pattern id="leo" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#e7b46a"/><circle cx="4" cy="5" r="2.4" fill="#6b3a1e"/><circle cx="12" cy="11" r="2.6" fill="#6b3a1e"/><circle cx="12" cy="3" r="1.5" fill="#6b3a1e"/></pattern>';
  const svg = (vb, inner, cls = '', defs = '') => `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><defs>${LEO_SVG}${defs}</defs>${inner}</svg>`;
  const fillOf = (c) => (c === 'leopard' ? 'url(#leo)' : col(c));
  const swatchCss = (it) => (it.color === 'leopard' ? PAL.leopard : col(it.swatch || it.color));

  // A taped polaroid of one product (for lookbooks and reveals)
  function polaroid(it, o = {}) {
    if (!it) return '';
    const pic = it.img || it.src ? `<span class="pp" style="background-image:url('${it.src || IMG(it.img)}')"></span>` : `<span class="pp sw" style="background:${swatchCss(it)}">${it.icon ? `<i>${it.icon}</i>` : ''}</span>`;
    return `<figure class="pol ${o.cls || ''} ${o.bad ? 'bad' : ''}" style="${o.style || ''}">${pic}<figcaption>${esc(o.label || it.name)}</figcaption></figure>`;
  }

  // A mood board: the girl's portrait in the middle, picks pinned around her
  const SPOTS = ['tl', 'tr', 'ml', 'mr', 'bl', 'br', 'tc', 'bc'];
  function lookbook(who, pins, o = {}) {
    return `<div class="lb ${o.cls || ''}">
      <div class="lb-floor"></div>
      <img class="lb-girl ${who}" src="${SPR[who]}" alt="" draggable="false">
      ${pins.map((p, i) => p && p.it ? polaroid(p.it, { cls: 'pin ' + (p.spot || SPOTS[i]) + (p.small ? ' small' : ''), bad: p.bad, label: p.label }) : '').join('')}
      ${o.extra || ''}</div>`;
  }

  /* ---------------- the engine ---------------- */
  function play(id, opts = {}) {
    const def = GAMES[id];
    return new Promise((resolve) => {
      const s = DL.State.s || { name: 'you', money: 3000, flags: {} };
      const st = {
        def, opts, s, slot: def.slots[0].id, cat: def.cats[0].id,
        picks: Object.fromEntries(def.slots.map((sl) => [sl.id, {}])),
        swapped: {}, extra: {}, time: def.time || 0, budget: def.budget ? def.budget(s, opts) : 0, done: false,
      };
      const root = el('div', `studio screen fade studio-${id} lay-${def.layout || 'left'}`);
      root.innerHTML = `<div class="st-wrap">
        <aside class="st-left">
          <header class="st-title"><span class="st-shop">${esc(def.shop || def.name)}</span><h2>${esc(def.name)} <span class="jp">${def.jp}</span></h2><p>${esc(def.brief)}</p></header>
          <div class="st-preview"></div>
          <div class="st-bubble" hidden></div>
        </aside>
        <section class="st-right">
          <div class="st-bar"><div class="st-slots"></div><div class="st-stats"></div></div>
          <nav class="st-tabs"></nav>
          <div class="st-grid"></div>
          <footer class="st-foot"><div class="st-summary"></div><div class="st-actions"><button type="button" class="ag-btn small" data-a="quit">Leave</button><button type="button" class="btn primary" data-a="done">${esc(def.doneLabel || 'Done ✿')}</button></div></footer>
        </section></div>`;
      document.querySelector('#screens').appendChild(root);
      const $ = (q) => root.querySelector(q);
      let bubbleT = null;

      const api = {
        st,
        say(who, text, ms = 3800) {
          const b = $('.st-bubble');
          const names = { haruka: 'Haruka', hikaru: 'Hikaru', rin: 'Rin', you: s.name, staff: def.staff || 'Staff', mirror: '???' };
          b.className = `st-bubble from-${who}`;
          b.innerHTML = `${FACE[who] ? `<img src="${FACE[who]}" alt="">` : ''}<div><b>${esc(names[who] || who)}</b><span>${format(text, s)}</span></div>`;
          b.hidden = false; clearTimeout(bubbleT); bubbleT = setTimeout(() => { b.hidden = true; }, ms);
        },
        item: (iid) => def.items.find((i) => i.id === iid),
        picked: (slot, cat) => def.items.find((i) => i.id === st.picks[slot][cat]),
        set(slot, cat, iid, swapped) {
          const key = slot + ':' + cat;
          if (swapped && !st.swapped[key]) st.swapped[key] = st.picks[slot][cat] || '__none';
          st.picks[slot][cat] = iid;
          if (!swapped) delete st.swapped[key];
          render();
        },
        isSwapped: (slot, cat) => !!st.swapped[slot + ':' + cat],
        spent() { let n = 0; for (const sl of def.slots) for (const c of def.cats) { const it = api.item(st.picks[sl.id][c.id]); if (it && it.price) n += it.price; } return n; },
        render: () => render(),
        flash(sel) { const n = root.querySelector(sel); n && n.animate([{ filter: 'hue-rotate(0)', transform: 'translateX(0)' }, { filter: 'hue-rotate(90deg)', transform: 'translateX(-5px)' }, { transform: 'none' }], { duration: 420 }); },
        end: (how) => finish(how),
        root,
      };

      function card(i) {
        const on = st.picks[st.slot][st.cat] === i.id;
        const pic = i.img || i.src ? `<span class="ph" style="background-image:url('${i.src || IMG(i.img)}')"></span>`
          : i.sticker ? `<span class="ph stk" style="background-image:url('${STK(i.sticker)}')"></span>`
            : `<span class="ph sw" style="background:${swatchCss(i)}">${i.icon ? `<i>${i.icon}</i>` : ''}</span>`;
        const tag = def.tag ? def.tag(i, st) : '';
        return `<button type="button" class="st-card ${on ? 'on' : ''} ${i.pink ? 'is-pink' : ''}" data-item="${i.id}"><span class="deco" aria-hidden="true"></span>${pic}
          <span class="meta"><span class="nm">${esc(i.name)}</span>${i.price ? `<span class="pr">${yen(i.price)}</span>` : i.price === 0 ? '<span class="pr">free</span>' : ''}</span>
          ${i.desc ? `<span class="ds">${esc(i.desc)}</span>` : ''}${tag ? `<span class="tag">${tag}</span>` : ''}</button>`;
      }

      function render() {
        if (st.done) return;
        const slotDef = def.slots.find((x) => x.id === st.slot);
        $('.st-preview').innerHTML = def.preview(st, api);
        $('.st-slots').innerHTML = def.slots.length > 1 ? def.slots.map((sl) => {
          const full = def.cats.every((c) => st.picks[sl.id][c.id] || c.optional);
          const bad = Object.keys(st.swapped).some((k) => k.startsWith(sl.id + ':'));
          return `<button type="button" class="st-slot ${sl.id === st.slot ? 'on' : ''} ${full ? 'full' : ''} ${bad ? 'bad' : ''} ${sl.tone || ''}" data-slot="${sl.id}">${esc(sl.name)}</button>`;
        }).join('') : `<span class="st-for">Styling <b>${esc(slotDef.name)}</b></span>`;
        const stats = [];
        if (def.budget) { const sp = api.spent(); stats.push(`<span class="${sp > st.budget ? 'over' : ''}">${yen(sp)} / ${yen(st.budget)}</span>`); }
        if (def.time) stats.push(`<span class="t ${st.time <= 10 ? 'over' : ''}">⏱ ${Math.ceil(st.time)}s</span>`);
        if (def.stat) stats.push(`<span>${def.stat(st, api)}</span>`);
        $('.st-stats').innerHTML = stats.join('');
        const cats = def.cats.filter((c) => !c.only || c.only.includes(st.slot));
        if (!cats.find((c) => c.id === st.cat)) st.cat = cats[0].id;
        $('.st-tabs').innerHTML = cats.map((c) => `<button type="button" class="st-tab ${c.id === st.cat ? 'on' : ''} ${st.picks[st.slot][c.id] ? 'done' : ''}" data-cat="${c.id}">${esc(c.name)}</button>`).join('');
        const items = def.items.filter((i) => i.cat === st.cat && (!i.slots || i.slots.includes(st.slot)) && !i.hidden);
        const g = $('.st-grid');
        const keep = g.dataset.cat === st.slot + ':' + st.cat ? g.scrollTop : 0;
        g.className = 'st-grid cards-' + (def.cards || 'plain') + ' ' + (items.some((i) => i.img || i.src || i.sticker) ? 'photos' : 'swatches');
        g.innerHTML = items.map(card).join('');
        g.dataset.cat = st.slot + ':' + st.cat; g.scrollTop = keep;
        $('.st-summary').innerHTML = cats.map((c) => {
          const it = api.item(st.picks[st.slot][c.id]);
          const key = st.slot + ':' + c.id;
          return `<span class="st-sum ${st.swapped[key] ? 'swapped' : ''} ${it ? 'has' : ''}"><small>${esc(c.name)}</small>${it ? esc(it.name) : '—'}${st.swapped[key] ? `<button type="button" class="st-fix" data-fix="${key}">↺ Put it back</button>` : ''}</span>`;
        }).join('');
        const ready = def.canFinish ? def.canFinish(st, api) : def.slots.every((sl) => def.cats.every((c) => c.optional || (c.only && !c.only.includes(sl.id)) || st.picks[sl.id][c.id]));
        $('[data-a=done]').disabled = !ready || (def.budget && api.spent() > st.budget);
      }

      root.addEventListener('click', (e) => {
        const it = e.target.closest('[data-item]'), sl = e.target.closest('[data-slot]'), ct = e.target.closest('[data-cat]'), fx = e.target.closest('[data-fix]');
        if (fx) {
          const [slot, cat] = fx.dataset.fix.split(':'); const orig = st.swapped[fx.dataset.fix];
          delete st.swapped[fx.dataset.fix]; st.picks[slot][cat] = orig === '__none' ? undefined : orig;
          DL.Audio.sfx('chime'); def.onFix && def.onFix(st, api, slot, cat); render(); return;
        }
        if (it) {
          const item = api.item(it.dataset.item);
          api.set(st.slot, st.cat, item.id);
          DL.Audio.sfx('select');
          def.onPick && def.onPick(st, api, item);
          const next = def.cats.find((c) => (!c.only || c.only.includes(st.slot)) && !st.picks[st.slot][c.id]);
          if (next && def.autoAdvance !== false) setTimeout(() => { if (!st.done) { st.cat = next.id; render(); } }, 420);
          return;
        }
        if (sl) {
          const from = st.slot; st.slot = sl.dataset.slot; DL.Audio.sfx('blip');
          def.onSlot && def.onSlot(st, api, from, st.slot);
          render(); return;
        }
        if (ct) { st.cat = ct.dataset.cat; DL.Audio.sfx('blip'); render(); }
      });
      $('[data-a=done]').onclick = () => finish('done');
      $('[data-a=quit]').onclick = () => finish('quit');

      let last = performance.now();
      const clock = setInterval(() => {
        const now = performance.now(), dt = (now - last) / 1000; last = now;
        if (document.hidden || st.done) return;
        if (def.time) { st.time = Math.max(0, st.time - dt); if (st.time <= 0) return finish('timeout'); }
        st.extra.t = (st.extra.t || 0) + dt;
        def.tick && def.tick(st, api, dt);
        const t = $('.st-stats .t');
        if (t) { t.textContent = '⏱ ' + Math.ceil(st.time) + 's'; t.classList.toggle('over', st.time <= 10); }
      }, 250);

      async function finish(how) {
        if (st.done) return;
        st.done = true; clearInterval(clock); clearTimeout(bubbleT);
        const res = how === 'quit' ? { result: 'left', how } : Object.assign({ how, spent: api.spent(), picks: st.picks }, def.finish(st, api, how));
        if (how !== 'quit' && def.reveal) {
          root.querySelector('.st-wrap').innerHTML = `<div class="st-reveal">${def.reveal(st, api, res)}<button type="button" class="btn primary" data-a="ok">Continue</button></div>`;
          DL.Audio.sfx(res.result === 'bad' ? 'static' : 'chime');
          await new Promise((r) => { root.querySelector('[data-a=ok]').onclick = r; });
        }
        root.remove();
        resolve(res);
      }

      def.init && def.init(st, api);
      render();
      if (def.intro) api.say(def.intro[0], def.intro[1], 5000);
    });
  }

  /* ---------------- shared bits ---------------- */
  const I = (id, cat, name, o = {}) => Object.assign({ id, cat, name }, o);
  const sum = (st, api, slot, key) => Object.values(st.picks[slot]).reduce((n, iid) => n + ((api.item(iid) || {})[key] || 0), 0);
  const stars = (n) => `<div class="st-stars">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</div>`;
  const verdict = (text, bad) => `<p class="st-verdict ${bad ? 'bad' : ''}">${text}</p>`;
  const meter = (n, max, icon) => `<span class="meter">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}">${icon}</i>`).join('')}</span>`;

  const GAMES = {};

  /* 1. THRIFT STORE TREASURE HUNT (comes first: what you buy goes into Stardust Beauty) */
  const NOTES = {
    top_music: 'if you’re reading this, the cardigan is warm. i’m not, anymore.',
    bag_bow: 'haruka, the station. 6pm. i’ll wait at the far end like always.',
    x_clips: 'i only said the mean thing so they’d look at me and not at her.',
  };
  GAMES.thrift = {
    layout: 'left', cards: 'tag',
    name: 'Thrift Treasure Hunt', jp: '古着屋', shop: 'Kaze Thrift · 風古着', who: 'Rin',
    brief: 'Rin needs an exhibition outfit and has ¥3,000. Everything here is one of a kind, and some pockets still have things in them.',
    slots: [{ id: 'rin', name: 'Rin' }],
    cats: [{ id: 'outfit', name: 'Outfit' }, { id: 'bag', name: 'Bag' }, { id: 'shoes', name: 'Shoes' }, { id: 'extra', name: 'Extra' }],
    budget: (s, o) => o.budget ?? 3000,
    items: [
      I('top_piano', 'outfit', 'Piano-girl tee', { img: 'top_piano', price: 500, r: 3, desc: 'A girl carrying a case bigger than she is. Very Rin.' }),
      I('top_music', 'outfit', 'Sheet-music cami + shrug', { img: 'top_music', price: 900, r: 3, desc: 'Brown knit, lace cuffs. Something crinkles in the pocket.' }),
      I('top_mint', 'outfit', 'Mint tie-front blouse', { img: 'top_mint', price: 700, r: 2 }),
      I('top_paisley', 'outfit', 'Blue paisley one-shoulder', { img: 'top_paisley', price: 600, r: 1 }),
      I('look_denim', 'outfit', 'Denim vest & lace shirt', { img: 'look_denim', price: 1300, r: 2 }),
      I('look_sweater', 'outfit', '“You no matter what” knit', { img: 'look_sweater', price: 1100, r: 2 }),
      I('dress_witch', 'outfit', 'Lilac witch tutu', { img: 'dress_witch', price: 1500, r: 3, desc: 'Ridiculous. She keeps touching it.' }),
      I('look_cola', 'outfit', 'Cola tank & black tulle', { img: 'look_cola', price: 800, r: 0 }),
      I('top_leobow', 'outfit', 'Pink leopard-bow halter', { img: 'top_leobow', price: 700, r: -2, pink: true, desc: 'Somebody else’s style entirely.' }),
      I('bag_plaid', 'bag', 'Mint star barrel bag', { img: 'bag_plaid', price: 700, r: 2 }),
      I('bag_beaded', 'bag', 'Beaded orchid shoulder bag', { img: 'bag_beaded', price: 900, r: 2 }),
      I('bag_orchid', 'bag', 'Blue flower baguette', { img: 'bag_orchid', price: 600, r: 1 }),
      I('bag_bow', 'bag', 'Lace-bow velvet bag', { img: 'bag_bow', price: 800, r: 3, desc: 'Silver stars on chains. The lining is torn.' }),
      I('shoe_teapot', 'shoes', 'Teapot-heel Mary Janes', { img: 'shoe_teapot', price: 900, r: 2 }),
      I('shoe_mintchoc', 'shoes', 'Mint-choc platforms', { img: 'shoe_mintchoc', price: 700, r: 3 }),
      I('shoe_pearl', 'shoes', 'Pearl-lace trainers', { img: 'shoe_pearl', price: 800, r: 1 }),
      I('legs_stars', 'shoes', 'Starry-night tights', { img: 'legs_stars', price: 400, r: 2 }),
      I('x_glasses', 'extra', 'Star-chain glasses', { img: 'x_glasses', price: 500, r: 3, desc: 'Her glasses, but brave.' }),
      I('x_clips', 'extra', 'Silver bow hairclip', { img: 'x_clips', price: 300, r: 2, desc: 'Wrapped in a folded note.' }),
      I('x_parasol', 'extra', 'Lace parasol', { img: 'x_parasol', price: 600, r: 1 }),
      I('x_tamagotchi', 'extra', 'Pet keychain (still alive)', { img: 'x_tamagotchi', price: 400, r: 2 }),
      I('x_witchhat', 'extra', 'Ruffled witch hat', { img: 'x_witchhat', price: 700, r: 1 }),
    ],
    intro: ['rin', 'Everything here used to be someone else’s. I like that. It already has a story.'],
    tag: (i) => (NOTES[i.id] ? '✉︎ something in the pocket' : ''),
    preview(st, api) {
      const p = (c) => ({ it: api.picked('rin', c), bad: api.isSwapped('rin', c) });
      const notes = (st.extra.notes || []).map((n, k) => `<p class="note n${k}">${esc(n)}</p>`).join('');
      return lookbook('rin', [p('outfit'), p('bag'), p('shoes'), p('extra')], { extra: `<div class="notes">${notes}</div>` });
    },
    stat: (st) => `✉︎ notes <b>${(st.extra.notes || []).length}/3</b>`,
    onPick(st, api, it) {
      if (NOTES[it.id] && !(st.extra.notes || []).includes(NOTES[it.id])) {
        st.extra.notes = [...(st.extra.notes || []), NOTES[it.id]]; DL.Audio.sfx('page');
        api.say('rin', 'There’s a folded note in here. Small, neat handwriting… in blue pen.', 5000);
      } else api.say('rin', it.r >= 3 ? 'Oh. Oh, I love this.' : it.pink ? 'That’s… really not me. Who even put this in my size?' : it.r <= 0 ? 'Hmm. Maybe for someone louder.' : 'That could work!');
      api.render();
    },
    finish(st, api) {
      const R = sum(st, api, 'rin', 'r'), notes = (st.extra.notes || []).length;
      const result = R >= 10 ? 'great' : R >= 6 ? 'ok' : 'meh';
      return { R, notes, noteTexts: st.extra.notes || [], result, stars: result === 'great' ? 3 : result === 'ok' ? 2 : 1 };
    },
    reveal(st, api, r) {
      return `<h2>Rin’s exhibition look <span class="jp">展示会</span></h2><div class="rv-row">${GAMES.thrift.preview(st, api)}</div>
        ${verdict(r.result === 'great' ? '“This is the first outfit I’ve ever wanted to be photographed in.” She carries the bag to Stardust Beauty like it’s full of film.' : r.result === 'ok' ? '“It’s good! It’s a little bit me. Can we take it to Stardust Beauty next?”' : '“Thank you. I’ll… wear it to something.”')}${stars(r.stars)}`;
    },
  };

  /* 2. STARDUST BEAUTY: Rin's makeover, using what you thrifted -------- */
  GAMES.beauty = {
    layout: 'left', cards: 'box',
    name: 'Stardust Beauty', jp: 'スターダスト', shop: 'Stardust Beauty · 星屑コスメ', who: 'Rin', staff: 'Shop assistant',
    brief: 'Rin wants to look “like the kind of person people photograph”. Her thrift finds are already in the bag. Add hair, make-up, jewellery and a finishing touch.',
    slots: [{ id: 'rin', name: 'Rin' }],
    cats: [{ id: 'hair', name: 'Hair' }, { id: 'face', name: 'Make-up' }, { id: 'jewel', name: 'Jewellery' }, { id: 'touch', name: 'Finishing touch' }],
    budget: (s, o) => o.budget ?? Math.min(s.money ?? 3000, 3600),
    items: [
      I('h_own', 'hair', 'Her own hair, brushed', { swatch: 'plum', icon: '✂', price: 0, bold: -1, desc: 'Lavender, a bit in her eyes. Safe.' }),
      I('h_jewels', 'hair', 'Crystal-bead lilac wig', { img: 'hair_jewels', price: 1400, bold: 3, desc: 'Strands of glass beads. She will sparkle in every photo.' }),
      I('h_midnight', 'hair', 'Midnight-blue curls', { img: 'hair_midnight', price: 1100, bold: 2 }),
      I('h_mint', 'hair', 'Mint curls with cocoa bows', { img: 'hair_mintbows', price: 1000, bold: 1 }),
      I('h_candy', 'hair', 'Carousel candy-pink wig', { img: 'hair_candy', price: 1500, bold: 0, pink: true, desc: 'Very loud. Very pink. Very Haruka.' }),
      I('m_balm', 'face', 'Clear balm, nothing else', { swatch: '#f1c3c3', icon: '◌', price: 300, bold: -1, desc: 'Nobody will notice.' }),
      I('m_crystal', 'face', 'Crystal brows & glass blush', { img: 'mk_crystal', price: 1100, bold: 3 }),
      I('m_swirl', 'face', 'Lilac swirl liner', { img: 'mk_swirl', price: 800, bold: 2 }),
      I('m_pearl', 'face', 'Pearl & shell glitter', { img: 'mk_pearl', price: 900, bold: 2 }),
      I('m_lips', 'face', 'Galaxy gloss lips', { img: 'mk_lips', price: 700, bold: 2, desc: 'Purple, glittery, impossible to ignore.' }),
      I('j_none', 'jewel', 'No jewellery', { swatch: '#eee', icon: '—', price: 0, bold: -1 }),
      I('j_butterfly', 'jewel', 'Butterfly heart layers', { img: 'jw_butterfly', price: 600, bold: 1 }),
      I('j_beads', 'jewel', 'Garden bead bracelet', { img: 'jw_beads', price: 500, bold: 1 }),
      I('j_lily', 'jewel', 'Lily wire arm cuff', { img: 'cuff_lily', price: 800, bold: 2 }),
      I('j_angel', 'jewel', 'Amethyst angel collar', { img: 'jw_angel', price: 1500, bold: 3, desc: 'Gold wings. Heavier than her camera.' }),
      I('j_rose', 'jewel', 'Rose pearl choker', { img: 'jw_rosechoker', price: 700, bold: 2 }),
      I('j_bangles', 'jewel', 'Pink zebra bangle stack', { img: 'jw_bangles', price: 600, bold: 0, pink: true }),
      I('t_none', 'touch', 'Keep the camera up', { swatch: '#e6e0ea', icon: '◎', price: 0, bold: -1 }),
      I('t_fan', 'touch', 'Mother-of-pearl fan', { img: 'x_fan', price: 900, bold: 2 }),
      I('t_wand', 'touch', 'Pink crystal wand', { img: 'x_wand', price: 700, bold: 1 }),
      I('t_crown', 'touch', 'Angel-wing halo crown', { img: 'x_angelcrown', price: 1300, bold: 3, desc: 'For the exhibition opening. Obviously.' }),
      I('t_stars', 'touch', 'Gold star stickers', { swatch: 'gold', icon: '✦', price: 300, bold: 2 }),
    ],
    intro: ['rin', 'I don’t really… I usually just hide behind the camera. Help?'],
    thriftPins(st) {
      const bag = st.opts.thrift || {}; const T = GAMES.thrift.items;
      return ['outfit', 'bag', 'shoes'].map((c) => T.find((i) => i.id === bag[c])).filter(Boolean);
    },
    preview(st, api) {
      const p = (c, spot) => ({ it: api.picked('rin', c), bad: api.isSwapped('rin', c), spot });
      const thrift = GAMES.beauty.thriftPins(st).map((it, k) => ({ it, small: true, spot: ['bl', 'bc', 'br'][k], label: 'thrift: ' + it.name }));
      const haunt = st.extra.haunt;
      const mirror = `<div class="lb-mirror ${haunt ? 'haunt' : ''}"><img src="${haunt ? FACE.haruka : FACE.rin}" alt=""><span>${haunt ? '' : 'mirror'}</span></div>`;
      return lookbook('rin', [p('hair', 'tl'), p('face', 'ml'), p('jewel', 'mr'), p('touch', 'tr'), ...thrift], { extra: mirror, cls: 'beauty' });
    },
    stat: (st, api) => `courage ${meter(clamp(sum(st, api, 'rin', 'bold') + 3, 0, 9), 9, '✦')}`,
    onPick(st, api, it) {
      api.say('rin', it.pink ? 'Is this… for me? It feels like someone else’s.' : it.bold >= 3 ? 'That’s so much. Do you really think I could?' : it.bold <= -1 ? 'That one’s safe. Safe is good. Right?' : 'Oh, that’s pretty.');
    },
    tick(st, api) {
      // the shop mirror shows Haruka behind Rin, "trying" a product on her
      if (!st.extra.hauntDone && st.extra.t > 9 && Object.keys(st.picks.rin).length >= 2) {
        st.extra.hauntDone = true; st.extra.haunt = true; DL.Audio.sfx('static');
        const cat = pick(['hair', 'jewel'].filter((c) => !api.picked('rin', c)?.pink));
        if (cat) api.set('rin', cat, cat === 'hair' ? 'h_candy' : 'j_bangles', true);
        api.say('mirror', 'In the mirror, Haruka is standing right behind Rin, smiling, holding something pink.', 5200);
        setTimeout(() => { st.extra.haunt = false; if (!st.done) api.render(); }, 4200);
      }
    },
    finish(st, api) {
      const bold = sum(st, api, 'rin', 'bold');
      const haunted = Object.values(st.picks.rin).some((i) => api.item(i)?.pink);
      return { bold, haunted, result: haunted ? 'bad' : bold >= 6 ? 'great' : bold >= 2 ? 'ok' : 'hiding', stars: haunted ? 0 : bold >= 6 ? 3 : bold >= 2 ? 2 : 1 };
    },
    reveal(st, api, r) {
      const line = r.haunted ? 'Rin turns to the mirror, and the girl in it doesn’t turn with her. “That’s… not what I picked,” she whispers.'
        : r.result === 'great' ? '“I look like someone people would want to photograph.” She lowers the camera. “I think I want to be in the picture this time.”'
          : r.result === 'ok' ? '“It’s nice. It’s still a bit… me-hiding. But nice.”' : '“I look exactly the same. That’s… fine. That’s what I wanted. Probably.”';
      return `<div class="cover ${r.haunted ? 'bad' : ''}"><div class="mast">STARDUST<small>spring issue · before &amp; after</small></div>
        <div class="ba"><figure class="before"><img src="${SPR.rin}" alt=""><figcaption>before</figcaption></figure>
        <div class="after">${GAMES.beauty.preview(st, api)}<span class="lbl">after</span></div></div></div>${verdict(esc(line), r.haunted)}${stars(r.stars)}`;
    },
  };

  /* 3. GIFT HUNT: the twins' shared birthday --------------------------- */
  GAMES.gifts = {
    layout: 'right', cards: 'case',
    name: 'Gift Hunt', jp: '誕生日', shop: 'Hoshizora Mall · gift floor', who: 'Haruka & Hikaru',
    brief: 'It’s the twins’ birthday. One gift each, one budget. The gifts must NOT look like a matching set, and Haruka will compare.',
    slots: [{ id: 'haruka', name: '🎀 For Haruka', tone: 'pink' }, { id: 'hikaru', name: '☁ For Hikaru', tone: 'blue' }],
    cats: [{ id: 'gift', name: 'Gift' }, { id: 'wrap', name: 'Wrapping' }],
    budget: (s, o) => o.budget ?? Math.min(s.money ?? 3000, 4000),
    items: [
      I('g_lockets', 'gift', 'Heart locket (from a pair)', { img: 'jw_lockets', price: 1200, set: 'locket', h: 1, k: 2, desc: 'Sold as two halves. Buy it twice and they match.' }),
      I('g_cuffs', 'gift', 'Crystal arm cuff (one of a pair)', { img: 'cuff_pair', price: 1100, set: 'cuff', h: 2, k: 1 }),
      I('g_bluebangles', 'gift', 'Blue cloisonné bangles', { img: 'jw_bluebangles', price: 1300, h: -1, k: 3 }),
      I('g_bangles', 'gift', 'Pink zebra bangle stack', { img: 'jw_bangles', price: 800, h: 3, k: -1 }),
      I('g_spikes', 'gift', 'Studded lace cuffs', { img: 'jw_spikes', price: 700, h: 2, k: 0 }),
      I('g_spikeheart', 'gift', 'Spiked heart choker', { img: 'jw_spikeheart', price: 1000, h: 3, k: -1 }),
      I('g_tamagotchi', 'gift', 'Virtual pet + charms', { img: 'x_tamagotchi', price: 900, h: 2, k: 1 }),
      I('g_keys', 'gift', 'Blue key & heart charms', { img: 'x_keychains', price: 600, h: 0, k: 3 }),
      I('g_orchidbag', 'gift', 'Blue flower baguette bag', { img: 'bag_orchid', price: 1400, h: 0, k: 3 }),
      I('g_tights', 'gift', 'Starry-night tights', { img: 'legs_stars', price: 500, h: -1, k: 2 }),
      I('g_polka', 'gift', 'Pink polka-dot lace tee', { img: 'top_polka', price: 900, h: 3, k: -1 }),
      I('g_teapot', 'gift', 'Teapot-heel shoes', { img: 'shoe_teapot', price: 1500, h: 2, k: 1 }),
      I('w_pink', 'wrap', 'Pink paper, giant bow', { color: 'pink', icon: '🎀', price: 150, h: 1, k: 0 }),
      I('w_blue', 'wrap', 'Cloud paper, blue ribbon', { color: 'sky', icon: '☁', price: 150, h: 0, k: 1 }),
      I('w_leo', 'wrap', 'Leopard tissue', { color: 'leopard', price: 200, h: 1, k: -1 }),
      I('w_news', 'wrap', 'Old newspaper', { color: 'grey', icon: '▤', price: 0, h: -1, k: 0 }),
    ],
    intro: ['you', 'Two gifts. One budget. And Haruka is definitely going to compare.'],
    tag: (i, st) => {
      const other = st.slot === 'haruka' ? 'hikaru' : 'haruka';
      const o = GAMES.gifts.items.find((x) => x.id === st.picks[other].gift);
      return o && i.cat === 'gift' && (o.id === i.id || (o.set && o.set === i.set)) ? '⚠ same as her sister’s' : '';
    },
    preview(st, api) {
      const box = (slot) => {
        const g = api.picked(slot, 'gift'), w = api.picked(slot, 'wrap');
        return `<div class="gift ${slot} ${st.slot === slot ? 'sel' : ''}">
          <div class="box" style="background:${w ? swatchCss(w) : 'repeating-linear-gradient(45deg,#f4eef2 0 8px,#fff 8px 16px)'}"><span class="ribbon"></span><span class="bow">${w ? (w.icon || '🎀') : ''}</span></div>
          ${g ? polaroid(g, { cls: 'tagpic' }) : '<div class="empty">?</div>'}
          <b>${slot === 'haruka' ? 'Haruka' : 'Hikaru'}</b></div>`;
      };
      const a = api.picked('haruka', 'gift'), b = api.picked('hikaru', 'gift');
      const match = a && b && (a.id === b.id || (a.set && a.set === b.set));
      return `<div class="gifts">${box('haruka')}${box('hikaru')}</div>${match ? '<p class="warnline">They match. Haruka will LOVE that. Hikaru won’t.</p>' : ''}`;
    },
    onPick(st, api, it) {
      if (it.cat === 'gift') api.say('you', st.slot === 'haruka' ? (it.h >= 3 ? 'Haruka would love this.' : it.h <= 0 ? 'Hm, is this really her?' : 'Maybe…') : (it.k >= 3 ? 'This feels like Hikaru.' : it.k <= 0 ? 'Not sure Hikaru would…' : 'Maybe…'));
    },
    finish(st, api) {
      const gH = api.picked('haruka', 'gift'), gK = api.picked('hikaru', 'gift');
      const match = gH.id === gK.id || (gH.set && gH.set === gK.set);
      const H = sum(st, api, 'haruka', 'h'), K = sum(st, api, 'hikaru', 'k');
      const jealous = gK.price > gH.price;
      const result = match ? 'bad' : H >= 3 && K >= 3 ? 'great' : H >= 1 && K >= 1 ? 'ok' : 'meh';
      return { H, K, match, jealous, result, stars: { great: 3, ok: 2, meh: 1, bad: 0 }[result], gH: gH.name, gK: gK.name };
    },
    reveal(st, api, r) {
      const gH = api.picked('haruka', 'gift'), gK = api.picked('hikaru', 'gift');
      return `<h2>Happy birthday <span class="jp">お誕生日おめでとう</span></h2>
        <div class="unwrap"><div class="u pink">${polaroid(gH)}<p>Haruka tears hers open first. ${r.H >= 3 ? '“…Okay. You actually know me.”' : r.H >= 1 ? '“Cute. I guess.”' : '“Is this a joke?”'}</p></div>
        <div class="u blue">${polaroid(gK, { bad: r.match })}<p>Then she doesn’t open anything else. She just watches Hikaru unwrap hers.</p></div></div>
        ${verdict(r.match ? 'Haruka gasps. “They MATCH. We’re a set!” Hikaru puts hers back in the paper very carefully, like it might bite.'
          : r.jealous ? 'Haruka’s smile stays on her face a beat too long. “Hers was more expensive,” she says, to nobody.'
            : r.K >= 3 ? 'Hikaru holds it against her chest. “You remembered,” she says, very quietly.' : 'Hikaru says thank you. She means it, mostly.', r.match)}${stars(r.stars)}`;
    },
  };

  /* 4. HAIR SALON PANIC ---------------------------------------------------- */
  GAMES.salon = {
    layout: 'right', cards: 'book',
    name: 'Hair Salon Panic', jp: '美容院', shop: 'Salon Lumière · サロン', who: 'Hikaru', staff: 'Stylist', time: 70,
    brief: 'Haruka booked you both in, then whispered to the stylist. Pick Hikaru’s style, colour and accessory. When the scissors head the wrong way, hit STOP.',
    slots: [{ id: 'hikaru', name: 'Hikaru' }],
    cats: [{ id: 'style', name: 'Style photo' }, { id: 'colour', name: 'Colour' }, { id: 'acc', name: 'Accessory' }],
    items: [
      I('s_streak', 'style', 'Soft bob, blue streak', { src: 'assets/wardrobe/hair_bluestreak.webp', k: 3 }),
      I('s_midnight', 'style', 'Midnight waves', { img: 'hair_midnight', k: 3 }),
      I('s_crystal', 'style', 'Crystal-pinned layers', { src: 'assets/wardrobe/hair_crystal.webp', k: 2 }),
      I('s_mint', 'style', 'Mint curls, cocoa bows', { img: 'hair_mintbows', k: 1 }),
      I('s_lilac', 'style', 'Long lilac', { src: 'assets/wardrobe/hair_lilac.webp', k: 1 }),
      I('s_leopard', 'style', 'High pony like Haruka’s', { src: 'assets/wardrobe/hair_leopard.webp', k: -2, pink: true }),
      I('h_ice', 'colour', 'Ice blue', { color: 'blue', k: 3, tint: '#8fc3ff' }), I('h_navy', 'colour', 'Midnight navy', { color: 'navy', k: 2, tint: '#3f5f8f' }),
      I('h_silver', 'colour', 'Silver & blue', { swatch: 'linear-gradient(135deg,#d9dde6 50%,#8fc3ff 50%)', k: 2, tint: '#c9d6ec' }),
      I('h_lilac', 'colour', 'Lilac', { color: 'lav', k: 1, tint: '#c7b6ea' }),
      I('h_pink', 'colour', 'Pink like Haruka’s', { color: 'pink', k: -2, pink: true, tint: '#ff8fbf' }),
      I('a_clip', 'acc', 'Silver bow clip', { img: 'x_clips', k: 2 }), I('a_keys', 'acc', 'Blue key charms', { img: 'x_keychains', k: 2 }),
      I('a_star', 'acc', 'Star clip', { color: 'gold', icon: '★', k: 2 }), I('a_none', 'acc', 'Nothing', { color: '#eee', icon: '—', k: 1 }),
      I('a_bow', 'acc', 'Giant pink bow', { color: 'hotpink', icon: '🎀', k: -1, pink: true }),
    ],
    intro: ['haruka', 'I already told the stylist what we want. Just… go along with it ✿'],
    preview(st, api) {
      const sty = api.picked('hikaru', 'style'), c = api.picked('hikaru', 'colour'), a = api.picked('hikaru', 'acc');
      const pic = (it) => it && polaroid(it, { cls: 'pin', bad: api.isSwapped('hikaru', it.cat) });
      return `<div class="salon"><div class="mirror-big"><div class="glass" style="--tint:${c ? c.tint : 'transparent'}"><img src="${SPR.hikaru}" alt=""></div>
        ${st.extra.snip ? '<div class="snip">✂</div>' : ''}</div>
        <div class="tuck s1">${pic(sty) || '<span class="hint">tuck the style photo here</span>'}</div>
        <div class="tuck s2">${c ? `<span class="chip" style="background:${swatchCss(c)}"></span><small>${esc(c.name)}</small>` : ''}</div>
        <div class="tuck s3">${pic(a) || ''}</div></div>`;
    },
    stat: (st, api) => `Hikaru ${meter(clamp(sum(st, api, 'hikaru', 'k'), 0, 8), 8, '♪')}`,
    onPick(st, api, it) { api.say('hikaru', it.pink ? 'That’s… her hair. Not mine.' : it.k >= 3 ? 'Oh. I like that.' : 'Okay. Maybe.'); },
    tick(st, api) {
      st.extra.next = st.extra.next ?? 7;
      if (st.extra.snip) return;
      if (st.extra.t > st.extra.next && Object.keys(st.picks.hikaru).length) {
        st.extra.next = st.extra.t + rand(7, 11);
        st.extra.snip = true; DL.Audio.sfx('static'); api.render();
        const stop = el('button', 'st-stop', '✂ STOP! She’s cutting it like Haruka’s!'); stop.type = 'button';
        api.root.querySelector('.st-left').appendChild(stop);
        const cancel = setTimeout(() => {
          stop.remove(); st.extra.snip = false;
          const cat = pick(['style', 'colour', 'acc'].filter((c) => st.picks.hikaru[c] && !api.picked('hikaru', c).pink));
          if (cat) { api.set('hikaru', cat, { style: 's_leopard', colour: 'h_pink', acc: 'a_bow' }[cat], true); api.say('staff', 'Snip! There we go, just like her sister ✿'); } else api.render();
        }, 2600);
        stop.onclick = () => { clearTimeout(cancel); stop.remove(); st.extra.snip = false; st.extra.stops = (st.extra.stops || 0) + 1; DL.Audio.sfx('chime'); api.say('hikaru', 'Thank you. I didn’t know how to say no.'); api.render(); };
      }
    },
    finish(st, api, how) {
      const K = sum(st, api, 'hikaru', 'k'), pinks = Object.values(st.picks.hikaru).filter((i) => api.item(i)?.pink).length;
      const result = how === 'timeout' && Object.keys(st.picks.hikaru).length < 3 ? 'bad' : pinks >= 2 ? 'bad' : K >= 7 ? 'great' : K >= 4 ? 'ok' : 'meh';
      return { K, pinks, result, stars: { great: 3, ok: 2, meh: 1, bad: 0 }[result] };
    },
    reveal(st, api, r) {
      const line = r.result === 'bad' ? 'Hikaru looks in the mirror. Haruka is standing right behind her, and for a second you can’t tell which reflection is which.'
        : r.result === 'great' ? 'Hikaru turns her head left and right. “It’s me. It’s really me.” Haruka says nothing at all.'
          : 'It’s… fine. Hikaru touches the ends like she’s checking they’re still hers.';
      const ghost = r.result === 'bad' ? `<img class="ghost" src="${SPR.haruka}" alt="">` : '';
      return `<h2>The mirror <span class="jp">鏡</span></h2><div class="rv-row salon-rv">${GAMES.salon.preview(st, api).replace('<div class="glass"', ghost + '<div class="glass"')}</div>${verdict(esc(line), r.result === 'bad')}${stars(r.stars)}`;
    },
  };

  /* 5. NAIL SALON NIGHT ---------------------------------------------------- */
  const fingers = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
  GAMES.nails = {
    layout: 'top', cards: 'bottle',
    name: 'Nail Salon Night', jp: 'ネイル', shop: 'Nail bar · ネイルサロン', who: 'Haruka & Hikaru', time: 100,
    brief: 'Paint all ten nails: Haruka’s hand on the left, Hikaru’s on the right. Every time you look at another finger, one of Hikaru’s might turn pink. Don’t let her hand match.',
    slots: [...fingers.map((f, i) => ({ id: 'h' + i, name: 'H·' + f, tone: 'pink' })), ...fingers.map((f, i) => ({ id: 'k' + i, name: 'K·' + f, tone: 'blue' }))],
    cats: [{ id: 'colour', name: 'Polish' }, { id: 'art', name: 'Nail art', optional: true }],
    autoAdvance: false,
    items: [
      I('n_pink', 'colour', 'Bubblegum', { color: 'pink', pink: true }), I('n_hot', 'colour', 'Hot pink', { color: 'hotpink', pink: true }),
      I('n_leo', 'colour', 'Leopard', { color: 'leopard', pink: true }), I('n_blue', 'colour', 'Ice blue', { color: 'blue' }),
      I('n_navy', 'colour', 'Midnight', { color: 'navy' }), I('n_lav', 'colour', 'Lilac', { color: 'lav' }), I('n_white', 'colour', 'Milk', { color: 'white' }),
      I('n_chrome', 'colour', 'Pearl chrome', { swatch: 'linear-gradient(135deg,#fff,#d6e6ff 40%,#f6dcf0 70%,#fff)' }),
      I('a_dots', 'art', 'Polka dots', { color: '#fff', icon: '∴' }), I('a_star', 'art', 'Gold star', { color: 'gold', icon: '★' }),
      I('a_heart', 'art', 'Heart', { color: 'hotpink', icon: '♥' }), I('a_moon', 'art', 'Moon', { color: 'sky', icon: '☾' }),
      I('a_gem', 'art', 'Crystal', { color: '#e8f4ff', icon: '◆' }), I('a_bow', 'art', 'Bow', { color: 'blush', icon: '🎀' }),
    ],
    intro: ['haruka', 'Matching nails! Both hands! It’ll be so cute ✿'],
    preview(st, api) {
      const grad = (c) => (c === 'leopard' ? 'url(#leo)' : c === 'n_chrome' ? 'url(#chrome)' : col(c));
      const nail = (sl, x, y, w, h) => {
        const p = st.picks[sl] || {}, c = api.item(p.colour), a = api.item(p.art);
        const sw = st.swapped[sl + ':colour'], sel = st.slot === sl;
        const fill = c ? (c.id === 'n_chrome' ? 'url(#chrome)' : grad(c.color)) : '#f6e3dc';
        return `<g class="nail" data-slot="${sl}" style="cursor:pointer">
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}" stroke="${sel ? '#2a2430' : sw ? '#e0588c' : 'rgba(150,100,100,.35)'}" stroke-width="${sel ? 3.5 : sw ? 3 : 1.2}"/>
          ${c ? `<rect x="${x + 5}" y="${y + 5}" width="${w * 0.22}" height="${h * 0.5}" rx="4" fill="#fff" opacity=".55"/>` : ''}
          ${a ? `<text x="${x + w / 2}" y="${y + h * 0.62}" text-anchor="middle" font-size="${w * 0.48}" fill="${col(a.color)}" stroke="rgba(0,0,0,.15)" stroke-width=".5">${a.icon}</text>` : ''}
          ${sel ? `<circle cx="${x + w / 2}" cy="${y - 12}" r="5" fill="#2a2430"/>` : ''}</g>`;
      };
      const hand = (pre, ox, flip, skin, shade) => {
        const F = [[8, 170, 70, 46], [58, 52, 175, 40], [104, 30, 196, 40], [150, 48, 178, 40], [196, 92, 132, 34]];
        const fx = (x, w) => (flip ? 250 - x - w : x);
        const fingersSvg = F.map(([x, top, h, w]) => `<rect x="${fx(x, w)}" y="${top}" width="${w}" height="${h + 60}" rx="${w / 2}" fill="${skin}" stroke="${shade}" stroke-width="1.5"/>`).join('');
        const nails = F.map(([x, top, , w], f) => nail(pre + f, fx(x, w) + 6, top + 8, w - 12, f === 0 ? 38 : 46)).join('');
        const sleeve = flip ? '#cfe3fb' : '#ffd4e4';
        return `<g transform="translate(${ox} 0)"><path d="M10 215 C10 330 40 360 125 360 C210 360 240 330 240 215 Z" fill="${skin}" stroke="${shade}" stroke-width="1.5"/>${fingersSvg}
          <rect x="18" y="330" width="214" height="40" rx="14" fill="${sleeve}"/>${nails}</g>`;
      };
      const defs = '<linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#d6e6ff"/><stop offset=".75" stop-color="#f6dcf0"/><stop offset="1" stop-color="#fff"/></linearGradient>';
      return `<div class="nails">${svg('0 0 560 380', `<rect x="0" y="300" width="560" height="80" rx="18" fill="#efe4f4"/>
        ${hand('h', 16, false, '#f7d9cc', '#e3b9a8')}${hand('k', 294, true, '#f6dacf', '#e0b8aa')}
        <text x="140" y="378" text-anchor="middle" font-size="15" font-weight="700" fill="#c9567f">Haruka</text><text x="420" y="378" text-anchor="middle" font-size="15" font-weight="700" fill="#3f7fbf">Hikaru</text>`, '', defs)}
        <p class="hint">Tap a nail (or the finger buttons) to paint it.</p></div>`;
    },
    stat(st, api) {
      const kp = [0, 1, 2, 3, 4].filter((i) => api.item(st.picks['k' + i].colour)?.pink).length;
      return `Hikaru’s pink nails <b class="${kp >= 3 ? 'warn' : ''}">${kp}/5</b>`;
    },
    onSlot(st, api) {
      // look away… and one of Hikaru's nails turns pink
      const done = [0, 1, 2, 3, 4].map((i) => 'k' + i).filter((k) => k !== st.slot && st.picks[k].colour && !api.item(st.picks[k].colour).pink);
      if (done.length && Math.random() < 0.4 && st.extra.t - (st.extra.lastFlip || -9) > 4) {
        st.extra.lastFlip = st.extra.t;
        const k = pick(done); api.set(k, 'colour', pick(['n_pink', 'n_hot']), true); DL.Audio.sfx('static');
        api.say('hikaru', '…{name}? My nail. I didn’t pick that colour.');
      }
      const kp = [0, 1, 2, 3, 4].filter((i) => api.item(st.picks['k' + i].colour)?.pink).length;
      if (kp >= 5) api.end('matched');
    },
    canFinish: (st) => st.def.slots.every((sl) => st.picks[sl.id].colour),
    finish(st, api, how) {
      const kp = [0, 1, 2, 3, 4].filter((i) => api.item(st.picks['k' + i].colour)?.pink).length;
      const hp = [0, 1, 2, 3, 4].filter((i) => api.item(st.picks['h' + i].colour)?.pink).length;
      const result = how === 'matched' || how === 'timeout' || kp >= 4 ? 'bad' : kp === 0 && hp >= 4 ? 'great' : kp <= 1 ? 'ok' : 'meh';
      return { kp, hp, result, stars: { great: 3, ok: 2, meh: 1, bad: 0 }[result] };
    },
    reveal(st, api, r) {
      const line = r.result === 'bad' ? 'They hold their hands up side by side. Ten pink nails. Haruka laces her fingers through her sister’s and doesn’t let go.'
        : r.result === 'great' ? 'Pink on the left, blue on the right. Haruka pouts. Hikaru keeps looking at her hand like it’s a little sky.'
          : 'Mostly theirs. A couple of nails on Hikaru’s hand are a colour neither of you chose.';
      return `<h2>Ten nails <span class="jp">十本の爪</span></h2><div class="rv-row">${GAMES.nails.preview(Object.assign({}, st, { slot: '' }), api)}</div>${verdict(esc(line), r.result === 'bad')}${stars(r.stars)}`;
    },
  };

  /* 6. PHOTO BOOTH PURIKURA ------------------------------------------------ */
  const STICKERS = [
    ['bear_glitter', 'Glitter bear'], ['bunny_face', 'Bunny face'], ['bunny_pot', 'Bunny & bear'], ['bunny_blue', 'Sparkle bunny'],
    ['bear_blue', 'Blue-coat bear'], ['bear_paper', 'Bear with a letter'], ['bear_brown', 'Cocoa bear'], ['bear_face2', 'Choco bear face'],
    ['bear_face3', 'Honey bear face'], ['bear_face4', 'Sleepy bear face'], ['cat', 'Pink cat'], ['cloud', 'Cloud ghost'], ['cloud2', 'Surprised cloud'],
    ['smiley', 'Sunny smiley'], ['smiley_blue', 'Blue smiley'], ['heart_big', 'Heart & arrow'], ['star', 'Star'], ['diamond', 'Gold sparkle'],
    ['icecream', 'Ice cream'], ['lamp', 'Glitter lamp'], ['bus', 'Pink bus'], ['car', 'Blue car'], ['laptop', 'Pink laptop'], ['bunny_red', 'Red glitter bunny'],
  ];
  GAMES.purikura = {
    layout: 'right', cards: 'sticker',
    name: 'Purikura', jp: 'プリクラ', shop: 'Station arcade · プリ機', who: 'Haruka & Hikaru',
    brief: 'Decorate the twins’ photo-sticker strip: a frame, a sticker and a caption for each of the four shots. No wrong answers.',
    slots: [1, 2, 3, 4].map((n) => ({ id: 'f' + n, name: 'Shot ' + n })),
    cats: [{ id: 'frame', name: 'Frame' }, { id: 'sticker', name: 'Sticker' }, { id: 'text', name: 'Caption' }],
    items: [
      I('fr_pink', 'frame', 'Pink hearts', { swatch: 'radial-gradient(circle at 20% 20%,#fff 0 4px,transparent 5px) 0 0/18px 18px, #f8b6cf' }),
      I('fr_blue', 'frame', 'Blue clouds', { swatch: 'radial-gradient(circle at 50% 60%,#fff 0 6px,transparent 7px) 0 0/22px 18px, #a9d1f5' }),
      I('fr_lav', 'frame', 'Lilac lace', { swatch: 'repeating-linear-gradient(45deg,#d9ccf2 0 6px,#efe8fb 6px 12px)' }),
      I('fr_leo', 'frame', 'Leopard', { color: 'leopard' }),
      I('fr_star', 'frame', 'Starry night', { swatch: 'radial-gradient(circle at 30% 40%,#fff 0 1.5px,transparent 2px) 0 0/14px 14px, linear-gradient(#2f3f73,#5b4a8f)' }),
      I('fr_mint', 'frame', 'Mint choc', { swatch: 'repeating-linear-gradient(90deg,#bfe8d6 0 10px,#8a5a3c 10px 13px)' }),
      ...STICKERS.map(([s, n]) => I('sk_' + s, 'sticker', n, { sticker: s })),
      I('tx_bff', 'text', '“BFF 4 ever”', { color: 'pink', icon: 'Aa', t: 'BFF 4 ever' }), I('tx_twins', 'text', '“twins ♡”', { color: 'lav', icon: 'Aa', t: 'twins ♡' }),
      I('tx_matsuri', 'text', '“sakura matsuri”', { color: 'blush', icon: 'Aa', t: 'sakura matsuri' }), I('tx_ily', 'text', '“dont forget me”', { color: 'sky', icon: 'Aa', t: 'dont forget me' }),
      I('tx_date', 'text', 'Today’s date', { color: 'cream', icon: '4.20', t: '2026.4.20' }), I('tx_cute', 'text', '“kawaii overload”', { color: 'hotpink', icon: 'Aa', t: 'kawaii overload!!' }),
    ],
    intro: ['haruka', 'Four shots! Make me look cute. Make her look… also there.'],
    shot(st, api, n, ghost) {
      const p = st.picks['f' + n] || {}, fr = api.item(p.frame), sk = api.item(p.sticker), tx = api.item(p.text);
      const poses = [['', ''], ['tilt-l', 'tilt-r'], ['close', 'close'], ['peace', 'away']][n - 1];
      return `<div class="pk-shot ${st.slot === 'f' + n ? 'sel' : ''} ${ghost ? 'ghost' : ''}" data-slot="f${n}" style="background:${fr ? swatchCss(fr) : '#f4eef2'}">
        <div class="pk-photo">${ghost ? `<img class="third" src="${FACE.hikaru}" alt="">` : ''}<img class="${poses[0]}" src="${FACE.haruka}" alt=""><img class="${poses[1]}" src="${FACE.hikaru}" alt=""></div>
        ${sk ? `<img class="pk-sticker a" src="${STK(sk.sticker)}" alt=""><img class="pk-sticker b" src="${STK(sk.sticker)}" alt="">` : ''}${tx ? `<span class="pk-text">${esc(tx.t)}</span>` : ''}</div>`;
    },
    preview(st, api) {
      return `<div class="pk-machine"><div class="pk-strip">${[1, 2, 3, 4].map((n) => GAMES.purikura.shot(st, api, n, st.extra.printed && n === 4)).join('')}</div></div>`;
    },
    onPick(st, api, it) { if (it.id === 'tx_ily') api.say('hikaru', '…Did you pick that one for me?'); else if (it.cat === 'sticker' && Math.random() < 0.3) api.say('haruka', pick(['Cute!! More bears!', 'Put it on MY side.', 'Ooh, the glitter one!'])); },
    finish: () => ({ result: 'printed', stars: 3 }),
    reveal(st, api) {
      st.extra.printed = true;
      return `<h2>The strip prints <span class="jp">印刷中…</span></h2><div class="rv-row pk-rv">${[1, 2, 3, 4].map((n) => GAMES.purikura.shot(Object.assign({}, st, { slot: '' }), api, n, n === 4)).join('')}</div>
        ${verdict('Haruka squeals over the first three. Then she sees the fourth, and goes quiet. There are three girls in it. The one at the back has no face, just a smile.', true)}`;
    },
  };

  /* 7. UNIFORM CUSTOMISER --------------------------------------------------- */
  GAMES.uniform = {
    layout: 'left', cards: 'hanger',
    name: 'Uniform Customiser', jp: '制服', shop: 'Your bedroom · 6:45am', who: 'You',
    brief: 'First day at Sakuragaoka! Make the uniform yours: cardigan, socks, bag charm and hairclip. People will notice.',
    slots: [{ id: 'you', name: 'You' }],
    cats: [{ id: 'cardi', name: 'Cardigan' }, { id: 'socks', name: 'Socks' }, { id: 'charm', name: 'Bag charm' }, { id: 'clip', name: 'Hairclip' }],
    items: [
      I('u_cream', 'cardi', 'Cream cardigan', { color: 'cream' }), I('u_navy', 'cardi', 'Navy cardigan', { color: 'navy' }), I('u_lav', 'cardi', 'Lilac cardigan', { color: 'lav' }), I('u_pinkc', 'cardi', 'Pink cardigan', { color: 'pink' }),
      I('u_mintc', 'cardi', 'Mint cardigan', { color: 'mint' }),
      I('u_loose', 'socks', 'Loose socks', { color: 'white', icon: '〰' }), I('u_knee', 'socks', 'Navy knee socks', { color: 'navy' }), I('u_frill', 'socks', 'Frilly ankle socks', { color: 'blush', icon: '✿' }),
      I('u_stars', 'socks', 'Starry tights', { img: 'legs_stars' }),
      I('u_bunny', 'charm', 'Bunny keychain', { sticker: 'bunny_face' }), I('u_cam', 'charm', 'Tiny camera charm', { color: 'black', icon: '📷' }), I('u_cherry', 'charm', 'Glitter cherries', { color: 'red', icon: '🍒' }),
      I('u_train', 'charm', 'Train pass holder', { color: 'sky', icon: '🚃' }), I('u_pet', 'charm', 'Virtual pet', { img: 'x_tamagotchi' }), I('u_bear', 'charm', 'Glitter bear', { sticker: 'bear_glitter' }),
      I('u_star', 'clip', 'Star clip', { color: 'gold', icon: '★' }), I('u_bow', 'clip', 'Ribbon bow', { color: 'red', icon: '🎀' }), I('u_pearl', 'clip', 'Pearl clips', { color: 'white', icon: '◦◦' }),
      I('u_heart', 'clip', 'Heart clip', { color: 'hotpink', icon: '♥' }), I('u_silver', 'clip', 'Silver bow clip', { img: 'x_clips' }),
    ],
    intro: ['you', 'New school, new uniform. It’s still creased from the bag.'],
    preview(st, api) {
      const it = (c) => api.picked('you', c);
      const c = (cat, d) => { const i = it(cat); return i ? (i.img ? 'url(#u_' + cat + ')' : fillOf(i.color)) : d; };
      const icon = (cat, x, y, size) => { const i = it(cat); if (!i) return ''; if (i.sticker) return `<image href="${STK(i.sticker)}" x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}"/>`; if (i.img) return `<image href="${IMG(i.img)}" x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="circle(48%)"/>`; return `<text x="${x}" y="${y + size * 0.35}" text-anchor="middle" font-size="${size}">${i.icon || ''}</text>`; };
      const defs = ['socks'].map((cat) => (it(cat) && it(cat).img ? `<pattern id="u_${cat}" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${IMG(it(cat).img)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>` : '')).join('');
      return `<div class="uni">${svg('0 0 260 360', `
        <ellipse cx="130" cy="350" rx="90" ry="10" fill="rgba(60,40,80,.12)"/>
        <path d="M86 52 C86 10 174 10 174 52 L180 120 L80 120Z" fill="#3a2a3f"/>
        <circle cx="130" cy="64" r="32" fill="#fde6dc"/><path d="M98 60 C100 30 160 30 162 60 C150 46 110 46 98 60Z" fill="#3a2a3f"/>
        <ellipse cx="118" cy="68" rx="3.5" ry="4.5" fill="#3a2a3f"/><ellipse cx="142" cy="68" rx="3.5" ry="4.5" fill="#3a2a3f"/><path d="M124 82 Q130 86 136 82" stroke="#c26a78" stroke-width="2" fill="none"/>
        ${icon('clip', 154, 44, 24)}
        <path d="M84 104 L176 104 L190 206 L70 206Z" fill="${c('cardi', '#3a4670')}" stroke="rgba(0,0,0,.18)"/><path d="M116 104 L130 140 L144 104Z" fill="#fff"/><path d="M124 108 L130 124 L136 108Z" fill="#c94d6c"/>
        <path d="M72 198 L188 198 L198 252 L62 252Z" fill="#4b4f7a"/><path d="M80 206 L180 206 M76 222 L184 222 M70 238 L190 238" stroke="#5b6094" stroke-width="2"/>
        <rect x="96" y="252" width="20" height="62" fill="#fde6dc"/><rect x="144" y="252" width="20" height="62" fill="#fde6dc"/>
        <rect x="94" y="276" width="24" height="44" rx="6" fill="${c('socks', '#eee')}" stroke="rgba(0,0,0,.1)"/><rect x="142" y="276" width="24" height="44" rx="6" fill="${c('socks', '#eee')}" stroke="rgba(0,0,0,.1)"/>
        <rect x="90" y="318" width="32" height="14" rx="6" fill="#3a2a3f"/><rect x="138" y="318" width="32" height="14" rx="6" fill="#3a2a3f"/>
        <rect x="190" y="172" width="58" height="46" rx="8" fill="#2a2430"/><path d="M198 172 C198 154 240 154 240 172" stroke="#2a2430" stroke-width="5" fill="none"/>
        <line x1="210" y1="218" x2="210" y2="232" stroke="#999" stroke-width="2"/>${icon('charm', 210, 248, 30)}`, '', defs)}</div>`;
    },
    finish: () => ({ result: 'done', stars: 3 }),
    reveal(st, api) { return `<h2>Ready for school <span class="jp">いってきます</span></h2><div class="rv-row">${GAMES.uniform.preview(st, api)}</div>${verdict('You look like yourself. That’s going to matter more than you think.')}`; },
  };

  /* 8. DOLL HOUSE ------------------------------------------------------------- */
  GAMES.dollhouse = {
    layout: 'right', cards: 'cutout',
    name: 'The Doll House', jp: '人形の家', shop: 'The windowsill · Amane house', who: 'Hikaru’s paper dolls',
    brief: 'Two paper dolls, one for each twin, and a shoebox of paper clothes cut out of old catalogues. Dress them the same or differently. Each way shows a different memory.',
    slots: [{ id: 'haruka', name: 'Paper Haruka', tone: 'pink' }, { id: 'hikaru', name: 'Paper Hikaru', tone: 'blue' }],
    cats: [{ id: 'dress', name: 'Dress' }, { id: 'ribbon', name: 'Ribbon' }, { id: 'shoes', name: 'Shoes' }],
    items: [
      I('d_mintchoc', 'dress', 'Mint-choc party dress', { img: 'dress_mintchoc' }), I('d_witch', 'dress', 'Lilac witch dress', { img: 'dress_witch' }),
      I('d_fairy', 'dress', 'Fairy rag dress', { img: 'dress_fairy' }), I('d_denim', 'dress', 'Denim & lace', { img: 'look_denim' }),
      I('d_stars', 'dress', 'Star-scale skirt', { img: 'dress_stars' }), I('d_leopard', 'dress', 'Leopard & fluff', { img: 'look_leopard' }),
      I('d_violet', 'dress', 'Violet sequins', { img: 'dress_violet' }),
      I('r_red', 'ribbon', 'Red ribbon', { color: 'red', icon: '🎀' }), I('r_pink', 'ribbon', 'Pink ribbon', { color: 'pink', icon: '🎀' }), I('r_blue', 'ribbon', 'Blue ribbon', { color: 'blue', icon: '🎀' }),
      I('r_star', 'ribbon', 'Star pin', { color: 'gold', icon: '★' }),
      I('s_teapot', 'shoes', 'Teapot heels', { img: 'shoe_teapot' }), I('s_mint', 'shoes', 'Mint platforms', { img: 'shoe_mintchoc' }), I('s_pearl', 'shoes', 'Pearl trainers', { img: 'shoe_pearl' }),
      I('s_bare', 'shoes', 'Barefoot', { color: '#fde6dc', icon: '·' }),
    ],
    intro: ['hikaru', 'We used to play with these every night. Before.'],
    preview(st, api) {
      const doll = (slot, x, hair) => {
        const d = api.picked(slot, 'dress'), r = api.picked(slot, 'ribbon'), sh = api.picked(slot, 'shoes');
        const pat = (id, it) => (it && it.img ? `<pattern id="${id}" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${IMG(it.img)}" x="-.1" y="-.05" width="1.2" height="1.1" preserveAspectRatio="xMidYMid slice"/></pattern>` : '');
        const defs = pat('dd' + slot, d) + pat('ds' + slot, sh);
        const dressFill = d ? 'url(#dd' + slot + ')' : '#f7f1f4';
        const shoeFill = sh ? (sh.img ? 'url(#ds' + slot + ')' : col(sh.color)) : '#ddd';
        return `<defs>${defs}</defs><g transform="translate(${x} 0)" class="doll">
          <g class="paper"><circle cx="70" cy="56" r="30" fill="#fff6ef"/><path d="M40 52 C40 18 100 18 100 52 L104 92 L36 92Z" fill="${hair}"/>
          <circle cx="60" cy="58" r="3" fill="#3a2a3f"/><circle cx="80" cy="58" r="3" fill="#3a2a3f"/><path d="M64 70 Q70 74 76 70" stroke="#c26a78" stroke-width="2" fill="none"/>
          <path d="M40 92 L100 92 L128 236 L12 236Z" fill="${dressFill}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
          <path d="M40 92 L100 92 L128 236 L12 236Z" fill="none" stroke="rgba(120,90,110,.35)" stroke-width="1.2" stroke-dasharray="5 4"/>
          <rect x="48" y="236" width="14" height="36" fill="#fff6ef"/><rect x="78" y="236" width="14" height="36" fill="#fff6ef"/>
          <rect x="38" y="266" width="30" height="18" rx="6" fill="${shoeFill}" stroke="#fff" stroke-width="3"/><rect x="72" y="266" width="30" height="18" rx="6" fill="${shoeFill}" stroke="#fff" stroke-width="3"/>
          ${r ? `<text x="${slot === 'haruka' ? 96 : 30}" y="40" font-size="28" fill="${col(r.color)}">${r.icon}</text>` : ''}</g>
          <text x="70" y="306" text-anchor="middle" font-size="14" fill="#8a7a90" font-family="serif">${slot === 'haruka' ? 'はるか' : 'ひかる'}</text></g>`;
      };
      return `<div class="dolls">${svg('0 0 320 320', `<rect x="0" y="284" width="320" height="36" fill="#e9dccb"/>${doll('haruka', 10, '#f3a3c2')}${doll('hikaru', 170, '#a9cff2')}`, 'paper')}</div>`;
    },
    finish(st) {
      const same = ['dress', 'ribbon', 'shoes'].every((c) => st.picks.haruka[c] === st.picks.hikaru[c]);
      return { same, result: same ? 'matching' : 'different', stars: 3 };
    },
    reveal(st, api, r) {
      return `<h2>${r.same ? 'They match' : 'They don’t match'}</h2><div class="rv-row">${GAMES.dollhouse.preview(st, api)}</div>${verdict(r.same ? 'The paper dolls hold hands. The room goes quiet, and you’re somewhere else: a summer evening, years ago…' : 'One paper doll falls over. When you pick it up, there’s writing on the back in a child’s hand. The room goes quiet…')}`;
    },
  };

  /* 9. ROOM MAKEOVER --------------------------------------------------------- */
  GAMES.room = {
    layout: 'top', cards: 'catalog',
    name: 'Room Makeover', jp: '模様替え', shop: 'The Amane twins’ bedroom', who: 'Haruka & Hikaru', time: 80,
    brief: 'Redecorate the shared bedroom so both halves feel like them. Haruka keeps dragging pink things over the line. If pink takes more than half the room, Hikaru’s side won’t come back.',
    slots: [{ id: 'pink', name: '🎀 Haruka’s side', tone: 'pink' }, { id: 'blue', name: '☁ Hikaru’s side', tone: 'blue' }],
    cats: [{ id: 'poster', name: 'Wall' }, { id: 'bed', name: 'Bedding' }, { id: 'lamp', name: 'Lamp' }, { id: 'plush', name: 'Shelf' }],
    items: [
      I('p_idol', 'poster', 'Idol poster', { color: 'pink', icon: '★', pink: true }), I('p_train', 'poster', 'Train map', { color: 'blue', icon: '🚃' }),
      I('p_stars', 'poster', 'Star chart', { color: 'navy', icon: '✦' }), I('p_fan', 'poster', 'Pearl fan on the wall', { img: 'x_fan' }),
      I('p_parasol', 'poster', 'Lace parasol, hung open', { img: 'x_parasol' }),
      I('b_heart', 'bed', 'Heart duvet', { color: 'pink', icon: '♥', pink: true }), I('b_leo', 'bed', 'Leopard throw', { color: 'leopard', pink: true }),
      I('b_cloud', 'bed', 'Cloud duvet', { color: 'sky', icon: '☁' }), I('b_plain', 'bed', 'Plain white', { color: 'white' }), I('b_mint', 'bed', 'Mint gingham', { swatch: 'repeating-linear-gradient(0deg,#bfe8d6 0 8px,#fff 8px 16px),repeating-linear-gradient(90deg,#bfe8d6 0 8px,transparent 8px 16px)' }),
      I('l_fairy', 'lamp', 'Pink fairy lights', { color: 'hotpink', icon: '✧', pink: true }), I('l_moon', 'lamp', 'Moon lamp', { color: 'sky', icon: '☾' }),
      I('l_glitter', 'lamp', 'Glitter mushroom lamp', { sticker: 'lamp' }), I('l_desk', 'lamp', 'Desk lamp', { color: 'cream', icon: '💡' }),
      I('t_bear', 'plush', 'Pink glitter bunny', { sticker: 'bunny_red', pink: true }), I('t_whale', 'plush', 'Blue-coat bear', { sticker: 'bear_blue' }),
      I('t_bunny', 'plush', 'White bunny & bear', { sticker: 'bunny_pot' }), I('t_cocoa', 'plush', 'Cocoa bear', { sticker: 'bear_brown' }),
    ],
    intro: ['haruka', 'My side, your… whatever. Make it cute. Mostly mine.'],
    preview(st, api) {
      const share = GAMES.room.pinkShare(st, api);
      const zone = (slot, x) => {
        const g = (c) => api.picked(slot, c), bad = (c) => api.isSwapped(slot, c);
        const fillOfItem = (it, id) => (!it ? 'none' : it.img ? `url(#${id})` : it.sticker ? '#fff' : it.color === 'leopard' ? 'url(#leo)' : it.swatch && it.swatch.startsWith('repeating') ? '#cfeee0' : col(it.color));
        const pats = ['poster'].map((c) => (g(c) && g(c).img ? `<pattern id="rp_${slot}" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${IMG(g(c).img)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>` : '')).join('');
        const ring = (c) => (bad(c) ? 'stroke="#e0588c" stroke-width="4" stroke-dasharray="6 3"' : 'stroke="rgba(60,40,80,.25)" stroke-width="1.5"');
        const p = g('poster'), b = g('bed'), l = g('lamp'), t = g('plush');
        return `<defs>${pats}</defs><g transform="translate(${x} 0)">
          <rect x="34" y="26" width="92" height="76" rx="4" fill="${p ? fillOfItem(p, 'rp_' + slot) : 'none'}" ${p ? ring('poster') : 'stroke="rgba(60,40,80,.25)" stroke-dasharray="5 5"'}/>${p && p.icon ? `<text x="80" y="74" text-anchor="middle" font-size="28" fill="#fff">${p.icon}</text>` : ''}
          <rect x="14" y="176" width="150" height="20" rx="6" fill="#d9c3a9"/><rect x="14" y="150" width="150" height="34" rx="12" fill="${b ? fillOfItem(b) : '#f2eef0'}" ${b ? ring('bed') : ''}/>
          <rect x="${slot === 'pink' ? 132 : 16}" y="138" width="30" height="18" rx="8" fill="#fff"/>${b && b.icon ? `<text x="90" y="174" text-anchor="middle" font-size="18" fill="rgba(255,255,255,.9)">${b.icon} ${b.icon}</text>` : ''}
          <rect x="128" y="96" width="44" height="6" rx="3" fill="#cdb497"/>
          ${t ? `<image href="${STK(t.sticker)}" x="132" y="58" width="40" height="40"/>${bad('plush') ? '<rect x="130" y="56" width="44" height="44" rx="8" fill="none" stroke="#e0588c" stroke-width="3" stroke-dasharray="5 3"/>' : ''}` : '<rect x="132" y="60" width="38" height="36" rx="8" fill="none" stroke="rgba(60,40,80,.25)" stroke-dasharray="5 5"/>'}
          <g transform="translate(${slot === 'pink' ? 6 : 128} 108)">${l ? (l.sticker ? `<image href="${STK(l.sticker)}" x="0" y="0" width="38" height="40"/>` : `<circle cx="18" cy="16" r="16" fill="${col(l.color)}" ${ring('lamp')}/><text x="18" y="22" text-anchor="middle" font-size="16">${l.icon || ''}</text><circle cx="18" cy="16" r="26" fill="${col(l.color)}" opacity=".18"/>`) : '<circle cx="18" cy="16" r="14" fill="none" stroke="rgba(60,40,80,.25)" stroke-dasharray="4 4"/>'}</g></g>`;
      };
      return `<div class="room">${svg('0 0 360 230', `<rect width="180" height="230" fill="#ffe3ee"/><rect x="180" width="180" height="230" fill="${share > 0.5 ? '#ffd3e4' : '#e1efff'}"/>
        <rect y="196" width="360" height="34" fill="#e8d6c3"/><line x1="180" y1="0" x2="180" y2="230" stroke="#fff" stroke-width="4" stroke-dasharray="8 6"/>
        ${zone('pink', 0)}${zone('blue', 180)}<text x="90" y="222" text-anchor="middle" font-size="11" fill="#c9567f" font-weight="700">HARUKA</text><text x="270" y="222" text-anchor="middle" font-size="11" fill="#3f7fbf" font-weight="700">HIKARU</text>`)}
        <div class="share"><span class="p" style="width:${Math.round(share * 100)}%"></span><span class="mid"></span></div></div>`;
    },
    pinkShare(st, api) {
      let p = 0;
      for (const sl of ['pink', 'blue']) for (const c of ['poster', 'bed', 'lamp', 'plush']) { const it = api.item(st.picks[sl][c]); if (it && it.pink) p++; }
      return p / 8;
    },
    stat: (st, api) => `pink <b class="${GAMES.room.pinkShare(st, api) > 0.5 ? 'warn' : ''}">${Math.round(GAMES.room.pinkShare(st, api) * 100)}%</b> of the room`,
    tick(st, api) {
      st.extra.next = st.extra.next ?? 8;
      if (st.extra.t > st.extra.next) {
        st.extra.next = st.extra.t + rand(6, 9);
        const cands = ['poster', 'bed', 'lamp', 'plush'].filter((c) => st.picks.blue[c] && !api.picked('blue', c).pink);
        if (cands.length) {
          const c = pick(cands);
          const pinkItem = pick(GAMES.room.items.filter((i) => i.cat === c && i.pink));
          api.set('blue', c, pinkItem.id, true); DL.Audio.sfx('static'); api.flash('.room');
          api.say('haruka', pick(['Oops, that drifted over ✿', 'It looks better pink. Trust me.', 'Her side was SO boring.']));
        }
      }
    },
    finish(st, api, how) {
      const share = GAMES.room.pinkShare(st, api);
      const blueGone = share > 0.5 || (how === 'timeout' && Object.keys(st.picks.blue).length < 2);
      const result = blueGone ? 'bad' : Object.keys(st.picks.blue).length === 4 ? (share <= 0.375 ? 'great' : 'ok') : 'meh';
      return { share, blueGone, result, stars: { great: 3, ok: 2, meh: 1, bad: 0 }[result] };
    },
    reveal(st, api, r) {
      return `<h2>The room <span class="jp">二人の部屋</span></h2><div class="rv-row">${GAMES.room.preview(st, api)}</div>${verdict(r.blueGone ? 'Haruka flops onto her bed, happy. On the other side of the line, everything is pink now. Hikaru stands in the doorway like she’s visiting someone else’s house.' : 'Two halves. Two people. Haruka complains about the bear. Hikaru puts it on her pillow anyway.', r.blueGone)}${stars(r.stars)}`;
    },
  };

  const LIST = ['thrift', 'beauty', 'gifts', 'salon', 'nails', 'purikura', 'uniform', 'dollhouse', 'room'];
  return { play, GAMES, LIST };
})();
