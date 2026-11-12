/* THE MIKAGE SIBLINGS, and THE SWAPPED WEEK.

   Rei and Sei Mikage, class 2-A, student council. Blonde with a red streak, navy blazers,
   matching smiles. They notice people who are fading. They follow you home. They believe
   nobody misses what nobody remembers, and that somebody has to "tidy up" the forgotten.
   (It's never shown. It's very strongly implied.)
   - Day 3 they introduce themselves on the stairs. Day 4 they text you. They follow you home.
   - New lunch place: the Student council room (tea, homemade buns, a deal, a table set for two).
   - Make a deal with them and the final choice gets a dark new ending: Welcome Party.

   THE SWAPPED WEEK: dress Haruka in Hikaru's style and Hikaru in Haruka's at the Saturday
   fitting, and the story goes a different way from the matsuri to Thursday. The town erases
   whoever is wearing blue... and that's Haruka now. New ending: Each Other. */
(() => {
  const { scene, bg, show, hide, hideAll, say, n, H, K, R, REI, SEI, me, X, V, rw, opt, choice, add, flag, iff, go, call, js, sfx, music, fx, diary, card, ending, wait, phone, msg, reply, phoneClose, has, f } = DL.DSL;
  const here = () => DL.State.hikaruHere();
  // Which story? 'original' (no Mikage siblings) or 'mikage'. Old saves: on if you'd already met them.
  const MIK = (s) => s.mode === 'mikage' || (!s.mode && !!s.flags.mikageMet);
  DL.Mikage = { on: MIK };
  const notD7 = (s) => s.day !== 7;
  const MIK_DM = { sub: 'number not saved', initial: '?', color: 'linear-gradient(135deg, #f7ecd6, #c43048)' };
  const lastCmd = (id) => DL.Engine.scenes[id][DL.Engine.scenes[id].length - 1];
  function appendTo(id, cmds) {
    const list = DL.Engine.scenes[id];
    const tail = lastCmd(id);
    list.splice(tail && tail.t === 'goto' ? list.length - 1 : list.length, 0, ...cmds);
  }

  /* ================= THE MIKAGES (main story) ================= */

  // Day 3: on the stairs
  scene('mik_intro', [
    bg('stairs'),
    show('rei', 'smile', 'left'), show('sei', 'smile', 'right'),
    n('On the stairs, two students from 2-A are waiting. Blonde, one red streak each, navy blazers buttoned all the way up.'),
    n('The girl is smiling. The boy is trying to. His hands are clasped so tight his knuckles have gone white, and there’s sweat at his temple.'),
    REI('smile', 'You’re {name}. The transfer student.'),
    SEI('worried', 'I’m… Mikage Sei. That’s my sister, Rei. We’re, um. Student council.'),
    REI('smile', 'We like to meet everyone new. Fresh faces are so rare in Sakuragaoka.'),
    REI('smile', 'Sei. Tell them what we noticed.'),
    SEI('worried', 'You sit next to the… the quiet Amane girl. The blue one.'),
    REI('eerie', 'She’s getting quieter. We’ve noticed. We always notice.'),
    choice(
      opt('“Noticed what?”', [
        REI('smile', 'When people fade in this town, someone has to tidy up afterwards.'),
        SEI('worried', '…It would be such a waste otherwise.'),
        n('He says it like a line he’s practised in front of a mirror. He doesn’t look at you once.'),
        choice(
          opt('“…A waste of what?”', [REI('happy', 'You ask such good questions. Come to the council room at lunch sometime. We’ll explain over tea.'), SEI('worried', '…Please don’t come.'), n('He says it so quietly that Rei doesn’t hear. Or pretends not to.'), flag('mikageCurious'), flag('seiPlea')]),
          opt('“Stay away from Hikaru.”', [REI('happy', 'Hikaru. So that’s her name. Thank you. Names make it so much easier.'), SEI('worried', 'You shouldn’t have told her that.'), add({ susp: 1 })]),
        ),
      ]),
      opt('“Nice to meet you. I have to go.”', [REI('smile', 'Of course. We’ll see you around. All the way around.'), SEI('worried', 'Bye. Walk the bright way home.')]),
      opt('Walk past without saying anything.', [n('As you pass, Rei leans in very slightly, like she’s smelling your hair.'), REI('smile', 'New school shampoo. Lovely.')]),
    ),
    hide('rei'), hide('sei'),
    flag('mikageMet'),
    diary('Met the Mikage siblings from 2-A. They already knew my name.'),
  ]);
  appendTo('d3_morning', [iff(MIK, [call('mik_intro')])]);

  // Day 4 evening: a message from an unknown number
  scene('mik_text', [
    phone('Unknown number', MIK_DM),
    msg('rei', 'you walk home the long way. past the vending machine.'),
    msg('rei', 'we like the long way too.'),
    msg('sei', 'your bedroom light is still on.'),
    msg('sei', 'please turn it off. she likes it when she can see in.'),
    reply(
      opt('Who is this?', [msg('rei', 'you know who 🙂'), msg('sei', 'sorry. goodnight.')]),
      opt('Leave me alone.', [msg('rei', 'that’s what everyone says at first.'), msg('sei', 'i’m sorry. i’m so sorry. lock your window.'), add({ susp: 1 })]),
      opt('Block the number.', [msg('rei', 'Blocked numbers can’t reach you.', { deleteAfter: 1400 }), msg('rei', 'but we’re not a number. we’re outside.'), msg('sei', 'it never helps. it never helps.', { deleteAfter: 1600 })]),
    ),
    phoneClose(),
    flag('mikageTexts'),
  ]);
  { const list = DL.Engine.scenes.d4_evening; let k = -1; list.forEach((c, i) => { if (c.t === 'phoneClose') k = i; }); list.splice(k + 1, 0, iff(f('mikageMet'), [call('mik_text')])); }

  // Walk home: footsteps that match yours
  {
    const pool = DL.Events.street, k = pool.findIndex((e) => e.repeat);
    pool.splice(k, 0, { id: 'mik_walk', cond: (s) => notD7(s) && s.day >= 4 && s.flags.mikageMet, scene: [
      bg('street'), music('uneasy'),
      n('Walking home, you notice your footsteps sound doubled. Then tripled.'),
      n('Every time you stop, the extra footsteps stop too. Exactly in time.'),
      choice(
        opt('Turn around.', [
          show('rei', 'smile', 'left'), show('sei', 'smile', 'right'),
          REI('smile', 'Oh! What a coincidence.'),
          SEI('worried', 'We… live this way too. Now.'),
          n('Sei is a step behind his sister, out of breath, like he was trying to keep up. Or trying to get ahead and warn you.'),
          choice(
            opt('“You’re following me.”', [REI('happy', 'We’re walking you home. It’s different.'), REI('smile', 'Lots of people go missing on the walk home. We’d hate for you to be one of them. Before we’re ready.'), SEI('worried', 'Go inside. Lock the door. Please.'), add({ susp: 1 })]),
            opt('“Which way do you live, then?”', [REI('smile', 'Whichever way you do. Isn’t that convenient?'), SEI('worried', '…Whichever way she does.')]),
          ),
          hide('rei'), hide('sei'),
        ]),
        opt('Run.', [n('You run the whole way home. When you lock the door and look through the peephole, there are two shapes at the end of the street. Waving.'), add({ energy: -10 })]),
        opt('Walk faster and stop at the vending machine.', [n('In the dark glass of the vending machine, you see them behind you. Rei is holding her phone up. The flash goes off.'), flag('mikagePhoto')]),
      ),
      diary('The Mikage siblings followed me home. They said it was a coincidence.'),
    ] });
  }

  // New lunch place: the student council room
  DL.Data.LOCATIONS.push({
    id: 'council', slot: 'lunch', name: 'Student council room', jp: '生徒会室', bg: 'library',
    gain: { energy: 15 }, visible: (s) => s.day >= 4 && s.flags.mikageMet,
    hint: (s) => (s.day === 7 ? '!the table is set for two. one of the places has your name on it.' : 'The Mikage siblings eat lunch here. They always have spare tea. And buns.'),
  });
  const tint = (k) => fx('tint', { kind: k });
  const untint = js((s) => { DL.FX.tint(s.day === 7 || (s.day === 8 && !s.flags.hikaruBack) ? 'pink' : null); });
  DL.Events.council = [
    { id: 'cou_7', cond: (s) => s.day === 7, scene: [
      bg('feast'), tint('red'), music('drone'),
      n('The council room door doesn’t open into the council room.'),
      n('It opens into a corridor that shouldn’t fit inside the school. A long table runs all the way down it, set for more people than there are in 2-B. Most of the plates have already been used.'),
      n('In the middle of the table, in a little frame: a photo of the Amane twins. Somebody has blurred their faces with a wet thumb.'),
      iff(f('seiAlly'), [
        show('rei', 'smile', 'center'),
        REI('smile', 'You came. We set a place for you.'),
        n('Sei’s chair is empty. His chopsticks are snapped in half and laid neatly across his plate.'),
        REI('happy', 'My brother isn’t hungry today. He’s been talking to someone. Talking makes people so thin.'),
      ], [
        show('rei', 'smile', 'left'), show('sei', 'worried', 'right'),
        REI('smile', 'You came. We set a place for you.'),
        SEI('worried', '…For after.'),
      ]),
      n('Next to the frame, folded neatly: a pale blue hair ribbon.'),
      choice(
        opt('“Whose ribbon is that?”', [REI('smile', 'Nobody’s. Nobody remembers. If nobody remembers, it doesn’t count.'), iff((s) => s.frags.length >= 3, [me('I remember.'), n('For the first time, Rei stops smiling. The lights along the corridor dim, one by one, all the way to the far door.'), REI('cold', '…Then she isn’t ready yet.'), add({ trust: 1 })])]),
        opt('Back out of the room.', [n('Nobody follows. Through the door you hear chopsticks being laid down, very carefully, side by side, all the way down the table.')]),
      ),
      hideAll(), untint,
      flag('sawPlates'),
      diary('The council room was a corridor with a table that never ended. There was a blue ribbon next to the twins’ photo.'),
    ] },
    { id: 'cou_1', cond: notD7, scene: [
      bg('library'),
      show('rei', 'smile', 'left'), show('sei', 'smile', 'right'),
      n('The student council room is very tidy. Too tidy. There’s a rice cooker, a hot-water flask and a plate of homemade meat buns.'),
      REI('happy', 'Our guest! Sit, sit. Have a nikuman. Family recipe.'),
      SEI('worried', 'Nobody remembers who it came from. That’s what makes it ours.'),
      n('Sei says it to his empty plate. He hasn’t touched his own bun.'),
      choice(
        opt('Eat one.', [
          n('It’s… delicious. Rich and sweet. Rei watches every bite without blinking. Sei looks at the wall.'),
          REI('smile', 'Good. Now you’re one of us a little bit.'),
          add({ energy: 20 }), flag('ateBun'),
        ]),
        opt('“I’m not hungry.”', [REI('smile', 'Everyone’s hungry. Some people just haven’t noticed yet. We’ll save it for you.'), SEI('worried', 'Good. Don’t— I mean. Good.')]),
        opt('“What’s in them?”', [REI('happy', 'Pork, mostly.'), SEI('worried', '…Mostly.'), n('Rei laughs. A second later Sei laughs too, like he’s catching up to her.')]),
      ),
      REI('smile', 'Can I ask you something? Which Amane do you like more?'),
      SEI('worried', 'Rei, we said we wouldn’t—'),
      REI('cold', 'Sei.'),
      n('He stops talking instantly.'),
      REI('smile', 'We need to know which one to save for last.'),
      choice(
        opt('“Neither. Leave them alone.”', [REI('smile', 'You’re sweet. Sweet things go first.'), add({ susp: 1 })]),
        opt('“That isn’t funny.”', [REI('neutral', 'Oh, I wasn’t joking.'), SEI('worried', 'She never jokes at lunch.')]),
        opt('“Haruka.”', [REI('happy', 'Then the blue one’s first. Thank you, {name}.'), add({ trust: -1 }), flag('toldMikage')]),
      ),
      hide('rei'), hide('sei'),
      diary('Lunch with the Mikage siblings. They asked which twin to “save for last”.'),
    ] },
    { id: 'cou_2', cond: (s) => notD7(s) && s.day >= 6, scene: [
      bg('library'), tint('dusk'),
      show('rei', 'neutral', 'left'), show('sei', 'neutral', 'right'),
      REI('smile', 'I’ll be honest with you, {name}. It’s spring. We’re very hungry.'),
      SEI('worried', 'I’m not.'),
      REI('smile', 'He is. The blue Amane girl is almost gone. When someone’s almost gone, nobody minds if they finish going.'),
      REI('happy', 'Let us help. You won’t even remember there was a problem. That’s the kindest part.'),
      iff(f('seiAlly'), [n('Behind his sister, Sei shakes his head at you. Tiny. Desperate.')]),
      choice('What do you say?',
        opt('“…Fine. Do it.”', [
          REI('happy', 'Wonderful. We’ll invite you, after.'),
          SEI('worried', '…I’m sorry.'), n('Sei says it to you, not to her.'),
          add({ trust: -3, susp: 2 }), flag('mikageDeal'),
          diary('I made a deal with the Mikage siblings. I don’t want to write down what it was.'),
        ]),
        opt('“Not her. Not anyone.”', [
          REI('cold', 'Everyone says that.'),
          REI('smile', 'Then we’ll wait. We’re very good at waiting. We waited for you, didn’t we?'), SEI('worried', '…Thank you.'),
          add({ trust: 1 }), flag('mikageRefused'),
          diary('Told the Mikage siblings no. They said they’d wait.'),
        ]),
        opt('“If I remember her, you can’t touch her. Right?”', [
          SEI('surprised', '…Who told you that?'),
          REI('cold', 'That’s not a rule you’re supposed to know.'),
          n('For a second, Rei’s smile slips. Underneath, there’s nothing at all.'),
          iff(f('seiAlly'), [n('Then, very slowly, she turns to look at her brother.'), flag('reiSuspects')]),
          add({ trust: 2 }), flag('mikageRule'), flag('mikageRefused'),
          diary('The Mikages can’t take someone who’s remembered. I have to keep remembering.'),
        ]),
      ),
      hide('rei'), hide('sei'), untint,
    ] },
    { id: 'cou_any', repeat: true, scene: [
      bg('library'),
      n('The council room door is locked. Through the frosted glass, two silhouettes are sitting very still, facing the door.'),
      n('One of them waves.'),
    ] },
  ];

  // Day 8: at the gate
  scene('mik_gate8', [
    iff(f('mikageDeal'), [
      show('rei', 'happy', 'left'), show('sei', 'smile', 'right'),
      n('The Mikage siblings are standing at the school gate, one on each side, like statues. Sei has a bruise on his wrist he keeps trying to hide with his sleeve.'),
      REI('happy', 'Not long now, {name}. We’re setting the table.'),
      hide('rei'), hide('sei'),
    ], [iff(f('mikageMet'), [n('At the gate, two blonde heads with red streaks are watching the Amane house from across the road. When you look again, they’re gone.')])]),
  ]);
  appendTo('d8_morning', [call('mik_gate8')]);

  // Final choice: the Mikages' ending
  const finalChoice = DL.Engine.scenes.d9_choice[0];
  const badIdx = finalChoice.opts.findIndex((o) => o.body && o.body[0] && o.body[0].id === 'end_bad');
  finalChoice.opts.splice(badIdx, 0, opt('“Rei. Sei. She’s all yours.”', [go('end_feast')], { if: (s) => !!s.flags.mikageDeal }));

  scene('end_feast', [
    show('rei', 'happy', 'left'), show('sei', 'smile', 'right'),
    n('The classroom door slides open. The Mikage siblings come in without knocking, one on each side of Haruka.'),
    H('surprised', 'Who are you? Get out, this is—'),
    REI('happy', 'Shh. It’s a party. A welcome party.'),
    SEI('worried', 'For {name}. Our… newest member.'),
    music('drone'), bg('feast'),
    n('The council room. The corridor. The table that doesn’t end. Everyone from 2-B is here, sitting very politely in rows. Nobody is talking.'),
    n('There are a lot of plates. You can’t look at what’s on them. You can’t remember why you can’t.'),
    REI('smile', 'Thank you for the meal, {name}.'),
    REI('happy', 'We saved you a seat. We always will.'),
    iff(f('seiBetrayed'), [n('At the far end of the table, one seat is empty. Its chopsticks are snapped in half. Nobody remembers whose seat it was.')], [n('Across the table, Sei holds his chopsticks and doesn’t eat. He’s crying without making any sound.')]),
    sfx('static'), fx('flash', { color: '#c43048', ms: 380 }),
    ending('feast'),
  ]);

  /* ================= THE SWAPPED WEEK ================= */

  // Saturday: they go to the matsuri as each other
  scene('sat_swapped', [
    js((s) => { s.flags.twinSwap = true; }),
    bg('station', { clean: true }),
    show('haruka', 'shy', 'left'), show('hikaru', 'happy', 'right'),
    n('Sakuragaoka Station at dusk. Paper lanterns, food stalls, and the Amane twins, dressed as each other.'),
    n('Haruka is in soft blue, hands in her sleeves. Hikaru is in pink and leopard, and she keeps catching her reflection in shop windows.'),
    X('Stall owner', 'Hikaru-chan! Haven’t seen you smile like that in years. And Haruka, so quiet tonight!'),
    H('shy', '…He thinks I’m her. Everyone thinks I’m her.'),
    K('happy', 'And they think I’m YOU. Watch.'),
    K('smirk', 'Excuse me? These takoyaki are cold. Do better.'),
    n('The stall owner apologises three times and gives her two extra. Hikaru looks shocked at herself, then delighted, then guilty.'),
    K('worried', '…Oh no. That was so easy. Is that what it’s like for you? All the time?'),
    H('soft', 'And is this what it’s like for you? Nobody looks at me. It’s… so quiet. I can hear the trains.'),
    show('rin', 'surprised', 'center'),
    R('surprised', 'Oh! Can I take your photo? …Wait. Which one of you is which?'),
    choice(
      opt('“Does it matter?”', [R('soft', 'In a photo? Never. That’s the nice thing about photos.'), flag('goodPhoto')]),
      opt('“Haruka’s the one in blue.”', [R('worried', 'That can’t be right. The blue one is always… the faint one.'), flag('photoClue')]),
    ),
    hide('rin'),
    iff(MIK, [
    show('sei', 'smile', 'center'),
    n('By the ticket gate, Sei Mikage is eating candy floss, watching. Rei is nowhere. Then she’s right behind you.'),
    say('rei', 'smile', 'Interesting. Swapping the labels.', { label: 'Rei', plate: 'crimson' }),
    SEI('worried', 'Please don’t stay like this. It doesn’t change anything for her. It just changes the order.'),
    hide('sei'),
    ]),
    H('worried', '{name}. Can we stay like this? Just until Thursday? I want to know what it’s like. Being her.'),
    K('worried', 'I want to know what it’s like being you, too.'),
    choice('What do you say?',
      opt('“Stay swapped. Just for the week.”', [
        H('soft', 'Okay. Monday, I’m Hikaru.'),
        K('happy', 'Monday, I’m HARUKA. Oh, this is going to be awful. I love it.'),
        diary('Dressed the twins as each other. They’re going to stay swapped until Thursday.'),
        card('Sunday passes quietly. Too quietly.', { num: '日曜日', jp: '4月19日', en: 'Sunday' }),
        go('swap_mon'),
      ]),
      opt('“Swap back. Please. Something feels wrong.”', [
        js((s) => { s.flags.twinSwap = false; s.flags.swapTried = true; }),
        n('They swap back in the station toilets, laughing. When they come out, the lanterns look a little dimmer.'),
        add({ trust: 1, favor: 1 }),
        diary('The twins tried being each other for one night. Then they swapped back.'),
        card('Sunday passes quietly.', { num: '日曜日', jp: '4月19日', en: 'Sunday' }),
        js(() => { DL.FX.applyLevel(DL.State.corruption()); DL.Audio.setMood('uneasy'); DL.Screens.hud(true); }),
      ]),
    ),
  ]);

  const day = (d) => js((s) => { s.day = d; s.phase = 'morning'; DL.Screens.hud(true); DL.FX.applyLevel(DL.State.corruption()); });

  // Monday (Day 6)
  scene('swap_mon', [
    day(6), music('uneasy'),
    card('', { num: 'Day 6', jp: '月曜日　4月20日', en: 'Monday' }),
    bg('classroom'),
    X('Ms. Kanda', 'Roll call. Amane, Haruka.'),
    n('The girl in pink and leopard print sticks her hand up and shouts *HERE*. It’s Hikaru.'),
    X('Ms. Kanda', 'Amane, Hikaru.'),
    n('The girl in the window seat, in soft blue, lifts one finger. It’s Haruka. Nobody notices it isn’t really her.'),
    show('haruka', 'neutral', 'center'),
    H('neutral', '(whispering) Nobody looks at this seat. Did you know? Nobody. All day.'),
    choice(
      opt('“How does it feel?”', [
        H('sad', 'Peaceful. And lonely. She’s been sitting here alone for years, hasn’t she.'),
        H('worried', 'And I sat at the window table being loud so nobody would notice she was alone.'),
        add({ susp: -2, favor: 1 }), flag('swapLearnH'),
      ]),
      opt('“Do you want to stop?”', [H('cold', 'No. Not yet. I need to understand something first.')]),
    ),
    hide('haruka'),
    bg('cafeteria'),
    show('hikaru', 'smirk', 'center'),
    n('At lunch, Hikaru holds court at the window table. Everybody laughs at what she says. She looks like she might be sick.'),
    K('worried', '{name}, I said something mean about Rin’s shoes and everyone LAUGHED. It’s so easy. It’s so easy it’s scary.'),
    choice(
      opt('“Then stop. You don’t have to be her.”', [K('soft', 'But she had to be her. Every day. I never understood how tired she must be.'), add({ trust: 1 }), flag('swapLearnK')]),
      opt('“You’re good at it.”', [K('blank', '…Yeah. That’s the scary part.'), add({ susp: 1 })]),
    ),
    hide('hikaru'),
    bg('hallway'),
    n('On the way out, you pass the class photo by the stairs. In it, the girl in blue is very slightly blurred. The girl in pink is perfectly sharp.'),
    iff(MIK, [
    show('rei', 'smile', 'left'), show('sei', 'smile', 'right'),
    REI('smile', 'The blue one’s fading. Right on schedule.'),
    SEI('worried', 'It never mattered which one. Only which one’s wearing blue. I’m sorry.'),
    hide('rei'), hide('sei'),
    ]),
    diary('Swapped Monday. Haruka sat in the window seat and nobody looked at her. The blue one in the class photo is blurring.'),
    go('swap_tue'),
  ]);

  // Tuesday (Day 7): the erased one is wearing blue
  scene('swap_tue', [
    day(7), music('drone'), fx('tint', { kind: 'pink' }),
    card('', { num: 'Day 6', jp: '火曜日', en: 'Tuesday', glitchTo: 'Day 7' }),
    bg('classroom'),
    X('Ms. Kanda', 'Roll call. Amane, Haruka.'),
    show('hikaru', 'worried', 'center'),
    K('worried', '…Here.'),
    X('Ms. Kanda', 'That’s everyone.'),
    n('The window seat is empty. Everyone looks straight through it.'),
    K('cry', '{name}. Everyone keeps calling me Haruka. Where is she? Where’s my SISTER?'),
    K('sad', 'I tried to say her name and it came out wrong. It came out as mine.'),
    choice('Where do you look?',
      opt('The end of the platform.', [
        bg('station', { variant: 'g1' }),
        show('haruka', 'sad', 'center', { ghost: true }),
        n('At the far end of the platform, faint as breath on glass: a girl in soft blue, watching the trains.'),
        H('sad', 'So this is what it felt like. Being her. Being the one who fades.'),
        H('soft', 'I always thought she liked being quiet. She was just being quiet so I could be loud.'),
        flag('swapFoundH'), add({ favor: 2 }),
      ]),
      opt('The student council room.', [
        bg('feast'),
        show('rei', 'smile', 'left'), show('sei', 'worried', 'right'),
        n('The council room door opens onto the long table. Two clean plates at the near end. Between them, folded neatly: a pale blue hair clip that used to be Hikaru’s and is now Haruka’s.'),
        REI('smile', 'You’re early, {name}. She isn’t quite ready.'),
        choice(
          opt('Grab the clip and run.', [n('You snatch it off the table. Behind you, two chairs scrape back at exactly the same time. Nobody follows. Yet.'), flag('swapSavedClip'), add({ susp: -1 })]),
          opt('“Take her, then.”', [REI('happy', 'Thank you, {name}. We will.'), SEI('worried', '…No.'), flag('swapFed')]),
        ),
        fx('tint', { kind: 'pink' }),
      ], { if: MIK }),
      opt('Nowhere. Maybe she never existed.', [
        K('blank', '…Maybe.'),
        V('Good. There was only ever one of us. And she wears pink.'),
        flag('swapGaveUp'), add({ trust: -2 }),
      ]),
    ),
    hideAll(),
    diary('Day 7. The girl who disappeared was the one wearing blue. This time that was Haruka.'),
    go('swap_wed'),
  ]);

  // Wednesday (Day 8): the twins' room, the truth, and the faces at the window
  scene('swap_wed', [
    day(8), music('uneasy'),
    card('', { num: 'Day 8', jp: '水曜日', en: 'Wednesday' }),
    bg('sisters_room'),
    iff((s) => s.flags.swapFoundH || s.flags.swapSavedClip, [
      show('haruka', 'sad', 'left'), show('hikaru', 'worried', 'right'),
      n('Both twins are in the room, still in each other’s clothes. Haruka is faint around the edges, like a photo left in the sun.'),
      H('sad', 'I was mean so you wouldn’t be alone in it. That’s all it ever was.'),
      K('cry', 'I was mean ONCE, to protect you. And then I kept being mean so you wouldn’t be alone in it.'),
      H('surprised', '…We were doing the exact same thing.'),
      K('happy', 'For SIX YEARS.'),
      flag('swapTruth'), add({ trust: 2, favor: 2, susp: -3 }),
    ], [
      show('hikaru', 'blank', 'center'),
      n('Only one twin is in the room. Pink. Leopard print. She’s doing her eyeliner, perfectly, without a mirror.'),
      K('blank', 'Haruka’s side of the room is so tidy now. Like nobody ever lived there.'),
    ]),
    iff(MIK, [
    sfx('static'),
    n('Something taps on the window. Twice. Then twice again.'),
    n('Two blonde heads with red streaks, upside down, looking in from the roof. Smiling.'),
    choice(
      opt('Close the curtains.', [n('You yank them shut. The tapping stops. Then it starts again on the door.'), add({ susp: 1 })]),
      opt('Open the window and say their rule out loud.', [
        iff((s) => s.flags.mikageRule || s.frags.length >= 5, [
          me('You can’t take someone who’s remembered. And I remember both of them.'),
          n('The faces at the window stop smiling. Slowly, they slide up out of view, like they were never there.'),
          flag('swapProtected'),
        ], [
          me('Leave them alone!'),
          n('Rei laughs. It sounds exactly like Sei laughing. It sounds exactly like Haruka.'),
        ]),
      ]),
    ),
    ], [
      n('Outside, the street light flickers blue, then pink, then blue. Like it can’t decide either.'),
      flag('swapProtected'),
    ]),
    hideAll(),
    go('swap_thu'),
  ]);

  // Thursday (Day 9): the choice
  scene('swap_thu', [
    day(9), music('drone'),
    card('', { num: 'Day 9', jp: '木曜日', en: 'Thursday', glitchTo: 'Last day' }),
    bg('classroom_dusk'),
    show('haruka', 'neutral', 'left'), show('hikaru', 'neutral', 'right'),
    n('After school, in the empty classroom, the twins stand on either side of the window seat. Haruka in blue. Hikaru in pink.'),
    iff(f('swapTruth'), [
      H('soft', 'It’s Thursday.'),
      K('soft', 'You said Thursday.'),
    ], [V('There’s only one of us now, {name}. Doesn’t she look happy?')]),
    choice('What do you do?',
      opt('“Swap back. Be yourselves. But keep one thing from each other.”', [go('end_reflection')], {
        lock: (s) => (s.flags.swapTruth ? null : 'They haven’t told each other the truth yet.'),
      }),
      opt('“Stay like this. Forever.”', [go('end_swap_route')]),
      opt('Open the classroom door for the Mikages.', [go('end_feast')], { if: (s) => !!s.flags.swapFed || !!s.flags.mikageDeal }),
      opt('“There was only ever one of you.”', [go('end_bad')], { if: (s) => !!s.flags.swapGaveUp }),
    ),
  ]);

  scene('end_reflection', [
    music('sweet'),
    H('soft', 'One thing each?'),
    K('soft', 'One thing each.'),
    n('Haruka unpins the blue hair clip and holds it out. Hikaru takes off one leopard earring and puts it in her sister’s hand.'),
    n('Then they swap back. When Haruka turns around in her own pink clothes, she’s solid again, all the way to the edges.'),
    fx('flash', { color: '#fff4fb', ms: 320 }), fx('tint', { kind: null }), fx('level', { level: 0 }),
    bg('station', { clean: true, force: true }),
    hideAll(),
    show('haruka', 'happy', 'left'), show('hikaru', 'happy', 'right'),
    H('happy', 'I’m keeping the clip.'),
    K('happy', 'I’m keeping the earring. And I’m being rude to a takoyaki man at least once a month.'),
    H('smirk', 'Four minutes older and you’re *still* copying me.'),
    K('soft', 'Four minutes older and you finally sat in my seat.'),
    iff((s) => !!s.flags.swapProtected && MIK(s), [n('At the far end of the platform, two blonde shapes turn and walk away into the dark, very hungry, and very disappointed.')]),
    ending('reflection'),
  ]);

  scene('end_swap_route', [
    H('smile', 'Forever?'),
    K('smile', 'Forever.'),
    n('They don’t swap back. Not on Thursday, not on Friday, not ever.'),
    n('After a while, they stop correcting people. After a while longer, they stop correcting each other.'),
    ending('swap'),
  ]);

  // While the twins are swapped, Haruka looks like Hikaru and Hikaru looks like Haruka
  DL.Sprites.swapCheck = () => { const s = DL.State.s; return !!(s && s.flags.twinSwap && !s.flags.ending); };

  // Monday morning: if they stayed swapped, the week goes a different way
  { const list = DL.Engine.scenes.d6_morning; const k = list.findIndex((c) => c.t === 'call' && c.id === 'saturday'); list.splice(k + 1, 0, iff(f('twinSwap'), [go('swap_mon')])); }
})();
