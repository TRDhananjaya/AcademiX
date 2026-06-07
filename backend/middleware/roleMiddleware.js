/**
 * Restrict access to specific roles.
 * Must be used AFTER authMiddleware (requires req.user).
 *
 * @param  {...string} roles - Allowed roles (e.g., 'teacher', 'student')
 * @returns {Function} Express middleware
 *
 * Usage: router.get('/admin', authMiddleware, roleMiddleware('teacher'), handler)
 */
function roleMiddleware(...roles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Not authorized' });
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				message: `Access denied. Required role: ${roles.join(' or ')}`,
			});
		}

		next();
	};
}

module.exports = { roleMiddleware };
