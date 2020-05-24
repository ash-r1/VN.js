import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import Crossfade from '../layer/Crossfade';
import { layerName } from '../Renderer';
import Base from './base';
import { Result } from './command';
import tickPromise from './tickPromise';

// TODO: position adjustment

type Position =
  | 'mleft'
  | 'mright'
  | 'center'
  | 'left3'
  | 'right3'
  | 'leftl4'
  | 'leftr4'
  | 'rightl4'
  | 'rightr4';

export const position: Record<Position, number> = {
  mleft: 0.2,
  mright: 0.8,
  center: 0.5,
  left3: 0.1,
  right3: 0.9,
  leftl4: 0.05,
  leftr4: 0.35,
  rightl4: 0.65,
  rightr4: 0.95,
};

export interface Face {
  code: string;
  blink?: boolean;
}

export const SHOW = '@character/SHOW';
export const HIDE = '@character/HIDE';
export const MOVE = '@character/MOVE';
export const CHANGE = '@character/CHANGE';
export interface ShowEvent {
  name: string;
  face: Face;
  xpos: Position;
}
export interface HideEvent {
  name: string;
}
export interface MoveEvent {
  name: string;
  xpos: Position;
}
export type ChangeEvent = ShowEvent;

export interface ShowHideOption {
  duration?: number;
}

export interface ShowOption extends ShowHideOption {
  xpos?: Position;
  zIndex?: number;
}
type HideOption = ShowHideOption;

export interface MoveOption {
  duration?: number;
}

type CharacterSprite = PIXI.Sprite | BlinkAnimationSprite;

type CharacterSize = 'md' | 'lg';

const ON = 'fg';

const imagePath = (name: string, size: string, code: string) =>
  `game/images/${name}/${name} ${size} ${code}.png`;

const defaultZIndex = 0;

export default class Character extends Base {
  private faces: Record<string, Face>;
  private xpos: Position = 'center';
  private sprite?: CharacterSprite;
  private size: CharacterSize = 'lg';
  private zIndex = defaultZIndex;
  defaultShowDuration = 300;
  defaultHideDuration = 300;
  defaultMoveDuration = 300;

  constructor(
    r: Renderer,
    private ee: EventEmitter,
    private name: string,
    faces: Face[]
  ) {
    super(r);
    this.faces = faces.reduce((prev: Record<string, Face>, current: Face) => {
      return { ...prev, [current.code]: current };
    }, {});
  }

  // allResources(): string[] {
  //   return Object.values(this.faces)
  //     .map((face) => this.pathsFor(face))
  //     .reduce((prev: string[], current: string[]) => [...prev, ...current], []);
  // }

  pathsFor(face: Face): string[] {
    if (face.blink) {
      // NOTE: normal, middle, close => a, c, b
      return ['a', 'c', 'b'].map((accessory) =>
        imagePath(this.name, this.size, `${face.code} ${accessory}`)
      );
    }
    return [imagePath(this.name, this.size, face.code)];
  }

  // async loadAll() {
  //   await this.r.loadMulti(this.allResources());
  // }

  async loadFor(face: Face): Promise<PIXI.LoaderResource[]> {
    const paths = this.pathsFor(face);
    const resourcesMap = await this.r.loadMulti(paths);
    return paths.map((path) => {
      return resourcesMap[path];
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
    face: Face,
    duration: number
  ): Promise<CharacterSprite> {
    if (!this.sprite) {
      throw new Error(`character sprite not found (name=${this.name})`);
    }

    if (this.sprite instanceof BlinkAnimationSprite) {
      this.sprite.gotoAndStop(0);
    }

    const resources = await this.loadFor(face);

    this.r.RemoveLayer(this.sprite, ON);

    const crossfade = new Crossfade(this.sprite.texture);
    this.setPos(crossfade, this.xpos);
    this.r.AddLayer(crossfade, ON);
    crossfade.zIndex = this.zIndex;
    this.r.sortLayers(ON);

    await crossfade.animate(resources[0].texture, duration);

    this.r.RemoveLayer(crossfade, ON);

    const nextSprite = await this.genSpriteFor(face);
    this.setPos(nextSprite, this.xpos);
    this.r.AddLayer(nextSprite, ON);
    nextSprite.zIndex = this.zIndex;

    return nextSprite;
  }

  setPos(sprite: PIXI.Sprite, xpos: Position) {
    sprite.anchor.set(0.5, 1.0);
    sprite.x = position[xpos] * this.r.width;
    sprite.y = this.r.height;
  }

  private async showIntl(
    face: Face,
    duration: number,
    xpos: Position
  ): Promise<CharacterSprite> {
    const sprite = await this.genSpriteFor(face);
    sprite.name = this.name;
    sprite.alpha = 0.0;
    sprite.zIndex = this.zIndex;
    this.setPos(sprite, xpos);

    await this.r.AddLayer(sprite, ON);
    await this.fadeIn(sprite, duration);

    return sprite;
  }

  async move(
    xpos: Position,
    { duration = this.defaultMoveDuration }: MoveOption
  ): Promise<Result> {
    if (!this.sprite) {
      throw new Error(`Character(${this.name}) is not shown`);
    }

    if (xpos != this.xpos) {
      const x = position[xpos] * this.r.width;
      await this.moveTo(this.sprite, { x }, duration);
      this.xpos = xpos;
      const ev: MoveEvent = { name: this.name, xpos };
      this.ee.emit(MOVE, ev);
    }

    return {
      shouldWait: false,
    };
  }

  async show(
    code: string,
    { duration = this.defaultShowDuration, xpos, zIndex }: ShowOption
  ): Promise<Result> {
    const face = this.faces[code];
    if (!face) {
      throw new Error(`undefined face for code=${code}`);
    }
    if (zIndex) {
      this.zIndex = zIndex;
    }
    let nextSprite: CharacterSprite;
    if (this.sprite) {
      if (this.xpos != xpos && xpos) {
        await this.move(xpos, {});
      }
      nextSprite = await this.crossfade(face, duration);
      const ev: ChangeEvent = {
        name: this.name,
        face,
        xpos: this.xpos,
      };
      this.ee.emit(CHANGE, ev);
    } else {
      if (xpos) {
        this.xpos = xpos;
      }
      nextSprite = await this.showIntl(face, duration, this.xpos);
      const ev: ShowEvent = {
        name: this.name,
        face,
        xpos: this.xpos,
      };
      this.ee.emit(SHOW, ev);
    }

    if (nextSprite instanceof BlinkAnimationSprite) {
      nextSprite.play();
    }
    this.sprite = nextSprite;

    return {
      shouldWait: false,
    };
  }

  async hide({
    duration = this.defaultHideDuration,
  }: HideOption): Promise<Result> {
    if (this.sprite) {
      await this.fadeOut(this.sprite, duration);
      await this.r.RemoveLayer(this.sprite, ON);
      this.sprite = undefined;
      this.ee.emit(HIDE, { name: this.name });
    }
    this.zIndex = defaultZIndex;
    return {
      shouldWait: false,
    };
  }

  async order(zIndex: number): Promise<Result> {
    if (this.sprite) {
      this.sprite.zIndex = zIndex;
      this.zIndex = zIndex;
    }
    return {
      shouldWait: false,
    };
  }
}
