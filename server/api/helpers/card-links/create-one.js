const valuesValidator = (value) => _.isPlainObject(value) && _.isPlainObject(value.card) && _.isPlainObject(value.linkedCard);

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
    request: {
      type: 'ref',
    },
  },

  exits: {
    invalidLink: {},
    linkAlreadyExists: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    if (values.card.id === values.linkedCard.id) {
      throw 'invalidLink';
    }

    const link = await CardLink.create({
      cardId: values.card.id,
      linkedCardId: values.linkedCard.id,
      type: values.type,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', () => 'linkAlreadyExists')
      .fetch();

    if (link) {
      // Broadcast to both cards' boards (often the same; safe either way for v1 same-board).
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'cardLinkCreate',
        {
          item: link,
        },
        inputs.request,
      );
      if (values.linkedCard.boardId && values.linkedCard.boardId !== values.card.boardId) {
        sails.sockets.broadcast(`board:${values.linkedCard.boardId}`, 'cardLinkCreate', { item: link }, inputs.request);
      }
    }

    return link;
  },
};
