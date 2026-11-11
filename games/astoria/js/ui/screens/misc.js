// Summon, Achievements, Letters & Notices, Settings.
import { h, fmt } from '../dom.js';
import { icon, pico } from '../icons.js';
import { itemArt, portrait } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { Actions } from '../actions.js';
import { confirmDialog, toast } from '../overlay.js';
import { st, Game } from '../../core/GameState.js';
import { bus } from '../../core/EventBus.js';
import { SaveManager } from '../../core/SaveManager.js';
import { LETTERS } from '../../data/lore.js';
import { NPCS } from '../../data/npcs.js';
import { ITEMS } from '../../data/items.js';
import { PHASES } from '../../systems/TimeManager.js';
import { Summoning } from '../../systems/Summoning.js';
import { Achievements } from '../../systems/AchievementManager.js';
import { Notifications } from '../../systems/NotificationManager.js';
import { Audio } from '../../systems/AudioManager.js';
import { Inventory } from '../../systems/InventoryManager.js';
import { applyFx } from '../../systems/Effects.js';

let lastSummon = null;

registerScreen('summon', {
  music: 'cathedral',
  render() {
    const s = st();
    const can = s.player.moonstones >= Summoning.cost;
    return h('div', { class: 'page scroll summon-page' },
      h('header', { class: 'page-head' }, h('h1', {}, 'Moonlit Summoning'), h('p', { class: 'muted' }, 'At the cathedral altar, offer Moonstones to the moon — and it gives back something it took.')),
      h('div', { class: `summon-altar${lastSummon ? ' revealed' : ''}` },
        h('div', { class: 'summon-moon' }),
        h('div', { class: 'summon-ring' }),
        lastSummon ? h('div', { class: 'summon-result panel' },
          itemArt(lastSummon.glyph, lastSummon.outfit ? 'clothing' : 'magical', 'big'),
          h('b', {}, lastSummon.name),
          h('p', { class: 'muted small' }, lastSummon.text),
          lastSummon.item && ITEMS[lastSummon.item]?.inspect && !Inventory.inspected(lastSummon.item) ? h('button', { class: 'btn small primary', onclick: () => { Inventory.inspect(lastSummon.item, applyFx); Game.commit('inspect'); toast({ text: ITEMS[lastSummon.item].inspect, kind: 'memory' }); } }, icon('eye'), 'Open it') : null)
          : null,
      ),
      h('div', { class: 'summon-controls' },
        h('div', { class: 'wallet' }, icon('moonstone'), fmt(s.player.moonstones), ' Moonstones'),
        h('button', { class: 'btn primary big', disabled: !can, onclick: () => {
          const res = Summoning.pull();
          if (!res) return;
          lastSummon = res;
          bus.emit('sfx', 'summon');
          Game.commit('summon');
        } }, icon('summon'), `Offer ${Summoning.cost} Moonstones`),
        !can ? h('p', { class: 'muted small' }, 'Not enough Moonstones. Earn more through quests, daily activities, achievements and levelling up.') : null,
        h('p', { class: 'muted tiny' }, 'The moon returns memory vials, moon shards, old crowns, gifts and the occasional lost keepsake. Moonstones are only earned in play; there is nothing to buy.'),
      ),
    );
  },
});

registerScreen('achievements', {
  render() {
    const list = Achievements.list();
    const got = list.filter((a) => a.unlocked).length;
    return h('div', { class: 'page scroll' },
      h('header', { class: 'page-head' }, pico('trophy', 'head-ico'), h('h1', {}, 'Achievements'), h('p', { class: 'muted' }, `${got} of ${list.length} unlocked`)),
      h('div', { class: 'ach-grid' }, ...list.map((a) => h('div', { class: `ach panel${a.unlocked ? ' got' : ''}` },
        h('div', { class: 'ach-icon' }, icon(a.unlocked ? 'achievements' : 'lock')),
        h('div', { class: 'grow' }, h('b', {}, a.title), h('div', { class: 'muted small' }, a.desc)),
        h('div', { class: 'ach-reward' }, a.unlocked ? h('span', { class: 'chip gold' }, `Day ${a.unlocked}`) : h('span', { class: 'muted small' }, icon('moonstone'), a.reward))))),
    );
  },
});

registerScreen('letters', {
  render(params) {
    const s = st();
    const tab = params.tab || 'letters';
    if (tab === 'notices' && Notifications.unreadNotices()) { Notifications.markNoticesRead(); setTimeout(() => Game.commit('notices'), 0); }
    return h('div', { class: 'page scroll' },
      h('header', { class: 'page-head' }, pico('mail', 'head-ico'), h('h1', {}, 'Letters & Notices')),
      h('div', { class: 'tabs' },
        h('button', { class: `tab${tab === 'letters' ? ' active' : ''}`, onclick: () => Router.setParams({ tab: 'letters' }) }, 'Letters', Notifications.unreadLetters() ? h('span', { class: 'tab-count' }, Notifications.unreadLetters()) : null),
        h('button', { class: `tab${tab === 'notices' ? ' active' : ''}`, onclick: () => Router.setParams({ tab: 'notices' }) }, 'Notices')),
      tab === 'letters'
        ? (s.letters.length ? h('div', { class: 'list' }, ...s.letters.map((l) => {
          const d = LETTERS[l.id];
          return h('button', { class: `letter-row panel${l.read ? '' : ' unread'}`, onclick: () => Actions.openLetter(l.id) },
            d.from ? portrait(d.from, 'mini') : h('span', { class: 'seal' }, d.seal),
            h('div', { class: 'grow' }, h('b', {}, d.title), h('div', { class: 'muted small' }, `${d.from ? NPCS[d.from].name : 'Unsigned'} · Day ${l.day}`)),
            l.read ? icon('chevR') : h('span', { class: 'new-dot' }));
        })) : h('p', { class: 'muted empty' }, 'No letters yet. People in Elaria write when they have something to say — or something to hide.'))
        : (s.notices.length ? h('ul', { class: 'hist-list' }, ...s.notices.map((n) => h('li', {}, h('span', { class: 'muted small' }, `Day ${n.day}, ${PHASES[n.phase]}`), n.text, n.letter ? h('button', { class: 'btn tiny ghost', onclick: () => Actions.openLetter(n.letter) }, 'Read') : null, n.npc ? h('button', { class: 'btn tiny ghost', onclick: () => Router.go('character', { id: n.npc }) }, 'Profile') : null)))
          : h('p', { class: 'muted empty' }, 'Nothing to report.')),
    );
  },
});

let exportCode = '';

registerScreen('settings', {
  render() {
    const s = st();
    const set = s.settings;
    const slider = (key, label) => h('label', { class: 'setting' }, h('span', {}, label),
      h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: set[key], oninput: (e) => { set[key] = Number(e.target.value); Audio.refreshVolumes(); }, onchange: () => Game.commit('settings') }));
    const toggle = (key, label, hint) => h('label', { class: 'setting toggle' }, h('span', {}, label, hint ? h('span', { class: 'muted tiny block' }, hint) : null),
      h('input', { type: 'checkbox', checked: !!set[key], onchange: (e) => { set[key] = e.target.checked; document.body.classList.toggle('reduce-motion', !!set.reduceMotion); Game.commit('settings'); } }));
    const status = SaveManager.status;
    const importBox = h('textarea', { class: 'code-box', rows: 3, placeholder: 'Paste a save code here…' });
    return h('div', { class: 'page scroll settings-page' },
      h('header', { class: 'page-head' }, pico('settings', 'head-ico'), h('h1', {}, 'Settings')),
      h('section', { class: 'section panel' }, h('h2', { class: 'section-h' }, 'Sound'),
        slider('music', 'Music'), slider('sfx', 'Effects'),
        h('p', { class: 'muted tiny' }, 'The soundtrack is generated live: piano, bells, choir, wind and waltz, by location.')),
      h('section', { class: 'section panel' }, h('h2', { class: 'section-h' }, 'Reading'),
        h('div', { class: 'setting' }, h('span', {}, 'Text speed'), h('div', { class: 'seg' }, ...['slow', 'normal', 'fast', 'instant'].map((v) => h('button', { class: `seg-btn${set.textSpeed === v ? ' active' : ''}`, onclick: () => { set.textSpeed = v; Game.commit('settings'); } }, v)))),
        toggle('pathHints', 'Show path hints on choices', 'Labels choices as Compassionate, Suspicious, Aggressive or Secretive.'),
        toggle('reduceMotion', 'Reduce motion', 'Calmer particles and no typewriter effect.')),
      h('section', { class: 'section panel' }, h('h2', { class: 'section-h' }, 'Your save'),
        h('p', {}, icon(status === 'cloud' ? 'check' : 'sparkle'), status === 'cloud' ? ' Saved on this device and in your private cloud slot.' : status === 'cloud-error' ? ' Saved on this device. The cloud slot could not be reached just now.' : ' Saved automatically on this device.'),
        h('p', { class: 'muted small' }, 'To move progress elsewhere, copy a save code and paste it into the game on another device.'),
        h('div', { class: 'btn-row wrap' },
          h('button', { class: 'btn ghost small', onclick: () => { exportCode = SaveManager.exportCode(); Game.commit('ui'); } }, pico('save'), 'Create save code'),
          exportCode ? h('button', { class: 'btn ghost small', onclick: async () => { try { await navigator.clipboard.writeText(exportCode); toast({ text: 'Save code copied.' }); } catch { toast({ text: 'Copy was blocked — select the code and copy it by hand.' }); } } }, icon('copy'), 'Copy') : null),
        exportCode ? h('textarea', { class: 'code-box', rows: 3, readonly: true }, exportCode) : null,
        importBox,
        h('div', { class: 'btn-row wrap' },
          h('button', { class: 'btn ghost small', onclick: async () => {
            if (!importBox.value.trim()) return;
            if (!(await confirmDialog({ title: 'Load this save?', text: 'Your current progress will be replaced by the pasted save.', ok: 'Load' }))) return;
            try { SaveManager.importCode(importBox.value); toast({ text: 'Save loaded.' }); Router.go('home'); } catch (e) { toast({ text: e.message || 'That save code could not be read.' }); }
          } }, pico('load'), 'Load save code'),
          h('button', { class: 'btn danger small', onclick: async () => {
            if (!(await confirmDialog({ title: 'Begin again?', text: 'This erases all progress — every choice, every memory. Elaria will forget you. Are you sure?', ok: 'Erase and begin again', danger: true }))) return;
            SaveManager.reset(); exportCode = ''; Router.go('title', {}, { replace: true });
          } }, 'Start a new game'))),
      h('section', { class: 'section panel about' }, h('h2', { class: 'section-h' }, 'About this prototype'),
        h('p', {}, h('b', {}, 'Playable now: '), 'Chapters 1–6 of the main story; five residents with schedules, memories, gifts, invitations, secrets and personal quests; side, hidden and daily quests; five explorable locations; the Moonlit Gala event; inventory, collection journal, wardrobe, party, summoning, letters, journal and memory archive; achievements; four behavioural paths; persistent saves.'),
        h('p', {}, h('b', {}, 'Planned: '), 'Chapter 7 onward and alternative endings; the chamber beneath the cathedral; the Winter Eclipse, Forgotten Rose and Midnight Letters events; fully re-illustrated outfits; final portraits for Evelyne and Noctis (shown as concept art); character blinking and recorded music.'),
        h('p', { class: 'muted small' }, 'No accounts, purchases or paid services. Time in Elaria moves when you travel or linger.')),
    );
  },
});
