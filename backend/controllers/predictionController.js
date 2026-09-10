const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');

const lessonMaxMarks = {
    1: 50, 2: 50, 3: 20, 4: 35, 5: 45, 6: 20, 7: 25, 8: 35, 9: 20
};

// Helper function to extract lesson number from string (e.g., '6a33c6b4d67ba7d81f63916b' or 'L1')
// Since AcademiX uses MongoDB object IDs for lessons but Q1.1 for quizzes, let's extract the lesson number from the Qx.y format or fallback.
const getLessonNumber = (lessonId) => {
    if (!lessonId) return 1;
    const match = lessonId.match(/^[QL](\d+)/i);
    if (match) return parseInt(match[1]);
    return 1; // Default fallback
};

// Helper function to calculate features
const calculateFeatures = async (studentId, lessonId) => {
    const targetStudentId = studentId ? studentId.toLowerCase() : '';
    
    // In AcademiX, quizId is usually like Q1.1, Q1.2... so we match the prefix.
    const prefix = lessonId ? (lessonId.startsWith('Q') ? lessonId.split('.')[0] : `Q${getLessonNumber(lessonId)}`) : 'Q1';
    
    const matchStage = { 
        quizId: { $regex: `^${prefix}\\.`, $options: 'i' }, 
        studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } 
    };
    
    const quizResults = await QuizResult.find(matchStage).sort({ submittedAt: -1 });

    const followupResults = await FollowupResult.find({
        studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') }
    }).sort({ submittedAt: -1 });

    let q1 = 0, q2 = 0, q3 = 0, followup = 0;
    
    const latestQuizzes = {};
    for (const result of quizResults) {
        if (!latestQuizzes[result.quizId]) {
            latestQuizzes[result.quizId] = result.percentage || (result.score / 20) * 100;
        }
    }

    const uniqueQuizIds = Object.keys(latestQuizzes).sort(); 
    
    if (uniqueQuizIds.length > 0) q1 = latestQuizzes[uniqueQuizIds[0]];
    if (uniqueQuizIds.length > 1) q2 = latestQuizzes[uniqueQuizIds[1]];
    if (uniqueQuizIds.length > 2) q3 = latestQuizzes[uniqueQuizIds[2]];

    let hasFollowup = false;
    if (followupResults.length > 0) {
        followup = followupResults[0]?.percentage || followup;
        hasFollowup = true;
    } else if (uniqueQuizIds.length > 3) {
        followup = latestQuizzes[uniqueQuizIds[3]];
        hasFollowup = true;
    }

    const avg = uniqueQuizIds.length > 0 ? (q1 + q2 + q3) / Math.min(3, uniqueQuizIds.length) : 0;
    const totalQuizzesAnalyzed = uniqueQuizIds.length + (hasFollowup ? 1 : 0);

    return {
        Quiz_1_Score: q1,
        Quiz_2_Score: q2,
        Quiz_3_Score: q3,
        Quiz_Average: avg,
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
        const student = await Student.findOne({ 
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } 
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const featuresData = await calculateFeatures(studentId, lessonId);
        const { quizzesAnalyzed, ...features } = featuresData;

        // Strict validation: Need all 3 quizzes + 1 followup
        if (quizzesAnalyzed < 4) {
            return res.status(400).json({ error: "INSUFFICIENT_DATA", message: "Student must complete all 3 module quizzes and the follow-up quiz for this lesson to generate a prediction." });
        }

        const mlFeatures = {
            Quiz_1_Score: features.Quiz_1_Score,
            Quiz_2_Score: features.Quiz_2_Score,
            Quiz_3_Score: features.Quiz_3_Score,
            Quiz_Average: features.Quiz_Average,
            Followup_Quiz_Score: features.Followup_Quiz_Score
        };

        const lessonNum = getLessonNumber(lessonId);
        const lessonMaxMark = lessonMaxMarks[lessonNum] || 50;

        let predictedPercentage = 0;
        let mlSuccess = false;

        try {
            const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict';
            const mlResponse = await fetch(mlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mlFeatures),
                signal: AbortSignal.timeout(2000) 
            });

            if (mlResponse.ok) {
                const mlData = await mlResponse.json();
                predictedPercentage = parseFloat(mlData.predicted_score);
                mlSuccess = true;
            } else {
                console.warn(`ML Service returned status ${mlResponse.status}.`);
            }
        } catch (mlErr) {
            console.warn('ML Service offline or timed out.', mlErr.message);
        }

        if (!mlSuccess) {
            return res.status(503).json({ message: "ML Service is currently unavailable." });
        }

        const predictedMarks = parseFloat(((predictedPercentage / 100) * lessonMaxMark).toFixed(1));

        const prediction = await Prediction.create({
            studentId: student._id,
            lessonId: lessonId || 'General',
            features: features,
            predictedScore: predictedPercentage
        });

        res.status(201).json({
            studentName: student.name || 'Unknown',
            lesson: lessonId || 'General',
            predictedPercentage: parseFloat(predictedPercentage.toFixed(1)),
            predictedMarks: predictedMarks,
            totalMarks: lessonMaxMark,
            prediction,
            quizzesAnalyzed
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
    }
};

module.exports = {
    generatePrediction
};
