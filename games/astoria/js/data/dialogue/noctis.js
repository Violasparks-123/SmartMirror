// Noctis — The Wanderer. Playful, unpredictable, strange; appears where he
// shouldn't be and remembers things that haven't happened yet.

export const NOCTIS = {
  intro: 'noctis_intro',
  introCond: {},
  smalltalk: ['noctis_small_1', 'noctis_small_2', 'noctis_small_3'],

  story: [
    { cond: { quest: { nq_seraphine: 'active' }, obj: { 'nq_seraphine.listen': true, 'nq_seraphine.ask': false } }, convo: 'noctis_bell', label: 'Ask about the thirteenth toll' },
  ],

  topics: [
    { id: 'aeria', label: 'Ask about the singing under the cathedral', cond: { flag: 'aeria_told' }, convo: 'noctis_aeria', once: true },
    { id: 'who', label: '"Who are you, really?"', cond: {}, convo: 'noctis_who' },
    { id: 'how', label: '"How did you get up there?"', cond: {}, convo: 'noctis_how' },
    { id: 'tomorrow', label: '"What happens tomorrow?"', cond: {}, convo: 'noctis_tomorrow' },
    { id: 'moonfall', label: 'Ask about the Moonfall', cond: { chapterMin: 3 }, convo: 'noctis_moonfall' },
  ],

  secrets: [
    { id: 'forgot', label: 'What the Moon Forgot', cond: { rel: { noctis: { affinity: 25 } }, flag: 'nq_noctis_done' }, hint: 'A closer bond with Noctis · Keep his appointment ("Tomorrow\'s Echo")', convo: 'noctis_secret' },
  ],

  show: {
    old_photograph: 'noctis_show_photo',
    hollowmere_ledger: 'noctis_show_ledger',
    default: 'noctis_show_default',
  },

  gifts: {
    love: '"A stopped watch!" Noctis holds it up to his ear. "Oh, it\'s perfect. It\'s right twice a day and wrong all the rest, just like me."',
    like: '"For me? You\'re going to give me this. I mean you did. I mean thank you."',
    neutral: '"Oh! I\'ve always wanted one of these. I think. Have I?"',
    dislike: '"Tea." He looks at it like a betrayal. "You know I can\'t sleep as it is. Time is very loud."',
    again: '"You already gave me something today. I remember. Unusually."',
  },

  convos: {
    noctis_intro: {
      nodes: {
        start: {
          l: [
            ['n', 'Someone is sitting on the edge of the locked bell tower — far above the cathedral steps, legs dangling over nothing. Then, without seeming to climb down, he is standing beside you.'],
            ['noctis', '"Astoria! You\'re going to ask me my name in a moment. It\'s Noctis. You\'re welcome."'],
          ],
          c: [
            { t: '"How do you know my name?"', path: 'suspicious', l: [['noctis', '"You told me." He beams. "Later. Next month, actually. You were very cross with me at the time."']], fx: { rel: { noctis: { trust: 2 } } }, to: 'end' },
            { t: '"You could have fallen!"', path: 'compassionate', l: [['noctis', '"I did, once. Or I will. It\'s not as bad as it looks." He seems touched. "You worried, though. That\'s nice. Nobody worries about me."']], fx: { rel: { noctis: { affinity: 5 } } }, to: 'end' },
            { t: '"Stay away from me."', path: 'aggressive', l: [['noctis', '"I tried that. Didn\'t take." He shrugs cheerfully. "You\'ll come around. You always do, on Thursday."']], fx: { rel: { noctis: { rivalry: 3 } } }, to: 'end' },
            { t: '"Noctis. I\'ll remember that."', path: 'secretive', l: [['noctis', 'For a moment his playful face goes very still. "Will you?" he says. "That would be new."']], fx: { rel: { noctis: { affinity: 3, trust: 2 } } }, to: 'end' },
          ],
        },
        end: {
          l: [['noctis', '"I have to go. I\'m late for something that happened yesterday." He tips an imaginary hat. "See you where you don\'t expect me."'], ['n', 'You blink. He is gone. Above you, the bell tower is empty — and its door, you notice, is still locked from the inside.']],
          fx: { met: 'noctis', flag: 'met_noctis', memory: 'mem_noctis:first', mystery: 'myst_noctis', history: { noctis: 'Appeared on top of the locked bell tower.' }, log: 'Noctis: "You told me. Later."' },
          end: true,
        },
      },
    },

    noctis_small_1: { nodes: { start: { l: [['noctis', '"Don\'t go to the library on the fourth day from now. Or do. One of those is a good idea."']], c: [
      { t: '"Which one?"', l: [['noctis', '"Yes."']] },
      { t: '"You\'re impossible."', path: 'compassionate', l: [['noctis', '"Thank you! Most people say \'unbearable\'."']], fx: { rel: { noctis: { affinity: 2 } } } },
    ] } } },
    noctis_small_2: { nodes: { start: { l: [['noctis', '"I had the strangest dream. You were in it. You were wearing a crown made of bells and everybody was crying, but the good kind."']], c: [
      { t: '"Was it a dream, or a memory?"', path: 'suspicious', l: [['noctis', 'He considers this very seriously. "Is there a difference? Asking for me."']], fx: { rel: { noctis: { trust: 2 } } } },
      { t: '"That sounds beautiful."', path: 'compassionate', l: [['noctis', '"It was. It is. It will be." He looks pleased you asked.']], fx: { rel: { noctis: { affinity: 2 } } } },
    ] } } },
    noctis_small_3: { nodes: { start: { l: [['noctis', '"Lucien is going to be cross with you on a Tuesday. Bring biscuits. Not tea. Never tea."']], c: [
      { t: '"Why will he be cross?"', path: 'suspicious', l: [['noctis', '"Because you\'ll be right about something. He hates that. It\'s his favourite thing about you."']] },
      { t: '"Noted. Biscuits."', path: 'secretive', l: [['noctis', 'He salutes. "You\'re learning."']], fx: { rel: { noctis: { affinity: 1 } } } },
    ] } } },

    noctis_who: { nodes: { start: { l: [['noctis', '"I\'m Noctis. I\'m a wanderer. I\'m a bit lost. I\'m much older than I look and much younger than I feel." He counts on his fingers. "That\'s most of it."']], end: true } } },
    noctis_how: { nodes: { start: { l: [['noctis', '"The same way you\'ll get up there next week. Which is to say, I don\'t know — but you will, and you\'ll be very smug about it."']], end: true } } },
    noctis_tomorrow: {
      nodes: {
        start: {
          l: [['noctis', 'He closes his eyes and tilts his head, as if listening to something far away.']],
          to: 'pick',
        },
        pick: {
          l: [],
          c: [
            { cond: { notFlag: 'noctis_predict_crystal' }, t: '(Listen.)', l: [['noctis', '"You\'ll find something in the ballroom that you already have. Late at night. Third chandelier." He opens his eyes. "Don\'t be alarmed. It\'s yours, technically."']], fx: { flag: 'noctis_predict_crystal' } },
            { cond: { flag: 'noctis_predict_crystal' }, t: '(Listen.)', l: [['noctis', '"Someone will write you a letter and not sign it. Don\'t do what it says. Or do. Either way, keep the letter."']], fx: { letter: 'letter_unknown' } },
          ],
        },
      },
    },
    noctis_moonfall: { nodes: { start: { l: [['noctis', '"The Moonfall?" He laughs, and it isn\'t a happy sound. "The moon didn\'t fall. Something got caught in it. Something it was told to hold on to and forget."'], ['noctis', '"It\'s not very good at forgetting. Neither am I. We have that in common."']], fx: { mystery: 'myst_moonfall' }, end: true } } },

    noctis_bell: {
      nodes: {
        start: {
          l: [['a', '"Who rings the thirteenth toll at midnight?"'], ['noctis', '"The moon, of course." He says it as if you\'d asked what colour the sky is. "It\'s counting. Twelve for the hours, and one for the person it hasn\'t finished forgetting."'], ['noctis', '"Tell Seraphine. She knows already. She just needs someone to say it out loud."']],
          fx: { obj: 'nq_seraphine.ask', rel: { noctis: { trust: 3 } } },
          end: true,
        },
      },
    },

    noctis_fountain: {
      nodes: {
        start: {
          l: [
            ['noctis', '"You came." Noctis is sitting on the rim of the fountain, feet in water that has gone perfectly still. "Midnight. Where the water forgets. I wasn\'t sure you would — no, I was. I\'m always sure. It\'s the worst part."'],
            ['noctis', '"Do you know what I am, Astoria? I\'m what the moon forgot to forget. A boy who was there the night it happened, and kept every name. The moon tried to take them. It couldn\'t. So it took the rest of me instead — my tomorrow and my yesterday, all mixed up."'],
          ],
          c: [
            { t: 'Sit beside him and put your feet in the still water.', path: 'compassionate', l: [['n', 'The water is cold as starlight. Noctis laughs, surprised, and for a moment he sounds exactly as young as he looks.']], fx: { rel: { noctis: { affinity: 8, trust: 6 } } } },
            { t: '"Then you know how this ends."', path: 'suspicious', l: [['noctis', '"I know how it ends a lot of different ways," he says. "I\'m hoping for one of the good ones. You\'re the one who picks."']], fx: { rel: { noctis: { trust: 6 } } } },
          ],
          fx: { obj: 'nq_noctis.fountain', history: { noctis: 'Kept his midnight appointment at the fountain.' } },
        },
      },
    },

    noctis_secret: {
      nodes: {
        start: {
          l: [
            ['noctis', '"Can I tell you a secret? A real one. Not a tomorrow one."'],
            ['noctis', '"The night of the Moonfall, you came to Hollowmere and sang to the bells, and then you went up to the cathedral and you didn\'t come down. Everyone forgot you by morning. Everyone except me."'],
            ['noctis', '"I\'ve been waiting three hundred years to say thank you for the song." He smiles, and it is the least strange thing about him. "Thank you for the song."'],
          ],
          fx: { rel: { noctis: { affinity: 10, trust: 10 } }, memory: 'mem_lullaby:hum', history: { noctis: 'Thanked you for a song from before the Moonfall.' } },
          end: true,
        },
      },
    },

    noctis_show_photo: { nodes: { start: { l: [['noctis', '"Oh, I remember this day! It was raining. Well, it\'s going to be raining." He taps the scratched-out face. "She was laughing when they took it. She stopped laughing later."']], fx: { obj: 'mq3.show', memory: 'mem_photograph:reaction', rel: { noctis: { trust: 3 } } }, end: true } } },
    noctis_show_ledger: { nodes: { start: { l: [['noctis', 'He looks at the ledger for a long time and does not say anything clever at all.']], fx: { rel: { noctis: { affinity: 3 } } }, end: true } } },
    noctis_show_default: { nodes: { start: { l: [['noctis', '"I know! You showed me already. Next week."']], end: true } } },
  },
};
