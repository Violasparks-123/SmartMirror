/* REI AND SEI, APART. Loaded after extras.js (needs the darkroom). */
(() => {
  const { scene, bg, show, hide, n, REI, SEI, me, opt, choice, add, flag, iff, go, call, js, sfx, music, fx, diary, ending, f } = DL.DSL;
  const notD7 = (s) => s.day !== 7;
  /* ================= REI AND SEI, APART =================
     Sei isn't like his sister. He pretends, because she's all he has left.
     - Darkroom (day 4+): Sei, alone, hiding under the red light. Believe him -> seiAlly (and he tells you the rule).
       Or threaten to tell Rei -> seiBetrayed.
     - Walking home (day 5+): Rei, alone, at the vending machine. She knows.
     - Darkroom (end of the week): the door opens onto the long table. Sei gives you the blue ribbon.
     - Final choice: "Sei. Say her name." -> new ending: Separate Plates. */
  const redT = fx('tint', { kind: 'red' });
  const restore = js((s) => { DL.FX.tint(s.day === 7 || (s.day === 8 && !s.flags.hikaruBack) ? 'pink' : null); });
  const insertAt = (pool, ev, at) => { const k = at != null ? at : pool.findIndex((e) => e.repeat); pool.splice(k < 0 ? pool.length : k, 0, ev); };

  scene('sei_alone', [
    bg('darkroom'), fx('tint', { kind: 'safelight' }), music('uneasy'),
    n('The darkroom door is unlocked. Rin isn’t here. Someone else is.'),
    show('sei', 'worried', 'center'),
    n('Sei Mikage is sitting on the floor under the red bulb, knees up, hands clasped together so hard they shake.'),
    SEI('worried', 'Shut the door. Please. She can’t see in here. The red light… she doesn’t like it.'),
    SEI('worried', 'I’m not like her. I need someone to know that. I hold the chopsticks, and I smile when she smiles, and I don’t— I never—'),
    n('He swallows. There’s sweat running down the side of his face.'),
    SEI('worried', 'She was nice once. Before this town forgot our parents. She said if nobody remembered them, nobody would remember what she did either.'),
    SEI('worried', 'She was right. Nobody ever remembers.'),
    choice('What do you say?',
      opt('“I’ll help you get away from her.”', [
        SEI('worried', '…You can’t. Nobody can. But—'),
        SEI('worried', 'She can’t take anyone who’s remembered. That’s the rule. So remember everyone. Remember the blue Amane girl.'),
        SEI('worried', 'And… remember me. If that’s okay.'),
        flag('seiAlly'), flag('mikageRule'), add({ trust: 1 }),
        diary('Sei Mikage was hiding in the darkroom. He told me the rule: his sister can’t take anyone who’s remembered. He asked me to remember him too.'),
      ]),
      opt('“Why are you telling me?”', [
        SEI('worried', 'Because on the stairs you looked at me. Not at her. Nobody does that.'),
        SEI('worried', 'She can’t take anyone who’s remembered. Please. Don’t forget the blue one. Don’t forget anyone.'),
        flag('seiAlly'), flag('mikageRule'),
        diary('Sei Mikage was hiding in the darkroom. He says Rei can’t take anyone who’s remembered.'),
      ]),
      opt('“I’m telling Rei you said this.”', [
        n('All the colour drains out of his face.'),
        SEI('worried', '…Okay. Okay. That’s fair. That’s what I’d do too.'),
        flag('seiBetrayed'), add({ susp: 1, trust: -1 }),
        diary('Found Sei Mikage hiding in the darkroom. I told him I’d tell his sister.'),
      ]),
    ),
    hide('sei'), restore,
  ]);
  insertAt(DL.Events.darkroom, { id: 'sei_alone', cond: (s) => notD7(s) && s.day >= 4 && s.day <= 6 && s.flags.mikageMet, scene: [call('sei_alone')] }, 1);

  scene('rei_alone', [
    bg('street'), music('uneasy'),
    n('The vending machine at the corner is humming. Rei Mikage is standing in front of it, alone, not buying anything.'),
    show('rei', 'smile', 'center'),
    iff(f('seiBetrayed'), [
      REI('happy', 'Thank you for telling me about Sei. He’ll be so much quieter now.'),
      REI('smile', 'Brothers are like buns, {name}. Soft in the middle.'),
    ], [iff(f('seiAlly'), [
      REI('smile', 'You’ve been talking to my brother.'),
      REI('smile', 'He’s soft. He always was. Do you know what happens to soft things?'),
      REI('eerie', 'They go first.'),
      choice(
        opt('“Leave him alone.”', [REI('happy', 'He’s mine. I can’t leave myself alone.'), add({ susp: 1 })]),
        opt('“He’s not like you.”', [REI('cold', 'No. He’s hungrier. He just hasn’t noticed yet.')]),
        opt('Walk past without a word.', [n('As you pass, she says your name very softly. Then Hikaru’s. Then Sei’s. Like she’s reading a menu.')]),
      ),
    ], [
      REI('smile', 'Sei went home early. It’s just us. Isn’t that cosy?'),
      REI('eerie', 'I can hear your heartbeat from here. It’s so loud. Like it wants to be found.'),
    ])]),
    sfx('static'), fx('flicker', { variant: 'g1', ms: 180 }),
    hide('rei'),
    n('The vending machine light flickers. When it comes back on, she’s gone. There’s a can of hot corn soup in the slot. It’s already open.'),
    flag('metReiAlone'),
    diary('Rei Mikage was waiting for me at the vending machine. Alone. Sei wasn’t with her.'),
  ]);
  { const pool = DL.Events.street; const k = pool.findIndex((e) => e.id === 'mik_walk');
    insertAt(pool, { id: 'rei_alone', cond: (s) => notD7(s) && s.day >= 5 && s.flags.mikageMet && !!s.seen.mik_walk, scene: [call('rei_alone')] }, k + 1); }

  scene('sei_last', [
    bg('feast'), music('drone'),
    n('The darkroom door doesn’t open into the darkroom. It opens into the corridor with the long table.'),
    n('Halfway down, under a flickering light, someone is laying the last place setting. Very slowly. Very neatly.'),
    show('sei', 'worried', 'center'),
    SEI('worried', '{name}. You remembered me.'),
    SEI('worried', 'She made me set this one. It’s for you. I’ve been setting it as slowly as I can.'),
    n('He takes something out of his blazer pocket and presses it into your hand. A pale blue hair ribbon.'),
    SEI('worried', 'I took it off the table while she wasn’t looking. If nobody has it, it doesn’t count. So now someone has it.'),
    SEI('worried', 'Tomorrow. In front of everyone. When it’s time, call me. I’ll say it out loud. Her name. All of their names.'),
    choice(
      opt('“I’ll call you. I promise.”', [SEI('worried', '…Okay.'), n('For the first time, it almost looks like a real smile.')]),
      opt('“Come with me now.”', [SEI('worried', 'If I leave the table before it’s set, she’ll know.'), SEI('worried', 'Tomorrow.')]),
    ),
    hide('sei'),
    flag('seiRibbon'),
    diary('Sei gave me Hikaru’s blue ribbon from the long table. Tomorrow, he’ll say his sister’s name out loud.'),
  ]);
  insertAt(DL.Events.darkroom, { id: 'sei_last', cond: (s) => s.flags.seiAlly && !s.flags.mikageDeal && (s.day === 8 || (s.day === 7 && !!s.seen.drk_7)), scene: [call('sei_last')] }, 0);

  scene('end_apart', [
    me('Sei. Now.'),
    show('sei', 'worried', 'center'),
    n('The classroom door slides open. Sei Mikage is standing there alone, shaking all over, holding a pale blue ribbon in both hands.'),
    SEI('worried', 'My sister is Mikage Rei. She eats the people this town forgets.'),
    n('Nobody laughs. Nobody moves.'),
    SEI('worried', 'So remember them. Amane Hikaru. She sits by the window. She likes music and she hates being mean. Remember her. Say it.'),
    me('Amane Hikaru.'),
    n('Then Rin. Then the class rep. One by one, the whole of 2-B starts saying names. Names you’ve never heard. Names of people who used to sit in the empty seats.'),
    hide('sei'),
    bg('feast'), music('drone'),
    n('Somewhere at the end of a corridor that shouldn’t exist, a long table is suddenly clean. Every plate. Every fork.'),
    show('rei', 'cold', 'center'),
    REI('cold', 'Sei. Come back. Nobody else will remember you.'),
    hide('rei'),
    show('sei', 'worried', 'center'),
    SEI('worried', '{name} will.'),
    me('I will.'),
    hide('sei'),
    n('Rei Mikage sits down at the very end of the table. Alone. She waits for somebody to remember her name.'),
    n('Nobody does.'),
    ending('apart'),
  ]);
  { const choiceCmd = DL.Engine.scenes.d9_choice[0];
    const k = choiceCmd.opts.findIndex((o) => o.body && o.body[0] && o.body[0].id === 'end_feast');
    choiceCmd.opts.splice(k < 0 ? choiceCmd.opts.length : k, 0, opt('“Sei. Say her name. Say all of them.”', [go('end_apart')], {
      if: (s) => !!s.flags.seiAlly && !s.flags.mikageDeal,
      lock: (s) => (s.flags.seiRibbon ? null : 'Sei is waiting for you somewhere, setting a table very slowly. (The darkroom, at the end of the week.)'),
    })); }
})();
