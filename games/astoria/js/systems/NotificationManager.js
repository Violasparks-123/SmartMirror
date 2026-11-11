// NotificationManager — letters from NPCs and the notice feed behind the bell.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { LETTERS } from '../data/lore.js';
import { NPCS } from '../data/npcs.js';

export const Notifications = {
  sendLetter(id) {
    const s = st();
    const def = LETTERS[id];
    if (!def || s.letters.some((l) => l.id === id)) return;
    s.letters.unshift({ id, day: s.time.day, read: false });
    const from = def.from ? NPCS[def.from].name : 'Someone';
    this.notice(`${from} has sent a letter.`, 'letter', { letter: id });
    bus.emit('toast', { text: `${from} has sent a letter.`, kind: 'letter' });
    bus.emit('sfx', 'letter');
  },

  openLetter(id, applyFx) {
    const s = st();
    const l = s.letters.find((x) => x.id === id);
    if (!l) return;
    const first = !l.read;
    l.read = true;
    if (first && LETTERS[id].fx && applyFx) applyFx(LETTERS[id].fx);
  },

  unreadLetters() { return st().letters.filter((l) => !l.read).length; },

  notice(text, kind = 'info', data = {}) {
    const s = st();
    s.notices.unshift({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, day: s.time.day, phase: s.time.phase, text, kind, read: false, ...data });
    s.notices = s.notices.slice(0, 40);
  },

  unreadNotices() { return st().notices.filter((n) => !n.read).length; },
  markNoticesRead() { st().notices.forEach((n) => { n.read = true; }); },
};
