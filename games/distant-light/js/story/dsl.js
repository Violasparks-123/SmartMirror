/* The story-writing language. Each helper returns one command for the engine.

   bg('classroom')                     change background (auto-glitches late in the game)
   show('hikaru', 'sad', 'right')      show or update a character
   hide('hikaru', { erase: true })     remove a character (erase = glitch away)
   n('text')                           narration
   H / K / R ('expr', 'text')          Haruka / Hikaru / Rin speak (K is for hiKaru)
   me('text')                          the player speaks
   X('Ms. Kanda', 'text')              anyone else
   choice(opt('label', [...]), ...)    a choice; opt(..., { if, lock, hover })
   add({ trust: 1 })                   change stats   flag('name')  set a story flag
   iff(s => ..., [then], [else])       branch on state
   go('scene') / call('scene') / end() jump, run-and-return, stop
   rw('fake text', 'fragment-id')      option for a line that rewrites itself
   phone('title') msg('haruka','hi') reply(opt(...)) phoneClose()
*/
DL.DSL = (() => {
  const scene = (id, list) => DL.Engine.register(id, list);

  const bg = (id, o = {}) => ({ t: 'bg', id, o });
  const show = (who, expr = 'neutral', pos, o = {}) => ({ t: 'show', who, expr, pos, o });
  const hide = (who, o = {}) => ({ t: 'hide', who, o });
  const hideAll = () => ({ t: 'hideAll' });

  const say = (who, expr, text, o = {}) => ({ t: 'say', who, expr, text, o });
  const n = (text, o = {}) => say(null, null, text, o);
  const H = (expr, text, o) => say('haruka', expr, text, o);
  const K = (expr, text, o) => say('hikaru', expr, text, o);
  const R = (expr, text, o) => say('rin', expr, text, o);
  const REI = (expr, text, o) => say('rei', expr, text, o);
  const SEI = (expr, text, o) => say('sei', expr, text, o);
  const me = (text, o) => say('player', null, text, o);
  const X = (label, text, o = {}) => say('other', null, text, Object.assign({ label, plate: 'grey' }, o));
  const V = (text, o = {}) => say('void', null, text, Object.assign({ label: 'H̷̛ARUKA', plate: 'void', glitchName: true }, o));

  /* A line that edits itself into `fake`. Remembering it recovers fragment `frag`. */
  const rw = (fake, frag, extra = {}) => ({ rewrite: Object.assign({ fake, frag }, extra) });

  const opt = (text, body = [], o = {}) => ({ text, body, if: o.if, lock: o.lock, hover: o.hover, send: o.send });
  const choice = (...opts) => {
    let prompt = null;
    if (typeof opts[0] === 'string') prompt = opts.shift();
    return { t: 'choice', opts, prompt };
  };

  const add = (obj, o = {}) => ({ t: 'add', obj, o });
  const flag = (name, v = true) => ({ t: 'flag', name, v });
  const iff = (cond, then = [], els = []) => ({ t: 'if', cond, then, els });
  const go = (id) => ({ t: 'goto', id });
  const call = (id) => ({ t: 'call', id });
  const end = () => ({ t: 'end' });
  const wait = (ms) => ({ t: 'wait', ms });
  const sfx = (name) => ({ t: 'sfx', name });
  const music = (mood) => ({ t: 'music', mood });
  const fx = (kind, o = {}) => ({ t: 'fx', kind, o });
  const diary = (text) => ({ t: 'diary', text });
  const item = (id, n = 1) => ({ t: 'item', id, n });
  const shop = () => ({ t: 'shop' });
  const phone = (title, o = {}) => ({ t: 'phone', title, o });
  const msg = (from, text, o = {}) => ({ t: 'msg', from, text, o });
  const reply = (...opts) => ({ t: 'reply', opts });
  const phoneClose = () => ({ t: 'phoneClose' });
  const oneOf = (...lists) => ({ t: 'oneOf', lists });
  const js = (fn) => ({ t: 'js', fn });
  const hideText = () => ({ t: 'hideText' });
  const card = (sub, o = {}) => ({ t: 'card', sub, o });
  const ending = (id) => ({ t: 'ending', id });

  // Common conditions
  const has = (id) => (s) => s.frags.includes(id);
  const f = (name) => (s) => !!s.flags[name];

  return {
    scene, bg, show, hide, hideAll, say, n, H, K, R, REI, SEI, me, X, V, rw, opt, choice, add, flag, iff, go, call, end,
    wait, sfx, music, fx, diary, item, shop, phone, msg, reply, phoneClose, oneOf, js, hideText, card, ending, has, f,
  };
})();
