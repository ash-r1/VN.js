import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import tickPromise from './tickPromise';

export interface LayerProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  alpha?: number;
  scale?: number;
  // TODO: angle
  // TODO: filter, filterArea
  // TODO: localTransform
  // TODO: rotation
}

export default abstract class Base {
  constructor(protected r: Renderer) {}

  protected get center(): PIXI.Point {
    return new PIXI.Point(this.r.width / 2.0, this.r.height / 2.0);
  }

  protected setLayerProps(layer: PIXI.DisplayObject, props: LayerProps) {
    // TODO: make it typesafe-implementation
    ['x', 'y', 'width', 'height', 'alpha'].forEach((property) => {
      if (props[property]) {
        layer[property] = props[property];
      }
    });
    if (props.scale) {
      layer.scale.set(props.scale, props.scale);
    }
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

  protected async moveTo(
    layer: PIXI.DisplayObject,
    pos: { x?: number; y?: number },
    duration: number
  ): Promise<void> {
    const { x, y } = layer;
    await tickPromise(this.r.ticker, duration, (rate) => {
      if (pos.x) {
        layer.x = (1 - rate) * x + rate * pos.x;
      }
      if (pos.y) {
        layer.y = (1 - rate) * y + rate * pos.y;
      }
    });
  }
}
