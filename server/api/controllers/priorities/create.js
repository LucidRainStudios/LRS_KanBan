const Errors = {
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
    },
    color: {
      type: 'string',
      isIn: Priority.COLORS,
      required: true,
    },
  },

  exits: {
    insufficientPermissions: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    const values = _.pick(inputs, ['name', 'color']);

    const priority = await sails.helpers.priorities.createOne.with({
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: priority,
    };
  },
};
