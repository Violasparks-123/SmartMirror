/* Static game data: cast, calendar, places, shop, fragments and endings. */
DL.Data = (() => {
  const CHAR = {
    haruka: { name: 'Haruka', plate: 'pink' },
    hikaru: { name: 'Hikaru', plate: 'blue' },
    rin: { name: 'Rin', plate: 'lav' },
    rei: { name: 'Rei', plate: 'crimson' },
    sei: { name: 'Sei', plate: 'crimson' },
    player: { name: (s) => s.name, plate: 'cream' },
    other: { name: '', plate: 'grey' },
    void: { name: 'H̷̛ARUKA', plate: 'void' },
    haruka2: { name: 'H̷ikaru', plate: 'void' },
    unknown: { name: '???', plate: 'void' },
  };

  // The school year in Japan starts in April, so the game runs through cherry-blossom season.
  const DAYS = [
    { jp: '月曜日', en: 'Monday', date: '4月13日' },
    { jp: '火曜日', en: 'Tuesday', date: '4月14日' },
    { jp: '水曜日', en: 'Wednesday', date: '4月15日' },
    { jp: '木曜日', en: 'Thursday', date: '4月16日' },
    { jp: '金曜日', en: 'Friday', date: '4月17日' },
    { jp: '月曜日', en: 'Monday', date: '4月20日' },
    { jp: '火曜日', en: 'Tuesday', date: '4月21日' },
    { jp: '水曜日', en: 'Wednesday', date: '4月22日' },
    { jp: '木曜日', en: 'Thursday', date: '4月23日' },
  ];
  const LAST_DAY = 9;

  const erased = (s) => s.day === 7;

  const LOCATIONS = [
    // ---- Lunch ----
    {
      id: 'cafeteria', slot: 'lunch', name: 'Cafeteria', jp: '食堂', bg: 'cafeteria',
      gain: { money: -300, energy: 10 },
      block: (s) => (s.money < 300 ? 'The lunch set costs ¥300.' : ''),
      hint: (s) => erased(s) ? '!two seats at the window table. one is saved for you.'
        : s.favor >= 4 ? 'Haruka waves you over. There’s a seat saved at the window table.'
          : 'The Amane twins hold court at the window table.',
    },
    {
      id: 'rooftop', slot: 'lunch', name: 'Rooftop', jp: '屋上', bg: 'rooftop',
      gain: { energy: 15 },
      hint: (s) => erased(s) ? '!something blue is caught in the fence.'
        : s.trust >= 2 ? 'Hikaru might be up there with her sketchbook.' : 'Windy and quiet. Usually empty.',
    },
    {
      id: 'library', slot: 'lunch', name: 'Library', jp: '図書室', bg: 'library',
      gain: { grades: 6, energy: -5 },
      hint: (s) => erased(s) ? '!rin is here. ask her who sits by the window.' : 'Rin studies here between photo trips. Good for grades.',
    },
    {
      id: 'courtyard', slot: 'lunch', name: 'Courtyard', jp: '中庭', bg: 'courtyard',
      gain: { energy: 20 },
      hint: (s) => erased(s) ? '!she is waiting under the tree.'
        : s.day >= 4 ? 'Haruka fixes her ponytail here when she thinks nobody’s looking.' : 'A bench under the big cherry tree. Good for a rest.',
    },
    // ---- After school ----
    {
      id: 'classroom', slot: 'after', name: 'Study in class', jp: '教室', bg: 'classroom_dusk',
      gain: { grades: 10, energy: -20 },
      block: (s) => (s.energy < 20 ? 'Too tired to study. Rest first.' : ''),
      hint: (s) => erased(s) ? '!the window seat is empty. it was always empty.' : 'The empty classroom at sunset. Someone always stays late.',
    },
    {
      id: 'konbini', slot: 'after', name: 'Konbini shift', jp: 'コンビニ', bg: 'konbini',
      gain: { money: 900, energy: -30 },
      block: (s) => (s.energy < 30 ? 'Too tired for a shift. Rest first.' : ''),
      hint: () => 'Part-time job by the station. Staff discount afterwards.',
    },
    {
      id: 'street', slot: 'after', name: 'Walk home', jp: '帰り道', bg: 'street',
      gain: { energy: -5 },
      hint: (s) => erased(s) ? '!the vending machine is lit. nobody is buying anything.' : 'The long way home, past the vending machine.',
    },
    {
      id: 'park', slot: 'after', name: 'Neighbourhood park', jp: '公園', bg: 'park',
      gain: { energy: 20 },
      hint: (s) => erased(s) ? '!one swing is moving.' : 'Swings, hydrangeas, and a streetlight that never quite works.',
    },
    {
      id: 'station', slot: 'after', name: 'Sakuragaoka Station', jp: '桜ヶ丘駅', bg: 'station',
      gain: { energy: -5 },
      visible: (s) => !!s.flags.stationUnlocked,
      hint: (s) => erased(s) ? '!a light at the far end of the platform.' : 'Hikaru said the train lights look like stars that change their mind.',
    },
  ];

  const SHOP = [
    { id: 'bread', name: 'Melon bread', price: 150, desc: 'Sweet, crunchy top. Restores 25 energy when you eat it.', use: 'Eat', used: 'Energy +25', onUse: (s) => DL.State.add({ energy: 25 }) },
    { id: 'milk', name: 'Strawberry milk', price: 120, desc: 'Pink carton. Haruka drinks one every lunch.' },
    { id: 'pencils', name: 'Blue sketch pencils', price: 480, desc: 'A tin of soft drawing pencils in six shades of blue.' },
  ];

  // Lines the game tries to rewrite. Remembering them is what keeps Hikaru real.
  const FRAGMENTS = {
    f_clip: 'On the stairs, about the star clip',
    f_rin: 'Hikaru’s apology to Rin',
    f_cafe: 'Hikaru at the cafeteria table',
    f_roof: 'Hikaru on the rooftop',
    f_vend: 'The argument at the vending machine',
    f_thanks: 'Monday morning at the gate',
    f_ribbon: 'The page caught in the fence',
    f_platform: 'The far end of the platform',
    f_phone: 'The message from ???',
    f_room: 'The last page of the sketchbook',
    f_matsuri: 'The end of the platform at the matsuri',
    f_lights: 'The blue lights that come back',
    f_sketch: 'The constellation page',
    f_pocket: 'The note in the thrift-store pocket',
    f_doll: 'The back of the paper doll',
    f_piano: 'The duet in the music room',
    f_shrine: 'The wooden wish at the shrine',
    f_film: 'The back of the old photograph',
  };
  const FRAG_TOTAL = Object.keys(FRAGMENTS).length;
  const GOOD = { frags: 5, trust: 6 };

  const ENDINGS = {
    good: {
      hint: 'Remember enough of what Hikaru really said, and earn her trust.',
      title: 'Distant Light', jp: '遥かな光',
      text: 'Haruka heard every line her sister really said. They are still two people, the same four minutes apart, but now each of them can see the other one’s light.',
    },
    neutral: {
      hint: 'Walk away from the story.',
      title: 'Sugarcoat', jp: 'シュガーコート',
      text: 'You walked away, and the story did what sweet stories do when nobody finishes them. It started over from the first page.',
    },
    bad: {
      hint: 'Agree with Haruka at the very end.',
      title: 'Same Smile', jp: '同じ笑顔',
      text: 'There is one Amane girl in class 2-B. She has always been an only child. She smiles at you every morning, and she is so glad you stayed, {name}.',
    },
    rin: {
      hint: 'A photo from a festival long ago. Make sure Rin knows the name.',
      title: 'Through the Lens', jp: 'レンズ越し',
      text: 'One photo was enough for Haruka to remember there had been two of them. Hikaru is still faint, and most people walk right through her. But Rin photographs her every day, and every day she’s a little clearer.',
    },
    haruka: {
      hint: 'Get close to Haruka, and ask who she is without her sister.',
      title: 'Older by Four Minutes', jp: '四分だけ姉',
      text: 'Haruka learned how to be one person. She stopped being cruel, and she stopped looking at the window seat. Sometimes, when she laughs, she turns to share it with someone who isn’t there.',
    },
    hikaru: {
      hint: 'Earn Hikaru’s trust, but don’t remember enough to save her.',
      title: 'The Blue Side', jp: '青い側',
      text: 'You took Hikaru’s hand and stepped into the margin with her, where the erased lines go. It’s quiet there, and very blue. In class 2-B, the window seat and the seat next to it are both empty now.',
    },
    evil: {
      hint: 'Remember almost everything. Trust Hikaru completely.',
      title: 'The Nice One', jp: '優しい方', dark: true,
      text: 'Hikaru wrote every line. The cruel ones were true, and the kind ones were bait. Haruka was never the monster. She was the first person Hikaru erased, and you helped finish the job.',
    },
    developed: {
      hint: 'Be Rin’s friend, but never tell her the name.',
      title: 'Developed', jp: '現像', dark: true,
      text: 'Rin’s album has three new photos in it: Hikaru, Haruka, and {name}. You’re all smiling. Rin says you’re much easier to love now that you hold still.',
    },
    seat: {
      hint: 'Let Haruka’s suspicion run wild, or tell her who you really are.',
      title: 'Window Seat', jp: '窓際の席', dark: true,
      text: 'The twins are fine now. They walk in step and laugh at the same jokes. Only the window seat in class 2-B stays empty, and on quiet afternoons it feels warm, as if someone just stood up.',
    },
    swap: {
      hint: 'Style the twins perfectly for the matsuri.',
      title: 'Four Minutes Older', jp: '四分の嘘', dark: true,
      text: 'They swapped places at eleven and never swapped back. Nobody knows which one is which anymore, not even them. They both answer to either name, and they both smile when you can’t tell.',
    },
    mirror: {
      hint: 'Look in Haruka’s vanity, and let her swap something at the fitting.',
      title: 'The Mirror Kept One', jp: '鏡の中', dark: true,
      text: 'There’s a girl in the heart-shaped mirror who looks exactly like you. She waves first now. Somewhere in the Amane house, Haruka is finally doing her hair.',
    },
    loop: {
      hint: 'Find at least three other endings first.',
      title: 'Day 1, Again', jp: 'もう一度', dark: true,
      text: 'There is no last day. There is only Monday, the cherry trees, and two pink girls at the gate who have been waiting for you to start over. They are very patient. They are very glad you came back.',
    },
    two: {
      hint: 'Remember almost everything, mend what was broken, and give them back to each other.',
      title: 'Two Lights', jp: '二つの光',
      text: 'Nobody was erased. Haruka and Hikaru walk home on either side of you, arguing about the last melon bread. At the end of the platform there are two lights now, side by side, and neither of them is going anywhere.',
    },
    overexposed: {
      hint: 'Develop the last roll of film, then let the darkroom finish the job.',
      title: 'Overexposed', jp: '露光過多', dark: true,
      text: 'Rin finished developing the last roll. In every frame the twins are smiling straight at the camera, and you aren’t in any of them, because you’re the one holding it now. You always will be. Say cheese, {name}.',
    },
    reflection: {
      hint: 'Dress each twin as the other at the Saturday fitting, and help them tell each other the truth.',
      title: 'Each Other', jp: '入れ替わり',
      text: 'For one week Haruka was quiet and Hikaru was loud, and both of them found out the other one was never the villain. They swapped back on Thursday. Haruka kept the blue hair clip. Hikaru kept one leopard earring. They still argue. They argue as two people now.',
    },
    feast: {
      hint: 'Make a deal with the Mikage siblings.',
      title: 'Welcome Party', jp: '歓迎会', dark: true,
      text: 'The Mikage siblings threw a welcome party in the student council room. All of class 2-B came. Nobody remembers what was served, or who was missing from the photo afterwards. Every night at 3am, a message arrives from a number you never saved: thank you for the meal, {name}. we saved you a seat.',
    },
    apart: {
      hint: 'Find Sei Mikage alone, believe him, and let him speak.',
      title: 'Separate Plates', jp: '別々の皿',
      text: 'Sei Mikage said his sister’s name out loud in front of all of 2-B, and then he said everyone else’s. Hikaru Amane was remembered by thirty people at once, loudly, on purpose. Sei lives with his aunt now and eats lunch with you on the roof. He still can’t hold chopsticks without his hands shaking. At the end of a corridor nobody else can find, one plate is still set. Nobody remembers who for.',
    },
    exhibit: {
      hint: 'Run out of time on Rin’s makeover, or let the mirror take over.',
      title: 'The Exhibit', jp: '展示品', gameover: true,
      text: 'The photo club exhibition opened on time. Everyone agreed the best piece was the life-size portrait at the end of the hall: a girl in pink, smiling, hands empty, no camera. It doesn’t blink. Rin Hoshino hasn’t been seen since the opening.',
    },
    doll: {
      hint: 'Fail the Saturday fitting.',
      title: 'Matching Set', jp: 'お揃い', gameover: true,
      text: 'Three girls went to the Sakura Matsuri. Same pink. Same leopard print. Same smile. Nobody could tell which one used to be blue, or which one used to be {name}.',
    },
  };

  const CREDITS = {
    creator: 'the person who dreamed up Hikaru and Haruka',
    art: 'made from the creator’s own prompts',
  };

  return { CHAR, DAYS, LAST_DAY, LOCATIONS, SHOP, FRAGMENTS, FRAG_TOTAL, GOOD, ENDINGS, CREDITS };
})();
