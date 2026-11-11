// Lucien — The Royal Advisor. Sarcastic, calculating, emotionally distant;
// knows far more about the Moonfall than he admits.

export const LUCIEN = {
  intro: 'lucien_intro',
  introCond: { quest: { mq2: 'started' } },
  notYet: '"Not now," says a tall man in a high-collared coat, without looking up. "I don\'t believe we\'ve been introduced, and I\'m not in the habit."',
  smalltalk: ['lucien_small_1', 'lucien_small_2', 'lucien_small_3'],

  story: [
    { cond: { quest: { mq8: 'active' }, flag: 'forgot_lucien', notFlag: ['restored_lucien', 'letgo_lucien'] }, convo: 'ch8_stranger_lucien', label: 'They don\'t know you' },
    { cond: { flag: ['forgot_lucien', 'letgo_lucien'] }, convo: 'stranger_again', label: 'A stranger now' },
    { cond: { quest: { nq_lucien: 'active' }, obj: { 'nq_lucien.find': true, 'nq_lucien.decide': false } }, convo: 'lucien_letters', label: 'Return the bundle of letters' },
  ],

  topics: [
    { id: 'aeria', label: 'Ask about Aeria', cond: { flag: 'aeria_told' }, convo: 'lucien_aeria', once: true },
    { id: 'help', label: '"I need your help."', cond: { quest: { mq3: 'active' }, obj: { 'mq3.access': false }, notItem: 'library_key' }, convo: 'lucien_help' },
    { id: 'moonfall', label: 'Ask about the Moonfall', cond: {}, convo: 'lucien_moonfall' },
    { id: 'crest', label: 'Ask about the crest on the invitation', cond: { item: 'sealed_invitation' }, convo: 'lucien_crest' },
    { id: 'night', label: 'Ask where he goes at night', cond: { mysteryOpen: 'myst_lucien_night' }, convo: 'lucien_night' },
    { id: 'apology', label: 'Apologise for your first meeting', cond: { mem: { lucien: 'insulted' }, notMem: { lucien: 'apologized' } }, convo: 'lucien_apology', once: true },
    { id: 'history', label: 'Ask who wrote the official history', cond: { item: 'book_moonfall_official' }, convo: 'lucien_history', once: true },
  ],

  secrets: [
    { id: 'ledger', label: 'The Advisor\'s Ledger', cond: { rel: { lucien: { affinity: 30, trust: 25 } } }, convo: 'lucien_secret' },
  ],

  show: {
    old_photograph: 'lucien_show_photo',
    sealed_invitation: 'lucien_show_invitation',
    default: 'lucien_show_default',
  },

  gifts: {
    love: '"A pre-Moonfall manuscript." He turns the pages with something like reverence. "Do you know how many of these I\'ve burned? ...I\'ll keep this one."',
    like: '"Hm. Acceptable." He tucks it into his coat with suspicious speed.',
    neutral: '"How thoughtful. I\'m sure I\'ll find a use for it. Eventually. Possibly."',
    dislike: '"How… cheerful." He holds it at arm\'s length, as though it might sing at him.',
    again: '"You\'ve already bribed me today. Pace yourself."',
  },

  convos: {
    lucien_intro: {
      bg: 'royal',
      nodes: {
        start: {
          l: [
            ['n', 'Lucien stands beneath the palace arch, gloved hands folded, as if he has been waiting precisely this long and not a moment more.'],
            ['lucien', '"So. The girl who walked out of a dead cathedral carrying a dead family\'s seal."'],
          ],
          c: [
            { t: '"You wrote to me. I assumed you had answers."', l: [['lucien', '"I assumed you would bring questions. How fortunate we\'re both disappointed."']], to: 'mid' },
            { t: '"And you\'re the man who reads other people\'s post."', path: 'aggressive', fx: { rel: { lucien: { affinity: -3, rivalry: 6 } }, mem: { lucien: 'insulted' } }, l: [['lucien', 'A pause. "Charming." He says it the way other people say "noted," and you have the distinct impression that he has, indeed, noted it.']], to: 'mid' },
            { t: '"A dead family? Tell me whose."', path: 'suspicious', fx: { rel: { lucien: { trust: 2 } } }, l: [['lucien', '"Straight to it. Good. I dislike small talk; it\'s so very small."']], to: 'mid' },
            { t: '"What seal? I don\'t know what you mean."', path: 'secretive', fx: { rel: { lucien: { suspicion: 6 } }, mem: { lucien: 'lied_invitation' } }, l: [['lucien', 'He smiles, and it is the first genuine expression you\'ve seen on him. "Oh, you\'re going to be interesting."']], to: 'mid' },
          ],
        },
        mid: {
          l: [
            ['a', '"You seem rather familiar with this place."'],
            ['lucien', '"Perhaps you should be more concerned about yourself."'],
          ],
          c: [
            { t: '"Have we met before?"', l: [['n', 'He pauses a beat too long.'], ['lucien', '"I would remember." It sounds less like an answer than a confession.']], fx: { rel: { lucien: { suspicion: 3 } }, mem: { lucien: 'asked_met_before' } }, to: 'end' },
            { t: '"You\'re avoiding my question."', path: 'suspicious', l: [['lucien', '"Yes. Admirably, I thought."']], fx: { rel: { lucien: { affinity: 2 } } }, to: 'end' },
            { t: '"I am concerned about myself. That\'s why I\'m here."', path: 'compassionate', l: [['lucien', 'Something in his face shifts — so slight you might have imagined it. "...Yes. I suppose it is."']], fx: { rel: { lucien: { trust: 3 } } }, to: 'end' },
          ],
        },
        end: {
          l: [
            ['lucien', '"The crest — a crescent pierced by a thorn — belonged to House Veyra. You will find no record of House Veyra anywhere in Elaria. I have made very sure of that."'],
            ['lucien', '"If you\'re determined to waste your time, the Forgotten Library is the place to waste it. Good day, Astoria."'],
            ['n', 'He is three steps away before you realise you never told him your name.'],
          ],
          fx: { met: 'lucien', obj: 'mq2.lucien', memory: 'mem_invitation:crest', history: { lucien: 'First met beneath the palace arch.' }, log: 'Lucien: "You will find no record of House Veyra anywhere in Elaria. I have made very sure of that."' },
          end: true,
        },
      },
    },

    lucien_small_1: {
      nodes: {
        start: {
          l: [['lucien', '"The queen asked me today whether the moon has always been this bright. I said yes. She wrote it down."']],
          c: [
            { t: '"Has it?"', path: 'suspicious', l: [['lucien', '"It has been this bright for as long as anyone can remember. Which is a very carefully chosen sentence."']], fx: { rel: { lucien: { trust: 1 } } } },
            { t: '"You sound tired."', path: 'compassionate', l: [['lucien', '"I am always tired. It\'s fashionable." A pause. "...Thank you for noticing."']], fx: { rel: { lucien: { affinity: 2 } } } },
            { t: '"You told her yes. You don\'t believe it."', req: { path: { suspicious: 3 } }, cond: { notMem: { lucien: 'admitted_moon' } }, l: [['n', 'Lucien\'s pen stops.'], ['lucien', '"…No one notices that." He sets the pen down with great care. "I remember it dimmer. Once. I remember standing on that balcony and needing a lantern."'], ['lucien', '"Mention that to anyone and I\'ll deny it beautifully."']], fx: { rel: { lucien: { trust: 6 } }, mem: { lucien: 'admitted_moon' }, mystery: 'myst_moonfall' } },
          ],
        },
      },
    },
    lucien_small_2: {
      nodes: {
        start: {
          l: [['lucien', '"You\'re wearing that dress again." His eyes don\'t move from his papers. "It suits the cathedral. Less so the court."']],
          c: [
            { t: '"Is that advice or an insult?"', path: 'aggressive', l: [['lucien', '"In this palace, darling, there is no difference."']], fx: { rel: { lucien: { rivalry: 1, affinity: 1 } } } },
            { t: '"I like the cathedral better than the court."', l: [['lucien', '"So did— " He stops. Turns a page. "So do most sensible people."']], fx: { rel: { lucien: { suspicion: 1 } } } },
          ],
        },
      },
    },
    lucien_small_3: {
      nodes: {
        start: {
          l: [['lucien', '"Three people have petitioned me this week claiming to have lost a family member. None of them could tell me the person\'s name."']],
          c: [
            { t: '"What did you tell them?"', l: [['lucien', '"That they were overworked and should rest. Which is true. It is also not the whole truth. Few things are."']] },
            { t: '"Doesn\'t that frighten you?"', path: 'compassionate', l: [['lucien', '"Everything frightens me, Astoria. I simply have excellent posture."']], fx: { rel: { lucien: { affinity: 2, trust: 1 } } } },
          ],
        },
      },
    },

    lucien_help: {
      nodes: {
        start: {
          l: [['a', '"I need your help."']],
          to: 'branch',
        },
        branch: {
          l: [],
          c: [
            { cond: { mem: { lucien: 'insulted' }, notMem: { lucien: 'apologized' } }, t: '(Wait for his answer.)', l: [['lucien', '"How interesting. I thought you preferred figuring things out yourself."'], ['n', 'He lets the silence stretch until it hurts. Then, with a sigh: "Fine. But you will owe me, and I always collect."']], fx: { item: { library_key: 1 }, mem: { lucien: 'owes_favour' }, rel: { lucien: { rivalry: 2 } } } },
            { cond: { notMem: { lucien: 'insulted' } }, t: '(Wait for his answer.)', l: [['lucien', '"Of course you do. Everyone does, eventually." He produces a blackened iron key from his coat as if he has been carrying it for exactly this conversation. "The restricted archive. Don\'t make me regret it."']], fx: { item: { library_key: 1 }, rel: { lucien: { trust: 2 } } } },
            { cond: { mem: { lucien: 'apologized' } }, t: '(Wait for his answer.)', l: [['lucien', '"Since you asked politely." He hands you a blackened iron key. "The restricted archive. Mind the dust; some of it is people."']], fx: { item: { library_key: 1 }, rel: { lucien: { trust: 2 } } } },
          ],
        },
      },
    },

    lucien_apology: {
      nodes: {
        start: {
          l: [['a', '"About when we first met. I was rude."'], ['lucien', '"You were accurate. Those aren\'t always the same thing." He considers you. "Apology noted. Possibly even accepted. Time will tell."']],
          fx: { mem: { lucien: 'apologized' }, rel: { lucien: { affinity: 4, rivalry: -4 } }, path: 'compassionate', history: { lucien: 'Apologised for your first meeting.' } },
          end: true,
        },
      },
    },

    lucien_moonfall: {
      nodes: {
        start: {
          l: [['lucien', '"The Moonfall was a natural celestial event. It\'s in all the books."'], ['a', '"You wrote all the books."'], ['lucien', '"Then they must be very reliable."']],
          c: [
            { cond: { rel: { lucien: { trust: 20 } } }, t: '"Tell me the truth. Just one piece of it."', l: [['n', 'For a long time he says nothing.'], ['lucien', '"It wasn\'t the moon that fell, Astoria. It was a veil. Something was hidden that night, and everyone in Elaria agreed to forget where they put it."'], ['lucien', '"Don\'t ask me what. I\'ve told you more than I\'ve told anyone in a century."']], fx: { mystery: 'myst_moonfall', rel: { lucien: { trust: 3 } }, log: 'Lucien: "It wasn\'t the moon that fell. It was a veil."' } },
            { t: '"Then I\'ll find out without you."', path: 'aggressive', l: [['lucien', '"I\'d expect nothing less. Do try not to get forgotten in the process. It\'s terribly hard to undo."']] },
            { t: 'Let it go — for now.', path: 'secretive', l: [['n', 'You smile and change the subject. He notices. He always notices.']], fx: { rel: { lucien: { affinity: 1 } } } },
          ],
        },
      },
    },

    lucien_crest: {
      nodes: {
        start: {
          l: [['lucien', '"House Veyra. A crescent pierced by a thorn — the moon, wounded by something that loved it." He says it like a line he learned by heart. "It was the eighth house of Elaria. There have only ever been seven."']],
          fx: { memory: 'mem_invitation:crest' },
          end: true,
        },
      },
    },

    lucien_night: {
      nodes: {
        start: {
          l: [['a', '"Where do you go at night?"'], ['lucien', '"To bed, like a respectable man."']],
          c: [
            { cond: { path: { suspicious: 3 } }, t: '[Suspicious] "There\'s cathedral dust on your boots. Again."', l: [['lucien', 'He glances down. For the first time since you met him, Lucien looks caught. "...You should not have been looking at my boots."']], fx: { rel: { lucien: { suspicion: 6, trust: 3 } }, mystery: 'myst_lucien_night' } },
            { t: '"Of course. My mistake."', l: [['lucien', '"It happens to everyone. Especially in Elaria."']] },
          ],
        },
      },
    },

    lucien_history: {
      nodes: {
        start: {
          l: [['a', '"The official history is signed \'L.\'"'], ['lucien', '"A common initial." He doesn\'t look up. "Page twelve is missing, if you were going to ask. It was dull."']],
          c: [
            { t: '"You tore it out."', path: 'suspicious', l: [['lucien', '"I tore out a great many things, Astoria. Some of them were pages."']], fx: { rel: { lucien: { suspicion: 3 } } } },
            { t: '"I\'ll find it."', l: [['lucien', '"I believe you will. That\'s rather the problem."']] },
          ],
        },
      },
    },

    lucien_letters: {
      nodes: {
        start: {
          l: [['n', 'You hold the bundle of letters, each one sealed, each one addressed to "A." in Lucien\'s hand.']],
          c: [
            { t: 'Return them to Lucien unopened.', path: 'compassionate', l: [['n', 'He takes them carefully, as if they might break. "Unopened," he says. "You actually— thank you." He does not say anything else for a while.']], fx: { take: { unsent_letters: 1 }, obj: 'nq_lucien.decide', rel: { lucien: { trust: 15, affinity: 8 } }, mem: { lucien: 'returned_letters' }, history: { lucien: 'Returned his letters unopened.' } } },
            { t: 'Open one before handing them over.', path: 'secretive', l: [['note', '"A. — It has been forty years this time. I remembered you this morning, for a moment, before I made myself forget again. You asked me to. I always do what you ask. — L."'], ['n', 'You reseal it as best you can. When you hand the bundle over, Lucien runs his thumb over the broken wax and says nothing at all.']], fx: { take: { unsent_letters: 1 }, obj: 'nq_lucien.decide', rel: { lucien: { suspicion: 10, trust: 4 } }, mem: { lucien: 'read_letters' }, memory: 'mem_portrait:name', history: { lucien: 'Read one of his letters before returning them.' } } },
            { t: 'Give them to Evelyne instead.', path: 'aggressive', cond: { met: 'evelyne' }, l: [['n', 'Evelyne\'s eyes widen when you hand them over. "Oh, darling. You have no idea what you\'ve just given me." By evening, Lucien knows. By evening, he has stopped speaking to you.']], fx: { take: { unsent_letters: 1 }, obj: 'nq_lucien.decide', rel: { lucien: { affinity: -15, rivalry: 15, trust: -10 }, evelyne: { affinity: 8, trust: 6 } }, mem: { lucien: 'betrayed_letters' }, avoid: { lucien: 3 }, history: { lucien: 'Gave his letters to Evelyne.' } } },
          ],
        },
      },
    },

    lucien_secret: {
      nodes: {
        start: {
          l: [
            ['n', 'Lucien takes you up to the palace balcony and hands you a ledger bound in black leather. Every page is a list of names in his handwriting.'],
            ['lucien', '"Everyone in Elaria who has been forgotten since the Moonfall. I write them down before they go. It\'s the only place they still exist."'],
            ['lucien', '"Three kings have reigned since I started this book. I have advised all of them." He meets your eyes. "Now you know why I don\'t age, and why I don\'t sleep."'],
          ],
          c: [
            { t: '"You\'ve been carrying this alone?"', path: 'compassionate', l: [['lucien', '"Not entirely alone." He looks at you, then away. "Not any more."']], fx: { rel: { lucien: { affinity: 8, trust: 8 } }, romanceHint: 'lucien' } },
            { t: '"Is my name in this book?"', path: 'suspicious', l: [['lucien', 'He takes the ledger back gently. "Not in this one."']], fx: { rel: { lucien: { trust: 5 } } } },
            { t: 'Take his hand, the way you held it at the masquerade.', req: { mem: { lucien: 'danced_masquerade' } }, hint: 'A dance with him at the masquerade', l: [['n', 'You take his hand and hold it exactly as you did on the ballroom floor.'], ['n', 'Lucien looks down at your fingers for a long moment.'], ['lucien', '"All this time," he says, "and you still hold it like that."'], ['n', 'He does not let go until the candles gutter.']], fx: { rel: { lucien: { affinity: 10, trust: 6 } }, romanceHint: 'lucien', mem: { lucien: 'held_hand_ledger' } } },
          ],
          fx: { mystery: 'myst_moonfall', history: { lucien: 'Showed you his ledger of the forgotten.' } },
        },
      },
    },

    lucien_show_photo: {
      nodes: {
        start: {
          l: [['n', 'Lucien looks at the photograph for exactly one second too long.'], ['lucien', '"The royal family, the year of the Moonfall. The girl at the edge is nobody. Her dress was in fashion that season."'], ['n', 'He has not asked where you found it. He already knows.']],
          fx: { obj: 'mq3.show', memory: 'mem_photograph:reaction', rel: { lucien: { suspicion: 4 } } },
          end: true,
        },
      },
    },
    lucien_show_invitation: {
      nodes: { start: { l: [['lucien', '"Put that away before someone else sees it. I\'m serious. Keep it close, and keep it hidden."']], fx: { rel: { lucien: { trust: 1 } } }, end: true } },
    },
    lucien_show_default: {
      nodes: { start: { l: [['lucien', '"Fascinating. Truly. Is there a reason you\'re showing me this, or are we simply sharing?"']], end: true } },
    },

    lucien_cold: {
      nodes: {
        start: {
          l: [['lucien', '"Walking alone again." He falls into step with you, uninvited. "You know, most people who insult me on our first meeting are wise enough to avoid a second."'], ['lucien', '"You keep turning up. I can\'t decide if that\'s courage or stupidity."']],
          c: [
            { t: '"Maybe I was wrong about you."', path: 'compassionate', l: [['lucien', '"Maybe." He sounds almost relieved. "Don\'t let it go to your head."']], fx: { mem: { lucien: 'apologized' }, rel: { lucien: { affinity: 4, rivalry: -3 } } } },
            { t: '"Courage. Obviously."', path: 'aggressive', l: [['lucien', '"Obviously." For a moment he almost smiles.']], fx: { rel: { lucien: { rivalry: 2, affinity: 1 } } } },
          ],
        },
      },
    },
  },
};
