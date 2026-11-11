// NPC definitions: identity, look, personality, routines, tastes and secrets.
// Schedules are indexed by time phase: 0 Morning, 1 Afternoon, 2 Evening, 3 Night.
// An entry may define `odd` for odd-numbered days and `hidden` for a secret
// whereabouts that is only revealed once a flag is set.

export const NPCS = {
  lucien: {
    id: 'lucien',
    name: 'Lucien',
    title: 'The Royal Advisor',
    portrait: 'assets/img/portrait_lucien.jpg',
    sprite: 'assets/chars/lucien.webp',
    accent: '#8f6cc4',
    personality: ['Mysterious', 'Sarcastic', 'Intelligent', 'Calculating', 'Emotionally distant'],
    look: 'Dark, unruly hair; violet eyes that never quite smile with his mouth. A black high-collared coat strung with silver chains and a single dried rose.',
    bio: 'Advisor to the crown for longer than anyone at court can precisely say. He writes the kingdom\'s official histories — and, one suspects, edits them.',
    secretHint: 'He knows considerably more about the Moonfall than he admits.',
    romance: true,
    likes: ['black_tea', 'rare_manuscript', 'silver_quill'],
    loves: ['rare_manuscript'],
    dislikes: ['violet_bouquet', 'honey_cakes'],
    schedule: [
      { loc: 'royal', spot: 'Palace entrance', act: 'Receiving petitions beneath the palace arch' },
      { loc: 'library', spot: 'Royal archive wing', act: 'Reading in the royal archive wing' },
      { loc: 'royal', spot: 'Palace balcony', act: 'Alone on the palace balcony, watching the moon' },
      { loc: null, spot: 'Unknown', act: 'Whereabouts unknown', hidden: { flag: 'lucien_night_known', loc: 'cathedral', spot: 'Beneath the cathedral', act: 'Descending into the chamber beneath the cathedral' } },
    ],
    motif: [62, 65, 69, 68],
  },

  evelyne: {
    id: 'evelyne',
    name: 'Evelyne',
    title: 'The Aristocrat',
    portrait: 'assets/img/portrait_evelyne.jpg',
    sprite: 'assets/chars/evelyne.webp',
    accent: '#c48aa3',
    personality: ['Sweet', 'Charming', 'Manipulative', 'Socially intelligent', 'Secretive'],
    look: 'Honey-gold ringlets pinned with pearls, rose-tinted eyes, a gown of dusky mauve and an ever-present lace fan.',
    bio: 'Daughter of House Marchetti, keepers of every guest list in Elaria since the founding. Everyone adores her. Almost no one trusts her.',
    secretHint: 'Her relationship with the royal family is far more complicated than her smile suggests.',
    romance: false,
    likes: ['lace_gloves', 'rose_perfume', 'honey_cakes'],
    loves: ['lace_gloves'],
    dislikes: ['polished_whetstone', 'candle_bundle'],
    schedule: [
      { loc: 'royal', spot: 'Rosewater Café', act: 'Taking tea at the Rosewater Café' },
      { loc: 'royal', spot: 'Royal gardens', act: 'Strolling the royal gardens with admirers' },
      { loc: 'ballroom', spot: 'Grand ballroom', act: 'Holding court at an evening gathering', odd: { loc: 'royal', spot: 'Fountain square', act: 'Whispering with nobles by the fountain' } },
      { loc: null, spot: 'Marchetti residence', act: 'At home in the Marchetti residence' },
    ],
    motif: [72, 76, 79, 76],
  },

  cael: {
    id: 'cael',
    name: 'Cael',
    title: 'The Royal Guard',
    portrait: 'assets/img/portrait_cael.jpg',
    sprite: 'assets/chars/cael.webp',
    accent: '#9fb2c9',
    personality: ['Reserved', 'Protective', 'Disciplined', 'Observant', 'Loyal'],
    look: 'Silver-white hair kept short, grey eyes, the black-and-ivory dress uniform of the palace guard.',
    bio: 'The youngest captain in the Royal Guard. He keeps the duty roster himself, because three names have vanished from it this year and nobody else noticed.',
    secretHint: 'He becomes increasingly concerned about Astoria\'s involvement in the kingdom\'s mysteries.',
    romance: true,
    likes: ['polished_whetstone', 'honey_cakes', 'black_tea'],
    loves: ['polished_whetstone'],
    dislikes: ['rose_perfume'],
    schedule: [
      { loc: 'royal', spot: 'Royal guard headquarters', act: 'Reviewing the duty roster at headquarters' },
      { loc: 'royal', spot: 'Palace walls', act: 'Patrolling the palace walls' },
      { loc: 'cathedral', spot: 'Cathedral steps', act: 'Walking the patrol route past the cathedral', odd: { loc: 'royal', spot: 'Fountain square', act: 'Standing watch over the fountain square' } },
      { loc: 'royal', spot: 'Palace gate', act: 'On night watch at the palace gate', odd: { loc: 'woods', spot: 'Forest edge', act: 'Patrolling the edge of the Whispering Woods' } },
    ],
    motif: [55, 59, 62, 67],
  },

  seraphine: {
    id: 'seraphine',
    name: 'Seraphine',
    title: 'The Cathedral Keeper',
    portrait: 'assets/img/portrait_seraphine.jpg',
    sprite: 'assets/chars/seraphine.webp',
    accent: '#7e86c9',
    personality: ['Elegant', 'Mysterious', 'Calm', 'Knowledgeable', 'Difficult to read'],
    look: 'Long blue-black hair, dark eyes that rest on you a moment too long, and keeper\'s robes trimmed with violet thread.',
    bio: 'Keeper of the Cathedral of Eclipses — though the cathedral was abandoned long ago, and no one appointed her. She tends the violets and the bells.',
    secretHint: 'She seems to know something about Astoria\'s arrival.',
    romance: false,
    likes: ['candle_bundle', 'violet_bouquet', 'book_hymnal'],
    loves: ['violet_bouquet'],
    dislikes: ['rose_perfume', 'sugared_plums'],
    schedule: [
      { loc: 'cathedral', spot: 'Main hall', act: 'Lighting candles in the main hall' },
      { loc: 'cathedral', spot: 'Violet garden', act: 'Tending the violets in the cloister' },
      { loc: 'library', spot: 'Reading room', act: 'Returning books to the Forgotten Library', odd: { loc: 'cathedral', spot: 'Prayer rooms', act: 'Sitting alone in the abandoned prayer rooms' } },
      { loc: 'cathedral', spot: 'Bell tower', act: 'Keeping vigil in the bell tower', hidden: { flag: 'seraphine_night_known', every: 3, loc: 'woods', spot: 'Ancient shrine', act: 'Kneeling at a shrine deep in the woods' } },
    ],
    motif: [64, 67, 71, 74],
  },

  noctis: {
    id: 'noctis',
    name: 'Noctis',
    title: 'The Wanderer',
    portrait: 'assets/img/portrait_noctis.jpg',
    sprite: 'assets/chars/noctis.webp',
    accent: '#c9b37e',
    personality: ['Playful', 'Unpredictable', 'Strange', 'Intelligent', 'Slightly unsettling'],
    look: 'Black hair streaked with a single silver lock, one gold eye and one violet, a travelling cloak that is never wet even in the rain.',
    bio: 'No one knows where he lives, or when he arrived. He appears where he should not be, and sometimes mentions things that have not happened yet.',
    secretHint: 'He sometimes references events that have not happened yet.',
    romance: false,
    likes: ['pocket_watch', 'sugared_plums', 'book_fairytale'],
    loves: ['pocket_watch'],
    dislikes: ['black_tea'],
    wanderer: true,
    wanderSpots: [
      { loc: 'cathedral', spot: 'Top of the locked bell tower', act: 'Sitting on the edge of the locked bell tower' },
      { loc: 'royal', spot: 'Rim of the fountain', act: 'Balancing on the rim of the fountain' },
      { loc: 'library', spot: 'Atop the tallest shelf', act: 'Reading upside-down on top of a shelf' },
      { loc: 'woods', spot: 'Among the glowing flowers', act: 'Talking to the glowing flowers' },
      { loc: 'ballroom', spot: 'Empty dance floor', act: 'Waltzing alone in the empty ballroom' },
      { loc: null, spot: 'Nowhere', act: 'Nowhere anyone can find' },
    ],
    motif: [69, 73, 76, 81],
  },
};

export const NPC_ORDER = ['seraphine', 'lucien', 'evelyne', 'cael', 'noctis'];

// What each NPC thinks of being invited somewhere.
export const INVITES = {
  lucien: {
    cathedral: { ok: true, yes: '"The cathedral. How sentimental of you. Very well."', scene: 'Lucien walks the nave with his hands behind his back, reading the stained glass as if it were a ledger. "They replaced the third window," he says. "Badly." He does not explain how he would know.' },
    royal: { ok: true, yes: '"I live there. You are inviting me to my own front step. Charming."', scene: 'You walk the length of the shopping street together. Every shopkeeper bows. Lucien acknowledges none of them, but he slows his pace to match yours.' },
    library: { ok: true, yes: '"Finally, a sensible destination."', scene: 'Lucien pulls a volume from a shelf without looking and hands it to you, open to a page about moon phases. "You were going to ask," he says. "This saves time."' },
    woods: { ok: false, no: '"I do not do forests. Forests do not keep records."' },
    ballroom: { ok: true, yes: '"If you insist on spectacle."', scene: 'In the empty ballroom Lucien offers his hand with exaggerated formality. He dances perfectly — as if he learned three hundred years ago and never forgot a step.' },
    garden: { ok: true, yes: '"The garden. You know it is always night in there? Of course you do."', scene: 'Lucien walks the moonlit paths beside you without speaking for a long time. At the bench he stops, runs a thumb over two small crescents scratched into the armrest, and does not explain them.' },
  },
  evelyne: {
    cathedral: { ok: false, no: '"The cathedral? Darling, the draughts. Ask me somewhere with cushions."' },
    royal: { ok: true, yes: '"Oh, the café — yes, please. I\'ll tell you who\'s feuding."', scene: 'Evelyne orders for both of you without asking and spends an hour cheerfully dismantling three reputations. Somewhere in the middle she asks, very lightly, where you were born.' },
    library: { ok: true, yes: '"How studious. I\'ll bring a fan; the dust is unforgiving."', scene: 'Evelyne drifts between the shelves, trailing a gloved finger. She stops at the peerage records, and for a moment her smile goes away entirely.' },
    woods: { ok: true, yes: '"The woods? How daring. Fine — but if I ruin my hem, you\'re buying the next one."', scene: 'Evelyne is surprisingly sure-footed on the forest paths. "I came here as a girl," she says. "Before Mother forbade it." She does not say why.' },
    ballroom: { ok: true, yes: '"The ballroom is my second home. Come, I\'ll introduce you to everyone worth knowing."', scene: 'Evelyne introduces you to eleven nobles in twenty minutes. Each of them looks at your face a second longer than politeness allows.' },
    garden: { ok: true, yes: '"The gardens! Darling, everyone proposes in the gardens. People will talk."', scene: 'Evelyne names every rose and the scandal attached to it. Under the arch she goes quiet. "Ilse and I used to hide here," she says, and then talks very quickly about something else.' },
  },
  cael: {
    cathedral: { ok: true, yes: '"I\'ll come. I don\'t like you going there alone at night anyway."', scene: 'Cael checks every doorway before you enter it. At the altar he stops and frowns. "I\'ve dreamt of this room," he says, and then looks embarrassed that he said it.' },
    royal: { ok: true, yes: '"Off duty, for once. I accept."', scene: 'Out of uniform, Cael is quieter and laughs more easily. He buys you a candied violet from a street cart and pretends it was an accident.' },
    library: { ok: true, yes: '"I\'ll keep watch while you read."', scene: 'Cael stands by the window while you search the stacks. Every so often he glances at the restricted archive door and his jaw tightens.' },
    woods: { ok: true, yes: '"Stay close to me there. Agreed?"', scene: 'In the woods Cael walks half a step ahead of you, sword loose in its sheath. He points out which glowing flowers are safe to touch. All of them, it turns out. He just wanted to talk.' },
    ballroom: { ok: true, yes: '"I don\'t dance. ...I could try."', scene: 'Cael\'s dancing is stiff and earnest and he apologises for every misstep. By the third song he stops apologising.' },
    garden: { ok: true, yes: '"I patrol past that gate every night and I\'ve never once gone in. All right."', scene: 'Cael keeps glancing at the gate as if expecting to be told off. By the third lap of the roses he has stopped. "It\'s quiet," he says, surprised, and stays until the moon in here should have set, and doesn\'t.' },
  },
  seraphine: {
    cathedral: { ok: true, yes: '"I am always here. But I will wait for you."', scene: 'Seraphine shows you the cloister garden, naming each violet bed as though naming children. "These remember the old cathedral," she says. "Flowers are honest that way."' },
    royal: { ok: false, no: '"The Royal District does not care for me, nor I for it. Ask me somewhere quieter."' },
    library: { ok: true, yes: '"Yes. There are books there I have been meaning to return for some time."', scene: 'Seraphine returns a book to the library. The librarian checks the ledger, frowns, and says the book was borrowed ninety-one years ago. Seraphine thanks her politely and leaves.' },
    woods: { ok: true, yes: '"The woods. Yes. I will show you where the old shrine is."', scene: 'Seraphine leads you to a shrine covered in moss. She lays a single violet on it and says a name too softly for you to hear.' },
    ballroom: { ok: false, no: '"The ballroom is a place for forgetting. I would rather not."' },
    garden: { ok: true, yes: '"The palace gardens. I have not walked there in a very long time."', scene: 'Seraphine stops at the grey rose and touches one petal. "This was white, once," she says. "Everything here was. I remember when it changed." She does not say when.' },
  },
  noctis: {
    cathedral: { ok: true, yes: '"I\'ll be there. I\'m actually already there. Hurry up."', scene: 'Noctis is waiting at the top of a staircase that leads nowhere. "You took the long way," he says, though you took the only way.' },
    royal: { ok: true, yes: '"Yes! I\'ll wear a disguise. You won\'t recognise me. You will, though."', scene: 'Noctis wears a fake moustache that is somehow worse than no disguise at all. Three guards salute him.' },
    library: { ok: true, yes: '"Ooh. Bring a question you haven\'t thought of yet."', scene: 'Noctis hands you a book and says, "Page forty-one, next Tuesday." You check page forty-one. It is blank. For now.' },
    woods: { ok: true, yes: '"The flowers asked about you, actually."', scene: 'Noctis introduces you to a glowing flower by name. The flower, you would swear, leans toward you.' },
    ballroom: { ok: true, yes: '"A dance! I know all the steps. Some of them haven\'t been invented."', scene: 'Noctis dances a waltz that keeps changing tempo to match music that is not playing. It is unsettling. It is also, somehow, lovely.' },
    garden: { ok: true, yes: '"The always-night garden? Yes. I like places that agree with me."', scene: 'Noctis lies on the iron bench and tells you which stars over the garden are the wrong ones. There are four. He is very pleased you can\'t see the difference.' },
  },
};

// Memory-aware greetings shown when Astoria approaches. The first match wins.
export const GREETINGS = {
  lucien: [
    { cond: { mem: { lucien: 'stood_up' } }, text: '"I waited on that spot for an entire hour. I have not waited for anyone in a very long time. I do not intend to start again."' },
    { cond: { mem: { lucien: 'read_letters' } }, text: '"You read them." He does not phrase it as a question. "Of course you did."' },
    { cond: { mem: { lucien: 'insulted' }, notMem: { lucien: 'apologized' } }, text: '"Ah. The girl with the sharp tongue. Have you come to sharpen it further?"' },
    { cond: { rel: { lucien: { affinity: 40 } } }, text: '"You again." The corner of his mouth betrays him. "I find I don\'t mind."' },
    { cond: { memAny: { lucien: 'gift:' } }, text: '"I\'m told it is customary to thank people for gifts more than once. I won\'t. But I did notice."' },
    { cond: { met: 'lucien' }, text: '"Astoria. To what do I owe the interruption?"' },
    { cond: {}, text: 'A tall man in a high-collared coat watches you with open, unhurried interest.' },
  ],
  evelyne: [
    { cond: { mem: { evelyne: 'stood_up' } }, text: '"Oh! You\'re alive. I did wonder, after you left me sitting alone like a jilted debutante. Everyone saw."' },
    { cond: { mem: { evelyne: 'kept_cameo' } }, text: 'Evelyne\'s smile is perfect and does not reach her eyes. "Have you seen my cameo anywhere, darling? No? How odd."' },
    { cond: { memAny: { evelyne: 'gift:lace_gloves' } }, text: '"Look — I\'m wearing them!" She wiggles gloved fingers at you. "Everyone has asked where I got them. I\'ve said nothing. Mysterious, isn\'t it?"' },
    { cond: { rel: { evelyne: { affinity: 40 } } }, text: '"My favourite person in Elaria! Don\'t tell anyone I said that; I say it to everyone. But I mean it with you."' },
    { cond: { met: 'evelyne' }, text: '"Astoria! Come, sit, tell me something scandalous."' },
    { cond: {}, text: 'A young noblewoman with honey-gold ringlets lowers her fan to look at you.' },
  ],
  cael: [
    { cond: { mem: { cael: 'stood_up' } }, text: '"You didn\'t come." He keeps his voice even. "I thought something had happened to you."' },
    { cond: { mem: { cael: 'argued' } }, text: 'Cael gives you a short, formal nod — the kind he gives to strangers.' },
    { cond: { flag: 'mq3_started', notFlag: 'mq4_done' }, text: '"You\'ve been near the restricted archive. Don\'t deny it — the archivist sent word." He sighs. "Just be careful."' },
    { cond: { rel: { cael: { affinity: 40 } } }, text: 'Cael\'s posture eases the moment he sees you. "There you are. I was hoping you\'d pass this way."' },
    { cond: { met: 'cael' }, text: '"Astoria." A brief salute. "Everything all right?"' },
    { cond: {}, text: 'A guard captain with silver-white hair stops mid-stride and studies your face.' },
  ],
  seraphine: [
    { cond: { mem: { seraphine: 'stood_up' } }, text: '"I lit a candle for you when you did not come. It is still burning."' },
    { cond: { flag: 'mq6_done' }, text: 'Seraphine looks at you as though you are a word she has been trying to remember for a very long time.' },
    { cond: { rel: { seraphine: { trust: 30 } } }, text: '"Child. Sit a while. The bells are quiet today."' },
    { cond: { met: 'seraphine' }, text: '"You came back. Good. The cathedral is always glad to see you."' },
    { cond: {}, text: 'A woman in violet-trimmed robes stands among the candles, as if she has been expecting you.' },
  ],
  noctis: [
    { cond: { mem: { noctis: 'stood_up' } }, text: '"You didn\'t come! Which is fine. You did come, later, in a different way. Never mind."' },
    { cond: { flag: 'nq_noctis_done' }, text: '"Hello again. Or, from my side, goodbye. It\'s confusing. Sit down."' },
    { cond: { met: 'noctis' }, text: '"Oh good, you\'re early. You\'re always early. Well — you will be."' },
    { cond: {}, text: 'A young man in a travelling cloak is sitting somewhere he should not be able to reach. He waves.' },
  ],
};

// NPCs who approach Astoria on their own when conditions are right.
export const APPROACHES = [
  { id: 'noctis_first', npc: 'noctis', cond: { quest: { mq1: 'done' }, notFlag: 'met_noctis' }, convo: 'noctis_intro', banner: 'Someone is sitting on the edge of the locked bell tower — and waving at you.', anywhere: true },
  { id: 'cael_warning', npc: 'cael', cond: { quest: { mq3: 'active' }, met: 'cael', obj: { 'mq3.access': true } }, convo: 'cael_warning', banner: 'Cael crosses the street toward you, unsmiling.', needPresent: true },
  { id: 'seraphine_lullaby', npc: 'seraphine', cond: { quest: { mq1: 'done' }, phase: [3], loc: 'cathedral' }, convo: 'seraphine_lullaby', banner: 'From the bell tower, Seraphine is humming something you almost recognise.', needPresent: true },
  { id: 'evelyne_gossip', npc: 'evelyne', cond: { met: 'evelyne', chapterMin: 3, phase: [0, 1], loc: 'royal' }, convo: 'evelyne_gossip', banner: 'Evelyne waves her fan and hurries over, eyes bright with gossip.', needPresent: true },
  { id: 'lucien_cold', npc: 'lucien', cond: { mem: { lucien: 'insulted' }, notMem: { lucien: 'apologized' }, chapterMin: 4 }, convo: 'lucien_cold', banner: 'Lucien falls into step beside you without being asked.', needPresent: true },
];

// Conversations Astoria can overhear when two NPCs share a place.
export const OVERHEARD = [
  { loc: 'royal', phase: 0, npcs: ['evelyne', 'cael'], lines: ['Evelyne: "Captain, you look exhausted. Is it the roster again?"', 'Cael: "There were nine names on the night watch. Now there are eight lines filled in and one empty."', 'Evelyne: "Then you miscounted, darling. People don\'t simply vanish."'] },
  { loc: 'royal', phase: 0, npcs: ['lucien', 'cael'], lines: ['Lucien: "Captain. You\'ve requested access to the restricted archive again."', 'Cael: "Three of my guards are missing, my lord."', 'Lucien: "Missing implies someone remembers them. Request denied."'] },
  { loc: 'royal', phase: 1, npcs: ['evelyne', 'cael'], lines: ['Evelyne, too sweetly: "Walk with me, Captain? I\'m told the gardens are dangerous after noon."', 'Cael: "They aren\'t."', 'Evelyne: "Then you\'ll have nothing to do but talk to me."'] },
  { loc: 'cathedral', phase: 2, npcs: ['seraphine', 'cael'], lines: ['Cael: "Keeper. You were standing in this exact spot when I was a boy."', 'Seraphine: "I am often in this spot."', 'Cael: "You haven\'t aged a day."', 'Seraphine: "How kind of you to say."'] },
  { loc: 'library', phase: 1, npcs: ['lucien', 'noctis'], lines: ['Lucien, without looking up: "Get off that shelf."', 'Noctis: "You said that last time. And the time before. And in about four years."', 'Lucien: "...Get off the shelf."'] },
  { loc: 'ballroom', phase: 2, npcs: ['evelyne', 'noctis'], lines: ['Evelyne: "Who invited you?"', 'Noctis: "You did. Next spring. You were very gracious about it."'] },
];
