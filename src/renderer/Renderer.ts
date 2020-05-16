import * as PIXI from 'pixi.js';

export interface LayerProps {
  x?: number;
  y?: number;
  alpha?: number;
  width?: number;
  height?: number;
  // TODO: angle
  // TODO: filter, filterArea
  // TODO: localTransform
  // TODO: rotation
}

const setLayerProps = (layer: PIXI.DisplayObject, props: LayerProps) => {
  // TODO: make it typesafe-implementation
  ['x', 'y', 'width', 'height', 'alpha'].forEach((property) => {
    if (props[property]) {
      layer[property] = props[property];
    }
  });
};

export type AddImageProps = LayerProps;

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
  constructor(private app: PIXI.Application) {
    this.loader = app.loader;
    this.ticker = app.ticker;
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

  // TODO: よりメタな概念として addLayer みたいなの欲しいかもなぁー

  // TODO: フェードインとかがマジで厄介だよなぁ... いっそ細かい事はここでは管理せず、コマンドで制御させるべきなのか？ とりあえずこれで概形作ってから考えるか。。。
  /**
   *
   * @param name イメージレイヤの名前
   * @param src 画像ファイル名
   * @todo 重複した場合過去のものと入れ替える？
   */
  async AddImageLayer(
    name: string,
    src: string,
    { x = 0.0, y = 0.0, alpha = 1.0 }: AddImageProps
  ): Promise<void> {
    // TODO: remove the layer has same name if exists

    const resource = await this.load(src);
    const sprite = new PIXI.Sprite(resource.texture);
    sprite.name = name;

    // use center of the image as a anchor
    sprite.anchor.set(0.5, 0.5);
    setLayerProps(sprite, { x, y, alpha });

    // TODO: remove if the name is already used
    this.app.stage.addChild(sprite);

    return;
  }

  async RemoveLayer(name: string): Promise<boolean> {
    const sprite = this.app.stage.getChildByName(name);
    if (!sprite) {
      return false;
    }

    this.app.stage.removeChild(sprite);

    return true;
  }

  async SetLayerProps(name: string, props: LayerProps): Promise<boolean> {
    const sprite = this.app.stage.getChildByName(name);
    if (!sprite) {
      return false;
    }

    setLayerProps(sprite, props);

    return true;
  }
}
