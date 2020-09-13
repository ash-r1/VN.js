import PIXI, { IResourceDictionary } from 'pixi.js';

import EventEmitter from 'eventemitter3';

import Camera from './commands/Camera';
import Control from './commands/controls/Control';
import Core from './commands/Core';
import Filter from './commands/filters';
import Image from './commands/Image';
import Message from './commands/Message';
import { WAITING_GLYPH } from './commands/Message';
import Sound from './commands/Sound';
import { ONCLICK } from './constants/events';
import Renderer from './Renderer';
import Responder from './Responder';

/**
 * Gameではレイヤへのプリミティブなアクセスのみを許可する。これ以上に複雑な状態制御はCommandのレイヤで行う。
 */
export default class BaseGame {
  readonly ee: EventEmitter;
  readonly _: Control;
  readonly core: Core;
  readonly image: Image;
  readonly sound: Sound;
  readonly message: Message;
  readonly camera: Camera;
  readonly filter: Filter;

  constructor(
    readonly loader: PIXI.Loader,
    renderer: Renderer,
    responder: Responder
  ) {
    const ee = new EventEmitter();
    this._ = new Control(ee);
    this.core = new Core(renderer, ee);
    this.image = new Image(renderer);
    this.sound = new Sound(renderer);
    this.message = new Message(renderer, ee);

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
        this.loader.onComplete.once(resolve);
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

  // TODO: クリック時の瞬時表示などをするにはRxJSとか使った方が綺麗に書けるのかも知れない
}
