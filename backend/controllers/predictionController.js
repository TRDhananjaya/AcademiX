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
    const quizResults = await QuizResult.find(matchStage).sort({ submittedAt: 1 });

    // Fetch followups - case-insensitive
    const followupResults = await FollowupResult.find({
        studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') }
    }).sort({ submittedAt: -1 });

    let m1 = 70, m2 = 75, m3 = 80, followup = 85;

    if (quizResults.length > 0) {
        m1 = quizResults[0] ? quizResults[0].percentage || (quizResults[0].score / 20) * 100 : m1;
        m2 = quizResults[1] ? quizResults[1].percentage || (quizResults[1].score / 20) * 100 : m1;
        m3 = quizResults[2] ? quizResults[2].percentage || (quizResults[2].score / 20) * 100 : (m1 + m2) / 2;
    }

    if (followupResults.length > 0) {
        followup = followupResults[0]?.percentage || followup;
    } else if (quizResults.length > 3) {
        followup = quizResults[3] ? quizResults[3].percentage || (quizResults[3].score / 20) * 100 : m3;
    }

    const avg = (m1 + m2 + m3) / 3;

    return {
        Module_1_Score: m1,
        Module_2_Score: m2,
        Module_3_Score: m3,
        Avg_Module_Score: avg,
        Followup_Quiz_Score: followup,
        quizzesAnalyzed: quizResults.length
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

        let predictedScore = 75; // Heuristic fallback score
        let mlSuccess = false;

        try {
            const mlResponse = await fetch('https://academix-ml-3of1.onrender.com/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(features),
                signal: AbortSignal.timeout(1500) // 1.5 seconds timeout
            });

            if (mlResponse.ok) {
                const mlData = await mlResponse.json();
                predictedScore = mlData.predicted_score;
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
        }

        const predictedMarks = parseFloat(((predictedScore / 100) * 25).toFixed(1));

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
