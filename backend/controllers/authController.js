const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Validate required fields
		if (!username || !password) {
			return res.status(400).json({
				message: 'Please provide username and password',
			});
		}

		// Find user by username and explicitly select the password field
		const user = await User.findOne({ username }).select('+password');

		if (!user) {
			return res.status(401).json({ message: 'Invalid username or password' });
		}

		// Check password
		const isMatch = await user.matchPassword(password);

		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid username or password' });
		}

		// Generate token and respond
		const token = generateToken(user._id, user.role);

		res.json({
			_id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName,
			token,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
	try {
		// req.user is set by authMiddleware (password already excluded)
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({
			_id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName,
		});
	} catch (error) {
		console.error('GetMe error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = { loginUser, getMe };
