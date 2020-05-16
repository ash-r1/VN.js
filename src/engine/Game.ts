import * as PIXI from 'pixi.js';

import { ScenarioGenerator } from 'src/scenario/generator';

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class Game {
  private loader: PIXI.Loader;
  constructor(private app: PIXI.Application) {
    this.loader = app.loader;
  }

  async run(generator: (game: Game) => ScenarioGenerator) {
    const scenario = generator(this);
    while (true) {
      // TODO: このnextの発火をクリック待ちなどで制御すればエンジンの基礎構造が（あっさり）完成するのでは？
      const { value, done } = scenario.next();
      if (done) {
        console.log('done.');
        break;
      }
      if (value) {
        // do command
        await value;
        continue;
      }
      console.error(
        'scenario generator returned invalid (non-promise?) value.'
      );
    }
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
  async ShowImage(name: string, src: string): Promise<void> {
    const resource = await this.load(src);
    const sprite = new PIXI.Sprite(resource.texture);

    sprite.position.x = this.app.renderer.width / 2;
    sprite.position.y = this.app.renderer.height / 2;
    sprite.anchor.set(0.5, 0.5);
    sprite.alpha = 0.0;

    sprite.name = name;

    this.app.stage.addChild(sprite);

    // TODO: use ticker?

    for (let i = 0; i < 20; i++) {
      sprite.alpha = i / 20;
      await timeout(50);
    }

    return;
  }

  async HideImage(name: string): Promise<void> {
    // const resource = await this.load(name, src);
    // const sprite = new PIXI.Sprite(resource.texture);
    // // TODO: sprite.x,y,anchor, etc...
    // sprite.anchor.set(0.5, 0.5);
    // sprite.alpha = 0.0;

    const sprite = this.app.stage.getChildByName(name);
    // TODO: use ticker?

    for (let i = 20; i > 0; i--) {
      sprite.alpha = i / 20;
      await timeout(50);
    }

    this.app.stage.removeChild(sprite);

    return;
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
