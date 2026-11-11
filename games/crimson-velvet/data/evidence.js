/* CRIMSON VELVET — EVIDENCE & CONNECTIONS
 * -------------------------------------------------------------------
 * Each item renders as its own document in FILES:
 *   letter · form · report · log · photo · clipping · object · ledger
 * `icon` = file in assets/evidence/ (without .png).
 * CONNECTIONS: combining two items in FILES checks this list (order free).
 * No single document solves the case; the truth only appears in combination.
 * ------------------------------------------------------------------- */
CV.DATA.evidenceCategories = {
  letters: 'Letters & Notes', official: 'Official Records', technical: 'Technical & Security',
  photos: 'Photographs', physical: 'Objects & Inscriptions', press: 'Programmes & Press'
};

CV.DATA.evidence = {
  ev_invitation: {
    title: 'The invitation', cat: 'letters', icon: 'letter', source: 'Posted to you', found: 'Before you arrived', date: 'Autumn',
    people: [], canon: true,
    doc: { type: 'letter', salutation: 'Dear Restorer,',
      lines: ['Vesper Conservatory requests your assistance with a special archival restoration project, to begin at your earliest convenience. Board and lodging are provided.', 'Please present this letter to the archive assistant on arrival.'],
      sign: 'The Office of the Headmistress, Vesper Conservatory',
      enclosure: 'Some things are only forgotten because someone benefits from forgetting them.' },
    notes: 'The letter is typed. The enclosed note is handwritten, unsigned, and does not say who chose you.'
  },
  ev_envelope_photo: {
    title: 'Photograph under the door', cat: 'photos', icon: 'polaroid', source: 'Slipped under your door', found: 'Guest Quarters', date: 'Your first night',
    people: [], canon: true,
    doc: { type: 'photo', img: 'polaroid', caption: 'The Grand Theatre, empty, shot from the back of the stalls. The proscenium clock is just visible.', back: '11:17. Don’t trust the official records.' },
    notes: 'Same paper stock as the note in your invitation? Hard to say. Different hand.'
  },
  ev_register: {
    title: 'Student register (scratched line)', cat: 'official', icon: 'bound_diary', source: 'Shelf R', found: 'The Old Archive', date: 'Seven years ago',
    people: ['celeste'],
    doc: { type: 'ledger', header: 'VESPER CONSERVATORY — REGISTER OF STUDENTS — FINAL YEAR',
      rows: [['Asquith, M.', 'Voice', 'Enrolled'], ['Cross, J.', 'Piano', 'Enrolled — Scholar'], ['▒▒▒▒▒▒▒▒▒', '▒▒▒▒▒', '(scored through)'], ['Laurent, O.', 'Design', 'Enrolled'], ['Vale, B.', 'Archive studies', 'Enrolled']],
      footer: 'Pencil rubbing of the page beneath the scored line: WREN, CELESTE — COMPOSITION & VOICE.' },
    notes: 'Someone scored her out of the register itself. That is not a clerical error.'
  },
  ev_withdrawal: {
    title: 'Celeste’s withdrawal form', cat: 'official', icon: 'fountain_pen', source: 'Withdrawal files', found: 'The Old Archive', date: 'Dated the morning after the Gala',
    people: ['celeste'], canon: true,
    doc: { type: 'form', header: 'NOTICE OF VOLUNTARY WITHDRAWAL',
      rows: [['Student', 'Wren, Celeste'], ['Reason', 'Personal circumstances'], ['Effective', 'Immediately'], ['Forwarding address', 'None given'], ['Received by', 'Office of the Director']],
      sign: 'Celeste Wren', signNote: 'Neat, upright, careful lettering. Every letter separate.',
      footer: 'Countersigned for the Director — E. Ashcroft (Administrator)' },
    notes: 'The signature looks like someone copying a name rather than writing their own.'
  },
  ev_library_card: {
    title: 'Celeste’s library card & note', cat: 'letters', icon: 'letter', source: 'Borrowing ledger and returned books', found: 'Conservatory Library', date: 'Seven years ago',
    people: ['celeste'],
    doc: { type: 'letter', hand: true, salutation: 'Borrower: C. Wren',
      lines: ['Signature, repeated on twelve borrowing lines — quick, slanting, joined, the W like two hands holding.', 'Note found inside “A History of the Vesper Gala”, beside a pressed violet:', '“If you are reading this, somebody should have asked sooner. Check the numbers, not the names. — C.”'],
      sign: '— C.W.' },
    notes: 'Her real signature is nothing like the one on the withdrawal form.'
  },
  ev_ranking_sheet: {
    title: 'Scholarship ranking sheet', cat: 'official', icon: 'recording_book', source: 'Scholarship files', found: 'Administration Offices', date: 'Three days before the Gala, seven years ago',
    people: ['julian', 'celeste', 'adrian'], canon: true,
    doc: { type: 'report', header: 'CRIMSON SCHOLARSHIP — FINAL RANKING (REVISED)',
      rows: [['1', 'Wren, C.  →  struck through, “withdrawn” added later in different ink'], ['2 → 1', 'Cross, J.  (revised upward)'], ['3', 'Asquith, M.  (revised upward from 7)'], ['4', 'Hale, R.  (revised downward from 2)'], ['5', 'Okafor, T.  (revised downward from 3)']],
      footer: 'Revisions initialled “A.V.” — three days BEFORE the Gala, and before Celeste “withdrew”.' },
    notes: 'The rankings were changed before the Gala. Julian’s was among them.'
  },
  ev_memo: {
    title: 'Sealed-records memorandum', cat: 'official', icon: 'letter', source: 'Staff notice board', found: 'Administration Offices', date: 'The week after the Gala',
    people: ['adrian', 'evelyn'],
    doc: { type: 'letter', typed: true, salutation: 'MEMORANDUM — ALL STAFF',
      lines: ['Following the unfortunate events of the Gala evening, all records relating to the Gala, the scholarship ranking and student withdrawals are to be sealed with immediate effect.', 'Staff will refer any enquiries, including from the press or from families, to this office.', 'Discretion at this time protects every member of our community.'],
      sign: 'A. Voss, Director' },
    notes: '“Protects every member of our community.” Almost reasonable.'
  },
  ev_maintenance_report: {
    title: 'Theo’s maintenance report', cat: 'technical', icon: 'recording_book', source: 'Theo Mercer’s carbon copy', found: 'Maintenance Room', date: 'The night of the Gala',
    people: ['theo'], canon: true,
    doc: { type: 'report', header: 'ELECTRICAL FAULT REPORT — GALA EVENING',
      rows: [['Official copy', '“Fault: overloaded theatre circuit due to technician error (T. Mercer).”'], ['Theo’s carbon', '“Fault originated on ARCHIVE FEED, not theatre circuit. Junction box in archive corridor forced open. Fuse bridged with wire. Not accidental.”'], ['Time of failure', '11:17 PM'], ['Emergency lights', 'Delayed 4 min — relay disconnected by hand']],
      footer: 'The official copy has been retyped. The carbon underneath still shows the original words.' },
    notes: 'The blackout started in the archive. The report was altered to blame Theo.'
  },
  ev_torn_ledger: {
    title: 'Torn ledger page', cat: 'official', icon: 'bound_diary', source: 'Inside a Chopin nocturne', found: 'Music Wing', date: 'Seven years ago',
    people: ['adrian'], canon: true,
    doc: { type: 'ledger', header: '… (torn) — p. 112',
      rows: [['Scholarship payment — R. Hale — term 3', 'Paid. NOT RECEIVED (see bank).'], ['Ranking adjustment — position 2 → 1', 'Approved — per donor'], ['Donor “M.”', 'Contribution received in full']],
      footer: 'Pencil, bottom margin: 11:17 PM' },
    notes: 'A payment never received. A ranking moved. A donor with no name. And the time.'
  },
  ev_newspaper: {
    title: 'Courier clipping', cat: 'press', icon: 'letter', source: 'Bound newspapers', found: 'Conservatory Library', date: 'The week after the Gala',
    people: ['theo', 'adrian'],
    doc: { type: 'clipping', header: 'THE VESPER COURIER', headline: 'TECHNICIAN DISMISSED AFTER GALA BLACKOUT',
      lines: ['A junior stage technician has been dismissed following the blackout which interrupted the Crimson Gala at Vesper Conservatory.', '“An inexperienced young man made a regrettable error,” said the Director, Mr Adrian Voss. “We have taken appropriate action and consider the matter closed.”', 'A student who withdrew from the Conservatory the same evening was not named at the family’s request.'] },
    notes: '“At the family’s request.” Celeste had no family in Vesper.'
  },
  ev_programme: {
    title: 'Crimson Gala programme', cat: 'press', icon: 'recording_book', source: 'Odette’s scrapbook', found: 'Costume Room', date: 'Seven years ago',
    people: ['celeste', 'julian', 'odette'],
    doc: { type: 'report', header: 'THE CRIMSON GALA — ORDER OF EVENING',
      rows: [['10:40', 'Address by the Director'], ['10:55', 'Piano — J. Cross'], ['11:10', 'Scholarship announcements'], ['11:20', '▒▒▒▒▒▒ (inked over) — “Song & Statement”'], ['11:40', 'Patrons’ reception, Velvet Ballroom']],
      footer: 'Odette’s pencil note in the margin: “C. said ‘wear something you can run in.’ I thought she was joking.”' },
    notes: '“Song & Statement.” Celeste was going to say something at 11:20.'
  },
  ev_photo_1117: {
    title: 'The 11:17 photograph', cat: 'photos', icon: 'burnt_photo', source: 'Frame by the stage door', found: 'The Grand Theatre', date: 'The Gala, seven years ago', canon: true,
    people: ['celeste'],
    doc: { type: 'photo', img: 'burnt_photo', caption: 'The company on stage at the Crimson Gala. The proscenium clock reads 11:14 — still running. At the edge of the frame, a girl with a burgundy ribbon slips into the wings toward the archive corridor.' },
    notes: 'The clock was running at 11:14. She was heading for the archive three minutes before the lights went out.'
  },
  ev_honours: {
    title: 'Honours board', cat: 'physical', icon: 'magnifier', source: 'Foyer', found: 'Front Steps & Foyer', date: '—',
    people: ['julian'],
    doc: { type: 'object', img: 'magnifier', inscription: 'CRIMSON PRIZE — J. CROSS', caption: 'Brighter gilt than the years around it. The wood beneath was sanded smooth before the name was painted.' },
    notes: 'Another name was there first.'
  },
  ev_trophy: {
    title: 'Crimson Prize trophy', cat: 'physical', icon: 'magnifier', source: 'Trophy case', found: 'The Velvet Ballroom', date: 'Seven years ago',
    people: ['julian', 'celeste'],
    doc: { type: 'object', img: 'magnifier', inscription: 'J. CROSS', caption: 'Engraved in a shallow dip, where an earlier name was polished out. Under a lens, two letters of the old engraving survive at the edge: “…EN”.' },
    notes: '…EN. As in WREN.'
  },
  ev_odette_key: {
    title: 'Odette’s backstage key', cat: 'physical', icon: 'key_ring', source: 'Given by Odette', found: 'Costume Room', date: 'Taken on the Gala night', canon: true,
    people: ['odette'],
    doc: { type: 'object', img: 'key_ring', inscription: 'MAINT. CORRIDOR — THEATRE / WING', caption: 'An iron corridor key on a ring with a smaller steel key. Odette has kept them in a button tin for seven years.' },
    notes: 'Opens the maintenance door behind the Grand Theatre.'
  },
  ev_schedule: {
    title: 'Gala-week rehearsal schedule', cat: 'press', icon: 'letter', source: 'Performance schedules', found: 'The Forgotten Wing', date: 'Gala week, seven years ago',
    people: ['celeste'],
    doc: { type: 'report', header: 'REHEARSAL SCHEDULE — GALA WEEK',
      rows: [['Mon', 'Full company — Grand Theatre'], ['Wed', 'Lighting check — T. Mercer'], ['Fri', 'Dress rehearsal — closing number: C. Wren']],
      footer: 'Second hand, beside the closing number: “After this, everyone will know.”' },
    notes: 'Celeste’s handwriting. She planned the Gala as her stage.'
  },
  ev_missing_files: {
    title: 'Missing student files', cat: 'official', icon: 'bound_diary', source: 'Box marked TRANSFERRED', found: 'The Forgotten Wing', date: 'Seven to nine years ago',
    people: [],
    doc: { type: 'ledger', header: 'STUDENT FILES — “TRANSFERRED”',
      rows: [['Hale, R.', 'Transferred — scholarship “paid” term 3'], ['Okafor, T.', 'Transferred — scholarship “paid”'], ['Marsh, E.', 'Transferred'], ['Delacroix, P.', 'Transferred — scholarship “paid”'], ['… 7 more', '…']],
      footer: 'Eleven students. No receiving institution named for any of them.' },
    notes: 'Not just one missing student. A pattern.'
  },
  ev_scholarship_copies: {
    title: 'Scholarship copies (Forgotten Wing)', cat: 'official', icon: 'fountain_pen', source: 'Locked filing cabinet', found: 'The Forgotten Wing', date: 'Seven years ago',
    people: ['adrian', 'julian'],
    doc: { type: 'report', header: 'SCHOLARSHIP DISBURSEMENTS — COPY',
      rows: [['Hale, R.', 'Paid × 2 (duplicate entry) — neither received'], ['Cross, J.', 'Crimson Scholarship — “per arrangement”'], ['Wren, C.', '(erased)'], ['Alteration schedule', 'Approved — A. Voss']],
      footer: 'Names appear twice. Others have been erased. These are copies — someone made them, and hid them.' },
    notes: 'Adrian Voss signed the alterations himself.'
  },
  ev_photo_half_a: {
    title: 'Torn photograph (right half)', cat: 'photos', icon: 'polaroid', source: 'Box of Gala photographs', found: 'The Forgotten Wing', date: 'Seven years ago',
    people: ['celeste'],
    doc: { type: 'photo', img: 'polaroid', torn: 'right', caption: 'A girl in a burgundy ribbon laughing on a stairwell, mid-turn, an arm reaching out of frame toward someone on the missing half.', back: '…latform 4 — left luggage — no. 1…' },
    notes: 'Something is written across the back, but the tear cuts it in half.'
  },
  ev_anon_wing: {
    title: 'Anonymous note (Forgotten Wing)', cat: 'letters', icon: 'letter', source: 'Pinned to the wing door', found: 'The Forgotten Wing', date: 'Chapter Three', canon: true,
    people: [],
    doc: { type: 'letter', hand: true, salutation: '', lines: ['You are looking in the right place.', 'You are asking the wrong people.'], sign: '' },
    notes: 'Whoever writes these knows where you have been.'
  },
  ev_julian_letter: {
    title: 'Julian’s scholarship letter', cat: 'letters', icon: 'letter', source: 'Julian Cross', found: 'Julian’s rooms, Music Wing', date: 'Seven years ago', canon: true,
    people: ['julian', 'adrian'],
    doc: { type: 'letter', typed: true, salutation: 'My dear Julian,',
      lines: ['It gives me great pleasure to confirm that, following a revision of the final ranking, you are this year’s Crimson Scholar.', 'I should be grateful if you did not discuss the revision. Our patrons take a personal interest in your future, and it would be ungracious to embarrass them with questions about how it was secured.', 'You have considerable potential. Do not waste it on curiosity.'],
      sign: 'Adrian Voss, Director' },
    notes: '“Following a revision of the final ranking.” In Adrian’s own words.'
  },
  ev_fabric: {
    title: 'Torn burgundy fabric', cat: 'physical', icon: 'torn_glove', source: 'Odette Laurent', found: 'Near the Old Archive (the Gala night)', date: 'Seven years ago',
    people: ['odette', 'celeste'],
    doc: { type: 'object', img: 'torn_glove', inscription: 'Silk velvet, burgundy', caption: 'A strip of burgundy velvet ribbon, snagged and torn. Odette found it on the archive corridor floor ten minutes after the lights came back, and has never told anyone.' },
    notes: 'Celeste’s ribbon.'
  },
  ev_security_log: {
    title: 'Porter’s night log, Gala evening', cat: 'technical', icon: 'recording_book', source: 'Night porter’s ledgers', found: 'Administration Offices', date: 'The Gala night',
    people: ['adrian', 'celeste', 'beatrix'],
    doc: { type: 'log', header: 'NIGHT PORTER — GALA EVENING',
      rows: [['11:02 PM', 'Director leaves Ballroom — “to fetch papers”'], ['11:09 PM', 'Archive corridor — two students seen (Wren, Vale)'], ['11:12 PM', 'Director enters archive corridor'], ['11:17 PM', 'Total failure of lights. Emergency lights fail.'], ['11:21 PM', 'Lights restored. Director in Ballroom, “damp about the cuffs”.']],
      footer: 'This page was torn out and pasted back in a different ink. The original lines show through from behind.' },
    notes: 'Adrian went into the archive corridor five minutes before the blackout.'
  },
  ev_lighting_plan: {
    title: 'Original theatre lighting plan', cat: 'technical', icon: 'fountain_pen', source: 'Lighting booth', found: 'The Grand Theatre', date: 'Gala week, seven years ago',
    people: ['theo'],
    doc: { type: 'report', header: 'LIGHTING PLAN — CRIMSON GALA — T. MERCER',
      rows: [['Circuit A', 'House lights'], ['Circuit B', 'Stage — front of house'], ['Circuit C', 'ARCHIVE FEED — SHARED with theatre emergency relay'], ['Note', 'If C fails, theatre emergency lights fail with it. Raised with Director’s office, Wed.']],
      footer: 'Signed T. Mercer. The flaw was reported — to the Director — two days before the Gala.' },
    notes: 'A fault in the archive would black out the whole theatre. Adrian knew.'
  },
  ev_sealed_letter: {
    title: 'Celeste’s sealed letter', cat: 'letters', icon: 'letter', source: 'Hidden compartment', found: 'The Old Archive', date: 'Received months ago', canon: true,
    people: ['celeste', 'beatrix'],
    doc: { type: 'letter', hand: true, sealed: true, salutation: 'B. —',
      lines: ['I’m alive. I have a different name now, outside Vesper. I have been watching from a distance, which is a coward’s word for waiting.', 'I didn’t come back because he would have burned the evidence and then come for everyone who helped me. Starting with you.', 'I am so sorry I left you there with all of it.', 'If anyone ever asks the right questions, tell them: find the original ledger. Not the copy.'],
      sign: '— C.', locked: 'k_letter_opened' },
    notes: 'Find the original ledger. Not the copy.'
  },
  ev_evelyn_letters: {
    title: 'Evelyn’s correspondence', cat: 'letters', icon: 'letter', source: 'Headmistress’s desk', found: 'Administration Offices', date: 'Seven years ago – present', canon: true,
    people: ['evelyn', 'adrian', 'celeste'],
    doc: { type: 'letter', typed: true, salutation: 'From the files of E. Ashcroft',
      lines: ['(Copy, seven years ago) — “Adrian: I have done as you asked. The form is countersigned. The technician has gone. I will not do it again.”', '(Anonymous, received this spring) — “You countersigned a lie. You can still sign the truth.”', '(Anonymous, received this summer) — “He still has the ledger. He always kept two.”', '(Evelyn’s own note, undated) — “Find it before he decides to use it.”'],
      sign: '' },
    notes: 'The cover-up, in her own hand. And someone has been writing to her.'
  },
  ev_photo_half_b: {
    title: 'Torn photograph (left half)', cat: 'photos', icon: 'polaroid', source: 'Beatrix’s envelope drawer', found: 'Given by Beatrix', date: 'Seven years ago',
    people: ['beatrix', 'celeste'],
    doc: { type: 'photo', img: 'polaroid', torn: 'left', caption: 'Beatrix, younger, on a stairwell — actually smiling — holding out a hand to someone on the missing half.', back: 'P… Vesper Central — … — … 47 — “if they burn the rest”' },
    notes: 'The other half of the photograph from the Forgotten Wing.'
  },
  ev_anon_gala: {
    title: 'Message at the Gala', cat: 'letters', icon: 'letter', source: 'Handed to you by a waiter', found: 'The Velvet Ballroom', date: 'The Crimson Gala, tonight', canon: true,
    people: [],
    doc: { type: 'letter', hand: true, salutation: '', lines: ['11:17. The theatre. Come alone.'], sign: '' },
    notes: 'The same hand as the photograph under your door.'
  },
  ev_original_ledger: {
    title: 'The original ledger', cat: 'official', icon: 'bound_diary', source: 'Inside the Grand Theatre clock', found: 'The Grand Theatre', date: 'Seven to twelve years ago', canon: true,
    people: ['adrian', 'evelyn', 'celeste', 'julian', 'theo'],
    doc: { type: 'ledger', header: 'THE RED LEDGER — ORIGINAL',
      rows: [['Donors', 'Eleven named patrons, sums and “arrangements”'], ['Rankings', 'Every altered placing for five years, with the original beside it'], ['Scholarships', 'Duplicate payments — where the money actually went'], ['Cover-up', 'Withdrawal form: “prepared by A.V., countersigned E.A.”'], ['Affected students', 'Forty-three names. Hale. Okafor. Marsh. Wren. …']],
      footer: 'The scheme did not simply steal money. It changed people’s futures.' },
    notes: 'The whole conspiracy, in one book — and a list of everyone it hurt.'
  }
};

CV.DATA.connections = [
  { id: 'c_signature', a: 'ev_withdrawal', b: 'ev_library_card', title: 'Not her hand',
    text: 'Celeste’s real signature is quick and joined, the W like two hands holding. The withdrawal form is signed in careful, separated letters — someone copying a name, not writing their own. Celeste never signed her withdrawal.',
    fx: { cred: 8, j: ['j_c_forged'], v: { celeste_truth: 1 } } },
  { id: 'c_erased', a: 'ev_register', b: 'ev_ranking_sheet', title: 'Erased twice',
    text: 'Celeste was scored out of the register — and struck from first place on the ranking sheet, with “withdrawn” added later in different ink. The rankings were revised three days before the Gala. Her disappearance was written into the paperwork before it happened.',
    fx: { cred: 5, j: ['j_t_ranking'] } },
  { id: 'c_blackout_records', a: 'ev_torn_ledger', b: 'ev_maintenance_report', title: 'The same minute',
    text: 'The torn ledger page records a ranking moved “per donor” and a payment never received — with 11:17 PM pencilled at the bottom. Theo’s carbon shows the blackout began on the archive feed at 11:17 PM. The blackout and the altered records are connected.',
    fx: { cred: 8, j: ['j_c_connected'], v: { celeste_truth: 1 } } },
  { id: 'c_scapegoat', a: 'ev_newspaper', b: 'ev_maintenance_report', title: 'A convenient young man',
    text: 'Adrian Voss told the Courier an inexperienced technician made a regrettable error. Theo’s carbon says the archive junction was forced open and the fuse bridged. The official report was retyped to blame him.',
    fx: { cred: 5, j: ['j_t_theo'], set: ['k_theo_cleared_proof'] } },
  { id: 'c_adrian_hand', a: 'ev_scholarship_copies', b: 'ev_julian_letter', title: 'In his own words',
    text: 'The alteration schedule is approved “A. Voss”. Julian’s letter, from Adrian, confirms his ranking was revised “following a revision” and asks him not to embarrass the patrons. The donors bought rankings; the Director arranged them.',
    fx: { cred: 10, j: ['j_c_adrian'], v: { adrian_suspicion: 5 } } },
  { id: 'c_corridor', a: 'ev_photo_1117', b: 'ev_fabric', title: 'Three minutes before',
    text: 'At 11:14 the clock was running and Celeste was slipping toward the archive corridor in her burgundy ribbon. Odette found that ribbon torn on the archive corridor floor after the lights came back.',
    fx: { cred: 3, j: ['j_t_corridor'] } },
  { id: 'c_circuit', a: 'ev_lighting_plan', b: 'ev_security_log', title: 'The shared circuit',
    text: 'The archive feed shared the theatre’s emergency relay — Theo warned the Director two days before. At 11:12 the Director entered the archive corridor. At 11:17 everything went dark. Something happened in the archive that broke the circuit.',
    fx: { cred: 5, j: ['j_t_circuit'] } },
  { id: 'c_cover', a: 'ev_evelyn_letters', b: 'ev_withdrawal', title: 'Countersigned',
    text: 'The forged withdrawal form is countersigned by E. Ashcroft. In her own copy to Adrian: “The form is countersigned. The technician has gone. I will not do it again.”',
    fx: { cred: 5, j: ['j_c_evelyn'], set: ['k_eve_knew'] } },
  { id: 'c_last_photo', a: 'ev_photo_half_a', b: 'ev_photo_half_b', title: 'The last photograph',
    text: 'The two halves meet: Beatrix and Celeste on a stairwell, reaching for each other. Across the back, the writing joins: “Platform 4 — Vesper Central — left luggage — no. 147 — if they burn the rest.” Celeste left another copy.',
    fx: { j: ['j_d_second_copy'], set: ['k_second_copy'] } }
];
