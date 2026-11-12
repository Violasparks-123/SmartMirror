/* THE FITTING (着せ替え): the Saturday dress-up minigame.

   You style Haruka first, then Hikaru: one look, hair, makeup and bag each.
   - Haruka wants pink, leopard, loud, and at least ONE piece that matches her sister.
   - Hikaru wants to look like herself, and can take one matching piece, no more.
   - A clock runs down to the matsuri. While you dress Hikaru, Haruka quietly swaps
     things to match her own outfit. Notice it and put it back.
   DL.Fitting.play() resolves to { result: 'perfect' | 'ok' | 'fail', reason, H, K, shared, picks }.
   DL.Fitting.doll() plays the bad thing that happens when you fail. */
DL.Fitting = (() => {
  const { el, esc, wait, format, clamp } = DL.util;
  const WD = () => DL.Wardrobe;
  const empty = () => ({ look: null, hair: null, makeup: null, bag: null });

  let root = null;

  /* ---------- scoring ---------- */
  function shared(p) {
    return WD().CATS.filter((c) => p.haruka[c.id] && p.haruka[c.id] === p.hikaru[c.id]).length;
  }
  function itemSum(picks, key) {
    return WD().CATS.reduce((n, c) => n + (picks[c.id] ? WD().byId[picks[c.id]][key] : 0), 0);
  }
  function scoreH(p, withMatch) { return itemSum(p.haruka, 'h') + (withMatch ? WD().MATCH_H[shared(p)] : 0); }
  function scoreK(p) { return itemSum(p.hikaru, 'k') + WD().MATCH_K[shared(p)]; }
  const hearts = (score) => clamp(Math.round(score / 2.4), 0, 5);

  function meter(score, who) {
    const n = hearts(score);
    const sym = who === 'haruka' ? '♥' : '✦';
    let h = '';
    for (let i = 0; i < 5; i++) h += `<i class="${i < n ? 'on' : ''}">${sym}</i>`;
    return h;
  }

  /* ---------- markup ---------- */
  function shell(o) {
    const r = el('div', `fitting screen fade round-${o.round}`);
    r.innerHTML = `
      <div class="fit-tint"></div>
      <aside class="fit-model">
        <div class="fit-brief"></div>
        <div class="fit-portrait"><div class="fit-figure"></div><div class="fit-bubble" hidden></div></div>
        <div class="fit-meter-row"><span class="fit-meter-label"></span><span class="fit-meter"></span></div>
        <div class="fit-slots"></div>
      </aside>
      <section class="fit-main">
        <header class="fit-head"><h2></h2><div class="fit-clock" role="timer" aria-live="off"></div></header>
        <nav class="fit-tabs" aria-label="Categories"></nav>
        <div class="fit-grid"></div>
        <footer class="fit-foot"><div class="fit-other"></div><button type="button" class="btn primary fit-done">Done ✿</button></footer>
      </section>`;
    document.querySelector('#screens').appendChild(r);
    return r;
  }

  /* ---------- the game ---------- */
  function play() {
    return new Promise((resolve) => {
      const s = DL.State.s;
      const st = {
        round: 'haruka', tab: 'look',
        picks: { haruka: empty(), hikaru: empty() },
        swapped: {},            // cat -> what you really picked for Hikaru before Haruka swapped it
        sabotages: 0, filledOnce2: false, filledOnce4: false,
        timeLeft: WD().TIME, done: false, hinted: false, warned: false,
        bubbleTimer: null,
      };
      root = shell({ round: 'haruka' });
      DL.Fitting._st = st; // read by the automated playtest
      const $ = (q) => root.querySelector(q);

      /* ----- speech bubble over the portrait ----- */
      function say(who, text, ms = 4200) {
        const b = $('.fit-bubble');
        const name = who === 'haruka' ? 'Haruka' : who === 'hikaru' ? 'Hikaru' : '';
        b.className = `fit-bubble from-${who}`;
        b.innerHTML = `${name ? `<b>${name}</b>` : ''}<span>${format(text, s)}</span>`;
        b.hidden = false;
        b.animate([{ transform: 'translateY(6px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
        clearTimeout(st.bubbleTimer);
        st.bubbleTimer = setTimeout(() => { b.hidden = true; }, ms);
      }

      /* ----- render ----- */
      function render() {
        const who = st.round;
        const other = who === 'haruka' ? 'hikaru' : 'haruka';
        root.className = `fitting screen round-${who}`;
        const art = DL.Sprites.art(who);
        const fig = $('.fit-figure');
        if (fig.dataset.who !== who) {
          fig.dataset.who = who;
          fig.innerHTML = `<img src="${art.src}" alt="${who === 'haruka' ? 'Haruka' : 'Hikaru'}" draggable="false">`;
        }
        $('.fit-brief').innerHTML = who === 'haruka'
          ? '<b>Haruka wants</b><span>Pink. Leopard. <em>Loud.</em> And at least one piece that matches her sister.</span>'
          : '<b>Hikaru wants</b><span>To look like herself: blue, soft, maybe music. One matching piece at most.</span>';
        $('.fit-head h2').innerHTML = `Style ${who === 'haruka' ? 'Haruka' : 'Hikaru'} <small>${who === 'haruka' ? '遥' : '光'}・着せ替え</small>`;

        // mood meter
        const score = who === 'haruka' ? scoreH(st.picks, false) : scoreK(st.picks);
        $('.fit-meter-label').textContent = who === 'haruka' ? 'Haruka’s mood' : 'Hikaru’s comfort';
        $('.fit-meter').innerHTML = meter(score, who);
        $('.fit-meter').setAttribute('aria-label', `${hearts(score)} out of 5`);

        // slots
        $('.fit-slots').innerHTML = WD().CATS.map((c) => {
          const id = st.picks[who][c.id];
          const it = id ? WD().byId[id] : null;
          const sw = who === 'hikaru' && st.swapped[c.id];
          return `<div class="fit-slot ${it ? 'filled' : ''} ${sw ? 'swapped' : ''}" data-cat="${c.id}">
            <button type="button" class="fit-slot-btn" data-tab="${c.id}" aria-label="${c.name}: ${it ? esc(it.name) : 'empty'}">
              ${it ? `<img src="${it.img}" alt="">` : `<span class="ph">${c.jp}</span>`}
            </button>
            <span class="fit-slot-name">${it ? esc(it.name) : c.name}</span>
            ${sw ? `<button type="button" class="fit-undo" data-undo="${c.id}">↺ Put it back</button>` : ''}
          </div>`;
        }).join('');

        // tabs
        $('.fit-tabs').innerHTML = WD().CATS.map((c) => `<button type="button" class="fit-tab ${st.tab === c.id ? 'on' : ''} ${st.picks[who][c.id] ? 'done' : ''}" data-tab="${c.id}">${c.name}<small>${c.jp}</small></button>`).join('');

        // cards
        const items = WD().ITEMS.filter((i) => i.cat === st.tab);
        const otherPick = st.picks[other][st.tab];
        $('.fit-grid').className = `fit-grid cat-${st.tab}`;
        $('.fit-grid').innerHTML = items.map((i) => {
          const on = st.picks[who][st.tab] === i.id;
          const hers = who === 'hikaru' && otherPick === i.id;
          return `<button type="button" class="fit-card ${on ? 'on' : ''}" data-item="${i.id}" aria-pressed="${on}">
            <span class="img"><img src="${i.img}" alt="" loading="lazy"></span>
            <span class="name">${esc(i.name)}</span>
            <span class="desc">${esc(i.desc)}</span>
            ${hers ? '<span class="tag-hers">Haruka’s pick</span>' : ''}
            ${on ? '<span class="tag-on">✓</span>' : ''}
          </button>`;
        }).join('');

        // footer
        const filled = WD().CATS.every((c) => st.picks[who][c.id]);
        $('.fit-done').disabled = !filled;
        $('.fit-done').textContent = who === 'haruka' ? 'Done ✿ Now Hikaru' : 'Done ✿ To the mirror';
        if (who === 'hikaru') {
          const n = shared(st.picks);
          $('.fit-other').innerHTML = `<span class="lbl">Haruka is wearing</span>${WD().CATS.map((c) => {
            const it = WD().byId[st.picks.haruka[c.id]];
            const m = st.picks.hikaru[c.id] === it.id;
            return `<img class="${m ? 'match' : ''}" src="${it.img}" alt="${esc(it.name)}" title="${esc(it.name)}">`;
          }).join('')}<span class="matches ${n === 1 ? 'good' : n > 1 ? 'bad' : ''}">Matching pieces: <b>${n}</b></span>
            <span class="mini-meter" aria-label="Haruka's mood">Haruka ${meter(scoreH(st.picks, true), 'haruka')}</span>`;
        } else {
          $('.fit-other').innerHTML = '<span class="lbl">Tip</span><span class="tipline">Tap a card to try it on. You can change your mind until you press Done.</span>';
        }
      }

      /* ----- picking ----- */
      function pick(id) {
        const it = WD().byId[id];
        const who = st.round;
        DL.Audio.sfx('select');
        st.picks[who][it.cat] = id;
        if (who === 'hikaru' && st.swapped[it.cat]) delete st.swapped[it.cat];
        render();
        const n = shared(st.picks);
        if (who === 'haruka') {
          say('haruka', it.hr);
          const count = WD().CATS.filter((c) => st.picks.haruka[c.id]).length;
          if (count === 2 && !st.hinted) {
            st.hinted = true;
            setTimeout(() => !st.done && say('hikaru', '(whispering) She says “match”, but one shared piece makes her happy. Just one.', 5200), 2600);
          }
        } else {
          if (st.picks.haruka[it.cat] === id) {
            say('haruka', n >= 2 ? 'Twins! ✿ More, more, MORE.' : 'Matching! ✿ See, Hikaru? We’re a set.');
            if (n >= 2) setTimeout(() => !st.done && say('hikaru', n >= 3 ? 'I can’t see myself anymore.' : 'That’s two, {name}. Please.'), 1700);
          } else {
            say('hikaru', it.kr);
          }
          const count = WD().CATS.filter((c) => st.picks.hikaru[c.id]).length;
          if (count >= 2 && !st.filledOnce2) { st.filledOnce2 = true; setTimeout(() => sabotage(1), 1500); }
          if (count === 4 && !st.filledOnce4) { st.filledOnce4 = true; setTimeout(() => sabotage(2), 1100); }
        }
        // move to the next empty category so the player keeps flowing
        const next = WD().CATS.find((c) => !st.picks[who][c.id]);
        if (next && next.id !== st.tab) setTimeout(() => { if (!st.done && st.round === who) { st.tab = next.id; render(); } }, 520);
      }

      /* ----- Haruka "helps" ----- */
      function sabotage(n) {
        if (st.done || st.round !== 'hikaru' || st.timeLeft < 15) return;
        const cands = WD().CATS.map((c) => c.id).filter((cat) => {
          const mine = st.picks.hikaru[cat];
          return mine && mine !== st.picks.haruka[cat] && !st.swapped[cat];
        });
        if (!cands.length) return;
        cands.sort((a, b) => WD().byId[st.picks.hikaru[b]].k - WD().byId[st.picks.hikaru[a]].k);
        const cat = cands[0];
        st.swapped[cat] = st.picks.hikaru[cat];
        st.picks.hikaru[cat] = st.picks.haruka[cat];
        st.sabotages++;
        DL.Audio.sfx('static');
        render();
        const slot = root.querySelector(`.fit-slot[data-cat="${cat}"]`);
        slot?.animate([{ filter: 'hue-rotate(0)', transform: 'translateX(0)' }, { filter: 'hue-rotate(90deg)', transform: 'translateX(-4px)' }, { filter: 'hue-rotate(0)', transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 420 });
        if (n === 1) say('haruka', 'Oops. My hand slipped ✿');
        else say('hikaru', '…{name}? Did you pick that?', 3600);
      }

      function undo(cat) {
        if (!st.swapped[cat]) return;
        st.picks.hikaru[cat] = st.swapped[cat];
        delete st.swapped[cat];
        DL.Audio.sfx('chime');
        render();
        say('hikaru', 'Thank you. I thought nobody would notice.');
      }

      /* ----- clock ----- */
      let last = performance.now();
      const clock = setInterval(() => {
        const now = performance.now();
        const dt = (now - last) / 1000; last = now;
        if (document.hidden || st.done) return;
        st.timeLeft = Math.max(0, st.timeLeft - dt);
        const t = Math.ceil(st.timeLeft);
        const c = $('.fit-clock');
        c.innerHTML = `Matsuri in <b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b>`;
        c.classList.toggle('urgent', t <= 30);
        if (t <= 30 && !st.warned) { st.warned = true; say('haruka', 'Hurry *up*, {name}. I can hear the drums already.'); DL.Audio.sfx('thud'); }
        if (st.timeLeft <= 0) finish('timeout');
      }, 200);

      /* ----- events ----- */
      root.addEventListener('click', (e) => {
        const card = e.target.closest('[data-item]');
        const tab = e.target.closest('[data-tab]');
        const un = e.target.closest('[data-undo]');
        if (un) { e.stopPropagation(); undo(un.dataset.undo); return; }
        if (card) { pick(card.dataset.item); return; }
        if (tab) { st.tab = tab.dataset.tab; DL.Audio.sfx('blip'); render(); }
      });
      $('.fit-done').addEventListener('click', () => {
        if (st.round === 'haruka') {
          DL.Audio.sfx('chime');
          st.round = 'hikaru'; st.tab = 'look';
          render();
          root.querySelector('.fit-main').animate([{ opacity: 0, transform: 'translateX(20px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' });
          say('hikaru', 'My turn. …Please be gentle.');
        } else {
          finish('done');
        }
      });

      async function finish(how) {
        if (st.done) return;
        st.done = true;
        clearInterval(clock);
        clearTimeout(st.bubbleTimer);
        if (how === 'timeout') {
          say('haruka', 'Time’s up. *Move.* I’ll finish it myself.', 3000);
          DL.Audio.sfx('thud');
          await wait(1600);
          root.remove(); root = null;
          resolve({ result: 'fail', reason: 'timeout', H: 0, K: 0, shared: shared(st.picks), picks: st.picks, sabotages: st.sabotages });
          return;
        }
        const n = shared(st.picks);
        const H = scoreH(st.picks, true), K = scoreK(st.picks);
        const pass = WD().PASS, perf = WD().PERFECT;
        let result = H >= perf && K >= perf ? 'perfect' : H >= pass && K >= pass ? 'ok' : 'fail';
        // Dressed each twin as the other? (Haruka in mostly Hikaru-style pieces, Hikaru in mostly Haruka-style ones)
        const styleOf = (who, wantHikaru) => WD().CATS.filter((c) => { const it = WD().byId[st.picks[who][c.id]]; return wantHikaru ? it.k > it.h : it.h > it.k; }).length;
        if (styleOf('haruka', true) >= 3 && styleOf('hikaru', false) >= 3 && n <= 1) result = 'swapped';
        const reason = result !== 'fail' ? null : K < pass ? 'hikaru' : 'haruka';
        root.remove(); root = null;
        await mirror(st.picks, { H, K, n, result, reason });
        resolve({ result, reason, H, K, shared: n, picks: st.picks, sabotages: st.sabotages,
          sharedItem: n ? WD().byId[st.picks.haruka[WD().CATS.find((c) => st.picks.haruka[c.id] === st.picks.hikaru[c.id]).id]].name : null });
      }

      render();
      say('haruka', 'Me first. Obviously.');
    });
  }

  /* ---------- the mirror: both looks side by side ---------- */
  function mirror(picks, r) {
    return new Promise((resolve) => {
      const fail = r.result === 'fail';
      if (r.result === 'swapped') return swappedMirror(picks, resolve);
      const H_line = r.H >= WD().PERFECT ? 'I look *incredible*. And we match. Perfect.'
        : r.H >= WD().PASS ? '…It’s fine. I look fine.'
          : r.n === 0 ? 'We don’t even look *related*.' : 'Is this a joke? Is *this* what you think of me?';
      const K_line = r.K >= WD().PERFECT ? 'I look like me.'
        : r.K >= WD().PASS ? 'It’s okay. Thank you, {name}.'
          : r.n >= 2 ? 'That isn’t me. That’s *her*.' : 'I don’t… recognise this.';
      const board = (who, score, line, ok) => {
        const art = DL.Sprites.art(who);
        return `<figure class="mirror-card ${who} ${ok ? '' : 'bad'}">
          <div class="mirror-fig"><img src="${art.src}" alt="${who === 'haruka' ? 'Haruka' : 'Hikaru'}"></div>
          <div class="mirror-items">${WD().CATS.map((c) => {
            const it = WD().byId[picks[who][c.id]];
            const m = picks.haruka[c.id] === picks.hikaru[c.id];
            return `<span class="${m ? 'match' : ''}"><img src="${it.img}" alt=""><small>${esc(it.name)}</small></span>`;
          }).join('')}</div>
          <figcaption><span class="fit-meter">${meter(score, who)}</span><q>${format(line, DL.State.s)}</q></figcaption>
        </figure>`;
      };
      const m = el('div', `mirror screen fade ${fail ? 'fail' : ''}`);
      m.innerHTML = `<h2>The mirror <small>鏡</small></h2>
        <div class="mirror-pair">
          ${board('haruka', r.H, H_line, r.H >= WD().PASS)}
          <div class="mirror-mid"><span>Matching</span><b>${r.n}</b><span>${r.n === 1 ? 'a set ✿' : r.n === 0 ? 'strangers' : 'too many'}</span></div>
          ${board('hikaru', r.K, K_line, r.K >= WD().PASS)}
        </div>
        <button type="button" class="btn ${fail ? 'dark' : 'primary'} mirror-go">${fail ? '…' : 'To the matsuri ✿'}</button>`;
      document.querySelector('#screens').appendChild(m);
      DL.Audio.sfx(fail ? 'static' : 'chime');
      if (fail) setTimeout(() => m.classList.add('cracked'), 900);
      m.querySelector('.mirror-go').addEventListener('click', () => { DL.Audio.sfx('select'); m.remove(); resolve(); });
      m.querySelector('.mirror-go').focus({ preventScroll: true });
    });
  }

  /* ---------- the mirror when you dressed them as each other ---------- */
  function swappedMirror(picks, resolve) {
    const board = (who, line) => {
      const other = who === 'haruka' ? 'hikaru' : 'haruka';
      return `<figure class="mirror-card ${who} swapped-card">
        <div class="mirror-fig"><img src="${DL.Sprites.art(who).src}" alt=""><img class="mirror-ghost" src="${DL.Sprites.art(other).src}" alt=""></div>
        <div class="mirror-items">${WD().CATS.map((c) => { const it = WD().byId[picks[who][c.id]]; return `<span><img src="${it.img}" alt=""><small>${esc(it.name)}</small></span>`; }).join('')}</div>
        <figcaption><q>${format(line, DL.State.s)}</q></figcaption></figure>`;
    };
    const m = el('div', 'mirror screen fade swapped');
    m.innerHTML = `<h2>The mirror <small>鏡・入れ替わり</small></h2>
      <div class="mirror-pair">
        ${board('haruka', 'This is… her whole look. Blue and quiet. Why do I *like* it?')}
        <div class="mirror-mid"><span>Who’s who?</span><b>⇄</b><span>swapped</span></div>
        ${board('hikaru', 'I look like you. Loud. Pink. And it doesn’t feel like losing.')}
      </div>
      <button type="button" class="btn primary mirror-go">…To the matsuri?</button>`;
    document.querySelector('#screens').appendChild(m);
    DL.Audio.sfx('chime');
    m.querySelector('.mirror-go').addEventListener('click', () => { DL.Audio.sfx('select'); m.remove(); resolve(); });
  }

  /* ---------- what happens when you fail ---------- */
  function doll() {
    return new Promise((resolve) => {
      const s = DL.State.s;
      const r = shell({ round: 'doll' });
      r.className = 'fitting screen round-doll';
      const $ = (q) => r.querySelector(q);
      const look = WD().DOLL.map((id) => WD().byId[id]);
      const fake = WD().byId.hair_leopard;
      $('.fit-brief').innerHTML = '<b>Haruka wants</b><span>Three of us. All the same.</span>';
      $('.fit-figure').innerHTML = `<svg class="fit-silhouette" viewBox="0 0 200 300" role="img" aria-label="You">
        <circle cx="100" cy="88" r="46"/><rect x="84" y="126" width="32" height="40" rx="10"/>
        <path d="M14 300 C18 214 56 178 100 176 C144 178 182 214 186 300 Z"/></svg>`;
      $('.fit-head h2').innerHTML = `Style ${esc(s.name)} <small>あなた・着せ替え</small>`;
      $('.fit-clock').innerHTML = 'Matsuri in <b>0:00</b>';
      $('.fit-clock').classList.add('urgent');
      $('.fit-meter-label').textContent = 'Haruka’s mood';
      $('.fit-meter').innerHTML = meter(99, 'haruka');
      $('.fit-tabs').innerHTML = WD().CATS.map((c) => `<button type="button" class="fit-tab on">${c.name}<small>${c.jp}</small></button>`).join('');
      $('.fit-grid').className = 'fit-grid cat-hair';
      $('.fit-grid').innerHTML = Array.from({ length: 8 }, () => `<button type="button" class="fit-card"><span class="img"><img src="${fake.img}" alt=""></span><span class="name">Pink Leopard</span><span class="desc">Pink Leopard</span></button>`).join('');
      $('.fit-done').disabled = true;
      $('.fit-done').textContent = 'Hold still';
      $('.fit-other').innerHTML = '<span class="lbl">Haruka is wearing</span>' + look.map((i) => `<img class="match" src="${i.img}" alt="">`).join('') + '<span class="matches bad">Matching pieces: <b>4</b></span>';
      const slots = (k) => WD().CATS.map((c, i) => `<div class="fit-slot ${i < k ? 'filled swapped' : ''}"><span class="fit-slot-btn">${i < k ? `<img src="${look[i].img}" alt="">` : `<span class="ph">${c.jp}</span>`}</span><span class="fit-slot-name">${i < k ? look[i].name : c.name}</span></div>`).join('');
      $('.fit-slots').innerHTML = slots(0);
      const lines = ['Hold still, {name}.', 'Pink suits you. It suits everyone.', 'Now we match.', 'All three of us. Forever.'];
      let k = 0;
      const bub = $('.fit-bubble');
      const step = () => {
        if (k >= 4) return;
        k++;
        DL.Audio.sfx('static');
        $('.fit-slots').innerHTML = slots(k);
        $('.fit-silhouette').style.fill = ['#2a1424', '#5a1d3c', '#8e2a58', '#c2457a', '#f08fb4'][k];
        bub.className = 'fit-bubble from-haruka';
        bub.innerHTML = `<b>Haruka</b><span>${format(lines[k - 1], s)}</span>`;
        bub.hidden = false;
        if (k === 4) {
          setTimeout(async () => {
            await DL.FX.tear(700, 1.4);
            r.remove();
            resolve();
          }, 1500);
        }
      };
      r.addEventListener('click', (e) => { if (e.target.closest('.fit-card')) step(); });
      const t = setInterval(() => { if (k >= 4) clearInterval(t); else step(); }, 1500);
      setTimeout(step, 600);
    });
  }

  return { play, doll, _score: { shared, scoreH, scoreK } };
})();
