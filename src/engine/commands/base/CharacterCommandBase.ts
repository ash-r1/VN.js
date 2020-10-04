import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../../layer/BlinkAnimationSprite';
import Crossfade from '../../layer/Crossfade';
import Face, { CharacterSprite } from '../modules/Face';
import CommandBase from './CommandBase';

export interface FaceOption {
  code: string;
  blink?: boolean;
  filename?: string;
}

export interface HideEvent {
  name: string;
}

export type CharacterSize = 'md' | 'lg';

const ON = 'fg';

const defaultZIndex = 0;
const defaultSize = 'lg';

export default abstract class CharacterCommandBase extends CommandBase {
  protected sprite?: CharacterSprite;
  protected faces: Record<string, Face>;
  protected size: CharacterSize = defaultSize;
  protected zIndex = defaultZIndex;
  defaultHideDuration = 300;

  constructor(r: Renderer, readonly name: string, faceOpts: FaceOption[]) {
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

  protected abstract beforeShow(sprite: PIXI.Sprite): void;

  protected async crossfadeIntl(
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
    this.beforeShow(crossfade);
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
    this.beforeShow(nextSprite);
    this.r.AddLayer(nextSprite, ON);
    nextSprite.zIndex = this.zIndex;

    return nextSprite;
  }

  protected async showIntl(
    face: Face,
    resources: Record<string, PIXI.LoaderResource>,
    duration: number
  ): Promise<CharacterSprite> {
    const sprite = await face.genSprite(this.size, resources);
    sprite.name = this.name;
    sprite.alpha = 0.0;
    sprite.zIndex = this.zIndex;
    this.beforeShow(sprite);

    await this.r.AddLayer(sprite, ON);
    await this.fadeIn(sprite, duration);

    return sprite;
  }

  async hideIntl(duration: number): Promise<boolean> {
    if (this.sprite) {
      await this.fadeOut(this.sprite, duration);
      await this.r.RemoveLayer(this.sprite, ON);
      this.sprite = undefined;
    }
    this.zIndex = defaultZIndex;

    return !!this.sprite;
  }

  async order(zIndex: number): Promise<void> {
    if (this.sprite) {
      this.sprite.zIndex = zIndex;
      this.zIndex = zIndex;
    }
  }

  // private async moveIntl(xpos: number, duration: number): Promise<void> {
  //   if (!this.sprite) {
  //     debugger;
  //     throw new Error(`Character(${this.name}) is not shown`);
  //   }

  //   if (xpos != this.xpos) {
  //     const x = xpos * this.r.width;
  //     await this.moveTo(this.sprite, { x }, duration);
  //     this.xpos = xpos;
  //     const ev: MoveEvent = { name: this.name, xpos };
  //     this.ee.emit(MOVE, ev);
  //   }
  // }

  // move(
  //   xpos: string,
  //   { duration = this.defaultMoveDuration }: MoveOption = {}
  // ): Command {
  //   return pure(async () => {
  //     await this.moveIntl(parseFloat(xpos), duration);
  //   });
  // }

  // show(
  //   code: string,
  //   { duration = this.defaultShowDuration, xpos, size, zIndex }: ShowOption = {}
  // ): Command {
  //   const face = this.faces[code];
  //   if (!face) {
  //     throw new Error(`undefined face for code=${code}`);
  //   }
  //   this.size = size ?? this.size;
  //   const filepaths = face.paths(this.size);
  //   // size state is necessary for the following paths detections in preload phase, save it.

  //   return new MultipleResourcesCommand(
  //     filepaths,
  //     async (resources: Record<string, PIXI.LoaderResource>) => {
  //       // store it again, for execution
  //       this.size = size ?? this.size;
  //       if (zIndex) {
  //         this.zIndex = zIndex;
  //       }
  //       let nextSprite: CharacterSprite;
  //       if (this.sprite) {
  //         if (this.xpos != xpos && xpos) {
  //           await this.moveIntl(xpos, this.defaultMoveDuration);
  //         }
  //         nextSprite = await this.crossfadeIntl(face, resources, duration);
  //         const ev: ChangeEvent = {
  //           name: this.name,
  //           face,
  //           xpos: this.xpos,
  //         };
  //         this.ee.emit(CHANGE, ev);
  //       } else {
  //         if (xpos) {
  //           this.xpos = xpos;
  //         }
  //         nextSprite = await this.showIntl(face, resources, duration);
  //         const ev: ShowEvent = {
  //           name: this.name,
  //           face,
  //           xpos: this.xpos,
  //         };
  //         this.ee.emit(SHOW, ev);
  //       }

  //       if (nextSprite instanceof BlinkAnimationSprite) {
  //         nextSprite.play();
  //       }
  //       this.sprite = nextSprite;
  //     }
  //   );
  // }
}
