const moment = require('moment');

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
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    dueDate: {
      type: 'ref',
    },
    priority: {
      type: 'string',
      isIn: ['low', 'medium', 'high'],
      allowNull: true,
    },
    effort: {
      type: 'number',
      min: 0,
      max: 999,
      allowNull: true,
    },
    timer: {
      type: 'json',
    },
    isSubscribed: {
      type: 'boolean',
    },
    coverAttachmentId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
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

    const { card } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

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

    const values = _.pick(inputs, ['name', 'description', 'dueDate', 'priority', 'effort', 'timer', 'isSubscribed', 'coverAttachmentId']);

    const updatedCard = await sails.helpers.cards.updateOne.with({
      record: card,
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: updatedCard,
    };
  },
};
