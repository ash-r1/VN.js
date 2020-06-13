import EventEmitter from 'eventemitter3';

import { ScenarioGenerator } from 'src/engine/scenario/generator';

import Image from './commands/image';
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

  constructor(
    private loader: PIXI.Loader,
    private renderer: Renderer,
    private responder: Responder
  ) {
    const ee = new EventEmitter();
    this.image = new Image(renderer);

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

  async loadAll(generator: (game: Game) => ScenarioGenerator) {
    const scenario = generator(this);

    // Load All at first...

    // TODO: loading view
    while (true) {
      const { value: command, done } = scenario.next();
      if (done) {
        break;
      }
      if (!command) {
        continue;
      }
      this.loader.add(command.paths);
    }

    // TODO: show loading window
    console.log('loading...');

    await new Promise((resolve) => {
      this.loader.load(resolve);
    });

    console.log('loading finished');
  }

  async run(generator: (game: Game) => ScenarioGenerator) {
    await this.loadAll(generator);
    // TODO: control race condition of loading ...?

    const scenario = generator(this);

    // after that, Execute
    while (true) {
      const { value: command, done } = scenario.next();
      if (done) {
        console.log('done.');
        break;
      }
      if (command) {
        // 絞るべきなのか、単にloaderの持つresourcesを全部渡すべきかわからない
        const resources = command.resources(this.loader.resources);
        // do command
        const result = await command.exec(resources);
        if (result.shouldWait) {
          //await this.renderer.showWaiting();
          this.ee.emit(WAIT);
          await this.waitNext();
          this.ee.emit(NEXT);
          //await this.renderer.hideWaiting();
        }
        continue;
      }
      console.error('scenario generator returned invalid value.');
    }
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
