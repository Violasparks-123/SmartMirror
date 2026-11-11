// PlayerProfile — Astoria's level, experience, currencies and behavioural path.
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { PATHS } from '../data/misc.js';

export const Player = {
  expToNext(level = st().player.level) { return 100 + (level - 1) * 60; },

  addExp(n) {
    const p = st().player;
    p.exp += n;
    let need = this.expToNext(p.level);
    while (p.exp >= need) {
      p.exp -= need;
      p.level += 1;
      p.moonstones += 30;
      bus.emit('toast', { text: `Level ${p.level} — Astoria grows more certain of herself. +30 Moonstones`, kind: 'level' });
      bus.emit('sfx', 'levelup');
      need = this.expToNext(p.level);
    }
  },

  add(kind, n) {
    const p = st().player;
    p[kind] = Math.max(0, (p[kind] || 0) + n);
  },

  canAfford(kind, n) { return (st().player[kind] || 0) >= n; },

  spend(kind, n) {
    if (!this.canAfford(kind, n)) return false;
    st().player[kind] -= n;
    return true;
  },

  addPath(path, n = 1) {
    const p = st().player.path;
    if (!(path in p)) return;
    const before = this.dominant();
    p[path] += n;
    const after = this.dominant();
    if (after && after !== before) {
      bus.emit('toast', { text: `Astoria is becoming more ${PATHS[after].name.toLowerCase()}.`, kind: 'path' });
    }
  },

  dominant() {
    const p = st().player.path;
    let best = null; let max = 0;
    for (const k of Object.keys(p)) if (p[k] > max) { max = p[k]; best = k; }
    return best;
  },
};
