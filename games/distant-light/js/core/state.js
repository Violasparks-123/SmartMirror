/* Game state, saving, settings and the "meta" memory that survives new games.
   Saves live in this browser only (localStorage). Every access is guarded, so the
   game still runs in a private window; it just won't remember anything. */
DL.State = (() => {
  const KEY = 'distant-light.save.v1';
  const META = 'distant-light.meta.v1';
  const SET = 'distant-light.settings.v1';

  /* Saves go to two places: this browser (fast, but the Claude app can wipe it) and the
     artifact's own private cloud storage for your account (kept across devices and app restarts).
     The cloud copy is loaded once at start-up into `cloud`, then kept in step with every save. */
  const cloud = {};      // key -> value, mirrored from the cloud
  let cloudDocs = null;  // collection for this player, or null when the cloud isn't available
  const cloudKey = (k) => k.replace(/[^a-z0-9]/gi, '_');
  function cloudWrite(k, v) {
    if (!cloudDocs) return;
    const ref = cloudDocs.doc(cloudKey(k));
    (v == null ? ref.delete() : ref.set({ json: JSON.stringify(v), at: Date.now() })).catch(() => {});
  }
  const store = {
    get(k) {
      let local = null;
      try { const v = localStorage.getItem(k); local = v ? JSON.parse(v) : null; } catch (e) { /* storage unavailable */ }
      return local ?? cloud[k] ?? null;
    },
    set(k, v) { cloud[k] = v; cloudWrite(k, v); try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { delete cloud[k]; cloudWrite(k, null); try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
  };

  async function connectCloud() {
    try {
      const use = window.claude && window.claude.use;
      if (!use) return false;
      const [db, user] = await Promise.all([use('db'), use('user')]);
      const id = user ? await user.id() : null;
      if (!db || !id) return false;
      // Each save key is one document in this player's private collection: data/users/<id>/<key>
      cloudDocs = db.collection('data/users/' + id);
      for (const k of [KEY, META, SET]) {
        const snap = await cloudDocs.doc(cloudKey(k)).get();
        if (snap.exists) { try { cloud[k] = JSON.parse(snap.data().json); } catch (e) { /* bad copy */ } }
      }
      // Whatever this browser still has is pushed up so the cloud is never behind.
      for (const k of [KEY, META, SET]) {
        let local = null;
        try { const v = localStorage.getItem(k); local = v ? JSON.parse(v) : null; } catch (e) { /* none */ }
        if (local && !cloud[k]) { cloud[k] = local; cloudWrite(k, local); }
      }
      return true;
    } catch (e) { return false; }
  }

  const LIMITS = {
    grades: [0, 100], energy: [0, 100], money: [0, 99999],
    trust: [0, 10], favor: [0, 10], susp: [0, 10],
  };

  function defaults(name) {
    return {
      v: 1,
      name: name || 'Sora',
      day: 1,
      phase: 'morning',
      grades: 42,
      money: 600,
      energy: 100,
      trust: 0,   // Hikaru's trust in you
      favor: 2,   // how much Haruka likes you
      susp: 3,    // Haruka's suspicion of her sister
      frags: [],  // recovered lines (ids)
      missed: [], // lines you let her keep
      flags: {},
      items: { bread: 0, milk: 0, pencils: 0 },
      seen: {},   // location events already played
      diary: [],  // today's diary lines
      dayStart: null,
    };
  }

  let s = null;
  let memSave = null; // fallback when storage is blocked

  let meta = Object.assign({ endings: [], last: null, warned: false, plays: 0, leftMidway: false }, store.get(META) || {});
  let settings = Object.assign({ textSpeed: 42, autoDelay: 1.2, music: 55, sfx: 70, reduceFlash: false }, store.get(SET) || {});

  return {
    get s() { return s; },
    get meta() { return meta; },
    get settings() { return settings; },
    /* Called once before the title screen: fetches cloud saves (gives up after a few seconds). */
    async syncCloud() {
      const ok = await Promise.race([connectCloud(), new Promise((r) => setTimeout(() => r(false), 6000))]);
      if (ok) {
        meta = Object.assign(meta, store.get(META) || {});
        settings = Object.assign(settings, store.get(SET) || {});
      }
      return ok;
    },
    limits: LIMITS,

    newGame(name) {
      s = defaults(name);
      return s;
    },
    checkpoint(day, phase) {
      if (!s) return;
      s.day = day;
      s.phase = phase;
      memSave = JSON.stringify(s);
      store.set(KEY, s);
    },
    load() {
      let d = store.get(KEY);
      if (!d && memSave) d = JSON.parse(memSave);
      if (!d) return null;
      s = Object.assign(defaults(d.name), d);
      s.items = Object.assign(defaults().items, d.items || {});
      return s;
    },
    hasSave() { return !!(store.get(KEY) || memSave); },
    clearSave() { store.del(KEY); memSave = null; },
    saveMeta() { store.set(META, meta); },
    saveSettings() { store.set(SET, settings); },
    wipeAll() { store.del(KEY); store.del(META); memSave = null; meta.endings = []; meta.last = null; meta.plays = 0; meta.leftMidway = false; store.set(META, meta); },

    /* Add numbers to stats with limits. Returns the real deltas applied. */
    add(obj) {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        const before = s[k] ?? 0;
        const [a, b] = LIMITS[k] || [-Infinity, Infinity];
        s[k] = DL.util.clamp(before + v, a, b);
        out[k] = s[k] - before;
      }
      return out;
    },
    hasFrag(id) { return !!s && s.frags.includes(id); },

    /* How broken the world is: 0 calm → 3 coming apart. */
    corruption() {
      if (!s) return 0;
      if (s.flags.ended) return 0;
      const d = s.day;
      if (d >= 7) return 3;
      if (d === 6) return 2;
      if (d >= 4) return 1;
      return 0;
    },
    /* Is Hikaru allowed to exist in this scene? */
    hikaruHere() {
      if (!s) return true;
      if (s.day === 7) return false;
      if (s.day === 8) return !!s.flags.hikaruBack;
      return true;
    },
  };
})();
