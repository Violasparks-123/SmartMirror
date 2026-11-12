/* The story runner. Scenes are lists of small commands (see js/story/dsl.js).
   This file walks through them one at a time: show a background, say a line,
   offer a choice, change a stat, jump to another scene, and so on. */
DL.Engine = (() => {
  const { wait, pick } = DL.util;
  const scenes = {};

  function register(id, list) {
    if (scenes[id]) console.warn('[story] scene defined twice:', id);
    scenes[id] = list;
  }
  const has = (id) => !!scenes[id];

  async function run(id, ctx) {
    let cur = id;
    while (cur) {
      const list = scenes[cur];
      if (!list) throw new Error('Missing scene: ' + cur);
      const r = await exec(list, ctx);
      if (r && r.goto) { cur = r.goto; continue; }
      return r;
    }
    return null;
  }

  /* Run a raw list of commands (used for location events defined inline). */
  /* ctx carries the story thread's id; when the player quits to title the game
     marks old threads dead and they stop at their next step. */
  let isAlive = () => true;
  async function exec(list, ctx) {
    for (const c of list || []) {
      if (!isAlive(ctx)) throw new DL.Engine.Abort();
      const r = await step(c, ctx);
      if (!isAlive(ctx)) throw new DL.Engine.Abort();
      if (r && (r.goto || r.end)) return r;
    }
    return null;
  }

  function labelFor(who, s) {
    const C = DL.Data.CHAR[who] || {};
    return typeof C.name === 'function' ? C.name(s) : (C.name || '');
  }

  function applyAdd(obj, o = {}) {
    const s = DL.State.s;
    const d = DL.State.add(obj);
    if (o.quiet) return;
    const T = DL.Screens.toast;
    const erased = !DL.State.hikaruHere();
    if (d.trust > 0) T(erased ? 'Someone far away will remember that.' : 'Hikaru will remember that.', 'blue');
    if (d.trust < 0) T('Hikaru pulled away a little.', 'blue');
    if (d.favor > 0) T('Haruka liked that.', 'pink');
    if (d.favor < 0) T('Haruka didn’t like that.', 'pink');
    if ((s.flags.readNotebook || s.flags.suspKnown) && d.susp > 0) T('Haruka’s suspicion grew.', 'sys');
    if ((s.flags.readNotebook || s.flags.suspKnown) && d.susp < 0) T('Haruka doubts herself a little.', 'lav');
    if (d.money > 0) T('+' + DL.util.yen(d.money), 'lav');
  }

  async function fx(kind, o = {}) {
    switch (kind) {
      case 'flash': await DL.FX.flash(o.color, o.ms); break;
      case 'shake': await DL.FX.shake(o.ms, o.mag); break;
      case 'tear': await DL.FX.tear(o.ms, o.strength); break;
      case 'flicker': await DL.Stage.flicker(o.variant || 'g2', o.ms || 120); break;
      case 'noise': DL.FX.noise(o.level || 0); break;
      case 'scan': DL.FX.scan(o.on); break;
      case 'vignette': DL.FX.vignette(o.kind); break;
      case 'fade': await DL.FX.fade(o.color || '#000', o.to ?? 1, o.ms || 600); break;
      case 'tint': DL.FX.tint(o.kind || null); break;
      case 'level': DL.FX.applyLevel(o.level, o); break;
      default: break;
    }
  }

  async function choiceLike(c, chooser, ctx) {
    const s = DL.State.s;
    const visible = c.opts.filter((o) => !o.if || o.if(s));
    const mapped = visible.map((o) => {
      const why = o.lock ? o.lock(s) : null;
      return { text: o.text, send: o.send, locked: !!why, why, hover: o.hover };
    });
    const i = await chooser(mapped);
    return exec(visible[i].body, ctx);
  }

  async function step(c, ctx) {
    const s = DL.State.s;
    switch (c.t) {
      case 'bg': await DL.Stage.setBg(c.id, c.o); break;
      case 'show': DL.Stage.show(c.who, c.expr, c.pos, c.o); if (c.o.wait) await wait(c.o.wait); break;
      case 'hide': await DL.Stage.hide(c.who, c.o); break;
      case 'hideAll': DL.Stage.hideAll(); break;
      case 'say': {
        if (DL.Phone.active) { await DL.Phone.note(c.text); break; }
        if (c.expr && c.who && DL.Stage.has(c.who)) DL.Stage.show(c.who, c.expr);
        const C = DL.Data.CHAR[c.who] || {};
        await DL.Dialogue.say({
          who: c.who,
          label: c.o.label ?? (c.who ? labelFor(c.who, s) : ''),
          plate: c.o.plate ?? C.plate ?? '',
          text: c.text,
          rewrite: c.o.rewrite,
          glitchName: c.o.glitchName,
        });
        break;
      }
      case 'choice': return choiceLike(c, (opts) => DL.Dialogue.choose(opts, c.prompt), ctx);
      case 'reply': return choiceLike(c, (opts) => DL.Phone.reply(opts), ctx);
      case 'add': applyAdd(c.obj, c.o); break;
      case 'flag': s.flags[c.name] = c.v; break;
      case 'if': return exec(c.cond(s) ? c.then : c.els, ctx);
      case 'goto': return { goto: c.id };
      case 'call': {
        if (!scenes[c.id]) throw new Error('Missing scene: ' + c.id);
        return exec(scenes[c.id], ctx);
      }
      case 'end': return { end: true };
      case 'wait': await wait(DL.Dialogue.skip ? Math.min(c.ms, 80) : c.ms); break;
      case 'sfx': DL.Audio.sfx(c.name); break;
      case 'music': DL.Audio.setMood(c.mood); break;
      case 'fx': await fx(c.kind, c.o); break;
      case 'diary': s.diary.push(typeof c.text === 'function' ? c.text(s) : c.text); break;
      case 'item': {
        s.items[c.id] = Math.max(0, (s.items[c.id] || 0) + c.n);
        break;
      }
      case 'shop': DL.Dialogue.hide(); await DL.Screens.shop(); break;
      case 'phone': await DL.Phone.open(c.title, c.o); break;
      case 'msg': await DL.Phone.msg(c.from, c.text, c.o); break;
      case 'phoneClose': await DL.Phone.close(); break;
      case 'oneOf': return exec(pick(c.lists), ctx);
      case 'js': {
        const r = await c.fn(s);
        if (r && (r.goto || r.end)) return r;
        break;
      }
      case 'hideText': DL.Dialogue.hide(); break;
      case 'card': DL.Dialogue.hide(); await DL.Screens.dayCard(s.day, c.sub, c.o); break;
      case 'ending': s.flags.ending = c.id; return { end: true };
      default: console.warn('[story] unknown command', c);
    }
    return null;
  }

  class Abort extends Error {}
  return { register, has, run, exec, Abort, setAlive(fn) { isAlive = fn; }, get scenes() { return scenes; } };
})();
