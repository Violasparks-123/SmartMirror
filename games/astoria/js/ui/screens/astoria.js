// Astoria's profile and wardrobe.
import { h } from '../dom.js';
import { icon } from '../icons.js';
import { astoriaFigure, itemArt, cosArt } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { st, Game } from '../../core/GameState.js';
import { PATHS } from '../../data/misc.js';
import { COSMETICS, SLOTS, COLLECTIONS } from '../../data/wardrobe.js';
import { NPC_ORDER } from '../../data/npcs.js';
import { COLLECTIBLES } from '../../data/items.js';
import { Player } from '../../systems/PlayerProfile.js';
import { Journal } from '../../systems/JournalManager.js';
import { Wardrobe } from '../../systems/CharacterManager.js';

registerScreen('profile', {
  render() {
    const s = st();
    const p = s.player;
    const dom = Player.dominant();
    const max = Math.max(1, ...Object.values(p.path));
    const done = Object.values(s.quests).filter((q) => q.status === 'done').length;
    return h('div', { class: 'page scroll astoria-page' },
      h('div', { class: 'astoria-layout' },
        h('div', { class: 'astoria-art panel' }, astoriaFigure({ worn: s.wardrobe.worn, cls: 'profile-figure' }),
          h('button', { class: 'btn primary small wardrobe-btn', onclick: () => Router.go('wardrobe') }, icon('wardrobe'), 'Wardrobe')),
        h('div', { class: 'astoria-info' },
          h('h1', {}, 'Astoria'),
          h('div', { class: 'hero-title' }, p.title),
          h('div', { class: 'muted' }, `Level ${p.level} · ${p.exp}/${Player.expToNext()} EXP`),
          h('section', { class: 'section panel' }, h('h2', { class: 'section-h' }, 'Who she is becoming'),
            dom ? h('p', {}, h('b', { style: { color: PATHS[dom].color } }, PATHS[dom].name), ' — ', PATHS[dom].desc) : h('p', { class: 'muted' }, 'Quiet, observant, difficult to read. Her choices have not yet shaped her.'),
            h('div', { class: 'path-bars' }, ...Object.entries(PATHS).map(([k, v]) => h('div', { class: 'path-bar' },
              h('span', { class: 'pb-name' }, v.name),
              h('span', { class: 'pb-track' }, h('span', { class: 'pb-fill', style: { width: `${(p.path[k] / max) * 100}%`, background: v.color } })),
              h('span', { class: 'pb-val muted small' }, p.path[k])))),
            h('p', { class: 'muted small' }, 'Your choices shape her dialogue, how people respond to her, and which hidden conversations appear.')),
          h('section', { class: 'section panel stats' }, h('h2', { class: 'section-h' }, 'In Elaria'),
            stat('Days', s.time.day), stat('People met', `${NPC_ORDER.filter((n) => s.npcs[n].met).length}/5`), stat('Quests completed', done),
            stat('Memories restored', Journal.completeCount()), stat('Collectibles', `${Object.keys(s.collection).length}/${COLLECTIBLES.length}`), stat('Gifts given', s.stats.gifts)),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn ghost', onclick: () => Router.go('party') }, icon('party'), 'Party'), h('button', { class: 'btn ghost', onclick: () => Router.go('journal') }, icon('journal'), 'Journal')),
        ),
      ),
    );
  },
});

function stat(k, v) { return h('div', { class: 'stat' }, h('span', { class: 'muted small' }, k), h('b', {}, v)); }

registerScreen('wardrobe', {
  render(params) {
    const s = st();
    const slot = params.slot || 'dress';
    const pieces = Object.entries(COSMETICS).filter(([, c]) => c.slot === slot);
    return h('div', { class: 'page wardrobe-page' },
      h('div', { class: 'wardrobe-preview panel' }, astoriaFigure({ worn: s.wardrobe.worn, cls: 'wardrobe-figure' })),
      h('div', { class: 'wardrobe-side scroll' },
        h('button', { class: 'btn ghost small back-btn', onclick: () => Router.back() }, icon('chevL'), 'Back'),
        h('h1', {}, 'Wardrobe'),
        h('div', { class: 'tabs scroll-x' }, ...SLOTS.map((x) => h('button', { class: `tab${x.id === slot ? ' active' : ''}`, onclick: () => Router.setParams({ slot: x.id }) }, x.name))),
        h('div', { class: 'cos-grid' }, ...pieces.map(([id, c]) => {
          const owned = Wardrobe.owns(id);
          const worn = s.wardrobe.worn[slot] === id;
          return h('button', { class: `cos-cell panel${owned ? '' : ' locked'}${worn ? ' worn' : ''}`, onclick: () => { if (owned) { Wardrobe.wear(id); Game.commit('wear'); } else if (c.price) Router.go('shop', { tab: 'wardrobe' }); } },
            cosArt(id, slot, owned ? 'clothing' : 'accessory'),
            h('b', {}, c.name),
            h('span', { class: 'muted tiny' }, COLLECTIONS[c.col]),
            worn ? h('span', { class: 'chip gold' }, 'Wearing') : owned ? h('span', { class: 'chip' }, 'Owned') : h('span', { class: 'muted tiny' }, c.price ? `${c.price} Crowns at Maison Corvelle` : c.source));
        })),
        h('p', { class: 'muted small proto-note' }, slot === 'shoes' ? 'Shoes are not visible in this portrait framing.' : 'Prototype: accessories are drawn onto the artwork and dresses re-tint the portrait. Fully re-illustrated outfits are planned.'),
      ),
    );
  },
});
