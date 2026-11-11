// RelationshipEngine — tracks affinity, trust, suspicion, friendship and rivalry
// for every NPC, and translates hidden numbers into what Astoria can *sense*.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { NPCS } from '../data/npcs.js';

const STATS = ['affinity', 'trust', 'suspicion', 'friendship', 'rivalry'];
const clamp = (v) => Math.max(0, Math.min(100, v));

export const Relationships = {
  change(npc, deltas) {
    const n = st().npcs[npc];
    if (!n) return;
    for (const k of STATS) {
      if (deltas[k]) n[k] = clamp(n[k] + deltas[k]);
    }
    // Small, deliberately vague feedback: only affinity is ever hinted at directly.
    if (deltas.affinity) bus.emit('relfx', { npc, dir: deltas.affinity > 0 ? 'up' : 'down' });
    if ((deltas.suspicion || 0) >= 5) bus.emit('relfx', { npc, dir: 'wary' });
  },

  addHistory(npc, text) {
    const s = st();
    s.npcs[npc].history.unshift({ day: s.time.day, text });
    s.npcs[npc].history = s.npcs[npc].history.slice(0, 30);
  },

  tier(npc) {
    const n = st().npcs[npc];
    if (!n.met) return { label: 'Stranger', tone: 'muted' };
    if (n.rivalry >= 20 && n.rivalry > n.affinity) return { label: 'Rival', tone: 'rose' };
    if (n.romance && n.affinity >= 50) return { label: 'Something more', tone: 'rose' };
    if (n.affinity >= 50) return { label: 'Confidant', tone: 'gold' };
    if (n.affinity >= 28) return { label: 'Friend', tone: 'gold' };
    if (n.affinity >= 12) return { label: 'Acquaintance', tone: 'lav' };
    return { label: 'Newly met', tone: 'muted' };
  },

  // A qualitative read on hidden values. Some feelings remain hidden on purpose.
  sense(npc) {
    const n = st().npcs[npc];
    const out = [];
    if (!n.met) return out;
    if (n.trust >= 30) out.push('Trusts you');
    else if (n.trust >= 12) out.push('Trust is growing');
    else out.push('Guarded');
    if (n.suspicion >= 25) out.push('Something unspoken lingers');
    if (st().time.day <= n.avoidUntil) out.push('Avoiding you');
    if (n.romance) out.push('A certain warmth');
    return out;
  },

  moons(npc) { return Math.round((st().npcs[npc].affinity / 100) * 10) / 2; },

  romanceEligible(npc) { return !!NPCS[npc].romance; },
};
