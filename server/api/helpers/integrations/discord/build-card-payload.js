const truncate = (value, max = 1024) => (value.length > max ? `${value.slice(0, max - 3)}...` : value);

module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    actionLabel: {
      type: 'string',
      required: true,
    },
    color: {
      type: 'number',
      required: true,
    },
  },

  async fn({ card, currentUser, actionLabel, color }) {
    const { boardLinks } = await sails.helpers.integrations.discord.getConfig();
    const { list } = await sails.helpers.cards.getProjectPath(card.id);

    const tasks = await sails.helpers.cards.getTasks(card.id);
    const taskLines = tasks
      .map((task) => {
        const prefix = task.isCompleted ? '[x]' : '[ ]';
        return `${prefix} ${task.name}`;
      })
      .filter(Boolean);

    const memberships = await sails.helpers.cardMemberships.getMany({ cardId: card.id });
    const memberUserIds = memberships.map((membership) => membership.userId);
    const memberUsers = memberUserIds.length ? await User.find({ id: memberUserIds }) : [];
    const assignedUsers =
      memberUsers.length > 0
        ? memberUsers.map((user) => user.name || user.username || user.email || `${user.id}`).join(', ')
        : 'Unassigned';

    const boardLink = boardLinks[String(card.boardId)] || `https://kanban.lucidrainstudios.com/boards/${card.boardId}`;

    return {
      username: 'LRS Kanban',
      embeds: [
        {
          title: `${actionLabel}: ${card.name}`,
          color,
          fields: [
            { name: 'Title', value: card.name || '-' },
            { name: 'Description', value: truncate(card.description || '-') },
            {
              name: 'Tasks',
              value: taskLines.length ? truncate(taskLines.join('\n')) : 'None',
            },
            { name: 'Assigned User(s)', value: assignedUsers },
            { name: 'Board', value: `[Open Board](${boardLink})` },
            {
              name: `${actionLabel} By`,
              value: currentUser.name || currentUser.username || currentUser.email || `${currentUser.id}`,
            },
            { name: 'Current State', value: list?.name || 'Unknown' },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },
};
