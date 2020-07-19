import { IResourceDictionary } from 'pixi.js';

import EventEmitter from 'eventemitter3';

import scenarios from '../scenario';
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
import { Label, ScenarioFactory, ScenarioIterator } from './scenario/scenario';
import { Jump } from './scenario/scenario';

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
  readonly scenarios: Record<string, ScenarioFactory>;
  private iter: ScenarioIterator;
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
    this.scenarios = scenarios;
    this.iter = new ScenarioIterator([]);

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

  async loadBasicResources() {
    this.loader.add(WAITING_GLYPH);
    await this.load();
  }

  async safeResources(paths: string[]): Promise<IResourceDictionary> {
    await this.safeAddToLoader(paths);
    await this.load();

    return Object.fromEntries(
      paths.map((path) => [path, this.loader.resources[path]])
    );
  }

  async jumpToScenario(scenarioName: string) {
    const scenario = this.scenarios[scenarioName](this);
    this.iter = new ScenarioIterator(scenario);
    // NOTE: loadScenarioResources will break game-state on jump, just stop to do this.
    // TBD: preloading issue
    // await this.loadScenarioResources(scenario);
  }

  async run(entryPoint: string) {
    await this.loadBasicResources();
    this.message.texture = this.loader.resources[WAITING_GLYPH].texture;

    this.jumpToScenario(entryPoint);

    await this.loop();
  }

  async loop() {
    while (true) {
      const iterResult = this.iter.next();
      if (iterResult.done) {
        break;
      }
      const row = iterResult.value;

      if (row instanceof Command) {
        const command = row;
        const resources = await this.safeResources(command.paths);

        // exec it after loading.
        const result = await command.exec(resources);
        if (result && result.wait) {
          this.ee.emit(WAIT);
          await this.waitNext();
          this.ee.emit(NEXT);
        }
      } else if (row instanceof Label) {
        // TODO: store label for game saving feature?
        console.debug('label: ', row.label);
      } else if (row instanceof Jump) {
        if (row.scenario) {
          this.jumpToScenario(row.scenario);
        }
        if (row.label) {
          this.iter.jump(row.label);
        }
        // Exec them on the next loop
      }
    }

    console.error('END');
  }

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
