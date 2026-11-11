// Cross-screen flows: travel, approaching NPCs, hotspots, quests and letters.
// Screens call these so every route into a feature behaves the same way.
import { h, paras } from './dom.js';
import { icon, pico, PHASE_ICON } from './icons.js';
import { portrait, itemArt } from './art.js';
import { openSheet, Presenter, toast, chapterCard } from './overlay.js';
import { playCutscene } from './cutscene.js';
import { CUTSCENES } from '../data/songs.js';
import { playConversation } from './dialogue.js';
import { Router } from './app.js';
import { st, Game } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { NPCS, INVITES } from '../data/npcs.js';
import { NPC_DIALOGUE } from '../data/dialogue/index.js';
import { LOCATIONS } from '../data/locations.js';
import { ITEMS } from '../data/items.js';
import { QUESTS, QUEST_TYPES } from '../data/quests.js';
import { LETTERS } from '../data/lore.js';
import { NPCs } from '../systems/NPCManager.js';
import { World } from '../systems/WorldManager.js';
import { Quests } from '../systems/QuestManager.js';
import { Inventory } from '../systems/InventoryManager.js';
import { Relationships } from '../systems/RelationshipEngine.js';
import { Notifications } from '../systems/NotificationManager.js';
import { Time, PHASES } from '../systems/TimeManager.js';
import { applyFx } from '../systems/Effects.js';
import { check } from '../systems/Conditions.js';
import { Story } from '../systems/StoryManager.js';

const commit = (r) => Game.commit(r);

export const Actions = {
  // ------------------------------------------------------------ travel
  travel(loc, { then = null } = {}) {
    const s = st();
    if (!s.discovered[loc]) { toast({ text: 'You have not discovered that place yet.' }); return; }
    const moving = s.location !== loc;
    const events = World.travel(loc);
    if (moving) bus.emit('sfx', 'travel');
    commit('travel');
    Router.go('location', { loc }, { replace: Router.current.name === 'location' });
    if (moving) toast({ text: `${LOCATIONS[loc].name} — ${Time.phaseName()}`, kind: 'location' });
    this.presentArrival(events);
    if (then) Presenter.enqueue((done) => { then(); done(); });
  },

  linger() {
    const events = World.linger();
    commit('linger');
    toast({ text: `Time passes… ${Time.label()}`, kind: 'info' });
    this.presentArrival(events);
  },

  presentArrival(events) {
    for (const ev of events) {
      if (ev.type === 'hangout') {
        Presenter.enqueue((done) => {
          const id = ev.npc;
          const scene = NPCs.completeHangout(id);
          st().stats.hangouts = (st().stats.hangouts || 0) + 1;
          commit('hangout');
          openSheet({
            title: `Time with ${NPCS[id].name}`,
            subtitle: 'An appointment kept',
            art: portrait(id, 'sheet-portrait'),
            body: h('div', { class: 'prose' }, ...paras(scene), h('p', { class: 'muted small' }, `${NPCS[id].name} will remember that you came.`)),
            onClose: done,
          });
        });
      } else if (ev.type === 'approach') {
        const a = ev.approach;
        NPCs.markApproach(a.id);
        commit('approach');
        playConversation(a.convo, { npc: a.npc, intro: a.banner, onEnd: () => { NPCs.onTalked(a.npc); commit('talk'); } });
      } else if (ev.type === 'overheard') {
        Presenter.enqueue((done) => {
          const lines = ev.data.lines;
          lines.forEach((l) => bus.emit('noop', l));
          st().flags[`heard_${ev.data.loc}_${ev.data.phase}_${ev.data.npcs.join('_')}`] = true;
          openSheet({
            title: 'Overheard',
            subtitle: 'Voices nearby, not meant for you',
            art: h('div', { class: 'duo' }, ...ev.data.npcs.map((n) => portrait(n, 'mini'))),
            body: h('div', { class: 'prose overheard' }, ...lines.map((l) => h('p', {}, l))),
            onClose: done,
          });
        });
      }
    }
  },

  // ------------------------------------------------------------ targets
  goTarget(target) {
    if (!target) return;
    const s = st();
    if (target.screen) { Router.go(target.screen); return; }
    if (target.npc) {
      const w = NPCs.whereIs(target.npc);
      if (!w.loc) { toast({ text: `No one knows where ${NPCs.displayName(target.npc) === '???' ? 'they are' : NPCS[target.npc].name + ' is'} right now. Try another time of day.` }); return; }
      if (!s.discovered[w.loc]) { toast({ text: 'They are somewhere you have not yet discovered.' }); return; }
      if (s.location === w.loc) { Router.go('location', { loc: w.loc }); this.openNpc(target.npc); return; }
      this.travel(w.loc, { then: () => { if (NPCs.whereIs(target.npc).loc === st().location) this.openNpc(target.npc); } });
      return;
    }
    if (target.loc) {
      if (!s.discovered[target.loc]) { toast({ text: 'You have not discovered that place yet.' }); return; }
      if (s.location === target.loc) {
        Router.go('location', { loc: target.loc, focus: target.hs || null });
      } else {
        this.travel(target.loc);
        Router.setParams({ focus: target.hs || null });
      }
    }
  },

  // ------------------------------------------------------------ NPC interaction
  openNpc(id, view = 'menu') {
    const s = st();
    const d = NPCS[id];
    const n = s.npcs[id];
    const tier = Relationships.tier(id);
    const sheet = openSheet({
      title: n.met ? d.name : '???',
      subtitle: n.met ? `${d.title} · ${tier.label}` : d.title,
      art: portrait(id, 'sheet-portrait'),
      cls: 'npc-sheet',
    });
    const render = (v, data) => {
      sheet.setBody(this.npcView(id, v, data, sheet, render));
    };
    render(view);
    bus.emit('sfx', 'open');
    import('../systems/AudioManager.js').then(({ Audio }) => Audio.npcCue(d.motif));
    return sheet;
  },

  npcView(id, view, data, sheet, render) {
    const s = st();
    const d = NPCS[id];
    const n = s.npcs[id];
    const back = h('button', { class: 'btn ghost small back-btn', onclick: () => render('menu') }, icon('chevL'), 'Back');
    const talkThen = (convo, after) => {
      sheet.close();
      playConversation(convo, { npc: id, onEnd: () => { if (after) after(); NPCs.onTalked(id); commit('talk'); this.openNpc(id); } });
    };

    if (view === 'menu') {
      const greet = h('div', { class: 'greeting' }, NPCs.greeting(id));
      if (NPCs.isAvoiding(id)) {
        return h('div', {}, greet, h('p', { class: 'muted' }, `${d.name} is avoiding you. Give it time — or try again tomorrow.`),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn ghost', onclick: () => sheet.close() }, 'Leave'), h('button', { class: 'btn ghost', onclick: () => { sheet.close(); Router.go('character', { id }); } }, 'Profile')));
      }
      const offers = Quests.offersFor(id);
      const actives = Quests.activeFor(id);
      const secrets = NPCs.secrets(id).filter((x) => x.unlocked && !x.seen);
      const topics = n.met ? NPCs.topics(id) : [];
      const giftable = Inventory.list('gift');
      const showable = Inventory.list().filter((i) => ['quest', 'collectible', 'book', 'magical'].includes(i.cat));
      const btn = (ic, label, fn, opts = {}) => h('button', { class: `act-btn${opts.hot ? ' hot' : ''}`, disabled: opts.disabled || false, onclick: fn }, ic === 'gift' ? pico('gift', 'pico act-pico') : icon(ic), h('span', {}, label), opts.badge ? h('span', { class: 'badge' }, opts.badge) : null);
      const grid = h('div', { class: 'act-grid' },
        btn('talk', n.met ? 'Talk' : 'Approach', () => {
          const t = NPCs.talkTarget(id);
          if (t.convo) talkThen(t.convo);
          else render('line', t.line);
        }, { hot: !n.met || NPC_DIALOGUE[id].story.some((x) => check(x.cond)) }),
        n.met ? btn('ask', 'Ask about…', () => render('topics'), { badge: topics.filter((t) => !t.locked).length || null }) : null,
        n.met ? btn('gift', 'Give a gift', () => render('gift'), { disabled: !giftable.length }) : null,
        n.met ? btn('invite', 'Invite', () => render('invite'), { disabled: !!n.rendezvous }) : null,
        n.met ? btn('scroll', 'Requests', () => render('requests'), { badge: offers.length || null, hot: offers.length > 0 }) : null,
        n.met ? btn('eye', 'Show an item', () => render('show'), { disabled: !showable.length }) : null,
        n.met ? btn('heart', 'Heart-to-Heart', () => render('hearts'), { badge: NPCs.heartsReady(id) || null, hot: NPCs.heartsReady(id) > 0 }) : null,
        n.met ? btn('secret', 'Secrets', () => render('secrets'), { badge: secrets.length || null, hot: secrets.length > 0 }) : null,
        n.met && NPCs.partyEligible(id) ? btn('party', s.party.includes(id) ? 'Leave party' : 'Join party', () => {
          if (!NPCs.togglePartyMember(id)) toast({ text: 'Your party is full (two companions).' });
          commit('party'); render('menu');
        }) : null,
        n.met ? btn('characters', 'Profile', () => { sheet.close(); Router.go('character', { id }); }) : null,
      );
      const extra = [];
      if (n.rendezvous) extra.push(h('div', { class: 'note-line' }, icon('clock'), `Appointment: ${LOCATIONS[n.rendezvous.loc].short}, ${PHASES[n.rendezvous.phase]} (day ${n.rendezvous.day}).`));
      if (actives.length) extra.push(h('div', { class: 'note-line' }, icon('quests'), `Your quest for ${d.name}: ${actives[0].title}`));
      return h('div', {}, greet, ...extra, grid);
    }

    if (view === 'line') {
      return h('div', {}, h('div', { class: 'greeting' }, data), h('div', { class: 'btn-row' }, back));
    }

    if (view === 'topics') {
      const topics = NPCs.topics(id);
      return h('div', {}, back, h('h3', { class: 'sub-h' }, 'Ask about…'),
        topics.length ? h('div', { class: 'list' }, ...topics.map((t) => (t.locked
          ? h('button', { class: 'list-btn locked', 'aria-disabled': 'true', onclick: () => { bus.emit('sfx', 'locked'); toast({ text: `Not yet. Needs: ${t.need.join(' · ')}`, kind: 'info' }); } }, icon('lock'), h('span', { class: 'lb-text' }, t.label, h('span', { class: 'lock-need' }, t.need.join(' · '))))
          : h('button', { class: 'list-btn', onclick: () => { NPCs.markTopic(id, t.id); talkThen(t.convo); } }, icon('ask'), h('span', {}, t.label), n.topicsSeen[t.id] ? h('span', { class: 'muted small' }, 'asked') : h('span', { class: 'new-dot' })))))
          : h('p', { class: 'muted' }, 'Nothing new to ask right now.'));
    }

    if (view === 'gift') {
      const items = Inventory.list('gift');
      if (!NPCs.canGiftToday(id)) return h('div', {}, back, h('p', { class: 'greeting' }, NPC_DIALOGUE[id].gifts.again));
      return h('div', {}, back, h('h3', { class: 'sub-h' }, `A gift for ${d.name}`),
        h('p', { class: 'muted small' }, 'One gift per day. Learn what they like by paying attention.'),
        h('div', { class: 'item-grid compact' }, ...items.map((it) => {
          const known = n.likesKnown.includes(it.id) ? 'liked' : n.dislikesKnown.includes(it.id) ? 'disliked' : null;
          return h('button', { class: 'item-cell', onclick: () => {
            const res = NPCs.giveGift(id, it.id);
            commit('gift');
            render('giftResult', res);
          } }, itemArt(it.glyph, it.cat), h('span', { class: 'item-name' }, it.name), h('span', { class: 'qty' }, `×${it.qty}`), known ? h('span', { class: `known ${known}` }, known === 'liked' ? '♥' : '✕') : null);
        })));
    }

    if (view === 'giftResult') {
      const cls = { love: 'gift-love', like: 'gift-like', dislike: 'gift-dislike' }[data?.tier] || '';
      return h('div', {}, h('div', { class: `greeting ${cls}` }, data?.text || ''), h('div', { class: 'btn-row' }, back));
    }

    if (view === 'invite') {
      const opts = NPCs.inviteOptions(id);
      const nextPhase = PHASES[(s.time.phase + 1) % 4];
      return h('div', {}, back, h('h3', { class: 'sub-h' }, `Invite ${d.name} somewhere`),
        h('p', { class: 'muted small' }, `You'll meet in the ${nextPhase}. If you don't turn up, ${d.name} will remember.`),
        h('div', { class: 'list' }, ...opts.map((loc) => h('button', { class: 'list-btn', onclick: () => {
          const res = NPCs.invite(id, loc);
          if (res.ok) Notifications.notice(`${d.name} will meet you at ${LOCATIONS[loc].name} (${PHASES[res.when.phase]}).`, 'npc', { npc: id });
          commit('invite');
          render('inviteResult', res);
        } }, icon('pin'), h('span', {}, LOCATIONS[loc].name)))));
    }

    if (view === 'inviteResult') {
      return h('div', {}, h('div', { class: `greeting ${data.ok ? 'gift-like' : ''}` }, data.text),
        data.ok ? h('div', { class: 'note-line' }, icon('clock'), `Meet at the agreed place in the ${PHASES[data.when.phase]}. Travelling there will take you to that time.`) : null,
        h('div', { class: 'btn-row' }, back));
    }

    if (view === 'requests') {
      const offers = Quests.offersFor(id);
      const actives = Quests.activeFor(id);
      const done = Quests.list((q) => q.npc === id && q.state.status === 'done');
      return h('div', {}, back, h('h3', { class: 'sub-h' }, 'Requests'),
        ...offers.map((q) => h('div', { class: 'offer panel-inset' },
          h('div', { class: 'offer-title' }, q.title),
          h('p', { class: 'greeting' }, q.offer.text),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn ghost small', onclick: () => render('menu') }, 'Not now'),
            h('button', { class: 'btn primary small', onclick: () => { Quests.start(q.id); commit('quest'); render('requests'); } }, 'Accept')))),
        ...actives.map((q) => h('div', { class: 'offer panel-inset' },
          h('div', { class: 'offer-title' }, q.title, h('span', { class: 'chip' }, 'In progress')),
          h('ul', { class: 'obj-list' }, ...q.objectives.map((o) => h('li', { class: q.state.objs[o.id] ? 'done' : '' }, icon(q.state.objs[o.id] ? 'check' : 'sparkle'), o.text))),
          h('button', { class: 'btn ghost small', onclick: () => { sheet.close(); this.openQuest(q.id); } }, 'Quest details'))),
        ...done.map((q) => h('div', { class: 'offer panel-inset done' }, h('div', { class: 'offer-title' }, q.title, h('span', { class: 'chip gold' }, 'Complete')))),
        !offers.length && !actives.length && !done.length ? h('p', { class: 'muted' }, `${d.name} has nothing to ask of you — yet. Bonds and story progress open new requests.`) : null);
    }

    if (view === 'show') {
      const items = Inventory.list().filter((i) => ['quest', 'collectible', 'book', 'magical'].includes(i.cat));
      return h('div', {}, back, h('h3', { class: 'sub-h' }, `Show ${d.name} something`),
        h('div', { class: 'item-grid compact' }, ...items.map((it) => h('button', { class: 'item-cell', onclick: () => talkThen(NPCs.showConvo(id, it.id)) },
          itemArt(it.glyph, it.cat), h('span', { class: 'item-name' }, it.name)))));
    }

    if (view === 'hearts') {
      const list = NPCs.hearts(id);
      return h('div', {}, back, h('h3', { class: 'sub-h' }, `Heart-to-Heart with ${d.name}`),
        h('p', { class: 'muted small' }, `Private moments with ${d.name}. Finish all three to open a hidden ending.`),
        h('div', { class: 'list' }, ...list.map((x) => (x.unlocked || x.seen
          ? h('button', { class: 'list-btn heart-btn', onclick: () => talkThen(x.convo) }, icon('heart'), h('span', {}, `${x.n}. ${x.title}`), x.seen ? h('span', { class: 'muted small' }, 'revisit') : h('span', { class: 'new-dot' }))
          : h('button', { class: 'list-btn locked', 'aria-disabled': 'true', onclick: () => { bus.emit('sfx', 'locked'); toast({ text: `Not yet: ${x.hint}`, kind: 'info' }); } }, icon('lock'), h('span', { class: 'lb-text' }, `${x.n}. ???`, h('span', { class: 'muted small' }, ` — ${x.hint}`)))))));
    }

    if (view === 'secrets') {
      const list = NPCs.secrets(id);
      return h('div', {}, back, h('h3', { class: 'sub-h' }, 'Secrets'),
        h('div', { class: 'list' }, ...list.map((x) => x.unlocked
          ? h('button', { class: 'list-btn', onclick: () => { NPCs.markSecret(id, x.id); talkThen(x.convo); } }, icon('secret'), h('span', {}, x.label), x.seen ? h('span', { class: 'muted small' }, 'revisit') : h('span', { class: 'new-dot' }))
          : h('button', { class: 'list-btn locked', 'aria-disabled': 'true', onclick: () => { bus.emit('sfx', 'locked'); toast({ text: `This secret needs: ${x.need.join(' · ')}`, kind: 'info' }); } }, icon('lock'), h('span', { class: 'lb-text' }, '???', h('span', { class: 'lock-need' }, x.need.join(' · ') || 'Deepen your bond'))))));
    }
    return h('div', {});
  },

  // ------------------------------------------------------------ hotspots
  openHotspot(loc, hsId) {
    const res = World.interact(loc, hsId);
    commit('hotspot');
    if (!res) return;
    if (res.openShop) { Router.go('shop'); return; }
    if (res.convo) { playConversation(res.convo, { onEnd: () => commit('hotspot-convo') }); return; }
    const body = h('div', { class: 'prose' }, ...paras(res.text));
    if (res.extra) body.appendChild(h('p', { class: 'overheard' }, res.extra));
    if (res.partyLine) body.appendChild(h('div', { class: 'party-line' }, portrait(res.partyLine.npc, 'mini'), h('p', {}, res.partyLine.text)));
    const sheet = openSheet({ title: res.title, subtitle: LOCATIONS[loc].name, body, cls: 'hotspot-sheet' });
    if (res.goto) body.appendChild(h('div', { class: 'btn-row' }, h('button', { class: 'btn primary', onclick: () => { sheet.close(); this.travel(res.goto); } }, res.gotoLabel || `Go to ${LOCATIONS[res.goto].name}`, icon('chevR'))));
    if (res.choices?.length) {
      const box = h('div', { class: 'list choices' }, ...res.choices.map((c) => h('button', { class: 'list-btn', onclick: () => {
        const out = World.choose(c);
        commit('hotspot-choice');
        sheet.setBody(h('div', { class: 'prose' }, ...paras(out), h('div', { class: 'btn-row' }, h('button', { class: 'btn primary', onclick: () => sheet.close() }, 'Continue'))));
      } }, icon('chevR'), h('span', {}, c.t), c.path ? h('span', { class: `path-tag path-${c.path}` }, c.path) : null)));
      body.appendChild(box);
    }
  },

  // ------------------------------------------------------------ quests
  openQuest(qid) {
    const q = QUESTS[qid];
    const sq = st().quests[qid];
    if (!q || !sq) return;
    const done = sq.status === 'done';
    const giver = q.npc || q.giver;
    const body = h('div', { class: 'quest-detail' },
      h('div', { class: 'chips' }, h('span', { class: `chip type-${q.type}` }, QUEST_TYPES[q.type]), q.chapter ? h('span', { class: 'chip' }, `Chapter ${q.chapter} — ${q.chapterTitle}`) : null, h('span', { class: `chip ${done ? 'gold' : ''}` }, done ? 'Complete' : 'In progress')),
      h('p', { class: 'quest-desc' }, q.desc),
      h('div', { class: 'meta-row' }, icon('pin'), LOCATIONS[q.loc]?.name || '—', giver ? [icon('characters'), NPCs.displayName(giver) === '???' ? 'Someone' : NPCS[giver].name] : null),
      h('h3', { class: 'sub-h' }, 'Objectives'),
      h('ul', { class: 'obj-list big' }, ...q.objectives.map((o) => {
        const isDone = !!sq.objs[o.id];
        const prog = Quests.objectiveProgress(qid, o);
        return h('li', { class: isDone ? 'done' : '' },
          icon(isDone ? 'check' : 'sparkle'),
          h('div', { class: 'obj-text' }, o.text, prog && !isDone ? h('span', { class: 'prog' }, prog) : null, o.note && !isDone ? h('div', { class: 'muted small' }, o.note) : null),
          !isDone && !done && o.target ? h('button', { class: 'btn small primary', onclick: () => { sheet.close(); this.goTarget(o.target); } }, 'Go', icon('chevR')) : null);
      })),
      h('h3', { class: 'sub-h' }, 'Rewards'),
      h('div', { class: 'rewards' }, ...rewardChips(q.rewards)),
      done && q.complete ? h('div', { class: 'completion' }, h('h3', { class: 'sub-h' }, 'Completion'), ...q.complete.lines.map((l) => h('p', { class: 'greeting' }, l))) : null,
    );
    const sheet = openSheet({ title: q.title, subtitle: q.type === 'main' ? 'Main Quest' : `${QUEST_TYPES[q.type]} Quest`, body, art: giver ? portrait(giver, 'sheet-portrait') : null, cls: 'quest-sheet' });
  },

  // ------------------------------------------------------------ letters
  openLetter(id) {
    const def = LETTERS[id];
    Notifications.openLetter(id, applyFx);
    commit('letter');
    bus.emit('sfx', 'letter');
    openSheet({
      title: def.title,
      subtitle: def.from ? `From ${NPCS[def.from].name}` : 'Unsigned',
      art: def.from ? portrait(def.from, 'sheet-portrait') : h('div', { class: 'seal' }, def.seal),
      cls: 'letter-sheet',
      body: h('div', { class: 'parchment' }, ...def.body.split('\n\n').map((p) => h('p', {}, ...p.split('\n').flatMap((ln, i) => (i ? [h('br'), ln] : [ln])))), h('div', { class: 'wax' }, def.seal)),
    });
  },
};

export function rewardChips(r = {}) {
  const out = [];
  if (r.exp) out.push(h('span', { class: 'reward' }, icon('sparkle'), `${r.exp} EXP`));
  if (r.crowns) out.push(h('span', { class: 'reward' }, icon('crown'), `${r.crowns} Crowns`));
  if (r.moonstones) out.push(h('span', { class: 'reward' }, icon('moonstone'), `${r.moonstones} Moonstones`));
  if (r.item) Object.keys(r.item).forEach((i) => out.push(h('span', { class: 'reward' }, icon('inventory'), ITEMS[i].name)));
  if (r.outfit) out.push(h('span', { class: 'reward' }, icon('wardrobe'), 'Outfit'));
  if (r.rel) Object.keys(r.rel).forEach((n) => out.push(h('span', { class: 'reward' }, icon('heart'), `Bond with ${NPCS[n].name}`)));
  if (r.partyOk) out.push(h('span', { class: 'reward' }, icon('party'), 'Companion'));
  if (r.memory) out.push(h('span', { class: 'reward' }, icon('journal'), 'Memory'));
  if (r.flag || r.solve) out.push(h('span', { class: 'reward' }, icon('secret'), 'A secret'));
  return out;
}

// "Previously…": a short reminder for players coming back after a break.
export function showRecap() {
  const lines = Story.recapLines();
  const q = Quests.trackedMain();
  if (!lines.length && !q) return;
  Presenter.enqueue((done) => openSheet({
    title: 'Previously…', subtitle: Story.nightsLabel(), cls: 'recap-sheet',
    art: h('div', { class: 'seal big' }, icon('moon')),
    body: h('div', {},
      ...lines.map((l) => h('p', { class: 'greeting' }, l)),
      q && q.state.status === 'active' ? h('p', { class: 'recap-q' }, h('span', {}, `Chapter ${q.chapter} asks: `), q.question || q.title) : null,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn primary', onclick: () => document.querySelector('.recap-sheet .sheet-close')?.click() }, 'Continue'))),
    onClose: done,
  }));
}

// Story moments wait until the player has read and closed the place they just examined.
function afterHotspotSheet(done) {
  const tick = () => (document.querySelector('.sheet-backdrop:not(.closing) .hotspot-sheet') ? setTimeout(tick, 150) : done());
  setTimeout(tick, 40);
}

// The "what now?" banner: the next story step, one tap away.
let nextTimer = null;
export function showNextStep(qid) {
  document.querySelector('.next-step')?.remove();
  clearTimeout(nextTimer);
  if (st().quests[qid]?.status !== 'active') return;
  const next = Quests.nextObjective(qid);
  if (!next) return;
  const q = QUESTS[qid];
  const close = () => { bar.remove(); clearTimeout(nextTimer); };
  const bar = h('div', { class: 'next-step', role: 'status' },
    h('div', { class: 'ns-text' }, h('div', { class: 'ns-k' }, `Chapter ${q.chapter} · Next`), h('div', { class: 'ns-t' }, next.text)),
    next.target ? h('button', { class: 'btn primary small', onclick: () => { close(); Actions.goTarget(next.target); } }, 'Go', icon('chevR')) : null,
    h('button', { class: 'ns-x', 'aria-label': 'Dismiss', onclick: close }, icon('close')));
  document.body.appendChild(bar);
  nextTimer = setTimeout(close, 14000);
}

// Quest completion scenes are queued so they never interrupt a conversation.
export function initPresentation() {
  // A chapter opens on a title card (its question, the nights left), then its opening scene.
  bus.on('quest:start', (qid) => {
    const q = QUESTS[qid];
    if (q?.type !== 'main') return;
    Presenter.enqueue(afterHotspotSheet);
    Presenter.enqueue((done) => chapterCard({ num: q.chapter, title: q.chapterTitle, question: q.question, nights: Story.nightsLabel() }, done));
    if (q.startScene) playConversation(q.startScene, { onEnd: () => commit('chapter-start') });
    Presenter.enqueue((done) => { showNextStep(qid); done(); });
  });
  // After each step of the main story, offer the next one in a single tap.
  bus.on('quest:objective', (qid) => {
    if (QUESTS[qid]?.type !== 'main') return;
    Presenter.enqueue(afterHotspotSheet);
    Presenter.enqueue((done) => { showNextStep(qid); done(); });
  });
  // Song cutscenes play unskippably, then carry on somewhere (see data/songs.js).
  bus.on('story:cutscene', (id) => {
    const next = CUTSCENES[id]?.then || {};
    playCutscene(id, () => {
      if (next.goto) Actions.travel(next.goto);
      if (next.convo) playConversation(next.convo, { onEnd: () => commit('cutscene') });
    });
  });
  // The story's endings hand over to the ending screen once the final scene closes.
  bus.on('story:ending', () => {
    Presenter.enqueue((done) => { Router.go('ending'); done(); });
  });
  bus.on('quest:complete', (qid) => {
    const q = QUESTS[qid];
    // A chapter closes on its dramatic moment (often a dilemma) before the summary.
    if (q.endScene) { Presenter.enqueue(afterHotspotSheet); playConversation(q.endScene, { onEnd: () => commit('chapter-end') }); }
    if (q.noSheet) return;
    Presenter.enqueue((done) => {
      const speaker = q.complete?.speaker && NPCS[q.complete.speaker] ? q.complete.speaker : null;
      openSheet({
        title: q.type === 'main' ? `Chapter ${q.chapter} Complete` : 'Quest Complete',
        subtitle: q.title,
        cls: 'complete-sheet',
        art: speaker ? portrait(speaker, 'sheet-portrait') : h('div', { class: 'seal big' }, icon('sparkle')),
        body: h('div', {},
          ...(q.complete?.lines || []).map((l) => h('p', { class: 'greeting' }, l)),
          h('h3', { class: 'sub-h' }, 'Rewards'),
          h('div', { class: 'rewards' }, ...rewardChips(q.rewards))),
        onClose: done,
      });
    });
  });
  bus.on('toast', (t) => toast(t));
}
