// Seraphine — The Cathedral Keeper. Elegant, calm, knowledgeable and hard to read.
// She seems to know something about how Astoria arrived.

export const SERAPHINE = {
  intro: 'seraphine_intro',
  introCond: {},
  smalltalk: ['seraphine_small_1', 'seraphine_small_2', 'seraphine_small_3'],

  story: [
    { cond: { quest: { mq7: 'active' }, obj: { 'mq7.descend': true, 'mq7.seraphine': false } }, convo: 'ch7_seraphine', label: 'Ask her what she did' },
    { cond: { quest: { nq_seraphine: 'active' }, obj: { 'nq_seraphine.ask': true, 'nq_seraphine.return': false } }, convo: 'seraphine_bell_return', label: 'Tell her about the thirteenth toll' },
  ],

  topics: [
    { id: 'arrival', label: '"How did I get here?"', cond: {}, convo: 'seraphine_arrival' },
    { id: 'history', label: 'Ask about the cathedral\'s history', cond: {}, convo: 'seraphine_history' },
    { id: 'violets', label: 'Ask about the glowing violets', cond: { notFlag: 'sq_violets_started' }, convo: 'seraphine_violets' },
    { id: 'archive', label: 'Ask how to get into the restricted archive', cond: { quest: { mq3: 'active' }, obj: { 'mq3.access': false } }, convo: 'seraphine_saint' },
    { id: 'keeper', label: '"How long have you been keeper?"', req: { rel: { seraphine: { trust: 12 } } }, convo: 'seraphine_keeper', once: true },
  ],

  secrets: [
    { id: 'register', label: 'The Keeper\'s Register', cond: { rel: { seraphine: { affinity: 25, trust: 30 } } }, convo: 'seraphine_secret' },
  ],

  show: {
    old_photograph: 'seraphine_show_photo',
    sealed_invitation: 'seraphine_show_invitation',
    hollowmere_ledger: 'seraphine_show_ledger',
    keeper_register: 'seraphine_show_register',
    default: 'seraphine_show_default',
  },

  gifts: {
    love: '"Moonveil violets." She holds them to her face and closes her eyes. "You remembered which ones I love. …Or did you? Sometimes I cannot tell, with you."',
    like: '"Thank you, child. The cathedral will be glad of it."',
    neutral: '"A kind thought." She sets it on the altar, among the crescents.',
    dislike: '"How… fragrant." She sets it down very gently, very far away.',
    again: '"You are generous. Keep some kindness for yourself."',
  },

  convos: {
    seraphine_intro: {
      bg: 'cathedral',
      nodes: {
        start: {
          l: [
            ['n', 'A woman in violet-trimmed robes stands among the candles, lighting them one by one with a long taper. She does not look surprised to see you.'],
            ['seraphine', '"You\'re awake. Good. The violets were starting to worry."'],
          ],
          c: [
            { t: '"Who are you? Did you bring me here?"', path: 'suspicious', fx: { rel: { seraphine: { trust: 2 } } }, l: [['seraphine', '"I am Seraphine. I keep this cathedral. And no — I did not bring you. I only found you. There is a difference, though I am not sure it will comfort you."']], to: 'mid' },
            { t: '"Are you all right? You look like you haven\'t slept."', path: 'compassionate', fx: { rel: { seraphine: { affinity: 5 } } }, l: [['seraphine', 'She pauses, taper raised. "No one has asked me that in a very long time." A faint smile. "I am Seraphine, the keeper. I am well enough. Thank you."']], to: 'mid' },
            { t: '"Open the doors. I\'m leaving."', path: 'aggressive', fx: { rel: { seraphine: { affinity: -2 } } }, l: [['seraphine', '"They will open when you are ready to walk through them. I am Seraphine. I keep this place. I do not keep you."']], to: 'mid' },
            { t: 'Say nothing. Watch her hands.', path: 'secretive', fx: { rel: { seraphine: { trust: 2 } } }, l: [['n', 'Her hands are steady, but the taper trembles once — when she glances at your face.'], ['seraphine', '"You are wondering whether to trust me. Good. I am Seraphine. Keep wondering."']], to: 'mid' },
            { t: '"You smell of candle smoke and violets. You were the one standing over me."', req: { flag: 'smelled_violets' }, hint: 'Something you noticed before you opened your eyes', fx: { rel: { seraphine: { trust: 8, affinity: 2 } }, mem: { seraphine: 'admitted_watching' } }, l: [['n', 'The taper stops halfway to the wick.'], ['seraphine', '"…You were awake." It is not a question. "Yes. I stood over you. For longer than I should have."'], ['seraphine', '"I wanted to be sure you were breathing. And I wanted to see your face before anyone else did." She lights the candle at last. "I am Seraphine. I keep this cathedral. I will not lie to you, child. I may not always answer."']], to: 'mid' },
          ],
        },
        mid: {
          l: [
            ['seraphine', '"You will want to know where you are. This is the Cathedral of Eclipses, in the kingdom of Elaria. The moon has been this bright for three hundred years. People here forget things. Sometimes they forget people."'],
            ['seraphine', '"Climb the bell tower. Look at the city. Then come and tell me if any of it feels familiar."'],
          ],
          fx: { met: 'seraphine', obj: 'mq1.seraphine', history: { seraphine: 'Found you when you woke in the cathedral.' }, log: 'Seraphine: "People here forget things. Sometimes they forget people."', partyOk: 'seraphine' },
          end: true,
        },
      },
    },

    seraphine_small_1: { nodes: { start: { l: [['seraphine', '"The bells were restless last night. They do that when the moon is full. It is always full."']], c: [
      { t: '"Bells can\'t be restless."', path: 'suspicious', l: [['seraphine', '"No," she agrees. "And yet."']] },
      { t: '"Were you up all night with them?"', path: 'compassionate', l: [['seraphine', '"Someone must be." She touches your hair, briefly, as if checking you are real. "Go on. I am fine."']], fx: { rel: { seraphine: { affinity: 2 } } } },
      { t: '"You were humming when I woke. Three notes, over and over."', req: { flag: 'heard_humming' }, hint: 'Something you heard before you moved', cond: { notMem: { seraphine: 'heard_song' } }, l: [['n', 'Seraphine goes very still.'], ['seraphine', '"An old song. Older than the bells." She looks at you as if from a long way off. "I did not think anyone else alive still knew it."']], fx: { rel: { seraphine: { trust: 6, affinity: 3 } }, mem: { seraphine: 'heard_song' }, mystery: 'myst_seraphine' } },
    ] } } },
    seraphine_small_2: { nodes: { start: { l: [['seraphine', '"You stood in that exact spot when you were— " She stops. "When you first came. The light suits you there."']], c: [
      { t: '"You were going to say something else."', path: 'suspicious', l: [['seraphine', '"I am often going to say something else, child. It is a habit of the old."']], fx: { rel: { seraphine: { suspicion: 2, trust: 1 } } } },
      { t: 'Let it pass.', path: 'secretive', l: [['n', 'You let it pass. She looks grateful, and a little sad.']], fx: { rel: { seraphine: { affinity: 2 } } } },
    ] } } },
    seraphine_small_3: { nodes: { start: { l: [['seraphine', '"Have you eaten? You forget to eat. You always— you seem the sort who would forget."']], c: [
      { t: '"I\'ll eat. I promise."', path: 'compassionate', l: [['seraphine', '"Good." She presses a small honey cake into your hand from somewhere in her robes.']], fx: { rel: { seraphine: { affinity: 2 } }, mem: { seraphine: 'promised_eat' } } },
      { t: '"You keep saying \'always\'."', path: 'suspicious', l: [['seraphine', '"Do I? How strange of me."']], fx: { rel: { seraphine: { trust: 1 } } } },
    ] } } },

    seraphine_arrival: { nodes: { start: { l: [['a', '"How did I get here, Seraphine?"'], ['seraphine', '"I heard the bell ring thirteen. I came down the stairs. You were lying beneath the eclipse window as though you had been placed there with great care."'], ['seraphine', '"That is the truth. It is not all of it. The rest is not mine to give you — not yet."']], fx: { mystery: 'myst_arrival' }, end: true } } },
    seraphine_history: { nodes: { start: { l: [['seraphine', '"Before the Moonfall, this was the heart of Elaria. Every coronation, every wedding, every naming. Then, one night, the city decided it would rather not come here any more."'], ['seraphine', '"No one decreed it. They simply stopped. As if they had forgotten the way."']], end: true } } },
    seraphine_violets: { nodes: { start: { l: [['seraphine', '"The moonveil? They grow wherever something important happened and was forgotten. The cathedral is full of them." She looks at the altar. "If you bring three from the Whispering Woods, I will show you something."']], fx: { start: 'sq_violets' }, end: true } } },
    seraphine_saint: { nodes: { start: { l: [['seraphine', '"The restricted archive." She is quiet a moment. "When the library was built, the servants needed a way to carry records in and out without disturbing the scholars."'], ['seraphine', '"Look at the third saint in the portrait gallery. Look at her eyes."']], fx: { flag: 'seraphine_saint_hint', rel: { seraphine: { trust: 2 } } }, end: true } } },
    seraphine_keeper: { nodes: { start: { l: [['a', '"How long have you been the keeper here?"'], ['seraphine', '"Long enough to have stopped counting." She smiles. "Longer than is polite. Long enough to have kept a promise to someone who no longer remembers asking me."']], c: [
      { t: '"Who?"', path: 'suspicious', l: [['seraphine', 'She only looks at you. She looks at you for a very long time.']], fx: { mystery: 'myst_seraphine' } },
      { t: '"That must be lonely."', path: 'compassionate', l: [['seraphine', '"It was," she says. "Lately, less so."']], fx: { rel: { seraphine: { affinity: 4 } } } },
    ] } } },

    seraphine_bell_return: {
      nodes: {
        start: {
          l: [['a', '"Noctis says the moon rings the thirteenth toll."']],
          fx: { obj: 'nq_seraphine.return' },
          end: true,
        },
      },
    },

    seraphine_secret: {
      nodes: {
        start: {
          l: [
            ['n', 'Seraphine leads you down a stair you have never noticed, into a tiny room lit by one candle. On the desk lies the cathedral\'s register of keepers.'],
            ['seraphine', '"Every keeper for three hundred years. Read the names."'],
            ['n', 'Seraphine. Seraphine. Seraphine. Page after page, in the same patient hand.'],
            ['seraphine', '"I was the last person you spoke to before the Moonfall. You asked me to stay. To keep the cathedral — and to keep you, if you ever came back."'],
            ['seraphine', '"So I stayed. Forgive me for not telling you sooner. You told me not to."'],
          ],
          c: [
            { t: 'Hold her hand.', path: 'compassionate', l: [['n', 'Her hand is cold, and very old, and it holds on tight.']], fx: { rel: { seraphine: { affinity: 10, trust: 10 } } } },
            { t: '"What else did I ask you to keep from me?"', path: 'suspicious', l: [['seraphine', '"Everything, child. You were very thorough." A ghost of a smile. "You always were."']], fx: { rel: { seraphine: { trust: 8 } } } },
          ],
          fx: { mystery: 'myst_seraphine', history: { seraphine: 'Showed you the keeper\'s register.' } },
        },
      },
    },

    seraphine_show_photo: { nodes: { start: { l: [['n', 'Seraphine takes the photograph in both hands and does not speak for a long time.'], ['seraphine', '"That dress," she says at last. "I sewed the lace on that collar myself." She touches the scratched face, very gently. "They should not have done this to you."'], ['n', 'You don\'t ask what she means. You\'re not sure you want to know yet.']], fx: { obj: 'mq3.show', memory: 'mem_photograph:reaction', rel: { seraphine: { trust: 5 } } }, end: true } } },
    seraphine_show_invitation: { nodes: { start: { l: [['seraphine', '"Keep it close." She closes your fingers over it. "Whoever wrote it wanted you home. That does not mean they want you safe."']], end: true } } },
    seraphine_show_ledger: { nodes: { start: { l: [['seraphine', 'She reads the last line of the ledger and puts a hand over her mouth. "\'A., who sings to the bells.\' You did. Every evening. The whole city stopped to listen."']], fx: { rel: { seraphine: { trust: 4 } } }, end: true } } },
    seraphine_show_register: { nodes: { start: { l: [['seraphine', '"You found the secret archive." She is not angry. "Then you have seen my name. Many times." She smooths the page. "I am older than I look, child. That is all I will say today."']], fx: { mystery: 'myst_seraphine', rel: { seraphine: { trust: 3 } } }, end: true } } },
    seraphine_show_default: { nodes: { start: { l: [['seraphine', '"An interesting thing. Keep it safe; you never know what a thing remembers."']], end: true } } },

    seraphine_lullaby: {
      nodes: {
        start: {
          l: [['n', 'High in the bell tower, Seraphine is humming. Three notes, over and over — the same three you heard when you woke.'], ['seraphine', 'She stops when she sees you. "You should be asleep."']],
          c: [
            { t: '"What is that song?"', path: 'suspicious', l: [['seraphine', '"A lullaby. Someone used to sing it to the bells." She doesn\'t say who.']] },
            { t: '"Don\'t stop. Please."', path: 'compassionate', l: [['n', 'She hums it again, softly, until your eyes grow heavy. You don\'t remember walking back down the stairs.']], fx: { rel: { seraphine: { affinity: 4 } } } },
          ],
          fx: { memory: 'mem_lullaby:hum' },
        },
      },
    },
  },
};
