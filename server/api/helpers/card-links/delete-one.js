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
    linkedCard: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record, card, linkedCard } = inputs;

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

      // Cross-board: also notify the linked card's board so that side's CardLinks panel updates live.
      if (linkedCard && linkedCard.boardId && linkedCard.boardId !== card.boardId) {
        sails.sockets.broadcast(`board:${linkedCard.boardId}`, 'cardLinkDelete', { item: link }, inputs.request);
      }
    }

    return link;
  },
};
