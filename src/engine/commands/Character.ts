import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import Crossfade from '../layer/Crossfade';
import CommandBase from './base/CommandBase';
import { Command, MultipleResourcesCommand, pure } from './base/commands';
import Face, { CharacterSprite } from './modules/Face';

export interface FaceOption {
  code: string;
  blink?: boolean;
  filename?: string;
}

export const SHOW = '@character/SHOW';
export const HIDE = '@character/HIDE';
export const MOVE = '@character/MOVE';
export const CHANGE = '@character/CHANGE';

export interface ShowEvent {
  name: string;
  face: Face;
  xpos: number;
}
export interface HideEvent {
  name: string;
}
export interface MoveEvent {
  name: string;
  xpos: number;
}
export type ChangeEvent = ShowEvent;

export interface ShowHideOption {
  duration?: number;
}

export interface ShowOption extends ShowHideOption {
  xpos?: number;
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

export default class Character extends CommandBase {
  private faces: Record<string, Face>;
  private xpos = 0.5;
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

  setPos(sprite: PIXI.Sprite, xpos: number) {
    sprite.anchor.set(0.5, 1.0);
    sprite.x = xpos * this.r.width;
    sprite.y = this.r.height;
  }

  private async showIntl(
    face: Face,
    resources: Record<string, PIXI.LoaderResource>,
    duration: number,
    xpos: number
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

  private async moveIntl(xpos: number, duration: number): Promise<void> {
    if (!this.sprite) {
      debugger;
      throw new Error(`Character(${this.name}) is not shown`);
    }

    if (xpos != this.xpos) {
      const x = xpos * this.r.width;
      await this.moveTo(this.sprite, { x }, duration);
      this.xpos = xpos;
      const ev: MoveEvent = { name: this.name, xpos };
      this.ee.emit(MOVE, ev);
    }
  }

  move(
    xpos: string,
    { duration = this.defaultMoveDuration }: MoveOption = {}
  ): Command {
    return pure(async () => {
      await this.moveIntl(parseFloat(xpos), duration);
    });
  }

  show(
    code: string,
    { duration = this.defaultShowDuration, xpos, size, zIndex }: ShowOption = {}
  ): Command {
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
