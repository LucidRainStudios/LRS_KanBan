const moment = require('moment');

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
    previousListName: {
      type: 'string',
    },
    tasks: {
      type: 'ref',
    },
    labels: {
      type: 'ref',
    },
    listName: {
      type: 'string',
    },
  },

  async fn({ card, currentUser, actionLabel, color, previousListName, tasks: providedTasks, labels: providedLabels, listName }) {
    const { boardLinks } = await sails.helpers.integrations.discord.getConfig();
    let list;
    if (listName) {
      list = { name: listName };
    } else {
      try {
        ({ list } = await sails.helpers.cards.getProjectPath(card.id));
      } catch (error) {
        list = await List.findOne({ id: card.listId });
      }
    }

    const tasks = providedTasks || (await sails.helpers.cards.getTasks(card.id));
    const totalTasks = tasks.length;
    const openTasks = tasks.filter((task) => !task.isCompleted).length;
    const taskLines = tasks
      .map((task) => {
        const prefix = task.isCompleted ? '[x]' : '[ ]';
        return `${prefix} ${task.name}`;
      })
      .filter(Boolean);

    const labels = providedLabels || (await sails.helpers.cards.getLabels(card.id));
    const labelNames = labels.map((label) => label.name).filter(Boolean);

    const memberships = await sails.helpers.cardMemberships.getMany({ cardId: card.id });
    const memberUserIds = memberships.map((membership) => membership.userId);
    const memberUsers = memberUserIds.length ? await User.find({ id: memberUserIds }) : [];
    const assignedUsers =
      memberUsers.length > 0
        ? memberUsers.map((user) => user.name || user.username || user.email || `${user.id}`).join(', ')
        : 'Unassigned';

    const board = await Board.findOne({ id: card.boardId });
    const boardName = board?.name || 'Board';
    const boardLink = boardLinks[String(card.boardId)] || `https://kanban.lucidrainstudios.com/boards/${card.boardId}`;
    const cardLink = boardLink.includes('/boards/')
      ? boardLink.replace(/\/boards\/[^/]+/, `/cards/${card.id}`)
      : `https://kanban.lucidrainstudios.com/cards/${card.id}`;

    const dueDate = card.dueDate ? moment(card.dueDate) : null;
    const isOverdue = dueDate ? dueDate.isBefore(moment()) : false;
    const dueDateValue = dueDate ? `${dueDate.format('YYYY-MM-DD HH:mm')} (${dueDate.fromNow()})${isOverdue ? ' ⚠️Overdue' : ''}` : 'None';

    const currentState = list?.name || 'Unknown';
    const stateFieldValue =
      previousListName && previousListName !== currentState ? `${previousListName} → ${currentState}` : currentState;

    const labelsLine = `Labels: ${labelNames.length ? labelNames.join(', ') : 'None'}`;
    const progressLine = `Progress: ${openTasks} open / ${totalTasks} total`;
    const details = truncate([labelsLine, progressLine].join('\n'));

    return {
      username: 'LRS Kanban',
      embeds: [
        {
          title: `[${actionLabel}] ${card.name}`,
          url: cardLink,
          description: card.description || '-',
          color,
          fields: [
            {
              name:  `📋Board: ${boardName}`,
              value: details,
            },
            { name: '👤Assigned User(s)', value: `__**${assignedUsers}**__`, inline: true },
            { name: '🚦Current State', value: stateFieldValue, inline: true },
            { name: '⏱️Due Date', value: dueDateValue, inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },
};
