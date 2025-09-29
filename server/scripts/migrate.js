/**
 * Module dependencies
 */

module.exports = {
  friendlyName: 'Run database migrations',
  description: 'Run any pending database migrations.',

  fn: async function () {
    sails.log('Running database migrations...');

    try {
      // Check if the migration has already been run
      const tableExists = await sails.sendNativeQuery(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'card'
          AND column_name = 'priority'
        );
      `);

      if (tableExists.rows[0].exists) {
        sails.log('Migration already applied - priority and effort columns exist.');
        return;
      }

      // Run the migration to add priority and effort columns
      await sails.sendNativeQuery(`
        ALTER TABLE card
        ADD COLUMN IF NOT EXISTS priority VARCHAR(10),
        ADD COLUMN IF NOT EXISTS effort INTEGER;
      `);

      // Add index on priority
      await sails.sendNativeQuery(`
        CREATE INDEX IF NOT EXISTS idx_card_priority ON card(priority);
      `);

      sails.log('Successfully added priority and effort columns to card table.');

    } catch (error) {
      sails.log.error('Migration failed:', error);
      throw error;
    }
  }
};
