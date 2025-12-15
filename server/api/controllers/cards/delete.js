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

    card = await sails.helpers.cards.deleteOne.with({
      record: card,
      currentUser,
      request: this.req,
    });

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    const { webhookUrl, notifyBoardIds } = await sails.helpers.integrations.discord.getConfig();
    if (webhookUrl && notifyBoardIds.has(String(card.boardId))) {
      const payload = {
        username: '4ga Boards',
        embeds: [
          {
            title: `Card deleted: ${card.name}`,
            color: 0xed4245,
            fields: [
              { name: 'Card ID', value: `${card.id}`, inline: true },
              { name: 'Board ID', value: `${card.boardId}`, inline: true },
              { name: 'Deleted by', value: currentUser.name || currentUser.username || `${currentUser.id}`, inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };

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
