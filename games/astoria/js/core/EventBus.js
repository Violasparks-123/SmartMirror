// Tiny publish/subscribe hub that lets systems talk without importing each other.
const listeners = new Map();

export const bus = {
  on(evt, fn) {
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
    return () => listeners.get(evt).delete(fn);
  },
  emit(evt, data) {
    const set = listeners.get(evt);
    if (!set) return;
    [...set].forEach((fn) => {
      try { fn(data); } catch (e) { console.error(`[bus:${evt}]`, e); }
    });
  },
};
