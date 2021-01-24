import { PayloadAction } from '@reduxjs/toolkit';

// TODO: how to remove any ?
export type Row = () => PayloadAction<any> | undefined;
export type Scenario = Row[];
export type Scenarios = Record<string, () => Scenario>;
