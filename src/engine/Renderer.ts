import * as PIXI from 'pixi.js';

interface Layers {
  world: PIXI.Container;
  bg: PIXI.Container;
  fg: PIXI.Container;
  ui: PIXI.Container;
  acc: PIXI.Container;
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
  // TODO: wrap this ticker... ?
  readonly ticker: PIXI.Ticker;

  layers: Layers;

  constructor(private app: PIXI.Application) {
    this.ticker = app.ticker;

    const world = new PIXI.Container();
    this.app.stage.addChild(world);

    const bg = new PIXI.Container();
    world.addChild(bg);

    const fg = new PIXI.Container();
    fg.sortableChildren = true;
    world.addChild(fg);

    const ui = new PIXI.Container();
    ui.sortableChildren = true;
    this.app.stage.addChild(ui);

    const acc = new PIXI.Container();
    acc.sortableChildren = true;
    this.app.stage.addChild(acc);

    this.layers = {
      world,
      bg,
      fg,
      ui,
      acc,
    };
  }

  AddLayer(layer: PIXI.DisplayObject, on: layerName, index?: number): void {
    const parent = this.layers[on];
    if (index) {
      parent.addChildAt(layer, index);
    } else {
      parent.addChild(layer);
    }

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

  GetLayerIndex(layer: PIXI.DisplayObject, on: layerName): number | undefined {
    const parent = this.layers[on];

    if (parent.children.includes(layer)) {
      return parent.getChildIndex(layer);
    }
    return undefined;
  }

  sortLayers(on: layerName) {
    const parent = this.layers[on];
    parent.sortChildren();
  }

  get width(): number {
    return this.app.screen.width;
  }

  get height(): number {
    return this.app.screen.height;
  }
}
