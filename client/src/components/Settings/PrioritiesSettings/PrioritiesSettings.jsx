import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import LabelColors from '../../../constants/LabelColors';
import Priority from '../../Priority';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input, InputStyle } from '../../Utils';

import * as bs from '../../../backgrounds.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './PrioritiesSettings.module.scss';

const DEFAULT_DRAFT = { name: '', color: LabelColors[0] };

const PriorityEditor = React.memo(({ data, onChange, onSubmit, onCancel, submitLabel }) => {
  const [t] = useTranslation();

  const handleNameChange = useCallback(
    (event) => onChange({ ...data, name: event.target.value }),
    [data, onChange],
  );

  const handleColorClick = useCallback(
    (event) => onChange({ ...data, color: event.target.value }),
    [data, onChange],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' && data.name.trim()) {
        event.preventDefault();
        onSubmit();
      } else if (event.key === 'Escape') {
        onCancel();
      }
    },
    [data.name, onSubmit, onCancel],
  );

  return (
    <div className={s.editor}>
      <Input
        style={InputStyle.Default}
        name="name"
        value={data.name}
        placeholder={t('common.enterPriorityName')}
        onChange={handleNameChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div className={s.colorRow}>
        {LabelColors.map((color) => (
          <Button
            key={color}
            style={ButtonStyle.Default}
            name="color"
            value={color}
            className={clsx(s.colorButton, color === data.color && s.colorButtonActive, bs[`background${upperFirst(camelCase(color))}`])}
            onClick={handleColorClick}
          />
        ))}
      </div>
      <div className={s.editorActions}>
        <Button style={ButtonStyle.DefaultBorder} onClick={onCancel} title={t('action.cancel')}>
          {t('action.cancel')}
        </Button>
        <Button style={ButtonStyle.Default} onClick={onSubmit} disabled={!data.name.trim()} title={submitLabel}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
});

PriorityEditor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
};

const PrioritiesSettings = React.memo(({ items, demoMode, onCreate, onUpdate, onDelete }) => {
  const [t] = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(DEFAULT_DRAFT);

  const handleAddClick = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
    setIsAdding(true);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setIsAdding(false);
    setDraft(DEFAULT_DRAFT);
  }, []);

  const handleSubmitAdd = useCallback(() => {
    const name = draft.name.trim();
    if (!name) return;
    onCreate({ name, color: draft.color });
    setIsAdding(false);
    setDraft(DEFAULT_DRAFT);
  }, [draft, onCreate]);

  const handleEditClick = useCallback((item) => {
    setEditingId(item.id);
    setEditDraft({ name: item.name, color: item.color });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft(DEFAULT_DRAFT);
  }, []);

  const handleSubmitEdit = useCallback(() => {
    const name = editDraft.name.trim();
    if (!name || !editingId) return;
    onUpdate(editingId, { name, color: editDraft.color });
    setEditingId(null);
    setEditDraft(DEFAULT_DRAFT);
  }, [editDraft, editingId, onUpdate]);

  const handleDeleteClick = useCallback(
    (id, name) => {
      // eslint-disable-next-line no-alert
      if (window.confirm(t('common.areYouSureYouWantToDeletePriority', { name }))) {
        onDelete(id);
      }
    },
    [onDelete, t],
  );

  return (
    <div className={clsx(sShared.wrapper, s.wrapper)}>
      <div className={sShared.header}>
        <div className={sShared.headerFlex}>
          <h2 className={sShared.headerText}>
            {t('common.priorities')} <span className={s.headerCount}>({items.length})</span>
          </h2>
          {!isAdding && !demoMode && (
            <Button style={ButtonStyle.DefaultBorder} onClick={handleAddClick} title={t('common.addPriority', { context: 'title' })}>
              <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.addIcon} />
              {t('common.addPriority', { context: 'title' })}
            </Button>
          )}
        </div>
        {demoMode && <p className={sShared.demoMode}>{t('common.demoModeExplanation')}</p>}
      </div>

      {isAdding && (
        <div className={s.row}>
          <PriorityEditor
            data={draft}
            onChange={setDraft}
            onSubmit={handleSubmitAdd}
            onCancel={handleCancelAdd}
            submitLabel={t('action.createPriority')}
          />
        </div>
      )}

      {items.length === 0 && !isAdding && (
        <div className={s.empty}>{t('common.noPrioritiesYet')}</div>
      )}

      {items.map((item) => (
        <div key={item.id} className={s.row}>
          {editingId === item.id ? (
            <PriorityEditor
              data={editDraft}
              onChange={setEditDraft}
              onSubmit={handleSubmitEdit}
              onCancel={handleCancelEdit}
              submitLabel={t('action.save')}
            />
          ) : (
            <>
              <div className={s.rowPreview}>
                <Priority name={item.name} color={item.color} variant="card" />
                <span className={s.rowMeta}>{t('common.position')}: {item.position ?? '—'}</span>
              </div>
              {!demoMode && (
                <div className={s.rowActions}>
                  <Button style={ButtonStyle.Icon} title={t('action.edit')} onClick={() => handleEditClick(item)}>
                    <Icon type={IconType.Pencil} size={IconSize.Size13} />
                  </Button>
                  <Button style={ButtonStyle.Icon} title={t('action.delete')} onClick={() => handleDeleteClick(item.id, item.name)}>
                    <Icon type={IconType.Trash} size={IconSize.Size13} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
});

PrioritiesSettings.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  demoMode: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PrioritiesSettings;
