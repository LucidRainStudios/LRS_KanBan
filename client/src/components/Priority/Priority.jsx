import React from 'react';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import LabelColors from '../../constants/LabelColors';
import { Button } from '../Utils';

import * as bs from '../../backgrounds.module.scss';
import * as s from './Priority.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const Priority = React.memo(({ name, color, variant, isDisabled, onClick }) => {
  const contentNode = (
    <div title={name} className={clsx(s.wrapper, variant === VARIANTS.CARD && s.wrapperCard, bs[`background${upperFirst(camelCase(color))}`], onClick && s.wrapperHoverable)}>
      {name}
    </div>
  );

  return onClick ? (
    <Button onClick={onClick} disabled={isDisabled} className={s.button}>
      {contentNode}
    </Button>
  ) : (
    contentNode
  );
});

Priority.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(LabelColors).isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Priority.defaultProps = {
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  onClick: undefined,
};

export default Priority;
