import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';

import DroppableTypes from '../../../constants/DroppableTypes';
import CardContainer from '../../../containers/CardContainer';

import * as s from './Swimlanes.module.scss';

// One (list x lane) cell. Non-virtualized: a single user's cards in a single column is a small set.
const SwimlaneCell = React.memo(({ listId, laneId, cardIds }) => (
  <Droppable droppableId={`swimlaneCell:${listId}:${laneId}`} type={DroppableTypes.CARD}>
    {({ innerRef, droppableProps, placeholder }) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div {...droppableProps} ref={innerRef} className={s.cell}>
        {cardIds.map((cardId, index) => (
          <CardContainer key={cardId} id={cardId} index={index} />
        ))}
        {placeholder}
      </div>
    )}
  </Droppable>
));

SwimlaneCell.propTypes = {
  listId: PropTypes.string.isRequired,
  laneId: PropTypes.string.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default SwimlaneCell;
