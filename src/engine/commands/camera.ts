import EventEmitter from 'eventemitter3';

import { Result } from 'src/engine/commands/command';
import Renderer from 'src/engine/Renderer';

import Base from './base';
import {
  CHANGE,
  ChangeEvent,
  HIDE,
  HideEvent,
  MOVE,
  MoveEvent,
  position,
  SHOW,
  ShowEvent,
  Xpos,
} from './character';

// TODO: position adjustment

/**
 * move bg & fg layers to show camera-ish
 */
export default class Camera extends Base {
  private locked = false;

  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);

    ee.on(SHOW, this.onShow);
    ee.on(HIDE, this.onHide);
    ee.on(MOVE, this.onMove);
    ee.on(CHANGE, this.onChange);
  }

  async lock(): Promise<Result> {
    this.locked = true;
    return {
      wait: false,
    };
  }

  async unlock(): Promise<Result> {
    this.locked = false;
    return {
      wait: false,
    };
  }

  async move(xpos: Xpos): Promise<Result> {
    await this.moveCameraTo(position[xpos] * this.r.width, true);
    return {
      wait: false,
    };
  }

  onShow = (ev: ShowEvent) => {
    // TODO: wait until moving? how to do it...?
    // Plan: Hook yield on Game instance?
    this.moveCameraTo(position[ev.xpos] * this.r.width);
  };

  onHide = (ev: HideEvent) => {
    console.log(`hide: ${ev.name}`);
  };

  onChange = (ev: ChangeEvent) => {
    this.moveCameraTo(position[ev.xpos] * this.r.width);
  };

  onMove = (ev: MoveEvent) => {
    this.moveCameraTo(position[ev.xpos] * this.r.width);
  };

  private moveCameraTo = async (x: number, force = false) => {
    if (this.locked && !force) {
      return;
    }
    const pos = x - this.r.width / 2.0;
    const { bg, fg } = this.r.layers;
    // limit to 5% for bg
    this.moveTo(bg, { x: -pos * 0.05 }, 500);
    await this.moveTo(fg, { x: -pos * 0.1 }, 500);
    // TODO Promise.all to do them concurrently?
    // ... or, create "moveMultiTo"-ish method to exact one ticker hook animation?
  };
}
