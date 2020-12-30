import { ComponentProps } from 'react';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import Image from '../../../engine/components/Image';

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
  scale: {
    x: number;
    y: number;
  };
}

const initialState: StateType = {
  layers: [],
  scale: {
    x: 1,
    y: 1,
  },
};

const slice = createSlice({
  name: 'world',
  initialState,
  reducers: {
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
  },
});

export const actions = slice.actions;
export default slice.reducer;
