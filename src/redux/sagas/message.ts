import { Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';

import { all, put, takeEvery } from 'redux-saga/effects';

import { actions } from '../reducers/message';
import { actions as worldActions } from '../reducers/world';

function* show({ payload }: ReturnType<typeof actions.show>) {
  yield put(worldActions.do());

  const { message, image, layout, style } = payload;

  // TODO: Control Fade-In

  console.log(`show message: ${message}`);

  const { width, height, x, y, padding } = layout;

  // show message
  yield put(
    worldActions.putMessageLayer({
      name: 'message',
      on: 'msg',
      props: {
        message,
        image,
        width: width,
        height: height,
        x,
        y,
        padding,
        style,
      },
    })
  );

  yield put(worldActions.done());
}

function* messageSaga() {
  yield all([
    //
    takeEvery(actions.show, show),
  ]);
}

export default messageSaga;
