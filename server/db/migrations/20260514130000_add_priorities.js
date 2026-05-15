module.exports.up = async (knex) => {
  await knex.schema.createTable('priority', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();
    table.text('color').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('position');
  });

  await knex.schema.alterTable('card', (table) => {
    table.bigInteger('priority_id');
    table.index('priority_id');
  });

  await knex.schema.alterTable('task', (table) => {
    table.bigInteger('priority_id');
    table.index('priority_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('task', (table) => {
    table.dropColumn('priority_id');
  });

  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('priority_id');
  });

  await knex.schema.dropTable('priority');
};
