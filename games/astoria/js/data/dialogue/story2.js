// Story, part two: the dilemma that closes each chapter, Chapters 7–9 and the
// five endings. The Veil (what Astoria keeps or gives back) lives in
// systems/StoryManager.js; the memories themselves are in data/echoes.js.
//
// A line may carry a condition as a third element: ['n', 'text', { flag: 'x' }].
// A node may branch with `go: [{ cond, to }, …]`.

const FORGOT = (id) => ({ all: [{ flag: `forgot_${id}` }, { notFlag: `restored_${id}` }] });
const PRESENT = (id) => ({ notFlag: `letgo_${id}` });

// The final choice and the five endings. Shared by the tower scene and by
// "Choose again" on the ending screen.
function finale() {
  return {
    final: {
      l: [['note', 'What do you owe them?']],
      c: [
        { t: 'Ring every bell. Give it all back.', to: 'e_bells' },
        { t: 'Keep them. Close the altar, and live.', req: { selfMin: 4 }, hint: 'Enough of yourself kept: four pieces', to: 'e_keep' },
        { t: 'Take the altar. Decide for them.', req: { took: true }, hint: 'Having taken a memory from someone before', to: 'e_curator' },
        { t: 'Accept the Duchess\'s bargain. Sleep.', to: 'e_sleep' },
        { t: 'Ask them to share the weight.', req: { trusting: 3 }, hint: 'Three companions who trust you completely', to: 'e_share' },
        // Hidden: only offered once earned (see the endings gallery for hints).
        { t: '♥ Hand Lucien the ledger. "Read them to me."', cond: { all: [{ flag: 'heart_lucien' }, PRESENT('lucien'), { notFlag: 'forgot_lucien' }] }, to: 'e_ledger' },
        { t: '♥ Look for Evelyne on the stair.', cond: { all: [{ flag: 'heart_evelyne' }, PRESENT('evelyne'), { notFlag: 'forgot_evelyne' }] }, to: 'e_heiress' },
        { t: '♥ Ask Cael for the roster.', cond: { all: [{ flag: 'heart_cael' }, PRESENT('cael'), { notFlag: 'forgot_cael' }] }, to: 'e_watch' },
        { t: '♥ Ask Seraphine to sing.', cond: { flag: 'heart_seraphine' }, to: 'e_lullaby' },
        { t: '♥ Do the one thing Noctis has never seen.', cond: { flag: 'heart_noctis' }, to: 'e_surprise' },
        { t: 'Hum Aeria\'s song instead.', cond: { all: [{ flag: 'aeria_chain_weak' }, { notFlag: 'aeria_sealed' }] }, to: 'e_siren' },
        { t: 'Let go. Let the moon decide.', cond: { all: [{ selfMax: 1 }, { not: { trusting: 1 } }] }, to: 'e_hollow' },
      ],
    },
    e_bells: {
      fx: { ending: 'bells', obj: 'mq9.tower' },
      l: [
        ['n', 'You take hold of the bell rope. There are forty thousand people inside you, and every one of them has been waiting.'],
        ['n', 'You sing the three notes, and the bells of Elaria answer, all of them, all at once.'],
        ['n', 'Far below, a chain that was made to be held by bells rings with all of them at once, and breaks.', { notFlag: 'aeria_sealed' }],
        ['n', 'Memories leave you like birds leaving a tree: a sunlit kitchen, a wedding in the rain, a stable-yard at dawn, a girl who laughed too loudly, two hundred and six names.'],
        ['n', 'Across the city people stop in the street and remember. Some fall to their knees. Some start running toward the palace with torches.'],
        ['note', 'The crown sold a village to bring the moon down. Now everyone knows.'],
        ['noctis', 'Somewhere below, Noctis is laughing and crying at once. "Mira," he is saying. "Mira, Mira."', { flag: 'noctis_carries' }],
        ['cael', '"Stay with me," Cael says. "Astoria. Stay."', PRESENT('cael')],
        ['lucien', 'Lucien writes as fast as he can, every name, before you are gone.', PRESENT('lucien')],
        ['n', 'There is very little of you left at the end. Just enough to hear someone say your name.'],
        ['a', '"…Another day in this world."'],
      ],
      end: true,
    },
    e_keep: {
      fx: { ending: 'keep', obj: 'mq9.tower' },
      l: [
        ['a', '"No more."'],
        ['n', 'You close your hand around everything inside you, and you do not let go.'],
        ['n', 'The bells stay silent. Far below, the altar cracks clean through, and never takes anything again.'],
        ['The Duchess', '"You selfish child," the Duchess says, almost admiringly. "Do you know how many people will lie awake tonight?"'],
        ['n', 'The Accord has nothing left to sell into. By morning its trade is over.'],
        ['note', 'No one will ever be sold again. No one will ever come home.'],
        ['n', 'The forgotten stay forgotten. They are in you: a wedding, a kitchen, a stable-yard at dawn. You are made of them, and you will live a long time.'],
        ['n', 'You walk down the tower stairs as someone. It is harder than you thought, being someone.'],
      ],
      end: true,
    },
    e_curator: {
      fx: { ending: 'curator', obj: 'mq9.tower' },
      l: [
        ['a', '"Give me the keys."'],
        ['The Duchess', 'The Duchess looks at you for a long moment. Then she laughs, and puts the altar keys in your hand.'],
        ['n', 'You step behind the altar. It fits you the way a crown fits.'],
        ['a', '"Anyone who wants to forget can come to me. Anyone who was forgotten can ask to come home. I will decide."'],
        ['n', 'The first petitioner arrives before dawn: a man who wants to forget his son. You listen to the whole story before you say anything.'],
        ['note', 'Mercy, from the same seat the Duchess sat in.'],
        ['n', 'You give back a little every night, the ones you judge should come home. You keep the rest. You are very good at deciding. Some nights that frightens you.'],
      ],
      end: true,
    },
    e_sleep: {
      fx: { ending: 'sleep', obj: 'mq9.tower' },
      l: [
        ['The Duchess', '"Thirty years," says the Duchess. "Not one name sold. You have my word, and my word is the one thing in this city nobody has ever forgotten."'],
        ['a', '"And everyone inside me?"'],
        ['The Duchess', '"Will wait. As they always have."'],
        ['n', 'You walk down the stairs and lie down on the altar. Seraphine smooths your hair.'],
        ['cael', 'Cael has his back to you, at the door, so that you won\'t see his face.', PRESENT('cael')],
        ['noctis', 'Noctis sits at the foot of the altar. "I\'ll still be here," he says. "I always am."', { flag: 'noctis_carries' }],
        ['n', 'The eclipse closes like an eye.'],
        ['note', 'Thirty years without a name sold, paid for by everyone still inside her.'],
        ['n', 'The last thing you hear is three notes, hummed very softly, by someone who has hummed them nine times before.'],
      ],
      end: true,
    },
    e_share: {
      fx: { ending: 'share', obj: 'mq9.tower' },
      l: [
        ['n', 'You can\'t give everything back at once; it would break the city. You can\'t keep it; it would break you. So you hold out your hands.'],
        ['seraphine', '"I put them in you," Seraphine says. "Give me some back. I am old enough to carry them."', { rel: { seraphine: { trust: 30 } } }],
        ['cael', 'Cael takes the wedding in the rain, and the stable-yard at dawn. "I know what to do with these," he says.', { all: [{ rel: { cael: { trust: 30 } } }, PRESENT('cael')] }],
        ['lucien', 'Lucien takes a ledger\'s worth of names. "I already know them all," he says. "Now I\'ll remember them properly."', { all: [{ rel: { lucien: { trust: 30 } } }, PRESENT('lucien')] }],
        ['evelyne', 'Evelyne takes Ilse back, all of her, and doesn\'t let go of your hand while she does it.', { all: [{ rel: { evelyne: { trust: 30 } } }, PRESENT('evelyne')] }],
        ['noctis', 'Noctis takes Hollowmere back, a few names at a time this time, and hands the rest round.', { rel: { noctis: { trust: 30 } } }],
        ['note', 'Each of them gives something up to make room.'],
        ['n', 'Lucien forgets the first time he heard you sing. Cael stops dreaming of the girl in the cathedral. Seraphine begins, at last, to grow old.'],
        ['n', 'The forgotten come home slowly, a few each night, to people ready to hold them.'],
        ['a', '"…Another day in this world," you say, and for the first time it sounds like a promise.'],
      ],
      end: true,
    },
    e_ledger: {
      fx: { ending: 'ledger', obj: 'mq9.tower' },
      l: [
        ['n', 'You put the ledger into Lucien\'s hands. Three hundred years of names, in his small, careful writing.'],
        ['a', '"Not all at once. One a night. Read it to me, into the bells, and I\'ll let them go as you say them."'],
        ['lucien', '"There are forty thousand names in this book." He looks at you as if you have handed him a sentence of a hundred years. "That will take…"'],
        ['a', '"A long time. You\'re good at long times."'],
        ['lucien', 'He opens to the first page. His voice shakes on the first name, and not again. "Hester Dunmore, who trod on my feet."'],
        ['n', 'The bells ring once. Somewhere in the city, a family sits up in bed and remembers their mother.'],
        ['note', 'One name a night. It will take a hundred and nine years.'],
        ['n', 'By the third year, Lucien has grey at his temples. By the tenth, he reads from a chair. He has never once missed a night, and you have never once let him read alone.'],
        ['lucien', '"Tomorrow," he says, closing the book on the night\'s page, "a Liesel. I\'ve been looking forward to her."'],
      ],
      end: true,
    },
    e_heiress: {
      fx: { ending: 'heiress', obj: 'mq9.tower', flag: 'evelyne_burned_books' },
      l: [
        ['n', 'Evelyne is already climbing the stair, shoes in one hand, a ring of iron keys in the other.'],
        ['evelyne', '"Mother died at a quarter to midnight. Very elegantly. These came to me at a quarter past." She drops the keys of the altar into your palm. "I\'ve decided what else I can be."'],
        ['evelyne', '"We do it in the open. House by house, name by name, in daylight, with the books on a table in the square so everyone can see who paid."'],
        ['The Duchess', 'Somewhere, you imagine, a very elegant ghost is appalled.'],
        ['n', 'It takes a year. The Marchetti fortune goes to the families of the sold, every crown of it. Evelyne sells the ballroom chandeliers herself and haggles beautifully.'],
        ['note', 'No one held all of it. Everyone saw it.'],
        ['evelyne', 'On the last night she sits beside you on the cathedral steps, poor as a mouse and laughing too loudly. "Ilse would have hated this. She\'d have written it all down."'],
      ],
      end: true,
    },
    e_watch: {
      fx: { ending: 'watch', obj: 'mq9.tower' },
      l: [
        ['n', 'Cael unfolds the night-watch roster on the floor of the tower. Nine positions. Below the ninth, a tenth line, ruled in fresh ink.'],
        ['cael', '"Anything on this list, the whole Guard swears to keep. The moon can take what it likes from the city. It can\'t take an oath."'],
        ['n', 'He writes ASTORIA on the tenth line. Then, under it, as you speak them, every name you hold. Elsie. Edric Vane. Nell Brannock. Ilse. Liesel. Two hundred and six from Hollowmere.'],
        ['n', 'Each name goes from you into the roster, and from the roster into a watch, and from the watch into the city. Slowly. Kept.'],
        ['note', 'A name somebody has sworn to keep cannot be forgotten.'],
        ['n', 'The roster is four hundred pages long now. The night watch reads it aloud in shifts, all night, every night. People come to the guardhouse just to listen for their dead.'],
        ['cael', '"Astoria," he says at every first post, like the start of a prayer. You are always there to answer.'],
      ],
      end: true,
    },
    e_lullaby: {
      fx: { ending: 'lullaby', obj: 'mq9.tower' },
      l: [
        ['seraphine', '"Let me," Seraphine says. "I put them in you. Let me sing them out."'],
        ['n', 'She sings the whole song, the one she couldn\'t bear for three hundred years. You sing the three notes under it.'],
        ['n', 'The bells take up the tune. The memories leave you gently this time, one verse at a time, like children being called in for supper.'],
        ['n', 'With each verse, Seraphine changes. A line at her eye. Grey at her temple. Three hundred birthdays coming home to her at once.'],
        ['note', 'She is giving back what she paid, so you don\'t have to pay at all.'],
        ['seraphine', 'At the end she is an old woman, smiling, out of breath at last. "Oh," she says. "Oh, my knees."'],
        ['n', 'She lives four more years. They are, she says, the best she has ever had. You bake her a cake on every one of them.'],
      ],
      end: true,
    },
    e_surprise: {
      fx: { ending: 'surprise', obj: 'mq9.tower', flag: 'noctis_freed' },
      l: [
        ['n', 'Noctis is sitting on the top step, knees up, eyes squeezed shut. He promised not to look.'],
        ['n', 'You don\'t ring the bells. You don\'t take the altar. You sit down next to him, put two fingers in your mouth, and whistle the way Mira taught him — so loud the bells shiver.'],
        ['noctis', 'His eyes fly open. "That\'s… that\'s not in any of them."'],
        ['n', 'In the Whispering Woods, two hundred and six people hear a whistle they know, and start walking home. Not out of you. Out of him. He has been holding them all along, and he only needed someone to call them.'],
        ['noctis', '"I don\'t know what happens next," he whispers. "I don\'t know what happens next!" He is laughing. He is crying. He is, very slightly, taller.'],
        ['note', 'For the first time in three hundred years, Noctis does not know how this ends.'],
        ['n', 'Everyone else you carry, you give back slowly, at the well in Hollowmere, with a small boy beside you who keeps asking "and then what?" and actually wants to know.'],
      ],
      end: true,
    },
    e_siren: {
      fx: { ending: 'siren', obj: 'mq9.tower' },
      l: [
        ['n', 'You don\'t sing the three notes. You sing hers.'],
        ['n', 'Two hundred steps below, a chain that was rusted nearly through hears the song it was made to resist, and parts like thread.'],
        ['Aeria', 'Aeria\'s voice comes up through the stone, through the bells, through you. "Oh, little vault. Oh, thank you."'],
        ['n', 'She sings, and Elaria forgets. Not some of it. All of it. Kings, debts, grudges, griefs, names, the Moonfall itself. Forty thousand memories pour out of you into her open mouth like wine.'],
        ['note', 'It is the most beautiful thing you have ever heard. That is the trouble with sirens.'],
        ['n', 'In the morning, a city of strangers wakes up and is very kind to one another, because no one remembers a reason not to be.'],
        ['n', 'Somewhere on the cursed sea, a woman with water in her hair is singing. You are on the shore. You don\'t know why. You don\'t know your name. You feel, for the first time, completely empty, and you think it might be happiness.'],
      ],
      end: true,
    },
    e_hollow: {
      fx: { ending: 'hollow', obj: 'mq9.tower' },
      l: [
        ['n', 'You reach for the rope and find there is almost nobody left to reach. You gave yourself away a piece at a time, and you never let anyone hold the pieces.'],
        ['n', 'The moon looks in through the tower window. It has been looking for three hundred years.'],
        ['note', 'If you will not choose, something else will.'],
        ['n', 'It chooses the way the moon chooses everything: slowly, coldly, and all at once. The memories settle in you like silt, and you settle with them.'],
        ['n', 'Elaria goes on forgetting. You go on holding. In the cathedral there is a statue of a girl on the altar that nobody remembers being carved.'],
        ['seraphine', 'Seraphine plants violets at its feet every morning.', { notFlag: 'ending_lullaby' }],
      ],
      end: true,
    },
  };
}

export const STORY2 = {
  // ============================================================ Chapter 1
  ch1_laugh: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'At the foot of the bell-tower stair, a woman is selling candles from a tray at the cathedral door. A baby sleeps in a sling against her chest.'],
          ['seraphine', '"Marta," Seraphine murmurs. "She comes every week. Lights one candle. Never says for whom."'],
          ['n', 'The baby wakes, finds your finger, and holds on with startling strength. You laugh before you can help it.'],
          ['n', 'Marta goes white.'],
          ['Marta', '"That laugh." Her voice cracks. "Where did you get that laugh?"'],
          ['n', 'Something inside you turns toward her, the way a flower turns toward a window: a sunlit kitchen, flour on small hands, a child laughing at something you said.'],
          ['n', 'It isn\'t yours. You have never been more sure of anything. It is pulling toward her, and you could let it go.'],
          ['note', 'Something inside you belongs to Marta.'],
        ],
        c: [
          { t: 'Let it go to her.', path: 'compassionate', fx: { giveEcho: 'laugh', flag: 'marta_remembers', rel: { seraphine: { trust: -2 }, noctis: { trust: 4 } } }, to: 'gave' },
          { t: 'Hold on to it.', path: 'secretive', fx: { keepEcho: 'laugh', flag: 'marta_spared', rel: { seraphine: { affinity: 3 }, noctis: { trust: -2 } } }, to: 'kept' },
        ],
      },
      gave: {
        l: [
          ['n', 'You open your hand, though there is nothing in it. The laugh leaves you like a held breath.'],
          ['Marta', '"Elsie." Marta sits down hard on the step. "Her name was Elsie. She drowned in the millpond the summer she turned six."'],
          ['Marta', '"I couldn\'t breathe for a year. So I paid them to take her, and I was happy, and now…"'],
          ['n', 'She is crying, and the baby is crying, and she holds your sleeve as if she is the one drowning.'],
          ['Marta', '"Thank you," she says. "I hate you. Thank you."'],
          ['n', 'By evening a grave behind the cathedral that has been blank for years has a name on it. You feel lighter, and a little less like anyone.'],
        ],
        to: 'after',
      },
      kept: {
        l: [
          ['n', 'You close around the memory, gently, and keep it.'],
          ['n', 'The pull fades. Marta blinks, then laughs at herself.'],
          ['Marta', '"Forgive me. For a moment you sounded like…" She frowns. "Like no one. Silly." She tucks a candle into your hand for luck and goes back to her tray, humming.'],
          ['n', 'Later, alone in the nave, you laugh again on purpose. It is yours now. A grave behind the cathedral stays blank.'],
        ],
        to: 'after',
      },
      after: {
        l: [
          ['seraphine', 'Seraphine has been watching. "You did that," she says quietly. "I have seen only one other person who could."'],
          ['a', '"Who?"'],
          ['seraphine', '"Ask me again when you are stronger." She looks up at the moon. "Thirteen nights. It is always thirteen. Use them well, child."'],
          ['note', 'What you keep and what you give back is recorded in the Journal, under Lives Inside You.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 2
  ch2_lieutenant: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['note', 'That night'],
          ['n', 'You dream of rain. A borrowed coat held over two heads. A woman laughing up at you, and your own voice, deeper than it should be, saying "I do."'],
          ['n', 'Someone says "Edric" as if it were a promise. You wake with the taste of wedding cake and someone else\'s happiness.'],
          ['note', 'Morning'],
          ['cael', 'Cael is waiting at the cathedral door, unshaven, his gloves crushed in one fist. "My lieutenant didn\'t report for the dawn watch. Edric Vane. Eleven years at my side."'],
          ['cael', '"His wife opened the door and asked who I was looking for. She wasn\'t lying, Astoria. She doesn\'t know him. And I\'m starting to forget his face."'],
          ['a', '"Brown eyes. A scar through his left eyebrow. He laughs with his whole chest."'],
          ['cael', 'Cael stares at you. "How do you know that?"'],
        ],
        fx: { echo: 'edric' },
        to: 'house',
      },
      house: {
        l: [
          ['n', 'Lantern Row. A narrow house with a blue door, and a boy chalking stars on the step.'],
          ['n', 'At the gate stands the man from your dream, faded at the edges like a drawing left in the sun. The boy looks straight through him.'],
          ['Edric', '"You can see me." Edric\'s voice is barely there. "Then you\'re her. The one it all goes into."'],
          ['Edric', '"I owed House Marchetti eight hundred crowns. When the Accord takes a man, his debts are forgotten with him. So I sold myself. My wife keeps the house. My boy eats."'],
          ['Edric', '"If you give me back, the debt comes back with me. They\'ll take the house. Please. I chose this."'],
          ['cael', 'Cael can\'t see him, but he is looking at the gate as if he feels a draught. "Astoria. If there\'s anything you can do. Anything."'],
        ],
        c: [
          { t: '"Your son should know his father." Give him back.', path: 'compassionate', fx: { giveEcho: 'edric', flag: 'edric_returned', rel: { cael: { trust: 8, affinity: 4 }, noctis: { trust: 3 }, lucien: { trust: -3 } } }, to: 'gave' },
          { t: '"It was your choice to make." Keep him.', path: 'secretive', fx: { keepEcho: 'edric', flag: 'edric_kept', rel: { cael: { trust: -6 }, lucien: { trust: 3 }, seraphine: { affinity: 2 } } }, to: 'kept' },
          { t: 'Ask Evelyne to strike the debt from her mother\'s books first.', req: { rel: { evelyne: { affinity: 8 } } }, fx: { giveEcho: 'edric', flag: ['edric_returned', 'evelyne_struck_debt'], rel: { cael: { trust: 8, affinity: 4 }, evelyne: { trust: 6 } } }, to: 'struck' },
        ],
      },
      gave: {
        l: [
          ['n', 'You let him go into the world. Edric becomes solid by degrees, like a lamp being turned up.'],
          ['n', 'The boy drops his chalk. "Papa?"'],
          ['n', 'His wife runs out, stops, and puts both hands over her mouth. Cael says "Edric" and his voice breaks on it.'],
          ['Edric', 'Over his son\'s head, Edric looks at you. "You had no right," he says. He holds the boy tighter.'],
          ['n', 'By noon a Marchetti clerk is knocking on the blue door with a ledger.'],
        ],
        to: 'after',
      },
      kept: {
        l: [
          ['n', 'You hold the dream of rain close, and you do not let it go.'],
          ['Edric', 'Edric bows his head. "Thank you." He fades a little more, and stands at his own gate, watching his son draw stars.'],
          ['cael', 'Cael looks from the gate to you. "You know something." You say nothing. He walks away without another word.'],
          ['n', 'For weeks afterwards he sets out a second cup in the guardhouse, and can\'t remember for whom.'],
        ],
        to: 'after',
      },
      struck: {
        l: [
          ['n', 'Evelyne reads your note twice. That evening a line in her mother\'s great ledger is struck through, in her neat, careful hand.'],
          ['n', 'When you let Edric go into the world there is no debt waiting for him. His son drops his chalk. His wife runs out. Cael says his name.'],
          ['evelyne', 'Evelyne finds you later, smiling too brightly. "Mother checks her books every quarter, darling. Let\'s hope she\'s busy."'],
        ],
        to: 'after',
      },
      after: { l: [['note', 'Edric Vane will remember what you chose.']], end: true },
    },
  },

  // ============================================================ Chapter 3
  ch3_witness: {
    bg: 'library',
    nodes: {
      start: {
        l: [
          ['n', 'Behind the cabinet of family records is a second ledger, bound in violet leather and fastened with a silver crescent: the Accord\'s book of sales.'],
          ['n', 'Every page is a list of names struck through in violet ink. Beside each one: a date, a price, and who paid.'],
        ],
        c: [
          { t: 'Compare the dates with the nights something settled inside you.', path: 'suspicious', to: 'match' },
          { t: 'Look for a name you know.', to: 'match' },
        ],
      },
      match: {
        l: [
          ['note', 'Edric Vane, lieutenant. Paid by: himself.'],
          ['n', 'Dated the night you dreamt of a wedding in the rain.'],
          ['note', 'Elsie, aged six. Paid by: her mother.'],
          ['n', 'You can feel the laugh, or the space where it was.'],
          ['n', 'And you understand all at once. When someone is sold, everything anyone knew of them has to go somewhere. It comes to you.'],
          ['note', 'The vanished don\'t go anywhere. They go into you.'],
          ['n', 'Your finger stops on a fresh entry. Nell Brannock, maid. Paid by: Lord Ashgrove. Under it, one memory: what the boy saw. Tam, stable-boy, aged eleven. Paid by: his mother.'],
          ['n', 'You touch the ink, and you are standing in a stable-yard at dawn, very small, looking up at the north tower. A maid in a grey dress. A lord\'s hand on her back. Then only the sky.'],
          ['note', 'Something inside you belongs to Tam.'],
        ],
        fx: { echo: 'witness', solve: 'myst_guards' },
        to: 'tam',
      },
      tam: {
        l: [
          ['n', 'You find Tam in the palace stables, brushing a grey mare and whistling through the gap where a front tooth should be. He sleeps well. You can tell.'],
          ['n', 'Lord Ashgrove\'s carriage stands in the next bay. He is dining with the queen tonight.'],
          ['cael', 'Cael goes very quiet when you tell him. "Without a witness I can\'t touch a lord. With one, I can hang him. And the witness is eleven."', { met: 'cael' }],
        ],
        c: [
          { t: 'Give Tam back what he saw. Nell deserves to be remembered.', path: 'aggressive', fx: { giveEcho: 'witness', flag: 'tam_remembers', rel: { cael: { trust: 6 }, noctis: { trust: 3 }, seraphine: { trust: -3 } } }, to: 'gave' },
          { t: 'Carry it for him. He\'s a child.', path: 'compassionate', fx: { keepEcho: 'witness', flag: 'tam_spared', rel: { seraphine: { affinity: 3 }, cael: { trust: -3 } } }, to: 'kept' },
          { t: 'Tell Cael everything you saw through Tam\'s eyes, and let him act on your word alone.', req: { rel: { cael: { trust: 10 } } }, fx: { keepEcho: 'witness', flag: ['tam_spared', 'ashgrove_by_cael'], rel: { cael: { trust: 10, affinity: 4 } } }, to: 'cael' },
        ],
      },
      gave: {
        l: [
          ['n', 'You give it back as gently as you can. It is not gentle.'],
          ['n', 'Tam drops the brush. His face crumples, and he is not a stable-boy any more. He is a child at dawn, looking up at a tower.'],
          ['Tam', '"Nell," he whispers. "Nell used to save me the apple cores. He pushed her. He pushed her."'],
          ['n', 'Two days later Lord Ashgrove is arrested on a stable-boy\'s word, and Nell Brannock\'s name is read aloud in court. The same night someone throws a stone through Tam\'s mother\'s window.'],
        ],
        to: 'first',
      },
      kept: {
        l: [
          ['n', 'You keep the north tower, the grey dress and the sky. Tam goes on whistling.'],
          ['n', 'That evening Lord Ashgrove raises a glass to the queen, and you know exactly what his hands have done.'],
          ['n', 'Nell Brannock stays no one. You are the only person alive who knows she was ever anyone at all.'],
        ],
        to: 'first',
      },
      cael: {
        l: [
          ['cael', '"I believe you." Cael says it like a vow. "I don\'t know how you know. I don\'t need to."'],
          ['n', 'He arrests Lord Ashgrove at the queen\'s own table, on nothing but your word. The court is outraged. By morning Cael is captain no longer.'],
          ['cael', '"Worth it," he says, unbuckling his sword belt. "Nell has a name again. And the boy still whistles."'],
        ],
        to: 'first',
      },
      first: {
        l: [
          ['n', 'That night you go back to the violet ledger and turn to the very first page.'],
          ['note', 'Year one of the Moonfall. One bell-singer, to be forgotten. Paid for by: the bell-singer.'],
          ['n', 'Someone was sold first, and paid with herself.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 4
  ch4_request: {
    bg: 'ballroom',
    nodes: {
      start: {
        l: [
          ['n', 'At midnight the music stops. A woman in silver and black climbs the dais: Duchess Marchetti, Evelyne\'s mother, Keeper of the Accord.'],
          ['The Duchess', '"Friends. To the Veil." She raises her glass, and looks straight at you.'],
          ['n', 'Three hundred masked guests turn toward you, and bow.'],
          ['n', 'They all know what you are. Every one of them. You were the only person in the room who didn\'t.'],
          ['The Duchess', 'The Duchess crosses the floor to you, smiling. "Every name inside you was a mercy someone begged me for. Not one was taken against the wishes of the one who paid."'],
          ['The Duchess', '"I hear you\'ve been giving things back. How kind. Do ask Marta how kind it felt."', { returned: 'laugh' }],
          ['The Duchess', '"I hear you keep what you\'re given. Good girl. That is what you are for."', { kept: 'laugh' }],
        ],
        fx: { solve: 'myst_accord' },
        to: 'balcony',
      },
      balcony: {
        l: [
          ['n', 'Evelyne finds you on the balcony with her mask in her hand. Without it she looks fourteen.'],
          ['evelyne', '"I was fourteen," she says, as if you had asked. "Mother said: give me one name, darling. Just one. So you understand what we do."'],
          ['evelyne', '"I gave her Ilse. My best friend. She laughed too loudly at dinner, and I was embarrassed, and I said her name."'],
          ['evelyne', '"Whoever sells a name is the only one left who remembers it. That\'s the rule. Everyone else forgot Ilse that night. I never have."'],
          ['evelyne', 'She grips your wrists. "You can take, can\'t you? You\'re the altar. Take her out of me. Please. I can\'t carry her any more."'],
        ],
        c: [
          { t: '"No. If you forget her, no one will ever be sorry."', path: 'aggressive', fx: { flag: 'evelyne_carries', rel: { evelyne: { trust: 6, affinity: -3 }, noctis: { trust: 3 } } }, to: 'refused' },
          { t: '"Give her to me."', path: 'compassionate', fx: { takeEcho: 'ilse', flag: 'evelyne_took', rel: { evelyne: { affinity: 8 }, seraphine: { affinity: 3 }, noctis: { trust: -3 } } }, to: 'took' },
          { t: '"Then let\'s carry her together."', req: { rel: { evelyne: { affinity: 28 } } }, fx: { echo: 'ilse', flag: ['evelyne_carries', 'evelyne_shared'], rel: { evelyne: { trust: 10, affinity: 6 } } }, to: 'shared' },
        ],
      },
      refused: {
        l: [
          ['evelyne', 'She stares at you. Then she laughs, a thin, cracked sound. "That\'s cruel." A breath. "…That\'s fair."'],
          ['n', 'She puts her mask back on. Behind it she is still carrying Ilse: the heaviest thing she owns, and the only thing her mother didn\'t give her.'],
        ],
        end: true,
      },
      took: {
        l: [
          ['n', 'You take her hands, and something cold and bright passes into you: a girl with ink on her cuffs, laughing too loudly at dinner.'],
          ['evelyne', 'Evelyne breathes out. Her face smooths like a ribbon pulled straight. "Oh," she says. "Oh, that\'s lighter."'],
          ['n', 'She smiles her mother\'s smile, perfectly. It occurs to you that nothing will stop her doing it again now.'],
          ['note', 'You took a memory from someone. You can take, as well as hold.'],
        ],
        end: true,
      },
      shared: {
        l: [
          ['n', 'You take half. Only half. Ilse settles between you like a coat worn by two people.'],
          ['evelyne', '"Oh," Evelyne whispers. "It still hurts." She laughs, wet-eyed. "It\'s supposed to, isn\'t it?"'],
          ['n', 'For the first time all night, her smile is her own.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 5
  ch5_burden: {
    bg: 'woods',
    nodes: {
      start: {
        l: [
          ['n', 'That night, by the well, you lay out everything you remember like cards on a table.'],
          ['n', 'Flour on a child\'s hands. Rain on a soldier\'s coat. A stable-yard at dawn, seen from very low down. A ledger of names in a boy\'s round handwriting.'],
        ],
        c: [
          { t: 'They\'re all mine. I just don\'t remember living them.', l: [['n', 'A child\'s hands. A soldier\'s hands. A mother\'s hands. They can\'t all have been yours.']], to: 'truth' },
          { t: 'They\'re all from the same night.', l: [['n', 'No. The wedding was in spring. The tower was at dawn in winter. The kitchen smelled of summer.']], to: 'truth' },
          { t: 'They all belong to different people.', path: 'suspicious', to: 'truth' },
        ],
      },
      truth: {
        l: [
          ['note', 'None of them are yours.'],
          ['noctis', 'Noctis is sitting on the edge of the well, watching you work it out. "There," he says softly. "Now you know what you are."'],
          ['noctis', '"Everything Elaria sells has to be kept somewhere. You\'re the somewhere."'],
          ['noctis', '"Except two hundred and six of them. I never let the crown have those." He taps his temple. "Mira, who taught me to whistle. Old Hobb and his dog, Biscuit. The baker\'s twins."'],
          ['noctis', '"Carrying them is what put me outside time. Eight years old for three hundred years." He tries to smile. "I\'d like to be nine."'],
          ['noctis', '"You could take them. You\'re the Veil. Take them and I\'d finally…"'],
          ['noctis', 'He stops. "No. Don\'t. If you take them I\'ll forget them. I\'ll be the last person who ever forgot Mira, and then she\'s only in you." His voice cracks. "Don\'t listen to me. Do. I don\'t know."'],
        ],
        fx: { solve: ['myst_hollowmere', 'myst_noctis'] },
        c: [
          { t: '"They\'re yours to carry. I won\'t take them."', path: 'suspicious', fx: { flag: 'noctis_carries', rel: { noctis: { trust: 8 }, cael: { trust: 2 } } }, to: 'refused' },
          { t: '"Give them to me. You\'ve carried them long enough."', path: 'compassionate', fx: { takeEcho: 'hollowmere', flag: 'noctis_freed', rel: { noctis: { affinity: 6 }, seraphine: { affinity: 3 } } }, to: 'took' },
        ],
      },
      refused: {
        l: [
          ['noctis', '"Good." He is crying, which you have never seen. "Thank you. I hate you a bit. That\'s allowed."'],
          ['n', 'He starts whistling the tune Mira taught him three hundred years ago, and the woods go quiet to listen.'],
        ],
        to: 'bells',
      },
      took: {
        l: [
          ['n', 'Two hundred and six people pour into you: doorposts, kitchens, a dog called Biscuit, a well at the centre of everything. You nearly fall.'],
          ['n', 'Noctis blinks like someone waking up. He looks at the ruins as if he has never seen them before.'],
          ['noctis', '"Where are we?" He looks at his hands. They are a little bigger than they were. "Astoria? Why does my chest hurt?"'],
          ['n', 'He doesn\'t know what Hollowmere was. He will never be eight again.'],
        ],
        to: 'bells',
      },
      bells: {
        l: [
          ['n', 'Walking home, without deciding to, you hum three notes.'],
          ['n', 'Every bell in Elaria answers: all of them, at once, from the cathedral to the smallest chapel in the woods.'],
          ['n', 'Then silence, and the moon a little brighter, as if it heard.'],
          ['note', 'You can ring the bells. With the bells, you could give everything back at once.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 6
  ch6_confession: {
    bg: 'library',
    nodes: {
      start: {
        l: [
          ['n', 'Lucien is waiting in the hidden gallery when you come back. He has been crying, or not sleeping. With Lucien it is hard to tell.'],
          ['lucien', '"I was going to let you work it out on your own. That seemed cowardly, even for me."'],
          ['lucien', '"Three hundred years ago the crown wanted the moon. I was twenty-two and very clever. I built the rite that brought it down, and they paid for it with Hollowmere."'],
          ['lucien', '"You sang the rite. You didn\'t know what it would cost. When you saw, you offered to hold all of it, so that one day you could give it back."'],
          ['lucien', '"The houses agreed, and then made sure you never could. A vault that remembers it was a woman starts to want things. So they had me write it." He touches the inscription. "She must never remember who she was."'],
          ['lucien', '"I sent you the invitation. Three hundred years of keeping you empty, and this time I wanted you to come home." He holds out his hands, wrists together. "Do what you like with me."'],
          ['n', 'Aeria\'s voice, in your head: watch his hands.', { flag: 'doubt_lucien' }],
          ['lucien', '"And whatever Aeria told you down there," he adds quietly, "most of it is true. The rest is under the cathedral. Go and look."', { flag: 'aeria_told' }],
          ['cael', 'Cael is in the doorway. You don\'t know how long he has been standing there. "Two hundred and six people, Lucien."'],
        ],
        fx: { solve: ['myst_portrait', 'myst_invitation', 'myst_lucien_night'] },
        c: [
          { t: '"Arrest him, Cael. Someone has to answer for Hollowmere."', path: 'aggressive', fx: { flag: 'lucien_exposed', rel: { lucien: { trust: -15 }, cael: { trust: 8 }, noctis: { trust: 4 } } }, to: 'exposed' },
          { t: '"Let him go. He has spent three hundred years paying."', path: 'compassionate', fx: { flag: 'lucien_forgiven', rel: { lucien: { trust: 12, affinity: 6 }, cael: { trust: -6 }, seraphine: { affinity: 2 } } }, to: 'forgiven' },
        ],
      },
      exposed: {
        l: [
          ['lucien', 'Lucien almost smiles. "Finally."'],
          ['n', 'Cael takes his wrists, not ungently. The black ledger of the forgotten goes into a guard\'s evidence satchel.'],
          ['cael', '"I\'m sorry," Cael tells you, and means it. "But it should have been somebody\'s job to say no."'],
        ],
        to: 'bell',
      },
      forgiven: {
        l: [
          ['cael', 'Cael looks at you for a long time. "Someone should answer for it."'],
          ['lucien', '"Someone will," Lucien says quietly. "Just not today." He picks up the ledger and holds it like something alive.'],
          ['n', 'Cael leaves without looking back.'],
        ],
        to: 'bell',
      },
      bell: {
        l: [
          ['note', 'That night'],
          ['n', 'The cathedral bell rings thirteen times. Then, impossibly, a fourteenth.'],
          ['n', 'Beneath the cathedral, an iron door with seven locks swings open on its own.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 7
  ch7_descent: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'Below the iron door the stair winds down and down. At the bottom is a round chamber, and in it a stone reliquary carved with crescents. The air tastes of violets.'],
          ['n', 'You put your hand on the stone, and the chamber shows you what it saw.'],
          ['note', 'Hollowmere · three hundred years ago'],
          ['n', 'A valley. A village with names carved on every doorpost. A girl in a black dress singing to the bells at dusk, and everyone stopping to listen.'],
          ['n', 'A boy of eight with mismatched eyes sits on the well, swinging his legs, whistling along badly. Noctis.'],
          ['n', 'A young man with ink on his hands comes up the valley road with a royal seal. He laughs at her singing, then stops laughing and just listens. Lucien.'],
          ['note', 'The cove'],
          ['n', 'Below the hill, where the river meets the sea, a woman sits on a black rock and sings, and ships turn toward her and break. Aeria.'],
          ['n', 'The young man with inky hands goes down to her shore night after night. She is teaching him a song. It has the shape of a rite.'],
          ['n', '"Bring the moon down," she tells him, "and everything Elaria forgets will run downhill to the sea. To me."'],
          ['note', 'The Moonfall'],
          ['n', 'The crown asks the bell-singer to sing at a rite. A blessing, they say. She sings, and the moon comes down the sky like a falling lantern.'],
          ['n', 'In the valley, every doorpost name is scraped away in a single night. Two hundred and six people stop being anyone.'],
          ['n', 'When Lucien understands what he has helped her build, he tells her it is over. She laughs at him. The next night he goes back with chains and with the bell-singer\'s song, and sings her down onto her rock in the dark.'],
          ['note', 'The bargain'],
          ['n', 'She stands in this chamber with the noble houses around her. "Put it in me," she says. "All of it. Not the sea. Not her. Let me hold it until I can give it back."'],
          ['n', 'The houses agree. A priestess in violet lays a hand on her heart and begins. Seraphine, exactly as she is now.'],
          ['n', 'Last of all, the young man with inky hands is told what to carve. He does it with his face turned away.'],
          ['note', 'Aeria told you the truth. She only left out why.', { flag: 'aeria_told' }],
        ],
        to: 'done',
      },
      done: { fx: { obj: 'mq7.descend', solve: 'myst_moonfall' }, end: true },
    },
  },

  ch7_seraphine: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['a', '"I saw you. In the chamber. Three hundred years ago."'],
          ['seraphine', 'Seraphine sets down her taper. "Then you know."'],
          ['seraphine', '"I was the Accord\'s priestess. When the grieving came to the altar, I took what they could not carry, and I put it in you. Forty thousand people, more or less. I stopped counting in the second century."'],
          ['seraphine', '"Every generation you wake, and at the eclipse I carry you back to the altar, and you forget, and I begin again."'],
          ['seraphine', '"I am not sorry, child. Forty thousand people slept because of you. I am only sorry it had to be you."'],
        ],
        fx: { solve: ['myst_seraphine', 'myst_arrival'] },
        c: [
          { t: '"You had no right to put them in me."', path: 'aggressive', fx: { flag: 'seraphine_condemned', rel: { seraphine: { trust: -6 } } }, l: [['seraphine', '"No," she agrees. "None of us did. It was done anyway, and I have kept it gently. That is all I can say for myself."']], to: 'end' },
          { t: '"Did it help them? Truly?"', path: 'suspicious', fx: { rel: { seraphine: { trust: 4 } } }, l: [['seraphine', '"Some of them. A mother who could get out of bed again. A soldier who stopped screaming at night." She pauses. "And some paid to forget people who did not deserve forgetting. I took those too. I did not ask."']], to: 'end' },
          { t: 'Take her hand.', path: 'compassionate', fx: { flag: 'seraphine_forgiven', rel: { seraphine: { affinity: 6, trust: 6 } } }, l: [['n', 'Her hand is cold and very old. She holds on as if you were the one who might disappear.']], to: 'end' },
        ],
      },
      end: {
        l: [['seraphine', '"The reliquary below holds the one thing in you that was ever truly yours. You asked me never to give it to you." She looks away. "I will not stop you. I will not help you."']],
        fx: { obj: 'mq7.seraphine' },
        end: true,
      },
    },
  },

  ch7_reliquary: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'The reliquary opens at your touch. Inside, on violet silk, lies a single pressed violet. When you look at it you hear singing, a long way off, in your own voice.'],
          ['note', 'The last memory that is truly yours.'],
          ['n', 'Beside it is a note in your own handwriting, three hundred years old: "If you are reading this, you found it. Please don\'t. Whatever you are now, let her be someone new."'],
        ],
        c: [
          { t: 'Take it back. You want to be someone.', path: 'aggressive', fx: { keepEcho: 'own', self: 1, flag: 'own_taken', rel: { noctis: { trust: 3 }, seraphine: { trust: -3 } } }, to: 'took' },
          { t: 'Leave it sealed. She asked you not to.', path: 'secretive', fx: { flag: 'own_sealed', rel: { seraphine: { affinity: 4 }, lucien: { trust: 3 } } }, to: 'left' },
        ],
      },
      took: {
        l: [
          ['n', 'You pick up the violet, and three hundred years fall into place.'],
          ['n', 'Your mother braiding your hair in a sunlit cathedral, humming. The weight of the bell rope. The first time a young man with inky hands called your singing "adequate", and meant the opposite.'],
          ['n', 'Your name is Astoria. It always was. Now it means something.'],
          ['note', 'You remember who you were. She asked you never to, and you did anyway.'],
          ['n', 'You want things now: to live, to stay, to be more than a vault. It is frightening how much.'],
        ],
        to: 'done',
      },
      left: {
        l: [
          ['n', 'You close the lid. Whoever she was, she had her reasons, and she trusted whoever came after her to respect them.'],
          ['n', 'Marta trusted the same thing, once. You gave her back what she paid to lose. It feels different, now that it is you.', { returned: 'laugh' }],
          ['n', 'You kept Marta\'s secret for her. Now you keep your own.', { kept: 'laugh' }],
        ],
        to: 'done',
      },
      done: { fx: { obj: 'mq7.reliquary' }, end: true },
    },
  },

  ch7_duchess: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'At the top of the stair a woman in silver and black is waiting with a lantern.'],
          ['The Duchess', '"Three nights to the eclipse," says Duchess Marchetti. "Then you sleep, and so does everyone inside you. That is how it has always gone, and how Elaria has stayed in one piece."'],
          ['The Duchess', '"Every time you wake, you start giving things back. Every time, I tidy up after you. This time I would rather we came to an arrangement."'],
          ['The Duchess', '"Think about what you owe the people who paid. I will be in touch."'],
          ['n', 'She is gone before you can answer. Behind you, Seraphine is shaking.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 8
  ch8_sold: {
    bg: 'royal',
    nodes: {
      start: {
        l: [['note', 'Morning']],
        go: [{ cond: { closest: 'lucien' }, to: 'lucien' }, { cond: { closest: 'evelyne' }, to: 'evelyne' }, { cond: {}, to: 'cael' }],
      },
      lucien: {
        fx: { flag: 'forgot_lucien', echo: 'companion' },
        l: [
          ['n', 'Lucien passes you on the palace steps. You say his name.', { notFlag: 'lucien_exposed' }],
          ['n', 'Lucien is being led up from the cells for questioning as you pass. You say his name.', { flag: 'lucien_exposed' }],
          ['lucien', 'He turns, politely puzzled. "I\'m sorry. Have we met?"'],
          ['n', 'Then it lands in you all at once: every moment he ever spent with you, from his side of it. How he watched you dance. What he never said.'],
        ],
        to: 'note',
      },
      cael: {
        fx: { flag: 'forgot_cael', echo: 'companion' },
        l: [
          ['n', 'Cael is at the guardhouse door. You say his name, and he smiles the way he smiles at everyone.'],
          ['cael', '"Miss? Can I help you?"'],
          ['n', 'Then it lands in you all at once: every moment he ever spent with you, from his side of it. Every time he walked a little slower so that you could keep up.'],
        ],
        to: 'note',
      },
      evelyne: {
        fx: { flag: 'forgot_evelyne', echo: 'companion' },
        l: [
          ['n', 'Evelyne sweeps past you in the café with her friends, then doubles back.'],
          ['evelyne', '"Darling, I adore your dress. Do I know you? I feel that I ought to."'],
          ['n', 'Then it lands in you all at once: every moment she ever spent with you, from her side of it. How often she meant what she said, and how hard that was for her.'],
        ],
        to: 'note',
      },
      note: {
        l: [
          ['note', 'Someone you love doesn\'t know you. Everything they knew of you is inside you now.'],
          ['n', 'A card is waiting on the cathedral altar, written in silver ink.'],
          ['note', '"I sold their memories of you myself. Consider it a lesson in what you are. M."'],
        ],
        end: true,
      },
    },
  },

  ch8_stranger_lucien: {
    nodes: {
      start: {
        l: [
          ['lucien', '"You again." Lucien is polite, and puzzled. "People keep telling me I ought to know you. I find that I would like to."'],
          ['n', 'Inside you his memories of you wait: the dance, the hand, the ledger in the dark. To give them back you have to let them go, and they are heavy, and they are made of you.'],
          ['note', 'Giving back everything he knew of you will cost two pieces of yourself.'],
        ],
        c: [
          { t: 'Give him back everything he knew of you.', path: 'compassionate', fx: { giveEcho: 'companion', self: -1, flag: 'restored_lucien', obj: 'mq8.find', rel: { lucien: { trust: 6 } } }, to: 'restored' },
          { t: 'Let him go. Stay whole.', path: 'secretive', fx: { keepEcho: 'companion', flag: 'letgo_lucien', obj: 'mq8.find' }, to: 'letgo' },
        ],
      },
      restored: {
        l: [
          ['n', 'It goes out of you like warmth leaving a room.'],
          ['lucien', 'Lucien sways. His hand goes to his chest. "Astoria," he says, as if he has been looking for the word all day. "What did that cost you?"'],
          ['a', '"Enough."'],
        ],
        end: true,
      },
      letgo: {
        l: [
          ['n', 'You keep it. He will never know what he lost.'],
          ['lucien', '"Well," Lucien says, "it was a pleasure to meet you, whoever you are." He means it. That is the worst part.'],
        ],
        end: true,
      },
    },
  },

  ch8_stranger_cael: {
    nodes: {
      start: {
        l: [
          ['cael', '"Miss." Cael touches his brow. "You keep looking at me like I owe you something. Do I?"'],
          ['n', 'Inside you his memories of you wait: the gate at Lantern Row, the second cup, the way he said your name when he was frightened for you. They are heavy, and they are made of you.'],
          ['note', 'Giving back everything he knew of you will cost two pieces of yourself.'],
        ],
        c: [
          { t: 'Give him back everything he knew of you.', path: 'compassionate', fx: { giveEcho: 'companion', self: -1, flag: 'restored_cael', obj: 'mq8.find', rel: { cael: { trust: 6 } } }, to: 'restored' },
          { t: 'Let him go. Stay whole.', path: 'secretive', fx: { keepEcho: 'companion', flag: 'letgo_cael', obj: 'mq8.find' }, to: 'letgo' },
        ],
      },
      restored: {
        l: [
          ['n', 'It goes out of you like warmth leaving a room.'],
          ['cael', 'Cael grabs the doorframe. "Astoria." Then, furious, frightened: "They sold me. They sold me to get at you." He pulls you into his arms and doesn\'t let go.'],
        ],
        end: true,
      },
      letgo: {
        l: [
          ['n', 'You keep it. He will never know what he lost.'],
          ['cael', '"Well. If you ever need anything, miss, the guardhouse is always open." He says it the way he says it to everyone.'],
        ],
        end: true,
      },
    },
  },

  ch8_stranger_evelyne: {
    nodes: {
      start: {
        l: [
          ['evelyne', '"You again! Mother says I\'m not to talk to you." Evelyne leans closer. "Which makes you the most interesting person in Elaria."'],
          ['n', 'Inside you her memories of you wait: the dance, the balcony, Ilse. They are heavy, and they are made of you.'],
          ['note', 'Giving back everything she knew of you will cost two pieces of yourself.'],
        ],
        c: [
          { t: 'Give her back everything she knew of you.', path: 'compassionate', fx: { giveEcho: 'companion', self: -1, flag: 'restored_evelyne', obj: 'mq8.find', rel: { evelyne: { trust: 6 } } }, to: 'restored' },
          { t: 'Let her go. Stay whole.', path: 'secretive', fx: { keepEcho: 'companion', flag: ['letgo_evelyne', 'evelyne_lost'], obj: ['mq8.find', 'mq8.evelyne'] }, to: 'letgo' },
        ],
      },
      restored: {
        l: [
          ['n', 'It goes out of you like warmth leaving a room.'],
          ['evelyne', 'Evelyne\'s fan clatters to the floor. "Mother did that," she says. "To me." Something in her face closes like a door.'],
        ],
        go: [{ cond: { flag: 'evelyne_took' }, to: 'against' }, { cond: {}, to: 'ally' }],
      },
      against: {
        l: [['evelyne', '"She was right to," Evelyne says at last, steadily. "You make everything hurt again. I don\'t even remember what I was so upset about at the masquerade, and I\'m glad."']],
        fx: { flag: 'evelyne_against', obj: 'mq8.evelyne' },
        end: true,
      },
      ally: {
        l: [
          ['evelyne', 'She presses a heavy book into your arms: her mother\'s order book. "Every name for the next thirty years, darling. Already paid for. She can\'t sell what isn\'t written down."'],
          ['n', 'No one else can be sold this season.'],
        ],
        fx: { flag: 'evelyne_ally', obj: 'mq8.evelyne', rel: { evelyne: { trust: 8 } } },
        end: true,
      },
      letgo: {
        l: [
          ['n', 'You keep it. She will never know what she lost.'],
          ['evelyne', '"Well, you\'re no fun," Evelyne says, and sweeps away laughing. Nobody tells her about Ilse. Nobody can.'],
        ],
        end: true,
      },
    },
  },

  stranger_again: {
    nodes: {
      start: {
        l: [
          ['n', 'Lucien gives you the courteous nod of a man meeting you for the first time. He always will.', { flag: 'letgo_lucien' }],
          ['n', 'Cael touches his brow to you like he does to every stranger in the square. He always will.', { flag: 'letgo_cael' }],
          ['n', 'Evelyne waves at you across the square, delighted to meet someone new. She always will be.', { flag: 'letgo_evelyne' }],
        ],
        end: true,
      },
    },
  },

  ch8_evelyne: {
    nodes: {
      start: { go: [{ cond: { flag: 'evelyne_took' }, to: 'mother' }, { cond: {}, to: 'ally' }] },
      mother: {
        l: [
          ['evelyne', 'Evelyne is serene. "Mother\'s right, darling. People are happier. I\'m happier. I don\'t even remember what I was so upset about."'],
          ['evelyne', '"Sleep through the eclipse. It\'s kinder. For everyone."'],
          ['n', 'You took the thing that would have turned her. This is who she is without it.'],
        ],
        fx: { flag: 'evelyne_against', obj: 'mq8.evelyne' },
        end: true,
      },
      ally: {
        l: [
          ['evelyne', 'Evelyne presses a heavy book into your arms: her mother\'s order book. "Every name for the next thirty years. Already paid for. She can\'t sell what isn\'t written down."'],
          ['evelyne', '"Mother found the debt I struck out. She took my keys. I took them back."', { flag: 'evelyne_struck_debt' }],
          ['evelyne', '"I still dream about Ilse. I think that\'s what made me able to do this."', { notFlag: 'evelyne_shared' }],
          ['evelyne', '"Half of Ilse is in you. I can feel it, like a hand on my shoulder. That\'s what made me able to do this."', { flag: 'evelyne_shared' }],
          ['n', 'No one else can be sold this season.'],
        ],
        fx: { flag: 'evelyne_ally', obj: 'mq8.evelyne', rel: { evelyne: { trust: 8 } } },
        end: true,
      },
    },
  },

  ch8_bargain: {
    bg: 'royal',
    nodes: {
      start: {
        l: [
          ['n', 'The Duchess receives you in a room full of clocks, all stopped at midnight.'],
          ['The Duchess', '"Here is my offer. Sleep through the eclipse, and not one name will be sold for a generation. Thirty years, Astoria."'],
          ['The Duchess', '"Or wake them all. Give back every grief they paid me to take, every crime, every war this city chose to sleep through. See how grateful they are."'],
          ['The Duchess', '"My daughter stole my order book. It changes nothing. I have a long memory."', { flag: 'evelyne_ally' }],
          ['The Duchess', '"My daughter understands. She always did, once she stopped feeling sorry."', { flag: 'evelyne_against' }],
        ],
        c: [
          { t: '"Every one of them was someone."', path: 'compassionate', l: [['The Duchess', '"Yes. And every one of them was sold by someone who loved them or feared them. Ask yourself why no one ever came looking."']], to: 'end' },
          { t: '"Why should I believe you\'d keep your word?"', path: 'suspicious', l: [['The Duchess', '"Because my word is the only thing in Elaria that no one has ever been able to make anyone forget."']], to: 'end' },
          { t: '"You\'ll have my answer at the tower."', path: 'secretive', l: [['The Duchess', '"Of course I will. You always do come to the tower."']], to: 'end' },
        ],
      },
      end: { fx: { obj: 'mq8.bargain', flag: 'bargain_offered' }, end: true },
    },
  },

  ch8_eclipse: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['note', 'The last night'],
          ['n', 'At dusk the moon touches the edge of the sun, and does not let go.'],
          ['n', 'Every bell in Elaria hangs still, as if waiting for someone to ring it.'],
          ['note', 'The eclipse has begun. Go to the bell tower.'],
        ],
        end: true,
      },
    },
  },

  // ============================================================ Chapter 9
  ch9_tower: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [
          ['n', 'You climb the two hundred and twelve steps for the last time. Halfway up, you realise you are not alone.'],
          ['seraphine', 'Seraphine is a step behind you, taper in hand. "I have carried you down these stairs nine times," she says. "I would like, once, to walk up them beside you."'],
          ['cael', 'Cael is at the top with his sword drawn, facing the stair. "No one comes up after you. Not tonight."', { all: [PRESENT('cael'), { notFlag: 'ashgrove_by_cael' }] }],
          ['cael', 'Cael is at the top in plain clothes, no captain\'s sash, a borrowed sword in his hand. "They took the rank. They didn\'t take the sword arm."', { all: [PRESENT('cael'), { flag: 'ashgrove_by_cael' }] }],
          ['lucien', 'Lucien sits in the bell frame with his ledger open on his knees. "I\'m told I escaped," he says. "Cael is very bad at locking doors when he doesn\'t want to."', { all: [PRESENT('lucien'), { flag: 'lucien_exposed' }] }],
          ['lucien', 'Lucien sits in the bell frame with his ledger open on his knees. "Whatever you choose," he says, "I\'ll write it down."', { all: [PRESENT('lucien'), { notFlag: 'lucien_exposed' }] }],
          ['evelyne', 'Evelyne arrives breathless, in her mother\'s silver, with her mother\'s order book under her arm.', { flag: 'evelyne_ally' }],
          ['noctis', 'Noctis is already there, of course. "I\'ve seen this part," he says. "I never get to see the end."', { notFlag: 'noctis_freed' }],
          ['noctis', 'A boy of nine sits on the parapet kicking his heels. Noctis doesn\'t know why he came. "I just felt I ought to be here," he says.', { flag: 'noctis_freed' }],
          ['n', 'Behind them, the stairwell fills with lanterns: Duchess Marchetti, and the Accord.'],
          ['The Duchess', '"Every name in you was a mercy someone begged me for. Give them back and you give back every grief, every crime, every war this city chose to sleep through."'],
          ['noctis', '"Every one of them was someone," Noctis says.', { notFlag: 'noctis_freed' }],
          ['n', 'Far below the tower, under the cathedral, someone is singing along.', { notFlag: 'aeria_sealed' }],
          ['n', 'The moon goes out. In the dark, the bell rope is in your hand.'],
        ],
        to: 'final',
      },
      ...finale(),
    },
  },

  // "Choose again" from the ending screen: straight to the final choice.
  ch9_final: {
    bg: 'cathedral',
    nodes: {
      start: {
        l: [['n', 'The tower again. The rope in your hand. Everyone you love on the stair, and everyone you hold, waiting.']],
        to: 'final',
      },
      ...finale(),
    },
  },
};
