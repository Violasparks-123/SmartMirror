// GameState — the single source of truth for everything the player has done.
// Systems mutate the state object directly, then call Game.commit() so the
// UI re-renders and the SaveManager persists it.
import { bus } from './EventBus.js';
import { NPCS } from '../data/npcs.js';

export const SAVE_VERSION = 1;

function newNpcState() {
  return {
    met: false,
    affinity: 0, trust: 0, suspicion: 0, friendship: 0, rivalry: 0,
    romance: false,
    memory: {},          // key -> { day, note }
    history: [],         // [{ day, text }] relationship history for the journal
    lastTalkDay: -1,
    lastGiftDay: -1,
    avoidUntil: -1,
    rendezvous: null,    // { loc, day, phase }
    topicsSeen: {},
    likesKnown: [],
    dislikesKnown: [],
    secretsSeen: {},
  };
}

export function newState() {
  const npcs = {};
  Object.keys(NPCS).forEach((id) => { npcs[id] = newNpcState(); });
  return {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    savedAt: 0,
    started: false,
    player: {
      name: 'Astoria', level: 1, exp: 0,
      moonstones: 300, crowns: 500,
      path: { compassionate: 0, suspicious: 0, aggressive: 0, secretive: 0 },
      title: 'The Unremembered',
    },
    time: { day: 1, phase: 0 },
    location: 'cathedral',
    chapter: 1,
    flags: {},
    npcs,
    quests: {},
    inventory: {},
    discovered: { cathedral: true },
    hotspots: {},          // "loc.hotspot" -> times interacted
    journal: { memories: {}, conversations: [], mysteries: {}, log: [] },
    collection: {},
    letters: [],
    notices: [],
    party: [],
    wardrobe: {
      owned: { eclipse_gown: true, loose_ribbon: true, none: true, silver_crescent: true, velvet_heels: true, natural: true },
      worn: { dress: 'eclipse_gown', hair: 'loose_ribbon', accessory: 'none', jewellery: 'silver_crescent', shoes: 'velvet_heels', makeup: 'natural' },
    },
    events: { gala: { points: 0, claimed: {}, story: {}, daily: { day: 0, done: {} } } },
    daily: { day: 1, done: {} },
    achievements: {},
    veil: { held: {}, kept: {}, returned: {}, self: 2, took: 0 },
    ending: null,
    stats: { gifts: 0, nightExplores: 0, talks: 0, summons: 0, travels: 0, invites: 0 },
    settings: { music: 0.45, sfx: 0.7, textSpeed: 'normal', reduceMotion: false, pathHints: true, panelsOpen: true },
  };
}

// Fill any fields a newer version added, without discarding saved progress.
export function migrate(loaded) {
  const fresh = newState();
  const fill = (base, add) => {
    for (const k of Object.keys(base)) {
      if (add[k] === undefined) add[k] = base[k];
      else if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof add[k] === 'object' && add[k] !== null && !Array.isArray(add[k])) {
        fill(base[k], add[k]);
      }
    }
    return add;
  };
  const out = fill(fresh, loaded);
  Object.keys(NPCS).forEach((id) => { out.npcs[id] = fill(newNpcState(), out.npcs[id] || {}); });
  out.version = SAVE_VERSION;
  return out;
}

let S = null;

export const Game = {
  get state() { return S; },
  replace(next) { S = next; bus.emit('state:replaced', S); },
  commit(reason = '') { bus.emit('state:changed', reason); },
};

export const st = () => S;
