import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import tickPromise from '../modules/tickPromise';

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

export default abstract class CommandBase {
  constructor(protected r: Renderer) {}

  protected get center(): PIXI.Point {
    return new PIXI.Point(this.r.width / 2.0, this.r.height / 2.0);
  }

  // deprecated. move this logic into image module
  protected setLayerProps(layer: PIXI.DisplayObject, props: LayerProps) {
    // TODO: make it typesafe-implementation
    if (props.x) {
      layer.x = props.x;
    }
    if (props.y) {
      layer.y = props.y;
    }
    if (props.alpha) {
      layer.alpha = props.alpha;
    }

    if (props.scale) {
      layer.scale.set(props.scale, props.scale);
    }

    if (layer instanceof PIXI.Sprite) {
      if (props.width) {
        layer.width = props.width;
      }
      if (props.height) {
        layer.height = props.height;
      }
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
      if (pos.x !== undefined) {
        layer.x = (1 - rate) * x + rate * pos.x;
      }
      if (pos.y !== undefined) {
        layer.y = (1 - rate) * y + rate * pos.y;
      }
    });
  }
}
