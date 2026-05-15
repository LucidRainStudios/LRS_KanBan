import EntryActionTypes from '../constants/EntryActionTypes';

const createCardLink = (cardId, data) => ({
  type: EntryActionTypes.CARD_LINK_CREATE,
  payload: {
    cardId,
    data,
  },
});

const handleCardLinkCreate = (cardLink) => ({
  type: EntryActionTypes.CARD_LINK_CREATE_HANDLE,
  payload: {
    cardLink,
  },
});

const deleteCardLink = (id) => ({
  type: EntryActionTypes.CARD_LINK_DELETE,
  payload: {
    id,
  },
});

const handleCardLinkDelete = (cardLink) => ({
  type: EntryActionTypes.CARD_LINK_DELETE_HANDLE,
  payload: {
    cardLink,
  },
});

export default {
  createCardLink,
  handleCardLinkCreate,
  deleteCardLink,
  handleCardLinkDelete,
};
