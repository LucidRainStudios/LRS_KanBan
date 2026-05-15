/**
 * CardLink.js
 *
 * @description :: A user-declared relationship between two cards. The link is stored from the
 *                 perspective of the card it was added on (`cardId`); the inverse direction is
 *                 inferred at render time. Two link types: REFERENCES (informational) and
 *                 BLOCKED_BY (this card is blocked by `linkedCardId`).
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Types = {
  REFERENCES: 'references',
  BLOCKED_BY: 'blockedBy',
};

module.exports = {
  Types,

  tableName: 'card_link',

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    type: {
      type: 'string',
      isIn: Object.values(Types),
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    linkedCardId: {
      model: 'Card',
      required: true,
      columnName: 'linked_card_id',
    },
    createdById: {
      model: 'User',
      columnName: 'created_by_id',
    },
  },
};
