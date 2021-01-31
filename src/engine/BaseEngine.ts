import * as PIXI from 'pixi.js';

import Control from './modules/control';
import Image from './modules/image';
import { Scenarios } from './scenario';

export default abstract class BaseEngine {
  app?: PIXI.Application;
  worldContainer?: PIXI.Container;
  _: Control;
  image: Image;

  constructor(public scenarios: Scenarios<BaseEngine>) {
    this.image = new Image();
    this._ = new Control();
  }
}
