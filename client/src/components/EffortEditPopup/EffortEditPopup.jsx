import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Popup } from '../Utils';

import * as s from './EffortEditPopup.module.scss';

const EffortEditPopup = React.memo(({ children, defaultValue, onUpdate, disabled, ...props }) => {
  const [t] = useTranslation();
  const [inputValue, setInputValue] = useState(defaultValue || '');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const value = parseInt(inputValue, 10);
      onUpdate(Number.isNaN(value) ? null : value);
    },
    [inputValue, onUpdate],
  );

  const handleRemove = useCallback(() => {
    onUpdate(null);
  }, [onUpdate]);

  const handleInputChange = useCallback((event) => {
    setInputValue(event.target.value);
  }, []);

  return (
    <Popup disabled={disabled}>
      {children}
      <div className={s.menu}>
        <div className={s.menuHeader}>{t('common.setEffort')}</div>
        <form onSubmit={handleSubmit} className={s.form}>
          <input type="number" value={inputValue} onChange={handleInputChange} placeholder={t('common.enterEffortValue')} className={s.input} min="0" max="999" />
          <div className={s.buttons}>
            <button type="submit" className={s.saveButton}>
              {t('action.save')}
            </button>
            {defaultValue && (
              <button type="button" className={s.removeButton} onClick={handleRemove}>
                {t('common.removeEffort')}
              </button>
            )}
          </div>
        </form>
      </div>
    </Popup>
  );
});

EffortEditPopup.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.number,
  onUpdate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

EffortEditPopup.defaultProps = {
  defaultValue: undefined,
  disabled: false,
};

export default EffortEditPopup;
