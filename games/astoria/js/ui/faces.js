// Expression portraits: six moods per character, shown in a small cameo by the
// dialogue box (assets/faces/<id>_<mood>.webp).
//
// A line can name its mood directly: ['lucien:smile', '…']. Otherwise the mood
// is read from the line itself (a laugh is a smile, a blush is flustered, and
// so on), so every existing conversation gets expressions without retagging.

export const MOODS = ['neutral', 'smile', 'sad', 'surprised', 'angry', 'flustered'];
const HAS_FACES = new Set(['astoria', 'lucien', 'evelyne', 'cael', 'seraphine', 'noctis', 'aeria']);
// Characters with a single portrait: the same face is shown whatever the mood.
const SINGLE = new Set(['duchess', 'marta', 'edric', 'tam']);
// Speakers written by name in the story files.
const NAMED = { Aeria: 'aeria', 'The Duchess': 'duchess', Marta: 'marta', Edric: 'edric', Tam: 'tam' };

// Checked in order; the first match wins.
const RULES = [
  ['flustered', /\b(blush\w*|flush\w*|stammer\w*|fluster\w*|looks away|clears (his|her) throat|ears go red|colou?r rises)/],
  ['angry', /\b(furious|fury|anger|angry|snaps?|snapped|glares?|glaring|coldly|through (his|her) teeth|hiss\w*|how dare|seething)\b/],
  ['surprised', /\b(stares?|staring|goes (white|pale|still|very still|quiet)|freezes|startl\w*|blinks?|gasps?|stops dead|pen stops|fan stops|what\?|how do you know)/],
  ['sad', /\b(tears?|crying|cries|weep\w*|grief|griev\w*|mourn\w*|sorrow\w*|aches?|hurts?|sorry|sad(ly|ness)?|tired|lonel\w*|heartbr\w*)\b/],
  ['smile', /\b(smil\w*|laugh\w*|grin\w*|chuckl\w*|beam\w*|amused|delight\w*|darling|warmly|charming|wink\w*)\b/],
];

export function splitSpeaker(raw) {
  const [sp, mood] = String(raw).split(':');
  return { sp, mood: MOODS.includes(mood) ? mood : null };
}

export function moodOf(text, explicit = null) {
  if (explicit) return explicit;
  const t = String(text).toLowerCase();
  for (const [mood, re] of RULES) if (re.test(t)) return mood;
  return 'neutral';
}

export function faceId(sp) {
  const id = sp === 'a' ? 'astoria' : (NAMED[sp] || sp);
  return HAS_FACES.has(id) || SINGLE.has(id) ? id : null;
}

export const faceSrc = (id, mood) => `assets/faces/${id}_${SINGLE.has(id) ? 'neutral' : mood}.webp`;

// Warm the browser cache so the first change of expression doesn't flicker.
const warmed = new Set();
export function preloadFaces(id) {
  if (!id || warmed.has(id)) return;
  warmed.add(id);
  (SINGLE.has(id) ? ['neutral'] : MOODS).forEach((m) => { const img = new Image(); img.src = faceSrc(id, m); });
}
