// Moonlit Gala — the event screen as a "spatial scene": a depth-mapped ballroom
// with Lucien, Astoria and the roses floating on their own layers, framed by
// the painted UI kit (logo, mask, panels, reward tiles, banner cards).
import { h } from '../dom.js';
import { icon } from '../icons.js';
import { Router, registerScreen } from '../app.js';
import { Actions } from '../actions.js';
import { openSheet, toast } from '../overlay.js';
import { playConversation } from '../dialogue.js';
import { spatialStage, bindSpatialScroll, spatialPick, spatialHover, enableTilt } from '../spatial.js';
import { st, Game } from '../../core/GameState.js';
import { EVENTS, UPCOMING_EVENTS } from '../../data/events.js';
import { ASTORIA_LINES } from '../../data/misc.js';
import { check } from '../../systems/Conditions.js';
import { Events } from '../../systems/EventManager.js';
import { PHASES, Time } from '../../systems/TimeManager.js';

const E = EVENTS.gala;
const U = 'assets/ui2/';
const ITEM_ART = ['item_dress', 'item_crystal', 'item_mask', 'item_star'].map((n) => `${U}${n}.webp`);
export const pimg = (name, cls = '') => h('img', { class: `pimg ${cls}`, src: `${U}${name}.webp`, alt: '', draggable: 'false' });

function openStory(list, title) {
  const body = h('div', { class: 'list' }, ...list.map((p) => {
    const open = Events.storyOpen(p);
    const done = Events.storyDone(p.id);
    return h('button', { class: `list-btn${open ? '' : ' locked'}`, disabled: !open, onclick: () => { sheet.close(); playConversation(p.convo, { onEnd: () => Game.commit('gala-story') }); } },
      icon(open ? (done ? 'check' : 'journal') : 'lock'), h('span', {}, p.title),
      h('span', { class: 'muted small' }, open ? (done ? 'Replay' : `+${p.pts} points`) : `Unlocks at ${p.need} points`));
  }));
  const sheet = openSheet({ title, subtitle: 'Moonlit Gala', body });
}

function openRewards() {
  const g = st().events.gala;
  const body = h('div', { class: 'list' }, ...E.rewards.map((r, i) => h('div', { class: 'reward-line panel' },
    h('img', { class: 'rw-tile', src: ITEM_ART[i], alt: '' }),
    h('div', { class: 'grow' }, h('b', {}, r.label), h('div', { class: 'muted small' }, `${r.at} points`)),
    g.claimed[i] ? h('span', { class: 'chip gold' }, 'Claimed')
      : Events.claimable(i) ? h('button', { class: 'btn small primary claim', onclick: () => { Events.claim(i); Game.commit('claim'); sheet.close(); openRewards(); } }, 'Claim')
        : h('span', { class: 'muted small' }, `${g.points}/${r.at}`))));
  const sheet = openSheet({ title: 'Event Rewards', subtitle: 'Earned with gala points — never purchased', body });
}

function galaLine() {
  if (st().time.phase >= 2) return 'The moon looks beautiful tonight… don\'t you think?';
  return ASTORIA_LINES.filter((l) => check(l.cond)).map((l) => l.text)[0];
}

// Rewards slot positions on the painted container (percent of its 887×326 art).
const SLOT_X = [5.2, 24.0, 42.9, 61.8]; const SLOT_W = 16.4; const SLOT_Y = 41.4; const SLOT_H = 45.5;

registerScreen('event', {
  music: 'ballroom',
  render() {
    const s = st();
    const g = s.events.gala;
    const active = Events.active();
    const pct = Math.round((g.points / E.maxPoints) * 100);
    const secretOpen = g.points >= E.secrets[0].need;
    const questTodo = !Events.questDone();
    const wide = window.innerWidth >= 900;
    const pick = (id) => (id === 'astoria' ? Router.go('profile') : Router.go('character', { id }));
    const stage = spatialStage({ focusX: wide ? 0.42 : 0.47, focusY: wide ? 0.42 : 0.38, anchorX: wide ? 0.36 : 0.5 });

    const logo = h('div', { class: 'p-logo' },
      h('img', { class: 'pl-mask', src: `${U}mask_header.webp`, alt: '' }),
      h('div', { class: 'pl-word' },
        h('img', { class: 'pl-text', src: `${U}logo_text.webp`, alt: E.title }),
        h('span', { class: 'pl-shine', 'aria-hidden': 'true' })),
      h('h1', { class: 'sr-only' }, E.title));

    const title = h('div', { class: 'ev-title' },
      logo,
      h('div', { class: 'p-ends' }, pimg('icon_clock', 'pe-clock'), h('span', {}, Events.endsLabel())),
      h('p', { class: 'event-tag' }, ...E.tagline.split('\n').flatMap((l, i) => (i ? [h('br'), l] : [l]))));

    const rewards = h('div', { class: 'p-rewards', role: 'group', 'aria-label': 'Event rewards' },
      h('img', { class: 'pr-frame', src: `${U}frame_rewards_clean.webp`, alt: '' }),
      ...E.rewards.map((r, i) => h('button', {
        class: `pr-slot${g.claimed[i] ? ' claimed' : ''}${Events.claimable(i) ? ' ready' : ''}`,
        style: { left: `${SLOT_X[i]}%`, top: `${SLOT_Y}%`, width: `${SLOT_W}%`, height: `${SLOT_H}%` },
        title: `${r.label} — ${r.at} points`,
        'aria-label': `${r.label}, ${r.at} points${g.claimed[i] ? ', claimed' : Events.claimable(i) ? ', ready to claim' : ''}`,
        onclick: () => {
          if (Events.claimable(i)) { Events.claim(i); Game.commit('claim'); toast({ text: `Claimed: ${r.label}`, kind: 'event' }); } else openRewards();
        },
      }, h('img', { src: ITEM_ART[i], alt: '' }), h('span', { class: 'pr-at' }, g.claimed[i] ? '' : r.at))),
      h('button', { class: 'pr-slot plus', style: { left: '80.4%', top: `${SLOT_Y}%`, width: '15.8%', height: `${SLOT_H}%` }, 'aria-label': 'All rewards', onclick: openRewards }));

    // The Gala Night itself: one evening, played once, the heart of the event.
    const nightDone = !!s.flags.gala_night_done;
    const evening = s.time.phase >= 2;
    const night = h('div', { class: `p-panel p-night${!nightDone && active ? ' live' : ''}` },
      h('div', { class: 'pp-head' }, pimg('icon_star', 'pp-ico'), nightDone ? 'The Gala Night · attended' : evening ? 'Tonight: The Gala Night' : 'The Gala Night · doors open at Evening'),
      h('p', { class: 'muted small' }, nightDone ? 'The clocks stopped at thirteen past midnight. You were there.' : 'One night only. Dress for it. Choose who to spend it with. Something happens at midnight.'),
      nightDone ? null : !active ? h('span', { class: 'chip' }, 'Event ended')
        : evening ? h('button', { class: 'btn primary', onclick: () => { playConversation('gala_night', { onEnd: () => Game.commit('gala-night') }); } }, icon('sparkle'), 'Attend the Gala Night')
          : h('button', { class: 'btn ghost small', onclick: () => { Time.advance(2 - s.time.phase); Game.commit('wait'); } }, icon('clock'), 'Wait until Evening'));

    const quest = h('div', { class: 'p-panel p-quest' },
      h('div', { class: 'pp-head' }, pimg('icon_star', 'pp-ico'), 'Event Quest'),
      h('div', { class: 'eq-row' },
        h('div', { class: 'grow' },
          h('div', { class: 'eq-title' }, E.quest.title),
          h('div', { class: 'eq-step' }, `• ${E.quest.step}${questTodo ? ` (${PHASES[2]})` : ' — done'}`)),
        questTodo && active
          ? h('button', { class: 'p-go', onclick: () => Actions.goTarget({ loc: 'ballroom' }) }, pimg('icon_arrow_left', 'pg-a'), h('span', {}, 'Go'), pimg('icon_arrow_right', 'pg-a'))
          : h('span', { class: 'chip gold' }, questTodo ? 'Event ended' : 'Complete')));

    const progress = h('div', { class: 'p-progress' },
      h('img', { class: 'pp-frame', src: `${U}frame_progress_empty.webp`, alt: '' }),
      h('div', { class: 'pp-count' }, `${g.points} / ${E.maxPoints}`),
      h('div', { class: 'pp-bar' }, h('div', { style: { width: `${pct}%` } })));

    const refresh = h('div', { class: 'p-panel p-refresh' },
      pimg('icon_hourglass', 'pr-glass'),
      h('div', {}, h('div', { class: 'muted small' }, 'Next Refresh'), h('div', { class: 'pr-t' }, active ? `${Events.refreshLabel()} · dawn` : '—')));

    const quote = h('button', { class: 'p-quote', onclick: () => Router.go('home') }, h('span', { class: 'pq-text' }, galaLine()));

    const card = (img, fn, label, locked = false) => h('button', { class: `p-card${locked ? ' locked' : ''}`, 'aria-label': label, onclick: fn }, h('img', { src: `${U}${img}.webp`, alt: '' }));
    const cards = h('div', { class: 'p-cards' },
      card('card_story', () => openStory(E.story, 'Event Story'), 'Event Story'),
      card('card_ball', () => Actions.goTarget({ loc: 'ballroom' }), 'Masquerade Ball'),
      card('card_secret', () => (secretOpen ? openStory(E.secrets, 'Secret Encounters') : toast({ text: `Secret Encounters unlock at ${E.secrets[0].need} gala points.` })), secretOpen ? 'Secret Encounters' : 'Secret Encounters (locked)', !secretOpen));

    const tiltBtn = typeof window.DeviceOrientationEvent?.requestPermission === 'function' && window.matchMedia('(pointer: coarse)').matches
      ? h('button', { class: 'btn ghost small tilt-btn', onclick: async () => { if (await enableTilt()) toast({ text: 'Tilt your phone to look around the ballroom.' }); } }, icon('sparkle'), 'Tilt to look around') : null;

    const content = h('div', { class: 'event-content2 scroll' },
      h('div', { class: 'ev-first' },
        h('button', { class: 'btn ghost small back-btn ev-back', onclick: () => Router.back() }, icon('chevL'), 'Back'),
        h('div', { class: 'ev-spacer', 'aria-hidden': 'true' }),
        h('div', { class: 'ev-right' }, title, night, rewards, quest, refresh),
        h('div', { class: 'ev-left' }, progress),
        h('div', { class: 'ev-bottom2' }, quote, cards)),
      h('div', { class: 'ev-more' },
        h('div', { class: 'p-panel ev-daily2' },
          h('div', { class: 'pp-head' }, pimg('icon_hourglass', 'pp-ico'), 'Today at the Gala'),
          ...E.daily.map((d) => h('div', { class: `ev-daily-row${Events.dailyDone(d.id) ? ' done' : ''}` }, icon(Events.dailyDone(d.id) ? 'check' : 'sparkle'), h('span', { class: 'grow' }, d.title), h('span', { class: 'muted small' }, `+${d.pts}`)))),
        h('h3', { class: 'sub-h' }, 'Coming to Elaria'),
        h('div', { class: 'upcoming' }, ...UPCOMING_EVENTS.map((u) => h('div', { class: 'p-panel upcoming-card' }, h('b', {}, u.title), h('p', { class: 'muted small' }, u.text), h('span', { class: 'chip' }, 'Planned — not in this prototype')))),
        h('p', { class: 'muted tiny ev-hint' }, 'Move, drag or tilt to look around the ballroom. Tap Lucien or Astoria to open their profiles.',
          tiltBtn,
          h('button', { class: 'sr-only', onclick: () => pick('lucien') }, 'Open Lucien\'s profile'),
          h('button', { class: 'sr-only', onclick: () => pick('astoria') }, 'Open Astoria\'s profile'))));

    // Taps on empty parts of the menu reach the characters behind it.
    const empty = (t) => !t.closest('button, .p-panel, .p-quote, .p-card, .ev-title, .p-rewards, .p-progress, a, .upcoming');
    let downAt = null;
    content.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
    content.addEventListener('click', (e) => {
      if (!empty(e.target)) return;
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 10) return; // it was a drag
      const id = spatialPick(e.clientX, e.clientY); if (id) pick(id);
    });
    content.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const id = empty(e.target) ? spatialPick(e.clientX, e.clientY) : null;
      spatialHover(id); content.style.cursor = id ? 'pointer' : '';
    });
    content.addEventListener('pointerleave', () => spatialHover(null));
    requestAnimationFrame(() => bindSpatialScroll(content));
    return h('div', { class: 'event-screen2' }, stage.el, content);
  },
});
