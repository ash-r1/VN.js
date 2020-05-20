import * as PIXI from 'pixi.js';

import { WeightedAverageFilter } from '../filters/WeightedAverage';

export default class Crossfade extends PIXI.Sprite {
  private weightedAverageFilter: WeightedAverageFilter;

  constructor(texture: PIXI.Texture) {
    super(texture);
    this.width = texture.width;
    this.height = texture.height;

    const toSprite = new PIXI.Sprite(texture);
    this.weightedAverageFilter = new WeightedAverageFilter(toSprite);
    this.filters = [this.weightedAverageFilter];
  }

  nextFade(nextTexture: PIXI.Texture) {
    // set previous texture as default
    this.texture = this.weightedAverageFilter.otherSprite.texture;

    // set next texture
    const nextSprite = new PIXI.Sprite(nextTexture);
    this.weightedAverageFilter = new WeightedAverageFilter(nextSprite);
    this.filters = [this.weightedAverageFilter];
  }

  resetFade(currentTexture: PIXI.Texture, nextTexture: PIXI.Texture) {
    this.texture = currentTexture;
    const nextSprite = new PIXI.Sprite(nextTexture);
    this.weightedAverageFilter = new WeightedAverageFilter(nextSprite);
    this.filters = [this.weightedAverageFilter];
  }

  // TODO: manage cross-fade by it own. with `await animate()`.
  // ... but, how about interrupt ?

  set rate(val: number) {
    this.weightedAverageFilter.weight = val;
  }
}
