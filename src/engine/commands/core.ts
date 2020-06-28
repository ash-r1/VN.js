import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import Base from './base';
import { Command, pure } from './command';
import { ParallelCommand } from './parallel';

const timeout = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export default class Core extends Base {
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);
  }

  parallel(...commands: Command[]): Command {
    return new ParallelCommand(commands, this.ee);
  }

  ifElse(
    condition: () => boolean,
    positives: Command[],
    negatives: Command[]
  ): Command[] {
    // TODO: wrap with Command, return resources for both of them.
    if (condition()) {
      return positives;
    } else {
      return negatives;
    }
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
