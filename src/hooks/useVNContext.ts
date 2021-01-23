import { useContext } from 'react';

import { VNContextContext } from '../engine/context/provider';

export function useVNContext() {
  const vnContext = useContext(VNContextContext);
  if (!vnContext) {
    throw new Error(
      'No Context found with `vnContext`. Make sure to wrap component with `VNContextProvider`'
    );
  }
  return vnContext;
}
