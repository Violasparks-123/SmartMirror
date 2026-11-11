// AchievementManager — watches the game state and unlocks achievements.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { ACHIEVEMENTS } from '../data/misc.js';
import { Journal } from './JournalManager.js';
import { Notifications } from './NotificationManager.js';

let timer = null;

export const Achievements = {
  list() {
    const s = st();
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: s.achievements[a.id] || null }));
  },

  evaluate() {
    const s = st();
    if (!s?.started) return;
    const helpers = { completeMemories: Journal.completeCount() };
    let changed = false;
    for (const a of ACHIEVEMENTS) {
      if (s.achievements[a.id]) continue;
      if (a.check(s, helpers)) {
        s.achievements[a.id] = s.time.day;
        s.player.moonstones += a.reward;
        bus.emit('toast', { text: `Achievement: ${a.title} (+${a.reward} Moonstones)`, kind: 'achievement' });
        Notifications.notice(`Achievement unlocked: ${a.title}`, 'achievement');
        changed = true;
      }
    }
    if (changed) bus.emit('state:changed', 'achievement');
  },

  init() {
    bus.on('state:changed', (reason) => {
      if (reason === 'achievement') return;
      clearTimeout(timer);
      timer = setTimeout(() => this.evaluate(), 250);
    });
  },
};
