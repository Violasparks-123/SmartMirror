// TimeManager — Elaria's clock. Time moves in four phases per day and only
// advances when Astoria travels or lingers, so NPCs move between locations as
// the player acts.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';

export const PHASES = ['Morning', 'Afternoon', 'Evening', 'Night'];
export const PHASE_ICONS = ['sun', 'sunset', 'moonrise', 'moon'];

export const Time = {
  phaseName(p = st().time.phase) { return PHASES[p]; },
  label() { const t = st().time; return `Day ${t.day} · ${PHASES[t.phase]}`; },
  isNight() { return st().time.phase === 3; },
  stamp(day = st().time.day, phase = st().time.phase) { return day * 4 + phase; },

  advance(n = 1) {
    const t = st().time;
    for (let i = 0; i < n; i++) {
      t.phase += 1;
      if (t.phase > 3) {
        t.phase = 0;
        t.day += 1;
        this.newDay();
      }
      bus.emit('time:phase', { ...t });
    }
  },

  newDay() {
    const s = st();
    s.daily = { day: s.time.day, done: {} };
    s.events.gala.daily = { day: s.time.day, done: {} };
    bus.emit('time:day', s.time.day);
  },
};
