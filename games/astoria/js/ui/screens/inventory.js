// Inventory (with collection journal) and the shop, Maison Corvelle.
import { h, paras, fmt } from '../dom.js';
import { icon, pico } from '../icons.js';
import { itemArt, portrait, cosArt, COS_THUMBS } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { openSheet, toast } from '../overlay.js';
import { playConversation } from '../dialogue.js';
import { st, Game } from '../../core/GameState.js';
import { ITEMS, ITEM_CATEGORIES, COLLECTIBLES, SHOP_STOCK } from '../../data/items.js';
import { COSMETICS, SLOTS, COLLECTIONS } from '../../data/wardrobe.js';
import { NPCS } from '../../data/npcs.js';
import { Inventory } from '../../systems/InventoryManager.js';
import { NPCs } from '../../systems/NPCManager.js';
import { Player } from '../../systems/PlayerProfile.js';
import { Wardrobe } from '../../systems/CharacterManager.js';
import { applyFx } from '../../systems/Effects.js';

const tabs = (list, cur, onPick) => h('div', { class: 'tabs scroll-x' }, ...list.map((t) => h('button', { class: `tab${t.id === cur ? ' active' : ''}`, onclick: () => onPick(t.id) }, t.name, t.count ? h('span', { class: 'tab-count' }, t.count) : null)));

export function openItem(id) {
  const def = ITEMS[id];
  const s = st();
  const present = NPCs.presentAt(s.location).filter((n) => s.npcs[n].met && !NPCs.isAvoiding(n));
  const body = h('div', { class: 'item-detail' });
  const render = (note) => {
    body.innerHTML = '';
    const inspected = Inventory.inspected(id);
    body.append(...[
      h('div', { class: 'item-hero' }, itemArt(def.glyph, def.cat, 'big'), h('div', {}, h('div', { class: 'chip' }, ITEM_CATEGORIES.find((c) => c.id === def.cat)?.name), h('div', { class: 'muted small' }, `Carrying ×${Inventory.count(id)}`))),
      h('p', {}, def.desc),
      inspected && def.inspect ? h('div', { class: 'inspect-text' }, ...paras(def.inspect)) : null,
      note ? h('div', { class: 'greeting' }, note) : null,
      h('div', { class: 'btn-row wrap' },
        def.inspect && !inspected ? h('button', { class: 'btn primary small', onclick: () => { Inventory.inspect(id, applyFx); Game.commit('inspect'); render(); } }, icon('eye'), def.cat === 'book' ? 'Read' : 'Inspect') : null,
        def.cosmetic ? h('button', { class: 'btn primary small', onclick: () => { sheet.close(); Router.go('wardrobe', { slot: COSMETICS[def.cosmetic].slot }); } }, icon('wardrobe'), 'Wear') : null,
        def.cat === 'gift' ? (present.length ? present.map((n) => h('button', { class: 'btn ghost small', onclick: () => {
          const res = NPCs.giveGift(n, id); Game.commit('gift');
          if (res) render(`${NPCS[n].name}: ${res.text}`);
        } }, icon('gift'), `Give to ${NPCS[n].name}`)) : h('span', { class: 'muted small' }, 'No one here to give this to.')) : null,
        ['quest', 'collectible', 'book', 'magical'].includes(def.cat) && present.length ? present.map((n) => h('button', { class: 'btn ghost small', onclick: () => { sheet.close(); playConversation(NPCs.showConvo(n, id), { npc: n, onEnd: () => Game.commit('show') }); } }, icon('eye'), `Show ${NPCS[n].name}`)) : null,
      ),
    ].filter(Boolean));
  };
  const sheet = openSheet({ title: def.name, body, cls: 'item-sheet' });
  render();
}

registerScreen('inventory', {
  render(params) {
    const s = st();
    const tab = params.tab || 'all';
    const counts = Object.fromEntries(ITEM_CATEGORIES.map((c) => [c.id, Inventory.list(c.id).length]));
    const tabList = [{ id: 'all', name: 'All', count: Inventory.list().length }, ...ITEM_CATEGORIES.map((c) => ({ ...c, count: counts[c.id] })), { id: 'collection', name: 'Collection Journal', count: `${Object.keys(s.collection).length}/${COLLECTIBLES.length}` }];
    let content;
    if (tab === 'collection') {
      content = h('div', {},
        h('p', { class: 'muted' }, 'Small things Elaria forgot to forget. Each was found somewhere — in the world, or given back by the moon.'),
        h('div', { class: 'item-grid' }, ...COLLECTIBLES.map((id) => {
          const found = s.collection[id];
          return h('button', { class: `item-cell${found ? '' : ' unknown'}`, onclick: () => (found && Inventory.has(id) ? openItem(id) : null) },
            found ? itemArt(ITEMS[id].glyph, 'collectible') : h('div', { class: 'item-art silhouette' }, icon('ask')),
            h('span', { class: 'item-name' }, found ? ITEMS[id].name : '???'),
            found ? h('span', { class: 'muted tiny' }, `Day ${found}`) : null);
        })));
    } else {
      const cat = tab === 'all' ? null : tab;
      // Search, "not yet inspected" filter and sort order.
      const SORTS = { type: 'By type', az: 'A to Z', new: 'Newest' };
      const sort = SORTS[params.sort] ? params.sort : 'type';
      const fresh = params.fresh === '1';
      let items = Inventory.list(cat);
      if (fresh) items = items.filter((it) => it.inspect && !Inventory.inspected(it.id));
      if (sort === 'az') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'new') items = [...items].reverse();
      const nextSort = { type: 'az', az: 'new', new: 'type' }[sort];
      const search = h('input', { type: 'search', class: 'inv-input', placeholder: 'Search your things', 'aria-label': 'Search your things',
        oninput: (e) => { const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('.item-grid .item-cell').forEach((c) => { c.style.display = !q || (c.dataset.name || '').includes(q) ? '' : 'none'; }); } });
      const bar = h('div', { class: 'inv-bar' },
        h('label', { class: 'inv-search' }, pico('search', 'pico inv-pico'), search),
        h('button', { class: `inv-tool${fresh ? ' on' : ''}`, title: 'Only things you have not inspected yet', 'aria-pressed': String(fresh), onclick: () => Router.setParams({ fresh: fresh ? '' : '1' }) }, pico('filter', 'pico inv-pico'), h('span', {}, fresh ? 'Not inspected' : 'All')),
        h('button', { class: 'inv-tool', title: 'Change the order', onclick: () => Router.setParams({ sort: nextSort }) }, pico('sort', 'pico inv-pico'), h('span', {}, SORTS[sort])));
      const extra = [];
      if (tab === 'clothing' || tab === 'accessory') {
        const slotIds = tab === 'clothing' ? ['dress', 'shoes'] : ['hair', 'accessory', 'jewellery', 'makeup'];
        const owned = Object.keys(s.wardrobe.owned).filter((c) => COSMETICS[c] && slotIds.includes(COSMETICS[c].slot) && c !== 'none');
        extra.push(h('h3', { class: 'sub-h' }, 'In your wardrobe'), h('div', { class: 'chips' }, ...owned.map((c) => h('button', { class: 'chip btnish', onclick: () => Router.go('wardrobe', { slot: COSMETICS[c].slot }) }, COSMETICS[c].name))));
      }
      content = h('div', {},
        bar,
        items.length ? h('div', { class: 'item-grid' }, ...items.map((it) => h('button', { class: 'item-cell', dataset: { name: it.name.toLowerCase() }, onclick: () => openItem(it.id) },
          itemArt(it.glyph, it.cat), h('span', { class: 'item-name' }, it.name), it.qty > 1 ? h('span', { class: 'qty' }, `×${it.qty}`) : null,
          it.inspect && !Inventory.inspected(it.id) ? h('span', { class: 'new-dot' }) : null)))
          : h('p', { class: 'muted empty' }, 'Nothing here yet.'),
        ...extra);
    }
    return h('div', { class: 'page scroll' },
      h('header', { class: 'page-head' }, pico('inventory', 'head-ico'), h('h1', {}, 'Inventory'), h('p', { class: 'muted' }, 'Inspect things closely — some objects remember more than they show.')),
      tabs(tabList, tab, (t) => Router.setParams({ tab: t })),
      content,
    );
  },
});

registerScreen('shop', {
  render(params) {
    const s = st();
    const tab = params.tab || 'gifts';
    let content;
    if (tab === 'gifts') {
      content = h('div', { class: 'shop-grid' }, ...SHOP_STOCK.map((id) => {
        const it = ITEMS[id];
        return h('div', { class: 'shop-cell panel' },
          itemArt(it.glyph, it.cat, 'big'),
          h('div', { class: 'grow' }, h('b', {}, it.name), h('div', { class: 'muted small' }, it.desc), Inventory.count(id) ? h('div', { class: 'tiny muted' }, `You have ×${Inventory.count(id)}`) : null),
          h('button', { class: 'btn small primary', disabled: !Player.canAfford('crowns', it.price), onclick: () => {
            if (Player.spend('crowns', it.price)) { Inventory.add(id, 1); Game.commit('buy'); }
          } }, icon('crown'), fmt(it.price)));
      }));
    } else {
      const pieces = Object.entries(COSMETICS).filter(([, c]) => c.price);
      content = h('div', { class: 'shop-grid' }, ...pieces.map(([id, c]) => {
        const owned = Wardrobe.owns(id);
        return h('div', { class: `shop-cell panel${COS_THUMBS.has(id) ? ' has-thumb' : ''}` },
          cosArt(id, c.slot, 'clothing', 'big'),
          h('div', { class: 'grow' }, h('b', {}, c.name), h('div', { class: 'muted small' }, `${SLOTS.find((x) => x.id === c.slot).name} · ${COLLECTIONS[c.col]}`), h('div', { class: 'muted small' }, c.desc)),
          owned ? h('button', { class: 'btn small ghost', onclick: () => Router.go('wardrobe', { slot: c.slot }) }, 'Owned · Wear')
            : h('button', { class: 'btn small primary', disabled: !Player.canAfford('crowns', c.price), onclick: () => { if (Wardrobe.buy(id)) { toast({ text: `${c.name} added to your wardrobe.`, kind: 'outfit' }); Game.commit('buy'); } } }, icon('crown'), fmt(c.price)));
      }));
    }
    return h('div', { class: 'page scroll shop-page' },
      h('header', { class: 'shop-hero panel' },
        h('img', { class: 'shop-hero-art', src: 'assets/gala/astoria.webp', alt: '', draggable: 'false' }),
        h('div', { class: 'shop-hero-text' },
          h('h1', {}, 'Maison Corvelle'),
          h('p', { class: 'shop-quote' }, '“A little indulgence never hurts, darling.”'),
          h('p', { class: 'muted small' }, 'Lace, scent and small beautiful things. Prices are in Crowns earned in play — nothing here costs real money.'),
          h('div', { class: 'wallet' }, icon('crown'), fmt(s.player.crowns), ' Crowns'))),
      tabs([{ id: 'gifts', name: 'Gifts & Curiosities' }, { id: 'wardrobe', name: 'Wardrobe' }], tab, (t) => Router.setParams({ tab: t })),
      content,
    );
  },
});
