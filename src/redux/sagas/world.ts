import { all, call, put, select, takeEvery } from 'redux-saga/effects';

import { BaseState } from '../';
import { actions } from '../reducers/world';

function* handleA(action: ReturnType<typeof actions.addImageLayer>) {
  const payload = action.payload;
  console.log('internal', payload);
}

const loadResource = async (loader: PIXI.Loader, path: string) => {
  if (!loader.resources[path]) {
    loader.add(path);
    await new Promise((resolve) => {
      loader.load(resolve);
    });
  }
  return loader.resources[path];
};

function* run(action: ReturnType<typeof actions.run>) {
  const { pixi, scenarios } = action.payload;
  yield put(actions.next({ pixi, scenarios }));
}

function* next(action: ReturnType<typeof actions.next>) {
  const state: BaseState['world']['scenario'] = yield select<
    (s: BaseState) => BaseState['world']['scenario']
  >((s) => s.world.scenario);

  const cursor = state.cursor ?? 0;

  const { scenarios } = action.payload;
  // TODO: memoize scenario
  const scenario = scenarios[state.path]();
  const cmd = scenario[cursor];
  const nextAction = cmd();

  if (nextAction) {
    yield put(nextAction);
  }

  yield put(actions.done({ ...state, cursor: cursor + 1 }));
}

function* sampleSaga() {
  yield all([
    //
    takeEvery(actions.run, run),
    takeEvery(actions.next, next),
    takeEvery(actions.addImageLayer, handleA),
  ]);
}

export default sampleSaga;
