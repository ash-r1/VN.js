import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import Base from './base';
import { Command, Result } from './command';
import { ParallelCommand } from './parallel';

export default class System extends Base {
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);
  }

  parallel(...commands: Command[]): Command {
    return new ParallelCommand(commands, this.ee);
  }

  async clickwait(): Promise<Result> {
    return { wait: true };
  }
}
