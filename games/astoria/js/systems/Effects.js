// Effects — the single interpreter for every consequence in the game.
// Dialogue choices, hotspots, letters, quests and items all describe what
// happens as a small effect object; this file makes it so, in a fixed order.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { Player } from './PlayerProfile.js';
import { Relationships } from './RelationshipEngine.js';
import { Inventory } from './InventoryManager.js';
import { Journal } from './JournalManager.js';
import { Quests } from './QuestManager.js';
import { Notifications } from './NotificationManager.js';
import { Wardrobe } from './CharacterManager.js';
import { Events } from './EventManager.js';
import { Time } from './TimeManager.js';
import { NPCS } from '../data/npcs.js';
import { LOCATIONS } from '../data/locations.js';
import { Story } from './StoryManager.js';

const arr = (v) => (Array.isArray(v) ? v : [v]);

const ORDER = [
  'met', 'flag', 'unflag', 'item', 'take', 'outfit', 'rel', 'romanceHint', 'mem', 'forget', 'avoid', 'path',
  'history', 'log', 'memory', 'mystery', 'solve', 'discover', 'exp', 'crowns', 'moonstones', 'title',
  'partyOk', 'letter', 'offer', 'daily', 'galaDaily', 'gala', 'galaStory', 'galaSecret', 'galaQuest',
  'echo', 'takeEcho', 'keepEcho', 'giveEcho', 'self',
  'start', 'obj', 'chapter', 'time', 'toast', 'ending', 'cutscene',
];

export function remember(npc, key, note = '') {
  const s = st();
  if (!s.npcs[npc]) return;
  s.npcs[npc].memory[key] = { day: s.time.day, note };
}

export function applyFx(fx, { quiet = false } = {}) {
  if (!fx) return;
  const s = st();
  const keys = Object.keys(fx).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  for (const k of keys) {
    const v = fx[k];
    switch (k) {
      case 'met': arr(v).forEach((n) => { if (!s.npcs[n].met) { s.npcs[n].met = true; s.npcs[n].metDay = s.time.day; Notifications.notice(`You met ${NPCS[n].name}, ${NPCS[n].title}.`, 'npc', { npc: n }); } }); break;
      case 'flag': arr(v).forEach((f) => { s.flags[f] = true; }); break;
      case 'unflag': arr(v).forEach((f) => { delete s.flags[f]; }); break;
      case 'item': Object.entries(v).forEach(([id, n]) => Inventory.add(id, n)); Quests.checkCounts(); break;
      case 'take': Object.entries(v).forEach(([id, n]) => Inventory.remove(id, n)); break;
      case 'outfit': arr(v).forEach((id) => Wardrobe.grant(id)); break;
      case 'rel': Object.entries(v).forEach(([npc, d]) => Relationships.change(npc, d)); break;
      case 'romanceHint': arr(v).forEach((n) => { if (NPCS[n].romance) s.npcs[n].romance = true; }); break;
      case 'mem': Object.entries(v).forEach(([npc, keysv]) => arr(keysv).forEach((key) => {
        if (!s.npcs[npc].memory[key]) bus.emit('relfx', { npc, dir: 'memory' });
        remember(npc, key);
      })); break;
      case 'forget': Object.entries(v).forEach(([npc, keysv]) => arr(keysv).forEach((key) => { delete s.npcs[npc].memory[key]; })); break;
      case 'avoid': Object.entries(v).forEach(([npc, days]) => {
        s.npcs[npc].avoidUntil = s.time.day + days - 1;
        Notifications.notice(`${NPCS[npc].name} is avoiding you.`, 'npc', { npc });
      }); break;
      case 'path': if (typeof v === 'string') Player.addPath(v, 1); else Object.entries(v).forEach(([p, n]) => Player.addPath(p, n)); break;
      case 'history': Object.entries(v).forEach(([npc, text]) => Relationships.addHistory(npc, text)); break;
      case 'log': Journal.logConversation(v); break;
      case 'memory': arr(v).forEach((ref) => Journal.addFragment(ref)); break;
      case 'mystery': arr(v).forEach((m) => Journal.openMystery(m)); break;
      case 'solve': arr(v).forEach((m) => Journal.solveMystery(m)); break;
      case 'discover': arr(v).forEach((loc) => {
        if (!s.discovered[loc]) {
          s.discovered[loc] = true;
          bus.emit('toast', { text: `New location: ${LOCATIONS[loc].name}`, kind: 'location' });
          Journal.log(`Discovered ${LOCATIONS[loc].name}.`);
        }
      }); break;
      case 'exp': Player.addExp(v); if (!quiet) bus.emit('toast', { text: `+${v} EXP`, kind: 'exp' }); break;
      case 'crowns': Player.add('crowns', v); if (!quiet) bus.emit('toast', { text: `+${v} Crowns`, kind: 'crowns' }); break;
      case 'moonstones': Player.add('moonstones', v); if (!quiet) bus.emit('toast', { text: `+${v} Moonstones`, kind: 'moonstones' }); break;
      case 'title': s.player.title = v; bus.emit('toast', { text: `New title: ${v}`, kind: 'level' }); break;
      case 'partyOk': arr(v).forEach((n) => {
        if (!s.flags[`party_ok_${n}`]) {
          s.flags[`party_ok_${n}`] = true;
          if (n !== 'seraphine' || s.quests.mq1?.status === 'done') bus.emit('toast', { text: `${NPCS[n].name} can now join your party.`, kind: 'npc' });
        }
      }); break;
      case 'letter': arr(v).forEach((id) => Notifications.sendLetter(id)); break;
      case 'offer': arr(v).forEach((q) => { s.flags[`offer_${q}`] = true; }); break;
      case 'daily': Quests.completeDaily(v); break;
      case 'galaDaily': Events.markDaily(v); break;
      case 'gala': Events.addPoints(v); break;
      case 'galaStory': Events.markStory(v); break;
      case 'galaSecret': Events.markStory(v); break;
      case 'galaQuest': Events.completeQuest(); break;
      case 'start': arr(v).forEach((q) => Quests.start(q)); break;
      case 'obj': arr(v).forEach((key) => Quests.completeObjective(key)); break;
      case 'chapter': if (v > s.chapter) s.chapter = v; break;
      case 'time': Time.advance(v); break;
      case 'toast': bus.emit('toast', { text: v, kind: 'info' }); break;
      // The Veil: memories inside Astoria that belong to other people.
      case 'echo': arr(v).forEach((id) => Story.receive(id)); break;
      case 'takeEcho': arr(v).forEach((id) => Story.take(id)); break;
      case 'keepEcho': arr(v).forEach((id) => Story.keep(id)); break;
      case 'giveEcho': arr(v).forEach((id) => Story.give(id)); break;
      case 'self': Story.veil().self = Math.max(0, Story.veil().self + v); break;
      case 'ending': Story.end(v); break;
      case 'cutscene': bus.emit('story:cutscene', v); break;
      default: console.warn('Unknown effect', k);
    }
  }
}
