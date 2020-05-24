import EventEmitter from 'eventemitter3';

import { ScenarioGenerator } from 'src/engine/scenario/generator';

import Character from './commands/character';
import Image from './commands/image';
import Message from './commands/message';
import Renderer from './Renderer';
import Responder from './Responder';

// internal event
const ONCLICK = '@intl/onclick';

// public events which can be used by commands
export const NEXT = '@core/next';
export const WAIT = '@core/wait';

const baseFrames = [
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
];

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class Game {
  readonly image: Image;
  readonly message: Message;
  readonly ktk: Character;
  readonly krn: Character;
  private ee: EventEmitter;

  constructor(private renderer: Renderer, private responder: Responder) {
    const ee = new EventEmitter();
    this.image = new Image(renderer);
    this.message = new Message(renderer, ee);
    this.ktk = new Character(renderer, 'ktk', baseFrames);
    this.krn = new Character(renderer, 'krn', baseFrames);

    // configure click/tap
    this.ee = ee;
    responder.on('click', () => {
      console.log('clicked');
      this.ee.emit(ONCLICK);
    });
    // TODO: tap? touchstart?
    responder.on('tap', () => {
      console.log('tapped');
      this.ee.emit(ONCLICK);
    });
  }

  //TODO: この辺りのimageとかの渡し方は今後改善しよう

  waitNext(): Promise<void> {
    return new Promise((resolve) => {
      this.ee.once(ONCLICK, resolve);
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
          //await this.renderer.showWaiting();
          this.ee.emit(WAIT);
          await this.waitNext();
          this.ee.emit(NEXT);
          //await this.renderer.hideWaiting();
        }
        continue;
      }
      console.error(
        'scenario generator returned invalid (non-promise?) value.'
      );
    }
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
