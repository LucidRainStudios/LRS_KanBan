import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Priority';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    color: attr(),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdPriorities',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedPriorities',
    }),
  };

  static reducer({ type, payload }, Priority) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
        if (payload.priorities) {
          payload.priorities.forEach((priority) => {
            Priority.upsert(priority);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Priority.all().delete();

        if (payload.priorities) {
          payload.priorities.forEach((priority) => {
            Priority.upsert(priority);
          });
        }

        break;
      case ActionTypes.PRIORITY_CREATE:
      case ActionTypes.PRIORITY_CREATE_HANDLE:
      case ActionTypes.PRIORITY_UPDATE__SUCCESS:
      case ActionTypes.PRIORITY_UPDATE_HANDLE:
      case ActionTypes.PRIORITY_UPDATE__FAILURE:
        Priority.upsert(payload.priority);

        break;
      case ActionTypes.PRIORITY_CREATE__SUCCESS:
        Priority.withId(payload.localId).delete();
        Priority.upsert(payload.priority);

        break;
      case ActionTypes.PRIORITY_CREATE__FAILURE:
        Priority.withId(payload.localId).delete();

        break;
      case ActionTypes.PRIORITY_UPDATE:
        Priority.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.PRIORITY_DELETE:
        Priority.withId(payload.id).delete();

        break;
      case ActionTypes.PRIORITY_DELETE__SUCCESS:
      case ActionTypes.PRIORITY_DELETE_HANDLE: {
        const priorityModel = Priority.withId(payload.priority.id);

        if (priorityModel) {
          priorityModel.delete();
        }

        break;
      }
      default:
    }
  }
}
