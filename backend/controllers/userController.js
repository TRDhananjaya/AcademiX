const User = require('../models/User');

/**
 * @desc    Get all users by role
 * @route   GET /api/users/students
 * @access  Public (for now)
 */
const getStudents = async (req, res) => {
	try {
		const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
		res.status(200).json(students);
	} catch (error) {
		console.error('Get students error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	getStudents,
};
