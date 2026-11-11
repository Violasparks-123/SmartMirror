// Art helpers: NPC portraits, item glyphs, the illustrated location scenes,
// and Astoria's portrait with her worn cosmetics layered on top.
import { h, svgEl } from './dom.js';
import { NPCS } from '../data/npcs.js';
import { COSMETICS, GRADES, TONES } from '../data/wardrobe.js';

// ---------------------------------------------------------------- portraits
// Evelyne and Noctis have no supplied artwork yet, so they are shown as
// Victorian silhouette cameos — clearly concept pieces, in keeping with the style.
const PROFILE = 'M104 44c-22 0-40 10-48 30-7 17-6 36 0 52 4 12 10 24 14 34l2 30-6 22h112l-10-20-14-14-6-16c6-2 12-3 14-6 2-4-1-8 1-11 3-3 2-6 0-8 3-1 6-3 5-7-1-3-5-6-4-10 1-4 9-10 10-15 1-4-3-6-7-8-2-10-2-22-8-32-9-16-28-21-55-21z';

const SVG_PORTRAITS = {
  evelyne: `
  <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="evbg" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#f2e2e8"/><stop offset=".55" stop-color="#c89aae"/><stop offset="1" stop-color="#5b2e46"/></radialGradient>
      <linearGradient id="evrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dfb0"/><stop offset=".5" stop-color="#a8833f"/><stop offset="1" stop-color="#f0d9a2"/></linearGradient>
    </defs>
    <rect width="200" height="240" fill="#1a0e18"/>
    <ellipse cx="100" cy="120" rx="92" ry="114" fill="url(#evrim)"/>
    <ellipse cx="100" cy="120" rx="85" ry="107" fill="url(#evbg)"/>
    <ellipse cx="100" cy="120" rx="85" ry="107" fill="none" stroke="#fff" stroke-opacity=".35" stroke-dasharray="1 5"/>
    <g fill="#2a1226">
      <path d="${PROFILE}"/>
      <circle cx="74" cy="46" r="15"/><circle cx="60" cy="56" r="11"/>
      <circle cx="54" cy="96" r="12"/><circle cx="50" cy="116" r="11"/><circle cx="52" cy="136" r="10"/><circle cx="58" cy="154" r="9"/>
      <circle cx="44" cy="106" r="9"/><circle cx="42" cy="128" r="8"/><circle cx="46" cy="148" r="7"/>
    </g>
    <g fill="#f8f1ea"><circle cx="112" cy="196" r="3.2"/><circle cx="120" cy="200" r="3.2"/><circle cx="128" cy="202" r="3.2"/><circle cx="104" cy="194" r="3.2"/><circle cx="96" cy="194" r="3"/><circle cx="82" cy="104" r="3.6"/><circle cx="82" cy="112" r="2.4"/></g>
    <path d="M70 40c6-8 16-10 22-6" stroke="#f8f1ea" stroke-width="2" fill="none" opacity=".5"/>
    <path d="M136 92q6 2 9 6" stroke="#e8c6d4" stroke-width="1.2" fill="none" opacity=".6"/>
  </svg>`,
  noctis: `
  <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="nxbg" cx="55%" cy="35%" r="75%"><stop offset="0" stop-color="#3b3274"/><stop offset=".6" stop-color="#1a1538"/><stop offset="1" stop-color="#07060f"/></radialGradient>
      <linearGradient id="nxrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e2f2"/><stop offset=".5" stop-color="#7e78a0"/><stop offset="1" stop-color="#d8d3ea"/></linearGradient>
    </defs>
    <rect width="200" height="240" fill="#07060f"/>
    <ellipse cx="100" cy="120" rx="92" ry="114" fill="url(#nxrim)"/>
    <ellipse cx="100" cy="120" rx="85" ry="107" fill="url(#nxbg)"/>
    <g fill="#e8e0ff"><circle cx="150" cy="54" r="1.4"/><circle cx="160" cy="88" r="1"/><circle cx="138" cy="34" r="1"/><circle cx="168" cy="120" r="1.2"/><circle cx="40" cy="70" r="1"/><circle cx="34" cy="160" r="1.2"/></g>
    <circle cx="150" cy="58" r="12" fill="#efeaff" opacity=".9"/><circle cx="155" cy="54" r="11" fill="#1f1945"/>
    <path d="M20 240c4-40 10-70 20-96 6-48 26-92 70-100 30-4 50 12 54 30l-14 4c-6-14-22-22-44-18-30 6-40 40-38 72l-4 52c4 20 20 34 40 56z" fill="#0b0918"/>
    <path d="${PROFILE}" fill="#0b0918"/>
    <path d="M150 94c3 8 4 14 1 20M156 124l-10 4M146 140c4 3 4 6 2 9M141 160c-2 6-6 10-12 12" stroke="#cfd3e6" stroke-width="1.4" fill="none" opacity=".75"/>
    <path d="M104 46c18-4 36 4 44 24" stroke="#cfd3e6" stroke-width="2" fill="none" opacity=".6"/>
    <circle cx="134" cy="102" r="2.2" fill="#e8c46a"/>
    <path d="M86 128l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#c9b37e"/>
  </svg>`,
};

export function portrait(id, cls = '') {
  const d = NPCS[id];
  const wrap = h('div', { class: `portrait ${cls}`, style: { '--accent': d?.accent || '#9b7fd0' } });
  if (id === 'astoria') {
    const src = cls.includes('avatar') ? 'assets/img/astoria_avatar.jpg' : 'assets/img/portrait_astoria_hd.jpg';
    wrap.appendChild(h('img', { src, alt: 'Astoria', loading: 'lazy' }));
  } else if (d.portrait.startsWith('svg:')) {
    wrap.appendChild(svgEl(SVG_PORTRAITS[d.portrait.slice(4)]));
    wrap.classList.add('is-concept');
  } else {
    wrap.appendChild(h('img', { src: d.portrait, alt: d.name, loading: 'lazy' }));
  }
  return wrap;
}

// ---------------------------------------------------------------- item glyphs
const CAT_COLORS = {
  quest: ['#d9c08a', '#8a7346'], gift: ['#e2a6c0', '#8d4f6c'], book: ['#b9a3d9', '#5b4685'],
  accessory: ['#d6d1e6', '#77708f'], clothing: ['#c8a2e0', '#62408a'], collectible: ['#9fc1d9', '#46637a'], magical: ['#c7a8ff', '#6a3fc0'],
};

const GLYPHS = {
  letter: '<rect x="10" y="15" width="28" height="19" rx="1.5"/><path d="M10.5 16l13.5 10 13.5-10"/><circle cx="24" cy="27" r="3.2" fill="currentColor" stroke="none" opacity=".8"/>',
  book: '<path d="M24 14c-3.5-2.6-8-3-13-2.8v22c5-.2 9.5.2 13 2.8 3.5-2.6 8-3 13-2.8v-22c-5-.2-9.5.2-13 2.8z"/><path d="M24 14v22"/>',
  flower: '<circle cx="24" cy="21" r="3"/><circle cx="24" cy="15" r="4"/><circle cx="30" cy="21" r="4"/><circle cx="24" cy="27" r="4"/><circle cx="18" cy="21" r="4"/><path d="M24 27v12M24 34c3-3 6-3 8-2"/>',
  tea: '<path d="M13 20h18v6a9 9 0 01-18 0z"/><path d="M31 22h3a3 3 0 010 6h-3"/><path d="M19 13c0 2 2 2 2 4M24 12c0 2 2 2 2 4"/>',
  cake: '<path d="M12 26h24v9H12z"/><path d="M12 26c2-6 22-6 24 0"/><circle cx="24" cy="17" r="2.2"/><path d="M15 30h18"/>',
  quill: '<path d="M36 10C24 12 16 22 14 36"/><path d="M36 10c-1 9-7 16-16 18M18 28l-5 9"/>',
  gem: '<path d="M16 14h16l6 8-14 15-14-15z"/><path d="M10 22h28M20 14l-2 8 6 15 6-15-2-8"/>',
  perfume: '<rect x="15" y="20" width="18" height="17" rx="4"/><path d="M20 20v-4h8v4M22 16v-4h4v4"/>',
  gloves: '<path d="M17 37V22l-3-8 3-1 3 7V11h3v9-11h3v11-9h3v12l3-5 2 1-4 9v12z"/>',
  candle: '<rect x="18" y="20" width="5" height="18"/><rect x="25" y="16" width="5" height="22"/><path d="M20.5 15c-1.5 2 0 3 0 3s1.5-1 0-3zM27.5 11c-1.5 2 0 3 0 3s1.5-1 0-3z" fill="currentColor"/>',
  watch: '<circle cx="24" cy="26" r="10"/><path d="M24 26v-6M24 26l3 2"/><path d="M22 14h4v2h-4z"/>',
  key: '<circle cx="17" cy="24" r="6"/><path d="M23 24h15M33 24v5M37 24v4"/>',
  photo: '<rect x="11" y="13" width="26" height="22" rx="1"/><circle cx="24" cy="22" r="4"/><path d="M15 35c2-5 5-7 9-7s7 2 9 7"/><path d="M20 19l8 6M28 19l-8 6" opacity=".6"/>',
  mask: '<path d="M9 21c5-5 11-4 15 0 4-4 10-5 15 0-1 7-5 10-9 10-3 0-4-2-6-4-2 2-3 4-6 4-4 0-8-3-9-10z"/><ellipse cx="17.5" cy="23" rx="3.2" ry="2"/><ellipse cx="30.5" cy="23" rx="3.2" ry="2"/>',
  ledger: '<rect x="13" y="11" width="22" height="27" rx="1.5"/><path d="M17 17h14M17 21h14M17 25h10M17 29h8"/><path d="M16 11v27"/>',
  cameo: '<ellipse cx="24" cy="25" rx="10" ry="12"/><ellipse cx="24" cy="25" rx="6.5" ry="8.5"/><path d="M24 13V9"/><path d="M22 23c0-2 1-3 2-3s2 1.4 2 3-1 2-2 2"/>',
  coin: '<circle cx="24" cy="24" r="11"/><circle cx="24" cy="24" r="7.5"/><path d="M26.5 20a4.5 4.5 0 100 8"/>',
  page: '<path d="M14 10h14l7 7v21H14z"/><path d="M28 10v7h7M18 22h12M18 26h12M18 30h7"/>',
  shard: '<path d="M18 10l12 6-4 22-10-9z"/><path d="M18 10l8 28"/>',
  feather: '<path d="M33 11c-12 2-18 12-19 26"/><path d="M33 11c0 10-6 17-16 19"/>',
  star: '<path d="M24 9l3.5 10.5L38 24l-10.5 3.5L24 38l-3.5-10.5L10 24l10.5-3.5z"/>',
  vial: '<path d="M20 10h8M21 10v8l-6 12a6 6 0 005 8h8a6 6 0 005-8l-6-12v-8"/><path d="M17 30h14" opacity=".6"/>',
  lantern: '<path d="M18 16h12l2 18H16z"/><path d="M20 16v-3h8v3M22 13a2 2 0 014 0M16 34h16v3H16z"/><circle cx="24" cy="25" r="3" fill="currentColor"/>',
  dress: '<path d="M19 10h10l-1 7 8 21H12l8-21z"/><path d="M20 17h8"/>',
};

export function itemArt(glyph, cat = 'quest', cls = '') {
  const [a, b] = CAT_COLORS[cat] || CAT_COLORS.quest;
  // Painted icons: 'p:<item id>' (assets/items) or 'p:<folder>/<file>' (any assets folder).
  if (typeof glyph === 'string' && glyph.startsWith('p:')) {
    const path = glyph.slice(2);
    const src = path.includes('/') ? `assets/${path}.webp` : `assets/items/${path}.webp`;
    return h('div', { class: `item-art painted ${cls}`, style: `--ia:${a};--ib:${b}` }, h('img', { src, alt: '', draggable: 'false' }));
  }
  return svgEl(`<div class="item-art ${cls}" style="--ia:${a};--ib:${b}"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[glyph] || GLYPHS.star}</svg></div>`);
}

// ---------------------------------------------------------------- scenes
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

const SKY = [
  ['#4a3a6e', '#9d84b8', '#d8b6c8'],
  ['#3a2d5e', '#7a6299', '#b892b4'],
  ['#1e1338', '#4b2d63', '#a0607e'],
  ['#06050d', '#16112c', '#2c1f4a'],
];

function sky(id, phase) {
  const [a, b, c] = SKY[phase];
  return `<linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
}

function glowDefs(id) {
  return `<filter id="${id}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="${id}soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <radialGradient id="${id}moon" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#f4eefc"/><stop offset=".7" stop-color="#cbbfe6"/><stop offset="1" stop-color="#9d8fc4"/></radialGradient>`;
}

function stars(r, n, h = 300) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 400).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(r() * 1.2 + 0.3).toFixed(2)}" fill="#efe6ff" opacity="${(r() * 0.6 + 0.2).toFixed(2)}" class="twinkle" style="animation-delay:${(r() * 4).toFixed(2)}s"/>`;
  return s;
}

function fog(id, y, op = 0.35) {
  return `<g class="fog" opacity="${op}"><ellipse cx="120" cy="${y}" rx="220" ry="26" fill="#cbb8e6" filter="url(#${id}glow)"/><ellipse cx="330" cy="${y + 20}" rx="200" ry="22" fill="#b8a5d6" filter="url(#${id}glow)"/></g>`;
}

const SCENES = {
  // The hidden cove beneath the cathedral, opening onto the cursed sea.
  // A sea cave frames a swollen moon; Aeria sits chained on the black rock.
  cove(phase) {
    const id = 'sc-cove'; const r = rng(29);
    let names = '';
    const glyphs = 'ABCDEFGHIKLMNORSTVW';
    for (let i = 0; i < 46; i++) {
      const x = 70 + r() * 260; const y = 352 + r() * 150; const sz = 4 + r() * 4;
      names += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${sz.toFixed(1)}" fill="#cdbbff" opacity="${(0.15 + r() * 0.45).toFixed(2)}" class="twinkle" style="animation-delay:${(r() * 4).toFixed(2)}s" font-family="serif">${glyphs[Math.floor(r() * glyphs.length)]}</text>`;
    }
    let shimmer = '';
    let yy = 338;
    for (let i = 0; i < 16; i++) {
      const w = 6 + (16 - i) * 2.4 + r() * 18; yy += 4 + r() * 9 + i * 0.6;
      shimmer += `<ellipse cx="${(200 + (r() - 0.5) * 16).toFixed(1)}" cy="${yy.toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="${(0.8 + r() * 0.9).toFixed(2)}" fill="#efe6ff" opacity="${(0.5 - i * 0.026).toFixed(2)}" filter="url(#${id}soft)"/>`;
    }
    let links = '';
    for (let i = 0; i < 9; i++) links += `<ellipse cx="${(246 + i * 4.2).toFixed(1)}" cy="${(566 + i * 9).toFixed(1)}" rx="2.6" ry="4" fill="none" stroke="#6d6286" stroke-width="1.4" transform="rotate(${i % 2 ? 60 : -20} ${(246 + i * 4.2).toFixed(1)} ${(566 + i * 9).toFixed(1)})"/>`;
    return `<defs>${glowDefs(id)}
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080614"/><stop offset=".7" stop-color="#1c1236"/><stop offset="1" stop-color="#2e1f4f"/></linearGradient>
      <linearGradient id="${id}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1430"/><stop offset=".4" stop-color="#0b0918"/><stop offset="1" stop-color="#030208"/></linearGradient>
      <radialGradient id="${id}halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cbb8f2" stop-opacity=".55"/><stop offset="1" stop-color="#cbb8f2" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}aura" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9fd8e8" stop-opacity=".35"/><stop offset="1" stop-color="#9fd8e8" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="400" height="340" fill="url(#${id}sky)"/>
    ${stars(r, 40, 300)}
    <circle cx="200" cy="215" r="150" fill="url(#${id}halo)"/>
    <circle cx="200" cy="215" r="78" fill="url(#${id}moon)"/>
    <circle cx="176" cy="196" r="12" fill="#b9acd8" opacity=".35"/><circle cx="222" cy="236" r="8" fill="#b9acd8" opacity=".3"/>
    <rect y="330" width="400" height="370" fill="url(#${id}sea)"/>
    <rect y="329" width="400" height="2" fill="#9f8fd0" opacity=".4"/>
    ${shimmer}
    ${names}
    <path d="M300 336l6-60 2 0 3 60z M300 300h18" stroke="#120d22" stroke-width="2" fill="#120d22" opacity=".9"/>
    <path d="M0 0H400V700H352C370 560 360 430 330 330C304 210 262 128 200 118C138 128 96 210 70 330C40 430 30 560 48 700H0Z" fill="#06040c"/>
    <path d="M352 700C370 560 360 430 330 330C304 210 262 128 200 118C138 128 96 210 70 330C40 430 30 560 48 700" fill="none" stroke="#3a2c5c" stroke-width="3" opacity=".7"/>
    <g fill="#06040c"><path d="M150 132l8 34 6-30z"/><path d="M228 124l5 26 6-24z"/><path d="M270 150l3 22 7-16z"/><path d="M112 176l10 28 4-24z"/><path d="M300 196l2 30 8-22z"/><path d="M190 119l4 18 4-17z"/></g>
    <g fill="#0a0716"><path d="M0 620Q60 590 120 615T230 640L260 700H0Z"/><path d="M260 700L290 630Q340 600 400 625V700Z"/></g>
    <ellipse cx="238" cy="552" rx="96" ry="56" fill="url(#${id}aura)" class="pulse"/>
    <path d="M168 600Q190 548 244 542Q300 546 318 604Q240 622 168 600Z" fill="#0d0a1c" stroke="#3a2f5e" stroke-width="1.5"/>
    <g stroke-linejoin="round">
      <path d="M236 556c18 6 42 2 60 12 12 6 16 18 9 24-12-8-27-8-41-6-13 2-26-2-32-10z" fill="#1d3a4c" stroke="#7fc3d4" stroke-width="1.1"/>
      <path d="M302 590c9-7 20-7 27 2-9 0-15 5-19 11" fill="#1d3a4c" stroke="#7fc3d4" stroke-width="1.1"/>
      <path d="M232 470c-16 4-25 24-33 48-6 20-17 38-30 50 19-4 34-17 42-35 4 13 2 27-6 39 15-8 24-25 24-46" fill="#2a2148" stroke="#b9a8e8" stroke-width=".9" opacity=".95"/>
      <path d="M233 471c10-2 18 6 18 16 0 8-4 14-9 17l4 20c8 6 12 18 10 30l-24 6c-6-10-6-24 0-34l-4-20c-6-4-9-10-8-17 1-9 6-16 13-18z" fill="#30264f" stroke="#d6c8ff" stroke-width="1.1"/>
      <path d="M244 480c3 6 3 13 0 19" fill="none" stroke="#efe6ff" stroke-width="1.4" opacity=".8"/>
      <path d="M210 500c-4 14-12 28-22 38M220 492c-2 16-6 30-14 42" fill="none" stroke="#b9a8e8" stroke-width=".7" opacity=".6"/>
    </g>
    ${links}
    <path d="M280 640q10 30 0 60" stroke="#6d6286" stroke-width="1.4" fill="none" opacity=".6"/>
    ${fog(id, 610, 0.3)}
    ${fog(id, 680, 0.22)}`;
  },
  cathedral(phase) {
    const id = 'sc-cat'; const r = rng(11);
    const night = phase === 3;
    const win = phase === 0 ? '#c9a7e8' : phase === 1 ? '#a98bd0' : phase === 2 ? '#b07aa6' : '#8f7fd8';
    let pillars = '';
    [[20, 70], [330, 380]].forEach(([x1]) => {
      pillars += `<rect x="${x1}" y="120" width="50" height="580" fill="#120c1f"/><rect x="${x1 + 6}" y="120" width="6" height="580" fill="#2a1f40" opacity=".7"/>`;
    });
    let violets = '';
    for (let i = 0; i < 60; i++) {
      const x = r() * 400; const y = 560 + r() * 140; const s = r() * 2.2 + 0.8;
      violets += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="#c9a3ff" opacity="${(0.4 + r() * 0.5).toFixed(2)}" class="pulse" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`;
    }
    let candles = '';
    for (let i = 0; i < 7; i++) {
      const x = 60 + i * 12 + r() * 4; const hgt = 14 + r() * 18;
      candles += `<rect x="${x}" y="${470 - hgt}" width="5" height="${hgt}" fill="#e8dcc8"/><ellipse cx="${x + 2.5}" cy="${464 - hgt}" rx="2.4" ry="4.5" fill="#ffd9a0" class="flicker" style="animation-delay:${(r() * 2).toFixed(2)}s"/>`;
    }
    return `
    <defs>${sky(id, phase)}${glowDefs(id)}
      <radialGradient id="${id}win" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="${win}" stop-opacity=".8"/><stop offset="1" stop-color="#2b1a47" stop-opacity=".9"/></radialGradient>
      <linearGradient id="${id}ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${win}" stop-opacity=".45"/><stop offset="1" stop-color="${win}" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1430"/><stop offset="1" stop-color="#0a0712"/></linearGradient>
    </defs>
    <rect width="400" height="700" fill="#0d0918"/>
    <path d="M70 700V250Q200 30 330 250V700z" fill="#160f27"/>
    <path d="M100 700V280Q200 90 300 280V700z" fill="#1b1330"/>
    <g transform="translate(200 210)">
      <circle r="92" fill="#0b0714"/>
      <circle r="84" fill="url(#${id}win)"/>
      <g stroke="#1a1028" stroke-width="3" fill="none">${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="0" x2="${(Math.cos(i * Math.PI / 6) * 84).toFixed(1)}" y2="${(Math.sin(i * Math.PI / 6) * 84).toFixed(1)}"/>`).join('')}<circle r="30"/><circle r="58"/></g>
      <circle cx="10" cy="-6" r="28" fill="#120a20" opacity=".92"/>
      <circle cx="-4" cy="-2" r="29" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" filter="url(#${id}soft)"/>
    </g>
    <path d="M150 260L40 700h170z" fill="url(#${id}ray)" opacity="${night ? 0.5 : 0.85}" class="ray"/>
    <path d="M250 260l110 440H210z" fill="url(#${id}ray)" opacity="${night ? 0.4 : 0.7}" class="ray" style="animation-delay:2s"/>
    ${pillars}
    <path d="M0 520h400v180H0z" fill="url(#${id}floor)"/>
    <g stroke="#2a2040" stroke-width="1" opacity=".6">${Array.from({ length: 9 }, (_, i) => `<line x1="200" y1="520" x2="${-200 + i * 100}" y2="700"/>`).join('')}<line x1="0" y1="560" x2="400" y2="560"/><line x1="0" y1="610" x2="400" y2="610"/></g>
    <g transform="translate(200 470)"><rect x="-60" y="0" width="120" height="70" fill="#231a36"/><rect x="-70" y="-8" width="140" height="10" fill="#2f2447"/><path d="M-2 0l4 70" stroke="#0d0918" stroke-width="2"/></g>
    ${candles}
    <g filter="url(#${id}soft)">${violets}</g>
    <g opacity=".5">${stars(r, 30, 600).replace(/#efe6ff/g, '#d9c8ff')}</g>
    ${fog(id, 640, night ? 0.25 : 0.18)}
    `;
  },

  royal(phase) {
    const id = 'sc-roy'; const r = rng(23);
    let windows = '';
    for (let i = 0; i < 26; i++) {
      const x = 110 + r() * 180; const y = 200 + r() * 160;
      const lit = phase >= 2 ? r() > 0.25 : r() > 0.7;
      windows += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="4" height="8" rx="2" fill="${lit ? '#ffd6a3' : '#3a2f55'}" opacity="${lit ? 0.9 : 0.7}"/>`;
    }
    const lamps = [40, 360].map((x) => `<g><rect x="${x - 2}" y="430" width="4" height="150" fill="#120c1c"/><circle cx="${x}" cy="428" r="${phase >= 2 ? 22 : 10}" fill="#ffcf8c" opacity="${phase >= 2 ? 0.35 : 0.15}" filter="url(#${id}glow)"/><path d="M${x - 8} 420h16l-3 14h-10z" fill="#ffe3b8" opacity="${phase >= 2 ? 0.95 : 0.5}"/></g>`).join('');
    return `
    <defs>${sky(id, phase)}${glowDefs(id)}
      <linearGradient id="${id}stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2244"/><stop offset="1" stop-color="#110c1d"/></linearGradient>
      <radialGradient id="${id}water" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b9a6e6" stop-opacity=".7"/><stop offset="1" stop-color="#3e2f68" stop-opacity=".9"/></radialGradient>
    </defs>
    <rect width="400" height="700" fill="url(#${id}sky)"/>
    ${phase >= 2 ? stars(r, 60, 260) : ''}
    <circle cx="300" cy="${phase === 3 ? 110 : 150}" r="${phase === 3 ? 58 : 40}" fill="url(#${id}moon)" opacity="${phase <= 1 ? 0.55 : 1}"/>
    <circle cx="300" cy="${phase === 3 ? 110 : 150}" r="90" fill="#d8ccff" opacity=".15" filter="url(#${id}glow)"/>
    <path d="M0 360l40-60 20 30 30-80 25 40 20-20 30 90z" fill="#1b1430" opacity=".7"/>
    <g fill="url(#${id}stone)">
      <path d="M100 400V230l20-30 20 30v-60l15-50 15 50v80l30-90 30 90v-80l15-50 15 50v60l20-30 20 30v170z"/>
      <path d="M182 150l18-80 18 80z"/><rect x="150" y="300" width="100" height="100"/>
    </g>
    <path d="M178 400v-60a22 22 0 0144 0v60z" fill="#0e0918"/>
    ${windows}
    <path d="M0 400h400v300H0z" fill="#150f22"/>
    <g stroke="#241a38" stroke-width="1">${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${420 + i * 28}" x2="400" y2="${420 + i * 28}"/>`).join('')}</g>
    ${lamps}
    <g transform="translate(120 560)">
      <ellipse rx="90" ry="26" fill="#2a2140"/><ellipse rx="80" ry="20" fill="url(#${id}water)"/>
      <rect x="-8" y="-70" width="16" height="70" fill="#2f2648"/><ellipse cy="-70" rx="30" ry="8" fill="#2f2648"/>
      <g stroke="#cfc2ff" stroke-width="1.4" fill="none" opacity=".7" class="spray"><path d="M0-76q-20-30-34 20"/><path d="M0-76q20-30 34 20"/><path d="M0-76q-6-34-16 26"/><path d="M0-76q6-34 16 26"/></g>
    </g>
    <g fill="#0f0b19"><ellipse cx="340" cy="520" rx="60" ry="40"/><ellipse cx="380" cy="490" rx="40" ry="50"/><ellipse cx="20" cy="500" rx="40" ry="44"/></g>
    ${fog(id, 420, phase === 3 ? 0.3 : 0.2)}
    `;
  },

  library(phase) {
    const id = 'sc-lib'; const r = rng(37);
    const cols = ['#4a2f5e', '#5c3b2f', '#2f3d5c', '#5e4a2f', '#3d2f5e', '#6b3f4f', '#2f4a45'];
    let shelves = '';
    [[0, 120], [280, 400]].forEach(([x0, x1]) => {
      shelves += `<rect x="${x0}" y="0" width="${x1 - x0}" height="700" fill="#1a1120"/>`;
      for (let row = 0; row < 12; row++) {
        const y = 20 + row * 56;
        shelves += `<rect x="${x0}" y="${y + 46}" width="${x1 - x0}" height="6" fill="#2b1d2a"/>`;
        let x = x0 + 4;
        while (x < x1 - 8) {
          const w = 5 + r() * 7; const hh = 28 + r() * 16;
          shelves += `<rect x="${x.toFixed(1)}" y="${(y + 46 - hh).toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`;
          x += w + 1;
        }
      }
    });
    let dust = '';
    for (let i = 0; i < 40; i++) dust += `<circle cx="${(140 + r() * 120).toFixed(1)}" cy="${(120 + r() * 480).toFixed(1)}" r="${(r() * 1.3 + 0.4).toFixed(2)}" fill="#f1e6ff" opacity="${(0.25 + r() * 0.5).toFixed(2)}" class="drift" style="animation-delay:${(r() * 8).toFixed(2)}s"/>`;
    const light = phase === 3 ? '#9a8ce0' : phase === 2 ? '#d9a27a' : '#e8d9ff';
    return `
    <defs>${sky(id, phase)}${glowDefs(id)}
      <linearGradient id="${id}ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}" stop-opacity=".45"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="400" height="700" fill="#120c18"/>
    <path d="M140 420V140q60-100 120 0v280z" fill="url(#${id}sky)"/>
    ${phase >= 2 ? `<g>${stars(r, 20, 400).replace(/cx="(\d+)/g, (m, x) => `cx="${140 + (x % 120)}`)}</g>` : ''}
    <circle cx="214" cy="${phase === 3 ? 170 : 200}" r="20" fill="url(#${id}moon)" opacity="${phase <= 1 ? 0.5 : 1}"/>
    <g stroke="#1b1224" stroke-width="5" fill="none"><path d="M200 120v300M140 260h120M140 180q60-60 120 0"/></g>
    <path d="M150 300L60 700h280L250 300z" fill="url(#${id}ray)" class="ray"/>
    ${shelves}
    <g stroke="#3a2a33" stroke-width="3"><line x1="96" y1="200" x2="128" y2="700"/><line x1="112" y1="200" x2="144" y2="700"/>${Array.from({ length: 14 }, (_, i) => `<line x1="${99 + i * 2.3}" y1="${230 + i * 34}" x2="${115 + i * 2.3}" y2="${230 + i * 34}"/>`).join('')}</g>
    <path d="M120 470h160v14H120z" fill="#2a1b26"/>
    <path d="M110 600h180v100H110z" fill="#1e1420"/>
    <g transform="translate(200 560)"><rect x="-50" y="0" width="100" height="10" fill="#3a2630"/><rect x="-40" y="10" width="6" height="40" fill="#2a1b24"/><rect x="34" y="10" width="6" height="40" fill="#2a1b24"/>
      <circle cx="-20" cy="-8" r="${phase >= 2 ? 26 : 12}" fill="#9fe0a6" opacity=".18" filter="url(#${id}glow)"/><path d="M-30 -2h20l-4-12h-12z" fill="#7fbf8a" opacity=".9"/></g>
    ${dust}
    ${fog(id, 690, 0.12)}
    `;
  },

  woods(phase) {
    const id = 'sc-wood'; const r = rng(53);
    let trees = '';
    for (let layer = 0; layer < 3; layer++) {
      const col = ['#2a2145', '#1a1430', '#0c0918'][layer];
      for (let i = 0; i < 7; i++) {
        const x = (i * 64 + r() * 40 - 20 + layer * 25) % 440 - 20;
        const w = 10 + layer * 9 + r() * 8;
        trees += `<path d="M${x} 700V${120 + layer * 40 + r() * 60}q${w / 2} -30 ${w} 0V700z" fill="${col}"/>`;
        trees += `<path d="M${x + w / 2} ${300 + r() * 100}l${-30 - r() * 20} ${-40 - r() * 30}M${x + w / 2} ${260 + r() * 80}l${30 + r() * 20} ${-40 - r() * 30}" stroke="${col}" stroke-width="${3 + layer}" />`;
      }
    }
    let flowers = '';
    for (let i = 0; i < 70; i++) {
      const x = r() * 400; const y = 520 + r() * 180; const s = r() * 3 + 1.2;
      const c = r() > 0.3 ? '#b98cff' : '#8fd6ff';
      flowers += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="${c}" class="pulse" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`;
    }
    let moths = '';
    for (let i = 0; i < 14; i++) moths += `<circle cx="${(r() * 400).toFixed(0)}" cy="${(260 + r() * 300).toFixed(0)}" r="1.6" fill="#f3e9ff" class="drift" style="animation-delay:${(r() * 8).toFixed(2)}s"/>`;
    return `
    <defs>${sky(id, phase)}${glowDefs(id)}</defs>
    <rect width="400" height="700" fill="url(#${id}sky)"/>
    ${phase >= 2 ? stars(r, 50, 300) : ''}
    <circle cx="110" cy="${phase === 3 ? 120 : 160}" r="${phase === 3 ? 46 : 34}" fill="url(#${id}moon)" opacity="${phase <= 1 ? 0.45 : 0.95}"/>
    <circle cx="110" cy="${phase === 3 ? 120 : 160}" r="80" fill="#d8ccff" opacity=".15" filter="url(#${id}glow)"/>
    ${trees}
    <path d="M150 700q30-120 60-180t20-120" stroke="#3b2f56" stroke-width="34" fill="none" opacity=".55"/>
    <path d="M0 560q200-40 400 0v140H0z" fill="#0d0a18"/>
    <g filter="url(#${id}soft)">${flowers}</g>
    ${flowers}
    ${moths}
    ${fog(id, 520, phase === 3 ? 0.35 : 0.28)}
    ${fog(id, 640, 0.22)}
    `;
  },
};

// Painted backgrounds (portrait 2:3). `focus` is the horizontal point kept in
// view on narrow screens. The Velvet Ballroom uses the landscape mockup art.
export const SCENE_IMAGES = {
  cathedral: { src: 'assets/img/scene_cathedral.jpg', blur: 'assets/img/scene_cathedral_blur.jpg', focus: 0.5, focusY: 0.5, ratio: 2528 / 1696 },
  // Story illustration (CG) shown behind the opening scene of Chapter 1.
  cg_awakening: { src: 'assets/img/cg_awakening.jpg', blur: 'assets/img/cg_awakening_blur.jpg', focus: 0.46, focusY: 0.42, ratio: 2752 / 1536 },
  royal: { src: 'assets/img/scene_royal.jpg', blur: 'assets/img/scene_royal_blur.jpg', focus: 0.52, focusY: 0.4 },
  library: { src: 'assets/img/scene_library.jpg', blur: 'assets/img/scene_library_blur.jpg', focus: 0.5, focusY: 0.42 },
  woods: { src: 'assets/img/scene_woods.jpg', blur: 'assets/img/scene_woods_blur.jpg', focus: 0.5, focusY: 0.45 },
  garden: { src: 'assets/img/scene_garden.jpg', blur: 'assets/img/scene_garden_blur.jpg', focus: 0.47, focusY: 0.55, ratio: 1170 / 775 },
  // The hidden cove, with Aeria on her rock.
  cove: { src: 'assets/img/scene_cove.jpg', blur: 'assets/img/scene_cove_blur.jpg', focus: 0.6, focusY: 0.6, ratio: 1408 / 768 },
  gala_night: { src: 'assets/img/scene_gala_night.jpg', blur: 'assets/img/scene_gala_night_blur.jpg', focus: 0.5, focusY: 0.55, ratio: 2200 / 1228 },
  ballroom: { src: 'assets/spatial/hall.jpg', blur: 'assets/gala/ballroom_blur.jpg', focus: 0.5, focusY: 0.42, ratio: 2200 / 1228 },
};
const RATIO = 1024 / 1536;

// Keeps a framed painting filling the screen height, centred on its focus,
// and pulls any hotspot that would fall off-screen (or under the HUD) back in view.
const sceneObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((entries) => entries.forEach((e) => layoutScene(e.target))) : null;

export function layoutScene(scene) {
  const frame = scene.querySelector(':scope > .scene-frame');
  if (!frame) return;
  const W = scene.clientWidth; const H = scene.clientHeight;
  if (!W || !H) return;
  // Fill the height on phones; on wide screens grow wider (cropping top and bottom a little).
  const ratio = Number(frame.dataset.ratio || RATIO);
  const F = ratio > 1 ? Math.max(H * ratio, W) : Math.max(H * ratio, Math.min(W * 0.62, H * 1.15));
  const FH = F / ratio;
  const focus = Number(frame.dataset.focus || 0.5);
  const focusY = Number(frame.dataset.focusY || 0.45);
  let left = W / 2 - focus * F;
  if (F >= W) left = Math.min(0, Math.max(W - F, left));
  else left = (W - F) / 2;
  let topOff = Math.min(0, Math.max(H - FH, H / 2 - focusY * FH));
  frame.style.width = `${F}px`;
  frame.style.height = `${FH}px`;
  frame.style.transform = `translate(${left}px, ${topOff}px)`;
  // Keep hotspots clear of the header and the bottom panel actually on screen.
  const parent = scene.parentElement;
  const headEl = parent && parent.querySelector(':scope > .loc-head');
  const bottomEl = parent && parent.querySelector(':scope > .loc-bottom');
  const top = headEl ? headEl.offsetHeight : Number(scene.dataset.safeTop || 0);
  const bottom = bottomEl ? bottomEl.offsetHeight + 4 : Number(scene.dataset.safeBottom || 0);
  const spots = [...frame.querySelectorAll('[data-x]')].map((el) => {
    let x = left + (Number(el.dataset.x) / 100) * F;
    let y = topOff + (Number(el.dataset.y) / 100) * FH;
    x = Math.max(16, Math.min(W - 16, x));
    y = Math.max(top + 14, Math.min(H - bottom - 30, y));
    return { el, x, y, w: el.offsetWidth || 120 };
  });
  // Nudge apart any hotspots that would overlap after being pulled into view.
  spots.sort((p, q) => q.y - p.y);
  for (let i = 0; i < spots.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = spots[i]; const b = spots[j];
      if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < 40) a.y = Math.max(top + 14, b.y - 42);
    }
  }
  spots.forEach(({ el, x, y, w }) => {
    el.style.left = `${((x - left) / F) * 100}%`;
    el.style.top = `${((y - topOff) / FH) * 100}%`;
    const half = w / 2;
    el.classList.toggle('edge-l', x - half < 6);
    el.classList.toggle('edge-r', x + half > W - 6 && !(x - half < 6));
  });
}

export function sceneArt(name, phase, { layer = null, safeTop = 0, safeBottom = 0, cover = false } = {}) {
  const wrap = h('div', { class: `scene scene-${name} phase-${phase}`, dataset: { safeTop, safeBottom } });
  const img = SCENE_IMAGES[name];
  if (img && cover) {
    wrap.classList.add('is-framed');
    wrap.appendChild(h('img', { class: 'scene-cover', src: img.src, alt: '', style: { objectPosition: `${img.focus * 100}% 35%` } }));
    wrap.appendChild(h('div', { class: 'scene-tint' }));
  } else if (img) {
    wrap.classList.add('is-framed');
    wrap.appendChild(h('div', { class: 'scene-blur', style: { backgroundImage: `url(${img.blur})` } }));
    const frame = h('div', { class: 'scene-frame', dataset: { focus: img.focus, focusY: img.focusY, ratio: img.ratio || RATIO } },
      h('img', { class: 'scene-pic', src: img.src, alt: '', draggable: 'false' }),
      h('div', { class: 'scene-tint' }));
    if (layer) frame.appendChild(layer);
    wrap.appendChild(frame);
    if (sceneObserver) sceneObserver.observe(wrap);
    requestAnimationFrame(() => layoutScene(wrap));
  } else {
    if (name === 'ballroom') wrap.appendChild(h('div', { class: 'scene-img', style: { backgroundImage: 'url(assets/img/gala_hero.jpg)' } }));
    else if (SCENES[name]) wrap.appendChild(svgEl(`<svg class="scene-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${SCENES[name](phase)}</svg>`));
    wrap.appendChild(h('div', { class: 'scene-tint' }));
    if (layer) { layer.classList.add('flat-layer'); wrap.appendChild(layer); }
  }
  return wrap;
}

// ---------------------------------------------------------------- Astoria
// Overlays are drawn in the coordinate space of astoria_courtyard.jpg (1024×1536).
// Face pieces are designed upright and mapped onto her tilted face.
const FACE = 'translate(345.5 396) rotate(31) scale(1.3) translate(-360 -258)';
const OVERLAYS = {
  mask: `<g transform="${FACE}"><defs><linearGradient id="ovsilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece7f6"/><stop offset=".55" stop-color="#9d95b6"/><stop offset="1" stop-color="#4d4668"/></linearGradient></defs>
    <path fill-rule="evenodd" fill="url(#ovsilver)" fill-opacity=".82" stroke="#5c5478" stroke-width="1.2" d="M292 256c10-22 34-30 58-18 6 3 9 6 9 6s3-3 9-6c24-12 48-4 58 18-4 18-18 28-34 28-14 0-24-8-33-18-9 10-19 18-33 18-16 0-30-10-34-28zM307 258c6 10 18 16 30 14 8-1 14-6 16-12-8-10-22-14-34-10-6 2-10 5-12 8zM411 258c-6 10-18 16-30 14-8-1-14-6-16-12 8-10 22-14 34-10 6 2 10 5 12 8z"/>
    <path d="M300 250c14-18 38-20 56-6M418 250c-14-18-38-20-56-6" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/>
    <g fill="#fbf8ff">${[300, 314, 328, 390, 404, 418].map((x, i) => `<circle cx="${x}" cy="${i < 3 ? 247 - i * 2 : 243 + (i - 3) * 2}" r="1.8"/>`).join('')}</g>
    <path d="M359 244c-6-14-2-26 8-34M359 244c6-14 14-20 26-22M359 244c-10-10-22-12-30-8" fill="none" stroke="#d9d3ea" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="367" cy="210" r="2.6" fill="#a37be0"/>
    <g fill="none" stroke="#3b3452" stroke-width="1" opacity=".7"><path d="M300 262c6 8 10 12 18 14M418 262c-6 8-10 12-18 14"/><path d="M296 252c-6-4-10-2-12 2M422 252c6-4 10-2 12 2"/></g>
  </g>`,
  spectacles: `<g transform="${FACE}" fill="rgba(220,230,255,.08)" stroke="#d7d2e6" stroke-width="2.4"><circle cx="329" cy="258" r="20"/><circle cx="391" cy="258" r="20"/><path d="M349 256q11-6 22 0" fill="none"/><path d="M309 254l-14-4M411 254l14-4" fill="none"/></g>`,
  circlet: `<g transform="${FACE} translate(0 -14)"><path d="M284 214q76 22 150-10" fill="none" stroke="#e6e1f2" stroke-width="3.2" stroke-linecap="round"/><path d="M284 214q76 22 150-10" fill="none" stroke="#8f86a8" stroke-width="1" opacity=".7" transform="translate(0 2)"/>
    <path d="M352 214a10 10 0 1016 5 8 8 0 01-16-5z" fill="#f1edff" stroke="#9f95c2" stroke-width="1.2"/><circle cx="360" cy="225" r="3" fill="#a37be0"/>
    <g fill="#f6f2ff">${[300, 318, 336, 384, 402, 420].map((x, i) => `<circle cx="${x}" cy="${i < 3 ? 219 + i * 2.4 : 225 - (i - 3) * 4}" r="1.6"/>`).join('')}</g></g>`,
  rosecomb: `<g transform="translate(236 214) scale(1.3)"><circle r="20" fill="#6e6a78"/><path d="M0-18c10 0 18 8 18 18S10 18 0 18-18 10-18 0" fill="#8f8b99"/><path d="M-12-4c2-10 16-12 20-2 4 8-4 14-10 12" fill="none" stroke="#c9c5d1" stroke-width="2.4"/><path d="M-4 0c0-6 8-6 8 0s-6 6-8 2" fill="none" stroke="#e1dee6" stroke-width="2"/><path d="M14 14q12 8 20 4M-14 14q-10 10-18 8" stroke="#2c2a33" stroke-width="3" fill="none"/></g>`,
  veil: `<defs><linearGradient id="ovveil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2560" stop-opacity=".5"/><stop offset=".6" stop-color="#2a1840" stop-opacity=".22"/><stop offset="1" stop-color="#2a1840" stop-opacity="0"/></linearGradient></defs>
    <path d="M170 330q150-190 330 -10q50 60 56 170l24 380-56 10-36-380q-14-90-90-110-100-26-160 30-40 50-50 140l-34 330-56-10 30-340q14-120 42-210z" fill="url(#ovveil)"/>
    <path d="M170 330q150-190 330 -10" fill="none" stroke="#d8c8ff" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" opacity=".9"/>
    <path d="M156 380q170-150 360 0" fill="none" stroke="#d8c8ff" stroke-width="1.2" stroke-dasharray="1 8" stroke-linecap="round" opacity=".5"/>`,
  choker: `<g><path d="M246 496q40 26 82 6" fill="none" stroke="#141019" stroke-width="10" stroke-linecap="round"/><path d="M246 496q40 26 82 6" fill="none" stroke="#6a6080" stroke-width="1.6" stroke-dasharray="2 5"/><path d="M288 514l-6 11 6 13 6-13z" fill="#9b6ad8" stroke="#e6dcff" stroke-width="1.2"/></g>`,
  brooch: `<g transform="translate(396 662) scale(1.25)"><ellipse rx="15" ry="18" fill="#c9a76a" stroke="#6f5a32"/><ellipse rx="10.5" ry="13.5" fill="#6b2fa8"/><ellipse cx="-3.5" cy="-5" rx="3.5" ry="4.5" fill="#d9c2ff" opacity=".8"/></g>`,
  star: `<g transform="translate(396 662) scale(1.3)"><path d="M0-22l5 15 15-5-10 12 12 10-15-2 2 15-9-13-9 13 2-15-15 2 12-10-10-12 15 5z" fill="#ece8f6" stroke="#8f86a8" stroke-width="1.2"/><circle r="5" fill="#9b6ad8"/></g>`,
};

export function astoriaFigure({ worn, cls = '' } = {}) {
  const dress = COSMETICS[worn.dress];
  const grade = GRADES[dress?.grade || 'none'];
  const tone = TONES[COSMETICS[worn.makeup]?.tone || 'none'];
  const layers = ['hair', 'accessory', 'jewellery'].map((slot) => COSMETICS[worn[slot]]?.overlay).filter(Boolean);
  const wrap = h('div', { class: `astoria-figure ${cls}` });
  const inner = h('div', { class: 'astoria-inner' });
  inner.appendChild(h('img', { src: 'assets/img/astoria_courtyard.jpg', alt: 'Astoria', class: 'astoria-img' }));
  // A recoloured copy, masked to her gown, stands in for re-illustrated outfits.
  if (grade) inner.appendChild(h('img', { src: 'assets/img/astoria_courtyard.jpg', alt: '', class: 'astoria-img astoria-dress', style: { filter: grade } }));
  if (tone) inner.appendChild(h('div', { class: 'astoria-tone', style: { background: `radial-gradient(ellipse 12% 9% at 34% 27%, ${tone}, transparent 70%)` } }));
  if (layers.length) inner.appendChild(svgEl(`<svg class="astoria-overlay" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">${layers.map((l) => OVERLAYS[l] || '').join('')}</svg>`));
  wrap.appendChild(inner);
  return wrap;
}

// Painted thumbnails for wardrobe pieces (cut from the wardrobe and shop mock-ups).
export const COS_THUMBS = new Set(['midnight_rose', 'eclipse_gown', 'royal_violet', 'academia_coat', 'cathedral_vestment', 'forest_cloak', 'gala_gown', 'crimson_masque', 'frost_lace', 'lilac_dream', 'rose_blush', 'ivory_requiem', 'loose_ribbon', 'silver_circlet', 'rose_comb', 'lace_veil', 'braided_crown', 'twin_tails', 'wavy_bob', 'half_up_bow', 'velvet_heels', 'forest_boots', 'ballroom_slippers', 'mary_janes', 'lace_heels', 'ankle_chains', 'silver_crescent']);
const SLOT_GLYPH = { dress: 'dress', hair: 'flower', accessory: 'mask', jewellery: 'gem', shoes: 'gloves', makeup: 'perfume' };
export function cosArt(id, slot, cat = 'clothing', cls = '') {
  if (COS_THUMBS.has(id)) return h('div', { class: `cos-thumb ${cls}` }, h('img', { src: `assets/wardrobe/${id}.webp`, alt: '', draggable: 'false' }));
  return itemArt(SLOT_GLYPH[slot] || 'star', cat, cls);
}
