// CharacterManager — Astoria's wardrobe: owned cosmetics and what she wears.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { COSMETICS } from '../data/wardrobe.js';
import { Player } from './PlayerProfile.js';

export const Wardrobe = {
  owns(id) { return !!st().wardrobe.owned[id]; },
  worn() { return st().wardrobe.worn; },

  grant(id, { silent = false } = {}) {
    const c = COSMETICS[id];
    if (!c) return;
    if (this.owns(id)) return;
    st().wardrobe.owned[id] = true;
    if (!silent) bus.emit('toast', { text: `New for the wardrobe: ${c.name}`, kind: 'outfit' });
  },

  wear(id) {
    const c = COSMETICS[id];
    if (!c || !this.owns(id)) return false;
    st().wardrobe.worn[c.slot] = id;
    bus.emit('wardrobe:changed');
    return true;
  },

  buy(id) {
    const c = COSMETICS[id];
    if (!c?.price || this.owns(id)) return false;
    if (!Player.spend('crowns', c.price)) return false;
    this.grant(id, { silent: true });
    return true;
  },
};
