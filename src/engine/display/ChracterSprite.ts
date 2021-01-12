import { AnimatedSprite, Texture } from 'pixi.js';

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

export default class CharacterSprite extends AnimatedSprite {
  private _char: string;
  private _size: string;
  private _pose: string;
  private _blink: boolean;
  private _speed: number;
  private _dirty: boolean;

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
    if (blink) {
      this.textures = blinkFrames(
        blinkTexture(char, size, pose, 'a'),
        blinkTexture(char, size, pose, 'c'),
        blinkTexture(char, size, pose, 'b'),
        speed
      ) as any[];
      // ↑ pixi.js has incorrect d.ts
      // PR Fixes: https://github.com/pixijs/pixi.js/pull/7143
    } else {
      this.textures = [staticTexture(char, size, pose)];
    }
    this.play();
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
      this._dirty = false;
    }
    super.update(deltaTime);
  }
}
