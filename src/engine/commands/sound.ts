import * as PIXI from 'pixi.js';

import PIXISound from 'pixi-sound';

import { layerName } from '../Renderer';
import Base from './base';
import { Result } from './command';

interface SoundOption {
  volume?: number;
}

interface BGMOption extends SoundOption {
  //
  loop?: boolean;
}

export default class Sound extends Base {
  private playing?: PIXISound.Sound;

  async play(
    filename: string,
    { loop = true, ...option }: BGMOption
  ): Promise<Result> {
    // stop at first
    await stop();

    const src = `game/sounds/${filename}.mp3`;
    const resource = await this.r.load(src);
    const sound = resource.sound;
    sound.play({ ...option, loop });
    this.playing = sound;

    return {
      shouldWait: false,
    };
  }

  async se(filename: string, option: SoundOption): Promise<Result> {
    const src = `game/sounds/${filename}.mp3`;
    const resource = await this.r.load(src);
    resource.sound.play({ ...option, loop: false });

    return {
      shouldWait: false,
    };
  }

  async stop(): Promise<Result> {
    if (this.playing) {
      this.playing.stop();
      this.playing = undefined;
    }
    return {
      shouldWait: false,
    };
  }
}
