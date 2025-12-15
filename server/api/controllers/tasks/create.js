const moment = require('moment');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

const dueDateValidator = (value) => moment(value, moment.ISO_8601, true).isValid();

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isCompleted: {
      type: 'boolean',
    },
    dueDate: {
      type: 'string',
      custom: dueDateValidator,
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

    const { card } = await sails.helpers.cards.getProjectPath(inputs.cardId).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

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

    const values = _.pick(inputs, ['position', 'name', 'isCompleted', 'dueDate']);

    const task = await sails.helpers.tasks.createOne.with({
      values: {
        ...values,
        card,
      },
      currentUser,
      request: this.req,
    });

    const { webhookUrl, notifyBoardIds } = await sails.helpers.integrations.discord.getConfig();
    if (webhookUrl && notifyBoardIds.has(String(card.boardId))) {
      const payload = {
        username: '4ga Boards',
        embeds: [
          {
            title: `New task: ${task.name}`,
            description: `Card: ${card.name}`,
            color: 0x5865f2,
            fields: [
              { name: 'Task ID', value: `${task.id}`, inline: true },
              { name: 'Board ID', value: `${card.boardId}`, inline: true },
              { name: 'Created by', value: currentUser.name || currentUser.username || `${currentUser.id}`, inline: true },
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
      item: task,
    };
  },
};
