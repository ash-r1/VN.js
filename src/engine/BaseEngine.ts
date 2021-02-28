import * as PIXI from 'pixi.js';

import Control from './modules/control';
import Image from './modules/image';
import Message from './modules/message';
import { Scenarios } from './scenario';
import ScenarioController from './scenario/ScenarioController';

export default abstract class BaseEngine {
  app?: PIXI.Application;
  worldContainer?: PIXI.Container;
  scenarioController: ScenarioController;
  _: Control;
  image: Image;
  message: Message;

  constructor(scenarios: Scenarios<BaseEngine>) {
    this.scenarioController = new ScenarioController(scenarios);
    this.image = new Image();
    this.message = new Message('game/textbox.png', {
      layout: {
        y: 630,
        height: 420,
        width: 1920,
        padding: {
          left: 450,
          top: 100,
        },
      },
      style: {
        fontFamily: 'Noto Serif JP',
        fill: '#1e1e1e',
        align: 'left',
        fontSize: 36,
        fontWeight: '500',
        lineHeight: 50,
      },
    });
    this._ = new Control();
  }
}
