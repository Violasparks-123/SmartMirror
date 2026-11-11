// World map and location scenes.
import { h, svgEl } from '../dom.js';
import { pico, icon, PHASE_ICON } from '../icons.js';
import { portrait, sceneArt, SCENE_IMAGES } from '../art.js';
import { Router, registerScreen } from '../app.js';
import { Actions } from '../actions.js';
import { openSheet } from '../overlay.js';
import { st } from '../../core/GameState.js';
import { LOCATIONS, LOCATION_ORDER } from '../../data/locations.js';
import { NPCS, NPC_ORDER } from '../../data/npcs.js';
import { NPCs } from '../../systems/NPCManager.js';
import { World } from '../../systems/WorldManager.js';
import { Time, PHASES } from '../../systems/TimeManager.js';

const ROADS = [['cathedral', 'royal'], ['cathedral', 'library'], ['royal', 'ballroom'], ['library', 'woods'], ['cathedral', 'ballroom'], ['royal', 'woods']];

function mapSvg(phase) {
  // Decorative backdrop (scales to cover)…
  return svgEl(`<svg class="map-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="mapbg" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#241a3c"/><stop offset="1" stop-color="#08060f"/></radialGradient>
      <filter id="mapblur"><feGaussianBlur stdDeviation="8"/></filter>
      <pattern id="maphatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="8" stroke="#2b2145" stroke-width="1"/></pattern>
    </defs>
    <rect width="400" height="700" fill="url(#mapbg)"/>
    <rect width="400" height="700" fill="url(#maphatch)" opacity=".5"/>
    <g fill="#0d0a18" opacity=".95">${Array.from({ length: 26 }, (_, i) => `<path d="M${10 + (i % 13) * 30} ${560 + Math.floor(i / 13) * 70 + (i % 3) * 14}l12 -40 12 40z"/>`).join('')}</g>
    <g fill="#9b7fe0" opacity=".55">${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 53) % 380 + 10}" cy="${560 + (i * 37) % 130}" r="1.6"/>`).join('')}</g>
    <circle cx="340" cy="60" r="${phase === 3 ? 34 : 24}" fill="#e9e1ff" opacity="${phase >= 2 ? 0.9 : 0.4}"/>
    <circle cx="340" cy="60" r="70" fill="#cdbfff" opacity=".15" filter="url(#mapblur)"/>
  </svg>`);
}

// …while walls and roads are drawn in the same percentage space as the nodes.
function mapLines() {
  const P = (id) => LOCATIONS[id].map;
  const roads = ROADS.map(([a, b]) => `<path d="M${P(a).x} ${P(a).y} Q ${(P(a).x + P(b).x) / 2 + 4} ${(P(a).y + P(b).y) / 2 - 5} ${P(b).x} ${P(b).y}"/>`).join('');
  return svgEl(`<svg class="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 14 Q50 2 88 12 Q97 38 88 62 Q50 72 16 64 Q5 38 14 14z" fill="rgba(26,19,48,.55)" stroke="#6e5a9a" stroke-width="2" stroke-dasharray="6 6" vector-effect="non-scaling-stroke"/>
    <g fill="none" stroke="#b9a3d9" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" opacity=".7" vector-effect="non-scaling-stroke">${roads.replace(/<path /g, '<path vector-effect="non-scaling-stroke" ')}</g>
  </svg>`);
}

// Where each place sits on the painted map (percent of the painting).
const MAP_POS = { royal: { x: 50, y: 23 }, cathedral: { x: 29, y: 37 }, library: { x: 67, y: 39 }, woods: { x: 27, y: 63 }, ballroom: { x: 70, y: 61 } };

registerScreen('map', {
  music: 'home',
  render() {
    const s = st();
    const t = s.time;
    const nodes = LOCATION_ORDER.map((id) => {
      const L = LOCATIONS[id];
      const known = s.discovered[id];
      const here = s.location === id;
      const present = known ? NPCs.presentAt(id).filter((n) => s.npcs[n].met) : [];
      return h('button', {
        class: `map-node${known ? '' : ' locked'}${here ? ' here' : ''}`,
        style: { left: `${(MAP_POS[id] || L.map).x}%`, top: `${(MAP_POS[id] || L.map).y}%` },
        onclick: () => (known ? openLocationSheet(id) : openSheet({ title: 'Undiscovered', cls: 'sheet-small', body: h('p', { class: 'muted' }, 'Somewhere in Elaria you have not yet been. The story will lead you there.') })),
      },
      h('span', { class: `node-gem${known ? ' thumb' : ''}`, style: known ? { backgroundImage: `url(${SCENE_IMAGES[id]?.src || 'assets/img/gala_hero.jpg'})`, backgroundPosition: id === 'cathedral' ? '72% 25%' : id === 'ballroom' ? '30% 40%' : '50% 40%' } : {} }, known && !here ? null : icon(known ? 'pin' : 'lock')),
      h('span', { class: 'node-name' }, known ? L.name : '???'),
      present.length ? h('span', { class: 'node-people' }, ...present.slice(0, 4).map((n) => portrait(n, 'micro'))) : null);
    });
    const stage = h('div', { class: 'map-stage' }, h('img', { class: 'map-art', src: 'assets/img/map_elaria.jpg', alt: '', draggable: 'false' }), ...nodes);
    const scroller = h('div', { class: 'map-scroll' }, stage);
    // Start with the current location in view on narrow screens.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const p = MAP_POS[s.location]; if (!p) return;
      scroller.scrollLeft = Math.max(0, stage.offsetWidth * p.x / 100 - scroller.clientWidth / 2);
    }));
    return h('div', { class: 'map-screen painted-map' },
      h('div', { class: 'map-fill' }),
      scroller,
      h('div', { class: 'map-head panel' },
        h('div', { class: 'map-title' }, pico('map', 'pico map-ico'), 'Elaria'),
        h('div', { class: 'phase-track' }, ...PHASES.map((p, i) => h('span', { class: `phase-pip${i === t.phase ? ' now' : ''}` }, icon(PHASE_ICON[i]), h('small', {}, p)))),
        h('div', { class: 'map-note muted small' }, `Day ${t.day}. Travelling takes one phase of the day. People move with the hours.`),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn ghost small', onclick: () => Actions.linger() }, icon('hourglass'), 'Wait'),
          h('button', { class: 'btn primary small', onclick: () => Router.go('location', { loc: s.location }) }, icon('door'), `Enter ${LOCATIONS[s.location].short}`)),
      ),
    );
  },
});

function openLocationSheet(id) {
  const s = st();
  const L = LOCATIONS[id];
  const here = s.location === id;
  let { day, phase } = s.time;
  if (!here) { phase += 1; if (phase > 3) { phase = 0; day += 1; } }
  const who = NPC_ORDER.filter((n) => s.npcs[n].met && NPCs.whereIs(n, day, phase).loc === id && !(here ? false : s.party.includes(n)));
  const body = h('div', { class: 'loc-sheet' },
    h('div', { class: 'loc-thumb' }, sceneArt(L.scene, phase, { cover: true })),
    h('p', { class: 'muted' }, L.tagline),
    h('p', {}, L.ambient[phase]),
    h('h3', { class: 'sub-h' }, here ? 'Here now' : `When you arrive (${PHASES[phase]})`),
    who.length ? h('div', { class: 'who-list' }, ...who.map((n) => h('div', { class: 'who' }, portrait(n, 'mini'), h('div', {}, h('b', {}, NPCS[n].name), h('div', { class: 'muted small' }, NPCs.whereIs(n, day, phase).act)))))
      : h('p', { class: 'muted small' }, 'No one you know is expected there.'),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn primary', onclick: () => { sheet.close(); Actions.travel(id); } }, here ? 'Enter' : `Travel — arrive at ${PHASES[phase]}`, icon('chevR'))),
  );
  const sheet = openSheet({ title: L.name, subtitle: here ? 'You are here' : 'Travel takes one phase of the day', body });
}

registerScreen('location', {
  hash: false,
  music: (p) => LOCATIONS[p.loc || st().location]?.music || 'home',
  render(params) {
    const s = st();
    const loc = s.location; // the scene always shows where Astoria actually is
    const L = LOCATIONS[loc];
    const hs = World.hotspots(loc);
    const people = NPCs.presentAt(loc);
    const heard = NPCs.overheard(loc);
    const layer = h('div', { class: 'hotspots' }, ...hs.map((x) => h('button', {
      class: `hotspot${World.isFresh(loc, x.id) ? ' fresh' : ''}${params.focus === x.id ? ' focus' : ''}`,
      style: { left: `${x.x}%`, top: `${x.y}%` },
      dataset: { x: x.x, y: x.y },
      onclick: () => Actions.openHotspot(loc, x.id),
    }, h('span', { class: 'hs-dot' }), h('span', { class: 'hs-label' }, x.label))));
    const wide = window.innerWidth >= 900;
    return h('div', { class: `location loc-${loc}` },
      sceneArt(L.scene, s.time.phase, { layer, safeTop: wide ? 84 : 70, safeBottom: wide ? 150 : 205 }),
      h('div', { class: 'loc-head' },
        h('button', { class: 'icon-btn', 'aria-label': 'World map', onclick: () => Router.go('map') }, icon('map')),
        h('div', { class: 'loc-titles' }, h('h1', {}, L.name), h('div', { class: 'loc-sub' }, icon(PHASE_ICON[s.time.phase]), Time.label())),
        h('button', { class: 'btn ghost small', onclick: () => Actions.linger(), title: 'Let time pass here' }, icon('hourglass'), 'Linger'),
      ),
      h('div', { class: 'loc-bottom' },
        people.length ? h('div', { class: 'people-strip' }, ...people.map((id) => {
          const w = NPCs.whereIs(id);
          const met = s.npcs[id].met;
          return h('button', { class: `person${NPCs.isAvoiding(id) ? ' avoiding' : ''}${met ? '' : ' stranger'}`, onclick: () => Actions.openNpc(id) },
            portrait(id, 'chip'),
            h('span', { class: 'person-name' }, met ? NPCS[id].name : '???'),
            h('span', { class: 'person-spot' }, w.party ? 'With you' : w.spot));
        })) : null,
        h('div', { class: 'ambient panel' },
          h('p', {}, World.ambient(loc)),
          heard.length ? h('p', { class: 'muted small' }, icon('eye'), 'Voices nearby — linger, or come back, to overhear.') : null,
          !people.length ? h('p', { class: 'muted small' }, 'No one is here right now. Check the map to see who is where.') : null,
        ),
      ),
    );
  },
});
