import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './CardLinks.module.scss';

const TYPES = { REFERENCES: 'references', BLOCKED_BY: 'blockedBy' };

const CardLinks = React.memo(({ cardId, references, blockedBy, referencedBy, blocking, pickableCards, canEdit, onCreate, onDelete }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const handlePick = useCallback(
    (type, option) => {
      if (option && option.id) {
        onCreate(cardId, { linkedCardId: option.id, type });
      }
    },
    [cardId, onCreate],
  );

  const handleNavigate = useCallback((linkedId) => navigate(Paths.CARDS.replace(':id', linkedId)), [navigate]);

  const renderOutgoing = (items, type, title, addLabel) => (
    <div className={s.section}>
      <div className={s.title}>{title}</div>
      <div className={s.links}>
        {items.map((link) => (
          <span key={link.id} className={s.pill}>
            <Button style={ButtonStyle.Default} onClick={() => handleNavigate(link.linkedCardId)} className={s.pillLink} title={link.linkedCardName}>
              {link.linkedCardName}
            </Button>
            {canEdit && (
              <Button style={ButtonStyle.Icon} onClick={() => onDelete(link.id)} title={t('common.removeLink')} className={s.pillRemove}>
                <Icon type={IconType.Close} size={IconSize.Size10} />
              </Button>
            )}
          </span>
        ))}
      </div>
      {canEdit && pickableCards.length > 0 && (
        <Dropdown key={`${type}-${items.length}`} style={DropdownStyle.FullWidth} options={pickableCards} placeholder={addLabel} isSearchable onChange={(option) => handlePick(type, option)} />
      )}
    </div>
  );

  const renderIncoming = (items, title) =>
    items.length > 0 && (
      <div className={s.section}>
        <div className={s.title}>{title}</div>
        <div className={s.links}>
          {items.map((link) => (
            <span key={link.id} className={s.pill}>
              <Button style={ButtonStyle.Default} onClick={() => handleNavigate(link.cardId)} className={s.pillLink} title={link.cardName}>
                {link.cardName}
              </Button>
            </span>
          ))}
        </div>
      </div>
    );

  return (
    <div className={s.wrapper}>
      {renderOutgoing(references, TYPES.REFERENCES, t('common.references'), t('common.addReference'))}
      {renderOutgoing(blockedBy, TYPES.BLOCKED_BY, t('common.blockedBy'), t('common.addBlockedBy'))}
      {renderIncoming(referencedBy, t('common.referencedBy'))}
      {renderIncoming(blocking, t('common.blocking'))}
    </div>
  );
});

CardLinks.propTypes = {
  cardId: PropTypes.string.isRequired,
  references: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  blockedBy: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  referencedBy: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  blocking: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  pickableCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CardLinks;
