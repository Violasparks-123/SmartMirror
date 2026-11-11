// Evelyne — The Aristocrat. Sweet, charming, manipulative; her family keeps
// the guest lists, and a far older list besides.

export const EVELYNE = {
  intro: 'evelyne_intro',
  introCond: { quest: { mq2: 'started' } },
  notYet: 'The noblewoman glances at you over her fan, then turns back to her companions as though you were a draught.',
  smalltalk: ['evelyne_small_1', 'evelyne_small_2', 'evelyne_small_3'],

  story: [
    { cond: { quest: { mq8: 'active' }, flag: 'forgot_evelyne', notFlag: ['restored_evelyne', 'letgo_evelyne'] }, convo: 'ch8_stranger_evelyne', label: 'They don\'t know you' },
    { cond: { flag: ['forgot_evelyne', 'letgo_evelyne'] }, convo: 'stranger_again', label: 'A stranger now' },
    { cond: { quest: { mq8: 'active' }, obj: { 'mq8.evelyne': false }, notFlag: 'forgot_evelyne' }, convo: 'ch8_evelyne', label: 'Ask whose side she is on' },
    { cond: { quest: { nq_evelyne: 'active' }, obj: { 'nq_evelyne.find': true, 'nq_evelyne.return': false } }, convo: 'evelyne_cameo', label: 'About the cameo…' },
  ],

  topics: [
    { id: 'family', label: 'Ask about House Marchetti', cond: {}, convo: 'evelyne_family' },
    { id: 'royals', label: 'Ask about the royal family', cond: {}, convo: 'evelyne_royals' },
    { id: 'crest', label: 'Ask why the crest made her pale', cond: { flag: 'evelyne_saw_crest' }, convo: 'evelyne_crest', once: true },
    { id: 'liesel', label: 'Ask if she knows the name "Liesel"', cond: { quest: { hq_liesel: 'active' } }, convo: 'evelyne_liesel' },
    { id: 'accord', label: 'Ask about the Accord', cond: { mysteryOpen: 'myst_accord' }, convo: 'evelyne_accord' },
  ],

  secrets: [
    { id: 'report', label: 'What Mother Asks of Her', cond: { rel: { evelyne: { affinity: 30, trust: 20 } } }, convo: 'evelyne_secret' },
  ],

  show: {
    old_photograph: 'evelyne_show_photo',
    sealed_invitation: 'evelyne_show_invitation',
    evelyne_cameo: 'evelyne_cameo',
    default: 'evelyne_show_default',
  },

  gifts: {
    love: '"Maison Corvelle lace!" She pulls the gloves on at once and holds her hands up to the light. "You have taste. Dangerous taste. I adore you."',
    like: '"Oh, for me? You shouldn\'t have. No — you should have. Always."',
    neutral: '"How sweet! I\'ll put it somewhere special." She hands it to a passing maid.',
    dislike: '"Oh. It\'s… very you, darling." Her smile could cut glass.',
    again: '"Two gifts in one day? People will think you\'re courting me. Let them, honestly."',
  },

  convos: {
    evelyne_intro: {
      bg: 'royal',
      nodes: {
        start: {
          l: [
            ['n', 'A young noblewoman lowers her lace fan and looks you up and down with open, delighted interest.'],
            ['evelyne', '"Oh, it\'s you. The cathedral girl. Everyone\'s talking about you, you know. Come, walk with me! I\'m Evelyne Marchetti. You\'ll have heard of me."'],
            ['evelyne', '"Your dress is divine. So… antique. Wherever did you find it?"'],
          ],
          c: [
            { t: '"Thank you. Yours is lovely too."', path: 'compassionate', fx: { rel: { evelyne: { affinity: 5 } } }, l: [['evelyne', '"Isn\'t it? I\'ll introduce you to my dressmaker. She\'s a genius and a thief."']], to: 'mid' },
            { t: '"Is that a compliment, or are you fishing?"', path: 'suspicious', fx: { rel: { evelyne: { trust: 3, suspicion: 3 } } }, l: [['evelyne', 'Her smile sharpens into something genuine. "Both, darling. It\'s always both."']], to: 'mid' },
            { t: '"I don\'t have time for this."', path: 'aggressive', fx: { rel: { evelyne: { affinity: -3, rivalry: 5 } }, mem: { evelyne: 'snubbed' } }, l: [['evelyne', '"Nobody has time for anything. That\'s what makes it fashionable." She waves a hand. "Stay anyway."']], to: 'mid' },
            { t: 'Smile, and let her do the talking.', path: 'secretive', fx: { rel: { evelyne: { affinity: 3 } }, flag: 'evelyne_saw_crest' }, l: [['n', 'Evelyne talks. You listen. In twenty minutes you learn which duke is bankrupt, who is poisoning whose roses — and that when your sleeve slips and shows the edge of the sealed invitation, her fan stops dead for one heartbeat.']], to: 'mid' },
          ],
        },
        mid: {
          l: [
            ['evelyne', '"My family keeps the guest list for every royal occasion. Every ball, every coronation, every funeral, since the founding of Elaria."'],
            ['evelyne', '"You\'re not on any of them." She says it sweetly. "Isn\'t that strange? I\'d remember a face like yours."'],
          ],
          c: [
            { t: '"Maybe I\'m new."', l: [['evelyne', '"Maybe." She twirls her fan. "Nobody\'s new in Elaria, darling. We just forget them for a while."']], to: 'end' },
            { t: '"Maybe your lists are wrong."', path: 'aggressive', l: [['evelyne', 'Something flickers behind her eyes. "Our lists," she says, "are never wrong."']], fx: { rel: { evelyne: { suspicion: 4 } } }, to: 'end' },
            { t: '"Then help me get on one."', path: 'secretive', l: [['evelyne', 'She laughs, delighted. "Oh, I like you. Fine. I\'ll see what I can do. Don\'t say I never gave you anything."']], fx: { rel: { evelyne: { affinity: 3, trust: 2 } } }, to: 'end' },
          ],
        },
        end: {
          l: [['evelyne', '"Do come again. I\'m here most mornings, and in the gardens in the afternoon. Evenings, I\'m wherever the party is." She winks. "Which is wherever I am."']],
          fx: { met: 'evelyne', obj: 'mq2.evelyne', history: { evelyne: 'First met — she found you far more interesting than you expected.' }, log: 'Evelyne: "Nobody\'s new in Elaria, darling. We just forget them for a while."' },
          end: true,
        },
      },
    },

    evelyne_small_1: { nodes: { start: { l: [['evelyne', '"Lady Ashgrove wore yellow to the garden party. Yellow. At her age. I\'m not cruel, I\'m simply observant."']], c: [
      { t: '"That\'s a little cruel."', path: 'compassionate', l: [['evelyne', '"A little," she concedes. "But only to her face. Behind her back I\'m very kind."']], fx: { rel: { evelyne: { trust: 1 } } } },
      { t: '"What else have you observed?"', path: 'secretive', l: [['evelyne', 'Her eyes gleam. "That the advisor visited the cathedral district three nights this week. And that you live there. Hmm?"']], fx: { rel: { evelyne: { affinity: 2 } } } },
      { t: '"You don\'t have to perform for me, you know."', req: { rel: { evelyne: { trust: 12 } } }, cond: { notMem: { evelyne: 'saw_real' } }, l: [['n', 'Evelyne\'s fan stops mid-flutter.'], ['evelyne', '"Perform? Darling, I don\'t—" She stops. Lowers the fan. Without the smile her face is younger, and very tired.'], ['evelyne', '"Mother says a Marchetti is never off the stage." A small, real laugh. "Don\'t tell anyone you saw this. It would ruin me."']], fx: { rel: { evelyne: { trust: 6, affinity: 4 } }, mem: { evelyne: 'saw_real' } } },
    ] } } },
    evelyne_small_2: { nodes: { start: { l: [['evelyne', '"Mother says I smile too much. She says people trust a smile less the more often they see it."']], c: [
      { t: '"Is she right?"', path: 'suspicious', l: [['evelyne', '"Of course she\'s right. She\'s been right for sixty years. It\'s exhausting."']] },
      { t: '"I like your smile."', path: 'compassionate', l: [['evelyne', 'For a second the smile goes away entirely, and what\'s underneath is startled. Then it\'s back. "Flatterer."']], fx: { rel: { evelyne: { affinity: 3 } } } },
    ] } } },
    evelyne_small_3: { nodes: { start: { l: [['evelyne', '"Have you noticed nobody in Elaria ever talks about their great-grandparents? Mine have portraits, of course. But nobody remembers their names."']], c: [
      { t: '"Doesn\'t that bother you?"', l: [['evelyne', '"Darling, everything bothers me. I simply have the decency to look radiant about it."']] },
      { t: '"Whose names do you remember?"', path: 'suspicious', l: [['evelyne', '"Everyone\'s. That\'s my family\'s job." The fan flutters. "Well. Almost everyone\'s."']], fx: { rel: { evelyne: { suspicion: 2 } } } },
    ] } } },

    evelyne_family: { nodes: { start: { l: [['evelyne', '"House Marchetti. Keepers of the guest list. It sounds frivolous, doesn\'t it? It isn\'t. Whoever controls who is invited controls who is remembered."'], ['evelyne', '"Mother taught me that before she taught me to read."']], end: true } } },
    evelyne_royals: { nodes: { start: { l: [['evelyne', '"The king is kind and forgetful. The queen is clever and forgetful. The princes are charming and, well." She taps her temple. "Forgetful. It runs in the family."'], ['evelyne', '"I was nearly engaged to the second prince once. He forgot. So did I, mostly. Isn\'t that romantic?"']], fx: { rel: { evelyne: { trust: 1 } } }, end: true } } },
    evelyne_crest: { nodes: { start: { l: [['a', '"When you saw the seal on my invitation, you went pale."'], ['evelyne', '"Did I?" A long, careful pause. "It\'s a costume crest, surely. People invent them for masquerades."'], ['evelyne', '"…My grandmother had a nightmare about that crest every night of her life. She\'d wake up saying \'we promised, we promised.\' I used to think it was sweet."']], fx: { rel: { evelyne: { trust: 3 } }, mystery: 'myst_accord' }, end: true } } },
    evelyne_liesel: { nodes: { start: { l: [['evelyne', '"Liesel?" She frowns, genuinely. "No. Should I? There\'s a Liesel on one of the oldest guest lists, I think — but the surname\'s been blotted out. Ink spill." She doesn\'t sound like she believes it.']], fx: { obj: 'hq_liesel.ask' }, end: true } } },
    evelyne_accord: { nodes: { start: { l: [['evelyne', '"The Accord?" She laughs too quickly. "A tiresome old agreement between the great houses about seating plans."'], ['n', 'She is lying. You can tell because, for once, she isn\'t smiling.']], c: [
      { cond: { mem: { evelyne: 'spared_alcove' } }, t: '"You told me the truth once. You can do it again."', l: [['evelyne', 'She closes the fan. "Seven houses. One promise. Three hundred years. That\'s all I can say here, Astoria. People are listening. People are always listening."']], fx: { rel: { evelyne: { trust: 4 } } } },
      { t: '"Seating plans. Of course."', path: 'secretive', l: [['evelyne', '"Of course," she agrees, relieved, and hates herself a little for it.']] },
    ] } } },

    evelyne_cameo: {
      nodes: {
        start: {
          l: [['n', 'You hold Evelyne\'s ivory cameo. Inside: a tiny painted girl with silver-lavender hair, and the words "Forgive us."']],
          c: [
            { t: 'Return it and say nothing about what\'s inside.', path: 'compassionate', l: [['evelyne', 'She snatches it, then catches herself and takes your hand instead. "Thank you. It was my grandmother\'s. I don\'t know why I carry it." She does know. You both know.']], fx: { take: { evelyne_cameo: 1 }, obj: 'nq_evelyne.return', rel: { evelyne: { affinity: 10, trust: 8 } }, mem: { evelyne: 'returned_cameo' }, history: { evelyne: 'Returned her cameo without asking.' } } },
            { t: 'Return it — and ask about the girl inside.', path: 'suspicious', l: [['evelyne', '"You opened it." Her voice is very small. "Every Marchetti daughter carries one. We\'re told to carry it so we never forget to forget her. Isn\'t that the stupidest thing you\'ve ever heard?"'], ['evelyne', '"She looks like you, Astoria. She looks exactly like you."']], fx: { take: { evelyne_cameo: 1 }, obj: 'nq_evelyne.return', rel: { evelyne: { trust: 10, suspicion: 4 } }, mystery: 'myst_accord', mem: { evelyne: 'asked_cameo' }, history: { evelyne: 'Asked about the girl inside her cameo.' } } },
            { t: 'Tell her you couldn\'t find it. Keep it.', path: 'secretive', l: [['evelyne', '"Oh." The disappointment is real; so is the suspicion that follows it. "Never mind. It was only a trinket."'], ['n', 'The cameo is warm in your pocket for the rest of the day.']], fx: { obj: 'nq_evelyne.return', rel: { evelyne: { rivalry: 8, suspicion: 10 } }, mem: { evelyne: 'kept_cameo' }, path: 'secretive', history: { evelyne: 'Claimed you never found her cameo.' } } },
          ],
        },
      },
    },

    evelyne_secret: {
      nodes: {
        start: {
          l: [
            ['n', 'Evelyne draws you into an empty corner of the gardens and lowers her voice.'],
            ['evelyne', '"Mother asked me to befriend you. To report where you go and who you speak to. I\'ve been doing it since the day we met."'],
            ['evelyne', '"I\'m telling you because I stopped wanting to. That\'s never happened to me before. I don\'t like it."'],
          ],
          c: [
            { t: '"Then report what I tell you to report."', path: 'secretive', l: [['evelyne', 'Slowly, she smiles — a real one. "Oh, darling. Now we\'re friends."']], fx: { rel: { evelyne: { affinity: 8, trust: 10, friendship: 8 } }, flag: 'evelyne_double_agent' } },
            { t: '"Thank you for telling me."', path: 'compassionate', l: [['evelyne', '"Don\'t thank me. I\'m terrible." She squeezes your hand anyway.']], fx: { rel: { evelyne: { affinity: 8, trust: 8, friendship: 6 } } } },
            { t: '"Get away from me."', path: 'aggressive', l: [['evelyne', 'She goes white. Then, very carefully, she curtsies and walks away. She does not look back.']], fx: { rel: { evelyne: { affinity: -10, rivalry: 12 } }, avoid: { evelyne: 2 }, mem: { evelyne: 'argued' } } },
          ],
          fx: { history: { evelyne: 'Confessed she has been reporting on you.' } },
        },
      },
    },

    evelyne_show_photo: { nodes: { start: { l: [['n', 'Evelyne takes the photograph — and drops it, as if it burned.'], ['evelyne', '"Where did you— " She recovers instantly. "Dreadful photograph. The lighting. Put it away, darling, before someone asks you where you got it."'], ['n', 'Her hands are shaking.']], fx: { obj: 'mq3.show', memory: 'mem_photograph:reaction', rel: { evelyne: { suspicion: 5 } } }, end: true } } },
    evelyne_show_invitation: { nodes: { start: { l: [['evelyne', '"Put that away," she says, smiling brightly for anyone watching. "Right now. Please."']], fx: { flag: 'evelyne_saw_crest' }, end: true } } },
    evelyne_show_default: { nodes: { start: { l: [['evelyne', '"How quaint! Is it an heirloom? Everything you own looks like an heirloom."']], end: true } } },

    evelyne_gossip: {
      nodes: {
        start: {
          l: [['evelyne', '"Darling! Have you heard? Someone was seen climbing the cathedral bell tower at midnight. Silver hair. People are saying ghosts." She leans in. "Was it you? Say it was you."']],
          c: [
            { t: '"It was me."', l: [['evelyne', '"I knew it!" She looks thrilled, and then, quietly, worried. "Be careful who sees you, Astoria. Some people in this city are paid to notice things."']], fx: { rel: { evelyne: { trust: 2 } } } },
            { t: '"Ghosts, probably."', path: 'secretive', l: [['evelyne', '"Ghosts." She taps your nose with her fan. "Liar. I love it."']], fx: { rel: { evelyne: { affinity: 2 } } } },
          ],
        },
      },
    },
  },
};
