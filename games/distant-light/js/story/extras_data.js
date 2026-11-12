/* DATA FOR THE PHONE APPS AND THE NEW STORY BITS.
   Trophies, the 12 lost bracelet charms, album photos, character profiles,
   the clue board and the week calendar. Each entry's `cond` looks at the save
   to decide whether it's unlocked yet. */
DL.Extras = (() => {
  const F = (name) => (s) => !!(s.flags && s.flags[name]);
  const has = (id) => (s) => !!(s.frags && s.frags.includes(id));
  const lostCount = (s) => (s.lost || []).length;
  const stars3 = (s) => Object.values(s.mg || {}).filter((n) => n >= 3).length;
  const studioDone = (s) => Object.values(s.studio || {}).filter((r) => r && r.result !== 'left').length;

  /* ---------- 1. Trophies (kept across every playthrough) ---------- */
  const TROPHIES = [
    { id: 'day2', icon: '🌸', name: 'First day survived', desc: 'Make it through Monday at Sakuragaoka.', cond: (s) => s.day >= 2 },
    { id: 'frag1', icon: '↺', name: 'Something felt wrong', desc: 'Remember your first rewritten line.', cond: (s) => s.frags.length >= 1 },
    { id: 'frag5', icon: '✎', name: 'Five true lines', desc: 'Remember five things Hikaru really said.', cond: (s) => s.frags.length >= 5 },
    { id: 'frag12', icon: '📖', name: 'Nearly everything', desc: 'Remember twelve true lines in one week.', cond: (s) => s.frags.length >= 12 },
    { id: 'fragAll', icon: '💙', name: 'Every word', desc: 'Remember every single line in one playthrough.', cond: (s) => s.frags.length >= DL.Data.FRAG_TOTAL },
    { id: 'trust10', icon: '☁', name: 'Her favourite person', desc: 'Earn Hikaru’s complete trust.', cond: (s) => s.trust >= 10 },
    { id: 'favor8', icon: '🎀', name: 'Haruka’s bestie', desc: 'Get very, very close to Haruka.', cond: (s) => s.favor >= 8 },
    { id: 'rin', icon: '📷', name: 'Photo club member', desc: 'Become Rin’s friend.', cond: F('rinFriend') },
    { id: 'perfect', icon: '👘', name: 'Perfect styling', desc: 'Style the twins perfectly for the matsuri.', cond: F('festivalPerfect') },
    { id: 'photo', icon: '🎞', name: 'Steady hands', desc: 'Take a clear photo of the twins at the matsuri.', cond: F('goodPhoto') },
    { id: 'notes', icon: '✉', name: 'Pocket detective', desc: 'Find all three notes at Kaze Thrift.', cond: (s) => (s.flags.notesFound || 0) >= 3 },
    { id: 'lost6', icon: '✦', name: 'Treasure hunter', desc: 'Find six of Hikaru’s lost charms.', cond: (s) => lostCount(s) >= 6 },
    { id: 'lost12', icon: '📿', name: 'Bracelet mended', desc: 'Find all twelve lost charms.', cond: (s) => lostCount(s) >= 12 },
    { id: 'talker', icon: '💬', name: 'Good listener', desc: 'Have eight different heart-to-heart conversations in one week.', cond: (s) => Object.keys(s.seen || {}).filter((k) => /_talk$|^court_ask$|^lib_photo$|^sta_last$/.test(k)).length + (s.flags.mallTwins ? 1 : 0) >= 8 },
    { id: 'rinPerfect', icon: '💜', name: 'Kind of person people photograph', desc: 'Give Rin a perfect makeover.', cond: (s) => s.flags.st_beauty === 'perfect' },
    { id: 'studio', icon: '🛍', name: 'Studio regular', desc: 'Finish six style-studio games in one week.', cond: (s) => studioDone(s) >= 6 },
    { id: 'rich', icon: '💴', name: 'Konbini legend', desc: 'Have ¥5,000 at once.', cond: (s) => s.money >= 5000 },
    { id: 'grades', icon: '💯', name: 'Top of the class', desc: 'Reach 90 grades.', cond: (s) => s.grades >= 90 },
    { id: 'daikichi', icon: '⛩', name: 'Great blessing', desc: 'Draw 大吉 at the shrine.', cond: F('daikichi') },
    { id: 'call', icon: '☎', name: 'Picked up at 3am', desc: 'Answer the phone when it rings in the middle of the night.', cond: F('answered3am') },
    { id: 'duet', icon: '🎹', name: 'Duet', desc: 'Play the piano with Hikaru.', cond: has('f_piano') },
    { id: 'notMenu', icon: '🍽', name: 'Not on the menu', desc: 'Say no to the Mikage siblings.', cond: F('mikageRefused') },
    { id: 'seiAlly', icon: '🩹', name: 'Remember me', desc: 'Believe Sei Mikage when he finds you alone.', cond: F('seiAlly') },
    { id: 'swapped', icon: '⇄', name: 'Who’s who?', desc: 'Dress each twin as the other at the Saturday fitting.', cond: F('twinSwap') },
    { id: 'end3', icon: '🔁', name: 'Looping', desc: 'See three different endings.', meta: (m) => m.endings.length >= 3 },
    { id: 'end8', icon: '🗂', name: 'Archivist', desc: 'See eight different endings.', meta: (m) => m.endings.length >= 8 },
    { id: 'endTwo', icon: '✨', name: 'Two Lights', desc: 'Find the true ending.', meta: (m) => m.endings.includes('two') },
    { id: 'endDark', icon: '🩸', name: 'Something is wrong with me', desc: 'See three of the dark endings.', meta: (m) => m.endings.filter((e) => DL.Data.ENDINGS[e] && DL.Data.ENDINGS[e].dark).length >= 3 },
  ];

  /* ---------- 2. Lost Things: twelve charms from Hikaru's broken bracelet ---------- */
  const LOST = [
    { id: 'l_star', loc: 'rooftop', from: 1, icon: '⭐', name: 'Tin star', text: 'A little tin star is wedged in the fence. One of its points is bent, like someone stepped on it.' },
    { id: 'l_train', loc: 'station', from: 5, icon: '🚃', name: 'Tiny train', text: 'A blue enamel train charm sits on the yellow line at the very end of the platform.' },
    { id: 'l_moon', loc: 'park', from: 1, icon: '🌙', name: 'Crescent moon', text: 'Under the swing, half-buried in sand: a silver crescent moon on a broken jump ring.' },
    { id: 'l_note', loc: 'musicroom', from: 2, icon: '🎵', name: 'Music note', text: 'Inside the piano bench, on top of old sheet music: a tiny enamel quaver.' },
    { id: 'l_bunny', loc: 'cafeteria', from: 2, icon: '🐰', name: 'Glass bunny', text: 'Under the window table, someone has kicked a frosted-glass bunny into the corner.' },
    { id: 'l_book', loc: 'library', from: 1, icon: '📘', name: 'Mini sketchbook', text: 'A charm shaped like a blue sketchbook is being used as a bookmark in a book about trains.' },
    { id: 'l_petal', loc: 'courtyard', from: 1, icon: '🌸', name: 'Resin petal', text: 'A real cherry petal set in clear resin, caught in the roots of the big tree.' },
    { id: 'l_pencil', loc: 'classroom', from: 2, icon: '✏', name: 'Blue pencil', text: 'In the gap behind the window-seat desk: a tiny blue pencil charm. It still has a bite mark.' },
    { id: 'l_milk', loc: 'konbini', from: 3, icon: '🥛', name: 'Strawberry milk', text: 'In the lost property box at the konbini: a strawberry-milk carton charm. Pink. Not Hikaru’s colour. She wore it anyway.' },
    { id: 'l_light', loc: 'street', from: 4, icon: '💡', name: 'Glow bead', text: 'A bead that glows faintly blue in the dark, rolling in the gutter by the vending machine.' },
    { id: 'l_fox', loc: 'shrine', from: 2, icon: '🦊', name: 'Kitsune', text: 'Tied to the shrine rope with a blue thread: a tiny white fox charm.' },
    { id: 'l_heart', loc: 'darkroom', from: 3, icon: '💔', name: 'Half a heart', text: 'Pinned to the drying line between two photos: half of a heart charm. The other half says “HAR”.' },
  ];

  /* ---------- 3. Album photos ---------- */
  const PHOTOS = [
    { id: 'p_gate', title: 'First day', bg: 'gate', who: [], cond: (s) => s.day >= 1, cap: 'Sakuragaoka High. You took this so you’d remember the day you started over.' },
    { id: 'p_cafe', title: 'The window table', bg: 'cafeteria', who: ['haruka', 'hikaru'], cond: (s) => !!s.seen.cafe_1, cap: 'Haruka posed. Hikaru looked at the floor.' },
    { id: 'p_roof', title: 'Rooftop lunch', bg: 'rooftop', who: ['hikaru'], cond: (s) => !!s.seen.roof_1, cap: 'She let you take one. She’s holding her sketchbook in front of her face.' },
    { id: 'p_library', title: 'Study buddy', bg: 'library', who: ['rin'], cond: F('rinFriend'), cap: 'Rin, finally on the other side of a camera. She’s squinting.' },
    { id: 'p_piano', title: 'The duet', bg: 'classroom', who: ['hikaru'], cond: has('f_piano'), cap: 'Music room, lunchtime. She played the train song twice.' },
    { id: 'p_shrine', title: 'Fortune', bg: 'shrine', who: [], cond: F('shrineVisit'), cap: 'The omikuji tied to the shrine branch. You don’t remember tying it that tight.' },
    { id: 'p_matsuri', title: 'Sakura Matsuri', bg: 'station', who: ['haruka', 'hikaru'], cond: F('goodPhoto'), cap: 'Rin’s photo. You can see the bit of light between them.' },
    { id: 'p_purikura', title: 'Purikura', bg: 'station', who: ['haruka', 'hikaru'], ghost: true, cond: F('purikuraGhost'), cap: 'Three frames. Haruka cut off the fourth.' },
    { id: 'p_stardust', title: 'Stardust cover', bg: 'street', who: ['rin'], cond: F('rinBrave'), cap: 'Rin, after. She asked for a copy. She’s never asked for a copy of anything.' },
    { id: 'p_birthday', title: 'Happy birthday', bg: 'sisters_room', who: ['haruka', 'hikaru'], cond: F('giftsGood'), cap: 'Seventeen candles. Two wishes. Neither of them would say.' },
    { id: 'p_room', title: 'Two halves', bg: 'sisters_room', who: ['haruka', 'hikaru'], cond: F('roomShared'), cap: 'Pink side, blue side, one whale plush in the exact middle.' },
    { id: 'p_film', title: 'The last roll', bg: 'library', who: ['haruka', 'hikaru'], cond: F('filmDeveloped'), cap: 'Age eleven, at the end of the platform. Nobody remembers who took it.' },
    { id: 'p_platform', title: 'The far end', bg: 'station', who: ['hikaru'], cond: has('f_platform'), cap: 'You didn’t take this one. It was already on your phone.' },
    { id: 'p_dolls', title: 'Promise', bg: 'sisters_room', who: ['haruka', 'hikaru'], cond: F('secretMemory'), cap: 'Two paper dolls holding hands. The crayon says: promise.' },
  ];

  /* ---------- 4. Profiles ---------- */
  const PROFILES = {
    hikaru: { name: 'Hikaru Amane', jp: '天音 光', tag: 'Class 2-B · window seat · the younger twin', facts: [
      { text: 'Pale blue everything. Says she “doesn’t have a colour” when people ask.', cond: () => true },
      { text: 'Draws trains and people in a blue sketchbook. Never you. (She says.)', cond: (s) => !!s.seen.roof_1 },
      { text: 'Can play the piano, but only when she thinks nobody is listening.', cond: F('pianoMet') },
      { text: 'Six shades of blue pencil is the correct number. Five is a tragedy.', cond: F('gavePencils') },
      { text: 'Watches the trains come in at Sakuragaoka Station. The blue lights are the ones that come back.', cond: F('stationUnlocked') },
      { text: 'Was only mean once, at eleven, to protect her sister. Stayed mean so Haruka wouldn’t be alone in it.', cond: F('knowsTruth') },
      { text: 'Wears a charm bracelet she says she lost. She didn’t lose it. It came apart.', cond: (s) => lostCount(s) >= 3 },
    ] },
    haruka: { name: 'Haruka Amane', jp: '天音 遥', tag: 'Class 2-B · the older twin (by four minutes)', facts: [
      { text: 'Pale pink, leopard print, glitter. Loud on purpose.', cond: () => true },
      { text: 'Keeps a pink notebook labelled PROOF. It’s about her sister.', cond: F('readNotebook') },
      { text: 'Drinks one strawberry milk every lunch. Exactly one.', cond: (s) => !!s.seen.cafe_1 },
      { text: 'Fixes her ponytail in the courtyard when she thinks nobody’s looking. Her hands shake.', cond: (s) => !!s.seen.court_1 },
      { text: 'Is terrified that if Hikaru stops needing her to be mean, Hikaru won’t need her at all.', cond: F('sawHarukaFear') },
      { text: 'Used to love the swings. Hasn’t been on one since she was eleven.', cond: F('swingMemory') },
      { text: 'Wished at the shrine that they would always match.', cond: F('readEma') },
    ] },
    rin: { name: 'Rin Hoshino', jp: '星野 凛', tag: 'Class 2-B · photography club', facts: [
      { text: 'Lavender hair, round glasses, a camera she never puts down.', cond: () => true },
      { text: 'Always asks before taking your photo. Always.', cond: (s) => s.day >= 2 },
      { text: 'Develops her own film in the club darkroom. Says the dark helps her think.', cond: F('darkroomMet') },
      { text: 'Wanted to look “like the kind of person people photograph”. Really wanted to stop hiding.', cond: (s) => !!(s.studio && s.studio.beauty) },
      { text: 'Her bathroom mirror waved at her first. Once.', cond: F('mirrorRin') },
      { text: 'Knows something is wrong with the class photo. Hasn’t said it out loud yet.', cond: F('photoClue') },
    ] },
  };

  PROFILES.rei = { name: 'Rei Mikage', jp: '御影 澪', tag: 'Class 2-A · student council · the older one', show: F('mikageMet'), facts: [
    { text: 'Blonde with one red streak. Smiles at exactly the same time as her brother.', cond: () => true },
    { text: 'Knew your name before you told her.', cond: F('mikageMet') },
    { text: 'Texts at night from a number you never saved.', cond: F('mikageTexts') },
    { text: 'Makes meat buns from a “family recipe”. Nobody remembers whose family.', cond: F('ateBun') },
    { text: 'Says nobody misses what nobody remembers.', cond: (s) => !!(s.flags.sawPlates || s.flags.mikageRefused || s.flags.mikageDeal) },
    { text: 'Waits at the vending machine at night. Alone. Says soft things go first.', cond: F('metReiAlone') },
    { text: 'Hates red light. Can’t see into the darkroom.', cond: F('seiAlly') },
  ] };
  PROFILES.sei = { name: 'Sei Mikage', jp: '御影 聖', tag: 'Class 2-A · student council · the younger one', show: F('mikageMet'), facts: [
    { text: 'Blonde with one red streak. Finishes his sister’s sentences, like he’s been told to.', cond: () => true },
    { text: 'Never eats the buns. Hands always clasped, always shaking.', cond: (s) => !!(s.seen.cou_1 || s.flags.seiAlly) },
    { text: 'Hides in the darkroom. “I’m not like her. I pretend.”', cond: (s) => !!(s.flags.seiAlly || s.flags.seiBetrayed) },
    { text: 'Gave you a pale blue ribbon from the long table.', cond: F('seiRibbon') },
    { text: 'Tried to stop his sister asking which twin to “save for last”.', cond: (s) => !!s.seen.cou_1 },
    { text: 'Walks home whichever way his sister does. Told you to lock the door.', cond: (s) => !!s.seen.mik_walk },
    { text: 'Can’t take someone who is still remembered. Doesn’t like that you know.', cond: F('mikageRule') },
  ] };

  /* ---------- 5. Clue board ---------- */
  const CLUES = [
    { id: 'c_seat', title: 'The window seat', text: 'Nobody sits in the window seat in 2-B on day 7. Everyone acts like nobody ever did.', cond: (s) => s.day >= 7 },
    { id: 'c_lines', title: 'Lines that change', text: 'Some of Hikaru’s sentences rewrite themselves into something cruel. Remembering them keeps her real.', cond: (s) => s.frags.length + s.missed.length >= 1 },
    { id: 'c_proof', title: 'PROOF', text: 'Haruka keeps a notebook of “evidence” that Hikaru enjoys being mean.', cond: F('readNotebook') },
    { id: 'c_photo', title: 'The class photo', text: 'Every few days, Hikaru looks a little fainter in the class photo by the stairs.', cond: F('classPhoto2') },
    { id: 'c_vanity', title: 'The torn page', text: '“If she doesn’t need me to be mean with her, then what am I for?” (Haruka’s vanity drawer)', cond: F('sawVanity') },
    { id: 'c_sketch', title: 'Tanabata, age 11', text: 'Hikaru said one mean thing to protect Haruka. Haruka thought she loved it.', cond: F('sawSketchbook') },
    { id: 'c_notes', title: 'Pocket notes', text: 'Notes in blue pen, hidden in thrift-store clothes that were never sold to anyone.', cond: F('pocketNote') },
    { id: 'c_purikura', title: 'Frame four', text: 'Three girls in the last purikura frame. One with no face.', cond: F('purikuraGhost') },
    { id: 'c_ema', title: 'Two wishes', text: 'Two wooden wishes at the shrine, side by side. One asks to always match. One asks for the other to be happy.', cond: F('readEma') },
    { id: 'c_film', title: 'The last roll', text: 'An old roll of film from the platform, years ago. Somebody took it. Nobody remembers who.', cond: F('filmDeveloped') },
    { id: 'c_call', title: '3:00 a.m.', text: 'The phone rings at 3am from a number that isn’t saved. Only static, and breathing, and once, your name.', cond: F('heard3am') },
    { id: 'c_bracelet', title: 'The bracelet', text: 'Twelve charms from one bracelet, scattered all over town. Like a trail. Like someone wanted to be found.', cond: (s) => lostCount(s) >= 1 },
    { id: 'c_dolls', title: 'Promise?', text: '“If we ever stop matching, I’ll still know which one is you.”', cond: F('secretMemory') },
    { id: 'c_mikage', title: 'The Mikage siblings', text: 'Two students from 2-A who always know where you are. They notice people who are fading. They are always hungry.', cond: F('mikageMet') },
    { id: 'c_sei', title: 'Soft in the middle', text: 'Sei Mikage doesn’t eat. He pretends, because his sister is all he has left. She can’t see into the darkroom.', cond: (s) => !!(s.flags.seiAlly || s.flags.seiBetrayed) },
    { id: 'c_table', title: 'The long table', text: 'Behind the council room door: a corridor that doesn’t fit in the school, and a table set for more people than there are in 2-B.', cond: (s) => !!(s.seen.cou_7 || s.seen.sei_last) },
    { id: 'c_plates', title: 'Two plates', text: 'A table set for two in the council room. Between the plates, a pale blue ribbon.', cond: F('sawPlates') },
    { id: 'c_swap', title: 'Whoever wears blue', text: 'It was never about which twin. The town forgets whoever is wearing blue.', cond: (s) => !!s.seen.swap_mon || !!s.flags.twinSwap },
    { id: 'c_mirror', title: 'Mirrors', text: 'Mirrors in this town keep showing Haruka where she isn’t standing.', cond: (s) => !!(s.flags.mirrorRin || s.flags.sawVanity || s.flags.salonMatched) },
  ];

  /* ---------- 6. Calendar ---------- */
  const CAL = {
    1: ['First day at Sakuragaoka High', 'Customise your uniform'],
    2: ['Kaze Thrift opens for Rin', 'Nail bar with the twins'],
    3: ['Stardust Beauty (after thrift)', 'Gift floor open'],
    4: ['Salon Lumière booked by Haruka', 'Last day for birthday gifts'],
    5: ['Surprise quiz', '🎂 The twins’ birthday'],
    6: ['🏮 Sakura Matsuri was on Saturday', 'Purikura at the station'],
    7: ['[[ ]]', '[[nothing is scheduled. nothing was ever scheduled.]]'],
    8: ['Visit the Amane house'],
    9: ['Last day'],
  };

  return { TROPHIES, LOST, PHOTOS, PROFILES, CLUES, CAL, lostCount };
})();
