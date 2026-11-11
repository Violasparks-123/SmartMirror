// Boot: load the save, start every system, mount the interface.
import { SaveManager } from './core/SaveManager.js';
import { st } from './core/GameState.js';
import { bus } from './core/EventBus.js';
import { NPCs } from './systems/NPCManager.js';
import { Achievements } from './systems/AchievementManager.js';
import { Audio } from './systems/AudioManager.js';
import { mountShell, Router, initialScreen } from './ui/app.js';
import { initPresentation, showRecap } from './ui/actions.js';
import { Story } from './systems/StoryManager.js';
import { Quests } from './systems/QuestManager.js';
import { startParticles } from './ui/particles.js';

// Screens register themselves on import.
import './ui/screens/home.js';
import './ui/screens/world.js';
import './ui/screens/characters.js';
import './ui/screens/inventory.js';
import './ui/screens/quests.js';
import './ui/screens/event.js';
import './ui/screens/astoria.js';
import './ui/screens/misc.js';
import './ui/screens/ending.js';

function boot() {
  SaveManager.init();
  NPCs.init();
  Achievements.init();
  Audio.init();
  initPresentation();
  mountShell();
  document.body.classList.toggle('reduce-motion', !!st().settings.reduceMotion);
  bus.on('state:replaced', () => {
    document.body.classList.toggle('reduce-motion', !!st().settings.reduceMotion);
    if (!st().started) Router.go('title', {}, { replace: true });
  });
  // Saves from before the story rewrite pick up at Chapter 7; long breaks get a recap.
  const lastSaved = st().savedAt;
  Router.go(st().started ? initialScreen() : 'title', {}, { replace: true });
  if (st().started) {
    Story.upgrade((q) => Quests.start(q));
    if (!st().ending && lastSaved && Date.now() - lastSaved > 3 * 3600 * 1000) showRecap();
  }
  startParticles();
  // Expose a read-only handle for debugging in the console.
  import('./ui/actions.js').then(({ Actions }) => {
    window.__astoria = { state: () => st(), Router, Actions };
  });
}

try {
  boot();
} catch (e) {
  console.error(e);
  document.getElementById('app').innerHTML = `<div class="boot"><div class="boot-title">Astoria</div><p class="boot-sub">Something went wrong while waking up.</p><pre class="boot-err">${String(e && e.message)}</pre></div>`;
}
