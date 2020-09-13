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
type NoResourceExec = () => CommandPromise;
type SingleResourceExec = (resource: PIXI.LoaderResource) => CommandPromise;
type MultipleResourcesExec = (resources: IResourceDictionary) => CommandPromise;

export abstract class Command {
  abstract get paths(): string[];
  abstract exec(resources: IResourceDictionary): CommandPromise;
}

export class PureCommand extends Command {
  constructor(private _exec: NoResourceExec) {
    super();
  }

  get paths() {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exec(resources: IResourceDictionary): CommandPromise {
    return this._exec();
  }
}

export const pure = (exec: NoResourceExec) => new PureCommand(exec);

export class ResourceCommand extends Command {
  constructor(private _path: string, private _exec: SingleResourceExec) {
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

export class MultipleResourcesCommand extends Command {
  constructor(
    public readonly paths: string[],
    public exec: MultipleResourcesExec
  ) {
    super();
  }
}
