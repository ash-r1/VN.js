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
  private waiting?: PIXI.DisplayObject;
  private waitingTime: number;

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

    this.waitingTime = 0;
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

  /* ==========
   * waiting
   * ========== */

  async showWaiting() {
    // TODO: split to other. may subscribe Game's onclick/clickwait event
    const src = 'ui/waiting-gliff.png';
    if (!this.waiting) {
      const resource = await this.load(src);
      const sprite = new PIXI.Sprite(resource.texture);
      sprite.name = '@waiting';
      this.app.stage.addChild(sprite);
      sprite.alpha = 0.0;
      sprite.x = 1860;
      sprite.y = 1020;
      this.waiting = sprite;
      this.waitingTime = 0;
      this.ticker.add(this.animateWaiting);
    }
  }

  async hideWaiting() {
    if (this.waiting) {
      this.app.stage.removeChild(this.waiting);
      this.waiting = undefined;
      this.ticker.remove(this.animateWaiting);
    }
  }

  private animateWaiting = (t: number) => {
    if (!this.waiting) {
      return;
    }

    this.waitingTime += t * this.ticker.deltaMS;
    const alpha = Math.abs(Math.sin(this.waitingTime / 800));
    this.waiting.alpha = alpha;
  };
}
