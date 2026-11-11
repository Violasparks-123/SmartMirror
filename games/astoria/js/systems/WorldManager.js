// WorldManager — travel, time passing, and interacting with the world's
// hotspots. Returns "arrival events" (appointments, approaches, overheard
// conversations) for the UI to present in order.
import { st } from '../core/GameState.js';
import { LOCATIONS, GOSSIP } from '../data/locations.js';
import { check } from './Conditions.js';
import { Time } from './TimeManager.js';
import { Quests } from './QuestManager.js';
import { NPCs } from './NPCManager.js';
import { applyFx } from './Effects.js';
import { Journal } from './JournalManager.js';

export const World = {
  def(loc) { return LOCATIONS[loc]; },
  current() { return st().location; },

  travel(loc) {
    const s = st();
    if (!s.discovered[loc]) return [];
    if (loc === s.location) return this.arrive(loc, false);
    s.location = loc;
    s.stats.travels += 1;
    Time.advance(1);
    Journal.log(`Travelled to ${LOCATIONS[loc].name} (${Time.phaseName()}).`);
    return this.arrive(loc, true);
  },

  linger() {
    Time.advance(1);
    return this.arrive(st().location, true);
  },

  arrive(loc, moved) {
    const s = st();
    if (moved && s.time.phase === 3) s.stats.nightExplores += 1;
    Quests.checkArrival(loc);
    const events = [];
    const hang = NPCs.dueHangout(loc);
    if (hang) events.push({ type: 'hangout', npc: hang });
    const approach = NPCs.dueApproach(loc);
    if (approach) events.push({ type: 'approach', approach });
    if (moved) NPCs.overheard(loc).forEach((o) => events.push({ type: 'overheard', data: o }));
    return events;
  },

  ambient(loc = st().location) { return LOCATIONS[loc].ambient[st().time.phase]; },

  hotspots(loc) {
    return LOCATIONS[loc].hotspots.filter((h) => check(h.cond));
  },

  seenKey(loc, hs, i) { return `${loc}.${hs}.${i}`; },

  // Which variant of a hotspot applies right now.
  resolve(loc, hsId) {
    const s = st();
    const hs = LOCATIONS[loc].hotspots.find((h) => h.id === hsId);
    if (!hs) return null;
    const idx = hs.variants.findIndex((v, i) => (!v.once || !s.hotspots[this.seenKey(loc, hsId, i)]) && check(v.cond));
    if (idx < 0) return null;
    return { hs, v: hs.variants[idx], idx };
  },

  // Does this hotspot currently have something new? (Used to make it glow.)
  isFresh(loc, hsId) {
    const r = this.resolve(loc, hsId);
    if (!r) return false;
    return !!(r.v.fx || r.v.choices || r.v.convo || r.v.openShop) && !st().hotspots[this.seenKey(loc, hsId, r.idx)];
  },

  interact(loc, hsId) {
    const s = st();
    const r = this.resolve(loc, hsId);
    if (!r) return null;
    const { hs, v, idx } = r;
    const key = this.seenKey(loc, hsId, idx);
    s.hotspots[key] = (s.hotspots[key] || 0) + 1;
    const result = { title: v.title || hs.label, text: v.text, convo: v.convo, openShop: v.openShop, goto: v.goto, gotoLabel: v.gotoLabel };
    if (v.choices) result.choices = v.choices.filter((c) => check(c.cond));
    if (v.fx && !v.choices) applyFx(v.fx);
    if (v.gossip) result.extra = GOSSIP[s.time.day % GOSSIP.length];
    if (hs.party) {
      const who = s.party.find((p) => hs.party[p]);
      if (who) result.partyLine = { npc: who, text: hs.party[who] };
    }
    return result;
  },

  choose(choice) {
    if (choice.fx) applyFx(choice.fx);
    if (choice.path) applyFx({ path: choice.path });
    return choice.text;
  },
};
