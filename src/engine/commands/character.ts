import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import Crossfade from '../layer/Crossfade';
import Base from './base';
import { Command, MultipleResourcesCommand, pure } from './command';
import Face, { CharacterSprite } from './face';

export interface FaceOption {
  code: string;
  blink?: boolean;
  filename?: string;
}

export type Xpos =
  | 'mleft'
  | 'mright'
  | 'center'
  | 'left3'
  | 'right3'
  | 'leftl4'
  | 'leftr4'
  | 'rightl4'
  | 'rightr4';

export const position: Record<Xpos, number> = {
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

export const SHOW = '@character/SHOW';
export const HIDE = '@character/HIDE';
export const MOVE = '@character/MOVE';
export const CHANGE = '@character/CHANGE';

export interface ShowEvent {
  name: string;
  face: Face;
  xpos: Xpos;
}
export interface HideEvent {
  name: string;
}
export interface MoveEvent {
  name: string;
  xpos: Xpos;
}
export type ChangeEvent = ShowEvent;

export interface ShowHideOption {
  duration?: number;
}

export interface ShowOption extends ShowHideOption {
  xpos?: Xpos;
  size?: CharacterSize;
  zIndex?: number;
}
type HideOption = ShowHideOption;

export interface MoveOption {
  duration?: number;
}

type CharacterSize = 'md' | 'lg';

const ON = 'fg';

const defaultZIndex = 0;
const defaultSize = 'lg';

export default class Character extends Base {
  private faces: Record<string, Face>;
  private xpos: Xpos = 'center';
  private sprite?: CharacterSprite;
  private size: CharacterSize = defaultSize;
  private zIndex = defaultZIndex;
  defaultShowDuration = 300;
  defaultHideDuration = 300;
  defaultMoveDuration = 300;

  constructor(
    r: Renderer,
    private ee: EventEmitter,
    private name: string,
    faceOpts: FaceOption[]
  ) {
    super(r);
    this.faces = faceOpts.reduce(
      (prev: Record<string, Face>, opt: FaceOption) => {
        return {
          ...prev,
          [opt.code]: new Face(name, opt.code, opt.blink, opt.filename),
        };
      },
      {}
    );
  }

  private async crossfadeIntl(
    face: Face,
    resources: Record<string, PIXI.LoaderResource>,
    duration: number
  ): Promise<CharacterSprite> {
    if (!this.sprite) {
      throw new Error(`character sprite not found (name=${this.name})`);
    }

    if (this.sprite instanceof BlinkAnimationSprite) {
      this.sprite.gotoAndStop(0);
    }

    this.r.RemoveLayer(this.sprite, ON);

    const crossfade = new Crossfade(this.sprite.texture);
    this.setPos(crossfade, this.xpos);
    this.r.AddLayer(crossfade, ON);
    crossfade.zIndex = this.zIndex;
    this.r.sortLayers(ON);

    const resource = resources[face.paths(this.size)[0]];
    if (!resource) {
      debugger;
      throw new Error('resource not found');
    }
    await crossfade.animate(resource.texture, duration);

    this.r.RemoveLayer(crossfade, ON);

    const nextSprite = await face.genSprite(this.size, resources);
    this.setPos(nextSprite, this.xpos);
    this.r.AddLayer(nextSprite, ON);
    nextSprite.zIndex = this.zIndex;

    return nextSprite;
  }

  setPos(sprite: PIXI.Sprite, xpos: Xpos) {
    sprite.anchor.set(0.5, 1.0);
    sprite.x = (position[xpos] * 0.7 + 0.15) * this.r.width;
    sprite.y = this.r.height;
  }

  private async showIntl(
    face: Face,
    resources: Record<string, PIXI.LoaderResource>,
    duration: number,
    xpos: Xpos
  ): Promise<CharacterSprite> {
    const sprite = await face.genSprite(this.size, resources);
    sprite.name = this.name;
    sprite.alpha = 0.0;
    sprite.zIndex = this.zIndex;
    this.setPos(sprite, xpos);

    await this.r.AddLayer(sprite, ON);
    await this.fadeIn(sprite, duration);

    return sprite;
  }

  private async moveIntl(xpos: Xpos, duration: number): Promise<void> {
    if (!this.sprite) {
      debugger;
      throw new Error(`Character(${this.name}) is not shown`);
    }

    if (xpos != this.xpos) {
      const x = position[xpos] * this.r.width;
      await this.moveTo(this.sprite, { x }, duration);
      this.xpos = xpos;
      const ev: MoveEvent = { name: this.name, xpos };
      this.ee.emit(MOVE, ev);
    }
  }

  move(
    xpos: Xpos,
    { duration = this.defaultMoveDuration }: MoveOption = {}
  ): Command {
    return pure(async () => {
      await this.moveIntl(xpos, duration);
    });
  }

  show(
    code: string,
    { duration = this.defaultShowDuration, xpos, size, zIndex }: ShowOption = {}
  ): Command {
    // FIXME: ここでthisを参照してしまうせいで、sizeの解釈がおかしくなってしまう。
    // preloadとは別で逐次ロードも行うべきか...sizeの変更は内部でも行う、という方針もあるが
    // また、エンジンとしての設計の問題としては、これが根本的に難しいしくみになっているべきなので、そこの解決策も考えたい。
    // 結局は「状態」をどこまで許容するかっぽい。Functionalにするなら、本来はここでthisにアクセス出来ちゃいけないんだけど、thisへのアクセスを禁止する方法が思いつかない。
    // Fail-Safeとしては、実行前に改めて確認して、必要ならロードするべきだとは思う。
    const face = this.faces[code];
    if (!face) {
      throw new Error(`undefined face for code=${code}`);
    }
    this.size = size ?? this.size;
    const filepaths = face.paths(this.size);
    // size state is necessary for the following paths detections in preload phase, save it.

    return new MultipleResourcesCommand(
      filepaths,
      async (resources: Record<string, PIXI.LoaderResource>) => {
        // store it again, for execution
        this.size = size ?? this.size;
        if (zIndex) {
          this.zIndex = zIndex;
        }
        let nextSprite: CharacterSprite;
        if (this.sprite) {
          if (this.xpos != xpos && xpos) {
            await this.moveIntl(xpos, this.defaultMoveDuration);
          }
          nextSprite = await this.crossfadeIntl(face, resources, duration);
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
          nextSprite = await this.showIntl(
            face,
            resources,
            duration,
            this.xpos
          );
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
      }
    );
  }

  hide({ duration = this.defaultHideDuration }: HideOption = {}): Command {
    return pure(async () => {
      if (this.sprite) {
        await this.fadeOut(this.sprite, duration);
        await this.r.RemoveLayer(this.sprite, ON);
        this.sprite = undefined;
        this.ee.emit(HIDE, { name: this.name });
      }
      this.zIndex = defaultZIndex;
    });
  }

  async order(zIndex: number): Promise<void> {
    if (this.sprite) {
      this.sprite.zIndex = zIndex;
      this.zIndex = zIndex;
    }
  }
}
