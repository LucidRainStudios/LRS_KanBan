const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  LINKED_CARD_NOT_FOUND: {
    linkedCardNotFound: 'Linked card not found',
  },
  INVALID_LINK: {
    invalidLink: 'Invalid link',
  },
  LINK_ALREADY_EXISTS: {
    linkAlreadyExists: 'Link already exists',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    linkedCardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(CardLink.Types),
      required: true,
    },
  },

  exits: {
    notEnoughRights: { responseType: 'forbidden' },
    cardNotFound: { responseType: 'notFound' },
    linkedCardNotFound: { responseType: 'notFound' },
    invalidLink: { responseType: 'unprocessableEntity' },
    linkAlreadyExists: { responseType: 'conflict' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, board } = await sails.helpers.cards.getProjectPath(inputs.cardId).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({ boardId: board.id, userId: currentUser.id });
    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }
    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    // v1: same-board only
    const linkedCard = await Card.findOne({ id: inputs.linkedCardId, boardId: board.id });
    if (!linkedCard) {
      throw Errors.LINKED_CARD_NOT_FOUND;
    }

    const link = await sails.helpers.cardLinks.createOne
      .with({
        values: { card, linkedCard, type: inputs.type },
        currentUser,
        request: this.req,
      })
      .intercept('invalidLink', () => Errors.INVALID_LINK)
      .intercept('linkAlreadyExists', () => Errors.LINK_ALREADY_EXISTS);

    return { item: link };
  },
};
