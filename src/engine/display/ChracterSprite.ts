import { AnimatedSprite, Sprite, Texture, Ticker } from 'pixi.js';

import { WeightedAverageFilter } from '../filters/WeightedAverageFilter';

const blinkFrames = (
  normal: Texture,
  ajar: Texture,
  close: Texture,
  speed = 1.0
): AnimatedSprite.FrameObject[] => {
  return ([
    // 最初はすぐまばたき
    [normal, 2.0 * speed],
    [close, 0.1],
    [ajar, 0.067],
    // しつこいと鬱陶しいので次は長くとる
    [normal, 8.0 * speed],
    [close, 0.1],
    [ajar, 0.067],
    // また長く取って二連瞬き
    [normal, 2.0 * speed],
    [close, 0.067],
    [ajar, 0.033],
    [normal, 0.067],
    [close, 0.1],
    [ajar, 0.067],
    // しつこいと鬱陶しいのでさらに長くとる
    [normal, 12.0],
    [close, 0.1],
    [ajar, 0.067],
  ] as [PIXI.Texture, number][]).map(([texture, time]) => ({
    texture,
    time: time * 1000,
  }));
};

const blinkTexture = (
  char: string,
  size: string,
  pose: string,
  frame: string
) => Texture.from(`game/images/${char}/${char} ${size} ${pose} ${frame}.png`);

const staticTexture = (char: string, size: string, pose: string) =>
  Texture.from(`game/images/${char}/${char} ${size} ${pose}.png`);

const texturesFor = (
  char: string,
  size: string,
  pose: string,
  blink: boolean,
  speed: number
): Texture[] | AnimatedSprite.FrameObject[] => {
  if (blink) {
    return blinkFrames(
      blinkTexture(char, size, pose, 'a'),
      blinkTexture(char, size, pose, 'c'),
      blinkTexture(char, size, pose, 'b'),
      speed
    );
  } else {
    return [staticTexture(char, size, pose)];
  }
};

export default class CharacterSprite extends AnimatedSprite {
  private _char: string;
  private _size: string;
  private _pose: string;
  private _blink: boolean;
  private _speed: number;
  private _dirty: boolean;
  private _weightedAverageFilter?: WeightedAverageFilter;

  constructor(
    char: string,
    size: string,
    pose: string,
    blink: boolean,
    speed?: number
  ) {
    super([blinkTexture(char, size, pose, 'a')]);

    this._char = char;
    this._size = size;
    this._pose = pose;
    this._blink = blink;
    this._speed = speed ?? 1.0;
    this._dirty = false;

    this.reloadTextures();
  }

  reloadTextures() {
    const { char, size, pose, blink, speed } = this;
    this.textures = texturesFor(char, size, pose, blink, speed) as any[];
    // ↑ pixi.js has incorrect d.ts
    // PR Fixes: https://github.com/pixijs/pixi.js/pull/7143;
    this._dirty = false;
    this.play();
  }

  async fadeTo(targetAlpha: number, duration: number) {
    const firstAlpha = this.alpha;
    let elapsed = 0;
    await new Promise<void>((resolve) => {
      const tick = (deltaTime: number) => {
        const ms = deltaTime * Ticker.shared.deltaMS;
        elapsed += ms;
        this.alpha =
          firstAlpha + (targetAlpha - firstAlpha) * (elapsed / duration);
        if (elapsed >= duration) {
          Ticker.shared.remove(tick);
          resolve();
        }
      };
      Ticker.shared.add(tick);
    });
  }

  async fadeIn(duration: number) {
    await this.fadeTo(1.0, duration);
  }

  async fadeOut(duration: number) {
    await this.fadeTo(0.0, duration);
  }

  async crossfade(pose: string, blink: boolean, duration: number) {
    this.gotoAndStop(0);
    const { char, size, speed } = this;
    const nextTextures = texturesFor(
      char,
      size,
      pose ?? this.pose,
      blink ?? this.blink,
      speed
    );

    const toTexture =
      nextTextures[0] instanceof Texture
        ? nextTextures[0]
        : nextTextures[0].texture;
    const toSprite = new Sprite(toTexture);

    const weightedAverageFilter = new WeightedAverageFilter(toSprite);
    this.filters = [weightedAverageFilter];
    this._weightedAverageFilter = weightedAverageFilter;

    let elapsed = 0;
    await new Promise<void>((resolve) => {
      const tick = (deltaTime: number) => {
        const ms = deltaTime * Ticker.shared.deltaMS;
        elapsed += ms;
        const rate = elapsed / duration;
        weightedAverageFilter.weight = rate;
        if (elapsed >= duration) {
          Ticker.shared.remove(tick);
          resolve();
        }
      };
      Ticker.shared.add(tick);
    });

    console.log('crossfade resolved.');

    if (pose) {
      this.pose = pose;
    }
    if (blink) {
      this.blink = blink;
    }

    this.reloadTextures();
    this.filters = [];
    this._weightedAverageFilter = undefined;
  }

  resetFilterTransform() {
    if (this._weightedAverageFilter) {
      this._weightedAverageFilter.otherSprite.anchor = this.anchor;
      this._weightedAverageFilter.worldTransform = this.worldTransform;
    }
  }

  get char() {
    return this._char;
  }

  get size() {
    return this._size;
  }
  set size(val) {
    this._size = val;
    this._dirty = true;
  }

  get pose() {
    return this._pose;
  }
  set pose(val) {
    this._pose = val;
    this._dirty = true;
  }

  get blink() {
    return this._blink;
  }
  set blink(val) {
    this._blink = val;
    this._dirty = true;
  }

  get speed() {
    return this._speed;
  }
  set speed(val) {
    this._speed = val;
    this._dirty = true;
  }

  update(deltaTime: number): void {
    if (this._dirty) {
      this.reloadTextures();
    }
    super.update(deltaTime);
  }
}

const originalRender = CharacterSprite.prototype.render;
CharacterSprite.prototype.render = function (this: CharacterSprite, renderer) {
  this.resetFilterTransform();

  originalRender.bind(this)(renderer);
};
