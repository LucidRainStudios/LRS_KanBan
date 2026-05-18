import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';

import api from '../../api';
import Paths from '../../constants/Paths';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './CardLinks.module.scss';

const TYPES = { REFERENCES: 'references', BLOCKED_BY: 'blockedBy' };

// One row of the picker: pick a board, then pick a card on that board. The card list is
// fetched on demand from `/api/boards/:id/cards-summary` when the board changes.
const LinkAdder = React.memo(({ cardId, currentBoardId, accessibleBoards, type, placeholder, onCreate }) => {
  const [t] = useTranslation();
  const [boardId, setBoardId] = useState(currentBoardId);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pickResetKey, setPickResetKey] = useState(0); // bump to reset the card dropdown after a pick

  useEffect(() => {
    if (!boardId) return undefined;
    let cancelled = false;
    setIsLoading(true);
    api
      .getBoardCardsSummary(boardId)
      .then((res) => {
        if (cancelled) return;
        const items = (res.items || []).filter((c) => c.id !== cardId);
        setCards(items);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCards([]);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boardId, cardId]);

  const handleBoardChange = useCallback((option) => {
    if (option && option.id) {
      setBoardId(option.id);
    }
  }, []);

  const handleCardChange = useCallback(
    (option) => {
      if (!option || !option.id) return;
      onCreate(cardId, { linkedCardId: option.id, type });
      setPickResetKey((k) => k + 1);
    },
    [cardId, type, onCreate],
  );

  const defaultBoardOption = accessibleBoards.find((b) => b.id === boardId);
  const cardPlaceholder = (() => {
    if (!boardId) return t('common.pickBoardFirst');
    if (isLoading) return t('common.loading');
    if (cards.length === 0) return t('common.noLinkableCards');
    return placeholder;
  })();

  return (
    <div className={s.adderRow}>
      <div className={s.adderBoard}>
        <Dropdown
          style={DropdownStyle.FullWidth}
          options={accessibleBoards}
          placeholder={t('common.pickBoard')}
          defaultItem={defaultBoardOption}
          isSearchable
          onChange={handleBoardChange}
        />
      </div>
      <div className={s.adderCard}>
        <Dropdown
          key={`${type}-${boardId}-${pickResetKey}`}
          style={DropdownStyle.FullWidth}
          options={cards}
          placeholder={cardPlaceholder}
          isSearchable
          onChange={handleCardChange}
        />
      </div>
    </div>
  );
});

LinkAdder.propTypes = {
  cardId: PropTypes.string.isRequired,
  currentBoardId: PropTypes.string.isRequired,
  accessibleBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired,
};

const CardLinks = React.memo(({ cardId, currentBoardId, references, blockedBy, referencedBy, blocking, accessibleBoards, canEdit, onCreate, onDelete }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const handleNavigate = useCallback((linkedId) => navigate(Paths.CARDS.replace(':id', linkedId)), [navigate]);

  // Pill label: "Card name" for same-board links, "Card name (Board name)" for cross-board.
  const formatLinkedLabel = useCallback(
    (link) => {
      if (link.linkedCardBoardId && link.linkedCardBoardId !== currentBoardId && link.linkedCardBoardName) {
        return `${link.linkedCardName} (${link.linkedCardBoardName})`;
      }
      return link.linkedCardName;
    },
    [currentBoardId],
  );

  const formatSourceLabel = useCallback(
    (link) => {
      if (link.cardBoardId && link.cardBoardId !== currentBoardId && link.cardBoardName) {
        return `${link.cardName} (${link.cardBoardName})`;
      }
      return link.cardName;
    },
    [currentBoardId],
  );

  const renderOutgoing = (items, type, title, addLabel) => (
    <div className={s.section}>
      <div className={s.title}>{title}</div>
      <div className={s.links}>
        {items.map((link) => {
          const label = formatLinkedLabel(link);
          return (
            <span key={link.id} className={s.pill}>
              <Button style={ButtonStyle.Default} onClick={() => handleNavigate(link.linkedCardId)} className={s.pillLink} title={label}>
                {label}
              </Button>
              {canEdit && (
                <Button style={ButtonStyle.Icon} onClick={() => onDelete(link.id)} title={t('common.removeLink')} className={s.pillRemove}>
                  <Icon type={IconType.Close} size={IconSize.Size10} />
                </Button>
              )}
            </span>
          );
        })}
      </div>
      {canEdit && accessibleBoards.length > 0 && (
        <LinkAdder cardId={cardId} currentBoardId={currentBoardId} accessibleBoards={accessibleBoards} type={type} placeholder={addLabel} onCreate={onCreate} />
      )}
    </div>
  );

  const renderIncoming = (items, title) =>
    items.length > 0 && (
      <div className={s.section}>
        <div className={s.title}>{title}</div>
        <div className={s.links}>
          {items.map((link) => {
            const label = formatSourceLabel(link);
            return (
              <span key={link.id} className={s.pill}>
                <Button style={ButtonStyle.Default} onClick={() => handleNavigate(link.cardId)} className={s.pillLink} title={label}>
                  {label}
                </Button>
              </span>
            );
          })}
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
  currentBoardId: PropTypes.string.isRequired,
  references: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  blockedBy: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  referencedBy: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  blocking: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  accessibleBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CardLinks;
