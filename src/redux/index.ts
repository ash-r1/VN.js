import { EnhancedStore } from '@reduxjs/toolkit';
import { createSelectorHook, useDispatch, useStore } from 'react-redux';
import { CombinedState, StateFromReducersMapObject } from 'redux';

import reducers from './reducers';

export type BaseState = StateFromReducersMapObject<typeof reducers>;
// const reducer: Reducer<BaseState> = combineReducers(reducers);

export type BaseStore = EnhancedStore<CombinedState<BaseState>>;
// const store: BaseStore = configureStore({ reducer });

export type BaseDispatch = BaseStore['dispatch'];

export const useBaseDispatch = () => useDispatch<BaseDispatch>();
export const useBaseSelector = createSelectorHook<BaseState>();
export const useBaseStore = () => useStore<BaseState>();

export { reducers };
