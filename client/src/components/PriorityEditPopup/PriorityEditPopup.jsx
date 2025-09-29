import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Icon, IconType, IconSize, Popup } from '../Utils';

import * as s from './PriorityEditPopup.module.scss';

const PRIORITIES = [
  { value: 'high', color: 'priorityHigh', icon: IconType.ArrowUp },
  { value: 'medium', color: 'priorityMedium', icon: IconType.Minus },
  { value: 'low', color: 'priorityLow', icon: IconType.ArrowDown },
];

const PriorityEditPopup = React.memo(({ children, defaultValue, onUpdate, disabled }) => {
  const [t] = useTranslation();

  const handleClick = useCallback(
    (priority) => {
      onUpdate(priority === defaultValue ? null : priority);
    },
    [defaultValue, onUpdate],
  );

  return (
    <Popup disabled={disabled}>
      {children}
      <div className={s.menu}>
        <div className={s.menuHeader}>{t('common.setPriority')}</div>
        <div className={s.menuContent}>
          {PRIORITIES.map((priority) => (
            <button key={priority.value} type="button" className={s.priorityButton} onClick={() => handleClick(priority.value)}>
              <div className={s.priorityItem}>
                <Icon type={priority.icon} size={IconSize.Size13} />
              </div>
              <div className={`${s.priorityColor} ${s[priority.color]}`} title={t(`common.priority${priority.value.charAt(0).toUpperCase() + priority.value.slice(1)}`)}>
                <span className={s.priorityText}>{t(`common.priority${priority.value.charAt(0).toUpperCase() + priority.value.slice(1)}`)}</span>
              </div>
            </button>
          ))}
          {defaultValue && (
            <button type="button" className={s.removeButton} onClick={() => handleClick(null)}>
              {t('common.removePriority')}
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
});

PriorityEditPopup.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

PriorityEditPopup.defaultProps = {
  defaultValue: undefined,
  disabled: false,
};

export default PriorityEditPopup;
