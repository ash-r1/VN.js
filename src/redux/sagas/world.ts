import { all, put, takeEvery } from 'redux-saga/effects';

import { actions } from '../reducers/world';

function* handleA(action: ReturnType<typeof actions.addImageLayer>) {
  const payload = action.payload;
  console.log('internal', payload);
}

function* sampleSaga() {
  yield all([
    //
    takeEvery(actions.addImageLayer, handleA),
  ]);
}

export default sampleSaga;
