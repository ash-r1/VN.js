import PIXISound from 'pixi-sound';

import Base from './base';
import { Command, pure, ResourceCommand } from './command';

interface SoundOption {
  volume?: number;
}

interface BGMOption extends SoundOption {
  loop?: boolean;
}

interface StopOption {
  todo?: number;
  // fade: number;
}

export default class Sound extends Base {
  private playing?: PIXISound.Sound;

  play(filename: string, { loop = true, ...option }: BGMOption): Command {
    const src = `game/sounds/${filename}.mp3`;

    return new ResourceCommand(src, async (resource) => {
      if (this.playing) {
        this.playing.stop();
        this.playing = undefined;
      }
      const sound = resource.sound;
      sound.play({ ...option, loop });
      this.playing = sound;
    });
  }

  se(filename: string, option: SoundOption): Command {
    const src = `game/sounds/${filename}.mp3`;

    return new ResourceCommand(src, async (resource) => {
      const sound = resource.sound;
      sound.play({ ...option, loop: false });
    });
  }

  stop({ todo }: StopOption): Command {
    return pure(async () => {
      if (this.playing) {
        this.playing.stop();
        this.playing = undefined;
      }
    });
  }
}
