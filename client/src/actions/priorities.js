import ActionTypes from '../constants/ActionTypes';

const createPriority = (priority) => ({
  type: ActionTypes.PRIORITY_CREATE,
  payload: {
    priority,
  },
});

createPriority.success = (localId, priority) => ({
  type: ActionTypes.PRIORITY_CREATE__SUCCESS,
  payload: {
    localId,
    priority,
  },
});

createPriority.failure = (localId, error) => ({
  type: ActionTypes.PRIORITY_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handlePriorityCreate = (priority) => ({
  type: ActionTypes.PRIORITY_CREATE_HANDLE,
  payload: {
    priority,
  },
});

const updatePriority = (id, data) => ({
  type: ActionTypes.PRIORITY_UPDATE,
  payload: {
    id,
    data,
  },
});

updatePriority.success = (priority) => ({
  type: ActionTypes.PRIORITY_UPDATE__SUCCESS,
  payload: {
    priority,
  },
});

updatePriority.failure = (id, error, priority) => ({
  type: ActionTypes.PRIORITY_UPDATE__FAILURE,
  payload: {
    id,
    error,
    priority,
  },
});

const handlePriorityUpdate = (priority) => ({
  type: ActionTypes.PRIORITY_UPDATE_HANDLE,
  payload: {
    priority,
  },
});

const deletePriority = (id) => ({
  type: ActionTypes.PRIORITY_DELETE,
  payload: {
    id,
  },
});

deletePriority.success = (priority) => ({
  type: ActionTypes.PRIORITY_DELETE__SUCCESS,
  payload: {
    priority,
  },
});

deletePriority.failure = (id, error) => ({
  type: ActionTypes.PRIORITY_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handlePriorityDelete = (priority) => ({
  type: ActionTypes.PRIORITY_DELETE_HANDLE,
  payload: {
    priority,
  },
});

export default {
  createPriority,
  handlePriorityCreate,
  updatePriority,
  handlePriorityUpdate,
  deletePriority,
  handlePriorityDelete,
};
