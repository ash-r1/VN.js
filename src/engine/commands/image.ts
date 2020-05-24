import * as PIXI from 'pixi.js';

import { layerName } from '../Renderer';
import Base from './base';
import { Result } from './command';

export interface ShowHideOption {
  duration?: number;
}

export interface ShowOption extends ShowHideOption {
  on?: layerName;
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

interface LayerDef {
  layer: PIXI.DisplayObject;
  on: layerName;
}

export default class Image extends Base {
  private layers: Map<string, LayerDef> = new Map();

  // alias as show on: bg
  async bg(src: string, options: Omit<ShowOption, 'on'>): Promise<Result> {
    return await this.show('bg', src, {
      x: this.r.width / 2,
      y: this.r.height / 2,
      ...options,
      on: 'bg',
    });
  }

  async show(
    name: string,
    src: string,
    { duration = 500, x = 0, y = 0, on = 'fg' }: ShowOption
  ): Promise<Result> {
    // TODO: cross-fade if same name image already exists?
    const resource = await this.r.load(src);
    const layer = new PIXI.Sprite(resource.texture);
    layer.anchor.set(0.5, 0.5);
    this.setLayerProps(layer, { x, y, alpha: 0 });
    await this.r.AddLayer(layer, on);
    await this.fadeIn(layer, duration);
    this.layers.set(name, { layer, on });
    return {
      shouldWait: false,
    };
  }

  async hide(name: string, { duration = 500 }: HideOption): Promise<Result> {
    const layer = this.layers.get(name);
    if (layer) {
      await this.fadeOut(layer.layer, duration);
      this.r.RemoveLayer(layer.layer, layer.on);
      this.layers.delete(name);
    }

    return {
      shouldWait: false,
    };
  }
}
