import React from 'react';

import Context from 'src/engine/context';

const VNContextContext = React.createContext<Context>({});
const VNContextProvider = VNContextContext.Provider;
const VNContextConsumer = VNContextContext.Consumer;

interface Props {
  context: Context;
}
export { VNContextProvider, VNContextConsumer, VNContextContext };
