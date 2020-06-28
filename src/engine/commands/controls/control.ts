import EventEmitter from 'eventemitter3';

import { Command } from '../command';
import { ParallelCommand } from './parallel';

export default class Control {
  constructor(private ee: EventEmitter) {}

  parallel(...commands: Command[]): Command {
    return new ParallelCommand(commands, this.ee);
  }
}
