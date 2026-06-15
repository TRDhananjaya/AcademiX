const QuizResult = require('../models/QuizResult');

// @desc    Get Analytics Records
// @route   GET /api/analytics
// @access  Public
const getAnalytics = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { quizId, studentName } = req.query;

        // Build query object
        const query = {};
        if (quizId && quizId !== 'All Quizzes') {
            query.quizId = quizId;
        }
        if (studentName && studentName.trim() !== '') {
            query.studentName = { $regex: studentName, $options: 'i' };
        }

        // Fetch paginated records using simple find
        const records = await QuizResult.find(query)
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get the total count for pagination
        const totalRecords = await QuizResult.countDocuments(query);

        res.status(200).json({
            records,
            pagination: {
                totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
                perPage: limit
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        next(error);
    }
};

module.exports = {
    getAnalytics
};
