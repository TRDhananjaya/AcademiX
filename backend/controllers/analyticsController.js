const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');
const Student = require('../models/Student');
const Quiz = require('../models/Quiz');
const CommunityPost = require('../models/CommunityPost');
const Attendance = require('../models/Attendance');
const Lesson = require('../models/Lesson');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

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

        // Parallelize total count, paginated records, and summary stats
        const [totalRecords, rawRecords, stats] = await Promise.all([
            QuizResult.countDocuments(query),
            QuizResult.find(query)
                .sort({ score: -1, submittedAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-answersDetails')
                .lean(),
            (quizId && quizId !== 'All Quizzes')
                ? QuizResult.aggregate([
                    { $match: { quizId: quizId } },
                    { $group: {
                        _id: null,
                        totalStudents: { $sum: 1 },
                        highestScore: { $max: '$score' },
                        lowestScore: { $min: '$score' },
                        averageScore: { $avg: '$score' }
                    }}
                ])
                : Promise.resolve([])
        ]);

        // Attach student grade efficiently without heavy unprojected joins
        const sIds = [...new Set(rawRecords.map(r => r.studentId).filter(Boolean))];
        const studentDocs = sIds.length > 0
            ? await Student.find({ studentId: { $in: sIds } }).select('studentId grade').lean()
            : [];
        const gradeMap = {};
        studentDocs.forEach(s => { gradeMap[s.studentId] = s.grade; });

        const records = rawRecords.map(r => ({
            ...r,
            grade: gradeMap[r.studentId] || 'N/A'
        }));

        // Calculate summary stats
        let summary = null;
        if (quizId && quizId !== 'All Quizzes' && stats.length > 0) {
            summary = {
                totalStudents: stats[0].totalStudents,
                highestScore: stats[0].highestScore,
                lowestScore: stats[0].lowestScore,
                averageScore: stats[0].averageScore
            };
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
        const targetStudentId = studentId.trim();
        const mainQuizzes = await QuizResult.aggregate([
            { $match: { studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } } },
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
            { $match: { studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } } },
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
        const totalSystemLessons = (await Lesson.countDocuments()) || 6;

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
                totalLessons: totalSystemLessons,
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

        // 1. Build Quiz Result Aggregation Stages
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
                lessonName: { $ifNull: ["$quizData.bundleTopic", "Unknown Lesson"] },
                quizTitle: { $ifNull: ["$quizData.title", "$quizId"] }
            }}
        ];

        if (moduleQuery && moduleQuery !== 'All Modules') {
            aggregationStages.push({ $match: { lessonName: moduleQuery } });
        }

        // 2. Fetch all independent dashboard data in parallel to eliminate multi-second latency
        const [
            totalStudents,
            activeStudents,
            inactiveStudents,
            activeModules,
            allQuizResults,
            atRiskPredictions,
            students,
            recentPosts
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: { $ne: 'Inactive' } }),
            Student.countDocuments({ status: 'Inactive' }),
            Quiz.countDocuments(),
            QuizResult.aggregate(aggregationStages),
            Prediction.aggregate([
                { $match: { lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } } },
                { $sort: { createdAt: -1 } },
                { $group: { _id: { studentId: "$studentId", lessonId: "$lessonId" }, latestPrediction: { $first: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestPrediction" } },
                { $match: { predictedScore: { $lt: 50 }, teacherMet: { $ne: true } } },
                { $project: { studentId: 1 } }
            ]),
            Student.find({ status: { $ne: 'Inactive' } }, 'studentId name initials status').sort({ name: 1 }).lean(),
            CommunityPost.find({}, 'title body authorName replies needsTeacherInput createdAt').sort({ createdAt: -1 }).limit(2).lean()
        ]);
        
        let classAverage = 0;
        let overallPassRate = 0;
        let totalQuizzesSubmitted = allQuizResults.length;
        if (allQuizResults.length > 0) {
            const sum = allQuizResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
            classAverage = Math.round(sum / allQuizResults.length);
            
            const passedCount = allQuizResults.filter(r => (r.percentage || 0) >= 50).length;
            overallPassRate = Math.round((passedCount / allQuizResults.length) * 100);
        }

        const atRiskCount = new Set(atRiskPredictions.map(p => p.studentId ? p.studentId.toString() : null).filter(Boolean)).size;
        const mlRiskCount = atRiskPredictions.length;

        // 3. Group quiz results by studentId (lowercase)
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

        // 4. Map recent community posts
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
                authorName: post.authorName || post.author || 'Student Member',
                role: post.role || post.authorRole || 'Student',
                category: post.category || post.topic || 'Grade 10 ICT',
                repliesCount,
                needsTeacherInput: post.needsTeacherInput || false,
                time: timeStr
            };
        });

        // 5. Generate predictive insights dynamically
        const lessonMap = {};
        allQuizResults.forEach(r => {
            const lesson = r.lessonName && r.lessonName !== 'Unknown Lesson' ? r.lessonName : (r.quizId ? r.quizId.split('.')[0] : 'General');
            if (!lessonMap[lesson]) {
                lessonMap[lesson] = { totalPct: 0, count: 0 };
            }
            lessonMap[lesson].totalPct += r.percentage;
            lessonMap[lesson].count += 1;
        });

        let weakestLesson = '--';
        let lowestLessonAvg = 101;
        let strongestLesson = '--';
        let highestLessonAvg = -1;
        
        Object.keys(lessonMap).forEach(lesson => {
            const avg = lessonMap[lesson].totalPct / lessonMap[lesson].count;
            if (avg < lowestLessonAvg) {
                lowestLessonAvg = avg;
                weakestLesson = lesson;
            }
            if (avg > highestLessonAvg) {
                highestLessonAvg = avg;
                strongestLesson = lesson;
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

        if (mlRiskCount > 0) {
            insights.push({
                type: 'intervention-alert',
                title: `Intervention Alert: ${mlRiskCount} Underperforming Record(s)`,
                description: `There are ${mlRiskCount} unresolved underperforming lesson predictions. Immediate intervention is highly recommended.`,
                actionText: 'View Intervention Alerts'
            });
        }

        // 9. Compute Recent Quizzes
        const quizStatsMap = {};
        allQuizResults.forEach(r => {
            const qId = r.quizId || 'Unknown';
            if (!quizStatsMap[qId]) {
                quizStatsMap[qId] = {
                    quizCode: qId,
                    title: (r.quizTitle || qId).replace(/^Q\d+\.\d+\s*-\s*/, '').replace(/\s*Random Quiz/gi, '').trim() || qId,
                    topic: r.lessonName || 'General',
                    submissions: 0,
                    totalPercentage: 0,
                    passedCount: 0,
                    highestScore: 0,
                    lowestScore: 100,
                    lastSubmittedAt: null
                };
            }
            const q = quizStatsMap[qId];
            q.submissions += 1;
            const pct = typeof r.percentage === 'number' ? r.percentage : 0;
            q.totalPercentage += pct;
            if (pct >= 50) q.passedCount += 1;
            if (pct > q.highestScore) q.highestScore = pct;
            if (pct < q.lowestScore) q.lowestScore = pct;
            if (!q.lastSubmittedAt || new Date(r.submittedAt) > new Date(q.lastSubmittedAt)) {
                q.lastSubmittedAt = r.submittedAt;
            }
        });

        const recentQuizzesList = Object.values(quizStatsMap)
            .map(q => ({
                quizCode: q.quizCode,
                title: q.title,
                topic: q.topic,
                submissions: q.submissions,
                averageScore: q.submissions > 0 ? Math.round(q.totalPercentage / q.submissions) : 0,
                passRate: q.submissions > 0 ? Math.round((q.passedCount / q.submissions) * 100) : 0,
                highestScore: q.highestScore,
                lowestScore: q.lowestScore === 100 && q.submissions === 0 ? 0 : q.lowestScore,
                lastSubmittedAt: q.lastSubmittedAt
            }))
            .sort((a, b) => new Date(b.lastSubmittedAt || 0) - new Date(a.lastSubmittedAt || 0));

        // 10. Compute Curriculum Topic Mastery Breakdown
        const topicStatsMap = {};
        allQuizResults.forEach(r => {
            const topic = r.lessonName || 'General';
            if (!topicStatsMap[topic]) {
                topicStatsMap[topic] = {
                    topic,
                    topicShort: topic.replace(/^Lesson \d+:\s*/i, '').trim(),
                    quizzes: new Set(),
                    totalSubmissions: 0,
                    totalPercentage: 0,
                    passedCount: 0,
                    studentScores: {}
                };
            }
            const t = topicStatsMap[topic];
            if (r.quizId) t.quizzes.add(r.quizId);
            t.totalSubmissions += 1;
            const pct = typeof r.percentage === 'number' ? r.percentage : 0;
            t.totalPercentage += pct;
            if (pct >= 50) t.passedCount += 1;

            if (r.studentId) {
                const s = r.studentId.toLowerCase();
                if (!t.studentScores[s]) t.studentScores[s] = [];
                t.studentScores[s].push(pct);
            }
        });

        const topicMastery = Object.values(topicStatsMap)
            .filter(t => t.topic !== 'Unknown Lesson' || Object.keys(topicStatsMap).length === 1)
            .map(t => {
            const avg = t.totalSubmissions > 0 ? Math.round(t.totalPercentage / t.totalSubmissions) : 0;
            const passRate = t.totalSubmissions > 0 ? Math.round((t.passedCount / t.totalSubmissions) * 100) : 0;

            let strugglingCount = 0;
            Object.values(t.studentScores).forEach(scores => {
                const sAvg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
                if (sAvg < 50) strugglingCount += 1;
            });

            let status = 'Mastered';
            let statusColor = 'emerald';
            let recommendation = 'Class is demonstrating solid mastery on this topic.';

            if (avg < 60) {
                status = 'Needs Attention';
                statusColor = 'rose';
                recommendation = `${strugglingCount} student(s) below 50%. Suggest targeted review session.`;
            } else if (avg < 75) {
                status = 'Moderate';
                statusColor = 'amber';
                recommendation = 'Moderate understanding. Additional practice questions recommended.';
            }

            return {
                topic: t.topic,
                topicShort: t.topicShort,
                quizzesCount: t.quizzes.size,
                submissionsCount: t.totalSubmissions,
                averageScore: avg,
                passRate,
                strugglingCount,
                status,
                statusColor,
                recommendation
            };
        }).sort((a, b) => a.averageScore - b.averageScore);

        // Apply pagination for quizzes feed
        const totalQuizzesCount = recentQuizzesList.length;
        const paginatedRecentQuizzes = recentQuizzesList.slice(skip, skip + limit);

        // Apply pagination for legacy student tracker
        const totalRecords = studentTrackerList.length;
        const paginatedTracker = studentTrackerList.slice(skip, skip + limit);

        // 11. Get today's attendance count (distinct students checked in today)
        let todayPresentCount = 0;
        try {
            const TIMEZONE = process.env.TIMEZONE || 'Asia/Colombo';
            const colomboDateStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: TIMEZONE,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date());
            const [year, month, day] = colomboDateStr.split('-').map(Number);
            const targetDateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
            const targetDateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

            const attendanceFilter = {
                status: 'Present',
                $or: [
                    { date: { $gte: targetDateStart, $lte: targetDateEnd } },
                    { createdAt: { $gte: targetDateStart, $lte: targetDateEnd } }
                ]
            };
            const distinctPresentStudents = await Attendance.distinct('student', attendanceFilter);
            todayPresentCount = distinctPresentStudents.length;
        } catch (attErr) {
            console.warn('Could not fetch attendance count:', attErr.message);
        }

        res.status(200).json({
            metrics: {
                totalStudents,
                activeStudents,
                inactiveStudents,
                totalQuizzes: activeModules,
                classAverage,
                atRiskCount,
                todayPresentCount,
                studentsWithQuizzesCount: Object.keys(resultsByStudent).length,
                totalQuizzesSubmitted,
                overallPassRate,
                strongestLesson: Object.keys(lessonMap).length > 0 ? strongestLesson : '--',
                weakestLesson: Object.keys(lessonMap).length > 0 ? weakestLesson : '--',
                strongestLessonAvg: Object.keys(lessonMap).length > 0 ? Math.round(highestLessonAvg) : 0,
                weakestLessonAvg: Object.keys(lessonMap).length > 0 ? Math.round(lowestLessonAvg) : 0
            },
            insights,
            communityActivity,
            recentQuizzes: paginatedRecentQuizzes,
            allRecentQuizzes: recentQuizzesList,
            topicMastery,
            studentTracker: paginatedTracker,
            pagination: {
                totalRecords: totalQuizzesCount,
                currentPage: page,
                totalPages: Math.ceil(totalQuizzesCount / limit) || 1,
                limit
            },
            studentPagination: {
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

// @desc    Get intervention alerts for Admin
// @route   GET /api/analytics/intervention
// @access  Private (Teacher)
const getAdminInterventionAlerts = async (req, res, next) => {
    try {
        const latestPredictions = await Prediction.aggregate([
            {
                $match: {
                    lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: { studentId: "$studentId", lessonId: "$lessonId" },
                    latestPrediction: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestPrediction" }
            },
            {
                $match: {
                    predictedScore: { $lt: 50 },
                    teacherMet: { $ne: true }
                }
            }
        ]);

        const predictions = await Prediction.populate(latestPredictions, { path: 'studentId', select: 'studentId name' });

        const defaultLessonNames = {
            1: "Information and Communication Technology",
            2: "Fundamentals of a Computer System",
            3: "Data Representation Methods in Computer Systems",
            4: "Logic Gates with Boolean Functions",
            5: "Operating Systems",
            6: "Word Processing",
            7: "Electronic Spreadsheet",
            8: "Electronic Presentations",
            9: "Database"
        };

        const allLessons = await Lesson.find({}).select('title lessonNumber _id').lean().catch(() => []);
        const lessonMap = {};
        for (const l of allLessons) {
            const formatted = l.title.toLowerCase().startsWith('lesson') ? l.title : `Lesson ${l.lessonNumber} - ${l.title}`;
            lessonMap[l.lessonNumber] = formatted;
            if (l._id) lessonMap[l._id.toString()] = formatted;
        }

        const studentMap = {};

        for (const pred of predictions) {
            if (!pred.studentId) continue;
            const sId = pred.studentId.studentId;
            const sName = pred.studentId.name;
            
            let num = parseInt(pred.lessonId, 10);
            if (isNaN(num)) {
                const match = pred.lessonId?.toString().match(/^[QL](\d+)/i);
                if (match) num = parseInt(match[1], 10);
            }

            let lName = `Lesson ${pred.lessonId}`;
            if (!isNaN(num) && lessonMap[num]) {
                lName = lessonMap[num];
            } else if (pred.lessonId && lessonMap[pred.lessonId.toString()]) {
                lName = lessonMap[pred.lessonId.toString()];
            } else if (!isNaN(num) && defaultLessonNames[num]) {
                lName = `Lesson ${num} - ${defaultLessonNames[num]}`;
            }
            
            if (!studentMap[sId]) {
                studentMap[sId] = {
                    studentId: sId,
                    studentName: sName,
                    lessons: []
                };
            }
            
            studentMap[sId].lessons.push({
                lessonId: pred.lessonId,
                lessonName: lName,
                predictedPercentage: pred.predictedScore,
                _id: pred._id
            });
        }

        const students = Object.values(studentMap);
        
        students.sort((a, b) => {
            const idA = a.studentId ? a.studentId.toLowerCase() : '';
            const idB = b.studentId ? b.studentId.toLowerCase() : '';
            return idA.localeCompare(idB);
        });
        
        res.status(200).json({
            count: students.length,
            students
        });
    } catch (error) {
        console.error('Admin Intervention Error:', error);
        res.status(500).json({ message: 'Failed to fetch intervention alerts', error: error.message });
    }
};

// @desc    Get intervention alerts for a specific student
// @route   GET /api/analytics/intervention/student/:studentId
// @access  Private (Student/Teacher)
const getStudentInterventionAlerts = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        
        const student = await Student.findOne({ studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const predictions = await Prediction.aggregate([
            {
                $match: {
                    studentId: student._id,
                    lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: { lessonId: "$lessonId" },
                    latestPrediction: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestPrediction" }
            },
            {
                $match: {
                    predictedScore: { $lt: 50 }
                }
            }
        ]);

        const defaultLessonNames = {
            1: "Information and Communication Technology",
            2: "Fundamentals of a Computer System",
            3: "Data Representation Methods in Computer Systems",
            4: "Logic Gates with Boolean Functions",
            5: "Operating Systems",
            6: "Word Processing",
            7: "Electronic Spreadsheet",
            8: "Electronic Presentations",
            9: "Database"
        };

        const allLessons = await Lesson.find({}).select('title lessonNumber _id').lean().catch(() => []);
        const lessonMap = {};
        for (const l of allLessons) {
            const formatted = l.title.toLowerCase().startsWith('lesson') ? l.title : `Lesson ${l.lessonNumber} - ${l.title}`;
            lessonMap[l.lessonNumber] = formatted;
            if (l._id) lessonMap[l._id.toString()] = formatted;
        }

        const alerts = [];
        for (const pred of predictions) {
            let num = parseInt(pred.lessonId, 10);
            if (isNaN(num)) {
                const match = pred.lessonId?.toString().match(/^[QL](\d+)/i);
                if (match) num = parseInt(match[1], 10);
            }

            let lName = `Lesson ${pred.lessonId}`;
            if (!isNaN(num) && lessonMap[num]) {
                lName = lessonMap[num];
            } else if (pred.lessonId && lessonMap[pred.lessonId.toString()]) {
                lName = lessonMap[pred.lessonId.toString()];
            } else if (!isNaN(num) && defaultLessonNames[num]) {
                lName = `Lesson ${num} - ${defaultLessonNames[num]}`;
            }
            
            alerts.push({
                lessonId: pred.lessonId,
                lessonName: lName,
                predictedPercentage: pred.predictedScore
            });
        }

        res.status(200).json({ alerts });
    } catch (error) {
        console.error('Student Intervention Error:', error);
        res.status(500).json({ message: 'Failed to fetch intervention alerts', error: error.message });
    }
};

// @desc    Resolve intervention alert (mark as teacher met)
// @route   PUT /api/analytics/intervention/:predictionId/resolve
// @access  Private (Teacher)
const resolveIntervention = async (req, res, next) => {
    try {
        const { predictionId } = req.params;

        const prediction = await Prediction.findById(predictionId);
        
        if (!prediction) {
            return res.status(404).json({ message: 'Prediction not found' });
        }

        prediction.teacherMet = true;
        prediction.teacherMetAt = new Date();
        prediction.teacherMetBy = req.user._id;

        await prediction.save();

        res.json({ message: 'Intervention resolved successfully' });
    } catch (error) {
        console.error('Resolve Intervention Error:', error);
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
    getTeacherDashboardStats,
    getAdminInterventionAlerts,
    getStudentInterventionAlerts,
    resolveIntervention
};
