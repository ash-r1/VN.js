import PIXISound from 'pixi-sound';

import CommandBase from './base/CommandBase';
import { Command, pure, ResourceCommand } from './base/commands';

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

export default class Sound extends CommandBase {
  private playing?: PIXISound.Sound;

  play(filename: string, { loop = true, ...option }: BGMOption = {}): Command {
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

  se(filename: string, option: SoundOption = {}): Command {
    const src = `game/sounds/${filename}.mp3`;

    return new ResourceCommand(src, async (resource) => {
      const sound = resource.sound;
      sound.play({ ...option, loop: false });
    });
  }

  stop({ todo }: StopOption = {}): Command {
    return pure(async () => {
      if (this.playing) {
        this.playing.stop();
        this.playing = undefined;
      }
    });
  }
}
