import * as PIXI from 'pixi.js';

import Game from 'src/engine/Game';

/**
 * Result of command
 */
export interface Result {
  /**
   * true if game should wait until user interaction
   */
  shouldWait: boolean;
}

export type Exec = (
  resources: Record<string, PIXI.LoaderResource>
) => Promise<Result>;

export class Command {
  private _paths: string[];
  get paths(): string[] {
    return this._paths;
  }

  resources(resources: PIXI.IResourceDictionary): PIXI.IResourceDictionary {
    return this.paths.reduce(
      (prev, path) => ({
        ...prev,
        [path]: resources[path],
      }),
      {}
    );
  }

  constructor(res: string | string[], public exec: Exec) {
    if (typeof res === 'string') {
      this._paths = [res];
    } else {
      this._paths = res;
    }
  }
}

export class NoResourceCommand extends Command {
  constructor(exec: Exec) {
    super([], exec);
  }
}
