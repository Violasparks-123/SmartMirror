/* THE EXTENDED WEEK: for players who want to see everything. Adds Day 0 (moving day), a whole extra
   school week between Friday and the matsuri, and the Sunday after the matsuri.
   Turned on with the "Extended week" switch when you start a new game (s.extended).
   - Day 0, Sunday 12 April (moving day): explore Sakuragaoka before school starts. You meet two
     girls without knowing who they are yet. Day 1 remembers it.
   - Sunday 19 April (the day after the matsuri): visit the Amane house, the sea, the morning market,
     Rin's photo shop... and Hikaru calls you that night.
   - Each Sunday you pick two places (morning and afternoon) from places that only exist on Sundays.
   - New ending: The Sea in May (promise Hikaru the sea, and keep it).
   Loaded last (after mikage_feast.js). */
(() => {
  const { scene, bg, show, hide, hideAll, n, H, K, R, REI, SEI, me, X, opt, choice, add, flag, iff, go, call, js, sfx, music, fx, diary, card, ending, phone, msg, reply, phoneClose, has, f } = DL.DSL;
  const EXT = (s) => !!s.extended;
  const MIK = (s) => !!(DL.Mikage && DL.Mikage.on(s));
  const HIKARU_DM = { sub: 'Hikaru Amane', avatar: 'assets/sprites/hikaru_face.webp' };
  const pink = fx('tint', { kind: 'pink' }), dusk = fx('tint', { kind: 'dusk' }), clear = fx('tint', { kind: null });

  // Labels the HUD and diary use on the extra days
  DL.Data.XDAYS = {
    sun0: { label: 'Day 0', jp: '日曜日', date: '4月12日', am: 'Sunday morning', pm: 'Sunday afternoon', town: true },
    sun1: { label: 'Sunday', jp: '日曜日', date: '4月26日', am: 'Sunday morning', pm: 'Sunday afternoon', town: true },
    w1: { label: 'Week 2 · Day 1', jp: '月曜日', date: '4月20日' },
    w2: { label: 'Week 2 · Day 2', jp: '火曜日', date: '4月21日' },
    w3: { label: 'Week 2 · Day 3', jp: '水曜日', date: '4月22日' },
    w4: { label: 'Week 2 · Day 4', jp: '木曜日', date: '4月23日' },
    w5: { label: 'Week 2 · Day 5', jp: '金曜日', date: '4月24日' },
  };
  // In the extended week the second half of the story happens a week later.
  const LATER = { 6: '4月27日', 7: '4月28日', 8: '4月29日', 9: '4月30日' };
  DL.Data.dayInfo = (s) => {
    if (s.xday && DL.Data.XDAYS[s.xday]) return DL.Data.XDAYS[s.xday];
    const d = DL.Data.DAYS[s.day - 1];
    return d && s.extended && LATER[s.day] ? Object.assign({}, d, { date: LATER[s.day] }) : d;
  };
  // The days to play: Day 0, Days 1-5, an extra school week, then Days 6-9 (Saturday and Sunday open Day 6).
  DL.Data.slots = (s) => {
    const base = Array.from({ length: DL.Data.LAST_DAY }, (_, i) => ({ d: i + 1 }));
    if (!s.extended) return base;
    return [{ d: 1, x: 'sun0' }, ...base.slice(0, 5), ...['w1', 'w2', 'w3', 'w4', 'w5'].map((x) => ({ d: 5, x })), ...base.slice(5)];
  };

  function snapshot(s) { return { grades: s.grades, money: s.money, energy: s.energy, trust: s.trust, favor: s.favor, susp: s.susp, frags: s.frags.length }; }
  const startDay = (key) => js((s) => { s.xday = key; s.phase = 'morning'; s.dayStart = snapshot(s); DL.Screens.hud(true); });
  const townPick = (phase) => js(async (s) => {
    s.phase = phase; DL.Screens.hud(true);
    DL.Dialogue.hide(); DL.Stage.hideAll();
    await DL.Stage.setBg('street', { fade: 300, clean: true });
    const loc = await DL.Screens.planner('town');
    s.flags[`v_${loc}_${s.xday}`] = true;
    await DL.Game.playLocation(loc, { gen: DL.Game.gen });
    DL.Stage.hideAll(); DL.Dialogue.hide();
  });
  const endDay = (key) => js(async (s) => {
    s.phase = 'night'; DL.Screens.hud(true);
    DL.Dialogue.hide(); DL.Stage.hideAll();
    await DL.Stage.setBg('bedroom_night', { clean: true });
    await DL.Screens.diary();
    DL.State.add({ energy: 40 }, { quiet: true });
    s.flags[key + 'Done'] = true;
    s.xday = null; s.phase = 'morning'; s.diary = []; s.dayStart = snapshot(s);
  });

  /* ================= DAY 0 · MOVING DAY ================= */
  // A real day in the schedule: morning (scripted), two Sunday-place picks, evening, diary (and it saves).
  scene('x_sun0_morning', [
    card('', { num: 'Day 0', jp: '日曜日　4月12日', en: 'Sunday · Moving day' }),
    music('calm'),
    bg('station', { clean: true, kenburns: true }),
    n('The train doors open onto a tiny station with cherry trees growing right up against the platform.'),
    n('Sakuragaoka. Your new town. Tomorrow you start at a school where nobody knows your name.'),
    bg('bedroom', { clean: true }),
    n('Your new room smells like tatami and cardboard. The boxes can wait.'),
    n('Your new school uniform is still in its plastic bag. You hold it up. It’s two sizes too big.'),
    n('Out of the window, across the street, there’s a house with two upstairs windows side by side. One curtain is pink. One is blue.'),
    n('You have one whole Sunday to learn where everything is.'),
  ]);
  scene('x_sun0_evening', [
    bg('bedroom_night', { clean: true }),
    n('That night you unpack exactly one box and give up.'),
    n('Across the street, the blue window is lit. Someone is playing the piano very quietly. It stops in the middle of a bar, like someone told them to.'),
    n('Then the blue light goes off, and the pink one comes on.'),
    iff(MIK, [n('Under the street light, two people with pale blonde hair are looking up at the house across the street. Then, together, they turn and look up at yours.')]),
    diary('Moved to Sakuragaoka. The house across the street has a pink window and a blue window.'),
    flag('sun0Done'),
  ]);

  // Day 1 remembers who you met on Day 0
  { const list = DL.Engine.scenes.d1_morning;
    const k = list.findIndex((c) => c.t === 'say' && /Twins, obviously/.test(c.text || ''));
    list.splice(k + 1, 0,
      iff(f('metBlueGirl'), [n('The blue one is the girl from the ticket machine yesterday. For a second her face goes soft, like she’s glad. Then she puts the frown back on, carefully, like a hat.')]),
      iff(f('metPinkGirl'), [n('The pink one is the girl who cut the queue at the uniform shop. She clearly has no idea she’s ever seen you before.')])); }

  /* ================= WEEK TWO · FIVE EXTRA SCHOOL DAYS =================
     Between Friday and the matsuri, the extended week adds a whole extra school week (it saves like any
     other day). Each day has its own morning and evening; lunch and after school are free choices,
     so there's time to see everything around school. */
  const HARUKA_DM = { sub: 'online', avatar: 'assets/sprites/haruka_face.webp' };
  const RIN_DM = { sub: 'Rin Hoshino', avatar: 'assets/sprites/rin_face.webp' };
  const GROUP = { sub: '28 members', initial: '✿', color: 'linear-gradient(135deg, #ffd3e3, #c7b6ea)' };
  const wcard = (jp, date, en) => card('', { num: 'Week 2', jp: jp + '　' + date, en });

  // Monday: seat change
  scene('x_w1_morning', [
    wcard('月曜日', '4月20日', 'Monday · Seat change'), music('calm'),
    bg('classroom'),
    n('A whole extra week before the matsuri. Ms. Kanda says the festival committee “needs more time”. Nobody argues.'),
    X('Ms. Kanda', 'New month, new seats. Draw a number from the box. No swapping. Amane-san, I am looking at you.'),
    n('Both twins look up. She’s looking at Haruka.'),
    X('Ms. Kanda', 'Roll call first. Aoki. Fujita. Hoshino. Amane Haruka.'),
    H('smirk', 'Here~'),
    X('Ms. Kanda', 'Inoue. Kato—'),
    n('She’s skipped one. Hikaru raises her hand anyway, very straight, and keeps it up until Ms. Kanda blinks and says, “Oh. Amane Hikaru. Sorry. Here.”'),
    n('Nobody else noticed.'),
    choice('Your number puts you…',
      opt('…by the window, next to Hikaru.', [
        show('hikaru', 'surprised', 'center'),
        K('surprised', 'Oh. It’s you.'),
        K('soft', '…Good. I mean. Fine. Don’t talk during maths.'),
        n('She talks during maths. Twice. Both times to tell you the answer.'),
        hide('hikaru'), add({ trust: 1 }), flag('w1Hikaru'),
      ]),
      opt('…in front of Haruka.', [
        show('haruka', 'smirk', 'center'),
        H('smirk', 'Ugh. Now I have to look at the back of your head all day.'),
        H('happy', 'Your hair’s actually nice from behind. Don’t let that go to your head. Ha. Head.'),
        hide('haruka'), add({ favor: 1 }), flag('w1Haruka'),
      ]),
      opt('…next to Rin.', [
        show('rin', 'happy', 'center'),
        R('happy', 'Seat buddies! I’ll lend you my notes. They’re mostly drawings of the teacher, but still.'),
        hide('rin'), flag('rinFriend'), add({ grades: 2 }),
      ]),
    ),
    diary('Seat change. Ms. Kanda forgot Hikaru at roll call. Hikaru kept her hand up until she remembered.'),
  ]);
  scene('x_w1_evening', [
    bg('bedroom_night', { clean: true }),
    phone('2-B ✿', GROUP),
    msg('haruka', 'NEW SEATING CHART (unofficial) (correct)', { group: true }),
    msg('haruka', 'window row: me, hikaru, {name}. everyone else: wherever', { group: true }),
    msg('hikaru', 'that’s not where we sit', { group: true }),
    msg('haruka', 'it is now. i’ve decided', { group: true }),
    reply(
      opt('I’ll take the window row', [msg('haruka', 'good. you’re useful sometimes', { group: true }), add({ favor: 1 })]),
      opt('Hikaru’s right though', [msg('hikaru', '🫧', { group: true }), msg('haruka', 'traitor', { group: true }), add({ trust: 1 })]),
    ),
    phoneClose(),
  ]);

  // Tuesday: PE
  scene('x_w2_morning', [
    wcard('火曜日', '4月21日', 'Tuesday · PE'), music('calm'),
    bg('courtyard'),
    n('PE is volleyball on the courtyard court. Haruka is a captain. Of course she is.'),
    show('haruka', 'happy', 'left'),
    H('happy', 'I pick {name}. Obviously. And… Hikaru.'),
    n('There’s a pause, like the class had forgotten Hikaru was standing there. She walks over slowly, and stands slightly behind Haruka.'),
    show('hikaru', 'neutral', 'right'),
    n('Haruka spikes like she’s angry at the ball personally. Hikaru doesn’t touch it once. Every time it comes near her, someone else dives in front of her, like she isn’t there.'),
    choice(
      opt('Pass the ball straight to Hikaru.', [
        n('She catches it. Everyone stares. She looks at the ball like it’s a present.'),
        K('surprised', '…Thanks.'),
        n('She serves it right over the net. Haruka screams so loud the PE teacher blows his whistle at her.'),
        add({ trust: 2 }), flag('w2Pass'),
      ]),
      opt('Win the match with Haruka.', [
        H('happy', 'YES! Undefeated! {name}, you’re my favourite now. Don’t tell anyone.'),
        n('Afterwards, you can’t find Hikaru. She’s sitting on the steps by herself, re-tying her shoes, very slowly.'),
        add({ favor: 2 }),
      ]),
      opt('Sit out on the bench with Hikaru.', [
        K('neutral', 'You don’t have to sit with me.'),
        K('soft', '…But okay.'),
        n('You watch Haruka play. Hikaru narrates every point under her breath like a sports commentator. She’s very funny when nobody can hear her.'),
        add({ trust: 1 }), flag('w2Bench'),
      ]),
    ),
    hideAll(),
    diary('Volleyball in PE. Nobody passed to Hikaru. Like the ball couldn’t see her either.'),
  ]);
  scene('x_w2_evening', [
    bg('bedroom_night', { clean: true }),
    phone('Haruka', HARUKA_DM),
    msg('haruka', 'did you see my spike. be honest. it was incredible'),
    msg('haruka', 'also'),
    msg('haruka', 'did hikaru look sad today. she does this thing where she looks fine but she isn’t'),
    reply(
      opt('She looked a bit lonely.', [msg('haruka', '…'), msg('haruka', 'ok. i’ll get her the strawberry milk she likes. don’t tell her it was me'), add({ favor: 1, susp: -1 })]),
      opt('She seemed fine to me.', [msg('haruka', 'yeah. she always seems fine.'), msg('haruka', 'that’s the problem'), add({ susp: 1 })]),
    ),
    phoneClose(),
  ]);

  // Wednesday: cooking practice
  scene('x_w3_morning', [
    wcard('水曜日', '4月22日', 'Wednesday · Cooking practice'), music('calm'),
    iff(MIK, [bg('homeec')], [bg('cafeteria')]),
    n('Home ec. Today: tamagoyaki. Groups of three. Haruka grabs your sleeve and Hikaru’s sleeve before anyone else can.'),
    show('haruka', 'smirk', 'left'), show('hikaru', 'neutral', 'right'),
    H('smirk', 'I’ll crack the eggs. I’m amazing at cracking eggs.'),
    n('She is not amazing at cracking eggs. There is shell in everything.'),
    n('While Haruka is busy shouting at the frying pan, Hikaru quietly picks every bit of shell out, rolls the omelette perfectly, and slides it onto a plate with Haruka’s side facing up.'),
    X('Teacher', 'Beautiful! Who made this?'),
    choice('Haruka opens her mouth. Hikaru looks at the floor.',
      opt('“Hikaru did. Haruka cracked the eggs.”', [
        H('surprised', '…'),
        H('soft', '…Yeah. Hikaru did. She always fixes it.'),
        n('Hikaru goes pink to the ears. It’s the first time you’ve seen Haruka give anything away.'),
        add({ trust: 2, favor: 1 }), flag('w3Credit'),
      ]),
      opt('Let Haruka take the credit.', [
        H('happy', 'Me! Obviously!'),
        n('Hikaru smiles at her sister like that’s exactly what she wanted. Maybe it was.'),
        add({ favor: 1 }),
      ]),
    ),
    iff(MIK, [
      hideAll(),
      show('rei', 'smile', 'center'),
      n('Rei Mikage is leaning in the doorway with her arms folded, watching the frying pans.'),
      REI('smile', 'Eggs. How sweet. Do you need anything more… substantial? I can bring meat from the council room.'),
      show('sei', 'worried', 'right'),
      SEI('worried', 'Rei. Not here. Please.'),
      n('He pulls her away by the sleeve. She lets him, smiling the whole time.'),
    ]),
    hideAll(),
    diary('Cooking practice. Hikaru fixed Haruka’s tamagoyaki without saying anything. Like she always does.'),
  ]);
  scene('x_w3_evening', [
    bg('bedroom_night', { clean: true }),
    phone('Hikaru', HIKARU_DM),
    msg('hikaru', '[photo: a slightly wonky tamagoyaki on a pink plate]'),
    msg('hikaru', 'made another one at home. for haruka. she said it was “fine”'),
    msg('hikaru', 'fine means she loved it. she ate three'),
    reply(
      opt('You’re a good sister.', [msg('hikaru', 'i’m the mean one, remember'), msg('hikaru', '…thank you though'), add({ trust: 1 })]),
      opt('Make me one next time.', [msg('hikaru', 'ok'), msg('hikaru', 'i’ll put no shell in yours. special treatment'), add({ trust: 1 })]),
    ),
    phoneClose(),
  ]);

  // Thursday: music class
  scene('x_w4_morning', [
    wcard('木曜日', '4月23日', 'Thursday · Music class'), music('calm'),
    bg('classroom'),
    n('Music class. The teacher wants someone to play the piano for the class song. The room goes silent.'),
    X('Teacher', 'Amane-san? Your mother said you play.'),
    show('haruka', 'surprised', 'left'), show('hikaru', 'worried', 'right'),
    H('surprised', 'She means Hikaru. I can’t play anything. I can play the triangle. Badly.'),
    n('Hikaru walks to the piano like she’s walking to the edge of a platform. She sits. She doesn’t start.'),
    choice('The whole class is watching her.',
      opt('Walk up and stand next to the piano.', [
        n('She glances at you. Her shoulders come down a centimetre. She starts to play.'),
        n('It’s beautiful. Really, properly beautiful. Halfway through, the class stops whispering and just listens.'),
        add({ trust: 2 }), flag('w4Piano'),
      ]),
      opt('Start clapping first, before she plays.', [
        n('A couple of people join in. Hikaru looks mortified. Then she plays, a little too fast, a little too loud, and gets every note right.'),
        add({ trust: 1 }),
      ]),
    ),
    n('Then Haruka starts singing. Badly. On purpose. So loudly that everyone laughs at her instead, and nobody is looking at Hikaru’s shaking hands any more.'),
    H('happy', 'What? I’m a great singer. Shut up.'),
    n('Hikaru plays the last chord and, for one second, looks at her sister like she’s the best thing in the world.'),
    hideAll(),
    diary('Hikaru played the piano for the whole class. Haruka sang badly on purpose so nobody would stare at her.'),
  ]);
  scene('x_w4_evening', [
    bg('bedroom_night', { clean: true }),
    phone('Rin', RIN_DM),
    msg('rin', 'i took photos in music class!! sorry!! i couldn’t help it'),
    msg('rin', 'the piano ones came out weird. the piano is there and the music sheet is there and the stool is there'),
    msg('rin', 'but nobody is sitting on it'),
    reply(
      opt('She was there. I watched her.', [msg('rin', 'i know. i watched her too. that’s what scares me'), flag('photoClue'), add({ susp: 1 })]),
      opt('Maybe your camera is broken.', [msg('rin', 'it’s not broken. it only does it with her')]),
    ),
    phoneClose(),
  ]);

  // Friday: cleaning day
  scene('x_w5_morning', [
    wcard('金曜日', '4月24日', 'Friday · Big cleaning day'), music('calm'),
    bg('classroom'),
    n('Big cleaning day. Desks pushed back, windows open, everyone in gym clothes with rags and buckets.'),
    n('You and the twins get the worst job: the old storage cupboard at the back of the classroom that nobody has opened in years.'),
    show('haruka', 'cold', 'left'),
    H('cold', 'It smells like a museum. A sad museum.'),
    n('Inside: broken umbrellas, a dusty globe, and a box of old class photos. 2-B, every year, back and back.'),
    n('In one from years ago, two little girls in the front row, holding hands. The name list underneath says: AMANE. Once.'),
    show('hikaru', 'neutral', 'right'),
    n('Under the photos there’s a thin notebook with a blue cover. On the front, in a child’s handwriting: THINGS I’M NOT ALLOWED TO SAY.'),
    K('surprised', '…That’s mine. I thought I lost it. I was eleven.'),
    choice(
      opt('Give it straight back to her without opening it.', [
        K('soft', 'You didn’t read it.'),
        me('It’s yours.'),
        K('soft', 'Nobody ever gives me things back.'),
        add({ trust: 2 }), flag('w5Notebook'),
      ]),
      opt('Read the first page.', [
        n('One line, in pencil, gone over and over until it almost went through the paper:'),
        n('“I’m not mean. I’m a fence. Fences look mean so nothing gets to her.”'),
        K('worried', 'Don’t— okay. You read it. That’s… okay.'),
        add({ trust: 1, susp: -1 }), flag('w5Fence'),
      ]),
      opt('Hand it to Haruka.', [
        H('surprised', 'Hikaru has a diary? Hikaru has secrets?'),
        n('Haruka holds it for a long time. Then, without opening it, she hands it to her sister.'),
        H('soft', 'Here. It’s yours. I don’t read your stuff.'),
        K('surprised', '…Since when?'),
        H('smirk', 'Since now. Shut up.'),
        add({ favor: 2, trust: 1, susp: -2 }), flag('w5Haruka'),
      ]),
    ),
    hideAll(),
    n('By the time you finish, it’s pouring with rain. You have one umbrella. They have none.'),
    show('haruka', 'happy', 'left'), show('hikaru', 'soft', 'right'),
    n('The three of you walk home under it, completely soaked anyway, Haruka complaining the whole way and holding on to both of you.'),
    hideAll(),
    diary('Cleaning day. Found Hikaru’s notebook from when she was eleven: THINGS I’M NOT ALLOWED TO SAY. Walked home in the rain under one umbrella.'),
  ]);
  scene('x_w5_evening', [
    bg('bedroom_night', { clean: true }),
    phone('2-B ✿', GROUP),
    msg('haruka', 'matsuri is TOMORROW. outfits are being decided. by me', { group: true }),
    msg('haruka', '{name} you’re styling us. it’s an honour. don’t ruin it', { group: true }),
    msg('hikaru', 'thank you for the umbrella', { group: true }),
    msg('haruka', 'it didn’t work. we got wet anyway', { group: true }),
    msg('hikaru', 'i know. thank you for the umbrella', { group: true }),
    phoneClose(),
  ]);

  // Extra trophy
  const XD0 = DL.Extras;
  if (XD0 && XD0.TROPHIES) XD0.TROPHIES.splice(XD0.TROPHIES.findIndex((t) => t.id === 'swapped'), 0,
    { id: 'week2', icon: '🏫', name: 'Two weeks in', desc: 'Finish the extra school week.', cond: (s) => !!s.extended && s.day >= 6 });

  /* ================= SUNDAY · THE DAY AFTER THE MATSURI ================= */
  scene('x_sunday', [
    startDay('sun1'),
    card('', { num: 'Sunday', jp: '日曜日　4月26日', en: 'The day after the matsuri' }),
    music('calm'),
    bg('bedroom', { clean: true }),
    n('No school. No alarm. Your yukata from last night is folded over the chair, still smelling of takoyaki and smoke.'),
    phone('Hikaru', HIKARU_DM),
    msg('hikaru', 'are you awake'),
    msg('hikaru', 'thank you for yesterday'),
    msg('hikaru', 'haruka says i was “barely there” in all the photos. she said it like a joke'),
    reply(
      opt('You were there. I saw you.', [msg('hikaru', 'ok'), msg('hikaru', 'ok. good. 🫧'), add({ trust: 1 })]),
      opt('Want to hang out today?', [msg('hikaru', 'yes'), msg('hikaru', 'i mean. if you want. yes'), add({ trust: 1 })]),
      opt('Haruka’s just being Haruka.', [msg('hikaru', 'yeah. she is.'), msg('hikaru', 'she always is')]),
    ),
    phoneClose(),
    townPick('lunch'),
    n('By the afternoon, the town is quiet. Everybody is sleeping off the matsuri.'),
    townPick('after'),
    bg('bedroom_night', { clean: true }),
    n('At 11:58pm, your phone rings. Hikaru. A real call, not a text.'),
    show('hikaru', 'worried', 'center', { ghost: true }),
    K('worried', 'Sorry. I know it’s late. I just… wanted to hear somebody say my name.'),
    choice('What do you say?',
      opt('“Hikaru.”', [
        K('soft', '…Thank you.'),
        K('worried', 'If tomorrow I’m… quieter than usual. Will you still look for me?'),
        me('I’ll look for you.'), add({ trust: 1 }), flag('sundayCall'),
      ]),
      opt('“Hikaru Amane. Class 2-B. Window seat. Piano. Blue.”', [
        K('happy', 'That’s the most anyone’s ever said about me at once.'),
        K('soft', 'Say it again tomorrow, okay? Even if it sounds stupid.'),
        add({ trust: 2 }), flag('sundayCall'),
      ]),
      opt('“Go to sleep, Hikaru.”', [K('neutral', '…Yeah. Okay. Goodnight, {name}.'), n('She hangs up before you can say goodnight back.')]),
    ),
    hide('hikaru'),
    diary('Hikaru called at midnight just to hear someone say her name.'),
    endDay('sun1'),
  ]);
  // Saturday is a week later in the extended week, and its quiet Sunday card makes way for the real Sunday
  { const sat = DL.Engine.scenes.saturday; const k = sat.findIndex((c) => c.t === 'card' && c.o && c.o.jp === '4月18日');
    if (k >= 0) sat[k] = iff(EXT, [card('', Object.assign({}, sat[k].o, { jp: '4月25日' }))], [sat[k]]); }
  { const fest = DL.Engine.scenes.sat_festival; const k = fest.findIndex((c) => c.t === 'card' && c.o && c.o.jp === '4月19日');
    if (k >= 0) fest[k] = iff(EXT, [], [fest[k]]); }
  { const list = DL.Engine.scenes.d6_morning;
    const k = list.findIndex((c) => c.t === 'if' && JSON.stringify(c.then || []).includes('swap_mon'));
    const at = k >= 0 ? k + 1 : list.findIndex((c) => c.t === 'call' && c.id === 'saturday') + 1;
    list.splice(at, 0, iff(EXT, [call('x_sunday')])); }

  /* ================= SUNDAY PLACES ================= */
  const S0 = (s) => s.xday === 'sun0', S1 = (s) => s.xday === 'sun1';
  const unvisited = (id) => (s) => !s.flags[`v_${id}_${s.xday}`];
  const place = (o) => DL.Data.LOCATIONS.push(Object.assign({ slot: 'town' }, o, { visible: (s) => !!s.xday && o.when(s) && unvisited(o.id)(s) }));

  place({ id: 'tw_station', name: 'Sakuragaoka Station', jp: '桜ヶ丘駅', bg: 'station', gain: { energy: 5 }, when: S0,
    hint: () => 'You need a commuter pass for school. The ticket machine looks ancient.' });
  place({ id: 'tw_mall', name: 'Hoshizora Mall', jp: '星空モール', bg: 'mall', gain: { money: -500 }, when: S0,
    hint: () => 'The uniform shop can swap your blazer for one that fits. ¥500.' });
  place({ id: 'tw_shrine', name: 'Inari shrine', jp: '稲荷神社', bg: 'shrine', gain: { energy: 10 }, when: S0,
    hint: () => 'A tiny fox shrine behind the park. Your first fortune in a new town.' });
  place({ id: 'tw_park', name: 'Sakura Park', jp: '桜公園', bg: 'park', gain: { energy: 10 }, when: (s) => S0(s) || S1(s),
    hint: (s) => (S0(s) ? 'Old swings, a pond, and a lot of very confident pigeons.' : 'Someone is on the swings. Alone. Swinging very high.') });
  place({ id: 'tw_konbini', name: 'Konbini', jp: 'コンビニ', bg: 'konbini', gain: { money: -200, energy: 15 }, when: (s) => S0(s) || S1(s),
    hint: (s) => (S0(s) ? 'Snacks for unpacking. The clerk looks like he’s seen everything.' : 'Ice cream for the hangover of a festival.') });
  place({ id: 'tw_amane', name: 'The Amane house', jp: '天音家', bg: 'sisters_room', gain: { energy: -5 }, when: S1,
    hint: () => 'Across the street. Haruka said “come over, I guess”. Hikaru said nothing, which means yes.' });
  place({ id: 'tw_sea', name: 'Train to the sea', jp: '海浜行き', bg: 'station', gain: { money: -400, energy: -10 }, when: S1,
    block: (s) => (s.money < 400 ? 'The return ticket to Umihama is ¥400.' : ''),
    hint: () => 'The line ends at the sea. Hikaru says she hasn’t been since she was eleven.' });
  place({ id: 'tw_market', name: 'Riverside market', jp: '川辺の朝市', bg: 'street', gain: { money: -300, energy: 10 }, when: S1,
    hint: () => 'Sunday morning market by the river. Haruka was spotted there with a shopping basket. Haruka. With a basket.' });
  place({ id: 'tw_photo', name: 'Kodama Photo', jp: 'こだま写真館', bg: 'mall', gain: { grades: 2 }, when: S1,
    hint: () => 'The old photo shop in the mall. Rin is collecting her matsuri prints.' });

  DL.Events.tw_station = [
    { id: 'tw_station_0', scene: [
      bg('station', { clean: true }),
      n('The ticket machine eats your coin, thinks about it, and spits out a receipt that just says ERROR in very small letters.'),
      n('Someone reaches past you and presses three buttons without looking. A girl in a pale blue cardigan, headphones round her neck.'),
      n('The machine gives you a commuter pass and your coin back, like it’s embarrassed.'),
      choice(
        opt('“Thank you! I’m new. I’m {name}.”', [
          n('She looks at you like nobody has introduced themselves to her in a very long time.'),
          n('She opens her mouth to say her name. Then she shuts it again, and just nods.'),
          add({ trust: 1 }),
        ]),
        opt('“How did you do that?”', [n('She shrugs. “You have to be nice to it. Nobody ever is.” Her voice is so quiet the train almost drowns it out.')]),
      ),
      n('As she walks away, she says one more thing over her shoulder.'),
      n('“Welcome to Sakuragaoka. Don’t stand at the end of the platform after dark.”'),
      flag('metBlueGirl'),
      diary('A girl in blue fixed the ticket machine for me. She didn’t tell me her name.'),
    ] },
  ];
  DL.Events.tw_mall = [
    { id: 'tw_mall_0', scene: [
      bg('mall', { clean: true }),
      n('The uniform shop has a queue. You join it. A girl in pink and leopard print walks straight past everyone and slaps a blazer on the counter.'),
      n('“Two of these. Same size. One in our colour, one in hers.” The clerk says they only come in navy. She says she’ll sew on the colour herself, thank you.'),
      choice(
        opt('“Excuse me, there’s a queue.”', [
          n('She looks you up and down. “Nice bag. Is it fake?”'),
          n('Then she leaves, without waiting for an answer, carrying two blazers.'),
          add({ favor: 1 }),
        ]),
        opt('Let it go.', [n('She sweeps past you on the way out and leaves a cloud of strawberry perfume behind her.')]),
      ),
      n('Your new blazer fits. The clerk sighs. “Those Amane girls. Every year, two of everything.”'),
      flag('metPinkGirl'), flag('blazerFits'),
      diary('Got a blazer that fits. A girl in pink cut the whole queue. The clerk called her “those Amane girls”.'),
    ] },
  ];
  DL.Events.tw_shrine = [
    { id: 'tw_shrine_0', scene: [
      bg('shrine', { clean: true }),
      n('The fox statues watch you put ¥100 in the box. You shake the fortune tube until a stick falls out.'),
      n('小吉. Small blessing. The paper says:'),
      n('“A person you meet in this town will ask you to remember her. Do.”'),
      choice(
        opt('Keep the fortune in your wallet.', [flag('fortune0'), add({ trust: 1 })]),
        opt('Tie it to the branch with the others.', [n('Every other fortune on the branch has the same sentence on it. Exactly the same.'), sfx('static'), flag('fortune0')]),
      ),
      diary('My first fortune here: “A person you meet will ask you to remember her. Do.”'),
    ] },
  ];
  DL.Events.tw_park = [
    { id: 'tw_park_0', cond: S0, scene: [
      bg('park', { clean: true }),
      n('Sakura Park has two old swings, a pond full of fat koi, and a lot of pigeons who think they own it.'),
      n('Someone carved names into the wooden seat of one swing, a long time ago, in careful little-kid letters.'),
      n('HIKARU ♡ HARUKA. FOREVER MATCHING.'),
      n('The first name has been scratched over so many times you can barely read it. The scratches look new.'),
      flag('sawSwingCarve'),
      diary('Somebody carved HIKARU ♡ HARUKA into a swing in the park. Somebody keeps scratching out the first name.'),
    ] },
    { id: 'tw_park_1', cond: S1, scene: [
      bg('park', { clean: true }), dusk,
      show('hikaru', 'neutral', 'center'),
      n('Hikaru is on the swings. Alone. Swinging as high as the chains will go, eyes closed.'),
      n('When she sees you she drags her feet in the dirt to stop, embarrassed.'),
      K('worried', 'Don’t tell Haruka. She says swings are for children.'),
      K('neutral', 'When you’re right at the top, for one second, you’re not anywhere. Nobody can see you. I like that.'),
      K('sad', '…No. That’s a lie. I hate that. I just got used to it.'),
      choice(
        opt('Sit on the other swing and race her.', [
          n('You both swing as high as you can. She laughs out loud, once, and looks shocked at herself.'),
          add({ trust: 2 }), flag('swingRace'),
        ]),
        opt('Show her the carved names.', [
          iff(f('sawSwingCarve'), [
            K('surprised', 'You found that? We carved it when we were six.'),
            K('sad', 'I didn’t scratch my name out. I want you to know that. I don’t know who did.'),
            add({ trust: 1 }), flag('swingTruth'),
          ], [n('You look for names on the swing, but there aren’t any. Just fresh scratches.')]),
        ]),
      ),
      hide('hikaru'), clear,
      diary('Hikaru on the swings. She says at the top, for one second, nobody can see you.'),
    ] },
  ];
  DL.Events.tw_konbini = [
    { id: 'tw_konbini_0', cond: S0, scene: [
      bg('konbini', { clean: true }),
      n('The konbini clerk rings up your snacks and slides a free onigiri across the counter.'),
      X('Clerk', 'Welcome present. You’re the new family on Sakura Street, right? Across from the Amane house.'),
      X('Clerk', 'Nice girls. Well. One of them’s nice. I can never remember which.'),
      iff(MIK, [
        n('Behind you, two students in navy blazers are buying twelve bags of salt. They smile at you at exactly the same time.'),
        n('The boy’s smile doesn’t quite work.'),
      ]),
      diary('Free onigiri at the konbini. The clerk can never remember which Amane twin is the nice one.'),
    ] },
    { id: 'tw_konbini_1', cond: S1, scene: [
      bg('konbini', { clean: true }),
      n('Ice cream in the freezer, festival flyers stuck to the door. The clerk is half asleep.'),
      X('Clerk', 'You were at the matsuri with the Amane girls, right? Saw your photo on the board.'),
      X('Clerk', 'Just you and the pink one. Cute.'),
      n('There were three of you in that photo.'),
      iff(MIK, [
        n('At the meat counter, Rei Mikage is asking the butcher about bone saws. Very politely.'),
        n('Sei is holding the basket with both hands, staring at the floor.'),
      ]),
      add({ susp: 1 }),
      diary('The konbini clerk said the matsuri photo was just me and Haruka. There were three of us.'),
    ] },
  ];
  DL.Events.tw_amane = [
    { id: 'tw_amane_1', scene: [
      bg('sisters_room', { clean: true }),
      show('haruka', 'smirk', 'left'),
      H('smirk', 'Shoes off. Don’t touch anything pink. Don’t touch anything blue either, she gets weird.'),
      n('The Amane house is very tidy and very quiet. Their parents aren’t home. Their parents, Haruka says, are “never really home”.'),
      n('On the fridge, a row of notes in a mother’s handwriting. Haruka, dinner’s in the fridge. Haruka, good luck on the test. Haruka, love you.'),
      n('None of them say Hikaru.'),
      show('hikaru', 'neutral', 'right'),
      K('neutral', 'She just forgets. It’s fine. Everyone does.'),
      n('In the hallway, a row of family photos. In every one, the girl in blue is a little blurrier than the year before.'),
      choice('The fridge hums.',
        opt('Write a note for the fridge: “Hikaru, love you.”', [
          n('You stick it next to the others. Hikaru stares at it for a long time.'),
          K('soft', '…It’ll be gone by tomorrow. Things with my name on them usually are.'),
          K('soft', 'But it’s there today.'),
          add({ trust: 2 }), flag('fridgeNote'),
        ]),
        opt('Ask Haruka why the notes are only for her.', [
          H('worried', 'They’re not. They’re— she’s—'),
          n('Haruka looks at the fridge like she’s never actually read it before.'),
          H('sad', '…Huh.'),
          add({ favor: 1 }), flag('fridgeHaruka'),
        ]),
        opt('Look at the twins’ room.', [
          n('The room is split exactly down the middle with washi tape. Pink on one side. Blue on the other.'),
          n('The blue side is so tidy it looks like a hotel room. Nobody has slept in that bed for a while.'),
          K('neutral', 'I sleep on the floor on her side, mostly. It’s warmer.'),
          flag('sawTapeLine'),
        ]),
      ),
      hideAll(),
      diary('Went to the Amane house. All the notes on the fridge say Haruka.'),
    ] },
  ];
  DL.Events.tw_sea = [
    { id: 'tw_sea_1', scene: [
      bg('station', { clean: true }), dusk,
      show('hikaru', 'soft', 'center'),
      n('The train to Umihama is two carriages long and completely empty except for you, Hikaru, and the smell of salt.'),
      K('soft', 'We used to come here every summer. Before. Haruka got sunburnt and I got blamed for it.'),
      n('At the end of the line, the station is a single platform, and past it, the sea. Grey-blue and huge, folding over and over on itself.'),
      n('Hikaru takes her shoes off and walks into the water up to her ankles. She doesn’t flinch at the cold.'),
      K('neutral', 'At the end of the platform at home, I can’t see where I stop. Here I can. The water shows you where your edges are.'),
      K('worried', '{name}. If I start to disappear. Properly. Will you bring me back here?'),
      choice(
        opt('“I promise.”', [K('soft', 'Okay.'), n('She holds out her little finger. You link it with yours. Her hand is cold, and very real.'), add({ trust: 2 }), flag('seaPromise')]),
        opt('“You’re not going to disappear.”', [K('sad', 'Everyone says that. Right before.'), add({ trust: 1 })]),
      ),
      n('On the train home she falls asleep against your shoulder. In the dark window, you can only see your own reflection.'),
      hide('hikaru'), clear,
      diary('Took the train to the sea with Hikaru. She says the water shows you where your edges are.'),
    ] },
  ];
  DL.Events.tw_market = [
    { id: 'tw_market_1', scene: [
      bg('street', { clean: true }),
      show('haruka', 'surprised', 'center'),
      n('The riverside market smells like grilled fish and strawberries. And there, haggling over a bag of shiitake, is Haruka Amane.'),
      H('surprised', 'Oh my god. Don’t look at me. Pretend you didn’t see me.'),
      H('shy', 'I’m making dinner, okay? Hikaru likes this soup. Our mom used to make it. She doesn’t anymore. So.'),
      H('cold', 'If you tell anyone at school I’ll tell everyone you cried at the goldfish scooping.'),
      choice(
        opt('Help her carry the bags home.', [H('soft', '…Fine. You can carry the heavy one. Because you’re useless otherwise.'), n('She talks the whole way home about how Hikaru eats too slowly and leaves the mushrooms till last. She’s smiling.'), add({ favor: 2 }), flag('marketHelp')]),
        opt('“You’re a good sister, you know.”', [H('worried', 'Shut up. I’m not. I’m— shut up.'), n('Her ears go bright red. She buys an extra bag of strawberries, for no reason she’s prepared to explain.'), add({ favor: 1, trust: 1 })]),
      ),
      hide('haruka'),
      diary('Haruka buys the mushrooms for Hikaru’s favourite soup herself. Don’t tell anyone.'),
    ] },
  ];
  DL.Events.tw_photo = [
    { id: 'tw_photo_1', scene: [
      bg('mall', { clean: true }),
      show('rin', 'happy', 'center'),
      R('happy', '{name}! Come look, the matsuri prints just came back!'),
      n('Rin spreads the photos across the counter. Lanterns. Goldfish. Haruka pulling a face. You, mid-bite of takoyaki.'),
      R('worried', 'Except… look. This one.'),
      n('In the photo, you and Haruka are laughing. Between you there’s a gap, exactly one person wide. In the gap, a blue blur, like someone moved too fast.'),
      R('neutral', 'The shop guy said it’s a light leak. But it’s the same shape every time. Hikaru-shaped.'),
      choice(
        opt('“Can I have that one?”', [R('soft', 'Of course. Keep it somewhere safe. Somewhere you’ll look every day.'), flag('blurPrint'), add({ trust: 1 })]),
        opt('“Can you print it again? Brighter?”', [R('surprised', 'I can try in the darkroom. If she’s in there, I’ll find her.'), add({ grades: 2 }), flag('rinFriend'), flag('rinPrintAgain')]),
      ),
      hide('rin'),
      diary('Rin’s matsuri photos came back. There’s a Hikaru-shaped gap in every one.'),
    ] },
  ];

  // Every Sunday place also needs a quiet scene in case its special one has already played
  ['tw_station', 'tw_mall', 'tw_shrine', 'tw_park', 'tw_konbini', 'tw_amane', 'tw_sea', 'tw_market', 'tw_photo'].forEach((id) => {
    const L = DL.Data.LOCATIONS.find((l) => l.id === id);
    DL.Events[id].push({ id: id + '_any', repeat: true, scene: [bg(L.bg, { clean: true }), n('It’s a slow Sunday. You wander around for a while, and nothing in particular happens. That feels nice.')] });
  });

  /* ================= NEW ENDING: THE SEA IN MAY ================= */
  scene('end_sea', [
    me('Hikaru. The sea. Like I promised.'),
    show('haruka', 'surprised', 'left'),
    H('surprised', 'What sea? {name}, who are you talking to?'),
    n('You take Haruka’s hand. With your other hand, you take hold of something nobody else in the room can quite see. It’s cold. It holds on.'),
    hideAll(),
    bg('station', { clean: true, force: true }), dusk, music('sweet'),
    n('The two-carriage train. Haruka, furious and confused, next to you. The seat on your other side, empty, but warm.'),
    n('At the end of the line, the sea.'),
    n('You walk into the water up to your ankles, holding a hand you can’t see. The water folds around three pairs of feet.'),
    show('hikaru', 'soft', 'right', { ghost: true }),
    n('And there she is. Faint, then less faint, then not faint at all. The water is showing her where her edges are.'),
    show('haruka', 'cry', 'left'),
    H('cry', '…Hikaru? Hikaru. How did I— how did I forget you? You’re my— you’re—'),
    K('soft', 'Your sister. Four minutes older. Hi.'),
    K('happy', 'You came. {name}, you actually came.'),
    me('I promised.'),
    hideAll(),
    ending('sea'),
  ]);
  { const choiceCmd = DL.Engine.scenes.d9_choice[0];
    const k = choiceCmd.opts.findIndex((o) => o.body && o.body[0] && o.body[0].id === 'end_good');
    choiceCmd.opts.splice(k < 0 ? 1 : k + 1, 0, opt('“Hikaru. The sea. Like I promised.”', [go('end_sea')], {
      if: (s) => !!s.flags.seaPromise,
      lock: (s) => (s.trust < 7 ? `Hikaru has to trust you enough to hold on. (Trust ${s.trust} of 7)`
        : s.frags.length < 6 ? `Remember more of what she really said, so there’s enough of her to find. (${s.frags.length} of 6 lines)` : null),
    })); }

  DL.Data.ENDINGS.sea = {
    hint: 'Play the extended week, and make Hikaru a promise by the water.',
    title: 'The Sea in May', jp: '五月の海',
    text: 'At the end of the line there’s a beach nobody in Sakuragaoka ever goes to. Three people sat on the sea wall until the last train, and when it came, all three of them got on. Hikaru still comes out a little blurry in photos. So every Sunday, the three of you take the train to the sea, and the water shows her where her edges are.',
  };

  /* ================= PHONE: trophies, clues ================= */
  const XD = DL.Extras; const F = (k) => (s) => !!s.flags[k];
  if (XD) {
    if (XD.TROPHIES) XD.TROPHIES.splice(XD.TROPHIES.findIndex((t) => t.id === 'swapped'), 0,
      { id: 'twoSundays', icon: '🗓', name: 'Two Sundays', desc: 'Play both extra Sundays of the extended week.', cond: (s) => !!(s.flags.sun0Done && s.flags.sun1Done) },
      { id: 'tourist', icon: '🧭', name: 'Local', desc: 'Visit four different Sunday places.', cond: (s) => Object.keys(s.flags).filter((k) => /^v_tw_/.test(k)).length >= 4 },
      { id: 'pinky', icon: '🌊', name: 'Pinky promise', desc: 'Promise Hikaru the sea.', cond: F('seaPromise') });
    if (XD.CLUES) XD.CLUES.push(
      { id: 'c_swing', title: 'FOREVER MATCHING', text: 'HIKARU ♡ HARUKA, carved into a swing at age six. Someone keeps scratching out the first name. Not Hikaru.', cond: F('sawSwingCarve') },
      { id: 'c_fridge', title: 'The fridge', text: 'Every note on the Amane fridge says Haruka. None of them say Hikaru.', cond: (s) => !!s.seen.tw_amane_1 },
      { id: 'c_sea', title: 'Umihama', text: '“The water shows you where your edges are.” If she starts to disappear, bring her back to the sea.', cond: F('seaPromise') },
      { id: 'c_gap', title: 'A light leak', text: 'In every matsuri photo there’s a gap one person wide, with a blue blur in it.', cond: (s) => !!s.seen.tw_photo_1 });
  }
})();
