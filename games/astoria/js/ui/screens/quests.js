// Quest log and the Journal / Memory Archive.
import { endingsGallery } from './ending.js';
import { openPrimer } from '../primer.js';
import { h, paras } from '../dom.js';
import { icon, pico } from '../icons.js';
import { portrait } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { Actions } from '../actions.js';
import { openSheet } from '../overlay.js';
import { st } from '../../core/GameState.js';
import { QUESTS, QUEST_TYPES } from '../../data/quests.js';
import { MEMORIES, MYSTERIES } from '../../data/lore.js';
import { LOCATIONS, LOCATION_ORDER } from '../../data/locations.js';
import { NPCS, NPC_ORDER } from '../../data/npcs.js';
import { EVENTS } from '../../data/events.js';
import { Quests } from '../../systems/QuestManager.js';
import { Journal } from '../../systems/JournalManager.js';
import { Events } from '../../systems/EventManager.js';
import { Relationships } from '../../systems/RelationshipEngine.js';
import { PHASES } from '../../systems/TimeManager.js';
import { Story } from '../../systems/StoryManager.js';
import { ECHOES } from '../../data/echoes.js';

const tabs = (list, cur, onPick) => h('div', { class: 'tabs scroll-x' }, ...list.map((t) => h('button', { class: `tab${t.id === cur ? ' active' : ''}`, onclick: () => onPick(t.id) }, t.name, t.count ? h('span', { class: 'tab-count' }, t.count) : null)));

function questCard(q) {
  const sq = q.state;
  const total = q.objectives.length;
  const doneN = Object.keys(sq.objs).length;
  const next = Quests.nextObjective(q.id);
  return h('button', { class: `quest-row panel type-${q.type}${sq.status === 'done' ? ' done' : ''}`, onclick: () => Actions.openQuest(q.id) },
    h('div', { class: 'qr-head' }, h('span', { class: `chip type-${q.type}` }, q.type === 'main' ? `Chapter ${q.chapter}` : QUEST_TYPES[q.type]), h('span', { class: 'qr-title' }, q.title)),
    sq.status === 'done' ? h('div', { class: 'muted small' }, 'Complete') : h('div', { class: 'qr-next' }, icon('sparkle'), next?.text || ''),
    h('div', { class: 'dots' }, ...q.objectives.map((o) => h('span', { class: `dot${sq.objs[o.id] ? ' on' : ''}` }))),
    h('span', { class: 'qr-count muted small' }, `${doneN}/${total}`));
}

registerScreen('quests', {
  render(params) {
    const tab = params.tab || 'active';
    const active = Quests.list((q) => q.state.status === 'active');
    const done = Quests.list((q) => q.state.status === 'done');
    const order = ['main', 'npc', 'side', 'hidden'];
    let content;
    if (tab === 'active') {
      content = h('div', {},
        ...order.map((type) => {
          const list = active.filter((q) => q.type === type);
          if (!list.length) return null;
          return h('section', {}, h('h3', { class: 'sub-h' }, `${QUEST_TYPES[type]} Quests`), ...list.map(questCard));
        }),
        Events.active() ? h('section', {}, h('h3', { class: 'sub-h' }, 'Event Quest'),
          h('button', { class: 'quest-row panel type-event', onclick: () => Router.go('event') },
            h('div', { class: 'qr-head' }, h('span', { class: 'chip type-event' }, 'Moonlit Gala'), h('span', { class: 'qr-title' }, EVENTS.gala.quest.title)),
            h('div', { class: 'qr-next' }, icon('sparkle'), Events.questDone() ? 'Complete' : `${EVENTS.gala.quest.step} (Evening)`))) : null,
        !active.length ? h('p', { class: 'muted empty' }, 'No active quests. Talk to people — they may need something.') : null,
        h('p', { class: 'muted small' }, 'Hidden quests reveal themselves through exploration, odd hours and unusual conversations.'),
      );
    } else if (tab === 'daily') {
      const daily = Quests.dailyList();
      content = h('div', {},
        h('p', { class: 'muted' }, `Small rituals for Day ${st().time.day}. They refresh each morning.`),
        ...daily.map((d) => h('div', { class: `daily-row panel${d.done ? ' done' : ''}` }, icon(d.done ? 'check' : 'hourglass'), h('div', { class: 'grow' }, h('b', {}, d.title), h('div', { class: 'muted small' }, LOCATIONS[d.loc].name)),
          d.done ? h('span', { class: 'chip gold' }, 'Done') : h('button', { class: 'btn small primary', onclick: () => Actions.goTarget({ loc: d.loc, hs: d.hs }) }, 'Go'))),
        Events.active() ? [h('h3', { class: 'sub-h' }, 'Moonlit Gala — today'), ...EVENTS.gala.daily.map((d) => {
          const isDone = Events.dailyDone(d.id);
          return h('div', { class: `daily-row panel${isDone ? ' done' : ''}` }, icon(isDone ? 'check' : 'sparkle'), h('div', { class: 'grow' }, h('b', {}, d.title), h('div', { class: 'muted small' }, `+${d.pts} gala points`)),
            isDone ? h('span', { class: 'chip gold' }, 'Done') : h('button', { class: 'btn small primary', onclick: () => Actions.goTarget({ loc: d.loc, hs: d.hs }) }, 'Go'));
        })] : null,
      );
    } else {
      content = h('div', {}, done.length ? done.map(questCard) : h('p', { class: 'muted empty' }, 'Nothing completed yet.'));
    }
    return h('div', { class: 'page scroll' },
      h('header', { class: 'page-head' }, pico('log', 'head-ico'), h('h1', {}, 'Quests')),
      tabs([{ id: 'active', name: 'Active', count: active.length }, { id: 'daily', name: 'Daily' }, { id: 'done', name: 'Completed', count: done.length }], tab, (t) => Router.setParams({ tab: t })),
      content);
  },
});

// ---------------------------------------------------------------- Journal
function openMemory(id) {
  const def = MEMORIES[id];
  const entry = st().journal.memories[id];
  const status = Journal.memoryStatus(id);
  const body = h('div', { class: 'memory-read' },
    def.cg ? h('img', { class: 'memory-cg', src: def.cg, alt: def.title }) : null,
    h('div', { class: 'chips' }, h('span', { class: `chip ${status.complete ? 'gold' : ''}` }, status.complete ? 'Memory restored' : `${status.found}/${status.total} fragments`)),
    ...Object.entries(def.frags).map(([fid, f]) => (entry?.frags[fid]
      ? h('div', { class: 'frag' }, h('p', {}, f.text), h('span', { class: 'muted tiny' }, `Recovered on day ${entry.frags[fid]}`))
      : h('div', { class: 'frag missing' }, icon('lock'), h('p', {}, h('i', {}, 'A fragment is missing… '), f.hint || '')))),
  );
  openSheet({ title: def.title, subtitle: 'Memory Archive', body, cls: 'memory-sheet' });
}

registerScreen('journal', {
  render(params) {
    const s = st();
    const tab = params.tab || 'memories';
    const memIds = Object.keys(MEMORIES).filter((m) => s.journal.memories[m]);
    const myst = Object.entries(s.journal.mysteries);
    const unspoken = Object.values(s.journal.unspoken || {});
    const tabList = [
      { id: 'story', name: 'Story' }, { id: 'echoes', name: 'Lives Inside You', count: Object.keys(ECHOES).filter((e) => Story.status(e) !== 'none').length || null }, { id: 'memories', name: 'Memory Archive', count: `${Journal.completeCount()}/${Object.keys(MEMORIES).length}` },
      { id: 'people', name: 'People' }, { id: 'conversations', name: 'Conversations' }, { id: 'places', name: 'Places' },
      { id: 'mysteries', name: 'Unsolved', count: myst.filter(([, m]) => !m.solved).length },
      { id: 'endings', name: 'Endings', count: `${Object.keys(s.endingsSeen || {}).length}/12` },
      { id: 'unspoken', name: 'Unspoken', count: unspoken.length ? `${unspoken.filter((u) => u.said).length}/${unspoken.length}` : null },
    ];
    let content;
    if (tab === 'story') {
      const chapters = Object.entries(QUESTS).filter(([, q]) => q.type === 'main');
      content = h('div', {},
        h('div', { class: 'btn-row' }, h('button', { class: 'btn ghost small', onclick: () => openPrimer() }, icon('journal'), 'How Elaria works')),
        h('div', { class: 'sofar' }, ...chapters.filter(([id]) => s.quests[id]?.status).map(([id, q]) => {
          const done = s.quests[id].status === 'done';
          return h('button', { class: `sofar-ch panel${done ? ' done' : ' now'}`, onclick: () => Actions.openQuest(id) },
            h('div', { class: 'sofar-num' }, `Chapter ${q.chapter} · ${q.chapterTitle}`),
            h('div', { class: 'sofar-q' }, q.question),
            h('p', { class: 'sofar-a' }, done ? q.recap : 'You are here. This is the question you are trying to answer.'));
        }),
        chapters.filter(([id]) => !s.quests[id]?.status).length ? h('p', { class: 'muted small' }, `${chapters.filter(([id]) => !s.quests[id]?.status).length} more chapters to come.`) : null),
        h('h3', { class: 'sub-h' }, 'Recently'),
        h('ul', { class: 'hist-list' }, ...s.journal.log.slice(0, 20).map((l) => h('li', {}, h('span', { class: 'muted small' }, `Day ${l.day}, ${PHASES[l.phase]}`), l.text))),
      );
    } else if (tab === 'endings') {
      content = h('div', {}, h('p', { class: 'muted small' }, 'Five endings come from the main story. Seven more are hidden: five open by finishing a companion\'s three Heart-to-Hearts, and two lie down darker paths.'), endingsGallery());
    } else if (tab === 'memories') {
      content = h('div', {},
        h('p', { class: 'muted' }, 'Whenever you discover something significant, it is kept here. Some memories stay incomplete until you find more.'),
        h('div', { class: 'memory-grid' }, ...Object.keys(MEMORIES).map((id) => {
          const known = s.journal.memories[id];
          const st8 = Journal.memoryStatus(id);
          const thumb = known && MEMORIES[id].thumb;
          return h('button', { class: `memory-card panel${known ? '' : ' locked'}${st8.complete ? ' complete' : ''}${thumb ? ' has-cg' : ''}`, style: thumb ? `background-image: linear-gradient(180deg, rgba(10, 6, 20, 0.2), rgba(10, 6, 20, 0.9)), url(${thumb})` : null, onclick: () => (known ? openMemory(id) : null) },
            h('div', { class: 'mem-glyph' }, icon(known ? (st8.complete ? 'moon' : 'moonrise') : 'lock')),
            h('div', { class: 'mem-title' }, known ? MEMORIES[id].title : 'An unremembered thing'),
            h('div', { class: 'frag-dots' }, ...Array.from({ length: st8.total }, (_, i) => h('span', { class: `dot${i < st8.found ? ' on' : ''}` }))));
        })));
    } else if (tab === 'people') {
      content = h('div', { class: 'list' }, ...NPC_ORDER.filter((id) => s.npcs[id].met).map((id) => {
        const n = s.npcs[id];
        return h('button', { class: 'people-row panel', onclick: () => Router.go('character', { id }) },
          portrait(id, 'mini'),
          h('div', { class: 'grow' }, h('b', {}, NPCS[id].name), h('span', { class: 'muted small' }, ` · ${Relationships.tier(id).label}`), h('div', { class: 'muted small' }, n.history[0]?.text || NPCS[id].title)),
          icon('chevR'));
      }), !NPC_ORDER.some((id) => s.npcs[id].met) ? h('p', { class: 'muted' }, 'No one yet.') : null);
    } else if (tab === 'conversations') {
      content = s.journal.conversations.length ? h('ul', { class: 'quote-list' }, ...s.journal.conversations.map((c) => h('li', { class: 'panel' }, h('p', {}, c.text), h('span', { class: 'muted tiny' }, `Day ${c.day}, ${PHASES[c.phase]}`))))
        : h('p', { class: 'muted empty' }, 'Important things people tell you will be written here.');
    } else if (tab === 'places') {
      content = h('div', { class: 'list' }, ...LOCATION_ORDER.map((id) => {
        const known = s.discovered[id];
        const seen = Object.keys(s.hotspots).filter((k) => k.startsWith(`${id}.`)).map((k) => k.split('.')[1]);
        const total = LOCATIONS[id].hotspots.length;
        return h('div', { class: `place-row panel${known ? '' : ' locked'}` },
          icon(known ? 'pin' : 'lock'),
          h('div', { class: 'grow' }, h('b', {}, known ? LOCATIONS[id].name : '???'), h('div', { class: 'muted small' }, known ? `${LOCATIONS[id].tagline} · ${new Set(seen).size}/${total} places examined` : 'Undiscovered')),
          known ? h('button', { class: 'btn small ghost', onclick: () => Actions.travel(id) }, 'Go') : null);
      }));
    } else if (tab === 'echoes') {
      // The Veil: memories inside Astoria that belong to other people.
      const c = Story.counts();
      const row = (id) => {
        const e = ECHOES[id]; const status = Story.status(id);
        const label = { held: 'Still inside you', kept: 'Kept', returned: 'Given back' }[status];
        return h('div', { class: `echo panel echo-${status}` },
          h('div', { class: 'echo-head' }, h('b', {}, e.title), h('span', { class: `echo-tag tag-${status}` }, label)),
          h('p', { class: 'echo-text' }, status === 'kept' ? e.kept : status === 'returned' ? e.returned : e.held),
          h('div', { class: 'echo-meta' }, `Belongs to: ${e.owner}`, e.forgotten ? ` · Forgotten: ${e.forgotten}` : ''));
      };
      const known = Object.keys(ECHOES).filter((id) => Story.status(id) !== 'none');
      content = h('div', {},
        h('div', { class: 'veil-summary panel' },
          h('div', {}, h('div', { class: 'vs-num' }, String(c.self)), h('div', { class: 'vs-lab' }, 'Pieces of herself')),
          h('div', {}, h('div', { class: 'vs-num' }, String(c.kept)), h('div', { class: 'vs-lab' }, 'Kept')),
          h('div', {}, h('div', { class: 'vs-num' }, String(c.returned)), h('div', { class: 'vs-lab' }, 'Given back')),
          h('div', {}, h('div', { class: 'vs-num' }, String(Story.nightsLeft())), h('div', { class: 'vs-lab' }, 'Nights left'))),
        h('p', { class: 'muted' }, 'Everything Elaria pays to forget is kept inside you. Keep a memory and a little more of you is yours. Give it back and someone forgotten comes home, and something of you goes with it.'),
        known.length ? h('div', { class: 'list' }, ...known.map(row)) : h('p', { class: 'muted empty' }, 'Nothing has settled inside you yet. Nothing you know of.'));
    } else if (tab === 'unspoken') {
      // Locked choices you have seen, and the ones you finally earned the right to say.
      const open = unspoken.filter((u) => !u.said);
      const said = unspoken.filter((u) => u.said).sort((a, b) => b.said - a.said);
      const row = (u) => h('div', { class: `unspoken panel${u.said ? ' said' : ''}` },
        u.npc && NPCS[u.npc] && s.npcs[u.npc]?.met ? portrait(u.npc, 'mini') : h('div', { class: 'uns-ico' }, icon(u.said ? 'sparkle' : 'lock')),
        h('div', { class: 'grow' },
          h('p', { class: 'uns-text' }, u.text),
          h('div', { class: 'uns-need' }, u.said ? `Said on day ${u.said} · Unlocked by: ${u.need.join(' · ')}` : `Needs: ${u.need.join(' · ')}`)));
      content = h('div', {},
        h('p', { class: 'muted' }, 'Words you could not say yet, and the ones you finally did. Your bonds, your nature, what you noticed and what you carry decide which doors open.'),
        unspoken.length ? null : h('p', { class: 'muted empty' }, 'Nothing unspoken yet. When a choice is out of reach, it will be written here.'),
        open.length ? [h('h3', { class: 'sub-h' }, 'Not yet said'), h('div', { class: 'list' }, ...open.map(row))] : null,
        said.length ? [h('h3', { class: 'sub-h' }, 'Finally said'), h('div', { class: 'list' }, ...said.map(row))] : null);
    } else {
      content = h('div', {},
        myst.length ? h('div', { class: 'list' }, ...myst.sort((a, b) => a[1].solved - b[1].solved).map(([id, m]) => h('div', { class: `mystery panel${m.solved ? ' solved' : ''}` },
          h('div', { class: 'myst-title' }, icon(m.solved ? 'check' : 'ask'), MYSTERIES[id].title),
          h('p', { class: 'muted small' }, m.solved && MYSTERIES[id].solved ? MYSTERIES[id].solved : MYSTERIES[id].text))))
          : h('p', { class: 'muted empty' }, 'No mysteries yet. That will not last.'));
    }
    return h('div', { class: 'page scroll' },
      h('header', { class: 'page-head' }, pico('journal', 'head-ico'), h('h1', {}, 'Journal'), h('p', { class: 'muted' }, 'Everything you have learned, in your own hand — in case someone makes you forget.')),
      tabs(tabList, tab, (t) => Router.setParams({ tab: t })),
      content);
  },
});
