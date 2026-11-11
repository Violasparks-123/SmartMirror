/* CRIMSON VELVET — DIALOGUE SCRIPT
 * ---------------------------------------------------------------------
 * Node fields:  s speaker ('nar' | 'you' | character id)   e expression
 *   t text · next · choices [{t, style, go, if, fx, present}] · branch [{if, go}]
 *   fx effects on arrival · end: true
 * Effects: t {npc:+n} trust · cred · heat · set/unset [flags] · ev [items]
 *   j [journal] · loc [locations] · rel {npc:'strained'|'suspicious'|null}
 *   mem {npc:'what they remember'} · moral {axis,label} · route {npc:+1}
 *   v {story variable: +n | value} · toast
 * Lines quoted directly from your canon documents are marked canon: true.
 * --------------------------------------------------------------------- */
CV.DATA.scenes = {

/* ============================== PROLOGUE ============================== */
prologue_arrival: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Vesper City. Rain hammers the cab roof all the way up the hill. Through the streaming glass, the Conservatory rises out of the dark: gaslamps, iron gates, a hundred lit windows and one clock tower with a dark face.', fx: { ev: ['ev_invitation'] }, next: 'b' },
  b: { s: 'nar', t: 'A young woman waits under the portico with an umbrella she has not opened. Black blouse, lace collar, a burgundy ribbon in long dark hair. She looks at you the way an archivist looks at a document of uncertain provenance.', next: 'c' },
  c: { s: 'beatrix', e: 'neutral', t: 'You’re the restorer. Beatrix Vale. I’m the archive assistant, which means I’m also the tour, the welcome committee and the person who knows where the spare towels are.',
    choices: [
      { t: 'Thank you for waiting in the rain.', style: 'polite', go: 'd1', fx: { t: { beatrix: 3 } } },
      { t: 'Do you know why I was chosen for this?', style: 'investigate', go: 'd2' },
      { t: 'You’re not holding the umbrella open.', style: 'investigate', go: 'd3' }
    ] },
  d1: { s: 'beatrix', t: 'I wasn’t waiting. I was standing. They look similar from a distance.', next: 'e' },
  d2: { s: 'beatrix', e: 'serious', t: 'No. The Headmistress’s office sent the invitation. Nobody consulted the archive. That happens more often than you’d think.', next: 'e' },
  d3: { s: 'beatrix', t: 'It’s broken. I like the look of it, though. Most things here work the same way.', fx: { t: { beatrix: 2 } }, next: 'e' },
  e: { s: 'nar', t: 'She walks you through the foyer — honours boards, a portrait of a silver-haired man with a gold watch, the smell of polish and wet wool — naming rooms in short, precise sentences. The Grand Theatre. The Velvet Ballroom. The Music Wing.', next: 'f' },
  f: { s: 'you', t: 'And the archive? That’s where I’ll be working.', next: 'g' },
  g: { s: 'beatrix', e: 'nervous', t: 'The archive is… extensive. Some sections are restricted. I’ll show you tomorrow, in daylight. It’s easier to read the labels.',
    choices: [
      { t: 'Restricted by whom?', style: 'investigate', go: 'h1', fx: { t: { beatrix: -2 } } },
      { t: 'Tomorrow is fine.', style: 'polite', go: 'h2', fx: { t: { beatrix: 4 }, mem: { beatrix: 'You didn’t push her about the archive on the first night.' } } },
      { t: 'You don’t like talking about it.', style: 'compassion', go: 'h3' }
    ] },
  h1: { s: 'beatrix', t: 'By the Administration. Everything here is restricted by the Administration, eventually.', next: 'z' },
  h2: { s: 'beatrix', t: 'Good. You’ll find it’s an excellent policy. Most things look better in daylight. Except people.', next: 'z' },
  h3: { s: 'beatrix', e: 'serious', t: 'I don’t like talking about most things. It’s not personal. You’re in the guest quarters, top of the east stair. Breakfast is at seven. Nobody eats it.', next: 'z' },
  z: { s: 'nar', t: 'She leaves you at the foot of the stair and walks away very quickly for someone who is not in a hurry.', end: true }
}, onEnd: { j: ['j_p_beatrix'], loc: ['guest_room'], toast: 'Go up to the Guest Quarters.' } },

prologue_envelope: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Guest Quarters. The radiator knocks. Rain runs down the window in long threads. Some time after midnight, you hear the faint rasp of paper on floorboards.', next: 'b' },
  b: { s: 'nar', t: 'A small envelope, slipped under the door. Inside: a photograph of the Conservatory’s Grand Theatre, empty, shot from the back of the stalls. You turn it over.', fx: { ev: ['ev_envelope_photo'] }, next: 'c' },
  c: { s: 'nar', t: '“11:17. Don’t trust the official records.”', canon: true,
    choices: [
      { t: 'Open the door and look down the corridor.', style: 'investigate', go: 'd1' },
      { t: 'Check the time.', style: 'investigate', go: 'd2' },
      { t: 'Put the photograph with the invitation, and write it all down.', style: 'silent', go: 'd3' }
    ] },
  d1: { s: 'nar', t: 'The corridor is empty and dark. At the far end, a door clicks shut — or the building settles. In Vesper, it is hard to tell the difference.', next: 'z' },
  d2: { s: 'nar', t: 'Your watch says 12:41. Not 11:17. Whoever wrote it wasn’t telling you the time. They were telling you which time to look at.', next: 'z' },
  d3: { s: 'nar', t: 'You write: the invitation; the note; the photograph; the time. The handwriting on the photograph is not the same as the note in your invitation. Two people, then. Or one person being careful.', next: 'z' },
  z: { s: 'nar', t: 'You do not sleep much. In the morning, the archive is waiting.', end: true }
}, onEnd: { j: ['j_case_photo'] } },

/* ============================== CHAPTER ONE ============================== */
julian_intro: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Music Wing. At the end of the corridor, behind a frosted door, someone is playing the same eight bars of a nocturne over and over, each time slightly differently, as if arguing with them.', next: 'b' },
  b: { s: 'julian', e: 'happy', t: 'If you’re here to complain about the noise, the queue starts behind the Bursar. If you’re here to admire it, you may sit.',
    choices: [
      { t: 'I’ll sit.', style: 'polite', go: 'c1', fx: { t: { julian: 4 } } },
      { t: 'You keep changing the fourth bar.', style: 'investigate', go: 'c2', fx: { t: { julian: 6 }, mem: { julian: 'You noticed what he was doing with the fourth bar.' } } },
      { t: 'Neither. I’m the restorer working in the archive.', style: 'honest', go: 'c3' }
    ] },
  c1: { s: 'julian', t: 'Excellent. An audience. I assure you, I can play the piano without one. I simply prefer having one.', canon: true, next: 'd' },
  c2: { s: 'julian', e: 'surprised', t: 'You heard that? …How irritating. Nobody hears that. Sit down, then, before I decide to like you.', next: 'd' },
  c3: { s: 'julian', t: 'Ah. The mysterious restorer. The whole building has been speculating about you since breakfast, which nobody ate.', next: 'd' },
  d: { s: 'julian', t: 'Julian Cross. Pianist. You may have seen my name in gold leaf on the way in. I try not to mention it more than twice a day.',
    choices: [
      { t: 'What’s the Conservatory like, from the inside?', style: 'investigate', go: 'e1' },
      { t: 'Is it a burden, being in gold leaf?', style: 'compassion', go: 'e2' },
      { t: 'That’s twice.', style: 'polite', go: 'e3', fx: { t: { julian: 5 } } }
    ] },
  e1: { s: 'julian', e: 'happy', t: 'Home. Genuinely. It’s the most beautiful building in Vesper and everyone in it is trying to be the most beautiful thing in the building. I find that restful.', next: 'f' },
  e2: { s: 'julian', e: 'serious', t: '…What an odd question.', fx: { set: ['k_jul_flinch'] }, next: 'e2b' },
  e2b: { s: 'nar', t: 'He adjusts one cufflink, then the other, and smiles at you as if you had said something charming.', next: 'f' },
  e3: { s: 'julian', e: 'happy', t: 'Is it? Then I’ve met my quota. You’re going to be trouble. I approve.', next: 'f' },
  f: { s: 'julian', t: 'A word of advice, restorer. You’re either very brave or spectacularly unaware of how this place works. The archive is Beatrix’s kingdom. Don’t touch anything she hasn’t handed you.', canon: true, end: true }
}, onEnd: { j: ['j_p_julian'] } },

odette_intro: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Costume Room. Rails of velvet, a gramophone, and a young woman with auburn waves and a measuring tape round her neck, kneeling on the floor in a sea of pins, talking firmly to a mannequin.', next: 'b' },
  b: { s: 'odette', e: 'happy', t: '—and if you think you’re wearing that hem to the Gala, madam, you are sorely — oh! A person. A new person. Come in, come in, mind the pins, they’re feral.',
    choices: [
      { t: 'Were you talking to the mannequin?', style: 'polite', go: 'c1' },
      { t: 'I’m the restorer. Beatrix said you’d know everyone.', style: 'honest', go: 'c2' },
      { t: 'That’s a beautiful dress.', style: 'compassion', go: 'c3', fx: { t: { odette: 6 } } }
    ] },
  c1: { s: 'odette', t: 'Darling, I am not being dramatic. The mannequin is simply behaving dramatically. Odette Laurent. Costumes, gossip, emergency hemming.', next: 'd' },
  c2: { s: 'odette', e: 'surprised', t: 'Beatrix said something about me? Voluntarily? Out loud? I’m going to have to sit down. Odette Laurent. I do know everyone. It’s a curse.', fx: { t: { odette: 3 } }, next: 'd' },
  c3: { s: 'odette', e: 'happy', t: 'Isn’t it? Nobody notices the dress, they notice the girl in it, which is the point, but it’s nice to be caught out. Odette Laurent. You may stay.', next: 'd' },
  d: { s: 'nar', t: 'Without asking, she reaches up and straightens your collar.', next: 'e' },
  e: { s: 'odette', t: 'There. Now you look like someone who belongs here, which is a lie, but a flattering one. The Conservatory is a stage, darling. Everyone has a part. The trick is noticing who’s still in costume after the curtain comes down.',
    choices: [
      { t: 'And who is?', style: 'investigate', go: 'f1' },
      { t: 'What’s your part?', style: 'compassion', go: 'f2' },
      { t: 'I’ll keep that in mind.', style: 'polite', go: 'f3' }
    ] },
  f1: { s: 'odette', t: 'Everyone, obviously. Julian’s been in costume since he was nineteen. Beatrix sleeps in hers. The Headmistress’s is made of pearls. If this place had any more secrets, we’d need to start charging them rent.', canon: true, next: 'z' },
  f2: { s: 'odette', e: 'nervous', t: '…Comic relief, mostly. Someone has to be.', fx: { t: { odette: 4 }, set: ['k_ode_glimpse'] }, next: 'z' },
  f3: { s: 'odette', t: 'Do. And come back when you need someone to tell you who hates whom. Bring cake. Something with layers.', next: 'z' },
  z: { s: 'odette', t: 'Off you go. Mind the pins. They remember faces.', end: true }
}, onEnd: { j: ['j_p_odette'] } },

theo_intro: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Down the iron stairs to the Maintenance Room. A tall man in rolled sleeves is cleaning a spanner that is already clean. He doesn’t look up.', next: 'b' },
  b: { s: 'theo', e: 'neutral', t: 'If something’s broken, there’s a form. If nothing’s broken, there’s a door.',
    choices: [
      { t: 'Nothing’s broken. I’m the new restorer.', style: 'honest', go: 'c1' },
      { t: 'I’ll take the door. After I ask one thing.', style: 'investigate', go: 'c2' },
      { t: '(Lean against the doorframe and wait.)', style: 'silent', go: 'c3', fx: { t: { theo: 6 }, mem: { theo: 'You waited instead of filling the silence.' } } }
    ] },
  c1: { s: 'theo', t: 'Right. The archive project. Theo Mercer. Don’t touch the tools.', next: 'd' },
  c2: { s: 'theo', t: 'Everyone has one thing. Go on.', next: 'd' },
  c3: { s: 'nar', t: 'A long silence. He finishes with the spanner, hangs it on its hook, and finally looks at you. Green eyes. Very tired.', next: 'c3b' },
  c3b: { s: 'theo', t: 'Most people talk. Theo Mercer. What do you want?', next: 'd' },
  d: { s: 'you', t: 'What’s it like, working here?', next: 'e' },
  e: { s: 'theo', e: 'serious', t: 'This place ruined my life. They pay me on Fridays.',
    choices: [
      { t: 'Ruined it how?', style: 'investigate', go: 'f1', fx: { t: { theo: -3 } } },
      { t: 'Then why stay?', style: 'compassion', go: 'f2' },
      { t: 'That’s honest.', style: 'honest', go: 'f3', fx: { t: { theo: 4 } } }
    ] },
  f1: { s: 'theo', t: 'You can keep asking questions. Just don’t expect the answers to be pleasant.', canon: true, next: 'z' },
  f2: { s: 'theo', t: 'Because I want to know how it happened. You can’t find out from outside. …That’s all you get.', fx: { set: ['k_theo_hint'] }, next: 'z' },
  f3: { s: 'theo', t: 'Yeah. It’s about all I’ve got left that they didn’t take.', next: 'z' },
  z: { s: 'nar', t: 'He picks up a coin and rolls it across his knuckles, back and forth. The conversation is clearly over.', end: true }
}, onEnd: { j: ['j_p_theo'] } },

evelyn_intro: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Headmistress’s office. Porcelain cups, a desk on which every object sits at an exact right angle, and a woman with a silver-black bob and pearls who does not stand up.', next: 'b' },
  b: { s: 'evelyn', e: 'neutral', t: 'Our restorer. Welcome to Vesper. I trust Miss Vale has made you comfortable, insofar as Miss Vale makes anyone comfortable.',
    choices: [
      { t: 'Why was I chosen for this project?', style: 'investigate', go: 'c1' },
      { t: 'Thank you. It’s a remarkable building.', style: 'polite', go: 'c2', fx: { v: { evelyn_stance: 'cordial' } } },
      { t: 'Someone slipped a photograph under my door last night.', style: 'honest', go: 'c3' }
    ] },
  c1: { s: 'evelyn', e: 'serious', t: 'Your references were excellent. The archive is in a poor state. Do you require a more elaborate reason?', next: 'd' },
  c2: { s: 'evelyn', t: 'It is. It has survived a great deal. Buildings, like institutions, survive because people make sacrifices for them.', next: 'd' },
  c3: { s: 'nar', t: 'She pauses — a fraction too long — and adjusts one glove.', fx: { set: ['k_eve_glove'], heat: 5 }, next: 'c3b' },
  c3b: { s: 'evelyn', t: 'Students have an unfortunate fondness for theatre. I would not read too much into it.', next: 'd' },
  d: { s: 'evelyn', t: 'Your remit is the catalogue, the bindings and the damp. Not the history. There is a difference between curiosity and responsibility. I suggest you learn it.', canon: true,
    choices: [
      { t: 'Understood.', style: 'evasive', go: 'z1' },
      { t: 'Some would say history is the archive’s whole purpose.', style: 'confront', go: 'z2', fx: { heat: 5, v: { evelyn_stance: 'wary' } } }
    ] },
  z1: { s: 'evelyn', t: 'I am glad. Good day.', end: true },
  z2: { s: 'evelyn', e: 'serious', t: 'Some would. They do not run the Conservatory. Good day.', end: true }
}, onEnd: { j: ['j_p_evelyn'], set: ['met_evelyn'] } },

beatrix_celeste: { start: 'a', nodes: {
  a: { s: 'nar', t: 'You set the register on Beatrix’s desk, open at the scored-out line, with your pencil rubbing beside it. She does not look at the name. She looks at you.', next: 'b' },
  b: { s: 'beatrix', e: 'serious', t: 'You have a remarkable talent for finding things you’re not supposed to find.', canon: true,
    choices: [
      { t: 'Who was Celeste Wren?', style: 'investigate', go: 'c1' },
      { t: 'Someone tried very hard to make her disappear from this page.', style: 'investigate', go: 'c2' },
      { t: 'You knew her.', style: 'confront', go: 'c3', fx: { t: { beatrix: -6 }, mem: { beatrix: 'You told her she knew Celeste before she was ready to say it.' } } }
    ] },
  c1: { s: 'beatrix', t: 'A student. Before your time. Before most people’s.', next: 'd' },
  c2: { s: 'beatrix', t: 'Registers get corrected. Ink gets scored. It’s an archive. Nothing here is the way it was first written.', next: 'd' },
  c3: { s: 'beatrix', e: 'angry', t: 'I knew a great many people. I’m not avoiding the question. I’m considering whether answering it would be a mistake.', canon: true, next: 'd' },
  d: { s: 'nar', t: 'She rolls one of her silver rings around her finger, once, twice. Then she closes the register gently, as if the name might bruise.', next: 'e' },
  e: { s: 'beatrix', e: 'sad', t: 'Some people leave places. Some places simply decide to forget them.', canon: true, fx: { j: ['j_r_bea'], v: { celeste_truth: 1 } },
    choices: [
      { t: 'And which was she?', style: 'investigate', go: 'f1' },
      { t: 'I won’t push. Not today.', style: 'protect', go: 'f2', fx: { t: { beatrix: 8 }, mem: { beatrix: 'You let the subject of Celeste drop when she needed it to.' } } },
      { t: 'Her withdrawal file is right here. I’m going to read it.', style: 'honest', go: 'f3', fx: { cred: 3 } }
    ] },
  f1: { s: 'beatrix', e: 'serious', t: 'The official record says she left. The official record is very clear on the point. It has been clear for seven years.', next: 'z' },
  f2: { s: 'beatrix', t: '…Thank you. That’s rarer than you’d think.', next: 'z' },
  f3: { s: 'beatrix', t: 'It’s a public record. I can’t stop you. I’d only suggest you read it as carefully as someone else wrote it.', next: 'z' },
  z: { s: 'beatrix', t: 'Your tea’s gone cold. So has mine. That’s usually how I know a conversation’s over.', end: true }
} },

/* ============================== CHAPTER TWO ============================== */
julian_ranking: { start: 'a', nodes: {
  a: { s: 'nar', t: 'You lay the ranking sheet on the closed lid of Julian’s piano. He looks at it, then at your hand on his piano, then at you.', next: 'b' },
  b: { s: 'julian', e: 'angry', t: 'Remove that from my instrument, please. And then explain why you’re waving my scholarship at me like a parking fine.',
    choices: [
      { t: 'Your ranking was revised upward three days before the Gala.', style: 'investigate', go: 'c1' },
      { t: 'I’m sorry — your piano. I’m not here to accuse you.', style: 'compassion', go: 'c2', fx: { t: { julian: 6 } } },
      { t: 'Did you know you were bumped up over Celeste Wren?', style: 'confront', go: 'c3', fx: { t: { julian: -8 }, mem: { julian: 'You threw Celeste’s name at him like an accusation.' } } }
    ] },
  c1: { s: 'julian', e: 'happy', t: 'Rankings are revised all the time. Talent fluctuates. Perhaps mine was simply having a good week.', next: 'd' },
  c2: { s: 'julian', t: '…Well. Manners. That changes the tempo somewhat.', next: 'd' },
  c3: { s: 'julian', e: 'angry', t: 'Do you ever stop investigating? Or is that your idea of a personality?', canon: true, next: 'd' },
  d: { s: 'nar', t: 'He smiles. He is, unmistakably, annoyed. His fingers tap a rhythm on the lid — the fourth bar of the nocturne, faster and faster.', next: 'e' },
  e: { s: 'julian', t: 'I played very well that night. I play very well every night. Whatever anyone did to a piece of paper, I did not need it.',
    choices: [
      { t: 'I believe you can play. That isn’t what I’m asking.', style: 'honest', go: 'f1', fx: { t: { julian: 4 } } },
      { t: 'Then you won’t mind me looking further.', style: 'confront', go: 'f2', fx: { heat: 5 } },
      { t: 'Have you ever wondered?', style: 'compassion', go: 'f3' }
    ] },
  f1: { s: 'julian', e: 'serious', t: 'No. It isn’t, is it. …Good afternoon, restorer.', fx: { set: ['k_jul_suspected'] }, end: true },
  f2: { s: 'julian', t: 'Look wherever you like. Just don’t expect me to hold the lamp.', end: true },
  f3: { s: 'julian', e: 'sad', t: 'Every single day. …Forget I said that. I’m told I’m very charming when I’m not being honest.', fx: { set: ['k_jul_suspected'], t: { julian: 5 } }, end: true }
}, onEnd: { j: ['j_p_julian2'] } },

odette_corridor: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Odette is pinning a hem with great concentration and humming. When you mention the Crimson Gala seven years ago, the humming stops.', next: 'b' },
  b: { s: 'odette', e: 'happy', t: 'The Gala! Darling, the Gala was a triumph. The gowns. The flowers. Somebody’s uncle fell into the punch. I could tell you stories.',
    choices: [
      { t: 'Tell me about the blackout.', style: 'investigate', go: 'c1' },
      { t: 'You’re telling me the funny version.', style: 'compassion', go: 'c2', fx: { t: { odette: 6 }, mem: { odette: 'You noticed she was performing.' } } },
      { t: 'I’ve seen your programme scrapbook.', style: 'evidence', go: 'c3', if: { ev: ['ev_programme'] } }
    ] },
  c1: { s: 'odette', t: 'Oh, the blackout. Pitch dark, everybody screaming, very atmospheric. Very Gothic. Ten out of ten, would scream again.', next: 'd' },
  c2: { s: 'odette', e: 'nervous', t: '…It’s the only version I’ve got that I can tell standing up.', next: 'd' },
  c3: { s: 'odette', e: 'surprised', t: 'You read my scrapbook? …That’s either a terrible invasion of privacy or the most romantic thing anyone’s ever done to me.', fx: { t: { odette: 3 } }, next: 'd' },
  d: { s: 'odette', e: 'serious', t: 'All right. One true thing. The old backstage corridor — the one to the archive — is always locked during performances. Always. That night it was open. I remember because I felt the draught on my neck before the lights went.',
    fx: { set: ['k_ode_corridor'] },
    choices: [
      { t: 'Who opened it?', style: 'investigate', go: 'e1' },
      { t: 'Thank you for telling me.', style: 'compassion', go: 'e2', fx: { t: { odette: 5 } } },
      { t: 'Why didn’t you tell anyone at the time?', style: 'confront', go: 'e3', fx: { t: { odette: -4 } } }
    ] },
  e1: { s: 'odette', t: 'That, darling, is the second true thing. And I only do one per hem.', next: 'z' },
  e2: { s: 'odette', t: 'Don’t thank me. Thanking me makes it real.', next: 'z' },
  e3: { s: 'odette', e: 'sad', t: 'Because they’d already found someone to blame by breakfast. And it was easier to let it be a funny story.', next: 'z' },
  z: { s: 'nar', t: 'She goes back to her pins. She does not hum again.', end: true }
} },

theo_report: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Theo is at the workbench. Before you have finished saying the word “blackout” he has put down his screwdriver.', next: 'b' },
  b: { s: 'theo', e: 'angry', t: 'Right. Here we go. The technician who blew the theatre. Read it in the Courier, did you?',
    choices: [
      { t: 'I read it. I don’t believe it.', style: 'honest', go: 'c1', fx: { t: { theo: 8 } } },
      { t: 'I want to hear what happened from you.', style: 'compassion', go: 'c2', fx: { t: { theo: 5 } } },
      { t: 'Did you cause it?', style: 'confront', go: 'c3', fx: { t: { theo: -8 }, mem: { theo: 'You asked him straight out whether he caused the blackout.' } } }
    ] },
  c1: { s: 'theo', t: 'Why not? Everyone else did.', next: 'd' },
  c2: { s: 'theo', t: 'Nobody’s asked that. Seven years. Nobody.', next: 'd' },
  c3: { s: 'theo', e: 'angry', t: 'I’m not angry because you don’t trust me. I’m angry because you think I haven’t earned the right to be believed.', canon: true, next: 'd' },
  d: { s: 'nar', t: 'He looks at you for a long moment. Then he opens a drawer, takes out a folder held shut with a bootlace, and puts it on the bench between you.', next: 'e' },
  e: { s: 'theo', t: 'Official report says theatre circuit, technician error. That’s retyped. I kept the carbon. Fault started on the archive feed. Junction box forced. Fuse bridged with wire. That isn’t an accident. That’s a person.', fx: { ev: ['ev_maintenance_report'], set: ['k_theo_report', 'k_theo_tamper'], v: { celeste_truth: 1 } },
    choices: [
      { t: 'Why keep it all this time?', style: 'investigate', go: 'f1' },
      { t: 'You could have gone to the Courier with this.', style: 'investigate', go: 'f2' },
      { t: 'Thank you for trusting me with it.', style: 'compassion', go: 'f3', fx: { t: { theo: 4 } } }
    ] },
  f1: { s: 'theo', t: 'Because one day someone was going to ask the right question. Didn’t think it’d take this long.', next: 'z' },
  f2: { s: 'theo', t: 'A sacked technician with a bit of carbon paper versus Adrian Voss. You do the arithmetic.', fx: { set: ['k_adrian_named'] }, next: 'z' },
  f3: { s: 'theo', e: 'nervous', t: 'Don’t. …Just don’t lose it.', next: 'z' },
  z: { s: 'theo', t: 'That door isn’t locked, by the way. It’s pretending to be. Shut it properly on your way out.', canon: true, end: true }
}, onEnd: { j: ['j_th_theo', 'j_th_theo2'] } },

odette_key: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Late. The Costume Room is dark except for one lamp. Odette is sitting on the cutting table with a button tin in her lap, looking into the broken compact mirror.', next: 'b' },
  b: { s: 'odette', e: 'sad', t: 'You’ve been to see Theo. And the Music Wing. You have that look. The look of someone who’s found two halves of something.',
    choices: [
      { t: 'The blackout and the records are connected. I think you know more.', style: 'honest', go: 'c' },
      { t: 'Are you all right?', style: 'compassion', go: 'c0', fx: { t: { odette: 6 } } }
    ] },
  c0: { s: 'odette', e: 'nervous', t: 'No. Isn’t it marvellous? I’ve been all right for seven years and it was exhausting.', next: 'c' },
  c: { s: 'odette', t: '', branch: [{ if: { tmin: { odette: 32 } }, go: 'give' }, { go: 'notyet' }] },
  notyet: { s: 'odette', e: 'nervous', t: 'I… no. Not tonight. Come back when I’ve decided whether you’re the hero or the villain of this one. I always need two acts to tell.', fx: { t: { odette: 6 } }, next: 'nyz' },
  nyz: { s: 'nar', t: 'She closes the tin. Something inside it clinks like keys. (Odette needs to trust you more. Spend time with her, and come back.)', end: true, unsetDone: true },
  give: { s: 'nar', t: 'She opens the tin. Under a drift of old buttons: an iron key on a ring, with a smaller steel key beside it.', next: 'g2' },
  g2: { s: 'odette', e: 'serious', t: 'The maintenance corridor behind the Grand Theatre. It goes through to the Forgotten Wing. I took it from the backstage office that night. I’ve kept it ever since. Don’t ask me why yet.', fx: { ev: ['ev_odette_key'], set: ['k_ode_key'] },
    choices: [
      { t: 'I won’t tell anyone where it came from.', style: 'protect', go: 'h1', fx: { set: ['promise_odette'], t: { odette: 8 }, mem: { odette: 'You promised not to say where the key came from.' }, moral: { axis: 'protect', label: 'Promised to keep Odette’s key a secret' } } },
      { t: 'Come with me.', style: 'compassion', go: 'h2' },
      { t: 'You’ve been sitting on this for seven years?', style: 'confront', go: 'h3', fx: { t: { odette: -6 } } }
    ] },
  h1: { s: 'odette', t: 'Thank you. I’d rather be the girl who lost a key than the girl who kept one.', end: true },
  h2: { s: 'odette', e: 'nervous', t: 'Into the Forgotten Wing? In the dark? Darling, I’ve seen how that scene ends. No. But I’ll be here when you come back. Tell me everything. Or nothing. Whichever is kinder.', end: true },
  h3: { s: 'odette', e: 'angry', t: 'Yes! Seven years! In a button tin! Do you want a medal for noticing? …Sorry. Go. Just go.', end: true }
} },

/* ============================== CHAPTER THREE ============================== */
beatrix_wing: { start: 'a', nodes: {
  a: { s: 'nar', t: 'You are still kneeling by the open cabinet, the signature A. VOSS under your thumb, when you hear footsteps in the corridor. Quick. Precise. Furious.', next: 'b' },
  b: { s: 'beatrix', e: 'angry', t: 'You came into the wing. Without telling me. Do you have any idea — any idea — what you’re standing in?',
    choices: [
      { t: 'I’m standing in the evidence that Adrian Voss rigged the rankings.', style: 'honest', go: 'c1', fx: { cred: 3 } },
      { t: 'I should have told you. I’m sorry.', style: 'compassion', go: 'c2', fx: { t: { beatrix: 8 }, mem: { beatrix: 'You apologised for going into the wing without her.' } } },
      { t: 'You knew this was here.', style: 'confront', go: 'c3', fx: { t: { beatrix: -6 } } }
    ] },
  c1: { s: 'beatrix', t: 'I know exactly what you’re standing in. That’s the problem.', next: 'd' },
  c2: { s: 'beatrix', t: 'Don’t. Apologies are things people say instead of being careful.', next: 'd' },
  c3: { s: 'beatrix', e: 'angry', t: 'I knew something was here. I didn’t want to know what. There’s a difference. It’s the only one I have left.', next: 'd' },
  d: { s: 'nar', t: 'She looks past you at the wall clock, stopped at 11:17, and something in her face gives way.', next: 'e' },
  e: { s: 'beatrix', e: 'sad', t: 'I knew her. Celeste. She was my — she was my closest friend. There. That’s the sentence I haven’t said in seven years. It isn’t as heavy as I expected. It’s heavier.', fx: { set: ['k_bea_knew'], j: ['j_p_beatrix2'], v: { celeste_truth: 1 } },
    choices: [
      { t: 'What happened to her, Beatrix?', style: 'investigate', go: 'f1' },
      { t: 'Thank you for telling me.', style: 'compassion', go: 'f2', fx: { t: { beatrix: 6 } } },
      { t: 'Is she alive?', style: 'confront', go: 'f3' }
    ] },
  f1: { s: 'beatrix', e: 'serious', t: 'She’s gone. That’s what happened. And if you keep pulling at this, you’ll find out exactly how gone people can be made in this building.', next: 'g' },
  f2: { s: 'beatrix', t: 'Don’t thank me either. Just… don’t make me regret it.', next: 'g' },
  f3: { s: 'beatrix', e: 'angry', t: 'She’s gone. Celeste is gone. Write that down in your tiny notebook and underline it.', next: 'g' },
  g: { s: 'nar', t: 'She takes the scholarship copies from your hands, squares their edges against the cabinet — out of pure habit — and gives them back.', next: 'h' },
  h: { s: 'nar', t: 'When you leave the wing, there is a folded note pinned to the corridor door that was not there when you came in.', fx: { ev: ['ev_anon_wing'], j: ['j_q_who_writes', 'j_q_where'] }, next: 'i' },
  i: { s: 'nar', t: '“You are looking in the right place. You are asking the wrong people.”', canon: true, end: true }
} },

/* ============================== CHAPTER FOUR ============================== */
beatrix_route: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Rooftop Conservatory. Rain loud on the glass. Beatrix sits among dead orchids with a cup of tea that went cold some time ago, holding it anyway.', next: 'b' },
  b: { s: 'beatrix', e: 'neutral', t: 'You found me. Odette tells everyone I come up here. She thinks it’s romantic. It’s just the only room in the building without a filing cabinet.',
    choices: [
      { t: 'Can I sit?', style: 'polite', go: 'c1', fx: { t: { beatrix: 4 } } },
      { t: 'I need to know what happened that night.', style: 'investigate', go: 'c2' },
      { t: '(Sit beside her without saying anything.)', style: 'silent', go: 'c3', fx: { t: { beatrix: 7 }, mem: { beatrix: 'You sat with her on the roof without asking anything.' } } }
    ] },
  c1: { s: 'beatrix', t: 'You’re going to anyway. People always ask so it feels like permission.', next: 'd' },
  c2: { s: 'beatrix', e: 'serious', t: 'I know you do. You’ve needed to know since the photograph under your door.', next: 'd' },
  c3: { s: 'nar', t: 'You sit. The rain does the talking for a while. Eventually she hums something — a melody from an old Conservatory performance — and stops halfway, as if she’s caught herself.', next: 'd' },
  d: { s: 'beatrix', t: '', branch: [{ if: { tmin: { beatrix: 40 } }, go: 'open' }, { go: 'closed' }] },
  closed: { s: 'beatrix', e: 'serious', t: 'Not yet. I’m sorry. I’ve spent seven years being very good at this, and you’ve only had a few weeks of being good at me.', next: 'closed2' },
  closed2: { s: 'nar', t: 'She goes back to her cold tea. (Beatrix needs to trust you more before she’ll open up.)', end: true, unsetDone: true },
  open: { s: 'beatrix', e: 'sad', t: 'I helped her. That night. I helped Celeste get out of the building. There. Now you know the worst thing I’ve ever done, and the best.', fx: { set: ['k_bea_helped'], j: ['j_th_runaway'], route: { beatrix: 1 }, v: { celeste_truth: 1 } },
    choices: [
      { t: 'Why?', style: 'investigate', go: 'e1' },
      { t: 'That wasn’t the worst thing. That was loyalty.', style: 'compassion', go: 'e2', fx: { t: { beatrix: 6 } } },
      { t: 'You’ve let everyone believe she abandoned this place.', style: 'confront', go: 'e3', fx: { t: { beatrix: -5 } } }
    ] },
  e1: { s: 'beatrix', e: 'serious', t: 'No. Not that. Not yet. The “why” isn’t mine to give away.', next: 'f' },
  e2: { s: 'beatrix', t: 'Was it? Loyalty is just silence with good manners. I’ve had seven years to work that out.', next: 'f' },
  e3: { s: 'beatrix', e: 'angry', t: 'Yes. Because the alternative was letting them find her.', next: 'f' },
  f: { s: 'beatrix', t: '', branch: [{ if: { tmin: { beatrix: 55 } }, go: 'photo' }, { go: 'end' }] },
  photo: { s: 'nar', t: 'She takes an old envelope from her coat pocket — she keeps envelopes everywhere — and gives you half a photograph without looking at it.', next: 'photo2' },
  photo2: { s: 'beatrix', e: 'sad', t: 'She tore it in two the night before the Gala. Said we’d put it back together when it was over. I don’t know where her half went.', fx: { ev: ['ev_photo_half_b'], set: ['k_bea_photo'], t: { beatrix: 3 } }, next: 'end' },
  end: { s: 'beatrix', t: 'Go. And if you’re going to keep pulling the thread, pull it carefully. It’s attached to people.', end: true }
} },

julian_route: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Midnight. Julian is playing in the dark Music Wing — not the nocturne, something of his own that stops halfway. There is a letter on the music stand where the score should be.', next: 'b' },
  b: { s: 'julian', e: 'sad', t: 'Restorer. You keep turning up at the exact moment I’d rather nobody did. It’s almost a talent.',
    choices: [
      { t: 'What’s the letter?', style: 'investigate', go: 'c1' },
      { t: 'You don’t sleep much either.', style: 'compassion', go: 'c2', fx: { t: { julian: 5 } } }
    ] },
  c1: { s: 'julian', t: 'Straight to it. Of course.', next: 'd' },
  c2: { s: 'julian', t: 'I play when I can’t sleep. Lately I play quite a lot.', next: 'd' },
  d: { s: 'julian', e: 'serious', t: 'I went looking. Through my own things. I’ve kept every letter the Conservatory ever sent me, because I am that sort of insufferable. Read it. Out loud, if you like. I already know how it ends.', fx: { ev: ['ev_julian_letter'], set: ['k_jul_letter'], j: ['j_p_julian2'] }, next: 'e' },
  e: { s: 'julian', e: 'sad', t: '“Following a revision of the final ranking.” I was given a position that should have been someone else’s. Celeste’s. I knew. Not the details. But I knew, and I let it be mine because my family had already sold half a house to put me here.',
    choices: [
      { t: 'You’re genuinely gifted, Julian. Both things can be true.', style: 'compassion', go: 'f1', fx: { t: { julian: 10 }, route: { julian: 1 }, mem: { julian: 'You told him he could be talented and still have benefited from something unfair.' } } },
      { t: 'You should make this public. Now.', style: 'honest', go: 'f2' },
      { t: 'You could have said something seven years ago.', style: 'confront', go: 'f3', fx: { t: { julian: -8 }, rel: { julian: 'strained' }, mem: { julian: 'You told him he should have spoken up seven years ago.' } } }
    ] },
  f1: { s: 'julian', e: 'surprised', t: '…That is a deeply annoying thing to say to a man who has built his entire personality on one of them.', next: 'g' },
  f2: { s: 'julian', e: 'serious', t: 'Public. A confession from the golden boy. The Courier would weep with joy.', next: 'g' },
  f3: { s: 'julian', e: 'angry', t: 'Yes, thank you. I am aware. I have been aware every day at about four in the morning.', next: 'g' },
  g: { s: 'julian', t: 'So. What do I do with it? Burn it? Frame it? Read it aloud at the next Gala between the Chopin and the canapés?',
    choices: [
      { t: 'Confess publicly. Tell the Courier yourself.', style: 'honest', go: 'h1', fx: { set: ['julian_public'], route: { julian: 1 }, t: { beatrix: -8 }, v: { adrian_suspicion: 10 }, mem: { beatrix: 'You pushed Julian to confess publicly. She thinks it puts Celeste in the spotlight.' }, moral: { axis: 'truth', label: 'Urged Julian to confess publicly' } } },
      { t: 'Give it to me. Let it be part of the whole truth, when the time is right.', style: 'protect', go: 'h2', fx: { set: ['julian_trusts_you'], route: { julian: 1 }, t: { julian: 6 }, moral: { axis: 'protect', label: 'Kept Julian’s letter for the right moment' } } },
      { t: 'Keep it. It’s yours to decide.', style: 'compassion', go: 'h3', fx: { set: ['julian_keeps'] } }
    ] },
  h1: { s: 'julian', e: 'nervous', t: 'Very well. I’ll do it properly — dinner-jacket, good light, no tremor in the voice. If I’m going to destroy my reputation I’m at least going to look marvellous doing it.', end: true },
  h2: { s: 'julian', t: 'Take it before I change my mind. I’m told that’s one of my best qualities.', end: true },
  h3: { s: 'julian', e: 'sad', t: 'Mine to decide. How novel. Nobody’s ever let me decide anything that mattered.', end: true }
} },

odette_route: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Odette has cleared the cutting table. On it: a scrapbook, a broken compact mirror, and a strip of burgundy velvet ribbon, laid out like evidence in a play.', next: 'b' },
  b: { s: 'odette', e: 'serious', t: 'I remember the dress. I remember the music. I remember who was standing beside the curtain. I remember everything.', canon: true,
    choices: [
      { t: 'Who was beside the curtain?', style: 'investigate', go: 'c1' },
      { t: 'Take your time.', style: 'compassion', go: 'c2', fx: { t: { odette: 6 } } }
    ] },
  c1: { s: 'odette', t: 'Patience, darling. Every confession needs an overture.', next: 'd' },
  c2: { s: 'odette', e: 'sad', t: 'That’s the trouble. I’ve had seven years of time. It’s the one thing I’ve got far too much of.', next: 'd' },
  d: { s: 'odette', e: 'serious', t: 'At twelve minutes past eleven, I saw Adrian Voss go into the archive corridor. Not hurrying. He never hurried. He checked his watch at the door. Five minutes later everything went black.', fx: { set: ['k_ode_saw'], v: { celeste_truth: 1 } }, next: 'e' },
  e: { s: 'odette', t: 'When the lights came back, I went to look — I don’t know why, I’m nosy — and this was on the corridor floor. Celeste’s ribbon. Torn. And the corridor key was hanging in the backstage office, still swinging. So I took it. I was afraid of what someone would use it for next.', fx: { ev: ['ev_fabric'], j: ['j_p_odette2'], route: { odette: 1 } },
    choices: [
      { t: 'You’ve been carrying this alone for seven years.', style: 'compassion', go: 'f1', fx: { t: { odette: 8 }, mem: { odette: 'You saw how heavy it had been for her.' } } },
      { t: 'You’re a witness. You could testify.', style: 'honest', go: 'f2' },
      { t: 'You let Theo take the blame.', style: 'confront', go: 'f3', fx: { t: { odette: -8 }, rel: { odette: 'strained' } } }
    ] },
  f1: { s: 'nar', t: 'Odette opens her mouth to make a joke. Nothing comes out. She becomes, for the first time since you met her, completely quiet.', next: 'f1b' },
  f1b: { s: 'odette', e: 'sad', t: '…Yes. I have. It turns out the truth doesn’t become less painful just because you hide it behind a joke. Who knew. Everyone. Everyone knew.', fx: { set: ['k_ode_arc'] }, end: true },
  f2: { s: 'odette', e: 'nervous', t: 'Testify. In a courtroom. With the lighting they have in courtrooms. …Yes. If it comes to that. Ask me again when it does, and I’ll say yes again.', fx: { set: ['odette_witness'] }, end: true },
  f3: { s: 'odette', e: 'angry', t: 'I know. I know I did. Don’t you think I know? Get out. Please. Come back tomorrow. Not tonight.', end: true }
} },

theo_route: { start: 'a', nodes: {
  a: { s: 'nar', t: 'Café Étoile, Midtown. Theo won’t talk on Conservatory grounds any more. He has a coffee in front of him and a second one already ordered.', next: 'b' },
  b: { s: 'theo', e: 'neutral', t: 'Right. You want the rest of it. Here’s the rest of it.', next: 'c' },
  c: { s: 'theo', e: 'serious', t: 'Someone opened the archive junction box and bridged the fuse. Then somebody — maybe the same somebody — put enough load on it to blow. The archive feed shares the emergency relay with the theatre. I told the Director that two days before. In writing. So when it went, everything went.', fx: { set: ['k_theo_tamper'] }, next: 'd' },
  d: { s: 'theo', t: 'Seven years I’ve been trying to prove it. Every time I get close, a door gets locked or a file gets moved. You start to think you’re mad.',
    choices: [
      { t: 'You’re not mad. I can prove it with you.', style: 'protect', go: 'e1', fx: { t: { theo: 8 }, route: { theo: 1 }, mem: { theo: 'You told him he wasn’t mad, and offered to prove it with him.' } } },
      { t: 'Why come back to work for them?', style: 'investigate', go: 'e2' },
      { t: 'Odette saw who went into the archive.', style: 'honest', go: 'e3', if: { f: ['k_ode_saw'] }, fx: { t: { theo: 4 } } }
    ] },
  e1: { s: 'theo', e: 'nervous', t: '…You don’t have to say that.', next: 'f' },
  e2: { s: 'theo', t: 'Can’t find out from the outside. And I wanted them to look at me every day and remember.', next: 'f' },
  e3: { s: 'theo', e: 'surprised', t: 'Odette? She — seven years and she — …Right. Right. That’s fine. She was scared. Everyone was scared. Just not of the same things.', fx: { set: ['theo_knows_odette'] }, next: 'f' },
  f: { s: 'theo', t: 'There’s an editor at the Courier who still feels bad about that article. I could take the carbon to her tomorrow. Clear my name. Today, if you said so.',
    choices: [
      { t: 'Do it. You’ve waited long enough.', style: 'honest', go: 'g1', fx: { set: ['theo_published'], route: { theo: 1 }, t: { theo: 6 }, v: { adrian_suspicion: 20 }, heat: 10, moral: { axis: 'justice', label: 'Helped Theo expose the electrical records early' } } },
      { t: 'Wait. If you go now, he’ll know we’re close. Let’s clear your name with the whole truth.', style: 'protect', go: 'g2', fx: { set: ['theo_waits'], route: { theo: 1 }, t: { theo: 3 }, moral: { axis: 'protect', label: 'Asked Theo to wait for the whole truth' } } },
      { t: 'It’s your name. Your choice.', style: 'compassion', go: 'g3', fx: { t: { theo: 5 }, set: ['theo_waits'] } }
    ] },
  g1: { s: 'theo', e: 'happy', t: 'Right. …Right. I’ll go first thing. If they come after me, at least this time they’ll have to read something first.', end: true },
  g2: { s: 'theo', t: 'Seven years and one more week. Fine. You’re asking me to trust you. I’m not good at that. I’m going to try anyway, so don’t make me look stupid.', end: true },
  g3: { s: 'theo', e: 'surprised', t: 'Nobody’s said that to me since I was nineteen. …I’ll wait. For now. Because you asked me instead of telling me.', end: true }
} },

/* ============================== CHAPTER FIVE ============================== */
reconstruction: { start: 'a', repeatable: true, nodes: {
  a: { s: 'nar', t: 'The Grand Theatre, empty, at night. You lay everything out across the front of the stage: logs, plans, letters, photographs. The clock above you says 11:17, as it always does. Tonight you are going to make it explain itself.', fx: { unset: ['recon_q1', 'recon_q2', 'recon_q3', 'recon_q4'] }, next: 'q1' },
  q1: { s: 'nar', t: 'First question. The blackout began somewhere other than the theatre. Where — and what proves it?',
    choices: [{ t: 'Show the evidence…', style: 'evidence', present: { ev_maintenance_report: 'q1y', ev_lighting_plan: 'q1y', _default: 'q1n' } }] },
  q1y: { s: 'nar', t: 'The archive feed. Junction forced, fuse bridged — and the archive circuit shared the theatre’s emergency relay, as Theo warned in writing two days before. One fault in the archive would black out the whole theatre.', fx: { set: ['recon_q1'] }, next: 'q2' },
  q1n: { s: 'nar', t: 'It doesn’t prove where the fault began. You put it back on the stage.', fx: { cred: -2 }, next: 'q2' },
  q2: { s: 'nar', t: 'Second question. Who was in the archive corridor in the minutes before 11:17?',
    choices: [{ t: 'Show the evidence…', style: 'evidence', present: { ev_security_log: 'q2y', ev_fabric: 'q2y', ev_photo_1117: 'q2y', _default: 'q2n' } }] },
  q2y: { s: 'nar', t: 'Celeste and Beatrix at 11:09. Adrian Voss at 11:12 — seen by the porter, seen by Odette, checking his watch at the door. Celeste’s ribbon, torn on the corridor floor.', fx: { set: ['recon_q2'] }, next: 'q3' },
  q2n: { s: 'nar', t: 'That doesn’t place anyone in the corridor. You need something that puts a person there.', fx: { cred: -2 }, next: 'q3' },
  q3: { s: 'nar', t: 'Third question. Was Celeste’s withdrawal real?',
    choices: [{ t: 'Show the evidence…', style: 'evidence', present: { ev_withdrawal: 'q3c', ev_library_card: 'q3y', ev_ranking_sheet: 'q3y', _default: 'q3n' } }] },
  q3c: { s: 'nar', t: '', branch: [{ if: { conn: ['c_signature'] }, go: 'q3y' }, { go: 'q3n' }] },
  q3y: { s: 'nar', t: 'No. Her signature was copied by someone who didn’t know how she wrote. And she had already been struck from first place three days before the Gala. The withdrawal was written before she “withdrew”.', fx: { set: ['recon_q3'] }, next: 'q4' },
  q3n: { s: 'nar', t: 'On its own, that only tells you what the Conservatory said. Not whether it was true.', fx: { cred: -2 }, next: 'q4' },
  q4: { s: 'nar', t: 'Last question. How did she leave a locked building in the dark?',
    choices: [
      { t: 'Through the underground passage — with Beatrix’s help.', style: 'investigate', go: 'q4y', if: { f: ['k_bea_helped'] } },
      { t: 'Through the theatre, in the crowd.', style: 'investigate', go: 'q4n' },
      { t: 'Someone carried her out. She was taken.', style: 'investigate', go: 'q4n' }
    ] },
  q4y: { s: 'nar', t: 'Beneath the archive there is an old service passage. Beatrix knew it. In nine minutes of darkness, two girls ran down it, and only one came back.', fx: { set: ['recon_q4'] }, next: 'tally' },
  q4n: { s: 'nar', t: 'Nothing you’ve found supports that. Somebody, somewhere, knows how she left.', next: 'tally' },
  tally: { s: 'nar', t: '', branch: [
    { if: { count: { n: 4, f: ['recon_q1', 'recon_q2', 'recon_q3', 'recon_q4'] } }, go: 'win' },
    { go: 'lose' }] },
  lose: { s: 'nar', t: 'The pieces don’t quite meet. Something is missing — a piece of evidence, or a person who hasn’t told you their part yet. You gather everything up. You can try again.', end: true },
  win: { s: 'nar', t: 'It fits. Seven years ago, Adrian Voss confronted Celeste in the archive about the evidence she had copied. In the struggle, the forced junction failed. At 11:17 the theatre went dark.', next: 'win2' },
  win2: { s: 'nar', t: 'Celeste escaped through the passage. Beatrix helped her. Theo was blamed. Odette saw part of it. Julian benefited without knowing. Evelyn helped bury it. The official withdrawal was fabricated.', fx: { set: ['recon_success', 'k_cel_found'], j: ['j_d_recon', 'j_t_blackout', 'j_r_pieces'], v: { truth_revealed: true, celeste_truth: 1 }, loc: ['underground_passage'], cred: 10 }, next: 'win3' },
  win3: { s: 'nar', t: 'Only one question is left, and it is the one you have been avoiding. Where is Celeste?', end: true }
} },

/* ============================== CHAPTER SIX ============================== */
beatrix_letter: { start: 'a', nodes: {
  a: { s: 'nar', t: 'You hold the envelope out across Beatrix’s desk. Burgundy wax. “For B. Only when it’s safe.” She doesn’t take it. She knows the hand before she has finished reading the first letter.', next: 'b' },
  b: { s: 'beatrix', e: 'surprised', t: 'Where did you — that was — I put that there. Months ago. I couldn’t open it and I couldn’t throw it away, so I buried it under my own desk like a — like a dog with a bone.', fx: { set: ['k_bea_letter'] }, next: 'c' },
  c: { s: 'beatrix', e: 'nervous', t: 'It’s from Celeste. Of course it is. I’ve never opened the last part. I was afraid of what it would say. That she was dead. Or that she wasn’t, and I’d have to decide what to do about it.',
    choices: [
      { t: 'We can open it together.', style: 'compassion', go: 'd1', fx: { set: ['k_letter_together'], t: { beatrix: 8 }, route: { beatrix: 1 }, mem: { beatrix: 'You offered to open Celeste’s letter with her, not for her.' } } },
      { t: 'I’ll leave you alone with it.', style: 'protect', go: 'd2', fx: { t: { beatrix: 5 } } },
      { t: 'You need to open it. Now. People’s futures depend on it.', style: 'confront', go: 'd3', fx: { t: { beatrix: -8 }, rel: { beatrix: 'strained' }, mem: { beatrix: 'You pressured her into opening the letter.' } } }
    ] },
  d1: { s: 'beatrix', t: 'Together. …Yes. All right. Hold the lamp. My hands are — just hold the lamp.', next: 'open' },
  d2: { s: 'nar', t: 'You step away to the shelves. Behind you, after a very long time, you hear wax crack. Then nothing. Then Beatrix says your name, very quietly, and holds the letter out to you.', next: 'open' },
  d3: { s: 'beatrix', e: 'angry', t: 'Don’t — fine. Fine. Since everyone’s future is so urgent.', next: 'open' },
  open: { s: 'nar', t: '“I’m alive. I have a different name now, outside Vesper… I didn’t come back because he would have burned the evidence and then come for everyone who helped me. Starting with you… If anyone ever asks the right questions, tell them: find the original ledger. Not the copy.”', fx: { set: ['k_letter_opened', 'k_cel_alive', 'k_cel_anon'], j: ['j_d_alive', 'j_q_original', 'j_a_who_writes'], v: { celeste_truth: 1 } }, next: 'e' },
  e: { s: 'beatrix', e: 'sad', t: 'She’s alive. She’s been alive this whole time. Watching. Writing to the Headmistress. Writing to you. And I’ve been down here guarding a grave that was never dug.',
    choices: [
      { t: 'You kept her safe, Beatrix. That’s why she’s alive.', style: 'compassion', go: 'f1', fx: { t: { beatrix: 6 } } },
      { t: 'Then we find the original ledger. For her.', style: 'honest', go: 'f2', fx: { cred: 3 } },
      { t: 'You could have opened this months ago.', style: 'confront', go: 'f3', fx: { t: { beatrix: -6 } } }
    ] },
  f1: { s: 'beatrix', t: 'I kept her silent. That isn’t the same as safe. I think I only just learned the difference.', fx: { set: ['k_bea_arc'] }, next: 'z' },
  f2: { s: 'beatrix', e: 'serious', t: 'Not the copy. Then everything in the Forgotten Wing is the copy. Adrian has the original — or knows where it is. The Headmistress has been looking. I’ve watched her look.', next: 'z' },
  f3: { s: 'beatrix', e: 'angry', t: 'Yes. I could have. Add it to the list. It’s a long list.', next: 'z' },
  z: { s: 'beatrix', t: 'Go and see the Headmistress. Ask her about the ledger. Watch her gloves.', end: true }
} },

/* ============================== CHAPTER SEVEN ============================== */
evelyn_confront: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Headmistress’s office, after dark. Evelyn Ashcroft is pouring tea into fine porcelain. She does not ask you to sit. She pours a second cup anyway.', next: 'b' },
  b: { s: 'evelyn', e: 'serious', t: 'You have been very thorough. I had hoped you would be a restorer. I see you are something less convenient.',
    choices: [
      { t: 'You countersigned Celeste Wren’s forged withdrawal.', style: 'confront', go: 'c1', fx: { set: ['k_eve_knew'], heat: 5 } },
      { t: 'I think you’ve wanted someone to ask for seven years.', style: 'compassion', go: 'c2' },
      { t: 'I’m here to make you an offer, not an accusation.', style: 'manipulate', go: 'c3', fx: { v: { evelyn_stance: 'negotiating' } } }
    ] },
  c1: { s: 'nar', t: 'She sets down the teapot. She adjusts one glove, then the other.', next: 'd' },
  c2: { s: 'evelyn', e: 'sad', t: '…You presume a great deal.', next: 'd' },
  c3: { s: 'evelyn', t: 'How refreshing. Everyone else who comes in here with that expression wants a confession.', next: 'd' },
  d: { s: 'evelyn', e: 'serious', t: 'Yes. I knew about the rankings. I did not design the scheme. But when it broke, I helped bury it. I countersigned a lie and let a young technician carry it out of the building in a cardboard box. I did it because if the truth had come out, the Conservatory would have collapsed, and four hundred students would have lost everything.', fx: { set: ['k_eve_knew'], ev: ['ev_evelyn_letters'], j: ['j_c_evelyn'] }, next: 'e' },
  e: { s: 'evelyn', t: 'You may dislike my decisions. That does not mean you understand the circumstances.', canon: true,
    choices: [
      { t: 'Celeste’s circumstances were that she disappeared.', style: 'confront', go: 'f1', fx: { v: { evelyn_stance: 'hostile' } } },
      { t: 'And now? You’ve been looking for the ledger yourself.', style: 'investigate', go: 'f2' },
      { t: 'Odette Laurent kept the corridor key all these years. She saw Adrian go in.', style: 'honest', go: 'f3', if: { f: ['k_ode_saw'] },
        fx: { set: ['revealed_odette'], t: { odette: -15 }, rel: { odette: 'suspicious' }, mem: { odette: 'You told the Headmistress about her key and what she saw.' }, cred: 5, moral: { axis: 'truth', label: 'Revealed Odette’s secret to Evelyn' } } }
    ] },
  f1: { s: 'evelyn', e: 'angry', t: 'I am aware of that. I have been aware of it every morning for seven years. Do not mistake my composure for an absence of conscience.', next: 'g' },
  f2: { s: 'evelyn', t: 'You have been reading my correspondence. Yes. I have.', fx: { set: ['k_eve_search', 'k_eve_letters'] }, next: 'g' },
  f3: { s: 'evelyn', e: 'surprised', t: '…Miss Laurent. Then there was a witness all along, and she was hemming dresses three corridors away.', next: 'g' },
  g: { s: 'evelyn', e: 'serious', t: 'Listen carefully. Adrian kept the original ledger. Not out of sentiment — as insurance. He has been quietly reminding donors and governors what is in it for seven years. That is why nobody has ever reopened this. Not because of me. Because of him.', fx: { set: ['k_adr_insurance'] }, next: 'h' },
  h: { s: 'evelyn', t: 'He has retired. He has not left. He holds court at a club in Midtown called the Velvet Note, at a corner table, most nights after ten. If you go, he will already know you are coming.', fx: { set: ['k_adrian_location'], loc: ['velvet_note'], toast: 'New location: The Velvet Note (Vesper City map)' },
    choices: [
      { t: 'Help me finish this. Publicly.', style: 'honest', go: 'i1' },
      { t: 'I’ll make sure the whole city knows what you did.', style: 'confront', go: 'i2', fx: { v: { evelyn_stance: 'hostile', adrian_suspicion: 15 }, heat: 10 } },
      { t: 'You’re not forgiven. But you could still help.', style: 'honest', go: 'i3' }
    ] },
  i1: { s: 'evelyn', t: '', branch: [{ if: { cred: 50 }, go: 'ally' }, { go: 'refuse' }] },
  ally: { s: 'evelyn', e: 'serious', t: 'I have spent twenty years keeping this institution standing. Do not mistake that for an inability to see its cracks. …Very well. When it comes, I will not deny it.', canon: true, fx: { v: { evelyn_stance: 'ally' }, set: ['evelyn_ally'] }, end: true },
  refuse: { s: 'evelyn', t: 'You have accusations. You do not yet have proof enough to bring the building down on everyone in it. Come back when you do.', fx: { v: { evelyn_stance: 'wary' } }, end: true },
  i2: { s: 'evelyn', e: 'angry', t: 'Then you will do it without me. And Adrian will hear of it before you reach the bottom of the hill. I would not be able to stop that if I tried.', end: true },
  i3: { s: 'evelyn', e: 'sad', t: 'No. I am not. I should not like to be, cheaply. …I will not obstruct you. That is the most I can honestly promise.', fx: { v: { evelyn_stance: 'negotiating' }, set: ['evelyn_neutral'] }, end: true }
} },

adrian_meeting: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Velvet Note. Red velvet, a piano nobody plays before eleven. At the corner table, a silver-haired man in an immaculate suit closes a gold pocket watch and smiles as if you are exactly on time.', next: 'b' },
  b: { s: 'adrian', e: 'happy', t: 'Our restorer. Please, sit. I’ve ordered tea — I find uncomfortable conversations are improved by something warm to hold. Adrian Voss. You know that, of course. You’ve been very diligent.', fx: { set: ['k_adrian_named', 'met_adrian'], j: ['j_p_adrian2'] }, next: 'c' },
  c: { s: 'adrian', t: 'People often confuse the truth with the version of events they find most satisfying. So let us be precise. What is it you think you know?', canon: true,
    choices: [
      { t: 'Show him something…', style: 'evidence', present: { ev_scholarship_copies: 'r1y', ev_julian_letter: 'r1y', ev_ranking_sheet: 'r1y', _default: 'r1n' } },
      { t: 'You rigged the scholarship rankings for your donors.', style: 'confront', go: 'r1w' }
    ] },
  r1y: { s: 'adrian', e: 'neutral', t: 'My signature. How nostalgic. Patrons have always taken an interest in the students they fund. I merely formalised the interest. Every great institution does.', fx: { cred: 4, set: ['adr_r1'] }, next: 'd' },
  r1n: { s: 'adrian', e: 'happy', t: 'That? My dear restorer. You will have to do considerably better than that in front of anyone who matters.', fx: { cred: -5, v: { adrian_suspicion: 5 } }, next: 'd' },
  r1w: { s: 'adrian', e: 'happy', t: 'Rigged. Such a cheap word. Do you have anything to support it, or simply an adjective?', fx: { cred: -3 }, next: 'd' },
  d: { s: 'adrian', t: 'And the unfortunate evening? I gather you’ve been listening to a disgruntled electrician.',
    choices: [
      { t: 'Show him something…', style: 'evidence', present: { ev_security_log: 'r2y', ev_lighting_plan: 'r2y', ev_maintenance_report: 'r2y', _default: 'r2n' } },
      { t: 'Theo Mercer didn’t cause the blackout. You were in the archive.', style: 'confront', go: 'r2w', if: { f: ['recon_success'] } }
    ] },
  r2y: { s: 'adrian', e: 'serious', t: '…The porter’s log. I had wondered where that page went. You’re right that I went to the archive. I went to recover property that had been taken from my office by a very gifted, very foolish girl.', fx: { cred: 5, set: ['adr_r2'] }, next: 'e' },
  r2w: { s: 'adrian', t: 'Was I? You say that very confidently for someone who was not there.', fx: { cred: 2 }, next: 'e' },
  r2n: { s: 'adrian', e: 'happy', t: 'Charming. Irrelevant, but charming.', fx: { cred: -5, v: { adrian_suspicion: 5 } }, next: 'e' },
  e: { s: 'adrian', e: 'neutral', t: 'Let me tell you what you have not considered. If the truth had emerged seven years ago, the Conservatory would have collapsed. Hundreds of students — innocent ones, talented ones — would have lost their futures. I did not build this institution to watch it collapse because of one unfortunate evening.', canon: true, next: 'f' },
  f: { s: 'adrian', t: 'You are young. You believe every secret deserves to be exposed. Experience tends to make one more selective.', canon: true, fx: { j: ['j_r_deal'] }, next: 'g' },
  g: { s: 'adrian', e: 'serious', t: 'So, an offer. Destroy what you have gathered. In return, the affected scholarships will be quietly restored, the Conservatory will survive, and Miss Wren — wherever she is — will never be troubled again. Nobody else need be hurt. That is the arrangement.',
    choices: [
      { t: 'Accept the arrangement.', style: 'evasive', go: 'h1', fx: { set: ['adrian_deal'], v: { adrian_suspicion: -20 }, moral: { axis: 'compromise', label: 'Accepted Adrian’s arrangement' } } },
      { t: 'Refuse. The truth comes out, all of it.', style: 'honest', go: 'h2', fx: { set: ['adrian_refused'], v: { adrian_suspicion: 20 }, moral: { axis: 'truth', label: 'Refused Adrian’s deal to his face' } } },
      { t: 'Pretend to accept.', style: 'manipulate', go: 'h3' }
    ] },
  h1: { s: 'adrian', e: 'happy', t: 'Sensible. I knew you would be. I’ll be in touch about the practicalities. Do finish your tea.', end: true },
  h2: { s: 'adrian', e: 'neutral', t: 'How very brave. Brave people are so often surprised by what bravery costs. Good evening.', end: true },
  h3: { s: 'adrian', t: '', branch: [{ if: { cred: 55 }, go: 'h3y' }, { go: 'h3n' }] },
  h3y: { s: 'adrian', e: 'happy', t: 'Sensible. I knew you would be.', fx: { set: ['adrian_deal', 'adrian_pretend'], v: { adrian_suspicion: 5 }, moral: { axis: 'deceit', label: 'Pretended to accept Adrian’s deal' } }, next: 'h3y2' },
  h3y2: { s: 'nar', t: 'He believes you. Or he lets you believe he does. With Adrian Voss, you suspect the two have always been the same thing.', end: true },
  h3n: { s: 'adrian', e: 'happy', t: 'Oh, my dear. You smile like someone who has rehearsed it in a mirror. Never mind. We shall both pretend. It’s a very old tradition at Vesper.', fx: { set: ['adrian_saw_through'], v: { adrian_suspicion: 25 } }, end: true }
} },

/* ============================== CHAPTER EIGHT ============================== */
gala_message: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Crimson Gala. Seven years to the night. The Velvet Ballroom glitters: lilies, champagne, pearls, patrons. Julian plays. Odette fixes someone’s collar. Theo stands by a door. Evelyn gives a speech about the institution’s extraordinary history and does not once look at you.', next: 'b' },
  b: { s: 'nar', t: 'At 11:05 a waiter presses a folded card into your hand without stopping.', fx: { ev: ['ev_anon_gala'] }, next: 'c' },
  c: { s: 'nar', t: '“11:17. The theatre. Come alone.”', canon: true,
    choices: [
      { t: 'Go alone, as asked.', style: 'protect', go: 'd1', fx: { set: ['went_alone'] } },
      { t: 'Bring Beatrix.', style: 'compassion', go: 'd2', if: { f: ['k_letter_opened'] }, fx: { set: ['brought_beatrix'] } },
      { t: 'Tell Evelyn where you’re going.', style: 'honest', go: 'd3', fx: { set: ['told_evelyn_gala'] } }
    ] },
  d1: { s: 'nar', t: 'You slip out of the Ballroom while the patrons applaud something. Nobody notices you leave. In a building like this, that is a skill.', end: true },
  d2: { s: 'nar', t: 'You find Beatrix by the windows and show her the card. She reads it twice. Then she puts down her glass, very carefully, as if it might break, and comes with you without a word.', end: true },
  d3: { s: 'nar', t: 'Evelyn reads the card, adjusts her gloves, and says nothing. But as you leave the Ballroom, you see her cross the room toward a silver-haired man by the door, who checks his gold pocket watch.', fx: { v: { adrian_suspicion: 30 } }, end: true }
} },

celeste_theatre: { start: 'a', nodes: {
  a: { s: 'nar', t: 'The Grand Theatre is dark. Six hundred empty seats. Above the stage, the clock says 11:17, as it has for seven years. Then a single lamp comes on in the wings, and a voice speaks out of the dark.', next: 'b' },
  b: { s: 'celeste', e: 'neutral', t: 'You came. I wasn’t sure you would. People usually read the first line of a note and decide the rest is someone else’s problem.', fx: { set: ['k_cel_met', 'k_celeste_named', 'k_cel_found'] }, next: 'c' },
  c: { s: 'nar', t: 'She steps into the light. Chestnut hair, a brown cardigan, a burgundy ribbon. Older than the girl in the photographs; the same determination in her face.', next: 'c2' },
  c2: { s: 'celeste', t: 'Celeste Wren. Though I haven’t been, for a long time.', next: 'br' },
  br: { s: 'nar', t: '', branch: [{ if: { f: ['brought_beatrix'] }, go: 'bea1' }, { go: 'd' }] },
  bea1: { s: 'celeste', e: 'surprised', t: 'B.', next: 'bea2' },
  bea2: { s: 'nar', t: 'Beatrix doesn’t move. Then she takes a sealed envelope out of her coat, its wax cracked.', next: 'bea3' },
  bea3: { s: 'celeste', e: 'sad', t: 'You kept the letter?', canon: true, next: 'bea4' },
  bea4: { s: 'beatrix', e: 'sad', t: 'Of course.', canon: true, next: 'bea5' },
  bea5: { s: 'celeste', t: 'You didn’t have to.', canon: true, next: 'bea6' },
  bea6: { s: 'beatrix', t: 'I know.', canon: true, fx: { t: { celeste: 10, beatrix: 5 }, set: ['reunion'] }, next: 'd' },
  d: { s: 'celeste', e: 'serious', t: 'I didn’t leave because I stopped caring. I left because staying would have made everything worse. Please don’t make my silence into a story about bravery. I was frightened. I was very frightened.', canon: true,
    choices: [
      { t: 'You’ve been sending the notes.', style: 'investigate', go: 'e1' },
      { t: 'You don’t have to be brave. You’re here.', style: 'compassion', go: 'e2', fx: { t: { celeste: 8 } } },
      { t: 'You left everyone else to carry it.', style: 'confront', go: 'e3', fx: { t: { celeste: -6 } } }
    ] },
  e1: { s: 'celeste', t: 'To you. To Evelyn. I needed someone who wasn’t from here to start asking. Everyone from here had already learned not to.', next: 'f' },
  e2: { s: 'celeste', e: 'happy', t: '…Thank you. Nobody has let me be anything other than a symbol in seven years. Even me.', next: 'f' },
  e3: { s: 'celeste', e: 'sad', t: 'Yes. I did. I have to live with that. So does everyone I left. You cannot repair something by pretending it never broke.', canon: true, next: 'f' },
  f: { s: 'celeste', t: 'You have the copies. Adrian has his duplicate. But the original — I hid it before I ran. It’s been above your head every time you came in here.', next: 'g' },
  g: { s: 'nar', t: 'She looks up. The clock. 11:17. Celeste climbs to the proscenium ladder, opens the gilded case, reaches into the stopped mechanism and draws out a red-bound book wrapped in oilcloth.', next: 'g2' },
  g2: { s: 'celeste', t: 'I stopped it at 11:17 myself. To mark the moment this place lost control of its own story.', fx: { ev: ['ev_original_ledger'], set: ['k_ledger_found'], v: { original_ledger_found: true, celeste_truth: 1 }, j: ['j_d_ledger'] }, next: 'g3' },
  g3: { s: 'nar', t: 'Donors. Altered rankings. The cover-up, in Adrian’s hand. And at the back, a list of students affected by the scheme. Forty-three names. It did not simply steal money. It changed people’s futures.', next: 'threat' },
  threat: { s: 'nar', t: '', branch: [{ if: { any: [{ v: { adrian_suspicion: 80 } }, { f: ['told_evelyn_gala'] }] }, go: 'adr1' }, { go: 'choose' }] },
  adr1: { s: 'nar', t: 'A soft click: a gold pocket watch closing in the dark. Adrian Voss steps out of the stalls with two men from the Velvet Note behind him.', next: 'adr2' },
  adr2: { s: 'adrian', e: 'neutral', t: 'Celeste Wren. You have grown up. And you have brought my property back to the scene of the crime. How thoughtful.',
    choices: [
      { t: 'Read the first page aloud to him — his own handwriting.', style: 'confront', go: 'adr3' },
      { t: 'Put yourself between him and Celeste.', style: 'protect', go: 'adr3', fx: { t: { celeste: 6 } } }
    ] },
  adr3: { s: 'nar', t: '', branch: [{ if: { cred: 60, conn: ['c_adrian_hand'] } , go: 'adrHold' }, { go: 'adrTake' }] },
  adrHold: { s: 'adrian', e: 'angry', t: '…You are surprisingly well prepared. Very well. Enjoy your evening. I suspect it will be the last good one this building has.', fx: { set: ['adrian_held_off'] }, next: 'choose' },
  adrTake: { s: 'nar', t: 'There are three of them, and you are holding the only thing they want. The ledger is taken from your hands. Adrian drops it into a fire bucket by the wings, adds a match, and watches it burn as calmly as if he were reading it.', fx: { set: ['ledger_destroyed'], unset: ['k_ledger_found'], v: { original_ledger_found: false } }, next: 'choose' },
  choose: { s: 'celeste', e: 'serious', t: 'So. Now you have the whole truth. Or what’s left of it. What are you going to do with it?', fx: { j: ['j_r_end'] },
    choices: [
      { t: 'Release everything. The ledger, the letters — and Celeste’s name restored.', style: 'honest', go: 'x', fx: { set: ['final_truth'] } },
      { t: 'Release enough to stop Adrian. Keep Celeste’s identity out of it.', style: 'protect', go: 'x', if: { f: ['k_ledger_found'] }, fx: { set: ['final_protect'] } },
      { t: 'Honour the arrangement with Adrian. Settle it privately.', style: 'evasive', go: 'x', if: { f: ['adrian_deal'] }, fx: { set: ['final_arrangement'] } },
      { t: 'Help Celeste publish the whole story herself, under her own name.', style: 'compassion', go: 'x', if: { f: ['k_second_copy', 'k_letter_opened'], any: [{ tmin: { celeste: 30 } }, { f: ['reunion'] }] }, fx: { set: ['final_secret'] } },
      { t: 'Go back to the Ballroom and denounce Evelyn Ashcroft from the stage, now.', style: 'confront', go: 'x', fx: { set: ['final_rash'] } }
    ] },
  x: { s: 'nar', t: 'Above you, for the first time in seven years, the clock begins to tick.', fx: { set: ['ending_reached'] }, end: true }
}, onEnd: { ending: true } }
};
