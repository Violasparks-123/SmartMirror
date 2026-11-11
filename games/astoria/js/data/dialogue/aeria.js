// Aeria: the siren chained in the hidden cove beneath the cathedral.
// She tells Astoria that Lucien loved her, left her for a girl who sang to
// bells, and chained her under the cathedral. All true. What she leaves out
// is what she is: the one who taught Lucien the Moonfall rite, so that
// everything Elaria forgot would run down into her sea.
//
// Found by exploring (the cold flagstone behind the cathedral's prayer
// alcove), from Chapter 3. The song cutscene is in data/songs.js.

export const AERIA = {
  cove_descent: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'Behind the prayer alcove one flagstone sits a finger\'s width proud of the others. Cold air breathes up around its edges. It smells of salt.'],
          ['n', 'You lever it up. Beneath it, steps cut into the rock spiral down into the dark, wet and gleaming.'],
          ['n', 'You go down. Further than the crypt. Further than the sealed chamber. The walls begin to sweat salt.'],
          ['n', 'Under the sound of the sea, someone is singing.'],
        ],
        to: 'go',
      },
      go: { fx: { discover: 'cove', flag: 'cove_found', cutscene: 'aeria' }, end: true },
    },
  },

  aeria_meet: {
    bg: 'cove',
    nodes: {
      start: {
        l: [
          ['n', 'The stair ends in a sea cave. Through its mouth you can see the moon, far too large, hanging over a sea as black and still as ink.'],
          ['n', 'On a rock in the shallows sits a woman. Her hair drifts around her as if it were still underwater, and below the waist she is scaled, dark blue-green, like the deep part of a wave.'],
          ['n', 'An iron chain runs from her wrist down into the water, and does not come up.'],
          ['v', '"A girl in a black dress." She tilts her head. "No one has come down those stairs in three hundred years. They made very sure of it."'],
        ],
        c: [
          { t: '"I heard you singing."', path: 'compassionate', l: [['v', '"Everyone hears me singing." Her smile has a few too many teeth in it, or perhaps that is the moonlight. "Very few come down."']], to: 'name' },
          { t: '"Who are you? Why are you chained?"', path: 'suspicious', to: 'name' },
          { t: 'Say nothing. Stay on the last step.', path: 'secretive', l: [['v', '"Sensible. Stay on the step, then. I can talk across water."']], to: 'name' },
        ],
      },
      name: {
        l: [
          ['Aeria', '"My name is Aeria. I sang on this shore before there was a cathedral on top of it."'],
          ['Aeria', '"A young man used to come down here every night to listen. Ink on his hands. Very clever, and he knew it. Lucien."'],
          ['Aeria', '"He loved me. He said so, here, more times than the tide comes in."'],
          ['Aeria', '"Then one night he told me he wanted to end it. He had found someone else: a girl who sang to bells." She looks at you for a long moment. "Funny. You have her face."'],
          ['Aeria', '"The next night he came back with chains, and the crown\'s priests, and her song. He sang me down onto this rock, and they built a cathedral on my head so that no one would ever hear me again."'],
          ['Aeria', '"He still comes, some nights. He stands at the top of the stairs. He never comes down."'],
        ],
        fx: { flag: 'aeria_told', start: 'sq_aeria', memory: 'mem_cove:song', mystery: 'myst_aeria', rel: { lucien: { affinity: -4 } } },
        c: [
          { t: '"Lucien did this to you?"', path: 'suspicious', l: [['Aeria', '"Ask him. Watch his hands when you do."']], to: 'end' },
          { t: '"Why should I believe you?"', path: 'aggressive', l: [['Aeria', '"You shouldn\'t believe anyone. That is the first sensible thing anyone has said down here in three hundred years." She laughs, and the water ripples outward from her. "Ask him."']], to: 'end' },
          { t: '"I\'m sorry. That was cruel of him."', path: 'compassionate', fx: { flag: 'aeria_pitied' }, l: [['Aeria', '"Don\'t be sorry." Her eyes are very bright. "Come back. That would be better than sorry."']], to: 'end' },
        ],
      },
      end: {
        l: [
          ['n', 'You climb back up two hundred steps of wet rock, and all the way up you find yourself thinking about Lucien\'s hands.'],
          ['note', 'Aeria\'s story has changed how you see Lucien.'],
        ],
        end: true,
      },
    },
  },

  lucien_aeria: {
    nodes: {
      start: {
        l: [
          ['a', '"There\'s a stair behind the prayer alcove, Lucien. I went down it. I met Aeria."'],
          ['lucien', 'For once Lucien has nothing clever to say. His pen stops. His hands, you notice, are perfectly still.'],
          ['lucien', '"…Yes. I loved her. I ended it."'],
          ['lucien', '"And yes, I chained her. I would do it again tomorrow."'],
        ],
        c: [
          { t: '"Why?"', path: 'suspicious', l: [['lucien', '"Because I know what she is." A pause. "Not yet. If I tell you now you\'ll hear it as an excuse, and you\'d be right to."']], to: 'end' },
          { t: '"You left her for the bell-singer."', path: 'aggressive', l: [['lucien', 'He flinches as if you had struck him. "Is that what she told you?" He does not deny it.']], to: 'end' },
          { t: '"I\'d like to hear your side."', path: 'compassionate', l: [['lucien', '"My side is that I was young and very stupid and I loved something that sang." He closes the ledger. "The rest is written somewhere you haven\'t been yet. When you\'ve been there, ask me again."']], to: 'end' },
        ],
      },
      end: {
        l: [
          ['lucien', '"Don\'t go back down there. Please." It is the first time you have ever heard him say please.'],
          ['n', 'You don\'t promise. He notices that too.'],
        ],
        fx: { obj: 'sq_aeria.ask', flag: 'doubt_lucien', rel: { lucien: { affinity: -3 } } },
        end: true,
      },
    },
  },

  aeria_second: {
    bg: 'cove',
    nodes: {
      start: {
        l: [
          ['Aeria', '"He told you to stay away." Aeria smiles. "Of course he did. And here you are."'],
          ['Aeria', '"Did he tell you why? No. He never does."'],
          ['Aeria', '"Sing with me. Only three notes. I haven\'t heard another voice down here in three hundred years. I had forgotten what harmony was."'],
          ['n', 'She hums the first note. It is the first of the three notes you heard when you woke.', { flag: 'heard_humming' }],
          ['n', 'She hums the first note. Somehow you already know the second.', { notFlag: 'heard_humming' }],
        ],
        c: [
          { t: 'Sing with her.', path: 'compassionate', fx: { flag: 'aeria_chain_weak', memory: 'mem_cove:chain', obj: 'sq_aeria.return' }, l: [['n', 'You sing. Your voice and hers fit together like two halves of something broken.'], ['n', 'Far down in the water, iron groans. A link of the chain, stamped with a tiny bell, cracks and falls away.'], ['Aeria', '"There," Aeria breathes. "Was that so terrible?" She smiles at you the way the moon smiles at the sea.']], to: 'end' },
          { t: '"Not until I know why he chained you."', path: 'suspicious', fx: { flag: 'aeria_refused', memory: 'mem_cove:chain', obj: 'sq_aeria.return' }, l: [['Aeria', 'For one moment something moves behind her face, very fast, like a fish under ice. Then she laughs. "Then go and find out. You\'ll be back. Everyone comes back to the sea."']], to: 'end' },
        ],
      },
      end: {
        l: [['n', 'On the way up you notice the chain where it passes the foot of the stair. Every link is stamped with a tiny bell.']],
        end: true,
      },
    },
  },

  aeria_reveal: {
    bg: 'cove',
    nodes: {
      start: {
        l: [
          ['Aeria', '"You\'ve been under the chamber. I can smell the violets on you." Aeria isn\'t smiling now. "So. You know."'],
          ['Aeria', '"Everything I told you was true. He loved me. He ended it. He chained me. I only left out what I am."'],
          ['Aeria', '"Ships came to this cove to hear me sing. Their sailors forgot their names, and their wives, and their way home, and every forgotten thing ran down into the water. Into me. It was delicious."'],
          ['Aeria', '"So I taught a clever boy a song that would bring the moon down and make a whole kingdom forget, downhill, into my sea. He didn\'t understand what it was for until it was too late."'],
          ['Aeria', '"And then you. You stood in that chamber and said: put it in me instead. Forty thousand lives that should have been mine, kept in a girl in a black dress."'],
          ['Aeria', '"And you sang with me. One link, Astoria. One more, and I\'m free."', { flag: 'aeria_chain_weak' }],
          ['Aeria', '"So here is my offer. Tomorrow the Duchess puts you back to sleep. Let me out instead. I\'ll drink everything inside you, every name, every grief, and you\'ll be light, and empty, and free. The Duchess will have nothing left to sell. Isn\'t that what you want? To stop choosing?"'],
        ],
        fx: { solve: 'myst_aeria', memory: 'mem_cove:truth' },
        c: [
          { t: 'Ask Lucien to come down and hold the other end of the chain with you.', req: { all: [{ rel: { lucien: { trust: 20 } } }, { notFlag: 'letgo_lucien' }] }, hint: 'Lucien\'s trust, and Lucien still knowing you', fx: { flag: ['aeria_sealed', 'lucien_redeemed'], obj: 'mq8.aeria', rel: { lucien: { trust: 8, affinity: 6 } } }, to: 'together' },
          { t: 'Sing her back down into the dark. Give the three notes to the chain.', path: 'aggressive', fx: { flag: 'aeria_sealed', self: -1, obj: 'mq8.aeria', rel: { lucien: { trust: 4 }, noctis: { trust: 3 } } }, to: 'sealed' },
          { t: 'Leave her as she is. You won\'t be the one who chains her.', path: 'secretive', fx: { flag: 'aeria_left', obj: 'mq8.aeria' }, to: 'left' },
        ],
      },
      together: {
        l: [
          ['n', 'Lucien comes down the two hundred steps for the first time in three hundred years. At the bottom he stops and looks at her, and you see exactly how much he loved her.'],
          ['lucien', '"I should have told you," he says, to you and not to her. "I was ashamed of what I\'d loved."'],
          ['n', 'You sing the three notes together. The chain drinks them. The broken link mends, and a new one grows, and then another.'],
          ['Aeria', 'Aeria sinks to her shoulders in the black water. "You hold your breath in the same place," she tells him. "Both of you. Isn\'t that sweet." Then she is gone under, still smiling.'],
          ['note', 'You were wrong about Lucien. Or right about him, and about her too.'],
        ],
        end: true,
      },
      sealed: {
        l: [
          ['n', 'You sing the three notes into the chain, and the iron drinks them.'],
          ['n', 'The broken link mends. A new one grows, then another. Aeria sinks to her shoulders in the black water.'],
          ['Aeria', '"He sang the same song," she says. "You even hold your breath in the same place." Then she is gone under, still smiling.'],
          ['n', 'On the stair you try to hum the three notes, and nothing comes. They are in the chain now: a piece of you, holding her down.'],
        ],
        end: true,
      },
      left: {
        l: [
          ['Aeria', '"Chains rust," says Aeria pleasantly. "Bells crack. I have time. I have so much time."'],
          ['n', 'The chain is one link shorter than it was. You both know it.', { flag: 'aeria_chain_weak' }],
        ],
        end: true,
      },
    },
  },

  aeria_idle: {
    bg: 'cove',
    nodes: {
      start: {
        l: [
          ['n', 'The water over Aeria\'s rock is still. Very far down, someone is humming three notes, slightly out of tune, on purpose.', { flag: 'aeria_sealed' }],
          ['Aeria', '"Have you asked him yet?" Aeria trails a hand through the black water. "Watch his hands."', { all: [{ notFlag: 'aeria_sealed' }, { notFlag: 'doubt_lucien' }] }],
          ['Aeria', '"Back again. Sing with me sometime. I\'ll be here. I\'m always here."', { all: [{ notFlag: 'aeria_sealed' }, { flag: 'doubt_lucien' }, { notFlag: 'mq8_done' }] }],
          ['Aeria', '"Chains rust," Aeria says, to no one in particular. "Bells crack."', { all: [{ notFlag: 'aeria_sealed' }, { flag: 'mq8_done' }] }],
        ],
        end: true,
      },
    },
  },

  noctis_aeria: {
    nodes: {
      start: {
        l: [
          ['noctis', 'Noctis stops swinging his legs. "You went down the stairs."'],
          ['noctis', '"Don\'t sing with her." He says it very fast, like someone pulling a hand back from a fire. "I\'ve seen what happens if you do. I\'m not allowed to say the rest."'],
          ['noctis', '"…You already did, didn\'t you." He looks out at nothing. "Then it\'s started."', { flag: 'aeria_chain_weak' }],
        ],
        end: true,
      },
    },
  },
};
