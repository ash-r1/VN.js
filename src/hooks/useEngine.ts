import { useContext } from 'react';

import { EngineContext } from '../engine/provider';

export function useEngine() {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error(
      'No Context found with `engine`. Make sure to wrap component with `EngineProvider`'
    );
  }
  return engine;
}
