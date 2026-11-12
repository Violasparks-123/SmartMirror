/* YOUR PHONE: open it any time from the Phone button in the top bar.
   Home screen (the wallpaper changes as the week goes wrong) and nine apps:
   Album, Bonds, Remembered, Clues, Profiles, Calendar, Trophies, Lost Things, Diary.
   Also: the trophy checker (pops up a toast when you earn one) and the diary archive. */
DL.Apps = (() => {
  const { el, esc, format, clock } = DL.util;
  const X = () => DL.Extras;
  const THUMB = (id) => `assets/thumb/${id}.webp`;
  const FACE = { hikaru: 'assets/sprites/hikaru_face.webp', haruka: 'assets/sprites/haruka_face.webp', rin: 'assets/sprites/rin_face.webp', rei: 'assets/sprites/rei_face.webp', sei: 'assets/sprites/sei_face.webp' };

  const erasedNow = (s) => !!s && (s.day === 7 || (s.day === 8 && !s.flags.hikaruBack));

  /* ---------- what each app counts as "unlocked" (for the red badges) ---------- */
  const COUNTS = {
    album: (s) => X().PHOTOS.filter((p) => p.cond(s)).length,
    remembered: (s) => s.frags.length,
    clues: (s) => X().CLUES.filter((c) => c.cond(s)).length,
    profiles: (s) => Object.values(X().PROFILES).reduce((n, P) => n + P.facts.filter((f) => f.cond(s)).length, 0),
    lost: (s) => X().lostCount(s),
    trophies: () => (DL.State.meta.trophies || []).length,
    diary: (s) => Object.keys(s.archive || {}).length,
  };

  const APPS = [
    { id: 'album', name: 'Album', icon: '🖼', color: 'linear-gradient(135deg,#ffd1e3,#ffe9c9)' },
    { id: 'bonds', name: 'Bonds', icon: '💞', color: 'linear-gradient(135deg,#f3a8c4,#a2cbef)' },
    { id: 'remembered', name: 'Remembered', icon: '↺', color: 'linear-gradient(135deg,#a2cbef,#dff0ff)' },
    { id: 'clues', name: 'Clues', icon: '📌', color: 'linear-gradient(135deg,#d9b48a,#f4e4c6)' },
    { id: 'profiles', name: 'Profiles', icon: '👤', color: 'linear-gradient(135deg,#c7b6ea,#efe8ff)' },
    { id: 'calendar', name: 'Calendar', icon: '📅', color: 'linear-gradient(135deg,#fff,#ffe3ee)' },
    { id: 'trophies', name: 'Trophies', icon: '🏆', color: 'linear-gradient(135deg,#f6d48b,#fff1c7)' },
    { id: 'lost', name: 'Lost Things', icon: '✦', color: 'linear-gradient(135deg,#2c2336,#5b4a73)' },
    { id: 'diary', name: 'Diary', icon: '📓', color: 'linear-gradient(135deg,#bfe8d6,#effaf5)' },
  ];

  let root = null;

  function open(start, o = {}) {
    if (root || (DL.Phone && DL.Phone.active)) return Promise.resolve();
    const s = DL.State.s;
    return new Promise((resolve) => {
      root = el('div', 'apps screen fade');
      root.innerHTML = `<div class="ph" role="dialog" aria-label="Your phone"><div class="ph-in">
        <div class="ph-bar"><span>${clock()}</span><span class="notch"></span><span>◔ ▮▮▮</span></div>
        <div class="ph-body"></div>
        <button type="button" class="ph-home" aria-label="Home"></button></div></div>`;
      document.querySelector('#screens').appendChild(root);
      const body = root.querySelector('.ph-body');
      const close = () => { root.remove(); root = null; resolve(); };
      root.addEventListener('click', (e) => { if (e.target === root) close(); });
      root.querySelector('.ph-home').onclick = () => { DL.Audio.sfx('blip'); if (o.only || !s) close(); else home(); };

      function home() {
        const c = DL.State.corruption();
        const wall = erasedNow(s) ? 'w-her' : c >= 2 ? 'w-glitch' : c === 1 ? 'w-dusk' : 'w-sakura';
        const d = DL.Data.DAYS[s.day - 1] || DL.Data.DAYS[0];
        s.appSeen = s.appSeen || {};
        body.className = 'ph-body home ' + wall;
        body.innerHTML = `<div class="ph-wall">${wall === 'w-her' ? `<img src="${FACE.haruka}" alt="">` : ''}</div>
          <div class="ph-clock"><b>${clock()}</b><span>${erasedNow(s) ? 'Day 6 · Day 6 · Day 6' : `Day ${s.day} · ${d.en} ${d.date}`}</span></div>
          ${erasedNow(s) ? '<div class="ph-notif">💗 Haruka: look at me, not at the apps</div>' : s.frags.length ? `<div class="ph-notif">↺ ${s.frags.length} line${s.frags.length > 1 ? 's' : ''} remembered</div>` : ''}
          <div class="ph-grid">${APPS.map((a) => {
            const now = COUNTS[a.id] ? COUNTS[a.id](s) : 0, seen = s.appSeen[a.id] ?? 0;
            const badge = now > seen ? `<i class="badge">${now - seen}</i>` : '';
            return `<button type="button" class="app" data-app="${a.id}"><span class="ic" style="background:${a.color}">${a.icon}${badge}</span><span>${esc(erasedNow(s) && a.id === 'remembered' ? 'R̷emembered' : a.name)}</span></button>`;
          }).join('')}</div>`;
        body.querySelectorAll('[data-app]').forEach((b) => (b.onclick = () => { DL.Audio.sfx('select'); show(b.dataset.app); }));
      }

      function show(id) {
        const a = APPS.find((x) => x.id === id);
        if (s && COUNTS[id]) { s.appSeen = s.appSeen || {}; s.appSeen[id] = COUNTS[id](s); }
        body.className = 'ph-body app-' + id;
        body.innerHTML = `<header class="ap-head">${o.only ? '' : '<button type="button" class="back">‹</button>'}<b>${a.icon} ${esc(a.name)}</b>${o.only ? '<button type="button" class="back x">✕</button>' : ''}</header><div class="ap-main">${RENDER[id](s)}</div>`;
        body.querySelector('.back').onclick = () => { DL.Audio.sfx('blip'); if (o.only || !s) close(); else home(); };
        if (BIND[id]) BIND[id](body, s);
      }

      if (start) show(start); else if (s) home(); else show('trophies');
      DL.Audio.sfx('ping');
    });
  }

  /* ---------- photo drawing (used by the Album) ---------- */
  function photo(p, s, big) {
    const erased = erasedNow(s);
    const faces = p.who.map((w, i) => {
      if (w === 'hikaru' && erased) return `<span class="pf erased" style="--i:${i}"></span>`;
      return `<img class="pf" style="--i:${i}" src="${FACE[w]}" alt="">`;
    }).join('');
    const ghost = p.ghost ? `<img class="pf ghost" src="${FACE.hikaru}" alt="">` : '';
    return `<div class="photo ${big ? 'big' : ''} n${p.who.length}" style="background-image:url('${THUMB(p.bg)}')">${ghost}${faces}</div>`;
  }

  const bar = (v, max, cls) => `<span class="bar ${cls || ''}"><i style="width:${Math.round((v / max) * 100)}%"></i></span>`;

  const RENDER = {
    album(s) {
      const P = X().PHOTOS;
      return `<p class="ap-sub">${P.filter((p) => p.cond(s)).length} of ${P.length} photos</p><div class="al-grid">${P.map((p) => p.cond(s)
        ? `<button type="button" class="al-item" data-photo="${p.id}">${photo(p, s)}<span>${esc(p.title)}</span></button>`
        : '<div class="al-item locked"><div class="photo empty">?</div><span>???</span></div>').join('')}</div><div class="al-view" hidden></div>`;
    },
    bonds(s) {
      const rin = ['rinFriend', 'darkroomMet', 'rinBrave', 'rinOutfit', 'rinKnows'].filter((k) => s.flags[k]).length;
      const erased = erasedNow(s);
      const status = (v, lines) => lines[Math.min(lines.length - 1, Math.floor(v / (10 / lines.length)))];
      const card = (face, name, v, max, cls, line) => `<div class="bond ${cls}"><img src="${face}" alt=""><div><b>${name}</b>${bar(v, max, cls)}<small>${esc(line)}</small></div></div>`;
      return `${erased
        ? `<div class="bond blue glitched"><span class="pf erased"></span><div><b>H̷̛ikaru A̶mane</b><span class="bar"><i style="width:0"></i></span><small>contact not found. contact not found. contact not f</small></div></div>`
        : card(FACE.hikaru, 'Hikaru', s.trust, 10, 'blue', status(s.trust, ['Keeps her mean voice on around you.', 'Says hi without the mean voice, sometimes.', 'Saves you a spot on the roof.', 'Tells you things she’s never said out loud.', 'Would trust you with anything.']))}
        ${card(FACE.haruka, 'Haruka', s.favor, 10, 'pink', status(s.favor, ['Thinks you’re furniture.', 'Thinks you’re interesting furniture.', 'Saves you a seat at the window table.', 'Calls you her best friend. Means it, mostly.', 'Would do anything to keep you. Anything.']))}
        ${card(FACE.rin, 'Rin', rin, 5, 'lav', ['Asks before taking your photo.', 'Shows you her favourite photos.', 'Brought you into the darkroom.', 'Wants to be in a photo with you.', 'Trusts you with what she’s seen.', 'Her best friend. Officially.'][rin])}
        ${s.day >= 4 || s.flags.readNotebook ? `<div class="bond susp"><span class="ic">👁</span><div><b>Haruka’s suspicion of her sister</b>${bar(s.susp, 10, 'red')}<small>${s.susp >= 7 ? 'She’s sure Hikaru wants to replace her.' : s.susp >= 4 ? 'She’s watching Hikaru more closely.' : 'She believes her sister, for now.'}</small></div></div>` : ''}`;
    },
    remembered(s) {
      const F = DL.Data.FRAGMENTS;
      return `<p class="ap-sub">${s.frags.length} of ${DL.Data.FRAG_TOTAL} lines</p>
        <div class="goals"><span>Good ending ${bar(Math.min(s.frags.length, DL.Data.GOOD.frags), DL.Data.GOOD.frags, 'blue')}</span><span>True ending ${bar(Math.min(s.frags.length, 12), 12, 'gold')}</span></div>
        <ul class="frag-list">${Object.entries(F).map(([id, title]) => s.frags.includes(id)
          ? `<li class="got">↺ <b>${esc(title)}</b><small>remembered</small></li>`
          : s.missed.includes(id) ? `<li class="lost">✕ <b>${esc(title)}</b><small>she kept this one</small></li>`
            : '<li>· <b>???</b><small>not heard yet</small></li>').join('')}</ul>`;
    },
    clues(s) {
      const C = X().CLUES.filter((c) => c.cond(s));
      return C.length ? `<div class="cork">${C.map((c, i) => `<div class="clue" style="--r:${((i * 37) % 7) - 3}deg"><b>${esc(c.title)}</b><p>${esc(c.text)}</p></div>`).join('')}</div>` : '<p class="ap-empty">Nothing pinned yet. Keep your eyes open.</p>';
    },
    profiles(s) {
      return `<nav class="pr-tabs">${Object.entries(X().PROFILES).filter(([, P]) => !P.show || P.show(s)).map(([k, P], i) => `<button type="button" data-pr="${k}" class="${i ? '' : 'on'}"><img src="${FACE[k]}" alt="">${esc(P.name.split(' ')[0])}</button>`).join('')}</nav><div class="pr-body"></div>`;
    },
    calendar(s) {
      return `<ul class="cal">${DL.Data.DAYS.map((d, i) => {
        const n = i + 1, ev = (X().CAL[n] || []);
        const cls = n < s.day ? 'past' : n === s.day ? 'today' : '';
        return `<li class="${cls} ${n === 7 ? 'glitch' : ''}"><div class="dt"><b>${n}</b><span>${d.en.slice(0, 3)}</span></div><div>${ev.map((e) => `<p>${format(e, s)}</p>`).join('')}</div></li>`;
      }).join('')}</ul>`;
    },
    trophies() {
      const got = DL.State.meta.trophies || [];
      return `<p class="ap-sub">${got.length} of ${X().TROPHIES.length} · kept across every playthrough</p><div class="tr-grid">${X().TROPHIES.map((t) => got.includes(t.id)
        ? `<div class="tr got"><span class="ic">${t.icon}</span><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></div>`
        : `<div class="tr"><span class="ic">🔒</span><b>???</b><small>${esc(t.desc)}</small></div>`).join('')}</div>`;
    },
    lost(s) {
      const L = X().LOST, mine = s.lost || [];
      const names = Object.fromEntries(DL.Data.LOCATIONS.map((l) => [l.id, l.name]));
      return `<p class="ap-sub">${mine.length} of ${L.length} charms from a broken bracelet</p>
        <div class="bracelet">${L.map((c) => `<span class="${mine.includes(c.id) ? 'on' : ''}">${mine.includes(c.id) ? c.icon : '○'}</span>`).join('')}</div>
        <div class="lost-grid">${L.map((c) => mine.includes(c.id)
          ? `<div class="lt got"><span class="ic">${c.icon}</span><b>${esc(c.name)}</b><small>${esc(c.text)}</small></div>`
          : `<div class="lt"><span class="ic">?</span><b>???</b><small>Somewhere around: ${esc(names[c.loc] || c.loc)}${s.day < c.from ? ` (from day ${c.from})` : ''}</small></div>`).join('')}</div>
        ${s.flags.braceletWhole ? '<p class="ap-note">The bracelet is whole. You should give it back to her.</p>' : ''}`;
    },
    diary(s) {
      const A = s.archive || {};
      const days = Object.keys(A).map(Number).sort((a, b) => b - a);
      if (!days.length) return '<p class="ap-empty">Your diary is empty. Pages are kept here after you sleep.</p>';
      return days.map((n) => {
        const d = DL.Data.DAYS[n - 1];
        return `<section class="dy"><h4>Day ${n} <span>${d.jp} ${d.date}</span></h4>${A[n].map((l) => l.startsWith('!h ')
          ? `<p class="other">${format(l.slice(3), s)}</p>` : l.startsWith('!b ') ? `<p class="other blue">${format(l.slice(3), s)}</p>` : `<p>${format(l, s)}</p>`).join('')}</section>`;
      }).join('');
    },
  };

  const BIND = {
    album(body, s) {
      const view = body.querySelector('.al-view');
      body.querySelectorAll('[data-photo]').forEach((b) => (b.onclick = () => {
        const p = X().PHOTOS.find((x) => x.id === b.dataset.photo);
        DL.Audio.sfx('page');
        const cap = erasedNow(s) && p.who.includes('hikaru') ? 'Haruka, alone. She’s always been alone in this one. Hasn’t she?' : p.cap;
        view.innerHTML = `<div class="al-big">${photo(p, s, true)}<b>${esc(p.title)}</b><p>${format(cap, s)}</p><button type="button" class="btn small">Close</button></div>`;
        view.hidden = false;
        view.querySelector('button').onclick = () => { view.hidden = true; };
      }));
    },
    profiles(body, s) {
      const show = (k) => {
        const P = X().PROFILES[k];
        const erased = k === 'hikaru' && erasedNow(s);
        body.querySelectorAll('[data-pr]').forEach((b) => b.classList.toggle('on', b.dataset.pr === k));
        body.querySelector('.pr-body').innerHTML = `<div class="pr-card ${k} ${erased ? 'erased' : ''}"><img src="${FACE[k]}" alt=""><h3>${erased ? 'N̷o̶ ̷p̴r̵o̸f̷i̶l̴e̶' : esc(P.name)} <span>${P.jp}</span></h3><small>${esc(erased ? 'This person is not in class 2-B.' : P.tag)}</small>
          <ul>${P.facts.map((f) => (f.cond(s) && !erased ? `<li>${esc(f.text)}</li>` : '<li class="locked">???</li>')).join('')}</ul></div>`;
      };
      body.querySelectorAll('[data-pr]').forEach((b) => (b.onclick = () => { DL.Audio.sfx('blip'); show(b.dataset.pr); }));
      show('hikaru');
    },
  };

  /* ---------- trophies: checked every couple of seconds ---------- */
  function checkTrophies() {
    const meta = DL.State.meta, s = DL.State.s;
    meta.trophies = meta.trophies || [];
    let changed = false;
    for (const t of X().TROPHIES) {
      if (meta.trophies.includes(t.id)) continue;
      let ok = false;
      try { ok = t.meta ? t.meta(meta) : !!(s && !s.flags.ended && t.cond(s)); } catch (e) { ok = false; }
      if (ok) { meta.trophies.push(t.id); changed = true; DL.Screens.toast(`🏆 Trophy unlocked · ${t.name}`, 'lav', 3600); DL.Audio.sfx('chime'); }
    }
    if (changed) DL.State.saveMeta();
  }
  setInterval(() => { try { checkTrophies(); } catch (e) { /* not ready yet */ } }, 2500);

  /* ---------- diary: night events first, then keep a copy of each page ---------- */
  const origDiary = DL.Screens.diary;
  DL.Screens.diary = async function diaryWithNight() {
    const s = DL.State.s;
    if (s && X().night) {
      try { await X().night(s); } catch (e) { if (e instanceof DL.Engine.Abort) throw e; console.error(e); }
    }
    if (s) { s.archive = s.archive || {}; s.archive[s.day] = s.diary.slice(); }
    return origDiary();
  };

  return { open, checkTrophies, get isOpen() { return !!root; } };
})();
