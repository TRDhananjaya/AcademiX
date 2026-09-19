const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

const ALLOWED_LESSONS = ['1', '2'];

const lessonMaxMarks = {
    1: 50, 2: 50
};

const defaultLessonNames = {
    1: "Information and Communication Technology",
    2: "Fundamentals of a Computer System"
};

const getFullLessonTitle = async (lessonNum) => {
    const num = parseInt(lessonNum);
    try {
        const lessonDoc = await Lesson.findOne({ lessonNumber: num });
        if (lessonDoc && lessonDoc.title) {
            return lessonDoc.title.toLowerCase().startsWith('lesson')
                ? lessonDoc.title
                : `Lesson ${num}: ${lessonDoc.title}`;
        }
        const quizDoc = await Quiz.findOne({ quizCode: new RegExp(`^Q${num}\\.`, 'i') });
        if (quizDoc && quizDoc.bundleTopic) {
            return quizDoc.bundleTopic;
        }
    } catch (e) {
        console.warn("Error looking up lesson title:", e.message);
    }
    if (defaultLessonNames[num]) {
        return `Lesson ${num}: ${defaultLessonNames[num]}`;
    }
    return `Lesson ${num}`;
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
    
    // Track best percentage achieved across attempts
    const bestQuizzes = {};
    for (const result of quizResults) {
        if (!result.quizId) continue;
        const id = result.quizId.toUpperCase();
        const score = typeof result.percentage === 'number' 
            ? result.percentage 
            : (((result.score || 0) / (result.totalQuestions || 20)) * 100);
            
        if (bestQuizzes[id] === undefined || score > bestQuizzes[id]) {
            bestQuizzes[id] = Math.max(0, Math.min(100, score));
        }
    }

    const expectedQ1 = `${prefix.toUpperCase()}.1`;
    const expectedQ2 = `${prefix.toUpperCase()}.2`;
    const expectedQ3 = `${prefix.toUpperCase()}.3`;

    const hasQuiz1 = bestQuizzes[expectedQ1] !== undefined;
    const hasQuiz2 = bestQuizzes[expectedQ2] !== undefined;
    const hasQuiz3 = bestQuizzes[expectedQ3] !== undefined;
    
    if (hasQuiz1) q1 = bestQuizzes[expectedQ1];
    if (hasQuiz2) q2 = bestQuizzes[expectedQ2];
    if (hasQuiz3) q3 = bestQuizzes[expectedQ3];

    let hasFollowup = false;
    // Prefer followup for this lesson, or highest followup score
    for (const fr of followupResults) {
        const score = typeof fr.percentage === 'number' 
            ? fr.percentage 
            : (((fr.score || 0) / (fr.totalQuestions || 20)) * 100);
        if (score > followup) {
            followup = Math.max(0, Math.min(100, score));
            hasFollowup = true;
        }
    }
    if (!hasFollowup && followupResults.length > 0) {
        followup = followupResults[0].percentage || 0;
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
        Quiz_1_Score: parseFloat(q1.toFixed(1)),
        Quiz_2_Score: parseFloat(q2.toFixed(1)),
        Quiz_3_Score: parseFloat(q3.toFixed(1)),
        Quiz_Average: parseFloat(avg.toFixed(1)),
        Followup_Quiz_Score: parseFloat(followup.toFixed(1)),
        missingData,
        hasCompletedRequiredQuizzes: hasQuiz1 && hasQuiz2 && hasQuiz3
    };
};

// Shared helper for prediction calculation
const getStudentLessonPrediction = async (student, lessonId) => {
    const lessonNum = getLessonNumber(lessonId);
    const lessonMaxMark = lessonMaxMarks[lessonNum] || 50;

    const featuresData = await calculateFeatures(student.studentId, lessonId);
    const { missingData, hasCompletedRequiredQuizzes, ...features } = featuresData;

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
        hasCompletedRequiredQuizzes,
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

    const rawUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict';
    const trimmed = rawUrl.replace(/\/+$/, '');
    const mlUrl = trimmed.endsWith('/predict') ? trimmed : `${trimmed}/predict`;
    const isLocal = mlUrl.includes('127.0.0.1') || mlUrl.includes('localhost');
    const firstTimeout = isLocal ? 2500 : 35000;
    const secondTimeout = isLocal ? 2000 : 20000;

    try {
        let mlResponse;
        try {
            mlResponse = await fetch(mlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mlFeatures),
                signal: AbortSignal.timeout(firstTimeout) // Fast timeout for local, longer for Render cold start
            });
        } catch (firstErr) {
            // If timed out or cold-starting, retry once (only on remote hosts)
            if (!isLocal) {
                console.warn(`ML service initial call timed out (${firstErr.message}), retrying once...`);
                mlResponse = await fetch(mlUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mlFeatures),
                    signal: AbortSignal.timeout(secondTimeout)
                });
            } else {
                throw firstErr;
            }
        }

        if (mlResponse && mlResponse.ok) {
            const mlData = await mlResponse.json();
            const predictedPercentage = parseFloat(mlData.predicted_score);
            studentResult.predictedPercentage = parseFloat(predictedPercentage.toFixed(1));
            studentResult.predictedLessonMark = parseFloat(((predictedPercentage / 100) * lessonMaxMark).toFixed(1));
        } else {
            console.warn(`ML service returned status ${mlResponse?.status} for URL: ${mlUrl}, applying calibrated performance model.`);
            const estimatedPct = parseFloat(Math.min(100, Math.max(0, (features.Quiz_Average * 0.6 + features.Followup_Quiz_Score * 0.4))).toFixed(1));
            studentResult.predictedPercentage = estimatedPct;
            studentResult.predictedLessonMark = parseFloat(((estimatedPct / 100) * lessonMaxMark).toFixed(1));
        }
    } catch (mlErr) {
        console.warn(`ML service call failed (${mlErr.message}), applying calibrated performance model.`);
        const estimatedPct = parseFloat(Math.min(100, Math.max(0, (features.Quiz_Average * 0.6 + features.Followup_Quiz_Score * 0.4))).toFixed(1));
        studentResult.predictedPercentage = estimatedPct;
        studentResult.predictedLessonMark = parseFloat(((estimatedPct / 100) * lessonMaxMark).toFixed(1));
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

        // If a specific lesson was requested, predict for that lesson
        if (lessonId && lessonId.toString().trim() !== '') {
            const predictionResult = await getStudentLessonPrediction(student, lessonId);
            const fullLessonName = await getFullLessonTitle(getLessonNumber(lessonId));

            return res.status(200).json({
                studentName: predictionResult.studentName,
                lesson: predictionResult.lesson,
                lessonName: fullLessonName,
                predictedPercentage: predictionResult.predictedPercentage,
                predictedMarks: predictionResult.predictedLessonMark,
                totalMarks: predictionResult.lessonMaxMark,
                predictionStatus: predictionResult.predictionStatus,
                features: predictionResult.features,
                quizzesAnalyzed: predictionResult.quizzesAnalyzed
            });
        }

        // When no lessonId is passed (e.g. Student Dashboard general Final Exam Prediction):
        // Evaluate across all unique lessons the student has attempted
        const quizResults = await QuizResult.find({ 
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } 
        });

        const lessonNumbers = [...new Set(quizResults.map(r => {
            const match = r.quizId?.match(/^[QL](\d+)/i);
            return match ? match[1] : null;
        }))].filter(n => ALLOWED_LESSONS.includes(n)).sort();

        if (lessonNumbers.length === 0) lessonNumbers.push(...ALLOWED_LESSONS);

        let totalPredictedPct = 0;
        let predictionCount = 0;
        let lastResult = null;
        const lessonPredictions = [];

        for (const num of lessonNumbers) {
            const pred = await getStudentLessonPrediction(student, num.toString());
            lastResult = pred;
            const fullLessonTitle = await getFullLessonTitle(num);

            lessonPredictions.push({
                lessonId: num.toString(),
                lessonNumber: parseInt(num),
                lessonName: fullLessonTitle,
                predictedPercentage: pred.predictedPercentage,
                predictedMarks: pred.predictedLessonMark,
                totalMarks: pred.lessonMaxMark,
                predictionStatus: pred.predictionStatus,
                missingData: pred.missingData || [],
                quizzesAnalyzed: pred.quizzesAnalyzed,
                features: pred.features || {}
            });

            if (pred.predictionStatus === "AVAILABLE" && pred.predictedPercentage !== null) {
                totalPredictedPct += pred.predictedPercentage;
                predictionCount++;
            }
        }

        if (predictionCount === 0) {
            return res.status(200).json({
                studentName: student.name || 'Unknown',
                lesson: "Final Exam (All Lessons)",
                predictedPercentage: null,
                predictedMarks: null,
                totalMarks: 100,
                predictionStatus: lastResult?.predictionStatus || "INSUFFICIENT_DATA",
                lessonsEvaluated: 0,
                lessonPredictions
            });
        }

        const avgPredictedPct = parseFloat((totalPredictedPct / predictionCount).toFixed(1));
        
        return res.status(200).json({
            studentName: student.name || 'Unknown',
            lesson: "Final Exam (All Lessons)",
            predictedPercentage: avgPredictedPct,
            predictedMarks: avgPredictedPct, // Out of 100 for Final Exam
            totalMarks: 100,
            predictionStatus: "AVAILABLE",
            lessonsEvaluated: predictionCount,
            lessonPredictions
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
        
        // Pre-warm ML service if sleeping (e.g., Render free-tier cold start)
        const rawUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict';
        const baseUrl = rawUrl.replace(/\/predict\/?$/, '').replace(/\/+$/, '');
        if (baseUrl.startsWith('http')) {
            try {
                await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(30000) });
            } catch (e) {
                console.warn('ML service pre-warmup ping status:', e.message);
            }
        }

        // Execute predictions concurrently with Promise.all
        const results = await Promise.all(
            students.map(student => getStudentLessonPrediction(student, lessonId))
        );
        
        // Filter out students who haven't completed all three required module quizzes (Q1, Q2, Q3)
        const eligibleStudents = results.filter(student => student.hasCompletedRequiredQuizzes);
        
        res.status(200).json({
            lesson: {
                lessonId: lessonId,
                lessonName: `Lesson ${lessonNum}`,
                maxMark: lessonMaxMark
            },
            students: eligibleStudents
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

        // Extract lesson numbers (only allow Lesson 1 and 2)
        const lessonNumbers = [...new Set(quizResults.map(r => {
            const match = r.quizId?.match(/^[QL](\d+)/i);
            return match ? match[1] : null;
        }))].filter(n => ALLOWED_LESSONS.includes(n)).sort();

        if (lessonNumbers.length === 0) lessonNumbers.push(...ALLOWED_LESSONS);

        const lessonsData = [];
        let totalPredictedPct = 0;
        let predictionCount = 0;
        let highestPredicted = null;
        let lowestPredicted = null;

        for (const lessonNum of lessonNumbers) {
            const lessonResult = await getStudentLessonPrediction(student, lessonNum.toString());
            const fullLessonTitle = await getFullLessonTitle(lessonNum);
            
            // Format for the response array
            lessonsData.push({
                lessonId: lessonNum.toString(),
                lessonName: fullLessonTitle,
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
