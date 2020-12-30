import { all } from 'redux-saga/effects';

import worldSagas from './world';

function* rootSaga() {
  yield all([
    //
    worldSagas(),
  ]);
}

export default rootSaga;
