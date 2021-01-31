import { PayloadAction } from '@reduxjs/toolkit';

import BaseEngine from '../BaseEngine';

export interface Command {
  type?: undefined;
  // TODO: how to remove any ?
  action: PayloadAction<any>;
  // TODO: update for wait
  wait?: boolean;
}
export interface Jump {
  type: 'jump';
  scenario?: string;
  // label?: string;
}
export type Row = Command | Jump;
export type Scenario = Row[];
export type ScenarioFactory<Engine extends BaseEngine> = (
  engine: Engine
) => Scenario;

export type Scenarios<Engine extends BaseEngine> = Record<
  string,
  ScenarioFactory<Engine>
>;
