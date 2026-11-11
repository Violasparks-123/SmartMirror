// JournalManager — the Memory Archive, unsolved mysteries, important
// conversations and the story log.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { MEMORIES, MYSTERIES } from '../data/lore.js';

export const Journal = {
  // "Words left unsaid": every locked choice Astoria has seen, and whether she
  // later earned the right to say it.
  noteUnspoken(key, { text, need, npc }) {
    const s = st();
    const u = s.journal.unspoken || (s.journal.unspoken = {});
    if (!u[key]) u[key] = { text, need, npc, day: s.time.day, said: null };
  },

  saidUnspoken(key, { text, need, npc }) {
    const s = st();
    const u = s.journal.unspoken || (s.journal.unspoken = {});
    if (!u[key]) u[key] = { text, need, npc, day: s.time.day, said: null };
    if (!u[key].said) {
      u[key].said = s.time.day;
      s.stats.earnedChoices = (s.stats.earnedChoices || 0) + 1;
    }
  },

  addFragment(ref) {
    const [mem, frag] = ref.split(':');
    const def = MEMORIES[mem];
    if (!def || !def.frags[frag]) { console.warn('Unknown memory', ref); return; }
    const s = st();
    const entry = s.journal.memories[mem] || (s.journal.memories[mem] = { frags: {}, firstDay: s.time.day });
    if (entry.frags[frag]) return;
    entry.frags[frag] = s.time.day;
    const st8 = this.memoryStatus(mem);
    bus.emit('toast', {
      text: st8.complete ? `Memory restored: ${def.title}` : `Memory fragment: ${def.title} (${st8.found}/${st8.total})`,
      kind: 'memory',
    });
    bus.emit('sfx', 'memory');
  },

  memoryStatus(mem) {
    const def = MEMORIES[mem];
    const entry = st().journal.memories[mem];
    const total = Object.keys(def.frags).length;
    const found = entry ? Object.keys(entry.frags).length : 0;
    return { found, total, complete: found === total, known: !!entry };
  },

  completeCount() {
    return Object.keys(MEMORIES).filter((m) => this.memoryStatus(m).complete).length;
  },

  openMystery(id) {
    const s = st();
    if (!MYSTERIES[id] || s.journal.mysteries[id]) return;
    s.journal.mysteries[id] = { day: s.time.day, solved: false };
    bus.emit('toast', { text: `New mystery: ${MYSTERIES[id].title}`, kind: 'mystery' });
  },

  solveMystery(id) {
    const s = st();
    if (!s.journal.mysteries[id]) s.journal.mysteries[id] = { day: s.time.day, solved: false };
    if (s.journal.mysteries[id].solved) return;
    s.journal.mysteries[id].solved = true;
    bus.emit('toast', { text: `Mystery answered: ${MYSTERIES[id].title}`, kind: 'mystery' });
  },

  logConversation(text, npc = null) {
    const s = st();
    s.journal.conversations.unshift({ day: s.time.day, phase: s.time.phase, text, npc });
    s.journal.conversations = s.journal.conversations.slice(0, 60);
  },

  log(text) {
    const s = st();
    s.journal.log.unshift({ day: s.time.day, phase: s.time.phase, text });
    s.journal.log = s.journal.log.slice(0, 80);
  },
};
