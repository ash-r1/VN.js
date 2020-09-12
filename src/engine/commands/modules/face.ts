import * as PIXI from 'pixi.js';

import BlinkAnimationSprite from '../../layer/BlinkAnimationSprite';

export type CharacterSprite = PIXI.Sprite | BlinkAnimationSprite;

const imagePath = (character: string, size: string, code: string) =>
  `game/images/${character}/${character} ${size} ${code}.png`;

export default class Face {
  constructor(
    private character: string,
    private code: string,
    private blink?: boolean,
    private filename?: string
  ) {
    //
  }

  paths(size: string): string[] {
    const filename = this.filename ?? this.code;
    if (this.blink) {
      // NOTE: normal, middle, close => a, c, b
      return ['a', 'c', 'b'].map((accessory) =>
        imagePath(this.character, size, `${filename} ${accessory}`)
      );
    }
    return [imagePath(this.character, size, filename)];
  }

  async genSprite(
    size: string,
    resources: Record<string, PIXI.LoaderResource>
  ): Promise<CharacterSprite> {
    const paths = this.paths(size);
    const textures = paths.map((path) => resources[path].texture);
    if (this.blink) {
      if (textures.length != 3) {
        throw new Error('textures for blink face count must equals to 3');
      }
      return new BlinkAnimationSprite(textures[0], textures[1], textures[2]);
    }
    if (textures.length != 1) {
      throw new Error('resources for no-blink face count must equals to 1');
    }
    return new PIXI.Sprite(textures[0]);
  }
}
