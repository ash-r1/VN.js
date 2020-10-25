import * as PIXI from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import { NEXT, WAIT } from '../constants/events';
import MessageBox from '../layer/MessageBox';
import CommandBase from './base/CommandBase';
import { Command, pure, ResourceCommand } from './base/commands';

export interface ShowHideOption {
  duration?: number;
}

const ON_LAYER = 'ui';
const BG_PATH = 'game/textbox.png';
export const WAITING_GLYPH = 'ui/waiting-gliff.png';

export interface ShowOption extends ShowHideOption {
  x?: number;
  y?: number;
  wait?: boolean;
}
type HideOption = ShowHideOption;

export default class Message extends CommandBase {
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

  show(
    text: string,
    { duration = 500, wait = true }: ShowOption = {}
  ): Command {
    return new ResourceCommand(BG_PATH, async (resource) => {
      await this.prepareBox(resource.texture, duration);
      await this.messageBox?.animateText(text);

      // clean up after clickwait
      this.ee.once(NEXT, this.clearTextIntl);

      return {
        wait,
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

  name(name: string): Command {
    return new ResourceCommand(BG_PATH, async (resource) => {
      await this.prepareBox(resource.texture, 0);
      await this.messageBox?.changeNameText(name);
    });
  }

  clearName(): Command {
    return pure(async () => {
      await this.messageBox?.changeNameText('');
    });
  }

  async clear(): Promise<void> {
    this.clearTextIntl();
  }

  private prepareBox = async (texture: PIXI.Texture, duration: number) => {
    if (!this.messageBox) {
      const messageBox = new MessageBox(texture);
      // TODO: Fix magic number
      messageBox.y = 620;
      messageBox.alpha = 0.0;
      await this.r.AddLayer(messageBox, ON_LAYER);
      await this.fadeIn(messageBox, duration);
      this.messageBox = messageBox;
    }
  };

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
