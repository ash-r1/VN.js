import { createAction } from '@reduxjs/toolkit';

// Saga-only actions, reducer doesn't react them

const show = createAction<{
  name: string;
  size?: string;
  pose: string;
  blink: boolean;
  alpha?: number;
}>('character/show');

const hide = createAction<{
  name: string;
}>('character/hide');

export const actions = {
  show,
  hide,
};
