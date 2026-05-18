import { createSelector } from 'redux-orm';

import orm from '../orm';

// Pull the linked card's name + board context for a link. For same-board links the
// linked Card is in redux-orm and we read from there. For cross-board links the linked
// Card is NOT in the local store, so we fall back to denormalized fields the server
// added to the CardLink payload (`linkedCardName`, `linkedCardBoardId`, `linkedCardBoardName`).
const resolveLinkedSide = (linkModel) => {
  const ref = linkModel.ref || {};
  const linkedFromOrm = linkModel.linkedCard; // populated for same-board links
  return {
    linkedCardId: linkModel.linkedCardId,
    linkedCardName: ref.linkedCardName != null ? ref.linkedCardName : linkedFromOrm ? linkedFromOrm.name : null,
    linkedCardBoardId: ref.linkedCardBoardId != null ? ref.linkedCardBoardId : linkedFromOrm ? linkedFromOrm.boardId : null,
    linkedCardBoardName: ref.linkedCardBoardName != null ? ref.linkedCardBoardName : null,
  };
};

const resolveSourceSide = (linkModel) => {
  const ref = linkModel.ref || {};
  const cardFromOrm = linkModel.card;
  return {
    cardId: linkModel.cardId,
    cardName: ref.cardName != null ? ref.cardName : cardFromOrm ? cardFromOrm.name : null,
    cardBoardId: ref.cardBoardId != null ? ref.cardBoardId : cardFromOrm ? cardFromOrm.boardId : null,
    cardBoardName: ref.cardBoardName != null ? ref.cardBoardName : null,
  };
};

// Outgoing: links the user added on this card. Each row carries enough info to render
// the linked card's pill, including cross-board context when applicable.
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
        .map((link) => ({
          id: link.id,
          type: link.type,
          ...resolveLinkedSide(link),
        }))
        .filter((row) => !!row.linkedCardName);
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
        .map((link) => ({
          id: link.id,
          type: link.type,
          ...resolveSourceSide(link),
        }))
        .filter((row) => !!row.cardName);
    },
  );

export const selectIncomingLinksByCardId = makeSelectIncomingLinksByCardId();

export default {
  makeSelectOutgoingLinksByCardId,
  selectOutgoingLinksByCardId,
  makeSelectIncomingLinksByCardId,
  selectIncomingLinksByCardId,
};
