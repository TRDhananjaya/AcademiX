const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');

// @desc    Generate a prediction for a student using ML service
// @route   POST /api/predictions/predict/:studentId
// @access  Public
const generatePrediction = async (req, res, next) => {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findById(studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch student's quiz results using explicit studentId
        const quizResults = await QuizResult.find({ 
            studentId: student.studentId 
        }).sort({ submittedAt: 1 });
        
        const followupResults = await FollowupResult.find({
            studentId: student.studentId 
        }).sort({ submittedAt: -1 });

        // Calculate features from QuizResults or use realistic defaults if not enough data
        let m1 = 70, m2 = 75, m3 = 80, followup = 85;

        if (quizResults.length > 0) {
            m1 = quizResults[0]?.percentage || m1;
            m2 = quizResults[1]?.percentage || m1;
            m3 = quizResults[2]?.percentage || (m1 + m2) / 2;
        }
        
        if (followupResults.length > 0) {
            followup = followupResults[0]?.percentage || followup;
        } else if (quizResults.length > 3) {
            // Fallback if followup_results collection is empty but user took a 4th quiz
            followup = quizResults[3]?.percentage || m3;
        }

        const avg = (m1 + m2 + m3) / 3;

        const features = {
            Module_1_Score: m1,
            Module_2_Score: m2,
            Module_3_Score: m3,
            Avg_Module_Score: avg,
            Followup_Quiz_Score: followup
        };

        // Call ML Service using Node.js built-in fetch
        const mlResponse = await fetch('http://127.0.0.1:5001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(features)
        });

        if (!mlResponse.ok) {
            throw new Error(`ML Service error: ${mlResponse.statusText}`);
        }

        const mlData = await mlResponse.json();
        const predictedScore = mlData.predicted_score;

        // Save prediction in DB
        const prediction = await Prediction.create({
            studentId: student._id,
            features: features,
            predictedScore: predictedScore
        });

        res.status(201).json(prediction);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
    }
};

module.exports = {
    generatePrediction
};
