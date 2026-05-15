import EntryActionTypes from '../constants/EntryActionTypes';

const createPriority = (data) => ({
  type: EntryActionTypes.PRIORITY_CREATE,
  payload: {
    data,
  },
});

const handlePriorityCreate = (priority) => ({
  type: EntryActionTypes.PRIORITY_CREATE_HANDLE,
  payload: {
    priority,
  },
});

const updatePriority = (id, data) => ({
  type: EntryActionTypes.PRIORITY_UPDATE,
  payload: {
    id,
    data,
  },
});

const handlePriorityUpdate = (priority) => ({
  type: EntryActionTypes.PRIORITY_UPDATE_HANDLE,
  payload: {
    priority,
  },
});

const deletePriority = (id) => ({
  type: EntryActionTypes.PRIORITY_DELETE,
  payload: {
    id,
  },
});

const handlePriorityDelete = (priority) => ({
  type: EntryActionTypes.PRIORITY_DELETE_HANDLE,
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
