/* CRIMSON VELVET — JOURNAL & CHAPTERS
 * kind: confirmed | assumption | contradiction | question | theory | reflection
 * supersedes: an earlier entry this one revises (shown struck through above it)
 */
CV.DATA.journalSections = [
  { id: 'case', title: 'Case Notes' }, { id: 'timeline', title: 'Timeline' }, { id: 'people', title: 'People' },
  { id: 'theories', title: 'Theories' }, { id: 'questions', title: 'Unanswered Questions' },
  { id: 'discoveries', title: 'Important Discoveries' }, { id: 'reflections', title: 'Personal Reflections' }, { id: 'recaps', title: 'Chapter Recaps' }
];

CV.DATA.journal = {
  j_case_open: { sec: 'case', kind: 'confirmed', text: 'I have been invited to Vesper Conservatory for an “archival restoration project”. Nobody has said why me. The invitation came with a note: “Some things are only forgotten because someone benefits from forgetting them.”' },
  j_case_photo: { sec: 'case', kind: 'question', text: 'A photograph of the Grand Theatre under my door. On the back: “11:17. Don’t trust the official records.” Who knew which room I was in?' },
  j_case_official: { sec: 'case', kind: 'assumption', text: 'Official story: seven years ago a student withdrew from the Conservatory for personal reasons, on the night of the Crimson Gala.' },
  j_c_forged: { sec: 'case', kind: 'contradiction', supersedes: 'j_case_official', text: 'The official story is false. Celeste Wren never signed her withdrawal. Someone copied her name.' },
  j_c_connected: { sec: 'discoveries', kind: 'confirmed', text: 'The blackout and the altered records are connected. Both point to 11:17 PM, and both point to the archive.' },
  j_c_adrian: { sec: 'discoveries', kind: 'confirmed', text: 'Adrian Voss, the former director, personally approved the altered rankings. Donors paid; he arranged.' },
  j_c_evelyn: { sec: 'discoveries', kind: 'confirmed', text: 'Evelyn Ashcroft countersigned the forged withdrawal. She helped bury it.' },
  j_d_second_copy: { sec: 'discoveries', kind: 'confirmed', text: 'The torn photograph, joined: “Platform 4 — Vesper Central — left luggage — no. 147 — if they burn the rest.” Celeste kept another copy of the evidence.' },
  j_d_recon: { sec: 'discoveries', kind: 'confirmed', text: 'Reconstruction: Adrian confronted Celeste in the archive. In the struggle the forced junction failed, and the shared circuit took the theatre dark at 11:17. Celeste escaped through the underground passage. Beatrix helped her. Theo was blamed. Odette saw part of it. Julian benefited without knowing. Evelyn buried it.' },
  j_d_alive: { sec: 'discoveries', kind: 'confirmed', supersedes: 'j_q_where', text: 'Celeste is alive. She has been living under another name outside Vesper. She wrote to Beatrix. She wants the original ledger — not the copy.' },
  j_d_ledger: { sec: 'discoveries', kind: 'confirmed', supersedes: 'j_q_original', text: 'The original ledger was inside the Grand Theatre clock, stopped at 11:17 to mark the moment the institution lost control of its own story. It lists forty-three students whose futures were rewritten.' },

  j_t_gala: { sec: 'timeline', kind: 'confirmed', ts: '1', text: 'Seven years ago — the Crimson Gala. Rankings announced at 11:10.' },
  j_t_ranking: { sec: 'timeline', kind: 'confirmed', ts: '0', text: 'Three days before the Gala — the scholarship ranking is revised. Celeste is struck from first place. Julian is moved up.' },
  j_t_corridor: { sec: 'timeline', kind: 'confirmed', ts: '2', text: '11:14 PM — Celeste heads for the archive corridor. Her ribbon is later found torn there.' },
  j_t_circuit: { sec: 'timeline', kind: 'confirmed', ts: '3', text: '11:12 PM — Adrian Voss enters the archive corridor. 11:17 PM — the archive feed fails and takes the theatre’s emergency lights with it.' },
  j_t_blackout: { sec: 'timeline', kind: 'confirmed', ts: '4', text: '11:17 PM — total blackout. When the lights return, Celeste Wren is gone.' },
  j_t_theo: { sec: 'timeline', kind: 'confirmed', ts: '5', text: 'The week after — Theo Mercer is dismissed and publicly blamed. The official report was retyped to say so.' },

  j_p_beatrix: { sec: 'people', kind: 'assumption', text: 'Beatrix Vale. Precise, dry, impossible to read. She went very still when I mentioned the archive.' },
  j_p_beatrix2: { sec: 'people', kind: 'confirmed', supersedes: 'j_p_beatrix', text: 'Beatrix knew Celeste. She has been pretending not to for seven years, in the room full of the records she helped hide.' },
  j_p_julian: { sec: 'people', kind: 'assumption', text: 'Julian Cross. Charming, and very good at answering a question with another question. Calls the Conservatory home.' },
  j_p_julian2: { sec: 'people', kind: 'confirmed', supersedes: 'j_p_julian', text: 'Julian’s scholarship was manipulated. He’s known something was wrong for years and chose not to look. He is genuinely gifted, which makes it worse for him, not better.' },
  j_p_odette: { sec: 'people', kind: 'assumption', text: 'Odette Laurent. Talks like a stage play and notices everything. Calls this place a stage. Tells every sad story as a funny one.' },
  j_p_odette2: { sec: 'people', kind: 'confirmed', supersedes: 'j_p_odette', text: 'Odette saw Adrian enter the archive before the blackout and found Celeste’s torn ribbon. She took the corridor key because she was afraid. She has kept all of it for seven years.' },
  j_p_theo: { sec: 'people', kind: 'assumption', text: 'Theo Mercer. Blunt. Says the Conservatory ruined his life and doesn’t elaborate.' },
  j_p_theo2: { sec: 'people', kind: 'confirmed', supersedes: 'j_p_theo', text: 'Theo was blamed for the blackout. He came back to the Conservatory to find out what really happened, and kept the carbon that proves it wasn’t him.' },
  j_p_evelyn: { sec: 'people', kind: 'assumption', text: 'Evelyn Ashcroft, Headmistress. Precise, formal, and she adjusted her gloves before saying the word “archive”.' },
  j_p_adrian: { sec: 'people', kind: 'assumption', text: 'Adrian Voss — former director. Portrait in the foyer with a gold pocket watch. “He gave Vesper its reputation.”' },
  j_p_adrian2: { sec: 'people', kind: 'confirmed', supersedes: 'j_p_adrian', text: 'Adrian Voss sounds entirely reasonable. That is the most dangerous thing about him.' },

  j_th_runaway: { sec: 'theories', kind: 'theory', text: 'She wasn’t taken. Someone helped her leave.' },
  j_th_theo: { sec: 'theories', kind: 'assumption', text: 'The technician who caused the blackout might know where she went.' },
  j_th_theo2: { sec: 'theories', kind: 'contradiction', supersedes: 'j_th_theo', text: 'Theo didn’t cause the blackout. He was the most convenient explanation.' },

  j_q_celeste: { sec: 'questions', kind: 'question', text: 'Who was Celeste Wren, and why was she scored out of the register?' },
  j_q_clock: { sec: 'questions', kind: 'question', text: 'Why has the theatre clock been left stopped at 11:17 for seven years?' },
  j_q_where: { sec: 'questions', kind: 'question', text: 'Where is Celeste?' },
  j_q_original: { sec: 'questions', kind: 'question', text: 'Where is the original ledger? Everything I have found so far is a copy, a page, or a fragment.' },
  j_q_who_writes: { sec: 'questions', kind: 'question', text: 'Who is sending the anonymous notes? “You are looking in the right place. You are asking the wrong people.”' },
  j_a_who_writes: { sec: 'questions', kind: 'confirmed', supersedes: 'j_q_who_writes', text: 'Celeste has been sending the notes — to me, and to Evelyn — for months.' },

  j_r_first: { sec: 'reflections', kind: 'reflection', text: 'It is a beautiful building. Everyone in it is very careful about what they say.' },
  j_r_bea: { sec: 'reflections', kind: 'reflection', text: '“Some people leave places. Some places simply decide to forget them.” I think she has been waiting a long time to say that to someone.' },
  j_r_pieces: { sec: 'reflections', kind: 'reflection', text: 'Each of them knows one part of the truth. Nobody has the whole story. Maybe that’s how it was kept.' },
  j_r_deal: { sec: 'reflections', kind: 'reflection', text: 'Adrian offered me a deal. The worst part is how reasonable it sounded.' },
  j_r_end: { sec: 'reflections', kind: 'reflection', text: 'I have the whole truth now. The question was never only who lied. It is whether the truth can still repair what the lies destroyed.' },

  r_0: { sec: 'recaps', kind: 'reflection', text: 'Prologue — The Invitation. Arrived in a storm. Met Beatrix. A photograph under my door: “11:17. Don’t trust the official records.”' },
  r_1: { sec: 'recaps', kind: 'reflection', text: 'Chapter One — A House of Beautiful Things. Met Julian, Odette and Theo. Found a scratched-out name: Celeste Wren. Her withdrawal was forged.' },
  r_2: { sec: 'recaps', kind: 'reflection', text: 'Chapter Two — The Red Ledger. The rankings were altered before the Gala. A torn ledger page and Theo’s report tie the records to the blackout at 11:17.' },
  r_3: { sec: 'recaps', kind: 'reflection', text: 'Chapter Three — The Forgotten Wing. Odette’s key opened the sealed wing. Adrian Voss signed the alterations. Beatrix admitted she knew Celeste.' },
  r_4: { sec: 'recaps', kind: 'reflection', text: 'Chapter Four — The People Who Stayed. Each of them knew one piece. None of them had the whole story.' },
  r_5: { sec: 'recaps', kind: 'reflection', text: 'Chapter Five — The Blackout. The night reconstructed. The withdrawal was fabricated. But where is Celeste?' },
  r_6: { sec: 'recaps', kind: 'reflection', text: 'Chapter Six — The Last Letter. Celeste is alive. Find the original ledger — not the copy.' },
  r_7: { sec: 'recaps', kind: 'reflection', text: 'Chapter Seven — The Director’s Office. Evelyn confessed what she did. Adrian made me an offer.' }
};
CV.DATA.journalStart = ['j_case_open', 'j_case_official', 'j_r_first'];

/* ---------------- CHAPTERS ----------------
 * advance: when this condition becomes true, the next chapter begins
 * (a title card is shown and the recap is written into the journal). */
CV.DATA.chapters = [
  { n: 0, label: 'Prologue', title: 'The Invitation', advance: { f: ['done_prologue_envelope'] } },
  { n: 1, label: 'Chapter One', title: 'A House of Beautiful Things',
    advance: { f: ['done_beatrix_celeste', 'done_julian_intro', 'done_odette_intro', 'done_theo_intro'], conn: ['c_signature'] } },
  { n: 2, label: 'Chapter Two', title: 'The Red Ledger',
    advance: { f: ['done_odette_key'], conn: ['c_blackout_records'] } },
  { n: 3, label: 'Chapter Three', title: 'The Forgotten Wing', advance: { f: ['done_beatrix_wing'] } },
  { n: 4, label: 'Chapter Four', title: 'The People Who Stayed',
    advance: { count: { n: 3, f: ['done_beatrix_route', 'done_julian_route', 'done_odette_route', 'done_theo_route'] } } },
  { n: 5, label: 'Chapter Five', title: 'The Blackout', advance: { f: ['recon_success'] } },
  { n: 6, label: 'Chapter Six', title: 'The Last Letter', advance: { f: ['done_beatrix_letter'] } },
  { n: 7, label: 'Chapter Seven', title: 'The Director’s Office', advance: { f: ['done_adrian_meeting'] } },
  { n: 8, label: 'Chapter Eight', title: '11:17', advance: null }
];

/* hints shown on the STATS page for what the current chapter still needs */
CV.DATA.chapterHints = {
  0: ['Follow Beatrix inside, then rest in the Guest Quarters.'],
  1: ['Meet Julian, Odette and Theo.', 'Search the archive registers.', 'Ask Beatrix about what you find.', 'Compare the withdrawal signature with something Celeste wrote herself.'],
  2: ['Find out how the scholarship rankings changed.', 'Ask Theo about the blackout.', 'Search the Music Wing.', 'Connect the records to the blackout.', 'Earn Odette’s trust.'],
  3: ['Explore the Forgotten Wing.', 'Open the locked cabinet.'],
  4: ['Each of them knows one piece. Spend time with Beatrix, Julian, Odette and Theo.'],
  5: ['Gather the security log and the lighting plan.', 'Reconstruct the blackout in the Grand Theatre.'],
  6: ['Search the archive again.'],
  7: ['Confront the Headmistress.', 'Find Adrian Voss.'],
  8: ['Attend the Crimson Gala.']
};
