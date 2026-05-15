import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* cardLinksWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARD_LINK_CREATE, ({ payload: { cardId, data } }) => services.createCardLink(cardId, data)),
    takeEvery(EntryActionTypes.CARD_LINK_CREATE_HANDLE, ({ payload: { cardLink } }) => services.handleCardLinkCreate(cardLink)),
    takeEvery(EntryActionTypes.CARD_LINK_DELETE, ({ payload: { id } }) => services.deleteCardLink(id)),
    takeEvery(EntryActionTypes.CARD_LINK_DELETE_HANDLE, ({ payload: { cardLink } }) => services.handleCardLinkDelete(cardLink)),
  ]);
}
