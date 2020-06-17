import { IResourceDictionary } from 'pixi.js';

import EventEmitter from 'eventemitter3';

import { Command, Result } from './command';

export const BEGIN = '@parallel/BEGIN';
export const END = '@parallel/END';

export class ParallelCommand extends Command {
  constructor(private commands: Command[], private ee: EventEmitter) {
    super();
  }

  get paths(): string[] {
    return this.commands.reduce((prev, current) => {
      if (current instanceof Command) {
        return [...prev, ...current.paths];
      } else {
        return prev;
      }
    }, [] as string[]);
    //TODO: Uniq?
  }

  async exec(resources: IResourceDictionary): Promise<Result> {
    // TODO: pass commands meta dict as event meta?
    this.ee.emit(BEGIN);
    const results: (Result | void)[] = await Promise.all(
      this.commands.map(async (command) => {
        const filtered = Object.fromEntries(
          command.paths.map((path) => [path, resources[path]])
        );
        await command.exec(filtered);
      })
    );

    const wait = results.reduce((prev, current) => {
      const result = current || undefined;
      return result?.wait ?? prev;
    }, false);

    // TODO: pass commands meta dict as event meta?
    this.ee.emit(END);

    return { wait };
  }
}
