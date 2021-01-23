import { all, put, select, takeEvery } from 'redux-saga/effects';

import { BaseState } from '../';
import { actions } from '../reducers/world';

function* run(action: ReturnType<typeof actions.run>) {
  const { scenarios } = action.payload;
  yield put(actions.next({ scenarios }));
}

function* next(action: ReturnType<typeof actions.next>) {
  const state: BaseState['world']['scenario'] = yield select<
    (s: BaseState) => BaseState['world']['scenario']
  >((s) => s.world.scenario);

  const cursor = state.cursor ?? 0;

  const { scenarios } = action.payload;

  // TODO: memoize scenario based on the "container"
  const scenario = scenarios[state.path]();
  const cmd = scenario[cursor];
  const nextAction = cmd();

  if (nextAction) {
    yield put(nextAction);
  }

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
