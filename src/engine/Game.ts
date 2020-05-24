import EventEmitter from 'eventemitter3';

import { ScenarioGenerator } from 'src/engine/scenario/generator';

import Camera from './commands/camera';
import Character from './commands/character';
import Filter from './commands/filter';
import Image from './commands/image';
import Message from './commands/message';
import Sound from './commands/sound';
import Renderer from './Renderer';
import Responder from './Responder';

// internal event
const ONCLICK = '@intl/onclick';

// public events which can be used by commands
export const NEXT = '@core/next';
export const WAIT = '@core/wait';

const commonFrames = [
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
];

const baseFrames = [
  ...commonFrames,
  {
    code: 'a05',
    blink: true,
  },
];

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class Game {
  private ee: EventEmitter;
  readonly image: Image;
  readonly sound: Sound;
  readonly message: Message;
  readonly srt: Character;
  readonly ktk: Character;
  readonly krn: Character;
  readonly kyu: Character;
  readonly icr: Character;
  readonly camera: Camera;
  readonly filter: Filter;

  constructor(private renderer: Renderer, private responder: Responder) {
    const ee = new EventEmitter();
    this.image = new Image(renderer);
    this.sound = new Sound(renderer);
    this.message = new Message(renderer, ee);
    this.srt = new Character(renderer, ee, 'srt', [
      ...commonFrames,
      {
        code: 'a05a',
        filename: 'a05 a',
      },
    ]);
    this.ktk = new Character(renderer, ee, 'ktk', baseFrames);
    this.krn = new Character(renderer, ee, 'krn', baseFrames);
    this.kyu = new Character(renderer, ee, 'kyu', baseFrames);
    this.icr = new Character(renderer, ee, 'icr', baseFrames);
    this.camera = new Camera(renderer, ee);
    this.filter = new Filter(renderer);

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
