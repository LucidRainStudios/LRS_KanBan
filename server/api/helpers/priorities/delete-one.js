module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record } = inputs;

    // Detach the priority from any cards/tasks that reference it before removing it.
    await Card.update({ priorityId: record.id }).set({ priorityId: null });
    await Task.update({ priorityId: record.id }).set({ priorityId: null });

    const priority = await Priority.destroyOne(record.id);

    if (priority) {
      const users = await sails.helpers.users.getMany();
      const userIds = sails.helpers.utils.mapRecords(users);

      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'priorityDelete',
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
