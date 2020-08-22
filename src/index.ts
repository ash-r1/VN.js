import * as PIXI from 'pixi.js';

// To modify PIXI.loader before initialization, we must include pixi-sound here.
import 'pixi-sound';

import Game from './engine/Game';
import Renderer from './engine/Renderer';
import Responder from './engine/Responder';

export { Game, Renderer, Responder, PIXI };
