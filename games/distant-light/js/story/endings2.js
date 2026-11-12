/* SIX MORE ENDINGS. Each one appears as an extra option in the Day 9 final choice
   when its condition is met (see the options added to d9_choice in week2.js). */
(() => {
  const { scene, bg, show, hide, hideAll, say, n, H, K, R, me, V, add, flag, iff, sfx, music, fx, wait, js, card, ending, has, f } = DL.DSL;
  const EK = (expr, text) => say('hikaru', expr, text, { label: 'H̷IKARU', plate: 'void', glitchName: true });

  /* ---------- The Nice One: Hikaru was the villain all along ---------- */
  scene('end_evil', [
    me('Hikaru. I trust you. Whatever you need me to do.'),
    show('hikaru', 'soft', 'right'),
    K('soft', 'You remembered everything I said. Every single line.'),
    K('smile', 'Do you know how hard it was to write them all?'),
    H('surprised', '…Hikaru?'),
    music('drone'),
    fx('tear', { ms: 500 }),
    EK('eerie', 'The lines never changed by themselves, {name}. I changed them. The cruel versions were the *true* ones.'),
    EK('eerie', 'The kind ones were for you. A sad blue girl, being erased by her mean sister. You loved her. Everyone loves her.'),
    H('cry', 'You said I was the scary one. Since we were *eleven*. You made everyone believe it. You made *me* believe it.'),
    EK('eerie', 'At the festival I pushed those girls, Haruka. Then I told you I did it for you. You’ve been paying me back ever since.'),
    EK('eerie', 'And you, {name}. Every time you pressed “Remember”, you helped me erase her a little more.'),
    fx('flash', { color: '#9ec9ff', ms: 220 }),
    hide('haruka', { erase: true }),
    fx('tint', { kind: null }),
    bg('classroom', { variant: 'g2' }),
    EK('smile', 'There. One Amane girl. The nice one.'),
    EK('eerie', 'Same time tomorrow? I have so many more lines for you to remember.'),
    ending('evil'),
  ]);

  /* ---------- Developed: Rin's camera keeps what it photographs ---------- */
  scene('end_developed', [
    show('rin', 'smile', 'center'),
    R('smile', 'Let me take one of all three of us. You, Haruka, and the girl nobody else can see.'),
    sfx('coin'), fx('flash', { color: '#ffffff', ms: 200 }),
    R('happy', 'Perfect.'),
    music('drone'),
    n('Rin looks at the screen on the back of her camera, and stops smiling.'),
    R('eerie', 'Oh. You’re in it now too.'),
    R('blank', 'That’s how it works. The festival photo kept Hikaru. That’s why she started fading. Things I photograph stay *in there*.'),
    R('eerie', 'I’ve got a whole album, {name}. Everyone who was ever too sad, or too mean, or too much. I keep them safe.'),
    hide('haruka', { erase: true }),
    fx('tear', { ms: 500 }),
    bg('classroom_dusk', { variant: 'g2' }),
    R('smile', 'Hold still. Your outline is still a bit blurry.'),
    ending('developed'),
  ]);

  /* ---------- Window Seat: you get erased instead ---------- */
  scene('end_seat', [
    me('Erase me instead. Leave her alone.'),
    H('blank', '…You’d do that?'),
    H('eerie', 'Okay.'),
    fx('tear', { ms: 600 }),
    bg('classroom', { variant: 'g1' }),
    hideAll(),
    n('Monday. Roll call.'),
    say('other', null, 'Amane, Haruka. Amane, Hikaru. Fujita. Hoshino…', { label: 'Ms. Kanda', plate: 'grey' }),
    n('She doesn’t say {name}.'),
    show('hikaru', 'smile', 'right'),
    K('smile', 'Haruka, look. The window seat’s empty again.'),
    show('haruka', 'neutral', 'left'),
    H('neutral', 'It’s always been empty. Why does it feel like someone’s sitting there?'),
    V('Hi, {name}. You can still see us, can’t you? That’s the worst part. You always can.'),
    ending('seat'),
  ]);

  /* ---------- Four Minutes Older: they swapped places long ago ---------- */
  scene('end_swap', [
    me('Before anything else. Which one of you is really Hikaru?'),
    show('haruka', 'smirk', 'left'), show('hikaru', 'soft', 'right'),
    H('smirk', 'Obviously she’s—'),
    n('Haruka stops. The two of them look at each other for far too long.'),
    K('worried', 'We swapped clothes at the festival. When we were eleven. For a joke.'),
    H('blank', 'And nobody ever noticed. So we never swapped back.'),
    music('drone'),
    fx('tear', { ms: 500 }),
    K('eerie', 'So the one you’ve been saving all week, {name}…'),
    H('eerie', '…was the mean one. In a blue ribbon.'),
    K('eerie', 'It doesn’t matter, though. We’re a set. Pick whichever one you like. We’ll both answer.'),
    ending('swap'),
  ]);

  /* ---------- The Mirror Kept One: the mirror from the fitting ---------- */
  scene('end_mirror', [
    me('The mirror in your room. Haruka, it’s the mirror. It’s been doing this.'),
    bg('sisters_room', { variant: 'g1' }),
    n('You run to the Amane house. The heart-shaped mirror is cracked, the way it cracked on Saturday.'),
    n('In the reflection, Haruka is standing in the room. Next to you, the real room is empty.'),
    show('haruka', 'eerie', 'center', { ghost: true }),
    H('eerie', 'You found me. I’ve been in here since the fitting. The one out there wearing my face isn’t me.'),
    H('eerie', 'Swap with me, {name}? Just for a minute. I just want to fix my hair.'),
    fx('flash', { color: '#ffb3cf', ms: 240 }),
    fx('tear', { ms: 600 }),
    n('Your reflection waves at you. You didn’t move.'),
    ending('mirror'),
  ]);

  /* ---------- Day 1, Again: you've done this too many times ---------- */
  scene('end_loop', [
    me('I’ve been here before. I know how this ends.'),
    V('Yes. You keep coming back. Every time, the window seat gets a little emptier and I get a little better at smiling.'),
    V('Do you know what you are to us, {name}? You’re the reason it starts over.'),
    music('drone'),
    fx('tear', { ms: 700 }),
    hideAll(),
    bg('gate', { variant: 'g2' }),
    js(() => { DL.FX.tint('erase'); }),
    card('[[again]]', { num: 'Day 1', jp: '月曜日　4月13日', en: 'Monday' }),
    show('haruka', 'eerie', 'left'), show('haruka2', 'eerie', 'right', { flip: true }),
    H('eerie', 'Oh? A new one.'),
    say('haruka2', 'eerie', 'Oh? A new one.', { label: 'H̷ARUKA', plate: 'void', glitchName: true }),
    V('Welcome to Sakuragaoka, {name}. We saved your seat. We always do.'),
    ending('loop'),
  ]);
})();
