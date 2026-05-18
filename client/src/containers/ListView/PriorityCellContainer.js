import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PriorityCell from '../../components/Board/ListView/PriorityCell';
import { BoardMembershipRoles } from '../../constants/Enums';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const allPriorities = selectors.selectAllPriorities(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    allPriorities,
    canEdit: isCurrentUserEditor,
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateCard(id, data),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PriorityCell);
