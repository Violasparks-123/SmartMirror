// Achievements, Astoria's context lines, path descriptions and summon pool.

export const PATHS = {
  compassionate: { name: 'Compassionate', desc: 'Empathetic and understanding. People open up to you.', color: '#d79bb4' },
  suspicious: { name: 'Suspicious', desc: 'Perceptive and cautious. You notice what others hide.', color: '#9fb2c9' },
  aggressive: { name: 'Aggressive', desc: 'Intimidating and confrontational. Doors open — some slam.', color: '#c27a7a' },
  secretive: { name: 'Secretive', desc: 'You conceal your intentions, and hidden conversations reveal themselves.', color: '#a68bd6' },
};

export const ACHIEVEMENTS = [
  { id: 'eclipse', title: 'After the Eclipse', desc: 'Reach one of the five endings.', check: (s) => !!s.ending, reward: 200 },
  { id: 'all_endings', title: 'Every Way It Ends', desc: 'See all five main endings.', check: (s) => ['bells', 'keep', 'curator', 'sleep', 'share'].every((e) => (s.endingsSeen || {})[e]), reward: 300 },
  { id: 'hidden_ending', title: 'Behind the Mask', desc: 'Find a hidden ending.', check: (s) => Object.keys(s.endingsSeen || {}).some((e) => !['bells', 'keep', 'curator', 'sleep', 'share'].includes(e)), reward: 200 },
  { id: 'first_heart', title: 'Heart-to-Heart', desc: 'Finish all three Heart-to-Hearts with someone.', check: (s) => ['lucien', 'evelyne', 'cael', 'seraphine', 'noctis'].some((n) => s.flags[`heart_${n}`]), reward: 150 },
  { id: 'unspoken', title: 'Words Once Locked', desc: 'Say five things only your bonds, your nature or your evidence made possible.', check: (s) => (s.stats.earnedChoices || 0) >= 5, reward: 60 },
  { id: 'awake', title: 'The Awakening', desc: 'Complete Chapter 1.', check: (s) => s.quests.mq1?.status === 'done', reward: 30 },
  { id: 'court', title: 'Presented at Court', desc: 'Complete Chapter 2.', check: (s) => s.quests.mq2?.status === 'done', reward: 40 },
  { id: 'socialite', title: 'A Familiar Face', desc: 'Meet all five residents of Elaria.', check: (s) => Object.values(s.npcs).every((n) => n.met), reward: 60 },
  { id: 'confidant', title: 'Confidant', desc: 'Reach high affinity with anyone.', check: (s) => Object.values(s.npcs).some((n) => n.affinity >= 40), reward: 60 },
  { id: 'generous', title: 'Generous Heart', desc: 'Give five gifts.', check: (s) => s.stats.gifts >= 5, reward: 40 },
  { id: 'cartographer', title: 'Cartographer', desc: 'Discover all five locations.', check: (s) => ['cathedral', 'royal', 'library', 'woods', 'ballroom'].every((l) => s.discovered[l]), reward: 50 },
  { id: 'archivist', title: 'Archivist of the Forgotten', desc: 'Complete four memories in the Memory Archive.', check: (s, h) => h.completeMemories >= 4, reward: 60 },
  { id: 'collector', title: 'Collector of Small Things', desc: 'Find eight collectibles.', check: (s) => Object.keys(s.collection).length >= 8, reward: 60 },
  { id: 'nightowl', title: 'Night Owl', desc: 'Explore Elaria at night five times.', check: (s) => s.stats.nightExplores >= 5, reward: 30 },
  { id: 'wardrobe', title: 'Dressed for Secrets', desc: 'Collect eight new pieces for the wardrobe.', check: (s) => Object.keys(s.wardrobe.owned).length >= 14, reward: 40 },
  { id: 'belle', title: 'Belle of the Gala', desc: 'Earn 50 Moonlit Gala points.', check: (s) => s.events.gala.points >= 50, reward: 80 },
  { id: 'keeper', title: 'Keeper of Secrets', desc: 'Walk the Secretive path five times.', check: (s) => s.player.path.secretive >= 5, reward: 40 },
  { id: 'heart', title: 'Kind in a Cruel City', desc: 'Walk the Compassionate path ten times.', check: (s) => s.player.path.compassionate >= 10, reward: 40 },
  { id: 'friends', title: 'Not Alone', desc: 'Have two companions travelling with you.', check: (s) => s.party.length >= 2, reward: 50 },
  { id: 'unremembered', title: 'She Must Never Remember', desc: 'Complete Chapter 6.', check: (s) => s.quests.mq6?.status === 'done', reward: 150 },
];

// Lines Astoria says on the dashboard. The first few whose conditions match are
// rotated through when the player taps her dialogue box.
export const ASTORIA_LINES = [
  { cond: { flag: 'ch7_teaser' }, text: 'She must never remember who she was. …Then why does everything feel so familiar?' },
  { cond: { quest: { mq6: 'active' } }, text: 'The ledger says she sang to the bells. I don\'t sing. …Do I?' },
  { cond: { quest: { mq5: 'active' } }, text: 'A path that only shows itself to the moon. Of course it does.' },
  { cond: { quest: { mq4: 'active' } }, text: 'A masquerade. Everyone pretending to be someone else. I\'ll fit right in.' },
  { cond: { quest: { mq3: 'active' } }, text: 'Records from before the Moonfall… and an archive no one is allowed to read.' },
  { cond: { quest: { mq2: 'active' } }, text: 'A royal summons. How flattering. How suspicious.' },
  { cond: { quest: { mq1: 'active' } }, text: '…Another day in this world.' },
  { cond: { phase: [0] }, text: 'Morning. The light here is always a little violet.' },
  { cond: { phase: [1] }, text: 'The bells are quiet this afternoon. I don\'t trust it.' },
  { cond: { phase: [2] }, text: 'Evening already. Elaria always looks its most honest by candlelight — which is to say, not very.' },
  { cond: { phase: [3] }, text: 'The moon looks beautiful tonight… don\'t you think?' },
  { cond: { pathTop: 'compassionate' }, text: 'Everyone here is carrying something. I wish they\'d let someone help.' },
  { cond: { pathTop: 'suspicious' }, text: 'Everyone in this city is lying about something. The trick is finding out what.' },
  { cond: { pathTop: 'aggressive' }, text: 'If no one will tell me the truth, I\'ll take it.' },
  { cond: { pathTop: 'secretive' }, text: 'Let them think I know nothing. It\'s useful.' },
  { cond: {}, text: '…Another day in this world.' },
];

// Moonlit Summoning: offer moonstones at the altar, and the moon gives back
// something it took. Weighted pool.
export const SUMMON_COST = 150;
export const SUMMON_POOL = [
  { w: 22, kind: 'item', id: 'memory_vial', text: 'A vial of silver mist — a memory the moon was keeping.' },
  { w: 16, kind: 'item', id: 'moon_shard', text: 'A splinter of moonlight that never dims.' },
  { w: 10, kind: 'item', id: 'wax_seal', text: 'Half of a broken wax seal. A crescent, pierced by a thorn.' },
  { w: 8, kind: 'outfit', id: 'rose_comb', text: 'A comb set with a single grey rose. It was yours, once.' },
  { w: 14, kind: 'item', id: 'violet_bouquet', text: 'Cathedral violets, still glowing.' },
  { w: 14, kind: 'item', id: 'pocket_watch', text: 'A silver watch stopped at thirteen past midnight.' },
  { w: 16, kind: 'crowns', n: 180, text: 'Old crowns, minted three hundred years ago, still good.' },
];
