// App shell + router: top bar, left navigation, bottom navigation and the
// screen area. Screens re-render whenever the game state changes, so every
// view always shows the same truth.
import { h, fmt } from './dom.js';
import { icon, PHASE_ICON } from './icons.js';
import { portrait } from './art.js';
import { st } from '../core/GameState.js';
import { bus } from '../core/EventBus.js';
import { Player } from '../systems/PlayerProfile.js';
import { Time } from '../systems/TimeManager.js';
import { Notifications } from '../systems/NotificationManager.js';
import { Audio } from '../systems/AudioManager.js';
import { openSheet } from './overlay.js';

const G = 'assets/gala/';
const P = 'assets/ui2/';
const gi = (src, cls = 'gicon') => h('img', { class: cls, src, alt: '', draggable: 'false' });
const NAV_ART = { home: 'home', characters: 'characters', inventory: 'inventory', quests: 'quests', map: 'map', settings: 'settings' };

const screens = {};
let current = { name: 'home', params: {} };
const history = [];
let renderQueued = false;
let shell = null;

export function registerScreen(name, def) { screens[name] = def; }

const LEFT = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'characters', label: 'Characters', icon: 'characters' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory' },
  { id: 'quests', label: 'Quests', icon: 'quests' },
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
const BOTTOM = [
  { id: 'explore', label: 'Explore', icon: 'explore', to: 'map' },
  { id: 'shop', label: 'Shop', icon: 'shop' },
  { id: 'summon', label: 'Summon', icon: 'summon' },
  { id: 'journal', label: 'Journal', icon: 'journal' },
  { id: 'achievements', label: 'Achievements', icon: 'achievements' },
];

// Hash names must avoid words claude.ai reserves (e.g. "settings").
const HASH = { settings: 'options' };
const UNHASH = { options: 'settings' };

export const Router = {
  get current() { return current; },

  go(name, params = {}, { replace = false } = {}) {
    if (!screens[name]) { console.warn('No screen', name); name = 'home'; }
    if (!replace && current.name !== name) history.push(current);
    if (history.length > 30) history.shift();
    current = { name, params: { ...params } };
    const def = screens[name];
    if (def.hash !== false) {
      const tag = HASH[name] || name;
      if (location.hash.slice(1) !== tag) { try { window.history.replaceState(null, '', `#${tag}`); } catch { /* sandboxed frames may refuse */ } }
    }
    Audio.scene(def.music ? (typeof def.music === 'function' ? def.music(current.params) : def.music) : 'home');
    this.render(true);
  },

  back() {
    const prev = history.pop();
    if (prev) { current = prev; Audio.scene(screens[prev.name]?.music ? (typeof screens[prev.name].music === 'function' ? screens[prev.name].music(prev.params) : screens[prev.name].music) : 'home'); this.render(true); } else this.go('home');
  },

  setParams(patch) { Object.assign(current.params, patch); this.render(); },

  render(fresh = false) {
    if (!shell) return;
    const def = screens[current.name];
    const main = shell.main;
    const prevScroll = fresh ? 0 : (main.querySelector('.scroll')?.scrollTop || 0);
    const node = def.render(current.params);
    main.className = `main screen-${current.name}${fresh ? ' fade-in' : ''}`;
    main.innerHTML = '';
    main.appendChild(node);
    const sc = main.querySelector('.scroll'); if (sc) sc.scrollTop = prevScroll;
    document.body.classList.toggle('pre-start', current.name === 'title');
    renderChrome();
  },

  queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; this.render(); });
  },
};

function navActive(id) {
  const n = current.name;
  if (id === n) return true;
  if (id === 'characters' && (n === 'character' || n === 'party')) return true;
  if (id === 'home' && (n === 'profile' || n === 'wardrobe' || n === 'event' || n === 'letters')) return true;
  if (id === 'explore' && n === 'location') return true;
  return false;
}

function renderChrome() {
  const s = st();
  const p = s.player;
  const need = Player.expToNext();
  const pct = Math.floor((p.exp / need) * 100);
  const t = s.time;
  shell.top.innerHTML = '';
  shell.top.append(
    h('button', { class: 'avatar-btn', 'aria-label': 'Astoria\'s profile', onclick: () => Router.go('profile') },
      h('div', { class: 'avatar-ring painted' }, gi(`${P}avatar_frame_portrait.webp`, 'avatar-painted'))),
    h('div', { class: 'top-id' },
      h('div', { class: 'top-name' }, 'Astoria'),
      h('div', { class: 'top-level' }, h('span', { class: 'lv' }, `Lv. ${p.level}`), h('span', { class: 'exp-pct' }, `EXP ${pct}%`)),
      h('div', { class: 'exp-bar' }, h('div', { class: 'exp-fill', style: { width: `${pct}%` } })),
      h('div', { class: 'top-time' }, icon(PHASE_ICON[t.phase]), Time.label()),
    ),
    h('div', { class: 'top-right' },
      h('div', { class: 'currencies' },
        currency('moonstone', p.moonstones, 'Moonstones', 'Earned from quests, achievements, levelling up and daily activities. Offered at the altar to Summon.'),
        currency('crown', p.crowns, 'Crowns', 'Earned from quests and daily activities. Spent at Maison Corvelle.'),
      ),
      h('div', { class: 'top-icons' },
        h('button', { class: `icon-btn${current.name === 'settings' ? ' active' : ''}`, 'aria-label': 'Settings', onclick: () => Router.go('settings') }, gi('assets/icons/settings.webp', 'hud-ico new-ico')),
        badgeBtn('mail', Notifications.unreadLetters(), 'Letters', () => Router.go('letters', { tab: 'letters' })),
        badgeBtn('bell', Notifications.unreadNotices(), 'Notifications', () => Router.go('letters', { tab: 'notices' })),
      ),
    ),
  );
  shell.left.innerHTML = '';
  LEFT.forEach((it) => shell.left.appendChild(
    h('button', { class: `rail-btn${navActive(it.id) ? ' active' : ''}`, onclick: () => Router.go(it.id) }, (it.id === 'home' && navActive('home') ? gi(`${P}nav_home_active.webp`, 'nav-ico home-active') : it.id === 'home' ? gi(`${P}icon_star.webp`, 'nav-ico') : gi(`${P}nav_${NAV_ART[it.id]}.webp`, 'nav-ico')), h('span', {}, it.label))));
  shell.bottom.innerHTML = '';
  BOTTOM.forEach((it) => shell.bottom.appendChild(
    h('button', { class: `nav-btn${navActive(it.id) || navActive(it.to) ? ' active' : ''}`, onclick: () => Router.go(it.to || it.id) }, icon(it.icon), h('span', {}, it.label))));
}

function currency(kind, val, name, help) {
  return h('div', { class: `currency painted-pill cur-${kind}` },
    gi(`${P}${kind === 'moonstone' ? 'icon_star' : 'icon_coin'}.webp`, 'cur-ico'),
    h('span', { class: 'cur-val' }, fmt(val)),
    h('button', { class: 'cur-plus', 'aria-label': `How to earn ${name}`, onclick: () => openSheet({ title: name, cls: 'sheet-small', body: h('div', { class: 'confirm' }, h('p', {}, help), h('p', { class: 'muted' }, 'There are no purchases in Astoria — everything is earned by playing.')) }) }, gi(`${P}icon_plus_circle.webp`, 'plus-ico')));
}

function badgeBtn(ic, n, label, fn) {
  return h('button', { class: 'icon-btn badge-btn', 'aria-label': label, onclick: fn }, gi(`assets/icons/${ic}.webp`, 'hud-ico new-ico'), n ? h('span', { class: 'badge' }, n > 9 ? '9+' : n) : null);
}

export function mountShell() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const top = h('header', { class: 'topbar' });
  const left = h('nav', { class: 'rail', 'aria-label': 'Main' });
  const main = h('main', { class: 'main' });
  const bottom = h('nav', { class: 'bottomnav', 'aria-label': 'Secondary' });
  app.append(h('div', { class: 'frame' }, top, h('div', { class: 'body' }, left, main), bottom));
  shell = { top, left, main, bottom };
  bus.on('state:changed', () => Router.queueRender());
  bus.on('state:replaced', () => Router.queueRender());
  bus.on('dialogue:end', () => {
    const def = screens[current.name];
    Audio.scene(def?.music ? (typeof def.music === 'function' ? def.music(current.params) : def.music) : 'home');
  });
  window.addEventListener('hashchange', () => {
    const tag = location.hash.slice(1);
    const name = UNHASH[tag] || tag;
    if (screens[name] && name !== current.name && screens[name].hash !== false) Router.go(name);
  });
}

export function initialScreen() {
  const tag = location.hash.slice(1);
  const name = UNHASH[tag] || tag;
  return screens[name] && screens[name].hash !== false ? name : 'home';
}
