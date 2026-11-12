/* CONVERSATIONS (dialogue trees).
   These replace the arcade minigames that used to pop up after each place: what you
   say now decides what you get. Two of them hold lines to remember (the train lights,
   the constellation page). Plus four bigger conversations later in the week, and one
   in the mall atrium. Each is a one-time event added to its place's list. */
(() => {
  const { scene, bg, show, hide, hideAll, n, H, K, R, me, X, rw, opt, choice, add, flag, iff, item, call, js, sfx, fx, diary, has, f } = DL.DSL;
  const here = () => DL.State.hikaruHere();
  const notD7 = (s) => s.day !== 7;

  // Put a one-time event in front of the place's everyday (repeat) scene
  function addTalk(loc, ev) {
    const pool = DL.Events[loc];
    const k = pool.findIndex((e) => e.repeat);
    pool.splice(k < 0 ? pool.length : k, 0, ev);
  }

  /* ---------- Konbini: the evening rush (was Register Rush) ---------- */
  addTalk('konbini', { id: 'kon_talk', cond: (s) => notD7(s) && s.day >= 2, scene: [
    bg('konbini'),
    X('Mr. Oda', 'Rush hour. You’re on the till. Don’t panic, don’t give anyone free crisps.'),
    n('A tired office worker puts down a bento and a can of coffee. ¥640. He hands you a ¥1,000 note.'),
    choice('How much change?',
      opt('¥360', [
        X('Customer', 'Thanks.'), n('The next customer: two onigiri and a strawberry milk, ¥430. She pays with ¥500.'),
        choice('Change?',
          opt('¥70', [
            X('Mr. Oda', 'Not one yen off all shift. You’re hired properly. Staff discount goes up, too.'),
            flag('bigDiscount'), add({ money: 300 }),
            iff(() => here(), [
              show('hikaru', 'surprised', 'center'),
              n('The strawberry milk customer turns around. It’s Hikaru. She’s buying it for her sister.'),
              K('soft', 'She only likes this brand. Don’t tell her I came all the way here for it.'),
              add({ trust: 1 }), hide('hikaru'),
            ]),
          ]),
          opt('¥170', [X('Mr. Oda', 'The till is ¥100 over. That’s… almost a talent.'), add({ money: -100 })]),
        ),
      ]),
      opt('¥460', [X('Mr. Oda', 'The till is ¥200 short. That’s coming out of your pay.'), add({ money: -200 })]),
      opt('“Keep the change, sir.”', [X('Mr. Oda', 'It’s not YOUR change to keep! Out of your pay.'), add({ money: -300 })]),
    ),
    diary('Covered the konbini rush. Mr. Oda counts every yen.'),
  ] });

  /* ---------- Courtyard: the falling petal (was Petal Catch) ---------- */
  addTalk('courtyard', { id: 'court_talk', cond: (s) => notD7(s) && s.day >= 3, scene: [
    bg('courtyard'),
    show('haruka', 'neutral', 'center'),
    n('Haruka is sitting under the big cherry tree, watching the petals fall. She doesn’t notice you at first.'),
    H('neutral', 'If you catch one before it hits the ground, you get a wish. Hikaru used to catch them for me.'),
    H('cold', 'Not that I care. It’s for children.'),
    choice(
      opt('Catch a petal and give it to her.', [
        n('You reach up. A petal lands right in your palm, like it was aiming for you.'),
        H('surprised', 'You caught one? …Hikaru used to catch them for me. She said it meant a wish.'),
        choice(
          opt('“Then make one.”', [H('shy', 'Fine. Don’t look.'), n('She closes her eyes for a long time. When she opens them, they’re wet. She blames the pollen.'), add({ favor: 1, susp: -1 }), flag('petalWish')]),
          opt('“What would you wish for?”', [H('cold', 'That’s a stupid question.'), H('sad', '…For things to be like before. Before we were like this.'), add({ favor: 1 }), flag('petalWish')]),
        ),
      ]),
      opt('Catch one and keep it.', [H('smirk', 'Rude. Selfish. Honestly? Respect.'), add({ favor: 0, energy: 10 })]),
      opt('“Why doesn’t Hikaru catch them anymore?”', [
        H('cold', 'Ask her.'),
        H('sad', 'She stopped doing a lot of things. Or I stopped noticing. I don’t know which is worse.'),
        add({ susp: -1 }),
      ]),
    ),
    hide('haruka'),
  ] });

  /* ---------- Station: counting the train lights (was Train Lights) ---------- */
  addTalk('station', { id: 'sta_talk', cond: (s) => notD7(s) && here(), scene: [
    bg('station'),
    show('hikaru', 'neutral', 'center'),
    n('Hikaru is at the very end of the platform, counting the lights of the trains as they come in.'),
    K('neutral', 'Pink ones are going away. Blue ones are coming back. That’s my rule, anyway.'),
    n('Two lights appear far down the line at once: one pink, one blue.'),
    choice('Which one do you watch?',
      opt('The blue one.', [
        n('The blue light gets bigger and bigger until the whole platform glows with it.'),
        show('hikaru', 'soft', 'center'),
        K('soft', 'You saw them too. The blue ones are the ones that come back.', rw('You saw them too. None of them ever come back.', 'f_lights')),
        iff(has('f_lights'), [K('shy', '…Nobody ever watches the blue one with me.'), add({ trust: 1 })], [n('She watches the pink light leave instead, until it’s gone.')]),
      ]),
      opt('The pink one.', [K('sad', 'That’s the one everyone watches. It’s fine. It’s prettier.'), n('The pink light pulls away. She keeps looking at the place where it was.')]),
      opt('Watch Hikaru instead.', [
        K('surprised', '…What? Why are you looking at me?'),
        choice(
          opt('“You look happy when you count them.”', [K('shy', 'I’m not— shut up.'), K('soft', 'Okay. Maybe a bit.'), add({ trust: 1 })]),
          opt('“Sorry. Spaced out.”', [K('neutral', 'Same. That’s what the platform’s for.')]),
        ),
      ]),
    ),
    hide('hikaru'),
  ] });

  /* ---------- Library: Rin's quiz (was Cram Quiz) ---------- */
  addTalk('library', { id: 'lib_talk', cond: (s) => notD7(s) && s.day >= 2, scene: [
    bg('library'),
    show('rin', 'happy', 'center'),
    R('happy', 'Quiz time! I make flashcards for everything. Ready? What’s the Japanese word for “light”?'),
    choice(
      opt('“Hikari.”', [
        R('smile', 'Right! Like Hikaru’s name, almost. Next: what’s a photo’s “exposure”?'),
        choice(
          opt('“How much light gets in.”', [
            R('surprised', 'Full marks? You’re kind of scary. …Want to study together tomorrow too?'),
            flag('rinFriend'), add({ grades: 4 }),
          ]),
          opt('“When someone finds out your secret.”', [R('happy', 'Ha! Wrong, but also kind of right. Half marks.'), add({ grades: 2 })]),
        ),
      ]),
      opt('“Haruka.”', [R('worried', 'That means “far away”. …Funny. That’s not what you were going for, was it?'), add({ grades: 1 })]),
      opt('“I didn’t study.”', [n('You stare at the flashcards until they swim. Your grades slip a little.'), add({ grades: -3 })]),
    ),
    hide('rin'),
  ] });

  /* ---------- Walk home: the vending machine (was Vending Machine) ---------- */
  addTalk('street', { id: 'walk_talk', cond: (s) => notD7(s) && s.day >= 2, scene: [
    bg('street'),
    n('The vending machine on the corner hums. It has one strawberry milk left, and one plain blue can of something nobody ever buys.'),
    choice(
      opt('Buy the strawberry milk.', [
        n('Clunk. Then a second clunk. The machine drops two drinks: the pink one and the blue one.'),
        item('milk', 1),
        iff(() => here(), [
          show('hikaru', 'smile', 'center'),
          n('Hikaru appears at your elbow like she was there all along.'),
          K('smile', 'It does that for us too, sometimes. Haruka says it’s luck. I think it’s the machine being kind.'),
          choice(
            opt('Give her the blue can.', [K('soft', 'Nobody ever buys me the blue one.'), add({ trust: 1 })]),
            opt('Keep both.', [K('neutral', 'Fair. You did pay.')]),
          ),
          hide('hikaru'),
        ]),
      ]),
      opt('Kick the machine.', [sfx('thud'), n('The machine eats ¥120 out of spite.'), add({ money: -120 })]),
      opt('Walk on.', [n('Behind you, the machine drops a can by itself. Clunk. You don’t turn around.')]),
    ),
  ] });

  /* ---------- Park: the swings (was Swing High; opens Haruka's own ending) ---------- */
  addTalk('park', { id: 'park_talk', cond: (s) => notD7(s) && s.day >= 3, scene: [
    bg('park'),
    show('haruka', 'neutral', 'center'),
    n('Haruka is standing next to the swings, not sitting on them. Her bag is on the ground like she forgot she was holding it.'),
    H('cold', 'What. I’m allowed to stand in a park.'),
    choice(
      opt('“Get on. I’ll push.”', [
        H('surprised', '…Fine. One push. Don’t make it weird.'),
        n('One push becomes ten. She starts laughing somewhere around push four.'),
        H('happy', 'Higher— okay, not THAT high!'),
        choice(
          opt('“I’ve got you, I’ve got you.”', [
            H('soft', '…You said it the exact same way she used to.'),
            H('sad', 'I forgot I liked swings. I forgot a lot of things I liked.'),
            add({ susp: -2, favor: 1 }), flag('swingMemory'),
          ]),
          opt('Let go and see how high she gets.', [H('angry', 'TOO HIGH. {name}! TOO HIGH!'), n('She jumps off and lands badly. She doesn’t speak to you for the rest of the walk.'), add({ favor: -1 })]),
        ),
      ]),
      opt('“Aren’t you a bit old for swings?”', [H('cold', 'You’re worse at this than Hikaru. And she’s *terrible*.'), add({ favor: -1 })]),
      opt('Sit on the other swing and say nothing.', [
        n('After a while she sits on hers. Neither of you swings. It’s nice anyway.'),
        H('neutral', 'She used to sit exactly there. Where you are.'),
        add({ susp: -1 }),
      ]),
    ),
    hide('haruka'),
  ] });

  /* ---------- Study in class: the notes (was Rumour Patrol) ---------- */
  addTalk('classroom', { id: 'class_talk', cond: (s) => notD7(s) && s.day >= 4, scene: [
    bg('classroom_dusk'),
    n('Everyone has gone home. On Rin’s desk there’s a little pile of folded notes in round pink pen.'),
    n('Under them, in blue, smaller: three notes that just say *sorry*.'),
    choice(
      opt('Throw the pink notes in the bin.', [
        n('You tear them up first, so nobody can tape them back together.'),
        choice('And the blue ones?',
          opt('Leave them for Rin.', [
            n('The next morning Rin finds them. She reads all three, and folds them into her camera bag.'),
            show('rin', 'shy', 'center'), R('shy', 'Was that you? With the other notes? …Thank you, {name}.'), hide('rin'),
            flag('rinFriend'), flag('rumorsCleared'), add({ susp: -1, trust: 1 }),
          ]),
          opt('Bin those too. All of it.', [n('Clean desk. The next morning nobody knows anyone was sorry.'), flag('rumorsCleared')]),
        ),
      ]),
      opt('Read the pink notes.', [n('*photo club creep*, *stares at people*, *nobody wants to be in your pictures*.'), n('By morning, somehow everyone else has read them too.'), add({ susp: 1 })]),
      opt('Leave everything and go home.', [n('By morning the pile is bigger.'), add({ susp: 1 })]),
    ),
    add({ grades: 4 }, { quiet: true }),
  ] });

  /* ---------- Rooftop: the star chart (was Constellation; a line to remember) ---------- */
  addTalk('rooftop', { id: 'roof_talk', cond: (s) => notD7(s) && here() && s.day >= 3 && s.trust >= 1, scene: [
    bg('rooftop'),
    show('hikaru', 'shy', 'center'),
    n('Hikaru has her sketchbook open to a page of dots. Stars, numbered in blue pencil.'),
    K('shy', 'Join them. If you get it right, I’ll tell you what it is.'),
    choice('What shape do you draw?',
      opt('A train.', [
        K('surprised', '…Yeah. It’s a train. Nobody ever sees the train.'),
        K('shy', 'I drew these for Haruka once. To help her find her way home. You can keep this page.', rw('I drew these to hide from Haruka. Burn this page.', 'f_sketch')),
        flag('gotSketch'), add({ trust: 1 }),
      ]),
      opt('A heart.', [K('neutral', 'That’s what Haruka drew too. It’s not a heart.'), K('soft', 'It’s okay. They don’t connect for everyone.')]),
      opt('A cat.', [K('happy', 'A… cat. Okay. That’s a new one.'), n('She laughs, actually laughs, and then looks surprised at herself.'), add({ trust: 1 })]),
    ),
    hide('hikaru'),
  ] });

  /* ---------- Cafeteria: lunch swap (was Lunch Sort) ---------- */
  addTalk('cafeteria', { id: 'cafe_talk', cond: (s) => notD7(s) && here() && s.day >= 2 && s.money >= 0, scene: [
    bg('cafeteria'),
    show('haruka', 'smirk', 'left'), show('hikaru', 'neutral', 'right'),
    H('smirk', 'Test. You’re carrying our trays. If you get our lunches wrong, you’re banned from the window table forever.'),
    choice('Haruka’s tray gets…',
      opt('The strawberry milk and the sweet tamagoyaki.', [
        H('surprised', 'How do you know that?'),
        choice('And Hikaru’s gets…',
          opt('The plain onigiri and the blue can.', [
            H('surprised', 'How do you know what we both like? That’s creepy. …Nice creepy.'),
            K('smile', 'You pay attention. Nobody pays attention.'),
            add({ favor: 1, trust: 1 }),
          ]),
          opt('The same as Haruka. They’re twins.', [K('sad', 'Everyone does that.'), H('smile', 'See? It’s easier when we match.'), add({ favor: 1, susp: 1 })]),
        ),
      ]),
      opt('The grilled fish.', [show('haruka', 'angry', 'left'), H('angry', 'You gave me the *fish*. Do you even know me?'), add({ favor: -1 })]),
    ),
    hide('haruka'), hide('hikaru'),
  ] });

  /* ================= BIGGER CONVERSATIONS ================= */

  /* Courtyard, day 6+: “Do you like her more than me?” */
  addTalk('courtyard', { id: 'court_ask', cond: (s) => notD7(s) && s.day >= 6 && s.favor >= 3, scene: [
    bg('courtyard'),
    show('haruka', 'cold', 'center'),
    H('cold', 'Can I ask you something? And you have to answer properly. No being nice.'),
    H('neutral', 'Do you like her more than me?'),
    choice(
      opt('“I like you both. Differently.”', [
        H('cold', 'That’s what people say when the answer is yes.'),
        choice(
          opt('“Then yes. Sometimes. She’s easier to talk to.”', [
            H('sad', '…Thank you for not lying.'),
            H('neutral', 'She was always easier to talk to. That’s why I had to be loud.'),
            add({ susp: -1, favor: 1 }), flag('honestWithHaruka'),
          ]),
          opt('“No. I mean it. Differently.”', [H('smile', 'Okay. I’ll pretend I believe you.'), add({ favor: 1 })]),
        ),
      ]),
      opt('“You. Obviously.”', [
        H('happy', 'I KNEW it.'),
        H('eerie', 'Then you won’t mind if it’s just us soon. Right?'),
        choice(
          opt('“…Right.”', [n('She smiles at you for a long time without blinking.'), add({ favor: 2, susp: 2 })]),
          opt('“What do you mean, ‘just us’?”', [H('smile', 'Nothing! Forget it.'), add({ favor: 1 })]),
        ),
      ]),
      opt('“Why does it matter so much?”', [
        H('sad', 'Because if everyone likes her more, then what am I for?'),
        choice(
          opt('“You’re not for anything. You’re just you.”', [H('cry', '…Nobody’s ever said that like it was a good thing.'), add({ susp: -2, favor: 1 }), flag('askedHaruka')]),
          opt('“You’re her sister. That’s a lot.”', [H('neutral', 'Older by four minutes. I know. I know.'), add({ susp: -1 })]),
        ),
      ]),
    ),
    hide('haruka'),
  ] });

  /* Library, day 6+: Rin and the class photo (can tell Rin the name) */
  addTalk('library', { id: 'lib_photo', cond: (s) => notD7(s) && s.day >= 6 && s.flags.rinFriend, scene: [
    bg('library'),
    show('rin', 'worried', 'center'),
    R('worried', '{name}, have you looked at the class photo by the stairs lately?'),
    R('neutral', 'There’s a gap in the front row. Next to Haruka. Like someone was cut out, but the paper isn’t cut.'),
    choice(
      opt('“That’s where Hikaru stands.”', [
        R('surprised', 'Hikaru…'),
        R('worried', 'I know that name. I know I know that name. Why does it hurt to think about?'),
        choice(
          opt('“Because someone is trying to make us forget her.”', [R('soft', 'Then I’ll photograph her every day until it stops working.'), flag('rinKnows'), flag('photoClue'), add({ trust: 1 })]),
          opt('“Never mind. Forget I said it.”', [R('neutral', 'Okay.'), n('She writes something on her hand anyway. *H.*'), flag('photoClue')]),
        ),
      ]),
      opt('“It’s probably just the light.”', [R('sad', 'Yeah. Probably the light.'), n('She doesn’t believe you. She takes a photo of the gap anyway.'), flag('photoClue')]),
      opt('“Don’t look at it. Seriously.”', [R('worried', 'That’s the scariest thing you could have said.'), add({ susp: 1 })]),
    ),
    hide('rin'),
  ] });

  /* Station, day 8 (if Hikaru came back): “If I go for good…” */
  addTalk('station', { id: 'sta_last', cond: (s) => s.day === 8 && s.flags.hikaruBack, scene: [
    bg('station'),
    show('hikaru', 'soft', 'center', { ghost: true }),
    K('soft', 'You found me. At the end of the platform, where I said I’d be.'),
    K('sad', 'If tomorrow goes wrong, and I go for good… will you tell her I wasn’t mean? Not really?'),
    choice(
      opt('“You’re not going anywhere. I won’t let you.”', [
        K('soft', 'You can’t stop the trains, {name}.'),
        choice(
          opt('“Watch me.”', [K('happy', '…Okay. I believe you. That’s the scary part.'), add({ trust: 2 })]),
          opt('“Then I’ll remember you. Every word.”', [K('cry', 'That’s all I wanted. Somebody to remember the real version.'), add({ trust: 1 })]),
        ),
      ]),
      opt('“Tell her yourself. Tomorrow. With me.”', [K('surprised', 'Both of us? In the same room? On purpose?'), K('soft', '…Okay. Bring the bracelet if you found it. She’ll know what it means.'), add({ trust: 1 }), flag('planTogether')]),
      opt('“Maybe it’d be easier for everyone.”', [show('hikaru', 'blank', 'center', { ghost: true }), K('blank', '…Yeah. Maybe.'), n('The next train comes in. When it leaves, she’s gone.'), add({ trust: -2 })]),
    ),
    hide('hikaru'),
  ] });

  /* Mall atrium, first visit from day 3: the twins argue by the fountain */
  scene('mall_twins', [
    show('haruka', 'angry', 'left'), show('hikaru', 'worried', 'right'),
    n('By the pink fountain, the Amane twins are arguing. Quietly, which is worse.'),
    H('angry', 'You *said* you’d wear the matching cardigan to the matsuri.'),
    K('worried', 'I said I’d think about it.'),
    H('cold', 'Same thing. {name}! Tell her. Matching is cute. Matching is *normal*.'),
    choice(
      opt('“Matching is cute.”', [H('smirk', 'See?'), K('sad', '…Right.'), add({ favor: 1, trust: -1, susp: 1 })]),
      opt('“Hikaru can wear what she wants.”', [
        H('cold', 'Oh, so you’re on *her* side.'),
        choice(
          opt('“I’m on both your sides.”', [H('neutral', '…That’s not a thing.'), K('soft', 'It could be a thing.'), add({ trust: 1 }), flag('bothSides')]),
          opt('“Yes. I am.”', [H('angry', 'Fine. FINE.'), n('Haruka storms off towards the escalator. Hikaru mouths *thank you* and follows her.'), add({ trust: 2, favor: -2, susp: 2 })]),
        ),
      ]),
      opt('“What if you matched one thing? Just one?”', [
        H('surprised', 'One thing?'),
        K('soft', 'One thing is okay. One thing is nice, actually.'),
        H('smile', '…Fine. One thing. But it’s the cutest thing.'),
        add({ trust: 1, favor: 1, susp: -1 }), flag('oneThingIdea'),
      ]),
    ),
    hide('haruka'), hide('hikaru'),
    flag('mallTwins'),
  ]);
  DL.Events.mall[0].scene.splice(2, 0, iff((s) => s.day >= 3 && notD7(s) && here() && !s.flags.mallTwins, [call('mall_twins')]));
})();
