import { PayloadAction } from '@reduxjs/toolkit';

import BaseEngine from '../BaseEngine';

// TODO: how to remove any ?
export type Row = PayloadAction<any>;
export type Scenario = Row[];
export type ScenarioFactory<Engine extends BaseEngine> = (
  engine: Engine
) => Scenario;

export type Scenarios<Engine extends BaseEngine> = Record<
  string,
  ScenarioFactory<Engine>
>;
