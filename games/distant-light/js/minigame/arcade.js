/* THE ARCADE: twelve short minigames.
   Each game is { id, name, jp, who, how, place?, play(area, hud) -> Promise<score 0..1> }.
   DL.Arcade.run(id) shows the intro, plays it, shows stars, and resolves { score, stars }.
   Nine games are tied to planner places (see `place`), so they also show up in the story. */
DL.Arcade = (() => {
  const { el, esc, wait, randi, rand, pick, clamp, yen } = DL.util;

  /* ---------- small helpers ---------- */
  function countdown(hud, secs, onEnd) {
    let left = secs, stopped = false;
    hud.time.textContent = left + 's';
    const t = setInterval(() => {
      if (stopped || document.hidden) return;
      left--; hud.time.textContent = left + 's';
      hud.time.classList.toggle('urgent', left <= 5);
      if (left <= 0) { stop(); onEnd(); }
    }, 1000);
    function stop() { stopped = true; clearInterval(t); }
    return { stop, get left() { return left; } };
  }
  const btn = (label, cls = '') => { const b = el('button', 'ag-btn ' + cls, label); b.type = 'button'; return b; };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = randi(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* Multiple-choice rounds (used by Register Rush and Cram Quiz). */
  function mcRounds(area, hud, rounds, secs) {
    return new Promise((resolve) => {
      let i = 0, right = 0, done = false;
      const q = el('div', 'ag-q'), opts = el('div', 'ag-opts');
      area.append(q, opts);
      const finish = () => { if (done) return; done = true; timer.stop(); resolve(right / rounds.length); };
      const timer = countdown(hud, secs, finish);
      const show = () => {
        if (i >= rounds.length) return finish();
        const r = rounds[i];
        q.innerHTML = r.q; opts.innerHTML = '';
        hud.score.textContent = `${right} / ${rounds.length}`;
        shuffle(r.opts.slice()).forEach((o) => {
          const b = btn(o);
          b.onclick = () => {
            const ok = o === r.a; if (ok) right++;
            DL.Audio.sfx(ok ? 'coin' : 'thud');
            b.classList.add(ok ? 'good' : 'bad');
            setTimeout(() => { i++; show(); }, 380);
          };
          opts.appendChild(b);
        });
      };
      show();
    });
  }

  /* ---------- the twelve games ---------- */
  const GAMES = [
    {
      id: 'register', name: 'Register Rush', jp: 'レジ', who: 'Mr. Oda', place: 'konbini', reward: { money: 600 },
      how: 'Add up each customer’s basket and pick the right total. Five customers, 30 seconds.',
      play(area, hud) {
        const items = [['Melon bread', 150], ['Strawberry milk', 120], ['Onigiri', 140], ['Tea', 110], ['Pudding', 180], ['Gum', 90], ['Curry bun', 160]];
        const rounds = Array.from({ length: 5 }, () => {
          const basket = Array.from({ length: randi(2, 4) }, () => pick(items));
          const total = basket.reduce((n, b) => n + b[1], 0);
          const wrong = new Set();
          while (wrong.size < 3) { const w = total + pick([-60, -40, -20, -10, 10, 20, 30, 50]); if (w !== total && w > 0) wrong.add(w); }
          return { q: basket.map((b) => `<span class="ag-chip">${b[0]} <b>${yen(b[1])}</b></span>`).join(''), a: yen(total), opts: [yen(total), ...[...wrong].map(yen)] };
        });
        return mcRounds(area, hud, rounds, 30);
      },
    },
    {
      id: 'petals', name: 'Petal Catch', jp: '花びら', who: 'Courtyard', place: 'courtyard', reward: { energy: 15 },
      how: 'Tap the pink petals before they reach the ground. Avoid the glitched grey ones. 20 seconds.',
      play(area, hud) {
        return new Promise((resolve) => {
          let caught = 0, alive = true; const live = new Set();
          hud.score.textContent = '0';
          const spawn = () => {
            if (!alive) return;
            const bad = Math.random() < 0.18;
            const p = el('button', 'ag-petal' + (bad ? ' bad' : ''), bad ? '✖' : '✿'); p.type = 'button';
            p.style.left = rand(4, 92) + '%';
            const dur = rand(2.6, 4.2);
            p.style.animationDuration = dur + 's';
            p.onclick = () => { caught += bad ? -2 : 1; hud.score.textContent = Math.max(0, caught); DL.Audio.sfx(bad ? 'static' : 'blip'); p.remove(); live.delete(p); };
            area.appendChild(p); live.add(p);
            setTimeout(() => { p.remove(); live.delete(p); }, dur * 1000);
            setTimeout(spawn, rand(280, 560));
          };
          spawn();
          countdown(hud, 20, () => { alive = false; live.forEach((p) => p.remove()); resolve(clamp(caught / 22, 0, 1)); });
        });
      },
    },
    {
      id: 'shutter', name: 'Shutter Snap', jp: 'シャッター', who: 'Rin', reward: { trust: 1 },
      how: 'Rin’s frame slides back and forth. Press Snap when it lines up with the star. Five shots.',
      play(area, hud) {
        return new Promise((resolve) => {
          const track = el('div', 'ag-track'), target = el('div', 'ag-target', '★'), frame = el('div', 'ag-frame');
          track.append(target, frame); const snap = btn('Snap ◉', 'big'); area.append(track, snap);
          let shots = 0, total = 0, x = 0, dir = 1, speed = 0.9, raf, tx = rand(15, 85);
          target.style.left = tx + '%'; hud.time.textContent = '5 shots'; hud.score.textContent = '0%';
          const loop = () => { x += dir * speed; if (x > 100 || x < 0) dir *= -1; frame.style.left = x + '%'; raf = requestAnimationFrame(loop); };
          loop();
          snap.onclick = () => {
            const acc = clamp(1 - Math.abs(x - tx) / 25, 0, 1);
            total += acc; shots++; DL.FX.flash('#ffffff', 90); DL.Audio.sfx('coin');
            hud.score.textContent = Math.round((total / shots) * 100) + '%';
            hud.time.textContent = (5 - shots) + ' shots';
            tx = rand(15, 85); target.style.left = tx + '%'; speed += 0.25;
            if (shots >= 5) { cancelAnimationFrame(raf); resolve(total / 5); }
          };
        });
      },
    },
    {
      id: 'memory', name: 'Twin Memory', jp: '神経衰弱', who: 'Hikaru',
      how: 'Flip two cards at a time and find all six pairs. 45 seconds.',
      play(area, hud) {
        return new Promise((resolve) => {
          const syms = ['✿', '★', '♪', '☾', '♥', '✦'];
          const deck = shuffle([...syms, ...syms]);
          const grid = el('div', 'ag-cards'); area.appendChild(grid);
          let open = [], pairs = 0, lock = false;
          hud.score.textContent = '0 / 6';
          const timer = countdown(hud, 45, () => resolve(pairs / 6));
          deck.forEach((s, i) => {
            const c = btn('', 'ag-card'); c.dataset.s = s; c.dataset.i = i;
            c.onclick = () => {
              if (lock || c.classList.contains('up')) return;
              c.classList.add('up'); c.textContent = s; open.push(c); DL.Audio.sfx('blip');
              if (open.length === 2) {
                lock = true;
                const [a, b] = open;
                if (a.dataset.s === b.dataset.s) {
                  pairs++; hud.score.textContent = `${pairs} / 6`; DL.Audio.sfx('chime'); open = []; lock = false;
                  if (pairs === 6) { timer.stop(); resolve(clamp(0.6 + timer.left / 45, 0, 1)); }
                } else setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); a.textContent = ''; b.textContent = ''; open = []; lock = false; }, 650);
              }
            };
            grid.appendChild(c);
          });
        });
      },
    },
    {
      id: 'rewrite', name: 'Spot the Rewrite', jp: '書き換え', who: 'Hikaru',
      how: 'Read Hikaru’s line. It will change one word. Tap the word that changed. Six lines.',
      play(area, hud) {
        const lines = [
          ['I hope you have a nice day', 'nice', 'awful'], ['Thank you for staying with me', 'staying', 'leaving'],
          ['I like it when you sit here', 'like', 'hate'], ['Haruka is my favourite person', 'favourite', 'worst'],
          ['Please remember what I said', 'remember', 'forget'], ['The train lights are pretty tonight', 'pretty', 'cold'],
          ['I was only mean to protect her', 'protect', 'hurt'], ['You can always come back here', 'always', 'never'],
        ];
        return new Promise((resolve) => {
          const set = shuffle(lines.slice()).slice(0, 6); let i = 0, right = 0;
          const box = el('div', 'ag-line'); area.appendChild(box);
          const timer = countdown(hud, 40, () => resolve(right / 6));
          const next = async () => {
            if (i >= 6) { timer.stop(); return resolve(right / 6); }
            hud.score.textContent = `${right} / 6`;
            const [line, word, fake] = set[i];
            box.className = 'ag-line'; box.textContent = '“' + line + '”';
            await wait(1600);
            DL.Audio.sfx('static'); box.classList.add('changed');
            box.innerHTML = line.split(' ').map((w) => `<button type="button" class="ag-word" data-w="${esc(w)}">${esc(w === word ? fake : w)}</button>`).join(' ');
            box.querySelectorAll('.ag-word').forEach((b) => b.onclick = () => {
              const ok = b.dataset.w === word; if (ok) right++;
              DL.Audio.sfx(ok ? 'chime' : 'thud'); b.classList.add(ok ? 'good' : 'bad');
              box.querySelectorAll('.ag-word').forEach((x) => { x.disabled = true; });
              setTimeout(() => { i++; next(); }, 500);
            });
          };
          next();
        });
      },
    },
    {
      id: 'train', name: 'Train Lights', jp: '電車の灯り', who: 'Hikaru', place: 'station', reward: { trust: 1 },
      how: 'Watch the far end of the platform. Tap fast when a BLUE light appears. Don’t tap the pink ones. Eight lights.',
      play(area, hud) {
        return new Promise((resolve) => {
          const sky = el('div', 'ag-sky'), light = el('div', 'ag-light'); sky.appendChild(light);
          const tap = btn('Tap', 'big'); area.append(sky, tap);
          let round = 0, score = 0, state = 'wait', shownAt = 0, timer = null;
          hud.time.textContent = '8 lights'; hud.score.textContent = '0';
          const nextLight = () => {
            if (round >= 8) return resolve(clamp(score / 8, 0, 1));
            state = 'wait'; light.className = 'ag-light';
            timer = setTimeout(() => {
              const blue = Math.random() < 0.65;
              light.className = 'ag-light on ' + (blue ? 'blue' : 'pink'); state = blue ? 'blue' : 'pink'; shownAt = performance.now();
              timer = setTimeout(() => { if (state === 'pink') score += 1; else if (state === 'blue') DL.Audio.sfx('thud'); end(); }, 1100);
            }, rand(700, 1800));
          };
          const end = () => { round++; hud.time.textContent = (8 - round) + ' lights'; hud.score.textContent = Math.max(0, score).toFixed(1); nextLight(); };
          tap.onclick = () => {
            if (state === 'wait') { score -= 0.3; DL.Audio.sfx('thud'); return; }
            clearTimeout(timer);
            if (state === 'blue') { score += clamp(1.2 - (performance.now() - shownAt) / 900, 0.3, 1); DL.Audio.sfx('chime'); } else { score -= 0.5; DL.Audio.sfx('static'); }
            state = 'gone'; end();
          };
          nextLight();
        });
      },
    },
    {
      id: 'quiz', name: 'Cram Quiz', jp: '小テスト', who: 'Ms. Kanda', place: 'library', reward: { grades: 6 },
      how: 'Six quick maths questions. 30 seconds. No phones.',
      play(area, hud) {
        const rounds = Array.from({ length: 6 }, () => {
          const a = randi(3, 14), b = randi(2, 12), op = pick(['+', '−', '×']);
          const ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
          const wrong = new Set(); while (wrong.size < 3) { const w = ans + pick([-3, -2, -1, 1, 2, 4, 10]); if (w !== ans) wrong.add(w); }
          return { q: `<span class="ag-big">${a} ${op} ${b} = ?</span>`, a: String(ans), opts: [String(ans), ...[...wrong].map(String)] };
        });
        return mcRounds(area, hud, rounds, 30);
      },
    },
    {
      id: 'vending', name: 'Vending Machine', jp: '自販機', who: 'Street', place: 'street', reward: { money: 300 },
      how: 'Watch the buttons light up, then press them in the same order. It gets longer each time.',
      play(area, hud) {
        return new Promise((resolve) => {
          const cols = ['pink', 'blue', 'lav', 'cream']; const pad = el('div', 'ag-pad');
          const bs = cols.map((c) => { const b = btn('', 'ag-vend ' + c); pad.appendChild(b); return b; });
          area.appendChild(pad);
          let seq = [], input = [], level = 0, listening = false;
          hud.time.textContent = 'Watch'; hud.score.textContent = 'Level 0';
          const flashB = async (i) => { bs[i].classList.add('lit'); DL.Audio.sfx('blip'); await wait(380); bs[i].classList.remove('lit'); await wait(140); };
          const round = async () => {
            seq.push(randi(0, 3)); input = []; listening = false; hud.time.textContent = 'Watch'; await wait(500);
            for (const i of seq) await flashB(i);
            listening = true; hud.time.textContent = 'Your turn';
          };
          bs.forEach((b, i) => b.onclick = () => {
            if (!listening) return;
            flashB(i); input.push(i);
            if (input[input.length - 1] !== seq[input.length - 1]) { listening = false; DL.Audio.sfx('thud'); return resolve(clamp(level / 7, 0, 1)); }
            if (input.length === seq.length) { level++; hud.score.textContent = 'Level ' + level; DL.Audio.sfx('coin'); if (level >= 7) return resolve(1); round(); }
          });
          for (let k = 0; k < 2; k++) seq.push(randi(0, 3));
          round();
        });
      },
    },
    {
      id: 'swing', name: 'Swing High', jp: 'ブランコ', who: 'Haruka', place: 'park', reward: { energy: 15, favor: 1 },
      how: 'Push Haruka’s swing when the marker is in the pink zone. The zone shrinks. Six pushes.',
      play(area, hud) {
        return new Promise((resolve) => {
          const bar = el('div', 'ag-bar'), zone = el('div', 'ag-zone'), mark = el('div', 'ag-mark');
          bar.append(zone, mark); const push = btn('Push!', 'big'); area.append(bar, push);
          let t = 0, w = 26, pushes = 0, good = 0, raf;
          const place = () => { zone.style.width = w + '%'; zone.style.left = rand(5, 95 - w) + '%'; };
          place(); hud.time.textContent = '6 pushes'; hud.score.textContent = '0';
          const loop = () => { t += 0.035 + pushes * 0.006; mark.style.left = (50 + 48 * Math.sin(t)) + '%'; raf = requestAnimationFrame(loop); };
          loop();
          push.onclick = () => {
            const m = parseFloat(mark.style.left), z = parseFloat(zone.style.left);
            const ok = m >= z && m <= z + w; if (ok) good++;
            DL.Audio.sfx(ok ? 'chime' : 'thud'); pushes++;
            hud.score.textContent = good; hud.time.textContent = (6 - pushes) + ' pushes';
            w = Math.max(9, w - 3.5); place();
            if (pushes >= 6) { cancelAnimationFrame(raf); resolve(good / 6); }
          };
        });
      },
    },
    {
      id: 'rumor', name: 'Rumour Patrol', jp: '噂', who: 'Class 2-B', place: 'classroom', reward: { trust: 1, grades: 3 },
      how: 'Pink notes are cruel rumours: tap them away. Blue notes are Hikaru’s secret apologies: leave those alone! 20 seconds.',
      play(area, hud) {
        return new Promise((resolve) => {
          const grid = el('div', 'ag-desks'); const cells = Array.from({ length: 9 }, () => { const d = el('div', 'ag-desk'); grid.appendChild(d); return d; });
          area.appendChild(grid); let net = 0, alive = true; hud.score.textContent = '0';
          const pop = () => {
            if (!alive) return;
            const cell = pick(cells.filter((c) => !c.firstChild)) || cells[0];
            const blue = Math.random() < 0.28;
            const n = btn(blue ? 'sorry ★' : 'rumour!', 'ag-note ' + (blue ? 'blue' : 'pink'));
            n.onclick = () => { net += blue ? -2 : 1; hud.score.textContent = net; DL.Audio.sfx(blue ? 'thud' : 'page'); n.remove(); };
            cell.appendChild(n); setTimeout(() => n.remove(), rand(900, 1500));
            setTimeout(pop, rand(300, 600));
          };
          pop();
          countdown(hud, 20, () => { alive = false; resolve(clamp(net / 16, 0, 1)); });
        });
      },
    },
    {
      id: 'stars', name: 'Constellation', jp: '星座', who: 'Hikaru', place: 'rooftop', reward: { trust: 1, energy: 5 },
      how: 'Connect Hikaru’s sketchbook stars in order, 1 to 10, as fast as you can. 20 seconds.',
      play(area, hud) {
        return new Promise((resolve) => {
          const sky = el('div', 'ag-night'); area.appendChild(sky);
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'ag-lines'); sky.appendChild(svg);
          let next = 1, last = null;
          const pts = [];
          for (let i = 1; i <= 10; i++) {
            let p; do { p = [rand(6, 94), rand(8, 90)]; } while (pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 14));
            pts.push(p);
            const s = btn(String(i), 'ag-star'); s.style.left = p[0] + '%'; s.style.top = p[1] + '%';
            s.onclick = () => {
              if (i !== next) { DL.Audio.sfx('thud'); return; }
              s.classList.add('on'); DL.Audio.sfx('blip');
              if (last) { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', last[0] + '%'); l.setAttribute('y1', last[1] + '%'); l.setAttribute('x2', p[0] + '%'); l.setAttribute('y2', p[1] + '%'); svg.appendChild(l); }
              last = p; next++; hud.score.textContent = `${next - 1} / 10`;
              if (next > 10) { timer.stop(); DL.Audio.sfx('chime'); resolve(clamp(0.5 + timer.left / 20, 0, 1)); }
            };
            sky.appendChild(s);
          }
          hud.score.textContent = '0 / 10';
          const timer = countdown(hud, 20, () => resolve((next - 1) / 10 * 0.8));
        });
      },
    },
    {
      id: 'bento', name: 'Lunch Sort', jp: 'お弁当', who: 'Cafeteria', place: 'cafeteria', reward: { favor: 1, energy: 5 },
      how: 'Who would want it? Send each lunch item to Haruka (pink) or Hikaru (blue). Ten items, 25 seconds.',
      play(area, hud) {
        const items = [['Strawberry milk', 'haruka'], ['Curry', 'haruka'], ['Pink mochi', 'haruka'], ['Leopard-print bento box', 'haruka'], ['Melon soda', 'haruka'],
          ['Grilled fish', 'hikaru'], ['Plain onigiri', 'hikaru'], ['Black coffee', 'hikaru'], ['Blueberry jelly', 'hikaru'], ['Green tea', 'hikaru']];
        return new Promise((resolve) => {
          const set = shuffle(items.slice()); let i = 0, right = 0;
          const card = el('div', 'ag-food'); const row = el('div', 'ag-opts two');
          const hb = btn('← Haruka', 'pinkb'), kb = btn('Hikaru →', 'blueb'); row.append(hb, kb); area.append(card, row);
          const timer = countdown(hud, 25, () => resolve(right / 10));
          const show = () => { if (i >= 10) { timer.stop(); return resolve(right / 10); } card.textContent = set[i][0]; hud.score.textContent = `${right} / 10`; };
          const answer = (who) => { if (i >= 10) return; const ok = set[i][1] === who; if (ok) right++; DL.Audio.sfx(ok ? 'coin' : 'thud'); card.classList.remove('good', 'bad'); void card.offsetWidth; card.classList.add(ok ? 'good' : 'bad'); i++; show(); };
          hb.onclick = () => answer('haruka'); kb.onclick = () => answer('hikaru');
          show();
        });
      },
    },
  ];
  const byId = Object.fromEntries(GAMES.map((g) => [g.id, g]));
  const forPlace = (place) => GAMES.find((g) => g.place === place) || null;

  /* ---------- the shell around every game ---------- */
  function run(id) {
    return new Promise((resolve) => {
      const g = byId[id];
      const best = (DL.State.meta.best || {})[id] || 0;
      const m = el('div', 'arcade screen fade');
      m.innerHTML = `<div class="ag-panel" role="dialog" aria-modal="true">
        <header class="ag-head"><div><h2>${esc(g.name)} <span class="jp">${g.jp}</span></h2><small>${esc(g.who)}</small></div>
          <div class="ag-hud"><span class="ag-time"></span><span class="ag-score"></span><button type="button" class="ag-btn small" data-a="quit">Quit</button></div></header>
        <div class="ag-area"><div class="ag-intro"><p>${esc(g.how)}</p><p class="ag-best">Best: ${'★'.repeat(stars(best))}${'☆'.repeat(3 - stars(best))}</p>
          <button type="button" class="btn primary" data-a="start">Start</button></div></div></div>`;
      document.querySelector('#screens').appendChild(m);
      const area = m.querySelector('.ag-area');
      const hud = { time: m.querySelector('.ag-time'), score: m.querySelector('.ag-score') };
      let finished = false;
      const close = (score) => { if (finished) return; finished = true; m.remove(); resolve({ score, stars: stars(score) }); };
      m.querySelector('[data-a=quit]').onclick = () => close(0);
      m.querySelector('[data-a=start]').onclick = async () => {
        DL.Audio.sfx('select');
        area.innerHTML = '';
        const score = clamp(await g.play(area, hud), 0, 1);
        if (finished) return;
        const n = stars(score);
        const meta = DL.State.meta; meta.best = meta.best || {};
        const newBest = score > (meta.best[id] || 0);
        if (newBest) { meta.best[id] = score; DL.State.saveMeta(); }
        DL.Audio.sfx(n >= 2 ? 'chime' : 'page');
        area.innerHTML = `<div class="ag-intro"><div class="ag-stars">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</div>
          <p>${n === 3 ? 'Perfect!' : n === 2 ? 'Nicely done.' : n === 1 ? 'Not bad.' : 'Better luck next time.'}${newBest ? ' New best!' : ''}</p>
          <button type="button" class="btn primary" data-a="done">Continue</button></div>`;
        area.querySelector('[data-a=done]').onclick = () => close(score);
      };
    });
  }
  function stars(score) { return score >= 0.85 ? 3 : score >= 0.55 ? 2 : score >= 0.25 ? 1 : 0; }

  /* ---------- the Arcade menu on the title screen ---------- */
  function menu() {
    return new Promise((resolve) => {
      const m = el('div', 'modal screen fade');
      let tab = 'arcade';
      const card = (id, name, jp, who, n) => `<button type="button" class="ag-pick" data-g="${id}"><b>${esc(name)}</b><span class="jp">${jp}</span><small>${esc(who)}</small><span class="st">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</span></button>`;
      const render = () => {
        const best = DL.State.meta.best || {};
        const list = tab === 'arcade'
          ? GAMES.map((g) => card(g.id, g.name, g.jp, g.who, stars(best[g.id] || 0))).join('')
          : DL.Studio.LIST.map((id) => { const g = DL.Studio.GAMES[id]; return card('st:' + id, g.name, g.jp, g.who, best['st_' + id] || 0); }).join('');
        m.innerHTML = `<div class="panel arcade-menu" role="dialog" aria-modal="true"><h2>Arcade <span class="jp">ゲームセンター</span></h2>
          <div class="ag-tabs"><button type="button" class="${tab === 'arcade' ? 'on' : ''}" data-tab="arcade">Arcade games (12)</button><button type="button" class="${tab === 'studio' ? 'on' : ''}" data-tab="studio">Style studio (9)</button></div>
          <div class="ag-list">${list}</div>
          <div class="actions"><button type="button" class="btn small primary" data-a="close">Close</button></div></div>`;
        m.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; DL.Audio.sfx('blip'); render(); });
        m.querySelectorAll('[data-g]').forEach((b) => b.onclick = async () => {
          DL.Audio.sfx('select');
          const id = b.dataset.g;
          if (id.startsWith('st:')) {
            const sid = id.slice(3);
            m.hidden = true;
            const r = await DL.Studio.play(sid, { budget: 3000, free: true });
            m.hidden = false;
            const meta = DL.State.meta; meta.best = meta.best || {};
            if ((r.stars || 0) > (meta.best['st_' + sid] || 0)) { meta.best['st_' + sid] = r.stars; DL.State.saveMeta(); }
          } else await run(id);
          render();
        });
        m.querySelector('[data-a=close]').onclick = () => { m.remove(); resolve(); };
      };
      render();
      document.querySelector('#screens').appendChild(m);
    });
  }

  return { GAMES, byId, forPlace, run, menu, stars };
})();
