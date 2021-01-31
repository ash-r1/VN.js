import * as PIXI from 'pixi.js';

import Control from './modules/control';
import Image from './modules/image';
import { Scenarios } from './scenario';
import ScenarioController from './scenario/ScenarioController';

export default abstract class BaseEngine {
  app?: PIXI.Application;
  worldContainer?: PIXI.Container;
  scenarioController: ScenarioController;
  _: Control;
  image: Image;

  constructor(scenarios: Scenarios<BaseEngine>) {
    this.scenarioController = new ScenarioController(scenarios);
    this.image = new Image();
    this._ = new Control();
  }
}
