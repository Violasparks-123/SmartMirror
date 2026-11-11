/* CRIMSON VELVET — LOCATIONS
 * -----------------------------------------------------------------
 * area 'conservatory' → drawn floor plan (plan: x,y,w,h in a 1000×640 grid)
 * area 'city'         → Vesper City map image (pin: x,y in % of the image)
 * bg: file in assets/backgrounds/ (missing files show a designed backdrop)
 * objects: inspectable hotspots (x,y = % of the scene). scenes: see dialogue.js
 * Conditions: chmin/chmax (chapter), f/nf (flags), ev/noev, conn, tmin {npc:n},
 *             cred, heatMin, any [...], count {n, f:[...]}
 * ----------------------------------------------------------------- */
CV.DATA.locations = {
  /* ===================== VESPER CONSERVATORY ===================== */
  front_steps: {
    name: 'Front Steps & Foyer', area: 'conservatory', bg: 'front_steps',
    plan: { x: 480, y: 440, w: 230, h: 160 }, unlock: {},
    desc: 'Wet stone steps, gaslamps in the rain, and a foyer of honours boards in gold leaf. Vesper Conservatory looks exactly like a place with nothing to hide.',
    present: [],
    objects: [
      { id: 'o_honours', label: 'Honours board', x: 30, y: 62, if: { chmin: 1 },
        text: 'Gold-leaf names of every Crimson Prize winner. Seven years ago: “J. Cross”. The gilt is brighter than the years around it, and the wood beneath has been sanded smooth. Someone else’s name was there first.',
        fx: { ev: ['ev_honours'] } },
      { id: 'o_director_portrait', label: 'Portrait of the former director', x: 70, y: 52, if: { chmin: 1 },
        text: 'An oil portrait: a silver-haired man holding a gold pocket watch as if it were a sceptre. The brass plate reads ADRIAN VOSS — DIRECTOR. Below it, smaller: “He gave Vesper its reputation.”',
        fx: { set: ['k_adrian_named'], j: ['j_p_adrian'] } }
    ],
    scenes: [{ id: 'prologue_arrival', who: 'beatrix', label: 'Arrive at the Conservatory', auto: true }]
  },

  guest_room: {
    name: 'Guest Quarters', area: 'conservatory', bg: 'guest_room',
    plan: { x: 730, y: 480, w: 230, h: 120 }, unlock: { f: ['done_prologue_arrival'] },
    desc: 'A narrow room under the eaves with a writing desk, a radiator that knocks like a visitor, and a gap beneath the door just wide enough for an envelope.',
    present: [],
    objects: [
      { id: 'o_window', label: 'Rain-dark window', x: 72, y: 34,
        text: 'From here you can see the Grand Theatre’s roof and the clock tower above it. The clock face is dark. It has been dark, Beatrix said, for years.' },
      { id: 'o_desk', label: 'Writing desk', x: 30, y: 64,
        text: 'Your invitation, your notes, your pen. You have started writing everything down. It seems like the kind of place where that matters.' }
    ],
    scenes: [{ id: 'prologue_envelope', who: 'nar', label: 'An envelope under the door', auto: true, if: { f: ['done_prologue_arrival'] } }]
  },

  old_archive: {
    name: 'The Old Archive', area: 'conservatory', bg: 'old_archive',
    plan: { x: 40, y: 220, w: 200, h: 180 }, unlock: { chmin: 1 },
    desc: 'Forty years of paper under green lamps. Beatrix’s desk is the only tidy thing in it. A chained gate guards the restricted section.',
    present: [{ npc: 'beatrix', if: { nf: ['ending_reached'] } }],
    objects: [
      { id: 'o_registers', label: 'Student registers, shelf R', x: 22, y: 50, if: { chmin: 1 },
        text: 'The register for seven years ago. One line has been scored out so hard the nib tore the paper. You lay a sheet over the page beneath and shade it with a pencil. Pressed into the page underneath, the name comes back: CELESTE WREN.',
        fx: { ev: ['ev_register'], set: ['k_celeste_named'], j: ['j_q_celeste'], v: { celeste_truth: 1 } } },
      { id: 'o_withdrawals', label: 'Withdrawal files', x: 48, y: 64, if: { ev: ['ev_register'] },
        text: 'A slim folder: WREN, C. — WITHDRAWN. Inside, a single withdrawal form. The signature is neat, upright and careful. Too careful.',
        fx: { ev: ['ev_withdrawal'] } },
      { id: 'o_restricted', label: 'Restricted section', x: 80, y: 46, if: { chmax: 5 },
        text: 'A chained iron gate. A card in a brass frame: BY ORDER OF THE ADMINISTRATION. Beatrix has the only key besides the Headmistress. She keeps it on a ribbon and never takes it off.' },
      { id: 'o_compartment', label: 'Loose panel behind the cataloguing desk', x: 62, y: 74, if: { chmin: 6, noev: ['ev_sealed_letter'] },
        text: 'Beatrix’s desk sits on a floorboard that rings hollow. Behind a loose panel: a shallow compartment, and a single envelope sealed with burgundy wax. It is addressed in a looping hand: “For B. Only when it’s safe.”',
        fx: { ev: ['ev_sealed_letter'] } }
    ],
    scenes: [
      { id: 'beatrix_celeste', who: 'beatrix', label: 'Ask Beatrix about the scratched-out name', if: { ev: ['ev_register'] } },
      { id: 'beatrix_letter', who: 'beatrix', label: 'Show Beatrix the sealed envelope', auto: true, if: { ev: ['ev_sealed_letter'] } }
    ]
  },

  costume_room: {
    name: 'Costume Room', area: 'conservatory', bg: 'costume_room',
    plan: { x: 260, y: 170, w: 125, h: 240 }, unlock: { chmin: 1 },
    desc: 'Rails of velvet and moth-silk, a cutting table buried in pins, and a gramophone playing something that has been out of fashion for decades. Backstage, in every sense.',
    present: [{ npc: 'odette' }],
    objects: [
      { id: 'o_mirror', label: 'A broken compact mirror', x: 70, y: 66,
        text: 'A gilt compact on the cutting table, the glass cracked straight across. Odette uses it anyway. “It shows me two of everything,” she says. “It’s good to be reminded.”' },
      { id: 'o_scrapbook', label: 'Odette’s programme scrapbook', x: 28, y: 58, if: { chmin: 2 },
        text: 'Every programme Odette has ever kept, pressed and labelled. The Crimson Gala, seven years ago, is there — with one name in the running order inked over in black.',
        fx: { ev: ['ev_programme'] } }
    ],
    scenes: [
      { id: 'odette_intro', who: 'odette', label: 'Meet the costume designer', if: { chmin: 1 } },
      { id: 'odette_corridor', who: 'odette', label: 'Ask Odette about the night of the Gala', if: { chmin: 2, f: ['done_odette_intro'] } },
      { id: 'odette_key', who: 'odette', label: 'Talk to Odette alone', if: { chmin: 2, f: ['done_odette_corridor'], conn: ['c_blackout_records'] } },
      { id: 'odette_route', who: 'odette', label: 'Odette has something to tell you', if: { chmin: 4 } }
    ]
  },

  grand_theatre: {
    name: 'The Grand Theatre', area: 'conservatory', bg: 'grand_theatre',
    plan: { x: 400, y: 170, w: 340, h: 250 }, unlock: { chmin: 1 },
    desc: 'Six hundred velvet seats, gilt boxes, a chandelier like a frozen fountain — and above the proscenium, a clock that has said 11:17 for seven years.',
    present: [],
    objects: [
      { id: 'o_theatre_clock', label: 'The proscenium clock', x: 50, y: 14, if: { nf: ['k_ledger_found'] },
        text: 'Gilded, ornate, and stopped. 11:17. Repair requests for it go back seven years, each one marked DEFERRED in the same administrative hand.',
        fx: { j: ['j_q_clock'] } },
      { id: 'o_stage_photo', label: 'Framed photograph by the stage door', x: 84, y: 48, if: { chmin: 2 },
        text: 'A photograph from the Crimson Gala seven years ago: the company on stage, the clock above them reading 11:14. At the very edge of the frame, a girl with a burgundy ribbon is slipping into the wings.',
        fx: { ev: ['ev_photo_1117'] } },
      { id: 'o_lighting_booth', label: 'Lighting booth', x: 14, y: 30, if: { chmin: 5 },
        text: 'Up a ladder, behind glass: the old lighting desk, and pinned above it, the original theatre lighting plan for the Crimson Gala. One circuit is marked in red pencil: ARCHIVE FEED — SHARED.',
        fx: { ev: ['ev_lighting_plan'] } },
      { id: 'o_maint_door', label: 'Maintenance door behind the stage', x: 64, y: 72, if: { chmin: 2 },
        text: 'A narrow iron door behind the backdrop, painted the same black as the wall. The lock is old and the keyhole is clean — cleaner than anything else back here.',
        after: 'The door stands unlocked now. Cold air comes through it.',
        choices: [
          { t: 'Use Odette’s key', if: { ev: ['ev_odette_key'] }, fx: { loc: ['forgotten_wing'], toast: 'The Forgotten Wing is open.' } },
          { t: 'Leave it' }
        ] }
    ],
    scenes: [
      { id: 'reconstruction', who: 'nar', label: 'Reconstruct the night of the blackout', if: { chmin: 5, ev: ['ev_security_log', 'ev_lighting_plan'], nf: ['recon_success'] }, repeatable: true },
      { id: 'celeste_theatre', who: 'celeste', label: '11:17. The theatre.', auto: true, if: { chmin: 8, f: ['done_gala_message'] } }
    ]
  },

  velvet_ballroom: {
    name: 'The Velvet Ballroom', area: 'conservatory', bg: 'velvet_ballroom',
    plan: { x: 760, y: 320, w: 200, h: 145 }, unlock: { chmin: 1 },
    desc: 'Where patrons are thanked, toasts are raised and scholarships are announced. Even empty, it smells of lilies and money.',
    present: [],
    objects: [
      { id: 'o_trophy', label: 'Crimson Prize trophy case', x: 18, y: 56, if: { chmin: 1 },
        text: 'The Crimson Prize cup from seven years ago. The engraved name — J. CROSS — sits in a shallow dip, where an earlier name was polished out of the silver.',
        fx: { ev: ['ev_trophy'] } }
    ],
    scenes: [{ id: 'gala_message', who: 'nar', label: 'The Crimson Gala', auto: true, if: { chmin: 8 } }]
  },

  music_wing: {
    name: 'Music Wing & Rehearsal Rooms', area: 'conservatory', bg: 'music_wing',
    plan: { x: 640, y: 40, w: 320, h: 115 }, unlock: { chmin: 1 },
    desc: 'Practice rooms with frosted doors, a corridor of scales and arguments, and at the end, a room where someone is playing the same eight bars over and over.',
    present: [{ npc: 'julian' }],
    objects: [
      { id: 'o_piano', label: 'Julian’s piano', x: 30, y: 62,
        text: 'A concert grand with a silver pocket watch left open on the music stand. The notebook beside it is full of compositions that stop halfway down the page.' },
      { id: 'o_music_cabinet', label: 'Old music cabinet', x: 76, y: 54, if: { chmin: 2 },
        text: 'Scores nobody has played in years. Tucked inside a folded Chopin nocturne: a torn page from a ledger. Three entries in a clerk’s hand. At the bottom, in pencil, a time: 11:17 PM.',
        fx: { ev: ['ev_torn_ledger'], v: { celeste_truth: 1 } } }
    ],
    scenes: [
      { id: 'julian_intro', who: 'julian', label: 'Interrupt the pianist', if: { chmin: 1 } },
      { id: 'julian_ranking', who: 'julian', label: 'Ask Julian about his scholarship', if: { chmin: 2, ev: ['ev_ranking_sheet'], f: ['done_julian_intro'] } },
      { id: 'julian_route', who: 'julian', label: 'Julian has found something', if: { chmin: 4, f: ['done_julian_ranking'] } }
    ]
  },

  admin_offices: {
    name: 'Administration Offices', area: 'conservatory', bg: 'admin_offices',
    plan: { x: 260, y: 40, w: 200, h: 115 }, unlock: { chmin: 1 },
    desc: 'Panelled corridors, porcelain teacups, and a secretary who files everything twice. The Headmistress’s door is always closed and never locked.',
    present: [{ npc: 'evelyn' }],
    objects: [
      { id: 'o_ranking_cabinet', label: 'Scholarship files', x: 24, y: 56, if: { chmin: 2, noev: ['ev_ranking_sheet'] },
        text: 'The secretary has stepped out. In the open cabinet: SCHOLARSHIP RANKINGS — CRIMSON GALA, seven years ago. You have perhaps a minute.',
        choices: [
          { t: 'Read it quickly and copy the figures', fx: { ev: ['ev_ranking_sheet'], heat: 10, v: { adrian_suspicion: 5 }, toast: 'The secretary returns just as you close the drawer.' } },
          { t: 'Ask Beatrix to request the file properly', if: { tmin: { beatrix: 35 } }, fx: { ev: ['ev_ranking_sheet'], t: { beatrix: -2 }, mem: { beatrix: 'She requested a scholarship file for you, through the proper channels. It was noted.' } } },
          { t: 'Leave it' }
        ] },
      { id: 'o_memo', label: 'Memorandum on the notice board', x: 60, y: 40, if: { chmin: 2 },
        text: 'An old staff memorandum still pinned under newer ones, the paper gone the colour of tea. RECORDS RELATING TO THE GALA ARE SEALED. — A. VOSS, DIRECTOR.',
        fx: { ev: ['ev_memo'], set: ['k_adrian_named'] } },
      { id: 'o_night_log', label: 'Night porter’s ledgers', x: 82, y: 64, if: { chmin: 5 },
        text: 'A shelf of the porters’ night logs, one per year. The Gala night is all there, minute by minute — except for a page torn out and pasted back in a different ink.',
        fx: { ev: ['ev_security_log'] } }
    ],
    scenes: [
      { id: 'evelyn_intro', who: 'evelyn', label: 'Present yourself to the Headmistress', if: { chmin: 1 } },
      { id: 'evelyn_confront', who: 'evelyn', label: 'Confront the Headmistress', if: { chmin: 7 } }
    ]
  },

  maintenance_room: {
    name: 'Maintenance Room', area: 'conservatory', bg: 'maintenance_room',
    plan: { x: 40, y: 420, w: 200, h: 140 }, unlock: { chmin: 1 },
    desc: 'Down a flight of iron stairs: a workbench, a kettle, a wall of labelled keys and the low hum of the building’s old heart.',
    present: [{ npc: 'theo' }],
    objects: [
      { id: 'o_key_wall', label: 'Wall of keys', x: 22, y: 42,
        text: 'Every key labelled in square capitals. One hook is labelled MAINT. CORRIDOR — THEATRE/WING. The hook is empty, and the label is seven years old.' },
      { id: 'o_workbench', label: 'Workbench', x: 66, y: 64,
        text: 'Tools laid out in order of size. A coin balanced on its edge. A coffee cup that has left a ring on a stack of carbon copies.' }
    ],
    scenes: [
      { id: 'theo_intro', who: 'theo', label: 'Find the maintenance worker', if: { chmin: 1 } },
      { id: 'theo_report', who: 'theo', label: 'Ask Theo about the blackout', if: { chmin: 2, f: ['done_theo_intro'] } }
    ]
  },

  library: {
    name: 'Conservatory Library', area: 'conservatory', bg: 'library',
    plan: { x: 760, y: 170, w: 200, h: 135 }, unlock: { chmin: 1 },
    desc: 'A gallery of books under a glass roof, with a librarian who has not looked up since 1931. Notes left in books are, officially, forbidden.',
    present: [],
    objects: [
      { id: 'o_borrowed', label: 'Borrowing ledger and returns trolley', x: 32, y: 60, if: { f: ['k_celeste_named'] },
        text: 'Celeste Wren’s borrowing card is still filed under W. Her signature runs along twelve lines: quick, slanting, the W like two hands joined. In the last book she borrowed — never returned until after she left — a pressed violet and a note in the same hand.',
        fx: { ev: ['ev_library_card'] } },
      { id: 'o_newspapers', label: 'Bound newspapers', x: 74, y: 52, if: { chmin: 2 },
        text: 'The Vesper Courier, bound by season. The week after the Gala: TECHNICIAN DISMISSED AFTER GALA BLACKOUT. A photograph of a young man with his hands in his pockets, refusing to look at the camera.',
        fx: { ev: ['ev_newspaper'] } }
    ],
    scenes: []
  },

  rooftop: {
    name: 'Rooftop Conservatory', area: 'conservatory', bg: 'rooftop',
    plan: { x: 480, y: 40, w: 140, h: 110 }, unlock: { chmin: 3 },
    desc: 'A glasshouse on the roof full of overgrown ferns and dead orchids. The rain is loud here. It is the only place Beatrix says she can think.',
    present: [{ npc: 'beatrix', if: { chmin: 4 } }],
    objects: [
      { id: 'o_glass', label: 'Fogged glass', x: 50, y: 30,
        text: 'Someone has written in the condensation, long ago, and the words have etched faintly into the dirt on the glass: “C + B — always”.' }
    ],
    scenes: [{ id: 'beatrix_route', who: 'beatrix', label: 'Find Beatrix on the roof', if: { chmin: 4 } }]
  },

  forgotten_wing: {
    name: 'The Forgotten Wing', area: 'conservatory', bg: 'forgotten_wing', hidden: true,
    plan: { x: 40, y: 40, w: 200, h: 160 }, unlock: { f: ['loc_forgotten_wing'] },
    desc: 'Officially sealed. Dust sheets over chairs, a corridor of closed doors, and a wall clock that stopped at the same minute as the one in the theatre.',
    present: [],
    objects: [
      { id: 'o_wall_clock', label: 'Wall clock', x: 50, y: 18,
        text: 'Stopped at 11:17. Not run down — the pendulum has been wedged with a folded concert ticket. Someone wanted this minute kept.' },
      { id: 'o_schedules', label: 'Performance schedules', x: 18, y: 54,
        text: 'Rehearsal schedules from the Gala week, annotated in two hands. One belongs to the stage manager. The other has written beside the closing number: “After this, everyone will know.”',
        fx: { ev: ['ev_schedule'] } },
      { id: 'o_missing_files', label: 'Missing student files', x: 36, y: 72,
        text: 'A box of student files marked TRANSFERRED. Eleven names. Some you will see again in the scholarship papers. Several were “transferred” the same month their scholarships were “paid”.',
        fx: { ev: ['ev_missing_files'], v: { celeste_truth: 1 } } },
      { id: 'o_gala_photos', label: 'Photographs from the Crimson Gala', x: 66, y: 60,
        text: 'A box of Gala photographs. Most are of patrons. One has been torn down the middle: two girls laughing in a stairwell, one in a burgundy ribbon. Only the right half is here.',
        fx: { ev: ['ev_photo_half_a'] } },
      { id: 'o_cabinet', label: 'Locked filing cabinet', x: 84, y: 66, if: { noev: ['ev_scholarship_copies'] },
        text: 'Steel, painted to look like walnut, and locked. The small key on Odette’s ring fits it. Inside: copies of scholarship documents. Some names appear twice. Others have been erased. At the foot of the alteration schedule, a signature you have seen on a memorandum: A. Voss.',
        fx: { ev: ['ev_scholarship_copies'], set: ['k_adrian_named', 'k_adr_scheme'], v: { celeste_truth: 1 } } }
    ],
    scenes: [{ id: 'beatrix_wing', who: 'beatrix', label: 'Footsteps in the corridor', auto: true, if: { ev: ['ev_scholarship_copies'] } }]
  },

  underground_passage: {
    name: 'The Underground Passage', area: 'conservatory', bg: 'underground_passage', hidden: true,
    plan: { x: 40, y: 575, w: 200, h: 45 }, unlock: { f: ['recon_success'] },
    desc: 'A brick service tunnel running from beneath the archive to an iron grating by the old tram sheds. Seven years ago, two girls ran down it in the dark.',
    present: [],
    objects: [
      { id: 'o_chalk', label: 'Chalk marks on the brick', x: 30, y: 50,
        text: 'At shoulder height, faint arrows in white chalk, one every twenty paces. At the last arrow, two sets of initials: C.W. and B.V. And a time, written as if to make sure it was true: 11:17.' },
      { id: 'o_grating', label: 'The iron grating', x: 78, y: 40,
        text: 'Rusted open. Beyond it, the tram sheds, and beyond those, the lights of Vesper Central Station. You stand where Celeste stood, and understand how close freedom was.' }
    ],
    scenes: []
  },

  /* ===================== VESPER CITY ===================== */
  conservatory_gate: {
    name: 'Vesper Conservatory', area: 'city', bg: 'front_steps', link: 'front_steps',
    pin: { x: 28, y: 20 }, unlock: {},
    desc: 'The Conservatory on the hill in Uptown, where everything you are investigating lives.',
    present: [], objects: [], scenes: []
  },
  cafe_etoile: {
    name: 'Café Étoile', area: 'city', bg: 'cafe_etoile',
    pin: { x: 60, y: 46 }, unlock: { chmin: 4 },
    desc: 'Fogged windows, lamps on every table, rain on the glass. Far enough from the Conservatory that nobody from the hill comes here.',
    present: [{ npc: 'theo', if: { chmin: 4, chmax: 7 } }],
    objects: [
      { id: 'o_cafe_window', label: 'Fogged window', x: 40, y: 34,
        text: 'Through the rain, a tram climbs toward Uptown. Theo says he comes here because nobody from the hill would be seen in a place with paper napkins.' }
    ],
    scenes: [{ id: 'theo_route', who: 'theo', label: 'Meet Theo away from the Conservatory', if: { chmin: 4 } }]
  },
  velvet_note: {
    name: 'The Velvet Note', area: 'city', bg: 'velvet_note',
    pin: { x: 74, y: 54 }, unlock: { f: ['k_adrian_location'] },
    desc: 'A private club in Midtown: red velvet, a piano nobody plays before eleven, and a corner table reserved for a retired gentleman who still runs a great deal.',
    present: [{ npc: 'adrian', if: { chmin: 7 } }],
    objects: [
      { id: 'o_piano_vn', label: 'The club piano', x: 26, y: 56,
        text: 'A brass plaque on the lid: “Gift of A. Voss to the members.” Even his gifts have his name on them.' }
    ],
    scenes: [{ id: 'adrian_meeting', who: 'adrian', label: 'Sit at Adrian Voss’s table', if: { chmin: 7, f: ['done_evelyn_confront'] } }]
  }
};

CV.DATA.locationOrder = ['front_steps', 'guest_room', 'old_archive', 'costume_room', 'grand_theatre', 'velvet_ballroom', 'music_wing', 'admin_offices', 'maintenance_room', 'library', 'rooftop', 'forgotten_wing', 'underground_passage', 'conservatory_gate', 'cafe_etoile', 'velvet_note'];
CV.DATA.startLocation = 'front_steps';
