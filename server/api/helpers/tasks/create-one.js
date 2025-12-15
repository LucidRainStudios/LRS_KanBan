const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  return true;
};

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
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    duplicate: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;

    const tasks = await sails.helpers.cards.getTasks(values.card.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, tasks);

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Task.update({
        id,
        cardId: values.card.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.card.boardId}`, 'taskUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const task = await Task.create({
      ...values,
      position,
      cardId: values.card.id,
      createdById: currentUser.id,
    }).fetch();

    if (task) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'taskCreate',
        {
          item: task,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            card: values.card,
            scope: Action.Scopes.TASK,
            type: inputs.duplicate ? Action.Types.CARD_TASK_DUPLICATE : Action.Types.CARD_TASK_CREATE,
            data: {
              taskId: task.id,
              taskName: task.name,
            },
          },
          currentUser,
        });
      }

      const notifyBoardIds = new Set([
        '1604177589386085452', // Tech Team
        '1604178028152226912', // Creative Team
        '1604178149526996072', // Art Team
        '1604178239931024495', // Marketing Team
      ]);

      const webhookUrl = process.env.DISCORD_TASK_WEBHOOK_URL;
      if (webhookUrl && notifyBoardIds.has(String(values.card.boardId)) && !inputs.duplicate) {
        const payload = {
          username: '4ga Boards',
          embeds: [
            {
              title: `New task: ${task.name}`,
              description: `Card: ${values.card.name}`,
              color: 0x5865f2,
              fields: [
                { name: 'Task ID', value: `${task.id}`, inline: true },
                { name: 'Board ID', value: `${values.card.boardId}`, inline: true },
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

      await sails.helpers.cards.updateMeta.with({ id: task.cardId, currentUser, skipMetaUpdate });
    }

    return task;
  },
};
