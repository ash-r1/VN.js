import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import { NEXT } from '../Game';
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
  private messageBox?: MessageBox;
  constructor(private r: Renderer, private ee: EventEmitter) {}

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

  cleanup = () => {
    //
    if (this.messageBox) {
      this.messageBox.clearText();
    }
  };

  async show(text: string, { duration = 500 }: ShowOption): Promise<Result> {
    if (!this.messageBox) {
      const messageBox = await MessageBox.init(this.r);
      messageBox.name = MESSAGE;
      messageBox.alpha = 0.0;
      messageBox.y = 620;
      await this.r.AddLayer(messageBox, 'ui');

      await this.fadeIn(duration);
      this.messageBox = messageBox;
    }

    await this.messageBox.animateText(text);
    console.log(text);

    this.ee.once(NEXT, this.cleanup);

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
