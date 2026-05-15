import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CardLinks from '../components/CardLinks';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectOutgoingLinksByCardId = selectors.makeSelectOutgoingLinksByCardId();
  const selectIncomingLinksByCardId = selectors.makeSelectIncomingLinksByCardId();
  const selectCardById = selectors.makeSelectCardById();

  return (state, { cardId }) => {
    const outgoing = selectOutgoingLinksByCardId(state, cardId) || [];
    const incoming = selectIncomingLinksByCardId(state, cardId) || [];

    // All other cards on the current board, used by the picker.
    const listIds = selectors.selectListIdsForCurrentBoard(state) || [];
    const pickableCards = [];
    listIds.forEach((listId) => {
      const ids = selectors.selectCardIdsByListId(state, listId) || [];
      ids.forEach((id) => {
        if (id === cardId) return;
        const card = selectCardById(state, id);
        if (card) pickableCards.push({ id: card.id, name: card.name });
      });
    });

    return {
      cardId,
      references: outgoing.filter((l) => l.type === 'references'),
      blockedBy: outgoing.filter((l) => l.type === 'blockedBy'),
      referencedBy: incoming.filter((l) => l.type === 'references'),
      blocking: incoming.filter((l) => l.type === 'blockedBy'),
      pickableCards,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createCardLink,
      onDelete: entryActions.deleteCardLink,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(CardLinks);
