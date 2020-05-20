import * as PIXI from 'pixi.js';

import vertex from './displacement.vert';
import fragment from './weightedAverage.frag';

export class WeightedAverageFilter extends PIXI.Filter {
  readonly otherSprite: PIXI.Sprite;
  private maskMatrix: PIXI.Matrix;
  public weight: number;

  constructor(otherSprite: PIXI.Sprite, weight = 0) {
    const maskMatrix = new PIXI.Matrix();

    super(vertex, fragment, {
      mapSampler: otherSprite.texture,
      maskMatrix,
    });

    otherSprite.renderable = false;

    this.weight = weight;
    this.otherSprite = otherSprite;
    this.maskMatrix = maskMatrix;
  }

  public apply(
    filterManager: PIXI.systems.FilterSystem,
    input: PIXI.RenderTexture,
    output: PIXI.RenderTexture
  ): void {
    const filterMatrix = filterManager.calculateSpriteMatrix(
      this.maskMatrix,
      this.otherSprite
    );
    this.uniforms.weight = this.weight;
    this.uniforms.filterMatrix = filterMatrix;
    filterManager.applyFilter(this, input, output, false);
  }
}
