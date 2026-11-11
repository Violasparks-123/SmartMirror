// StoryManager — the spine of the main story.
// Tracks the "Veil": the memories inside Astoria that belong to other people
// (echoes), which she can keep (gaining a piece of herself) or give back
// (bringing someone home, at the cost of a piece of herself). Also owns the
// eclipse countdown, chapter questions, the closest companion, the
// "Previously…" recap and endings.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { ECHOES, ENDINGS } from '../data/echoes.js';
import { QUESTS } from '../data/quests.js';

// Nights left before the eclipse, by chapter. Ticks by story progress, never
// by real days, so playing slowly can never make you fail.
const NIGHTS = { 1: 13, 2: 11, 3: 9, 4: 7, 5: 5, 6: 4, 7: 3, 8: 1, 9: 0 };
export const SELF_START = 2;   // her name, and three notes she can hum

export const Story = {
  veil() {
    const s = st();
    if (!s.veil) s.veil = { held: {}, kept: {}, returned: {}, self: SELF_START, took: 0 };
    return s.veil;
  },

  // ---------- echoes ----------
  receive(id) {
    const v = this.veil();
    if (v.held[id] || v.kept[id] || v.returned[id]) return;
    v.held[id] = st().time.day;
    bus.emit('toast', { text: `Something settles inside you: ${ECHOES[id]?.title || id}`, kind: 'memory' });
  },
  keep(id) {
    const v = this.veil();
    if (v.kept[id] || v.returned[id]) return;
    delete v.held[id];
    v.kept[id] = st().time.day;
    v.self += 1;
    bus.emit('toast', { text: 'You kept it. A little more of you is yours.', kind: 'memory' });
    bus.emit('sfx', 'earned');
  },
  give(id) {
    const v = this.veil();
    if (v.returned[id] || v.kept[id]) return;
    delete v.held[id];
    v.returned[id] = st().time.day;
    v.self = Math.max(0, v.self - 1);
    bus.emit('toast', { text: 'You gave it back. Something of you went with it.', kind: 'memory' });
    bus.emit('sfx', 'locked');
  },
  // Taking a memory out of someone (only possible once she knows what she is).
  take(id) {
    const v = this.veil();
    v.took += 1;
    this.receive(id);
  },
  status(id) {
    const v = this.veil();
    if (v.kept[id]) return 'kept';
    if (v.returned[id]) return 'returned';
    if (v.held[id]) return 'held';
    return 'none';
  },
  counts() {
    const v = this.veil();
    return { held: Object.keys(v.held).length, kept: Object.keys(v.kept).length, returned: Object.keys(v.returned).length, self: v.self, took: v.took };
  },

  // ---------- countdown and chapters ----------
  nightsLeft() {
    const s = st();
    if (s.ending) return 0;
    return NIGHTS[Math.min(9, s.chapter)] ?? 0;
  },
  nightsLabel() {
    if (st().ending) return 'The eclipse has passed';
    const n = this.nightsLeft();
    if (n <= 0) return 'The eclipse is tonight';
    return n === 1 ? '1 night until the eclipse' : `${n} nights until the eclipse`;
  },
  shortLabel() {
    if (st().ending) return 'After the eclipse';
    const n = this.nightsLeft();
    return n <= 0 ? 'Eclipse tonight' : `Eclipse in ${n} night${n === 1 ? '' : 's'}`;
  },
  question(chapter = st().chapter) {
    const q = Object.values(QUESTS).find((x) => x.type === 'main' && x.chapter === chapter);
    return q?.question || null;
  },

  // The companion Astoria is closest to (who the Accord sells in Chapter 8).
  closest() {
    const s = st();
    const pool = ['lucien', 'cael', 'evelyne'].filter((id) => s.npcs[id]?.met);
    if (!pool.length) return 'cael';
    return pool.reduce((best, id) => ((s.npcs[id].affinity + s.npcs[id].trust) > (s.npcs[best].affinity + s.npcs[best].trust) ? id : best), pool[0]);
  },

  // ---------- endings ----------
  end(id) {
    const s = st();
    if (!ENDINGS[id]) return;
    // Remember the Veil as it stood, so "Choose again" can replay the final choice fairly.
    if (!s.veilBeforeEnding) s.veilBeforeEnding = JSON.parse(JSON.stringify(this.veil()));
    const v = this.veil();
    const move = (from, to) => Object.keys(v[from]).filter((k) => k !== 'own').forEach((k) => { v[to][k] = v[from][k]; delete v[from][k]; });
    if (id === 'bells') { move('held', 'returned'); move('kept', 'returned'); v.self = 0; }
    // Shared out among her companions, everyone comes home slowly; she keeps herself.
    if (['share', 'ledger', 'heiress', 'watch', 'lullaby', 'surprise'].includes(id)) { move('held', 'returned'); move('kept', 'returned'); }
    if (id === 'siren') { move('held', 'returned'); move('kept', 'returned'); v.self = 0; }
    if (id === 'hollow') { move('held', 'kept'); }
    if (id === 'keep') { v.self += Object.keys(v.held).length; move('held', 'kept'); }
    s.ending = { id, day: s.time.day, counts: this.counts() };
    s.flags.game_complete = true;
    s.flags[`ending_${id}`] = true;
    s.endingsSeen = { ...(s.endingsSeen || {}), [id]: true };
    bus.emit('story:ending', id);
  },

  // Undo the last ending so the final choice can be made again.
  rewind() {
    const s = st();
    if (s.veilBeforeEnding) s.veil = JSON.parse(JSON.stringify(s.veilBeforeEnding));
    Object.keys(s.flags).filter((f) => f.startsWith('ending_')).forEach((f) => { delete s.flags[f]; });
    s.flags.game_complete = false;
    s.ending = null;
  },

  // ---------- saves from before the story rewrite ----------
  upgrade(startQuest) {
    const s = st();
    this.veil();
    if (s.quests.mq6?.status === 'done' && !s.quests.mq7 && !s.ending) startQuest('mq7');
  },

  // A short reminder of where the story is, for players coming back after a break.
  recapLines() {
    const s = st();
    const done = Object.entries(QUESTS)
      .filter(([id, q]) => q.type === 'main' && s.quests[id]?.status === 'done' && q.recap)
      .sort((a, b) => a[1].chapter - b[1].chapter)
      .slice(-2)
      .map(([, q]) => q.recap);
    return done;
  },
};
