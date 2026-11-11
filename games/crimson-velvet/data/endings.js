/* CRIMSON VELVET — ENDINGS (titles & outcomes are canon; prose expanded)
 * Checked top to bottom; the first whose `req` matches is the ending.
 * Each ending depends on combinations of evidence, connections, trust,
 * credibility and decisions — never a single score.
 */
CV.DATA.endings = [
  { id: 'unwritten_burned', n: 4, cat: 'Failure ending', title: 'The Unwritten Record',
    req: { f: ['ledger_destroyed'], nf: ['final_secret'] },
    vars: { scholarship_fraud_exposed: false },
    text: ['The ledger burns in a fire bucket in the wings of the Grand Theatre, and with it, the only proof that would have held. Adrian Voss closes his pocket watch and walks back to the Gala.',
      'By morning, the investigation is “a misunderstanding”. Copies are called forgeries. Witnesses are called disgruntled. The characters become divided over who trusted whom too early.',
      'Celeste disappears again. The Conservatory continues as though nothing happened — which, as far as its records are concerned, nothing did.'] },

  { id: 'secret', n: 5, cat: 'Secret ending', title: 'The Last Photograph',
    req: { f: ['final_secret', 'k_second_copy'] },
    vars: { scholarship_fraud_exposed: true, celeste_identity_protected: false, truth_revealed: true },
    text: ['You don’t expose the institution that night. Instead, at dawn, you walk with Celeste to Vesper Central Station, Platform 4, and a left-luggage locker numbered 147. Inside: her second copy of everything, kept “if they burn the rest”.',
      'She writes the story herself, in her own name, in her own words. The Courier prints all of it. The forty-three names. The rankings. The forged withdrawal. The girl who was erased, signing her name properly at the bottom.',
      'The final scene is a railway platform in the rain. Celeste leaves the city with a ticket stub she intends to keep. But this time she is not running away. She is choosing where her life goes next.'] },

  { id: 'rash', n: 4, cat: 'Failure ending', title: 'The Unwritten Record',
    req: { f: ['final_rash'] },
    vars: { scholarship_fraud_exposed: false },
    text: ['You take the Ballroom stage and denounce Evelyn Ashcroft in front of every patron in Vesper. She does not deny it. She simply asks, very calmly, who designed the scheme — and you realise you have exposed the wrong person first.',
      'In the uproar, Adrian Voss leaves early. By the time anyone thinks to look for the original ledger, it has been destroyed, and the public investigation is already being conducted on his terms.',
      'Celeste disappears again. The Conservatory continues operating as though nothing happened.'] },

  { id: 'glass', n: 1, cat: 'Truth ending', title: 'The House of Glass',
    req: { f: ['final_truth', 'k_ledger_found', 'recon_success'], conn: ['c_signature', 'c_blackout_records', 'c_adrian_hand'], cred: 45 },
    vars: { scholarship_fraud_exposed: true, celeste_identity_protected: false, truth_revealed: true },
    text: ['You release the complete evidence to the public: the original ledger, the copies, the forged withdrawal, the porter’s log and the letters. Adrian Voss’s scheme is exposed in his own handwriting.',
      'The scholarship fraud becomes public knowledge. The forty-three affected students are named, contacted and recognised. The Conservatory is forced to reform under an independent board.',
      'Celeste Wren’s name is restored — to the register, to the ranking, to the trophy. The Conservatory loses its spotless reputation, but the truth finally becomes part of its history.'] },

  { id: 'unwritten_premature', n: 4, cat: 'Failure ending', title: 'The Unwritten Record',
    req: { f: ['final_truth'] },
    vars: { scholarship_fraud_exposed: false },
    text: ['You release what you have — but too much of it is copies, fragments and things you never quite connected. Adrian Voss’s lawyers take the pieces apart one by one in the Courier’s letters page.',
      'The original evidence is “lost”. The public investigation becomes a story about an overzealous restorer. The characters become divided over who should have waited.',
      'Celeste disappears again. The Conservatory continues as though nothing happened.'] },

  { id: 'quiet', n: 2, cat: 'Protection ending', title: 'A Quiet Exit',
    req: { f: ['final_protect', 'k_ledger_found'] },
    vars: { scholarship_fraud_exposed: true, celeste_identity_protected: true },
    text: ['You release enough to stop Adrian: the ledger pages that hang him, and nothing that names the girl who hid them. The governors act within the week. Adrian’s influence evaporates like rain off the front steps.',
      'The Conservatory changes, but the public never learns the full story. Nobody ever writes the name Celeste Wren in a newspaper.',
      'Celeste leaves Vesper City again, by night, with a burgundy ribbon in her pocket. And Beatrix accepts that protecting someone can sometimes mean letting them go.'] },

  { id: 'arrangement', n: 3, cat: 'Compromise ending', title: 'The Velvet Arrangement',
    req: { f: ['final_arrangement'] },
    vars: { scholarship_fraud_exposed: false, celeste_identity_protected: true },
    text: ['You honour the arrangement. The evidence goes into Adrian’s hands, and a private settlement comes out of them: the affected scholarships restored quietly, with letters that apologise for nothing.',
      'The full scandal remains hidden. The institution survives, but its history remains incomplete. Some people forgive you. Others never do.'] }
];

/* Personal resolutions — first matching line for each character is shown. */
CV.DATA.codas = {
  beatrix: [
    { if: { f: ['k_bea_arc', 'reunion'] }, text: 'Beatrix stops living under the weight of her silence. She opens the restricted section to anyone who asks, and drinks her tea while it’s still hot.' },
    { if: { f: ['k_letter_together'] }, text: 'Beatrix keeps the opened letter in her desk drawer, unhidden. She says it’s for filing reasons. It isn’t.' },
    { if: { rel: { beatrix: 'strained' } }, text: 'Beatrix is polite to you. Only polite. It is the coldest thing she knows how to be.' },
    { text: 'Beatrix goes back to her archive. Some of the silence lifts. Not all of it.' }
  ],
  julian: [
    { if: { f: ['julian_public'] }, text: 'Julian rejects the undeserved legacy of his scholarship in a letter to the Courier — then plays a recital so good that nobody can say he needed it.' },
    { if: { f: ['julian_trusts_you'], any: [{ f: ['final_truth'] }, { f: ['final_secret'] }] }, text: 'Julian’s letter becomes part of the record. He returns the Crimson Prize, and finishes the composition that always stopped halfway.' },
    { if: { f: ['final_protect'] }, text: 'Julian wanted complete transparency. He tells you, smiling, that he understands. He is smiling the way he does when he is annoyed.' },
    { text: 'Julian keeps playing. He no longer knows whether the applause is for him, and decides, slowly, that he can live with not knowing.' }
  ],
  odette: [
    { if: { f: ['revealed_odette'] }, text: 'Odette never quite trusts you again after you told the Headmistress about her key. She still fixes your collar. She doesn’t chatter while she does it.' },
    { if: { f: ['k_ode_arc'] }, text: 'Odette stops treating every painful truth as a performance. She tells the story of the Gala once, plainly, with no jokes. Then she makes a very good one about it.' },
    { text: 'Odette adds the Gala programme back into her scrapbook, the inked-over name restored in her own handwriting.' }
  ],
  theo: [
    { if: { f: ['theo_published'] }, text: 'Theo’s name is cleared in the Courier weeks before the Gala. He buys a dog. He names it Carbon.' },
    { if: { conn: ['c_scapegoat'], any: [{ f: ['final_truth'] }, { f: ['final_secret'] }, { f: ['final_protect'] }] }, text: 'Theo clears his name and regains his dignity. The Conservatory offers him his old job back. He tells them he’ll think about it, and enjoys making them wait.' },
    { text: 'Theo keeps the carbon in his drawer. Some days he takes it out and reads it. It still says what it always said.' }
  ],
  evelyn: [
    { if: { f: ['evelyn_ally'], any: [{ f: ['final_truth'] }, { f: ['final_secret'] }] }, text: 'Evelyn does not deny it. She resigns, gives evidence, and faces the consequences of protecting the institution. She is not forgiven. She does not ask to be.' },
    { if: { f: ['final_arrangement'] }, text: 'Evelyn keeps her office. She arranges the objects on her desk at exact right angles and does not sleep any better.' },
    { text: 'Evelyn faces an inquiry. She answers every question precisely, and volunteers nothing.' }
  ],
  adrian: [
    { if: { any: [{ f: ['final_truth', 'k_ledger_found'] }, { f: ['final_secret'] }] }, text: 'Adrian Voss is charged. In court he speaks elegantly, almost kindly, and for the first time in his life nobody finds him reasonable.' },
    { if: { f: ['final_protect'] }, text: 'Adrian loses every seat on every board in Vesper. He still checks his watch. There is nowhere left he needs to be.' },
    { text: 'Adrian Voss keeps his corner table at the Velvet Note.' }
  ],
  celeste: [
    { if: { f: ['final_secret'] }, text: 'Celeste reclaims her identity and decides her future. She keeps the ticket stub.' },
    { if: { f: ['final_truth'], nf: ['ledger_destroyed'] }, text: 'Celeste’s name goes back into the register in fresh ink. She visits once, to see it, and leaves the same day.' },
    { if: { f: ['final_protect'] }, text: 'Celeste writes to Beatrix every month now, under a new name. Beatrix answers every one.' },
    { text: 'Celeste is gone again. Somewhere, she is still writing letters.' }
  ]
};
