import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Priority from '../Priority';
import { Button, ButtonStyle, Popup } from '../Utils';

import * as s from './PriorityEditStep.module.scss';

const PriorityEditStep = React.memo(({ items, currentId, title, onSelect, onBack, onClose }) => {
  const [t] = useTranslation();

  const handlePick = useCallback(
    (id) => {
      onSelect(id);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <div className={s.menu}>
          {items.map((item) => (
            <Button
              key={item.id}
              style={ButtonStyle.PopupContext}
              title={item.name}
              onClick={() => handlePick(item.id)}
              className={item.id === currentId ? s.active : undefined}
            >
              <Priority name={item.name} color={item.color} variant="card" />
            </Button>
          ))}
          <Button style={ButtonStyle.PopupContext} title={t('common.noPriority')} onClick={() => handlePick(null)} className={currentId == null ? s.active : undefined}>
            {t('common.noPriority')}
          </Button>
        </div>
      </Popup.Content>
    </>
  );
});

PriorityEditStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentId: PropTypes.string,
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

PriorityEditStep.defaultProps = {
  currentId: undefined,
  title: 'common.priority',
  onBack: undefined,
};

export default PriorityEditStep;
