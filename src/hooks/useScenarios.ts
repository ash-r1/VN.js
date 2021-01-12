import { useContext } from 'react';

import { ScenarioContext } from '../engine/scenario/provider';

export function useScenarios() {
  const scenarios = useContext(ScenarioContext);
  if (!scenarios) {
    throw new Error(
      'No Context found with `Scenarios`. Make sure to wrap component with `ScenariosProvider`'
    );
  }
  return scenarios;
}
