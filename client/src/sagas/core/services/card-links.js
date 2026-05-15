import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* createCardLink(cardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createCardLink({
      ...data,
      cardId,
      id: localId,
    }),
  );

  let cardLink;
  try {
    ({ item: cardLink } = yield call(request, api.createCardLink, cardId, data));
  } catch (error) {
    yield put(actions.createCardLink.failure(localId, error));
    return;
  }

  yield put(actions.createCardLink.success(localId, cardLink));
}

export function* handleCardLinkCreate(cardLink) {
  yield put(actions.handleCardLinkCreate(cardLink));
}

export function* deleteCardLink(id) {
  yield put(actions.deleteCardLink(id));

  let cardLink;
  try {
    ({ item: cardLink } = yield call(request, api.deleteCardLink, id));
  } catch (error) {
    yield put(actions.deleteCardLink.failure(id, error));
    return;
  }

  yield put(actions.deleteCardLink.success(cardLink));
}

export function* handleCardLinkDelete(cardLink) {
  yield put(actions.handleCardLinkDelete(cardLink));
}

export default {
  createCardLink,
  handleCardLinkCreate,
  deleteCardLink,
  handleCardLinkDelete,
};
