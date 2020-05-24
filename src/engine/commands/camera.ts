import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import Crossfade from '../layer/Crossfade';
import { layerName } from '../Renderer';
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
} from './character';

// TODO: position adjustment

/**
 * move bg & fg layers to show camera-ish
 */
export default class Camera extends Base {
  private x: number;
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);

    this.x = r.width / 2.0;

    ee.on(SHOW, this.onShow);
    ee.on(HIDE, this.onHide);
    ee.on(MOVE, this.onMove);
    ee.on(CHANGE, this.onChange);
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

  private moveCameraTo = (x: number) => {
    const pos = x - this.r.width / 2.0;
    const { bg, fg } = this.r.layers;
    // limit to 5% for bg
    this.moveTo(bg, { x: -pos * 0.05 }, 500);
    this.moveTo(fg, { x: -pos * 0.1 }, 500);
    // TODO Promise.all to do them concurrently?
    // ... or, create "moveMultiTo"-ish method to exact one ticker hook animation?
  };
}
