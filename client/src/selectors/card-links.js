import { createSelector } from 'redux-orm';

import orm from '../orm';

// Outgoing: links the user added on this card. Each row: { id, type, cardId, linkedCardId, ... }
export const makeSelectOutgoingLinksByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return [];
      }
      return cardModel.outgoingLinks
        .toModelArray()
        .filter((link) => !!link.linkedCard)
        .map((link) => ({
          id: link.id,
          type: link.type,
          linkedCardId: link.linkedCardId,
          linkedCardName: link.linkedCard.name,
        }));
    },
  );

export const selectOutgoingLinksByCardId = makeSelectOutgoingLinksByCardId();

// Incoming: links other cards added that point at this card (rendered as the inverse phrasing).
export const makeSelectIncomingLinksByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return [];
      }
      return cardModel.incomingLinks
        .toModelArray()
        .filter((link) => !!link.card)
        .map((link) => ({
          id: link.id,
          type: link.type,
          cardId: link.cardId,
          cardName: link.card.name,
        }));
    },
  );

export const selectIncomingLinksByCardId = makeSelectIncomingLinksByCardId();

export default {
  makeSelectOutgoingLinksByCardId,
  selectOutgoingLinksByCardId,
  makeSelectIncomingLinksByCardId,
  selectIncomingLinksByCardId,
};
