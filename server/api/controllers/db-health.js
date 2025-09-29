module.exports = {
  friendlyName: 'Database health check',
  description: 'Check if the database connection is working.',
  exits: {
    success: {
      description: 'Database is healthy.',
    },
    serverError: {
      description: 'Database connection failed.',
    },
  },
  async fn() {
    try {
      // Try a simple query to test database connection
      await sails.sendNativeQuery('SELECT 1 as test');
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      sails.log.error('Database health check failed:', error);
      throw 'serverError';
    }
  },
};
