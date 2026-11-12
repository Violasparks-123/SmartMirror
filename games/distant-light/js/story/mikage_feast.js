/* THE MIKAGES' KITCHEN. More of what the Mikage siblings cook, and who.
   - Day 5 morning: a bento on your desk, "from the council".
   - Walking home (day 5+): a pole covered in MISSING posters. The last one is blank, with today's date.
   - New after-school place: the Home ec room. Something has been simmering for three days.
   - Council room (day 5+): Rei's recipe notebook. Every recipe has a person's name.
   - Appetite: the bun, the bento and the broth each count. Eat all three and the final choice
     gets a new dark ending: Second Helpings.
   Loaded after mikage_apart.js. */
(() => {
  const { scene, bg, show, hide, hideAll, n, H, K, REI, SEI, me, opt, choice, add, flag, iff, go, call, js, sfx, music, fx, diary, ending, f } = DL.DSL;
  const notD7 = (s) => s.day !== 7;
  const eat = js((s) => { s.flags.appetite = (s.flags.appetite || 0) + 1; });
  const red = fx('tint', { kind: 'red' });
  const restore = js((s) => { DL.FX.tint(s.day === 7 || (s.day === 8 && !s.flags.hikaruBack) ? 'pink' : null); });
  const insertAt = (pool, ev, at) => { const k = at != null ? at : pool.findIndex((e) => e.repeat); pool.splice(k < 0 ? pool.length : k, 0, ev); };
  function appendTo(id, cmds) {
    const list = DL.Engine.scenes[id]; const tail = list[list.length - 1];
    list.splice(tail && tail.t === 'goto' ? list.length - 1 : list.length, 0, ...cmds);
  }

  // The council-room bun already counts towards your appetite
  { const cou1 = DL.Events.council.find((e) => e.id === 'cou_1');
    const walk = (list) => list.forEach((c) => {
      if (c && c.t === 'flag' && c.name === 'ateBun') { const i = list.indexOf(c); list.splice(i + 1, 0, eat); }
      if (c && c.opts) c.opts.forEach((o) => walk(o.body));
    });
    if (cou1) walk(cou1.scene); }

  /* ---------- Day 5: a bento on your desk ---------- */
  scene('mik_bento', [
    n('When you sit down after the quiz, there’s a lunchbox on your desk. Wrapped in navy cloth, tied in a perfect bow.'),
    n('A card is tucked into the knot: for {name} ♡ from the council. eat it all.'),
    n('Inside: white rice, rolled egg, pickled plum. And very thin slices of pale pink meat, fanned out into the shape of a flower.'),
    choice('The lunchbox is still warm.',
      opt('Eat it.', [
        n('It’s tender. It’s sweet. It tastes faintly of someone else’s shampoo.'),
        n('You eat every grain of rice. You don’t remember deciding to.'),
        eat, add({ energy: 15 }), flag('ateBento'),
      ]),
      opt('Look closer.', [
        n('You lift the rice with your chopsticks.'),
        n('Underneath, pressed flat like a pressed flower, is a fingernail. Painted pastel pink. With a tiny glitter heart.'),
        n('Haruka paints her nails exactly like that. You check. Haruka has all ten.'),
        n('Somebody in this town used to have the same idea.'),
        flag('sawNail'), add({ energy: -10 }),
      ]),
      opt('Throw it away.', [
        n('You drop it in the bin by the door, cloth and all.'),
        n('At lunch, it’s back on your desk. Wrapped again. A new card: don’t waste food. someone worked very hard on it.'),
        add({ susp: 1 }),
      ]),
    ),
    diary('Someone left a bento on my desk “from the council”. The meat was cut into a flower.'),
  ]);
  appendTo('d5_morning', [iff(f('mikageMet'), [call('mik_bento')])]);

  /* ---------- Walking home: the posters ---------- */
  insertAt(DL.Events.street, { id: 'mik_posters', cond: (s) => notD7(s) && s.day >= 5 && s.flags.mikageMet, scene: [
    bg('street'), music('uneasy'),
    n('The telephone pole at the corner is covered in MISSING posters. Layers and layers of them, years deep, stapled on top of each other.'),
    n('Every one is a student from Sakuragaoka High. Every one has the same small red stamp in the corner: 生徒会 確認済. Student council: checked.'),
    n('On the newest ones, someone has cut the faces out. Neatly. With a very sharp knife. Like taking the good part off the bone.'),
    choice(
      opt('Read the newest one.', [
        n('It’s blank. No name, no photo. Just today’s date, and a space for a picture.'),
        n('Underneath, in careful handwriting: LAST SEEN walking home the long way.'),
        flag('sawPosters'), add({ susp: 1 }),
      ]),
      opt('Peel back the layers.', [
        n('Under the posters, the oldest one, yellow and soft as cloth: MIKAGE. Husband and wife. Last seen the winter their children turned nine.'),
        n('The photo has been cut out too.'),
        flag('sawPosters'), flag('sawParents'),
      ]),
      opt('Keep walking. Don’t look.', [n('Behind you, a staple gun goes off. Once. Twice. Nobody is there when you turn.')]),
    ),
    diary('A pole full of missing posters on the way home. All stamped by the student council. The faces were cut out.'),
  ] });

  /* ---------- New place: the home economics room ---------- */
  DL.Data.LOCATIONS.push({
    id: 'homeec', slot: 'after', name: 'Home ec room', jp: '家庭科室', bg: 'homeec',
    gain: { energy: 10 }, visible: (s) => s.day >= 4 && s.flags.mikageMet,
    hint: (s) => (s.day === 7 ? '!the pot is still simmering. it has been simmering all week.' : 'The cooking club meets here. Lately it’s just the student council. Something smells amazing.'),
  });
  DL.Events.homeec = [
    { id: 'hec_1', cond: notD7, scene: [
      bg('homeec'), music('uneasy'),
      n('The home ec room is steamy and warm. A huge stock pot sits on the back burner, lid rattling gently.'),
      show('rei', 'happy', 'center'),
      REI('happy', 'A guest for cooking club! Apron’s on the hook. Today’s lesson: how to make something last.'),
      REI('smile', 'The secret is time. Three days, low heat. Bones give up everything if you’re patient with them.'),
      n('She lifts the lid. The smell is rich and sweet and makes your stomach growl so loud she laughs.'),
      REI('smile', 'See? Your body already knows it’s good. It’s only your head that argues.'),
      choice('Rei holds out a ladle.',
        opt('Taste it.', [
          n('It’s the best thing you’ve ever tasted. You hate that it’s the best thing you’ve ever tasted.'),
          REI('happy', 'There. Now you know what a person— what a proper stock tastes like.'),
          eat, add({ energy: 20 }), flag('ateBroth'),
        ]),
        opt('Stir the pot instead.', [
          n('The ladle knocks against something hard at the bottom. You bring it up.'),
          n('It’s a school ID card in a plastic sleeve, boiled soft. The photo has gone milky. The name is still readable: KIMURA AOI, 2-B.'),
          n('2-B is your class. There is nobody called Kimura in your class.'),
          REI('smile', 'Oh, that’s where that went. Pop it back in, it adds flavour.'),
          flag('foundID'), add({ susp: 1 }),
        ]),
        opt('“I’m not hungry.”', [REI('smile', 'You will be. It’ll still be here. It’s always still here.')]),
      ),
      hide('rei'), restore,
      diary('Rei Mikage runs cooking club now. The stock has been simmering for three days.'),
    ] },
    { id: 'hec_sei', cond: (s) => notD7(s) && s.day >= 5 && !s.flags.seiBetrayed, scene: [
      bg('homeec'),
      show('sei', 'worried', 'center'),
      n('Sei is alone at the sink, scrubbing a pot that is already clean. His knuckles are raw.'),
      SEI('worried', 'She’s in the council room. I’m meant to be skimming the fat.'),
      SEI('worried', 'Don’t eat anything she gives you. Not the buns, not the soup. It gets easier every time. That’s the worst part. It gets easier.'),
      iff((s) => (s.flags.appetite || 0) >= 1, [
        SEI('worried', '…You already have. I can tell. You look less hungry than everyone else.'),
        SEI('worried', 'Stop now. Please. Before it starts to taste normal.'),
      ]),
      hide('sei'), restore,
      flag('seiWarnedFood'),
      diary('Sei says it gets easier every time you eat. He says that’s the worst part.'),
    ] },
    { id: 'hec_7', cond: (s) => s.day === 7, scene: [
      bg('homeec'), red, music('drone'),
      n('The pot is still simmering. It has been simmering all week. Nobody has turned it off. Nobody remembers turning it on.'),
      n('Floating on top, turning slowly in the broth: a pale blue hair clip.'),
      iff((s) => (s.flags.appetite || 0) >= 2, [n('Your mouth waters. You put your hand over it so nobody sees.')]),
      flag('sawClipPot'), restore,
      diary('There was a blue hair clip in the stock pot. My mouth watered. I hate myself.'),
    ] },
    { id: 'hec_any', repeat: true, scene: [
      bg('homeec'),
      n('The home ec room is empty. The pot simmers on its own. On the whiteboard, in neat handwriting: NEXT LESSON — CARVING.'),
    ] },
  ];

  /* ---------- Council room: the recipe notebook ---------- */
  insertAt(DL.Events.council, { id: 'cou_book', cond: (s) => notD7(s) && s.day >= 5, scene: [
    bg('library'), red,
    n('The council room is empty. Two cups of tea, still steaming. They just stepped out.'),
    n('On the table, a thick notebook with a gingham cover: OUR FAMILY RECIPES.'),
    n('You open it. Neat handwriting. Every page has a name instead of a dish.'),
    n('“KIMURA AOI, 2-B. Spring. Very tender. Nobody called the school.”'),
    n('“NISHI-SENSEI. Summer. Tough. Slow-cook. Students said he moved away.”'),
    n('“MUM AND DAD. Winter. We didn’t have enough salt. Sei cried. He ate it anyway.”'),
    n('The last page is fresh. The ink is still shiny.'),
    n('“AMANE (blue). When she’s ready. Light seasoning, she’s so delicate.”'),
    n('“AMANE (pink). Save for last. Something spicy.”'),
    n('“{name}. Guest of honour. ♡”'),
    choice('Footsteps in the corridor.',
      opt('Take a photo of the page.', [n('Click. You close the book and step back just as the door slides open.'), flag('recipePhoto')]),
      opt('Tear out the last page.', [
        n('It rips loudly. You stuff it in your pocket.'),
        show('rei', 'cold', 'center'),
        REI('cold', '…You tore my book.'),
        REI('smile', 'That’s fine. I know it by heart.'),
        hide('rei'),
        flag('tornRecipe'), add({ susp: 2 }),
      ]),
      opt('Put it back exactly how it was.', [n('You line it up perfectly with the edge of the table. Rei would notice if it wasn’t.')]),
    ),
    flag('readRecipes'), restore,
    diary('Found Rei’s recipe book in the council room. Every recipe has a name. The last page has Hikaru’s, Haruka’s and mine.'),
  ] });

  /* ---------- Sei, in the darkroom: how it started ---------- */
  { const sc = DL.Engine.scenes.sei_alone;
    const k = sc.findIndex((c) => c.t === 'say' && /Nobody ever remembers/.test(c.text || ''));
    if (k >= 0) sc.splice(k + 1, 0,
      SEI('worried', 'The first winter, she made dinner. I was nine. I asked when Mum and Dad were coming home.'),
      SEI('worried', 'She said, “You’re eating them, silly.” I thought it was a joke. For a really long time I thought it was a joke.'),
      n('He looks down at his clasped hands like they belong to someone else.')); }

  /* ---------- Welcome Party: more on the plates ---------- */
  { const sc = DL.Engine.scenes.end_feast;
    const k = sc.findIndex((c) => c.t === 'say' && /You can’t look at what’s on them/.test(c.text || ''));
    if (k >= 0) sc.splice(k + 1, 0,
      n('Each plate has a little folded name card. KIMURA. NISHI. One near the middle says AMANE in blue ink.'),
      n('In the gravy on your plate, something catches the light. A tiny silver goldfish charm. The twins’ bracelet had one just like it.'),
      n('Everyone picks up their chopsticks at exactly the same time.')); }

  /* ---------- New dark ending: Second Helpings ---------- */
  scene('end_hunger', [
    me('…Is there any more?'),
    n('Haruka stares at you. Hikaru’s hand slips out of yours.'),
    H('worried', '{name}? What are you talking about?'),
    music('drone'), bg('feast'),
    show('rei', 'happy', 'center'),
    REI('happy', 'Of course there’s more. There’s always more. Sit, sit.'),
    n('She ties a napkin around your neck like you’re a little kid. Your chair is already pulled out. It’s already warm.'),
    n('The first plate tastes like spring and shampoo and someone humming at the piano. You eat it all. You don’t remember whose it was.'),
    REI('smile', 'She was the sweetest thing I’ve ever cooked. Wasn’t she, {name}?'),
    me('Yes.'),
    iff(f('seiBetrayed'), [n('Sei’s place at the table is empty. Rei doesn’t seem to mind. There’s more for the two of you.')], [
      hide('rei'), show('sei', 'worried', 'center'),
      SEI('worried', 'I told you. I told you it gets easier.'),
      n('He gets up and leaves the table. Nobody stops him. Nobody notices.'),
    ]),
    hideAll(),
    sfx('static'), fx('flash', { color: '#c43048', ms: 380 }),
    ending('hunger'),
  ]);
  { const choiceCmd = DL.Engine.scenes.d9_choice[0];
    const k = choiceCmd.opts.findIndex((o) => o.body && o.body[0] && o.body[0].id === 'end_feast');
    choiceCmd.opts.splice(k < 0 ? choiceCmd.opts.length : k + 1, 0, opt('“…Is there any more?”', [go('end_hunger')], {
      if: (s) => (s.flags.appetite || 0) >= 3,
    })); }

  DL.Data.ENDINGS.hunger = {
    hint: 'Eat everything the Mikage siblings cook for you.',
    title: 'Second Helpings', jp: 'おかわり', dark: true,
    text: 'You eat lunch in the student council room every day now. Rei says you have a good appetite. You can’t remember the Amane twins’ faces, or which of them was blue, but sometimes, at the piano in the music room, your mouth waters and you don’t know why. The MISSING poster on the corner has a photo on it now. It’s yours. You walk past it every day.',
  };

  /* ---------- Phone: profiles, clues, trophies ---------- */
  const X = DL.Extras; const F = (k) => (s) => !!s.flags[k];
  if (X) {
    if (X.PROFILES && X.PROFILES.rei) X.PROFILES.rei.facts.push(
      { text: 'Runs cooking club now. Believes bones give up everything if you’re patient.', cond: (s) => !!s.seen.hec_1 },
      { text: 'Keeps a recipe notebook. Every recipe has a person’s name.', cond: F('readRecipes') });
    if (X.PROFILES && X.PROFILES.sei) X.PROFILES.sei.facts.push(
      { text: 'Was nine the first winter. Thought it was a joke for a long time.', cond: F('seiAlly') },
      { text: '“It gets easier every time. That’s the worst part.”', cond: F('seiWarnedFood') });
    if (X.CLUES) X.CLUES.push(
      { id: 'c_recipes', title: 'Family recipes', text: 'KIMURA AOI. NISHI-SENSEI. MUM AND DAD. AMANE (blue). AMANE (pink). And you: guest of honour.', cond: F('readRecipes') },
      { id: 'c_posters', title: 'Checked', text: 'Years of MISSING posters, all stamped by the student council. The newest one is blank, with today’s date.', cond: F('sawPosters') },
      { id: 'c_id', title: 'Kimura Aoi, 2-B', text: 'A school ID card at the bottom of the stock pot. There is nobody called Kimura in 2-B. Anymore.', cond: F('foundID') },
      { id: 'c_nail', title: 'Pink nail', text: 'A painted fingernail under the rice in a bento “from the council”. Not Haruka’s. Somebody else liked glitter hearts.', cond: F('sawNail') });
    if (X.TROPHIES) X.TROPHIES.splice(X.TROPHIES.findIndex((t) => t.id === 'swapped'), 0,
      { id: 'appetite', icon: '🍲', name: 'Good appetite', desc: 'Eat three things the Mikage siblings cooked.', cond: (s) => (s.flags.appetite || 0) >= 3 },
      { id: 'recipes', icon: '📓', name: 'Family recipes', desc: 'Read Rei’s recipe notebook.', cond: F('readRecipes') });
  }
})();
