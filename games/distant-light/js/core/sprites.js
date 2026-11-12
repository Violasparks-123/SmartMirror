/* Character portraits.
   Hikaru and Haruka use the creator's own hand-drawn portraits (assets/sprites/), cut out of the
   paper by tools/cutout_portraits.py. One drawing per character, so "expressions" are shown as
   small movements instead (a hop when happy, a shake when angry, a droop when sad...).
   Rin uses the creator's digital portrait (cut off its white background). The code-drawn faces
   below are kept only as a fallback if an image is ever missing. */
DL.Sprites = (() => {
  // h/w = size on the 1280×720 stage, anchor = where her face is across the image (0 left … 1 right),
  // bottom = how far the picture sits below the bottom edge of the stage.
  const ART = {
    hikaru: { src: 'assets/sprites/hikaru.webp', face: 'assets/sprites/hikaru_face.webp', h: 620, w: 452, anchor: 0.62, bottom: 0 },
    haruka: { src: 'assets/sprites/haruka.webp', face: 'assets/sprites/haruka_face.webp', h: 676, w: 516, anchor: 0.433, bottom: -10, clip: { x: 31, y: 19 } },
    // Rin's picture is cut off at the top of her hair, so the top edge sits just above the stage.
    rin: { src: 'assets/sprites/rin.webp', face: 'assets/sprites/rin_face.webp', h: 768, w: 507, anchor: 0.479, bottom: -44 },
    // The Mikage siblings (the creator's digital portrait, cut off its white background)
    // Two drawings each: rei.webp is Rei's psychotic smile, rei_calm.webp her polite one.
    // sei.webp is Sei scared, sei_calm.webp Sei pretending to be fine. `alt` lists which expressions use the calm one.
    rei: { src: 'assets/sprites/rei.webp', face: 'assets/sprites/rei_face.webp', h: 690, w: 437, anchor: 0.52, bottom: 0,
      alt: { src: 'assets/sprites/rei_calm.webp', exprs: ['smile', 'neutral', 'soft', 'shy', 'sad', 'surprised', 'worried'] } },
    sei: { src: 'assets/sprites/sei.webp', face: 'assets/sprites/sei_face.webp', h: 670, w: 464, anchor: 0.5, bottom: 0,
      alt: { src: 'assets/sprites/sei_calm.webp', exprs: ['smile', 'neutral', 'happy', 'soft'] } },
  };
  const ALIAS = { haruka2: 'haruka' }; // a second Haruka on screen at once (you'll see)
  // While the twins are swapped (see js/story/mikage.js), Haruka is drawn as Hikaru and vice versa
  const real = (who) => {
    const w = ALIAS[who] || who;
    if ((w === 'haruka' || w === 'hikaru') && DL.Sprites && DL.Sprites.swapCheck && DL.Sprites.swapCheck()) return w === 'haruka' ? 'hikaru' : 'haruka';
    return w;
  };

  const CHARS = {
    rei: {
      hair: ['#fbf1d8', '#ead9ad', '#c43048'], eye: ['#cfd8e4', '#7f8fa6', '#2c3442'],
      ribbon: '#1f2a4a', ribbonDark: '#141b33', style: 'long', skin: '#fbefe8', skinShade: '#ecd6cc',
    },
    sei: {
      hair: ['#fbf1d8', '#ead9ad', '#c43048'], eye: ['#cfd8e4', '#7f8fa6', '#2c3442'],
      ribbon: '#1f2a4a', ribbonDark: '#141b33', style: 'bob', skin: '#fbefe8', skinShade: '#ecd6cc',
    },
    haruka: {
      hair: ['#ffd2e2', '#f3a3c2', '#c9668f'], eye: ['#ff8fb4', '#c13a6b', '#5e1431'],
      ribbon: '#ee8db1', ribbonDark: '#c45d86', style: 'ponytail', skin: '#fde9e1', skinShade: '#f2cbbf',
    },
    hikaru: {
      hair: ['#e3f1ff', '#a9cff2', '#6797c8'], eye: ['#a8cdf0', '#4d7fb4', '#1d3556'],
      ribbon: '#93c1ea', ribbonDark: '#5f8fc0', style: 'long', skin: '#fdeae3', skinShade: '#f1cdc2',
    },
    rin: {
      hair: ['#ece4fb', '#c7b6ea', '#8d78c4'], eye: ['#b3a3dc', '#6e5aa6', '#2e2252'],
      ribbon: '#bba8e8', ribbonDark: '#8b76c2', style: 'bob', skin: '#fde8dc', skinShade: '#f0c9bb', glasses: true,
    },
  };

  // Expression recipes: eyes, brows, mouth, blush strength, extras
  const EXPR = {
    neutral:   { eyes: 'open', brows: 'neutral', mouth: 'neutral', blush: 0.22 },
    smile:     { eyes: 'open', brows: 'neutral', mouth: 'smile', blush: 0.3 },
    happy:     { eyes: 'closed', brows: 'up', mouth: 'grin', blush: 0.45 },
    smirk:     { eyes: 'half', brows: 'smug', mouth: 'smirk', blush: 0.15 },
    cold:      { eyes: 'half', brows: 'flat', mouth: 'tight', blush: 0.05 },
    angry:     { eyes: 'open', brows: 'angry', mouth: 'frown', blush: 0.2 },
    sad:       { eyes: 'down', brows: 'sad', mouth: 'sad', blush: 0.25 },
    worried:   { eyes: 'open', brows: 'sad', mouth: 'tremble', blush: 0.3 },
    surprised: { eyes: 'wide', brows: 'raised', mouth: 'open', blush: 0.25 },
    shy:       { eyes: 'away', brows: 'soft', mouth: 'small', blush: 0.6 },
    cry:       { eyes: 'shut', brows: 'sad', mouth: 'sad', blush: 0.5, tears: true },
    mask:      { eyes: 'half', brows: 'sad', mouth: 'smirk', blush: 0.1 },
    soft:      { eyes: 'down', brows: 'soft', mouth: 'smile', blush: 0.4 },
    blank:     { eyes: 'hollow', brows: 'flat', mouth: 'neutral', blush: 0 },
    eerie:     { eyes: 'hollow', brows: 'up', mouth: 'wide', blush: 0.35 },
  };
  const EXPRESSIONS = Object.keys(EXPR);

  const LASH = '#3a2a3f';
  const MOUTH = '#b8526c';

  function eye(cx, cy, side, kind, c, uid) {
    const outer = side === 'L' ? -1 : 1;
    const lashPath = `M${cx - 19} ${cy + 1} C${cx - 12} ${cy - 16} ${cx + 12} ${cy - 16} ${cx + 19} ${cy - 3}`;
    const flick = `M${cx + outer * 18} ${cy - 1} l${outer * 7} -6`;
    if (kind === 'closed') return `<path d="M${cx - 15} ${cy + 3} Q${cx} ${cy - 10} ${cx + 15} ${cy + 3}" fill="none" stroke="${LASH}" stroke-width="4.5" stroke-linecap="round"/>`;
    if (kind === 'shut') return `<path d="M${cx - 15} ${cy - 1} Q${cx} ${cy + 8} ${cx + 15} ${cy - 1}" fill="none" stroke="${LASH}" stroke-width="4" stroke-linecap="round"/>`;

    const wide = kind === 'wide';
    const rx = wide ? 9 : 11.5, ry = wide ? 11 : 14;
    let ix = cx, iy = cy + 1;
    if (kind === 'down') iy = cy + 4;
    if (kind === 'away') { ix = cx - 5; iy = cy + 3; }
    const sclera = `M${cx - 17} ${cy} C${cx - 12} ${cy - 15} ${cx + 12} ${cy - 15} ${cx + 17} ${cy - 2} C${cx + 12} ${cy + 15} ${cx - 12} ${cy + 15} ${cx - 17} ${cy} Z`;
    const clip = `clip-${uid}-${side}`;
    const grad = `iris-${uid}`;
    const hollow = kind === 'hollow';
    let s = `<clipPath id="${clip}"><path d="${sclera}"/></clipPath>`;
    s += `<path d="${sclera}" fill="#fff"/>`;
    s += `<g clip-path="url(#${clip})">`;
    s += `<ellipse cx="${ix}" cy="${iy}" rx="${rx}" ry="${ry}" fill="url(#${grad})"/>`;
    s += `<ellipse cx="${ix}" cy="${iy + 2}" rx="${hollow ? 3 : 5}" ry="${hollow ? 4 : 7}" fill="${c.eye[2]}"/>`;
    if (!hollow) {
      s += `<circle cx="${ix - 4}" cy="${iy - 5}" r="${wide ? 2.6 : 3.8}" fill="#fff"/>`;
      s += `<circle cx="${ix + 4}" cy="${iy + 6}" r="1.6" fill="#fff" opacity=".85"/>`;
    }
    s += `<path d="M${cx - 18} ${cy - 13} L${cx + 18} ${cy - 13} L${cx + 18} ${cy - 5} Q${cx} ${cy - 11} ${cx - 18} ${cy - 5} Z" fill="${LASH}" opacity=".18"/>`;
    s += `</g>`;
    if (kind === 'half' || kind === 'down' || kind === 'away') {
      const lidY = kind === 'half' ? -3 : -5;
      s += `<path d="M${cx - 21} ${cy - 18} L${cx + 21} ${cy - 18} L${cx + 21} ${cy + lidY + 1} C${cx + 12} ${cy + lidY - 4} ${cx - 12} ${cy + lidY - 4} ${cx - 21} ${cy + lidY + 1} Z" fill="${c.skin}"/>`;
      s += `<path d="M${cx - 19} ${cy + lidY + 2} C${cx - 12} ${cy + lidY - 4} ${cx + 12} ${cy + lidY - 4} ${cx + 19} ${cy + lidY}" fill="none" stroke="${LASH}" stroke-width="4.5" stroke-linecap="round"/>`;
    } else {
      s += `<path d="${lashPath}" fill="none" stroke="${LASH}" stroke-width="${wide ? 3.6 : 4.5}" stroke-linecap="round"/>`;
    }
    s += `<path d="${flick}" stroke="${LASH}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 9} ${cy + 12} Q${cx} ${cy + 15} ${cx + 9} ${cy + 11}" fill="none" stroke="${LASH}" stroke-width="1.4" opacity=".5"/>`;
    return s;
  }

  function brow(cx, cy, side, kind, color) {
    const L = side === 'L';
    const ox = L ? cx - 16 : cx + 16;   // outer end
    const ix = L ? cx + 14 : cx - 14;   // inner end
    let oy = cy - 30, iy = cy - 31, my = cy - 36;
    switch (kind) {
      case 'angry': iy += 9; oy -= 2; my = cy - 33; break;
      case 'sad': iy -= 6; oy += 4; my = cy - 35; break;
      case 'soft': iy -= 3; oy += 2; break;
      case 'raised': iy -= 6; oy -= 5; my -= 7; break;
      case 'up': iy -= 3; oy -= 3; my -= 4; break;
      case 'flat': iy += 3; my = cy - 32; break;
      case 'smug': if (!L) { iy -= 5; oy -= 7; my -= 7; } else { iy += 3; } break;
      default: break;
    }
    return `<path d="M${ox} ${oy} Q${cx} ${my} ${ix} ${iy}" fill="none" stroke="${color}" stroke-width="3.6" stroke-linecap="round"/>`;
  }

  function mouth(kind) {
    switch (kind) {
      case 'smile': return `<path d="M186 264 Q200 276 214 264" fill="none" stroke="${MOUTH}" stroke-width="2.8" stroke-linecap="round"/>`;
      case 'grin': return `<path d="M185 262 Q200 282 215 262 Z" fill="${MOUTH}"/><path d="M190 270 Q200 277 210 270" fill="#f08fa6"/>`;
      case 'smirk': return `<path d="M189 269 Q204 271 214 260" fill="none" stroke="${MOUTH}" stroke-width="2.8" stroke-linecap="round"/>`;
      case 'tight': return `<path d="M193 268 L207 268" stroke="${MOUTH}" stroke-width="2.6" stroke-linecap="round"/>`;
      case 'frown': return `<path d="M189 271 Q200 263 211 271" fill="none" stroke="${MOUTH}" stroke-width="3" stroke-linecap="round"/>`;
      case 'sad': return `<path d="M190 272 Q200 265 210 272" fill="none" stroke="${MOUTH}" stroke-width="2.6" stroke-linecap="round"/>`;
      case 'tremble': return `<path d="M189 269 Q194 264 199 269 Q204 274 211 268" fill="none" stroke="${MOUTH}" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'open': return `<ellipse cx="200" cy="269" rx="6" ry="8" fill="${MOUTH}"/>`;
      case 'small': return `<path d="M194 267 Q200 271 206 267" fill="none" stroke="${MOUTH}" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'wide': return `<path d="M180 260 Q200 290 220 260 Q200 270 180 260 Z" fill="${MOUTH}"/>`;
      default: return `<path d="M193 268 Q200 270 207 268" fill="none" stroke="${MOUTH}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
  }

  function hairBack(c) {
    if (c.style === 'long') {
      return `<path d="M122 172 C104 262 100 362 92 470 C104 486 118 482 128 496 C142 480 156 470 162 452 C152 400 150 330 160 300 L240 300 C250 330 248 400 238 452 C244 470 258 480 272 496 C282 482 296 486 308 470 C300 362 296 262 278 172 C274 112 240 80 200 80 C160 80 126 112 122 172 Z" fill="url(#hair-${c.id})"/>`;
    }
    if (c.style === 'ponytail') {
      return `<path d="M252 104 C300 66 346 116 338 202 C332 282 352 352 326 438 C312 400 296 340 296 280 C296 210 288 150 258 122 Z" fill="url(#hair-${c.id})"/>`
        + `<path d="M128 182 C126 115 160 86 200 86 C240 86 274 115 272 182 L270 236 L130 236 Z" fill="url(#hair-${c.id})"/>`;
    }
    return `<path d="M124 182 C120 112 160 84 200 84 C240 84 280 112 276 182 C281 232 286 280 272 306 L128 306 C114 280 119 232 124 182 Z" fill="url(#hair-${c.id})"/>`;
  }

  function hairFront(c) {
    const fill = `url(#hair-${c.id})`;
    const stroke = c.hair[2];
    if (c.style === 'long') {
      return `<path d="M128 196 C122 120 160 84 205 84 C250 86 280 122 274 200 C266 172 258 152 246 140 C244 168 236 188 226 198 C222 172 214 152 206 142 C196 170 182 184 164 194 C166 170 168 154 172 142 C158 162 146 184 140 216 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
        + `<path d="M136 184 C124 244 128 304 118 372 C134 360 146 326 150 292 C148 252 144 216 142 192 Z" fill="${fill}"/>`
        + `<path d="M264 184 C276 244 272 304 282 372 C266 360 254 326 250 292 C252 252 256 216 258 192 Z" fill="${fill}"/>`;
    }
    if (c.style === 'ponytail') {
      return `<path d="M130 198 C126 120 162 88 200 88 C238 88 274 120 270 198 L261 190 L253 160 L241 188 L229 150 L215 186 L200 152 L186 186 L172 150 L160 188 L148 160 L139 194 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
        + `<path d="M134 188 C127 232 131 272 140 306 C147 284 149 244 147 202 Z" fill="${fill}"/>`
        + `<path d="M266 188 C273 232 269 272 260 306 C253 284 251 244 253 202 Z" fill="${fill}"/>`
        + `<ellipse cx="258" cy="104" rx="12" ry="9" fill="${c.ribbonDark}"/><circle cx="258" cy="104" r="4" fill="#fff" opacity=".7"/>`;
    }
    return `<path d="M130 196 C128 118 162 88 200 88 C238 88 272 118 270 196 C250 184 230 180 200 180 C170 180 150 184 130 196 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
      + `<path d="M130 190 C122 232 126 282 138 304 C150 294 152 252 150 202 Z" fill="${fill}"/>`
      + `<path d="M270 190 C278 232 274 282 262 304 C250 294 248 252 250 202 Z" fill="${fill}"/>`;
  }

  function accessory(c, acc) {
    if (acc === 'clip') {
      // the star hair clip Hikaru bought
      return `<g transform="translate(150 150) rotate(-14)"><path d="M0 -13 L4 -4 L13 -4 L6 2 L9 11 L0 6 L-9 11 L-6 2 L-13 -4 L-4 -4 Z" fill="#ffd0e2" stroke="#d9668f" stroke-width="2"/></g>`;
    }
    return '';
  }

  let counter = 0;
  function svg(who, exprName = 'neutral', acc = '') {
    const base = CHARS[who];
    if (!base) return '';
    const c = Object.assign({ id: who + (++counter) }, base);
    const e = EXPR[exprName] || EXPR.neutral;
    const uid = c.id;
    const defs = `<defs>
      <linearGradient id="hair-${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.hair[0]}"/><stop offset=".45" stop-color="${c.hair[1]}"/><stop offset="1" stop-color="${c.hair[2]}"/></linearGradient>
      <radialGradient id="iris-${uid}" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="${c.eye[1]}"/><stop offset=".7" stop-color="${c.eye[0]}"/><stop offset="1" stop-color="${c.eye[1]}"/></radialGradient>
      <linearGradient id="blazer-${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4670"/><stop offset="1" stop-color="#252c48"/></linearGradient>
    </defs>`;

    const body = `<path d="M66 640 C70 470 108 394 168 370 L200 424 L232 370 C292 394 330 470 334 640 Z" fill="url(#blazer-${c.id})"/>
      <path d="M168 370 L200 474 L192 640 M232 370 L200 474" fill="none" stroke="#1b2138" stroke-width="2" opacity=".6"/>
      <path d="M168 370 L200 424 L232 370 L219 340 Q200 352 181 340 Z" fill="#fbfaff"/>
      <path d="M168 370 L184 344 L200 386 Z M232 370 L216 344 L200 386 Z" fill="#fff" stroke="#d9d3e6" stroke-width="1.5"/>
      <g>
        <path d="M200 396 L171 381 L175 409 Z" fill="${c.ribbon}" stroke="${c.ribbonDark}" stroke-width="1.5"/>
        <path d="M200 396 L229 381 L225 409 Z" fill="${c.ribbon}" stroke="${c.ribbonDark}" stroke-width="1.5"/>
        <path d="M196 400 L187 438 L198 430 Z M204 400 L213 438 L202 430 Z" fill="${c.ribbonDark}"/>
        <circle cx="200" cy="397" r="7" fill="${c.ribbonDark}"/>
      </g>
      <circle cx="262" cy="468" r="9" fill="none" stroke="#c9b37a" stroke-width="2"/><path d="M262 461 l2.4 5 5.4 .6 -4 3.6 1 5.4 -4.8 -2.8 -4.8 2.8 1 -5.4 -4 -3.6 5.4 -.6 Z" fill="#c9b37a"/>`;

    const neck = `<path d="M182 286 L182 342 Q200 354 218 342 L218 286 Z" fill="${c.skinShade}"/>`;
    const face = `<path d="M132 182 C132 248 160 292 200 306 C240 292 268 248 268 182 C268 122 236 98 200 98 C164 98 132 122 132 182 Z" fill="${c.skin}"/>
      <path d="M140 176 Q200 196 260 176 L260 196 Q200 214 140 196 Z" fill="${c.hair[2]}" opacity=".13"/>`;

    const eyes = eye(170, 214, 'L', e.eyes, c, uid) + eye(230, 214, 'R', e.eyes, c, uid);
    const brows = brow(170, 214, 'L', e.brows, c.hair[2]) + brow(230, 214, 'R', e.brows, c.hair[2]);
    const blush = e.blush ? `<ellipse cx="160" cy="246" rx="16" ry="6.5" fill="#ff8fb0" opacity="${e.blush}"/><ellipse cx="240" cy="246" rx="16" ry="6.5" fill="#ff8fb0" opacity="${e.blush}"/>` : '';
    const nose = `<path d="M200 240 Q203 245 199 248" fill="none" stroke="${c.skinShade}" stroke-width="2" stroke-linecap="round"/>`;
    const tears = e.tears ? `<path d="M150 224 Q146 238 150 246 Q156 238 150 224 Z M250 224 Q246 238 250 246 Q256 238 250 224 Z" fill="#bfe2ff" opacity=".9"/>` : '';
    const glasses = c.glasses ? `<g fill="none" stroke="#6b5a8a" stroke-width="3"><rect x="148" y="196" width="44" height="36" rx="14"/><rect x="208" y="196" width="44" height="36" rx="14"/><path d="M192 210 Q200 205 208 210"/></g><path d="M156 202 L166 200" stroke="#fff" stroke-width="2.5" opacity=".8" stroke-linecap="round"/>` : '';

    const faceParts = `<g class="face">${blush}${eyes}${brows}${nose}${mouth(e.mouth)}${tears}</g>`;
    const head = `<g transform="translate(200 300) scale(1.1) translate(-200 -300)">${face}${faceParts}${hairFront(c)}${glasses}${accessory(c, acc)}</g>`;
    const back = `<g transform="translate(200 300) scale(1.1) translate(-200 -300)">${hairBack(c)}</g>`;
    return `<svg viewBox="0 0 400 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${who} (${exprName})">${defs}${back}${body}${neck}${head}</svg>`;
  }

  const STAR = '<path d="M0 -13 L4 -4 L13 -4 L6 2 L9 11 L0 6 L-9 11 L-6 2 L-13 -4 L-4 -4 Z" fill="#ffd0e2" stroke="#d9668f" stroke-width="2"/>';

  function html(who, expr, acc) {
    const a = ART[real(who)];
    if (a) {
      const name = real(who)[0].toUpperCase() + real(who).slice(1);
      const clip = acc === 'clip' && a.clip
        ? `<svg class="acc-clip" viewBox="-15 -15 30 30" style="left:${a.clip.x}%;top:${a.clip.y}%" aria-hidden="true">${STAR}</svg>` : '';
      return `<div class="pose"><img class="art" src="${srcFor(who, expr)}" alt="${name}" draggable="false">${clip}</div>`;
    }
    return svg(real(who), expr, acc);
  }
  function srcFor(who, expr) {
    const a = ART[real(who)];
    if (!a) return null;
    return a.alt && a.alt.exprs.includes(expr) ? a.alt.src : a.src;
  }
  const art = (who) => ART[real(who)] || null;
  const face = (who) => (ART[real(who)] ? ART[real(who)].face : null);

  return { html, svg, art, face, srcFor, EXPRESSIONS, CHARS: Object.keys(CHARS).concat(Object.keys(ALIAS)) };
})();
