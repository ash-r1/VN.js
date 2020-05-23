import * as PIXI from 'pixi.js';

import tickPromise from '../commands/tickPromise';
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

    this.resetFadeSpritePos();
  }

  resetFadeSpritePos() {
    this.weightedAverageFilter.otherSprite.anchor = this.anchor;
    this.weightedAverageFilter.otherSprite.x = this.x;
    this.weightedAverageFilter.otherSprite.y = this.y;
  }

  nextFade(nextTexture: PIXI.Texture) {
    // set previous texture as default
    this.texture = this.weightedAverageFilter.otherSprite.texture;

    // set next texture
    const nextSprite = new PIXI.Sprite(nextTexture);
    this.weightedAverageFilter = new WeightedAverageFilter(nextSprite);
    this.filters = [this.weightedAverageFilter];
  }

  async animate(nextTexture: PIXI.Texture, duration: number): Promise<void> {
    await this.nextFade(nextTexture);
    await tickPromise(PIXI.Ticker.shared, duration, (rate: number) => {
      this.rate = rate;
    });
  }

  // TODO: manage cross-fade by it own. with `await animate()`.
  // ... but, how about interrupt ?

  set rate(val: number) {
    this.weightedAverageFilter.weight = val;
  }
}

// override render to call resetFadeSpritePos
const originalRender = Crossfade.prototype.render;
Crossfade.prototype.render = function (this: Crossfade, renderer) {
  this.resetFadeSpritePos();
  originalRender.bind(this)(renderer);
};
