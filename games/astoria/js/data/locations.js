// The five locations of Elaria and their interactive hotspots.
// A hotspot shows the first `variant` whose conditions match. Variants marked
// `once` disappear after they've been seen. `choices` give the player options
// (several quests have more than one solution). `party` adds a companion's
// remark when they are travelling with Astoria.

export const LOCATIONS = {
  cathedral: {
    name: 'Cathedral of Eclipses', short: 'Cathedral',
    tagline: 'Where you woke',
    scene: 'cathedral', music: 'cathedral',
    map: { x: 50, y: 30 },
    ambient: [
      'Morning light comes through the eclipse window violet, never gold. Dust turns slowly in it.',
      'The cathedral is quiet in the afternoon. Somewhere water drips into a basin, keeping its own time.',
      'Candles you did not light are burning in the nave. The violets between the flagstones glow brighter.',
      'Night. The moon fills the eclipse window completely. Far below the floor, something hums.',
    ],
    hotspots: [
      {
        id: 'altar', label: 'Ancient altar', x: 50, y: 69,
        variants: [
          { cond: { quest: { mq1: 'active' }, obj: { 'mq1.altar': false } }, title: 'The Ancient Altar', text: 'Beneath a drift of violet petals, an envelope lies on the altar — as if placed there for you.\n\nThe wax seal is a crescent moon pierced by a thorn. It is addressed in faded ink: "To A."\n\nInside, one line: "The moon remembers. Come home."', fx: { item: { sealed_invitation: 1 }, obj: 'mq1.altar', memory: 'mem_invitation:found', mystery: ['myst_invitation', 'myst_arrival'], exp: 30 } },
          { cond: { quest: { sq_violets: 'active' }, obj: { 'sq_violets.gather': true, 'sq_violets.offer': false } }, title: 'Violets for the Altar', text: 'You lay the three moonveil blooms on the cracked stone. Their glow seeps into the cracks like water finding its old riverbed.', fx: { take: { moonveil_bloom: 3 }, obj: 'sq_violets.offer' } },
          { cond: { item: 'moon_shard' }, title: 'The Ancient Altar', text: 'The moon shard in your pocket hums as you approach. The altar answers with a hum of its own, a note lower than hearing.' },
          { cond: { phase: [3] }, title: 'The Ancient Altar', text: 'At night the altar stone is warm — as though someone has only just stood up from it.' },
          { cond: {}, title: 'The Ancient Altar', text: 'The altar is cracked down the middle. Someone has carved a tiny crescent into its edge, over and over, hundreds of times. The oldest are worn almost smooth.' },
        ],
        party: { seraphine: 'Seraphine touches the carved crescents. "I did not carve these," she says, before you can ask.', cael: 'Cael runs a thumb along the crescents. "Someone was counting," he says.' },
      },
      {
        id: 'window', label: 'The eclipse window', x: 50, y: 24,
        variants: [
          { once: true, cond: {}, title: 'The Eclipse Window', text: 'The great window shows a woman in black standing beneath a moon that is slowly swallowing the sun. Her face is the only pane that has been replaced — with plain violet glass.\n\nA shard of the old glass lies beneath it. You pick it up before you can think better of it.', fx: { item: { eclipse_glass: 1 } } },
          { cond: { flag: 'mq6_done' }, title: 'The Eclipse Window', text: 'You know now why her face was replaced. You can\'t stop looking at the plain violet pane where your face should be.' },
          { cond: {}, title: 'The Eclipse Window', text: 'The woman in the window holds out a hand toward the moon — or away from it. The longer you look, the less certain you are which.' },
        ],
      },
      {
        id: 'candles', label: 'Votive candles', x: 72, y: 66,
        variants: [
          { cond: { dailyOpen: 'candles' }, title: 'Votive Candles', text: 'You light the candles one by one. With each flame, the violets nearby glow a little brighter, as though they were waiting.', fx: { daily: 'candles' } },
          { cond: {}, title: 'Votive Candles', text: 'The candles you lit are still burning. None of them have burned down at all.' },
        ],
      },
      {
        id: 'belltower', label: 'Bell tower stair', x: 25, y: 50,
        variants: [
          { cond: { quest: { mq9: 'active' } }, title: 'The Eclipse', text: 'The bell tower.', convo: 'ch9_tower' },
          { cond: { flag: 'game_complete' }, title: 'The Bell Tower', text: 'The bells hang quiet now. From the top of the tower you can see everything your choice became.' },
          { cond: { quest: { mq1: 'active' }, obj: { 'mq1.belltower': false } }, title: 'The Bell Tower', text: 'Two hundred and twelve steps. At the top, the great bell hangs silent, and beyond it — Elaria.\n\nSpires and rooftops silvered by a moon far too bright. The palace glittering in the Royal District. The dark bulk of the Forgotten Library. Beyond the walls, the Whispering Woods, lit from within by glowing flowers.\n\nThe kingdom does not look like a place you are visiting. It looks like a place you are returning to.', fx: { obj: 'mq1.belltower', discover: ['royal', 'library'], exp: 30 } },
          { cond: { quest: { nq_seraphine: 'active' }, obj: { 'nq_seraphine.listen': false }, phase: [3] }, title: 'The Thirteenth Toll', text: 'You wait beside the bell as midnight comes. Twelve strokes, rolling out over the city.\n\nThen the thirteenth. The rope doesn\'t move. The clapper doesn\'t move. The bell rings anyway — and the moon, for one heartbeat, seems to dim.', fx: { obj: 'nq_seraphine.listen' } },
          { cond: { quest: { nq_seraphine: 'active' }, obj: { 'nq_seraphine.listen': false } }, title: 'The Bell Tower', text: 'The bell hangs silent. Seraphine said it rings thirteen at midnight. You will have to come back at Night.' },
          { cond: {}, title: 'The Bell Tower', text: 'From the top of the tower Elaria lies spread out in silver. The moon is so close you could almost read it.' },
        ],
        party: { noctis: 'Noctis is already at the top when you arrive, though he walked up behind you.' },
      },
      {
        id: 'prayer', label: 'Abandoned prayer rooms', x: 10, y: 61,
        variants: [
          { once: true, cond: {}, title: 'Abandoned Prayer Rooms', text: 'Rows of kneelers furred with dust. A hymnal lies open, pages swollen with damp, and between them a page that does not belong — torn from a printed history book.', fx: { item: { book_hymnal: 1, torn_page: 1 }, start: 'sq_pages', obj: 'sq_pages.p1' } },
          { once: true, cond: { any: [{ path: { secretive: 2 } }, { path: { suspicious: 2 } }, { party: 'seraphine' }] }, title: 'A Draught Behind the Panel', text: 'A cold draught breathes from behind one of the wall panels. It gives under your hand, revealing a narrow passage and a tiny secret archive: one desk, one ledger, one candle stub.\n\nThe ledger is the cathedral\'s register of keepers. You tear out a page before you can decide whether you should.', fx: { item: { keeper_register: 1 }, mystery: 'myst_seraphine', path: 'secretive' } },
          { cond: {}, title: 'Abandoned Prayer Rooms', text: 'The kneelers are worn into the shape of people who knelt here for years. One is worn into a shape that is exactly your size.' },
        ],
      },
      {
        id: 'draught', label: 'A cold draught', x: 15, y: 79,
        variants: [
          { cond: { chapterMin: 3, notFlag: 'cove_found' }, title: 'A Cold Draught', text: 'A cold flagstone.', convo: 'cove_descent' },
          { cond: { flag: 'cove_found' }, title: 'The Salt Stair', text: 'Behind the prayer alcove, the lifted flagstone. Salt air breathes up out of the dark, and far below, the sea.', goto: 'cove', gotoLabel: 'Go down to the cove' },
          { cond: {}, title: 'Flagstones', text: 'Old flagstones, worn smooth by three hundred years of knees. One of them is very slightly colder than the rest.' },
        ],
      },
      {
        id: 'chamber', label: 'Sealed underground door', x: 88, y: 63,
        variants: [
          { cond: { quest: { mq7: 'active' }, obj: { 'mq7.descend': false } }, title: 'Beneath the Cathedral', text: 'The iron door stands open.', convo: 'ch7_descent' },
          { cond: { quest: { mq7: 'active' }, obj: { 'mq7.descend': true, 'mq7.seraphine': false } }, title: 'The Reliquary', text: 'The reliquary waits at the bottom of the stair. Before you open it, you want to hear what Seraphine has to say for herself.' },
          { cond: { quest: { mq7: 'active' }, obj: { 'mq7.seraphine': true, 'mq7.reliquary': false } }, title: 'The Reliquary', text: 'The reliquary.', convo: 'ch7_reliquary' },
          { cond: { flag: 'mq7_done' }, title: 'Beneath the Cathedral', text: 'The round chamber is quiet. The reliquary stands open, or closed, exactly as you left it. The air still tastes of violets.' },
          { cond: { flag: 'lucien_night_known', phase: [3] }, title: 'Beneath the Cathedral', text: 'Lamplight leaks around the iron door. Below, slow footsteps — and Lucien\'s voice, reading names aloud, one after another, as if afraid of losing his place.\n\nYou don\'t go down. Not yet.\n\n(The chamber beneath the cathedral opens in Chapter 7 — in development.)' },
          { cond: { path: { suspicious: 3 } }, title: 'The Sealed Door', text: 'Seven locks. Six rusted shut. The seventh is new, and oiled — and there are fresh boot-scuffs on the step. Someone uses this door. Often.', fx: { mystery: 'myst_lucien_night' } },
          { cond: {}, title: 'The Sealed Door', text: 'An iron door sealed with seven locks. Six are rusted. The seventh is new.' },
        ],
      },
    ],
  },

  royal: {
    name: 'Royal District', short: 'Royal District',
    tagline: 'Wealth, power and politics',
    scene: 'royal', music: 'royal',
    map: { x: 74, y: 52 },
    ambient: [
      'Carriages rattle over cobbles. Shopkeepers polish windows that are already spotless. Everyone is pretending not to watch the palace.',
      'The gardens are full of nobles walking slowly enough to be seen. The fountain sings to itself.',
      'Lamps bloom along the avenues. Music drifts from somewhere — a gathering, always a gathering.',
      'The district sleeps behind shutters. Only the palace windows stay lit, and the guards at the gate.',
    ],
    hotspots: [
      {
        id: 'palace', label: 'Palace entrance', x: 60, y: 34,
        variants: [
          { cond: { quest: { mq8: 'active' }, obj: { 'mq8.bargain': false } }, title: 'The Duchess\'s Summons', text: 'A footman in Marchetti silver is waiting for you.', convo: 'ch8_bargain' },
          { cond: { phase: [0] }, title: 'The Palace Entrance', text: 'Petitioners queue beneath the great arch. A clerk checks every face against a ledger of names before letting them pass. Some faces, he checks twice.' },
          { cond: {}, title: 'The Palace Entrance', text: 'The palace rises in pale stone and dark glass. Above the arch, the royal crest — a full moon. Beneath it, faint where it was chiselled away, the ghost of a thorn.' },
        ],
      },
      {
        id: 'fountain', label: 'Fountain square', x: 63, y: 49,
        variants: [
          { cond: { quest: { nq_noctis: 'active' }, phase: [3] }, title: 'Where the Water Forgets', text: 'At midnight the fountain goes still. Noctis is sitting on the rim, feet in the water that isn\'t moving.', convo: 'noctis_fountain' },
          { cond: { phase: [3], notFlag: 'found_liesel' }, title: 'The Fountain at Night', text: 'Something glints at the bottom of the basin. You reach in — the water is far colder than it should be — and draw out an old silver coin.\n\nIt is engraved: "For Liesel, who will be remembered."', fx: { flag: 'found_liesel', item: { forgotten_coin: 1 }, start: 'hq_liesel', obj: 'hq_liesel.coin', memory: 'mem_liesel:coin' } },
          { cond: {}, title: 'Fountain Square', text: 'People toss coins and make wishes. Nobody can remember what they wished for by the time they walk away. They don\'t seem to mind.' },
        ],
        party: { cael: 'Cael watches the coins sink. "My grandmother set a place at dinner for someone called Liesel," he says. "Every night. We never knew who she was."' },
      },
      {
        id: 'cafe', label: 'Rosewater Café', x: 12, y: 44,
        variants: [
          { once: true, cond: { quest: { sq_pages: 'active' } }, title: 'Rosewater Café', text: 'Under a sugar bowl, used as a coaster: a page torn from the official Moonfall history. The waiter swears it was blank this morning.', fx: { item: { torn_page: 1 }, obj: 'sq_pages.p2' } },
          { cond: { dailyOpen: 'tea' }, title: 'Tea at the Rosewater Café', text: 'You take a corner table and order the house violet tea. Around you, the nobility of Elaria gossips at a volume designed to be overheard.', fx: { daily: 'tea' }, gossip: true },
          { cond: {}, title: 'Rosewater Café', text: 'The café is all rose-coloured glass and murmuring. You have already had tea today; the waiter remembers you. He looks faintly surprised to.' },
        ],
      },
      {
        id: 'shop', label: 'Maison Corvelle', x: 9, y: 20,
        variants: [ { cond: {}, title: 'Maison Corvelle', text: 'A shop of lace, scent and small beautiful things.', openShop: true } ],
      },
      {
        id: 'gardens', label: 'Royal gardens', x: 88, y: 40,
        variants: [
          { cond: {}, title: 'The Royal Gardens', text: 'Behind the palace, a gate in the yew hedge stands half open. Past it, the light changes: whatever the hour out here, in the garden it is always moonlight.', fx: { discover: 'garden' }, goto: 'garden', gotoLabel: 'Walk into the garden' },
        ],
      },
      {
        id: 'balcony', label: 'Beneath the palace balcony', x: 71, y: 22,
        cond: { any: [{ quest: { nq_lucien: 'active' } }, { phase: [2] }] },
        variants: [
          { cond: { quest: { nq_lucien: 'active' }, obj: { 'nq_lucien.find': false }, phase: [2] }, title: 'Beneath the Balcony', text: 'The guard changes. In the shadow of the balcony, inside a stone planter of dead roses, your fingers find a bundle of letters tied with black ribbon.\n\nEvery one is sealed. Every one is addressed, in Lucien\'s sharp hand, to "A."', fx: { item: { unsent_letters: 1 }, obj: 'nq_lucien.find' } },
          { cond: { quest: { nq_lucien: 'active' }, obj: { 'nq_lucien.find': false } }, title: 'Beneath the Balcony', text: 'Too many guards. Lucien said to come in the Evening, when the watch changes.' },
          { cond: {}, title: 'Beneath the Balcony', text: 'High above, a figure stands on the palace balcony, looking at the moon as if waiting for it to say something.' },
        ],
      },
      {
        id: 'guardhq', label: 'Royal guard headquarters', x: 74, y: 62,
        variants: [
          { cond: { quest: { nq_cael: 'active' }, obj: { 'nq_cael.roster': false } }, title: 'The Night Roster', text: 'Cael\'s roster hangs by the door. Nine positions on the night watch. Eight names in neat ink.\n\nLine IX is blank — but the paper is dented, as though something was written there with great pressure, and then simply… stopped existing.', fx: { obj: 'nq_cael.roster', memory: 'mem_guard:roster' } },
          { cond: {}, title: 'Guard Headquarters', text: 'A notice board of missing-persons posters. On each, the drawing is clear but the name has faded to nothing. The guards walk past without looking.' },
        ],
      },
    ],
  },

  library: {
    name: 'Forgotten Library', short: 'Library',
    tagline: 'Records from before the Moonfall',
    scene: 'library', music: 'library',
    map: { x: 24, y: 48 },
    ambient: [
      'Pale morning light falls through high windows onto shelves that climb out of sight. A clock ticks somewhere, slightly out of time.',
      'Pages turn in rooms where no one is reading. The librarians walk softly, as if not to wake the books.',
      'Lamps are lit floor by floor. The higher galleries stay dark; nobody goes up there after the evening bell.',
      'At night the library is locked. You are inside anyway. The books do not seem to mind.',
    ],
    hotspots: [
      {
        id: 'reading', label: 'Reading room', x: 19, y: 64,
        variants: [
          { once: true, cond: {}, title: 'The Reading Room', text: 'On the central lectern, as if set out for you, lies the crown\'s official history: "The Celestial Event of the Moonfall." The author is given only as "L."', fx: { item: { book_moonfall_official: 1 }, obj: 'mq3.enter' } },
          { cond: {}, title: 'The Reading Room', text: 'Long tables, green lamps, and the soft complaint of old chairs. Someone has left a cup of tea here. It is still warm. There is no one in the room.', fx: { obj: 'mq3.enter' } },
        ],
      },
      {
        id: 'restricted', label: 'Restricted archive', x: 30, y: 46,
        variants: [
          { cond: { quest: { mq3: 'active' }, obj: { 'mq3.access': true, 'mq3.search': false } }, title: 'The Restricted Archive', text: 'Cabinets of family records, each drawer labelled with a house name. One drawer has no label at all.\n\nInside: a single photograph. The royal family, dated the year of the Moonfall. At the very edge stands a girl in a black dress like yours.\n\nHer face has been scratched away.', fx: { item: { old_photograph: 1 }, obj: 'mq3.search', memory: 'mem_photograph:photo', exp: 40 } },
          {
            cond: { quest: { mq3: 'active' }, obj: { 'mq3.access': false } }, title: 'The Restricted Archive', text: 'An iron-banded door. A brass plate: BY ROYAL WARRANT ONLY. The archivist at the desk beside it watches you without blinking.',
            choices: [
              { t: 'Present the Royal Guard archive pass', cond: { item: 'archive_pass' }, text: 'The archivist examines the token, sniffs, and unlocks the door. "Guard business," he says, as though it were a disease.', fx: { obj: 'mq3.access', take: { archive_pass: 1 } } },
              { t: 'Use the Advisor\'s key', cond: { item: 'library_key' }, text: 'The archivist sees the key and goes very pale. He looks away while you open the door, as though he has been instructed to.', fx: { obj: 'mq3.access', mem: { lucien: 'used_key' } } },
              { t: '[Companion] Let Cael speak to the archivist', cond: { party: 'cael' }, text: 'Cael steps forward and says something low. The archivist unlocks the door. "You owe me," Cael murmurs as you pass. He almost smiles.', fx: { obj: 'mq3.access', rel: { cael: { affinity: 3, trust: 3 } } } },
              { t: 'Demand to be let in', path: 'aggressive', text: 'You tell the archivist, coldly and in detail, what will happen when the crown learns he refused a guest bearing the Veyra seal. You have no idea if any of it is true. Neither does he. The door opens.', fx: { obj: 'mq3.access', path: 'aggressive' } },
              { t: 'Leave for now', text: 'You walk away. The archivist\'s eyes follow you until you turn the corner. Perhaps someone at court could help — a guard\'s pass, an advisor\'s key. Or perhaps the portraits hide another way.' },
            ],
          },
          { cond: { quest: { mq3: 'done' } }, title: 'The Restricted Archive', text: 'The unlabelled drawer is empty now. Someone has since added a label: it reads "A." in fresh ink.' },
          { cond: {}, title: 'The Restricted Archive', text: 'BY ROYAL WARRANT ONLY. The archivist does not even look up.' },
        ],
        party: { lucien: 'Lucien glances at the door and away again. "Dull in there," he says. "I\'d avoid it."' },
      },
      {
        id: 'portraits', label: 'Portrait collection', x: 78, y: 25,
        variants: [
          { cond: { quest: { mq6: 'active' }, item: 'hollowmere_ledger', obj: { 'mq6.gallery': false } }, title: 'The Portrait Collection', text: 'With the ledger in hand you walk the gallery slowly, comparing family names. The Hollowmere child wrote that A. "sings to the bells." Above the portrait of a cathedral choir, a painted bell is cracked — and behind it, the plaster sounds hollow.\n\nYou press. A narrow door swings inward onto a hidden gallery.', fx: { obj: 'mq6.gallery' } },
          { cond: { quest: { mq6: 'active' }, obj: { 'mq6.gallery': true, 'mq6.portrait': false } }, title: 'The Hidden Gallery', text: 'One portrait at the end of the hidden gallery, shrouded in black velvet.', convo: 'story_portrait' },
          { cond: { quest: { mq6: 'active' }, obj: { 'mq6.portrait': true, 'mq6.confide': false } }, title: 'The Hidden Gallery', text: 'The portrait waits behind you. You have to decide who to tell.', convo: 'story_confide' },
          { cond: { quest: { mq3: 'active' }, obj: { 'mq3.access': false }, any: [{ path: { secretive: 2 } }, { flag: 'seraphine_saint_hint' }, { party: 'seraphine' }] }, title: 'The Third Saint', text: 'You study the gallery. The third saint\'s painted eyes are glass — real glass. When you press them, the panel beneath clicks, and a servants\' passage opens into the back of the restricted archive.', fx: { obj: 'mq3.access', path: 'secretive' } },
          { cond: { flag: 'mq6_done' }, title: 'The Portrait Collection', text: 'The hidden door is closed again. You know it is there. That is enough.' },
          { cond: {}, title: 'The Portrait Collection', text: 'Generations of Elarian nobility, painted in oils going brown with age. Every portrait from before the Moonfall has the same faint scratch at the bottom of the frame, where a name plate used to be.' },
        ],
      },
      {
        id: 'manuscripts', label: 'Ancient manuscripts', x: 70, y: 60,
        variants: [
          { once: true, cond: {}, title: 'Ancient Manuscripts', text: 'In a case of illuminated manuscripts, a loose sheet of music: a lullaby of three notes. The composer\'s name has been cut out with scissors.', fx: { item: { music_sheet: 1 } } },
          { once: true, cond: { chapterMin: 5 }, title: 'A Black Book', text: 'Shelved backwards among the illuminated manuscripts is a book bound in black and violet. The handwriting inside is Lucien\'s, younger and prouder. The notes in the margins are in somebody else\'s.', fx: { item: { shadow_grimoire: 1 } } },
          { cond: {}, title: 'Ancient Manuscripts', text: 'Gold leaf and lapis. In every illumination of the night sky, the moon has been painted over in a later, brighter white.' },
        ],
      },
      {
        id: 'records', label: 'Forgotten family records', x: 91, y: 45,
        variants: [
          { once: true, cond: {}, title: 'Family Records', text: 'The peerage of Elaria, compiled by House Marchetti. You take an abridged copy from the stack.', fx: { item: { book_peerage: 1 } } },
          { cond: { met: 'evelyne' }, title: 'Family Records', text: 'House Marchetti\'s entry runs to forty pages. One line, in the oldest edition, has been inked over: "...appointed keepers of the guest list, by the Accord of..."' },
          { cond: {}, title: 'Family Records', text: 'Shelves of family trees. Several branches end abruptly, the same year, as if the ink simply ran out.' },
        ],
      },
      {
        id: 'fairytale', label: 'Children\'s shelf', x: 12, y: 37,
        variants: [
          { once: true, cond: {}, title: 'The Children\'s Shelf', text: 'Among the picture books, one has been read so often its spine is mostly thread: "The Girl Who Was Unremembered."', fx: { item: { book_fairytale: 1 } } },
          { cond: {}, title: 'The Children\'s Shelf', text: 'Fairy tales of moons and bells and lost girls. Elaria\'s children\'s stories are all, you realise, about forgetting.' },
        ],
        party: { noctis: 'Noctis pulls out a picture book and reads the last page first. "I like knowing how things end," he says. "It makes the middle less frightening."' },
      },
    ],
  },

  woods: {
    name: 'Whispering Woods', short: 'Woods',
    tagline: 'Beyond the walls',
    scene: 'woods', music: 'woods',
    map: { x: 30, y: 78 },
    ambient: [
      'Mist lies low between the trees. The flowers glow even in daylight, faintly, as if remembering the moon.',
      'Birdsong, then none. The woods go quiet in patches, the way a room goes quiet when you walk in.',
      'The glowing flowers brighten as the light goes. Moon-moths rise from them in slow spirals.',
      'Night. The woods are lit from within. You can hear, very faintly, something like people talking far away.',
    ],
    hotspots: [
      {
        id: 'flowers', label: 'Glowing moonveil', x: 23, y: 64,
        variants: [
          { cond: { dailyOpen: 'moonveil', quest: { sq_violets: 'active' }, obj: { 'sq_violets.gather': false } }, title: 'Glowing Moonveil', text: 'You gather moonveil from the glowing beds. Each bloom comes away easily, as if it wanted to be carried somewhere.', fx: { daily: 'moonveil', item: { moonveil_bloom: 3 } } },
          { cond: { dailyOpen: 'moonveil' }, title: 'Glowing Moonveil', text: 'You gather a moonveil bloom. Its light pulses gently against your palm, like a slow heartbeat.', fx: { daily: 'moonveil', item: { moonveil_bloom: 1 } } },
          { cond: {}, title: 'Glowing Moonveil', text: 'You\'ve gathered what you can today. The flowers turn, very slightly, to follow you as you pass.' },
        ],
      },
      {
        id: 'cottage', label: 'Abandoned cottage', x: 42, y: 32,
        variants: [
          { cond: { quest: { nq_evelyne: 'active' }, obj: { 'nq_evelyne.find': false }, phase: [1] }, title: 'The Abandoned Cottage', text: 'Afternoon light slants through the broken roof. On the hearthstone — as if set down carefully, not dropped — lies an ivory cameo on a black ribbon.', fx: { item: { evelyne_cameo: 1 }, obj: 'nq_evelyne.find' } },
          { once: true, cond: { quest: { sq_pages: 'active' } }, title: 'The Abandoned Cottage', text: 'Pinned to the inside of the door with a rusty nail: a torn page from the official history.', fx: { item: { torn_page: 1 }, obj: 'sq_pages.p3' } },
          { cond: {}, title: 'The Abandoned Cottage', text: 'A table set for four. Four chairs. Four bowls, dusty. Only three of the chairs have ever been sat in, by the wear on them.' },
        ],
      },
      {
        id: 'shrine', label: 'Ancient shrine', x: 87, y: 44,
        variants: [
          { cond: { quest: { hq_fairytale: 'active' }, item: 'moonveil_bloom' }, title: 'The Ancient Shrine', text: 'You lay a moonveil bloom on the mossy stone, as the story said. "So that someone remembers."', fx: { take: { moonveil_bloom: 1 }, obj: 'hq_fairytale.bloom' } },
          { cond: { quest: { hq_fairytale: 'active' } }, title: 'The Ancient Shrine', text: 'The story said to leave her a flower. You have no moonveil with you. The glowing beds are close by.' },
          { cond: {}, title: 'The Ancient Shrine', text: 'A moss-covered shrine to a figure with no face, holding a crescent moon. Someone has left violets here recently. Someone always has.' },
        ],
      },
      {
        id: 'path', label: 'Hidden path', x: 57, y: 59,
        cond: { quest: { mq5: 'started' } },
        variants: [
          { cond: { quest: { mq5: 'active' }, obj: { 'mq5.path': false }, phase: [2, 3] }, title: 'The Hidden Path', text: 'In moonlight, the brambles part along a line you couldn\'t see by day. The path is paved — old flagstones, worn smooth by feet that stopped walking here three hundred years ago.\n\nAt its end, in a clearing ringed with glowing flowers: a village. Roofless houses. Empty doorways. Silence.', fx: { obj: 'mq5.path', flag: 'found_hollowmere', memory: 'mem_hollowmere:village' } },
          { cond: { quest: { mq5: 'active' }, obj: { 'mq5.path': false } }, title: 'Brambles', text: 'By daylight there is only bramble here. Noctis said the path only shows itself to the moon. Come back in the Evening or at Night.' },
          { cond: {}, title: 'The Hidden Path', text: 'The old paved path to Hollowmere lies open now, even by day. Perhaps it only needed someone to remember it.' },
        ],
      },
      {
        id: 'settlement', label: 'Hollowmere ruins', x: 50, y: 47,
        cond: { flag: 'found_hollowmere' },
        variants: [
          {
            cond: { quest: { mq5: 'active' }, obj: { 'mq5.search': false } }, title: 'The Cottages of Hollowmere', text: 'Every doorpost was carved with a family name. Every name has been scraped away — the same tool, the same night, by the look of it. Three cottages still have roofs.',
            choices: [
              { t: 'Search the first cottage', text: 'Bare walls. A cradle. A window that faces the cathedral spire, far away over the trees.' },
              { t: 'Search the second cottage', text: 'Under a loose floorboard, wrapped in oilcloth: a child\'s ledger. The handwriting is careful and round.', fx: { item: { hollowmere_ledger: 1 }, obj: 'mq5.search', exp: 40 } },
              { t: 'Search the third cottage', text: 'The door won\'t open. When you put your ear to it, you hear someone on the other side, also listening. You step back. The feeling of being listened to does not stop.', fx: { path: 'suspicious' } },
            ],
          },
          { cond: { quest: { mq5: 'active' }, obj: { 'mq5.search': true, 'mq5.noctis': false } }, title: 'Among the Ruins', text: 'Someone is sitting on the broken wall of the well, swinging his feet.', convo: 'hollowmere_noctis' },
          { once: true, cond: {}, title: 'Hollowmere', text: 'In the dust of the well-house, a child\'s glass marble with a crescent inside it.', fx: { item: { childs_marble: 1 } } },
          { cond: {}, title: 'Hollowmere', text: 'The village is quieter than silence. When the wind passes through the empty doorways it sounds like names being said very softly.' },
        ],
      },
      {
        id: 'edge', label: 'Forest edge', x: 10, y: 45,
        variants: [
          { cond: { quest: { nq_cael: 'active' }, obj: { 'nq_cael.token': false }, phase: [3] }, title: 'The Forest Edge', text: 'Where the guards\' patrol path meets the trees, half-buried in leaf litter: a Royal Guard token. The name has been scraped off. The number reads IX.', fx: { item: { guard_token: 1 }, obj: 'nq_cael.token' } },
          { cond: { quest: { nq_cael: 'active' }, obj: { 'nq_cael.token': false } }, title: 'The Forest Edge', text: 'Footprints in the mud, guard-issue boots, heading into the woods and not out again. Too dark under the trees to follow by day — the moon would show more. Come back at Night.' },
          { once: true, cond: { phase: [2, 3] }, title: 'Moon-moths', text: 'A pale moth with eclipse-patterned wings settles on your hand, then leaves behind a single silver wing-scale that does not stop glowing.', fx: { item: { silver_feather: 1 } } },
          { cond: {}, title: 'The Forest Edge', text: 'The city wall behind you, the woods ahead. The boundary feels thinner than stone should.' },
        ],
      },
    ],
  },

  garden: {
    name: 'Moonlit Garden', short: 'Garden',
    tagline: 'Behind the palace, where it is always moonlight',
    scene: 'garden', music: 'woods',
    map: { x: 86, y: 44 },
    ambient: [
      'Outside the gate it is morning. In here it is moonlight, as it always is. The gardeners have stopped mentioning it.',
      'Bees drift in from the sunny side of the hedge, grow confused, and go to sleep on the roses.',
      'The roses smell strongest at this hour, though the light in here never changes to say what hour it is.',
      'Night outside, night in here. For once the garden and the world agree.',
    ],
    hotspots: [
      {
        id: 'bloom', label: 'A single glowing bloom', x: 44, y: 76,
        variants: [
          { once: true, cond: {}, title: 'Moonveil, Out of Place', text: 'A moonveil bloom is growing between the flagstones, a long way from the Whispering Woods where it belongs. It glows brighter as you kneel, as if it had been waiting for someone.\n\nThe gardener swears he never planted it. "Came up the night the bells rang thirteen," he says.', fx: { daily: 'garden_moonveil', item: { moonveil_bloom: 1 } } },
          { cond: { dailyOpen: 'garden_moonveil' }, title: 'Moonveil, Out of Place', text: 'Another bloom has opened between the flagstones overnight. You gather it, and its light pulses against your palm like a slow heartbeat.', fx: { daily: 'garden_moonveil', item: { moonveil_bloom: 1 } } },
          { cond: {}, title: 'Moonveil, Out of Place', text: 'The bloom between the flagstones has closed for today. It turns, very slightly, to follow you.' },
        ],
      },
      {
        id: 'bench', label: 'The iron bench', x: 54, y: 66,
        party: {
          lucien: 'Lucien sits at the very end of the bench, as if the rest of it were reserved for someone. "I used to come here to think," he says. "Now I come here to stop."',
          cael: 'Cael sits with his back straight and his hand near his sword, and then, slowly, he lets both go. "It\'s quiet," he says, surprised.',
          evelyne: 'Evelyne arranges her skirts across most of the bench and tells you which noble proposed to whom on it. "Seven engagements. Two of them happy."',
          seraphine: 'Seraphine does not sit. She stands behind the bench with her hand on its back, and looks at the cathedral spires the whole time.',
          noctis: 'Noctis lies along the bench with his boots on the armrest. "Nothing happens here," he says contentedly. "I checked."',
        },
        variants: [
          { cond: {}, title: 'The Iron Bench', text: 'A wrought-iron bench under the arch, cold even in summer. Someone has scratched a tiny crescent into the armrest, and then, much later, a second one beside it.' },
        ],
      },
      {
        id: 'arch', label: 'The rose arch', x: 51, y: 40,
        variants: [
          { cond: {}, title: 'The Rose Arch', text: 'An old stone arch so overgrown with roses it seems to be holding them up rather than the other way round. Through it, the path goes on into a garden that does not seem to end where the palace wall should be.' },
        ],
      },
      {
        id: 'greyrose', label: 'Roses, white and violet', x: 14, y: 72,
        variants: [
          { once: true, cond: {}, title: 'The Grey Rose', text: 'Every rose in the garden is white or violet. All except one, low down at the back, which has bloomed grey: the colour of something left too long in the dark. The gardener lets you take it. "It keeps coming back," he says. "We stopped cutting it years ago."', fx: { item: { grey_rose: 1 } } },
          { cond: {}, title: 'White and Violet', text: 'White roses and violet ones, so many that the air is thick with them. Nobles walk here slowly enough to be seen, pretending to admire the flowers while they watch each other.' },
        ],
      },
      {
        id: 'spires', label: 'Cathedral spires', x: 74, y: 22,
        variants: [
          { cond: { flag: 'cove_found' }, title: 'The Spires', text: 'From the garden the cathedral spires look close enough to touch. Somewhere under them, under the floor and the crypt and two hundred wet steps, someone is singing.' },
          { cond: {}, title: 'The Spires', text: 'From the garden the cathedral spires look close enough to touch. The bell tower is the tallest. From here you can see it has thirteen bells, and room for a fourteenth.' },
        ],
      },
    ],
  },

  cove: {
    name: 'Hidden Cove', short: 'Cove',
    tagline: 'Beneath the cathedral, where the sea begins',
    scene: 'cove', music: 'cove',
    map: { x: 58, y: 40 },
    ambient: [
      'Daylight never reaches the cove. The moon over the cursed sea is the same at every hour.',
      'The tide does not move here. The sea lies flat and black, and things drift on it that might be letters.',
      'Water drips from the cave roof in slow, exact rhythms, like someone counting.',
      'Night is no different down here, except that the singing is easier to hear.',
    ],
    hotspots: [
      {
        id: 'rock', label: 'Aeria\'s rock', x: 63, y: 60,
        variants: [
          { cond: { quest: { mq8: 'active' }, obj: { 'mq8.aeria': false }, flag: 'aeria_told' }, title: 'Aeria', text: 'Aeria.', convo: 'aeria_reveal' },
          { cond: { quest: { sq_aeria: 'active' }, obj: { 'sq_aeria.ask': true, 'sq_aeria.return': false } }, title: 'Aeria', text: 'Aeria.', convo: 'aeria_second' },
          { cond: {}, title: 'Aeria', text: 'Aeria.', convo: 'aeria_idle' },
        ],
      },
      {
        id: 'chain', label: 'The iron chain', x: 75, y: 70,
        variants: [
          { cond: {}, title: 'The Iron Chain', text: 'It runs from Aeria\'s wrist down into the water, and somewhere under the water it turns and climbs up through the rock, toward the cathedral overhead.\n\nEvery link is stamped with a tiny bell.', fx: { memory: 'mem_cove:chain' } },
        ],
      },
      {
        id: 'figurehead', label: 'Wrecked figurehead', x: 21, y: 62,
        variants: [
          { cond: {}, title: 'The Figurehead', text: 'A ship\'s figurehead is wedged in the rocks: a woman with her arms flung wide, salt-white. Every name carved on the hull behind her has been scraped away, except one line, cut later and deeper.\n\nWE FORGOT OUR WAY HOME.', fx: { memory: 'mem_cove:figurehead' } },
        ],
      },
      {
        id: 'sea', label: 'The cursed sea', x: 44, y: 51,
        variants: [
          { once: true, cond: {}, title: 'Moonwater', text: 'Where the moonlight lies flattest on the water you kneel and fill an empty flask. The water is cold enough to ache, and it never quite stays still.', fx: { item: { moonwater_flask: 1 } } },
          { cond: {}, title: 'The Cursed Sea', text: 'Past the mouth of the cave the sea is perfectly still. Pale shapes drift on it, and after a while you understand they are letters: names, slowly coming apart.\n\nNobody sails here any more. Nobody remembers why.' },
        ],
      },
      {
        id: 'stair', label: 'Stair to the cathedral', x: 16, y: 70,
        variants: [
          { cond: {}, title: 'The Salt Stair', text: 'Two hundred wet steps, up to the prayer alcove and the violet light.', goto: 'cathedral', gotoLabel: 'Climb back up' },
        ],
      },
    ],
  },

  ballroom: {
    name: 'Velvet Ballroom', short: 'Ballroom',
    tagline: 'Masquerades and secret meetings',
    scene: 'ballroom', music: 'ballroom',
    map: { x: 72, y: 20 },
    ambient: [
      'In daylight the ballroom is a cathedral of dust sheets. Servants polish a thousand crystals one by one.',
      'Musicians tune in the gallery. Florists carry in armfuls of black roses. The room is holding its breath for evening.',
      'Chandeliers blaze. Masks, silk, laughter that is a little too loud. Everyone here is someone else tonight.',
      'The last dancers turn slowly under dimming chandeliers. Some of them have not taken off their masks in a long time.',
    ],
    hotspots: [
      {
        id: 'floor', label: 'Dance floor', x: 50, y: 77,
        variants: [
          { cond: { quest: { mq4: 'active' }, obj: { 'mq4.attend': false }, phase: [2, 3] }, title: 'The Velvet Masquerade', text: 'Evelyne\'s masquerade is already in full swing.', convo: 'story_masq_arrive' },
          { cond: { quest: { mq4: 'active' }, obj: { 'mq4.attend': false } }, title: 'The Ballroom by Day', text: 'Dust sheets and ladders. The masquerade begins in the Evening.' },
          { cond: { phase: [2, 3], galaOpen: 'dance' }, title: 'The Moonlit Gala', text: 'You join the dance. Masks blur past; a stranger in a silver mask spins you once and is gone before you can see their eyes.', fx: { galaDaily: 'dance', gala: 4 } },
          { cond: { phase: [2, 3] }, title: 'The Dance Floor', text: 'The music never quite stops. You\'ve danced tonight already; your feet remind you.' },
          { cond: {}, title: 'The Dance Floor', text: 'The empty floor is a mirror of polished black wood. Your reflection in it is a half-second late.' },
        ],
      },
      {
        id: 'alcove', label: 'Curtained alcove', x: 86, y: 56,
        cond: { any: [{ quest: { mq4: 'active' }, obj: { 'mq4.dance': true } }, { quest: { mq4: 'done' } }] },
        variants: [
          { cond: { quest: { mq4: 'active' }, obj: { 'mq4.secret': false } }, title: 'The Curtained Alcove', text: 'Two voices behind velvet.', convo: 'story_masq_alcove' },
          { cond: {}, title: 'The Curtained Alcove', text: 'An alcove hung with heavy velvet. It smells of rose perfume and candle smoke — and faintly, of the cathedral.' },
        ],
      },
      {
        id: 'chandelier', label: 'Third chandelier', x: 62, y: 41,
        variants: [
          { once: true, cond: { phase: [3] }, title: 'The Third Chandelier', text: 'One crystal is missing from the third chandelier. You feel something cold in your pocket — and draw out a crystal that matches it perfectly. You do not remember picking it up.', fx: { item: { chandelier_crystal: 1 } } },
          { cond: {}, title: 'The Chandeliers', text: 'A thousand crystals. On the third chandelier, one setting is empty. The servants say it has always been empty. The servants are new.' },
        ],
      },
      {
        id: 'balcony', label: 'Ballroom balcony', x: 50, y: 56,
        variants: [
          { cond: { galaOpen: 'petal' }, title: 'The Ballroom Balcony', text: 'Out on the balcony, black rose petals have drifted against the balustrade. You gather one as a keepsake of the gala. The moon watches.', fx: { galaDaily: 'petal', gala: 3 } },
          { cond: {}, title: 'The Ballroom Balcony', text: 'The whole of Elaria under the moon. From here the cathedral looks very small and very far away.' },
        ],
      },
      {
        id: 'masks', label: 'Hall of Masks', x: 14, y: 44,
        variants: [
          { once: true, cond: {}, title: 'The Hall of Masks', text: 'One ceremonial mask hangs on the wall for each of the seven great houses. There are eight hooks. The eighth is empty, its label marked only "V." You slip the label into your pocket.', fx: { item: { empty_hook_tag: 1 } } },
          { once: true, cond: { chapterMin: 4 }, title: 'Behind the Eighth Hook', text: 'Behind the empty eighth hook, a panel of the wall is loose. Inside, wrapped in black silk, is a hand mirror framed in silver thorns.\n\nYour reflection in it is half a second late.', fx: { item: { ancient_mirror: 1 } } },
          { cond: {}, title: 'The Hall of Masks', text: 'Seven masks. Eight hooks. Nobody ever looks at the eighth.' },
        ],
      },
    ],
  },
};

export const LOCATION_ORDER = ['cathedral', 'royal', 'library', 'woods', 'ballroom'];

// Overheard gossip at the café (one per day).
export const GOSSIP = [
  '"—and Lady Marchetti says the moon was brighter last night than it has been in a century. As if that were possible."',
  '"Did you hear? Another family at the east gate forgot their own surname. They\'re using their dog\'s name for now."',
  '"The advisor hasn\'t aged a day since my grandmother was presented at court. Good bones, I suppose."',
  '"Someone\'s been ringing the cathedral bell at midnight. Thirteen times. My husband says it\'s twelve and I\'m drunk."',
  '"I heard there\'s a girl living in the old cathedral. Silver hair. Someone said she looks like a painting."',
  '"Captain Cael asked my brother if he remembered someone called Tobias. My brother doesn\'t know a Tobias. Nobody does."',
  '"The Marchetti girl is throwing another masquerade. They say the guest list is the same one her great-great-grandmother used."',
];
