import * as PIXI from 'pixi.js';

import Image from './modules/image';
import { Scenarios } from './scenario';

export default abstract class BaseEngine {
  app?: PIXI.Application;
  worldContainer?: PIXI.Container;
  image: Image;

  constructor(public scenarios: Scenarios<BaseEngine>) {
    this.image = new Image();
  }
}
