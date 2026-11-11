// The visual-novel conversation player. Full-screen, with the location behind,
// the speaker's portrait, a typewriter text box and branching choices.
import { h } from './dom.js';
import { icon } from './icons.js';
import { portrait, sceneArt } from './art.js';
import { bus } from '../core/EventBus.js';
import { st, Game } from '../core/GameState.js';
import { DialogueSession } from '../systems/DialogueEngine.js';
import { CONVOS } from '../data/dialogue/index.js';
import { NPCS } from '../data/npcs.js';
import { PATHS } from '../data/misc.js';
import { Audio } from '../systems/AudioManager.js';
import { Presenter, toast } from './overlay.js';
import { splitSpeaker, moodOf, faceId, faceSrc, preloadFaces } from './faces.js';
import { GLOSSARY } from '../data/hearts.js';

const SPEEDS = { slow: 34, normal: 20, fast: 8, instant: 0 };
// Auto-advance stays on between conversations until the player turns it off.
let autoMode = false;
const pico = (name) => h('img', { class: 'pico', src: `assets/icons/${name}.webp`, alt: '', draggable: 'false' });

// Full-length art for story characters who aren't regular NPCs.
const EXTRA_SPRITES = { Aeria: { src: 'assets/chars/aeria.webp', cls: 'aeria' }, 'The Duchess': { src: 'assets/chars/duchess.webp', cls: 'duchess' } };
const spriteOf = (sp) => NPCS[sp]?.sprite ? { src: NPCS[sp].sprite, cls: sp, name: NPCS[sp].name } : EXTRA_SPRITES[sp] ? { ...EXTRA_SPRITES[sp], name: sp } : null;

function speakerName(sp) {
  if (sp === 'a') return 'Astoria';
  if (sp === 'n' || sp === 'note') return null;
  if (sp === 'v') return '???';
  if (NPCS[sp]) return st().npcs[sp].met || sp === 'noctis' ? NPCS[sp].name : '???';
  return sp;
}

// Run a conversation through the presentation queue. Resolves when finished.
export function playConversation(convoId, { npc = null, onEnd = null, intro = null } = {}) {
  Presenter.enqueue((done) => runConversation(convoId, { npc, intro, onEnd: () => { if (onEnd) onEnd(); done(); } }));
}

function runConversation(convoId, { npc, intro, onEnd }) {
  const convo = CONVOS[convoId];
  const session = new DialogueSession(convoId, { npc });
  if (intro) session.queue.unshift(['n', intro]);
  const bg = convo.bg || st().location;
  const layer = h('div', { class: 'dlg-layer' });
  const scene = sceneArt(bg, st().time.phase);
  const stage = h('div', { class: 'dlg-stage' });
  const portraitSlot = h('div', { class: 'dlg-portrait' });
  // Full-height character art: the NPC speaking stands in the scene behind the text box.
  const spriteSlot = h('div', { class: 'dlg-sprites' });
  let spriteNpc = null;
  const fxRail = h('div', { class: 'dlg-fx' });
  const choicesBox = h('div', { class: 'dlg-choices' });
  const nameplate = h('div', { class: 'dlg-name' });
  const textEl = h('div', { class: 'dlg-text' });
  const caret = h('div', { class: 'dlg-caret' }, icon('chevD'));
  // Expression cameo: the speaker's face, changing with the mood of each line.
  const faceA = h('img', { class: 'face-img', alt: '', draggable: 'false' });
  const faceB = h('img', { class: 'face-img', alt: '', draggable: 'false' });
  const face = h('div', { class: 'dlg-face hidden', 'aria-hidden': 'true' }, faceA, faceB);
  let faceFront = faceA; let faceKey = null;
  const box = h('div', { class: 'dlg-box panel' }, nameplate, textEl, caret, face);

  // Log, Auto and Skip.
  const history = [];
  const tool = (name, label, fn) => h('button', { class: `dlg-tool tool-${name}`, 'aria-label': label, title: label, onclick: (e) => { e.stopPropagation(); fn(); } }, pico(name));
  const autoBtn = tool(autoMode ? 'pause' : 'auto', 'Auto', () => setAuto(!autoMode));
  const skipBtn = tool('skip', 'Skip to the next choice', () => toggleSkip());
  const logPanel = h('div', { class: 'dlg-log hidden', role: 'dialog', 'aria-label': 'Conversation log' });
  const tools = h('div', { class: 'dlg-tools' }, tool('log', 'Log', () => openLog()), autoBtn, skipBtn);
  stage.append(spriteSlot, portraitSlot, fxRail, choicesBox, box, tools, logPanel);
  layer.append(scene, h('div', { class: 'dlg-vignette' }), stage);
  document.getElementById('overlay-root').appendChild(layer);
  requestAnimationFrame(() => layer.classList.add('open'));
  Audio.scene('dialogue');

  let typing = null; let fullText = ''; let state = 'idle'; let lastSpeaker = null;

  const offFx = bus.on('relfx', ({ npc: who, dir }) => {
    const name = NPCS[who]?.name || who;
    const text = dir === 'up' ? `${name} warms to you` : dir === 'down' ? `${name} cools toward you` : dir === 'wary' ? `${name} seems wary` : `${name} will remember that.`;
    const chip = h('div', { class: `fx-chip fx-${dir}` }, icon(dir === 'memory' ? 'feather' : dir === 'wary' ? 'eye' : 'heart'), text);
    fxRail.appendChild(chip);
    setTimeout(() => chip.classList.add('gone'), 2600);
    setTimeout(() => chip.remove(), 3200);
  });

  function showSprite(id) {
    if (spriteNpc === id) return;
    spriteNpc = id;
    spriteSlot.querySelectorAll('.dlg-sprite').forEach((old) => { old.classList.remove('in'); setTimeout(() => old.remove(), 400); });
    const art = spriteOf(id);
    const img = h('img', { class: `dlg-sprite sp-${art.cls}`, src: art.src, alt: art.name, draggable: 'false' });
    spriteSlot.appendChild(img);
    const reveal = () => requestAnimationFrame(() => img.classList.add('in'));
    if (img.complete) reveal(); else { img.onload = reveal; img.onerror = reveal; }
  }

  function setSpeaker(sp) {
    if (sp === lastSpeaker) return;
    lastSpeaker = sp;
    portraitSlot.innerHTML = '';
    portraitSlot.className = 'dlg-portrait';
    if (spriteOf(sp)) {
      showSprite(sp);
      spriteSlot.classList.remove('dim');
      portraitSlot.classList.add('empty');
      if (NPCS[sp]) Audio.npcCue(NPCS[sp].motif.slice(0, 2));
    } else if (spriteNpc) {
      // Astoria or the narrator speaking: the person she's talking to stays, a little dimmed.
      spriteSlot.classList.add('dim');
      portraitSlot.classList.add('empty');
    } else if (sp === 'a') portraitSlot.classList.add('empty');
    else if (NPCS[sp]) { portraitSlot.appendChild(portrait(sp, 'dlg-art')); Audio.npcCue(NPCS[sp].motif.slice(0, 2)); }
    else portraitSlot.classList.add('empty');
    requestAnimationFrame(() => portraitSlot.classList.add('in'));
  }

  // Light up glossary words once a line is fully shown; tap one for a plain explanation.
  function gloss() {
    const text = fullText; if (!text) return;
    const hits = [];
    for (const term of Object.keys(GLOSSARY)) {
      const re = new RegExp(`\\b${term}\\b`, term[0] === term[0].toLowerCase() ? 'i' : '');
      const m = re.exec(text);
      if (m && !hits.some((x) => m.index < x.end && m.index + m[0].length > x.start)) hits.push({ start: m.index, end: m.index + m[0].length, term });
    }
    if (!hits.length) return;
    hits.sort((a, b) => a.start - b.start);
    const parts = []; let at = 0;
    for (const x of hits) {
      parts.push(text.slice(at, x.start));
      parts.push(h('span', { class: 'lore-word', role: 'button', tabindex: 0, onclick: (e) => { e.stopPropagation(); showTip(x.term); } }, text.slice(x.start, x.end)));
      at = x.end;
    }
    parts.push(text.slice(at));
    textEl.replaceChildren(...parts);
  }
  function showTip(term) {
    box.querySelector('.lore-tip')?.remove();
    const tip = h('div', { class: 'lore-tip', onclick: (e) => { e.stopPropagation(); tip.remove(); } }, h('b', {}, term), GLOSSARY[term]);
    box.appendChild(tip);
  }

  function type(text) {
    box.querySelector('.lore-tip')?.remove();
    fullText = text;
    textEl.textContent = '';
    const speed = SPEEDS[st().settings.textSpeed] ?? 20;
    if (!speed || st().settings.reduceMotion) { textEl.textContent = text; state = 'shown'; gloss(); scheduleAuto(); return; }
    state = 'typing';
    let i = 0;
    clearInterval(typing);
    typing = setInterval(() => {
      i += 2;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(typing); state = 'shown'; gloss(); scheduleAuto(); }
    }, speed);
  }

  function showFace(sp, mood) {
    const id = faceId(sp);
    if (!id) { face.classList.add('hidden'); faceKey = null; return; }
    preloadFaces(id);
    face.classList.remove('hidden');
    face.dataset.who = id;
    const key = `${id}_${mood}`;
    if (key === faceKey) return;
    faceKey = key;
    const back = faceFront === faceA ? faceB : faceA;
    back.src = faceSrc(id, mood);
    const swap = () => { back.classList.add('front'); faceFront.classList.remove('front'); faceFront = back; };
    if (back.complete && back.naturalWidth) swap(); else { back.onload = swap; back.onerror = swap; }
  }

  // ---- auto, skip, log ----
  let autoT = null; let skipping = false; let closed = false;
  function scheduleAuto() {
    clearTimeout(autoT);
    if (!autoMode || skipping || closed || !logPanel.classList.contains('hidden')) return;
    autoT = setTimeout(() => { if (autoMode && state === 'shown' && !closed) advance(); }, 1100 + Math.min(4200, fullText.length * 26));
  }
  function setAuto(on) {
    autoMode = on;
    autoBtn.innerHTML = ''; autoBtn.appendChild(pico(on ? 'pause' : 'auto'));
    autoBtn.classList.toggle('on', on);
    autoBtn.setAttribute('aria-label', on ? 'Pause auto' : 'Auto');
    toast({ text: on ? 'Auto: lines advance by themselves' : 'Auto off', kind: 'info' });
    if (on && state === 'shown') scheduleAuto(); else clearTimeout(autoT);
  }
  function stopSkip() { skipping = false; skipBtn.classList.remove('on'); }
  function toggleSkip() {
    if (skipping) { stopSkip(); return; }
    if (state === 'choosing') return;
    skipping = true; skipBtn.classList.add('on');
    const run = () => {
      if (!skipping || closed) return;
      if (state === 'choosing') { stopSkip(); return; }
      clearInterval(typing); textEl.textContent = fullText; state = 'shown'; gloss();
      step();
      setTimeout(run, 70);
    };
    run();
  }
  function openLog() {
    clearTimeout(autoT); stopSkip();
    logPanel.innerHTML = '';
    logPanel.append(
      h('div', { class: 'log-head' }, h('span', {}, 'Conversation log'), h('button', { class: 'dlg-tool', 'aria-label': 'Close log', onclick: (e) => { e.stopPropagation(); logPanel.classList.add('hidden'); scheduleAuto(); } }, pico('close'))),
      h('div', { class: 'log-list scroll' }, ...history.map((r) => h('div', { class: `log-row log-${r.kind}` }, r.name ? h('b', {}, r.name) : null, h('p', {}, r.text)))));
    logPanel.classList.remove('hidden');
    const list = logPanel.querySelector('.log-list'); list.scrollTop = list.scrollHeight;
    logPanel.addEventListener('click', (e) => e.stopPropagation());
  }

  function step() {
    const beat = session.next();
    if (beat.type === 'line') {
      choicesBox.innerHTML = '';
      box.classList.remove('hidden');
      const { sp, mood } = splitSpeaker(beat.speaker);
      setSpeaker(sp);
      showFace(sp, moodOf(beat.text, mood));
      const name = speakerName(sp);
      history.push({ name: name || '', text: beat.text, kind: sp === 'n' || sp === 'note' ? 'narration' : sp === 'a' ? 'astoria' : 'npc' });
      nameplate.innerHTML = '';
      if (name) nameplate.append(icon('sparkle'), name);
      nameplate.classList.toggle('hidden', !name);
      box.classList.toggle('is-narration', sp === 'n');
      box.classList.toggle('is-note', sp === 'note');
      box.classList.toggle('is-astoria', sp === 'a');
      type(beat.text);
      Game.commit('dialogue');
    } else if (beat.type === 'choices') {
      state = 'choosing';
      stopSkip();
      face.classList.add('hidden');
      caret.classList.add('hidden');
      choicesBox.innerHTML = '';
      beat.choices.forEach((c, n) => {
        if (c.locked) {
          // Shown, but out of reach: the chain and lock say "not yet", the line says what would open it.
          const lockedBtn = h('button', {
            class: 'choice-btn locked',
            'aria-disabled': 'true',
            style: { animationDelay: `${n * 60}ms` },
            onclick: () => {
              bus.emit('sfx', 'locked');
              lockedBtn.classList.remove('shake'); void lockedBtn.offsetWidth; lockedBtn.classList.add('shake');
              toast({ text: `Not yet. Needs: ${c.need.join(' · ')}`, kind: 'info' });
            },
          }, h('span', { class: 'choice-text' }, c.t), h('span', { class: 'lock-need' }, icon('lock'), c.need.join(' · ')));
          choicesBox.appendChild(lockedBtn);
          return;
        }
        const tag = c.path && st().settings.pathHints ? h('span', { class: `path-tag path-${c.path}` }, PATHS[c.path].name) : null;
        const earned = c.earned ? h('span', { class: 'earned-tag', title: `Unlocked by: ${c.earned.join(' · ')}` }, icon('sparkle'), c.earned[0]) : null;
        const btn = h('button', {
          class: `choice-btn${c.earned ? ' earned' : ''}`,
          style: { animationDelay: `${n * 60}ms` },
          onclick: () => {
            bus.emit('sfx', c.earned ? 'earned' : 'choice');
            session.choose(c.i);
            choicesBox.innerHTML = '';
            caret.classList.remove('hidden');
            state = 'idle';
            Game.commit('choice');
            step();
          },
        }, h('span', { class: 'choice-text' }, c.t), earned, tag);
        choicesBox.appendChild(btn);
      });
    } else {
      finish();
    }
  }

  function advance() {
    if (!logPanel.classList.contains('hidden')) return;
    if (state === 'typing') { clearInterval(typing); textEl.textContent = fullText; state = 'shown'; gloss(); return; }
    if (state === 'choosing') return;
    bus.emit('sfx', 'click');
    step();
  }

  function finish() {
    closed = true; clearTimeout(autoT); skipping = false;
    clearInterval(typing);
    offFx();
    document.removeEventListener('keydown', onKey);
    layer.classList.remove('open');
    layer.classList.add('closing');
    setTimeout(() => layer.remove(), 260);
    Game.commit('dialogue:end');
    bus.emit('dialogue:end', convoId);
    if (onEnd) onEnd();
  }

  const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } };
  document.addEventListener('keydown', onKey);
  box.addEventListener('click', advance);
  scene.addEventListener('click', advance);
  portraitSlot.addEventListener('click', advance);
  spriteSlot.addEventListener('click', advance);
  step();
}
