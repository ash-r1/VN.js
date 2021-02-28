import BaseEngine from '../BaseEngine';
import { Scenario, Scenarios } from './';
export default class ScenarioController {
  private path: string;
  private scenario: Scenario;
  private label: string;
  private indexesForLabel: Map<string, number>;

  constructor(private scenarios: Scenarios<BaseEngine>) {
    this.path = '';
    this.label = '';
    this.scenario = [];
    this.indexesForLabel = new Map();
  }

  // TODO: Remove BaseEngine?
  jumpToScenario(path: string, engine: BaseEngine) {
    if (this.path === path) {
      return;
    }
    const scenario = this.scenarios[path];
    if (scenario === undefined) {
      throw `Scenario Not Found: ${path}`;
    }
    this.scenario = scenario(engine);
    this.path = path;
    this.indexesForLabel = new Map();
  }

  jumpToLabel(label: string) {
    if (this.label === label) {
      return;
    }
  }

  getRow(cursor: number) {
    const labelIndex = this.indexForLabel(this.label);
    console.debug(
      `get a row for label="${this.label}"(index=${labelIndex}), cursor=${cursor}`
    );
    return this.scenario[labelIndex + cursor];
  }

  indexForLabel(name: string): number {
    if (name === '') {
      return 0;
    }

    const cache = this.indexesForLabel.get(name);
    if (cache !== undefined) {
      return cache;
    }

    for (let i = 0; i++; i < this.scenario.length) {
      const row = this.scenario[i];
      if (row.type === 'label' && row.name === name) {
        this.indexesForLabel.set(name, i);
        return i;
      }
    }

    throw `Label Not Found: ${name} for the scenario: ${this.path}`;
  }
}
