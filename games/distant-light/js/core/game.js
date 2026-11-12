/* The day loop and start-up.
   Each day runs: morning (scripted) → lunch (planner or scripted) → after school
   (planner or scripted) → evening (phone) → night (diary, autosave). */
DL.Game = (() => {
  const { $, wait } = DL.util;
  const PHASES = ['morning', 'lunch', 'after', 'evening', 'night'];
  let gen = 0;           // bumps when the player quits to title, so old story threads stop
  let inGame = false;

  const Abort = DL.Engine.Abort;
  const check = (g) => { if (g !== gen) throw new Abort(); };
  DL.Engine.setAlive((ctx) => !ctx || ctx.gen === gen);

  function snapshot(s) {
    return { grades: s.grades, money: s.money, energy: s.energy, trust: s.trust, favor: s.favor, susp: s.susp, frags: s.frags.length };
  }

  function worldLevel(d) {
    const s = DL.State.s;
    const c = DL.State.corruption();
    DL.FX.applyLevel(c);
    if (d === 7) DL.FX.tint('pink');
    else if (d === 8 && !s.flags.hikaruBack) DL.FX.tint('pink');
    else DL.FX.tint(null);
    DL.Audio.setMood(d >= 9 ? 'drone' : d >= 6 ? 'uneasy' : 'calm');
  }

  async function playLocation(id, ctx) {
    const s = DL.State.s;
    const L = DL.Data.LOCATIONS.find((l) => l.id === id);
    DL.State.add(L.gain || {}, { quiet: true });
    const pool = (DL.Events && DL.Events[id]) || [];
    const ok = (e) => !e.cond || e.cond(s);
    let ev = pool.find((e) => !e.repeat && !s.seen[e.id] && ok(e));
    if (!ev) ev = pool.find((e) => e.repeat && ok(e));
    if (!ev) return;
    if (!ev.repeat) s.seen[ev.id] = s.day;
    await DL.Engine.exec(ev.scene, ctx);
    // (The arcade minigames are no longer offered after places; they live in the title-screen Arcade.)
  }

  async function runPhase(d, ph, ctx, x) {
    const s = DL.State.s;
    const scripted = x ? `x_${x}_${ph}` : `d${d}_${ph}`;
    DL.Stage.hideAll();
    DL.Dialogue.hide();
    if (ph === 'night') {
      DL.Stage.hideAll();
      await DL.Stage.setBg('bedroom_night', { clean: d < 7 });
      await DL.Screens.diary();
      DL.State.add({ energy: 55 }, { quiet: true });
      return;
    }
    if (DL.Engine.has(scripted)) { await DL.Engine.run(scripted, ctx); return; }
    if (ph === 'lunch' || ph === 'after') {
      const town = x && DL.Data.XDAYS && DL.Data.XDAYS[x] && DL.Data.XDAYS[x].town;
      await DL.Stage.setBg(town ? 'street' : ph === 'lunch' ? 'hallway' : 'classroom_dusk', { fade: 400, clean: !!town });
      const loc = await DL.Screens.planner(town ? 'town' : ph);
      if (town) s.flags[`v_${loc}_${x}`] = true;
      await playLocation(loc, ctx);
      return;
    }
    if (ph === 'evening') await DL.Engine.run('evening_quiet', ctx);
  }

  async function play(day, phase) {
    const g = gen;
    const ctx = { gen: g };
    inGame = true;
    const s = DL.State.s;
    let pi = Math.max(0, PHASES.indexOf(phase));
    // The list of days to play. Normally Day 1-9; the extended week adds extra days (see js/story/extended.js).
    const slots = DL.Data.slots ? DL.Data.slots(s) : Array.from({ length: DL.Data.LAST_DAY }, (_, i) => ({ d: i + 1 }));
    let si = slots.findIndex((sl) => sl.d === day && (sl.x || null) === (s.xday || null));
    if (si < 0) si = Math.max(0, slots.findIndex((sl) => sl.d === day && !sl.x));
    for (; si < slots.length; si++) {
      const d = slots[si].d, x = slots[si].x || null;
      s.day = d; s.xday = x;
      for (; pi < PHASES.length; pi++) {
        check(g);
        const ph = PHASES[pi];
        s.phase = ph;
        if (ph === 'morning') { s.diary = []; s.dayStart = snapshot(s); }
        DL.State.checkpoint(d, ph);
        DL.Screens.hud(true);
        worldLevel(d);
        await runPhase(d, ph, ctx, x);
        check(g);
        if (s.flags.ending) { await finish(s.flags.ending); return; }
      }
      pi = 0;
    }
  }

  async function finish(id) {
    const s = DL.State.s;
    const E = DL.Data.ENDINGS[id];
    inGame = false;
    s.flags.ended = true;
    DL.FX.reset();
    DL.Stage.hideAll();
    DL.Dialogue.hide();
    DL.Screens.hud(false);
    const meta = DL.State.meta;
    if (!meta.endings.includes(id)) meta.endings.push(id);
    if (E.gameover) {
      // A game over keeps your save, so you can try that part again.
      DL.State.saveMeta();
      DL.Audio.setMood('drone');
      const a = await DL.Screens.ending(id);
      if (a === 'retry') {
        const saved = DL.State.load();
        if (saved) { resetScene(); await play(saved.day, saved.phase); }
      }
      return;
    }
    meta.last = id;
    meta.lastName = s.name;
    DL.State.saveMeta();
    DL.State.clearSave();
    DL.Audio.setMood(id === 'good' ? 'sweet' : (id === 'bad' || DL.Data.ENDINGS[id].dark) ? 'drone' : 'uneasy');
    await DL.Screens.ending(id);
    if (id !== 'neutral') await DL.Screens.credits();
  }

  function resetScene() {
    DL.Screens.clearAll();
    DL.Dialogue.reset();
    DL.Stage.hideAll();
    DL.Stage.clearBg();
    DL.FX.reset();
    DL.Screens.hud(false);
  }

  async function titleLoop() {
    const g = gen;
    while (g === gen) {
      resetScene();
      inGame = false;
      const a = await DL.Screens.title();
      if (g !== gen) return;
      try {
        if (a === 'new') {
          await DL.Stage.setBg('gate', { clean: true, kenburns: true, fade: 300 });
          const name = await DL.Screens.nameEntry();
          if (!name) continue;
          const pick = await DL.Screens.storyPick();
          if (!pick) continue;
          DL.State.newGame(name);
          DL.State.s.mode = pick.mode;
          DL.State.s.extended = !!pick.extended;
          if (pick.extended) DL.State.s.xday = 'sun0';
          DL.State.meta.plays++;
          DL.State.saveMeta();
          await play(1, 'morning');
        } else if (a === 'continue') {
          if (DL.State.meta.last === 'bad' && !DL.State.hasSave()) {
            DL.State.newGame(DL.State.meta.lastName || 'you');
            DL.State.s.day = 9;
            await DL.Engine.run('title_stay', { gen });
            continue;
          }
          const s = DL.State.load();
          if (!s) continue;
          await play(s.day, s.phase);
        }
      } catch (e) {
        if (!(e instanceof Abort)) { console.error(e); DL.Screens.toast('Something broke: ' + e.message, 'sys', 6000); await wait(1500); }
        else return;
      }
    }
  }

  async function toTitle() {
    const ok = await DL.Screens.confirm('Return to title?', 'Your game was saved at the start of this part of the day. Anything since then will be replayed.', 'Return', 'Keep playing');
    if (!ok) return;
    gen++;
    inGame = false;
    titleLoop();
  }

  function bindQuick() {
    $('#quick').addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      e.stopPropagation();
      DL.Audio.sfx('blip');
      const q = b.dataset.q;
      if (q === 'phone') await DL.Apps.open();
      if (q === 'log') await DL.Screens.backlog();
      if (q === 'auto') DL.Dialogue.setAuto(!DL.Dialogue.auto);
      if (q === 'skip') DL.Dialogue.setSkip(!DL.Dialogue.skip);
      if (q === 'settings') { const r = await DL.Screens.settings(); if (r === 'wiped') { gen++; titleLoop(); } }
      if (q === 'title') toTitle();
    });
  }

  async function boot() {
    DL.Stage.fit();
    DL.Dialogue.bind();
    bindQuick();
    window.addEventListener('pagehide', () => {
      if (inGame && DL.State.corruption() >= 2) { DL.State.meta.leftMidway = true; DL.State.saveMeta(); }
    });
    ['gate', 'classroom'].forEach((id) => DL.Stage.preload(DL.Stage.src(id)));
    await DL.State.syncCloud();
    if (!DL.State.meta.warned) await DL.Screens.warning();
    titleLoop();
  }

  // Expose a few things for testing
  return { boot, play, playLocation, finish, get gen() { return gen; }, PHASES };
})();

window.addEventListener('DOMContentLoaded', () => DL.Game.boot());
if (document.readyState !== 'loading') DL.Game.boot();
