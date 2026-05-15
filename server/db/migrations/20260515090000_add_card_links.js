module.exports.up = (knex) =>
  knex.schema.createTable('card_link', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('linked_card_id').notNullable();
    table.text('type').notNullable();

    table.bigInteger('created_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'linked_card_id', 'type']);
    table.index('linked_card_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('card_link');
