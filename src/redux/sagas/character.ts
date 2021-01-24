import { Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';

import {
  all,
  call,
  getContext,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';

import Character from 'src/engine/components/Character';
import CharacterSprite from 'src/engine/display/ChracterSprite';

import { BaseState } from '../';
import BaseEngine from '../../engine/BaseEngine';
import { actions } from '../reducers/character';
import { actions as worldActions, LayerState } from '../reducers/world';

type CharacterProps = React.ComponentProps<typeof Character>;

function* show(action: ReturnType<typeof actions.show>) {
  yield put(worldActions.do());

  const on = 'fg';

  // FIXME: Fix with type-safe saga
  const existent: LayerState<CharacterProps> | undefined = yield select(
    (state: BaseState): LayerState<CharacterProps> | undefined => {
      return state.world.layers[on].find(
        (layers) => layers.name === action.payload.name
      );
    }
  );

  const defaultSize: string = existent?.props.size ?? 'lg'; // lg for safety
  const defaultAlpha: number = existent?.props.alpha ?? 1.0; // lg for safety
  const { name, size, pose, blink, alpha } = {
    size: defaultSize,
    alpha: defaultAlpha,
    ...action.payload,
  };
  const engine: BaseEngine = yield getContext('engine');
  const { worldContainer } = engine;

  const layer = worldContainer?.getChildByName(on) as PixiContainer | undefined;

  // QUESTION: How to get PIXI.js renderer/ref here?
  if (existent) {
    // CrossFade
    if (layer) {
      const sprite = layer.getChildByName(name) as CharacterSprite | undefined;
      if (sprite) {
        // FIXME: pass blink from outside
        const blink = true;
        yield call(sprite.crossfade.bind(sprite), pose, blink, 300);
      }
    }
  } else {
    // Add
    yield put(
      worldActions.addCharacterLayer({
        name,
        on,
        props: {
          name,
          size,
          pose,
          // TODO: CHANGEME: 0.0
          alpha: 0.0,
          // TODO: CHANGEME
          blink: true,
        },
      })
    );
    // (2) FadeIn
    if (layer) {
      const sprite = layer.getChildByName(name) as CharacterSprite | undefined;
      if (sprite) {
        yield call(sprite.fadeIn.bind(sprite), 300);
      }
    }
  }

  // Adjustments (by low-level PIXI.js API)
  if (worldContainer) {
    const layer = worldContainer.getChildByName(on) as PixiContainer;
    const sprite = layer.getChildByName(name) as CharacterSprite;
    // (2) FadeIn
    yield call(sprite.fadeIn.bind(sprite), 300);
  }

  yield put(
    worldActions.updateCharacterLayer({
      name,
      on: on,
      props: {
        name,
        size,
        pose,
        blink,
        alpha,
      },
    })
  );

  yield put(worldActions.done());
}

function* characterSaga() {
  yield all([
    //
    takeEvery(actions.show, show),
  ]);
}

export default characterSaga;
