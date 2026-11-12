// Moonlit Manor — game logic: story quests with choices, places, wardrobe, mini games, rewards, saving.
(() => {
  const D = window.DATA;
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = "moonlit-manor-v3";
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const today = new Date().toDateString();
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const loc = (id) => D.locations.find((l) => l.id === id) || D.locations[0];
  const locImg = (id) => {
    const L = loc(id);
    if (L.video) return "assets/castle-poster.webp";
    if (L.slot) return ART.get(L.slot) || `assets/bg-${L.fallback}.webp`;
    return `assets/bg-${id}.webp`;
  };
  const placeOpen = (L) => !L.unlock || S.story.ch >= L.unlock;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function itemHTML(id) {
    const a = D.itemArt[id];
    if (a && a[0] === "@") { const u = ART.get(a.slice(1)); return u ? `<img src="${u}" alt="">` : `<span class="emo">${D.itemFallback[id] || "✦"}</span>`; }
    return `<img src="assets/${a}.webp" alt="">`;
  }
  function npcHTML(id) {
    const n = D.npcs[id], u = ART.get(n.slot);
    return u ? `<img src="${u}" alt="${n.name}">` : `<div class="npc-ph"><span>${n.icon}</span><b>${n.name}</b><small>Picture not added yet</small></div>`;
  }
  const outfitOpen = (id) => !D.outfits[id].slot || ART.has(D.outfits[id].slot);
  const outfitStyle = (id) => { const o = D.outfits[id]; return (o.slot && ART.meta(o.slot).style) || o.style; };

  // ---------- state ----------
  const fresh = () => ({
    name: "Asteria", stars: 500, coins: 5000, hearts: 100,
    level: 1, exp: 0, health: 100, energy: 100,
    story: { ch: 0, step: 0 }, sideIdx: 0,
    comfort: 60, deco: 50, upgrades: 0,
    collected: 0, owned: [],
    outfit: "gothic", tint: "Original", face: "neutral",
    location: "castle", visited: ["castle"], explored: {},
    tasks: { quests: 0, items: 0, login: 1 }, claimed: {},
    loginDay: 1, loginClaimed: "",
    ach: { quests: 0, explore: 1, items: 0, style: 0, cook: 0, puzzle: 0, friends: 0, memories: 0 }, achClaimed: {},
    ballDay: "",
    friends: { rosalind: 0, steward: 0, masked: 0, luna: 0 }, talked: {},
    memories: [],
    mail: [
      { id: 1, from: "The Manor Steward", text: "Welcome home, Lady Asteria. A small gift for your return.", reward: ["coins", 3000], read: false },
      { id: 2, from: "Royal Ball Committee", text: "Your invitation to the Royal Fashion Ball is enclosed.", reward: ["stars", 100], read: false },
      { id: 3, from: "Rosalind the Gardener", text: "I found this crescent charm in the roses. It suits you.", reward: ["item", "moon"], read: false },
    ],
    settings: { music: false, sfx: true, vol: 0.6 },
    lastLogin: today,
    eventEnd: Date.now() + ((2 * 24 + 14) * 60 + 32) * 60 * 1000,
  });

  let S = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved) {
      const f = fresh(); S = Object.assign(f, saved);
      S.ach = Object.assign(fresh().ach, saved.ach); S.friends = Object.assign(fresh().friends, saved.friends);
    }
  } catch (e) {}
  if (S.lastLogin !== today) {
    S.lastLogin = today;
    S.tasks = { quests: 0, items: 0, login: Math.min(7, S.tasks.login + 1) };
    S.claimed = {};
    S.loginDay = (S.loginDay % 7) + 1;
  }
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };
  SFX.enabled = S.settings.sfx; SFX.volume = S.settings.vol;

  // ---------- feedback ----------
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function floatAt(el, text, color) {
    const r = (el || document.body).getBoundingClientRect();
    const f = document.createElement("div");
    f.className = "float"; f.textContent = text; if (color) f.style.color = color;
    f.style.left = Math.max(8, r.left + r.width / 2 - 30) + "px"; f.style.top = r.top + 4 + "px";
    document.body.appendChild(f); setTimeout(() => f.remove(), 1250);
  }
  function sparkle(el, n = 10) {
    if (still || !el) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "spark"; s.textContent = i % 3 ? "✦" : "♡";
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 60;
      s.style.left = r.left + r.width / 2 + "px"; s.style.top = r.top + r.height / 2 + "px";
      s.style.setProperty("--dx", Math.cos(a) * d + "px"); s.style.setProperty("--dy", Math.sin(a) * d + "px");
      document.body.appendChild(s); setTimeout(() => s.remove(), 850);
    }
  }
  let typing;
  function typeInto(el, msg, done) {
    clearInterval(typing);
    if (still) { el.textContent = msg; done && done(); return; }
    let i = 0; el.textContent = "";
    typing = setInterval(() => { el.textContent = msg.slice(0, ++i); if (i >= msg.length) { clearInterval(typing); done && done(); } }, 28);
  }
  const say = (msg) => typeInto($("bubble"), msg);
  function notify(title, sub, onClick, badge = "!") {
    const n = document.createElement("div");
    n.className = "note";
    n.innerHTML = `<span class="badge">${badge}</span><span><b>${title}</b><small>${sub}</small></span><button class="x" aria-label="Dismiss">×</button>`;
    n.onclick = (e) => { if (!e.target.closest(".x") && onClick) onClick(); n.remove(); };
    $("notes").prepend(n);
    while ($("notes").children.length > 2) $("notes").lastChild.remove();
    setTimeout(() => n.remove(), 7000);
  }

  // ---------- character ----------
  let tempFace = null;
  function headSrc() {
    const f = tempFace || S.face || (S.health < 30 ? "cry" : "neutral");
    return `assets/face-${f}.webp`;
  }
  function dollLayers(outfitId, tint, preview) {
    if (!outfitOpen(outfitId) && !preview) outfitId = "gothic";
    const o = D.outfits[outfitId], hue = D.tints[tint] || 0;
    const layer = ([src, w, l, t], cls = "") => `<img class="${cls}" src="${src}" alt="" style="width:${w}%;left:${l}%;top:${t}%;${hue && !cls ? `filter:hue-rotate(${hue}deg)` : ""}">`;
    let layers;
    if (o.slot) {
      const m = Object.assign({}, D.outfitDefaults, ART.meta(o.slot), preview && preview.meta);
      layers = [[(preview && preview.src) || ART.get(o.slot), m.w, m.l, m.t]];
    } else layers = o.layers.map(([img, w, l, t]) => [`assets/${img}.webp`, w, l, t]);
    return `<div class="shadow"></div><div class="layers">${layers.map((L) => layer(L)).join("")}${layer(["assets/face-neutral.webp", 86, 6, 0], "head")}</div>`;
  }
  function drawDoll() {
    $("doll").innerHTML = dollLayers(S.outfit, S.tint);
    setFace();
  }
  function setFace() {
    document.querySelectorAll(".doll .head").forEach((h) => (h.src = headSrc()));
    $("avatarFace").src = headSrc();
  }
  function emote(face, ms = 1600) {
    tempFace = face; setFace();
    clearTimeout(emote.t); emote.t = setTimeout(() => { tempFace = null; setFace(); }, ms);
  }
  function hop() { const d = $("doll"); d.classList.remove("hop"); void d.offsetWidth; d.classList.add("hop"); }
  // blink: briefly show the closed-eye smile
  setInterval(() => {
    if (tempFace || still) return;
    tempFace = "content"; setFace();
    setTimeout(() => { if (tempFace === "content") { tempFace = null; setFace(); } }, 170);
  }, 4200);

  // ---------- economy ----------
  const pillFor = { stars: "cStars", coins: "cCoins", hearts: "cHearts" };
  const rewardLabel = ([t, a]) => (t === "item" ? D.items[a] : `${fmt(a)} ${t}`);
  function give([type, amt], fromEl) {
    SFX.reward();
    if (type === "item") return findItem(amt, fromEl);
    if (type === "energy") { S.energy = Math.min(100, S.energy + amt); floatAt(fromEl, `+${amt} energy`, "#d6b8ff"); return; }
    S[type] += amt;
    floatAt(fromEl, `+${fmt(amt)} ${type === "stars" ? "✦" : type === "coins" ? "●" : "♥"}`, type === "stars" ? "#cfe8ff" : null);
    const p = $(pillFor[type])?.parentElement;
    if (p) { p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump"); }
  }
  function gainExp(n) {
    S.exp += n;
    while (S.exp >= 100) {
      S.exp -= 100; S.level++; S.stars += 50; S.energy = 100;
      setTimeout(() => { SFX.level(); toast(`Level up! Lv. ${S.level} · energy refilled · +50 ✦`); sparkle($("level"), 18); emote("joy"); }, 450);
    }
  }
  function useEnergy(n) {
    if (S.energy < n) { SFX.wrong(); emote("dizzy"); toast("Not enough energy. Rest, or buy some in the Shop."); return false; }
    S.energy -= n; return true;
  }
  let newItem = null;
  function findItem(id, fromEl) {
    S.collected = Math.min(200, S.collected + 1);
    S.tasks.items++;
    const story = ["key", "lantern", "musicbox", "teacup", "ribbon", "heart"];
    if (id == null) id = Object.keys(D.items).find((c) => !S.owned.includes(c) && !story.includes(c));
    if (id === "none") id = null;
    if (id && !S.owned.includes(id)) {
      S.owned.push(id); newItem = id; S.ach.items = S.owned.length;
      notify("You got a reward!", D.items[id], () => PAGES.inventory(), "✦");
    } else floatAt(fromEl, "+1 collection");
  }
  const upgradeCost = () => 3000 + S.upgrades * 2000;

  // ---------- places ----------
  function showPlace(id) {
    const L = loc(id), bg = $("placeBg");
    if (L.video) bg.classList.remove("on");
    else { bg.style.backgroundImage = `url(${locImg(id)})`; bg.classList.add("on"); }
    $("locName").textContent = L.name;
  }
  function travel(id, quiet) {
    S.location = id; showPlace(id);
    if (!S.visited.includes(id)) { S.visited.push(id); S.ach.explore = S.visited.length; }
    if (!quiet) {
      say(loc(id).line);
      if (S.explored[id] !== today) {
        S.explored[id] = today;
        const coins = 100 + Math.floor(Math.random() * 200);
        setTimeout(() => { give(["coins", coins], $("locTag")); if (Math.random() < .5) findItem("none", $("locTag")); render(); }, 600);
        toast(`Explored ${loc(id).name}`);
      }
    }
    render();
  }

  // ---------- story ----------
  function currentQuest() {
    const ch = D.story[S.story.ch];
    if (ch) return { q: ch.steps[S.story.step], chapter: ch.chapter, n: S.story.step + 1, of: ch.steps.length };
    return { q: D.sideQuests[S.sideIdx % D.sideQuests.length], chapter: "Side Stories", n: 1, of: 1 };
  }
  const questTitle = (q) => q.lines[0][1];
  let dlg = null; // { q, i, phase }
  function playQuest(e) {
    if (dlg) return advance();
    if (!$("modal").hidden) closeModal();
    if (!useEnergy(5)) return render();
    SFX.click();
    const { q } = currentQuest();
    travel(q.at, true);
    dlg = { q, i: 0, phase: "lines" };
    $("dialog").hidden = false; $("bubble").hidden = true;
    showLine();
    render();
  }
  function showNPC(id) {
    const el = $("npc");
    if (!id) { el.hidden = true; $("stage").classList.remove("with-npc"); return; }
    if (el.dataset.id !== id || el.hidden) { el.innerHTML = npcHTML(id); el.dataset.id = id; }
    el.hidden = false; $("stage").classList.add("with-npc");
  }
  function showLine() {
    const [who, text] = dlg.q.lines[dlg.i];
    if (who[0] === "@") {
      const id = who.slice(1);
      showNPC(id); $("dlgName").textContent = D.npcs[id].name; $("dialog").classList.add("npc-talk");
      $("dlgChoices").innerHTML = ""; $("dlgNext").hidden = false;
      typeInto($("dlgText"), text); return;
    }
    $("dlgName").textContent = S.name; $("dialog").classList.remove("npc-talk");
    const face = who;
    S.face = null; emote(face, 999999);
    $("dlgChoices").innerHTML = ""; $("dlgNext").hidden = false;
    typeInto($("dlgText"), text);
  }
  function advance() {
    if (!dlg) return;
    SFX.click();
    if (typing && $("dlgText").textContent.length < (dlg.phase === "lines" ? dlg.q.lines[dlg.i][1].length : 0)) {
      clearInterval(typing); $("dlgText").textContent = dlg.q.lines[dlg.i][1]; return;
    }
    if (dlg.phase === "lines") {
      if (dlg.i < dlg.q.lines.length - 1) { dlg.i++; showLine(); return; }
      dlg.phase = "choice";
      $("dlgNext").hidden = true;
      $("dlgName").textContent = S.name; $("dialog").classList.remove("npc-talk");
      $("dlgText").textContent = "What should Asteria do?";
      $("dlgChoices").innerHTML = dlg.q.choice.map((c, i) => `<button class="choice" data-c="${i}">${c[0]}</button>`).join("");
      emote("neutral", 999999);
      return;
    }
    if (dlg.phase === "reply") finishQuest();
  }
  function choose(i, btn) {
    const [, face, reply, reward] = dlg.q.choice[i];
    dlg.phase = "reply"; dlg.reward = reward;
    $("dlgChoices").innerHTML = ""; $("dlgNext").hidden = false;
    emote(face, 999999); hop();
    typeInto($("dlgText"), reply);
    give(reward, btn || $("dialog")); gainExp(15);
    sparkle($("doll"), 12);
    render();
  }
  function finishQuest() {
    const cg = dlg.q.cg;
    dlg = null; showNPC(null);
    $("dialog").hidden = true; $("bubble").hidden = false;
    tempFace = null; setFace();
    S.tasks.quests++; S.ach.quests++;
    const ch = D.story[S.story.ch];
    if (ch) {
      S.story.step++;
      if (S.story.step >= ch.steps.length) {
        toast(`Chapter complete: ${ch.chapter}! +300 ✦`);
        S.stars += 300; SFX.level(); sparkle($("continue"), 24);
        S.story.ch++; S.story.step = 0;
        if (D.story[S.story.ch]) notify("New chapter!", D.story[S.story.ch].chapter, () => playQuest());
        else notify("Story complete!", "Side stories unlocked~", null, "♡");
      }
    } else S.sideIdx++;
    say("What a day! ♡");
    if (cg && !S.memories.includes(cg)) { S.memories.push(cg); S.ach.memories = S.memories.length; setTimeout(() => showMemory(cg, true), 500); }
    render();
  }
  function showMemory(cg, isNew) {
    const u = ART.get(cg), title = D.memories[cg];
    if (isNew) { SFX.level(); }
    openModal(isNew ? "Memory unlocked!" : title, `
      ${u ? `<img class="cg" src="${u}" alt="${esc(title)}">`
          : `<div class="cg cg-empty"><b>${esc(title)}</b><span>This memory's picture hasn't been added yet.</span><code>${cg}</code></div>`}
      ${isNew ? `<p style="text-align:center;font-family:var(--display);font-size:1.2rem;margin:10px 0 0">${esc(title)}</p>` : ""}
      <div class="choices" style="justify-content:center">${u ? "" : `<button class="btn" id="cgAdd">Add the picture</button>`}<button class="btn ghost" id="cgAlbum">Open Memories</button></div>`, () => {
      if ($("cgAdd")) $("cgAdd").onclick = () => artEditor(cg);
      $("cgAlbum").onclick = PAGES.album;
    }, true);
  }
  $("dlgChoices").addEventListener("click", (e) => { const b = e.target.closest(".choice"); if (b) { e.stopPropagation(); choose(+b.dataset.c, b); } });
  $("dialog").addEventListener("click", (e) => { if (!e.target.closest(".choice") && dlg && dlg.phase !== "choice") advance(); });

  // ---------- render ----------
  function render() {
    $("pname").textContent = S.name;
    $("level").textContent = S.level;
    $("expBar").style.width = S.exp + "%";
    $("expTxt").textContent = `EXP ${S.exp}%`;
    $("cStars").textContent = fmt(S.stars);
    $("cCoins").textContent = fmt(S.coins);
    $("cHearts").textContent = `${S.hearts} / 100`;
    $("sHealth").textContent = `${S.health} / 100`; $("bHealth").style.width = S.health + "%";
    $("sEnergy").textContent = `${S.energy} / 100`; $("bEnergy").style.width = S.energy + "%";
    $("sMoney").textContent = fmt(S.coins);
    $("sStars").textContent = fmt(S.stars);

    const { q, chapter, n, of } = currentQuest();
    $("chapterName").textContent = chapter;
    $("questName").textContent = questTitle(q);
    $("questProg").textContent = `Step ${n} / ${of}`;
    $("qBar").style.width = ((n - 1) / of) * 100 + "%";
    $("questDot").hidden = !!dlg;

    $("hComfort").textContent = S.comfort + "%";
    $("hDeco").textContent = S.deco + "%";
    const maxed = S.comfort >= 100 && S.deco >= 100;
    $("upCost").textContent = maxed ? "Fully upgraded" : fmt(upgradeCost()) + " coins";
    $("upgrade").disabled = maxed;
    $("collCount").textContent = S.collected;
    $("mailDot").hidden = !S.mail.some((m) => !m.read);
    $("calDot").hidden = S.loginClaimed === today;
    $("albumDot").hidden = !S.memories.some((m) => !(S.seenMem || []).includes(m));
    $("achDot").hidden = !D.achievements.some((a) => S.ach[a.id] >= a.goal && !S.achClaimed[a.id]);
    $("themeName").textContent = theme().name;

    const tasks = [
      { k: "quests", label: "Complete 3 quests", max: 3, reward: ["stars", 60] },
      { k: "items", label: "Collect 5 items", max: 5, reward: ["coins", 1500] },
      { k: "login", label: "Log in for 7 days", max: 7, reward: ["item", "crystal"] },
    ];
    render.tasks = tasks;
    $("tasks").innerHTML = tasks.map(({ k, label, max }) => {
      const v = Math.min(S.tasks[k], max), done = v >= max, got = S.claimed[k];
      const right = done && !got ? `<span class="claim">Claim</span>` : `<span class="n">${v} / ${max}</span>`;
      return `<li class="${done ? "done" : ""}"><button data-task="${k}"><span class="circ">${done ? "✓" : ""}</span><span class="t">${label}</span>${right}</button></li>`;
    }).join("");

    const shown = S.owned.slice(-4);
    $("slots").innerHTML = [0, 1, 2, 3].map((i) => shown[i]
      ? `<div class="slot ${shown[i] === newItem ? "new" : ""}" title="${D.items[shown[i]]}">${itemHTML(shown[i])}</div>`
      : `<div class="slot locked">?</div>`).join("");
    newItem = null;
    save();
  }
  const theme = () => D.themes[Math.floor(Date.now() / 864e5) % D.themes.length];

  // ---------- modal ----------
  const modal = $("modal");
  function openModal(title, html, onMount, wide) {
    $("mTitle").textContent = title; $("mBody").onclick = null; $("mBody").innerHTML = html;
    modal.querySelector(".sheet").classList.toggle("wide", !!wide);
    modal.hidden = false; onMount && onMount($("mBody"));
  }
  function closeModal() { modal.hidden = true; }
  $("mClose").onclick = closeModal;
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if ((e.key === " " || e.key === "Enter") && dlg && modal.hidden && document.activeElement === document.body) { e.preventDefault(); advance(); }
  });
  new MutationObserver(() => {
    if (modal.hidden) document.querySelectorAll(".nav").forEach((n) => n.classList.toggle("active", n.dataset.nav === "home"));
  }).observe(modal, { attributes: true, attributeFilter: ["hidden"] });

  // ---------- wardrobe / dress up ----------
  const FACES = ["neutral", "joy", "content", "shock", "dizzy", "cry"];
  function wardrobe(contest) {
    const th = theme();
    openModal(contest ? "Dress Up Contest" : "Wardrobe", `
      <div class="wardrobe">
        <div class="mirror"><div class="doll" id="mirrorDoll"></div></div>
        <div>
          ${contest ? `<p class="muted">Today's theme is <b>${th.name}</b>. Match the theme for a higher score. Costs 10 energy.</p>` : ""}
          <b>Outfit</b>
          <div class="outfit-cards" style="margin:8px 0 12px">${Object.entries(D.outfits).map(([id, o]) => {
            const open = outfitOpen(id), src = o.slot ? ART.get(o.slot) : `assets/${o.layers[o.layers.length - 1][0]}.webp`;
            return open ? `<button class="ocard ${id === S.outfit ? "on" : ""}" data-o="${id}"><img src="${src}" alt="">${o.name}</button>`
                        : `<button class="ocard locked" data-add="${o.slot}"><span class="emo">＋</span>${o.name}<small>Add art</small></button>`; }).join("")}</div>
          <b>Colour</b>
          <div class="choices">${Object.entries(D.tints).map(([n, h]) =>
            `<button class="chip ${n === S.tint ? "on" : ""}" data-t="${n}"><i class="sw" style="filter:hue-rotate(${h}deg)"></i>${n}</button>`).join("")}</div>
          <b>Expression</b>
          <div class="faces" style="margin:8px 0 14px">${FACES.map((f) =>
            `<button class="${(S.face || "neutral") === f ? "on" : ""}" data-f="${f}" aria-label="${f}"><img src="assets/face-${f}.webp" alt=""></button>`).join("")}</div>
          ${contest ? `<button class="btn" id="showOff">Walk the runway ✦</button>` : `<button class="btn" id="toContest">Enter the Dress Up contest</button>`}
        </div>
      </div>`, (b) => {
      const drawMirror = () => {
        $("mirrorDoll").innerHTML = dollLayers(S.outfit, S.tint);
        $("mirrorDoll").querySelector(".head").src = headSrc();
      };
      drawMirror();
      b.onclick = (e) => {
        const add = e.target.closest("[data-add]"); if (add) return artEditor(add.dataset.add);
        const o = e.target.closest("[data-o]"), t = e.target.closest("[data-t]"), f = e.target.closest("[data-f]");
        if (o) { S.outfit = o.dataset.o; b.querySelectorAll("[data-o]").forEach((x) => x.classList.toggle("on", x === o)); }
        if (t) { S.tint = t.dataset.t; b.querySelectorAll("[data-t]").forEach((x) => x.classList.toggle("on", x === t)); }
        if (f) { S.face = f.dataset.f === "neutral" ? null : f.dataset.f; b.querySelectorAll("[data-f]").forEach((x) => x.classList.toggle("on", x === f)); }
        if (o || t || f) { SFX.pop(); drawDoll(); drawMirror(); render(); }
      };
      if ($("toContest")) $("toContest").onclick = () => wardrobe(true);
      if ($("showOff")) $("showOff").onclick = (e) => {
        if (!useEnergy(10)) return;
        const match = outfitStyle(S.outfit) === th.style;
        const faceBonus = ["joy", "content", "neutral"].includes(S.face || "neutral") ? 5 : -10;
        const score = Math.max(30, Math.min(100, 50 + (match ? 30 : 0) + faceBonus + Math.floor(Math.random() * 20)));
        const btn = e.currentTarget;
        give(["coins", score * 8], btn); gainExp(10);
        if (score >= 90) { S.ach.style = 1; findItem(null, btn); }
        closeModal(); render(); hop(); sparkle($("doll"), 18);
        emote(score >= 85 ? "joy" : score >= 65 ? "content" : "cry", 2400);
        say(score >= 85 ? "The judges loved it! ♡" : score >= 65 ? "Not bad at all!" : "Maybe the theme wanted something else…");
        toast(`Judges' score: ${score} / 100${match ? " · theme match!" : ""}`);
      };
    }, true);
  }

  // ---------- puzzle (uses a place picture) ----------
  function puzzle() {
    if (!useEnergy(10)) return render();
    const pic = locImg(pick(S.visited.length > 1 ? S.visited : ["courtyard", "fountain", "balcony"]));
    let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0], moves = 0, last = -1;
    const nbrs = (i) => [i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter((j) => j >= 0 && j < 9);
    for (let k = 0; k < 60; k++) {
      const z = tiles.indexOf(0), opts = nbrs(z).filter((j) => j !== last), j = pick(opts);
      [tiles[z], tiles[j]] = [tiles[j], tiles[z]]; last = z;
    }
    openModal("Moon Puzzle", `<p class="muted">Slide the pieces to rebuild the picture. Fewer moves, more stars.</p><div class="grid3" id="pz"></div><p class="muted" id="pzMoves" style="text-align:center">Moves: 0</p>`, () => {
      const draw = () => {
        $("pz").innerHTML = tiles.map((t, i) => {
          if (!t) return `<button class="tile blank" disabled aria-label="Empty"></button>`;
          const p = t - 1, x = (p % 3) * 50, y = Math.floor(p / 3) * 50;
          return `<button class="tile" data-i="${i}" aria-label="Piece ${t}" style="background-image:url(${pic});background-position:${x}% ${y}%">${t}</button>`;
        }).join("");
      };
      draw();
      $("pz").onclick = (e) => {
        const btn = e.target.closest(".tile"); if (!btn || btn.disabled) return;
        const i = +btn.dataset.i, z = tiles.indexOf(0);
        if (!nbrs(z).includes(i)) { SFX.wrong(); return; }
        SFX.click();
        [tiles[z], tiles[i]] = [tiles[i], tiles[z]]; moves++;
        $("pzMoves").textContent = `Moves: ${moves}`; draw();
        if (tiles.join() === "1,2,3,4,5,6,7,8,0") {
          const reward = Math.max(20, 160 - moves * 2);
          S.ach.puzzle++;
          give(["stars", reward], $("pz")); gainExp(15); findItem(null, $("pz"));
          sparkle($("pz"), 22);
          setTimeout(() => { closeModal(); render(); hop(); emote("joy"); say("Solved it! ✧"); }, 600);
          toast(`Solved in ${moves} moves!`);
        }
      };
    });
    render();
  }

  // ---------- cooking ----------
  function cooking() {
    if (!useEnergy(10)) return render();
    const all = ["🥚 Egg", "🧈 Butter", "🌾 Flour", "🍬 Sugar", "🍒 Cherry", "🍫 Cocoa", "🫐 Berries", "🥛 Milk"];
    const recipe = all.slice().sort(() => Math.random() - .5).slice(0, 4);
    const shuffled = all.slice().sort(() => Math.random() - .5);
    let step = 0, mistakes = 0;
    openModal("Cooking: Moon Cupcake", `
      <p class="muted">Add the ingredients in this order:</p>
      <p><b>${recipe.join(" → ")}</b></p>
      <div class="choices" id="ing">${shuffled.map((a) => `<button class="chip" data-a="${a}">${a}</button>`).join("")}</div>
      <p class="muted" id="cookMsg">Step 1 of 4</p>`, () => {
      $("ing").onclick = (e) => {
        const c = e.target.closest(".chip"); if (!c || c.disabled) return;
        if (c.dataset.a === recipe[step]) {
          SFX.pop(); c.classList.add("on"); c.disabled = true; step++; sparkle(c, 5);
          $("cookMsg").textContent = step < 4 ? `Step ${step + 1} of 4` : "Done!";
          if (step === 4) {
            const coins = Math.max(200, 900 - mistakes * 150);
            S.ach.cook++;
            give(["coins", coins], c); S.health = Math.min(100, S.health + 8); gainExp(10); findItem(null, c);
            setTimeout(() => { closeModal(); render(); hop(); emote("joy"); say("Yummy! Luna wants one too 🧁"); }, 450);
            toast("Cupcake baked! +8 health");
          }
        } else {
          mistakes++; SFX.wrong(); emote("dizzy");
          $("cookMsg").textContent = "Oops, wrong ingredient. Try again!";
          S.health = Math.max(0, S.health - 2); render();
        }
      };
    });
    render();
  }

  // ---------- pages ----------
  function calendar() {
    const can = S.loginClaimed !== today;
    const icon = (t) => ({ coins: "●", stars: "✦", energy: "⚡", item: "🎀" })[t];
    openModal("Login Rewards", `
      <p class="muted">A gift every day. Today is day ${S.loginDay} of 7.</p>
      <div class="week">${D.loginRewards.map(([t, a], i) => {
        const d = i + 1, got = d < S.loginDay || (d === S.loginDay && !can);
        return `<div class="day ${got ? "got" : ""} ${d === S.loginDay ? "today" : ""}">Day ${d}<b>${icon(t)}</b>${t === "item" ? "Badge" : fmt(a)}</div>`;
      }).join("")}</div>
      <button class="btn" id="claimDay" ${can ? "" : "disabled"}>${can ? "Claim today's gift" : "Claimed. See you tomorrow!"}</button>`, () => {
      $("claimDay").onclick = (e) => {
        give(D.loginRewards[S.loginDay - 1], e.currentTarget); sparkle(e.currentTarget, 14);
        S.loginClaimed = today; render(); setTimeout(calendar, 300);
      };
    });
  }
  function mailbox() {
    openModal("Mailbox", S.mail.map((m) => `
      <div class="lrow"><div><b>${m.from}</b><p>${m.text}</p><small class="muted">Gift: ${rewardLabel(m.reward)}</small></div>
      <button class="btn" data-mail="${m.id}" ${m.read ? "disabled" : ""}>${m.read ? "Claimed" : "Claim"}</button></div>`).join(""), (b) => {
      b.onclick = (e) => {
        const btn = e.target.closest("[data-mail]"); if (!btn || btn.disabled) return;
        const m = S.mail.find((x) => x.id === +btn.dataset.mail);
        m.read = true; give(m.reward, btn); sparkle(btn, 10);
        render(); setTimeout(mailbox, 250);
      };
    });
  }
  function befriend(id, n, el) {
    const before = S.friends[id] || 0;
    S.friends[id] = Math.min(5, before + n);
    S.ach.friends = Math.max(...Object.values(S.friends));
    SFX.reward(); floatAt(el, `+${S.friends[id] - before} ♥`, "#ff9fd0");
    if (S.friends[id] === 5 && before < 5) { toast(`You and ${D.npcs[id].name} are best friends! +100 ✦`); S.stars += 100; }
    render();
  }
  function npcSay(id, line) {
    if (dlg) return;
    showNPC(id); say(`${D.npcs[id].name}: ${line}`);
    clearTimeout(npcSay.t); npcSay.t = setTimeout(() => { if (!dlg) showNPC(null); }, 4000);
  }

  // ---------- Add Art ----------
  function artList() {
    const groups = [...new Set(ART.SLOTS.map((s) => s.group))];
    const done = ART.SLOTS.filter((s) => ART.has(s.id)).length;
    openModal("Add Art", `<p class="muted">Make pictures with the prompts in your <b>Moonlit Manor Art Prompts</b> doc, then add each one to its slot. ${done} of ${ART.SLOTS.length} slots filled.${ART.stored() ? "" : " <b>This browser can't save pictures, so they'll be gone after a reload.</b>"}</p>
      ${groups.map((g) => `<h4 class="ghead">${g}</h4>${ART.SLOTS.filter((s) => s.group === g).map((s) => {
        const u = ART.get(s.id);
        return `<div class="art-row"><div class="thumb checker">${u ? `<img src="${u}" alt="">` : "＋"}</div><div class="ainfo"><b>${s.name}</b><code>${s.id}</code></div>
          <button class="btn ${u ? "ghost" : ""}" data-slot="${s.id}">${u ? "Change" : "Add"}</button></div>`;
      }).join("")}`).join("")}`, (b) => { b.onclick = (e) => { const x = e.target.closest("[data-slot]"); if (x) artEditor(x.dataset.slot); }; }, true);
  }
  function artEditor(id) {
    const slot = ART.slot(id), isOutfit = slot.group === "Outfits", outfitId = isOutfit && Object.keys(D.outfits).find((k) => D.outfits[k].slot === id);
    const wide = slot.group === "Story scenes" || slot.group === "Places";
    let blob = null, preview = ART.get(id), file = null;
    const m = Object.assign({}, isOutfit ? D.outfitDefaults : {}, ART.meta(id));
    if (isOutfit && !m.style) m.style = D.outfits[outfitId].style;
    openModal(`Add Art: ${slot.name}`, `
      <p class="muted">Slot <code>${id}</code>. ${wide ? "Use a wide 16:9 picture." : "Use a picture of one subject on a plain white background."}</p>
      <div class="choices"><label class="btn" for="artFile">Choose picture</label><input id="artFile" type="file" accept="image/*" class="vh">
        <label class="check"><input type="checkbox" id="artCut" ${slot.cut ? "checked" : ""}> Remove white background</label></div>
      <p class="muted" id="artMsg">${preview ? "Current picture shown below." : "No picture yet."}</p>
      <div class="art-preview ${wide ? "wide" : ""}">
        ${isOutfit ? `<div class="mirror"><div class="doll" id="artDoll"></div></div>
          <div class="fit"><b>Fit the outfit under Asteria's head</b>
            <label>Size <input type="range" id="fw" min="50" max="130" step="1" value="${m.w}"></label>
            <label>Left / right <input type="range" id="fl" min="-25" max="40" step="0.5" value="${m.l}"></label>
            <label>Up / down <input type="range" id="ft" min="10" max="40" step="0.25" value="${m.t}"></label>
            <label>Contest style <select id="fs">${["elegant", "cute", "cosy"].map((s) => `<option ${s === m.style ? "selected" : ""}>${s}</option>`).join("")}</select></label></div>`
        : `<div class="checker big" id="artImg">${preview ? `<img src="${preview}" alt="">` : ""}</div>`}
      </div>
      <div class="choices"><button class="btn" id="artSave">Save</button>${ART.has(id) ? `<button class="btn ghost" id="artDel">Remove picture</button>` : ""}<button class="btn ghost" id="artBack">Back to slots</button></div>`, () => {
      const draw = () => {
        if (isOutfit) $("artDoll").innerHTML = preview ? dollLayers(outfitId, "Original", { src: preview, meta: m }) : `<div class="npc-ph"><b>Choose a picture</b></div>`;
        else $("artImg").innerHTML = preview ? `<img src="${preview}" alt="">` : "";
      };
      draw();
      const run = async () => {
        if (!file) return;
        $("artMsg").textContent = "Cutting out the picture… this takes a few seconds.";
        try { blob = await ART.process(file, $("artCut").checked, wide ? 1600 : 1000); preview = URL.createObjectURL(blob); $("artMsg").textContent = "Looks good? Press Save."; draw(); }
        catch (err) { $("artMsg").textContent = err.message; }
      };
      $("artFile").onchange = (e) => { file = e.target.files[0]; run(); };
      $("artCut").onchange = run;
      if (isOutfit) ["fw", "fl", "ft"].forEach((k) => ($(k).oninput = (e) => { m[{ fw: "w", fl: "l", ft: "t" }[k]] = +e.target.value; draw(); }));
      if (isOutfit) $("fs").onchange = (e) => (m.style = e.target.value);
      $("artSave").onclick = async () => {
        if (!blob && !ART.has(id)) return ($("artMsg").textContent = "Choose a picture first.");
        if (blob) await ART.put(id, blob, m); else await ART.setMeta(id, m);
        SFX.reward(); toast(`${slot.name} saved`);
        drawDoll(); showPlace(S.location); render(); artList();
      };
      if ($("artDel")) $("artDel").onclick = async () => {
        await ART.remove(id);
        if (isOutfit && S.outfit === outfitId && !ART.has(id)) S.outfit = "gothic";
        toast(`${slot.name} removed`); drawDoll(); showPlace(S.location); render(); artList();
      };
      $("artBack").onclick = artList;
    }, true);
  }

  const PAGES = {
    map: () => openModal("Map", `<p class="muted">Travel anywhere. Exploring a place for the first time each day finds coins, and sometimes a treasure.</p>
      <div class="map-grid">${D.locations.map((l) => `<button class="mcard ${l.id === S.location ? "here" : ""}" data-l="${l.id}">
        <img src="${locImg(l.id)}" alt="" loading="lazy"><span>${l.name}</span>
        ${!placeOpen(l) ? `<i class="tag lock">Unlocks in Chapter ${l.unlock + 1}</i>` : l.id === S.location ? `<i class="tag">You're here</i>` : S.explored[l.id] !== today ? `<i class="tag">Explore</i>` : ""}</button>`).join("")}</div>`, (b) => {
      b.onclick = (e) => { const c = e.target.closest("[data-l]"); if (!c) return;
        const L = loc(c.dataset.l); if (!placeOpen(L)) { SFX.wrong(); return toast(`Keep playing the story to unlock ${L.name}.`); }
        SFX.click(); closeModal(); travel(c.dataset.l); };
    }, true),
    quest: () => {
      const { q, chapter, n, of } = currentQuest();
      openModal("Quests", `<p><b>${chapter}</b> · step ${n} of ${of}</p>
        <div class="lrow"><div><b>${questTitle(q)}</b><p>Takes place at ${loc(q.at).name}. Uses 5 energy. Your choices change the reward.</p></div></div>
        <p class="muted">Quest steps completed: ${S.ach.quests}</p>
        <button class="btn" id="qGo">Play quest</button>`, () => { $("qGo").onclick = () => playQuest(); });
    },
    inventory: () => openModal("Inventory", `<p class="muted">${S.owned.length} of ${Object.keys(D.items).length} special treasures found · ${S.collected} / 200 collection</p>
      <div class="inv-grid">${Object.keys(D.items).map((id) => S.owned.includes(id)
        ? `<figure><div class="slot">${itemHTML(id)}</div>${D.items[id]}</figure>`
        : `<figure><div class="slot locked">?</div>???</figure>`).join("")}</div>`),
    wardrobe: () => wardrobe(false),
    shop: () => openModal("Shop", `
      ${[["energy", "⚡ +30 energy", "2,000 coins"], ["health", "♥ +20 health", "1,500 coins"], ["hearts", "💗 +10 hearts", "100 stars"], ["deco", "🕯️ Candle set (+5% decoration)", "2,500 coins"], ["stars", "✦ 100 stars", "8,000 coins"], ["mystery", "🎁 Mystery treasure", "300 stars"]]
        .map(([k, n, p]) => `<div class="lrow"><b>${n}</b><button class="btn" data-buy="${k}">${p}</button></div>`).join("")}`, (b) => {
      b.onclick = (e) => {
        const el = e.target.closest("[data-buy]"); const k = el?.dataset.buy; if (!k) return;
        const pay = (cur, n) => { if (S[cur] < n) { SFX.wrong(); toast(`Not enough ${cur}`); return false; } S[cur] -= n; return true; };
        if (k === "energy" && pay("coins", 2000)) give(["energy", 30], el);
        else if (k === "health" && pay("coins", 1500)) { S.health = Math.min(100, S.health + 20); floatAt(el, "+20 health"); SFX.reward(); }
        else if (k === "hearts" && pay("stars", 100)) { S.hearts = Math.min(100, S.hearts + 10); floatAt(el, "+10 ♥"); SFX.reward(); }
        else if (k === "deco" && pay("coins", 2500)) { S.deco = Math.min(100, S.deco + 5); floatAt(el, "+5% decoration"); SFX.reward(); }
        else if (k === "stars" && pay("coins", 8000)) give(["stars", 100], el);
        else if (k === "mystery" && pay("stars", 300)) findItem(undefined, el);
        else return;
        render();
      };
    }),
    friends: () => openModal("Friends", `<p class="muted">Talk once a day, or bring a gift (${fmt(D.giftCost)} coins), to grow your friendship. Their favourite treasure doubles a gift.</p>
      ${Object.entries(D.npcs).map(([id, n]) => {
        const h = S.friends[id] || 0, talked = S.talked[id] === today;
        const about = id === "rosalind" && S.story.ch >= 2 ? "The gardener, and secretly the masked guest!" : id === "masked" && S.story.ch >= 2 ? "It was Rosalind all along." : n.about;
        return `<div class="friend"><div class="fpic">${npcHTML(id)}</div><div class="finfo"><b>${n.name}</b><p>${about}</p>
          <div class="hearts" aria-label="${h} of 5 hearts">${"♥".repeat(h)}<span>${"♥".repeat(5 - h)}</span></div>
          <small class="muted">Loves: ${D.items[n.likes]}</small>
          <div class="choices"><button class="btn ghost" data-talk="${id}" ${talked ? "disabled" : ""}>${talked ? "Talked today" : "Talk"}</button><button class="btn" data-gift="${id}" ${h >= 5 ? "disabled" : ""}>${h >= 5 ? "Best friends ♡" : "Give gift"}</button></div></div></div>`;
      }).join("")}`, (b) => {
      b.onclick = (e) => {
        const t = e.target.closest("[data-talk]"), g = e.target.closest("[data-gift]");
        if (t && !t.disabled) { const id = t.dataset.talk; S.talked[id] = today; befriend(id, 1, t); closeModal(); npcSay(id, pick(D.npcs[id].lines)); }
        if (g && !g.disabled) {
          if (S.coins < D.giftCost) { SFX.wrong(); return toast("Not enough coins"); }
          const id = g.dataset.gift; S.coins -= D.giftCost;
          befriend(id, S.owned.includes(D.npcs[id].likes) ? 2 : 1, g); setTimeout(PAGES.friends, 300);
        }
      };
    }, true),
    album: () => {
      S.seenMem = S.memories.slice(); render();
      openModal("Memories", `<p class="muted">Pictures from big story moments. ${S.memories.length} of ${Object.keys(D.memories).length} unlocked.</p>
      <div class="album">${Object.entries(D.memories).map(([id, t]) => {
        if (!S.memories.includes(id)) return `<figure class="mem locked"><div>?</div><figcaption>???</figcaption></figure>`;
        const u = ART.get(id);
        return `<figure class="mem"><button data-m="${id}" aria-label="${esc(t)}">${u ? `<img src="${u}" alt="">` : `<span>Picture not added</span>`}</button><figcaption>${esc(t)}</figcaption></figure>`;
      }).join("")}</div>`, (b) => { b.onclick = (e) => { const m = e.target.closest("[data-m]"); if (m) showMemory(m.dataset.m); }; }, true);
    },
    art: () => artList(),
    achievements: () => openModal("Achievements", D.achievements.map((a) => {
      const v = Math.min(S.ach[a.id] || 0, a.goal), done = v >= a.goal, got = S.achClaimed[a.id];
      return `<div class="lrow"><div><b>${a.name}</b><p>${a.desc} · reward ${rewardLabel(a.reward)}</p><div class="bar violet"><i style="width:${(v / a.goal) * 100}%"></i></div></div>
        <button class="btn ${done && !got ? "" : "ghost"}" data-a="${a.id}" ${done && !got ? "" : "disabled"}>${got ? "Done ✓" : done ? "Claim" : `${v} / ${a.goal}`}</button></div>`;
    }).join(""), (b) => {
      b.onclick = (e) => {
        const btn = e.target.closest("[data-a]"); if (!btn || btn.disabled) return;
        const a = D.achievements.find((x) => x.id === btn.dataset.a);
        S.achClaimed[a.id] = true; give(a.reward, btn); sparkle(btn, 14); render(); setTimeout(PAGES.achievements, 250);
      };
    }),
    settings: () => openModal("Settings", `
      <div class="setting"><label for="nameIn"><b>Player name</b></label><input id="nameIn" type="text" maxlength="14" value="${S.name.replace(/"/g, "&quot;")}"></div>
      <div class="setting"><span><b>Music</b><p class="muted" style="margin:2px 0 0;font-size:.85rem">The soundtrack from the castle video</p></span><button class="switch" id="swMusic" role="switch" aria-checked="${S.settings.music}" aria-label="Music"></button></div>
      <div class="setting"><b>Sound effects</b><button class="switch" id="swSfx" role="switch" aria-checked="${S.settings.sfx}" aria-label="Sound effects"></button></div>
      <div class="setting"><label for="volIn"><b>Volume</b></label><input id="volIn" type="range" min="0" max="1" step="0.05" value="${S.settings.vol}"></div>
      <div class="setting"><span><b>Add Art</b><p class="muted" style="margin:2px 0 0;font-size:.85rem">Put your own pictures into the game's ${ART.SLOTS.length} art slots.</p></span><button class="btn" id="toArt">Open</button></div>
      <div class="setting"><span><b>Reset progress</b><p class="muted" style="margin:2px 0 0;font-size:.85rem">Progress saves automatically in this browser.</p></span><button class="btn ghost" id="reset">Reset</button></div>`, () => {
      $("toArt").onclick = artList;
      $("nameIn").oninput = (e) => { S.name = e.target.value.trim() || "Asteria"; render(); };
      $("swMusic").onclick = (e) => { S.settings.music = !S.settings.music; e.currentTarget.setAttribute("aria-checked", S.settings.music); applyAudio(); save(); };
      $("swSfx").onclick = (e) => { S.settings.sfx = !S.settings.sfx; SFX.enabled = S.settings.sfx; e.currentTarget.setAttribute("aria-checked", S.settings.sfx); SFX.click(); save(); };
      $("volIn").oninput = (e) => { S.settings.vol = +e.target.value; applyAudio(); save(); };
      let armed = false;
      $("reset").onclick = () => {
        if (!armed) { armed = true; $("reset").textContent = "Tap again to confirm"; return; }
        S = fresh(); closeModal(); travel("castle", true); drawDoll(); applyAudio(); render(); toast("Progress reset");
      };
    }),
  };

  function applyAudio() {
    const v = $("bgVideo");
    SFX.volume = S.settings.vol;
    v.volume = Math.min(1, S.settings.vol * 1.4);
    v.muted = !S.settings.music;
    if (S.settings.music) v.play().catch(() => {});
  }

  // ---------- wiring ----------
  document.querySelector(".side").addEventListener("click", (e) => {
    const b = e.target.closest(".nav"); if (!b) return;
    SFX.click();
    document.querySelectorAll(".nav").forEach((n) => n.classList.toggle("active", n === b));
    $("side").classList.remove("open"); $("menuBtn").setAttribute("aria-expanded", "false");
    if (b.dataset.nav === "home") { closeModal(); if (S.location !== "castle") travel("castle"); return; }
    PAGES[b.dataset.nav]();
  });
  $("menuBtn").onclick = () => {
    const open = $("side").classList.toggle("open");
    $("menuBtn").setAttribute("aria-expanded", open);
  };
  $("continue").onclick = playQuest;
  $("questGo").onclick = playQuest;
  $("tasks").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-task]"); if (!btn) return;
    const t = render.tasks.find((x) => x.k === btn.dataset.task);
    if (S.tasks[t.k] >= t.max && !S.claimed[t.k]) { S.claimed[t.k] = true; give(t.reward, btn); sparkle(btn, 10); render(); return; }
    if (t.k === "quests") playQuest();
    if (t.k === "items") PAGES.map();
    if (t.k === "login") calendar();
  });
  $("eventCard").onclick = () => {
    const done = S.ballDay === today;
    openModal("Royal Fashion Ball", `<img src="assets/event-ball.webp" alt="" style="width:100%;border-radius:12px;margin-bottom:10px">
      <p>The ball opens in <b id="evCount"></b>. Today's theme is <b>${theme().name}</b>.</p>
      <p class="muted">Attend today's rehearsal in the Grand Ballroom (15 energy), or practise in the Dress Up contest.</p>
      <div class="choices"><button class="btn" id="attend" ${done ? "disabled" : ""}>${done ? "Rehearsed today ✓" : "Attend rehearsal ✦"}</button><button class="btn ghost" id="evDress">Dress Up contest</button></div>`, () => {
      $("evCount").textContent = $("countdown").textContent;
      $("evDress").onclick = () => wardrobe(true);
      $("attend").onclick = (e) => {
        if (!useEnergy(15)) return;
        S.ballDay = today; give(["stars", 200], e.currentTarget); gainExp(20); findItem(null, e.currentTarget);
        closeModal(); travel("ballroom", true); render(); hop(); emote("joy", 2400); sparkle($("doll"), 18); say("What a magical night! ♡");
      };
    });
  };
  document.querySelectorAll("[data-game]").forEach((b) => {
    b.onclick = () => { SFX.click(); ({ dress: () => wardrobe(true), puzzle, cook: cooking })[b.dataset.game](); };
  });
  document.querySelectorAll("[data-shop]").forEach((b) => (b.onclick = PAGES.shop));
  $("collection").onclick = PAGES.inventory;
  $("houseArt").onclick = () => travel("bedroom");
  $("upgrade").onclick = (e) => {
    const cost = upgradeCost();
    if (S.coins < cost) { SFX.wrong(); return toast("Not enough coins"); }
    S.coins -= cost; S.upgrades++;
    S.comfort = Math.min(100, S.comfort + 5); S.deco = Math.min(100, S.deco + 6);
    SFX.reward(); floatAt(e.currentTarget, "Upgraded!"); sparkle($("houseArt"), 14); gainExp(5);
    render();
  };
  $("doll").onclick = (e) => {
    if (dlg) return advance();
    SFX.pop(); hop();
    emote(pick(["joy", "content", "joy", "shock"]));
    say(pick(D.idleLines));
    if (S.hearts < 100) { S.hearts++; floatAt(e.currentTarget, "+1 ♥", "#ff9fd0"); }
    render();
  };
  $("calBtn").onclick = calendar;
  $("mailBtn").onclick = mailbox;
  $("setBtn").onclick = PAGES.settings;
  $("fullBtn").onclick = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => toast("Fullscreen isn't available here"));
    } catch (e) { toast("Fullscreen isn't available here"); }
  };
  // browsers only allow sound after a first tap
  document.addEventListener("pointerdown", () => { SFX.unlock(); if (S.settings.music) applyAudio(); }, { once: true });

  // ---------- timers ----------
  function tick() {
    let ms = S.eventEnd - Date.now();
    if (ms <= 0) { S.eventEnd = Date.now() + 3 * 864e5; ms = S.eventEnd - Date.now(); }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    $("countdown").textContent = `${d}d ${h}h ${m}m ${String(s).padStart(2, "0")}s`;
    const mid = new Date(); mid.setHours(24, 0, 0, 0);
    const left = mid - Date.now();
    $("resetIn").textContent = `Resets in ${Math.floor(left / 36e5)}h ${Math.floor(left / 6e4) % 60}m`;
  }
  setInterval(tick, 1000); tick();
  setInterval(() => { if (S.energy < 100) { S.energy++; render(); } }, 30000);
  setInterval(() => { if (modal.hidden && !dlg && Math.random() < .5) say(pick(D.idleLines)); }, 22000);

  // ---------- falling petals ----------
  const pv = $("petals"), pctx = pv.getContext("2d");
  let petals = [];
  const newPetal = (anywhere) => {
    const dpr = devicePixelRatio || 1;
    return { x: Math.random() * pv.width, y: anywhere ? Math.random() * pv.height : -20, s: (3 + Math.random() * 5) * dpr,
      vy: (.3 + Math.random() * .6) * dpr, vx: (.2 + Math.random() * .5) * dpr, a: Math.random() * 6, va: (Math.random() - .5) * .04,
      c: Math.random() < .5 ? "#e8b4f2" : "#f6c7e2" };
  };
  function resize() {
    const dpr = devicePixelRatio || 1;
    pv.width = innerWidth * dpr; pv.height = innerHeight * dpr;
    petals = Array.from({ length: Math.min(36, Math.floor(innerWidth / 40)) }, () => newPetal(true));
  }
  function frame(t) {
    pctx.clearRect(0, 0, pv.width, pv.height);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.y += p.vy; p.x += p.vx + Math.sin(t / 900 + i) * .3; p.a += p.va;
      if (p.y > pv.height + 20 || p.x > pv.width + 20) petals[i] = newPetal(false);
      pctx.save(); pctx.translate(p.x, p.y); pctx.rotate(p.a); pctx.globalAlpha = .75; pctx.fillStyle = p.c;
      pctx.beginPath(); pctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 7); pctx.fill(); pctx.restore();
    }
    requestAnimationFrame(frame);
  }
  addEventListener("resize", resize); resize();
  if (!still) requestAnimationFrame(frame);

  // ---------- start ----------
  drawDoll(); showPlace(S.location); applyAudio(); render();
  ART.init().then(() => { drawDoll(); showPlace(S.location); render(); });
  setTimeout(() => notify("New event!", "Check it out~!", () => $("eventCard").click()), 1200);
  if (S.mail.some((m) => !m.read)) setTimeout(() => notify("You've got mail", "Gifts are waiting ✉", mailbox, "✉"), 2600);
})();
