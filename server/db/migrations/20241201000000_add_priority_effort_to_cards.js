/**
 * Add priority and effort fields to card table
 */

module.exports = {
  up: async (knex) => {
    return knex.schema.table('card', (table) => {
      table.string('priority').nullable();
      table.integer('effort').nullable();
      table.index(['priority']);
    });
  },

  down: async (knex) => {
    return knex.schema.table('card', (table) => {
      table.dropColumn('priority');
      table.dropColumn('effort');
    });
  },
};
