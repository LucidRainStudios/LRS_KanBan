const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_LINK_NOT_FOUND: {
    cardLinkNotFound: 'Card link not found',
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
    notEnoughRights: { responseType: 'forbidden' },
    cardLinkNotFound: { responseType: 'notFound' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const link = await sails.helpers.cardLinks.getOne.with({ criteria: { id: inputs.id } });
    if (!link) {
      throw Errors.CARD_LINK_NOT_FOUND;
    }

    const { card, board } = await sails.helpers.cards.getProjectPath(link.cardId).intercept('pathNotFound', () => Errors.CARD_LINK_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({ boardId: board.id, userId: currentUser.id });
    if (!boardMembership) {
      throw Errors.CARD_LINK_NOT_FOUND; // Forbidden
    }
    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    // For cross-board links, fetch the linked card so the helper can broadcast the
    // delete to that board's socket room too (so the linked-card view updates live).
    let linkedCard;
    try {
      const linkedPath = await sails.helpers.cards.getProjectPath(link.linkedCardId);
      linkedCard = linkedPath.card;
    } catch (e) {
      // Linked card was deleted concurrently; just clean up the dangling link without a second broadcast.
      linkedCard = null;
    }

    const deletedLink = await sails.helpers.cardLinks.deleteOne.with({
      record: link,
      card,
      linkedCard,
      request: this.req,
    });

    return { item: deletedLink };
  },
};
