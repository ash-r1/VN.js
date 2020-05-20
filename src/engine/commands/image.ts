import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import Crossfade from '../layer/Crossfade';
import { layerName, setLayerProps } from '../Renderer';
import { Result } from './command';
import tickPromise from './tickPromise';

export interface ShowHideOption {
  duration?: number;
  on?: layerName;
}

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

export default class Image {
  constructor(private r: Renderer) {}

  // TODO: tickerを元にしたアニメーションの良い感じのPromiseがほしい

  private async fadeIn(
    name: string,
    on: layerName,
    duration: number
  ): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(name, on, { alpha: ratio });
    });
  }

  private async fadeOut(
    name: string,
    on: layerName,
    duration: number
  ): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(name, on, { alpha: 1 - ratio });
    });
  }

  // alias as show on: bg
  async bg(src: string, options: Omit<ShowOption, 'on'>): Promise<Result> {
    return await this.show('bg', src, { ...options, on: 'bg' });
  }

  async test(): Promise<Result> {
    const base = new PIXI.Container();
    await this.r.AddLayer(base, 'fg');

    const ktka = await this.r.load('game/images/ktk/ktk lg a01 a.png');
    const ktkb = await this.r.load('game/images/ktk/ktk lg a01 b.png');
    const ktkc = await this.r.load('game/images/ktk/ktk lg a01 c.png');

    const ratio = 1.0;
    const animation = new PIXI.AnimatedSprite(
      ([
        // 最初はすぐまばたき
        [ktka, 2.0 * ratio],
        [ktkb, 0.1],
        [ktkc, 0.067],
        // しつこいと鬱陶しいので次は長くとる
        [ktka, 8.0 * ratio],
        [ktkb, 0.1],
        [ktkc, 0.067],
        // また長く取って二連瞬き
        [ktka, 2.0 * ratio],
        [ktkb, 0.067],
        [ktkc, 0.033],
        [ktka, 0.067],
        [ktkb, 0.1],
        [ktkc, 0.067],
        // しつこいと鬱陶しいのでさらに長くとる
        [ktka, 12.0],
        [ktkb, 0.1],
        [ktkc, 0.067],
      ] as [PIXI.LoaderResource, number][]).map(([{ texture }, time]) => ({
        texture,
        time: time * 1000,
      }))
    );
    animation.play();
    base.addChild(animation);

    return {
      shouldWait: true,
    };
  }

  async show(
    name: string,
    src: string,
    { duration = 500, x = 0, y = 0, on = 'fg' }: ShowOption
  ): Promise<Result> {
    // TODO: cross-fade if same name image already exists?
    const resource = await this.r.load(src);
    const sprite = new PIXI.Sprite(resource.texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.name = name;
    setLayerProps(sprite, { x, y, alpha: 0 });
    await this.r.AddLayer(sprite, on);
    await this.fadeIn(name, on, duration);
    return {
      shouldWait: false,
    };
  }

  async hide(
    name: string,
    { duration = 500, on = 'fg' }: HideOption
  ): Promise<Result> {
    await this.fadeOut(name, on, duration);
    await this.r.RemoveLayer(name, on);
    return {
      shouldWait: false,
    };
  }
}
