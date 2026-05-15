import React, { useCallback, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../../constants/DroppableTypes';
import SwimlaneCellContainer from '../../../containers/SwimlaneCellContainer';
import { useLocalStorage } from '../../../hooks';
import User from '../../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './Swimlanes.module.scss';

const SwimlanesView = React.memo(({ boardId, lists, swimlanes, onCardMove }) => {
  const [t] = useTranslation();
  const [setCollapsed, getCollapsed] = useLocalStorage(`swimlanes-collapsed-${boardId}`);
  const [collapsedLanes, setCollapsedLanes] = useState(() => getCollapsed() || {});

  const handleToggleLane = useCallback(
    (laneId) => {
      setCollapsedLanes((prev) => {
        const next = { ...prev, [laneId]: !prev[laneId] };
        setCollapsed(next);
        return next;
      });
    },
    [setCollapsed],
  );

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
        return;
      }
      if (type !== DroppableTypes.CARD) {
        return;
      }

      const cardId = draggableId.split(':')[1];
      const [, listId, laneId] = destination.droppableId.split(':');
      onCardMove(cardId, listId, laneId, destination.index);
    },
    [onCardMove],
  );

  const gridStyle = { gridTemplateColumns: `var(--swimlaneHeaderWidth) repeat(${lists.length}, var(--swimlaneColumnWidth))` };

  return (
    <div className={clsx(s.wrapper, gs.scrollableX, gs.scrollableY)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={s.grid} style={gridStyle}>
          <div className={clsx(s.headerCell, s.cornerCell)} />
          {lists.map((list) => (
            <div key={list.id} className={clsx(s.headerCell, s.listHeaderCell)} title={list.name}>
              {list.name}
            </div>
          ))}
          {swimlanes.map((lane) => {
            const isCollapsed = !!collapsedLanes[lane.id];

            return (
              <React.Fragment key={lane.id}>
                <div className={clsx(s.laneHeaderCell, isCollapsed && s.laneHeaderCellCollapsed)}>
                  <Button style={ButtonStyle.Icon} title={lane.isUnassigned ? t('common.unassigned') : lane.user.name} onClick={() => handleToggleLane(lane.id)} className={s.laneToggleButton}>
                    <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(isCollapsed && s.laneToggleIconCollapsed)} />
                    {!lane.isUnassigned && <User name={lane.user.name} avatarUrl={lane.user.avatarUrl} size="card" />}
                    <span className={s.laneName}>{lane.isUnassigned ? t('common.unassigned') : lane.user.name}</span>
                  </Button>
                </div>
                {!isCollapsed && lists.map((list) => <SwimlaneCellContainer key={list.id} listId={list.id} laneId={lane.id} />)}
              </React.Fragment>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
});

SwimlanesView.propTypes = {
  boardId: PropTypes.string.isRequired,
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  swimlanes: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCardMove: PropTypes.func.isRequired,
};

export default SwimlanesView;
