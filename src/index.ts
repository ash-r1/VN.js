import PIXI from 'pixi.js';

// To modify PIXI.loader before initialization, we must include pixi-sound here.
import 'pixi-sound';

import BaseGame from './engine/BaseGame';
import Camera from './engine/commands/camera';
import Character from './engine/commands/character';
import { Command } from './engine/commands/command';
import Control from './engine/commands/controls/control';
import Core from './engine/commands/core';
import Filter from './engine/commands/filter';
import Image from './engine/commands/image';
import Message from './engine/commands/message';
import { WAITING_GLYPH } from './engine/commands/message';
import Sound from './engine/commands/sound';
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
