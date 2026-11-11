// Summoning — offer Moonstones at the altar and the moon gives back
// something it took. Moonstones are only ever earned in play; there is no
// purchasing of any kind.
import { st } from '../core/GameState.js';
import { SUMMON_COST, SUMMON_POOL } from '../data/misc.js';
import { Player } from './PlayerProfile.js';
import { Inventory } from './InventoryManager.js';
import { Wardrobe } from './CharacterManager.js';
import { ITEMS } from '../data/items.js';
import { COSMETICS } from '../data/wardrobe.js';

export const Summoning = {
  cost: SUMMON_COST,

  pull() {
    if (!Player.spend('moonstones', SUMMON_COST)) return null;
    const s = st();
    s.stats.summons += 1;
    const total = SUMMON_POOL.reduce((a, b) => a + b.w, 0);
    let roll = Math.random() * total;
    let pick = SUMMON_POOL[0];
    for (const p of SUMMON_POOL) { roll -= p.w; if (roll <= 0) { pick = p; break; } }
    // Guarantee the first summon returns a memory.
    if (s.stats.summons === 1) pick = SUMMON_POOL[0];

    if (pick.kind === 'outfit') {
      if (Wardrobe.owns(pick.id)) {
        Player.add('crowns', 120);
        return { name: '120 Crowns', text: 'The moon offers something you already have — and, finding it already yours, leaves crowns instead.', glyph: 'coin' };
      }
      Wardrobe.grant(pick.id, { silent: true });
      return { name: COSMETICS[pick.id].name, text: pick.text, glyph: 'gem', outfit: true };
    }
    if (pick.kind === 'crowns') {
      Player.add('crowns', pick.n);
      return { name: `${pick.n} Crowns`, text: pick.text, glyph: 'coin' };
    }
    Inventory.add(pick.id, 1, { silent: true });
    return { name: ITEMS[pick.id].name, text: pick.text, glyph: ITEMS[pick.id].glyph, item: pick.id };
  },
};
