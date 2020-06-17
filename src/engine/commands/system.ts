import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import Base from './base';
import { Command, pure } from './command';
import { ParallelCommand } from './parallel';

const timeout = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export default class System extends Base {
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);
  }

  parallel(...commands: Command[]): Command {
    return new ParallelCommand(commands, this.ee);
  }

  clickwait(options = {}): Command {
    return pure(async () => {
      return { wait: true };
    });
  }

  wait(duration: number): Command {
    return pure(async () => {
      await timeout(duration);
    });
  }
}
