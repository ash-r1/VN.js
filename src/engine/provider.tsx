import React from 'react';

import { BaseEngine } from '..';

const EngineContext = React.createContext<BaseEngine | null>(null);
const EngineProvider = EngineContext.Provider;
const EngineConsumer = EngineContext.Consumer;

export { EngineContext, EngineProvider, EngineConsumer };
