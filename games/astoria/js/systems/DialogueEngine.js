// DialogueEngine — walks a conversation graph one beat at a time.
// The UI asks `next()` for the next beat (a line, a set of choices, or the
// end) and calls `choose(i)`; all consequences go through applyFx.
import { CONVOS } from '../data/dialogue/index.js';
import { check, describe } from './Conditions.js';
import { Journal } from './JournalManager.js';
import { applyFx } from './Effects.js';
import { st } from '../core/GameState.js';

export class DialogueSession {
  constructor(convoId, { npc = null } = {}) {
    this.id = convoId;
    this.convo = CONVOS[convoId];
    if (!this.convo) throw new Error(`Unknown conversation: ${convoId}`);
    this.npc = npc;
    this.queue = [];
    this.pendingChoices = null;
    this.afterQueue = null;   // what to do once queued lines are shown
    this.ended = false;
    this.enter('start');
  }

  enter(nodeId) {
    const node = this.convo.nodes[nodeId];
    if (!node) { this.ended = true; return; }
    this.node = node;
    if (node.fx) applyFx(node.fx);
    this.queue = [...(node.l || [])];
    this.afterQueue = { type: 'node' };
  }

  next() {
    if (this.ended) return { type: 'end' };
    // A line may carry a condition as its third element: shown only if true.
    while (this.queue.length) {
      const [speaker, text, cond] = this.queue.shift();
      if (cond && !check(cond)) continue;
      return { type: 'line', speaker, text };
    }
    const after = this.afterQueue;
    if (after?.type === 'goto') { this.enter(after.to); return this.next(); }
    if (after?.type === 'end') { this.ended = true; return { type: 'end' }; }
    // Node finished: offer choices, follow `to`, or end.
    const node = this.node;
    if (node.c) {
      // `cond` hides a choice entirely; `req` shows it locked, with what it needs,
      // until Astoria has earned it (a bond, a path, a piece of evidence, a memory).
      const choices = node.c.map((c, i) => ({ ...c, i }))
        .filter((c) => check(c.cond))
        .map((c) => {
          if (!c.req) return c;
          const need = c.hint ? [c.hint] : describe(c.req);
          return check(c.req) ? { ...c, earned: need } : { ...c, locked: true, need };
        });
      if (choices.some((c) => !c.locked)) {
        this.pendingChoices = choices;
        choices.filter((c) => c.locked).forEach((c) => Journal.noteUnspoken(this.key(c), { text: c.t, need: c.need, npc: this.npc || c.npc || (c.req?.rel ? Object.keys(c.req.rel)[0] : null) || (c.req?.mem ? Object.keys(c.req.mem)[0] : null) }));
        return { type: 'choices', choices };
      }
    }
    // `go`: branch to the first node whose condition holds.
    if (node.go) {
      const g = node.go.find((x) => check(x.cond));
      if (g) { this.enter(g.to); return this.next(); }
    }
    if (node.to) { this.enter(node.to); return this.next(); }
    this.ended = true;
    return { type: 'end' };
  }

  key(c) { return `${this.id}:${c.i}:${c.t.slice(0, 24)}`; }

  choose(index) {
    const choice = this.pendingChoices?.find((c) => c.i === index);
    if (!choice || choice.locked) return;
    if (choice.earned) Journal.saidUnspoken(this.key(choice), { text: choice.t, need: choice.earned, npc: this.npc || choice.npc || (choice.req?.rel ? Object.keys(choice.req.rel)[0] : null) || (choice.req?.mem ? Object.keys(choice.req.mem)[0] : null) });
    this.pendingChoices = null;
    if (choice.path) applyFx({ path: choice.path });
    if (choice.fx) applyFx(choice.fx);
    this.queue = [...(choice.l || [])];
    this.afterQueue = choice.to ? { type: 'goto', to: choice.to } : { type: 'end' };
    if (choice.t && !choice.t.startsWith('(')) st().journal.lastChoice = choice.t;
  }
}
