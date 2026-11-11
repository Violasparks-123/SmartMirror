// Memory Archive entries, unsolved mysteries and letters.
// Memories are built from fragments; a memory stays incomplete until every
// fragment has been found, and missing fragments show a hint instead.

export const MEMORIES = {
  mem_awakening: {
    title: 'Waking in Violet Light', chapter: 1, cg: 'assets/img/cg_awakening.jpg', thumb: 'assets/img/cg_awakening_thumb.jpg',
    frags: {
      wake: { text: 'Cold stone. An eclipse in stained glass. A bell that tolled thirteen times, though bells here have only twelve strokes. You knew your name, and nothing else.' },
    },
  },
  mem_invitation: {
    title: 'An Invitation Addressed to A.', chapter: 1,
    frags: {
      found: { text: 'On the altar, waiting for you: an envelope sealed with a crescent pierced by a thorn. "The moon remembers. Come home."' },
      crest: { text: 'Lucien named the crest: House Veyra, a noble family that — according to every record in Elaria — never existed.', hint: 'Someone at court may recognise the crest.' },
    },
  },
  mem_photograph: {
    title: 'The Scratched Photograph', chapter: 3,
    frags: {
      photo: { text: 'The royal family in the year of the Moonfall. At the edge, a girl in a black dress. Her face has been scratched away.' },
      back: { text: 'On the reverse: "A. — before." Before what?', hint: 'Look more closely at the photograph itself.' },
      reaction: { text: 'When you showed someone the photograph, they knew the dress. They said nothing about the face.', hint: 'Show the photograph to someone you have met.' },
    },
  },
  mem_cove: {
    title: 'The Song Beneath', chapter: 3,
    frags: {
      song: { text: 'A voice under the cathedral, singing to no one, cut off in the middle of a note: "Who\'s there?"', hint: 'Somewhere beneath the cathedral, a flagstone is colder than the rest.' },
      chain: { text: 'The chain that holds Aeria runs up through the rock toward the cathedral. Every link is stamped with a tiny bell.', hint: 'Look closely at what holds her.' },
      figurehead: { text: 'A ship\'s figurehead wedged in the cove rocks. Every name on the hull has been scraped away but one line, cut later and deeper: WE FORGOT OUR WAY HOME.', hint: 'Something wrecked in the cove.' },
      truth: { text: 'Aeria taught Lucien the Moonfall rite, so that everything Elaria forgot would run downhill into her sea.', hint: 'She told you the truth. Find out what she left out.' },
    },
  },
  mem_masquerade: {
    title: 'Behind the Masks', chapter: 4,
    frags: {
      voices: { text: '"The Accord holds only if she does not remember." Lucien\'s voice, and Evelyne\'s answering: "Then make sure she never does."' },
      after: { text: 'They left the alcove by different doors. Lucien went down, toward the cellars. Evelyne went to find you.', hint: 'Someone was watching who left the alcove, and which way.' },
      list: { text: 'From behind the cracked pillar: "Whose name is next on Mother\'s list?" A long pause. "The captain\'s."', hint: 'Someone at the masquerade knew exactly where you should stand.' },
    },
  },
  mem_hollowmere: {
    title: 'Hollowmere\'s Empty Doorways', chapter: 5,
    frags: {
      village: { text: 'A whole settlement in the woods, every doorpost carved with a family name, every name scraped away — on the same night.' },
      ledger: { text: 'One name a child refused to erase: "A., who sings to the bells. I will remember her even if everybody else forgets."', hint: 'Read what the child wrote more carefully.' },
      song: { text: 'Noctis knew the three notes. "She sang that every evening, to the bells. The whole village stopped to listen."', hint: 'Some songs outlast the people who sang them. Did you hear one when you woke?' },
    },
  },
  mem_portrait: {
    title: 'She Must Never Remember', chapter: 6,
    frags: {
      face: { text: 'A portrait of a woman with your face, your eyes, your silver-lavender hair. Dated three hundred years before you were born.' },
      words: { text: 'Underneath, in a hand that pressed hard enough to tear the canvas: "She must never remember who she was."' },
      photo: { text: 'The girl at the edge of the scratched photograph wears the same black gown as the woman in the portrait, lace collar and all. Two pictures of one person. Someone tried to erase both.', hint: 'Bring the scratched photograph to the hidden gallery.' },
      name: { text: 'A name plate, pried away. Only the first letter is left: A.', hint: 'Somewhere in Elaria, the rest of the name survived. (Chapter 7 — in development)' },
    },
  },
  mem_lullaby: {
    title: 'A Lullaby Without Words', chapter: 1,
    frags: {
      hum: { text: 'Seraphine humming three notes in the bell tower — the same three you heard when you woke.', hint: 'Listen for humming at the cathedral at night.' },
      hymnal: { text: 'The wordless hymn in the cathedral hymnal: the same three notes, written over and over.', hint: 'Old hymnals sometimes keep old songs.' },
      vial: { text: 'A sunlit cathedral. Someone braiding your hair. Humming.', hint: 'The moon gives back what it took — if you ask it at the altar.' },
    },
  },
  mem_noctis: {
    title: 'Tomorrow, Already Remembered', chapter: 2,
    frags: {
      first: { text: 'Noctis knew your name before you said it. "You told me," he said. "Later."' },
      fountain: { text: 'At the fountain at midnight he said, "I am what the moon forgot to forget." Then he looked very sad, and very young.', hint: 'Keep Noctis\'s appointment.' },
    },
  },
  mem_liesel: {
    title: 'A Name in the Water', chapter: 2,
    frags: {
      coin: { text: 'A coin in the fountain: "For Liesel, who will be remembered." No one remembers her.' },
      who: { text: 'Cael\'s grandmother used to set a place at the table for a "Liesel". He never knew who she was. Neither did his grandmother.', hint: 'Ask someone at the Royal District about the coin.' },
    },
  },
  mem_guard: {
    title: 'The Ninth Watchman', chapter: 3,
    frags: {
      roster: { text: 'The night-watch roster: nine positions, eight names. Line IX is blank, in fresh ink that was never written.' },
      token: { text: 'At the forest edge, the token of watchman IX. Cael held it and, for one breath, said a name. Then it was gone.', hint: 'Search the forest edge at night.' },
    },
  },
};

export const MYSTERIES = {
  myst_arrival: { title: 'How did Astoria arrive at the cathedral?', text: 'You woke on the cathedral floor with no memory of arriving. The doors were barred from the inside.', solved: 'Seraphine carried you to the altar, as she has at the end of every eclipse for three hundred years.' },
  myst_invitation: { title: 'Who left the invitation?', text: 'A sealed invitation addressed to "A." was waiting on the altar, bearing a crest no one uses any more.', solved: 'Lucien sent it. After three hundred years of keeping you empty, this time he wanted you to come home.' },
  myst_moonfall: { title: 'What truly happened at the Moonfall?', text: 'The official history calls it a natural celestial event. The official history is also missing a chapter called "The Veiling".', solved: 'The crown wanted the moon. Your voice sang the rite that brought it down, and Hollowmere was the price.' },
  myst_noctis: { title: 'How does Noctis know what hasn\'t happened?', text: 'He references events before they occur, and appears in places he could not have reached.', solved: 'Carrying two hundred and six people nobody else remembers has pushed him outside time.' },
  myst_aeria: { title: 'Who is the woman beneath the cathedral?', text: 'Aeria says Lucien loved her, left her for a girl who sang to bells, and chained her beneath the cathedral.', solved: 'A siren who drank the memories of drowned sailors. She taught Lucien the Moonfall rite so that all of Elaria\'s forgetting would run down into her sea.' },
  myst_lucien_night: { title: 'Where does Lucien go at night?', text: 'By day his routine is precise. By night, no one can say where he goes.', solved: 'He descends into the sealed chamber beneath the Cathedral of Eclipses.' },
  myst_accord: { title: 'What is the Veil Accord?', text: 'Lucien and Evelyne spoke of an "Accord" that holds only if "she" does not remember.', solved: 'The noble houses\' trade in forgetting. Anyone who can pay can have a grief, or a person, taken out of every head in Elaria.' },
  myst_hollowmere: { title: 'Who lived in Hollowmere?', text: 'A settlement in the woods whose people were all forgotten on the same night.', solved: 'Two hundred and six people, sold by the crown as the Moonfall\'s first payment.' },
  myst_portrait: { title: 'Who is the woman in the portrait?', text: 'She has your face. She lived three hundred years ago. Someone did not want her to remember who she was.', solved: 'The bell-singer of Hollowmere. You.' },
  myst_seraphine: { title: 'How long has Seraphine been keeper?', text: 'Cael remembers her from his childhood, unchanged. The register says longer.', solved: 'She is the altar\'s priestess. For three hundred years she has placed what Elaria forgets inside you.' },
  myst_guards: { title: 'Where did the missing guards go?', text: 'Three names have vanished from the guard roster this year. Only Cael noticed.', solved: 'They were sold. Everything anyone knew of them went into you.' },
};

export const LETTERS = {
  letter_lucien_1: {
    from: 'lucien', title: 'A Summons', seal: 'L.',
    body: 'Miss A—,\n\nA sealed invitation bearing a crest no one has used in three centuries was carried out of the Cathedral of Eclipses this morning. I would very much like to know how.\n\nPresent yourself at the palace entrance. Do try to arrive in the morning; my patience is a morning creature.\n\n— L.',
    fx: { obj: 'mq2.letter', item: { lucien_letter: 1 } },
  },
  letter_evelyne_masq: {
    from: 'evelyne', title: 'The Velvet Masquerade', seal: 'E.M.',
    body: 'Darling Astoria,\n\nYou simply must come to the Velvet Masquerade. Everyone will be there, and everyone is dying to see you — I have made certain of it.\n\nCome in the evening. Come as someone else. I\'ve enclosed your invitation; please don\'t lose it, I had to forge a signature.\n\nAll my affection (most of it),\nEvelyne',
    fx: { item: { masquerade_invitation: 1 }, discover: 'ballroom', obj: 'mq4.letter' },
  },
  letter_noctis_woods: {
    from: 'noctis', title: '(No seal. Slightly damp.)', seal: 'N.',
    body: 'Tomorrow you\'ll walk into the woods. Go after dark — the path only shows itself to the moon.\n\nWear sensible shoes. You won\'t, but I\'m saying it anyway so you can\'t say I didn\'t.\n\n— N.\n\nP.S. Don\'t trust the third cottage. Trust the second.',
    fx: { obj: 'mq5.letter' },
  },
  letter_cael_patrol: {
    from: 'cael', title: 'Patrol Notes', seal: 'C.',
    body: 'Astoria,\n\nI hope this isn\'t forward. I walked past the cathedral twice last night. The lights were on in the bell tower long after midnight.\n\nIf you need anything — an escort, a second pair of eyes — I keep the night watch at the palace gate. Come find me.\n\nStay safe.\nCael',
    fx: { offer: 'nq_cael' },
  },
  letter_lucien_cold: {
    from: 'lucien', title: 'A Correction', seal: 'L.',
    body: 'Astoria,\n\nYou were not at the balcony. I am noting this so that neither of us has to pretend I did not notice.\n\n— L.',
  },
  letter_seraphine_violets: {
    from: 'seraphine', title: 'For the Altar', seal: '✦',
    body: 'Child,\n\nThe violets on the altar are fading. The ones in the Whispering Woods still glow. If you bring me three, I will show you why it matters.\n\n— S.',
    fx: { start: 'sq_violets' },
  },
  letter_evelyne_tea: {
    from: 'evelyne', title: 'Tea?', seal: 'E.M.',
    body: 'Astoria!\n\nThe Rosewater Café, any morning. I will tell you three secrets and you will tell me one. That is a bargain and you know it.\n\n— E.',
  },
  letter_noctis_predict: {
    from: 'noctis', title: '(Written on the back of a menu)', seal: 'N.',
    body: 'You\'re going to find something in the ballroom that you already have. Don\'t be alarmed. It\'s yours, technically.\n\n— N.',
  },
  letter_unknown: {
    from: null, title: 'An Unsigned Letter', seal: '☾',
    body: 'Stop looking.\n\nYou left once. You were happy. Leave again before you remember why you came back.',
    fx: { mystery: 'myst_arrival' },
  },
};
