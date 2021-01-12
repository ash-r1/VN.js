import { Container as PixiContainer } from 'pixi.js';

import { all, call, put, select, takeEvery } from 'redux-saga/effects';

import CharacterSprite from 'src/engine/display/ChracterSprite';

import { actions } from '../reducers/character';
import { actions as worldActions } from '../reducers/world';

function* show(action: ReturnType<typeof actions.show>) {
  console.log('SHOW:', action.payload);

  // unstable/stable control ?
  // yield put(worldActions.doing());

  // TOOD: Consider if the character already exists.
  const { name, size, pose, ctx } = { size: 'lg', ...action.payload };
  const { container } = ctx;

  const on = 'fg';
  // QUESTION: How to get PIXI.js renderer/ref here?

  // (1) Add a character with alpha=0.0
  yield put(
    worldActions.addCharacterLayer({
      name,
      on,
      props: {
        name,
        size,
        pose,
        // TODO: CHANGEME
        blink: true,
      },
    })
  );

  // (2) Crossfade (by low-level PIXI.js API)
  if (container) {
    const layer = container.getChildByName(on) as PixiContainer;
    const sprite = layer.getChildByName(name) as CharacterSprite;
  }

  // (3) Set alpha to 1.0
}

function* characterSaga() {
  yield all([
    //
    takeEvery(actions.show, show),
  ]);
}

export default characterSaga;
