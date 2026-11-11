// SaveManager — persists progress to this browser (localStorage) and, when the
// game is opened as a signed-in Claude artifact, to a private cloud slot that
// only this player can read. The newest of the two copies wins on load.
import { Game, newState, migrate, st } from './GameState.js';
import { bus } from './EventBus.js';

const KEY = 'astoria.moonlitveil.save.v1';
let localTimer = null;
let cloudTimer = null;
let cloud = null;            // { ref }
let cloudWriting = false;
let cloudDirty = false;
let lastCloudJson = '';
let status = 'local';        // 'local' | 'cloud' | 'cloud-error'

function readLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeLocal(json) {
  try { localStorage.setItem(KEY, json); return true; } catch { return false; }
}

function encode(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)));
}
function decode(code) {
  return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
}

export const SaveManager = {
  get status() { return status; },

  init() {
    const loaded = readLocal();
    Game.replace(loaded ? migrate(loaded) : newState());
    bus.on('state:changed', () => this.queue());
    this.initCloud();
  },

  queue() {
    clearTimeout(localTimer);
    localTimer = setTimeout(() => this.saveNow(), 300);
  },

  saveNow() {
    const s = st();
    if (!s) return;
    s.savedAt = Date.now();
    writeLocal(JSON.stringify(s));
    this.queueCloud();
    bus.emit('save:done', status);
  },

  // ---------- cloud slot (optional) ----------
  async initCloud() {
    try {
      const c = window.claude;
      if (!c || typeof c.use !== 'function') return;
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      const ref = db.doc(`data/users/${id}/astoria-save`);
      const timeout = new Promise((res) => setTimeout(() => res('timeout'), 10000));
      const snap = await Promise.race([ref.get(), timeout]);
      if (snap === 'timeout') return;
      cloud = { ref };
      status = 'cloud';
      if (snap.exists) {
        const body = snap.data();
        const remote = body && typeof body.json === 'string' ? JSON.parse(body.json) : null;
        lastCloudJson = body?.json || '';
        const local = st();
        if (remote && (remote.savedAt || 0) > (local.savedAt || 0)) {
          Game.replace(migrate(remote));
          writeLocal(JSON.stringify(st()));
          bus.emit('toast', { text: 'Your progress was restored from your cloud save.', kind: 'info' });
        } else if (local.started) {
          this.queueCloud();
        }
      } else if (st().started) {
        this.queueCloud();
      }
      bus.emit('save:done', status);
    } catch (e) {
      status = cloud ? 'cloud-error' : 'local';
    }
  },

  queueCloud() {
    if (!cloud) return;
    cloudDirty = true;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => this.flushCloud(), 2500);
  },

  async flushCloud() {
    if (!cloud || cloudWriting || !cloudDirty) return;
    const json = JSON.stringify(st());
    if (json === lastCloudJson) { cloudDirty = false; return; }
    cloudWriting = true;
    cloudDirty = false;
    try {
      await cloud.ref.set({ json, savedAt: st().savedAt || Date.now() });
      lastCloudJson = json;
      status = 'cloud';
    } catch (e) {
      status = 'cloud-error';
      if (e && (e.code === 'revoked' || e.code === 'invalid_argument' || e.code === 'not_granted')) cloud = null;
    } finally {
      cloudWriting = false;
      if (cloudDirty) this.queueCloud();
      bus.emit('save:done', status);
    }
  },

  exportCode() { return encode(st()); },

  importCode(code) {
    const data = decode(code);
    if (!data || !data.player || !data.npcs) throw new Error('That does not look like an Astoria save.');
    Game.replace(migrate(data));
    this.saveNow();
  },

  reset() {
    Game.replace(newState());
    this.saveNow();
  },
};
