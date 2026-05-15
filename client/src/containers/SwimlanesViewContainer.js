import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SwimlanesView from '../components/Board/Swimlanes';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectListById = selectors.makeSelectListById();

  return (state) => {
    const { boardId } = selectors.selectPath(state);
    const listIds = selectors.selectListIdsForCurrentBoard(state) || [];
    const lists = listIds.map((id) => {
      const list = selectListById(state, id);
      return { id, name: list ? list.name : '' };
    });
    const swimlanes = selectors.selectSwimlanesForCurrentBoard(state) || [];

    return {
      boardId,
      lists,
      swimlanes,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCardMove: entryActions.moveCardToSwimlane,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(SwimlanesView);
