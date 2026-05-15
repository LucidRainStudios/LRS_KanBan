import socket from './socket';

/* Actions */

const createCardLink = (cardId, data, headers) => socket.post(`/cards/${cardId}/links`, data, headers);

const deleteCardLink = (id, headers) => socket.delete(`/card-links/${id}`, undefined, headers);

export default {
  createCardLink,
  deleteCardLink,
};
