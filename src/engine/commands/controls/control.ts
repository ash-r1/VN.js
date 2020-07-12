import EventEmitter from 'eventemitter3';

import { Jump, Label } from '../../scenario/scenario';
import { Command } from '../command';
import { ParallelCommand } from './parallel';

interface JumpOptions {
  scenario?: string;
  label?: string;
}

export default class Control {
  constructor(private ee: EventEmitter) {}

  parallel(...commands: Command[]): Command {
    return new ParallelCommand(commands, this.ee);
  }

  // jump
  jump(options: JumpOptions): Jump {
    if (options.scenario) {
      return Jump.toScenario(options.scenario, options.label);
    }
    if (options.label) {
      return Jump.toLabel(options.label);
    }
    throw new Error('options must have least one property (scenario or label)');
  }

  // label
  label(label: string): Label {
    return new Label(label);
  }
}
