/* NEW STORY & HORROR.
   - Three new places: the Music room (lunch), the Inari shrine and Rin's darkroom (after school)
   - The window seat: a planner card that only appears on days 7 and 8
   - 3 a.m. phone calls, blue and pink lines in your diary that you didn't write
   - The class photo by the stairs, which changes every other day
   - Voice notes in the evening chats
   - Twelve lost charms from Hikaru's bracelet, hidden around town
   - Two new endings: Two Lights (true ending) and Overexposed (dark) */
(() => {
  const { scene, bg, show, hide, hideAll, say, n, H, K, R, me, X, V, rw, opt, choice, add, flag, iff, go, call, js, sfx, music, fx, diary, msg, wait, ending, has, f } = DL.DSL;
  const here = () => DL.State.hikaruHere();
  const notD7 = (s) => s.day !== 7;
  const restoreTint = js((s) => { DL.FX.tint(s.day === 7 || (s.day === 8 && !s.flags.hikaruBack) ? 'pink' : null); });

  function inject(id, find, cmds, { before = false, last = false } = {}) {
    const list = DL.Engine.scenes[id];
    if (!list) throw new Error('inject: no scene ' + id);
    let k = -1;
    for (let i = 0; i < list.length; i++) if (find(list[i])) { k = i; if (!last) break; }
    if (k < 0) throw new Error('inject: no match in ' + id);
    list.splice(before ? k : k + 1, 0, ...cmds);
  }

  /* ================= NEW PLACES ================= */
  DL.Data.LOCATIONS.push(
    {
      id: 'musicroom', slot: 'lunch', name: 'Music room', jp: '音楽室', bg: 'classroom',
      gain: { energy: 10 }, visible: (s) => s.day >= 2,
      hint: (s) => (s.day === 7 ? '!the piano is playing. nobody is sitting at it.' : s.flags.pianoMet ? 'Hikaru might be at the piano again.' : 'Someone plays the piano here at lunch. Badly on purpose?'),
    },
    {
      id: 'shrine', slot: 'after', name: 'Inari shrine', jp: '稲荷神社', bg: 'shrine',
      gain: { energy: 10, money: -100 }, visible: (s) => s.day >= 2,
      block: (s) => (s.money < 100 ? 'A fortune costs ¥100.' : ''),
      hint: (s) => (s.day === 7 ? '!every wish on the wall has the same name scratched out.' : 'A tiny fox shrine behind the park. ¥100 fortunes and wooden wishes.'),
    },
    {
      id: 'darkroom', slot: 'after', name: 'Photo club darkroom', jp: '暗室', bg: 'darkroom',
      gain: { grades: 3, energy: -10 }, visible: (s) => s.day >= 3,
      hint: (s) => (s.day === 7 ? '!a photo is developing. it is of you.' : 'Rin develops her film here. Red light, chemical smell, total silence.'),
    },
    {
      id: 'windowseat', slot: 'after', name: 'The window seat', jp: '窓際の席', bg: 'classroom_dusk',
      gain: { energy: -15 }, visible: (s) => s.day === 7 || (s.day === 8 && !s.flags.sawSeat8),
      hint: () => '!sit down. it is still warm.',
    },
  );

  /* ---------- Music room ---------- */
  DL.Events.musicroom = [
    { id: 'mus_7', cond: (s) => s.day === 7, scene: [
      bg('classroom'), fx('tint', { kind: 'pink' }),
      n('The music room door is open. The piano is playing a slow, simple tune.'),
      n('There’s nobody on the bench. The keys go down by themselves, one at a time, like someone pressing them very gently.'),
      sfx('static'),
      n('It’s the train song. You don’t know how you know that.'),
      n('On the music stand there’s a page of sheet music. Pencilled in the margin, in small blue handwriting: *turn the page for me?*'),
      choice(
        opt('Turn the page.', [n('The tune keeps going, a little faster, like it’s grateful.'), add({ trust: 1 }), flag('turnedPage')]),
        opt('Close the lid.', [sfx('thud'), n('The lid slams before your hand touches it. The room is silent. Then, from inside the piano, one note.')]),
      ),
      diary('The piano in the music room was playing by itself.'),
    ] },
    { id: 'mus_1', cond: (s) => notD7(s) && here(), scene: [
      bg('classroom'),
      n('The music room smells like dust and old wood. Someone is playing the piano: a slow, rocking tune, like a train at night.'),
      show('hikaru', 'surprised', 'center'),
      n('Hikaru stops the moment the door creaks. Her hands stay hovering over the keys.'),
      K('mask', 'This room is taken.'),
      K('shy', '…Sorry. Autopilot again. You can stay. Just don’t tell her I play.'),
      choice(
        opt('“Why not? That was beautiful.”', [K('shy', 'Haruka says piano is for girls who don’t have friends.'), K('soft', 'She used to love it, though. Before.'), add({ trust: 1 })]),
        opt('“What was that song?”', [K('soft', 'It doesn’t have a name. It’s what the last train sounds like from the far end of the platform.'), add({ trust: 1 })]),
        opt('Sit on the floor and listen.', [n('After a minute she starts playing again. She doesn’t look at you once, and she doesn’t stop.'), add({ trust: 1, energy: 5 })]),
      ),
      flag('pianoMet'),
      diary('Found Hikaru playing the piano in the music room. She asked me not to tell Haruka.'),
    ] },
    { id: 'mus_2', cond: (s) => notD7(s) && here() && s.flags.pianoMet && s.day >= 3 && s.trust >= 2, scene: [
      bg('classroom'),
      show('hikaru', 'soft', 'center'),
      K('soft', 'Sit here. Left side. You play the four low notes, over and over. I’ll do the rest.'),
      n('You press the keys. Low, low, higher, low. She plays something over the top of it that makes your four notes sound like they were always meant to be music.'),
      K('happy', 'See? A duet.'),
      K('soft', 'She used to turn the pages for me. She never once got bored.', rw('She used to slam the lid on my fingers. She thought it was funny.', 'f_piano')),
      iff(has('f_piano'),
        [K('shy', '…It’s nice that someone heard that properly.'), n('She plays the last bar very softly, like she doesn’t want it to end.')],
        [n('Hikaru flexes her fingers like they hurt, and doesn’t play again.')]),
      diary('Played a duet with Hikaru. I only knew four notes. She made them sound like a song.'),
    ] },
    { id: 'mus_any', repeat: true, scene: [
      bg('classroom'),
      n('You practise the four low notes on the old piano until the bell rings. Low, low, higher, low.'),
      iff((s) => here() && s.flags.pianoMet && notD7(s), [n('Halfway through, someone in the corridor starts humming the top half of the tune. When you look, nobody’s there.')]),
      add({ grades: 2 }, { quiet: true }),
    ] },
  ];

  /* ---------- Inari shrine ---------- */
  const FORTUNES = [
    ['大吉', 'Great blessing', 'What was lost will be found. Look where the light comes back.'],
    ['吉', 'Blessing', 'A friend will show you something true. Listen to the quiet one.'],
    ['小吉', 'Small blessing', 'Two paths look the same. They are not the same.'],
    ['末吉', 'Future blessing', 'Be patient. Somebody is still on their way.'],
  ];
  const DARK_FORTUNES = [
    ['凶', 'Curse', 'Someone close to you will be forgotten. You will forget first.'],
    ['大凶', 'Great curse', 'There is only one of her. There was only ever one of her.'],
    ['凶', 'Curse', 'Do not look in mirrors after sunset. She looks back first.'],
  ];
  const draw = js((s) => {
    const dark = s.day >= 6 && !(s.day === 8 && s.flags.hikaruBack);
    const pool = dark ? DARK_FORTUNES : FORTUNES;
    const pickF = dark || Math.random() > 0.25 ? pool[Math.floor(Math.random() * pool.length)] : FORTUNES[0];
    s.flags.lastFortune = `${pickF[0]} · ${pickF[1]}. “${pickF[2]}”`;
    if (pickF[0] === '大吉') s.flags.daikichi = true;
    s.flags.shrineVisit = true;
  });
  DL.Events.shrine = [
    { id: 'shr_7', cond: (s) => s.day === 7, scene: [
      bg('shrine', { variant: 'g1' }),
      n('The shrine is very small and very red. The fox statues are wearing pink bibs today. Last week they were white.'),
      n('On the wall of wooden wishes, every single ema has the same name scratched out with something sharp.'),
      sfx('static'),
      n('Except one. It’s brand new. The handwriting is round and pink.'),
      say('haruka', null, '“I wish {name} would stay. Forever. Just us.”', { label: 'ema', plate: 'pink' }),
      fx('flicker', { variant: 'g2', ms: 160 }),
      n('Next to it, a second ema has been snapped clean in half. You can only read the bottom: *…even if it’s without me.*'),
      diary('Every wish at the shrine had Hikaru’s name scratched out. One had mine.'),
    ] },
    { id: 'shr_1', cond: notD7, scene: [
      bg('shrine'),
      n('Behind the park, past the hydrangeas, there’s a tiny Inari shrine: a red gate, two stone foxes, a box of ¥100 fortunes.'),
      n('You drop a coin in and shake the box until a stick falls out.'),
      draw,
      sfx('chime'),
      n((s) => `Your fortune: ${s.flags.lastFortune}`),
      choice(
        opt('Tie it to the branch so the gods keep it.', [n('You knot it onto the branch with all the others. They rustle like whispering.')]),
        opt('Keep it in your pocket.', [n('You fold it into your pocket. It feels heavier than paper should.')]),
      ),
      diary((s) => `Drew a fortune at the Inari shrine: ${s.flags.lastFortune}`),
    ] },
    { id: 'shr_2', cond: (s) => notD7(s) && s.day >= 4 && s.flags.shrineVisit, scene: [
      bg('shrine'),
      n('Today you look at the wall of ema: little wooden plaques with wishes written on the back.'),
      n('Two of them are hanging side by side on the same hook. One is decorated with pink glitter pen.'),
      say('haruka', null, '“Please let us always match. Please don’t let her leave me behind.”', { label: 'ema', plate: 'pink' }),
      n('The other is plain wood. The handwriting is small and neat, in blue.'),
      say('hikaru', null, '“Please let my sister be happy, even if it’s without me.”', Object.assign(rw('“Please let my sister disappear.”', 'f_shrine'), { label: 'ema', plate: 'blue' })),
      iff(has('f_shrine'),
        [n('Both of them were wishing for the other one. Neither of them knows.')],
        [n('The blue plaque swings on its hook and clacks against the pink one, over and over, though there’s no wind.')]),
      flag('readEma'),
      draw,
      n((s) => `You draw another fortune before you go: ${s.flags.lastFortune}`),
      diary('Read the twins’ wishes at the shrine. Theirs are on the same hook.'),
    ] },
    { id: 'shr_any', repeat: true, scene: [
      bg('shrine'),
      n('You shake the fortune box again.'),
      draw,
      n((s) => `${s.flags.lastFortune}`),
      add({ energy: 5 }, { quiet: true }),
    ] },
  ];

  /* ---------- Rin's darkroom ---------- */
  const red = fx('tint', { kind: 'red' });
  const safe = fx('tint', { kind: 'safelight' });
  DL.Events.darkroom = [
    { id: 'drk_7', cond: (s) => s.day === 7, scene: [
      bg('darkroom'), red,
      show('rin', 'neutral', 'center'),
      R('neutral', 'Oh, {name}. I’m developing the class photo. Something keeps going wrong with it.'),
      n('In the red light, a print floats in the tray. Class 2-B, smiling in rows. In the back row, by the window, the paper is still blank.'),
      n('As you watch, a face starts to come up in the blank space. Slowly. Hair first. Then eyes.'),
      sfx('static'), fx('flicker', { variant: 'g1', ms: 200 }),
      n('It’s you.'),
      R('worried', 'That’s weird. You weren’t even in our class when we took this.'),
      flag('sawYourself'),
      hide('rin'), restoreTint,
      diary('In Rin’s darkroom, my face developed in the window seat of a photo taken before I came here.'),
    ] },
    { id: 'drk_1', cond: notD7, scene: [
      bg('darkroom'), safe,
      show('rin', 'happy', 'center'),
      R('happy', 'Welcome to my favourite place in the school. Close the door! Light ruins everything.'),
      n('The photo club darkroom is a cupboard with a red bulb, three trays and a washing line full of drying photos.'),
      R('neutral', 'Developer, stop bath, fixer. Then you wait, and the picture just… shows up. Like it was hiding.'),
      n('She slides a sheet of paper into the first tray. Slowly, the courtyard appears: the big cherry tree, a bench, two girls.'),
      R('worried', 'Huh. That’s the Amane twins. One of them always comes out blurry. I’ve changed cameras three times.'),
      choice(
        opt('“Which one?”', [R('sad', 'The blue one. Every time.'), flag('rinClue')]),
        opt('“Maybe she moves too much.”', [R('neutral', 'She doesn’t. She sits very, very still. That’s the strange part.')]),
      ),
      flag('darkroomMet'), flag('rinFriend'),
      hide('rin'), restoreTint,
      diary('Rin showed me the darkroom. Hikaru always comes out blurry in her photos.'),
    ] },
    { id: 'drk_2', cond: (s) => notD7(s) && s.flags.darkroomMet && s.day >= 4, scene: [
      bg('darkroom'), safe,
      show('rin', 'surprised', 'center'),
      R('surprised', 'Look what I found in the club’s lost-and-found. An old film roll. Nobody ever developed it.'),
      R('neutral', 'Want to see what’s on it? It’s like opening a letter from the past.'),
      n('Six frames come up in the tray, one by one. The end of a train platform at night. Two little girls in matching goldfish yukata.'),
      n('In the last frame, one of them is crying and the other one is holding her hand, glaring at someone outside the picture.'),
      n('Rin flips the print over. On the back, in faded blue pen:'),
      say('hikaru', null, 'Haruka, age eleven. The bravest person I know.', rw('Haruka, age eleven. The reason I’m gone.', 'f_film')),
      iff(has('f_film'),
        [R('soft', 'Somebody really loved her.'), n('Rin pins the photo on the line very carefully, like it might break.')],
        [R('worried', 'The writing changed. Did you see that? The writing just changed.')]),
      flag('filmDeveloped'),
      hide('rin'), restoreTint,
      diary('Developed an old roll of film with Rin. The twins at eleven, at the end of the platform.'),
    ] },
    { id: 'drk_any', repeat: true, scene: [
      bg('darkroom'), safe,
      n('You help Rin hang prints on the drying line. She explains f-stops. You understand about half.'),
      iff((s) => s.day >= 6, [n('Every photo on the line has the window seat in it, somewhere in the background. Every one.')]),
      add({ grades: 2 }, { quiet: true }),
      restoreTint,
    ] },
  ];

  /* ---------- The window seat (days 7–8) ---------- */
  DL.Events.windowseat = [
    { id: 'ws_7', cond: (s) => s.day === 7, scene: [
      bg('classroom_dusk'), music('drone'),
      n('Everyone has gone home. The window seat is empty. It has always been empty. Everyone says so.'),
      n('You sit down in it. The chair is warm.'),
      sfx('static'), fx('flicker', { variant: 'g2', ms: 160 }),
      n('Carved into the desk, very small, over and over: *still here still here still here still here.*'),
      V('That seat is for nobody, {name}. Get up.'),
      choice(
        opt('Stay sitting.', [
          n('You put your hand flat on the carving. For a second, another hand is under yours, cold as the window glass.'),
          K('soft', 'Thank you for sitting with me.', { label: '???', plate: 'void' }),
          add({ trust: 1, susp: 1 }), flag('satInSeat'),
        ]),
        opt('Get up.', [n('You stand up. The chair slides back in by itself, very neatly, the way a polite person would do it.')]),
      ),
      diary('Sat in the window seat. Someone carved “still here” into the desk a hundred times.'),
    ] },
    { id: 'ws_8', cond: (s) => s.day === 8, scene: [
      bg('classroom_dusk'),
      n('The window seat again. Today there’s a pencil case on the desk. Blue.'),
      iff(f('hikaruBack'),
        [show('hikaru', 'soft', 'center', { ghost: true }), K('soft', 'You kept coming back to my seat. That’s how I found my way back to it.'), add({ trust: 1 }), hide('hikaru')],
        [n('You open it. It’s full of pink glitter pens. The blue ones have been snapped in half.'), add({ susp: 1 })]),
      flag('sawSeat8'),
    ] },
    { id: 'ws_any', repeat: true, scene: [bg('classroom_dusk'), n('The window seat is empty. The chair is warm.')] },
  ];

  /* ================= LOST CHARMS ================= */
  for (const L of DL.Extras.LOST) {
    scene('lost_' + L.loc, [
      iff((s) => s.day >= L.from && !(s.lost || []).includes(L.id), [
        sfx('chime'),
        n('✦ Something glints.'),
        n(L.text),
        js((s) => {
          s.lost = s.lost || [];
          s.lost.push(L.id);
          DL.Screens.toast(`${L.icon} Lost charm found · ${s.lost.length} / ${DL.Extras.LOST.length}`, 'blue', 3200);
          if (s.lost.length >= DL.Extras.LOST.length) s.flags.braceletWhole = true;
        }),
        diary(`Found a lost charm: ${L.name}.`),
        iff(f('braceletWhole'), [call('bracelet_whole')]),
      ]),
    ]);
  }
  scene('bracelet_whole', [
    n('That’s all twelve. You thread them onto a piece of string: star, train, moon, note, bunny, sketchbook, petal, pencil, milk, light, fox, half a heart.'),
    n('When the last one clicks into place, the half-heart charm is warm. Somewhere far away, a train horn sounds, very faint, like an answer.'),
    flag('braceletWhole'),
    diary('Hikaru’s bracelet is whole again. I should give it back to her.'),
  ]);
  for (const loc of Object.keys(DL.Events)) {
    if (!DL.Extras.LOST.some((L) => L.loc === loc)) continue;
    for (const e of DL.Events[loc]) e.scene.push(call('lost_' + loc));
  }

  /* ================= THE CLASS PHOTO ================= */
  scene('cphoto_2', [
    n('On the way to class you pass the framed class photo by the stairs. 2-B, last spring, under the cherry trees.'),
    n('The Amane twins are in the front row, exactly in the middle. Haruka is grinning. Hikaru is looking at Haruka.'),
  ]);
  scene('cphoto_4', [
    n('The class photo by the stairs again. Hikaru’s face is a little blurred, like someone kept touching the glass there.'),
    flag('classPhoto2'),
  ]);
  scene('cphoto_6', [
    fx('flicker', { variant: 'g1', ms: 120 }),
    n('The class photo by the stairs. Hikaru’s half of the picture is overexposed now, washed out to white, like she was standing too close to a light.'),
    flag('classPhoto2'),
  ]);
  scene('cphoto_8', [
    iff(f('hikaruBack'),
      [n('The class photo by the stairs. Hikaru is back in it, faint as a pencil sketch, still looking at her sister.')],
      [sfx('static'), n('The class photo by the stairs. There’s only one Amane girl in it now, right in the middle, smiling at the camera.'),
        n('In the back row, by the window, where nobody stood, there’s a face you recognise. It’s yours.')]),
    flag('classPhoto2'),
  ]);
  const lastCmd = (id) => DL.Engine.scenes[id][DL.Engine.scenes[id].length - 1];
  for (const d of [2, 4, 6, 8]) {
    const list = DL.Engine.scenes[`d${d}_morning`];
    const tail = lastCmd(`d${d}_morning`);
    const at = tail && (tail.t === 'goto') ? list.length - 1 : list.length;
    list.splice(at, 0, call('cphoto_' + d));
  }

  /* ================= VOICE NOTES ================= */
  const voice = (from, text, o = {}) => msg(from, text, Object.assign({ voice: true }, o));
  const isClose = (c) => c.t === 'phoneClose';
  inject('d3_evening', isClose, [
    voice('hikaru', 'sorry, typing is hard in the dark. haruka’s asleep. she hums the train song in her sleep. don’t tell her i told you.'),
  ], { before: true, last: true });
  inject('d6_evening', isClose, [
    voice('hikaru', 'hi. it’s me. just checking you got home okay.', { rewrite: { fake: 'hi. it’s me. it’s us. we’re both here now. say goodnight to both of us, {name}.', noRecall: true, delay: 1600 } }),
  ], { before: true, last: true });
  inject('d8_evening', isClose, [
    iff((s) => !s.flags.hikaruBack,
      [voice('haruka', '(breathing)', { rewrite: { fake: '(two people breathing, perfectly in time)', noRecall: true, delay: 1400 } })],
      [voice('haruka', 'hikaru says hi. she says this is her real voice, so you know which one is hers. …weird, right? hi. it’s me. hikaru.')]),
  ], { before: true, last: true });

  /* ================= 3 A.M. CALLS & THE OTHER DIARY ================= */
  scene('call_3am_3', [
    bg('bedroom_night'),
    sfx('ping'), n('03:00. Your phone is ringing. The screen says *No caller ID*.'),
    choice(
      opt('Answer.', [
        sfx('static'), n('Static. Then, very quietly, the sound of a train pulling into a station.'),
        n('Then someone breathes in like they’re about to speak, and the line goes dead.'),
        flag('answered3am'),
      ]),
      opt('Let it ring.', [n('It rings eleven times. You count. Then it stops, and the room feels emptier, not quieter.')]),
    ),
    flag('heard3am'),
  ]);
  scene('call_3am_5', [
    bg('bedroom_night'),
    sfx('ping'), n('03:00 again. *No caller ID.*'),
    choice(
      opt('Answer.', [
        sfx('static'),
        K('soft', '…are you awake? sorry. i didn’t know who else to call. she’s asleep and it’s so quiet when she’s asleep.', { label: '???', plate: 'void' }),
        choice(
          opt('“I’m here. Talk as long as you want.”', [K('soft', 'okay. just… stay on the line. you don’t have to say anything.', { label: '???', plate: 'void' }), n('You fall asleep with the phone on your pillow. When you wake up the call has lasted four hours.'), add({ trust: 1 })]),
          opt('“Who is this?”', [K('sad', '…right. sorry. wrong number.', { label: '???', plate: 'void' }), n('The line clicks off.')]),
        ),
        flag('answered3am'),
      ]),
      opt('Turn the phone face down.', [n('The screen lights up the ceiling through the gap under the phone. Ring. Ring. Ring.')]),
    ),
    flag('heard3am'),
  ]);
  scene('call_3am_8', [
    bg('bedroom_night'), fx('tint', { kind: 'pink' }),
    sfx('ping'), n('03:00. The phone rings. The caller ID says *HIKARU*, then flickers, then says *HARUKA*, then flickers.'),
    choice(
      opt('Answer.', [
        sfx('static'),
        iff(f('hikaruBack'),
          [K('soft', 'Don’t be scared. It’s me. She’s trying to call you too, at the same time. We keep getting each other’s line.', { label: 'Hikaru', plate: 'blue' }), add({ trust: 1 })],
          [V('There’s only one of us on this line, {name}. There’s only ever been one.'), add({ susp: 1 })]),
        flag('answered3am'),
      ]),
      opt('Throw the phone across the room.', [sfx('thud'), n('It hits the wall. It keeps ringing. The screen doesn’t crack. Nothing in this town cracks the way it should.')]),
    ),
    flag('heard3am'), restoreTint,
  ]);

  // Before each diary page: maybe a 3am call, then lines appear that you didn't write.
  DL.Extras.night = async (s) => {
    const ctx = { gen: DL.Game.gen };
    const calls = { 3: 'call_3am_3', 5: 'call_3am_5', 8: 'call_3am_8' };
    if (calls[s.day] && !s.flags['call' + s.day]) {
      s.flags['call' + s.day] = true;
      await DL.Engine.run(calls[s.day], ctx);
      DL.Dialogue.hide();
    }
    const blue = {
      2: s.trust >= 2 && 'thank you for sitting with me. nobody does.',
      4: s.trust >= 3 && 'she isn’t mean. please don’t write that she’s mean.',
      6: s.trust >= 3 && 'i couldn’t see myself in the shop mirror today. could you?',
      8: s.flags.hikaruBack && 'i’m still here. write it down so i stay.',
      9: s.frags.length >= 5 && 'whatever happens tomorrow, thank you for remembering.',
    };
    const pink = {
      5: s.susp >= 6 && 'stop writing about her.',
      6: s.susp >= 5 && 'you spend a lot of time with my sister, don’t you.',
      8: !s.flags.hikaruBack && 'there’s only one of us. there’s only ever been one of us.',
    };
    if (blue[s.day] && !s.flags['blue' + s.day]) { s.flags['blue' + s.day] = true; s.diary.push('!b ' + blue[s.day]); }
    if (pink[s.day] && !s.flags['pink' + s.day]) { s.flags['pink' + s.day] = true; s.diary.push('!h ' + pink[s.day]); }
  };

  /* ================= NEW ENDINGS ================= */
  scene('end_two', [
    me('Both of you. Listen. I don’t have to choose one version. Neither do you.'),
    H('cold', 'There’s only room for one of us. That’s how it works.'),
    me('Then make more room.'),
    music('sweet'),
    fx('level', { level: 1, noAmbient: true }),
    show('hikaru', 'sad', 'right', { ghost: true }),
    iff(f('braceletWhole'), [
      n('You take the string of charms out of your pocket. Star, train, moon, note, bunny, sketchbook, petal, pencil, milk, light, fox, half a heart.'),
      H('surprised', 'That’s… that’s her bracelet. I threw it. At the platform. I threw it so hard it broke.'),
      K('soft', 'You found every piece.'),
    ]),
    iff(f('secretMemory'), [
      n('You hold up the paper doll. The crayon on the back says *promise?* in pink, and *promise* in blue.'),
      H('cry', 'I wrote that. I was eight. I wrote that.'),
    ]),
    iff(has('f_shrine'), [me('You both made a wish at the shrine. On the same hook. You were both wishing for the other one.')]),
    iff(has('f_film'), [me('“Haruka, age eleven. The bravest person I know.” She wrote that about you.')]),
    iff(has('f_piano'), [K('soft', '“She used to turn the pages for me. She never once got bored.”')]),
    fx('flash', { color: '#fff4fb', ms: 360 }),
    fx('level', { level: 0 }), fx('tint', { kind: null }),
    bg('station', { clean: true, force: true }),
    hideAll(),
    show('haruka', 'cry', 'left'), show('hikaru', 'cry', 'right'),
    n('You’re not in the classroom any more. You’re at the far end of the platform. It’s night, and warm, and a train is coming in.'),
    K('cry', 'I don’t need you to be mean with me. I just need you.'),
    H('cry', 'I don’t want to be the only one. I never wanted to be the only one.'),
    K('soft', 'Then don’t be. Be the older one. Four minutes. You never let me forget it.'),
    H('happy', '…We’re so *stupid*.'),
    K('happy', 'Very stupid. Both of us. Equally.'),
    H('smile', '{name}. Stand in the middle. It’s a photo. Rin’s been hiding behind that pillar for ten minutes.'),
    show('rin', 'happy', 'center'),
    R('happy', 'I asked properly! I always ask properly! Say cheese!'),
    sfx('chime'),
    n('In the photo there are two lights at the end of the platform, side by side. Neither of them is going anywhere.'),
    ending('two'),
  ]);

  scene('end_overexposed', [
    me('Rin. The last roll. Show her.'),
    show('rin', 'neutral', 'center'),
    R('neutral', 'I finished developing it last night. I think… I think you should see it, {name}.'),
    bg('darkroom'), fx('tint', { kind: 'red' }), music('drone'),
    n('The darkroom. Red light. Rin is holding a dripping print with tongs.'),
    n('It’s the window seat. The twins are standing on either side of it, smiling at the camera.'),
    n('In the seat, sitting very still, is you.'),
    R('soft', 'It’s the nicest picture I’ve ever taken. Everyone’s exactly where they belong.'),
    H('smile', 'See? We match now. All three of us.'),
    show('hikaru', 'blank', 'right'),
    K('blank', 'Hold still, {name}. It only hurts while it develops.'),
    sfx('static'), fx('flash', { color: '#ff3b3b', ms: 380 }),
    n('The red bulb gets brighter. And brighter. And brighter.'),
    ending('overexposed'),
  ]);

  // The final choice gets two new options
  const choiceCmd = DL.Engine.scenes.d9_choice[0];
  choiceCmd.opts.unshift(opt('“You’re both real. Let me give you back to each other.”', [go('end_two')], {
    if: (s) => s.frags.length >= 9,
    lock: (s) => s.frags.length < 12 ? `Remember more of what Hikaru really said. (${s.frags.length} of 12 lines)`
      : s.trust < 8 ? `Hikaru needs to trust you completely. (Trust ${s.trust} of 8)`
        : s.favor < 4 ? `Haruka has to like you enough to listen. (Haruka ${s.favor} of 4)`
          : !(s.flags.secretMemory || s.flags.braceletWhole) ? 'You need something from before: their promise, or the mended bracelet.'
            : null,
  }));
  const devIdx = choiceCmd.opts.findIndex((o) => o.body && o.body[0] && o.body[0].id === 'end_developed');
  choiceCmd.opts.splice(devIdx + 1, 0, opt('“Rin. Show her the last roll of film.”', [go('end_overexposed')], {
    if: (s) => s.flags.filmDeveloped && s.flags.sawYourself,
  }));
})();
