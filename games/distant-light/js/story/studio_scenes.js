/* THE STUDIO IN THE STORY.
   Where the nine styling games happen, and what each result changes.
   - Hoshizora Mall (after school, days 2–6): Stardust Beauty, Gift Hunt, Hair Salon, Nail Bar,
     Thrift Store and the Purikura booth. Each shop has its own days, and closes once you've played it.
   - Day 1 morning: the Uniform Customiser. Everyone comments on it; Haruka starts copying it.
   - Day 8, in the twins' room: the Doll House.
   - Sunday (after the matsuri): the Room Makeover. */
(() => {
  const { scene, bg, show, hide, say, n, H, K, R, me, X, rw, opt, choice, add, flag, iff, call, js, sfx, fx, diary, f, has, hideText, ending } = DL.DSL;

  /* ---------- helpers ---------- */
  // Play a studio game, remember the result, and pay for it if it costs money.
  const play = (id, o = {}) => js(async (s) => {
    DL.Dialogue.hide();
    const r = await DL.Studio.play(id, o.opts ? o.opts(s) : {});
    s.studio = s.studio || {};
    const keep = Object.assign({}, r); delete keep.picks;
    s.studio[id] = keep;
    s.flags['st_' + id] = r.result;
    if (o.pay && r.result !== 'left' && r.spent) DL.State.add({ money: -r.spent });
    if (o.store) o.store(s, r);
    if (r.result !== 'left') DL.Dialogue.log.push({ label: '', plate: 'none', html: `(${DL.Studio.GAMES[id].name}: ${r.result})` });
  });
  const was = (id, ...rs) => (s) => rs.includes(s.flags['st_' + id]);
  const open = (id) => (s) => !s.studio || !s.studio[id] || s.studio[id].result === 'left';
  const on = (...days) => (s) => days.includes(s.day);
  const need = (yenAmt) => (s) => (s.money < yenAmt ? `You need at least ${DL.util.yen(yenAmt)}. Try a konbini shift.` : '');

  // Splice extra lines into scenes written elsewhere, so the other story files stay readable.
  function inject(id, find, cmds, { before = false, nth = 0 } = {}) {
    const list = DL.Engine.scenes[id];
    if (!list) throw new Error('inject: no scene ' + id);
    let k = -1, seen = 0;
    for (let i = 0; i < list.length; i++) if (find(list[i]) && seen++ === nth) { k = i; break; }
    if (k < 0) throw new Error('inject: no match in ' + id);
    list.splice(before ? k : k + 1, 0, ...cmds);
  }
  function replace(id, find, fn) {
    const list = DL.Engine.scenes[id];
    const k = list.findIndex(find);
    if (k < 0) throw new Error('replace: no match in ' + id);
    list[k] = fn(list[k]);
  }
  const says = (txt) => (c) => c.t === 'say' && typeof c.text === 'string' && c.text.includes(txt);

  /* ================= HOSHIZORA MALL ================= */
  // Thrift comes first: what you buy there goes into Rin's bag for Stardust Beauty.
  const SHOPS = {
    thrift: { days: [2, 3, 4], label: 'Kaze Thrift, with Rin (her exhibition outfit)' },
    beauty: { days: [3, 4, 6], label: 'Stardust Beauty: Rin’s makeover (after the thrift trip)', after: 'thrift' },
    nails: { days: [2, 3], label: 'The nail bar, with the twins' },
    gifts: { days: [3, 4], label: 'The gift floor (the twins’ birthday is Friday)', min: 1200 },
    salon: { days: [4, 6], label: 'Salon Lumière (Haruka booked it)' },
    purikura: { days: [6], label: 'The purikura booth by the station', min: 400 },
  };
  DL.Data.MALL = SHOPS;
  const done = (id) => (s) => !!(s.studio && s.studio[id] && s.studio[id].result !== 'left');
  const shopOpen = (id) => (s) => SHOPS[id].days.includes(s.day) && open(id)(s) && (!SHOPS[id].after || done(SHOPS[id].after)(s));
  const anyOpen = (s) => Object.keys(SHOPS).some((id) => shopOpen(id)(s));

  DL.Data.LOCATIONS.push({
    id: 'mall', slot: 'after', name: 'Hoshizora Mall', jp: '星空モール', bg: 'mall',
    gain: { energy: -10 },
    visible: (s) => s.day !== 7 && anyOpen(s),
    hint: (s) => 'Open today: ' + Object.keys(SHOPS).filter((id) => shopOpen(id)(s)).map((id) => DL.Studio.GAMES[id].name).join(', ') + '.',
  });

  DL.Events.mall = [
    { id: 'mall_any', repeat: true, scene: [
      bg('mall'),
      n('Hoshizora Mall is ten minutes from school: a glass dome, a pink fountain, three floors of glitter and very loud music.'),
      choice('Where to?',
        ...Object.entries(SHOPS).map(([id, sh]) => opt(sh.label, [call('st_' + id)], { if: shopOpen(id), lock: sh.min ? need(sh.min) : undefined })),
        opt('Just window-shop.', [n('You ride the glass lift up and down twice. It’s weirdly relaxing.'), add({ energy: 10 }, { quiet: true })]),
      ),
    ] },
  ];

  /* ---------- 1. Stardust Beauty ---------- */
  scene('st_beauty', [
    bg('mall'),
    show('rin', 'shy', 'center'),
    R('shy', 'You came! Okay. I have a confession. At the exhibition opening tomorrow, I’m supposed to stand next to my photos.'),
    R('worried', 'Everyone will look at me. I want to look like… the kind of person people photograph.'),
    iff((s) => s.uniform && s.uniform.charm === 'u_cam', [R('happy', 'Also, you have a camera charm. I trust you completely now.')]),
    choice(
      opt('“You already are.”', [
        R('shy', '…You have to say that.'),
        choice(
          opt('“I don’t have to say anything. I mean it.”', [R('soft', 'Okay. Then help me believe it for one whole day.'), add({ trust: 0 }), flag('rinBelieved')]),
          opt('“Fine, I have to. Let’s go shopping.”', [R('happy', 'Ha. Okay. Honesty. I respect that.')]),
        ),
      ]),
      opt('“Then let’s make you one.”', [R('happy', 'Okay! Stardust Beauty has a styling chair. You pick, I sit. I won’t look until the end.')]),
      opt('“Why do you want people to look at you?”', [
        R('neutral', 'I don’t. I want them to look at the photos. But if I hide next to them, it’s like I don’t believe in them either.'),
        R('soft', 'Does that make sense?'),
        choice(
          opt('“It makes perfect sense.”', [R('happy', 'Then let’s do it before I change my mind.'), flag('rinBelieved')]),
          opt('“You could just not go.”', [R('sad', '…Yeah. I could.'), n('She goes anyway. But she holds her camera a little tighter.')]),
        ),
      ]),
    ),
    iff((s) => s.thriftBag && s.thriftBag.outfit, [n('Rin is still hugging the Kaze Thrift bag. “Can we use what we found? Is that allowed?”')]),
    n('Stardust Beauty: glass shelves, holographic boxes, a styling chair in front of a big gold mirror. Rin sits down and closes her eyes.'),
    hide('rin'), hideText(),
    js(async (s) => {
      const r = await DL.RinFitting.play({ thrift: s.thriftBag || {} });
      s.studio = s.studio || {};
      if (r.result !== 'doom') s.studio.beauty = { result: r.result, stars: { perfect: 3, ok: 2, fail: 0 }[r.result] };
      s.flags.st_beauty = r.result;
      s.flags.rinSabotages = r.sabotages;
      DL.Dialogue.log.push({ label: '', plate: 'none', html: `(Rin’s makeover: ${r.result})` });
    }),
    iff(was('beauty', 'doom'), [
      js(() => DL.RinFitting.doom()),
      ending('exhibit'),
    ]),
    iff(was('beauty', 'perfect'), [
      show('rin', 'happy', 'center'),
      R('happy', 'I keep looking in shop windows. On purpose. That’s never happened before.'),
      R('soft', 'I think what I really wanted wasn’t to look different. I wanted to stop hiding behind the camera.'),
      choice(
        opt('“Will you let me take your photo at the opening?”', [R('shy', 'Only if you stand next to me in one, too.'), add({ trust: 1 })]),
        opt('“Hikaru should see you like this.”', [R('surprised', 'Hikaru? She always looks away when I raise the camera.'), R('soft', 'Maybe I’ll show her. Maybe she’d want to be in one with me.'), flag('rinClue')]),
      ),
      flag('rinBrave'), flag('rinFriend'), add({ grades: 2 }, { quiet: true }),
      diary('Rin’s makeover at Stardust Beauty. She wants to be in the picture this time.'),
    ]),
    iff(was('beauty', 'ok'), [
      show('rin', 'smile', 'center'),
      R('smile', 'Thank you, {name}. It’s a start. A small, sparkly start.'),
      flag('rinFriend'),
      diary('Rin’s makeover at Stardust Beauty. She looked nice. Still a little bit hidden.'),
    ]),
    iff(was('beauty', 'fail'), [
      fx('flicker', { variant: 'g1', ms: 160 }), sfx('static'),
      show('rin', 'worried', 'center'),
      R('worried', 'I don’t think I’m going to the opening, {name}.'),
      R('sad', 'When I looked in the mirror, there was someone behind me. Pink. Smiling. She looked more like she belonged in my photos than I did.'),
      choice(
        opt('“That was Haruka. She wasn’t really there.”', [R('worried', 'That’s worse. That’s so much worse.'), add({ susp: 1 })]),
        opt('“You don’t need the makeover. Go as you.”', [R('sad', 'Going as me is the problem.'), n('She takes the make-up off with a wet wipe in the lift. All of it.')]),
        opt('Say nothing and walk her home.', [n('She doesn’t talk the whole way. At her gate she says thank you, very politely, like you’re a stranger.')]),
      ),
      js((s) => { s.flags.rinHiding = true; s.flags.mirrorRin = true; s.flags.rinFriend = false; s.flags.rinBrave = false; }),
      diary('Rin’s makeover went wrong. She saw someone in the mirror. She isn’t going to her own exhibition.'),
    ]),
    hide('rin'),
  ]);

  // After a failed makeover, Rin disappears into the background for a while
  scene('rin_hiding_echo', [
    iff((s) => s.flags.rinHiding && !s.flags.rinHidingSeen, [
      n('Rin’s desk is by the door now. She asked to move. She keeps her camera in her bag all morning and doesn’t take a single photo.'),
      n('When you wave, she looks at the window behind you instead, as if checking who else is in the room.'),
      flag('rinHidingSeen'),
    ]),
  ]);

  /* ---------- 2. Gift Hunt ---------- */
  scene('st_gifts', [
    n('The twins’ birthday is on Friday. Haruka has mentioned it nine times. Hikaru hasn’t mentioned it once.'),
    show('hikaru', 'shy', 'right'),
    K('shy', 'You don’t have to get us anything. Really. …But if you do, please don’t get us the same thing.'),
    K('worried', 'Everyone always gets us the same thing.'),
    hide('hikaru'),
    play('gifts', { pay: true }),
    iff(was('gifts', 'great'), [
      n('On Friday, Haruka wears her gift all day and pretends she isn’t. Hikaru keeps hers on her desk, where she can see it.'),
      add({ favor: 2, trust: 2 }), flag('giftsGood'),
    ]),
    iff(was('gifts', 'ok'), [n('On Friday, both of them say thank you. Both of them mean it.'), add({ favor: 1, trust: 1 })]),
    iff(was('gifts', 'meh'), [n('On Friday, the gifts get polite smiles. Nobody mentions them again.')]),
    iff(was('gifts', 'bad'), [
      fx('flicker', { variant: 'g2', ms: 140 }),
      n('On Friday, Haruka wears both necklaces. “She said she didn’t want hers,” she tells you, smiling. Hikaru is looking at the floor.'),
      add({ susp: 2, trust: -1 }), flag('giftsMatched'),
    ]),
    iff((s) => s.studio.gifts && s.studio.gifts.jealous && s.studio.gifts.result !== 'left', [
      n('Later, Haruka checks the price of her sister’s gift on her phone. You see her do it.'),
      add({ susp: 1 }),
    ]),
  ]);

  /* ---------- 3. Hair Salon Panic ---------- */
  scene('st_salon', [
    show('haruka', 'happy', 'left'), show('hikaru', 'worried', 'right'),
    H('happy', 'Salon Lumière! I booked us in. My treat. Well, Mum’s treat.'),
    H('smirk', 'I already told the stylist what Hikaru wants. She doesn’t need to worry about it.'),
    K('worried', '{name}… could you sit with me? And maybe say something if it goes wrong?'),
    me('I’ll be right there.'),
    hide('haruka'), hide('hikaru'),
    play('salon'),
    iff(was('salon', 'great', 'ok'), [
      show('hikaru', 'soft', 'right'), show('haruka', 'cold', 'left'),
      K('soft', 'It’s blue. It’s *mine.*'),
      H('cold', 'It’s fine. I guess. It doesn’t really go with mine, but fine.'),
      add({ trust: 2, favor: -1 }), flag('hikaruCut'),
    ]),
    iff(was('salon', 'meh'), [show('hikaru', 'neutral', 'right'), K('neutral', 'It’s okay. Hair grows back, right?'), add({ trust: 1 })]),
    iff(was('salon', 'bad'), [
      fx('tear', { ms: 200 }), sfx('static'),
      show('haruka', 'happy', 'left'), show('hikaru', 'blank', 'right'),
      H('happy', 'Look at us! Nobody can tell us apart now!'),
      K('blank', '…Which one of us is in the mirror, {name}?'),
      add({ trust: -1, susp: 1 }), flag('salonMatched'),
    ]),
    hide('haruka'), hide('hikaru'),
  ]);

  /* ---------- 4. Nail Salon Night ---------- */
  scene('st_nails', [
    show('haruka', 'happy', 'left'), show('hikaru', 'neutral', 'right'),
    H('happy', 'Nail night! You do mine AND hers. Matching. Obviously.'),
    K('neutral', '…Can mine be blue?'),
    H('smirk', 'We’ll see ✿'),
    hide('haruka'), hide('hikaru'),
    play('nails'),
    iff(was('nails', 'great', 'ok'), [
      show('hikaru', 'soft', 'right'),
      K('soft', 'I keep looking at them in class. Is that silly?'),
      add({ trust: 1, favor: 1 }), flag('nailsBlue'),
    ]),
    iff(was('nails', 'meh'), [n('Hikaru hides her hands in her sleeves on the way home.')]),
    iff(was('nails', 'bad'), [
      sfx('static'),
      show('haruka', 'eerie', 'left'),
      H('eerie', 'Now we match all the way down to our fingertips.'),
      n('Hikaru doesn’t say anything. She picks at a pink nail until the polish chips. Underneath, it’s pink too.'),
      add({ trust: -1 }), flag('nailsMatched'),
    ]),
    hide('haruka'), hide('hikaru'),
  ]);

  /* ---------- 5. Thrift Store Treasure Hunt ---------- */
  scene('st_thrift', [
    show('rin', 'happy', 'center'),
    R('happy', 'The exhibition is soon, and I own one cardigan. You have ¥3,000 of the club’s money. Please don’t spend it on snacks.'),
    R('shy', 'And after this… maybe Stardust Beauty? If the clothes are brave, maybe I can be too.'),
    hide('rin'),
    play('thrift', { store: (s, r) => { s.flags.notesFound = Math.max(s.flags.notesFound || 0, r.notes || 0); if (r.picks) s.thriftBag = r.picks.rin; } }),
    iff(was('thrift', 'great'), [show('rin', 'happy', 'center'), R('happy', 'I look like *me*, but on purpose.'), flag('rinFriend'), flag('rinOutfit'), add({ grades: 2 }, { quiet: true })]),
    iff(was('thrift', 'ok', 'meh'), [show('rin', 'smile', 'center'), R('smile', 'Thank you. It’s nicer than anything I would’ve picked.')]),
    iff((s) => (s.flags.notesFound || 0) >= 1 && s.flags.st_thrift !== 'left', [
      show('rin', 'worried', 'center'),
      R('worried', 'These notes, though. Blue ink, tiny handwriting. Whose clothes were these?'),
      flag('pocketNote'), flag('photoClue'),
    ]),
    iff((s) => (s.flags.notesFound || 0) >= 2, [
      n('Rin smooths the last note flat on the counter. It’s the same handwriting as the others.'),
      say('hikaru', null, 'i only said the mean thing so they’d look at me and not at her.', rw('i only said the mean thing because i liked how it felt.', 'f_pocket')),
      iff(has('f_pocket'), [n('You read it twice, and fold it into your own pocket.')], [n('The ink smudges under your thumb. When you look again, the words are rounder. Pinker.')]),
    ]),
    hide('rin'),
  ]);

  /* ---------- 6. Purikura ---------- */
  scene('st_purikura', [
    show('haruka', 'happy', 'left'), show('hikaru', 'smile', 'right'),
    H('happy', 'Purikura! You decorate, we pose. That’s the rule.'),
    K('smile', 'She makes everyone decorate. She says it’s because she’s too pretty to concentrate.'),
    add({ money: -400 }),
    hide('haruka'), hide('hikaru'),
    play('purikura'),
    iff((s) => s.flags.st_purikura === 'printed', [
      show('haruka', 'worried', 'left'), show('hikaru', 'worried', 'right'),
      H('worried', 'It’s a glitch. Those machines are ancient. It’s a glitch.'),
      K('worried', 'There were only ever two of us in there. Right, {name}?'),
      n('Haruka cuts frame four off the strip with her nail scissors. She gives the rest to you.'),
      add({ favor: 1 }), flag('purikuraGhost'),
      diary('Purikura with the twins. Frame four came out with three girls in it.'),
    ]),
    hide('haruka'), hide('hikaru'),
  ]);

  /* ================= DAY 1: UNIFORM ================= */
  const UITEM = (id) => (DL.Studio.GAMES.uniform.items.find((i) => i.id === id) || {}).name || '';
  const uni = (cat) => (s) => UITEM((s.uniform || {})[cat]).toLowerCase();
  const UDEF = { cardi: 'u_cream', socks: 'u_loose', charm: 'u_bunny', clip: 'u_star' };

  scene('uni_pick', [
    n('Before you go, you could make it a little more yours.'),
    play('uniform', { store: (s, r) => { s.uniform = Object.assign({}, UDEF, (r.picks && r.picks.you) || {}); } }),
    n((s) => `${uni('cardi')(s)[0].toUpperCase() + uni('cardi')(s).slice(1)}, ${uni('socks')(s)}, a ${uni('charm')(s)} on your bag and a ${uni('clip')(s)} in your hair. Good.`),
  ]);
  inject('d1_morning', says('First day at a new school'), [call('uni_pick')], { before: true });

  // The week's comments
  scene('uni_d2', [
    H('smirk', (s) => `Cute ${uni('charm')(s)}. Did you get it from a gacha machine?`),
    K('neutral', (s) => `I like it. And the ${uni('cardi')(s)}.`),
    H('cold', '…I didn’t say I *didn’t* like it.'),
  ]);
  scene('uni_d3', [n((s) => `During roll call, Hikaru keeps glancing at your ${uni('clip')(s)}. When you catch her, she looks away and smiles at her desk.`)]);
  scene('uni_d6', [
    n((s) => `Then you see Haruka’s bag. There’s a ${uni('charm')(s)} hanging from it. Exactly like yours.`),
    H('smile', 'Oh, this? I’ve always had this.'),
    flag('copiedCharm'),
  ]);
  scene('uni_d8', [
    n((s) => `Haruka is wearing a ${uni('clip')(s)} today. And a ${uni('cardi')(s)}. Yours are in exactly the same places.`),
    H('eerie', 'We match now, {name}. Isn’t that nice? Hikaru never wanted to.'),
    flag('copiedClip'), add({ susp: 1 }, { quiet: true }),
  ]);
  inject('d2_morning', (c) => c.t === 'show' && c.who === 'hikaru', [iff((s) => !!s.uniform, [call('uni_d2')])]);
  inject('d3_morning', (c) => c.t === 'bg', [iff((s) => !!s.uniform, [call('uni_d3')])]);
  inject('d6_morning', says('saved you a seat at lunch'), [iff((s) => !!s.uniform, [call('uni_d6')])]);
  inject('d8_morning', (c) => c.t === 'bg', [iff((s) => !!s.uniform, [call('uni_d8')])]);

  /* ================= DAY 6: echoes of the mall ================= */
  scene('st_echo_d6', [
    iff(f('hikaruCut'), [n('Hikaru’s new haircut is still blue. People in the corridor actually say her name, not “the other Amane”.')]),
    iff(f('salonMatched'), [n('Two pink ponytails swing past the window. You genuinely can’t tell which one is which.')]),
    iff(f('nailsMatched'), [n('In homeroom, Hikaru keeps her hands under the desk. Her nails are still pink. They haven’t chipped at all.')]),
    iff(f('mirrorRin'), [show('rin', 'worried', 'center'), R('worried', 'My bathroom mirror waved at me this morning. Before I did. …Never mind.'), hide('rin')]),
    iff(f('rinBrave'), [show('rin', 'smile', 'center'), R('smile', 'I wore the stars to school. Two people asked to take my picture. I said yes!'), hide('rin')]),
  ]);
  inject('d6_morning', (c) => c.t === 'bg' && c.id === 'gate', [call('st_echo_d6')]);

  scene('st_echo_d8', [
    iff(f('purikuraGhost'), [
      sfx('static'),
      n('The purikura strip is still in your bag. Three frames. In all three, the girl on the right has gone pale and blurry, like she moved.'),
    ]),
  ]);
  inject('d8_morning', (c) => c.t === 'card', [call('st_echo_d8')]);

  /* ================= DAY 8: DOLL HOUSE ================= */
  scene('d8_dolls', [
    flag('sawDolls'),
    n('On the windowsill, exactly on the line between pink and blue, is an old shoebox. Inside: two paper dolls and a lot of paper clothes.'),
    n('Someone has written on the lid in crayon: *HARUKA + HIKARU. DO NOT SPLIT UP.*'),
    play('dollhouse'),
    iff(was('dollhouse', 'matching'), [
      bg('street', { fade: 600 }),
      fx('tint', { kind: 'pink' }),
      n('Summer. You’re standing somewhere you’ve never been: a festival street, years ago.'),
      n('Two eight-year-olds in identical goldfish yukata hold hands so tightly their knuckles go white.'),
      say('haruka', null, '“If we match, they can’t laugh at just one of us. They have to laugh at both.”'),
      say('hikaru', null, '“Then I’ll match you forever.”'),
      n('It sounds like a promise. It sounds a lot like a trap.'),
      fx('tint', { kind: null }), bg('sisters_room', { fade: 600 }),
      add({ favor: 1 }), flag('dollMatch'),
    ]),
    iff(was('dollhouse', 'different'), [
      sfx('page'),
      n('You turn the fallen doll over. On the back, in careful eight-year-old handwriting:'),
      say('hikaru', null, 'If we ever stop matching, I’ll still know which one is you. I’ll always find you.', rw('If we ever stop matching, one of us has to go.', 'f_doll')),
      iff(has('f_doll'), [
        n('Underneath, in round pink crayon: *promise?* And in blue: *promise.*'),
        n('Nobody else ever saw this. You can tell. The paper has never been unfolded.'),
        add({ trust: 1, susp: -1 }), flag('secretMemory'),
      ], [n('The writing smears as you read it, like it was never dry.')]),
    ]),
    { t: 'goto', id: 'd8_room_look' },
  ]);
  DL.Engine.scenes.d8_room_look[0].opts.splice(3, 0, opt('Look at the paper dolls on the windowsill.', [{ t: 'goto', id: 'd8_dolls' }], { if: (s) => !s.flags.sawDolls }));

  // If pink took over the room on Sunday, the room looks different on Day 8
  replace('d8_after', says('It still looks like two rooms'), (orig) => iff(f('blueGone'),
    [n('There is no blue half any more. Pink bedding, pink lamp, pink everything, all the way to the wall. On the far side, one blue whale plush is lying face-down under the bed.')],
    [orig]));

  /* ================= SUNDAY: ROOM MAKEOVER ================= */
  scene('sun_room', [
    bg('sisters_room', { clean: true }),
    show('haruka', 'happy', 'left'), show('hikaru', 'neutral', 'right'),
    H('happy', 'You came! Mum says we can redecorate. My side, her side. You’re the tiebreaker.'),
    K('neutral', 'The line down the middle is the rule. Her stuff stays on her side. Mine stays on mine.'),
    H('smirk', 'Ugh. Fine. *Rules.*'),
    hide('haruka'), hide('hikaru'),
    play('room', { store: (s, r) => { if (r.blueGone) s.flags.blueGone = true; } }),
    iff(f('blueGone'), [
      show('hikaru', 'blank', 'right'),
      K('blank', 'It’s okay. I don’t need much room.'),
      n('By the time you leave, Hikaru is sitting on the floor in the doorway, like a guest.'),
      add({ trust: -2 }),
    ], [
      iff((s) => s.flags.st_room !== 'left', [
        show('hikaru', 'soft', 'right'), show('haruka', 'smirk', 'left'),
        K('soft', 'It looks like two people live here. Thank you.'),
        H('smirk', 'The whale is hideous. …It can stay.'),
        add({ trust: 1, favor: 1 }), flag('roomShared'),
      ]),
    ]),
    hide('haruka'), hide('hikaru'),
  ]);
  inject('sat_festival', (c) => c.t === 'card' && c.sub === 'Sunday passes quietly.', [call('sun_room')], { before: true });
  replace('sat_festival', (c) => c.t === 'card' && c.sub === 'Sunday passes quietly.', (c) => Object.assign({}, c, { sub: 'The rest of Sunday passes quietly.' }));

  scene('st_echo_sun', [
    iff(f('blueGone'), [n('At 7am Haruka sends you a photo of the bedroom. It’s all pink. *Hikaru LOVES it!!* Hikaru isn’t in the photo.')]),
  ]);
  inject('d6_morning', (c) => c.t === 'bg' && c.id === 'bedroom', [call('st_echo_sun')]);

  // Rin's makeover pays off at the matsuri
  inject('sat_festival', says('Later, while Haruka argues'), [
    iff(f('rinBrave'), [
      show('rin', 'shy', 'center'),
      R('shy', '{name}… could you take one of me, too? With them? I want to be in one.'),
      n('You take it. In the photo, Rin isn’t hiding behind anything at all.'),
      add({ trust: 1 }, { quiet: true }), hide('rin'),
    ]),
  ], { before: true });

  // Rin's failed makeover: she hides the next morning, and Rin's own ending is locked
  for (const d of [4, 5, 6, 8]) {
    const list = DL.Engine.scenes[`d${d}_morning`];
    const tail = list[list.length - 1];
    list.splice(tail && tail.t === 'goto' ? list.length - 1 : list.length, 0, call('rin_hiding_echo'));
  }
  const finalChoice = DL.Engine.scenes.d9_choice[0];
  const rinOpt = finalChoice.opts.find((o) => o.body && o.body[0] && o.body[0].id === 'end_rin');
  const oldLock = rinOpt.lock;
  rinOpt.lock = (s) => (s.flags.rinHiding ? 'Rin stopped trusting what she sees after the mirror at Stardust Beauty.' : oldLock ? oldLock(s) : null);
})();
