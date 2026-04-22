/**
 * adminAuth middleware
 * Checks Authorization: Bearer <ADMIN_SECRET_KEY> on all /api/admin/* routes.
 * No JWT, no login endpoint — matches spec exactly.
 */
exports.adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin access denied. No authorization header.' });
  }

  const key = authHeader.slice(7); // strip "Bearer "
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ success: false, message: 'Invalid admin secret key.' });
  }

  next();
};
