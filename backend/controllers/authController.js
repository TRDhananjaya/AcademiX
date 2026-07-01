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
			profilePicture: user.profilePicture,
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
			profilePicture: user.profilePicture,
		});
	} catch (error) {
		console.error('GetMe error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
	try {
		const { username, email, password, role, firstName, lastName } = req.body;

		// Validate required fields
		if (!username || !email || !password) {
			return res.status(400).json({ message: 'Please provide username, email and password' });
		}

		// Check if user exists
		const userExists = await User.findOne({ $or: [{ email }, { username }] });

		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create user
		const user = await User.create({
			username,
			email,
			password,
			role: role || 'student',
			firstName: firstName || '',
			lastName: lastName || '',
		});

		if (user) {
			res.status(201).json({
				_id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				firstName: user.firstName,
				lastName: user.lastName,
				token: generateToken(user._id, user.role),
			});
		} else {
			res.status(400).json({ message: 'Invalid user data' });
		}
	} catch (error) {
		console.error('Register error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Update fields if provided
		if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
		if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
		
		if (req.body.email !== undefined) {
			const email = req.body.email.toLowerCase();
			if (email !== user.email) {
				const emailExists = await User.findOne({ email });
				if (emailExists) {
					return res.status(400).json({ message: 'Email is already in use' });
				}
			}
			user.email = email;
		}

		if (req.body.password) {
			if (req.body.password.length < 6) {
				return res.status(400).json({ message: 'Password must be at least 6 characters' });
			}
			user.password = req.body.password;
		}

		if (req.body.profilePicture !== undefined) {
			user.profilePicture = req.body.profilePicture;
		}

		await user.save();

		res.json({
			_id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			firstName: user.firstName,
			lastName: user.lastName,
			profilePicture: user.profilePicture,
		});
	} catch (error) {
		console.error('UpdateProfile error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

/**
 * @desc    Verify identity for password reset (username + email)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
	try {
		const { username, email } = req.body;

		if (!username || !email) {
			return res.status(400).json({ message: 'Please provide both username and email' });
		}

		// Find user matching BOTH username and email
		const user = await User.findOne({
			username: username.trim(),
			email: email.trim().toLowerCase(),
		});

		if (!user) {
			return res.status(404).json({ message: 'No account found with that username and email combination' });
		}

		// Generate a short-lived reset token (5 minutes)
		const jwt = require('jsonwebtoken');
		const resetToken = jwt.sign(
			{ id: user._id, purpose: 'password-reset' },
			process.env.JWT_SECRET,
			{ expiresIn: '5m' }
		);

		res.json({
			message: 'Identity verified. You can now reset your password.',
			resetToken,
		});
	} catch (error) {
		console.error('ForgotPassword error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public (with valid reset token)
 */
const resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(400).json({ message: 'Please provide token and new password' });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters' });
		}

		// Verify the reset token
		const jwt = require('jsonwebtoken');
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return res.status(400).json({ message: 'Reset link has expired. Please try again.' });
		}

		// Ensure this token was issued for password reset
		if (decoded.purpose !== 'password-reset') {
			return res.status(400).json({ message: 'Invalid reset token' });
		}

		// Find user and update password
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		user.password = newPassword; // Will be hashed by the pre-save hook
		await user.save();

		res.json({ message: 'Password has been reset successfully' });
	} catch (error) {
		console.error('ResetPassword error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = { loginUser, getMe, registerUser, updateProfile, forgotPassword, resetPassword };
