module.exports = {
  inputs: {
    currentUser: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    trelloBoard: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    const trelloTo4gaBoardsLabels = {};

    const getTrelloLists = () => inputs.trelloBoard.lists.filter((list) => !list.closed);

    const getUsedTrelloLabels = () => {
      const result = {};
      inputs.trelloBoard.cards
        .map((card) => card.labels)
        .flat()
        .forEach((label) => {
          result[label.id] = label;
        });

      return Object.values(result);
    };

    const getTrelloCardsOfList = (listId) => inputs.trelloBoard.cards.filter((card) => card.idList === listId && !card.closed);

    const getAllTrelloCheckItemsOfCard = (cardId) =>
      inputs.trelloBoard.checklists
        .filter((checklist) => checklist.idCard === cardId)
        .map((checklist) => checklist.checkItems)
        .flat();

    const getTrelloCommentsOfCard = (cardId) => inputs.trelloBoard.actions.filter((action) => action.type === Action.Types.CARD_COMMENT && action.data && action.data.card && action.data.card.id === cardId);

    const get4gaBoardsLabelColor = (trelloLabelColor) => Label.COLORS.find((color) => color.indexOf(trelloLabelColor) !== -1) || 'desert-sand';

    const importCardLabels = async (boardsCard, trelloCard) => {
      return Promise.all(
        trelloCard.labels.map(async (trelloLabel) => {
          return CardLabel.create({
            cardId: boardsCard.id,
            labelId: trelloTo4gaBoardsLabels[trelloLabel.id].id,
            createdById: currentUser.id,
          });
        }),
      );
    };

    const importTasks = async (boardsCard, trelloCard) => {
      // TODO find workaround for tasks/checklist mismapping, see issue trello2planka#5
      return Promise.all(
        getAllTrelloCheckItemsOfCard(trelloCard.id).map(async (trelloCheckItem) => {
          return Task.create({
            cardId: boardsCard.id,
            position: trelloCheckItem.pos,
            name: trelloCheckItem.name,
            isCompleted: trelloCheckItem.state === 'complete',
            createdById: currentUser.id,
          }).fetch();
        }),
      );
    };

    const importComments = async (boardsCard, trelloCard) => {
      const trelloComments = getTrelloCommentsOfCard(trelloCard.id);
      trelloComments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return Promise.all(
        trelloComments.map(async (trelloComment) => {
          return Action.create({
            cardId: boardsCard.id,
            userId: currentUser.id,
            type: Action.Types.CARD_COMMENT,
            data: {
              text:
                `${trelloComment.data.text}\n\n---\n*Note: imported comment, originally posted by ` +
                `\n${trelloComment.memberCreator.fullName} (${trelloComment.memberCreator.username}) on ${trelloComment.date}*`,
            },
            createdById: currentUser.id,
          }).fetch();
        }),
      );
    };

    const importCards = async (boardsList, trelloList) => {
      return Promise.all(
        getTrelloCardsOfList(trelloList.id).map(async (trelloCard) => {
          const boardsCard = await Card.create({
            boardId: inputs.board.id,
            listId: boardsList.id,
            createdById: currentUser.id,
            position: trelloCard.pos,
            name: trelloCard.name,
            description: trelloCard.desc || null,
            dueDate: trelloCard.due,
            priority: null, // Trello doesn't have priority, set to null
            effort: null, // Trello doesn't have effort, set to null
            commentCount: 0,
          }).fetch();

          await importCardLabels(boardsCard, trelloCard);
          await importTasks(boardsCard, trelloCard);
          await importComments(boardsCard, trelloCard);

          const commentCount = await Action.count({ cardId: boardsCard.id, type: Action.Types.CARD_COMMENT });
          await Card.update({ id: boardsCard.id }).set({ commentCount });

          return boardsCard;
        }),
      );
    };

    const importLabels = async () => {
      return Promise.all(
        getUsedTrelloLabels().map(async (trelloLabel, index) => {
          const boardsLabel = await Label.create({
            boardId: inputs.board.id,
            name: trelloLabel.name || null,
            color: get4gaBoardsLabelColor(trelloLabel.color),
            position: sails.config.custom.positionGap * (index + 1),
            createdById: currentUser.id,
          }).fetch();

          trelloTo4gaBoardsLabels[trelloLabel.id] = boardsLabel;
        }),
      );
    };

    const importLists = async () => {
      return Promise.all(
        getTrelloLists().map(async (trelloList) => {
          const boardsList = await List.create({
            boardId: inputs.board.id,
            name: trelloList.name,
            position: trelloList.pos,
            isCollapsed: false,
            createdById: currentUser.id,
          }).fetch();

          return importCards(boardsList, trelloList);
        }),
      );
    };

    await importLabels();
    await importLists();
  },
};
