import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectPriorityById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Priority }, id) => {
      const priorityModel = Priority.withId(id);

      if (!priorityModel) {
        return priorityModel;
      }

      return {
        ...priorityModel.ref,
        isPersisted: !isLocalId(id),
      };
    },
  );

export const selectPriorityById = makeSelectPriorityById();

export const selectAllPriorities = createSelector(orm, ({ Priority }) =>
  Priority.all()
    .toRefArray()
    .sort((a, b) => a.position - b.position),
);

export default {
  makeSelectPriorityById,
  selectPriorityById,
  selectAllPriorities,
};
