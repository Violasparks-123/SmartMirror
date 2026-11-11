// Limited-time events. The Moonlit Gala is fully playable in this prototype;
// the others are announced and clearly marked as planned.

export const EVENTS = {
  gala: {
    id: 'gala',
    title: 'Moonlit Gala',
    tagline: 'Under the pale moon, the kingdom gathers…\nBut not all smiles are sincere.',
    hero: 'assets/img/gala_hero.jpg',
    thumb: 'assets/img/mask_thumb.jpg',
    startDay: 1,
    durationDays: 21,
    maxPoints: 50,
    rewards: [
      { at: 10, label: 'Moonlit Gala Gown', img: 'assets/img/reward_dress.jpg', fx: { outfit: 'gala_gown', item: { cl_gala_gown: 1 } } },
      { at: 20, label: '150 Moonstones', img: 'assets/img/reward_crystal.jpg', fx: { moonstones: 150 } },
      { at: 35, label: 'Silver Masquerade Mask', img: 'assets/img/reward_mask.jpg', fx: { outfit: 'masquerade_mask', item: { acc_masquerade_mask: 1 } } },
      { at: 50, label: 'Star of the Gala', img: 'assets/img/reward_star.jpg', fx: { outfit: 'gala_star', title: 'Star of the Gala' } },
    ],
    daily: [
      { id: 'dance', title: 'Dance at the Velvet Ballroom (Evening/Night)', pts: 4, loc: 'ballroom', hs: 'floor' },
      { id: 'petal', title: 'Gather a black rose petal on the ballroom balcony', pts: 3, loc: 'ballroom', hs: 'balcony' },
      { id: 'masked', title: 'Speak with anyone at the Velvet Ballroom', pts: 3, loc: 'ballroom' },
    ],
    story: [
      { id: 'p1', title: 'I · The Invitation Without a Name', need: 0, convo: 'gala_story_1', pts: 5 },
      { id: 'p2', title: 'II · The Mask That Fits', need: 12, convo: 'gala_story_2', pts: 5 },
      { id: 'p3', title: 'III · The Last Waltz', need: 25, convo: 'gala_story_3', pts: 6 },
    ],
    secrets: [
      { id: 's1', title: 'A Stranger in Silver', need: 25, convo: 'gala_secret_1', pts: 4 },
    ],
    quest: { title: 'Attend the Royal Masquerade', step: 'Speak to Lucien at the Ballroom', npc: 'lucien', loc: 'ballroom', phase: [2], convo: 'gala_lucien', pts: 6 },
  },
};

export const UPCOMING_EVENTS = [
  { id: 'winter', title: 'The Winter Eclipse', text: 'A mysterious winter celebration, when the moon is said to forget itself for one night.' },
  { id: 'rose', title: 'The Forgotten Rose', text: 'A rare grey rose blooms in the royal gardens — a flower connected to the Moonfall.' },
  { id: 'letters', title: 'The Midnight Letters', text: 'Letters from unknown hands arrive at midnight. Some of them are in your own handwriting.' },
];

export const EVENT_CONVOS = {
  gala_story_1: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'An envelope of black card arrives with no name on it. Inside, in silver ink: "The Moonlit Gala. Seven nights. Come as you were."'],
          ['a', '"Come as I was?"'],
          ['n', 'Every noble in Elaria has received one. Every one of them is addressed to no one. The palace says the invitations are "traditional." Nobody can remember the tradition.'],
        ],
        c: [
          { t: 'Keep the invitation close.', path: 'secretive', l: [['n', 'You tuck it into your sleeve, beside the other one. The two envelopes are the same weight to the grain.']] },
          { t: 'Ask around about the tradition.', path: 'suspicious', l: [['n', 'Three nobles tell you three different origins. The fourth says, "It\'s for her, of course," and then looks confused about who "her" is.']] },
        ],
        fx: { galaStory: 'p1' },
      },
    },
  },
  gala_story_2: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'A mask is waiting on your pillow. Silver filigree. Pearls. It fits your face exactly, as though it were made from it.'],
          ['n', 'In the ballroom, an old countess sees you wearing it and sits down very suddenly. "You\'ve come back for the gala," she whispers. "We kept it for you. Every year."'],
        ],
        c: [
          { t: '"Kept it for me? Why?"', path: 'compassionate', l: [['n', '"Because you asked us to forget you," the countess says. "And we promised to dance in your honour so the moon would remember." She frowns. "Who are you, dear? Have we met?"']] },
          { t: 'Take the mask off.', path: 'aggressive', l: [['n', 'The room goes quiet. Then, all at once, everyone starts talking very loudly about the weather.']] },
        ],
        fx: { galaStory: 'p2' },
      },
    },
  },
  gala_story_3: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'The final waltz. The chandeliers dim to candle-glow. Every guest turns toward the empty centre of the floor — and waits.'],
          ['n', 'Someone has to dance the last waltz. By tradition, no one ever does. The space is kept for someone who never arrives.'],
        ],
        c: [
          { t: 'Step into the empty centre.', path: 'compassionate', l: [['n', 'You walk into the circle. Nobody stops you. The orchestra, after a long breath, begins to play three notes, over and over.'], ['n', 'You dance alone. Halfway through, you realise half the room is weeping and none of them know why.']] },
          { t: 'Watch from the edge, and see who looks at the empty space longest.', path: 'suspicious', l: [['n', 'Lucien, at the back. Seraphine, who should not be here at all. And Noctis, on the gallery rail, mouthing the words to a song that has none.']] },
        ],
        fx: { galaStory: 'p3' },
      },
    },
  },
  gala_lucien: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'Lucien is watching the gala from the gallery stairs, a glass of something dark in his hand he has clearly not touched.'],
          ['lucien', '"Ah. You came. Everyone does, eventually — it\'s the only party in Elaria nobody remembers being invited to."'],
          ['lucien', '"They hold it every year. For someone. Nobody knows who." He looks at you over the rim of the glass. "I\'m sure it\'s a coincidence that you look so well in candlelight."'],
        ],
        c: [
          { t: '"Do you know who it\'s for?"', path: 'suspicious', fx: { rel: { lucien: { trust: 3 } } }, l: [['lucien', '"I know a great many things I am not going to tell you tonight. Enjoy the music."']] },
          { t: '"Dance with me, then. For whoever it\'s for."', path: 'compassionate', fx: { rel: { lucien: { affinity: 4 } }, mem: { lucien: 'gala_dance' } }, l: [['lucien', 'He sets the glass down very carefully. "…One dance. For whoever it\'s for."']] },
        ],
        fx: { galaQuest: true },
      },
    },
  },
  gala_secret_1: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'A stranger in a silver mask takes your hand on the balcony. Their voice is warm and very familiar.'],
          ['v', '"You shouldn\'t be here. Not yet. But since you are — dance with me once. For old times."'],
          ['n', 'You dance. When the music stops, the stranger is gone, and in your palm is a single violet petal that glows faintly in the dark.'],
        ],
        fx: { galaSecret: 's1', item: { moon_shard: 1 } },
        end: true,
      },
    },
  },
};
