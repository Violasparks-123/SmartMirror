// Quest definitions. Objectives complete through effects ({ obj: 'quest.objective' })
// fired by hotspots, dialogue, letters and items. A quest finishes automatically
// when its required objectives are done. `target` powers the "Go" buttons.

export const QUEST_TYPES = {
  main: 'Main Story', npc: 'Character', side: 'Side', hidden: 'Hidden', event: 'Event',
};

export const QUESTS = {
  // ================= MAIN STORY =================
  mq1: {
    type: 'main', chapter: 1, chapterTitle: 'The Awakening',
    question: 'Who am I?', endScene: 'ch1_laugh',
    recap: 'You woke on the cathedral altar with nothing but your name, and a laugh that belonged to someone else. Marta knew it.',
    title: 'The Lost Invitation',
    desc: 'Explore the old cathedral and uncover the truth…',
    loc: 'cathedral', giver: 'seraphine', thumb: 'assets/img/quest_thumb.jpg',
    objectives: [
      { id: 'altar', text: 'Examine the ancient altar', target: { loc: 'cathedral', hs: 'altar' } },
      { id: 'seraphine', text: 'Speak with the cathedral keeper', target: { npc: 'seraphine' } },
      { id: 'belltower', text: 'Climb the bell tower and look upon Elaria', target: { loc: 'cathedral', hs: 'belltower' } },
    ],
    rewards: { exp: 140, crowns: 200, moonstones: 60 },
    complete: { speaker: 'seraphine', lines: ['"The city is awake now," Seraphine says from the stair below. "It has noticed you."', '"Be careful who you show that invitation to. Elaria has a long memory for things it pretends to forget."'] },
    onComplete: { start: 'mq2', chapter: 2, letter: 'letter_lucien_1', offer: 'nq_seraphine' },
  },

  mq2: {
    type: 'main', chapter: 2, chapterTitle: 'The Royal Invitation',
    question: 'Why does the palace want me?', endScene: 'ch2_lieutenant',
    recap: 'Cael\'s lieutenant, Edric, vanished overnight, and that night you dreamt his wedding. The people who disappear end up inside you.',
    title: 'The Royal Invitation',
    desc: 'Someone at the palace wants to know how you came by a three-hundred-year-old seal. Answer the summons — and meet the people who run Elaria.',
    loc: 'royal', giver: 'lucien',
    objectives: [
      { id: 'letter', text: 'Read the letter that arrived for you', target: { screen: 'letters' } },
      { id: 'lucien', text: 'Meet Lucien at the palace entrance (Morning)', target: { npc: 'lucien' } },
      { id: 'evelyne', text: 'Make the acquaintance of Evelyne', target: { npc: 'evelyne' } },
      { id: 'cael', text: 'Speak with the guard captain, Cael', target: { npc: 'cael' } },
    ],
    rewards: { exp: 200, crowns: 300, moonstones: 80 },
    complete: { speaker: 'narr', lines: ['Three people. Three versions of the same warning: the crest on your invitation belongs to no family anyone remembers.', 'If the answers exist anywhere, they are in the Forgotten Library — in the archive no one is allowed to enter.'] },
    onComplete: { start: 'mq3', chapter: 3, discover: 'library', mystery: 'myst_guards' },
  },

  mq3: {
    type: 'main', chapter: 3, chapterTitle: 'The Forgotten Library',
    question: 'Where do the vanished go?', endScene: 'ch3_witness',
    recap: 'The Accord\'s violet ledger records every name ever sold. The first, three hundred years ago, was a bell-singer who paid for herself.',
    title: 'The Forgotten Library',
    desc: 'The library holds the records from before the Moonfall. The restricted archive holds the ones someone wanted hidden.',
    loc: 'library',
    objectives: [
      { id: 'enter', text: 'Visit the Forgotten Library', target: { loc: 'library' } },
      { id: 'access', text: 'Find a way into the restricted archive', target: { loc: 'library', hs: 'restricted' }, note: 'There is more than one way in: a pass, a key, a companion — or a secret.' },
      { id: 'search', text: 'Search the restricted archive', target: { loc: 'library', hs: 'restricted' } },
      { id: 'show', text: 'Show the photograph to someone you trust (or don\'t)', target: { screen: 'characters' } },
    ],
    rewards: { exp: 260, crowns: 350, moonstones: 100 },
    complete: { speaker: 'narr', lines: ['That evening a gilt-edged envelope is slipped under the cathedral door.', 'It smells of rose perfume.'] },
    onComplete: { start: 'mq4', chapter: 4, letter: 'letter_evelyne_masq' },
  },

  mq4: {
    type: 'main', chapter: 4, chapterTitle: 'The Velvet Masquerade',
    question: 'Who runs the trade?', endScene: 'ch4_request',
    recap: 'At the masquerade three hundred guests bowed to you. They know what you are. Evelyne asked you to take something out of her.',
    title: 'The Velvet Masquerade',
    desc: 'House Marchetti\'s masquerade gathers every noble in Elaria under one roof. Masks make people careless.',
    loc: 'ballroom',
    objectives: [
      { id: 'letter', text: 'Read Evelyne\'s invitation', target: { screen: 'letters' } },
      { id: 'attend', text: 'Attend the masquerade at the Velvet Ballroom (Evening or Night)', target: { loc: 'ballroom', hs: 'floor' } },
      { id: 'dance', text: 'Choose a dance partner', target: { loc: 'ballroom', hs: 'floor' } },
      { id: 'secret', text: 'Discover what is said behind the curtain', target: { loc: 'ballroom', hs: 'alcove' } },
    ],
    rewards: { exp: 320, crowns: 400, moonstones: 120 },
    complete: { speaker: 'narr', lines: ['You walk home through streets empty of everyone but the moon.', 'In the morning there is a letter on your pillow. The window was locked. The letter is slightly damp.'] },
    onComplete: { start: 'mq5', chapter: 5, letter: 'letter_noctis_woods', discover: 'woods', mystery: 'myst_accord' },
  },

  mq5: {
    type: 'main', chapter: 5, chapterTitle: 'The Whispering Woods',
    question: 'Whose memories are these?', endScene: 'ch5_burden',
    recap: 'None of the memories inside you are yours. Noctis has carried Hollowmere\'s two hundred and six for three hundred years.',
    title: 'The Whispering Woods',
    desc: 'Noctis says a path into the woods only shows itself to the moon. Beyond it, something was forgotten on purpose.',
    loc: 'woods',
    objectives: [
      { id: 'letter', text: 'Read the damp letter', target: { screen: 'letters' } },
      { id: 'path', text: 'Find the hidden path (Evening or Night)', target: { loc: 'woods', hs: 'path' } },
      { id: 'search', text: 'Search the cottages of the abandoned settlement', target: { loc: 'woods', hs: 'settlement' } },
      { id: 'noctis', text: 'Speak with Noctis among the ruins', target: { loc: 'woods', hs: 'settlement' } },
    ],
    rewards: { exp: 380, crowns: 450, moonstones: 140 },
    complete: { speaker: 'noctis', lines: ['"You know where to go next," Noctis says. "You\'ve already been. You just haven\'t looked at the right wall."', '"The library. The portraits. Bring the ledger."'] },
    onComplete: { start: 'mq6', chapter: 6, mystery: 'myst_hollowmere', offer: 'nq_noctis' },
  },

  mq6: {
    type: 'main', chapter: 6, chapterTitle: 'The Portrait',
    question: 'Was I ever a person?', endScene: 'ch6_confession',
    recap: 'The portrait has your face. Lucien built the rite that made you a vault, and wrote the words that keep you empty.',
    title: 'The Portrait',
    desc: 'The ledger names a girl who sang to the bells. Somewhere in the library\'s portrait collection, someone painted her.',
    loc: 'library',
    objectives: [
      { id: 'gallery', text: 'Search the portrait collection with the Hollowmere ledger', target: { loc: 'library', hs: 'portraits' } },
      { id: 'portrait', text: 'Uncover the veiled portrait', target: { loc: 'library', hs: 'portraits' } },
      { id: 'confide', text: 'Decide who, if anyone, to tell', target: { loc: 'library', hs: 'portraits' } },
    ],
    rewards: { exp: 500, crowns: 600, moonstones: 200 },
    complete: { speaker: 'narr', lines: ['The moon is very bright tonight. It has been very bright for three hundred years.', 'For the first time, it occurs to you that it might be looking for something.'] },
    onComplete: { start: 'mq7', chapter: 7, mystery: 'myst_portrait' },
  },

  mq7: {
    type: 'main', chapter: 7, chapterTitle: 'Beneath the Cathedral',
    question: 'What did I agree to?', endScene: 'ch7_duchess',
    recap: 'Beneath the cathedral you saw the night you volunteered to hold everything. Seraphine placed every memory inside you with her own hands.',
    title: 'Beneath the Cathedral',
    desc: 'The iron door under the cathedral has opened on its own. Whatever is down there has been waiting three hundred years.',
    loc: 'cathedral',
    objectives: [
      { id: 'descend', text: 'Go down through the sealed door', target: { loc: 'cathedral', hs: 'chamber' } },
      { id: 'seraphine', text: 'Ask Seraphine what she did', target: { npc: 'seraphine' } },
      { id: 'reliquary', text: 'Decide what to do with the reliquary', target: { loc: 'cathedral', hs: 'chamber' } },
    ],
    rewards: { exp: 560, crowns: 650, moonstones: 220 },
    complete: { speaker: 'narr', lines: ['Three nights to the eclipse.', 'For the first time, you know exactly what the moon is looking for.'] },
    onComplete: { start: 'mq8', chapter: 8 },
  },

  mq8: {
    type: 'main', chapter: 8, chapterTitle: 'The Accord',
    question: 'Who will stand with me?', startScene: 'ch8_sold', endScene: 'ch8_eclipse',
    recap: 'The Accord sold your closest companion\'s memories of you, and the Duchess offered you a bargain: sleep, and no name is sold for thirty years.',
    title: 'The Accord',
    desc: 'The Duchess has made it personal. Someone you love no longer knows you, and the eclipse is a day away.',
    loc: 'royal',
    objectives: [
      { id: 'find', text: 'Find the one who no longer knows you', target: { screen: 'characters' }, note: 'Talk to them wherever they are.' },
      { id: 'evelyne', text: 'Learn whose side Evelyne is on', target: { npc: 'evelyne' } },
      { id: 'bargain', text: 'Answer the Duchess\'s summons at the palace', target: { loc: 'royal', hs: 'palace' } },
      { id: 'aeria', text: 'Go down to Aeria in the cove beneath the cathedral', target: { loc: 'cathedral', hs: 'draught' }, note: 'Behind the prayer alcove, a cold flagstone.' },
    ],
    rewards: { exp: 620, crowns: 700, moonstones: 240 },
    complete: { speaker: 'narr', lines: ['Every bell in Elaria hangs still.', 'There is one thing left to decide.'] },
    onComplete: { start: 'mq9', chapter: 9, solve: 'myst_accord' },
  },

  mq9: {
    type: 'main', chapter: 9, chapterTitle: 'The Eclipse',
    question: 'What do I owe them?', noSheet: true,
    title: 'The Eclipse',
    desc: 'The moon has swallowed the sun. Everyone you have kept, and everyone you have given back, is waiting at the top of the bell tower.',
    loc: 'cathedral',
    objectives: [
      { id: 'tower', text: 'Climb the bell tower', target: { loc: 'cathedral', hs: 'belltower' } },
    ],
    rewards: { exp: 800, crowns: 1000, moonstones: 300 },
  },

  // ================= CHARACTER QUESTS =================
  nq_seraphine: {
    type: 'npc', npc: 'seraphine', title: 'The Silent Bell',
    desc: 'The cathedral bell has twelve strokes in it. Every midnight it rings thirteen. Seraphine wants to know who rings the last.',
    loc: 'cathedral',
    offer: { npc: 'seraphine', cond: { quest: { mq1: 'done' } }, text: '"Every midnight the bell rings thirteen times. It has only twelve strokes in it. Will you listen for me — and tell me who rings the last?"' },
    objectives: [
      { id: 'listen', text: 'Climb the bell tower at Night and listen', target: { loc: 'cathedral', hs: 'belltower' } },
      { id: 'ask', text: 'Ask Noctis about the thirteenth toll', target: { npc: 'noctis' } },
      { id: 'return', text: 'Tell Seraphine what you learned', target: { npc: 'seraphine' } },
    ],
    rewards: { exp: 180, crowns: 150, rel: { seraphine: { affinity: 10, trust: 10 } }, outfit: 'cathedral_vestment', flag: 'seraphine_night_known', partyOk: 'seraphine' },
    complete: { speaker: 'seraphine', lines: ['"The moon rings it," she repeats softly. "Of course it does. It is counting someone it has not finished forgetting."', 'She presses folded silver-grey robes into your hands. "These were made for the keeper\'s apprentice. No one has worn them in a very long time."', '"And — child. Some nights I walk to the old shrine in the woods. If you cannot find me, look there."'] },
  },

  nq_lucien: {
    type: 'npc', npc: 'lucien', title: 'The Unsent Letters',
    desc: 'Lucien wants a packet retrieved from beneath the palace balcony before Evelyne finds it. He would prefer you not ask what is inside.',
    loc: 'royal',
    offer: { npc: 'lucien', cond: { quest: { mq3: 'done' }, rel: { lucien: { trust: 15 } } }, text: '"I require a favour. There is a packet hidden in the planter beneath the palace balcony. Retrieve it — in the evening, when the guard changes — and bring it to me unopened. Unopened, Astoria."' },
    objectives: [
      { id: 'find', text: 'Search beneath the palace balcony (Evening)', target: { loc: 'royal', hs: 'balcony' } },
      { id: 'decide', text: 'Decide what to do with the letters', target: { npc: 'lucien' } },
    ],
    rewards: { exp: 220, crowns: 200, flag: 'lucien_night_known', solve: 'myst_lucien_night' },
    complete: { speaker: 'lucien', lines: ['"There." Lucien says it as if closing a ledger. "Now you know one thing about me that no one else does."', '"If you must follow me at night — and you will — I go beneath the cathedral. Do not come down the stairs."'] },
  },

  nq_evelyne: {
    type: 'npc', npc: 'evelyne', title: 'The Lost Cameo',
    desc: 'Evelyne lost an ivory cameo in the Whispering Woods — somewhere she says she has never been.',
    loc: 'woods',
    offer: { npc: 'evelyne', cond: { quest: { mq4: 'started' }, rel: { evelyne: { affinity: 12 } } }, text: '"Darling, a teeny favour. I lost a cameo. In the woods. Don\'t ask what I was doing in the woods — I wasn\'t. An abandoned cottage, I think. Afternoon light. Would you?"' },
    objectives: [
      { id: 'find', text: 'Search the abandoned cottage in the woods (Afternoon)', target: { loc: 'woods', hs: 'cottage' } },
      { id: 'return', text: 'Decide what to do with the cameo', target: { npc: 'evelyne' } },
    ],
    rewards: { exp: 200, crowns: 250, item: { acc_lace_choker: 1 }, outfit: 'lace_choker', partyOk: 'evelyne' },
    complete: { speaker: 'evelyne', lines: ['Evelyne fastens a lace choker around your throat before you can protest. "There. Now we match. Well — we would, if I wore anything that sensible."'] },
  },

  nq_cael: {
    type: 'npc', npc: 'cael', title: 'Names on the Roster',
    desc: 'Nine watchmen on the night roster. Eight names. Cael wants to know who the ninth was.',
    loc: 'royal',
    offer: { npc: 'cael', cond: { quest: { mq2: 'done' }, rel: { cael: { affinity: 8 } } }, text: '"There\'s a blank line on the night roster. Line nine. I\'ve stared at it for a month. Walk the night watch with me? Maybe fresh eyes will see what mine can\'t."' },
    objectives: [
      { id: 'roster', text: 'Examine the roster at guard headquarters', target: { loc: 'royal', hs: 'guardhq' } },
      { id: 'token', text: 'Search the forest edge at Night', target: { loc: 'woods', hs: 'edge' } },
      { id: 'return', text: 'Bring what you found to Cael', target: { npc: 'cael' } },
    ],
    rewards: { exp: 220, crowns: 250, rel: { cael: { affinity: 10, trust: 10 } }, partyOk: 'cael', memory: 'mem_guard:token' },
    complete: { speaker: 'cael', lines: ['Cael turns the token over in his fingers. "Tobias," he says suddenly. "His name was — " He stops. The word is gone from his face like breath from glass.', '"I\'ll remember," he says, very quietly. "I\'ll write it down every morning if I have to." He looks at you. "Whatever you\'re walking into — you won\'t walk into it alone. Call on me."'] },
  },

  nq_noctis: {
    type: 'npc', npc: 'noctis', title: 'Tomorrow\'s Echo',
    desc: 'Noctis has made an appointment with you. He made it, he says, years ago.',
    loc: 'royal',
    offer: { npc: 'noctis', cond: { met: 'noctis', chapterMin: 3 }, text: '"Meet me where the water forgets, when the moon is highest. You will. You already did. I\'m just reminding you."' },
    objectives: [
      { id: 'fountain', text: 'Go "where the water forgets, when the moon is highest"', target: { loc: 'royal', hs: 'fountain' }, note: 'The fountain square, at Night.' },
    ],
    rewards: { exp: 200, moonstones: 120, partyOk: 'noctis', memory: 'mem_noctis:fountain' },
    complete: { speaker: 'noctis', lines: ['"Thank you for coming," Noctis says. "I mean it. You\'re the only one who ever does."', '"If you want company — the walking kind, not the haunting kind — I\'m around. Obviously."'] },
  },

  // ================= SIDE QUESTS =================
  sq_violets: {
    type: 'side', title: 'Violets for the Altar',
    desc: 'Seraphine asked for three glowing moonveil blooms from the Whispering Woods.',
    loc: 'cathedral', giver: 'seraphine',
    objectives: [
      { id: 'gather', text: 'Gather 3 moonveil blooms in the Whispering Woods', target: { loc: 'woods', hs: 'flowers' }, count: { item: 'moonveil_bloom', n: 3 } },
      { id: 'offer', text: 'Lay the blooms on the cathedral altar', target: { loc: 'cathedral', hs: 'altar' } },
    ],
    rewards: { exp: 120, crowns: 180, item: { pressed_violet: 1 }, rel: { seraphine: { affinity: 6 } } },
    complete: { speaker: 'seraphine', lines: ['The blooms brighten when they touch the altar stone — and for a moment, so does the eclipse window above.', '"They remember the old cathedral," Seraphine says. "When it was full of light. They are trying to show you."'] },
  },

  sq_pages: {
    type: 'side', title: 'Missing Pages',
    desc: 'Someone tore pages out of the official history of the Moonfall and scattered them across Elaria.',
    loc: 'library',
    objectives: [
      { id: 'p1', text: 'Find the torn page in the cathedral prayer rooms', target: { loc: 'cathedral', hs: 'prayer' } },
      { id: 'p2', text: 'Find the torn page at the Rosewater Café', target: { loc: 'royal', hs: 'cafe' } },
      { id: 'p3', text: 'Find the torn page in an abandoned cottage', target: { loc: 'woods', hs: 'cottage' } },
    ],
    rewards: { exp: 180, crowns: 220, moonstones: 60 },
    complete: { speaker: 'narr', lines: ['Laid side by side, the three pages tell a different story from the book they were torn from.', '"The Veiling was performed at the Cathedral of Eclipses by the seven houses, with the consent of the one who was veiled." The rest is water-damaged.'] },
    onComplete: { mystery: 'myst_moonfall' },
  },

  // ================= HIDDEN QUESTS =================
  sq_aeria: {
    type: 'side', title: 'The Song Beneath',
    desc: 'A siren named Aeria is chained in a hidden cove beneath the cathedral. She says Lucien loved her, left her for a girl who sang to bells, and put her there.',
    loc: 'cove',
    objectives: [
      { id: 'ask', text: 'Ask Lucien about Aeria', target: { npc: 'lucien' } },
      { id: 'return', text: 'Go back down to Aeria', target: { loc: 'cove', hs: 'rock' } },
    ],
    rewards: { exp: 180, crowns: 200 },
    complete: { speaker: 'narr', lines: ['Two stories about the same night.', 'Only one of them can be the whole truth.'] },
  },

  hq_liesel: {
    type: 'hidden', title: 'A Name in the Water',
    desc: 'A coin from the fountain bears the name of someone nobody remembers.',
    loc: 'royal',
    objectives: [
      { id: 'coin', text: 'Find the coin in the fountain', target: { loc: 'royal', hs: 'fountain' } },
      { id: 'ask', text: 'Ask someone in the Royal District about "Liesel"', target: { npc: 'cael' } },
    ],
    rewards: { exp: 140, moonstones: 80, memory: 'mem_liesel:who' },
    complete: { speaker: 'narr', lines: ['You drop the coin back into the fountain. It sinks slowly, as if the water were reluctant to take it.'] },
  },

  hq_fairytale: {
    type: 'hidden', title: 'The Girl Who Was Unremembered',
    desc: 'A children\'s story ends with an instruction: find the shrine in the wood and leave her a flower.',
    loc: 'woods',
    objectives: [
      { id: 'bloom', text: 'Bring a moonveil bloom to the ancient shrine in the woods', target: { loc: 'woods', hs: 'shrine' } },
    ],
    rewards: { exp: 160, moonstones: 100, item: { eclipse_lantern: 1 } },
    complete: { speaker: 'narr', lines: ['The bloom does not wilt when you lay it down. Instead the shrine\'s moss parts to show a lantern, burning a flame the colour of an eclipse.', 'Someone left it here for whoever remembered.'] },
  },
};

// Small daily activities that reset each in-game day.
export const DAILY = [
  { id: 'candles', title: 'Light the cathedral candles', loc: 'cathedral', hs: 'candles', rewards: { exp: 25, crowns: 40, moonstones: 10 } },
  { id: 'moonveil', title: 'Gather moonveil in the Whispering Woods', loc: 'woods', hs: 'flowers', rewards: { exp: 25, crowns: 40, moonstones: 10 }, cond: { discovered: 'woods' } },
  { id: 'garden_moonveil', title: 'Find the moonveil in the Moonlit Garden', loc: 'garden', hs: 'bloom', rewards: { exp: 20, crowns: 30, moonstones: 10 }, cond: { discovered: 'garden' } },
  { id: 'tea', title: 'Take tea at the Rosewater Café', loc: 'royal', hs: 'cafe', rewards: { exp: 25, crowns: 20, moonstones: 15 }, cond: { discovered: 'royal' } },
];
