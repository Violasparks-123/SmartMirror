/* THE WARDROBE: every item in the Saturday fitting, made from the creator's reference images.
   h = how much Haruka likes wearing it, k = how much Hikaru likes wearing it (−2 … 3).
   hr / kr = what each twin says when you put it on her. */
DL.Wardrobe = (() => {
  const CATS = [
    { id: 'look', name: 'Look', jp: 'コーデ' },
    { id: 'hair', name: 'Hair', jp: 'ヘア' },
    { id: 'makeup', name: 'Makeup', jp: 'メイク' },
    { id: 'bag', name: 'Bag', jp: 'バッグ' },
  ];

  const I = (id, cat, name, desc, h, k, hr, kr) => ({ id, cat, name, desc, h, k, hr, kr, img: `assets/wardrobe/${id}.webp` });

  const ITEMS = [
    // ---- Looks (whole outfits) ----
    I('look_y2k', 'look', 'Babe Velour', 'Black zip hoodie, pink fold-over flares, rhinestone sunglasses, leopard heart earrings', 3, -2,
      'Black and pink and *leopard earrings*? Okay. You’re allowed to live.',
      'I’d look like her shadow.'),
    I('look_bambi', 'look', 'Fawn & Denim', 'Off-shoulder fawn top, denim mini, slouchy suede boots, studded belt', 2, 0,
      'Very rich girl at the mall. I can work with it.',
      'It’s nice. It’s just… not mine.'),
    I('look_snow', 'look', 'Snow Fawn', 'Cream fur-hood parka, fawn cami, lace shorts, leg warmers, moon boots', 0, 3,
      'I’d look like a marshmallow. A *beige* marshmallow.',
      'It’s soft. Like a quiet morning. …I like it.'),
    I('look_vanilla', 'look', 'Vanilla Library', 'Polka-dot top, pleated skirt, angel-wing clip, round glasses, brown sneakers', -1, 2,
      'Glasses? Do I look like Hoshino to you?',
      'The wing clip is pretty. I could draw in this.'),

    // ---- Hair ----
    I('hair_leopard', 'hair', 'Pink Leopard', 'Pink and cream leopard-print colour', 3, -2,
      'LEOPARD. In my HAIR. Iconic. Legendary. *Mine.*',
      'That’s… Haruka’s whole personality.'),
    I('hair_berry', 'hair', 'Berry Mint', 'Berry pink with mint streaks', 2, 0,
      'Berry pink with little mint bits. Loud enough.',
      'The mint is nice. The rest is very pink.'),
    I('hair_lilac', 'hair', 'Lilac Drills', 'Lilac princess curls', 2, 1,
      'Princess curls. Obviously I’m the princess.',
      'Like a doll. A nice doll, at least.'),
    I('hair_jelly', 'hair', 'Jellyfish Pearls', 'Lilac bob with strings of pearls', 0, 2,
      'Why would I dress up as a jellyfish.',
      'Pearls that move like water. It’s dreamy.'),
    I('hair_bluestreak', 'hair', 'Blue Streak', 'Soft layers with bright blue streaks', -2, 3,
      'Blue. Of course. How brave.',
      'A blue streak, like a train going past. That’s me.'),
    I('hair_crystal', 'hair', 'Crystal Veil', 'Black hime cut under chains of crystals', 1, 2,
      'Dramatic. A bit much. I respect it.',
      'It catches the light. Like stars.'),

    // ---- Makeup ----
    I('mk_leopard', 'makeup', 'Leopard Kiss', 'Leopard liner and dark glitter lips', 3, -2,
      'Leopard eyeliner and dark lips. I look *dangerous*.',
      'I’d look like I’m about to bite someone.'),
    I('mk_stars', 'makeup', 'Starlight Tears', 'Glitter stars under the eyes, glossy lips', 2, 0,
      'Sparkly. Everyone will be looking at my face. Good.',
      '…It looks like crying. Glittery crying.'),
    I('mk_galaxy', 'makeup', 'Galaxy', 'Purple and blue glitter like a night sky', 1, 2,
      'Purple glitter? Fine. It’s giving night sky.',
      'It looks like the sky over the platform.'),
    I('mk_mint', 'makeup', 'Mint Dots', 'Mint shadow with tiny black polka dots', 1, 1,
      'Polka dots. Cute, I guess.',
      'Little dots. Like a pattern in a sketchbook.'),
    I('mk_frost', 'makeup', 'Frost Lily', 'Icy blue and silver glitter', -1, 3,
      'Icy blue? I’m not a freezer.',
      'Blue glitter. Cold, but pretty. I feel brave in this.'),
    I('mk_music', 'makeup', 'Sheet Music', 'Music notes and piano keys drawn around the eyes', -2, 3,
      'Music notes on your *face*. Nerd.',
      'Music notes… how did you know? I draw them in all my margins.'),

    // ---- Bags ----
    I('bag_treasure', 'bag', 'Treasure Box', 'Tiny pink bag dripping with flowers and beads', 3, -1,
      'Tiny, pink, covered in flowers. It’s me in bag form.',
      'It’s so loud. It *jingles*.'),
    I('bag_cherry', 'bag', 'Cherry Bloom', 'Pink rose print with glitter cherries', 2, 0,
      'Pink roses and glitter cherries. Approved.',
      'Pretty. Very pink.'),
    I('bag_velour', 'bag', 'Velour Hello', 'Cream velour with a pink phone charm', 2, 1,
      'Velour and a phone charm. Cute.',
      'The little phone charm is sweet.'),
    I('bag_sky', 'bag', 'Sky Ribbon', 'Baby blue with a big pink satin bow', 1, 3,
      'Baby blue? …With a pink bow. Hm. I’ll allow it.',
      'Blue with a pink bow. Like both of us.'),
  ];
  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

  // How matching pieces change each twin's mood (index = number of pieces they share).
  const MATCH_H = [-3, 3, 4, 5, 6];   // Haruka wants to match
  const MATCH_K = [0, 1, -3, -7, -10]; // Hikaru can take one shared piece, no more

  const PASS = 5;      // below this, the fitting fails
  const PERFECT = 10;  // both twins at or above this = perfect
  const TIME = 180;    // seconds until the matsuri

  // What Haruka does to you if it goes wrong
  const DOLL = ['look_y2k', 'hair_leopard', 'mk_leopard', 'bag_treasure'];

  return { CATS, ITEMS, byId, MATCH_H, MATCH_K, PASS, PERFECT, TIME, DOLL };
})();
