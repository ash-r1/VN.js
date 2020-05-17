import Renderer from 'src/engine/Renderer';

import MessageBox from '../layer/MessageBox';
import { Result } from './command';
import tickPromise from './tickPromise';

export interface ShowHideOption {
  duration?: number;
}

const MESSAGE = '@message';

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

export default class Message {
  constructor(private r: Renderer) {}

  private async fadeIn(duration: number): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(MESSAGE, 'ui', { alpha: ratio });
    });
  }

  private async fadeOut(duration: number): Promise<void> {
    await tickPromise(this.r.ticker, duration, (ratio) => {
      this.r.SetLayerProps(MESSAGE, 'ui', { alpha: 1 - ratio });
    });
  }

  async show(text: string, { duration = 500 }: ShowOption): Promise<Result> {
    // TODO: fade only if the message layer not exists
    await this.r.RemoveLayer(MESSAGE, 'ui');

    const messageBox = await MessageBox.init(this.r);
    messageBox.name = MESSAGE;
    messageBox.alpha = 0.0;
    messageBox.y = 620;
    await this.r.AddLayer(messageBox, 'ui');

    await this.fadeIn(duration);

    await messageBox.animateText(text);
    console.log(text);

    return {
      shouldWait: true,
    };
  }

  async hide({ duration = 500 }: HideOption): Promise<Result> {
    await this.fadeOut(duration);
    await this.r.RemoveLayer(MESSAGE, 'ui');

    return {
      shouldWait: false,
    };
  }
}
