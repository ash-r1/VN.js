import * as PIXI from 'pixi.js';

// include pixi-sound to modify loader ... ?
import 'pixi-sound';

import FontFaceObserver from 'fontfaceobserver';

import Game from './engine/Game';
import Renderer from './engine/Renderer';
import Responder from './engine/Responder';
import scenario1 from './scenario/scenario1';

const canvas = document.getElementById('game');

PIXI.settings.RESOLUTION = window.devicePixelRatio;

const app = new PIXI.Application({
  width: 1920,
  height: 1080,
  view: canvas as HTMLCanvasElement,
  antialias: true,
});
// TODO: 画面内の位置とかズーム率とか上手い具合に扱う必要がある....?

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

const renderer = new Renderer(app);
const responder = new Responder(app);
const game = new Game(renderer, responder);

(async () => {
  const notoSerif = new FontFaceObserver('Noto Serif JP');
  await notoSerif.load();
  game.run(scenario1);
})();
