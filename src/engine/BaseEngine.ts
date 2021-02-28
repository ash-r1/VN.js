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
      y: 630,
      height: 420,
      width: 1920,
      paddingLeft: 440,
      paddingTop: 100,
    });
    this._ = new Control();
  }
}
