import { all, getContext, put, select, takeEvery } from 'redux-saga/effects';

import { BaseState } from '../';
import BaseEngine from '../../engine/BaseEngine';
import { actions } from '../reducers/world';

function* run() {
  yield put(actions.next());
}

function* next(action: ReturnType<typeof actions.next>) {
  const state: BaseState['world']['scenario'] = yield select<
    (s: BaseState) => BaseState['world']['scenario']
  >((s) => s.world.scenario);

  const cursor = state.cursor ?? 0;

  const engine: BaseEngine = yield getContext('engine');
  const { scenarios } = engine;

  // TODO: memoize scenario based on the "container"
  const scenario = scenarios[state.path];
  const row = scenario(engine)[cursor];

  if (!row) {
    throw 'scenario ended error';
  }

  // TODO: How to control wait for click (or not)?
  //       use row.wait for this feature

  yield put(row.action);

  yield put(actions.nextDone({ ...state, cursor: cursor + 1 }));
}

function* sampleSaga() {
  yield all([
    //
    takeEvery(actions.run, run),
    takeEvery(actions.next, next),
  ]);
}

export default sampleSaga;
