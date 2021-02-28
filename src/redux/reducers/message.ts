import { createAction } from '@reduxjs/toolkit';

import Padding from 'src/engine/interfaces/Padding';
import { TextStyle } from 'src/engine/interfaces/TextStyle';

// Saga-only actions, reducer doesn't react them

export interface LayoutOptions {
  width: number;
  height: number;
  x?: number;
  y?: number;
  padding?: Partial<Padding>;
}

const show = createAction<{
  message: string;
  image: string;
  layout: LayoutOptions;
  style: TextStyle;
}>('message/show');

// const hide = createAction<{
//   name: string;
// }>('message/hide');

export const actions = {
  show,
};
