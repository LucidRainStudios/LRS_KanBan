const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const card = await Card.updateOne(inputs.record.id).set({
      updatedById: currentUser.id,
      ...values,
    });

    if (card) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardUpdate',
        {
          item: card,
        },
        inputs.request,
      );

      if (values.name !== undefined || values.description !== undefined || values.dueDate !== undefined || values.priority !== undefined || values.effort !== undefined) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            type: Action.Types.CARD_UPDATE,
            data: {
              cardId: card.id,
              cardName: card.name,
              ...(values.name !== undefined && { name: values.name }),
              ...(values.description !== undefined && { description: values.description }),
              ...(values.dueDate !== undefined && { dueDate: values.dueDate }),
              ...(values.priority !== undefined && { priority: values.priority }),
              ...(values.effort !== undefined && { effort: values.effort }),
            },
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: card.id, currentUser, skipMetaUpdate });
    }

    return card;
  },
};
