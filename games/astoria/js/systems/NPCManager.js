// NPCManager — where everyone is, what they're doing, how they react to Astoria
// (talk, gifts, invitations, items shown), what they remember, and when they
// come to her on their own: approaches, letters and missed appointments.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { NPCS, NPC_ORDER, INVITES, GREETINGS, APPROACHES, OVERHEARD } from '../data/npcs.js';
import { NPC_DIALOGUE } from '../data/dialogue/index.js';
import { EVENTS } from '../data/events.js';
import { check, describe, galaActive } from './Conditions.js';
import { Relationships } from './RelationshipEngine.js';
import { Inventory } from './InventoryManager.js';
import { Notifications } from './NotificationManager.js';
import { Events } from './EventManager.js';
import { Time } from './TimeManager.js';
import { applyFx, remember } from './Effects.js';
import { ITEMS } from '../data/items.js';
import { HEARTS } from '../data/hearts.js';

function hash(n) {
  let x = (n * 2654435761) >>> 0;
  x ^= x >>> 13; x = Math.imul(x, 1274126177) >>> 0; x ^= x >>> 16;
  return x >>> 0;
}

const UNKNOWN = { loc: null, spot: 'Unknown', act: 'Whereabouts unknown' };

export const NPCs = {
  def(id) { return NPCS[id]; },
  state(id) { return st().npcs[id]; },
  all() { return NPC_ORDER; },

  // ---------- schedules ----------
  whereIs(id, day = st().time.day, phase = st().time.phase) {
    const s = st();
    const n = s.npcs[id];
    const d = NPCS[id];
    const now = day === s.time.day && phase === s.time.phase;

    if (now && s.party.includes(id)) return { loc: s.location, spot: 'With you', act: 'Travelling with you', party: true };
    const r = n.rendezvous;
    if (r && r.day === day && r.phase === phase) return { loc: r.loc, spot: 'Waiting for you', act: 'Waiting for you, as promised', rendezvous: true };

    // Story overrides
    if (id === 'seraphine' && !n.met) return { loc: 'cathedral', spot: 'Main hall', act: 'Lighting candles in the main hall' };
    if (now && s.quests.mq4?.status === 'active' && !s.quests.mq4.objs.attend && phase >= 2 && ['evelyne', 'lucien', 'cael'].includes(id)) {
      return { loc: 'ballroom', spot: 'The masquerade', act: 'At the Velvet Masquerade' };
    }
    if (id === 'lucien' && phase === 2 && galaActive() && !s.flags.gala_quest_done && n.met) {
      return { loc: 'ballroom', spot: 'Gallery stairs', act: 'Watching the Moonlit Gala from the gallery stairs' };
    }

    if (d.wanderer) {
      if (!n.met) return UNKNOWN;
      const spots = d.wanderSpots;
      return spots[hash(day * 4 + phase + 7) % spots.length];
    }

    let e = d.schedule[phase];
    if (e.odd && day % 2 === 1) e = e.odd;
    if (e.hidden) {
      const h = e.hidden;
      if (h.every) {
        if (day % h.every === 0) return s.flags[h.flag] ? h : UNKNOWN;
      } else if (s.flags[h.flag]) {
        return h;
      }
    }
    return e;
  },

  // NPCs Astoria could see at a location right now (met ones, and strangers who can be met).
  presentAt(loc) {
    return NPC_ORDER.filter((id) => {
      const w = this.whereIs(id);
      if (w.loc !== loc) return false;
      if (st().npcs[id].met) return true;
      if (NPCS[id].wanderer) return false;
      return check(NPC_DIALOGUE[id].introCond);
    });
  },

  isAvoiding(id) { return st().time.day <= st().npcs[id].avoidUntil; },

  displayName(id) { return st().npcs[id].met ? NPCS[id].name : '???'; },

  greeting(id) {
    const g = GREETINGS[id].find((x) => check(x.cond));
    return g ? g.text : '';
  },

  // ---------- interaction menu ----------
  talkTarget(id) {
    const s = st();
    const d = NPC_DIALOGUE[id];
    const n = s.npcs[id];
    if (this.isAvoiding(id)) return { line: `${NPCS[id].name} sees you coming, and turns away. It seems you'll have to give it time.` };
    if (!n.met) {
      if (check(d.introCond)) return { convo: d.intro };
      return { line: d.notYet || '…' };
    }
    const story = d.story.find((x) => check(x.cond));
    if (story) return { convo: story.convo };
    const q = EVENTS.gala.quest;
    if (id === q.npc && s.location === q.loc && galaActive() && !Events.questDone()) return { convo: q.convo };
    const idx = (s.time.day + (n.lastTalkDay === s.time.day ? 1 : 0)) % d.smalltalk.length;
    return { convo: d.smalltalk[idx] };
  },

  onTalked(id) {
    const s = st();
    const n = s.npcs[id];
    s.stats.talks += 1;
    if (n.met && n.lastTalkDay !== s.time.day) {
      n.lastTalkDay = s.time.day;
      Relationships.change(id, { affinity: 1, friendship: 1 });
    }
    if (s.location === 'ballroom' && galaActive() && !Events.dailyDone('masked')) {
      Events.markDaily('masked');
      Events.addPoints(3);
    }
  },

  topics(id) {
    const d = NPC_DIALOGUE[id];
    const n = st().npcs[id];
    // `req` keeps a topic visible but locked, with a plain-English hint of what it needs.
    return d.topics.filter((t) => check(t.cond) && !(t.once && n.topicsSeen[t.id]))
      .map((t) => (t.req && !check(t.req) ? { ...t, locked: true, need: t.hint ? [t.hint] : describe(t.req) } : t));
  },

  markTopic(id, topicId) { st().npcs[id].topicsSeen[topicId] = true; },

  secrets(id) {
    const d = NPC_DIALOGUE[id];
    return d.secrets.map((x) => ({ ...x, unlocked: check(x.cond), seen: !!st().npcs[id].secretsSeen[x.id], need: x.hint ? [x.hint] : describe(x.cond) }));
  },

  markSecret(id, sid) { st().npcs[id].secretsSeen[sid] = true; },

  // Heart-to-Hearts: three private scenes; each opens after the one before.
  hearts(id) {
    const s = st();
    return (HEARTS[id] || []).map((x, i, all) => {
      const seen = !!s.flags[`heart_${id}_${x.n}`];
      const prevDone = i === 0 || !!s.flags[`heart_${id}_${all[i - 1].n}`];
      return { ...x, seen, unlocked: prevDone && !!s.npcs[id]?.met && check(x.cond) };
    });
  },
  heartsReady(id) { return this.hearts(id).filter((x) => x.unlocked && !x.seen).length; },

  showConvo(id, item) {
    const d = NPC_DIALOGUE[id];
    return d.show[item] || d.show.default;
  },

  // ---------- gifts ----------
  canGiftToday(id) { return st().npcs[id].lastGiftDay !== st().time.day; },

  giveGift(id, item) {
    const s = st();
    const n = s.npcs[id];
    const d = NPCS[id];
    const lines = NPC_DIALOGUE[id].gifts;
    if (!Inventory.has(item)) return null;
    if (!this.canGiftToday(id)) return { tier: 'again', text: lines.again };
    Inventory.remove(item, 1);
    n.lastGiftDay = s.time.day;
    s.stats.gifts += 1;
    let tier = 'neutral'; let delta = { affinity: 2 };
    if (d.loves.includes(item)) { tier = 'love'; delta = { affinity: 9, trust: 3, friendship: 3 }; }
    else if (d.likes.includes(item)) { tier = 'like'; delta = { affinity: 5, friendship: 2 }; }
    else if (d.dislikes.includes(item)) { tier = 'dislike'; delta = { affinity: -4 }; }
    Relationships.change(id, delta);
    remember(id, `gift:${item}`);
    if ((tier === 'love' || tier === 'like') && !n.likesKnown.includes(item)) n.likesKnown.push(item);
    if (tier === 'dislike' && !n.dislikesKnown.includes(item)) n.dislikesKnown.push(item);
    Relationships.addHistory(id, `You gave ${d.name} ${ITEMS[item].name}${tier === 'love' ? ' — a favourite' : tier === 'dislike' ? ' — not well received' : ''}.`);
    return { tier, text: lines[tier] };
  },

  // ---------- invitations ----------
  inviteOptions(id) {
    return Object.keys(INVITES[id]).filter((loc) => st().discovered[loc]);
  },

  invite(id, loc) {
    const s = st();
    const n = s.npcs[id];
    const opt = INVITES[id][loc];
    s.stats.invites += 1;
    if (n.rendezvous) return { ok: false, text: `"We already have an appointment, Astoria."` };
    if (!opt.ok) return { ok: false, text: opt.no };
    if (n.affinity < 8 && !s.party.includes(id)) return { ok: false, text: `${NPCS[id].name} considers it. "Perhaps once we know each other a little better."` };
    let { day, phase } = s.time;
    phase += 1; if (phase > 3) { phase = 0; day += 1; }
    n.rendezvous = { loc, day, phase };
    remember(id, 'invited');
    return { ok: true, text: opt.yes, when: { day, phase } };
  },

  // Called when Astoria arrives somewhere (or lingers): returns a hangout if one is due.
  dueHangout(loc) {
    const s = st();
    for (const id of NPC_ORDER) {
      const r = s.npcs[id].rendezvous;
      if (r && r.loc === loc && r.day === s.time.day && r.phase === s.time.phase) return id;
    }
    return null;
  },

  completeHangout(id) {
    const s = st();
    const r = s.npcs[id].rendezvous;
    const loc = r.loc;
    s.npcs[id].rendezvous = null;
    applyFx({ rel: { [id]: { affinity: 5, trust: 3, friendship: 4 } }, history: { [id]: `Spent time together at ${loc === 'royal' ? 'the Royal District' : 'the ' + loc}.` } });
    remember(id, `hangout_${loc}`);
    return INVITES[id][loc].scene;
  },

  // Appointments that came and went without Astoria.
  checkMissed() {
    const s = st();
    const now = Time.stamp();
    for (const id of NPC_ORDER) {
      const r = s.npcs[id].rendezvous;
      if (r && Time.stamp(r.day, r.phase) < now) {
        s.npcs[id].rendezvous = null;
        remember(id, 'stood_up');
        Relationships.change(id, { affinity: -6, trust: -4 });
        Relationships.addHistory(id, 'You did not keep your appointment.');
        s.npcs[id].avoidUntil = s.time.day;
        Notifications.notice(`You missed your appointment with ${NPCS[id].name}. They will remember.`, 'npc', { npc: id });
        if (id === 'lucien') Notifications.sendLetter('letter_lucien_cold');
      }
    }
  },

  // ---------- NPC-initiated moments ----------
  dueApproach(loc) {
    const s = st();
    for (const a of APPROACHES) {
      if (s.flags[`approach_${a.id}`]) continue;
      if (!check(a.cond)) continue;
      if (a.needPresent && this.whereIs(a.npc).loc !== loc) continue;
      if (this.isAvoiding(a.npc)) continue;
      return a;
    }
    return null;
  },

  markApproach(id) { st().flags[`approach_${id}`] = true; },

  overheard(loc) {
    const s = st();
    const present = this.presentAt(loc).filter((id) => s.npcs[id].met);
    return OVERHEARD.filter((o) => o.loc === loc && o.phase === s.time.phase && o.npcs.every((n) => present.includes(n)));
  },

  dailyLetters() {
    const s = st();
    const once = (flag, cond, letter) => {
      if (!s.flags[flag] && cond) { s.flags[flag] = true; Notifications.sendLetter(letter); }
    };
    once('sent_cael_patrol', s.npcs.cael.met && s.npcs.cael.affinity >= 10, 'letter_cael_patrol');
    once('sent_evelyne_tea', s.npcs.evelyne.met && s.time.day >= 3, 'letter_evelyne_tea');
    once('sent_noctis_predict', s.npcs.noctis.met && s.chapter >= 3, 'letter_noctis_predict');
    once('sent_seraphine_violets', s.quests.mq1?.status === 'done' && s.time.day >= 2 && !s.quests.sq_violets, 'letter_seraphine_violets');
  },

  // What everyone is doing — powers the dashboard's "Elaria now" feed.
  feed() {
    const s = st();
    return NPC_ORDER.filter((id) => s.npcs[id].met).map((id) => {
      const w = this.whereIs(id);
      return { id, act: w.act, loc: w.loc, avoiding: this.isAvoiding(id), rendezvous: !!w.rendezvous, party: !!w.party };
    });
  },

  knownSchedule(id) {
    return [0, 1, 2, 3].map((p) => {
      const d = NPCS[id];
      if (d.wanderer) return { phase: p, text: 'Unpredictable', loc: null };
      let e = d.schedule[p];
      const alt = e.odd ? e.odd : null;
      if (e.hidden && !e.hidden.every) return { phase: p, text: st().flags[e.hidden.flag] ? e.hidden.spot : '???', loc: st().flags[e.hidden.flag] ? e.hidden.loc : null, secret: !st().flags[e.hidden.flag] };
      let text = e.spot;
      if (alt) text += ` · or ${alt.spot}`;
      if (e.hidden?.every) text += st().flags[e.hidden.flag] ? ` · sometimes ${e.hidden.spot}` : ' · sometimes ???';
      return { phase: p, text, loc: e.loc };
    });
  },

  // ---------- party ----------
  partyEligible(id) { return !!st().flags[`party_ok_${id}`] && st().npcs[id].met; },

  togglePartyMember(id) {
    const s = st();
    if (s.party.includes(id)) { s.party = s.party.filter((x) => x !== id); return true; }
    if (!this.partyEligible(id) || s.party.length >= 2) return false;
    s.party.push(id);
    bus.emit('toast', { text: `${NPCS[id].name} joins you.`, kind: 'npc' });
    return true;
  },

  init() {
    bus.on('time:phase', () => this.checkMissed());
    bus.on('time:day', () => this.dailyLetters());
  },
};
