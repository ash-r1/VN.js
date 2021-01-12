import React from 'react';
import { Container as PixiContainer } from 'pixi.js';

import { PayloadAction } from '@reduxjs/toolkit';

export interface Context {
  container?: PixiContainer;
}

// TODO: how to remove any ?
export type Row = (ctx: Context) => PayloadAction<any> | undefined;
export type Scenario = Row[];
export type Scenarios = Record<string, () => Scenario>;

const ScenarioContext = React.createContext<Scenarios>({});
const ScenariosProvider = ScenarioContext.Provider;
const ScenariosConsumer = ScenarioContext.Consumer;

interface Props {
  scenarios: Scenarios;
}

const withScenarios = (BaseComponent: React.ComponentClass<Props>) => {
  const wrapper = React.forwardRef<React.Component<Props>>((props, ref) => (
    <ScenariosConsumer>
      {(scenarios) => (
        <BaseComponent {...props} ref={ref} scenarios={scenarios} />
      )}
    </ScenariosConsumer>
  ));
  wrapper.displayName = `withScenarios(${
    BaseComponent.displayName || BaseComponent.name
  })`;
  return wrapper;
};

export { withScenarios, ScenariosProvider, ScenariosConsumer, ScenarioContext };
