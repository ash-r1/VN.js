// To modify PIXI.loader before initialization, we must include pixi-sound here.
import 'pixi-sound';

import BaseGame from './engine/BaseGame';
import {
  Command,
  pure,
  PureCommand,
  ResourceCommand,
} from './engine/commands/base/commands';
import { MultipleResourcesCommand } from './engine/commands/base/commands';
import Camera from './engine/commands/Camera';
import Character from './engine/commands/Character';
import Control from './engine/commands/controls/Control';
import Core from './engine/commands/Core';
import Filter from './engine/commands/filters';
import Image from './engine/commands/Image';
import Message from './engine/commands/Message';
import { WAITING_GLYPH } from './engine/commands/Message';
import Side from './engine/commands/Side';
import Sound from './engine/commands/Sound';
import GameLayer from './engine/GameLayer';
import Renderer from './engine/Renderer';
import Responder from './engine/Responder';
import Runner from './engine/Runner';
import * as redux from './redux';

export {
  BaseGame,
  GameLayer,
  redux,
  Runner,
  Renderer,
  Responder,
  // Commands
  Camera,
  Character,
  Side,
  Command,
  PureCommand,
  ResourceCommand,
  MultipleResourcesCommand,
  pure,
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
