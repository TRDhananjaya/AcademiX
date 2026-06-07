const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT from Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 */
async function authMiddleware(req, res, next) {
	let token;

	// Check for Bearer token in Authorization header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Attach user to request (password excluded by default via select: false)
		req.user = await User.findById(decoded.id);

		if (!req.user) {
			return res.status(401).json({ message: 'Not authorized, user not found' });
		}

		next();
	} catch (error) {
		console.error('Auth middleware error:', error.message);
		return res.status(401).json({ message: 'Not authorized, token invalid' });
	}
}

module.exports = { authMiddleware };
