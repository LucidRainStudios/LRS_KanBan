module.exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.integer('attachment_count').notNullable().defaultTo(0);
  }).raw(`
    UPDATE card
      SET attachment_count = (
        SELECT COUNT(*) FROM attachment WHERE card_id = card.id
      )
  `);

module.exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('attachment_count');
  });
