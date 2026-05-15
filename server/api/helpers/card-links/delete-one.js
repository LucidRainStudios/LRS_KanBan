module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record, card } = inputs;

    const link = await CardLink.destroyOne(record.id);

    if (link) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardLinkDelete',
        {
          item: link,
        },
        inputs.request,
      );
    }

    return link;
  },
};
