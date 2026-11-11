// Dashboard — Astoria at the centre, the living world around her.
import { h } from '../dom.js';
import { icon, PHASE_ICON } from '../icons.js';
import { portrait, astoriaFigure } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { Actions } from '../actions.js';
import { playConversation } from '../dialogue.js';
import { openPrimer } from '../primer.js';
import { st, Game } from '../../core/GameState.js';
import { ASTORIA_LINES } from '../../data/misc.js';
import { LOCATIONS } from '../../data/locations.js';
import { NPCS } from '../../data/npcs.js';
import { LETTERS } from '../../data/lore.js';
import { EVENTS } from '../../data/events.js';
import { check } from '../../systems/Conditions.js';
import { Quests } from '../../systems/QuestManager.js';
import { NPCs } from '../../systems/NPCManager.js';
import { Events } from '../../systems/EventManager.js';
import { Time } from '../../systems/TimeManager.js';
import { Story } from '../../systems/StoryManager.js';
import { ENDINGS } from '../../data/echoes.js';

function astoriaLines() {
  const s = st();
  const lines = ASTORIA_LINES.filter((l) => check(l.cond)).map((l) => l.text);
  lines.splice(1, 0, `${LOCATIONS[s.location].ambient[s.time.phase].split('.')[0]}.`);
  return [...new Set(lines)].slice(0, 5);
}

registerScreen('home', {
  music: 'home',
  render(params) {
    const s = st();
    const lines = astoriaLines();
    const li = (params.line || 0) % lines.length;
    const main = Quests.trackedMain();
    const next = main ? Quests.nextObjective(main.id) : null;
    const open = s.settings.panelsOpen;
    const unread = s.letters.filter((l) => !l.read);
    const feed = NPCs.feed();
    const daily = Quests.dailyList();

    const stage = h('section', { class: 'home-stage' },
      h('button', { class: 'loc-chip', onclick: () => Actions.travel(s.location) }, icon('pin'), LOCATIONS[s.location].name, h('span', { class: 'sep' }, '·'), icon(PHASE_ICON[s.time.phase]), Time.phaseName()),
      h('button', { class: 'figure-btn', 'aria-label': 'Open Astoria\'s profile', onclick: () => Router.go('profile') }, astoriaFigure({ worn: s.wardrobe.worn, cls: 'home-figure' })),
      h('button', { class: 'say panel', onclick: () => Router.setParams({ line: li + 1 }) },
        h('div', { class: 'say-name' }, icon('sparkle'), 'Astoria'),
        h('div', { class: 'say-text' }, lines[li]),
        h('span', { class: 'say-caret' }, icon('chevD'))),
    );

    // The eclipse countdown and what is left of Astoria: the story's two clocks.
    const veil = Story.counts();
    const pips = Array.from({ length: Math.max(5, veil.self) }, (_, i) => h('span', { class: `self-pip${i < veil.self ? ' on' : ''}` }));
    const eclipse = h('button', { class: 'eclipse-line', onclick: () => Router.go('journal', { tab: 'echoes' }), title: 'What is left of her, and how long' },
      h('span', { class: 'ecl-moon' }, icon('moon')),
      h('span', { class: 'ecl-text' }, Story.shortLabel()),
      h('span', { class: 'self-pips', 'aria-label': `Self: ${veil.self}` }, ...pips));
    const ending = s.ending ? ENDINGS[s.ending.id] : null;
    const questCard = ending ? h('div', { class: 'card panel quest-card', style: { '--thumb': 'url(assets/img/cg_awakening_thumb.jpg)' } },
      h('div', { class: 'card-head' }, h('span', { class: 'diamond' }), 'Ending reached'),
      h('div', { class: 'card-title' }, ending.title),
      h('div', { class: 'card-text' }, ending.line),
      h('button', { class: 'btn primary small', onclick: () => Router.go('ending') }, 'Epilogue', icon('chevR')),
    ) : main ? h('div', { class: 'card panel quest-card', style: { '--thumb': `url(${QUEST_THUMB(main)})` }, role: 'button', tabindex: 0, onclick: (e) => { if (!e.target.closest('.btn') && !e.target.closest('.eclipse-line')) Actions.openQuest(main.id); } },
      h('div', { class: 'card-head' }, h('span', { class: 'diamond' }), `Chapter ${main.chapter}`),
      h('div', { class: 'card-title' }, main.title),
      main.question && main.state.status === 'active' ? h('div', { class: 'card-question' }, main.question) : null,
      h('div', { class: 'card-text' }, main.state.status === 'done' ? 'Chapter complete. The story continues…' : (next ? next.text : main.desc)),
      eclipse,
      main.state.status === 'active' && next ? h('button', { class: 'btn primary small', onclick: () => Actions.goTarget(next.target) }, 'Continue', icon('chevR'))
        : h('button', { class: 'btn primary small', onclick: () => Router.go('journal', { tab: 'story' }) }, 'Story so far', icon('chevR')),
    ) : null;

    const eventCard = h('div', { class: 'card panel event-card', role: 'button', tabindex: 0, onclick: (e) => { if (!e.target.closest('.btn')) Router.go('event'); } },
      h('div', { class: 'card-head' }, icon('sparkle'), 'Event'),
      h('div', { class: 'card-title' }, EVENTS.gala.title),
      h('div', { class: `card-text${!s.flags.gala_night_done && s.time.phase >= 2 ? ' gold-text' : ''}` }, s.flags.gala_night_done ? `You attended the Gala Night · ${Events.endsLabel()}` : s.time.phase >= 2 ? '✦ Tonight: the Gala Night. Doors are open.' : `The Gala Night opens at Evening · ${Events.endsLabel()}`),
      h('div', { class: 'mini-bar' }, h('div', { style: { width: `${(s.events.gala.points / EVENTS.gala.maxPoints) * 100}%` } })),
      h('button', { class: 'btn primary small', onclick: () => Router.go('event') }, 'View Event', icon('chevR')),
    );

    const partySlots = [h('button', { class: 'party-slot', onclick: () => Router.go('profile') }, portrait('astoria', 'mini'))];
    s.party.forEach((id) => partySlots.push(h('button', { class: 'party-slot', onclick: () => Router.go('character', { id }) }, portrait(id, 'mini'))));
    for (let i = s.party.length; i < 2; i++) partySlots.push(h('button', { class: 'party-slot empty', 'aria-label': 'Add companion', onclick: () => Router.go('party') }, icon('plus')));
    const partyCard = h('div', { class: 'card panel party-card' },
      h('div', { class: 'card-head' }, icon('party'), 'Your Party'),
      h('div', { class: 'party-row' }, ...partySlots),
      h('button', { class: 'btn ghost small', onclick: () => Router.go('party') }, 'Manage Party'),
    );

    const feedCard = h('div', { class: 'card panel feed-card' },
      h('div', { class: 'card-head' }, icon('bell'), 'Elaria Now'),
      ...unread.slice(0, 2).map((l) => h('button', { class: 'feed-item letter', onclick: () => Actions.openLetter(l.id) },
        LETTERS[l.id].from ? portrait(LETTERS[l.id].from, 'micro') : h('span', { class: 'seal micro' }, LETTERS[l.id].seal),
        h('span', {}, `${LETTERS[l.id].from ? NPCS[LETTERS[l.id].from].name : 'Someone'} has sent a letter.`), h('span', { class: 'new-dot' }))),
      ...Object.keys(NPCS).filter((id) => NPCs.heartsReady(id)).map((id) => h('button', { class: 'feed-item heart-feed', onclick: () => Router.go('character', { id }) },
        portrait(id, 'micro'), h('span', {}, h('b', {}, NPCS[id].name), ' wants a quiet word with you. ♥'), h('span', { class: 'new-dot' }))),
      ...feed.map((f) => h('button', { class: 'feed-item', onclick: () => Router.go('character', { id: f.id }) },
        portrait(f.id, 'micro'),
        h('span', {}, h('b', {}, NPCS[f.id].name), ' — ', f.avoiding ? 'avoiding you' : f.act),
        f.loc ? h('span', { class: `loc-tag${f.loc === s.location ? ' here' : ''}` }, f.loc === s.location ? 'here' : LOCATIONS[f.loc].short) : h('span', { class: 'loc-tag unknown' }, '?'))),
      !feed.length && !unread.length ? h('p', { class: 'muted small' }, 'Elaria is quiet. You have not met anyone yet.') : null,
      h('button', { class: 'feed-item daily', onclick: () => Router.go('quests', { tab: 'daily' }) }, icon('hourglass'), h('span', {}, `Today: ${daily.filter((d) => d.done).length}/${daily.length} daily activities`)),
    );

    const panels = h('aside', { class: `home-panels${open ? '' : ' collapsed'}` },
      h('button', { class: 'panel-toggle icon-btn', 'aria-label': open ? 'Hide panels' : 'Show panels', onclick: () => { s.settings.panelsOpen = !open; Game.commit('ui'); } }, icon(open ? 'hidePanel' : 'showPanel')),
      h('div', { class: 'panel-stack scroll' }, questCard, eventCard, partyCard, feedCard),
    );

    return h('div', { class: `home phase-${s.time.phase}` },
      h('div', { class: 'home-bg' }),
      stage,
      panels,
    );
  },
});

function QUEST_THUMB(q) {
  return q.thumb || { 2: 'assets/img/card_story.jpg', 3: 'assets/img/card_secret.jpg', 4: 'assets/img/card_ball.jpg' }[q.chapter] || 'assets/img/quest_thumb.jpg';
}

// Title screen shown on a brand-new save.
registerScreen('title', {
  hash: false,
  music: 'home',
  render() {
    const s = st();
    return h('div', { class: 'title-screen' },
      h('div', { class: 'title-bg' }),
      h('div', { class: 'title-moon' }),
      h('div', { class: 'title-block' },
        h('div', { class: 'title-kicker' }, 'Elaria · Year 300 of the Moonfall'),
        h('h1', { class: 'title-logo' }, h('img', { src: 'assets/ui3/logo_title.webp', alt: 'Astoria: The Moonlit Veil' })),
        h('p', { class: 'title-blurb' }, 'The moon has been too bright for three hundred years. People forget. Sometimes they forget people. You wake in an abandoned cathedral, knowing only your name.'),
        h('button', { class: 'btn primary big', onclick: () => {
          s.started = true;
          Game.commit('start');
          Router.go('home', {}, { replace: true });
          playConversation('prologue', { onEnd: () => { Game.commit('prologue'); openPrimer(); } });
        } }, 'Wake Up', icon('chevR')),
        h('p', { class: 'muted small' }, 'Progress saves automatically on this device. Sound begins after your first tap.'),
      ),
    );
  },
});
