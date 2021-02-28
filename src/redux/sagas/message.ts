import { Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';

import { all, put, takeEvery } from 'redux-saga/effects';

import { actions } from '../reducers/message';
import { actions as worldActions } from '../reducers/world';

function* show({ payload }: ReturnType<typeof actions.show>) {
  yield put(worldActions.do());

  const {
    message,
    image,
    width,
    height,
    x,
    y,
    paddingLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
  } = payload;

  // TODO: Control Fade-In

  console.log(`show message: ${message}`);

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
        padding: {
          left: paddingLeft,
          top: paddingTop,
          right: paddingRight,
          bottom: paddingBottom,
        },
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
