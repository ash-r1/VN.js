import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import Base from './base';
import { Command, pure } from './command';

const timeout = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export default class Core extends Base {
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);
  }

  clickwait(): Command {
    return pure(async () => {
      return { wait: true };
    });
  }

  wait(duration: string): Command {
    return pure(async () => {
      await timeout(parseFloat(duration));
    });
  }
}
