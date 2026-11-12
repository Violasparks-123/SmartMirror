/* WEEK ONE (Days 1–5): a sweet school life sim. Mostly. */
(() => {
  const { scene, bg, show, hide, n, H, K, R, me, X, rw, opt, choice, add, flag, iff, go, wait, sfx, music, fx, diary,
    phone, msg, reply, phoneClose, js, hideText, card, has, f } = DL.DSL;

  const HIKARU_DM = { sub: 'Hikaru Amane', avatar: 'assets/sprites/hikaru_face.webp' };
  const GROUP = { sub: '28 members', initial: '✿', color: 'linear-gradient(135deg, #ffd3e3, #c7b6ea)' };

  /* ================= DAY 1 ================= */
  scene('d1_morning', [
    card(),
    music('calm'),
    bg('bedroom', { clean: true }),
    n('Your alarm goes off at 6:40. The new uniform is hanging on the wardrobe door, still creased from the bag.'),
    n('First day at a new school. You check your hair twice and leave anyway.'),
    bg('gate', { kenburns: true }),
    n('April. The cherry trees outside Sakuragaoka High are so pink they look painted on.'),
    n('Nobody here knows you yet. That’s either a fresh start or a very long year.'),
    show('haruka', 'smirk', 'left'),
    show('hikaru', 'neutral', 'right'),
    n('Two girls are standing in the middle of the gate like they own it.'),
    n('Twins, obviously. But one is all pink and leopard print, and the other is all blue ruffles and a tired frown.'),
    H('smirk', 'Oh? A new one.'),
    H('smile', 'Hikaru, look. They’re doing the lost-puppy face.'),
    K('mask', '…Cute. Do you need a map, or just a better haircut?'),
    n('She says it like a line she memorised. Her eyes don’t go along with it.'),
    choice(
      opt('Laugh. “A map, please. The haircut’s a lost cause.”', [
        add({ favor: 1, trust: 1 }),
        H('happy', 'Ha! It talks back.'),
        K('smile', '…'),
        n('For half a second, Hikaru smiles for real. Then it’s gone.'),
      ]),
      opt('Walk past them without a word.', [
        add({ favor: -1 }),
        H('cold', 'Wow. Rude.'),
        K('neutral', '…'),
        n('Hikaru steps aside to let you through. Haruka doesn’t notice that she did.'),
      ]),
      opt('“Is this a toll gate? How much?”', [
        add({ favor: 1 }),
        H('happy', 'Ten yen and your dignity.'),
        K('soft', 'She’s kidding. Mostly.'),
      ]),
    ),
    H('smile', 'I’m Haruka Amane. That’s Hikaru. We’re twins, obviously.'),
    H('smirk', 'I’m older. By four minutes.'),
    K('neutral', 'She brings that up a lot.'),
    H('cold', 'Because it *matters*, Hikaru.'),
    H('smirk', 'And you are?'),
    me('{name}. I just transferred in.'),
    H('smile', '{name}. Okay. We’ll see if it sticks.'),
    sfx('bell'),
    n('The bell rings. The twins walk in together, perfectly in step, like they’ve practised it.'),
    hide('haruka'), hide('hikaru'),
    bg('classroom'),
    X('Ms. Kanda', 'Everyone, this is {name}. They’re joining class 2-B from today. Be kind.'),
    n('A few people clap. Someone at the back snorts. You can guess who.'),
    n('Your seat is by the window. On your left, a girl with lavender hair is cleaning a camera lens with total concentration.'),
    show('rin', 'shy', 'center'),
    R('shy', 'Oh. Hi. Rin Hoshino. Photography club.'),
    R('smile', 'Sorry. I’m bad at first meetings. I’m better at taking photos of them.'),
    choice(
      opt('“What do you like taking photos of?”', [
        R('happy', 'Puddles. Train lights. Things nobody looks at twice.'),
        R('shy', 'Don’t laugh.'),
        me('I wasn’t going to.'),
        R('smile', '…Thanks, {name}.'),
        flag('rinFriend'),
      ]),
      opt('“Nice to meet you, Rin.”', [
        R('smile', 'You too. Welcome to 2-B. It’s… a lot.'),
      ]),
    ),
    hide('rin'),
    n('On your right, in the very last window seat, sits Hikaru.'),
    show('hikaru', 'neutral', 'right'),
    n('She’s drawing something in the margin of her notebook. When she sees you looking, she covers it with her hand.'),
    K('cold', '…What.'),
    me('Nothing. It looked nice.'),
    K('shy', 'It’s not finished.'),
    n('Two seats ahead, Haruka turns around and watches the two of you until Ms. Kanda clears her throat.'),
    hide('hikaru'),
    diary('First day at Sakuragaoka. The Amane twins blocked the gate. Haruka talks. Hikaru draws.'),
    diary('Rin sits next to me. She photographs things nobody looks at twice.'),
  ]);

  scene('d1_evening', [
    bg('bedroom_night', { clean: true }),
    n('Your first day is over. Your phone buzzes twice.'),
    phone('2-B ✿', Object.assign({}, GROUP, { sub: 'Haruka added you' })),
    msg('haruka', 'welcome to 2-B, transfer ✿', { group: true }),
    msg('haruka', 'rule one: the window row is ours. you can sit there because hikaru doesn’t mind', { group: true }),
    msg('hikaru', 'i didn’t say that', { group: true }),
    msg('haruka', 'you didn’t NOT say it', { group: true }),
    reply(
      opt('Thanks? I think.', [msg('haruka', 'you’re welcome. you think.', { group: true })]),
      opt('Is there a rule two?', [add({ favor: 1 }), msg('haruka', 'rule two: don’t be boring 💗', { group: true })]),
      opt('Send a cat sticker', [
        msg('haruka', '…acceptable', { group: true }),
        msg('hikaru', 'cute cat', { group: true }),
        add({ trust: 1 }, { quiet: true }),
      ], { send: '(=^･ω･^=)' }),
    ),
    phoneClose(),
    n('You fall asleep wondering which twin is actually in charge.'),
  ]);

  /* ================= DAY 2 ================= */
  scene('d2_morning', [
    card(),
    bg('hallway'),
    n('Before homeroom, there’s a small crowd at the noticeboard.'),
    n('The photography club has put up a poster for its spring exhibition. In the middle is a photo of a puddle at night, full of train lights.'),
    n('Underneath, in small letters: *Photo: R. Hoshino.*'),
    show('haruka', 'smirk', 'left'), show('hikaru', 'neutral', 'right'),
    H('smirk', 'Who takes pictures of *puddles*?'),
    H('smile', 'Hikaru. Marker.'),
    n('Hikaru takes a marker out of her pencil case. She doesn’t uncap it.'),
    H('smile', 'Go on. You’re the one who can draw.'),
    K('mask', '…What should I draw?'),
    H('happy', 'Glasses. Huge ones. Like hers.'),
    n('Haruka notices you standing there.'),
    H('smirk', 'Oh, {name}. Perfect timing. You can watch.'),
    choice(
      opt('“Leave it. It’s a good photo.”', [
        add({ favor: -1, trust: 1, susp: 1 }),
        H('cold', 'Day two and you’ve already picked a side? Wow.'),
        n('Hikaru caps the marker. It clicks very quietly.'),
        K('soft', '…It is a good photo.'),
        H('angry', 'Excuse me?'),
        K('mask', 'For a puddle. I mean. For a puddle.'),
        flag('defendedPoster'),
        diary('Stopped the twins drawing on Rin’s poster. Hikaru looked… relieved?'),
      ]),
      opt('Say nothing.', [
        n('Nobody stops it. Hikaru draws a pair of neat little devil horns on the corner of the photo.'),
        n('They’re good horns. Somehow that makes it worse.'),
        H('happy', 'Perfect. She’s an artist.'),
        K('sad', '…'),
        flag('posterDrawn'),
        diary('Watched Hikaru draw horns on Rin’s poster. I didn’t say anything. Neither did she, really.'),
      ]),
      opt('“Give me the marker. I’ll do it.”', [
        add({ favor: 2, trust: -1 }),
        K('worried', 'You don’t have to.'),
        H('happy', 'Ooh. I like this one.'),
        n('You draw the glasses. Haruka laughs so hard she has to hold the wall.'),
        n('Hikaru doesn’t laugh. She looks at the photo like she’s apologising to it.'),
        flag('posterDrawn'), flag('playerDrew'),
        diary('Drew on Rin’s poster to make Haruka laugh. It worked. I feel a bit sick.'),
      ]),
    ),
    iff(f('posterDrawn'), [
      show('rin', 'surprised', 'center'),
      R('surprised', '…Oh.'),
      R('sad', 'It’s fine. It’s just a poster.'),
      hide('rin'),
      n('It isn’t just a poster. You can tell by how fast she walks away.'),
    ]),
    sfx('bell'),
    hide('haruka'), hide('hikaru'),
  ]);

  scene('d2_evening', [
    bg('bedroom_night', { clean: true }),
    phone('2-B ✿', GROUP),
    iff(f('posterDrawn'), [
      msg('haruka', 'today’s art exhibition 🖍️✨', { group: true }),
      n('Haruka posted a photo of the poster. The drawing is very clear.'),
      reply(
        opt('lol', [add({ favor: 1, trust: -1 }), msg('haruka', 'SEE someone gets it', { group: true })]),
        opt('That’s kind of mean.', [
          add({ favor: -1, trust: 1 }),
          msg('haruka', 'it’s a JOKE. relax.', { group: true }),
          msg('hikaru', 'it was mean', { group: true, deleteAfter: 1400 }),
        ]),
        opt('Say nothing.', [n('Hikaru is typing…'), wait(1300), n('Hikaru stopped typing.')], { send: false }),
      ),
    ], [
      msg('haruka', 'shoutout to {name} for ruining my morning 🙄', { group: true }),
      msg('haruka', 'jk. kind of.', { group: true }),
      reply(
        opt('Sorry, not sorry.', [add({ favor: 1 }), msg('haruka', 'ok that was a little bit cool', { group: true })]),
        opt('It really was a good photo.', [
          add({ trust: 1 }, { quiet: true }),
          msg('hikaru', 'it was.', { group: true }),
          msg('haruka', 'HIKARU.', { group: true }),
          msg('hikaru', 'the puddle. the puddle was good.', { group: true }),
        ]),
      ),
    ]),
    phoneClose(),
  ]);

  /* ================= DAY 3 ================= */
  scene('d3_morning', [
    card(),
    bg('classroom'),
    X('Ms. Kanda', 'For the history project, you’ll work in pairs. Seat neighbours, so nobody argues.'),
    show('haruka', 'surprised', 'left'),
    H('surprised', 'Wait. Seat neighbours? Hikaru’s *my* partner. She’s always my partner.'),
    X('Ms. Kanda', 'Hikaru sits next to {name}. Not this time, Amane.'),
    H('cold', '…Fine.'),
    hide('haruka'),
    show('hikaru', 'neutral', 'right'),
    K('neutral', 'Let’s just split it. You do the poster. I’ll do the research.'),
    choice(
      opt('“Or we could actually work on it together.”', [
        add({ trust: 1 }),
        K('surprised', '…Together?'),
        K('soft', 'Okay. Together.'),
        flag('projectTogether'),
      ]),
      opt('“Works for me.”', [K('neutral', 'Good. Easy.')]),
    ),
    K('worried', 'Sorry about my sister.', rw('Sorry about you.', null, { noRecall: true, delay: 900 })),
    n('…Did she just say that?'),
    n('Hikaru is looking down at her notebook like she didn’t say anything at all.'),
    n('You must have heard it wrong.'),
    hide('hikaru'),
    diary('Got paired with Hikaru for the history project. Haruka took it personally.'),
    diary('Hikaru said something and then… I must have misheard.'),
  ]);

  scene('d3_lunch', [
    bg('stairs'),
    n('You take the back stairs to avoid the cafeteria crowd. Halfway down, you hear voices on the landing.'),
    show('haruka', 'cold', 'left'), show('hikaru', 'worried', 'right'),
    K('worried', 'Here. I saw it at the station shop.'),
    n('She’s holding out a small hair clip shaped like a pink star.'),
    K('shy', 'It’s pink. You like pink.'),
    H('cold', '…Why?'),
    K('worried', 'No reason. I just thought it would look nice on you.'),
    H('smirk', 'No reason. You don’t do anything for no reason, Hikaru. You taught me that.'),
    K('sad', 'Haruka—'),
    H('angry', 'Is this about the transfer? You want them to think you’re the *nice* one?'),
    K('sad', 'I want *you* to think I’m the nice one.', rw('I want them to think *you’re* the mean one.', 'f_clip')),
    iff(has('f_clip'), [
      H('surprised', '…What?'),
      n('For a moment Haruka looks like someone who’s been handed something she doesn’t know how to hold.'),
      H('cold', 'Stop being weird.'),
    ], [
      H('angry', 'I knew it.'),
    ]),
    H('cold', 'Keep your clip.'),
    sfx('thud'),
    n('She pushes it back. It slips out of Hikaru’s hand, bounces down two steps, and stops at your feet.'),
    n('Both of them look down at it. Then up at you.'),
    H('smirk', 'Oh. Eavesdropping. Cute.'),
    choice(
      opt('Pick it up and hand it back to Hikaru.', [
        add({ trust: 1, susp: 1 }),
        K('soft', '…Thanks.'),
        n('Haruka watches the clip go back into Hikaru’s hand like she’s watching evidence get bagged.'),
      ]),
      opt('Hold it out to Haruka. “She bought it for you.”', [
        add({ favor: -1, trust: 1 }),
        H('cold', 'Then she can keep wasting her money.'),
        n('Haruka doesn’t take it. You give it back to Hikaru instead. She holds it very carefully.'),
        flag('defendedClip'),
      ]),
      opt('Pretend you didn’t see anything.', [
        add({ favor: 1 }),
        H('smirk', 'Smart.'),
        n('Hikaru picks the clip up herself and puts it in her pocket.'),
      ]),
    ),
    hide('haruka'),
    K('mask', 'Don’t tell anyone about this.'),
    hide('hikaru'),
    flag('clipWithHikaru'),
    diary('Hikaru tried to give Haruka a star hair clip on the stairs. Haruka acted like it was a trap.'),
  ]);

  scene('d3_evening', [
    bg('bedroom_night', { clean: true }),
    n('Your phone lights up with a number you don’t have saved.'),
    phone('Hikaru', HIKARU_DM),
    msg('hikaru', 'this is hikaru. i got your number from the group'),
    msg('hikaru', 'about the stairs today'),
    msg('hikaru', 'please don’t tell anyone'),
    reply(
      opt('I won’t.', [add({ trust: 1 }), msg('hikaru', 'ok. thank you')]),
      opt('Why did she react like that?', [msg('hikaru', 'she thinks i’m playing a game with her'), msg('hikaru', 'i’m really bad at games')]),
      opt('Was the clip for her birthday?', [msg('hikaru', 'no. it was an apology'), msg('hikaru', 'she didn’t let me finish it')]),
    ),
    msg('hikaru', 'you sit next to me so you’ll probably see more weird stuff'),
    msg('hikaru', 'sorry in advance'),
    reply(
      opt('Weird is fine.', [add({ trust: 1 }, { quiet: true }), msg('hikaru', 'ok. goodnight {name}')]),
      opt('Goodnight, Hikaru.', [msg('hikaru', 'goodnight')]),
    ),
    phoneClose(),
    diary('Hikaru texted me. She types in all lowercase, like she’s trying to be quiet even on a screen.'),
  ]);

  /* ================= DAY 4 ================= */
  scene('d4_morning', [
    card(),
    bg('classroom'),
    n('Something’s wrong in 2-B before you even sit down.'),
    n('People are whispering and looking at Rin. Rin is looking at a note on her desk.'),
    show('rin', 'sad', 'center'),
    n('Someone has written on it in round pink pen: *photo club creep takes pictures of people without asking.*'),
    R('sad', 'It’s not true. I always ask. I *always* ask.'),
    show('haruka', 'smirk', 'farleft'),
    H('smirk', 'Hm? What’s that, Hoshino? Someone has a fan club.'),
    n('Hikaru stands up. Haruka stops smiling.'),
    show('hikaru', 'worried', 'farright'),
    K('worried', 'Rin… I’m sorry. About the poster. About all of it.', rw('Rin… you’re sorry, right? About the poster? About all of it?', 'f_rin')),
    iff(has('f_rin'), [
      R('surprised', '…Oh.'),
      R('shy', 'Thank you. I think.'),
      n('Rin looks at Hikaru like she’s seeing her for the first time.'),
    ], [
      R('sad', 'What? I’m not— I didn’t do anything.'),
      n('Rin looks like she’s been slapped. Hikaru looks confused, like she doesn’t know why.'),
    ]),
    add({ susp: 1 }, { quiet: true }),
    H('cold', 'Hikaru. Sit down.'),
    n('Hikaru sits.'),
    choice(
      opt('Tell everyone the note isn’t true. Loudly.', [
        add({ favor: -1, trust: 1 }),
        me('For the record, Rin asks before she takes anyone’s photo. I’ve watched her do it.'),
        R('smile', '…Thanks, {name}.'),
        H('cold', 'Wow. A hero.'),
        flag('defendedRin'),
      ]),
      opt('Ask Haruka quietly to stop.', [
        H('surprised', 'Me? Why would you think it was me?'),
        H('smirk', '…Pink pen is very common.'),
        iff((s) => s.favor >= 4, [
          H('cold', 'Fine. I’ll let it go. For you.'),
          add({ favor: 1 }),
          flag('askedHarukaStop'),
        ], [
          add({ favor: -1 }),
        ]),
      ]),
      opt('Stay out of it.', [
        n('You look out of the window. The cherry trees don’t care either.'),
        add({ trust: -1 }, { quiet: true }),
      ]),
    ),
    hide('rin'), hide('haruka'), hide('hikaru'),
    diary((s) => s.frags.includes('f_rin')
      ? 'Someone left a cruel note on Rin’s desk. Hikaru apologised to her. I’m sure that’s what she said.'
      : 'Someone left a cruel note on Rin’s desk. Hikaru said something to Rin and it came out wrong. Did it?'),
  ]);

  scene('d4_evening', [
    bg('bedroom_night', { clean: true }),
    phone('2-B ✿', GROUP),
    msg('haruka', 'POLL: is the transfer on our side? 🗳️', { group: true }),
    msg('haruka', '@{name} you get a vote too ✿', { group: true }),
    reply(
      opt('Always ✿', [add({ favor: 2, trust: -1 }), flag('loyal'), msg('haruka', 'correct answer 💗', { group: true }), msg('hikaru', '…', { group: true })]),
      opt('I’m on my own side.', [add({ favor: -1 }), msg('haruka', 'boring. but ok', { group: true }), msg('hikaru', 'that’s allowed', { group: true }), add({ trust: 1 }, { quiet: true })]),
      opt('What sides?', [msg('haruka', 'oh you’ll see', { group: true }), msg('haruka', 'everyone picks eventually', { group: true })]),
    ),
    n('A minute later, Hikaru messages you on her own.'),
    phone('Hikaru', HIKARU_DM),
    msg('hikaru', 'you don’t have to pick'),
    msg('hikaru', 'that’s how it started with us. someone picking'),
    phoneClose(),
  ]);

  /* ================= DAY 5 ================= */
  scene('d5_morning', [
    card(),
    bg('classroom'),
    X('Ms. Kanda', 'Phones away. Surprise quiz. Twenty minutes.'),
    n('Half the class groans. Haruka groans the loudest.'),
    iff((s) => s.grades >= 55, [
      n('You finish with time to spare. All that studying paid off.'),
      show('hikaru', 'worried', 'right'),
      K('worried', '…{name}. Question three. How?'),
      choice(
        opt('Tilt your paper so she can see your working.', [
          add({ trust: 1 }),
          K('soft', 'Oh. Oh, that’s clever.'),
          n('She writes it down and gives you a tiny thumbs-up under the desk.'),
          flag('helpedQuiz'),
        ]),
        opt('“Sorry. You’ll get it.”', [K('neutral', '…Yeah. Okay.')]),
      ),
      hide('hikaru'),
    ], [
      n('You stare at question three until it stares back.'),
      n('You guess. Confidently. That’s half of it, right?'),
    ]),
    n('When the papers come back, Haruka folds hers in half before anyone can see the number.'),
    show('haruka', 'cold', 'left'),
    n('Hikaru’s paper says 92. Haruka glances at it, then at her own folded paper, then out of the window.'),
    H('smirk', 'Whatever. Quizzes are for people with no personality.'),
    hide('haruka'),
    diary((s) => s.flags.helpedQuiz
      ? 'Surprise quiz. Helped Hikaru with question three. Haruka hid her score.'
      : 'Surprise quiz. Haruka hid her score. Hikaru got 92 and didn’t say a word about it.'),
  ]);

  scene('d5_after', [
    bg('hallway'),
    n('After the last bell, Haruka rushes past you. She has cram school on Fridays, and she’s late.'),
    sfx('thud'),
    n('Something falls out of her bag: a pink notebook with a star sticker on the front.'),
    n('She doesn’t notice. She’s already gone.'),
    n('On the cover, in round pink pen: *PROOF.*'),
    choice(
      opt('Open it.', [go('d5_notebook_read')]),
      opt('Run after her and give it back. Don’t open it.', [go('d5_notebook_return')]),
      opt('Leave it where it fell.', [go('d5_notebook_leave')]),
    ),
  ]);

  scene('d5_notebook_read', [
    sfx('page'),
    flag('readNotebook'),
    n('The first page is a list. Every line has a date.'),
    n('*4/13 — She was nice to the transfer at the gate. She’s doing it again. Making people like her so I’m the bad one.*'),
    iff(f('defendedPoster'),
      [n('*4/14 — She stopped at the poster because the transfer said so. She WANTED to draw. I know she wanted to.*')],
      [n('*4/14 — The horns were perfect. She loves this. She always loved it more than me.*')]),
    n('*4/15 — A star clip. She knows I hate stars now. She knows why.*'),
    n('*4/16 — She talked to Hoshino. In front of everyone. In front of ME.*'),
    n('At the bottom of the page, pressed so hard the pen almost went through:'),
    n('*She likes being mean. She always did. She’s just better at hiding it than me.*'),
    music('uneasy'),
    wait(600),
    sfx('static'),
    fx('tear', { ms: 420 }),
    n('Underneath, a new line is writing itself. You watch the pink ink appear, letter by letter.'),
    n('*4/17 — [[{name} is reading this.]]*'),
    fx('flash', { color: '#ffb3cf', ms: 180 }),
    n('You shut the notebook.'),
    n('The hallway is empty. The notebook feels lighter than it should. The last page is gone.'),
    js(() => DL.Screens.toast('You can now see Haruka’s suspicion in your planner.', 'sys', 3800)),
    n('You leave it on the shoe shelf by the entrance, where she’ll find it on Monday.'),
    diary('Haruka’s notebook fell out of her bag. It was full of “proof” that Hikaru enjoys being mean.'),
    diary('The last line was about me. It wasn’t there when I started reading.'),
  ]);

  scene('d5_notebook_return', [
    bg('gate'),
    n('You catch up with her at the gate, out of breath.'),
    show('haruka', 'surprised', 'left'),
    H('surprised', '…That’s mine.'),
    me('It fell out of your bag. I didn’t open it.'),
    H('cold', 'Liar.'),
    me('I didn’t.'),
    n('She studies your face for a long time. Then she takes the notebook and holds it against her chest.'),
    H('shy', '…Okay.'),
    H('neutral', 'Thanks, {name}. I mean it. Don’t tell Hikaru I said thanks. She’ll think I’ve gone soft.'),
    add({ favor: 2 }),
    flag('returnedNotebook'),
    hide('haruka'),
    diary('Gave Haruka her notebook back without reading it. She said thank you, and I think she meant it.'),
  ]);

  scene('d5_notebook_leave', [
    n('It isn’t yours to read. You leave it on the floor and go.'),
    n('At the end of the hallway, you look back.'),
    show('hikaru', 'sad', 'center'),
    n('Hikaru is crouching by the notebook, reading it. She turns one page, very slowly, and covers her mouth with her hand.'),
    hide('hikaru'),
    flag('hikaruReadNotebook'),
    diary('Left Haruka’s notebook in the hallway. Hikaru found it. Whatever was inside, it hurt her.'),
  ]);

  scene('d5_evening', [
    bg('bedroom_night', { clean: true }),
    phone('Hikaru', HIKARU_DM),
    iff(f('hikaruReadNotebook'), [
      msg('hikaru', 'did you see what was in it'),
      reply(
        opt('No. I didn’t read it.', [msg('hikaru', 'good. don’t')]),
        opt('Are you okay?', [msg('hikaru', 'she thinks i like it'), msg('hikaru', 'being like that'), add({ trust: 1 }, { quiet: true })]),
      ),
    ]),
    msg('hikaru', 'random question'),
    msg('hikaru', 'do you like trains'),
    reply(
      opt('I like train lights at night.', [add({ trust: 1 }), msg('hikaru', '!!!'), msg('hikaru', 'ok same')]),
      opt('They’re fine?', [msg('hikaru', 'fair')]),
    ),
    msg('hikaru', 'there’s a spot at the end of the platform at sakuragaoka station'),
    msg('hikaru', 'you can see the trains coming from really far away'),
    msg('hikaru', 'the lights look like stars that keep changing their mind'),
    msg('hikaru', 'haruka and i used to go there when we were small. before'),
    msg('hikaru', 'anyway. if you’re ever there after school'),
    flag('stationUnlocked'),
    js(() => DL.Screens.toast('New place: Sakuragaoka Station', 'lav', 3400)),
    phoneClose(),
  ]);
})();
