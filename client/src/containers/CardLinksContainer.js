import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CardLinks from '../components/CardLinks';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectOutgoingLinksByCardId = selectors.makeSelectOutgoingLinksByCardId();
  const selectIncomingLinksByCardId = selectors.makeSelectIncomingLinksByCardId();

  return (state, { cardId }) => {
    const outgoing = selectOutgoingLinksByCardId(state, cardId) || [];
    const incoming = selectIncomingLinksByCardId(state, cardId) || [];

    const { boardId: currentBoardId, projectId: currentProjectId } = selectors.selectPath(state);

    // Cross-board references stay within the current project: list only boards the user has
    // access to that share the same project as the current card. Keeps the picker focused
    // and avoids implying that any-project linking is supported.
    const projects = selectors.selectProjectsToListsForCurrentUser(state) || [];
    const currentProject = projects.find((p) => p.id === currentProjectId);
    const accessibleBoards = currentProject
      ? (currentProject.boards || []).map((board) => ({
          id: board.id,
          name: board.name,
        }))
      : [];

    return {
      cardId,
      currentBoardId,
      references: outgoing.filter((l) => l.type === 'references'),
      blockedBy: outgoing.filter((l) => l.type === 'blockedBy'),
      referencedBy: incoming.filter((l) => l.type === 'references'),
      blocking: incoming.filter((l) => l.type === 'blockedBy'),
      accessibleBoards,
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
