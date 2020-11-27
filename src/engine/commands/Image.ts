import * as PIXI from 'pixi.js';

import { layerName } from '../Renderer';
import CommandBase from './base/CommandBase';
import { Command, pure, ResourceCommand } from './base/commands';

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
export interface ShowIntlOption extends ShowOption {
  on: layerName;
  duration: number;
}

export type StillOption = ShowHideOption;

interface LayerDef {
  layer: PIXI.DisplayObject;
  on: layerName;
}

export default class Image extends CommandBase {
  private layers: Map<string, LayerDef> = new Map();

  bg(
    src: string,
    {
      duration = 500,
      x = this.r.width / 2,
      y = this.r.height / 2,
      scale = 1.05,
    }: Omit<ShowOption, 'on'> = {}
  ): Command {
    const filepath = `game/images/bg ${src}.png`;
    return new ResourceCommand(
      filepath,
      async (resource: PIXI.LoaderResource) => {
        const on = 'bg';
        const layer = new PIXI.Sprite(resource.texture);
        layer.anchor.set(0.5, 0.5);
        this.setLayerProps(layer, {
          x,
          y,
          scale,
          alpha: 0,
        });

        const old = this.layers.get(name);
        await this.r.AddLayer(layer, on);
        await this.fadeIn(layer, duration);
        if (old) {
          await this.r.RemoveLayer(old.layer, old.on);
        }

        this.layers.set(name, { layer, on });
      }
    );
  }

  showIntl(
    name: string,
    filepath: string,
    { duration, on, ...option }: ShowIntlOption
  ): Command {
    return new ResourceCommand(
      filepath,
      async (resource: PIXI.LoaderResource) => {
        const layer = new PIXI.Sprite(resource.texture);
        layer.anchor.set(0.5, 0.5);
        this.setLayerProps(layer, { ...option, alpha: 0 });
        await this.r.AddLayer(layer, on);
        await this.fadeIn(layer, duration);
        this.layers.set(name, { layer, on });
      }
    );
  }

  show(
    name: string,
    src: string,
    { duration = 500, on = 'fg', ...option }: ShowOption = {}
  ): Command {
    const filepath = `game/images/${src}.png`;
    return this.showIntl(name, filepath, { duration, on, ...option });
  }

  hide(name: string, { duration = 500 }: HideOption = {}): Command {
    return pure(async () => {
      const layer = this.layers.get(name);
      if (layer) {
        await this.fadeOut(layer.layer, duration);
        this.r.RemoveLayer(layer.layer, layer.on);
        this.layers.delete(name);
      }
    });
  }

  still(name: string, { duration = 500 }: StillOption = {}): Command {
    const filepath = `game/images/still/${name}.png`;
    return this.showIntl('still', filepath, {
      duration,
      on: 'fg',
      // FIXIT: magic number
      x: 960,
      y: 540,
    });
  }

  hideStill(option: HideOption): Command {
    return this.hide('still', option);
  }
}
