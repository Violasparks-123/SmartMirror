// Every object Astoria can carry. `glyph` picks the icon drawing; `cat` the inventory tab.
// `inspect` text is revealed the first time the player inspects the object, and
// `inspectFx` (optional) fires once — e.g. unlocking a memory fragment.

export const ITEM_CATEGORIES = [
  { id: 'quest', name: 'Quest Items' },
  { id: 'gift', name: 'Gifts' },
  { id: 'book', name: 'Books' },
  { id: 'accessory', name: 'Accessories' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'collectible', name: 'Collectibles' },
  { id: 'magical', name: 'Magical Objects' },
];

export const ITEMS = {
  // ---- quest items ----
  sealed_invitation: { cat: 'quest', name: 'Sealed Invitation', glyph: 'p:sealed_invitation', desc: 'Heavy cream paper, sealed with violet wax: a crescent moon pierced by a thorn. Addressed in faded ink: "To A."', inspect: 'Inside, a single line: "The moon remembers. Come home." The paper is warm, though it has lain on cold stone.', showable: true },
  lucien_letter: { cat: 'quest', name: 'Lucien\'s Letter', glyph: 'p:lucien_letter', desc: 'A summons in sharp, slanted handwriting, signed only "L."', showable: false },
  archive_pass: { cat: 'quest', name: 'Archive Pass', glyph: 'p:archive_pass', desc: 'A brass token stamped with the Royal Guard\'s crest. Grants entry to the library\'s restricted archive — officially, for guard business.' },
  library_key: { cat: 'quest', name: 'Advisor\'s Key', glyph: 'p:library_key', desc: 'A blackened iron key Lucien handed over with visible reluctance. "You owe me," he said.' },
  old_photograph: { cat: 'quest', name: 'Scratched Photograph', glyph: 'p:old_photograph', desc: 'The royal family, dated the year of the Moonfall. At the edge stands a girl in black whose face has been scratched away.', inspect: 'On the back, in pencil: "A. — before." The scratches on the face are careful, deliberate. Someone took their time.', inspectFx: { memory: 'mem_photograph:back' }, showable: true },
  masquerade_invitation: { cat: 'quest', name: 'Masquerade Invitation', glyph: 'p:masquerade_invitation', desc: 'Gilt-edged card from House Marchetti: "The Velvet Masquerade. Come as someone else."' },
  hollowmere_ledger: { cat: 'quest', name: 'Hollowmere Ledger', glyph: 'p:hollowmere_ledger', desc: 'A child\'s ledger listing every family in Hollowmere. Every name has been carefully erased — except the last.', inspect: 'The last line survives in a child\'s round hand: "A., who sings to the bells. She is my friend. I will remember her even if everybody else forgets."', inspectFx: { memory: 'mem_hollowmere:ledger' }, showable: true },
  evelyne_cameo: { cat: 'quest', name: 'Ivory Cameo', glyph: 'p:evelyne_cameo', desc: 'An ivory cameo on a black ribbon, engraved with the Marchetti rose. Evelyne\'s.', inspect: 'It opens. Inside is a tiny painted portrait of a girl with silver-lavender hair — and on the lid, the words "Forgive us."', showable: true },
  unsent_letters: { cat: 'quest', name: 'Bundle of Unsent Letters', glyph: 'p:unsent_letters', desc: 'A ribbon-tied bundle of letters, all sealed, all addressed to "A." in Lucien\'s hand.' },
  guard_token: { cat: 'quest', name: 'Tarnished Guard Token', glyph: 'p:guard_token', desc: 'A Royal Guard identity token found at the forest edge. The name has been scraped off; the number reads IX.', showable: true },
  forgotten_coin: { cat: 'quest', name: 'Coin from the Fountain', glyph: 'p:forgotten_coin', desc: 'An old silver coin engraved: "For Liesel, who will be remembered." No one in Elaria knows the name.', showable: true },
  moonveil_bloom: { cat: 'quest', name: 'Moonveil Bloom', glyph: 'p:moonveil_bloom', desc: 'A violet flower from the Whispering Woods that glows faintly, even in daylight.' },
  torn_page: { cat: 'quest', name: 'Torn History Page', glyph: 'p:torn_page', desc: 'A page torn from the official history of the Moonfall.' },

  // ---- gifts ----
  black_tea: { cat: 'gift', name: 'Elarian Black Tea', glyph: 'p:black_tea', price: 60, desc: 'Smoky, bitter, expensive. The kind served at the palace.' },
  honey_cakes: { cat: 'gift', name: 'Honey Cakes', glyph: 'p:honey_cakes', price: 40, desc: 'Small golden cakes from the Rosewater Café, dusted with violet sugar.' },
  violet_bouquet: { cat: 'gift', name: 'Violet Bouquet', glyph: 'p:violet_bouquet', price: 50, desc: 'Cathedral violets tied with black ribbon.' },
  silver_quill: { cat: 'gift', name: 'Silver Quill', glyph: 'p:silver_quill', price: 120, desc: 'A writing quill with a silver nib, engraved with a crescent.' },
  rare_manuscript: { cat: 'gift', name: 'Pre-Moonfall Manuscript', glyph: 'p:rare_manuscript', price: 260, desc: 'A rare manuscript dated before the Moonfall. Several lines have been inked out.' },
  rose_perfume: { cat: 'gift', name: 'Rose Perfume', glyph: 'p:rose_perfume', price: 90, desc: 'Fashionable this season. Very, very strong.' },
  lace_gloves: { cat: 'gift', name: 'Black Lace Gloves', glyph: 'p:lace_gloves', price: 140, desc: 'Exquisite lace gloves from Maison Corvelle.' },
  polished_whetstone: { cat: 'gift', name: 'Polished Whetstone', glyph: 'p:polished_whetstone', price: 70, desc: 'A fine whetstone of grey moonstone, for keeping a blade honest.' },
  candle_bundle: { cat: 'gift', name: 'Beeswax Candles', glyph: 'p:candle_bundle', price: 35, desc: 'Tall, clean-burning candles. The good kind.' },
  sugared_plums: { cat: 'gift', name: 'Sugared Plums', glyph: 'p:sugared_plums', price: 45, desc: 'Sticky, sweet and a little ridiculous.' },
  pocket_watch: { cat: 'gift', name: 'Stopped Pocket Watch', glyph: 'p:pocket_watch', price: 180, desc: 'A beautiful silver watch whose hands are frozen at thirteen minutes past midnight.' },

  // ---- books ----
  book_moonfall_official: { cat: 'book', name: 'The Celestial Event of the Moonfall', glyph: 'book', desc: 'The official history, by order of the crown. Author: "L."', inspect: 'It explains the Moonfall as a "natural celestial occurrence" in eleven confident pages. Page twelve has been removed. The index lists a chapter called "The Veiling" that does not exist.', inspectFx: { mystery: 'myst_moonfall' } },
  shadow_grimoire: { cat: 'book', name: 'Shadow Grimoire', glyph: 'p:shadow_grimoire', desc: 'A black book of rites bound in violet leather. Most of it is in Lucien\'s handwriting, younger and prouder than you know it.', inspect: 'The last rite has no title. It is the shape of the Moonfall. In the margins, in a second hand that slants like water, someone has added notes on how to make it hungrier.' },
  book_hymnal: { cat: 'book', name: 'Cathedral Hymnal', glyph: 'p:book_hymnal', desc: 'A water-stained hymnal from the prayer rooms.', inspect: 'Every hymn is about the moon. One has no words, only three notes written over and over — the same three notes you heard when you woke.', inspectFx: { memory: 'mem_lullaby:hymnal' } },
  book_fairytale: { cat: 'book', name: 'The Girl Who Was Unremembered', glyph: 'book', desc: 'A children\'s fairy tale, much loved and much mended.', inspect: 'A girl gives the moon her name to save her village, and the moon keeps it. The last page says: "And if you find the shrine in the wood, leave her a flower, so that someone remembers."', inspectFx: { start: 'hq_fairytale' } },
  book_peerage: { cat: 'book', name: 'Elarian Peerage, Abridged', glyph: 'book', desc: 'Every noble house of Elaria. Evelyne\'s family compiled it.', inspect: 'House Veyra is listed in the index — page 304. The book ends on page 303.' },

  // ---- accessories / clothing (mirrors of wardrobe cosmetics) ----
  acc_masquerade_mask: { cat: 'accessory', name: 'Silver Masquerade Mask', glyph: 'p:ui2/item_mask', cosmetic: 'masquerade_mask', desc: 'Filigree silver set with tiny pearls. Wear it from the Wardrobe.' },
  acc_lace_choker: { cat: 'accessory', name: 'Lace Choker', glyph: 'gem', cosmetic: 'lace_choker', desc: 'Black lace with a single amethyst drop.' },
  cl_gala_gown: { cat: 'clothing', name: 'Moonlit Gala Gown', glyph: 'p:ui2/item_dress', cosmetic: 'gala_gown', desc: 'The Moonlit Gala\'s reward gown — midnight tulle scattered with silver.' },

  // ---- collectibles ----
  eclipse_glass: { cat: 'collectible', name: 'Shard of Eclipse Glass', glyph: 'shard', desc: 'A violet fragment fallen from the great eclipse window.' },
  pressed_violet: { cat: 'collectible', name: 'Pressed Violet', glyph: 'flower', desc: 'Found pressed between the pages of a hymnal, dated three hundred years ago.' },
  grey_rose: { cat: 'collectible', name: 'Grey Rose', glyph: 'flower', desc: 'From the royal gardens: every rose there blooms white, except this one, which bloomed grey.' },
  music_sheet: { cat: 'collectible', name: 'Unsigned Music Sheet', glyph: 'page', desc: 'A lullaby in three notes. The composer\'s name has been cut out with scissors.' },
  childs_marble: { cat: 'collectible', name: 'Child\'s Marble', glyph: 'gem', desc: 'A glass marble from Hollowmere, with a tiny crescent inside.' },
  silver_feather: { cat: 'collectible', name: 'Silver Moth Wing', glyph: 'feather', desc: 'Shed by one of the moon-moths of the Whispering Woods. It glows when you think of the cathedral.' },
  chandelier_crystal: { cat: 'collectible', name: 'Chandelier Crystal', glyph: 'p:ui2/item_crystal', desc: 'The crystal missing from the ballroom\'s third chandelier. It was in your pocket. You do not remember picking it up.' },
  keeper_register: { cat: 'collectible', name: 'Keeper\'s Register Page', glyph: 'page', desc: 'A page from the cathedral\'s register of keepers. Every entry for a hundred years is signed "Seraphine".' },
  wax_seal: { cat: 'collectible', name: 'Broken Wax Seal', glyph: 'coin', desc: 'Half of a violet wax seal: a crescent pierced by a thorn.' },
  empty_hook_tag: { cat: 'collectible', name: 'Tag Marked "V."', glyph: 'page', desc: 'The label from the empty hook in the Hall of Masks.' },

  // ---- magical ----
  moon_shard: { cat: 'magical', name: 'Moon Shard', glyph: 'p:moon_shard', desc: 'A splinter of moonlight that never dims. It hums when held near the altar.' },
  memory_vial: { cat: 'magical', name: 'Vial of Remembering', glyph: 'p:memory_vial', desc: 'Silver mist in a glass vial. Opening it returns a fragment of something the moon took.', inspect: 'You uncork it. For a heartbeat you are standing in a sunlit cathedral, and someone is braiding your hair, humming three notes.', inspectFx: { memory: 'mem_lullaby:vial', take: { memory_vial: 1 } } },
  ancient_mirror: { cat: 'magical', name: 'Ancient Mirror', glyph: 'p:ancient_mirror', desc: 'A hand mirror framed in silver thorns and crescent moons. Your reflection in it is always half a second late.', inspect: 'Scratched into the back, very small: "For A., so she can see who she is when no one will tell her."' },
  moonwater_flask: { cat: 'magical', name: 'Moonwater Flask', glyph: 'p:moonwater_flask', desc: 'Water from the cove where the moon touches the cursed sea. It is cold enough to ache, and it never quite stays still.', inspect: 'Hold it to your ear and the water hums three notes, slightly out of tune, on purpose.' },
  eclipse_lantern: { cat: 'magical', name: 'Eclipse Lantern', glyph: 'p:eclipse_lantern', desc: 'A lantern whose flame burns black and gives off violet light. Hidden paths seem nearer when it is lit.' },
};

export const COLLECTIBLES = ['eclipse_glass', 'pressed_violet', 'grey_rose', 'music_sheet', 'childs_marble', 'silver_feather', 'chandelier_crystal', 'keeper_register', 'wax_seal', 'empty_hook_tag', 'moon_shard', 'eclipse_lantern'];

export const SHOP_STOCK = ['black_tea', 'honey_cakes', 'violet_bouquet', 'candle_bundle', 'sugared_plums', 'polished_whetstone', 'rose_perfume', 'silver_quill', 'lace_gloves', 'pocket_watch', 'rare_manuscript'];
