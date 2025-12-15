const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let { card } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const { webhookUrl, notifyBoardIds } = await sails.helpers.integrations.discord.getConfig();
    const notifyThisBoard = webhookUrl && notifyBoardIds.has(String(card.boardId));

    const tasks = notifyThisBoard ? await sails.helpers.cards.getTasks(card.id) : [];
    const labels = notifyThisBoard ? await sails.helpers.cards.getLabels(card.id) : [];
    const list = notifyThisBoard ? await List.findOne({ id: card.listId }) : null;

    card = await sails.helpers.cards.deleteOne.with({
      record: card,
      currentUser,
      request: this.req,
    });

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    if (notifyThisBoard) {
      const payload = await sails.helpers.integrations.discord.buildCardPayload.with({
        card,
        currentUser,
        actionLabel: 'Card deleted',
        color: 0xed4245,
        tasks,
        labels,
        listName: list?.name,
      });

      await sails.helpers.integrations.discord.sendWebhook.with({
        url: webhookUrl,
        payload,
      });
    }

    return {
      item: card,
    };
  },
};
