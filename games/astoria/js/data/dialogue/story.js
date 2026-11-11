// Main-story scenes. Node format:
//   l:  [[speaker, text], ...]   lines shown one at a time
//   c:  [{ t, path, cond, fx, l, to }]   choices (l = reaction lines before `to`)
//   to: next node    end: true    fx: effects applied when the node is entered
// Speakers: 'n' narration, 'a' Astoria, 'note' written text, or an NPC id.

export const STORY = {
  prologue: {
    bg: 'cg_awakening',
    nodes: {
      start: {
        l: [
          ['n', 'Darkness. Then — violet.'],
          ['n', 'Light pours through a stained-glass window shaped like an eclipse, pooling on the cold stone where you lie.'],
          ['n', 'Somewhere above, a bell tolls. You count without meaning to. Ten. Eleven. Twelve.'],
          ['n', 'Thirteen.'],
          ['a', '…Where am I?'],
          ['n', 'You remember your name. Astoria. You remember nothing else.'],
        ],
        c: [
          { t: 'Stay still. Listen before moving.', path: 'suspicious', l: [['n', 'You lie motionless. The cathedral breathes around you: wind in broken panes, the drip of water — and, very faintly, someone humming three notes over and over.']], fx: { flag: 'heard_humming' }, to: 'rise' },
          { t: 'Call out. Someone might need help — or might help me.', path: 'compassionate', l: [['a', '"Hello? Is anyone there?"'], ['n', 'Your voice rolls down the nave and comes back changed. For a moment the echo sounds like a different name.']], to: 'rise' },
          { t: 'Get up. Find the way out. Now.', path: 'aggressive', l: [['n', 'You force yourself upright. Your legs obey, though they feel borrowed. The great doors at the end of the nave are barred — from the inside.']], to: 'rise' },
          { t: 'Keep your eyes closed. Let whoever is watching think you still sleep.', path: 'secretive', l: [['n', 'You keep your breathing slow. Footsteps approach, pause beside you for a long, long moment… then withdraw.'], ['n', 'Whoever it was smelled of candle smoke and violets.']], fx: { flag: 'smelled_violets' }, to: 'rise' },
        ],
      },
      rise: {
        l: [
          ['n', 'Violet flowers grow between the flagstones, glowing faintly, as if the moon itself had planted them.'],
          ['a', '…Another day in this world.'],
          ['n', 'The words leave your mouth before you know why. As if you have said them many, many times before.'],
          ['n', 'One more thing surfaces, bright and sudden: a sunlit kitchen, flour on small hands, a child laughing. It doesn\'t feel like yours at all.'],
        ],
        fx: { memory: 'mem_awakening:wake', start: 'mq1', flag: 'prologue_done', echo: 'laugh' },
        end: true,
      },
    },
  },

  story_masq_arrive: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'The Velvet Ballroom blazes. A thousand candles in a thousand crystals; black roses heaped on every surface; music that seems to come from the walls themselves.'],
          ['n', 'Every guest wears a mask. Every mask turns, briefly, toward you.'],
          ['evelyne', '"Astoria! You came!" Evelyne sweeps toward you in a mask of white lace. "And without a mask — how daring. Everyone will see your face." A pause, light as a feather. "Everyone."'],
          ['n', 'Across the room, Lucien leans against a pillar, unmasked, watching. Near the doors, Cael stands at attention in dress uniform, pretending not to look for you.'],
          ['evelyne', '"The first dance is about to begin. You simply must dance. Choose wisely, darling — people will talk either way."'],
        ],
        fx: { obj: 'mq4.attend', gala: 5 },
        c: [
          { t: 'Cross the room to Lucien.', fx: { rel: { lucien: { affinity: 6, trust: 3 } }, mem: { lucien: 'danced_masquerade' } }, l: [['lucien', '"Me?" For once, Lucien seems genuinely surprised. Then he takes your hand. "Very well. Try to keep up."'], ['n', 'He dances like a man remembering something. Halfway through, very quietly, he says: "You held your hand exactly like that, once." He does not explain. He does not have to.']], to: 'after' },
          { t: 'Ask Cael. He looks like he needs rescuing.', path: 'compassionate', fx: { rel: { cael: { affinity: 7, friendship: 4 } }, mem: { cael: 'danced_masquerade' } }, l: [['cael', '"I don\'t— I\'m on duty." A breath. "One dance."'], ['n', 'He is stiff, then less stiff. When the music ends he doesn\'t let go immediately. "Stay where I can see you tonight," he murmurs. "Something\'s wrong in this room."']], to: 'after' },
          { t: 'Offer your hand to Evelyne.', fx: { rel: { evelyne: { affinity: 6, trust: 2 } }, mem: { evelyne: 'danced_masquerade' } }, l: [['evelyne', '"Oh, scandalous. I adore it." She leads, of course.'], ['n', 'As she spins you, she whispers: "Whatever you hear tonight, darling — I was always going to like you. Remember that part."']], to: 'after' },
          { t: 'Ask Noctis to dance. He is waltzing alone, to music no one else can hear.', req: { rel: { noctis: { affinity: 12 } } }, fx: { rel: { noctis: { affinity: 6, trust: 4 } }, mem: { noctis: 'danced_masquerade' }, flag: 'noctis_masq_tip' }, l: [['n', 'At the empty edge of the floor, Noctis takes your hand without missing a step, as if you were always going to offer it.'], ['noctis', '"You came. Good. You were late last time." He spins you. "Different song, by the way. Theirs is worse."'], ['noctis', 'As the music ends he leans close. "When the curtain moves, stand behind the cracked pillar. The crack is shaped like a crescent. They never look there. They never have."']], to: 'after' },
          { t: 'Dance with no one. Watch the room instead.', path: 'suspicious', fx: { rel: { noctis: { affinity: 4 } } }, l: [['n', 'You step back into the shadows of a pillar. From there you see everything: who avoids whom, which masks lean together.'], ['n', 'And on the empty edge of the floor, Noctis — waltzing alone with perfect grace, to music slightly different from the music playing.']], to: 'after' },
        ],
      },
      after: {
        l: [
          ['n', 'When the dance ends, you see Lucien and Evelyne leave the floor separately — and both slip behind the heavy velvet curtain of an alcove at the edge of the room.'],
        ],
        fx: { obj: 'mq4.dance' },
        end: true,
      },
    },
  },

  story_masq_alcove: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'Behind the velvet, low voices. Lucien\'s, and Evelyne\'s — but neither of them sounds like themselves.'],
        ],
        c: [
          { t: 'Press close to the curtain and listen.', path: 'secretive', to: 'listen' },
          { t: 'Pull the curtain aside.', path: 'aggressive', to: 'confront' },
          { t: 'Stand where you can see both exits, and watch who leaves.', path: 'suspicious', to: 'watch' },
          { t: 'Leave them their privacy.', path: 'compassionate', to: 'leave' },
          { t: 'Slip behind the cracked pillar Noctis pointed out.', req: { flag: 'noctis_masq_tip' }, hint: 'A tip from someone who knows what happens next', to: 'pillar' },
        ],
      },
      pillar: {
        l: [
          ['n', 'Behind the pillar with the crescent-shaped crack is a hollow just wide enough for one person. The velvet is close enough to touch.'],
          ['evelyne', '"She\'s here, Lucien. In the flesh. Wearing that face."'],
          ['lucien', '"I am aware."'],
          ['evelyne', '"Then do something. Mother says the Accord holds only if she does not remember."'],
          ['lucien', '"Yes. I wrote it."'],
          ['evelyne', '"And Mother\'s list? Whose name is next?"'],
          ['n', 'A pause, long enough to hurt.'],
          ['lucien', '"The captain\'s."'],
          ['evelyne', '"Cael? He\'s harmless."'],
          ['lucien', '"He dreams about her, Evelyne. Nobody who dreams about her is harmless."'],
          ['n', 'Lucien leaves first, by the servants\' door, down toward the cellars. Evelyne stays a moment longer, staring at nothing. Neither of them looks at the pillar.'],
        ],
        fx: { memory: ['mem_masquerade:voices', 'mem_masquerade:after', 'mem_masquerade:list'], obj: 'mq4.secret', mystery: ['myst_accord', 'myst_lucien_night'], flag: 'heard_next_name', exp: 60 },
        end: true,
      },
      listen: {
        l: [
          ['evelyne', '"She\'s here, Lucien. In the flesh. Wearing that face."'],
          ['lucien', '"I am aware."'],
          ['evelyne', '"Then do something. Mother says the Accord holds only if she does not remember."'],
          ['lucien', '"The Accord holds only if she does not remember," he repeats, flatly. "Yes. I wrote it."'],
          ['evelyne', '"Then make sure she never does."'],
          ['n', 'A long silence. When Lucien speaks again his voice is very tired.'],
          ['lucien', '"Every time, Evelyne. Every time, I make sure. And every time, she comes back."'],
        ],
        fx: { memory: 'mem_masquerade:voices', obj: 'mq4.secret', mystery: 'myst_accord', path: 'secretive', exp: 40 },
        end: true,
      },
      confront: {
        l: [
          ['n', 'You sweep the curtain aside. Lucien and Evelyne spring apart — not like lovers, like conspirators.'],
          ['evelyne', '"Astoria! We were just—"'],
          ['lucien', '"Discussing the Accord," Lucien says smoothly. "A tedious matter of guest lists. Do join us; you\'ll be asleep in minutes."'],
          ['n', 'He is lying. He is lying beautifully, and he knows that you know, and he holds your gaze anyway.'],
          ['n', 'You heard one sentence before the curtain moved: "…holds only if she does not remember."'],
        ],
        fx: { memory: 'mem_masquerade:voices', obj: 'mq4.secret', mystery: 'myst_accord', path: 'aggressive', rel: { lucien: { suspicion: 10, rivalry: 5 }, evelyne: { suspicion: 10, rivalry: 6 } }, mem: { lucien: 'confronted_alcove', evelyne: 'confronted_alcove' } },
        end: true,
      },
      watch: {
        l: [
          ['n', 'You catch only fragments through the velvet — "the Accord", "she does not remember" — but you don\'t need words.'],
          ['n', 'Lucien leaves first, by the servants\' door. Not toward the street. Down. Toward the cellars, and the old tunnels that run beneath the city — toward the cathedral.'],
          ['n', 'Evelyne leaves a minute later, fixes her smile in a mirror, and walks directly toward where you were standing. She looks briefly frightened to find the spot empty.'],
        ],
        fx: { memory: ['mem_masquerade:after', 'mem_masquerade:voices'], obj: 'mq4.secret', mystery: ['myst_accord', 'myst_lucien_night'], path: 'suspicious', exp: 40 },
        end: true,
      },
      leave: {
        l: [
          ['n', 'You turn away. Whatever is said behind that curtain, it was not said to you.'],
          ['n', 'Later, on the balcony, Evelyne finds you. She is not smiling. It makes her look younger.'],
          ['evelyne', '"You could have listened. Anyone else would have." She twists her fan in her hands. "There\'s something called the Accord. My family has kept it for three hundred years. It only holds if— if a certain person doesn\'t remember."'],
          ['evelyne', '"I\'m not supposed to tell you that. I\'m not sure why I did." She manages a smile. "Don\'t make me regret it, darling."'],
        ],
        fx: { memory: 'mem_masquerade:voices', obj: 'mq4.secret', mystery: 'myst_accord', path: 'compassionate', rel: { evelyne: { trust: 12, affinity: 6 } }, mem: { evelyne: 'spared_alcove' } },
        end: true,
      },
    },
  },

  hollowmere_noctis: {
    bg: 'woods',
    nodes: {
      start: {
        l: [
          ['noctis', '"You found the ledger. Second cottage. I told you."'],
          ['n', 'Noctis swings his legs over the edge of the dry well. In the moonlight, his gold eye and his violet one look like two different moons.'],
          ['noctis', '"Everyone here was forgotten on the same night. Two hundred and six people. They didn\'t die. They just — stopped being anyone that anyone remembered. Then, eventually, they stopped being anyone at all."'],
        ],
        c: [
          { t: '"How do you know that?"', path: 'suspicious', l: [['noctis', '"Because I\'m the only one who wasn\'t forgotten. I was the one doing the remembering. It\'s exhausting. Imagine carrying two hundred and six people around in your head."']], to: 'end' },
          { t: '"That\'s horrible. Were you— did you know them?"', path: 'compassionate', fx: { rel: { noctis: { affinity: 6, trust: 4 } } }, l: [['noctis', 'He is quiet for a long time. "I knew a girl who sang to the bells," he says at last. "She was my friend. I wrote that ledger, Astoria. I was eight."'], ['n', 'He does not look eight. He does not look three hundred. He looks like both.']], to: 'end' },
          { t: 'Hum the three notes you heard when you woke.', req: { flag: 'heard_humming' }, hint: 'Something you heard before you moved', fx: { rel: { noctis: { affinity: 6, trust: 8 } }, memory: 'mem_hollowmere:song', mem: { noctis: 'hummed_song' } }, l: [['n', 'You hum them without thinking. Three notes, over and over.'], ['n', 'Noctis stops swinging his legs.'], ['noctis', '"She sang that," he whispers. "Every evening, to the bells. The whole village stopped to listen. I used to sit on this well and pretend she was singing it for me."'], ['noctis', 'He looks at you for a long moment and, for once, does not seem to know what happens next. "…Do it again?"']], to: 'end' },
          { t: '"Who did this? Tell me. Now."', path: 'aggressive', fx: { rel: { noctis: { rivalry: 3 } } }, l: [['noctis', '"You don\'t want me to tell you," he says, kindly. "You want to find out. There\'s a difference, and it matters, and you\'ll thank me. In about a week."']], to: 'end' },
          { t: 'Say nothing. Wait for him to say more.', path: 'secretive', l: [['n', 'You sit down on the well\'s edge beside him and wait. After a while he leans, very slightly, against your shoulder.'], ['noctis', '"The child who wrote the ledger," he says. "It was me. Don\'t tell anyone. Nobody would remember anyway."']], to: 'end' },
        ],
      },
      end: {
        l: [['noctis', '"Go on. The library. The portraits. Bring the ledger." He smiles. "You already know which wall. You just don\'t know that you know."']],
        fx: { obj: 'mq5.noctis', mem: { noctis: 'hollowmere' } },
        end: true,
      },
    },
  },

  story_portrait: {
    bg: 'library',
    nodes: {
      start: {
        l: [
          ['n', 'The hidden gallery is narrow and cold. Every frame is empty but one.'],
          ['n', 'At the far end, shrouded in black velvet, a portrait taller than you are.'],
          ['n', 'You pull the velvet away.'],
          ['n', 'A woman in a black gown stands beneath a too-bright moon. Silver-lavender hair. Violet eyes. A pale, melancholy, slightly unsettling face.'],
          ['n', 'Your face.'],
          ['note', 'Painted in the Year of the Moonfall — three hundred years before you were born.'],
          ['n', 'The name plate has been pried away. Only the first letter is left, scratched into the wood beneath: A.'],
          ['n', 'And under it, in a hand that pressed hard enough to tear the canvas:'],
          ['note', '"She must never remember who she was."'],
        ],
        fx: { memory: ['mem_portrait:face', 'mem_portrait:words'], obj: 'mq6.portrait', exp: 60 },
        c: [
          { t: 'Touch the painted face.', path: 'compassionate', l: [['n', 'The canvas is warm. For a heartbeat, you hear three notes, hummed, far away — and someone laughing in a sunlit cathedral.']], to: 'end' },
          { t: 'Examine the handwriting.', path: 'suspicious', l: [['n', 'The slant is sharp, the pressure furious. You have seen this handwriting before — on a summons, signed "L." Or something very like it.']], fx: { rel: { lucien: { suspicion: 8 } } }, to: 'end' },
          { t: 'Hold the scratched photograph up beside her.', req: { item: 'old_photograph' }, fx: { memory: 'mem_portrait:photo', exp: 20 }, l: [['n', 'You hold the photograph up beside the painted woman.'], ['n', 'The same black gown. The same lace at the collar, stitch for stitch. The same way of standing a little apart from everyone else.'], ['n', 'The girl in the photograph is younger. But it is her. Someone scratched out her face in one picture and hid the other behind velvet.'], ['n', 'Neither of them managed to make her disappear.']], to: 'end' },
          { t: 'Tear the inscription out of the frame.', path: 'aggressive', l: [['n', 'The canvas rips with a sound like a breath drawn in. You fold the words into your pocket. Whoever wrote them doesn\'t get to keep them here.']], to: 'end' },
          { t: 'Cover the portrait again. Tell no one what you saw — yet.', path: 'secretive', l: [['n', 'You draw the velvet back exactly as it was. Whoever comes here next will never know it was disturbed. You will know. That is the point.']], to: 'end' },
        ],
      },
      end: {
        l: [['n', 'Behind you, very softly, the gallery door begins to close. Someone will have to be told — or not.']],
        end: true,
      },
    },
  },

  story_confide: {
    bg: 'library',
    nodes: {
      start: {
        l: [['n', 'You have found the woman with your face. Who do you tell?']],
        c: [
          { t: 'Seraphine. She knew something when you woke.', fx: { flag: 'confide_seraphine', rel: { seraphine: { trust: 15, affinity: 6 } }, mem: { seraphine: 'confided_portrait' } }, l: [['seraphine', 'Seraphine listens without interrupting. Then she closes her eyes. "So it has begun again," she says. "I had hoped— no. I had not hoped. I am too old for hope."'], ['seraphine', '"Come back to the cathedral, child. There are things below it I should have shown you a long time ago."']], to: 'end' },
          { t: 'Lucien. If anyone knows, he does.', fx: { flag: 'confide_lucien', rel: { lucien: { trust: 15, suspicion: -5 } }, mem: { lucien: 'confided_portrait' } }, l: [['lucien', 'Lucien does not pretend to be surprised. That, more than anything, frightens you.'], ['lucien', '"I wrote that inscription," he says at last. "Three hundred years ago. At your request." He looks at you as though bracing for a blow. "You made me promise. You made me promise every time."']], to: 'end' },
          { t: 'Cael. He\'ll keep me safe — and honest.', fx: { flag: 'confide_cael', rel: { cael: { trust: 15, affinity: 8 } }, mem: { cael: 'confided_portrait' } }, l: [['cael', 'Cael stares at the portrait for a long time. "I\'ve dreamt of her," he says. "Since I was a boy. I thought she was a saint." He swallows. "Whatever this is — I\'m with you. Understand? Whatever it is."']], to: 'end' },
          { t: 'Evelyne. She knows more than she shows.', fx: { flag: 'confide_evelyne', rel: { evelyne: { trust: 15, rivalry: -5 } }, mem: { evelyne: 'confided_portrait' } }, l: [['evelyne', 'Evelyne\'s fan stops moving. "Oh," she says, very softly. "Oh, no. Mother said it would be this year."'], ['evelyne', '"Astoria — darling — my family has a list. Of everyone who was ever invited to anything. You are on the first page. Of the first book." Her voice cracks. "You were the guest of honour."']], to: 'end' },
          { t: 'Noctis. He was there, three hundred years ago.', req: { rel: { noctis: { trust: 12 } } }, fx: { flag: 'confide_noctis', rel: { noctis: { trust: 12, affinity: 6 } }, mem: { noctis: 'confided_portrait' } }, l: [['noctis', 'Noctis listens with his chin on his knees. He does not interrupt once, which is how you know it matters.'], ['noctis', '"I can\'t tell you who you were," he says at last. "That isn\'t mine to give back. But I can tell you that you were kind to me, when nobody else remembered I was there."'], ['noctis', '"So I\'ll be kind to you. Even if you never remember why."']], to: 'end' },
          { t: 'No one. Not yet.', path: 'secretive', fx: { flag: 'confide_none', path: 'secretive' }, l: [['n', 'You keep it. All of it. The face, the words, the letter A.'], ['n', 'Walking home, you realise that you are very good at keeping secrets. You wonder how you learned.']], to: 'end' },
        ],
      },
      end: {
        fx: { obj: 'mq6.confide' },
        end: true,
      },
    },
  },

  ch7_teaser: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'That night the bell rings thirteen times.'],
          ['n', 'On the fourteenth stroke — a stroke that should not exist — the iron door beneath the cathedral swings open on its own.'],
          ['note', 'Chapter 7 — The Truth'],
          ['note', 'The chamber beneath the cathedral, the Veil Accord, the seven houses and the real history of Elaria are in development. Your choices so far — who you trusted, who you deceived, and who you became — have been recorded and will shape what follows.'],
        ],
        fx: { flag: 'ch7_seen' },
        end: true,
      },
    },
  },
};
