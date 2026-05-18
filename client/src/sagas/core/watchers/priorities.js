import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* prioritiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PRIORITY_CREATE, ({ payload: { data } }) => services.createPriority(data)),
    takeEvery(EntryActionTypes.PRIORITY_CREATE_HANDLE, ({ payload: { priority } }) => services.handlePriorityCreate(priority)),
    takeEvery(EntryActionTypes.PRIORITY_UPDATE, ({ payload: { id, data } }) => services.updatePriority(id, data)),
    takeEvery(EntryActionTypes.PRIORITY_UPDATE_HANDLE, ({ payload: { priority } }) => services.handlePriorityUpdate(priority)),
    takeEvery(EntryActionTypes.PRIORITY_DELETE, ({ payload: { id } }) => services.deletePriority(id)),
    takeEvery(EntryActionTypes.PRIORITY_DELETE_HANDLE, ({ payload: { priority } }) => services.handlePriorityDelete(priority)),
    takeEvery(EntryActionTypes.PRIORITY_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) => services.addPriorityToFilterInCurrentBoard(id)),
    takeEvery(EntryActionTypes.PRIORITY_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) => services.removePriorityFromFilterInCurrentBoard(id)),
  ]);
}
