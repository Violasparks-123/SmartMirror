/* storage.js — save slots (localStorage) and injected assets (IndexedDB).
 * Written in plain ES5-style JavaScript so it runs on older iPad Safari. */
(function () {
  var CV = window.CV;
  var PREFIX = 'crimsonVelvet.';
  var SLOTS = ['auto', 'gala', '1', '2', '3'];

  function lsGet(k) { try { return window.localStorage.getItem(PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(PREFIX + k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { window.localStorage.removeItem(PREFIX + k); } catch (e) {} }

  CV.storage = {
    slots: SLOTS,
    slotLabel: function (s) {
      return s === 'auto' ? 'Autosave' : s === 'gala' ? 'Before the Gala' : 'Slot ' + s;
    },
    save: function (slot, state) {
      var data = { meta: { savedAt: Date.now(), loc: state.loc, chapter: CV.chapter ? CV.chapter(state).t : '' }, state: state };
      return lsSet('save.' + slot, JSON.stringify(data));
    },
    load: function (slot) {
      var raw = lsGet('save.' + slot);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    },
    remove: function (slot) { lsDel('save.' + slot); },
    getSetting: function (k, d) { var v = lsGet('set.' + k); return v === null ? d : v === '1'; },
    setSetting: function (k, v) { lsSet('set.' + k, v ? '1' : '0'); },
    wipeAll: function () {
      for (var i = 0; i < SLOTS.length; i++) lsDel('save.' + SLOTS[i]);
    }
  };

  /* ---------- IndexedDB asset store (falls back to localStorage) ---------- */
  var DB_NAME = 'crimsonVelvetAssets', STORE = 'assets', db = null;

  function openDB(cb) {
    if (db) return cb(db);
    if (!window.indexedDB) return cb(null);
    var req;
    try { req = window.indexedDB.open(DB_NAME, 1); } catch (e) { return cb(null); }
    req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
    req.onsuccess = function () { db = req.result; cb(db); };
    req.onerror = function () { cb(null); };
  }

  CV.assetStore = {
    getAll: function (cb) {
      openDB(function (d) {
        var out = {};
        if (!d) {
          var raw = lsGet('assets');
          try { out = raw ? JSON.parse(raw) : {}; } catch (e) { out = {}; }
          return cb(out);
        }
        try {
          var tx = d.transaction(STORE, 'readonly'), st = tx.objectStore(STORE);
          var cur = st.openCursor();
          cur.onsuccess = function (ev) {
            var c = ev.target.result;
            if (c) { out[c.key] = c.value; c['continue'](); } else cb(out);
          };
          cur.onerror = function () { cb(out); };
        } catch (e) { cb(out); }
      });
    },
    put: function (key, value, cb) {
      openDB(function (d) {
        if (!d) {
          CV.assetStore.getAll(function (all) {
            all[key] = value;
            var ok = lsSet('assets', JSON.stringify(all));
            cb && cb(ok);
          });
          return;
        }
        try {
          var tx = d.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(value, key);
          tx.oncomplete = function () { cb && cb(true); };
          tx.onerror = function () { cb && cb(false); };
        } catch (e) { cb && cb(false); }
      });
    },
    del: function (key, cb) {
      openDB(function (d) {
        if (!d) {
          CV.assetStore.getAll(function (all) { delete all[key]; lsSet('assets', JSON.stringify(all)); cb && cb(true); });
          return;
        }
        try {
          var tx = d.transaction(STORE, 'readwrite');
          tx.objectStore(STORE)['delete'](key);
          tx.oncomplete = function () { cb && cb(true); };
        } catch (e) { cb && cb(false); }
      });
    },
    clear: function (cb) {
      openDB(function (d) {
        if (!d) { lsDel('assets'); return cb && cb(true); }
        try {
          var tx = d.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).clear();
          tx.oncomplete = function () { cb && cb(true); };
        } catch (e) { cb && cb(false); }
      });
    }
  };
})();
