// Hand-drawn line icons in the game's ornamental style. All use currentColor.
const P = {
  home: '<path d="M12 1.5l2.2 7.3 7.3 3.2-7.3 3.2L12 22.5l-2.2-7.3L2.5 12l7.3-3.2z"/><path d="M12 7.5l.9 3.6 3.6.9-3.6.9-.9 3.6-.9-3.6-3.6-.9 3.6-.9z" fill="currentColor" stroke="none"/>',
  characters: '<circle cx="12" cy="8" r="4.2"/><path d="M4 21c.6-4.4 3.8-7 8-7s7.4 2.6 8 7"/><path d="M8.2 6.4c1.6 1.6 5.2 1.8 7.6.2"/>',
  inventory: '<path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M8.5 8V6.5a3.5 3.5 0 017 0V8"/><path d="M9.5 12.5h5"/>',
  quests: '<path d="M6 3.5h10.5a2 2 0 012 2V20l-3-1.6-3 1.6-3-1.6-3 1.6V5.5a2 2 0 012-2z"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/><path d="M19 3l2-1.5"/>',
  map: '<path d="M12 2l7.5 6-7.5 14L4.5 8z"/><path d="M4.5 8h15M12 2v20M8.5 8L12 22l3.5-14"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3"/><circle cx="12" cy="12" r="6.6"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="M12 3.5l1.6 6.9 6.9 1.6-6.9 1.6L12 20.5l-1.6-6.9L3.5 12l6.9-1.6z"/>',
  shop: '<path d="M4.5 9h15l-1.3 11.5H5.8z"/><path d="M8.5 9V7a3.5 3.5 0 017 0v2"/><circle cx="12" cy="14.5" r="1.6"/>',
  summon: '<path d="M12 2.5l1.9 7.6 7.6 1.9-7.6 1.9L12 21.5l-1.9-7.6L2.5 12l7.6-1.9z"/><path d="M19 3.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6zM5 16.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"/>',
  journal: '<path d="M12 6.5c-2-1.6-5-2.2-8.5-2v14c3.5-.2 6.5.4 8.5 2 2-1.6 5-2.2 8.5-2v-14c-3.5-.2-6.5.4-8.5 2z"/><path d="M12 6.5v14"/>',
  achievements: '<path d="M7 3.5h10v5a5 5 0 01-10 0z"/><path d="M7 5.5H4c0 3 1.4 4.6 3.4 4.8M17 5.5h3c0 3-1.4 4.6-3.4 4.8"/><path d="M12 13.5v4M8.5 21h7M9.5 17.5h5l.8 3.5h-6.6z"/>',
  moonstone: '<path d="M12 1.5l2.4 7.1 7.1 3.4-7.1 3.4L12 22.5l-2.4-7.1L2.5 12l7.1-3.4z" fill="currentColor" stroke="none"/>',
  crown: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".25"/><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M9 13.5l1-3.5 2 2 2-2 1 3.5z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 6.5l8.5 7 8.5-7"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 004 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevR: '<path d="M9 5l7 7-7 7"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  chevD: '<path d="M5 9l7 7 7-7"/>',
  chevU: '<path d="M5 15l7-7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/><circle cx="12" cy="15.5" r="1.3"/>',
  gift: '<rect x="4" y="9" width="16" height="11.5" rx="1"/><path d="M3 9h18M12 9v11.5"/><path d="M12 9c-1-3-4.5-4.5-5.5-2.6S8.5 9 12 9c3.5 0 6.4-.7 5.5-2.6S13 6 12 9z"/>',
  talk: '<path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  ask: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 114 2c-1 .6-1.6 1.2-1.6 2.3"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  invite: '<path d="M4 7.5h16v11H4z"/><path d="M4 7.5l8 6 8-6"/><path d="M12 2.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  secret: '<path d="M12 3a7 7 0 00-7 7c0 3.5 3 5 3 8h8c0-3 3-4.5 3-8a7 7 0 00-7-7z"/><path d="M9.5 21h5M10 10.5a2 2 0 014 0c0 1.5-2 1.5-2 3"/>',
  scroll: '<path d="M7 3.5h11a2 2 0 010 4H7"/><path d="M7 3.5a2 2 0 00-2 2v13a2 2 0 002 2h11a2 2 0 000-4H9"/><path d="M9.5 8.5v8"/>',
  pin: '<path d="M12 21.5s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10.5" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  hourglass: '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5 9 6 9 9s-9 4-9 9M16.5 3c0 5-9 6-9 9s9 4 9 9"/>',
  party: '<circle cx="9" cy="8.5" r="3.4"/><path d="M2.5 19.5c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17" cy="9.5" r="2.6"/><path d="M16 14.2c3 .2 5 2 5.5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3"/>',
  sunset: '<path d="M3 17.5h18M6 21h12"/><path d="M7 17.5a5 5 0 0110 0"/><path d="M12 4v4M5.5 8l1.8 1.8M18.5 8l-1.8 1.8"/>',
  moonrise: '<path d="M3 18h18"/><path d="M16.5 15A6.5 6.5 0 119 6a5 5 0 007.5 9z"/>',
  moon: '<path d="M19.5 14.5A8 8 0 119.5 4.5a6.2 6.2 0 0010 10z"/><path d="M17 4l.5 1.5L19 6l-1.5.5L17 8l-.5-1.5L15 6l1.5-.5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  back: '<path d="M10 5l-7 7 7 7M3.5 12H21"/>',
  wardrobe: '<path d="M12 3c-1.5 0-2.2 1-2.2 2 0 1.4 2.2 1.6 2.2 3l-8 5.5c-.8.6-.4 1.8.6 1.8h14.8c1 0 1.4-1.2.6-1.8L12 8"/>',
  door: '<path d="M6 21V5.5A2.5 2.5 0 018.5 3h7A2.5 2.5 0 0118 5.5V21"/><path d="M3.5 21h17"/><circle cx="14.5" cy="12.5" r=".9" fill="currentColor"/>',
  heart: '<path d="M12 20s-7.5-4.7-7.5-10A4.3 4.3 0 0112 7.2 4.3 4.3 0 0119.5 10c0 5.3-7.5 10-7.5 10z"/>',
  sparkle: '<path d="M12 3l1.5 6 6 1.5-6 1.5L12 18l-1.5-6-6-1.5 6-1.5z"/>',
  feather: '<path d="M20 4c-8 0-14 5-14 13v3"/><path d="M20 4c0 8-5 13-13 13M9 14h5M11 11h5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8"/>',
  hidePanel: '<path d="M14 5l7 7-7 7M3 5h6v14H3z"/>',
  showPanel: '<path d="M10 5l-7 7 7 7M15 5h6v14h-6z"/>',
};

// Painted icons from the UI sheet (assets/icons/<name>.webp).
export const pico = (name, cls = 'pico') => { const img = document.createElement('img'); img.className = cls; img.src = `assets/icons/${name}.webp`; img.alt = ''; img.draggable = false; return img; };

export function icon(name, cls = '') {
  const body = P[name] || P.sparkle;
  const span = document.createElement('span');
  span.className = `ico ${cls}`;
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  return span;
}

export const PHASE_ICON = ['sun', 'sunset', 'moonrise', 'moon'];
