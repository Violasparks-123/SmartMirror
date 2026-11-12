// Moonlit Manor — art slots. Pictures you add in the game are saved in this browser (IndexedDB).
// To build art in permanently, put a file in assets/ and list it under BUILT_IN below.
window.ART = (() => {
  // Slots matching the prompt pack. cut = remove white background by default.
  const SLOTS = [
    { id: "npc-rosalind", name: "Rosalind", group: "Characters", cut: true },
    { id: "npc-steward", name: "The Steward", group: "Characters", cut: true },
    { id: "npc-masked", name: "The Masked Guest", group: "Characters", cut: true },
    { id: "npc-luna", name: "Luna the cat", group: "Characters", cut: true },
    { id: "outfit-ballgown", name: "Royal Ball Gown", group: "Outfits", cut: true },
    { id: "outfit-pajamas", name: "Starry Pajamas", group: "Outfits", cut: true },
    { id: "outfit-picnic", name: "Garden Picnic Dress", group: "Outfits", cut: true },
    { id: "outfit-rain", name: "Rainy Day Set", group: "Outfits", cut: true },
    { id: "outfit-witch", name: "Moon Witch", group: "Outfits", cut: true },
    { id: "cg-tower-light", name: "The light in the tower", group: "Story scenes", cut: false },
    { id: "cg-hidden-key", name: "The hidden key", group: "Story scenes", cut: false },
    { id: "cg-masked-guest", name: "The masked guest", group: "Story scenes", cut: false },
    { id: "cg-getting-ready", name: "Getting ready", group: "Story scenes", cut: false },
    { id: "cg-reveal", name: "The big reveal", group: "Story scenes", cut: false },
    { id: "cg-dance", name: "Dancing under the moon", group: "Story scenes", cut: false },
    { id: "item-musicbox", name: "Silver Music Box", group: "Treasures", cut: true },
    { id: "item-key", name: "Moonlight Key", group: "Treasures", cut: true },
    { id: "item-lantern", name: "Star Lantern", group: "Treasures", cut: true },
    { id: "item-teacup", name: "Rose Teacup", group: "Treasures", cut: true },
    { id: "bg-tower", name: "Inside the Moonlit Tower", group: "Places", cut: false },
    { id: "bg-greenhouse", name: "The Glass Greenhouse", group: "Places", cut: false },
  ];
  // e.g. { "npc-rosalind": { src: "assets/npc-rosalind.webp" } }
  const BUILT_IN = {};

  const urls = {}, meta = {};
  let db = null;
  const req = (r) => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });

  async function init() {
    for (const [id, v] of Object.entries(BUILT_IN)) { urls[id] = v.src; meta[id] = v.meta || {}; }
    try {
      const open = indexedDB.open("moonlit-art", 1);
      open.onupgradeneeded = () => open.result.createObjectStore("slots");
      db = await req(open);
      const tx = db.transaction("slots").objectStore("slots");
      const keys = await req(tx.getAllKeys()), vals = await req(tx.getAll());
      keys.forEach((k, i) => { urls[k] = URL.createObjectURL(vals[i].blob); meta[k] = vals[i].meta || {}; });
    } catch (e) { db = null; }
  }
  async function put(id, blob, m) {
    if (urls[id] && urls[id].startsWith("blob:")) URL.revokeObjectURL(urls[id]);
    urls[id] = URL.createObjectURL(blob); meta[id] = m || {};
    if (db) try { await req(db.transaction("slots", "readwrite").objectStore("slots").put({ blob, meta: m }, id)); } catch (e) { return false; }
    return !!db;
  }
  async function setMeta(id, m) {
    meta[id] = m;
    if (!db) return;
    try {
      const st = db.transaction("slots", "readwrite").objectStore("slots");
      const v = await req(st.get(id)); if (v) { v.meta = m; await req(st.put(v, id)); }
    } catch (e) {}
  }
  async function remove(id) {
    if (urls[id] && urls[id].startsWith("blob:")) URL.revokeObjectURL(urls[id]);
    delete urls[id]; delete meta[id];
    if (BUILT_IN[id]) { urls[id] = BUILT_IN[id].src; meta[id] = BUILT_IN[id].meta || {}; }
    if (db) try { await req(db.transaction("slots", "readwrite").objectStore("slots").delete(id)); } catch (e) {}
  }

  // Load a file, optionally remove the white background (flood fill from the edges), trim and shrink.
  function process(file, cut, maxSide = 1200) {
    return new Promise((ok, no) => {
      const img = new Image();
      img.onload = () => {
        const sc = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * sc), h = Math.round(img.height * sc);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
        let box = { x: 0, y: 0, w, h };
        if (cut) {
          const d = x.getImageData(0, 0, w, h), p = d.data;
          const white = (i) => p[i] > 226 && p[i + 1] > 226 && p[i + 2] > 226 && Math.max(p[i], p[i + 1], p[i + 2]) - Math.min(p[i], p[i + 1], p[i + 2]) < 26;
          const seen = new Uint8Array(w * h), q = new Int32Array(w * h); let qh = 0, qt = 0;
          const push = (n) => { if (!seen[n] && white(n * 4)) { seen[n] = 1; q[qt++] = n; } };
          for (let i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
          for (let j = 0; j < h; j++) { push(j * w); push(j * w + w - 1); }
          while (qh < qt) {
            const n = q[qh++], cx = n % w, cy = (n / w) | 0;
            p[n * 4 + 3] = 0;
            if (cx > 0) push(n - 1); if (cx < w - 1) push(n + 1); if (cy > 0) push(n - w); if (cy < h - 1) push(n + w);
          }
          // soften the edge: pale pixels touching the removed area become half see-through
          for (let n = 0; n < w * h; n++) {
            if (seen[n]) continue;
            const cx = n % w, cy = (n / w) | 0;
            const near = (cx > 0 && seen[n - 1]) || (cx < w - 1 && seen[n + 1]) || (cy > 0 && seen[n - w]) || (cy < h - 1 && seen[n + w]);
            if (near) { const i = n * 4, b = (p[i] + p[i + 1] + p[i + 2]) / 3; if (b > 200) p[i + 3] = 110; }
          }
          x.putImageData(d, 0, 0);
          let x0 = w, y0 = h, x1 = 0, y1 = 0;
          for (let n = 0; n < w * h; n++) if (p[n * 4 + 3] > 20) { const cx = n % w, cy = (n / w) | 0; if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy; }
          if (x1 > x0 && y1 > y0) box = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
        }
        const o = document.createElement("canvas"); o.width = box.w; o.height = box.h;
        o.getContext("2d").drawImage(c, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
        o.toBlob((b) => (b ? ok(b) : no(new Error("Could not read that picture."))), cut ? "image/png" : "image/webp", 0.9);
      };
      img.onerror = () => no(new Error("That file isn't a picture this browser can open. Try a PNG or JPG."));
      img.src = URL.createObjectURL(file);
    });
  }

  return {
    SLOTS, init, put, remove, process, setMeta,
    get: (id) => urls[id] || null,
    meta: (id) => meta[id] || {},
    has: (id) => !!urls[id],
    stored: () => !!db,
    slot: (id) => SLOTS.find((s) => s.id === id),
  };
})();
