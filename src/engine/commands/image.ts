import Renderer from 'src/engine/Renderer';

import { Result } from './command';

export interface ShowOption {
  duration?: number;
  x?: number;
  y?: number;
}

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

  private async fadeIn(name: string, duration: number): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(name, { alpha: ratio });
    });
  }

  private async fadeOut(name: string, duration: number): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(name, { alpha: 1 - ratio });
    });
  }

  // TODO: ここのオプションの付け方も考えたい...
  async show(
    name: string,
    src: string,
    { duration = 500, x = 0, y = 0 }: ShowOption
  ): Promise<Result> {
    await this.r.AddImageLayer(name, src, { alpha: 0.0, x, y });
    await this.fadeIn(name, duration);
    return {
      shouldWait: true,
    };
  }

  async hide(
    name: string,
    { duration = 500 }: { duration: number }
  ): Promise<Result> {
    await this.fadeOut(name, duration);
    await this.r.RemoveLayer(name);
    return {
      shouldWait: false,
    };
  }
}
