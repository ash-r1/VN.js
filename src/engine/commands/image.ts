import Renderer from 'src/renderer/Renderer';

import { Result } from './command';

export interface ShowOption {
  duration?: number;
  x?: number;
  y?: number;
}

export default class Image {
  constructor(private r: Renderer) {}

  // TODO: tickerを元にしたアニメーションの良い感じのPromiseがほしい

  fadeIn(name: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      let t = 0;
      const update = (delta: number) => {
        const ms = delta * this.r.ticker.deltaMS;
        t += ms;

        const alpha = Math.min(1.0, t / duration);
        this.r.SetLayerProps(name, { alpha });

        if (t >= duration) {
          this.r.ticker.remove(update);
          resolve();
        }
      };
      this.r.ticker.add(update);
      // TODO: easing func?
    });
  }

  fadeOut(name: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      let t = 0;
      const update = (delta: number) => {
        const ms = delta * this.r.ticker.deltaMS;
        t += ms;

        const alpha = Math.max(0.0, 1 - t / duration);
        this.r.SetLayerProps(name, { alpha });

        if (t >= duration) {
          this.r.ticker.remove(update);
          resolve();
        }
      };
      this.r.ticker.add(update);
      // TODO: easing func?
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
      shouldWait: true,
    };
  }
}
