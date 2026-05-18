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
      // Denormalize the foreign card's name + board name onto the broadcast payload so
      // recipients on either board can render "Card name (Board name)" pills without needing
      // the foreign Card record in their redux store. Always populate both sides — the source
      // board's clients use `linkedCard*` fields; the linked board's clients use `card*` fields.
      const boardIds = [values.card.boardId];
      if (values.linkedCard.boardId && values.linkedCard.boardId !== values.card.boardId) {
        boardIds.push(values.linkedCard.boardId);
      }
      const boards = await sails.helpers.boards.getMany(boardIds);
      const boardById = _.keyBy(boards, 'id');
      const enrichedLink = {
        ...link,
        cardName: values.card.name,
        cardBoardId: values.card.boardId,
        cardBoardName: boardById[values.card.boardId] ? boardById[values.card.boardId].name : null,
        linkedCardName: values.linkedCard.name,
        linkedCardBoardId: values.linkedCard.boardId,
        linkedCardBoardName: boardById[values.linkedCard.boardId] ? boardById[values.linkedCard.boardId].name : null,
      };

      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'cardLinkCreate',
        {
          item: enrichedLink,
        },
        inputs.request,
      );
      if (values.linkedCard.boardId && values.linkedCard.boardId !== values.card.boardId) {
        sails.sockets.broadcast(`board:${values.linkedCard.boardId}`, 'cardLinkCreate', { item: enrichedLink }, inputs.request);
      }

      // Return the enriched link so the creator (HTTP response path) also gets denormalized
      // fields — important for cross-board links where the linked card isn't in their store.
      return enrichedLink;
    }

    return link;
  },
};
