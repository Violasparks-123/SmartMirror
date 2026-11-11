// Songs and cutscenes.
//
// AERIA'S SONG: the audio file plays for `playMs`, then she cuts off.
// `lines` can hold the sung words (one per entry); while it is empty the
// cutscene shows the `placeholder` lines, spread across the song.

export const SONGS = {
  aeria: {
    title: 'Still Purple and Bruised',
    audio: 'assets/audio/aeria_song.mp3',
    playMs: 52000,        // how much of the song plays before she stops
    lines: [],            // the sung words, one line per entry
    lineMs: 3800,         // how long each line stays on screen
    placeholder: [
      'A voice rises out of the dark water, wordless and very old.',
      'It sounds like something you lost a long time ago, and almost remember.',
      'It sounds like being called home.',
    ],
  },
};

// Unskippable cutscenes: a song over a scene, cut off by a single line,
// then handed over to a conversation in a location.
export const CUTSCENES = {
  aeria: {
    song: 'aeria',
    scene: 'cove',
    cut: '"Who\'s there?"',
    then: { goto: 'cove', convo: 'aeria_meet' },
  },
};
