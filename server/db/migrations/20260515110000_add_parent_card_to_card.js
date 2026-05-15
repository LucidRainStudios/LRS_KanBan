module.exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.bigInteger('parent_card_id');
    table.index('parent_card_id');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('parent_card_id');
  });
