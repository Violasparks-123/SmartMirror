/* CRIMSON VELVET — CHARACTERS (canon: Revised Canon + Complete Character Bible)
 * -----------------------------------------------------------------------------
 * Everything in a character's profile is shown in the CAST page, unlocking
 * gradually: meeting them, earning trust and discovering secrets all reveal more.
 *
 * PORTRAITS: put one image per character in assets/portraits/ using the file
 * name below (e.g. julian.jpg). Missing files show a designed cameo instead.
 * EXPRESSIONS: optional extra files named like julian_happy.jpg, julian_sad.jpg
 * (neutral, happy, sad, angry, surprised, nervous, serious). If an expression
 * file is missing, the canonical portrait is used.
 * ----------------------------------------------------------------------------- */
var CV = window.CV || {};
window.CV = CV;
CV.DATA = CV.DATA || {};

CV.DATA.player = {
  name: 'You', title: 'Archival restorer',
  portrait: 'detective',
  note: 'Invited to Vesper Conservatory to assist with an archival restoration project. Nobody has explained why you were chosen.'
};

CV.DATA.characters = {
  beatrix: {
    name: 'Beatrix Vale', first: 'Beatrix', portrait: 'beatrix', route: true,
    tag: 'Main character · Playable route',
    age: 23, birthday: '14 November', height: '168 cm',
    role: 'Vesper Conservatory archive assistant', archetype: 'The guarded confidante',
    palette: [['Burgundy', '#6b1f34'], ['Black', '#141014'], ['Antique silver', '#a7a39b'], ['Faded rose', '#b98a91']],
    symbol: 'A sealed envelope', symbolMeaning: 'Everything she has left unsaid.',
    appearance: 'Beautiful in a quiet, slightly intimidating way. Long, deep espresso-brown hair, naturally wavy, worn loose with a burgundy ribbon tied near the back. Muted grey-brown eyes with a tired, observant expression; delicate features and a naturally serious resting face.',
    wardrobe: ['Black fitted blouses', 'High-neck lace collars', 'Long charcoal skirts', 'Burgundy velvet ribbons', 'Antique silver rings', 'Black Mary Janes or leather boots', 'Long dark coats in winter'],
    personality: 'Observant, reserved and extremely difficult to read. She notices a change in tone, a missing page, a chair that has been moved. Her humour is dry and deadpan. When conversations turn personal she changes the subject, becomes sarcastic, or suddenly finds something important to do. She pretends not to care about people she cares about enormously.',
    habits: ['Rolls her rings around her fingers when nervous', 'Organises documents when stressed', 'Remembers people’s exact words', 'Drinks tea that has usually gone cold', 'Writes notes in tiny, precise handwriting', 'Dislikes people standing behind her', 'Keeps old envelopes in a drawer', 'Hums melodies from the Conservatory’s old performances'],
    likes: ['Rainy afternoons', 'Old libraries', 'Classical piano', 'Antique stationery', 'Earl Grey tea', 'Quiet conversations', 'People who are honest when honesty is uncomfortable'],
    dislikes: ['Being pitied', 'Unexpected physical contact', 'Loud arguments', 'People who make promises casually', 'Being asked about Celeste', 'The Grand Theatre clock'],
    psych: 'She has spent years convincing herself that silence was the right thing. She associates speaking about the past with putting Celeste in danger, and controls situations because she could not control what happened seven years ago. Her biggest flaw: she mistakes secrecy for protection, and makes decisions on other people’s behalf.',
    relationships: { celeste: 'Her closest friend. She loves her deeply; seven years of silence have created guilt and distance.', julian: 'Sarcastic, slightly competitive. He thinks she takes everything too seriously.', odette: 'One of the few people who can make her laugh. They understand each other more than either admits.', theo: 'Mutual respect. They rarely speak unnecessarily, but trust each other’s observations.', evelyn: 'Evelyn knows Beatrix is hiding something.' },
    voice: { speech: 'Short, precise, dry', humour: 'Deadpan', emotion: 'Hidden' },
    quotes: ['You have a remarkable talent for finding things you’re not supposed to find.', 'I’m not avoiding the question. I’m considering whether answering it would be a mistake.', 'Celeste wasn’t the sort of person who disappeared without leaving a note.'],
    development: 'Learns that she cannot keep everyone safe by keeping everyone uninformed.',
    resolution: 'Stops living under the weight of her silence.',
    secrets: [
      { flag: 'k_bea_knew', text: 'She was Celeste’s closest friend. She has spent seven years pretending she knew nothing.' },
      { flag: 'k_bea_helped', text: 'She helped Celeste escape through the underground passage during the blackout.' },
      { flag: 'k_bea_letter', text: 'She kept one of Celeste’s letters and never opened its final sealed section.' }
    ],
    appearsFrom: 0
  },

  julian: {
    name: 'Julian Cross', first: 'Julian', portrait: 'julian', route: true,
    tag: 'Playable route', age: 24, birthday: '3 February', height: '183 cm',
    role: 'Conservatory pianist and former scholarship recipient', archetype: 'The golden boy with a cracked reputation',
    palette: [['Black', '#141014'], ['Ivory', '#efe7d6'], ['Midnight blue', '#1e2a44'], ['Silver', '#b8bcc2']],
    symbol: 'A silver pocket watch', symbolMeaning: 'His obsession with time and achievement.',
    appearance: 'Tall, slender and effortlessly well-dressed. Dark, slightly wavy hair that never sits entirely in place; cool grey eyes; an expression that looks amused even when he isn’t. Refined features, a sharp jaw and a faint scar near his right eyebrow.',
    wardrobe: ['Black tailored trousers', 'White or ivory shirts', 'Dark waistcoats', 'Silver cufflinks', 'Long wool coats', 'Polished leather shoes', 'A silver wristwatch'],
    personality: 'Charming, witty and socially intelligent — he can make a room like him within five minutes. He jokes when uncomfortable, flirts when cornered and argues when intellectually challenged. He enjoys being the smartest person in the room and hates admitting he doesn’t know something. Underneath, he is terrified his achievements are not really his own.',
    habits: ['Taps rhythms against tables', 'Adjusts his cufflinks when uncomfortable', 'Plays piano when he cannot sleep', 'Uses people’s surnames when teasing them', 'Smiles when annoyed', 'Keeps his watch wound though he rarely checks it', 'Leaves half-finished compositions in notebooks', 'Hates anyone touching his piano without permission'],
    likes: ['Jazz', 'Classical piano', 'Black coffee', 'Chess', 'Expensive stationery', 'Midnight walks', 'Intellectual arguments', 'People who challenge him'],
    dislikes: ['Pity', 'Being compared to other musicians', 'His family being discussed', 'People questioning his talent', 'Being ignored', 'Cheap compliments', 'Losing control of a conversation'],
    psych: 'He built his identity around achievement and believes that if he stops being exceptional, people will stop valuing him. He is genuinely gifted — his conflict is that he no longer knows whether his success belongs to him. Exposed, his insecurity can turn defensive, arrogant, even cruel.',
    relationships: { beatrix: 'Constant verbal sparring. He finds her infuriatingly difficult to read.', odette: 'Longstanding friendship. They tease each other and can tell when the other is pretending.', theo: 'Initial dislike. Julian represents the institution’s privilege; Theo, the damage it caused.', celeste: 'He admired her talent, and feels guilty that his scholarship benefited from her absence.', adrian: 'An example of how the institution rewards people who fit its expectations.' },
    voice: { speech: 'Smooth, witty, articulate', humour: 'Teasing', emotion: 'Deflects' },
    quotes: ['You’re either very brave or spectacularly unaware of how this place works.', 'I assure you, I can play the piano without an audience. I simply prefer having one.', 'Do you ever stop investigating? Or is that your idea of a personality?'],
    development: 'Learns to separate his worth from his achievements — that he can be talented and still have benefited from something unfair.',
    resolution: 'Rejects the undeserved legacy of his scholarship.',
    secrets: [
      { flag: 'k_jul_suspected', text: 'He discovered years ago that his ranking had been manipulated, and chose not to investigate.' },
      { flag: 'k_jul_letter', text: 'He has hidden a letter from the former director confirming his scholarship ranking was altered.' }
    ],
    appearsFrom: 1
  },

  odette: {
    name: 'Odette Laurent', first: 'Odette', portrait: 'odette', route: true,
    tag: 'Playable route', age: 22, birthday: '28 September', height: '165 cm',
    role: 'Theatre costume designer', archetype: 'The theatrical observer',
    palette: [['Dusty rose', '#c48e95'], ['Cream', '#efe3cc'], ['Burgundy', '#6b1f34'], ['Antique gold', '#b08d57']],
    symbol: 'A broken compact mirror', symbolMeaning: 'The difference between appearance and reality.',
    appearance: 'Warm auburn hair, thick and slightly curled, styled in soft vintage waves with decorative clips. Hazel eyes with golden undertones, and expressive eyebrows that make it almost impossible for her to hide a reaction. Often found with a measuring tape round her neck.',
    wardrobe: ['Vintage dresses', 'High-waisted skirts', 'Lace collars', 'Ribbon details', 'Pearl earrings', 'Delicate gloves', 'Decorative hair clips', 'Soft cardigans', 'Mary Jane shoes'],
    personality: 'Expressive, sociable and dramatic. She loves stories, gossip, theatre and beautiful things, and talks a great deal when nervous. She is also deeply perceptive — her greatest strength is empathy. Her greatest weakness: she uses humour and theatricality to avoid difficult conversations, and would rather make you laugh than admit something hurt.',
    habits: ['Talks to herself while designing', 'Collects old buttons', 'Makes elaborate hand gestures', 'Fixes other people’s collars without asking', 'Gives people ridiculous nicknames', 'Keeps a scrapbook of theatre programmes', 'Hums when concentrating', 'Becomes unusually quiet when genuinely upset'],
    likes: ['Theatre', 'Fashion history', 'Old photographs', 'Perfume', 'Beautiful stationery', 'Flower markets', 'Gossip', 'Elaborate desserts', 'People with interesting personalities'],
    dislikes: ['Being underestimated', 'Poor craftsmanship', 'Boring conversations', 'Being treated as superficial', 'Uncomfortable silence', 'Artistic work being dismissed'],
    psych: 'She is afraid of being forgotten, and believes people are remembered through the stories they leave behind — so she preserves everything: programmes, photographs, clothing, notes. She turns painful events into entertaining anecdotes. She has to stop performing happiness for everyone else.',
    relationships: { beatrix: 'One of her closest friends. She understands Beatrix’s silence and knows when to leave her alone.', julian: 'An entertaining, teasing friendship. She mocks his self-importance often.', theo: 'She appreciates his practical nature and trusts his observations. An unexpected friendship.', celeste: 'A creative friendship. She still feels guilty about not revealing what she witnessed.' },
    voice: { speech: 'Expressive, elaborate', humour: 'Dramatic', emotion: 'Open, then evasive' },
    quotes: ['Darling, I am not being dramatic. The situation is simply behaving dramatically.', 'If this place had any more secrets, we’d need to start charging them rent.', 'I remember the dress. I remember the music. I remember who was standing beside the curtain. I remember everything.'],
    development: 'Learns that the truth does not become less painful simply because it is hidden behind a joke.',
    resolution: 'Stops treating every painful truth as a performance.',
    secrets: [
      { flag: 'k_ode_corridor', text: 'She remembers the old backstage corridor standing open on the night of the blackout.' },
      { flag: 'k_ode_key', text: 'She took a key from the backstage office that night — to the maintenance corridor leading to the Forgotten Wing.' },
      { flag: 'k_ode_saw', text: 'She saw Adrian Voss enter the archive shortly before the lights went out.' }
    ],
    appearsFrom: 1
  },

  theo: {
    name: 'Theo Mercer', first: 'Theo', portrait: 'theo', route: true,
    tag: 'Playable route', age: 25, birthday: '19 June', height: '186 cm',
    role: 'Former stage technician; now maintenance worker', archetype: 'The reluctant witness',
    palette: [['Charcoal', '#34302e'], ['Olive', '#5d5f3a'], ['Tobacco brown', '#6e4a2c'], ['Faded cream', '#e3d7bd']],
    symbol: 'An old brass key', symbolMeaning: 'Access to things others tried to hide.',
    appearance: 'Messy sandy-brown hair, green eyes and a naturally tired expression. Tall and lean with broad shoulders and hands roughened by years of work. Clothes slightly dishevelled; tools always organised.',
    wardrobe: ['Rolled-up shirts', 'Dark trousers', 'Work boots', 'Old jackets', 'Leather belts', 'A worn wristwatch', 'A small notebook and a ring of old keys'],
    personality: 'Blunt, practical and quietly protective. He dislikes people who talk without saying anything and has little patience for authority. Not unfriendly — he simply finds most conversations exhausting. His humour is dry and occasionally surprisingly funny. When someone is struggling he doesn’t know how to say the right thing, so instead he fixes something.',
    habits: ['Rolls coins across his knuckles', 'Cleans tools when stressed', 'Keeps old keys on a ring', 'Drinks too much coffee', 'Leans against doorframes', 'Looks away when complimented', 'Remembers mechanical details', 'Says “Right” before explaining something complicated'],
    likes: ['Fixing things', 'Old machinery', 'Quiet places', 'Rain', 'Strong coffee', 'Dogs', 'Mechanical puzzles', 'People who mean what they say'],
    dislikes: ['Wealthy people who look down on others', 'False accusations', 'Being interrupted', 'Excessive formality', 'People touching his tools', 'Empty promises'],
    psych: 'He has lived with the consequences of an accusation that was never properly investigated. He is angry, but so used to being dismissed that he rarely defends himself. He believes people will always choose the most convenient explanation over the truth — his route challenges that.',
    relationships: { beatrix: 'Mutual respect. Neither asks unnecessary questions.', julian: 'Tense — Julian represents the privilege Theo resents.', odette: 'He trusts her more than he admits.', celeste: 'He never knew her well, but has spent years wondering whether he could have done more.', evelyn: 'She believes he was treated unfairly, and has never said so publicly.' },
    voice: { speech: 'Blunt, economical', humour: 'Dry', emotion: 'Reserved' },
    quotes: ['That door isn’t locked. It’s pretending to be.', 'You can keep asking questions. Just don’t expect the answers to be pleasant.', 'I’m not angry because you don’t trust me. I’m angry because you think I haven’t earned the right to be believed.'],
    development: 'Learns that not everyone will betray him, and that accepting help does not make him weak.',
    resolution: 'Clears his name and regains his dignity.',
    secrets: [
      { flag: 'k_theo_tamper', text: 'He discovered the electrical system had been tampered with, and that the blackout was connected to the archive.' },
      { flag: 'k_theo_report', text: 'He kept the original maintenance report — the one that contradicts the official explanation.' }
    ],
    appearsFrom: 1
  },

  evelyn: {
    name: 'Evelyn Ashcroft', first: 'Evelyn', portrait: 'evelyn', route: false,
    tag: 'Major supporting character', age: 49, birthday: '6 December', height: '172 cm',
    role: 'Headmistress of Vesper Conservatory', archetype: 'The woman who chose the institution',
    palette: [['Black', '#141014'], ['Wine red', '#5a1626'], ['Pearl', '#ece6dc'], ['Muted gold', '#a88b5a']],
    symbol: 'A pearl necklace', symbolMeaning: 'Tradition, control and the weight of reputation.',
    appearance: 'Exceptionally elegant. A sharply cut silver-black bob, pale grey eyes, a composed expression and very little makeup. Her appearance communicates authority without her needing to say anything.',
    wardrobe: ['Tailored suits', 'High-neck blouses', 'Long coats', 'Pearl necklaces', 'Leather gloves', 'Structured handbags', 'Polished heels'],
    personality: 'Disciplined, intelligent and intimidating. She speaks with control and rarely raises her voice. Not warm, but unexpectedly considerate. She believes in institutions, tradition and order — and can rationalise almost anything if she believes it protects the Conservatory.',
    habits: ['Adjusts her gloves before difficult conversations', 'Arranges objects precisely', 'Drinks tea from fine porcelain', 'Pauses before answering uncomfortable questions', 'Remembers everyone’s surname', 'Rarely sits with her back to a door', 'Keeps an old photograph inside her desk'],
    likes: ['Classical music', 'Order', 'Fine tea', 'Historical architecture', 'Tradition', 'Discipline', 'Quiet evenings'],
    dislikes: ['Public scandals', 'Disorganisation', 'Reckless accusations', 'Emotional manipulation', 'People who disrespect the Conservatory'],
    psych: 'She knows she made the wrong decision seven years ago, and has defended it so long that admitting it would mean confronting the person she became. She is not simply protecting Adrian — she is protecting the belief that her sacrifices were justified.',
    relationships: { adrian: 'Complicated professional history. She once admired him and now fears what he knows.', beatrix: 'She knows Beatrix is hiding something.', celeste: 'She feels guilt over what happened to her.', theo: 'She believes he was treated unfairly, but has never acknowledged it publicly.' },
    voice: { speech: 'Formal, controlled', humour: 'Rare', emotion: 'Restrained' },
    quotes: ['There is a difference between curiosity and responsibility. I suggest you learn it.', 'You may dislike my decisions. That does not mean you understand the circumstances.', 'I have spent twenty years keeping this institution standing. Do not mistake that for an inability to see its cracks.'],
    development: 'Must confront her own complicity. She may help you — but her help never erases what she did.',
    resolution: 'Faces the consequences of protecting the institution.',
    secrets: [
      { flag: 'k_eve_knew', text: 'She knew about the altered rankings seven years ago, and helped suppress the scandal.' },
      { flag: 'k_eve_letters', text: 'She has been receiving anonymous letters for months, and knows Celeste may be alive.' },
      { flag: 'k_eve_search', text: 'She has been quietly searching for the original ledger herself.' }
    ],
    appearsFrom: 1
  },

  adrian: {
    name: 'Adrian Voss', first: 'Adrian', portrait: 'adrian', route: false,
    tag: 'Primary antagonist', age: 58, birthday: '21 January', height: '179 cm',
    role: 'Former director of Vesper Conservatory', archetype: 'The respectable villain',
    palette: [['Black', '#141014'], ['Antique gold', '#a8843c'], ['Ivory', '#efe7d6'], ['Deep brown', '#3b2618']],
    symbol: 'A gold pocket watch', symbolMeaning: 'His control over the institution’s history.',
    appearance: 'Silver hair combed neatly back, pale blue-grey eyes, a composed face with subtle expressions. Expensive suits, polished shoes, silk ties and a gold pocket watch. Immaculate, even in private.',
    wardrobe: ['Expensive suits', 'Silk ties', 'Polished shoes', 'A gold pocket watch'],
    personality: 'Charming, intelligent and deeply manipulative. He never needs to shout; he prefers to make people question their own judgement, and rarely tells an outright lie when a carefully chosen half-truth works better. He can be generous, attentive, almost fatherly — which is what makes him dangerous. He considers himself a realist, not a villain.',
    habits: ['Checks his pocket watch during conversations', 'Uses people’s full names', 'Never rushes his speech', 'Offers tea during uncomfortable discussions', 'Keeps his desk perfectly organised', 'Smiles when someone becomes emotional', 'Remembers small personal details', 'Rarely says “I don’t know”'],
    likes: ['Classical music', 'Wealth', 'Influence', 'Tradition', 'Expensive watches', 'Private clubs', 'People who are easy to persuade'],
    dislikes: ['Losing control', 'Unpredictability', 'Public humiliation', 'Challenges to his authority', 'Being ignored', 'Unauthorised access to records'],
    psych: 'He believes people are naturally selfish and institutions are only as strong as those who control them. Manipulation is a practical tool. Some things he genuinely regrets — but he still believes he was right to protect his power.',
    relationships: { evelyn: 'Professional ally turned reluctant adversary.', celeste: 'The student who threatened his entire system.', beatrix: 'He suspects she knows more than she admits.', julian: 'An example of how the institution rewards people who fit its expectations.' },
    voice: { speech: 'Polished, persuasive', humour: 'Subtle', emotion: 'Calculated' },
    quotes: ['People often confuse the truth with the version of events they find most satisfying.', 'You are young. You believe every secret deserves to be exposed. Experience tends to make one more selective.', 'I did not build this institution to watch it collapse because of one unfortunate evening.'],
    development: 'He does not get a redemption arc. He exists to challenge your understanding of power, reputation and responsibility.',
    resolution: '',
    secrets: [
      { flag: 'k_adr_scheme', text: 'He engineered the scholarship manipulation scheme, using donor money to control the rankings.' },
      { flag: 'k_adr_insurance', text: 'He keeps a duplicate of the scholarship ledger as insurance against the donors who helped him.' }
    ],
    appearsFrom: 2, hiddenUntil: 'k_adrian_named'
  },

  celeste: {
    name: 'Celeste Wren', first: 'Celeste', portrait: 'celeste', route: false,
    tag: 'Missing student · Central mystery', age: 27, birthday: '17 April', height: '166 cm',
    role: 'Former Vesper Conservatory student', archetype: 'The girl who refused to be erased',
    palette: [['Ivory', '#efe7d6'], ['Faded burgundy', '#8a4a57'], ['Warm brown', '#7a5232'], ['Muted gold', '#a88b5a']],
    symbol: 'A torn photograph', symbolMeaning: 'A person deliberately removed from history.',
    appearance: 'Long chestnut-brown hair and warm hazel eyes; softer-looking than Beatrix, but with determination in her expression. Associated with burgundy ribbons and handwritten letters.',
    wardrobe: ['Ivory blouses', 'Brown cardigans', 'Long skirts', 'Burgundy ribbons', 'Small gold jewellery', 'Leather shoes', 'Delicate floral patterns'],
    personality: 'Compassionate, thoughtful and stubborn. She notices when someone is being excluded and quietly makes room for them. Ambitious, and unwilling to let others decide what she is capable of. She can be reckless when something feels morally important, and assumes people will do the right thing if simply given the truth.',
    habits: ['Writes letters instead of sending messages', 'Collects pressed flowers', 'Keeps photographs in books', 'Writes important dates on her hands', 'Hums while reading', 'Leaves notes inside library books', 'Bites her lower lip when thinking', 'Keeps old ticket stubs'],
    likes: ['Libraries', 'Piano music', 'Handwritten letters', 'Wildflowers', 'Photography', 'Old books', 'Long walks', 'Quiet company'],
    dislikes: ['Injustice', 'Being treated as helpless', 'Manipulation', 'People making decisions for her', 'Unnecessary cruelty', 'Institutions that value reputation over people'],
    psych: 'She has spent seven years living with a decision she made at twenty. Proud of having survived, guilty for leaving Beatrix behind. She is not a perfect victim: she has withheld information and endangered people through her determination. Her greatest fear is that everything she sacrificed will mean nothing.',
    relationships: { beatrix: 'Her closest friend. Their relationship is the emotional centre of the mystery.', julian: 'She admired his talent, though she knew he was caught in an unfair system.', odette: 'A shared creative friendship.', theo: 'She never knew him well, but knows he was blamed for something he did not cause.', adrian: 'A power struggle.' },
    voice: { speech: 'Warm, thoughtful', humour: 'Gentle', emotion: 'Honest, sometimes stubborn' },
    quotes: ['I didn’t leave because I stopped caring. I left because staying would have made everything worse.', 'You cannot repair something by pretending it never broke.', 'Please don’t make my silence into a story about bravery. I was frightened. I was very frightened.'],
    development: 'Learns that surviving is not the same as moving forward.',
    resolution: 'Reclaims her identity and decides her future.',
    secrets: [
      { flag: 'k_cel_found', text: 'She discovered the manipulated rankings and scholarship fraud, and meant to reveal everything at the Crimson Gala.' },
      { flag: 'k_cel_alive', text: 'She survived. She has been living under another name outside Vesper City.' },
      { flag: 'k_cel_anon', text: 'She has been sending the anonymous messages.' }
    ],
    appearsFrom: 1, hiddenUntil: 'k_celeste_named', missingUntil: 'k_cel_alive'
  }
};

CV.DATA.castOrder = ['beatrix', 'julian', 'odette', 'theo', 'evelyn', 'adrian', 'celeste'];
CV.DATA.expressions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'nervous', 'serious'];
