import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Scenarios } from 'src/engine/scenario/provider';

export interface LayerState<Props = any> {
  type: string;
  key: string;
  props: Props;
}

export interface Layers {
  acc: LayerState[];
  msg: LayerState[];
  fg: LayerState[];
  bg: LayerState[];
}
export type LayerName = keyof Layers;

export interface LayerPayload<Props = any> extends LayerState<Props> {
  on: LayerName;
}

export interface StateType {
  layers: Layers;
  stableCounter: number;
  scale: {
    x: number;
    y: number;
  };
  scenario: {
    path: string;
    label?: string;
    cursor: number;
  };
}

const initialState: StateType = {
  layers: {
    acc: [],
    msg: [],
    fg: [],
    bg: [],
  },
  stableCounter: 0,
  scale: {
    x: 1,
    y: 1,
  },
  scenario: {
    path: '',
    label: undefined,
    cursor: 0,
  },
};

const slice = createSlice({
  name: 'world',
  initialState,
  reducers: {
    run: (
      state,
      action: PayloadAction<{
        pixi: PIXI.Application;
        scenarios: Scenarios;
        path: string;
        label?: string;
        cursor?: number;
      }>
    ) => {
      const { path, label, cursor } = action.payload;
      return {
        ...state,
        scenario: { path, label, cursor: cursor ?? 0 },
      };
    },
    next: (
      state,
      action: PayloadAction<{ pixi: PIXI.Application; scenarios: Scenarios }>
    ) => {
      return {
        ...state,
        stableCounter: state.stableCounter + 1,
      };
    },
    done: (
      state,
      action: PayloadAction<{
        path: string;
        label?: string;
        cursor?: number;
      }>
    ) => {
      const { path, label, cursor } = action.payload;
      return {
        ...state,
        scenario: { path, label, cursor: cursor ?? 0 },
        stableCounter: state.stableCounter - 1,
      };
    },
    addLayer: (state, action: PayloadAction<LayerPayload>): StateType => {
      const { type, key, props, on } = action.payload;
      return {
        ...state,
        layers: {
          ...state.layers,
          [on]: [...state.layers[on], { type, key, props }],
        },
      };
    },
    removeLayer: (
      state,
      action: PayloadAction<{ key: string; on: LayerName }>
    ): StateType => {
      const { key, on } = action.payload;
      const layers = state.layers[on];
      const newLayers: LayerState[] = [];
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (layer.key !== key) {
          newLayers.push(layer);
        }
      }
      return {
        ...state,
        layers: {
          ...state.layers,
          [on]: newLayers,
        },
      };
    },
  },
});

export const actions = slice.actions;
export default slice.reducer;
