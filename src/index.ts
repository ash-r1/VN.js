import * as PIXI from 'pixi.js';

import Game from './engine/Game';
import Renderer from './engine/Renderer';
import scenario1 from './scenario/scenario1';

const app = new PIXI.Application({ width: 1280, height: 720 });

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

const renderer = new Renderer(app);
const game = new Game(renderer);
game.run(scenario1);
