// The ending screen: which ending Astoria reached, and what became of everyone
// her choices touched. Every dilemma in the story shows up here.
import { h } from '../dom.js';
import { icon } from '../icons.js';
import { Router, registerScreen } from '../app.js';
import { playConversation } from '../dialogue.js';
import { confirmDialog } from '../overlay.js';
import { st, Game } from '../../core/GameState.js';
import { ENDINGS, EPILOGUE, MAIN_ENDINGS } from '../../data/echoes.js';
import { HIDDEN_ENDINGS } from '../../data/hearts.js';
import { check } from '../../systems/Conditions.js';
import { Story } from '../../systems/StoryManager.js';

registerScreen('ending', {
  music: 'home',
  render() {
    const s = st();
    if (!s.ending) return h('div', { class: 'page' }, h('p', { class: 'muted' }, 'The eclipse has not come yet.'), h('button', { class: 'btn primary', onclick: () => Router.go('home') }, 'Back'));
    const e = ENDINGS[s.ending.id];
    const c = Story.counts();
    const seen = new Set();
    const fates = EPILOGUE.filter((x) => { if (seen.has(x.who) || !check(x.cond)) return false; seen.add(x.who); return true; });
    const seenCount = Object.keys(s.endingsSeen || {}).length;
    return h('div', { class: 'ending-screen' },
      h('div', { class: 'ending-bg' }),
      h('div', { class: 'ending-scroll scroll' },
        h('header', { class: 'ending-head' },
          h('div', { class: 'ending-kicker' }, 'Ending'),
          h('h1', { class: 'ending-title' }, e.title),
          h('p', { class: 'ending-line' }, e.line),
          h('div', { class: 'ending-stats' },
            h('span', {}, h('b', {}, String(c.self)), ' pieces of herself'),
            h('span', {}, h('b', {}, String(c.kept)), ' kept'),
            h('span', {}, h('b', {}, String(c.returned)), ' given back'),
            h('span', {}, h('b', {}, `${seenCount}/${Object.keys(ENDINGS).length}`), ' endings seen'))),
        h('h2', { class: 'ending-sub' }, 'What became of them'),
        h('ul', { class: 'fates' }, ...fates.map((f) => h('li', { class: 'fate panel' }, h('div', { class: 'fate-who' }, f.who), h('p', {}, f.text)))),
        h('h2', { class: 'ending-sub' }, 'Every way it ends'),
        endingsGallery(),
        h('div', { class: 'btn-row ending-btns' },
          h('button', { class: 'btn primary', onclick: () => Router.go('home') }, 'Continue in Elaria', icon('chevR')),
          h('button', { class: 'btn ghost', onclick: () => Router.go('journal', { tab: 'echoes' }) }, 'Lives inside you'),
          h('button', { class: 'btn ghost', onclick: async () => {
            const ok = await confirmDialog({ title: 'Choose again?', text: 'Return to the bell tower and make the final choice again. Your new ending replaces this one; everything else stays as you left it.', ok: 'Return to the tower' });
            if (!ok) return;
            Story.rewind();
            Router.go('home');
            playConversation('ch9_final', { onEnd: () => Game.commit('ending-again') });
          } }, 'Choose again'))));
  },
});

// All twelve endings: found ones by name, hidden ones as a hint of how to reach them.
export function endingsGallery() {
  const seen = st().endingsSeen || {};
  const card = (id) => {
    const e = ENDINGS[id]; const hidden = !MAIN_ENDINGS.includes(id); const got = !!seen[id];
    return h('div', { class: `end-card panel${got ? ' got' : ''}${hidden ? ' hidden-end' : ''}` },
      h('div', { class: 'end-kind' }, hidden ? (HIDDEN_ENDINGS[id].who ? '♥ Hidden ending' : 'Secret ending') : 'Ending'),
      h('b', {}, got || !hidden ? e.title : '???'),
      h('p', { class: 'muted small' }, got ? e.line : hidden ? `Hint: ${HIDDEN_ENDINGS[id].hint}` : 'Not yet seen.'));
  };
  return h('div', { class: 'end-gallery' }, ...Object.keys(ENDINGS).map(card));
}
