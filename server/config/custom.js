/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {
  // Base URL for the application
  baseUrl: process.env.BASE_URL || 'http://localhost:1337',

  // Email settings
  mailgunDomain: process.env.MAILGUN_DOMAIN || '',
  mailgunSecret: process.env.MAILGUN_SECRET || '',

  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB

  // Position gap for ordering
  positionGap: 65536,

  // OAuth settings
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',

  microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
  microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',

  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',

  // Session settings
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-key',

  // Default admin user
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@localhost',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',

  // Database settings
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/lrs_kanban',
};
