import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PrioritiesSettings from '../../components/Settings/PrioritiesSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const items = selectors.selectAllPriorities(state);
  const { demoMode } = selectors.selectCoreSettings(state);

  return {
    items,
    demoMode,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createPriority,
      onUpdate: entryActions.updatePriority,
      onDelete: entryActions.deletePriority,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PrioritiesSettings);
