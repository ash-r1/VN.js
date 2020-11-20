import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';
import CharacterCommandBase, { FaceOption } from './base/CharacterCommandBase';
import { HideEvent } from './base/CharacterCommandBase';
import { Command, MultipleResourcesCommand, pure } from './base/commands';
import Face, { CharacterSprite } from './modules/Face';

export const SHOW = '@side/SHOW';
export const HIDE = '@side/HIDE';
export const CHANGE = '@side/CHANGE';

export interface ShowEvent {
  name: string;
  face: Face;
}

export { HideEvent };

export type ChangeEvent = ShowEvent;

export interface ShowHideOption {
  duration?: number;
}

type ShowOption = ShowHideOption;
type HideOption = ShowHideOption;

export default class Side extends CharacterCommandBase {
  defaultShowDuration = 300;

  constructor(
    r: Renderer,
    private ee: EventEmitter,
    name: string,
    faceOpts: FaceOption[],
    private xpos: number
  ) {
    super(r, name, faceOpts, 'sd', 'acc');
  }

  beforeShow(sprite: PIXI.Sprite) {
    sprite.anchor.set(0.5, 1.0);
    sprite.x = this.xpos;
    sprite.y = this.r.height;
  }

  show(
    code: string,
    { duration = this.defaultShowDuration }: ShowOption = {}
  ): Command {
    const face = this.faces[code];
    if (!face) {
      throw new Error(`Side '${code}' face not found`);
    }
    const filepaths = face.paths(this.size);
    // size state is necessary for the following paths detections in preload phase, save it.

    return new MultipleResourcesCommand(
      filepaths,
      async (resources: Record<string, PIXI.LoaderResource>) => {
        let nextSprite: CharacterSprite;
        if (this.sprite) {
          nextSprite = await this.crossfadeIntl(face, resources, duration);
          const ev: ChangeEvent = {
            name: this.name,
            face,
          };
          this.ee.emit(CHANGE, ev);
        } else {
          nextSprite = await this.showIntl(face, resources, duration);
          const ev: ShowEvent = {
            name: this.name,
            face,
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
