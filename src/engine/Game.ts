import { IResourceDictionary } from 'pixi.js';

import EventEmitter from 'eventemitter3';

import { ScenarioGenerator } from 'src/engine/scenario/generator';

import Camera from './commands/camera';
import Character from './commands/character';
import { BaseCommand, Result } from './commands/command';
import Image from './commands/image';
import Message from './commands/message';
import { WAITING_GLYPH } from './commands/message';
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
  readonly message: Message;
  readonly srt: Character;
  readonly ktk: Character;
  readonly krn: Character;
  readonly kyu: Character;
  readonly icr: Character;
  readonly sound: Sound;
  readonly camera: Camera;

  constructor(
    private loader: PIXI.Loader,
    renderer: Renderer,
    responder: Responder
  ) {
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

    this.loader.add(WAITING_GLYPH);

    while (true) {
      const { value: command, done } = scenario.next();
      if (done) {
        break;
      }
      if (!command) {
        continue;
      }
      if (command instanceof BaseCommand) {
        const pathsShouldBeLoaded = command.paths.filter(
          (path) => !this.loader.resources[path]
        );
        if (pathsShouldBeLoaded) {
          this.loader.add(pathsShouldBeLoaded);
        }
      }
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

    this.message.texture = this.loader.resources[WAITING_GLYPH].texture;

    const scenario = generator(this);

    // after that, Execute
    while (true) {
      const { value: command, done } = scenario.next();
      if (done) {
        console.log('done.');
        break;
      }
      if (!command) {
        console.error('scenario generator returned invalid value.');
        continue;
      }

      let result: Result | void;
      if (command instanceof BaseCommand) {
        // BaseCommand
        const resources: IResourceDictionary = command.paths.reduce(
          (prev, path) => ({ ...prev, [path]: this.loader.resources[path] }),
          {}
        );
        result = await command.exec(resources);
      } else {
        // PureCommand
        result = await command;
      }
      if (result && result.wait) {
        this.ee.emit(WAIT);
        await this.waitNext();
        this.ee.emit(NEXT);
      }
    }
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
