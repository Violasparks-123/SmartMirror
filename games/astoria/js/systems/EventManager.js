// EventManager — the Moonlit Gala: points, reward tiers, story chapters,
// daily event tasks and the event quest.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { EVENTS } from '../data/events.js';
import { galaActive } from './Conditions.js';
import { applyFx } from './Effects.js';

const G = () => st().events.gala;

export const Events = {
  gala: EVENTS.gala,
  active: galaActive,

  daysLeft() {
    const s = st(); const e = EVENTS.gala;
    return Math.max(0, e.startDay + e.durationDays - s.time.day);
  },

  // "Ends in 6 days, 2 phases" — in-game days and phases until the event closes.
  endsLabel() {
    if (!galaActive()) return 'Event ended';
    const s = st();
    const days = this.daysLeft() - 1;
    const phases = 4 - s.time.phase;
    const d = days > 0 ? `${days} day${days === 1 ? '' : 's'}` : '';
    const p = `${phases} phase${phases === 1 ? '' : 's'}`;
    return `Ends in ${d ? `${d}, ${p}` : p}`;
  },

  refreshLabel() {
    const phases = 4 - st().time.phase;
    return `${phases} phase${phases > 1 ? 's' : ''}`;
  },

  addPoints(n) {
    if (!galaActive()) return;
    const g = G();
    const before = g.points;
    g.points = Math.min(EVENTS.gala.maxPoints, g.points + n);
    if (g.points > before) {
      bus.emit('toast', { text: `Moonlit Gala +${g.points - before} (${g.points}/${EVENTS.gala.maxPoints})`, kind: 'event' });
      EVENTS.gala.rewards.forEach((r, i) => {
        if (before < r.at && g.points >= r.at) bus.emit('toast', { text: `Gala reward ready to claim: ${r.label}`, kind: 'event' });
      });
    }
  },

  claimable(i) { const r = EVENTS.gala.rewards[i]; return G().points >= r.at && !G().claimed[i]; },

  claim(i) {
    if (!this.claimable(i)) return false;
    G().claimed[i] = true;
    applyFx(EVENTS.gala.rewards[i].fx);
    bus.emit('sfx', 'complete');
    return true;
  },

  storyOpen(part) { return G().points >= part.need; },
  storyDone(id) { return !!G().story[id]; },

  markStory(id) {
    const part = [...EVENTS.gala.story, ...EVENTS.gala.secrets].find((p) => p.id === id);
    if (!part || G().story[id]) return;
    G().story[id] = true;
    this.addPoints(part.pts);
  },

  markDaily(id) {
    if (!galaActive() || G().daily.done[id]) return;
    G().daily.done[id] = true;
  },

  dailyDone(id) { return !!G().daily.done[id]; },

  questDone() { return !!st().flags.gala_quest_done; },

  completeQuest() {
    if (this.questDone()) return;
    st().flags.gala_quest_done = true;
    this.addPoints(EVENTS.gala.quest.pts);
  },
};
