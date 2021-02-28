import { all } from 'redux-saga/effects';

import characterSagas from './character';
import messageSagas from './message';
import worldSagas from './world';

function* rootSaga() {
  yield all([
    //
    characterSagas(),
    messageSagas(),
    worldSagas(),
  ]);
}

export default rootSaga;
