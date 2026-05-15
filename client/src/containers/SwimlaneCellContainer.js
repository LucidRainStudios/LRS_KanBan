import { connect } from 'react-redux';

import SwimlaneCell from '../components/Board/Swimlanes/SwimlaneCell';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectFilteredCardIdsByListIdAndLane = selectors.makeSelectFilteredCardIdsByListIdAndLane();

  return (state, { listId, laneId }) => ({
    cardIds: selectFilteredCardIdsByListIdAndLane(state, listId, laneId) || [],
  });
};

export default connect(makeMapStateToProps)(SwimlaneCell);
