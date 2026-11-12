/* WEEK TWO (Days 6–9): the lines start fighting back. */
(() => {
  const { scene, bg, show, hide, say, n, H, K, R, me, X, V, rw, opt, choice, add, flag, iff, go, call, wait, sfx, music, fx, diary,
    phone, msg, reply, phoneClose, js, card, has, f } = DL.DSL;

  const HIKARU_DM = { sub: 'Hikaru Amane', avatar: 'assets/sprites/hikaru_face.webp' };
  const HARUKA_DM = { sub: 'online', avatar: 'assets/sprites/haruka_face.webp' };
  const GROUP = { sub: '27 members', initial: '✿', color: 'linear-gradient(135deg, #ffd3e3, #c7b6ea)' };

  /* ================= DAY 6 ================= */
  scene('d6_morning', [
    call('saturday'),
    card('[[something was moved over the weekend]]'),
    bg('bedroom'),
    n('Monday. Your alarm goes off, and for a second you can’t remember what day it is.'),
    n('The poster on your wall is hanging slightly crooked. You don’t remember touching it.'),
    bg('gate'),
    n('The cherry blossoms are already falling. The pavement outside school is pink with them.'),
    n('Everything looks the same as last week. Almost.'),
    fx('flicker', { variant: 'g2', ms: 130 }),
    sfx('static'),
    n('…For a second the gate looked torn, like a photo that’s been folded too many times.'),
    show('haruka', 'happy', 'left'),
    H('happy', '{name}! Good morning!'),
    n('Haruka has never said good morning to you before. She’s smiling with her whole face.'),
    H('smile', 'I saved you a seat at lunch. Every day this week. Isn’t that nice?'),
    iff(f('readNotebook'), [
      H('smirk', 'Oh, and thanks for leaving my notebook on the shoe shelf. So thoughtful.'),
      n('She knows. Of course she knows.'),
    ]),
    iff(f('returnedNotebook'), [
      H('soft', 'You’re the only person who’s ever given me something back without reading it first.'),
    ]),
    hide('haruka'),
    n('She skips inside. Hikaru was standing behind her the whole time, holding her bag with both hands.'),
    show('hikaru', 'worried', 'right'),
    K('soft', 'Thank you. For last week. For… being there.', rw('Stay away from me. I mean it.', 'f_thanks')),
    iff(has('f_thanks'), [
      K('shy', '…You heard it right, didn’t you? The first time.'),
      me('I did.'),
      K('soft', 'Good. Lately I’m not sure what comes out when I talk.'),
    ], [
      n('Hikaru walks away before you can answer. She doesn’t look back.'),
    ]),
    hide('hikaru'),
    diary((s) => s.frags.includes('f_thanks')
      ? 'Hikaru thanked me at the gate. The words tried to change, but I caught them.'
      : 'Hikaru told me to stay away from her. I don’t think that’s what she meant.'),
  ]);

  scene('d6_evening', [
    bg('bedroom_night'),
    phone('Hikaru', HIKARU_DM),
    msg('hikaru', '{name} can i tell you something about haruka'),
    msg('hikaru', 'when we were eleven there was a festival at the station. tanabata'),
    msg('hikaru', 'some older girls were laughing at her yukata and she was crying and i', { deleteAfter: 1400 }),
    wait(500),
    n('Hikaru is typing…'),
    wait(1600),
    n('Hikaru stopped typing.'),
    phone('2-B ✿', GROUP),
    msg('haruka', 'hikaru’s being dramatic again 🙄 ignore her tonight', { group: true }),
    msg('haruka', 'she gets like this', { group: true }),
    reply(
      opt('How did you know she was texting me?', [
        msg('haruka', 'lucky guess ✿', { group: true }),
        msg('haruka', 'she’s my sister. i always know', { group: true }),
      ]),
      opt('Okay.', [add({ favor: 1 }, { quiet: true }), msg('haruka', 'good 💗', { group: true })]),
    ),
    n('The group says 27 members. Yesterday it said 28.'),
    phoneClose(),
    diary('Hikaru started to tell me about a festival when they were eleven. Then her message deleted itself.'),
    diary('Haruka knew. Somehow.'),
  ]);

  /* ================= DAY 7: Haruka’s version ================= */
  scene('d7_morning', [
    card('', { glitchTo: 'Day 6' }),
    bg('classroom'),
    n('The classroom is very bright this morning. Brighter than usual. Pinker.'),
    X('Ms. Kanda', 'Roll call. Abe. Amane, Haruka.'),
    show('haruka', 'happy', 'left'),
    H('happy', 'Here!'),
    X('Ms. Kanda', 'Fujita. Hoshino…'),
    n('She keeps going. She doesn’t say *Amane, Hikaru.*'),
    n('You look to your right. The window seat is empty.'),
    n('No bag. No pencil case. No name sticker on the desk. It looks like nobody has ever sat there.'),
    choice(
      opt('“Ms. Kanda, you skipped Hikaru.”', [
        X('Ms. Kanda', 'Who?'),
        n('A few people giggle, like you made a joke that didn’t quite land.'),
      ]),
      opt('Whisper to Rin: “Where’s Hikaru?”', [
        show('rin', 'neutral', 'center'),
        R('neutral', 'Who?'),
        R('worried', 'That seat’s been empty since April. Are you okay, {name}?'),
        hide('rin'),
      ]),
    ),
    H('smile', 'Don’t be silly, {name}.'),
    H('eerie', 'It’s always been just me.'),
    fx('tear', { ms: 320 }),
    H('smile', 'Isn’t it nicer like this? Less complicated. Nobody pretending.'),
    hide('haruka'),
    show('hikaru', 'sad', 'right', { ghost: true }),
    n('For one second, there’s someone in the window seat. Pale. Blue. Looking at you like you’re very far away.'),
    hide('hikaru', { erase: true }),
    n('Then there isn’t.'),
    diary('The window seat was empty today. Nobody remembers her. I do. I think I do.'),
    diary('!h You don’t know anyone called Hikaru, {name}. Go to sleep.'),
  ]);

  scene('d7_evening', [
    bg('bedroom_night'),
    iff((s) => s.flags.rinFriend || s.flags.photoClue, [
      n('Before anything else, your phone rings. It’s Rin. She never calls.'),
      phone('Rin', { sub: 'photography club', avatar: 'assets/sprites/rin_face.webp' }),
      msg('rin', 'sorry. i know it’s late'),
      msg('rin', 'i developed the old festival photo again. the blue smear is clearer now. it has a face'),
      msg('rin', 'it looks like haruka. but sadder. who is she, {name}?'),
      reply(
        opt('Her name is Hikaru. Keep that photo safe.', [flag('rinKnows'), add({ trust: 1 }), msg('rin', 'hikaru. ok. i wrote it on the back so i won’t forget'), msg('rin', 'i’m good at not forgetting things. that’s why i take photos')]),
        opt('It’s probably just a smudge, Rin.', [msg('rin', 'yeah. probably'), msg('rin', '…it’s looking at the camera though')]),
      ),
      phoneClose(),
    ]),
    n('Your phone buzzes. The contact name is just three question marks.'),
    phone('???', { sub: 'number not saved', initial: '?', color: '#2a1d2e' }),
    msg('unknown', 'it’s me. hikaru. she’s not deleting me on purpose. she just can’t see me anymore. please don’t forget me', {
      rewrite: { fake: 'it’s no one. please forget.', frag: 'f_phone', delay: 1300 },
    }),
    iff(has('f_phone'), [
      msg('unknown', 'you read it. the real one'),
      msg('unknown', 'it’s like standing at the end of the platform. you can see the light but it’s so far away'),
      msg('unknown', 'tomorrow, if she asks you to come over, go. look at my side of the room'),
      flag('hikaruAskedRoom'),
    ], [
      msg('unknown', '…', { deleteAfter: 900 }),
    ]),
    phone('Haruka', HARUKA_DM),
    msg('haruka', 'who are you texting? 💗'),
    reply(
      opt('Nobody.', [msg('haruka', 'good. that’s who it is. nobody')]),
      opt('Your sister.', [add({ susp: 1, favor: -1 }), msg('haruka', 'i don’t have a sister, silly'), msg('haruka', 'go to sleep, {name}')]),
    ),
    msg('haruka', 'come over after school tomorrow? i want to show you my room ✿'),
    phoneClose(),
  ]);

  /* ================= DAY 8 ================= */
  scene('d8_morning', [
    js((s) => {
      s.flags.hikaruBack = s.frags.length >= 3;
      DL.FX.tint(s.flags.hikaruBack ? null : 'pink');
    }),
    card(),
    bg('classroom'),
    iff(f('hikaruBack'), [
      n('Hikaru is in the window seat.'),
      show('hikaru', 'worried', 'right'),
      n('Her outline flickers at the edges, like a drawing someone keeps half-erasing. But she’s there.'),
      K('worried', 'You can see me.'),
      me('I can see you.'),
      K('soft', 'Then I’m still here. Every line you remember… it holds me together.'),
      show('haruka', 'cold', 'left'),
      n('Haruka turns around. She stares at the window seat, then at you.'),
      H('cold', 'Why are you talking to the window, {name}?'),
      hide('haruka'),
      K('sad', 'She really can’t see me. Not anymore.'),
      hide('hikaru'),
    ], [
      n('The window seat is still empty.'),
      n('If you squint, the chair has a faint blue outline. Like a stain. Or a light seen from very far away.'),
      show('haruka', 'smile', 'left'),
      H('smile', 'You keep staring at that chair. It’s just a chair.'),
      hide('haruka'),
    ]),
    diary((s) => s.flags.hikaruBack ? 'Hikaru was back today. Only I can see her.' : 'The window seat is still empty. There’s a faint blue outline on the chair.'),
  ]);

  scene('d8_after', [
    bg('street'),
    n('Haruka walks you back to the Amane house. She talks the whole way. She doesn’t mention her sister once.'),
    bg('sisters_room'),
    show('haruka', 'happy', 'left'),
    H('happy', 'Welcome back. No dress-up today. Probably.'),
    n('It still looks like two rooms pretending to be one. The pink half is exactly how you left it. The blue half looks… tidier. Emptier.'),
    H('smile', 'The pink side is mine. The blue side is… storage.'),
    fx('flicker', { variant: 'g2', ms: 140 }),
    H('smile', 'I’ll make us some tea. Don’t touch anything!'),
    hide('haruka'),
    go('d8_room_look'),
  ]);

  scene('d8_room_look', [
    choice('You’re alone in the room.',
      opt('Look at the bookshelf on the blue side.', [go('d8_sketchbook')], { if: (s) => !s.flags.sawSketchbook }),
      opt('Look at the vanity on the pink side.', [go('d8_vanity')], { if: (s) => !s.flags.sawVanity }),
      opt('Look out of the window.', [go('d8_window')], { if: (s) => !s.flags.sawWindow }),
      opt('Wait for Haruka.', [go('d8_haruka_back')]),
    ),
  ]);

  scene('d8_sketchbook', [
    flag('sawSketchbook'),
    sfx('page'),
    n('Between two art books is a sketchbook with a blue cover. It’s full of drawings.'),
    n('Haruka laughing. Haruka asleep on a train. Haruka at eleven, crying, in a yukata with goldfish on it.'),
    n('On the next page, the two of them at the end of a train platform at night, watching a light come towards them from very far away.'),
    n('Underneath, in small, neat handwriting:'),
    n('*Tanabata, age 11. Some girls made fun of her yukata. I said the meanest thing I’ve ever said, and they ran.*'),
    n('*Afterwards she stopped crying and we watched the trains. I told her: if you ever get lost, look for the light. I’ll be there.*'),
    n('The last page has only a few lines on it.'),
    say('hikaru', null, 'I was only mean that one time, to protect her. She thought I loved it, so she became mean too, for me. And I stayed mean for her.',
      rw('I was always the mean one. She was never mean at all. It was always me.', 'f_room')),
    iff(has('f_room'), [
      n('You read it twice. They were both doing it for each other. Neither of them ever wanted it.'),
      flag('knowsTruth'),
    ], [
      n('The handwriting on that last line looks different. Rounder. Pinker.'),
    ]),
    go('d8_room_look'),
  ]);

  scene('d8_vanity', [
    flag('sawVanity'),
    n('Haruka’s vanity is covered in make-up and stickers. In the top drawer is the pink notebook. *PROOF.*'),
    n('The last page has been torn out and taped back in.'),
    n('*If she doesn’t need me to be mean with her, then what am I for?*'),
    n('*She’ll find someone nicer. Someone who isn’t me. And I’ll be the one left behind on the platform.*'),
    flag('sawHarukaFear'),
    go('d8_room_look'),
  ]);

  scene('d8_window', [
    flag('sawWindow'),
    n('From the window you can see all the way to Sakuragaoka Station.'),
    n('A train is coming in. From this far away, its light looks like a star that can’t make up its mind.'),
    iff(f('hikaruBack'), [
      show('hikaru', 'soft', 'right', { ghost: true }),
      K('soft', 'That’s our light. She doesn’t remember it. I do.'),
      hide('hikaru'),
    ]),
    go('d8_room_look'),
  ]);

  scene('d8_haruka_back', [
    show('haruka', 'smile', 'left'),
    H('smile', 'Tea! Sorry, the kettle is ancient.'),
    iff((s) => s.flags.sawSketchbook || s.flags.sawVanity, [
      H('cold', '…You touched things.'),
      choice(
        opt('“You were both being mean for each other.”', [go('d8_confront')], { if: f('knowsTruth') }),
        opt('“I read what you wrote. About being left behind.”', [go('d8_fear')], { if: f('sawHarukaFear') }),
        opt('“Sorry. I was just curious.”', [H('smirk', 'Curious. Sure.')]),
      ),
    ]),
    go('d8_meta'),
  ]);

  scene('d8_confront', [
    me('Hikaru was only mean once, at the festival, to protect you. You thought she loved it, so you got mean too. For her.'),
    H('surprised', '…'),
    H('angry', 'That’s not— who told you that? There’s nobody to tell you that.'),
    add({ susp: -2 }),
    H('worried', 'She *liked* it. She was so *strong*. I just… kept up. So she wouldn’t leave me behind.'),
    go('d8_meta'),
  ]);

  scene('d8_fear', [
    me('You wrote that you’d be the one left behind on the platform.'),
    H('cold', 'Reading people’s diaries is creepy, {name}.'),
    H('worried', '…It’s true, though. Everyone likes her better. Even you.'),
    add({ susp: -1, favor: 1 }),
    go('d8_meta'),
  ]);

  scene('d8_meta', [
    music('drone'),
    H('neutral', 'Hey. Can I ask you something weird?'),
    H('blank', 'You keep doing that thing. Where you *take back* what she says.'),
    fx('tear', { ms: 320 }),
    H('blank', 'I fix the lines so they make sense. And you un-fix them.'),
    V('Who are you, really? Not {name}. The one *behind* {name}. The one holding the controls.'),
    iff(() => DL.State.meta.plays > 1, [V('This isn’t your first time here, is it? You’ve done this week before. I can tell.')]),
    V('Sometimes you leave, and the whole world just… stops. Everyone freezes except me.'),
    choice('What do you tell her?',
      opt('“I’m the one playing. I can see both of you.”', [
        flag('admitted'),
        H('surprised', '…Both of us?'),
        V('Then you can see what I can’t. That’s not fair. That’s not *fair*, {name}.'),
        add({ susp: -1 }),
      ]),
      opt('“I’m just {name}. The transfer student.”', [
        H('smirk', 'Liar. But a cute one.'),
        add({ favor: 1 }),
      ]),
      opt('“Who are *you*, Haruka? Without her?”', [
        flag('askedHaruka'),
        H('blank', '…'),
        H('worried', 'I don’t know. I’ve never been without her. Not for one single day.'),
        add({ favor: 1, susp: -1 }),
      ]),
      opt('Say nothing. Look at the blue side of the room.', [
        add({ trust: 1 }),
        n('For a second the blue side looks brighter. Like someone switched a lamp on over there.'),
      ]),
    ),
    H('smile', '…Sorry! That was so weird. Ignore me. Drink your tea.'),
    music('uneasy'),
    hide('haruka'),
    diary('Went to the Amane house. Haruka’s room is two rooms pretending to be one.'),
    diary((s) => s.flags.knowsTruth
      ? 'I know what happened at the festival now. They’ve been mean for each other this whole time.'
      : 'Haruka asked who I really am. Not me. The one behind me.'),
  ]);

  scene('d8_evening', [
    bg('bedroom_night'),
    phone('Haruka', HARUKA_DM),
    msg('haruka', 'it’s {time} where you are, isn’t it?'),
    n('You check. It’s {time}. Not the time in the game. The time where *you* are.'),
    msg('haruka', 'you should sleep'),
    msg('haruka', 'tomorrow after school. classroom. i’m going to fix everything'),
    msg('haruka', 'then it’ll just be the two of us. forever. doesn’t that sound nice'),
    reply(
      opt('Okay.', [msg('haruka', '💗')]),
      opt('Fix what, Haruka?', [msg('haruka', 'the lines. the ones that don’t make sense'), msg('haruka', 'you’ll see')]),
    ),
    iff(f('hikaruBack'), [
      phone('Hikaru', HIKARU_DM),
      msg('hikaru', 'tomorrow. the classroom. after school'),
      msg('hikaru', (s) => `you’ve remembered ${s.frags.length} things i really said. ` + (s.frags.length >= DL.Data.GOOD.frags ? 'i think that’s enough for her to hear me' : 'i don’t know if that’s enough')),
      msg('hikaru', 'please don’t leave'),
    ]),
    phoneClose(),
  ]);

  /* ================= DAY 9: the last day ================= */
  scene('d9_morning', [
    card('', { glitchTo: 'Last day' }),
    music('drone'),
    bg('classroom'),
    n('The day goes by in pieces. Like someone is skipping through it.'),
    fx('tear', { ms: 240 }),
    bg('cafeteria', { fade: 150 }),
    n('Lunch.'),
    fx('tear', { ms: 240 }),
    bg('hallway', { fade: 150 }),
    n('Afternoon.'),
    fx('tear', { ms: 300 }),
    bg('classroom_dusk'),
    n('After school. Everyone else has gone home. The room is orange and very quiet.'),
    show('haruka', 'smile', 'left'),
    n('Haruka is sitting in the window seat. Hikaru’s seat.'),
    H('smile', 'You came. I knew you would.'),
    H('soft', 'I asked everyone else to leave. Even the teacher. Isn’t that funny? They just… went.'),
    iff((s) => s.frags.length >= DL.Data.GOOD.frags, [
      show('hikaru', 'worried', 'right', { ghost: true }),
      n('Behind her, at the very edge of the window, Hikaru is standing. Faint as a reflection. Looking at you.'),
    ]),
    H('neutral', 'I figured it out, {name}. Why the lines keep breaking.'),
    H('cold', 'There are two versions of everything. Mine, and the one she pretends.'),
    H('smirk', 'So I’m going to delete the wrong one. All of it. Then it’s just us, and nothing ever has to make sense again.'),
    V('All you have to do is agree with me.'),
    go('d9_choice'),
  ]);

  scene('d9_choice', [
    choice('What do you do?',
      opt('Show Haruka the lines she tried to erase.', [go('end_good')], {
        lock: (s) => s.frags.length < DL.Data.GOOD.frags
          ? `You don’t remember enough of what Hikaru really said. (${s.frags.length} of ${DL.Data.GOOD.frags} lines)`
          : s.trust < DL.Data.GOOD.trust
            ? `You remember the lines, but Hikaru doesn’t trust you enough to come back. (Trust ${s.trust} of ${DL.Data.GOOD.trust})`
            : null,
      }),
      opt('Show Haruka Rin’s photo from the festival.', [go('end_rin')], {
        if: (s) => s.flags.photoClue,
        lock: (s) => (s.flags.rinKnows || s.flags.goodPhoto ? null : 'Rin doesn’t know who’s in the photo yet. (Or take a clear photo at the matsuri.)'),
      }),
      opt('“Then I’ll stay. With you. Just you.”', [go('end_haruka')], {
        if: (s) => s.favor >= 6,
        lock: (s) => (s.flags.askedHaruka || s.flags.swingMemory ? null : 'You never asked who Haruka is without her sister. (Or helped her remember what she used to love.)'),
      }),
      opt('Reach past Haruka for the blue light behind her.', [go('end_hikaru')], {
        if: (s) => s.trust >= 6 && s.frags.length < DL.Data.GOOD.frags,
      }),
      opt('“I trust you, Hikaru. Completely.”', [go('end_evil')], {
        if: (s) => s.frags.length >= 7 && s.trust >= 8,
      }),
      opt('Let Rin take a photo of all three of you.', [go('end_developed')], {
        if: (s) => s.flags.rinFriend && !s.flags.rinKnows,
      }),
      opt('“Erase me instead.”', [go('end_seat')], {
        if: (s) => s.susp >= 7 || s.flags.admitted,
      }),
      opt('“Which one of you is really Hikaru?”', [go('end_swap')], {
        if: (s) => !!s.flags.festivalPerfect,
      }),
      opt('“It’s the mirror. It’s been the mirror all along.”', [go('end_mirror')], {
        if: (s) => s.flags.sawVanity && (s.flags.fitSabotages || 0) > 0,
      }),
      opt('“I’ve been here before.”', [go('end_loop')], {
        if: () => DL.State.meta.plays >= 3 || DL.State.meta.endings.length >= 3,
      }),
      opt('“You’re right. She always liked being mean.”', [go('end_bad')], { hover: '“You’re right. It’s just us now.”' }),
      opt('“This isn’t my story.” Walk out.', [go('end_neutral')]),
    ),
  ]);
})();
