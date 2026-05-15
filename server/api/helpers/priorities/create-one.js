const valuesValidator = (value) => _.isPlainObject(value);

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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
    const { values, currentUser } = inputs;

    // Priorities are globally ordered; new ones are appended to the end.
    const priorities = await Priority.find().sort('position');
    const position = priorities.length > 0 ? priorities[priorities.length - 1].position + 65535 : 65535;

    const priority = await Priority.create({
      ...values,
      position,
      createdById: currentUser.id,
    }).fetch();

    if (priority) {
      const users = await sails.helpers.users.getMany();
      const userIds = sails.helpers.utils.mapRecords(users);

      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'priorityCreate',
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
