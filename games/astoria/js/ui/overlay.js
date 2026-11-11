// Overlay layer: sheets (panels that slide up), a presentation queue so story
// moments never trample each other, confirm dialogs and toasts.
import { h } from './dom.js';
import { icon, pico } from './icons.js';
import { bus } from '../core/EventBus.js';
import { itemArt } from './art.js';

const root = () => document.getElementById('overlay-root');
const stack = [];

export function openSheet({ title = '', subtitle = '', body = null, cls = '', onClose = null, dismissable = true, art = null } = {}) {
  const panel = h('div', { class: `sheet ${cls}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Panel' });
  const backdrop = h('div', { class: 'sheet-backdrop' }, panel);
  const head = h('div', { class: 'sheet-head' },
    art,
    h('div', { class: 'sheet-titles' }, title ? h('h2', { class: 'sheet-title' }, title) : null, subtitle ? h('div', { class: 'sheet-sub' }, subtitle) : null),
    dismissable ? h('button', { class: 'icon-btn sheet-close', 'aria-label': 'Close', onclick: () => ctrl.close() }, pico('close')) : null,
  );
  const content = h('div', { class: 'sheet-body' });
  panel.append(head, content);
  if (body) content.appendChild(body);
  const ctrl = {
    el: panel,
    body: content,
    setBody(node) { content.innerHTML = ''; if (node) content.appendChild(node); content.scrollTop = 0; },
    setTitle(t, sub) { head.querySelector('.sheet-title') && (head.querySelector('.sheet-title').textContent = t); if (sub !== undefined && head.querySelector('.sheet-sub')) head.querySelector('.sheet-sub').textContent = sub; },
    close() {
      if (ctrl.closed) return;
      ctrl.closed = true;
      backdrop.classList.add('closing');
      setTimeout(() => backdrop.remove(), 220);
      const i = stack.indexOf(ctrl); if (i >= 0) stack.splice(i, 1);
      if (onClose) onClose();
    },
  };
  if (dismissable) backdrop.addEventListener('click', (e) => { if (e.target === backdrop) ctrl.close(); });
  root().appendChild(backdrop);
  stack.push(ctrl);
  bus.emit('sfx', 'open');
  requestAnimationFrame(() => backdrop.classList.add('open'));
  return ctrl;
}

export function closeAllSheets() { [...stack].forEach((s) => s.close()); }

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && stack.length && !document.querySelector('.dlg-layer')) stack[stack.length - 1].close();
});

// ---------- presentation queue ----------
const queue = [];
let running = false;

export const Presenter = {
  enqueue(task) { queue.push(task); this.pump(); },
  get busy() { return running; },
  pump() {
    if (running || !queue.length) return;
    running = true;
    const task = queue.shift();
    let finished = false;
    const done = () => { if (finished) return; finished = true; running = false; bus.emit('presenter:idle'); setTimeout(() => this.pump(), 60); };
    try { task(done); } catch (e) { console.error(e); done(); }
  },
};

export function confirmDialog({ title, text, ok = 'Confirm', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const body = h('div', { class: 'confirm' },
      h('p', {}, text),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn ghost', onclick: () => { answered = true; resolve(false); s.close(); } }, cancel),
        h('button', { class: `btn ${danger ? 'danger' : 'primary'}`, onclick: () => { answered = true; resolve(true); s.close(); } }, ok),
      ));
    const s = openSheet({ title, body, cls: 'sheet-small', onClose: () => { if (!answered) resolve(false); } });
  });
}

// ---------- toasts ----------
const KIND_ICON = { quest: 'quests', objective: 'check', item: null, memory: 'journal', mystery: 'ask', letter: 'mail', level: 'sparkle', path: 'heart', location: 'pin', event: 'sparkle', npc: 'characters', achievement: 'achievements', outfit: 'wardrobe', exp: 'sparkle', crowns: 'crown', moonstones: 'moonstone', info: 'sparkle' };

export function toast({ text, kind = 'info', glyph }) {
  const r = document.getElementById('toast-root');
  if (!r) return;
  const iconNode = kind === 'item' && glyph ? itemArt(glyph, 'quest', 'toast-item') : icon(KIND_ICON[kind] || 'sparkle');
  const t = h('div', { class: `toast toast-${kind}` }, iconNode, h('span', {}, text));
  r.appendChild(t);
  while (r.children.length > 3) r.firstChild.remove();
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, kind === 'exp' || kind === 'crowns' || kind === 'moonstones' ? 1500 : 2800);
}

// ---------- chapter title card ----------
// Full-screen card shown when a chapter begins: number, title, the one question
// the chapter answers, and how many nights are left before the eclipse.
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
export function chapterCard({ num, title, question, nights }, done) {
  const card = h('div', { class: 'chapter-card', role: 'dialog', 'aria-label': `Chapter ${num}: ${title}` },
    h('div', { class: 'cc-inner' },
      h('div', { class: 'cc-num' }, `Chapter ${ROMAN[num] || num}`),
      h('div', { class: 'cc-title' }, title),
      question ? h('div', { class: 'cc-question' }, question) : null,
      h('div', { class: 'cc-rule' }),
      nights ? h('div', { class: 'cc-nights' }, icon('moon'), nights) : null,
      h('div', { class: 'cc-tap' }, 'Tap to continue')));
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    card.classList.remove('open'); card.classList.add('closing');
    setTimeout(() => { card.remove(); done(); }, 420);
  };
  card.addEventListener('click', close);
  root().appendChild(card);
  bus.emit('sfx', 'quest');
  requestAnimationFrame(() => card.classList.add('open'));
  setTimeout(close, 5200);
}
