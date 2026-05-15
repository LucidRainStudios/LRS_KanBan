import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';
import { getPrimaryUserId } from '../utils/swimlane-helpers';

export const makeSelectListById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return {
        ...listModel.ref,
        ...getMeta(listModel),
        isPersisted: !isLocalId(id),
      };
    },
  );

export const selectListById = makeSelectListById();

export const makeSelectCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getOrderedCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const selectCardIdsByListId = makeSelectCardIdsByListId();

export const makeSelectIsFilteredByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getIsFiltered();
    },
  );

export const selectIsFilteredByListId = makeSelectIsFilteredByListId();

export const makeSelectFilteredCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getFilteredOrderedCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const selectFilteredCardIdsByListId = makeSelectFilteredCardIdsByListId();

// Swimlane cell: filtered, ordered card ids for a given list AND lane (primary assignee, or 'unassigned').
export const makeSelectFilteredCardIdsByListIdAndLane = () =>
  createSelector(
    orm,
    (_, listId) => listId,
    (_, __, laneId) => laneId,
    ({ List }, listId, laneId) => {
      const listModel = List.withId(listId);

      if (!listModel) {
        return listModel;
      }

      return listModel
        .getFilteredOrderedCardsModelArray()
        .filter((cardModel) => getPrimaryUserId(cardModel) === laneId)
        .map((cardModel) => cardModel.id);
    },
  );

export const selectFilteredCardIdsByListIdAndLane = makeSelectFilteredCardIdsByListIdAndLane();

export default {
  makeSelectListById,
  selectListById,
  makeSelectCardIdsByListId,
  selectCardIdsByListId,
  makeSelectIsFilteredByListId,
  selectIsFilteredByListId,
  makeSelectFilteredCardIdsByListId,
  selectFilteredCardIdsByListId,
  makeSelectFilteredCardIdsByListIdAndLane,
  selectFilteredCardIdsByListIdAndLane,
};
