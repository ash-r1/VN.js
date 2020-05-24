import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import { NEXT } from '../Game';
import MessageBox from '../layer/MessageBox';
import Base from './base';
import { Result } from './command';

export interface ShowHideOption {
  duration?: number;
}

const ON_LAYER = 'ui';

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

export default class Message extends Base {
  private messageBox?: MessageBox;
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);
  }

  clearText = () => {
    if (this.messageBox) {
      this.messageBox.clearText();
    }
  };

  async show(text: string, { duration = 500 }: ShowOption): Promise<Result> {
    if (!this.messageBox) {
      const messageBox = await MessageBox.init(this.r);
      // TODO: Fix magic number
      messageBox.y = 620;
      messageBox.alpha = 0.0;
      await this.r.AddLayer(messageBox, ON_LAYER);
      await this.fadeIn(messageBox, duration);
      this.messageBox = messageBox;
    }

    await this.messageBox.animateText(text);

    // clean up after clickwait
    this.ee.once(NEXT, this.clearText);

    return {
      shouldWait: true,
    };
  }

  async hide({ duration = 500 }: HideOption): Promise<Result> {
    if (this.messageBox) {
      await this.fadeOut(this.messageBox, duration);
      await this.r.RemoveLayer(this.messageBox, ON_LAYER);
      this.messageBox = undefined;
    }

    return {
      shouldWait: false,
    };
  }

  async clear(): Promise<Result> {
    this.clearText();
    return {
      shouldWait: false,
    };
  }
}
