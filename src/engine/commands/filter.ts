import { CRTFilter, CRTFilterOptions } from '@pixi/filter-crt';
import { GodrayFilter } from '@pixi/filter-godray';
import {
  ShockwaveFilter,
  ShockwaveFilterOptions,
} from '@pixi/filter-shockwave';
import { TwistFilter } from '@pixi/filter-twist';

import { layerName } from '../Renderer';
import Base from './base';
import { Command, pure } from './command';
import tickPromise from './tickPromise';

export interface DurationOptions {
  duration?: number;
}

export interface TwistOptions extends DurationOptions {
  maxAngle?: number;
  radiusRate?: number;
}

export interface GodrayOptions {
  angle?: number;
  gain?: number;
  lacunarity?: number;
  speed?: number;
}

export interface ShockwaveOptions extends ShockwaveFilterOptions {
  /**
   * loop at msec
   */
  loopAt?: number;
}

export type CRTOptions = CRTFilterOptions;

export default class Filter extends Base {
  reset(on: layerName): Command {
    return pure(async () => {
      this.r.layers[on].filters = [];
    });
  }

  crt(on: layerName, { ...options }: CRTOptions = {}): Command {
    return pure(async () => {
      const filter = new CRTFilter(options);

      this.r.layers[on].filters = [filter];
      const { ticker } = this.r;
      let t = 0;
      const tick = (delta: number) => {
        const ms = delta * ticker.deltaMS;
        t += ms;
        filter.time = t / 100;

        // remove itself automatically after removed
        if (!this.r.layers[on].filters.includes(filter)) {
          ticker.remove(tick);
          return;
        }
        // TODO: can we capsulate this method?
      };
      ticker.add(tick);
    });
  }

  shockwave(
    on: layerName,
    { loopAt, ...options }: ShockwaveOptions = {}
  ): Command {
    return pure(async () => {
      const filter = new ShockwaveFilter(this.center, options);

      this.r.layers[on].filters = [filter];
      const { ticker } = this.r;
      let t = 0;
      const tick = (delta: number) => {
        const ms = delta * ticker.deltaMS;
        t += ms;
        filter.time = t / 1000;

        if (loopAt && t > loopAt) {
          t = 0;
        }

        if (!loopAt && t > 2.0) {
          ticker.remove(tick);
          return;
        }

        // remove itself automatically after removed
        if (!this.r.layers[on].filters.includes(filter)) {
          ticker.remove(tick);
          return;
        }
        // TODO: can we capsulate this method?
      };
      ticker.add(tick);
    });
  }

  godray(
    on: layerName,
    { angle, gain, lacunarity, speed = 1.0 }: GodrayOptions = {}
  ): Command {
    return pure(async () => {
      const filter = new GodrayFilter();
      if (angle) {
        filter.angle = angle;
      }
      if (gain) {
        filter.gain = gain;
      }
      if (lacunarity) {
        filter.lacunarity = lacunarity;
      }

      this.r.layers[on].filters = [filter];
      const { ticker } = this.r;
      let t = 0;
      const tick = (delta: number) => {
        const ms = delta * ticker.deltaMS;
        t += ms / 1000;
        filter.time = t * speed;

        // remove itself automatically after removed
        if (!this.r.layers[on].filters.includes(filter)) {
          ticker.remove(tick);
        }
        // TODO: can we capsulate this method?
      };
      ticker.add(tick);
    });
  }

  twist(
    on: layerName,
    { duration = 500, maxAngle = 3.0, radiusRate = 1.0 }: TwistOptions = {}
  ): Command {
    return pure(async () => {
      const filter = new TwistFilter(
        (Math.min(this.r.width, this.r.height) / 2) * radiusRate
      );
      filter.offset = this.center;
      this.r.layers[on].filters = [filter];

      // NO WAIT
      tickPromise(this.r.ticker, duration, (rate) => {
        filter.angle = rate * maxAngle;
      });
    });
  }
}
