import * as PIXI from 'pixi.js';

import Renderer from 'src/engine/Renderer';

import BlinkAnimationSprite from '../../layer/BlinkAnimationSprite';
import Crossfade from '../../layer/Crossfade';
import { layerName } from '../../Renderer';
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


const defaultZIndex = 0;

export default abstract class CharacterCommandBase extends CommandBase {
  protected sprite?: CharacterSprite;
  protected faces: Record<string, Face>;
  protected zIndex = defaultZIndex;
  defaultHideDuration = 300;

  constructor(
    r: Renderer,
    readonly name: string,
    faceOpts: FaceOption[],
    protected size: string,
    protected on: layerName
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

    this.r.RemoveLayer(this.sprite, this.on);

    const crossfade = new Crossfade(this.sprite.texture);
    this.beforeShow(crossfade);
    this.r.AddLayer(crossfade, this.on);
    crossfade.zIndex = this.zIndex;
    this.r.sortLayers(this.on);

    const resource = resources[face.paths(this.size)[0]];
    if (!resource) {
      debugger;
      throw new Error('resource not found');
    }
    await crossfade.animate(resource.texture, duration);

    this.r.RemoveLayer(crossfade, this.on);

    const nextSprite = await face.genSprite(this.size, resources);
    this.beforeShow(nextSprite);
    this.r.AddLayer(nextSprite, this.on);
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

    await this.r.AddLayer(sprite, this.on);
    await this.fadeIn(sprite, duration);

    return sprite;
  }

  async hideIntl(duration: number): Promise<boolean> {
    if (this.sprite) {
      await this.fadeOut(this.sprite, duration);
      await this.r.RemoveLayer(this.sprite, this.on);
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
}
