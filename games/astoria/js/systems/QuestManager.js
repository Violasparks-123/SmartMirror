// QuestManager — starts quests, completes objectives, pays rewards and chains
// the story forward. Completion scenes are queued for the UI via the bus.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { QUESTS, DAILY } from '../data/quests.js';
import { check, questStatus } from './Conditions.js';
import { Inventory } from './InventoryManager.js';
import { Notifications } from './NotificationManager.js';
import { applyFx } from './Effects.js';

export const Quests = {
  def(id) { return QUESTS[id]; },
  status(id) { return questStatus(id); },
  isActive(id) { return questStatus(id) === 'active'; },

  start(id, { silent = false } = {}) {
    const q = QUESTS[id];
    const s = st();
    if (!q || s.quests[id]) return;
    s.quests[id] = { status: 'active', objs: {}, startedDay: s.time.day };
    s.flags[`${id}_started`] = true;
    bus.emit('quest:start', id);
    if (!silent) {
      const kind = q.type === 'hidden' ? 'Hidden quest discovered' : q.type === 'main' ? `Chapter ${q.chapter}` : 'New quest';
      bus.emit('toast', { text: `${kind}: ${q.title}`, kind: 'quest' });
      Notifications.notice(`${kind}: ${q.title}`, 'quest', { quest: id });
      bus.emit('sfx', 'quest');
    }
    // Arrival objectives satisfied already (e.g. already standing in the library).
    this.checkArrival(s.location);
    this.checkCounts();
  },

  completeObjective(key) {
    const [qid, oid] = key.split('.');
    const q = QUESTS[qid];
    const s = st();
    if (!q || s.quests[qid]?.status !== 'active') return;
    if (s.quests[qid].objs[oid]) return;
    const obj = q.objectives.find((o) => o.id === oid);
    if (!obj) { console.warn('Unknown objective', key); return; }
    s.quests[qid].objs[oid] = s.time.day;
    bus.emit('toast', { text: `✓ ${obj.text}`, kind: 'objective' });
    this.checkComplete(qid);
    if (s.quests[qid].status === 'active') bus.emit('quest:objective', qid);
  },

  checkComplete(qid) {
    const q = QUESTS[qid];
    const sq = st().quests[qid];
    if (!sq || sq.status !== 'active') return;
    if (q.objectives.every((o) => o.optional || sq.objs[o.id])) this.complete(qid);
  },

  complete(qid) {
    const q = QUESTS[qid];
    const s = st();
    s.quests[qid].status = 'done';
    s.quests[qid].doneDay = s.time.day;
    s.flags[`${qid}_done`] = true;
    if (q.rewards) applyFx(q.rewards, { quiet: true });
    Notifications.notice(`Quest complete: ${q.title}`, 'quest', { quest: qid });
    bus.emit('quest:complete', qid);
    bus.emit('sfx', 'complete');
    if (q.onComplete) applyFx(q.onComplete);
  },

  // Objectives that complete simply by being in a place.
  checkArrival(loc) {
    const s = st();
    for (const [qid, sq] of Object.entries(s.quests)) {
      if (sq.status !== 'active') continue;
      for (const o of QUESTS[qid].objectives) {
        if (!sq.objs[o.id] && o.target?.loc === loc && !o.target.hs && !o.target.npc && !o.count) {
          this.completeObjective(`${qid}.${o.id}`);
        }
      }
    }
  },

  // Objectives that complete when Astoria carries enough of something.
  checkCounts() {
    const s = st();
    for (const [qid, sq] of Object.entries(s.quests)) {
      if (sq.status !== 'active') continue;
      for (const o of QUESTS[qid].objectives) {
        if (o.count && !sq.objs[o.id] && Inventory.count(o.count.item) >= o.count.n) {
          this.completeObjective(`${qid}.${o.id}`);
        }
      }
    }
  },

  objectiveProgress(qid, o) {
    if (o.count) return `${Math.min(Inventory.count(o.count.item), o.count.n)}/${o.count.n}`;
    return null;
  },

  // Quests an NPC can offer right now.
  offersFor(npc) {
    return Object.entries(QUESTS)
      .filter(([id, q]) => q.offer?.npc === npc && questStatus(id) === 'none' && (check(q.offer.cond) || st().flags[`offer_${id}`]))
      .map(([id, q]) => ({ id, ...q }));
  },

  activeFor(npc) {
    return Object.entries(QUESTS)
      .filter(([id, q]) => q.npc === npc && questStatus(id) === 'active')
      .map(([id, q]) => ({ id, ...q, state: st().quests[id] }));
  },

  list(filter) {
    const s = st();
    return Object.keys(s.quests)
      .map((id) => ({ id, ...QUESTS[id], state: s.quests[id] }))
      .filter((q) => QUESTS[q.id] && (!filter || filter(q)));
  },

  trackedMain() {
    const active = this.list((q) => q.type === 'main' && q.state.status === 'active').sort((a, b) => b.chapter - a.chapter)[0];
    if (active) return active;
    return this.list((q) => q.type === 'main').sort((a, b) => b.chapter - a.chapter)[0] || null;
  },

  nextObjective(qid) {
    const q = QUESTS[qid];
    const sq = st().quests[qid];
    if (!q || !sq) return null;
    return q.objectives.find((o) => !sq.objs[o.id]) || null;
  },

  dailyList() {
    return DAILY.filter((d) => check(d.cond)).map((d) => ({ ...d, done: !!st().daily.done[d.id] }));
  },

  completeDaily(id) {
    const s = st();
    const d = DAILY.find((x) => x.id === id);
    if (!d || s.daily.done[id]) return;
    s.daily.done[id] = true;
    applyFx(d.rewards, { quiet: true });
    bus.emit('toast', { text: `Daily activity complete: ${d.title}`, kind: 'objective' });
  },
};
