import { STORY } from './story.js';
import { STORY2 } from './story2.js';
import { AERIA } from './aeria.js';
import { LUCIEN } from './lucien.js';
import { EVELYNE } from './evelyne.js';
import { CAEL } from './cael.js';
import { SERAPHINE } from './seraphine.js';
import { NOCTIS } from './noctis.js';
import { EVENT_CONVOS } from '../events.js';
import { HEART_CONVOS } from '../hearts.js';
import { GALA_NIGHT } from './gala_night.js';

export const NPC_DIALOGUE = { lucien: LUCIEN, evelyne: EVELYNE, cael: CAEL, seraphine: SERAPHINE, noctis: NOCTIS };

// One registry of every conversation, so hotspots, approaches and quests can
// start any scene by id.
export const CONVOS = {
  ...STORY,
  ...STORY2,
  ...AERIA,
  ...EVENT_CONVOS,
  ...HEART_CONVOS,
  ...GALA_NIGHT,
  ...LUCIEN.convos,
  ...EVELYNE.convos,
  ...CAEL.convos,
  ...SERAPHINE.convos,
  ...NOCTIS.convos,
};
