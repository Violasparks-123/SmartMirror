/* trust.js — relationship states.
 * States are not a straight ladder: a character can be "Strained" or
 * "Suspicious" because of something you did, whatever their trust number. */
(function () {
  var CV = window.CV;

  CV.REL_STATES = {
    unknown:    { id: 'unknown',    label: 'Unknown',    desc: 'They know very little about you.' },
    guarded:    { id: 'guarded',    label: 'Guarded',    desc: 'Cautious, and reluctant to share.' },
    warming:    { id: 'warming',    label: 'Warming',    desc: 'Beginning to feel comfortable with you.' },
    trusted:    { id: 'trusted',    label: 'Trusted',    desc: 'Willing to share sensitive things.' },
    loyal:      { id: 'loyal',      label: 'Loyal',      desc: 'Personally invested in you.' },
    strained:   { id: 'strained',   label: 'Strained',   desc: 'Something you did has damaged this.' },
    suspicious: { id: 'suspicious', label: 'Suspicious', desc: 'Actively questioning your intentions.' }
  };

  CV.relState = function (npc, S) {
    S = S || CV.S;
    if (S.rel[npc]) return CV.REL_STATES[S.rel[npc]];
    if (!S.met[npc]) return CV.REL_STATES.unknown;
    var t = S.trust[npc] || 0;
    if (t >= 75) return CV.REL_STATES.loyal;
    if (t >= 50) return CV.REL_STATES.trusted;
    if (t >= 30) return CV.REL_STATES.warming;
    return CV.REL_STATES.guarded;
  };

  /* how many personal route beats each character has (for progress pips) */
  CV.ROUTE_MAX = { beatrix: 2, julian: 2, odette: 1, theo: 2 };

  CV.trustMeter = function (npc, big) {
    var t = CV.S.trust[npc] || 0, n = 10, on = Math.round(t / 10), h = '';
    for (var i = 0; i < n; i++) h += '<i class="' + (i < on ? 'on' : '') + '"></i>';
    return '<span class="trust-meter' + (big ? ' big' : '') + '" title="Trust ' + t + ' / 100" role="img" aria-label="Trust ' + t + ' of 100">' + h + '</span>';
  };

  CV.relBadge = function (npc) {
    var r = CV.relState(npc);
    return '<span class="rel-badge rel-' + r.id + '">' + r.label + '</span>';
  };

  CV.hasMet = function (npc) { return !!CV.S.met[npc]; };
})();
