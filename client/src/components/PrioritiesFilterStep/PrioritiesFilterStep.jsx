import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Priority from '../Priority';
import { Button, ButtonStyle, Popup } from '../Utils';

import * as s from './PrioritiesFilterStep.module.scss';

// Multi-select picker for filtering the board by priority. Mirrors LabelsStep's "click to
// toggle" UX but skips add/edit/delete (admin-managed elsewhere) and the search input
// (priority lists are small).
const PrioritiesFilterStep = React.memo(({ items, currentIds, title, onSelect, onDeselect, onBack }) => {
  const [t] = useTranslation();

  const handleToggle = useCallback(
    (id) => {
      if (currentIds.includes(id)) {
        onDeselect(id);
      } else {
        onSelect(id);
      }
    },
    [currentIds, onSelect, onDeselect],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {items.length === 0 ? (
          <div className={s.empty}>{t('common.noPriorities')}</div>
        ) : (
          <div className={s.menu}>
            {items.map((item) => (
              <Button
                key={item.id}
                style={ButtonStyle.PopupContext}
                title={item.name}
                onClick={() => handleToggle(item.id)}
                className={clsx(s.item, currentIds.includes(item.id) && s.itemActive)}
              >
                <Priority name={item.name} color={item.color} variant="card" />
              </Button>
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

PrioritiesFilterStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

PrioritiesFilterStep.defaultProps = {
  title: 'common.filterByPriorities',
  onBack: undefined,
};

export default PrioritiesFilterStep;
