import ActionTypes from '../constants/ActionTypes';

const createCardLink = (cardLink) => ({
  type: ActionTypes.CARD_LINK_CREATE,
  payload: {
    cardLink,
  },
});

createCardLink.success = (localId, cardLink) => ({
  type: ActionTypes.CARD_LINK_CREATE__SUCCESS,
  payload: {
    localId,
    cardLink,
  },
});

createCardLink.failure = (localId, error) => ({
  type: ActionTypes.CARD_LINK_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleCardLinkCreate = (cardLink) => ({
  type: ActionTypes.CARD_LINK_CREATE_HANDLE,
  payload: {
    cardLink,
  },
});

const deleteCardLink = (id) => ({
  type: ActionTypes.CARD_LINK_DELETE,
  payload: {
    id,
  },
});

deleteCardLink.success = (cardLink) => ({
  type: ActionTypes.CARD_LINK_DELETE__SUCCESS,
  payload: {
    cardLink,
  },
});

deleteCardLink.failure = (id, error) => ({
  type: ActionTypes.CARD_LINK_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleCardLinkDelete = (cardLink) => ({
  type: ActionTypes.CARD_LINK_DELETE_HANDLE,
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
