import {
  all,
  call,
  getContext,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';

import { BaseState } from '../';
import BaseEngine from '../../engine/BaseEngine';
import { actions } from '../reducers/world';

function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function* run() {
  yield put(actions.next());
}

function* next(action: ReturnType<typeof actions.next>) {
  const unstableCounter: number = yield select<(s: BaseState) => number>(
    (s) => s.world.unstableCounter
  );

  if (unstableCounter !== 0) {
    console.debug('skip unstable next');
    return;
  }

  yield put(actions.nextDo());

  const state: BaseState['world']['scenario'] = yield select<
    (s: BaseState) => BaseState['world']['scenario']
  >((s) => s.world.scenario);

  const cursor = state.cursor ?? 0;

  const engine: BaseEngine = yield getContext('engine');
  const { scenarios } = engine;

  // TODO: memoize scenario based on the "container"
  const scenario = scenarios[state.path];
  const nextRow = scenario(engine)[cursor];
  if (!nextRow) {
    throw 'scenario ended error';
  }

  if (nextRow.type === 'jump') {
    // TODO: jump label
    yield put(
      actions.nextDone({
        ...state,
        path: nextRow.scenario || state.path,
        cursor: 0,
      })
    );
  } else {
    yield put(nextRow.action);
    yield put(
      actions.nextDone({
        cursor: cursor + 1,
        wait: nextRow.wait,
      })
    );
  }
}

function* doNext() {
  const wait: boolean = yield select<(s: BaseState) => boolean>(
    (s) => s.world.scenario.wait
  );
  const unstableCounter: number = yield select<(s: BaseState) => number>(
    (s) => s.world.unstableCounter
  );

  // wait for the next rendering
  yield call(timeout, 0);

  if (unstableCounter == 0 && !wait) {
    yield put(actions.next());
  }
}

function* done() {
  yield doNext();
}

function* nextDone() {
  yield doNext();
}

function* allSagas() {
  yield all([
    //
    takeEvery(actions.run, run),
    takeEvery(actions.next, next),
    takeEvery(actions.done, done),
    takeEvery(actions.nextDone, nextDone),
  ]);
}

export default allSagas;
