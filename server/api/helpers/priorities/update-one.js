module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record, values, currentUser } = inputs;

    const priority = await Priority.updateOne(record.id).set({ updatedById: currentUser.id, ...values });

    if (priority) {
      const users = await sails.helpers.users.getMany();
      const userIds = sails.helpers.utils.mapRecords(users);

      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'priorityUpdate',
          {
            item: priority,
          },
          inputs.request,
        );
      });
    }

    return priority;
  },
};
