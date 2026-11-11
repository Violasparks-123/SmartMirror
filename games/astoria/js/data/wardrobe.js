// Cosmetics for Astoria. Dresses re-grade the portrait's palette (prototype stand-in for
// fully re-illustrated outfits); hair, accessory and jewellery pieces are drawn as
// overlays onto the artwork itself. `source` explains how each is obtained.

export const SLOTS = [
  { id: 'dress', name: 'Dresses' },
  { id: 'hair', name: 'Hairstyles' },
  { id: 'accessory', name: 'Accessories' },
  { id: 'jewellery', name: 'Jewellery' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'makeup', name: 'Makeup' },
];

export const COLLECTIONS = {
  gothic: 'Gothic Aristocracy',
  royal: 'Royal Fashion',
  masquerade: 'Masquerade',
  academia: 'Dark Academia',
  cathedral: 'Cathedral Attire',
  forest: 'Forest Exploration',
};

export const COSMETICS = {
  // dresses
  eclipse_gown: { slot: 'dress', name: 'Eclipse Gown', col: 'gothic', source: 'Worn when you woke', grade: 'none', desc: 'Black lace, black ribbon, silver at the throat. The dress you woke in.' },
  royal_violet: { slot: 'dress', name: 'Court Violet', col: 'royal', price: 600, grade: 'royal', desc: 'Deep court violet with antique-gold trim, cut in the palace fashion.' },
  academia_coat: { slot: 'dress', name: 'Archivist\'s Coat', col: 'academia', price: 450, grade: 'academia', desc: 'A long scholar\'s coat in ink-brown and black, smelling faintly of old paper.' },
  cathedral_vestment: { slot: 'dress', name: 'Keeper\'s Vestment', col: 'cathedral', source: 'Reward: The Silent Bell', grade: 'cathedral', desc: 'Grey-silver keeper\'s robes, a gift from Seraphine.' },
  forest_cloak: { slot: 'dress', name: 'Wayfarer\'s Cloak', col: 'forest', price: 400, grade: 'forest', desc: 'A hooded cloak in moss-dark velvet for the Whispering Woods.' },
  midnight_rose: { slot: 'dress', name: 'Midnight Rose Gown', col: 'gothic', price: 900, grade: 'none', desc: 'Black layered lace scattered with violet roses. For those who dream in darkness.' },
  crimson_masque: { slot: 'dress', name: 'Crimson Masque', col: 'masquerade', price: 700, grade: 'royal', desc: 'Wine-dark red and black, laced tight. Nobody forgets who wore it.' },
  frost_lace: { slot: 'dress', name: 'Frost Lace', col: 'royal', price: 650, grade: 'cathedral', desc: 'Pale winter blue, frill upon frill. Cold to look at, kind to wear.' },
  lilac_dream: { slot: 'dress', name: 'Lilac Dream', col: 'royal', price: 650, grade: 'gala', desc: 'Soft lilac with bows at every turn. Evelyne says it is "almost too much". She means it as praise.' },
  rose_blush: { slot: 'dress', name: 'Rose Blush', col: 'royal', price: 600, grade: 'royal', desc: 'Pastel pink and white ruffles. Unthinkable in a cathedral. Perfect at a picnic.' },
  ivory_requiem: { slot: 'dress', name: 'Ivory Requiem', col: 'cathedral', price: 800, grade: 'cathedral', desc: 'Cream and white, high at the throat. Mourning clothes for someone you cannot remember.' },
  gala_gown: { slot: 'dress', name: 'Moonlit Gala Gown', col: 'masquerade', source: 'Moonlit Gala reward', grade: 'gala', desc: 'Midnight tulle scattered with silver — the gala\'s finest.' },

  // hair
  loose_ribbon: { slot: 'hair', name: 'Loose with Black Ribbon', col: 'gothic', source: 'Default', overlay: null, desc: 'Long and loose, a black ribbon bow at the crown.' },
  silver_circlet: { slot: 'hair', name: 'Silver Circlet', col: 'royal', price: 350, overlay: 'circlet', desc: 'A fine circlet worn across the brow, crescent at the centre.' },
  rose_comb: { slot: 'hair', name: 'Grey Rose Comb', col: 'gothic', source: 'Summoning', overlay: 'rosecomb', desc: 'A hair comb set with a single grey rose.' },
  braided_crown: { slot: 'hair', name: 'Braided Crown', col: 'royal', price: 300, overlay: null, desc: 'A crown of braids with loose strands falling free.' },
  twin_tails: { slot: 'hair', name: 'Twin Ribbons', col: 'gothic', price: 260, overlay: null, desc: 'Two low tails tied with black bows.' },
  wavy_bob: { slot: 'hair', name: 'Soft Wavy Bob', col: 'academia', price: 240, overlay: null, desc: 'Short and soft, practical for archive dust.' },
  half_up_bow: { slot: 'hair', name: 'Half-Up with Bow', col: 'masquerade', price: 380, overlay: null, desc: 'Half up beneath a large black bow and a violet rose.' },
  lace_veil: { slot: 'hair', name: 'Cathedral Lace Veil', col: 'cathedral', price: 300, overlay: 'veil', desc: 'A gossamer veil of violet-black lace.' },

  // accessory
  none: { slot: 'accessory', name: 'None', col: 'gothic', source: 'Default', overlay: null, desc: 'Nothing at all.' },
  masquerade_mask: { slot: 'accessory', name: 'Silver Masquerade Mask', col: 'masquerade', source: 'Moonlit Gala reward', overlay: 'mask', desc: 'Filigree silver set with tiny pearls.' },
  lace_choker: { slot: 'accessory', name: 'Lace Choker', col: 'gothic', price: 220, overlay: 'choker', desc: 'Black lace with a single amethyst drop.' },
  scholar_spectacles: { slot: 'accessory', name: 'Scholar\'s Spectacles', col: 'academia', price: 180, overlay: 'spectacles', desc: 'Round silver spectacles. Purely decorative. Mostly.' },

  // jewellery
  silver_crescent: { slot: 'jewellery', name: 'Silver Crescent Earrings', col: 'gothic', source: 'Default', overlay: null, desc: 'Small crescents that catch the moonlight.' },
  amethyst_brooch: { slot: 'jewellery', name: 'Amethyst Brooch', col: 'royal', price: 380, overlay: 'brooch', desc: 'A deep amethyst set in antique gold.' },
  gala_star: { slot: 'jewellery', name: 'Star of the Gala', col: 'masquerade', source: 'Moonlit Gala reward', overlay: 'star', desc: 'A silver eight-pointed star with a violet heart.' },

  // shoes (not visible in the portrait framing)
  velvet_heels: { slot: 'shoes', name: 'Velvet Heels', col: 'gothic', source: 'Default', desc: 'Black velvet, silver buckles.' },
  forest_boots: { slot: 'shoes', name: 'Forest Boots', col: 'forest', price: 160, desc: 'Laced boots that do not mind mud.' },
  mary_janes: { slot: 'shoes', name: 'Black Mary Janes', col: 'gothic', price: 180, desc: 'Glossy black, one strap, a small jewelled bow.' },
  lace_heels: { slot: 'shoes', name: 'Lace Heels', col: 'masquerade', price: 240, desc: 'Black lace to the ankle and a single violet rose.' },
  ankle_chains: { slot: 'shoes', name: 'Moon Ankle Chains', col: 'cathedral', price: 220, desc: 'Fine silver chains with crescent charms. Better barefoot.' },
  ballroom_slippers: { slot: 'shoes', name: 'Ballroom Slippers', col: 'masquerade', price: 200, desc: 'Silver silk, made for waltzing.' },

  // makeup
  natural: { slot: 'makeup', name: 'Moonlit Natural', col: 'gothic', source: 'Default', tone: 'none', desc: 'Pale and a little melancholy.' },
  rose_tint: { slot: 'makeup', name: 'Muted Rose', col: 'royal', price: 120, tone: 'rose', desc: 'A soft rose warmth on lips and cheeks.' },
  violet_smoke: { slot: 'makeup', name: 'Violet Smoke', col: 'masquerade', price: 150, tone: 'smoke', desc: 'Smoky violet shadow, dramatic and cool.' },
};

// Palette treatments for the portrait (prototype stand-in for redrawn outfits).
export const GRADES = {
  none: '',
  royal: 'saturate(1.25) hue-rotate(-12deg) contrast(1.05)',
  academia: 'sepia(0.35) saturate(0.85) hue-rotate(-20deg) contrast(1.05)',
  cathedral: 'saturate(0.55) brightness(1.08) contrast(1.02)',
  forest: 'hue-rotate(-55deg) saturate(0.8) brightness(0.95)',
  gala: 'saturate(1.35) brightness(1.06) contrast(1.08)',
};

export const TONES = { none: '', rose: 'rgba(214,120,150,0.13)', smoke: 'rgba(90,40,140,0.16)' };
