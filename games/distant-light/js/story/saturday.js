/* SATURDAY: the twins need outfits for the Sakura Matsuri at the station.
   Plays at the start of Day 6, before Monday. Fail the fitting and something very bad happens. */
(() => {
  const { scene, bg, show, hide, hideAll, say, n, H, K, R, me, rw, opt, choice, add, flag, iff, call, wait, sfx, music, fx, diary,
    phone, msg, reply, phoneClose, js, hideText, card, ending, has, f } = DL.DSL;

  const HARUKA_DM = { sub: 'online', avatar: 'assets/sprites/haruka_face.webp' };
  const fit = (r) => (s) => s.flags.fitting === r;
  const why = (r) => (s) => s.flags.fitReason === r;
  const H2 = (expr, text) => say('haruka2', expr, text, { label: 'H̷ikaru', plate: 'void', glitchName: true });

  scene('saturday', [
    js(() => { DL.Screens.hud(false); DL.FX.applyLevel(0); DL.FX.tint(null); }),
    music('calm'),
    card('', { num: '土曜日', jp: '4月18日', en: 'Saturday' }),
    bg('bedroom', { clean: true }),
    n('Saturday. You were planning to sleep until noon.'),
    phone('Haruka', HARUKA_DM),
    msg('haruka', 'EMERGENCY'),
    msg('haruka', 'sakura matsuri at the station tonight'),
    msg('haruka', 'we have NOTHING to wear'),
    msg('haruka', 'you’re coming over. you have outside eyes'),
    reply(
      opt('What are “outside eyes”?', [
        msg('haruka', 'eyes that aren’t hikaru’s. she’d put us both in grey'),
        msg('haruka', 'my house. 2pm. don’t be boring'),
      ]),
      opt('On my way.', [add({ favor: 1 }, { quiet: true }), msg('haruka', 'good. 2pm. bring your taste')]),
    ),
    phoneClose(),
    bg('street', { clean: true }),
    n('The Amane house is ten minutes from yours. Haruka opens the door before you can knock.'),
    bg('sisters_room', { clean: true }),
    show('haruka', 'happy', 'left'),
    show('hikaru', 'worried', 'right'),
    n('Their room is two rooms pretending to be one. The left half is pink: a heart mirror, plushies, fairy lights. The right half is blue: books, a beanbag, sketches pinned to a corkboard.'),
    n('Clothes, bags and makeup are spread over both beds like a shop exploded.'),
    H('happy', 'Okay. Rules.'),
    H('smirk', 'One: I go first, because I’m older.'),
    K('neutral', 'By four minutes.'),
    H('cold', 'Two: everyone at the matsuri has to look at *me*. Pink. Leopard. Loud.'),
    H('smile', 'Three: we match. We’re a *set*. If we don’t match at least a little, we don’t even look related.'),
    K('worried', '…Can I say a rule?'),
    H('smirk', 'No.'),
    K('worried', '{name}. Please don’t make me look like her. I want to look like *me*. Blue. Quiet. Maybe… music.'),
    K('soft', 'One matching thing is okay. Not more. Please.'),
    H('smile', 'The festival starts at six. You get three minutes, because I need the rest of the afternoon for my eyeliner.'),
    H('eerie', 'And {name}? Don’t mess this up. You really, *really* don’t want to mess this up.'),
    n('Choose a look, hair, makeup and a bag for each twin: Haruka first, then Hikaru. Keep an eye on the clock. Keep an eye on Haruka.'),
    hide('haruka'), hide('hikaru'), hideText(),
    js(async (s) => {
      const r = await DL.Fitting.play();
      s.flags.fitting = r.result;
      s.flags.fitReason = r.reason;
      s.flags.fitShared = r.sharedItem;
      s.flags.fitSabotages = r.sabotages;
      DL.Dialogue.log.push({ label: '', plate: 'none', html: `(The fitting: ${r.result}${r.reason ? `, ${r.reason}` : ''})` });
    }),
    iff(fit('swapped'), [call('sat_swapped')], [iff(fit('fail'), [call('sat_fail')], [call('sat_festival')])]),
  ]);

  /* ---------- you did well ---------- */
  scene('sat_festival', [
    bg('station', { clean: true }),
    n('Sakuragaoka Station at dusk. Paper lanterns hang along the platform fence, and food stalls run all the way down to the ticket gate.'),
    show('haruka', 'happy', 'left'),
    show('hikaru', 'soft', 'right'),
    iff(fit('perfect'), [
      H('happy', 'Everyone is looking at us. *Both* of us. I didn’t know that could happen.'),
      K('smile', 'I feel like me. That’s… new.'),
      H('smirk', (s) => `See, Hikaru? The ${s.flags.fitShared || 'matching thing'}. We’re a set.`),
      K('soft', 'A set. Okay. I can be in a set.'),
      add({ trust: 2, favor: 2, susp: -2 }),
      flag('festivalPerfect'),
    ], [
      H('neutral', 'It’s fine. I look fine. *Fine.*'),
      K('neutral', 'You look nice, Haruka.'),
      H('cold', 'Don’t.'),
      add({ trust: 1, favor: 1 }),
    ]),
    show('rin', 'surprised', 'center'),
    R('surprised', 'Oh! The Amane twins. You both look… really different.'),
    R('shy', 'Can I take your photo? For the exhibition. I’m asking properly. I always ask properly.'),
    iff(f('posterDrawn'), [H('cold', 'After the poster thing? …Fine. One photo.')], [H('smirk', 'Obviously.')]),
    R('neutral', '{name}, can you hold the camera? My hands are shaking. Wait until the frame is right on them.'),
    n('Through the viewfinder: Haruka striking a pose, Hikaru half a step behind her. Behind them, far down the line, a train light is coming.'),
    choice('When do you take it?',
      opt('Right now, before Haruka changes her pose.', [
        n('Click. Haruka is perfect. Hikaru is a blur at the edge, already turning away.'),
        js((s) => { s.flags.photoStars = 1; }),
      ]),
      opt('Wait until Hikaru looks up.', [
        n('You wait. Haruka sighs loudly. Then Hikaru glances up at the camera, just for a second, surprised to be looked at.'),
        choice('Now?',
          opt('Now. Click.', [n('Click. Both of them, sharp and clear. Hikaru is almost smiling.'), js((s) => { s.flags.photoStars = 2; s.flags.goodPhoto = true; })]),
          opt('Wait for the train light too.', [
            n('The light grows behind them until it sits exactly between the two sisters, like a small star.'),
            n('Click.'),
            js((s) => { s.flags.photoStars = 3; s.flags.goodPhoto = true; s.flags.lightPhoto = true; }),
          ]),
        ),
      ]),
      opt('Zoom in on Haruka. She’ll like that.', [
        n('Click. A close-up of Haruka, glowing. Hikaru isn’t in it at all.'),
        H('happy', 'Finally, someone who knows my good side.'),
        add({ favor: 1 }),
        js((s) => { s.flags.photoStars = 0; }),
      ]),
    ),
    iff(f('lightPhoto'), [R('surprised', 'You waited for the light. How did you know to wait for the light?')]),
    iff(f('goodPhoto'), [
      R('happy', 'Oh. Oh, that’s perfect. You can see both of them properly. Even the bit of light between them.'),
      add({ trust: 1 }),
    ], [
      R('worried', 'It’s a bit blurry. Hikaru’s side came out all smudged. …That happens a lot with her, actually.'),
    ]),
    hide('rin'),
    n('Later, while Haruka argues with a stall owner about the last takoyaki, Hikaru pulls you to the far end of the platform.'),
    hide('haruka'),
    show('hikaru', 'soft', 'center'),
    K('soft', 'There. Wait for it.'),
    n('A train light appears far down the line, wobbling in the warm air.'),
    K('soft', 'Thank you for letting me be blue tonight, {name}.', rw('Thank you for making me pink tonight, {name}.', 'f_matsuri')),
    iff(has('f_matsuri'), [K('shy', '…It came out right. Good.')], [n('She frowns at her own words, like they tasted wrong.')]),
    hide('hikaru'),
    diary((s) => s.flags.festivalPerfect
      ? 'Styled the twins for the Sakura Matsuri. They matched one thing and looked like two different people. Rin took their photo.'
      : 'Styled the twins for the Sakura Matsuri. Haruka sulked. Hikaru said thank you anyway.'),
    hideText(),
    card('Sunday passes quietly.', { num: '日曜日', jp: '4月19日', en: 'Sunday' }),
    js(() => { DL.FX.applyLevel(DL.State.corruption()); DL.Audio.setMood('uneasy'); DL.Screens.hud(true); }),
  ]);

  /* ---------- you didn't ---------- */
  scene('sat_fail', [
    music('drone'),
    bg('sisters_room', { clean: true }),
    show('haruka', 'cold', 'left'),
    show('hikaru', 'worried', 'right'),
    iff(why('timeout'), [H('cold', 'Time’s up. You’re too *slow*, {name}.')]),
    iff(why('haruka'), [H('angry', '…You made me look *stupid*.'), H('cold', 'On purpose. You did that on purpose.')]),
    iff(why('hikaru'), [n('Hikaru stares into the mirror for a long time.'), K('sad', 'That isn’t me. That’s her.'), H('smile', 'Exactly. Isn’t it *perfect*?')]),
    fx('tear', { ms: 420 }),
    bg('sisters_room', { variant: 'g1' }),
    H('eerie', 'Fine. I’ll fix it myself. I always fix it.'),
    H('eerie', 'We’re a *set*, Hikaru. Sets *match*.'),
    K('cry', 'Haruka, stop. Please. I don’t want to—'),
    show('hikaru', 'cry', 'right', { glitch: true }),
    sfx('static'),
    wait(900),
    fx('flash', { color: '#ffb3cf', ms: 260 }),
    hide('hikaru'),
    show('haruka2', 'eerie', 'right', { flip: true }),
    n('The girl on the blue side of the room has pink hair now. Leopard print. The same smile.'),
    n('There are two of them. There were always two of them. There was only ever one.'),
    H2('eerie', 'See? I’ve always looked like this. Haven’t I, {name}?'),
    fx('tear', { ms: 520 }),
    bg('sisters_room', { variant: 'g2' }),
    fx('tint', { kind: 'erase' }),
    H('eerie', 'Now you.'),
    H2('eerie', 'Your turn, {name}. Hold still.'),
    hideText(),
    hideAll(),
    js(() => DL.Fitting.doll()),
    fx('fade', { color: '#000000', to: 1, ms: 500 }),
    ending('doll'),
  ]);
})();
