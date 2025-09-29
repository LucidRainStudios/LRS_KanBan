import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Icon, IconType, IconSize } from '../Utils';

import * as s from './Priority.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const Priority = React.memo(({ value, variant, isClickable, className, onClick }) => {
  if (!value) return null;

  const getIcon = () => {
    switch (value) {
      case PRIORITIES.HIGH:
        return IconType.ArrowUp;
      case PRIORITIES.MEDIUM:
        return IconType.Minus;
      case PRIORITIES.LOW:
        return IconType.ArrowDown;
      default:
        return IconType.Minus;
    }
  };

  const contentNode = (
    <div
      className={clsx(s.wrapper, s[`wrapper${variant.charAt(0).toUpperCase() + variant.slice(1)}`], s[`priority${value.charAt(0).toUpperCase() + value.slice(1)}`], onClick && s.wrapperHoverable, className)}
      title={`Priority: ${value.charAt(0).toUpperCase() + value.slice(1)}`}
    >
      <Icon type={getIcon()} size={variant === VARIANTS.CARD ? IconSize.Size13 : IconSize.Size14} className={s.icon} />
      {variant === VARIANTS.CARDMODAL && <span className={s.text}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>}
    </div>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={s.button}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

Priority.propTypes = {
  value: PropTypes.oneOf(Object.values(PRIORITIES)),
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isClickable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Priority.defaultProps = {
  value: undefined,
  variant: VARIANTS.CARDMODAL,
  isClickable: false,
  className: undefined,
  onClick: undefined,
};

export default Priority;

/*
Usage:

// In Card Edit Modal:
<Priority priority={card.priority} onChange={newPriority => updateCard({ ...card, priority: newPriority })} />

// On Card (full or collapsed preview):
<PriorityBadge priority={card.priority} />

// CSS (Priority.css) should style .priority-badge, .priority-selector, .priority-dropdown, etc.
*/
