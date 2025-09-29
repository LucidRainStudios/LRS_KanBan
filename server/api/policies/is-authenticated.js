/**
 * is-authenticated
 *
 * A simple policy that allows any authenticated user.
 */

module.exports = async function isAuthenticated(req, res, proceed) {
  // If there's no user ID in the session, they're not authenticated
  if (!req.session.userId) {
    // Check for access token in headers
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.slice(7);

      try {
        // Find the access token in the database
        const accessToken = await AccessToken.findOne({ id: token }).populate('userId');

        if (accessToken && accessToken.userId) {
          // Set the current user for this request
          req.currentUser = accessToken.userId;
          return proceed();
        }
      } catch {
        // Token validation failed
      }
    }

    // If we get here, they're not authenticated
    return res.status(401).json({
      message: 'You are not permitted to perform this action. Please log in first.',
    });
  }

  // Look up the user record from the database
  const user = await User.findOne({ id: req.session.userId });

  if (!user) {
    return res.status(401).json({
      message: 'Your session is no longer valid. Please log in again.',
    });
  }

  // Attach the user record to the request object so it can be accessed in actions
  req.currentUser = user;

  // Continue to the next policy or action
  return proceed();
};
