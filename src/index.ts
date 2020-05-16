import * as PIXI from 'pixi.js';

import Game from './engine/Game';
import scenario1 from './scenario/scenario1';

const app = new PIXI.Application({ width: 1280, height: 720 });

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

const game = new Game(app);
game.run(scenario1);
