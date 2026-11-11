// InventoryManager — what Astoria carries, plus the collection journal.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { ITEMS, COLLECTIBLES } from '../data/items.js';

export const Inventory = {
  count(id) { return st().inventory[id] || 0; },
  has(id) { return this.count(id) > 0; },

  add(id, n = 1, { silent = false } = {}) {
    const def = ITEMS[id];
    if (!def) { console.warn('Unknown item', id); return; }
    const s = st();
    s.inventory[id] = (s.inventory[id] || 0) + n;
    const isNewCollectible = COLLECTIBLES.includes(id) && !s.collection[id];
    if (COLLECTIBLES.includes(id)) s.collection[id] = s.collection[id] || s.time.day;
    if (!silent) {
      bus.emit('toast', { text: isNewCollectible ? `Collectible found: ${def.name}` : `Received: ${def.name}${n > 1 ? ` ×${n}` : ''}`, kind: 'item', glyph: def.glyph });
      bus.emit('sfx', 'item');
    }
    bus.emit('inventory:changed', id);
  },

  remove(id, n = 1) {
    const s = st();
    s.inventory[id] = Math.max(0, (s.inventory[id] || 0) - n);
    if (s.inventory[id] === 0) delete s.inventory[id];
    bus.emit('inventory:changed', id);
  },

  list(cat) {
    return Object.keys(st().inventory)
      .filter((id) => ITEMS[id] && (!cat || ITEMS[id].cat === cat))
      .map((id) => ({ id, ...ITEMS[id], qty: st().inventory[id] }));
  },

  inspected(id) { return !!st().flags[`inspected_${id}`]; },

  // Returns the inspection text; the first inspection may unlock something.
  inspect(id, applyFx) {
    const def = ITEMS[id];
    const s = st();
    const first = !s.flags[`inspected_${id}`];
    s.flags[`inspected_${id}`] = true;
    if (first && def.inspectFx && applyFx) applyFx(def.inspectFx);
    return { text: def.inspect || def.desc, first };
  },
};
