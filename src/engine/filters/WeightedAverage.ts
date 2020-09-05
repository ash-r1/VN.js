import * as PIXI from 'pixi.js';

import vertex from './displacement.vert';
import fragment from './weightedAverage.frag';

export class WeightedAverageFilter extends PIXI.Filter {
  readonly otherSprite: PIXI.Sprite;
  private maskMatrix: PIXI.Matrix;
  public worldTransform: PIXI.Matrix;
  public weight: number;

  constructor(otherSprite: PIXI.Sprite, weight = 0) {
    const maskMatrix = new PIXI.Matrix();

    super(vertex, fragment, {
      otherSampler: otherSprite.texture,
      maskMatrix,
    });

    otherSprite.renderable = false;

    this.weight = weight;
    this.otherSprite = otherSprite;
    this.maskMatrix = maskMatrix;
    this.worldTransform = new PIXI.Matrix();
  }

  public apply(
    filterManager: PIXI.systems.FilterSystem,
    input: PIXI.RenderTexture,
    output: PIXI.RenderTexture
  ): void {
    const { width, height } = this.otherSprite;
    const filterMatrix = filterManager.calculateSpriteMatrix(
      this.maskMatrix,
      this.otherSprite
    );
    this.uniforms.weight = this.weight;
    this.uniforms.filterMatrix = filterMatrix.translate(
      -this.worldTransform.tx / width,
      -this.worldTransform.ty / height
    );
    filterManager.applyFilter(this, input, output, PIXI.CLEAR_MODES.NO);
  }
}
