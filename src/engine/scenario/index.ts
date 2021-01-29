import { PayloadAction } from '@reduxjs/toolkit';

import BaseEngine from '../BaseEngine';

export interface Row {
  // TODO: how to remove any ?
  action: PayloadAction<any>;
  // TODO: update for wait
  wait?: boolean;
}
export type Scenario = Row[];
export type ScenarioFactory<Engine extends BaseEngine> = (
  engine: Engine
) => Scenario;

export type Scenarios<Engine extends BaseEngine> = Record<
  string,
  ScenarioFactory<Engine>
>;
