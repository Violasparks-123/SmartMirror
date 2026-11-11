// Unskippable song cutscenes (see data/songs.js). Plays a song over a scene,
// line by line, with floating notes; then the song cuts off on a single line
// and hands over to whatever comes next. Taps and keys do nothing while it runs.
import { h } from './dom.js';
import { bus } from '../core/EventBus.js';
import { Presenter } from './overlay.js';
import { SCENE_IMAGES } from './art.js';
import { Audio } from '../systems/AudioManager.js';
import { SONGS, CUTSCENES } from '../data/songs.js';
import { st } from '../core/GameState.js';

const NOTE_GLYPHS = ['♪', '♫', '♩', '♬'];

export function playCutscene(id, onEnd) {
  const cs = CUTSCENES[id];
  if (!cs) { if (onEnd) onEnd(); return; }
  Presenter.enqueue((done) => run(cs, () => { done(); if (onEnd) onEnd(); }));
}

function run(cs, finish) {
  const song = SONGS[cs.song];
  const lines = song.lines.length ? song.lines : song.placeholder;
  const sung = song.lines.length > 0;
  const root = document.getElementById('overlay-root') || document.body;

  // Floating notes: deterministic spread so it looks the same every time.
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const notes = h('div', { class: 'cs-notes', 'aria-hidden': 'true' },
    ...Array.from({ length: 18 }, (_, i) => h('span', {
      class: 'cs-note',
      style: { left: `${8 + rnd() * 84}%`, animationDelay: `${(rnd() * 7).toFixed(2)}s`, animationDuration: `${(6 + rnd() * 4).toFixed(2)}s`, fontSize: `${(16 + rnd() * 18).toFixed(0)}px` },
    }, NOTE_GLYPHS[i % NOTE_GLYPHS.length])));

  const lyric = h('div', { class: `cs-lyric${sung ? ' sung' : ''}`, 'aria-live': 'polite' });
  const title = song.title ? h('div', { class: 'cs-title' }, `♪ ${song.title} ♪`) : null;
  const cut = h('div', { class: 'cs-cut' }, h('div', { class: 'cs-who' }, '???'), h('div', { class: 'cs-cutline' }, cs.cut));
  const layer = h('div', { class: 'cutscene', role: 'dialog', 'aria-label': song.title || 'A song beneath the cathedral' },
    // The whole painting stays in view on every screen; a blurred copy fills the sides.
    h('div', { class: 'cs-scene' },
      h('div', { class: 'cs-fill', style: { backgroundImage: `url(${SCENE_IMAGES[cs.scene].blur})` } }),
      h('img', { class: 'cs-img', src: SCENE_IMAGES[cs.scene].src, alt: '' })),
    h('div', { class: 'cs-glow' }),
    notes,
    h('div', { class: 'cs-vignette' }),
    title, lyric, cut);

  // Swallow every input while it plays: this scene can't be skipped.
  const block = (e) => { e.preventDefault(); e.stopPropagation(); };
  ['click', 'pointerdown', 'touchstart', 'wheel'].forEach((ev) => layer.addEventListener(ev, block, { passive: false }));
  const keys = (e) => { e.preventDefault(); e.stopImmediatePropagation(); };
  window.addEventListener('keydown', keys, true);

  root.appendChild(layer);
  Audio.scene('hush');
  requestAnimationFrame(() => layer.classList.add('open'));

  const show = (text) => {
    lyric.classList.remove('in');
    setTimeout(() => { lyric.textContent = sung ? `♪ ${text} ♪` : text; lyric.classList.add('in'); }, 380);
  };
  // The real recording, at the player's music volume.
  let player = null;
  const vol = st()?.settings?.music ?? 0.45;
  if (song.audio && vol > 0) {
    player = new window.Audio(song.audio);
    player.volume = Math.min(1, vol * 1.6);
    player.play().catch(() => {});
  }
  let t = 1600;
  const step = song.audio && song.playMs ? Math.max(song.lineMs, (song.playMs - 1600) / lines.length) : song.lineMs;
  lines.forEach((text) => { setTimeout(() => show(text), t); t += step; });
  if (song.audio && song.playMs) t = Math.max(t, song.playMs);

  // The song stops dead.
  setTimeout(() => {
    layer.classList.add('cutoff');
    if (player) { player.pause(); player.src = ''; }
    lyric.classList.remove('in');
    bus.emit('sfx', 'cutoff');
  }, t + 200);
  setTimeout(() => cut.classList.add('in'), t + 1300);
  setTimeout(() => {
    layer.classList.add('closing');
    setTimeout(() => {
      window.removeEventListener('keydown', keys, true);
      layer.remove();
      Audio.scene('cove');
      finish();
    }, 700);
  }, t + 4200);
}
