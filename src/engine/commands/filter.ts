import * as PIXI from 'pixi.js';

import { GodrayFilter } from '@pixi/filter-godray';
import {
  ShockwaveFilter,
  ShockwaveFilterOptions,
} from '@pixi/filter-shockwave';
import { TwistFilter } from '@pixi/filter-twist';

import { layerName } from '../Renderer';
import Base from './base';
import { Result } from './command';
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

export default class Filter extends Base {
  async reset(on: layerName): Promise<Result> {
    this.r.layers[on].filters = [];
    return {
      shouldWait: false,
    };
  }

  async shockwave(
    on: layerName,
    { loopAt, ...options }: ShockwaveOptions
  ): Promise<Result> {
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

    return {
      shouldWait: false,
    };
  }

  async godray(
    on: layerName,
    { angle, gain, lacunarity, speed = 1.0 }: GodrayOptions
  ): Promise<Result> {
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

    return {
      shouldWait: false,
    };
  }

  async twist(
    on: layerName,
    { duration = 500, maxAngle = 3.0, radiusRate = 1.0 }: TwistOptions
  ): Promise<Result> {
    const filter = new TwistFilter(
      (Math.min(this.r.width, this.r.height) / 2) * radiusRate
    );
    filter.offset = this.center;
    this.r.layers[on].filters = [filter];

    // NO WAIT
    tickPromise(this.r.ticker, duration, (rate) => {
      filter.angle = rate * maxAngle;
    });

    return {
      shouldWait: false,
    };
  }
}
