import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Icon, IconType, IconSize } from '../Utils';

import * as s from './Effort.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const Effort = React.memo(({ value, variant, isClickable, className, onClick }) => {
  if (!value) return null;

  const contentNode = (
    <div className={clsx(s.wrapper, s[`wrapper${variant.charAt(0).toUpperCase() + variant.slice(1)}`], onClick && s.wrapperHoverable, className)} title={`Effort: ${value}`}>
      <Icon type={IconType.Zap} size={variant === VARIANTS.CARD ? IconSize.Size13 : IconSize.Size14} className={s.icon} />
      <span className={s.text}>{value}</span>
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

Effort.propTypes = {
  value: PropTypes.number,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isClickable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Effort.defaultProps = {
  value: undefined,
  variant: VARIANTS.CARDMODAL,
  isClickable: false,
  className: undefined,
  onClick: undefined,
};

export default Effort;
