import { IResourceDictionary } from 'pixi.js';

import EventEmitter from 'eventemitter3';

import { Scenario } from 'src/engine/scenario/scenario';

import Camera from './commands/camera';
import Character from './commands/character';
import { Command } from './commands/command';
import Control from './commands/controls/control';
import Core from './commands/core';
import Filter from './commands/filter';
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
  readonly _: Control;
  readonly core: Core;
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

  constructor(
    private loader: PIXI.Loader,
    renderer: Renderer,
    responder: Responder
  ) {
    const ee = new EventEmitter();
    this._ = new Control(ee);
    this.core = new Core(renderer, ee);
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
    if (this.loader.loading) {
      await new Promise((resolve) => {
        this.loader.on('complete', resolve);
      });
    }
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

  async loadScenarioResources(scenario: Command[]) {
    // Load All at first...

    // TODO: loading view
    console.log('loading...');

    this.loader.add(WAITING_GLYPH);

    let cursor = 0;

    while (cursor < scenario.length) {
      const command = scenario[cursor];
      cursor++;
      await this.safeAddToLoader(command.paths);
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

  async run(generator: Scenario) {
    const scenario = generator(this);
    await this.loadScenarioResources(scenario);
    // TODO: control race condition of loading ...?

    this.message.texture = this.loader.resources[WAITING_GLYPH].texture;

    // before execution, reset some modules.
    this.srt.reset();
    this.ktk.reset();
    this.krn.reset();
    this.kyu.reset();
    this.icr.reset();

    let cursor = 0;

    // after that, Execute
    while (cursor < scenario.length) {
      const command = scenario[cursor];
      cursor++;

      // NOTE: The command might has state-based paths. (e.g. size based character image)
      //       So, we need to try loading resources for safe.
      const resources = await this.safeResources(command.paths);

      // exec it after loading.
      console.log('exec: ', command);
      const result = await command.exec(resources);
      if (result && result.wait) {
        this.ee.emit(WAIT);
        await this.waitNext();
        this.ee.emit(NEXT);
      }
    }

    alert('END');
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
