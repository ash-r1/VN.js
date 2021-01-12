import { createAction } from '@reduxjs/toolkit';

import { Context } from '../../engine/scenario/provider';

// Saga-only actions, reducer doesn't react them

const show = createAction<{
  ctx: Context;
  name: string;
  size?: string;
  pose: string;
}>('character/show');

const hide = createAction<{
  ctx: Context;
  name: string;
}>('character/hide');

export const actions = {
  show,
  hide,
};
