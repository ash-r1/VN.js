import * as PIXI from 'pixi.js';

const blinkFrames = (
  normal: PIXI.Texture,
  middle: PIXI.Texture,
  close: PIXI.Texture,
  ratio: number
): PIXI.AnimatedSprite.FrameObject[] => {
  return ([
    // 最初はすぐまばたき
    [normal, 2.0 * ratio],
    [close, 0.1],
    [middle, 0.067],
    // しつこいと鬱陶しいので次は長くとる
    [normal, 8.0 * ratio],
    [close, 0.1],
    [middle, 0.067],
    // また長く取って二連瞬き
    [normal, 2.0 * ratio],
    [close, 0.067],
    [middle, 0.033],
    [normal, 0.067],
    [close, 0.1],
    [middle, 0.067],
    // しつこいと鬱陶しいのでさらに長くとる
    [normal, 12.0],
    [close, 0.1],
    [middle, 0.067],
  ] as [PIXI.Texture, number][]).map(([texture, time]) => ({
    texture,
    time: time * 1000,
  }));
};

export default class BlinkAnimationSprite extends PIXI.AnimatedSprite {
  //
  constructor(
    normal: PIXI.Texture,
    middle: PIXI.Texture,
    close: PIXI.Texture,
    ratio = 1.0
  ) {
    super(blinkFrames(normal, middle, close, ratio));
  }
}
