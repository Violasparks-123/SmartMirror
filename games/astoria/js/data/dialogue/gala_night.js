// The Moonlit Gala night: one evening, played once, with an outfit check,
// three choices about how to spend the night, and a midnight that stops.
const PTS = (n) => ({ gala: n });
const MASQ = { any: [{ worn: 'gala_gown' }, { worn: 'crimson_masque' }, { worn: 'midnight_rose' }] };

export const GALA_NIGHT = {
  gala_night: {
    bg: 'gala_night',
    nodes: {
      start: {
        l: [
          ['n', 'Once a year, on the night the moon is fullest, every noble house in Elaria comes to the Velvet Ballroom in a mask. It is the only night of the year when nobody is allowed to be forgotten. That is the rule. Nobody remembers who made it.'],
          ['n', 'Three hundred guests. Eleven chandeliers. A string orchestra playing something slow enough to lie in.'],
          ['n', 'The herald takes your invitation, reads the name on it, and does not announce you. He bows instead — low, to the floor — and the room goes quiet in a ring around you.'],
          ['n', 'The Moonlit Gala Gown catches every candle in the room. Somebody near the stairs actually gasps.', { worn: 'gala_gown' }],
          ['n', 'In crimson and black you look like a warning. Several gentlemen find urgent business elsewhere.', { worn: 'crimson_masque' }],
          ['n', 'Black lace and violet roses. A dowager by the punch bowl says, quite loudly, "Well. Somebody has read the invitation properly."', { worn: 'midnight_rose' }],
          ['n', 'Your dress is lovely, but it is not a gala dress, and three hundred people notice at exactly the same moment. Evelyne, across the room, closes her eyes in pain.', { not: MASQ }],
        ],
        go: [{ cond: MASQ, to: 'dressed' }, { cond: {}, to: 'first' }],
      },
      dressed: { fx: PTS(4), l: [['note', 'The room approves of you. (+4 gala points)']], to: 'first' },

      first: {
        l: [['n', 'The first dance is called. By custom you must dance it with someone you came to know this year.']],
        c: [
          { t: 'Dance with Lucien.', cond: { met: 'lucien' }, to: 'd_lucien' },
          { t: 'Dance with Cael.', cond: { met: 'cael' }, to: 'd_cael' },
          { t: 'Dance with Evelyne.', cond: { met: 'evelyne' }, to: 'd_evelyne' },
          { t: 'Find Noctis, who should not be here.', cond: { met: 'noctis' }, to: 'd_noctis' },
          { t: 'Dance alone. Let them watch.', path: 'secretive', to: 'd_alone' },
        ],
      },
      d_lucien: {
        fx: { rel: { lucien: { affinity: 5 } }, gala: 3 },
        l: [
          ['lucien', '"I don\'t dance," he says, already taking your hand. "I want that on the record."'],
          ['n', 'He counts the steps under his breath. When he loses count, he doesn\'t start again.'],
          ['lucien', '"Every year I stand by that pillar and write down who came. Tonight I\'ll have to do it from memory." A pause. "I find I don\'t mind."'],
        ],
        to: 'masks',
      },
      d_cael: {
        fx: { rel: { cael: { affinity: 5 } }, gala: 3 },
        l: [
          ['cael', '"I\'m on duty," he says. "This is a security assessment." His hand on your back is very careful, like you might be stolen if he presses too hard.'],
          ['cael', '"Three exits. Two drunk viscounts. One of you." He turns you, badly. "The one of you is the problem. I can\'t watch anything else."'],
        ],
        to: 'masks',
      },
      d_evelyne: {
        fx: { rel: { evelyne: { affinity: 5 } }, gala: 3 },
        l: [
          ['evelyne', '"Ladies don\'t dance together at the gala," Evelyne says, sweeping you onto the floor. "So everyone\'s going to be talking about us for a year. Smile, darling. Give them something to remember."'],
          ['evelyne', 'Lower, against your ear: "Mother is watching from the gallery. Don\'t look. She\'s counting how many people bow to you."'],
        ],
        to: 'masks',
      },
      d_noctis: {
        fx: { rel: { noctis: { affinity: 5 } }, gala: 3 },
        l: [
          ['n', 'You find Noctis under the refreshment table, eating the decorative marzipan swans one wing at a time.'],
          ['noctis', '"I\'m not here," he says. "Officially I\'m a draught." He crawls out, bows absurdly low, and dances with you by standing on your feet.'],
          ['noctis', '"Something happens at midnight," he says, with a mouth full of swan. "Don\'t worry. It\'s the good kind of terrible."'],
        ],
        to: 'masks',
      },
      d_alone: {
        fx: { path: { secretive: 1 }, gala: 2 },
        l: [
          ['n', 'You step into the centre of the floor alone. The orchestra falters, then follows you.'],
          ['n', 'Nobody joins you. Nobody looks away, either. Three hundred masks, turned toward you like flowers to a lamp.'],
        ],
        to: 'masks',
      },

      masks: {
        l: [
          ['n', 'Between dances there is a game, older than anyone in the room: three guests in full masks stand on the stair, and anyone may guess who they are. A wrong guess costs a forfeit. A right one, a secret.'],
          ['n', 'The first mask is a silver fox. The second, a gilded beak. The third, plain black velvet, held up on a stick by a gloved hand with too many rings.'],
        ],
        c: [
          { t: 'Point at the black velvet. "Duchess Marchetti."', to: 'm_right' },
          { t: 'Point at the gilded beak. "Lord Ashgrove."', to: 'm_ashgrove' },
          { t: 'Point at the silver fox. "Lucien."', to: 'm_wrong' },
        ],
      },
      m_right: {
        fx: { gala: 5 },
        l: [
          ['The Duchess', 'The velvet mask lowers. The Duchess looks at you as if you were a sum that had come out right.'],
          ['The Duchess', '"Very good. Here is your secret, child: everyone in this room has bought someone, and everyone in this room knows you are where they went."'],
          ['The Duchess', '"Enjoy your evening. They are all being very polite to you, and now you know why."'],
          ['note', 'You guessed right. (+5 gala points)'],
        ],
        to: 'quarter',
      },
      m_ashgrove: {
        fx: { gala: 3 },
        l: [
          ['n', 'The gilded beak comes off. It is Lord Ashgrove. He is sweating.'],
          ['n', '"I don\'t know what you think you saw," he says to nobody, and leaves.'],
          ['n', 'Somewhere inside you, a stable-boy watches him go and is not afraid any more.', { any: [{ held: 'witness' }, { kept: 'witness' }] }],
          ['note', 'You guessed right. (+3 gala points)'],
        ],
        to: 'quarter',
      },
      m_wrong: {
        l: [
          ['n', 'The silver fox lowers its mask. It is a very confused young man named Percival who has never met Lucien in his life.'],
          ['n', 'Your forfeit is to dance with Percival. He treads on you nine times and apologises eleven.'],
          ['lucien', 'From a pillar somewhere, quite clearly: "Silver fox. Honestly."', { met: 'lucien' }],
        ],
        to: 'quarter',
      },

      quarter: {
        l: [['n', 'Quarter to midnight. The candles have burned down to stubs and the chandeliers are dimming on their own. There is a woman in a silver mask on the balcony who has been watching you all night.']],
        c: [
          { t: 'Follow the woman in silver onto the balcony.', to: 'q_balcony' },
          { t: 'Stay on the floor for the last waltz.', to: 'q_waltz' },
          { t: 'Slip upstairs to the Duchess\'s study while everyone is dancing.', path: 'suspicious', req: { chapterMin: 4 }, hint: 'Chapter 4 or later', to: 'q_study' },
        ],
      },
      q_balcony: {
        l: [
          ['v', '"You came," she says, without turning. "I hoped. You can\'t ever be sure, with hope."'],
          ['n', 'She is wearing a dress that went out of fashion a long time ago, and she smells of fountain water.'],
        ],
        to: 'midnight',
      },
      q_waltz: {
        fx: { gala: 2 },
        l: [
          ['n', 'The last waltz is always left empty, the floor kept clear for someone who never comes. You walk out into it.'],
          ['n', 'The woman in silver is suddenly opposite you, as if she has always been there. She holds out her hand.'],
        ],
        to: 'midnight',
      },
      q_study: {
        fx: { gala: 3, mystery: 'myst_accord' },
        l: [
          ['n', 'The Duchess\'s study is unlocked. Of course it is: nobody would dare.'],
          ['n', 'On the desk, an open ledger. This year\'s gala guest list, with small violet ticks beside some names. Beside four of them, a second tick. Those four are not in the ballroom tonight.'],
          ['n', 'You hear the clocks downstairs begin to strike, and the woman in silver is standing in the doorway.'],
        ],
        to: 'midnight',
      },

      midnight: {
        l: [
          ['n', 'Midnight. Every clock in the Velvet Ballroom strikes twelve. Then, all together, they strike once more.'],
          ['n', 'And stop. Thirteen minutes past. The pendulums hang in the air.'],
          ['n', 'Below, three hundred guests stand perfectly still, masks in their hands, with the faces of people who cannot remember their own names. For one minute, the whole room has forgotten itself. Except you.'],
          ['n', 'The woman in silver takes off her mask. She is young and plain and her eyes are full of fountain water.'],
          ['Liesel', '"My name is Liesel. You won\'t know it. Nobody does. A woman threw a coin in a fountain for me once, and kept a place at her table, and never knew why."'],
          ['Liesel', '"Once a year, while the clocks stop, the moon lets one of us walk. This year it let me, because you are here, and you are where we all went."'],
          ['Liesel', '"I don\'t need to come home. I only wanted somebody to say my name while they were looking at me. Will you?"'],
        ],
        c: [
          { t: '"Liesel."', path: 'compassionate', fx: { flag: 'liesel_named', gala: 6 }, l: [
            ['Liesel', 'She smiles like a door opening. "There. That\'s all. That\'s everything."'],
            ['cael', 'Down on the floor, Cael has stopped mid-step. "…Liesel?" he says, frowning, to no one. "Why did I just…"', { met: 'cael' }],
          ], to: 'dawn' },
          { t: '"Tell me who you were first."', path: 'suspicious', fx: { flag: 'liesel_named', gala: 5 }, l: [
            ['Liesel', '"A seamstress. Bad at it. I loved a girl who sold fish, and the fish-girl\'s family paid to make me go away."'],
            ['Liesel', '"That\'s it. That\'s the whole sad little thing. Now say it."'],
            ['a', '"Liesel."'],
          ], to: 'dawn' },
          { t: 'Take her hand and finish the waltz instead.', path: 'secretive', fx: { flag: 'liesel_danced', gala: 5 }, l: [
            ['n', 'You dance with her in a room full of frozen people, to music that isn\'t playing. She is a very bad dancer. Neither of you minds.'],
          ], to: 'dawn' },
        ],
      },

      dawn: {
        fx: { flag: 'gala_night_done', moonstones: 80, exp: 120, item: { pocket_watch: 1 } },
        l: [
          ['n', 'The clocks start again. The guests blink, put their masks back on, laugh at something nobody said. The orchestra picks up mid-bar as if nothing happened.'],
          ['n', 'When you look at the balcony, there\'s only a silver mask on the rail, and a pool of water that smells of the fountain.'],
          ['n', 'You walk home at dawn with your shoes in your hand. In your pocket there is a silver watch you did not buy. It has stopped at thirteen minutes past midnight.'],
          ['note', 'Gala Night complete. +80 Moonstones, a Stopped Pocket Watch, and gala points toward the event rewards.'],
        ],
        end: true,
      },
    },
  },
};
