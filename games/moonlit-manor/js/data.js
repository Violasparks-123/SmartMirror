// Moonlit Manor — game content. Edit this file to add places, story, outfits and items.
// Anything with a "slot" uses art added in the Add Art screen (see js/art.js), with a stand-in until then.
window.DATA = {
  // Places. "video: true" uses the animated castle video. "slot" places use added art, else "fallback".
  locations: [
    { id: "castle", name: "Moonlit Manor", video: true, line: "Home sweet home. The roses are blooming." },
    { id: "courtyard", name: "Front Courtyard", line: "Every window is glowing tonight." },
    { id: "fountain", name: "Rose Garden", line: "Listen… the fountain is humming a waltz." },
    { id: "balcony", name: "Wisteria Balcony", line: "The wisteria smells like honey." },
    { id: "ballroom", name: "Grand Ballroom", line: "Imagine dancing here under the chandelier!" },
    { id: "hallway", name: "Grand Hallway", line: "My footsteps echo all the way down." },
    { id: "library", name: "Old Library", line: "So many books… and one is glowing?" },
    { id: "study", name: "Study", line: "I should write in my diary." },
    { id: "bedroom", name: "Asteria's Room", line: "My cosy little room. Luna sleeps on the bed." },
    { id: "academy", name: "Academy Courtyard", line: "Class starts tomorrow. I'm a little nervous." },
    { id: "rooftop", name: "Star Observatory", line: "I can see the whole city from up here!" },
    { id: "tower", name: "Moonlit Tower", slot: "bg-tower", fallback: "library", line: "The stairs go up and up… the crystals are humming.", unlock: 2 },
    { id: "greenhouse", name: "Glass Greenhouse", slot: "bg-greenhouse", fallback: "fountain", line: "It's warm in here, and everything smells of roses.", unlock: 2 },
  ],

  // Side characters. Their pictures come from the art slots.
  npcs: {
    rosalind: { name: "Rosalind", slot: "npc-rosalind", icon: "🌹", about: "The manor gardener. Kind, clever, and full of secrets.",
      likes: "teacup", lines: ["The night roses opened just for you!", "Would you like some rose tea?", "Shh… I can keep a secret too."] },
    steward: { name: "The Steward", slot: "npc-steward", icon: "🎩", about: "Runs the manor. Knows every key and winks a lot.",
      likes: "key", lines: ["Your tea is ready, my lady.", "*winks* I saw nothing.", "The manor runs on schedules and sparkles."] },
    masked: { name: "Masked Guest", slot: "npc-masked", icon: "🎭", about: "A mysterious figure seen in the tower window.",
      likes: "lantern", lines: ["…", "Follow the light.", "Not yet. Soon."] },
    luna: { name: "Luna", slot: "npc-luna", icon: "🐈‍⬛", about: "Asteria's cat. Sleeps on the bed, chases fireflies.",
      likes: "musicbox", lines: ["Mrrp!", "*purrs loudly*", "*knocks a ribbon off the table*"] },
  },
  // Friendship gift costs coins; 5 hearts is best friends.
  giftCost: 500,

  // Expressions: neutral, joy, content, shock, dizzy, cry.
  // A line is [face, text] for Asteria, or ["@npcId", text] for a side character.
  // "cg" unlocks a story picture (memory) after the step.
  story: [
    {
      chapter: "The Mysterious Tower",
      steps: [
        { at: "castle", cg: "cg-tower-light", lines: [["neutral", "Did you see that? A light flickered in the old tower."], ["@luna", "Mrrp?!"], ["shock", "It blinked three times… like a signal!"]],
          choice: [["Let's investigate!", "joy", "Yes! Adventure time!", ["coins", 300]], ["Maybe it's just a candle.", "content", "Hmm… but candles don't blink in threes.", ["stars", 20]]] },
        { at: "hallway", cg: "cg-hidden-key", lines: [["neutral", "One portrait frame in the hallway is empty."], ["shock", "Wait. There's a key taped behind it!"], ["@steward", "Ah. I wondered when you'd find that, my lady."]],
          choice: [["Take the key", "joy", "It's cold, like moonlight.", ["item", "key"]], ["Ask what it opens", "content", "He only winked and said: 'Keep it safe.'", ["item", "key"]]] },
        { at: "library", lines: [["shock", "A book just fell off the shelf by itself!"], ["neutral", "It's open to a map of the tower stairs."]],
          choice: [["Read it closely", "content", "The stairs open only under a full moon.", ["stars", 40]], ["Run away!", "dizzy", "Eek! …okay, okay, I'm back.", ["coins", 200]]] },
        { at: "rooftop", lines: [["neutral", "From the observatory, the tower window glows purple."], ["joy", "There's someone up there, waving!"]],
          choice: [["Wave back", "joy", "They waved again! I think they're friendly.", ["stars", 30]], ["Look through the telescope", "shock", "A masked guest… with a crown of stars?", ["item", "wishstar"]]] },
        { at: "ballroom", cg: "cg-masked-guest", lines: [["shock", "Someone's on the ballroom balcony!"], ["@masked", "Meet me at the Royal Fashion Ball, Lady Asteria."], ["joy", "They left a lantern and a letter… how mysterious!"]],
          choice: [["I'll be there!", "joy", "Then I need the perfect outfit…", ["item", "lantern"]], ["Who are you?", "content", "No answer. Just the smell of roses.", ["item", "lantern"]]] },
      ],
    },
    {
      chapter: "The Royal Fashion Ball",
      steps: [
        { at: "bedroom", cg: "cg-getting-ready", lines: [["cry", "I have nothing to wear to the ball!"], ["@luna", "*sits on the only clean dress*"], ["neutral", "…Luna, please."]],
          choice: [["Try the Wardrobe", "joy", "You're right, let's mix and match!", ["coins", 600]], ["Wear the gothic dress", "content", "Classic and elegant. Good choice.", ["stars", 40]]] },
        { at: "balcony", lines: [["neutral", "Practising my curtsy on the balcony…"], ["dizzy", "Whoa, the wisteria made me sneeze!"]],
          choice: [["Practise again", "joy", "One, two, curtsy. Perfect!", ["stars", 30]], ["Take a break", "content", "Fresh air and tea. Much better.", ["energy", 10]]] },
        { at: "fountain", lines: [["@rosalind", "Lady Asteria! I saved the night rose for you."], ["joy", "It only blooms once a year! Thank you, Rosalind!"], ["@rosalind", "Wear it to the ball. Someone will notice. Hehe."]],
          choice: [["Pin it in my hair", "joy", "Now I feel like a princess.", ["item", "heart"]], ["Why are you giggling?", "content", "She just smiled and went back to her roses.", ["item", "heart"]]] },
        { at: "ballroom", cg: "cg-reveal", lines: [["shock", "The masked guest! They're taking off the mask…"], ["@masked", "Surprise, my lady."], ["joy", "Rosalind?! You planned this whole mystery for me!"]],
          choice: [["Dance with her", "joy", "Best. Night. Ever. ♡", ["item", "ribbon"]], ["Laugh together", "content", "The tower light was her lantern all along.", ["item", "ribbon"]]] },
      ],
    },
    {
      chapter: "Secrets of the Tower",
      steps: [
        { at: "tower", lines: [["@rosalind", "Want to see where I hid all those clues?"], ["joy", "The tower! The Moonlight Key fits the door!"], ["shock", "The walls are full of glowing crystals…"]],
          choice: [["Touch a crystal", "joy", "It chimed like a bell!", ["item", "crystal"]], ["Climb higher", "content", "The view gets prettier every step.", ["stars", 50]]] },
        { at: "tower", lines: [["neutral", "At the top there's a tiny silver music box."], ["@steward", "That belonged to your grandmother, my lady."]],
          choice: [["Wind it up", "joy", "It plays the waltz from the fountain!", ["item", "musicbox"]], ["Ask about grandmother", "content", "'She loved this tower,' he said softly.", ["item", "musicbox"]]] },
        { at: "greenhouse", lines: [["@rosalind", "Welcome to my secret greenhouse! Tea?"], ["joy", "Rose tea in a rose teacup? Yes please!"]],
          choice: [["Clink teacups", "joy", "To mysteries and friendship! ♡", ["item", "teacup"]], ["Help water the roses", "content", "The roses seem to glow brighter.", ["item", "teacup"]]] },
        { at: "balcony", cg: "cg-dance", lines: [["@luna", "*twirls in the moonlight*"], ["joy", "Rosalind, dance with us under the moon!"], ["@rosalind", "Only if Luna leads!"]],
          choice: [["Dance!", "joy", "One, two, three… one, two, three… ♡", ["stars", 300]], ["Make a wish", "content", "I wish for more nights like this.", ["stars", 300]]] },
      ],
    },
  ],
  // after the story, side quests repeat
  sideQuests: [
    { at: "academy", lines: [["neutral", "A classmate dropped their notebook."]], choice: [["Return it", "joy", "They said thank you with a cookie!", ["coins", 300]], ["Read the cover", "content", "It says 'Ideas for the Spring Festival'.", ["stars", 15]]] },
    { at: "study", lines: [["neutral", "Time to write in my diary."], ["@luna", "*sits on the diary*"]], choice: [["Write anyway", "content", "Dear diary, Luna is very heavy today.", ["stars", 20]], ["Doodle bows", "joy", "Bows on every page!", ["coins", 250]]] },
    { at: "fountain", lines: [["neutral", "Luna is chasing fireflies by the fountain."]], choice: [["Join her", "joy", "We caught nothing, but it was fun!", ["coins", 300]], ["Watch quietly", "content", "So peaceful…", ["energy", 8]]] },
    { at: "greenhouse", lines: [["@rosalind", "Can you help me pick roses for the hallway?"]], choice: [["Of course!", "joy", "The hallway smells wonderful now.", ["coins", 350]], ["Pick the prettiest one", "content", "I kept one for my room. Shh.", ["stars", 25]]] },
    { at: "hallway", lines: [["@steward", "My lady, the silver needs polishing. Care to help?"]], choice: [["Polish!", "joy", "Sparkly! I can see my face!", ["coins", 300]], ["Maybe later…", "content", "He winked. 'Later it is.'", ["energy", 8]]] },
  ],
  memories: {
    "cg-tower-light": "The light in the tower", "cg-hidden-key": "The hidden key", "cg-masked-guest": "The masked guest",
    "cg-getting-ready": "Getting ready", "cg-reveal": "The big reveal", "cg-dance": "Dancing under the moon",
  },

  // Outfits. Layers: [image, width %, left %, top %] inside the doll box. "slot" outfits use added art.
  outfits: {
    gothic: { name: "Moonlit Gothic", style: "elegant", layers: [["outfit-gothic", 100, 0, 25.2]] },
    school: { name: "Academy Uniform", style: "cute", layers: [["outfit-school", 72, 14, 25.8]] },
    coat: { name: "Lavender Coat", style: "cosy", layers: [["outfit-school", 72, 14, 25.8], ["outfit-coat", 96, 2, 24.7]] },
    ballgown: { name: "Royal Ball Gown", style: "elegant", slot: "outfit-ballgown" },
    pajamas: { name: "Starry Pajamas", style: "cosy", slot: "outfit-pajamas" },
    picnic: { name: "Garden Picnic", style: "cute", slot: "outfit-picnic" },
    rain: { name: "Rainy Day Set", style: "cosy", slot: "outfit-rain" },
    witch: { name: "Moon Witch", style: "elegant", slot: "outfit-witch" },
  },
  outfitDefaults: { w: 84, l: 8, t: 24.5 },
  tints: { Original: 0, Rose: 55, Berry: 25, Ocean: -45, Mint: -110 },

  // Fashion themes rotate by day; matching style scores more.
  themes: [
    { name: "Moonlit Elegance", style: "elegant" },
    { name: "Academy Sweetheart", style: "cute" },
    { name: "Chilly Night Stroll", style: "cosy" },
  ],

  items: {
    bow: "Velvet Bow", wishstar: "Wish Star", crown: "Moon Crown", heart: "Night Rose Heart",
    moon: "Crescent Charm", badge: "Star Badge", crystal: "Amethyst Crystal", ribbon: "Ribbon of Dreams",
    key: "Moonlight Key", lantern: "Star Lantern", musicbox: "Silver Music Box", teacup: "Rose Teacup",
  },
  // "@slot" = art from the Add Art screen; the emoji shows until then.
  itemArt: { bow: "bow-a", wishstar: "item-wishstar", crown: "item-crown", heart: "heart", moon: "item-moon", badge: "item-badge", crystal: "item-crystal", ribbon: "bigbow",
    key: "@item-key", lantern: "@item-lantern", musicbox: "@item-musicbox", teacup: "@item-teacup" },
  itemFallback: { key: "🗝️", lantern: "🏮", musicbox: "🎼", teacup: "🍵" },

  achievements: [
    { id: "quests", name: "Quest Seeker", desc: "Complete 10 quest steps", goal: 10, reward: ["stars", 150] },
    { id: "explore", name: "Explorer", desc: "Visit all 13 places", goal: 13, reward: ["stars", 200] },
    { id: "items", name: "Collector", desc: "Find all 12 special treasures", goal: 12, reward: ["stars", 300] },
    { id: "style", name: "Fashionista", desc: "Score 90+ in Dress Up", goal: 1, reward: ["coins", 3000] },
    { id: "cook", name: "Pastry Chef", desc: "Bake 3 cupcakes", goal: 3, reward: ["coins", 2000] },
    { id: "puzzle", name: "Puzzle Master", desc: "Solve 3 puzzles", goal: 3, reward: ["stars", 120] },
    { id: "friends", name: "Best Friends", desc: "Reach 5 hearts with anyone", goal: 5, reward: ["stars", 250] },
    { id: "memories", name: "Memory Keeper", desc: "Unlock all 6 memories", goal: 6, reward: ["coins", 5000] },
  ],

  loginRewards: [["coins", 500], ["stars", 20], ["coins", 1000], ["energy", 30], ["stars", 50], ["coins", 2500], ["item", "badge"]],

  idleLines: [
    "Another lovely day… ♡", "The roses smell sweet tonight.", "Luna wants a treat.",
    "Do you hear the fountain singing?", "Are my bows crooked?", "The ball is coming soon!",
  ],
};
