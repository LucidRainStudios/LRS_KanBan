import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'CardLink';

  static fields = {
    id: attr(),
    type: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'outgoingLinks',
    }),
    linkedCardId: fk({
      to: 'Card',
      as: 'linkedCard',
      relatedName: 'incomingLinks',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdCardLinks',
    }),
  };

  static reducer({ type, payload }, CardLink) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.cardLinks) {
          payload.cardLinks.forEach((link) => {
            CardLink.upsert(link);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        CardLink.all().delete();

        if (payload.cardLinks) {
          payload.cardLinks.forEach((link) => {
            CardLink.upsert(link);
          });
        }

        break;
      case ActionTypes.CARD_LINK_CREATE:
      case ActionTypes.CARD_LINK_CREATE_HANDLE:
        CardLink.upsert(payload.cardLink);

        break;
      case ActionTypes.CARD_LINK_CREATE__SUCCESS:
        CardLink.withId(payload.localId).delete();
        CardLink.upsert(payload.cardLink);

        break;
      case ActionTypes.CARD_LINK_CREATE__FAILURE:
        CardLink.withId(payload.localId).delete();

        break;
      case ActionTypes.CARD_LINK_DELETE:
        CardLink.withId(payload.id).delete();

        break;
      case ActionTypes.CARD_LINK_DELETE__SUCCESS:
      case ActionTypes.CARD_LINK_DELETE_HANDLE: {
        const linkModel = CardLink.withId(payload.cardLink.id);

        if (linkModel) {
          linkModel.delete();
        }

        break;
      }
      default:
    }
  }
}
