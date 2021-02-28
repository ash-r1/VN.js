import * as PIXI from 'pixi.js';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import produce from 'immer';

import Character from '../../engine/components/Character';
import Image from '../../engine/components/Image';
import Message from '../../engine/components/Message';

export interface LayerState<Props = any> {
  type: string;
  name: string;
  props: Props;
}

export interface Layers {
  acc: LayerState[];
  msg: LayerState[];
  fg: LayerState[];
  bg: LayerState[];
  // TODO: Configure keys from outside of VN.js? or, optional layer function?
}

export type LayerName = keyof Layers;

export interface LayerPayload<Props = any> extends LayerState<Props> {
  on: LayerName;
  // TODO: Add above, under options to control where to insert
}

export type SpecificLayerPayload<C extends React.ComponentType<any>> = Omit<
  LayerPayload<React.ComponentProps<C>>,
  'type'
>;

export type ImageLayerPayload = SpecificLayerPayload<typeof Image>;
export type CharacterLayerPayload = SpecificLayerPayload<typeof Character>;
export type MessageLayerPayload = SpecificLayerPayload<typeof Message>;

export interface StateType {
  layers: Layers;
  unstableCounter: number;
  scale: {
    x: number;
    y: number;
  };
  running: boolean;
  scenario: {
    path: string;
    label: string;
    cursor: number;
    wait: boolean;
  };
}

const initialState: StateType = {
  layers: {
    acc: [],
    msg: [],
    fg: [],
    bg: [],
  },
  unstableCounter: 0,
  scale: {
    x: 1,
    y: 1,
  },
  running: false,
  scenario: {
    path: '',
    label: '',
    cursor: 0,
    wait: false,
  },
};

const mergeLayers = (
  layers: Layers,
  on: LayerName,
  { type, name, props }: { type: string; name: string; props: any }
): Layers => {
  const index = layers[on].findIndex((v) => v.name === name);
  if (index >= 0) {
    const newLayers = {
      ...layers,
      [on]: [...layers[on]],
    };
    newLayers[on][index] = { type, name, props };
    return newLayers;
  }
  return {
    ...layers,
    [on]: [...layers[on], { type, name, props }],
  };
};

const slice = createSlice({
  name: 'world',
  initialState,
  reducers: {
    run: (
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
        running: true,
        scenario: { path, label: label ?? '', cursor: cursor ?? 0, wait: true },
      };
    },
    next: (state) => state,
    nextDo: (state) => {
      return {
        ...state,
        unstableCounter: state.unstableCounter + 1,
      };
    },
    nextDone: (
      state,
      action: PayloadAction<{
        path?: string;
        label?: string;
        cursor?: number;
        wait?: boolean;
      }>
    ) => {
      const { path, label, cursor, wait } = action.payload;
      return {
        ...state,
        scenario: {
          path: path ? path : state.scenario.path,
          label: label ? label : state.scenario.label,
          cursor: cursor ?? 0,
          wait: wait ?? false,
        },
        unstableCounter: state.unstableCounter - 1,
      };
    },
    do: (state) => {
      return {
        ...state,
        unstableCounter: state.unstableCounter + 1,
      };
    },
    done: (state) => {
      return {
        ...state,
        unstableCounter: state.unstableCounter - 1,
      };
    },
    putLayer: (state, action: PayloadAction<LayerPayload>): StateType => {
      const { type, name, props, on } = action.payload;

      return {
        ...state,
        layers: mergeLayers(state.layers, on, { type, name, props }),
      };
    },
    putMessageLayer: (
      state,
      action: PayloadAction<MessageLayerPayload>
    ): StateType => {
      const { name, props, on } = action.payload;
      return {
        ...state,
        layers: mergeLayers(state.layers, on, { type: 'Message', name, props }),
      };
    },
    putImageLayer: (
      state,
      action: PayloadAction<ImageLayerPayload>
    ): StateType => {
      const { name, props, on } = action.payload;
      return {
        ...state,
        layers: mergeLayers(state.layers, on, { type: 'Image', name, props }),
      };
    },
    putCharacterLayer: (
      state,
      action: PayloadAction<CharacterLayerPayload>
    ): StateType => {
      const { name, props, on } = action.payload;
      return {
        ...state,
        layers: mergeLayers(state.layers, on, {
          type: 'Character',
          name,
          props,
        }),
      };
    },
    updateCharacterLayer: (
      state,
      action: PayloadAction<CharacterLayerPayload>
    ): StateType => {
      const { name, props, on } = action.payload;
      const { [on]: targetLayer, ...otherLayers } = state.layers;
      const newTargetLayer = produce(targetLayer, (draft) => {
        draft.forEach((layer, index) => {
          //
          if (layer.name === name) {
            draft[index].props = props;
          }
        });
      });
      return {
        ...state,
        layers: {
          ...otherLayers,
          [on]: newTargetLayer,
        } as typeof state.layers,
      };
    },
    removeLayer: (
      state,
      action: PayloadAction<{ name: string; on: LayerName }>
    ): StateType => {
      const { name, on } = action.payload;
      const layers = state.layers[on];
      const newLayers: LayerState[] = [];
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (layer.name !== name) {
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
