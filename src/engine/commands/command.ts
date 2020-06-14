import { IResourceDictionary } from 'pixi.js';
import * as PIXI from 'pixi.js';

/**
 * Result of command
 */
export interface Result {
  /**
   * true if game should wait until user interaction
   */
  wait?: boolean;
}

type CommandPromise = Promise<Result> | Promise<void>;
type SingleExec = (resources: PIXI.LoaderResource) => CommandPromise;
type Exec = (resources: IResourceDictionary) => CommandPromise;

export type PureCommand = CommandPromise;

export abstract class BaseCommand {
  abstract get paths(): string[];
  abstract exec(resources: IResourceDictionary): CommandPromise;
}

export class ResourceCommand extends BaseCommand {
  constructor(private _path: string, private _exec: SingleExec) {
    super();
  }

  get paths() {
    return [this._path];
  }

  exec(resources: IResourceDictionary): CommandPromise {
    const resource = resources[this._path];
    return this._exec(resource);
  }
}

export class MultipleResourcesCommand extends BaseCommand {
  constructor(public readonly paths: string[], public exec: Exec) {
    super();
  }
}

export const execCommand = (
  command: Command,
  resources: PIXI.IResourceDictionary
): Promise<void | Result> => {
  if (command instanceof BaseCommand) {
    const commandResources = command.paths.reduce(
      (prev, path) => ({
        ...prev,
        [path]: resources[path],
      }),
      {}
    );
    return command.exec(commandResources);
  } else {
    return command;
  }
};

export type Command = PureCommand | BaseCommand;
