import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import Crossfade from '../layer/Crossfade';
import { layerName } from '../Renderer';
import { Result } from './command';
import tickPromise from './tickPromise';

// TODO: position adjustment

export interface ShowHideOption {
  duration?: number;
  on?: layerName;
}

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

export interface Face {
  code: string;
  blink?: boolean;
}

type CharacterSprite = PIXI.Sprite | BlinkAnimationSprite;

const imagePath = (name: string, size: string, code: string) =>
  `game/images/${name}/${name} ${size} ${code}.png`;

export default class Character {
  private faces: Record<string, Face>;

  constructor(private r: Renderer, private name: string, faces: Face[]) {
    this.faces = faces.reduce((prev: Record<string, Face>, current: Face) => {
      return { ...prev, [current.code]: current };
    }, {});
  }

  allResources(): string[] {
    return Object.values(this.faces)
      .map((face) => this.pathsFor(face))
      .reduce((prev: string[], current: string[]) => [...prev, ...current], []);
  }

  pathsFor(face: Face): string[] {
    if (face.blink) {
      // NOTE: normal, middle, close => a, c, b
      return ['a', 'c', 'b'].map((accessory) =>
        imagePath(this.name, 'lg', `${face.code} ${accessory}`)
      );
    }
    return [imagePath(this.name, 'lg', face.code)];
  }

  async loadAll() {
    await this.r.loadMulti(this.allResources());
  }

  async loadFor(face: Face): Promise<PIXI.LoaderResource[]> {
    const paths = this.pathsFor(face);
    const resourcesMap = await this.r.loadMulti(paths);
    return paths.map((path) => {
      return resourcesMap[path];
    });
  }

  private async fadeIn(
    name: string,
    on: layerName,
    duration: number
  ): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(name, on, { alpha: ratio });
    });
  }

  private async fadeOut(
    name: string,
    on: layerName,
    duration: number
  ): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(name, on, { alpha: 1 - ratio });
    });
  }

  async genSpriteFor(face: Face): Promise<CharacterSprite> {
    const resources = await this.loadFor(face);
    if (face.blink) {
      if (resources.length != 3) {
        throw new Error('resources for blink face count must equals to 3');
      }
      return new BlinkAnimationSprite(
        resources[0].texture,
        resources[1].texture,
        resources[2].texture
      );
    }

    if (resources.length != 1) {
      throw new Error('resources for no-blink face count must equals to 1');
    }
    return new PIXI.Sprite(resources[0].texture);
  }

  private async crossfade(
    sprite: CharacterSprite,
    face: Face,
    duration: number,
    on: layerName
  ): Promise<CharacterSprite> {
    if (sprite instanceof BlinkAnimationSprite) {
      sprite.gotoAndStop(0);
    }

    const resources = await this.loadFor(face);
    const crossfade = new Crossfade(sprite.texture);
    crossfade.name = this.name;
    this.r.RemoveLayer(this.name, on);
    this.r.AddLayer(crossfade, on);

    await crossfade.animate(resources[0].texture, duration);

    const nextSprite = await this.genSpriteFor(face);
    nextSprite.name = this.name;
    this.r.RemoveLayer(this.name, on);
    this.r.AddLayer(nextSprite, on);

    return nextSprite;
  }

  private async showIntl(
    face: Face,
    duration: number,
    on: layerName
  ): Promise<CharacterSprite> {
    const sprite = await this.genSpriteFor(face);
    sprite.name = this.name;
    sprite.alpha = 0.0;
    await this.r.AddLayer(sprite, on);
    // FIXME: refine how to get the layer to fadeIn ...
    await this.fadeIn(this.name, on, duration);

    return sprite;
  }

  async show(
    code: string,
    { duration = 300, on = 'fg' }: ShowOption
  ): Promise<Result> {
    const face = this.faces[code];
    if (!face) {
      throw new Error(`undefined face for code=${code}`);
    }
    const existent = this.r.GetLayer(this.name, 'fg');
    let nextSprite: CharacterSprite;
    if (existent) {
      // TODO: keep it in own field
      nextSprite = await this.crossfade(
        existent as CharacterSprite,
        face,
        duration,
        on
      );
    } else {
      nextSprite = await this.showIntl(face, duration, on);
    }

    if (nextSprite instanceof BlinkAnimationSprite) {
      nextSprite.play();
    }

    return {
      shouldWait: false,
    };
  }

  async hide({ duration = 300, on = 'fg' }: HideOption): Promise<Result> {
    await this.fadeOut(this.name, on, duration);
    await this.r.RemoveLayer(this.name, on);
    return {
      shouldWait: false,
    };
  }
}
