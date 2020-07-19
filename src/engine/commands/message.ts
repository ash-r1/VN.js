import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import { NEXT, WAIT } from '../Game';
import MessageBox from '../layer/MessageBox';
import Base from './base';
import { Command, pure, ResourceCommand } from './command';

export interface ShowHideOption {
  duration?: number;
}

const ON_LAYER = 'ui';
export const WAITING_GLYPH = 'ui/waiting-gliff.png';

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
}
type HideOption = ShowHideOption;

export default class Message extends Base {
  private messageBox?: MessageBox;
  private waiting?: PIXI.DisplayObject;
  private waitingTime = 0;
  public texture?: PIXI.Texture;

  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);

    this.ee.on(WAIT, this.showWaiting);
    this.ee.on(NEXT, this.hideWaiting);
  }

  private clearTextIntl = () => {
    if (this.messageBox) {
      this.messageBox.clearText();
    }
  };

  show(text: string, { duration = 500 }: ShowOption = {}): Command {
    const src = 'game/textbox.png';
    return new ResourceCommand(src, async (resource) => {
      if (!this.messageBox) {
        const messageBox = new MessageBox(resource.texture);
        // TODO: Fix magic number
        messageBox.y = 620;
        messageBox.alpha = 0.0;
        await this.r.AddLayer(messageBox, ON_LAYER);
        await this.fadeIn(messageBox, duration);
        this.messageBox = messageBox;
      }

      await this.messageBox.animateText(text);

      // clean up after clickwait
      this.ee.once(NEXT, this.clearTextIntl);

      return {
        wait: true,
      };
    });
  }

  hide({ duration = 500 }: HideOption = {}): Command {
    return pure(async () => {
      if (this.messageBox) {
        await this.fadeOut(this.messageBox, duration);
        await this.r.RemoveLayer(this.messageBox, ON_LAYER);
        this.messageBox = undefined;
      }
    });
  }

  async clear(): Promise<void> {
    this.clearTextIntl();
  }

  private showWaiting = async () => {
    // TODO: split to other. may subscribe Game's onclick/clickwait even
    if (!this.waiting) {
      const sprite = new PIXI.Sprite(this.texture);
      this.r.AddLayer(sprite, ON_LAYER);
      sprite.alpha = 0.0;
      sprite.x = 1860;
      sprite.y = 1020;
      this.waiting = sprite;
      this.waitingTime = 0;
      this.r.ticker.add(this.animateWaiting);
    }
  };

  private hideWaiting = async () => {
    if (this.waiting) {
      this.r.RemoveLayer(this.waiting, ON_LAYER);
      this.waiting = undefined;
      this.r.ticker.remove(this.animateWaiting);
    }
  };

  private animateWaiting = (t: number) => {
    if (!this.waiting) {
      return;
    }

    this.waitingTime += t * this.r.ticker.deltaMS;
    const alpha = Math.abs(Math.sin(this.waitingTime / 800));
    this.waiting.alpha = alpha;
  };
}
