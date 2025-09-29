/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /**
   *
   * Default policy for all controllers and actions, unless overridden.
   * (`true` allows public access)
   *
   */
  // '*': true,
  '*': 'is-authenticated',

  'users/create': ['is-authenticated', 'is-admin'],
  'users/delete': ['is-authenticated', 'is-admin'],

  // Allow public access to homepage and auth routes
  'GET /': true,
  'POST /auth/login': true,
  'POST /auth/logout': true,
  AuthController: {
    login: true,
    logout: true,
    '*': true,
  },
  'view-homepage': true,
  'access-tokens/create': true,
  'core/show': true,
  'auth/*': true,
  'register/create': true,
};
