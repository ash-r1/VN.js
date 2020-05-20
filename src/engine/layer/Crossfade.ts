import * as PIXI from 'pixi.js';

import { WeightedAverageFilter } from '../filters/WeightedAverage';

export default class Crossfade extends PIXI.Sprite {
  private weightedAverageFilter: WeightedAverageFilter;

  constructor(texture: PIXI.Texture) {
    super();
    this.width = texture.width;
    this.height = texture.height;

    const toSprite = new PIXI.Sprite(texture);
    this.weightedAverageFilter = new WeightedAverageFilter(toSprite);
    this.filters = [this.weightedAverageFilter];
  }

  startFade(nextTexture: PIXI.Texture) {
    // set previous texture as default
    this.texture = this.weightedAverageFilter.otherSprite.texture;
    this.weightedAverageFilter.weight = 0;

    // set next texture
    const nextSprite = new PIXI.Sprite(nextTexture);
    this.weightedAverageFilter = new WeightedAverageFilter(nextSprite);
    this.filters = [this.weightedAverageFilter];
  }

  set rate(val: number) {
    this.weightedAverageFilter.weight = val;
  }
}
