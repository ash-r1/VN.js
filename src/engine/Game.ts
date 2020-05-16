import { ScenarioGenerator } from 'src/scenario/generator';

import Renderer from '../renderer/Renderer';
import Image from './commands/image';

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class Game {
  readonly image: Image;
  constructor(private renderer: Renderer) {
    this.image = new Image(renderer);
  }
  //TODO: この辺りのimageとかの渡し方は今後改善しよう

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

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
