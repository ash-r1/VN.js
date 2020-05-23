import EventEmitter from 'eventemitter3';

import { ScenarioGenerator } from 'src/engine/scenario/generator';

import Character from './commands/character';
import Image from './commands/image';
import Message from './commands/message';
import Renderer from './Renderer';
import Responder from './Responder';

const NEXT = '@next';

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class Game {
  readonly image: Image;
  readonly message: Message;
  readonly ktk: Character;
  private ee: EventEmitter;

  constructor(private renderer: Renderer, private responder: Responder) {
    this.image = new Image(renderer);
    this.message = new Message(renderer);
    this.ktk = new Character(renderer, 'ktk', [
      {
        code: 'a01',
        blink: true,
      },
      {
        code: 'a02',
        blink: true,
      },
      {
        code: 'a03',
        blink: true,
      },
      {
        code: 'a04',
        blink: true,
      },
      {
        code: 'a05',
        blink: true,
      },
    ]);

    // configure click/tap
    this.ee = new EventEmitter();
    responder.on('click', () => {
      console.log('clicked');
      this.ee.emit(NEXT);
    });
    // TODO: tap? touchstart?
    responder.on('tap', () => {
      this.ee.emit(NEXT);
    });
  }

  //TODO: この辺りのimageとかの渡し方は今後改善しよう

  waitNext(): Promise<void> {
    return new Promise((resolve) => {
      this.onceNext(resolve);
    });
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
        const result = await value;
        if (result.shouldWait) {
          await this.renderer.showWaiting();
          await this.waitNext();
          await this.renderer.hideWaiting();
        }
        continue;
      }
      console.error(
        'scenario generator returned invalid (non-promise?) value.'
      );
    }
  }

  onNext(cb: () => void) {
    this.ee.on(NEXT, cb);
  }
  onceNext(cb: () => void) {
    this.ee.once(NEXT, cb);
  }
  removeNext(cb: () => void) {
    this.ee.removeListener(NEXT, cb);
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
