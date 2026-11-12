/* LOCATION EVENTS. When you pick a place in the planner, the game plays the first
   event here whose condition is true and that you haven't seen yet. If none are
   left, it plays the place's repeatable everyday scene. Day 7 has its own versions. */
(() => {
  const { bg, show, hide, say, n, H, K, R, me, X, rw, opt, choice, add, flag, iff, item, shop, fx, diary, oneOf, has, f, scene } = DL.DSL;

  const here = () => DL.State.hikaruHere();
  const notD7 = (s) => s.day !== 7;

  /* Gifts you can buy at the konbini */
  const giftHaruka = iff((s) => s.items.milk > 0, [
    choice(
      opt('Give Haruka the strawberry milk.', [
        item('milk', -1),
        add({ favor: 1 }),
        H('surprised', '…For me?'),
        H('shy', 'It’s the right brand, too. How did you know?'),
        iff(here, [n('Somewhere nearby, Hikaru is smiling at her shoes.')]),
      ]),
      opt('Keep it for later.', []),
    ),
  ]);
  const giftHikaru = iff((s) => s.items.pencils > 0 && DL.State.hikaruHere(), [
    choice(
      opt('Give Hikaru the blue sketch pencils.', [
        item('pencils', -1),
        add({ trust: 2 }),
        K('surprised', 'These are the good ones. Six blues.'),
        K('soft', 'I’m going to draw something worth using them on.'),
        flag('gavePencils'),
      ]),
      opt('Not now.', []),
    ),
  ]);

  DL.Events = {
    /* ------------------------------ LUNCH ------------------------------ */
    cafeteria: [
      { id: 'cafe_7', cond: (s) => s.day === 7, scene: [
        bg('cafeteria'),
        show('haruka', 'happy', 'left'),
        H('happy', 'You came! Sit, sit. I got you the curry. Not the fish.'),
        n('There are two lunch trays on the window table. One for you. One for Haruka. There is no third.'),
        H('smile', 'Isn’t it nice? Just us. Nobody sighing at me. Nobody being *secretly* nice behind my back.'),
        choice(
          opt('“Where’s Hikaru?”', [
            H('blank', 'Who?'),
            fx('flicker', { variant: 'g2' }),
            H('smile', 'You keep saying that name. It’s cute. Like an imaginary friend.'),
            add({ susp: 1 }, { quiet: true }),
          ]),
          opt('“It is nice.”', [add({ favor: 1 }), H('happy', 'I knew you’d get it.')]),
        ),
        giftHaruka,
        diary('!h Lunch with {name}. Just the two of us. Perfect.'),
      ] },
      { id: 'cafe_1', cond: (s) => notD7(s) && here(), scene: [
        bg('cafeteria'),
        n('The Amane twins have the best table in the cafeteria: by the window, next to the vending machines, far from everyone else.'),
        show('haruka', 'smirk', 'left'), show('hikaru', 'neutral', 'right'),
        H('smirk', 'Look who’s here. Sit. You can stay if you’re entertaining.'),
        n('Across the room, Rin is eating alone with a book propped against her water bottle.'),
        H('smile', 'Hoshino reads at lunch so nobody notices she has no friends. Smart, honestly.'),
        choice(
          opt('Laugh along.', [
            add({ favor: 1, trust: -1 }),
            H('happy', 'See? You get it.'),
            K('mask', '…Hilarious.'),
            n('Hikaru pushes her rice around her bento and doesn’t eat any of it.'),
          ]),
          opt('“Maybe she just likes the book.”', [
            add({ favor: -1, trust: 1 }),
            H('cold', 'Nobody likes a book that much.'),
            K('soft', 'Some people do.'),
            H('angry', 'Whose side are you on?'),
            K('mask', '…Yours. Obviously.'),
          ]),
          opt('Change the subject. “What’s good here?”', [
            H('neutral', 'The curry. Never the fish.'),
            K('neutral', 'The fish is fine.'),
            H('smirk', 'The fish is a crime, Hikaru.'),
          ]),
        ),
        giftHaruka,
        diary('Ate lunch at the twins’ table. Haruka talks about everyone. Hikaru barely eats.'),
      ] },
      { id: 'cafe_2', cond: (s) => s.day >= 3 && notD7(s) && here(), scene: [
        bg('cafeteria'),
        show('haruka', 'smirk', 'left'), show('hikaru', 'worried', 'right'),
        n('Rin walks past the window table with a folder of prints for the exhibition.'),
        H('smirk', '{name}. You’re holding a juice. Rin’s holding photos. I’m just saying. Accidents happen.'),
        K('worried', 'Please don’t. She hasn’t done anything to you.', rw('Please, do it. She deserves it, doesn’t she?', 'f_cafe')),
        iff(has('f_cafe'), [n('Hikaru’s voice was very small. But you heard the real version.')]),
        choice(
          opt('“Oops.” Tip the juice.', [
            add({ favor: 2, trust: -2 }),
            flag('hurtRin'),
            n('The juice goes everywhere. Three of Rin’s prints are ruined.'),
            show('rin', 'cry', 'center'),
            R('cry', '…'),
            hide('rin'),
            H('happy', 'Oh no. Tragic.'),
            K('sad', '…'),
          ]),
          opt('Refuse. “No.”', [
            add({ favor: -1, trust: 1 }),
            H('cold', 'Wow. Okay. Boring.'),
            K('soft', '…'),
          ]),
          opt('Pretend to trip, and miss on purpose.', [
            add({ trust: 1 }),
            n('You stumble dramatically and pour the juice onto your own shoe.'),
            H('surprised', '…You’re so bad at this.'),
            K('happy', 'Pfft—'),
            n('Hikaru laughs before she can stop herself. Haruka glares at her.'),
            add({ susp: 1 }, { quiet: true }),
          ]),
        ),
        diary((s) => s.flags.hurtRin
          ? 'Spilled juice on Rin’s exhibition prints because Haruka wanted me to. I can’t stop thinking about it.'
          : 'Haruka wanted me to ruin Rin’s prints. I didn’t.'),
      ] },
      { id: 'cafe_any', repeat: true, scene: [
        bg('cafeteria'),
        show('haruka', 'smile', 'left'),
        iff(here, [show('hikaru', 'neutral', 'right')]),
        oneOf(
          [H('smile', 'Curry day. Finally, something to live for.'), iff(here, [K('neutral', 'You say that every curry day.')])],
          [H('smirk', 'Do you think Ms. Kanda dyes her hair? It’s too black. Nobody’s hair is that black.'), iff(here, [K('neutral', 'Yours is pink.')]), H('cold', 'Mine is *natural*.')],
          [n('Lunch is loud, warm and a bit too much. Haruka narrates the whole cafeteria like a nature documentary.')],
        ),
        giftHaruka,
        diary('Lunch in the cafeteria. Haruka had opinions about everyone.'),
      ] },
    ],

    rooftop: [
      { id: 'roof_7', cond: (s) => s.day === 7, scene: [
        bg('rooftop'),
        n('The rooftop is empty. The fence is humming in the wind.'),
        n('Something blue is caught in the chain-link: a page torn from a sketchbook, flapping like a trapped bird.'),
        n('You pull it free. It’s a drawing of the window seat in 2-B with someone sitting in it. The someone has been scribbled out in pink.'),
        n('In the corner, in small neat handwriting:'),
        say('hikaru', null, 'If she can’t see me anymore, will you?', rw('There’s nobody here. There never was.', 'f_ribbon')),
        iff(has('f_ribbon'),
          [n('You fold the page into your pocket. It feels warm, like someone was holding it a moment ago.')],
          [n('The wind tears the page out of your hand. It’s gone over the fence before you can grab it.')]),
        diary('Found a page from Hikaru’s sketchbook caught in the rooftop fence.'),
      ] },
      { id: 'roof_1', cond: (s) => notD7(s) && here(), scene: [
        bg('rooftop'),
        n('The rooftop is windy and empty. Almost empty.'),
        show('hikaru', 'surprised', 'center'),
        n('Hikaru is sitting by the water tank with her sketchbook. She snaps it shut when she sees you.'),
        K('mask', '…Are you lost? Again?'),
        K('sad', 'Sorry. That came out on autopilot.'),
        choice(
          opt('“What are you drawing?”', [K('shy', 'Trains. And… people. Sometimes.'), K('neutral', 'Not you. Don’t worry.'), add({ trust: 1 })]),
          opt('“Shouldn’t you be at lunch with your sister?”', [K('cold', 'She has her table. I have the roof.'), K('sad', 'It’s fine. It’s a break.')]),
          opt('Sit down nearby and eat without saying anything.', [n('You eat your onigiri. She goes back to drawing. It’s the most comfortable silence you’ve had all week.'), add({ trust: 1 })]),
        ),
        diary('Found Hikaru on the roof with her sketchbook. Up here she doesn’t use the mean voice.'),
      ] },
      { id: 'roof_2', cond: (s) => s.trust >= 2 && s.day >= 4 && notD7(s) && here(), scene: [
        bg('rooftop'),
        show('hikaru', 'neutral', 'center'),
        K('neutral', 'You came back.'),
        me('The roof’s nice. And you’re less scary up here.'),
        K('soft', 'Down there, I say what she expects me to say. It’s easier than explaining.'),
        K('sad', 'I hate it. I hate who I am when we’re like that.', rw('I love it. I love who I am when we’re like that.', 'f_roof')),
        iff(has('f_roof'),
          [K('worried', '…You heard what I actually said, didn’t you? Everyone else hears the other thing.')],
          [n('She smiles when she says it. The smile doesn’t match the words. Or the words don’t match the smile.')]),
        giftHikaru,
        diary((s) => s.frags.includes('f_roof')
          ? 'Hikaru told me she hates who she is when she’s mean. The words tried to flip. I flipped them back.'
          : 'Hikaru told me she loves being mean. She didn’t look like she loved anything.'),
      ] },
      { id: 'roof_3', cond: (s) => s.trust >= 4 && s.day >= 5 && notD7(s) && here(), scene: [
        bg('rooftop'),
        show('hikaru', 'soft', 'center'),
        K('soft', 'When we were small, Haruka was the shy one. She’d hide behind me at the station and hold my sleeve.'),
        K('neutral', 'Then one night I was mean to some girls who were picking on her. Really mean. And she looked at me like I was a hero.'),
        K('sad', 'After that she started being mean too. I think she thought that’s what I wanted.'),
        me('Is it?'),
        K('sad', 'No. It never was.'),
        giftHikaru,
        flag('heardBefore'),
        diary('Hikaru told me how it started. One night at the station. One mean thing, said for the right reason.'),
      ] },
      { id: 'roof_any', repeat: true, scene: [
        bg('rooftop'),
        iff((s) => here() && s.trust >= 1, [
          show('hikaru', 'soft', 'center'),
          n('Hikaru is in her usual spot. She lifts a hand without looking up from her sketchbook.'),
          giftHikaru,
        ], [
          n('Wind, sky, and the whole town laid out like a map. You eat in peace.'),
        ]),
        diary('Lunch on the roof. Quiet.'),
      ] },
    ],

    library: [
      { id: 'lib_7', cond: (s) => s.day === 7, scene: [
        bg('library'),
        show('rin', 'neutral', 'center'),
        R('neutral', '{name}. You look like you haven’t slept.'),
        me('Rin, do you remember Hikaru Amane? Haruka’s twin?'),
        R('worried', 'Haruka doesn’t have a twin. She’s an only child. Everyone knows that.'),
        R('neutral', '…Although.'),
        n('Rin takes an old photo out of her folder: a summer festival at Sakuragaoka Station. A little girl in a goldfish yukata, holding someone’s sleeve.'),
        n('The someone is a smear of pale blue, like the photo was taken through a wet window.'),
        R('worried', 'I took this years ago. I always thought there were two of them in it. Isn’t that strange? There’s obviously only one.'),
        flag('photoClue'),
        add({ trust: 1 }),
        diary('Rin has a photo from the Tanabata festival. A blue smear is holding Haruka’s hand.'),
      ] },
      { id: 'lib_1', cond: notD7, scene: [
        bg('library'),
        n('The library is so quiet you can hear the clock. There’s a pair of glasses on one of the tables.'),
        show('rin', 'surprised', 'center'),
        R('surprised', 'Oh! Those are mine. My spare pair. I keep losing the other one.'),
        R('smile', 'You study here too? It’s the only place Haruka never comes. She says books smell like homework.'),
        choice(
          opt('“Want to study together?”', [R('happy', 'Yes! I mean. Sure. If you want.'), flag('rinFriend'), add({ grades: 3 }, { quiet: true })]),
          opt('“Why does Haruka pick on you?”', [
            R('worried', 'I don’t know. I took a photo of the twins at a festival when we were kids. They were really cute.'),
            R('sad', 'Maybe she doesn’t like being reminded she used to be cute.'),
            flag('rinPhotoHint'),
          ]),
        ),
        diary('Studied in the library. Rin lends me highlighters if I promise to put the caps back on.'),
      ] },
      { id: 'lib_2', cond: (s) => s.day >= 4 && notD7(s) && (s.flags.hurtRin || s.flags.posterDrawn || s.flags.defendedRin || s.flags.defendedPoster), scene: [
        bg('library'),
        iff(f('hurtRin'), [
          show('rin', 'sad', 'center'),
          R('sad', '…Oh. It’s you.'),
          R('sad', 'Those prints were for the exhibition. I’d been saving them since last summer.'),
          choice(
            opt('“I’m sorry. Haruka told me to, and I did it anyway.”', [R('neutral', '…At least you said it.')]),
            opt('Say nothing.', [n('She turns back to her book. You don’t blame her.')]),
          ),
        ], [
          show('rin', 'neutral', 'center'),
          R('neutral', 'Can I tell you something weird?'),
          R('worried', 'After the note on my desk, someone left a sticky note in my locker. It just said *sorry*, with a little blue star drawn on it.'),
          iff(f('posterDrawn'), [R('smile', 'And someone cleaned the drawing off my poster. With nail polish remover. It smelled like strawberries for a week.')]),
          R('shy', 'I think I know who. But she’d never admit it.'),
          flag('rinClue'),
          add({ trust: 1 }, { quiet: true }),
        ]),
        diary((s) => s.flags.hurtRin
          ? 'Rin knows the juice was me. Studying next to her was very quiet.'
          : 'Someone keeps secretly apologising to Rin with little blue stars.'),
      ] },
      { id: 'lib_any', repeat: true, scene: [
        bg('library'),
        oneOf(
          [n('You study until the words start to swim. Your grades will thank you.')],
          [iff(f('rinFriend'), [
            show('rin', 'smile', 'center'),
            R('smile', 'Highlighter? Pink or blue?'),
            choice(
              opt('Pink.', [R('neutral', 'Bold choice. Very Haruka.')]),
              opt('Blue.', [R('smile', 'Good choice. Calmer.')]),
            ),
          ], [
            n('You study by the window. Rin is three tables away, pretending not to notice you.'),
          ])],
        ),
        diary('Studied in the library.'),
      ] },
    ],

    courtyard: [
      { id: 'court_7', cond: (s) => s.day === 7, scene: [
        bg('courtyard'),
        show('haruka', 'happy', 'center'),
        H('happy', 'You found me! I was waiting.'),
        H('smile', 'I like the courtyard better now. It’s quieter. Less… blue.'),
        n('Every flower in the beds is pink. You’re almost sure some of them were blue last week.'),
        choice(
          opt('“Haruka, what did you do?”', [H('blank', 'I fixed things. That’s all. I fixed the lines that didn’t make sense.'), add({ susp: 1 }, { quiet: true })]),
          opt('Sit with her.', [add({ favor: 1 }), H('soft', 'See? Simple.')]),
        ),
        giftHaruka,
        diary('!h {name} sat with me under the tree. The flowers are all the right colour now.'),
      ] },
      { id: 'court_1', cond: (s) => s.day >= 2 && notD7(s), scene: [
        bg('courtyard'),
        n('You find a bench under the big cherry tree. Somebody is already sitting at the other end.'),
        show('haruka', 'surprised', 'center'),
        H('surprised', '—! Oh. It’s you.'),
        n('Haruka has her hair down. She was redoing her ponytail.'),
        H('cold', 'Don’t look. It takes me twenty minutes to get it right and I just ruined it.'),
        choice(
          opt('“It looks nice down, actually.”', [H('shy', '…Shut up.'), add({ favor: 1 })]),
          opt('“Why does it have to be perfect?”', [
            H('neutral', 'Because I’m Haruka Amane. The older one. If I look messy, we both look messy.'),
            H('cold', 'Mom says we’re a set. Hikaru’s the smart one. I’m the… personality.'),
            flag('harukaPressure'),
            add({ favor: 1 }, { quiet: true }),
          ]),
          opt('Leave her alone.', [n('You find another bench. When you look back, she’s watching you go, holding her hair tie.')]),
        ),
        giftHaruka,
        diary('Saw Haruka with her hair down in the courtyard. She looked younger, and annoyed about it.'),
      ] },
      { id: 'court_2', cond: (s) => s.day >= 4 && notD7(s), scene: [
        bg('courtyard'),
        show('haruka', 'smile', 'center'),
        H('smile', '{name}. Sit. I need a favour.'),
        H('smirk', 'You sit next to Hikaru. If she talks to Hoshino, or draws anything weird, or gets *secret texts*, you tell me. Okay?'),
        choice(
          opt('“Sure. I’ll keep an eye on her.”', [add({ favor: 2, trust: -1 }), flag('informant'), H('happy', 'I knew you were smart.')]),
          opt('“No. Ask her yourself.”', [
            add({ favor: -1 }),
            H('cold', 'Ask her? She’d just lie. She’s *so* good at lying.'),
            H('sad', 'She used to tell me everything.'),
            add({ susp: -1 }, { quiet: true }),
          ]),
          opt('“Why don’t you trust your own sister?”', [
            H('angry', 'Because she’s playing a game, and I’m the only one who can see it.'),
            add({ susp: 1 }, { quiet: true }),
          ]),
        ),
        diary((s) => s.flags.informant ? 'Agreed to spy on Hikaru for Haruka.' : 'Haruka wanted me to spy on Hikaru. I said no.'),
      ] },
      { id: 'court_3', cond: (s) => s.day >= 6 && s.favor >= 4 && notD7(s), scene: [
        bg('courtyard'),
        show('haruka', 'neutral', 'center'),
        n('Haruka is sitting under the tree, turning something over in her fingers. A pink star hair clip.'),
        H('cold', 'Don’t say anything. I found it on the stairs. She must have dropped it again.'),
        H('neutral', 'She bought it at the station shop. The one by the platform where we used to watch the trains.'),
        choice(
          opt('“Maybe it really was an apology.”', [
            iff((s) => s.favor >= 6,
              [H('sad', '…Maybe.'), add({ susp: -2 })],
              [H('angry', 'You don’t know her like I do.'), add({ susp: 1 }, { quiet: true })]),
          ]),
          opt('“You kept it.”', [H('shy', 'I didn’t *keep* it. I just didn’t throw it away. That’s different.'), add({ favor: 1 })]),
        ),
        flag('harukaHasClip'),
        diary('Haruka has the star clip. She says she didn’t keep it. She kept it.'),
      ] },
      { id: 'court_any', repeat: true, scene: [
        bg('courtyard'),
        n('Petals drift down onto the bench. You close your eyes for a few minutes and feel your energy come back.'),
        diary('Rested under the cherry tree.'),
      ] },
    ],

    /* --------------------------- AFTER SCHOOL --------------------------- */
    classroom: [
      { id: 'class_7', cond: (s) => s.day === 7, scene: [
        bg('classroom_dusk'),
        n('You study alone. The window seat beside you is empty.'),
        n('Something is scratched very lightly into the desk, as if with a pencil tip: a tiny star, and the letters *H & H*.'),
        n('As you watch, one of the H’s fades like breath on a mirror.'),
        fx('flicker', { variant: 'g2' }),
        diary('The desk by the window said H & H. Then it said H.'),
      ] },
      { id: 'class_1', cond: (s) => s.day <= 6 && here(), scene: [
        bg('classroom_dusk'),
        n('Most people have gone home. The classroom is orange with sunset.'),
        show('hikaru', 'worried', 'center'),
        n('Hikaru is at the blackboard with an eraser. Someone has drawn Rin with huge glasses and a camera for a head. In pink chalk.'),
        K('mask', 'Don’t look at me. I didn’t draw it.'),
        K('sad', 'I’m just… cleaning.'),
        choice(
          opt('Grab the other eraser and help.', [
            add({ trust: 1 }),
            n('You erase it together. When it’s gone, Hikaru breathes out like she’s been holding her breath all day.'),
            K('soft', '…Thanks. She’ll know it was me. But thanks.'),
          ]),
          opt('“If Haruka drew it, why are you the one cleaning it?”', [K('neutral', 'Because somebody has to. And it’s always me.'), add({ trust: 1 }, { quiet: true })]),
          opt('“It’s kind of funny, though.”', [add({ trust: -1 }), K('cold', '…Yeah. Hilarious.'), n('She erases faster.')]),
        ),
        diary('Helped Hikaru wipe a mean drawing of Rin off the board. Haruka drew it. Hikaru cleaned it.'),
      ] },
      { id: 'class_2', cond: (s) => s.day >= 4 && notD7(s), scene: [
        bg('classroom_dusk'),
        show('haruka', 'cold', 'center'),
        n('Haruka is alone at her desk, glaring at a maths worksheet like it insulted her.'),
        H('cold', 'Don’t. Say. Anything.'),
        iff((s) => s.grades >= 55, [
          choice(
            opt('Offer to help.', [
              H('surprised', '…You’d help me?'),
              H('shy', 'Fine. Only because Hikaru’s busy being a saint somewhere.'),
              n('You go through the worksheet together. She’s quick once she stops panicking.'),
              H('neutral', 'Don’t tell anyone. Hikaru gets nineties. I get *the personality*.'),
              add({ favor: 2 }),
              flag('harukaPressure'),
            ]),
            opt('Study at your own desk.', [n('You study quietly. Once, you hear her sniff and then pretend it was a cough.')]),
          ),
        ], [
          n('You’d offer to help, but honestly, you’re barely keeping up yourself.'),
          H('smirk', 'Oh good. Someone worse at this than me. I feel better.'),
        ]),
        diary('Haruka stayed late with a maths worksheet. She’s less scary on paper.'),
      ] },
      { id: 'class_any', repeat: true, scene: [
        bg('classroom_dusk'),
        n('You study until the sun goes down. Your notes are almost readable.'),
        diary('Studied after school.'),
      ] },
    ],

    konbini: [
      { id: 'kon_7', cond: (s) => s.day === 7, scene: [
        bg('konbini'),
        X('Mr. Oda', 'The Amane girl was in again. Strawberry milk. Just the one carton.'),
        X('Mr. Oda', 'Funny. I could have sworn she always bought two.'),
        shop(),
        diary('Mr. Oda remembers two cartons. Nobody else remembers two of anything.'),
      ] },
      { id: 'kon_1', cond: (s) => notD7(s) && here(), scene: [
        bg('konbini'),
        X('Mr. Oda', '{name}, you’re on the register. Smile at the customers. Not too much. Just enough.'),
        n('The door chimes. It’s Hikaru, still in her school things.'),
        show('hikaru', 'surprised', 'center'),
        K('surprised', '…You work here?'),
        n('She puts a pink carton of strawberry milk on the counter. Then a second one.'),
        me('Two?'),
        K('shy', 'One’s for Haruka. She has cram school. She always forgets to eat.'),
        K('mask', 'Don’t tell her I bought it. Say it came from the vending machine. She’ll drink it if she thinks it was luck.'),
        choice(
          opt('“Your secret’s safe.”', [add({ trust: 1 }), K('soft', '…Thanks.')]),
          opt('“Why not just give it to her?”', [K('sad', 'Because she’d think I wanted something. She always thinks I want something.')]),
        ),
        hide('hikaru'),
        shop(),
        diary('Hikaru buys strawberry milk for Haruka and pretends it came from the vending machine.'),
      ] },
      { id: 'kon_2', cond: (s) => s.day >= 5 && notD7(s), scene: [
        bg('konbini'),
        show('haruka', 'smirk', 'center'),
        H('smirk', 'Wow. Service with a smile. Do they pay extra for that face?'),
        H('neutral', 'I’m not buying anything. I’m waiting for my train.'),
        iff((s) => s.trust >= 3, [
          H('cold', 'Hey. Why does Hikaru text you? Her phone lights up and she *smiles* at it.'),
          choice(
            opt('“Homework. The history project.”', [H('smirk', 'Sure. Homework.'), add({ susp: 1 }, { quiet: true })]),
            opt('“She’s lonely, Haruka.”', [H('surprised', '…She has *me*.'), H('sad', 'She has me.'), add({ susp: -1 })]),
          ),
        ], [
          H('neutral', '…Strawberry milk is ¥120 here? It’s ¥110 in the vending machine. Weird. Hikaru says she always gets mine from the vending machine.'),
        ]),
        hide('haruka'),
        shop(),
        diary('Haruka came into the konbini to wait for her train. She didn’t buy anything.'),
      ] },
      { id: 'kon_any', repeat: true, scene: [
        bg('konbini'),
        oneOf(
          [X('Mr. Oda', 'Quiet shift. Restock the onigiri. Tuna mayo goes at the front. Always.')],
          [X('Mr. Oda', 'If anyone asks for the last melon bread, it’s already gone. It’s mine.')],
          [n('A long, boring, well-paid shift. You fold forty-two plastic bags into tiny triangles.')],
        ),
        shop(),
        diary('Worked a shift at the konbini.'),
      ] },
    ],

    street: [
      { id: 'walk_7', cond: (s) => s.day === 7, scene: [
        bg('street'),
        n('The vending machine is lit. Two cans are sitting in the tray, one pink and one blue. Nobody comes to collect them.'),
        n('When you look back from the corner, the blue one is gone.'),
        diary('Two cans in the vending machine. Then one.'),
      ] },
      { id: 'walk_1', cond: (s) => notD7(s) && here(), scene: [
        bg('street'),
        n('You take the long way home. Halfway down the street, someone is walking ahead of you, slowly.'),
        show('hikaru', 'surprised', 'center'),
        K('surprised', 'Oh. Hi.'),
        K('neutral', 'Haruka has cram school on weekdays, so I walk home alone. It’s quiet. I don’t mind quiet.'),
        choice(
          opt('Walk with her.', [
            add({ trust: 1 }),
            n('You walk together past the houses and the hydrangeas. She points out which houses have cats.'),
            K('soft', 'That one has three. That one has a dog that thinks it’s a cat.'),
          ]),
          opt('Say goodbye at the corner.', [K('neutral', 'See you tomorrow, {name}.')]),
        ),
        diary('Walked home with Hikaru. She knows every cat on the street.'),
      ] },
      { id: 'walk_2', cond: (s) => s.day >= 4 && notD7(s) && here(), scene: [
        bg('street'),
        n('By the vending machine, two voices. You stop before you turn the corner.'),
        show('haruka', 'angry', 'left'), show('hikaru', 'worried', 'right'),
        H('angry', 'You did it again. In front of everyone. Talking to Hoshino like you’re *her* friend.'),
        K('worried', 'I just don’t want to be like this anymore. I want us to be like *before*.', rw('I just don’t want to be like *you* anymore.', 'f_vend')),
        iff(has('f_vend'), [
          H('surprised', '…Before?'),
          H('cold', 'There is no before. Before, I was the one hiding behind you. Remember?'),
          add({ susp: -1 }, { quiet: true }),
        ], [
          H('cry', 'Fine. FINE. Then don’t.'),
          add({ susp: 2 }, { quiet: true }),
        ]),
        hide('haruka'),
        n('Haruka storms past without seeing you. Hikaru stays by the vending machine, staring at the buttons.'),
        K('sad', '…You heard that.'),
        choice(
          opt('Buy two drinks and give her one.', [add({ trust: 1 }), K('soft', '…Thanks.')]),
          opt('“Are you okay?”', [K('sad', 'I keep saying one thing and she keeps hearing another.'), add({ trust: 1 }, { quiet: true })]),
        ),
        diary((s) => s.frags.includes('f_vend')
          ? 'The twins fought at the vending machine. Hikaru said she wants them to be like before.'
          : 'The twins fought at the vending machine. Hikaru said something cruel. I don’t think she meant it like that.'),
      ] },
      { id: 'walk_any', repeat: true, scene: [
        bg('street'),
        n('The walk home is warm and orange. Somewhere, a radio is playing an old song.'),
        diary('Walked home the long way.'),
      ] },
    ],

    park: [
      { id: 'park_7', cond: (s) => s.day === 7, scene: [
        bg('park'),
        n('One of the swings is moving. Back and forth, slowly, like somebody just got off it.'),
        n('There’s no wind.'),
        say('hikaru', null, 'I’ve got you. I’ve got you.', { label: '???', plate: 'void' }),
        fx('flicker', { variant: 'g2' }),
        diary('A swing moved by itself at the park. Someone said “I’ve got you.”'),
      ] },
      { id: 'park_1', cond: (s) => s.day >= 3 && notD7(s), scene: [
        bg('park'),
        n('The streetlight flickers on as you arrive. Someone is sitting on the swings, not swinging.'),
        show('haruka', 'sad', 'center'),
        H('surprised', '…Are you following me?'),
        H('neutral', 'I come here when I skip cram school. Don’t tell Mom.'),
        H('neutral', 'When we were kids, Hikaru used to push me on these. I was scared of going too high. She’d say *I’ve got you, I’ve got you* the whole time.'),
        H('cold', 'Then she got… different. Tougher. So I got tougher too. Keep up or get left behind, right?'),
        choice(
          opt('“Maybe she never wanted you to get tougher.”', [
            iff((s) => s.favor >= 3,
              [H('sad', '…Then why did she?'), add({ susp: -1 })],
              [H('angry', 'What would you know?'), add({ favor: -1 })]),
          ]),
          opt('Push her on the swing.', [add({ favor: 1 }), H('surprised', 'Wh— not so high!'), H('happy', '…Okay. A little higher.')]),
        ),
        diary('Found Haruka on the swings. Hikaru used to push her on them.'),
      ] },
      { id: 'park_any', repeat: true, scene: [
        bg('park'),
        n('You sit on a bench and let the evening happen. Your energy comes back slowly.'),
        diary('Rested at the park.'),
      ] },
    ],

    station: [
      { id: 'sta_7', cond: (s) => s.day === 7, scene: [
        bg('station'),
        n('The platform is empty. At the far end, where the roof stops, there’s a light.'),
        n('Not a train. Smaller. Pale blue.'),
        show('hikaru', 'sad', 'center', { ghost: true }),
        K('sad', 'You can still see me?'),
        K('worried', 'Tell her I’m still at the end of the platform. Tell her I never left.', rw('Tell her I left. Tell her I’m glad.', 'f_platform')),
        iff(has('f_platform'),
          [K('soft', '…Okay. Okay. Then I’m still here.'), hide('hikaru')],
          [hide('hikaru', { erase: true })]),
        diary('There was a blue light at the end of the platform.'),
      ] },
      { id: 'sta_1', cond: (s) => s.trust >= 3 && notD7(s) && here(), scene: [
        bg('station'),
        n('You walk to the very end of the platform at Sakuragaoka Station.'),
        show('hikaru', 'surprised', 'center'),
        K('surprised', 'You came.'),
        K('soft', 'Look. Wait for it.'),
        n('Far down the line, a light appears. It wobbles, splits in the evening haze, and comes back together.'),
        K('soft', 'Stars that change their mind.'),
        K('neutral', 'This is where it happened. Tanabata, when we were eleven. Afterwards we sat right here, and I told Haruka: if you ever get lost, look for the light. I’ll be there.'),
        K('sad', 'She thinks I meant *I’ll be the scary one*. I just meant *I’ll be there*.'),
        add({ trust: 1 }),
        giftHikaru,
        diary('Watched the trains come in with Hikaru. “If you ever get lost, look for the light.”'),
      ] },
      { id: 'sta_any', repeat: true, scene: [
        bg('station'),
        n('You watch the trains come in from far away. Their lights look like stars that can’t make up their minds.'),
        iff((s) => here() && s.trust < 3, [n('Hikaru is at the far end of the platform. When she sees you, she turns away. Maybe next time.')]),
        diary('Watched the trains at the station.'),
      ] },
    ],
  };

  /* An evening with nothing scripted (a safety net; every day has its own evening). */
  scene('evening_quiet', [
    bg('bedroom_night', { clean: true }),
    n('A quiet evening. Your phone stays dark.'),
  ]);
})();
