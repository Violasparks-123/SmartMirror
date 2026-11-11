// Conditions — one small language used by every content file to ask
// "is this true right now?" (flags, quest progress, relationships, time, place…).
import { st } from '../core/GameState.js';
import { EVENTS } from '../data/events.js';
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { PATHS } from '../data/misc.js';
import { ECHOES } from '../data/echoes.js';

const arr = (v) => (Array.isArray(v) ? v : [v]);

export function questStatus(q) {
  return st().quests[q]?.status || 'none';
}

export function objDone(key) {
  const [q, o] = key.split('.');
  return !!st().quests[q]?.objs?.[o];
}

export function dominantPath() {
  const p = st().player.path;
  let best = null; let max = 0;
  for (const k of Object.keys(p)) if (p[k] > max) { max = p[k]; best = k; }
  return best;
}

export function galaActive() {
  const s = st(); const e = EVENTS.gala;
  return s.time.day >= e.startDay && s.time.day < e.startDay + e.durationDays;
}

function one(s, key, v) {
  switch (key) {
    case 'flag': return arr(v).every((f) => s.flags[f]);
    case 'notFlag': return arr(v).every((f) => !s.flags[f]);
    case 'chapterMin': return s.chapter >= v;
    case 'quest': return Object.entries(v).every(([q, want]) => {
      const cur = questStatus(q);
      if (want === 'started') return cur === 'active' || cur === 'done';
      return cur === want;
    });
    case 'obj': return Object.entries(v).every(([k, want]) => objDone(k) === want);
    case 'item': return arr(v).every((i) => (s.inventory[i] || 0) > 0);
    case 'notItem': return arr(v).every((i) => !((s.inventory[i] || 0) > 0));
    case 'rel': return Object.entries(v).every(([npc, mins]) => Object.entries(mins).every(([stat, n]) => (s.npcs[npc]?.[stat] || 0) >= n));
    case 'relMax': return Object.entries(v).every(([npc, maxs]) => Object.entries(maxs).every(([stat, n]) => (s.npcs[npc]?.[stat] || 0) <= n));
    case 'mem': return Object.entries(v).every(([npc, keys]) => arr(keys).every((k) => s.npcs[npc]?.memory[k]));
    case 'notMem': return Object.entries(v).every(([npc, keys]) => arr(keys).every((k) => !s.npcs[npc]?.memory[k]));
    case 'memAny': return Object.entries(v).every(([npc, prefix]) => Object.keys(s.npcs[npc]?.memory || {}).some((k) => k.startsWith(prefix)));
    case 'path': return Object.entries(v).every(([p, n]) => (s.player.path[p] || 0) >= n);
    case 'pathTop': return dominantPath() === v;
    case 'phase': return arr(v).includes(s.time.phase);
    case 'loc': return s.location === v;
    case 'party': return s.party.includes(v);
    case 'worn': return arr(v).some((id) => Object.values(s.wardrobe.worn).includes(id));
    case 'met': return !!s.npcs[v]?.met;
    case 'discovered': return !!s.discovered[v];
    case 'dailyOpen': return !s.daily.done[v];
    case 'galaOpen': return galaActive() && !s.events.gala.daily.done[v];
    case 'mysteryOpen': { const m = s.journal.mysteries[v]; return !!m && !m.solved; }
    // The Veil (see StoryManager): what Astoria kept, gave back, or still holds.
    case 'kept': return arr(v).every((id) => !!s.veil?.kept?.[id]);
    case 'returned': return arr(v).every((id) => !!s.veil?.returned?.[id]);
    case 'held': return arr(v).every((id) => !!s.veil?.held?.[id]);
    case 'notDecided': return arr(v).every((id) => !s.veil?.kept?.[id] && !s.veil?.returned?.[id]);
    case 'selfMin': return (s.veil?.self ?? 2) >= v;
    case 'selfMax': return (s.veil?.self ?? 2) <= v;
    case 'took': return (s.veil?.took || 0) > 0 === !!v;
    case 'closest': return closestCompanion(s) === v;
    case 'romance': return !!s.npcs[v]?.romance;
    case 'trusting': return ['lucien', 'cael', 'evelyne', 'seraphine', 'noctis'].filter((n) => (s.npcs[n]?.trust || 0) >= 30 && !(s.flags[`forgot_${n}`] && !s.flags[`restored_${n}`])).length >= v;
    case 'any': return v.some((c) => check(c));
    case 'all': return v.every((c) => check(c));
    case 'not': return !check(v);
    default:
      console.warn('Unknown condition', key);
      return true;
  }
}

// Mirrors Story.closest(): the companion Astoria is closest to.
function closestCompanion(s) {
  const pool = ['lucien', 'cael', 'evelyne'].filter((id) => s.npcs[id]?.met);
  if (!pool.length) return 'cael';
  return pool.reduce((best, id) => ((s.npcs[id].affinity + s.npcs[id].trust) > (s.npcs[best].affinity + s.npcs[best].trust) ? id : best), pool[0]);
}

export function check(cond) {
  if (!cond) return true;
  const s = st();
  for (const key of Object.keys(cond)) {
    if (!one(s, key, cond[key])) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// describe(cond) — what a locked choice needs, in words the player can act on.
// Hidden numbers stay hidden: bonds are described by how they feel, not by value.
const PATH_PHRASE = {
  compassionate: 'A compassionate heart', suspicious: 'A suspicious mind',
  aggressive: 'A bolder, sharper edge', secretive: 'A secretive streak',
};
function bondPhrase(npc, stat, n) {
  const name = NPCS[npc]?.name || npc;
  if (stat === 'trust') return n >= 30 ? `${name}'s full trust` : `More of ${name}'s trust`;
  if (stat === 'affinity') return n >= 50 ? `${name} as a confidant` : n >= 28 ? `${name}'s friendship` : `A closer bond with ${name}`;
  if (stat === 'friendship') return `${name}'s friendship`;
  return `A different footing with ${name}`;
}
export function describe(cond) {
  if (!cond) return [];
  const out = [];
  for (const [key, v] of Object.entries(cond)) {
    if (key === 'rel') Object.entries(v).forEach(([npc, mins]) => Object.entries(mins).forEach(([stat, n]) => out.push(bondPhrase(npc, stat, n))));
    else if (key === 'path') Object.keys(v).forEach((p) => out.push(PATH_PHRASE[p] || `${PATHS[p]?.name || p} choices`));
    else if (key === 'pathTop') out.push(`${PATHS[v]?.name || v} above all else`);
    else if (key === 'item') arr(v).forEach((i) => out.push(`Carrying the ${ITEMS[i]?.name || i}`));
    else if (key === 'party') out.push(`${NPCS[v]?.name || v} at your side`);
    else if (key === 'met') out.push(`Having met ${NPCS[v]?.name || v}`);
    else if (key === 'any') out.push(v.map((c) => describe(c).join(' and ')).filter(Boolean).join(', or '));
    else if (key === 'all') v.forEach((c) => out.push(...describe(c)));
    else if (key === 'selfMin') out.push('Enough of yourself kept');
    else if (key === 'took' && v) out.push('Having taken a memory from someone');
    else if (key === 'kept') arr(v).forEach((id) => out.push(`Having kept "${ECHOES[id]?.title || id}"`));
    else if (key === 'returned') arr(v).forEach((id) => out.push(`Having given back "${ECHOES[id]?.title || id}"`));
    else if (key === 'trusting') out.push(`${v} companions who trust you completely`);
  }
  return out.filter(Boolean);
}
