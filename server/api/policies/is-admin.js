/**
 * is-admin
 *
 * A policy that only allows admin users.
 */

module.exports = async function isAdmin(req, res, proceed) {
  // Make sure the user is authenticated first
  if (!req.currentUser) {
    return res.status(401).json({
      message: 'You are not permitted to perform this action. Please log in first.',
    });
  }

  // Check if the user is an admin
  if (!req.currentUser.isAdmin) {
    return res.status(403).json({
      message: 'You are not permitted to perform this action. Admin access required.',
    });
  }

  // Continue to the next policy or action
  return proceed();
};
