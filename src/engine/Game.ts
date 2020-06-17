import { IResourceDictionary } from 'pixi.js';

import EventEmitter from 'eventemitter3';

import { ScenarioGenerator } from 'src/engine/scenario/generator';

import Camera from './commands/camera';
import Character from './commands/character';
import { Command } from './commands/command';
import Filter from './commands/filter';
import Image from './commands/image';
import Message from './commands/message';
import { WAITING_GLYPH } from './commands/message';
import Sound from './commands/sound';
import System from './commands/system';
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
  readonly system: System;
  readonly image: Image;
  readonly message: Message;
  readonly srt: Character;
  readonly ktk: Character;
  readonly krn: Character;
  readonly kyu: Character;
  readonly icr: Character;
  readonly sound: Sound;
  readonly camera: Camera;
  readonly filter: Filter;

  constructor(
    private loader: PIXI.Loader,
    renderer: Renderer,
    responder: Responder
  ) {
    const ee = new EventEmitter();
    this.system = new System(renderer, ee);
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

  async safeAddToLoader(paths: string[]) {
    // TODO: wait if the loader is loading
    const pathsShouldBeLoaded = paths.filter(
      (path) => !this.loader.resources[path]
    );
    if (pathsShouldBeLoaded) {
      this.loader.add(pathsShouldBeLoaded);
    }
  }

  async load() {
    await new Promise((resolve) => {
      this.loader.load(resolve);
    });
  }

  async loadScenarioResources(generator: (game: Game) => ScenarioGenerator) {
    const scenario = generator(this);

    // Load All at first...

    // TODO: loading view
    console.log('loading...');

    this.loader.add(WAITING_GLYPH);

    while (true) {
      const { value: command, done } = scenario.next();
      if (done) {
        break;
      }
      if (command) {
        await this.safeAddToLoader(command.paths);
      }
    }

    await this.load();

    console.log('loading finished');
  }

  async safeResources(paths: string[]): Promise<IResourceDictionary> {
    await this.safeAddToLoader(paths);
    await this.load();

    return Object.fromEntries(
      paths.map((path) => [path, this.loader.resources[path]])
    );
  }

  async run(generator: (game: Game) => ScenarioGenerator) {
    await this.loadScenarioResources(generator);
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

      // NOTE: The command might has state-based paths. (e.g. size based character image)
      //       So, we need to try loading resources for safe.

      console.log('executing: ', command);
      const resources = await this.safeResources(command.paths);
      const result = await command.exec(resources);
      if (result && result.wait) {
        this.ee.emit(WAIT);
        await this.waitNext();
        this.ee.emit(NEXT);
      }
    }
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
