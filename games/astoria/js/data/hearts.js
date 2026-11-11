// Heart-to-Hearts: three private scenes per companion that show who they are
// when nobody is watching. They unlock with closeness and with the story, and
// finishing all three opens that companion's hidden ending at the bell tower.
//
// Also here: the glossary (tap a highlighted word in dialogue) and the primer
// ("How Elaria works") shown after the prologue.

const HEART = (id, n) => ({ flag: `heart_${id}_${n}` });

export const HEARTS = {
  lucien: [
    { n: 1, title: 'The Last Dance', cond: { rel: { lucien: { affinity: 8 } } }, hint: 'Get a little closer to Lucien', convo: 'heart_lucien_1' },
    { n: 2, title: 'The Hand in the Grimoire', cond: { rel: { lucien: { affinity: 20 } }, chapterMin: 4 }, hint: 'Closer to Lucien · Chapter 4', convo: 'heart_lucien_2' },
    { n: 3, title: 'The One He Finished', cond: { rel: { lucien: { affinity: 35, trust: 20 } }, chapterMin: 6 }, hint: 'Lucien trusts you · Chapter 6', convo: 'heart_lucien_3' },
  ],
  evelyne: [
    { n: 1, title: 'Everyone\'s Favourite Things', cond: { rel: { evelyne: { affinity: 8 } } }, hint: 'Get a little closer to Evelyne', convo: 'heart_evelyne_1' },
    { n: 2, title: 'Ink on Her Cuffs', cond: { rel: { evelyne: { affinity: 20 } }, chapterMin: 4 }, hint: 'Closer to Evelyne · Chapter 4', convo: 'heart_evelyne_2' },
    { n: 3, title: 'The Duchess\'s Daughter', cond: { rel: { evelyne: { affinity: 35, trust: 20 } }, chapterMin: 6 }, hint: 'Evelyne trusts you · Chapter 6', convo: 'heart_evelyne_3' },
  ],
  cael: [
    { n: 1, title: 'Every Name, Every Night', cond: { rel: { cael: { affinity: 8 } } }, hint: 'Get a little closer to Cael', convo: 'heart_cael_1' },
    { n: 2, title: 'A Place Set for Liesel', cond: { rel: { cael: { affinity: 20 } }, chapterMin: 3 }, hint: 'Closer to Cael · Chapter 3', convo: 'heart_cael_2' },
    { n: 3, title: 'Off Duty', cond: { rel: { cael: { affinity: 35, trust: 20 } }, chapterMin: 6 }, hint: 'Cael trusts you · Chapter 6', convo: 'heart_cael_3' },
  ],
  seraphine: [
    { n: 1, title: 'A Violet for Each', cond: { rel: { seraphine: { affinity: 8 } } }, hint: 'Get a little closer to Seraphine', convo: 'heart_seraphine_1' },
    { n: 2, title: 'What She Paid', cond: { rel: { seraphine: { affinity: 20 } }, chapterMin: 4 }, hint: 'Closer to Seraphine · Chapter 4', convo: 'heart_seraphine_2' },
    { n: 3, title: 'All Three Notes', cond: { rel: { seraphine: { affinity: 35, trust: 20 } }, chapterMin: 7 }, hint: 'Seraphine trusts you · Chapter 7', convo: 'heart_seraphine_3' },
  ],
  noctis: [
    { n: 1, title: 'Guess What Happens Next', cond: { rel: { noctis: { affinity: 8 } } }, hint: 'Get a little closer to Noctis', convo: 'heart_noctis_1' },
    { n: 2, title: 'A Dog Called Biscuit', cond: { rel: { noctis: { affinity: 20 } }, chapterMin: 5 }, hint: 'Closer to Noctis · Chapter 5', convo: 'heart_noctis_2' },
    { n: 3, title: 'Every Ending But One', cond: { rel: { noctis: { affinity: 35 } }, chapterMin: 6 }, hint: 'Noctis is fond of you · Chapter 6', convo: 'heart_noctis_3' },
  ],
};

// Each heart scene ends by marking itself; the third also marks the promise.
const done = (id, n, extra = {}) => ({ flag: [`heart_${id}_${n}`, ...(n === 3 ? [`heart_${id}`] : [])], ...extra });

export const HEART_CONVOS = {
  // ======================================================== LUCIEN
  heart_lucien_1: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'The palace is holding a small dance tonight. Lucien is not dancing. He is standing in a window bay with a glass he has not drunk from, watching the floor like a man counting.'],
          ['a', '"You could ask someone, you know. They\'re not going to bite."'],
          ['lucien', '"They might. Half of them owe me money." He doesn\'t look away from the dancers. "I don\'t dance."'],
          ['a', '"Can\'t, or won\'t?"'],
          ['lucien', 'A long pause. "The last time I danced, it was a reel, at a harvest supper. I danced with a woman called Hester who trod on my feet and laughed about it the whole way through."'],
          ['lucien', '"In the morning, nobody at the supper remembered her. Not her husband. Not her children. Only me."'],
          ['n', 'He finally drinks.'],
          ['lucien', '"So, no. I don\'t dance. It seems to be bad luck for my partners."'],
        ],
        c: [
          { t: 'Hold out your hand. "I\'ll risk it."', path: 'compassionate', fx: done('lucien', 1, { rel: { lucien: { affinity: 6, trust: 3 } }, romanceHint: 'lucien' }), l: [
            ['lucien', 'He looks at your hand as if it were a contract with very small print.'],
            ['lucien', '"You are," he says, "the single most reckless person in this kingdom." He takes it anyway.'],
            ['n', 'He dances well, and stiffly, and he does not once take his eyes off your face, as if he is memorising it in case.'],
          ], to: 'end' },
          { t: '"You remembered her. That\'s not nothing."', path: 'compassionate', fx: done('lucien', 1, { rel: { lucien: { affinity: 4, trust: 5 } } }), l: [
            ['lucien', '"It\'s exactly nothing. A memory with nowhere to go." He sets down the glass. "Though I suppose it\'s somewhere, if it\'s in me."'],
          ], to: 'end' },
          { t: '"Convenient excuse for a man with two left feet."', path: 'aggressive', fx: done('lucien', 1, { rel: { lucien: { affinity: 2, rivalry: 4 } } }), l: [
            ['lucien', 'The corner of his mouth moves. It might be the first real smile you have seen on him.'],
            ['lucien', '"Both of them are perfectly right, thank you."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Lucien remembers the people the city forgets. He has been doing it alone for a very long time.']], end: true },
    },
  },

  heart_lucien_2: {
    bg: 'library',
    nodes: {
      start: {
        l: [
          ['n', 'You find Lucien in the library after closing, a book open in front of him that he is not reading. You know the binding. Violet leather. The Shadow Grimoire.', { item: 'shadow_grimoire' }],
          ['n', 'You find Lucien in the library after closing, a black book open in front of him that he is not reading. Violet leather, a younger hand inside.', { notItem: 'shadow_grimoire' }],
          ['lucien', '"Do you know what\'s worse than being a monster? Being a monster with very good handwriting."'],
          ['lucien', '"I was twenty-four. Hollowmere had a plague year, then a famine year, then a war year. Grief was eating the valley alive. I thought: what if the moon could carry it for us? What if nobody ever had to remember the worst thing that happened to them?"'],
          ['a', '"That sounds like mercy."'],
          ['lucien', '"It sounded like mercy to the king, too. Right up until he realised that a thing which can take grief can take anything. A debt. A witness. A rival. A whole village that was in the way."'],
          ['lucien', 'He closes the book. "I wrote the rite. Other people found uses for it. That\'s the whole story, and it doesn\'t make me one bit less responsible."'],
          ['lucien', '"There was a girl in Hollowmere who sang to the bells every evening. I used to walk out from the city to hear her. I never once spoke to her. I wrote her into the rite as its singer because I couldn\'t think of a voice I trusted more."'],
          ['n', 'He looks at you, and then very carefully looks somewhere else.'],
        ],
        c: [
          { t: '"You can\'t unwrite it. But you can stop hiding it."', path: 'suspicious', fx: done('lucien', 2, { rel: { lucien: { trust: 6 } } }), l: [
            ['lucien', '"Spoken like someone who has never had anything worth hiding." A beat. "Forgive me. That was cruel, and you of all people…"'],
            ['lucien', '"You\'re right. I\'ll stop. Not tonight. Soon."'],
          ], to: 'end' },
          { t: '"The girl who sang. Did she know?"', path: 'compassionate', fx: done('lucien', 2, { rel: { lucien: { affinity: 5, trust: 3 } } }), l: [
            ['lucien', '"I hope not. I hope she thought I was just a clerk with no ear for music who liked standing in fields."'],
            ['lucien', 'Quietly: "I hope she had a good life before I ruined it."'],
          ], to: 'end' },
          { t: 'Say nothing. Sit beside him until the candle goes out.', path: 'secretive', fx: done('lucien', 2, { rel: { lucien: { affinity: 6 } } }), l: [
            ['n', 'Neither of you says anything for a long time. When the candle gutters, he doesn\'t light another.'],
            ['lucien', '"Thank you," he says, in the dark, "for not saying anything clever."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Lucien wrote the rite that let Elaria sell its people. He meant it to carry grief.']], end: true },
    },
  },

  heart_lucien_3: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'He meets you on the palace steps at dusk and hands you an envelope. Sealed. Addressed, in his hand, to "A."'],
          ['lucien', '"I have written a letter to the same person every year for three hundred years. I never finished one. This one I finished."'],
          ['a', '"Who is A.?"'],
          ['lucien', '"For a long time I let people think it was someone I\'d loved and lost, because that was easier to say." He smiles, tired. "It\'s an apology. To the singer. To you, I suspect, though I was too much of a coward to be sure."'],
          ['lucien', '"You don\'t have to read it. I\'d rather you didn\'t, actually. I only needed to give it to someone."'],
          ['lucien', '"When the eclipse comes, I don\'t know what you\'ll decide. If it goes badly, I would like you to remember me as the man who wrote that letter, and not the man who wrote the rite. If that\'s possible."'],
        ],
        c: [
          { t: '"I\'ll remember. Both of them. That\'s the deal."', path: 'compassionate', fx: done('lucien', 3, { rel: { lucien: { affinity: 6, trust: 8 } } }), l: [
            ['lucien', 'He laughs, and for once it sounds young. "That\'s worse. That\'s so much worse. All right."'],
          ], to: 'end' },
          { t: 'Take his hand. "Stand beside me at the end, and I\'ll decide then."', path: 'secretive', fx: done('lucien', 3, { rel: { lucien: { affinity: 8, trust: 5 } }, romanceHint: 'lucien' }), l: [
            ['lucien', '"At the bell tower." He looks down at your hand in his. "Yes. I think I\'d like to be there, for once, when something ends."'],
          ], to: 'end' },
          { t: 'Open the letter in front of him.', path: 'aggressive', fx: done('lucien', 3, { rel: { lucien: { trust: 6, rivalry: 3 } } }), l: [
            ['n', 'One line, in a much younger hand than his face: "I would have liked to hear you sing just once more, standing close enough to say so."'],
            ['lucien', '"Yes, well." He takes a sudden interest in the sky. "I did say I\'d rather you didn\'t."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Heart-to-Heart complete: Lucien. A new choice may wait for you at the bell tower.']], end: true },
    },
  },

  // ======================================================== EVELYNE
  heart_evelyne_1: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'Evelyne takes you to the Rosewater Café and orders for both of you before you can open the menu.'],
          ['evelyne', '"Black tea for me, no sugar, because I\'m tragic. Honey cake for you, because you look at the honey cakes the way Cael looks at a locked door."'],
          ['a', '"How do you know that?"'],
          ['evelyne', '"I know everyone\'s favourite things. The waiter likes his sister\'s dog more than his sister. Lucien pretends to hate violets because his mother grew them. Cael has never once in his life had dessert first."'],
          ['evelyne', '"It\'s cheaper than being liked for real. You remember someone\'s favourite cake, and they think you care, and then you don\'t actually have to."'],
          ['n', 'She says it lightly. She is stirring a tea that has no sugar in it.'],
        ],
        c: [
          { t: '"What\'s your favourite thing, then?"', path: 'compassionate', fx: done('evelyne', 1, { rel: { evelyne: { affinity: 6, trust: 3 } } }), l: [
            ['evelyne', 'She opens her mouth, closes it. "…Nobody\'s ever asked."'],
            ['evelyne', '"Sugared plums. They\'re ridiculous and sticky and Mother says they\'re for children. Don\'t you dare tell anyone."'],
          ], to: 'end' },
          { t: '"So what\'s mine, besides the cake?"', path: 'suspicious', fx: done('evelyne', 1, { rel: { evelyne: { affinity: 3, trust: 4 } } }), l: [
            ['evelyne', '"You like being told the truth. It\'s very inconvenient. I\'m working on it."'],
          ], to: 'end' },
          { t: '"And the waiter\'s dog?" Laugh until she does.', path: 'compassionate', fx: done('evelyne', 1, { rel: { evelyne: { affinity: 6 } } }), l: [
            ['evelyne', '"His name is Sir Pudding and he is a menace." She laughs too loudly, then stops, as if she has heard someone else in it.'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Evelyne knows what everyone loves. Almost no one knows what she does.']], end: true },
    },
  },

  heart_evelyne_2: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'Evelyne\'s rooms in the Marchetti house are perfect, except for one drawer that sticks. She opens it with a practised shove and takes out a single lace cuff, grey with old ink.'],
          ['evelyne', '"When I was fourteen I had a friend who wrote everything down. Shopping lists, poems, which footmen were in love with which maids. She always had ink on her cuffs. She laughed too loudly at dinner and everyone turned to look."'],
          ['evelyne', '"She wrote down something about Mother\'s books. Mother found out. Mother said: you can choose who is forgotten, darling, her or the house."'],
          ['evelyne', '"I chose. I signed the ledger myself, in my best hand. I don\'t remember her name. I remember I had very good handwriting."'],
          ['n', 'Her hands are perfectly still. Only her voice isn\'t.'],
          ['evelyne', '"I kept the cuff. I don\'t know why. You don\'t keep things from people you\'ve decided never existed."', { notFlag: 'evelyne_took' }],
        ],
        c: [
          { t: '"You were fourteen. She asked a child to choose."', path: 'compassionate', fx: done('evelyne', 2, { rel: { evelyne: { affinity: 5, trust: 4 } } }), l: [
            ['evelyne', '"Don\'t. Don\'t make it smaller. It\'s the only thing about me that\'s true all the way through."'],
          ], to: 'end' },
          { t: '"Her name was Ilse."', path: 'secretive', cond: { any: [{ held: 'ilse' }, { kept: 'ilse' }, { returned: 'ilse' }] }, fx: done('evelyne', 2, { rel: { evelyne: { trust: 8 } } }), l: [
            ['n', 'Evelyne looks at you as if you have reached into her chest.'],
            ['evelyne', '"Ilse." She tries it twice. "That\'s… yes. That sounds like someone who laughs too loudly."'],
          ], to: 'end' },
          { t: '"Then why are you showing me?"', path: 'suspicious', fx: done('evelyne', 2, { rel: { evelyne: { trust: 6 } } }), l: [
            ['evelyne', '"Because you\'re the only person in Elaria who might actually know who she was." Her smile is terrible. "Isn\'t that funny?"'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'At fourteen, Evelyne sold her best friend\'s name to save her mother\'s house. She kept the inkstained cuff.']], end: true },
    },
  },

  heart_evelyne_3: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'The ballroom is empty and the chandeliers are covered in sheets. Evelyne is sitting on the edge of the dance floor with her shoes off.'],
          ['evelyne', '"Mother is dying. Slowly, very elegantly, the way she does everything. When she\'s gone, the keys to the altar come to me. The books. The buyers. All of it."'],
          ['evelyne', '"I could burn it all. Or I could become her. I\'m very good at becoming her; I\'ve been practising since I was fourteen."'],
          ['evelyne', '"So I need to ask you something, and I need you to not be kind about it."'],
          ['evelyne', '"If I had to do something unforgivable to save you, at the end. Something very Marchetti. Would you still let me sit next to you afterwards?"'],
        ],
        c: [
          { t: '"Yes. And I\'d make you tell me every bit of it."', path: 'compassionate', fx: done('evelyne', 3, { rel: { evelyne: { affinity: 6, trust: 8 } } }), l: [
            ['evelyne', 'She laughs, and it\'s too loud, and she doesn\'t stop it this time.'],
            ['evelyne', '"Then I\'ll be there at the tower. Shoes on, probably. Possibly."'],
          ], to: 'end' },
          { t: '"Don\'t become her. Not even for me."', path: 'suspicious', fx: done('evelyne', 3, { rel: { evelyne: { trust: 8 } } }), l: [
            ['evelyne', '"No one has ever asked me not to be her. Everyone always just assumed I would."'],
            ['evelyne', '"All right. I\'ll find out what else I can be. You\'ll have to stay around to see it."'],
          ], to: 'end' },
          { t: '"I don\'t know." Tell her the truth.', path: 'secretive', fx: done('evelyne', 3, { rel: { evelyne: { trust: 10 } } }), l: [
            ['evelyne', '"Good." She leans her head on your shoulder. "Everyone else would have said yes."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Heart-to-Heart complete: Evelyne. A new choice may wait for you at the bell tower.']], end: true },
    },
  },

  // ======================================================== CAEL
  heart_cael_1: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'Cael lets you walk the night watch with him, on the condition that you carry the lantern and don\'t talk to the gargoyles. ("They don\'t talk back. That\'s worse.")'],
          ['n', 'At every post he stops, unfolds the roster and reads the names under his breath. All of them. Even the ones off duty.'],
          ['a', '"Why do you do that?"'],
          ['cael', '"Three names have gone off this roster since spring. I didn\'t notice the first one for a week. I\'d been walking past the gap in the line every night."'],
          ['cael', '"So now I say them. Every name, every night. If one of them goes, I\'ll hear the silence where it was."'],
          ['n', 'He folds the paper with the care of a man folding a flag.'],
        ],
        c: [
          { t: '"Say mine too."', path: 'compassionate', fx: done('cael', 1, { rel: { cael: { affinity: 6, trust: 3 } }, romanceHint: 'cael' }), l: [
            ['cael', 'He looks at you a moment too long. "Astoria," he says to the dark, like an entry in a ledger. Then, quieter: "Astoria."'],
            ['cael', '"…There. You\'re on the watch now. Don\'t make me regret it."'],
          ], to: 'end' },
          { t: '"Who were the three?"', path: 'suspicious', fx: done('cael', 1, { rel: { cael: { trust: 6 } } }), l: [
            ['cael', '"I don\'t know. That\'s the point. I know there were three. I know one of them was my lieutenant, because I have his boots, and I don\'t know whose boots they are."'],
          ], to: 'end' },
          { t: 'Walk the rest of the watch in silence, matching his steps.', path: 'secretive', fx: done('cael', 1, { rel: { cael: { affinity: 5 } } }), l: [
            ['n', 'By the third post you can hear him relax. By the sixth he is humming something, off-key, and doesn\'t notice.'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Cael reads every name on the roster every night, so he\'ll hear if one goes missing.']], end: true },
    },
  },

  heart_cael_2: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'Cael\'s family house is small and very clean. His grandmother has been dead for six years and he still sets the table the way she did.'],
          ['n', 'Five places. Four chairs.'],
          ['cael', '"She always laid one extra. If you asked, she said it was for Liesel. If you asked who Liesel was, she\'d go quiet, and then she\'d say she didn\'t know, and she\'d look frightened."'],
          ['cael', '"I was eight when I worked it out. She\'d lost someone and the city had taken even the losing. All she had left was a habit."'],
          ['cael', '"That\'s why I joined the Guard. Not for the king. I wanted to belong to one thing in Elaria that wasn\'t allowed to forget. A watch. A promise you keep every single night."'],
          ['n', 'He straightens the fifth plate by a quarter of an inch.'],
        ],
        c: [
          { t: '"There\'s a coin in the fountain. \'For Liesel, who will be remembered.\'"', path: 'compassionate', cond: { item: 'forgotten_coin' }, fx: done('cael', 2, { rel: { cael: { affinity: 6, trust: 6 } } }), l: [
            ['n', 'You put the coin on the fifth plate. Cael sits down very suddenly.'],
            ['cael', '"Somebody else remembered her," he says. "Somebody else, all this time."'],
          ], to: 'end' },
          { t: 'Sit down at the fifth place.', path: 'compassionate', fx: done('cael', 2, { rel: { cael: { affinity: 7 } }, romanceHint: 'cael' }), l: [
            ['cael', 'He stares at you. Then, absurdly, he goes and gets the bread.'],
            ['cael', '"She\'d have liked you," he says, with his back to you. "She\'d have made you eat three helpings."'],
          ], to: 'end' },
          { t: '"Keeping a promise for a stranger. That\'s very you."', path: 'suspicious', fx: done('cael', 2, { rel: { cael: { trust: 6 } } }), l: [
            ['cael', '"She wasn\'t a stranger to someone." He shrugs. "That\'s enough."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Cael joined the Guard to belong to the one thing in Elaria that isn\'t allowed to forget.']], end: true },
    },
  },

  heart_cael_3: {
    bg: 'woods',
    nodes: {
      start: {
        l: [
          ['n', 'You almost don\'t recognise him out of uniform. Plain shirt, sleeves rolled, sitting on a stile at the edge of the woods as if he\'s been waiting there his whole life.'],
          ['cael', '"I asked for a night off. First time in four years. The sergeant thought I was dying."'],
          ['cael', '"I keep thinking about the dream. The girl in the cathedral. She turns around and I wake up. Every time." He looks at you. "I don\'t need to see her face any more. I know whose it is."'],
          ['cael', '"So I want to ask you something, off duty, where it doesn\'t count as an order."'],
          ['cael', '"The city can make anyone forget anyone. Fine. But there\'s a roster in the guardhouse, and anything written on it, the whole Guard swears to keep. If I wrote your name on it—your real one, however you think of yourself—would you let me?"'],
        ],
        c: [
          { t: '"Write it. Astoria. That\'s who I am."', path: 'compassionate', fx: done('cael', 3, { rel: { cael: { affinity: 6, trust: 8 } } }), l: [
            ['cael', 'He takes a stub of pencil out of his pocket and writes it on the back of his hand first, as if he can\'t wait to get back to the guardhouse.'],
            ['cael', '"There. That\'s a watch now. Nobody stands it down."'],
          ], to: 'end' },
          { t: '"Only if you stand that watch yourself."', path: 'secretive', fx: done('cael', 3, { rel: { cael: { affinity: 8, trust: 5 } }, romanceHint: 'cael' }), l: [
            ['cael', '"Every night," he says. "That was always the plan."'],
          ], to: 'end' },
          { t: '"I don\'t know who I am yet. Ask me at the end."', path: 'suspicious', fx: done('cael', 3, { rel: { cael: { trust: 8 } } }), l: [
            ['cael', '"Then I\'ll be there at the end to ask." He nods, like a man accepting a posting. "Bell tower. Got it."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Heart-to-Heart complete: Cael. A new choice may wait for you at the bell tower.']], end: true },
    },
  },

  // ======================================================== SERAPHINE
  heart_seraphine_1: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'Behind the cathedral there is a garden of violets so thick it looks like a bruise on the earth. Seraphine kneels in it every morning.'],
          ['seraphine', '"One for each, child. Whenever the bells tell me someone has gone, I plant one."'],
          ['a', '"How do the bells tell you?"'],
          ['seraphine', '"They ring one note flat. Nobody else can hear it." She touches three flowers in turn. "A cooper\'s wife, two winters ago. A boy who sold apples. A man who came to confess and forgot why halfway through."'],
          ['seraphine', '"I don\'t know their names. I know where they\'re planted. It\'s not much of a grave. It\'s what there is."'],
        ],
        c: [
          { t: 'Kneel and help her plant the next one.', path: 'compassionate', fx: done('seraphine', 1, { rel: { seraphine: { affinity: 6, trust: 3 } } }), l: [
            ['n', 'Her hands guide yours. Firm, cold, younger than you expected.'],
            ['seraphine', '"Gently. They\'re stubborn, but they bruise."'],
          ], to: 'end' },
          { t: '"How many are there?"', path: 'suspicious', fx: done('seraphine', 1, { rel: { seraphine: { trust: 5 } } }), l: [
            ['seraphine', '"I stopped counting at forty thousand." She says it the way you\'d say the weather.'],
          ], to: 'end' },
          { t: '"Who plants one for you?"', path: 'secretive', fx: done('seraphine', 1, { rel: { seraphine: { affinity: 5, trust: 3 } } }), l: [
            ['seraphine', 'She is quiet for so long you think she won\'t answer.'],
            ['seraphine', '"No one has been forgotten more carefully than I have," she says at last. "Go and eat something."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Seraphine plants a violet for every forgotten person in Elaria. There are more than forty thousand.']], end: true },
    },
  },

  heart_seraphine_2: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'Seraphine is mending an altar cloth by candlelight. She takes off her gloves to thread the needle, and you see her hands properly for the first time.'],
          ['n', 'They are a girl\'s hands. Twenty, perhaps. Not a line on them.'],
          ['seraphine', '"Ah." She doesn\'t put the gloves back on. "Yes. I wondered when you\'d notice."'],
          ['seraphine', '"The night you went onto the altar, somebody had to stay and keep it. The altar asks what you\'ll give it. Everyone gives something."'],
          ['seraphine', '"I gave it my birthdays. Every one I would ever have had. I have not been a day older since, and I have not been a day happier."'],
          ['seraphine', '"Don\'t pity me. I chose it. I would choose it again. I only wish I\'d asked for something less permanent in return."'],
        ],
        c: [
          { t: '"What did you ask for?"', path: 'suspicious', fx: done('seraphine', 2, { rel: { seraphine: { trust: 6 } } }), l: [
            ['seraphine', '"To be here when you came back." She threads the needle on the first try. "And here you are. So it kept its side."'],
          ], to: 'end' },
          { t: 'Take her hand. Hold it until it\'s warm.', path: 'compassionate', fx: done('seraphine', 2, { rel: { seraphine: { affinity: 7 } } }), l: [
            ['seraphine', '"You did this the night before, too." Her voice catches on nothing. "Exactly this."'],
          ], to: 'end' },
          { t: '"Then I owe you three hundred birthdays."', path: 'secretive', fx: done('seraphine', 2, { rel: { seraphine: { affinity: 4, trust: 4 } } }), l: [
            ['seraphine', 'A real laugh, startled out of her. "I\'d settle for one cake."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Seraphine gave the altar her birthdays so she could keep the cathedral until you came back.']], end: true },
    },
  },

  heart_seraphine_3: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'The bell tower, at the hour when the light goes violet. Seraphine has climbed all two hundred steps without stopping, and she\'s not even out of breath.'],
          ['seraphine', '"You used to sing up here. Three notes, every evening, and then the whole song. I\'ve only ever hummed the three since. I couldn\'t bear the rest."'],
          ['seraphine', '"I\'m going to sing it now. All of it. I\'d like you to hear it once from outside your own head."'],
          ['n', 'She sings. Her voice is thin and true and very old. The three notes you have heard all your short life open into a whole song: a lullaby for a valley, for its doors and its dogs and its well.'],
          ['n', 'When it ends, the bells answer. Just slightly. Just once.'],
          ['seraphine', '"She was so certain, that girl. Certain she could carry everyone. I helped her onto the altar because she asked me to. I have never forgiven her for asking."'],
          ['seraphine', '"Will you? Forgive her? I can\'t do it for her. She was you."'],
        ],
        c: [
          { t: '"I forgive her. And I forgive you for helping."', path: 'compassionate', fx: done('seraphine', 3, { rel: { seraphine: { affinity: 6, trust: 8 } } }), l: [
            ['n', 'Seraphine bows her head. For a moment she looks exactly as old as she is.'],
            ['seraphine', '"Then I\'ll be at the tower. Whatever you choose. That\'s what keepers are for."'],
          ], to: 'end' },
          { t: '"Not yet. Not until I understand why she did it."', path: 'suspicious', fx: done('seraphine', 3, { rel: { seraphine: { trust: 8 } } }), l: [
            ['seraphine', '"Fair." She almost smiles. "She never let me get away with anything either."'],
          ], to: 'end' },
          { t: 'Sing the three notes back to her.', path: 'secretive', fx: done('seraphine', 3, { rel: { seraphine: { affinity: 8, trust: 4 } } }), l: [
            ['n', 'Your voice cracks on the second. Seraphine sings the third with you, and the bells answer again.'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Heart-to-Heart complete: Seraphine. A new choice may wait for you at the bell tower.']], end: true },
    },
  },

  // ======================================================== NOCTIS
  heart_noctis_1: {
    bg: 'woods',
    nodes: {
      start: {
        l: [
          ['n', 'Noctis is sitting in a tree with a paper bag of sugared plums. He offers you one without looking down, which means he knew you were coming.'],
          ['noctis', '"Let\'s play a game. I say what happens next. You try to make it not happen."'],
          ['noctis', '"In a moment you\'re going to ask how I knew you\'d come. Then you\'ll eat the plum. Then you\'ll get sugar on your sleeve and pretend you haven\'t."'],
          ['n', 'You have, in fact, already got sugar on your sleeve.'],
          ['noctis', '"I always win this game. It\'s very boring. I\'d like to lose, just once. Do you know what it\'s like never to be surprised? It\'s like eating a cake you\'ve already eaten."'],
        ],
        c: [
          { t: 'Throw the plum straight at him.', path: 'aggressive', fx: done('noctis', 1, { rel: { noctis: { affinity: 8 } } }), l: [
            ['n', 'It bounces off his forehead. He falls out of the tree.'],
            ['noctis', 'From the bracken, delighted: "I DIDN\'T SEE THAT. I didn\'t see that at all!"'],
          ], to: 'end' },
          { t: '"What if you\'re wrong about how it ends?"', path: 'suspicious', fx: done('noctis', 1, { rel: { noctis: { affinity: 4, trust: 4 } } }), l: [
            ['noctis', 'He goes very still, the way children do when you say something they want too much.'],
            ['noctis', '"Then I\'d have to find out the normal way. Like everybody else." He swings his legs. "That sounds awful. Do it."'],
          ], to: 'end' },
          { t: 'Climb up and sit beside him without a word.', path: 'secretive', fx: done('noctis', 1, { rel: { noctis: { affinity: 6 } } }), l: [
            ['noctis', '"I knew you\'d do that," he says. Then, after a while: "I didn\'t know it would feel nice, though."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Noctis can see what\'s coming. He would give almost anything to be surprised.']], end: true },
    },
  },

  heart_noctis_2: {
    bg: 'woods',
    nodes: {
      start: {
        l: [
          ['n', 'Hollowmere at dusk. Noctis is sitting on the edge of the well, swinging his heels against the stone.'],
          ['noctis', '"There was a dog here called Biscuit. Brown, one ear up, one down. He stole a whole ham once and everyone pretended it was a wolf so he wouldn\'t get in trouble."'],
          ['noctis', '"And there was Mira. She lived in the blue door. She taught me to whistle with two fingers so loud the bells would shiver."'],
          ['n', 'He puts two fingers in his mouth. Nothing comes out but air.'],
          ['noctis', '"I can\'t any more. I\'ve been holding two hundred and six people for three hundred years and there isn\'t room left in me for a whistle."'],
          ['noctis', '"I don\'t want to be eight forever. I just don\'t know how to put them down without dropping them."'],
        ],
        c: [
          { t: '"Teach me how Mira did it. I\'ll whistle for both of us."', path: 'compassionate', fx: done('noctis', 2, { rel: { noctis: { affinity: 7, trust: 3 } } }), l: [
            ['n', 'It takes twenty minutes. When you finally get it, a flock of crows explodes out of the trees, and Noctis laughs so hard he nearly falls down the well.'],
          ], to: 'end' },
          { t: '"Tell me about every door. All of them. I\'ll listen."', path: 'secretive', fx: done('noctis', 2, { rel: { noctis: { affinity: 5, trust: 6 } } }), l: [
            ['n', 'It takes until moonrise. He tells you about all of them. Somewhere around the forty-third door, he stops sounding three hundred and starts sounding eight.'],
          ], to: 'end' },
          { t: '"You don\'t have to put them down alone."', path: 'compassionate', fx: done('noctis', 2, { rel: { noctis: { affinity: 6, trust: 5 } } }), l: [
            ['noctis', '"Everyone says that." He looks up at you. "Nobody ever means the bit about not alone."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Noctis is carrying Hollowmere. There\'s no room left in him to grow up.']], end: true },
    },
  },

  heart_noctis_3: {
    bg: 'woods',
    nodes: {
      start: {
        l: [
          ['n', 'Noctis finds you, for once, instead of the other way round. He is out of breath. You have never seen him out of breath.'],
          ['noctis', '"I\'ve seen every ending," he says. "Every single one. The bells, the long sleep, the one where you sit behind the altar like a judge. Some of them are nice. Some of them are very nice."'],
          ['noctis', '"In none of them do I get to grow up. Not one. I\'m always eight, at the well, waving."'],
          ['noctis', '"So I need you to do something I haven\'t seen. I don\'t know what. If I knew what, I\'d have seen it. That\'s the problem."'],
          ['noctis', '"Promise you\'ll surprise me. At the end. Promise."'],
        ],
        c: [
          { t: '"I promise." Hold out your little finger.', path: 'compassionate', fx: done('noctis', 3, { rel: { noctis: { affinity: 6, trust: 8 } } }), l: [
            ['n', 'He hooks his finger around yours, very seriously, the way children make laws.'],
            ['noctis', '"That\'s binding," he says. "That\'s more binding than the moon."'],
          ], to: 'end' },
          { t: '"Then stop looking. Let it happen to you."', path: 'suspicious', fx: done('noctis', 3, { rel: { noctis: { trust: 8 } } }), l: [
            ['noctis', '"I don\'t know how to not look." He closes his eyes, scrunches them shut. "…Is this it? Is this how everyone lives? It\'s terrifying. I love it."'],
          ], to: 'end' },
          { t: 'Pick him up and spin him round until he shrieks.', path: 'aggressive', fx: done('noctis', 3, { rel: { noctis: { affinity: 10 } } }), l: [
            ['noctis', 'Upside down, breathless: "THAT. That wasn\'t in any of them. Do more of that."'],
          ], to: 'end' },
        ],
      },
      end: { l: [['note', 'Heart-to-Heart complete: Noctis. A new choice may wait for you at the bell tower.']], end: true },
    },
  },
};

// Hidden endings opened by a finished Heart-to-Heart (or by darker paths).
// Shown in the endings gallery as locked silhouettes with these hints.
export const HIDDEN_ENDINGS = {
  ledger: { who: 'lucien', title: 'The Ledger', line: 'One name a night, read aloud into the bells, until every one of them is home.', hint: 'Finish all three of Lucien\'s Heart-to-Hearts.' },
  heiress: { who: 'evelyne', title: 'The Duchess\'s Daughter', line: 'Evelyne took the keys from her mother, and gave them to the city.', hint: 'Finish all three of Evelyne\'s Heart-to-Hearts.' },
  watch: { who: 'cael', title: 'The Tenth Line', line: 'A name the Guard has sworn to keep cannot be forgotten.', hint: 'Finish all three of Cael\'s Heart-to-Hearts.' },
  lullaby: { who: 'seraphine', title: 'The Last Lullaby', line: 'Seraphine sang the whole song, and gave her birthdays back.', hint: 'Finish all three of Seraphine\'s Heart-to-Hearts.' },
  surprise: { who: 'noctis', title: 'A Surprise for Noctis', line: 'For the first time in three hundred years, Noctis did not know what happened next.', hint: 'Finish all three of Noctis\'s Heart-to-Hearts.' },
  siren: { who: null, title: 'Siren\'s Song', line: 'The chain broke, and Elaria forgot everything, all at once, beautifully.', hint: 'Believe Aeria. Weaken her chain. Never seal her away.' },
  hollow: { who: null, title: 'The Empty Vault', line: 'There was nobody left inside her to choose, so the moon chose.', hint: 'Give away almost all of yourself, and trust no one.' },
};

// Words that light up in dialogue. Tap one for a plain explanation.
export const GLOSSARY = {
  'Moonfall': 'Three hundred years ago the moon came down far too close to Elaria. Ever since, people in the kingdom forget — sometimes they forget whole people.',
  'Elaria': 'The kingdom you woke up in. Its capital is built around the Cathedral of Eclipses and the royal palace.',
  'Accord': 'The Veil Accord: a secret agreement among the nobles. For a price, a person can be made forgotten — a debt, a rival, a witness.',
  'Hollowmere': 'A village in the Whispering Woods. Every one of its people was forgotten at once, on the night of the Moonfall.',
  'eclipse': 'An eclipse is coming. On that night, whatever has been forgotten can be given back — or sealed away forever. It is the story\'s deadline.',
  'altar': 'The altar in the Cathedral of Eclipses. It is where forgetting really happens: whatever the city loses goes through it.',
  'Marchetti': 'The noble house that keeps every guest list in Elaria — and, secretly, the books of who has been sold.',
  'keeper': 'The keeper of the Cathedral of Eclipses. Seraphine has held the post for longer than anyone can account for.',
  'vault': 'Something that holds what others have lost. You are beginning to suspect the word means you.',
  'Veil': 'What people call the forgetting: as if a veil falls over someone, and they are gone from everyone\'s memory.',
};

// "How Elaria works" — five plain pages shown after the prologue.
export const PRIMER = [
  { kicker: 'The world', title: 'A city that forgets', img: 'assets/img/scene_royal.jpg', text: 'Three hundred years ago the moon came down too close. They call it the Moonfall. Ever since, Elaria forgets. Not keys and birthdays — people. Someone is gone, and by morning nobody remembers they ever lived.' },
  { kicker: 'The secret', title: 'Not all of it is an accident', img: 'assets/gala/ballroom.jpg', text: 'Behind the masks and the court manners, the nobles have a trade. For the right price, anyone can be made forgotten: a debt, a rival, a witness. The names have to go somewhere.' },
  { kicker: 'You', title: 'Astoria', img: 'assets/img/scene_cathedral.jpg', text: 'You woke on the cathedral altar knowing only your name. At night you dream other people\'s lives — a kitchen, a wedding, a stable-yard at dawn. You don\'t yet know why.' },
  { kicker: 'Your goal', title: 'Before the eclipse', img: 'assets/img/scene_woods.jpg', text: 'Find out what you are, and who made you this way, before the eclipse. When it comes, you will have to decide what to do with everyone you carry — and whom you trust to stand beside you.' },
  { kicker: 'How to play', title: 'Story, people, endings', img: 'assets/img/scene_garden.jpg', text: 'Tap Continue on Home to follow the story. Between chapters, spend time with the five people of Elaria — each has three Heart-to-Hearts that unlock a hidden ending. There are twelve endings to find.' },
];
