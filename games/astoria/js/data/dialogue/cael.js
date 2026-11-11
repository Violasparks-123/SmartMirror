// Cael — The Royal Guard. Reserved, protective, disciplined, loyal; increasingly
// worried about how deep Astoria is digging.

export const CAEL = {
  intro: 'cael_intro',
  introCond: { quest: { mq2: 'started' } },
  notYet: 'A guard captain glances at you, then back at his duty roster. "Move along, please, miss."',
  smalltalk: ['cael_small_1', 'cael_small_2', 'cael_small_3'],

  story: [
    { cond: { quest: { mq8: 'active' }, flag: 'forgot_cael', notFlag: ['restored_cael', 'letgo_cael'] }, convo: 'ch8_stranger_cael', label: 'They don\'t know you' },
    { cond: { flag: ['forgot_cael', 'letgo_cael'] }, convo: 'stranger_again', label: 'A stranger now' },
    { cond: { quest: { nq_cael: 'active' }, obj: { 'nq_cael.token': true, 'nq_cael.return': false } }, convo: 'cael_token', label: 'Show him the guard token' },
  ],

  topics: [
    { id: 'archive', label: 'Ask about the restricted archive', cond: { quest: { mq3: 'active' }, obj: { 'mq3.access': false }, notItem: 'archive_pass' }, convo: 'cael_archive' },
    { id: 'guards', label: 'Ask about the missing guards', cond: {}, convo: 'cael_guards' },
    { id: 'liesel', label: 'Ask about the name "Liesel"', cond: { quest: { hq_liesel: 'active' } }, convo: 'cael_liesel' },
    { id: 'worry', label: '"Why do you worry about me?"', req: { rel: { cael: { affinity: 15 } } }, convo: 'cael_worry', once: true },
    { id: 'seraphine', label: 'Ask what he knows about Seraphine', cond: { met: 'seraphine' }, convo: 'cael_seraphine', once: true },
  ],

  secrets: [
    { id: 'dream', label: 'The Dream He Never Told', cond: { rel: { cael: { affinity: 30, trust: 20 } } }, convo: 'cael_secret' },
  ],

  show: {
    old_photograph: 'cael_show_photo',
    guard_token: 'cael_token',
    forgotten_coin: 'cael_liesel',
    default: 'cael_show_default',
  },

  gifts: {
    love: '"Moonstone. This is— this is a good whetstone." He turns it over with real pleasure. "I\'ll think of you every time I sharpen my sword. That sounded better in my head."',
    like: '"For me? Thank you. Truly."',
    neutral: '"That\'s kind of you." He tucks it carefully into his belt pouch.',
    dislike: '"It\'s… fragrant." His eyes water slightly. "Thank you anyway."',
    again: '"You\'ve already given me something today. You don\'t have to keep— I mean. Thank you."',
  },

  convos: {
    cael_intro: {
      bg: 'royal',
      nodes: {
        start: {
          l: [
            ['cael', '"Halt." A guard captain steps into your path, hand raised — then falters as he sees your face. "You\'re the one from the cathedral."'],
            ['cael', '"Captain Cael, Royal Guard. Half the district is talking about a silver-haired girl who walks out of a building that\'s been sealed for a century. You should be more careful."'],
          ],
          c: [
            { t: '"Careful of what?"', path: 'suspicious', fx: { rel: { cael: { trust: 3 } } }, l: [['cael', '"Of being noticed. Things that get noticed in Elaria tend to get forgotten soon after." He lowers his voice. "People too."']], to: 'mid' },
            { t: '"Thank you. I didn\'t know anyone was watching."', path: 'compassionate', fx: { rel: { cael: { affinity: 4 } } }, l: [['cael', 'His stern face softens. "Somebody should be. Watching out, I mean. Not watching. You know what I mean."']], to: 'mid' },
            { t: '"Is that a threat, Captain?"', path: 'aggressive', fx: { rel: { cael: { suspicion: 4, rivalry: 3 } } }, l: [['cael', '"It\'s a warning. I don\'t make threats; they\'re inefficient."']], to: 'mid' },
            { t: '"I\'m sure I don\'t know what you mean."', path: 'secretive', fx: { rel: { cael: { suspicion: 3 } } }, l: [['cael', '"Of course not." He doesn\'t believe you. He also doesn\'t press. You suspect he\'s filing it away.']], to: 'mid' },
          ],
        },
        mid: {
          l: [
            ['cael', '"Three people have gone missing from my own roster this year. Not dead. Missing. And no one remembers they existed — except me, a little, sometimes."'],
            ['cael', '"If you\'re digging into the old records, the answers are in the library\'s restricted archive. You won\'t get in without a pass." He hesitates. "And I don\'t give those out to people I don\'t know."'],
          ],
          fx: { met: 'cael', obj: 'mq2.cael', mystery: 'myst_guards', history: { cael: 'Stopped you in the street to warn you.' }, log: 'Cael: "Things that get noticed in Elaria tend to get forgotten soon after. People too."' },
          end: true,
        },
      },
    },

    cael_small_1: { nodes: { start: { l: [['cael', '"Quiet watch today. I hate quiet watches. It\'s when I notice the gaps."']], c: [
      { t: '"What gaps?"', path: 'suspicious', l: [['cael', '"Doorways people walk around without knowing why. Chairs nobody sits in. Like the city\'s keeping room for someone who isn\'t there."']], fx: { rel: { cael: { trust: 1 } } } },
      { t: '"Then let me keep you company."', path: 'compassionate', l: [['cael', '"I\'m on duty." Pause. "...For a minute, then."']], fx: { rel: { cael: { affinity: 2 } } } },
      { t: '"Your name is on their list, Cael. I heard it at the masquerade."', req: { flag: 'heard_next_name' }, hint: 'Something overheard at the masquerade', cond: { notFlag: 'cael_warned' }, l: [['n', 'Cael doesn\'t laugh. That is the worst part.'], ['cael', '"Line nine was blank for a week before I noticed," he says quietly. "If I start to go — if you start to forget me — you tell me. Promise."'], ['a', '"I promise."'], ['cael', '"Then I\'ll be harder to forget than most." He tries a smile. It almost works.']], fx: { rel: { cael: { trust: 10, affinity: 4 } }, flag: 'cael_warned', mem: { cael: 'warned_list' } } },
    ] } } },
    cael_small_2: { nodes: { start: { l: [['cael', '"You\'re out alone again." He sighs. "I\'m not going to tell you not to be. I\'m just going to worry about it professionally."']], c: [
      { t: '"Professionally?"', l: [['cael', 'He goes faintly pink. "Mostly professionally."']], fx: { rel: { cael: { affinity: 2 } } } },
      { t: '"I can look after myself."', path: 'aggressive', l: [['cael', '"I know. That\'s not the point." He doesn\'t explain what the point is.']] },
    ] } } },
    cael_small_3: { nodes: { start: { l: [['cael', '"I write the date at the top of my notebook every morning. And my own name. Just in case."']], c: [
      { t: '"Just in case you forget?"', path: 'compassionate', l: [['cael', '"Just in case someone makes me." He tries to smile. It doesn\'t quite work.']], fx: { rel: { cael: { affinity: 2, trust: 1 } } } },
      { t: '"Maybe I should start doing that too."', path: 'secretive', l: [['cael', '"Do. And keep it somewhere nobody would think to look."']], fx: { rel: { cael: { trust: 2 } } } },
    ] } } },

    cael_archive: {
      nodes: {
        start: {
          l: [['a', '"I need to get into the restricted archive."'], ['cael', '"I thought you might." He studies you for a long moment.']],
          to: 'decide',
        },
        decide: {
          l: [],
          c: [
            { cond: { any: [{ rel: { cael: { affinity: 8 } } }, { rel: { cael: { trust: 6 } } }] }, t: '(Wait.)', l: [['cael', '"Here." He presses a brass token into your hand. "Guard business. If anyone asks, you\'re investigating the missing watchmen for me. Which you might as well be."']], fx: { item: { archive_pass: 1 }, rel: { cael: { trust: 3 } }, mem: { cael: 'gave_pass' } } },
            { cond: { not: { any:[{ rel: { cael: { affinity: 8 } } }, { rel: { cael: { trust: 6 } } }] } }, t: '"Please. People are disappearing. You said so yourself."', path: 'compassionate', l: [['cael', 'His jaw tightens. Then he pulls a brass token from his belt. "Don\'t make me regret this."']], fx: { item: { archive_pass: 1 }, rel: { cael: { trust: 2 } }, mem: { cael: 'gave_pass' } } },
            { cond: { not: { any: [{ rel: { cael: { affinity: 8 } } }, { rel: { cael: { trust: 6 } } }] } }, t: '"Give me the pass, Captain."', path: 'aggressive', l: [['cael', '"No." He says it without heat. "Earn it, or find another way. I\'m sure you will."']], fx: { rel: { cael: { suspicion: 2 } }, mem: { cael: 'argued' }, avoid: { cael: 1 } } },
          ],
        },
      },
    },

    cael_guards: { nodes: { start: { l: [['cael', '"Three this year. A night watchman. A gate clerk. A stable boy. Their bunks were empty, their lockers were empty, and nobody on the watch could tell me who\'d slept there."'], ['cael', '"I only knew because I keep the roster in my own hand. And there were blank lines where names had been."']], fx: { mystery: 'myst_guards' }, end: true } } },
    cael_liesel: { nodes: { start: { l: [['n', 'You show Cael the coin from the fountain.'], ['cael', '"Liesel." He goes very still. "My grandmother used to set a place at dinner for someone called Liesel. Every night. When I asked who she was, Grandmother said she didn\'t know. She just knew she had to."']], fx: { obj: 'hq_liesel.ask', memory: 'mem_liesel:who', rel: { cael: { trust: 3 } } }, end: true } } },
    cael_worry: { nodes: { start: { l: [['a', '"Why do you worry about me so much?"'], ['cael', 'He takes a long time to answer. "Because you look at this city the way I do. Like you\'re counting the gaps. And everyone I\'ve ever seen do that is gone."'], ['cael', '"I\'d like you not to be. Gone. That\'s all."']], c: [
      { t: '"I\'m not going anywhere."', path: 'compassionate', l: [['cael', '"Promise?" He hears himself and flushes. "Forget I said that."'], ['n', 'You don\'t.']], fx: { rel: { cael: { affinity: 6, trust: 4 } }, mem: { cael: 'promised_stay' } } },
      { t: '"You can\'t protect me from everything."', l: [['cael', '"No. But I can be there when it happens."']], fx: { rel: { cael: { trust: 4 } } } },
    ] } } },
    cael_seraphine: { nodes: { start: { l: [['cael', '"The keeper? She was standing in the cathedral doorway when I was six. She was standing there when I joined the guard. Same face. Same robes."'], ['cael', '"I asked my captain about her once. He said, \'What keeper?\'"']], fx: { mystery: 'myst_seraphine' }, end: true } } },

    cael_token: {
      nodes: {
        start: {
          l: [['n', 'You hand Cael the tarnished guard token marked IX.']],
          fx: { obj: 'nq_cael.return', take: { guard_token: 1 }, history: { cael: 'Brought him the token of watchman IX.' } },
          end: true,
        },
      },
    },

    cael_secret: {
      nodes: {
        start: {
          l: [
            ['cael', '"I\'ve never told anyone this." He keeps his eyes on the horizon. "Since I was a boy, I\'ve had the same dream. A girl in black, in the cathedral, singing to the bells. She turns around, and I wake up before I see her face."'],
            ['cael', '"The first time I saw you I almost called for the guard. Not because you were suspicious. Because I thought I was still asleep."'],
          ],
          c: [
            { t: '"Maybe you\'ll see her face, one day."', path: 'compassionate', l: [['cael', '"I think," he says quietly, "I already have."']], fx: { rel: { cael: { affinity: 8, trust: 6 } }, romanceHint: 'cael' } },
            { t: '"What else do you remember from the dream?"', path: 'suspicious', l: [['cael', '"Three notes. Hummed. And the bell ringing one more time than it should."']], fx: { rel: { cael: { trust: 6 } }, memory: 'mem_lullaby:hum' } },
            { t: 'Show him the girl at the edge of the photograph.', req: { item: 'old_photograph' }, l: [['n', 'You put the scratched photograph in his hands and point to the girl in black at the very edge.'], ['cael', 'Cael goes pale. "That\'s her. That\'s the dress. She always stands a little apart, just like that."'], ['n', 'He looks from the photograph to you, and back, and does not say the obvious thing. He does not have to.']], fx: { rel: { cael: { trust: 8, affinity: 4 } }, mem: { cael: 'saw_dream_girl' } } },
          ],
          fx: { history: { cael: 'Told you about his recurring dream.' } },
        },
      },
    },

    cael_show_photo: { nodes: { start: { l: [['cael', 'Cael studies the photograph with a guardsman\'s attention. "That uniform on the man by the door — that\'s Royal Guard, old pattern. Three hundred years old." He touches the scratched-out face. "Someone hated her. Or was afraid of her."'], ['cael', '"Or loved her, and couldn\'t bear to look." He hands it back. "Keep this hidden."']], fx: { obj: 'mq3.show', memory: 'mem_photograph:reaction', rel: { cael: { trust: 3 } } }, end: true } } },
    cael_show_default: { nodes: { start: { l: [['cael', '"I\'m not sure what I\'m looking at. Is it evidence?" He seems hopeful.']], end: true } } },

    cael_warning: {
      nodes: {
        start: {
          l: [['cael', '"You got into the restricted archive." Cael doesn\'t sound angry. He sounds frightened. "Astoria — the last person who went digging in those records was on my roster. Line nine."']],
          c: [
            { t: '"Then help me find out what happened to them."', path: 'compassionate', l: [['cael', 'He exhales. "...All right. All right. But you tell me where you\'re going. Every time."']], fx: { rel: { cael: { trust: 4, affinity: 3 } }, mem: { cael: 'promised_tell' } } },
            { t: '"I\'ll be fine. Stop following me."', path: 'aggressive', l: [['cael', 'He stiffens. "Understood." He walks away without another word.']], fx: { rel: { cael: { affinity: -5 } }, mem: { cael: 'argued' }, avoid: { cael: 2 } } },
          ],
        },
      },
    },
  },
};
