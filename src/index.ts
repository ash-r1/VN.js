import * as PIXI from 'pixi.js';

import Game from './engine/Game';
import Renderer from './engine/Renderer';
import Responder from './engine/Responder';
import scenario1 from './scenario/scenario1';

const app = new PIXI.Application({ resizeTo: window });
// TODO: 画面内の位置とかズーム率とか上手い具合に扱う必要がある....?

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

const renderer = new Renderer(app);
const responder = new Responder(app);
const game = new Game(renderer, responder);
game.run(scenario1);
