const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');
const Lesson = require('../models/Lesson');

const lessonMaxMarks = {
    1: 50, 2: 50, 3: 20, 4: 35, 5: 45, 6: 20, 7: 25, 8: 35, 9: 20
};

// Helper function to extract lesson number from string (e.g., '6a33c6b4d67ba7d81f63916b' or 'L1')
// Since AcademiX uses MongoDB object IDs for lessons but Q1.1 for quizzes, let's extract the lesson number from the Qx.y format or fallback.
const getLessonNumber = (lessonId) => {
    if (!lessonId) return 1;
    
    const strId = lessonId.toString();
    if (/^\d+$/.test(strId)) return parseInt(strId);
    
    const match = strId.match(/^[QL](\d+)/i);
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

    const lessonNum = getLessonNumber(lessonId);
    let realLessonId = null;
    try {
        const lessonDoc = await Lesson.findOne({ lessonNumber: lessonNum });
        if (lessonDoc) realLessonId = lessonDoc._id.toString();
    } catch (e) {
        console.error("Error finding lesson doc:", e);
    }

    const followupResults = await FollowupResult.find({
        studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
        $or: [
            { lessonId: lessonNum.toString() },
            { lessonId: `Lesson ${lessonNum}` },
            { quizId: { $regex: `^${prefix}`, $options: 'i' } },
            ...(realLessonId ? [{ lessonId: realLessonId }] : [])
        ]
    }).sort({ submittedAt: -1 });

    let q1 = 0, q2 = 0, q3 = 0, followup = 0;
    
    const latestQuizzes = {};
    for (const result of quizResults) {
        if (!result.quizId) continue;
        const id = result.quizId.toUpperCase();
        if (!latestQuizzes[id]) {
            latestQuizzes[id] = result.percentage || (result.score / 20) * 100;
        }
    }

    const expectedQ1 = `${prefix.toUpperCase()}.1`;
    const expectedQ2 = `${prefix.toUpperCase()}.2`;
    const expectedQ3 = `${prefix.toUpperCase()}.3`;

    const hasQuiz1 = latestQuizzes[expectedQ1] !== undefined;
    const hasQuiz2 = latestQuizzes[expectedQ2] !== undefined;
    const hasQuiz3 = latestQuizzes[expectedQ3] !== undefined;
    
    if (hasQuiz1) q1 = latestQuizzes[expectedQ1];
    if (hasQuiz2) q2 = latestQuizzes[expectedQ2];
    if (hasQuiz3) q3 = latestQuizzes[expectedQ3];

    let hasFollowup = false;
    if (followupResults.length > 0) {
        followup = followupResults[0]?.percentage || followup;
        hasFollowup = true;
    }

    const missingData = [];
    if (!hasQuiz1) missingData.push(`Quiz ${expectedQ1.replace('Q', '')}`);
    if (!hasQuiz2) missingData.push(`Quiz ${expectedQ2.replace('Q', '')}`);
    if (!hasQuiz3) missingData.push(`Quiz ${expectedQ3.replace('Q', '')}`);
    if (!hasFollowup) missingData.push(`Follow-up Quiz`);

    const completedQuizzes = [hasQuiz1, hasQuiz2, hasQuiz3].filter(Boolean).length;
    const avg = completedQuizzes > 0 ? (q1 + q2 + q3) / completedQuizzes : 0;

    return {
        Quiz_1_Score: q1,
        Quiz_2_Score: q2,
        Quiz_3_Score: q3,
        Quiz_Average: avg,
        Followup_Quiz_Score: followup,
        missingData
    };
};

// Shared helper for prediction calculation
const getStudentLessonPrediction = async (student, lessonId) => {
    const lessonNum = getLessonNumber(lessonId);
    const lessonMaxMark = lessonMaxMarks[lessonNum] || 50;

    const featuresData = await calculateFeatures(student.studentId, lessonId);
    const { missingData, ...features } = featuresData;

    const studentResult = {
        studentId: student.studentId,
        studentName: student.name || 'Unknown',
        quiz1Score: features.Quiz_1_Score,
        quiz2Score: features.Quiz_2_Score,
        quiz3Score: features.Quiz_3_Score,
        quizAverage: features.Quiz_Average,
        followupScore: features.Followup_Quiz_Score,
        predictedPercentage: null,
        predictedLessonMark: null,
        lessonMaxMark: lessonMaxMark,
        predictionStatus: "AVAILABLE",
        features,
        missingData,
        lesson: lessonId
    };

    if (missingData.length > 0) {
        studentResult.predictionStatus = "INSUFFICIENT_DATA";
        return studentResult;
    }

    const mlFeatures = {
        Quiz_1_Score: features.Quiz_1_Score,
        Quiz_2_Score: features.Quiz_2_Score,
        Quiz_3_Score: features.Quiz_3_Score,
        Quiz_Average: features.Quiz_Average,
        Followup_Quiz_Score: features.Followup_Quiz_Score
    };

    try {
        const rawUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict';
        const trimmed = rawUrl.replace(/\/+$/, '');
        const mlUrl = trimmed.endsWith('/predict') ? trimmed : `${trimmed}/predict`;

        const mlResponse = await fetch(mlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlFeatures),
            signal: AbortSignal.timeout(10000) 
        });

        if (mlResponse.ok) {
            const mlData = await mlResponse.json();
            const predictedPercentage = parseFloat(mlData.predicted_score);
            studentResult.predictedPercentage = parseFloat(predictedPercentage.toFixed(1));
            studentResult.predictedLessonMark = parseFloat(((predictedPercentage / 100) * lessonMaxMark).toFixed(1));
        } else {
            console.error(`ML service returned status ${mlResponse.status} ${mlResponse.statusText} for URL: ${mlUrl}`);
            studentResult.predictionStatus = "ML_SERVICE_UNAVAILABLE";
        }
    } catch (mlErr) {
        console.error(`ML service call failed: ${mlErr.message}`);
        studentResult.predictionStatus = "ML_SERVICE_UNAVAILABLE";
    }

    return studentResult;
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

        const predictionResult = await getStudentLessonPrediction(student, lessonId);

        // Map to the format expected by the detail page component
        res.status(200).json({
            studentName: predictionResult.studentName,
            lesson: predictionResult.lesson,
            predictedPercentage: predictionResult.predictedPercentage,
            predictedMarks: predictionResult.predictedLessonMark,
            totalMarks: predictionResult.lessonMaxMark,
            predictionStatus: predictionResult.predictionStatus,
            features: predictionResult.features,
            quizzesAnalyzed: predictionResult.quizzesAnalyzed
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
    }
};

// @desc    Generate predictions for all students in a lesson
// @route   GET /api/predictions/lesson/:lessonId
// @access  Public
const getLessonPredictions = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const students = await Student.find({});
        const lessonNum = getLessonNumber(lessonId);
        const lessonMaxMark = lessonMaxMarks[lessonNum] || 50;
        
        // Execute predictions concurrently with Promise.all to avoid cascading sequential timeouts
        const results = await Promise.all(
            students.map(student => getStudentLessonPrediction(student, lessonId))
        );
        
        res.status(200).json({
            lesson: {
                lessonId: lessonId,
                lessonName: `Lesson ${lessonNum}`,
                maxMark: lessonMaxMark
            },
            students: results
        });
        
    } catch (error) {
        console.error('Lesson prediction error:', error);
        res.status(500).json({ message: 'Failed to generate lesson predictions', error: error.message });
    }
};

// @desc    Get all lesson predictions for a specific student
// @route   GET /api/predictions/student/:studentId
// @access  Public
const getStudentAllLessonsPrediction = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ 
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } 
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find all unique quizzes the student has attempted to determine available lessons
        const quizResults = await QuizResult.find({ 
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } 
        });

        // Extract lesson numbers (e.g. from "Q1.1" -> "1")
        const lessonNumbers = [...new Set(quizResults.map(r => {
            const match = r.quizId.match(/^[QL](\d+)/i);
            return match ? match[1] : '1';
        }))].sort();

        const lessonsData = [];
        let totalPredictedPct = 0;
        let predictionCount = 0;
        let highestPredicted = null;
        let lowestPredicted = null;

        for (const lessonNum of lessonNumbers) {
            const lessonResult = await getStudentLessonPrediction(student, lessonNum.toString());
            
            // Format for the response array
            lessonsData.push({
                lessonId: lessonNum.toString(),
                lessonName: `Lesson ${lessonNum}`,
                maxMark: lessonResult.lessonMaxMark,
                features: lessonResult.features,
                predictionStatus: lessonResult.predictionStatus,
                predictedPercentage: lessonResult.predictedPercentage,
                predictedLessonMark: lessonResult.predictedLessonMark,
                quizzesAnalyzed: lessonResult.quizzesAnalyzed
            });

            if (lessonResult.predictionStatus === "AVAILABLE" && lessonResult.predictedPercentage !== null) {
                totalPredictedPct += lessonResult.predictedPercentage;
                predictionCount++;
                
                if (highestPredicted === null || lessonResult.predictedPercentage > highestPredicted) {
                    highestPredicted = lessonResult.predictedPercentage;
                }
                if (lowestPredicted === null || lessonResult.predictedPercentage < lowestPredicted) {
                    lowestPredicted = lessonResult.predictedPercentage;
                }
            }
        }

        const averagePredictedPercentage = predictionCount > 0 
            ? parseFloat((totalPredictedPct / predictionCount).toFixed(1)) 
            : 0;

        res.status(200).json({
            student: {
                studentId: student.studentId,
                studentName: student.name || 'Unknown',
                grade: student.grade || 'Unknown'
            },
            summary: {
                availableLessons: lessonNumbers.length,
                lessonsWithPredictions: predictionCount,
                averagePredictedPercentage,
                highestPredictedPercentage: highestPredicted !== null ? highestPredicted : 0,
                lowestPredictedPercentage: lowestPredicted !== null ? lowestPredicted : 0
            },
            lessons: lessonsData
        });
    } catch (error) {
        console.error('Student all lessons prediction error:', error);
        res.status(500).json({ message: 'Failed to generate student predictions', error: error.message });
    }
};

module.exports = {
    generatePrediction,
    getLessonPredictions,
    getStudentAllLessonsPrediction
};
