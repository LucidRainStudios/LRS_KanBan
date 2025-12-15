const moment = require('moment');

const truncate = (value, max = 1024) => (value.length > max ? `${value.slice(0, max - 3)}...` : value);

module.exports = {
  inputs: {
    task: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ task, card, currentUser }) {
    const { boardLinks } = await sails.helpers.integrations.discord.getConfig();

    const tasks = await sails.helpers.cards.getTasks(card.id);
    const totalTasks = tasks.length;
    const openTasks = tasks.filter((record) => !record.isCompleted).length;
    const taskLines = tasks
      .map((record) => {
        const prefix = record.isCompleted ? '[x]' : '[ ]';
        return `${prefix} ${record.name}`;
      })
      .filter(Boolean);

    const labels = await sails.helpers.cards.getLabels(card.id);
    const labelNames = labels.map((label) => label.name).filter(Boolean);

    const memberships = await sails.helpers.cardMemberships.getMany({ cardId: card.id });
    const memberUserIds = memberships.map((membership) => membership.userId);
    const memberUsers = memberUserIds.length ? await User.find({ id: memberUserIds }) : [];
    const assignedUsers =
      memberUsers.length > 0
        ? memberUsers.map((user) => user.name || user.username || user.email || `${user.id}`).join(', ')
        : 'Unassigned';

    const boardLink = boardLinks[String(card.boardId)] || `https://kanban.lucidrainstudios.com/boards/${card.boardId}`;
    const cardLink = boardLink.includes('/boards/')
      ? boardLink.replace(/\/boards\/[^/]+/, `/cards/${card.id}`)
      : `https://kanban.lucidrainstudios.com/cards/${card.id}`;

    const dueDate = card.dueDate ? moment(card.dueDate) : null;
    const isOverdue = dueDate ? dueDate.isBefore(moment()) : false;
    const dueDateValue = dueDate ? `${dueDate.format('YYYY-MM-DD HH:mm')} (${dueDate.fromNow()})${isOverdue ? ' ⚠️ Overdue' : ''}` : 'None';

    return {
      username: 'LRS Kanban',
      embeds: [
        {
          title: `Task created: ${task.name}`,
          color: 0x5865f2,
          fields: [
            { name: 'Title', value: task.name || '-' },
            { name: 'Description', value: truncate(card.description || '-') },
            { name: 'Tasks', value: taskLines.length ? truncate(taskLines.join('\n')) : 'None' },
            { name: 'Progress', value: `${openTasks} open / ${totalTasks} total` },
            { name: 'Assigned User(s)', value: assignedUsers },
            { name: 'Labels', value: labelNames.length ? labelNames.join(', ') : 'None' },
            { name: 'Due Date', value: dueDateValue },
            { name: 'Card', value: `[Open Card](${cardLink})` },
            { name: 'Board', value: `[Open Board](${boardLink})` },
            { name: 'Created By', value: currentUser.name || currentUser.username || currentUser.email || `${currentUser.id}` },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },
};
