import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* createPriority(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createPriority({
      ...data,
      id: localId,
    }),
  );

  let priority;
  try {
    ({ item: priority } = yield call(request, api.createPriority, data));
  } catch (error) {
    yield put(actions.createPriority.failure(localId, error));
    return;
  }

  yield put(actions.createPriority.success(localId, priority));
}

export function* handlePriorityCreate(priority) {
  yield put(actions.handlePriorityCreate(priority));
}

export function* updatePriority(id, data) {
  const oldPriority = yield select(selectors.selectPriorityById, id);
  yield put(actions.updatePriority(id, data));

  let priority;
  try {
    ({ item: priority } = yield call(request, api.updatePriority, id, data));
  } catch (error) {
    yield put(actions.updatePriority.failure(id, error, oldPriority));
    return;
  }

  yield put(actions.updatePriority.success(priority));
}

export function* handlePriorityUpdate(priority) {
  yield put(actions.handlePriorityUpdate(priority));
}

export function* deletePriority(id) {
  yield put(actions.deletePriority(id));

  let priority;
  try {
    ({ item: priority } = yield call(request, api.deletePriority, id));
  } catch (error) {
    yield put(actions.deletePriority.failure(id, error));
    return;
  }

  yield put(actions.deletePriority.success(priority));
}

export function* handlePriorityDelete(priority) {
  yield put(actions.handlePriorityDelete(priority));
}

export function* addPriorityToBoardFilter(id, boardId) {
  yield put(actions.addPriorityToBoardFilter(id, boardId));
}

export function* addPriorityToFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(addPriorityToBoardFilter, id, boardId);
}

export function* removePriorityFromBoardFilter(id, boardId) {
  yield put(actions.removePriorityFromBoardFilter(id, boardId));
}

export function* removePriorityFromFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(removePriorityFromBoardFilter, id, boardId);
}

export default {
  createPriority,
  handlePriorityCreate,
  updatePriority,
  handlePriorityUpdate,
  deletePriority,
  handlePriorityDelete,
  addPriorityToBoardFilter,
  addPriorityToFilterInCurrentBoard,
  removePriorityFromBoardFilter,
  removePriorityFromFilterInCurrentBoard,
};
