import EventEmitter from 'eventemitter3';

import Renderer from 'src/engine/Renderer';

import CommandBase from './base/CommandBase';
import { Command, pure } from './base/commands';

const timeout = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export default class Core extends CommandBase {
  constructor(r: Renderer, private ee: EventEmitter) {
    super(r);
  }

  clickwait(): Command {
    return pure(async () => {
      return { wait: true };
    });
  }

  wait(duration: number): Command {
    return pure(async () => {
      // sec -> msec
      await timeout(duration * 1000);
    });
  }
}
