import { Command } from 'src/engine/commands/base/commands';

import BaseGame from '../BaseGame';

export type Row = Command | Label | Jump;
export type Scenario = Row[];
export type ScenarioFactory<Game extends BaseGame> = (game: Game) => Scenario;

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
  private labelCursors: Map<string, number>;

  constructor(private scenario: Scenario) {
    this.labelCursors = scenario.reduce<Map<string, number>>(
      (prev, row, index) => {
        if (row instanceof Label) {
          return prev.set(row.label, index);
        }
        return prev;
      },
      new Map()
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
    if (!this.labelCursors.has(label)) {
      throw new Error(`label not found (label=${label})`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.cursor = this.labelCursors.get(label)!;
  }
}
