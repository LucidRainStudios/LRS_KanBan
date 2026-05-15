const Errors = {
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
  PRIORITY_NOT_FOUND: {
    priorityNotFound: 'Priority not found',
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
    insufficientPermissions: {
      responseType: 'forbidden',
    },
    priorityNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    const priority = await sails.helpers.priorities.getOne.with({ criteria: { id: inputs.id } });

    if (!priority) {
      throw Errors.PRIORITY_NOT_FOUND;
    }

    await sails.helpers.priorities.deleteOne.with({
      record: priority,
      request: this.req,
    });

    return {
      item: priority,
    };
  },
};
