// "How Elaria works": five illustrated pages that explain the world, Astoria,
// the goal and how to play. Shown once after the prologue; reopenable from
// the Journal.
import { h } from './dom.js';
import { icon } from './icons.js';
import { PRIMER } from '../data/hearts.js';

export function openPrimer({ onClose = null } = {}) {
  let i = 0;
  const root = h('div', { class: 'primer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'How Elaria works' });
  const close = () => { root.classList.add('out'); setTimeout(() => { root.remove(); if (onClose) onClose(); }, 320); };
  const render = () => {
    const p = PRIMER[i];
    root.replaceChildren(
      h('div', { class: 'primer-bg', style: { backgroundImage: `url(${p.img})` } }),
      h('div', { class: 'primer-card panel' },
        h('div', { class: 'primer-kicker' }, `${p.kicker} · ${i + 1}/${PRIMER.length}`),
        h('h2', { class: 'primer-title' }, p.title),
        h('p', { class: 'primer-text' }, p.text),
        h('div', { class: 'primer-dots' }, ...PRIMER.map((_, k) => h('span', { class: k === i ? 'on' : '' }))),
        h('div', { class: 'btn-row primer-btns' },
          i > 0 ? h('button', { class: 'btn ghost small', onclick: () => { i -= 1; render(); } }, icon('chevL'), 'Back') : h('button', { class: 'btn ghost small', onclick: close }, 'Skip'),
          h('button', { class: 'btn primary', onclick: () => { if (i < PRIMER.length - 1) { i += 1; render(); } else close(); } }, i < PRIMER.length - 1 ? 'Next' : 'Begin', icon('chevR')))));
  };
  render();
  document.body.appendChild(root);
}
