const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user.
 * @param {string} id   - The user's MongoDB _id
 * @param {string} role - The user's role (student | teacher)
 * @returns {string} Signed JWT
 */
function generateToken(id, role) {
	return jwt.sign({ id, role }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});
}

module.exports = { generateToken };
