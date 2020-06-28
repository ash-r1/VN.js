import { Command } from 'src/engine/commands/command';

import Game from '../Game';

// TOOD:
/*
 It is dead end to implement script as JavaScript Generator Func.
 First, it's difficult/inefficient to jump.
 Second, save/load are also difficult.

 So, type of scenarios should be changed to Array or Iterator<Command>, Then it can be executed.
 After changeing them, I can try to emplement easier Command instead of over `pure` func.
 */
export type Scenario = (game: Game) => Command[];
