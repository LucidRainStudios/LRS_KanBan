const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.list)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    duplicate: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values, currentUser, duplicate, skipMetaUpdate, skipActions } = inputs;

    if (!values.position) {
      throw 'positionMustBeInValues';
    }

    const card = await Card.create({
      ...values,
      boardId: values.list.boardId,
      listId: values.list.id,
      createdById: currentUser.id,
    }).fetch();

    if (card) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        duplicate ? 'cardDuplicate' : 'cardCreate',
        {
          item: card,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            type: duplicate ? Action.Types.CARD_DUPLICATE : Action.Types.CARD_CREATE,
            data: {
              cardId: card.id,
              cardName: card.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.lists.updateMeta.with({ id: card.listId, currentUser, skipMetaUpdate });
    }

    return card;
  },
};
