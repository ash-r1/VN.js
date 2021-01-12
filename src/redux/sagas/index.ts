import { all } from 'redux-saga/effects';

import characterSagas from './character';
import worldSagas from './world';

function* rootSaga() {
  yield all([
    //
    characterSagas(),
    worldSagas(),
  ]);
}

export default rootSaga;
