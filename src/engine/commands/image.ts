import * as PIXI from 'pixi.js';

import { layerName } from '../Renderer';
import Base from './base';
import { Command, NoResourceCommand } from './command';

export interface ShowHideOption {
  duration?: number;
}

export interface ShowOption extends ShowHideOption {
  on?: layerName;
  x?: number;
  y?: number;
  scale?: number;
}
type HideOption = ShowHideOption;

interface LayerDef {
  layer: PIXI.DisplayObject;
  on: layerName;
}

export default class Image extends Base {
  private layers: Map<string, LayerDef> = new Map();

  bg(
    src: string,
    {
      duration = 500,
      x = this.r.width / 2,
      y = this.r.height / 2,
      scale = 1.05,
    }: Omit<ShowOption, 'on'>
  ): Command {
    const filepath = `game/images/bg ${src}.png`;
    return new Command(
      filepath,
      async (resources: Record<string, PIXI.LoaderResource>) => {
        const on = 'bg';
        const texture = resources[filepath].texture;
        const layer = new PIXI.Sprite(texture);
        layer.anchor.set(0.5, 0.5);
        this.setLayerProps(layer, {
          x,
          y,
          scale,
          alpha: 0,
        });
        await this.r.AddLayer(layer, on);
        await this.fadeIn(layer, duration);

        this.layers.set(name, { layer, on });
      }
    );
  }

  show(
    name: string,
    src: string,
    { duration = 500, on = 'fg', ...option }: ShowOption
  ): Command {
    const filepath = `game/images/${src}.png`;
    return new Command(
      filepath,
      async (resources: Record<string, PIXI.LoaderResource>) => {
        const texture = resources[filepath].texture;
        const layer = new PIXI.Sprite(texture);
        layer.anchor.set(0.5, 0.5);
        this.setLayerProps(layer, { ...option, alpha: 0 });
        await this.r.AddLayer(layer, on);
        await this.fadeIn(layer, duration);
        this.layers.set(name, { layer, on });
      }
    );
  }

  hide(name: string, { duration = 500 }: HideOption): Command {
    return new NoResourceCommand(async () => {
      const layer = this.layers.get(name);
      if (layer) {
        await this.fadeOut(layer.layer, duration);
        this.r.RemoveLayer(layer.layer, layer.on);
        this.layers.delete(name);
      }
    });
  }
}
