import * as PIXI from 'pixi.js';

interface Layers {
  world: PIXI.Container;
  bg: PIXI.Container;
  fg: PIXI.Container;
  ui: PIXI.Container;
}
export type layerName = keyof Layers;

/**
 * Renderer レンダリングとそのためのリソース管理を責務とするモジュール
 *
 * Do:
 * - レンダリング
 * - addChild等のレイヤ構造周りをカプセル化、適切な粒度でのレイヤ構造化
 *
 * Never Do:
 * - ゲームステートの管理
 * - ユーザーインタラクション
 * - リソース系以外の細やかな非同期処理
 *
 */
export default class Renderer {
  private loader: PIXI.Loader;
  // TODO: wrap this ticker... ?
  readonly ticker: PIXI.Ticker;

  private layers: Layers;

  constructor(private app: PIXI.Application) {
    this.loader = app.loader;
    this.ticker = app.ticker;

    const world = new PIXI.Container();
    this.app.stage.addChild(world);

    const bg = new PIXI.Container();
    world.addChild(bg);

    const fg = new PIXI.Container();
    world.addChild(fg);

    const ui = new PIXI.Container();
    this.app.stage.addChild(ui);

    this.layers = {
      world,
      bg,
      fg,
      ui,
    };
  }

  load(src: string): Promise<PIXI.LoaderResource> {
    return new Promise((resolve) => {
      const cache = this.loader.resources[src];
      if (cache) {
        resolve(cache);
        return;
      }
      this.loader.add(src, src).load((loader, resources) => {
        const resource = resources[src];
        resolve(resource);
      });
    });
  }

  loadMulti(srcList: string[]): Promise<Record<string, PIXI.LoaderResource>> {
    return new Promise((resolve) => {
      const caches: Record<string, PIXI.LoaderResource> = {};
      const srcListToLoad = srcList.filter((src) => {
        const res = this.loader.resources[src];
        if (res) {
          caches[src] = res;
        }
        return !res;
      });

      // TODO return immediately if all resoures are cached

      const srcSet = new Set(srcListToLoad);
      const addedLoader = Array.from(srcSet).reduce((loader, src) => {
        return loader.add(src, src);
      }, this.loader);
      addedLoader.load((loader, resources) => {
        // TODO: check if resources certainly has all of srcList properties
        const result: Record<string, PIXI.LoaderResource> = srcList.reduce(
          (prev, current) => {
            return {
              ...prev,
              [current]: resources[current],
            };
          },
          {}
        );
        resolve({ ...caches, ...result });
      });
    });
  }

  AddLayer(layer: PIXI.DisplayObject, on: layerName): void {
    const parent = this.layers[on];
    parent.addChild(layer);

    return;
  }

  RemoveLayer(layer: PIXI.DisplayObject, on: layerName): boolean {
    const parent = this.layers[on];

    if (parent.children.includes(layer)) {
      parent.removeChild(layer);
      return true;
    }
    return false;
  }

  get width(): number {
    return this.app.screen.width;
  }

  get height(): number {
    return this.app.screen.height;
  }
}
