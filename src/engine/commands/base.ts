import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import tickPromise from './tickPromise';

export interface LayerProps {
  x?: number;
  y?: number;
  alpha?: number;
  width?: number;
  height?: number;
  // TODO: angle
  // TODO: filter, filterArea
  // TODO: localTransform
  // TODO: rotation
}

export default abstract class Base {
  constructor(protected r: Renderer) {}

  protected setLayerProps(layer: PIXI.DisplayObject, props: LayerProps) {
    // TODO: make it typesafe-implementation
    ['x', 'y', 'width', 'height', 'alpha'].forEach((property) => {
      if (props[property]) {
        layer[property] = props[property];
      }
    });
  }

  protected async fadeIn(
    layer: PIXI.DisplayObject,
    duration: number
  ): Promise<void> {
    await tickPromise(this.r.ticker, duration, (rate) => {
      this.setLayerProps(layer, { alpha: rate });
    });
  }

  protected async fadeOut(
    layer: PIXI.DisplayObject,
    duration: number
  ): Promise<void> {
    await tickPromise(this.r.ticker, duration, (rate) => {
      this.setLayerProps(layer, { alpha: 1 - rate });
    });
  }
}
