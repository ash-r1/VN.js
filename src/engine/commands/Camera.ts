import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import CommandBase from './base/CommandBase';
import { Command, pure } from './base/commands';
import {
  CHANGE,
  ChangeEvent,
  HIDE,
  HideEvent,
  MOVE,
  MoveEvent,
  SHOW,
  ShowEvent,
} from './Character';
import {
  BEGIN as PARALLEL_BEGIN,
  END as PARALLEL_END,
} from './controls/parallel';

// TODO: position adjustment

/**
 * move bg & fg layers to show camera-ish
 */
export default class Camera extends CommandBase {
  private locked = false;
  private onParallel = false;

  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);

    ee.on(PARALLEL_BEGIN, this.onParallelBegin);
    ee.on(PARALLEL_END, this.onParallelEnd);

    ee.on(SHOW, this.onShow);
    ee.on(HIDE, this.onHide);
    ee.on(MOVE, this.onMove);
    ee.on(CHANGE, this.onChange);
  }

  lock(): Command {
    return pure(async () => {
      this.locked = true;
    });
  }

  unlock(): Command {
    return pure(async () => {
      this.locked = false;
    });
  }

  move(xpos: number): Command {
    return pure(async () => {
      await this.moveCameraTo(xpos * this.r.width, true);
      return {
        wait: false,
      };
    });
  }

  onParallelBegin = () => {
    this.onParallel = true;
  };

  onParallelEnd = () => {
    this.onParallel = false;
  };

  onShow = (ev: ShowEvent) => {
    // TODO: wait until moving? how to do it...?
    // Plan: Hook yield on Game instance?
    this.moveCameraTo(ev.xpos * this.r.width);
  };

  onHide = (ev: HideEvent) => {
    console.log(`hide: ${ev.name}`);
  };

  onChange = (ev: ChangeEvent) => {
    this.moveCameraTo(ev.xpos * this.r.width);
  };

  onMove = (ev: MoveEvent) => {
    this.moveCameraTo(ev.xpos * this.r.width);
  };

  get shouldStay() {
    return this.locked || this.onParallel;
  }

  private moveCameraTo = async (x: number, force = false) => {
    if (this.shouldStay && !force) {
      return;
    }
    const pos = x - this.r.width / 2.0;
    const { bg, fg } = this.r.layers;
    // 5% for bg
    this.moveTo(bg, { x: -pos * 0.05 }, 500);
    // 10% for fg
    await this.moveTo(fg, { x: -pos * 0.1 }, 500);
    // TODO Promise.all to do them concurrently?
    // ... or, create "moveMultiTo"-ish method to exact one ticker hook animation?
  };
}
