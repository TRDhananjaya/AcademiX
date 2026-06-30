const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');
const Student = require('../models/Student');
const Quiz = require('../models/Quiz');
const CommunityPost = require('../models/CommunityPost');

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
            { $sort: { score: -1, submittedAt: -1 } },
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

// @desc    Get all distinct students
// @route   GET /api/analytics/students
// @access  Public
const getAllStudents = async (req, res, next) => {
    try {
        const students = await QuizResult.aggregate([
            { $group: {
                _id: "$studentId",
                studentName: { $first: "$studentName" }
            }},
            { $sort: { studentName: 1 } }
        ]);
        
        res.status(200).json({ students: students.map(s => ({ id: s._id, name: s.studentName })) });
    } catch (error) {
        console.error('Get Students Error:', error);
        next(error);
    }
};

// @desc    Get analytics for a specific individual student
// @route   GET /api/analytics/student/:studentId
// @access  Public
const getIndividualStudentAnalytics = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({ error: 'studentId is required' });
        }

        // 1. Fetch Main Quizzes
        const mainQuizzes = await QuizResult.aggregate([
            { $match: { studentId } },
            { $lookup: {
                from: 'quizzes',
                localField: 'quizId',
                foreignField: 'quizCode',
                as: 'quizData'
            }},
            { $unwind: { path: '$quizData', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 1,
                quizId: 1,
                studentId: 1,
                studentName: 1,
                score: 1,
                totalQuestions: { $ifNull: ["$totalQuestions", 20] },
                percentage: 1,
                status: 1,
                submittedAt: 1,
                quizType: "Main Quiz",
                lessonName: { $ifNull: ["$quizData.bundleTopic", "Unknown Lesson"] },
                moduleName: { $ifNull: ["$quizData.title", "Unknown Module"] },
                quizName: { $ifNull: ["$quizData.quizCode", "$quizId"] }
            }}
        ]);

        // 2. Fetch Follow-up Quizzes
        const followupQuizzes = await FollowupResult.aggregate([
            { $match: { studentId } },
            { $lookup: {
                from: 'followup_quizzes',
                localField: 'quizId',
                foreignField: '_id',
                as: 'quizData'
            }},
            { $unwind: { path: '$quizData', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 1,
                quizId: 1,
                studentId: 1,
                studentName: 1,
                score: 1,
                totalQuestions: { $ifNull: ["$totalQuestions", 20] },
                percentage: 1,
                status: 1,
                submittedAt: 1,
                quizType: "Follow-up Quiz",
                lessonName: { $ifNull: ["$quizData.bundleTopic", "Unknown Lesson"] },
                moduleName: { $ifNull: ["$quizData.title", "Unknown Module"] },
                quizName: { $ifNull: ["$quizData.quizCode", "Unknown Quiz"] }
            }}
        ]);

        // 3. Unify Data
        const combinedHistory = [...mainQuizzes, ...followupQuizzes].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        // 4. Calculate Lesson-wise averages
        const lessonMap = {};
        combinedHistory.forEach(record => {
            const lesson = record.lessonName || "Unknown Lesson";
            if (lesson !== "Unknown Lesson") {
                if (!lessonMap[lesson]) {
                    lessonMap[lesson] = { totalPercentage: 0, count: 0 };
                }
                lessonMap[lesson].totalPercentage += record.percentage;
                lessonMap[lesson].count += 1;
            }
        });

        const trendData = Object.keys(lessonMap).map(lesson => {
            const avg = lessonMap[lesson].totalPercentage / lessonMap[lesson].count;
            return {
                lesson,
                percentage: parseFloat(avg.toFixed(1)),
                quizzesTaken: lessonMap[lesson].count
            };
        });

        // 5. Calculate Strengths & Weaknesses
        const strengths = trendData.filter(t => t.percentage >= 75).map(t => t.lesson);
        const weaknesses = trendData.filter(t => t.percentage < 50).map(t => t.lesson);

        const strongestLesson = trendData.length > 0 ? trendData.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current) : null;
        const weakestLesson = trendData.length > 0 ? trendData.reduce((prev, current) => (prev.percentage < current.percentage) ? prev : current) : null;
        
        const highestScoreObj = combinedHistory.length > 0 ? combinedHistory.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current) : null;
        const lowestScoreObj = combinedHistory.length > 0 ? combinedHistory.reduce((prev, current) => (prev.percentage < current.percentage) ? prev : current) : null;

        const overallPercentage = combinedHistory.length > 0 ? combinedHistory.reduce((sum, h) => sum + h.percentage, 0) / combinedHistory.length : 0;

        res.status(200).json({
            studentId,
            studentName: combinedHistory.length > 0 ? combinedHistory[0].studentName : 'Unknown',
            history: combinedHistory,
            trendData,
            summary: {
                totalQuizzes: combinedHistory.length,
                totalMainQuizzes: mainQuizzes.length,
                totalFollowupQuizzes: followupQuizzes.length,
                overallAverage: parseFloat(overallPercentage.toFixed(1)),
                highestScore: highestScoreObj ? highestScoreObj.percentage : 0,
                lowestScore: lowestScoreObj ? lowestScoreObj.percentage : 0,
                lessonsCompleted: trendData.length,
                strongestLesson: strongestLesson ? strongestLesson.lesson : 'N/A',
                weakestLesson: weakestLesson ? weakestLesson.lesson : 'N/A',
                strengths,
                weaknesses
            }
        });
    } catch (error) {
        console.error('Individual Student Analytics Error:', error);
        next(error);
    }
};

// @desc    Get stats and student tracker data for Teacher Dashboard
// @route   GET /api/analytics/teacher-dashboard
// @access  Private
const getTeacherDashboardStats = async (req, res, next) => {
    try {
        const { module: moduleQuery } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5; // Default 5 items per page
        const skip = (page - 1) * limit;

        // 1. Get total students count
        const totalStudents = await Student.countDocuments({ status: { $ne: 'Inactive' } });

        // 2. Get active modules count
        const activeModules = await Quiz.countDocuments();

        // 3. Get quiz results using aggregation to map the lessonName (bundleTopic)
        const aggregationStages = [
            { $lookup: {
                from: 'quizzes',
                localField: 'quizId',
                foreignField: 'quizCode',
                as: 'quizData'
            }},
            { $unwind: { path: '$quizData', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 1,
                quizId: 1,
                studentId: 1,
                studentName: 1,
                score: 1,
                correctAnswers: 1,
                totalQuestions: 1,
                percentage: 1,
                submittedAt: 1,
                lessonName: { $ifNull: ["$quizData.bundleTopic", "Unknown Lesson"] }
            }}
        ];

        if (moduleQuery && moduleQuery !== 'All Modules') {
            aggregationStages.push({ $match: { lessonName: moduleQuery } });
        }

        const allQuizResults = await QuizResult.aggregate(aggregationStages);
        
        let classAverage = 0;
        if (allQuizResults.length > 0) {
            const sum = allQuizResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
            classAverage = Math.round(sum / allQuizResults.length);
        }

        // 4. Get at-risk students count
        const atRiskCount = await Student.countDocuments({ status: 'At Risk' });

        // 5. Group quiz results by studentId (lowercase)
        const resultsByStudent = {};
        allQuizResults.forEach(result => {
            if (!result.studentId) return;
            const sId = result.studentId.toLowerCase();
            if (!resultsByStudent[sId]) {
                resultsByStudent[sId] = [];
            }
            resultsByStudent[sId].push(result);
        });

        // Sort each student's results by submittedAt descending
        Object.keys(resultsByStudent).forEach(sId => {
            resultsByStudent[sId].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        });

        // 6. Fetch all active/at-risk students to populate student tracker
        const students = await Student.find({ status: { $ne: 'Inactive' } }).sort({ name: 1 });

        const studentTrackerList = students.map(student => {
            const usernameLower = student.studentId ? student.studentId.toLowerCase() : '';
            const results = resultsByStudent[usernameLower] || [];

            let recentScore = null;
            let averageScore = 0;
            let trend = [0, 0, 0, 0];
            let improvement = 0;

            if (results.length > 0) {
                recentScore = results[0].percentage;
                const totalPct = results.reduce((sum, r) => sum + (r.percentage || 0), 0);
                averageScore = Math.round(totalPct / results.length);

                // Get last 4 quiz percentages (oldest to newest)
                const lastQuizzes = results.slice(0, 4).reverse();
                trend = lastQuizzes.map(q => q.percentage);
                while (trend.length < 4) {
                    trend.unshift(0);
                }

                // Calculate improvement compared to the previous quiz
                if (results.length > 1) {
                    improvement = results[0].percentage - results[1].percentage;
                }
            }

            // Determine status based on performance if not set or just reflect model status
            let displayStatus = student.status || 'Active';
            if (results.length > 0 && averageScore < 50) {
                displayStatus = 'At Risk';
            }

            return {
                id: student._id,
                studentId: student.studentId,
                name: student.name,
                initials: student.initials || student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                recentScore,
                averageScore,
                improvement,
                trend,
                status: displayStatus
            };
        });

        // 7. Get recent community posts needing guidance/activity
        const recentPosts = await CommunityPost.find()
            .sort({ createdAt: -1 })
            .limit(2);

        const communityActivity = recentPosts.map(post => {
            const repliesCount = post.replies ? post.replies.length : 0;
            const minsAgo = Math.floor((Date.now() - new Date(post.createdAt)) / 60000);
            let timeStr = 'Recently';
            if (minsAgo < 60) {
                timeStr = `${minsAgo}m ago`;
            } else if (minsAgo < 1440) {
                timeStr = `${Math.floor(minsAgo / 60)}h ago`;
            } else {
                timeStr = `${Math.floor(minsAgo / 1440)}d ago`;
            }

            return {
                id: post._id,
                title: post.title,
                body: post.body,
                authorName: post.authorName,
                repliesCount,
                needsTeacherInput: post.needsTeacherInput || false,
                time: timeStr
            };
        });

        // 8. Generate predictive insights dynamically
        const lessonMap = {};
        allQuizResults.forEach(r => {
            const lesson = r.quizId ? r.quizId.split('.')[0] : 'General';
            if (!lessonMap[lesson]) {
                lessonMap[lesson] = { totalPct: 0, count: 0 };
            }
            lessonMap[lesson].totalPct += r.percentage;
            lessonMap[lesson].count += 1;
        });

        let weakestLesson = 'Advanced Calculus';
        let lowestLessonAvg = 100;
        Object.keys(lessonMap).forEach(lesson => {
            const avg = lessonMap[lesson].totalPct / lessonMap[lesson].count;
            if (avg < lowestLessonAvg) {
                lowestLessonAvg = avg;
                weakestLesson = lesson;
            }
        });

        const insights = [
            {
                type: 'midterm-projection',
                title: 'Midterm Exam Prediction',
                description: `Based on current trajectory, the class average is projected to be ${classAverage > 0 ? classAverage : 82}%. Suggest reviewing "${weakestLesson}" to boost scores.`,
                actionRecommended: true
            }
        ];

        if (atRiskCount > 0) {
            insights.push({
                type: 'intervention-alert',
                title: `Intervention Alert: ${atRiskCount} At-Risk Student(s)`,
                description: `${atRiskCount} student(s) show dropping performance or are flagged. Immediate intervention is highly recommended.`,
                actionText: 'Message Students'
            });
        } else if (studentTrackerList.filter(s => s.status === 'At Risk').length > 0) {
            const riskCount = studentTrackerList.filter(s => s.status === 'At Risk').length;
            insights.push({
                type: 'intervention-alert',
                title: `Intervention Alert: ${riskCount} Student(s) Underperforming`,
                description: `${riskCount} student(s) have a quiz average below 50%. Suggest sending review materials.`,
                actionText: 'Message Students'
            });
        }

        // Apply pagination
        const totalRecords = studentTrackerList.length;
        const paginatedTracker = studentTrackerList.slice(skip, skip + limit);

        res.status(200).json({
            metrics: {
                totalStudents,
                activeModules,
                classAverage,
                atRiskCount
            },
            insights,
            communityActivity,
            studentTracker: paginatedTracker,
            pagination: {
                totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Teacher Dashboard Stats Error:', error);
        next(error);
    }
};

module.exports = {
    getAnalytics,
    getAvailableQuizzes,
    getAvailableLessons,
    getStudentPerformance,
    getAllStudents,
    getIndividualStudentAnalytics,
    getTeacherDashboardStats
};
