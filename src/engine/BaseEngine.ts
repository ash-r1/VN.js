import * as PIXI from 'pixi.js';

import { Scenarios } from './scenario';

export default class BaseEngine {
  app?: PIXI.Application;
  worldContainer?: PIXI.Container;

  constructor(public scenarios: Scenarios) {
    //
  }
}
