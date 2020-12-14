import React from 'react';

import {
  CombinedState,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import {
  createSelectorHook,
  createStoreHook,
  ReactReduxContextValue,
  useDispatch,
  useStore,
} from 'react-redux';

import reducers from './reducers';

const reducer = combineReducers(reducers);
const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = createSelectorHook<RootState>();
export const useAppStore = () => useStore<RootState>();

export default store;
