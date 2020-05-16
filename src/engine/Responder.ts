import * as PIXI from 'pixi.js';

export default class Responder {
  private stage: PIXI.DisplayObject;
  constructor(app: PIXI.Application) {
    this.stage = app.stage;
    this.stage.interactive = true;
  }

  // TODO: on, once, removeListener の型が色々渡しすぎて無駄に複雑なので調整?

  on(event: string | symbol, fn: Function) {
    this.stage.on(event, fn);
  }

  once(event: string | symbol, fn: Function) {
    this.stage.once(event, fn);
  }

  removeListener(event: string | symbol, fn?: Function) {
    this.stage.removeListener(event, fn);
  }
}
