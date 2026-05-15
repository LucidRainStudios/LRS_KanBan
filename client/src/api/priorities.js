import socket from './socket';

/* Actions */

const getPriorities = (headers) => socket.get('/priorities', undefined, headers);

const createPriority = (data, headers) => socket.post('/priorities', data, headers);

const updatePriority = (id, data, headers) => socket.patch(`/priorities/${id}`, data, headers);

const deletePriority = (id, headers) => socket.delete(`/priorities/${id}`, undefined, headers);

export default {
  getPriorities,
  createPriority,
  updatePriority,
  deletePriority,
};
