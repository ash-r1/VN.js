import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import CharacterCommandBase, {
  CharacterSize,
  FaceOption,
} from './base/CharacterCommandBase';
import { HideEvent } from './base/CharacterCommandBase';
import { Command, MultipleResourcesCommand, pure } from './base/commands';
import Face, { CharacterSprite } from './modules/Face';

export const SHOW = '@character/SHOW';
export const HIDE = '@character/HIDE';
export const MOVE = '@character/MOVE';
export const CHANGE = '@character/CHANGE';

export interface ShowEvent {
  name: string;
  face: Face;
  xpos: number;
}

export { HideEvent };

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

export default class Character extends CharacterCommandBase {
  private xpos = 0.5;
  defaultShowDuration = 300;
  defaultMoveDuration = 300;

  constructor(
    r: Renderer,
    private ee: EventEmitter,
    name: string,
    faceOpts: FaceOption[]
  ) {
    super(r, name, faceOpts);
  }

  beforeShow(sprite: PIXI.Sprite) {
    sprite.anchor.set(0.5, 1.0);
    sprite.x = this.xpos * this.r.width;
    sprite.y = this.r.height;
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
          nextSprite = await this.showIntl(face, resources, duration);
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
      if (this.hideIntl(duration)) {
        this.ee.emit(HIDE, { name: this.name });
      }
    });
  }
}
