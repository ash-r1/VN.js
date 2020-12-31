import { ComponentProps } from 'react';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Scenarios } from 'src/engine/scenario/provider';

import Image from '../../engine/components/Image';

type ImageProps = ComponentProps<typeof Image>;
type ImageState = {
  type: 'Image';
  key: string;
  props: ImageProps;
};
type ImagePayload = Omit<ImageState, 'type'>;

type LayerState = ImageState;

export interface StateType {
  layers: LayerState[];
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
  layers: [],
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
    debug: (state, action: PayloadAction) => {
      const scale = state.scale;
      return {
        ...state,
        scale: {
          x: scale.x + 0.1,
          y: scale.y + 0.1,
        },
      };
    },
    addImageLayer: (state, action: PayloadAction<ImagePayload>) => {
      return {
        ...state,
        layers: [
          ...state.layers,
          {
            type: 'Image',
            ...action.payload,
          },
        ],
      };
    },
    removeImageLayer: (state, action: PayloadAction<{ key: string }>) => {
      const { layers } = state;
      const newLayers: LayerState[] = [];
      const { key } = action.payload;
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (layer.key !== key) {
          newLayers.push(layer);
        }
      }

      return {
        ...state,
        layers: newLayers,
      };
    },
  },
});

export const actions = slice.actions;
export default slice.reducer;
