import { createAction } from '@reduxjs/toolkit';

// Saga-only actions, reducer doesn't react them

const show = createAction<{
  message: string;
  image: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  paddingLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
}>('message/show');

// const hide = createAction<{
//   name: string;
// }>('message/hide');

export const actions = {
  show,
};
