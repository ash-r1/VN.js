import * as PIXI from 'pixi.js';

import { WeightedAverageFilter } from '../filters/WeightedAverage';

export default class Crossfade extends PIXI.Sprite {
  private weightedAverageFilter: WeightedAverageFilter;
  constructor(fromTexture: PIXI.Texture, toTexture: PIXI.Texture) {
    super(fromTexture);

    const toSprite = new PIXI.Sprite(toTexture);
    this.weightedAverageFilter = new WeightedAverageFilter(toSprite);
    this.filters = [this.weightedAverageFilter];
  }

  updateWeight(weight: number): void {
    this.weightedAverageFilter.weight = weight;
  }
}
