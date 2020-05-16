import Renderer from 'src/engine/Renderer';

import { layerName } from '../Renderer';
import { Result } from './command';

export interface ShowHideOption {
  duration?: number;
  on?: layerName;
}

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

// tick promise
function tickPromise(
  ticker: PIXI.Ticker,
  duration: number,
  update: (ratio: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let t = 0;
    const tick = (delta: number) => {
      const ms = delta * ticker.deltaMS;
      // この計算そもそも合ってるの？
      t += ms;

      // finalize if duration reaches target duration
      if (t >= duration) {
        ticker.remove(tick);
        update(1.0);
        resolve();
        return;
      }

      update(t / duration);
    };
    ticker.add(tick);

    // TODO: easing func?
  });
}

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

  // TODO: ここのオプションの付け方も考えたい...
  async show(
    name: string,
    src: string,
    { duration = 500, x = 0, y = 0, on = 'fg' }: ShowOption
  ): Promise<Result> {
    // TODO: cross-fade if same name image already exists
    await this.r.AddImageLayer(name, src, on, { alpha: 0.0, x, y });
    await this.fadeIn(name, on, duration);
    return {
      shouldWait: true,
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
