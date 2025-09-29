const passport = require('passport');

module.exports = {
  friendlyName: 'Auth Controller',
  description: 'Handle authentication actions.',

  async login(req, res) {
    const { emailAddress } = req.body;

    try {
      // Look up by the email address
      const userRecord = await User.findOne({
        email: emailAddress.toLowerCase(),
      });

      // If there was no matching user, respond with unauthorized
      if (!userRecord) {
        return res.status(401).json({
          message: 'Invalid email address or password.',
        });
      }

      // For development, let's skip password checking for now
      // TODO: Implement proper password checking
      // await sails.helpers.passwords.checkPassword(password, userRecord.password);

      // Set the session
      req.session.userId = userRecord.id;

      // Return user data without password
      return res.json({
        user: _.omit(userRecord, 'password'),
      });
    } catch (error) {
      sails.log.error('Login error:', error);
      return res.status(500).json({
        message: 'An error occurred during login.',
      });
    }
  },

  async logout(req, res) {
    // Clear the session
    req.session.userId = null;

    return res.json({
      message: 'Successfully logged out.',
    });
  },

  // Placeholder methods for OAuth - you can implement these later
  async google(req, res) {
    return res.status(501).json({ message: 'Google OAuth not implemented yet' });
  },

  async googleCallback(req, res) {
    return res.status(501).json({ message: 'Google OAuth callback not implemented yet' });
  },

  async github(req, res) {
    return res.status(501).json({ message: 'GitHub OAuth not implemented yet' });
  },

  async githubCallback(req, res) {
    return res.status(501).json({ message: 'GitHub OAuth callback not implemented yet' });
  },

  async microsoft(req, res) {
    return res.status(501).json({ message: 'Microsoft OAuth not implemented yet' });
  },

  async microsoftCallback(req, res) {
    return res.status(501).json({ message: 'Microsoft OAuth callback not implemented yet' });
  },
};
