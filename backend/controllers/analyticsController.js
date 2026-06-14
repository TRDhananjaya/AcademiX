const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');

// @desc    Get Analytics Dashboard Data
// @route   GET /api/analytics
// @access  Public
const getAnalyticsDashboard = async (req, res, next) => {
    try {
        const students = await Student.find();
        const quizResults = await QuizResult.find();
        const allFollowupResults = await FollowupResult.find();

        let totalScore = 0;
        let completedCount = 0;
        let scoreDistribution = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0
        };

        const studentsData = [];
        const mlPromises = [];

        for (const student of students) {
            // Find this student's quizzes exclusively by the unique studentId
            const studentQuizzes = quizResults.filter(qr => 
                qr.studentId === student.studentId
            ).sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

            const studentFollowups = allFollowupResults.filter(fr => 
                fr.studentId === student.studentId
            ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            // Default mock data in case of missing quizzes
            let m1 = 70, m2 = 75, m3 = 80, followup = 85;
            let currentScore = null;
            let status = 'Pending';
            let timeTaken = '--';

            if (studentQuizzes.length > 0) {
                m1 = studentQuizzes[0]?.percentage || m1;
                m2 = studentQuizzes[1]?.percentage || m1;
                m3 = studentQuizzes[2]?.percentage || (m1 + m2) / 2;
                
                if (studentFollowups.length > 0) {
                    followup = studentFollowups[0]?.percentage || followup;
                } else if (studentQuizzes.length > 3) {
                    followup = studentQuizzes[3]?.percentage || m3;
                }
                
                const latestQuiz = studentQuizzes[studentQuizzes.length - 1];
                currentScore = latestQuiz.percentage;
                status = 'Completed';
                timeTaken = latestQuiz.timeTaken || '45 mins';
                
                totalScore += currentScore;
                completedCount++;

                // Score distribution logic
                if (currentScore <= 20) scoreDistribution['0-20']++;
                else if (currentScore <= 40) scoreDistribution['21-40']++;
                else if (currentScore <= 60) scoreDistribution['41-60']++;
                else if (currentScore <= 80) scoreDistribution['61-80']++;
                else scoreDistribution['81-100']++;
            }

            const avg = (m1 + m2 + m3) / 3;
            const features = {
                Module_1_Score: m1,
                Module_2_Score: m2,
                Module_3_Score: m3,
                Avg_Module_Score: avg,
                Followup_Quiz_Score: followup
            };

            const mlPromise = fetch('http://127.0.0.1:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(features)
            })
            .then(res => res.json())
            .then(data => ({
                student: student,
                predictedScore: data.predicted_score,
                currentScore
            }))
            .catch(err => ({
                student: student,
                predictedScore: null,
                currentScore
            }));

            mlPromises.push(mlPromise);

            // Populate table roster data
            studentsData.push({
                id: student.initials || student.name?.substring(0, 2).toUpperCase() || 'ST',
                name: student.name || 'Unknown',
                score: currentScore,
                time: timeTaken,
                status: status,
                color: student.color || 'bg-slate-300'
            });
        }

        const mlResults = await Promise.all(mlPromises);

        // Filter students needing intervention
        const interventionRecommended = mlResults
            .filter(res => res.predictedScore !== null && res.predictedScore < 70)
            .map(res => ({
                name: res.student.name || 'Unknown',
                predictedScore: Math.round(res.predictedScore),
                currentScore: res.currentScore
            }))
            .slice(0, 5); // Limit to top 5 for UI

        const classAverage = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
        const completionRate = students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0;

        const formattedDistribution = Object.keys(scoreDistribution).map(key => ({
            range: key,
            count: scoreDistribution[key]
        }));

        res.status(200).json({
            classAverage,
            completionRate,
            completedCount,
            totalStudents: students.length,
            scoreDistribution: formattedDistribution,
            interventionRecommended,
            studentsData
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        next(error);
    }
};

module.exports = {
    getAnalyticsDashboard
};
