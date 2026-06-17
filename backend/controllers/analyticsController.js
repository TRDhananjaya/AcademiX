const QuizResult = require('../models/QuizResult');

// @desc    Get Analytics Records
// @route   GET /api/analytics
// @access  Public
const getAnalytics = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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

        // Get the total count for pagination
        const totalRecords = await QuizResult.countDocuments(query);

        // Fetch paginated records using aggregation to lookup student grade
        const records = await QuizResult.aggregate([
            { $match: query },
            { $sort: { submittedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: 'studentId',
                as: 'studentData'
            }},
            { $unwind: { path: '$studentData', preserveNullAndEmptyArrays: true } },
            { $addFields: { grade: '$studentData.grade' } },
            { $project: { studentData: 0 } }
        ]);

        // Calculate summary stats
        let summary = null;
        if (quizId && quizId !== 'All Quizzes') {
            const stats = await QuizResult.aggregate([
                { $match: { quizId: quizId } },
                { $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    highestScore: { $max: '$score' },
                    lowestScore: { $min: '$score' },
                    averageScore: { $avg: '$score' }
                }}
            ]);
            if (stats.length > 0) {
                summary = {
                    totalStudents: stats[0].totalStudents,
                    highestScore: stats[0].highestScore,
                    lowestScore: stats[0].lowestScore,
                    averageScore: stats[0].averageScore
                };
            }
        }

        res.status(200).json({
            records,
            summary,
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

// @desc    Get available quizzes
// @route   GET /api/analytics/quizzes
// @access  Public
const getAvailableQuizzes = async (req, res, next) => {
    try {
        const quizzes = await QuizResult.distinct('quizId');
        res.status(200).json({ quizzes });
    } catch (error) {
        console.error('Get Quizzes Error:', error);
        next(error);
    }
};

// @desc    Get available lessons
// @route   GET /api/analytics/lessons
// @access  Public
const getAvailableLessons = async (req, res, next) => {
    try {
        const quizzes = await QuizResult.distinct('quizId');
        // Extract prefixes like Q1 from Q1.1
        const lessons = [...new Set(quizzes.map(q => {
            const parts = q.split('.');
            return parts[0];
        }))].sort();
        res.status(200).json({ lessons });
    } catch (error) {
        console.error('Get Lessons Error:', error);
        next(error);
    }
};

// @desc    Get student performance across a lesson
// @route   GET /api/analytics/student-performance
// @access  Public
const getStudentPerformance = async (req, res, next) => {
    try {
        const { lessonId, studentName } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!lessonId) {
            return res.status(400).json({ error: 'lessonId is required' });
        }

        // Match quizzes starting with lessonId (e.g., Q1)
        const matchStage = {
            quizId: { $regex: `^${lessonId}` }
        };

        const records = await QuizResult.aggregate([
            { $match: matchStage },
            { $group: {
                _id: '$studentId',
                studentName: { $first: '$studentName' },
                quizzesAttempted: { $sum: 1 },
                averageScore: { $avg: '$score' },
                highestScore: { $max: '$score' },
                lowestScore: { $min: '$score' }
            }},
            { $sort: { averageScore: -1 } } // Sort for ranking
        ]);

        // Add rank and filter by studentName if needed
        let rankedRecords = records.map((record, index) => ({
            studentId: record._id,
            studentName: record.studentName,
            quizzesAttempted: record.quizzesAttempted,
            averageScore: record.averageScore,
            highestScore: record.highestScore,
            lowestScore: record.lowestScore,
            rank: index + 1
        }));

        if (studentName && studentName.trim() !== '') {
            const regex = new RegExp(studentName, 'i');
            rankedRecords = rankedRecords.filter(r => regex.test(r.studentName));
        }

        // Calculate lesson summary stats based on ALL students before pagination
        let summary = null;
        if (records.length > 0) {
            const highestStudentAvg = records[0].averageScore; // Already sorted
            const lowestStudentAvg = records[records.length - 1].averageScore;
            const classAverage = records.reduce((sum, r) => sum + r.averageScore, 0) / records.length;

            summary = {
                totalStudents: records.length,
                highestStudentAverage: highestStudentAvg,
                lowestStudentAverage: lowestStudentAvg,
                classAverage: classAverage
            };
        }

        // Pagination
        const totalRecords = rankedRecords.length;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedRecords = rankedRecords.slice(startIndex, endIndex);

        res.status(200).json({
            records: paginatedRecords,
            summary,
            pagination: {
                totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
                perPage: limit
            }
        });
    } catch (error) {
        console.error('Student Performance Error:', error);
        next(error);
    }
};

module.exports = {
    getAnalytics,
    getAvailableQuizzes,
    getAvailableLessons,
    getStudentPerformance
};
