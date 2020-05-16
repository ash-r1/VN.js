import { ScenarioGenerator } from 'src/scenario/generator';

import Renderer from './Renderer';

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class Game {
  constructor(private renderer: Renderer) {}

  async run(generator: (renderer: Renderer) => ScenarioGenerator) {
    const scenario = generator(this.renderer);
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

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
