// Characters list, NPC profiles and party management.
import { h } from '../dom.js';
import { icon, pico } from '../icons.js';
import { portrait } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { Actions } from '../actions.js';
import { toast } from '../overlay.js';
import { st, Game } from '../../core/GameState.js';
import { NPCS, NPC_ORDER } from '../../data/npcs.js';
import { ITEMS } from '../../data/items.js';
import { LOCATIONS } from '../../data/locations.js';
import { NPCs } from '../../systems/NPCManager.js';
import { Relationships } from '../../systems/RelationshipEngine.js';
import { PHASES } from '../../systems/TimeManager.js';

export const MEMORY_TEXT = {
  insulted: 'You were sharp-tongued at your first meeting.', apologized: 'You apologised.', lied_invitation: 'You lied about the invitation.',
  asked_met_before: 'You asked if you had met before.', owes_favour: 'You owe a favour.', used_key: 'You used the key he gave you.',
  stood_up: 'You missed an appointment.', invited: 'You invited them somewhere.', danced_masquerade: 'You danced together at the masquerade.',
  confronted_alcove: 'You confronted them behind the curtain.', spared_alcove: 'You left their secret alone.', returned_letters: 'You returned his letters unopened.',
  read_letters: 'You read one of his letters.', betrayed_letters: 'You gave his letters to someone else.', kept_cameo: 'You kept her cameo.',
  returned_cameo: 'You returned her cameo without a word.', asked_cameo: 'You asked about the girl in the cameo.', snubbed: 'You snubbed her.',
  gave_pass: 'He trusted you with an archive pass.', argued: 'You argued.', promised_stay: 'You promised not to disappear.',
  promised_tell: 'You promised to tell him where you go.', promised_eat: 'You promised to look after yourself.', confided_portrait: 'You confided in them about the portrait.',
  hollowmere: 'You sat together among the ruins of Hollowmere.', gala_dance: 'You danced with him at the gala.',
};

function memoryLine(key) {
  if (key.startsWith('gift:')) return `You gave them ${ITEMS[key.slice(5)]?.name || 'a gift'}.`;
  if (key.startsWith('hangout_')) return `You spent time together at ${LOCATIONS[key.slice(8)]?.name || 'somewhere'}.`;
  return MEMORY_TEXT[key] || null;
}

function moons(n) {
  const out = [];
  for (let i = 1; i <= 5; i++) out.push(h('span', { class: `moon-pip${n >= i ? ' full' : n >= i - 0.5 ? ' half' : ''}` }));
  return h('span', { class: 'moons', title: 'Affinity' }, ...out);
}

registerScreen('characters', {
  render() {
    const s = st();
    return h('div', { class: 'page scroll' },
      h('header', { class: 'page-head' }, pico('profile', 'head-ico'), h('h1', {}, 'Characters'), h('p', { class: 'muted' }, 'The people of Elaria keep their own hours, their own secrets, and their own memories of you.')),
      h('div', { class: 'char-grid' }, ...NPC_ORDER.map((id) => {
        const n = s.npcs[id];
        const d = NPCS[id];
        const w = NPCs.whereIs(id);
        const tier = Relationships.tier(id);
        return h('button', { class: `char-card panel${n.met ? '' : ' unmet'}`, onclick: () => Router.go('character', { id }) },
          portrait(id, 'card-art'),
          h('div', { class: 'char-info' },
            h('div', { class: 'char-name' }, n.met ? d.name : '???'),
            h('div', { class: 'char-title' }, d.title),
            n.met ? h('div', { class: 'char-rel' }, moons(Relationships.moons(id)), h('span', { class: `tier tone-${tier.tone}` }, tier.label)) : h('div', { class: 'muted small' }, 'Not yet met'),
            n.met ? h('div', { class: 'char-where' }, icon('pin'), NPCs.isAvoiding(id) ? 'Avoiding you' : w.act) : null,
          ));
      })),
      h('button', { class: 'btn ghost', onclick: () => Router.go('party') }, icon('party'), 'Manage Party'),
    );
  },
});

registerScreen('character', {
  hash: false,
  render({ id }) {
    const s = st();
    const d = NPCS[id];
    const n = s.npcs[id];
    if (!d) return h('div');
    const w = NPCs.whereIs(id);
    const tier = Relationships.tier(id);
    const here = w.loc === s.location;
    const mems = Object.keys(n.memory).map(memoryLine).filter(Boolean);
    const allTaste = [...new Set([...d.loves, ...d.likes])];
    return h('div', { class: 'page scroll profile-page' },
      h('button', { class: 'btn ghost small back-btn', onclick: () => Router.back() }, icon('chevL'), 'Back'),
      h('div', { class: 'profile-hero panel' },
        portrait(id, 'hero-art'),
        h('div', { class: 'hero-info' },
          h('h1', {}, n.met ? d.name : '???'),
          h('div', { class: 'hero-title' }, d.title),
          n.met ? h('div', { class: 'char-rel' }, moons(Relationships.moons(id)), h('span', { class: `tier tone-${tier.tone}` }, tier.label)) : null,
          n.met ? h('div', { class: 'sense' }, ...Relationships.sense(id).map((x) => h('span', { class: 'chip' }, x))) : null,
          h('div', { class: 'char-where' }, icon('pin'), n.met ? (NPCs.isAvoiding(id) ? 'Avoiding you' : w.act) : 'Unknown'),
          h('div', { class: 'btn-row' },
            n.met && here ? h('button', { class: 'btn primary small', onclick: () => Actions.openNpc(id) }, icon('talk'), 'Approach') : null,
            n.met && !here && w.loc && s.discovered[w.loc] ? h('button', { class: 'btn primary small', onclick: () => Actions.goTarget({ npc: id }) }, icon('pin'), `Find at ${LOCATIONS[w.loc].short}`) : null,
            n.met && !w.loc ? h('span', { class: 'muted small' }, 'No one knows where they are right now.') : null,
          ),
          d.portrait.startsWith('svg:') ? h('div', { class: 'muted tiny' }, 'Concept portrait — final illustration planned.') : null,
        ),
      ),
      n.met ? [
        section('Heart-to-Hearts', h('div', { class: 'heart-track' }, ...NPCs.hearts(id).map((x) => h('div', { class: `heart-step${x.seen ? ' done' : x.unlocked ? ' ready' : ''}` },
            h('span', { class: 'hs-ico' }, icon(x.seen ? 'heart' : x.unlocked ? 'sparkle' : 'lock')),
            h('div', {}, h('b', {}, x.seen || x.unlocked ? x.title : '???'), h('div', { class: 'muted small' }, x.seen ? 'Seen' : x.unlocked ? 'Ready — approach them and choose Heart-to-Heart' : x.hint))))),
          h('p', { class: 'muted small' }, s.flags[`heart_${id}`] ? `♥ A hidden ending with ${d.name} waits at the bell tower.` : `Finish all three to open a hidden ending with ${d.name}.`)),
        section('Personality', h('div', { class: 'chips' }, ...d.personality.map((p) => h('span', { class: 'chip' }, p)))),
        section('Who they are', h('p', {}, d.bio), h('p', { class: 'muted' }, d.look)),
        section('What you sense', h('p', { class: 'muted' }, d.secretHint)),
        section('Daily routine', h('div', { class: 'schedule' }, ...NPCs.knownSchedule(id).map((r) => h('div', { class: `sched-row${r.phase === s.time.phase ? ' now' : ''}` }, h('span', { class: 'sched-phase' }, PHASES[r.phase]), h('span', { class: r.secret ? 'muted' : '' }, r.text)))),
          h('p', { class: 'muted small' }, 'Some routines stay hidden until you learn more.')),
        section('Tastes', h('div', { class: 'taste' },
          h('div', {}, h('div', { class: 'muted small' }, 'Likes'), h('div', { class: 'chips' }, ...allTaste.map((i) => h('span', { class: 'chip' }, n.likesKnown.includes(i) ? `♥ ${ITEMS[i].name}` : '???')))),
          h('div', {}, h('div', { class: 'muted small' }, 'Dislikes'), h('div', { class: 'chips' }, ...d.dislikes.map((i) => h('span', { class: 'chip' }, n.dislikesKnown.includes(i) ? `✕ ${ITEMS[i].name}` : '???')))))),
        section(`What ${d.name} remembers`, mems.length ? h('ul', { class: 'mem-list' }, ...mems.map((m) => h('li', {}, icon('feather'), m))) : h('p', { class: 'muted' }, 'Nothing in particular — yet.')),
        section('Your history', n.history.length ? h('ul', { class: 'hist-list' }, ...n.history.map((x) => h('li', {}, h('span', { class: 'muted small' }, `Day ${x.day}`), x.text))) : h('p', { class: 'muted' }, 'Your story together has barely begun.')),
      ] : section('Unknown', h('p', { class: 'muted' }, `${d.title}. You have not met yet. ${d.wanderer ? 'Some people find you, rather than the other way round.' : 'Perhaps the story will bring you together.'}`)),
    );
  },
});

function section(title, ...kids) {
  return h('section', { class: 'section panel' }, h('h2', { class: 'section-h' }, title), ...kids);
}

registerScreen('party', {
  render() {
    const s = st();
    const candidates = ['seraphine', 'cael', 'evelyne', 'noctis', 'lucien'];
    const hint = { seraphine: 'Meet Seraphine and finish Chapter 1.', cael: 'Complete Cael\'s request, "Names on the Roster".', evelyne: 'Help Evelyne with "The Lost Cameo".', noctis: 'Keep Noctis\'s appointment in "Tomorrow\'s Echo".', lucien: 'Lucien does not follow anyone. Not yet.' };
    return h('div', { class: 'page scroll' },
      h('button', { class: 'btn ghost small back-btn', onclick: () => Router.back() }, icon('chevL'), 'Back'),
      h('header', { class: 'page-head' }, h('h1', {}, 'Your Party'), h('p', { class: 'muted' }, 'Up to two companions can travel with you. They comment on what you find, open doors others can\'t — and their usual routines wait while they\'re with you.')),
      h('div', { class: 'party-current' }, portrait('astoria', 'card-art'), ...[0, 1].map((i) => (s.party[i] ? portrait(s.party[i], 'card-art') : h('div', { class: 'party-empty' }, icon('plus'))))),
      h('div', { class: 'list' }, ...candidates.map((id) => {
        const ok = NPCs.partyEligible(id);
        const inParty = s.party.includes(id);
        return h('div', { class: `party-cand panel${ok ? '' : ' locked'}` },
          portrait(id, 'mini'),
          h('div', { class: 'grow' }, h('b', {}, s.npcs[id].met ? NPCS[id].name : '???'), h('div', { class: 'muted small' }, ok ? NPCS[id].title : hint[id])),
          ok ? h('button', { class: `btn small ${inParty ? 'ghost' : 'primary'}`, onclick: () => {
            if (!NPCs.togglePartyMember(id)) toast({ text: 'Your party is full (two companions).' });
            Game.commit('party');
          } }, inParty ? 'Leave' : 'Join') : icon('lock'));
      })),
    );
  },
});
