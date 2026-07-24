const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');

// Helper function to calculate features
const calculateFeatures = async (studentId, lessonId) => {
    // Fetch quizzes matching lesson - case-insensitive lookup
    const targetStudentId = studentId ? studentId.toLowerCase() : '';
    const matchStage = lessonId 
        ? { quizId: { $regex: `^${lessonId}` }, studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } } 
        : { studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } };
    
    // Sort by submittedAt descending to get the latest attempt first
    const quizResults = await QuizResult.find(matchStage).sort({ submittedAt: -1 });

    // Fetch followups - case-insensitive
    const followupResults = await FollowupResult.find({
        studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') }
    }).sort({ submittedAt: -1 });

    let m1 = 70, m2 = 75, m3 = 80, followup = 85;

    // Group by unique quizId taking the latest score
    const latestQuizzes = {};
    for (const result of quizResults) {
        if (!latestQuizzes[result.quizId]) {
            latestQuizzes[result.quizId] = result.percentage || (result.score / 20) * 100;
        }
    }

    const uniqueQuizIds = Object.keys(latestQuizzes).sort(); // Order Q1.1, Q1.2, Q1.3
    
    if (uniqueQuizIds.length > 0) m1 = latestQuizzes[uniqueQuizIds[0]];
    if (uniqueQuizIds.length > 1) m2 = latestQuizzes[uniqueQuizIds[1]];
    if (uniqueQuizIds.length > 2) m3 = latestQuizzes[uniqueQuizIds[2]];

    let hasFollowup = false;
    if (followupResults.length > 0) {
        followup = followupResults[0]?.percentage || followup;
        hasFollowup = true;
    } else if (uniqueQuizIds.length > 3) {
        followup = latestQuizzes[uniqueQuizIds[3]];
        hasFollowup = true;
    }

    const avg = (m1 + m2 + m3) / 3;
    const totalQuizzesAnalyzed = uniqueQuizIds.length + (hasFollowup && followupResults.length > 0 ? 1 : 0);

    return {
        Module_1_Score: m1,
        Module_2_Score: m2,
        Module_3_Score: m3,
        Avg_Module_Score: avg,
        Followup_Quiz_Score: followup,
        quizzesAnalyzed: totalQuizzesAnalyzed
    };
};

// @desc    Generate a prediction for a student using ML service
// @route   POST /api/predictions/predict
// @access  Public
const generatePrediction = async (req, res, next) => {
    try {
        const { studentId, lessonId } = req.body;
        // Case-insensitive lookup on student record
        const student = await Student.findOne({ 
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } 
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const featuresData = await calculateFeatures(studentId, lessonId);
        const { quizzesAnalyzed, ...features } = featuresData;

        // Call ML Service using Node.js built-in fetch
        if (quizzesAnalyzed === 0) {
            return res.status(400).json({ error: "Not enough data available to generate prediction." });
        }

        const mlFeatures = {
            Module_1_Score: features.Module_1_Score / 4,
            Module_2_Score: features.Module_2_Score / 4,
            Module_3_Score: features.Module_3_Score / 4,
            Avg_Module_Score: features.Avg_Module_Score / 4,
            Followup_Quiz_Score: features.Followup_Quiz_Score / 4,
            LessonID: lessonId ? lessonId.replace('Q', 'L') : ''
        };

        let predictedScore = 75; // Heuristic fallback score (out of 100)
        let predictedMarks = 18.75; // out of 25
        let mlSuccess = false;

        try {
            const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict';
            const mlResponse = await fetch(mlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mlFeatures),
                signal: AbortSignal.timeout(1500) // 1.5 seconds timeout
            });

            if (mlResponse.ok) {
                const mlData = await mlResponse.json();
                predictedMarks = parseFloat(mlData.predicted_score.toFixed(1));
                predictedScore = (predictedMarks / 25) * 100;
                mlSuccess = true;
            } else {
                console.warn(`ML Service returned status ${mlResponse.status}. Using fallback prediction.`);
            }
        } catch (mlErr) {
            console.warn('ML Service offline or timed out. Using fallback heuristic prediction:', mlErr.message);
        }

        // Fallback heuristic scoring
        if (!mlSuccess) {
            const avg = features.Avg_Module_Score || 70;
            const followup = features.Followup_Quiz_Score || 75;
            predictedScore = Math.min(100, Math.max(0, parseFloat((avg * 0.75 + followup * 0.25).toFixed(1))));
            predictedMarks = parseFloat(((predictedScore / 100) * 25).toFixed(1));
        }

        const prediction = await Prediction.create({
            studentId: student._id,
            lessonId: lessonId || 'General',
            features: features,
            predictedScore: predictedScore
        });

        const improvementPercentage = features.Avg_Module_Score > 0
            ? ((features.Followup_Quiz_Score - features.Avg_Module_Score) / features.Avg_Module_Score) * 100
            : 0;

        res.status(201).json({
            studentName: student.name || 'Unknown',
            lesson: lessonId || 'General',
            predictedMarks: predictedMarks,
            totalMarks: 25,
            prediction,
            quizzesAnalyzed,
            averageQuizMarks: features.Avg_Module_Score,
            followupScore: features.Followup_Quiz_Score,
            improvementPercentage: improvementPercentage
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
    }
};

module.exports = {
    generatePrediction
};
