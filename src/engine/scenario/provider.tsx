import React from 'react';

import { PayloadAction } from '@reduxjs/toolkit';

// TODO: how to remove any ?
export type Row = () => PayloadAction<any> | undefined;
export type Scenario = Row[];
export type Scenarios = Record<string, () => Scenario>;

const Context = React.createContext<Scenarios>({});

const ScenariosProvider = Context.Provider;
const ScenariosConsumer = Context.Consumer;

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

export { withScenarios, ScenariosProvider, ScenariosConsumer, Context };
