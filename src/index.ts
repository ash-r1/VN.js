import * as PIXI from 'pixi.js';

// To modify PIXI.loader before initialization, we must include pixi-sound here.
import 'pixi-sound';

import BaseGame from './engine/BaseGame';
import { Command } from './engine/commands/base/commands';
import Camera from './engine/commands/Camera';
import Character from './engine/commands/Character';
import Control from './engine/commands/controls/Control';
import Core from './engine/commands/Core';
import Filter from './engine/commands/filters';
import Image from './engine/commands/Image';
import Message from './engine/commands/Message';
import { WAITING_GLYPH } from './engine/commands/Message';
import Sound from './engine/commands/Sound';
import Renderer from './engine/Renderer';
import Responder from './engine/Responder';
import Runner from './engine/Runner';

export {
  // PIXI
  PIXI,
  // Core
  BaseGame,
  Runner,
  Renderer,
  Responder,
  // Commands
  Camera,
  Character,
  Command,
  Control,
  Core,
  Filter,
  Image,
  Message,
  Sound,
  // Other
  WAITING_GLYPH,
};

export * from './engine/scenario/scenario';
