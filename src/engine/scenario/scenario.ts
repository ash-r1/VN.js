import { Command } from 'src/engine/commands/command';

import Game from '../Game';

export type Row = Command | Label | Jump;
export type Scenario = Row[];
export type ScenarioFactory = (game: Game) => Scenario;

export class Label {
  constructor(readonly label: string) {}
}

export class Jump {
  private constructor(readonly scenario?: string, readonly label?: string) {}
  static toScenario(scenario: string, label?: string) {
    return new Jump(scenario, label);
  }
  static toLabel(label: string) {
    return new Jump(undefined, label);
  }
}

export class ScenarioIterator implements IterableIterator<Row> {
  private cursor = 0;
  private labelCursors: Record<string, number>;

  constructor(private scenario: Scenario) {
    this.labelCursors = scenario.reduce<Record<string, number>>(
      (prev, row, index) => {
        if (row instanceof Label) {
          return {
            ...prev,
            [row.label]: index,
          };
        }
        return prev;
      },
      {}
    );
  }

  next(): IteratorResult<Row> {
    if (this.scenario.length <= this.cursor) {
      return {
        done: true,
        value: null,
      };
    }
    return {
      value: this.scenario[this.cursor++],
    };
  }

  [Symbol.iterator](): IterableIterator<Row> {
    return this;
  }

  jump(label: string): void {
    this.cursor = this.labelCursors[label];
  }
}
