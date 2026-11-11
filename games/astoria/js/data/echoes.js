import { HIDDEN_ENDINGS } from './hearts.js';
// Echoes — the memories inside Astoria that belong to other people.
// Elaria sells forgetting; whatever is sold has to be kept somewhere, and it
// is kept in her. Each echo can be kept (a piece of self for Astoria) or given
// back (someone forgotten comes home, and a piece of her goes with it).

export const ECHOES = {
  laugh: {
    chapter: 1, title: 'A Laugh in a Sunlit Kitchen',
    owner: 'Marta, the candle-seller', forgotten: 'Elsie, her daughter',
    held: 'A sunlit kitchen. Flour on small hands. A child laughing at something you said.',
    kept: 'You kept the laugh. It is the first thing that was ever yours, even if it was someone else\'s first.',
    returned: 'Marta remembers Elsie, who drowned in the millpond the summer she turned six. The grave behind the cathedral has a name again.',
  },
  edric: {
    chapter: 2, title: 'A Wedding in the Rain',
    owner: 'Edric Vane, who sold himself', forgotten: 'Edric Vane, Cael\'s lieutenant',
    held: 'Rain on a borrowed coat held over two heads. Someone saying "Edric" as if it were a promise.',
    kept: 'You kept the wedding. Edric faded the way he wanted to, and his family kept the house.',
    returned: 'Edric Vane is someone again. So is his debt.',
  },
  witness: {
    chapter: 3, title: 'What the Stable-Boy Saw',
    owner: 'Tam, a stable-boy, whose mother paid', forgotten: 'Nell Brannock, a maid',
    held: 'The north tower at dawn. A maid in a grey dress. A lord\'s hand on her back. Then only the sky.',
    kept: 'You carry what Tam saw so that he doesn\'t have to.',
    returned: 'Tam remembers the north tower. Nell Brannock is remembered, and Lord Ashgrove has to answer for her.',
  },
  ilse: {
    chapter: 4, title: 'A Girl Who Laughed Too Loudly',
    owner: 'Evelyne Marchetti, who sold the name', forgotten: 'Ilse, her friend at fourteen',
    held: 'A dinner table. A girl with ink on her cuffs laughing too loudly, and everyone turning to look.',
    kept: 'You keep Ilse so that someone does.',
    returned: 'Ilse is remembered. So is who sold her.',
  },
  hollowmere: {
    chapter: 5, title: 'Two Hundred and Six',
    owner: 'Noctis, who carried them for three hundred years', forgotten: 'The people of Hollowmere',
    held: 'Doorposts with names on them. A dog called Biscuit. Mira, who taught a boy to whistle. A well at the centre of everything.',
    kept: 'Hollowmere lives in you now. Noctis does not remember it.',
    returned: 'Two hundred and six people walk out of the Whispering Woods.',
  },
  own: {
    chapter: 7, title: 'The Bell-Singer',
    owner: 'You, three hundred years ago', forgotten: 'The bell-singer of Hollowmere',
    held: 'A girl singing to the bells every evening, and the whole valley stopping to listen.',
    kept: 'You remember who you were. She asked you never to, and you did anyway.',
    returned: '',
  },
  companion: {
    chapter: 8, title: 'Everything They Knew of You',
    owner: 'Your closest companion', forgotten: 'You, as they knew you',
    held: 'Every conversation you had with them, from their side of it.',
    kept: 'You stayed whole. They met you as a stranger to the end.',
    returned: 'They know you again. It cost you.',
  },
};

export const ENDINGS = {
  bells: { title: 'Ring Every Bell', line: 'She gave everything back. Elaria remembered, all at once.' },
  keep: { title: 'Keep Them', line: 'She closed her hand around everyone inside her, and lived.' },
  curator: { title: 'The Curator', line: 'She took the altar, and decided what Elaria may remember.' },
  sleep: { title: 'The Long Sleep', line: 'Thirty years without a name sold, paid for by everyone still inside her.' },
  share: { title: 'Share the Weight', line: 'No one held all of it, so she could stay.' },
  ...HIDDEN_ENDINGS,
};
export const MAIN_ENDINGS = ['bells', 'keep', 'curator', 'sleep', 'share'];

// "What became of them": for each person, the first entry whose condition holds.
const BACK = (id) => ({ any: [{ returned: id }, { flag: 'ending_bells' }, { flag: 'ending_share' }] });

export const EPILOGUE = [
  { who: 'Lucien', cond: { flag: 'ending_ledger' }, text: 'Lucien reads one name a night into the bells. He is older every year, and he has never once complained about it, which worries the court physicians.' },
  { who: 'Evelyne', cond: { flag: 'ending_heiress' }, text: 'Evelyne Marchetti gave away every crown her family ever earned. She lives in two rooms over a bakery and is, by all accounts, insufferably happy.' },
  { who: 'Cael', cond: { flag: 'ending_watch' }, text: 'Cael keeps the tenth line himself. Every night, first post: "Astoria." You have never once been late to answer.' },
  { who: 'Seraphine', cond: { flag: 'ending_lullaby' }, text: 'Seraphine grew old in a single song and lived four happy years. There is a violet on her grave, and it has a name.' },
  { who: 'Noctis', cond: { flag: 'ending_surprise' }, text: 'Noctis turned nine on a Tuesday. He did not know it was coming. He has been insufferable about it ever since.' },
  { who: 'Aeria', cond: { flag: 'ending_siren' }, text: 'Aeria sings on the cursed sea. Ships that hear her sail on without a single memory of where they were going, and are, briefly, very glad.' },
  { who: 'Liesel', cond: { flag: 'liesel_named' }, text: 'Once a year, at thirteen past midnight, a silver mask turns up on the ballroom balcony rail. Nobody knows who leaves it. You do.' },
  // Marta and Elsie
  { who: 'Marta', cond: BACK('laugh'), text: 'Marta lights a candle for Elsie every evening. Some evenings she can\'t, and her son lights it for her.' },
  { who: 'Marta', cond: {}, text: 'Marta\'s son took his first steps on the cathedral stairs. She never knew she had a daughter, and she laughed easily all her life.' },

  // Edric
  { who: 'Edric', cond: { all: [BACK('edric'), { flag: 'evelyne_struck_debt' }] }, text: 'Edric Vane is Cael\'s lieutenant again. The Marchetti books say he owes nothing, and no one remembers who changed them.' },
  { who: 'Edric', cond: BACK('edric'), text: 'Edric Vane came home to a debt he couldn\'t pay. His family lost the house and kept him. He has never forgiven you, and he tucks his son in every night.' },
  { who: 'Edric', cond: {}, text: 'Edric faded the way he wanted to. His son grew up safe and fed, and never knew whose face he had.' },

  // Tam and Nell
  { who: 'Tam', cond: { flag: 'ashgrove_by_cael' }, text: 'Cael gave up his captaincy to put Lord Ashgrove in chains. Nell Brannock has a name on her grave, and Tam never had to remember why.' },
  { who: 'Tam', cond: BACK('witness'), text: 'Lord Ashgrove was tried in the spring on a stable-boy\'s word. Tam still wakes at night. Nell is remembered.' },
  { who: 'Tam', cond: {}, text: 'Tam grew up to run the royal stables and slept soundly all his life. Lord Ashgrove still dines at court.' },

  // Evelyne
  { who: 'Evelyne', cond: { all: [{ flag: 'forgot_evelyne' }, { notFlag: 'restored_evelyne' }] }, text: 'Evelyne never remembered you. She inherited the counting-house and ran it gently, by Marchetti standards.' },
  { who: 'Evelyne', cond: { flag: 'evelyne_took' }, text: 'Evelyne became Duchess Marchetti: lighter than her mother, and twice as efficient. She sleeps very well.' },
  { who: 'Evelyne', cond: { flag: 'evelyne_shared' }, text: 'You and Evelyne still carry Ilse between you. On Ilse\'s birthday you both laugh too loudly at dinner.' },
  { who: 'Evelyne', cond: {}, text: 'Evelyne burned her mother\'s books on the night of the eclipse. She still dreams of Ilse, and says that is the point.' },

  // Noctis
  { who: 'Noctis', cond: { flag: 'noctis_freed' }, text: 'Noctis is eleven now and growing like a weed. He doesn\'t know what Hollowmere was. Sometimes he whistles a tune nobody taught him.' },
  { who: 'Noctis', cond: { flag: 'ending_bells' }, text: 'When the bells rang, two hundred and six people walked out of the Whispering Woods. Noctis met every one of them by name, and then he was nine.' },
  { who: 'Noctis', cond: { flag: 'ending_share' }, text: 'Noctis set Hollowmere down at last, a few names at a time, into hands that offered. Then he started growing up.' },
  { who: 'Noctis', cond: {}, text: 'Noctis still sits on the well at Hollowmere, eight years old and three hundred, keeping their names. He knows exactly how this ends. He won\'t say.' },

  // Lucien
  { who: 'Lucien', cond: { all: [{ flag: 'forgot_lucien' }, { notFlag: 'restored_lucien' }] }, text: 'Lucien never remembered you. That night he wrote one more name in his ledger, yours, so that it would exist somewhere.' },
  { who: 'Lucien', cond: { flag: 'lucien_exposed' }, text: 'Lucien stood trial for the Moonfall and asked for no mercy. He reads the names in his ledger aloud in his cell, every one, every night.' },
  { who: 'Lucien', cond: { romance: 'lucien' }, text: 'Lucien has started to age, a little, which he finds unfashionable. He still holds your hand exactly like that.' },
  { who: 'Lucien', cond: {}, text: 'Lucien has started to age, a little, which he finds unfashionable. He keeps writing in the ledger anyway.' },

  // Cael
  { who: 'Cael', cond: { all: [{ flag: 'forgot_cael' }, { notFlag: 'restored_cael' }] }, text: 'Cael met you for the first time on the night of the eclipse. He says he had the strangest feeling he owed you something.' },
  { who: 'Cael', cond: { romance: 'cael' }, text: 'Cael walks you home every night. He says it\'s on his way. It isn\'t.' },
  { who: 'Cael', cond: {}, text: 'Cael keeps a tenth line on the night-watch roster now, blank on purpose, for whoever the city forgets next.' },

  // Seraphine
  { who: 'Seraphine', cond: { flag: 'ending_sleep' }, text: 'Seraphine sat beside the altar through the dark, as she has for three hundred years, humming three notes.' },
  { who: 'Seraphine', cond: { flag: 'ending_bells' }, text: 'Seraphine remembered everything she had ever taken. She sat on the cathedral steps for three days, and then she began, at last, to grow old.' },
  { who: 'Seraphine', cond: {}, text: 'Seraphine kept the cathedral. The altar takes nothing now. She says she sleeps worse, and better.' },

  // Aeria
  { who: 'Aeria', cond: { all: [{ flag: 'ending_bells' }, { notFlag: 'aeria_sealed' }] }, text: 'When every bell rang at once, the chain beneath the cathedral rang too, and broke. Aeria swam out into the cursed sea. Sailors have started forgetting their way home again.' },
  { who: 'Aeria', cond: { flag: 'lucien_redeemed' }, text: 'Aeria sings beneath the cathedral still. Once a year Lucien goes down the two hundred steps, stands on the last one, and does not listen.' },
  { who: 'Aeria', cond: { flag: 'aeria_sealed' }, text: 'Aeria sings beneath the cathedral still, to no one: three notes, slightly out of tune, on purpose.' },
  { who: 'Aeria', cond: { flag: 'aeria_chain_weak' }, text: 'Aeria waits beneath the cathedral, one link from free. Chains rust. Bells crack. She has time.' },
  { who: 'Aeria', cond: { flag: 'aeria_told' }, text: 'Aeria waits beneath the cathedral, singing to anyone who finds the cold flagstone behind the prayer alcove.' },

  // The Duchess
  { who: 'The Duchess', cond: { all: [{ flag: 'ending_sleep' }, { flag: 'evelyne_took' }] }, text: 'Duchess Marchetti kept her word: no name was sold for thirty years. She died in the twenty-ninth, and her daughter opened the books again.' },
  { who: 'The Duchess', cond: { flag: 'ending_sleep' }, text: 'Duchess Marchetti kept her word: no name was sold for thirty years. She died in the twenty-ninth, and her daughter burned the books.' },
  { who: 'The Duchess', cond: { flag: 'ending_bells' }, text: 'Duchess Marchetti was the first noble the crowds found. Every name she had ever sold remembered her at once.' },
  { who: 'The Duchess', cond: { flag: 'ending_curator' }, text: 'Duchess Marchetti handed you the altar keys herself. "You\'ll find," she said, "that everyone asks."' },
  { who: 'The Duchess', cond: { flag: 'ending_share' }, text: 'Duchess Marchetti lived out her days in a city that remembered what she had done. No one sold her. They simply never forgot.' },
  { who: 'The Duchess', cond: {}, text: 'With the altar closed, the Marchetti trade died in a season. The Duchess was not wrong: the city slept worse.' },
];
