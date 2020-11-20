import BaseGame from './BaseGame';
import { Command } from './commands/base/commands';
import { WAITING_GLYPH } from './commands/Message';
import { Label, ScenarioFactory, ScenarioIterator } from './scenario/scenario';
import { Jump } from './scenario/scenario';

// public events which can be used by commands
export const NEXT = '@core/next';
export const WAIT = '@core/wait';

export default class Runner<Game extends BaseGame> {
  readonly game: Game;
  readonly scenarios: Record<string, ScenarioFactory<Game>>;
  protected iter: ScenarioIterator;

  constructor(game: Game, scenarios: Record<string, ScenarioFactory<Game>>) {
    this.game = game;
    this.scenarios = scenarios;
    this.iter = new ScenarioIterator([]);
  }

  async jumpToScenario(scenarioName: string) {
    const g = this.scenarios[scenarioName];
    if (g) {
      const scenario = g(this.game);
      this.iter = new ScenarioIterator(scenario);
    } else {
      throw new Error(
        `The jump target scenario ${scenarioName} is not found in the list.`
      );
    }
    // NOTE: loadScenarioResources will break game-state on jump, just stop to do this.
    // TBD: preloading issue
    // await this.loadScenarioResources(scenario);
  }

  async run(entryPoint: string) {
    await this.game.loadBasicResources();
    this.game.message.texture = this.game.loader.resources[
      WAITING_GLYPH
    ].texture;

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
        const resources = await this.game.safeResources(command.paths);

        // exec it after loading.
        const result = await command.exec(resources);
        if (result && result.wait) {
          this.game.ee.emit(WAIT);
          await this.game.waitNext();
          this.game.ee.emit(NEXT);
        }
      } else if (row instanceof Label) {
        // TODO: store label for game saving feature?
        console.debug('label: ', row.label);
      } else if (row instanceof Jump) {
        if (row.scenario) {
          await this.jumpToScenario(row.scenario);
        }
        if (row.label) {
          this.iter.jump(row.label);
        }
        // Exec them on the next loop
      }
    }

    console.error('END');
  }
}
