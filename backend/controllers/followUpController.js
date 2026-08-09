const FollowupQuiz = require('../models/FollowUpQuiz');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const axios = require('axios'); // Ensure axios is used for API calls if fetch is not suitable, but Node 18+ has fetch

// @desc    Generate a Follow-up Quiz using RAG service
// @route   POST /api/followup/generate
// @access  Private
const generateFollowUpQuiz = async (req, res) => {
    try {
        const { studentId, lessonId } = req.body;
        
        // 1. Fetch student
        const student = await Student.findOne({ 
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } 
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 2. Fetch module quiz scores for the lesson
        const targetStudentId = studentId ? studentId.toLowerCase() : '';
        const matchStage = lessonId 
            ? { quizId: { $regex: `^${lessonId}` }, studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } } 
            : { studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } };
            
        const quizResults = await QuizResult.find(matchStage).sort({ submittedAt: -1 });

        const latestQuizzes = {};
        for (const result of quizResults) {
            if (!latestQuizzes[result.quizId]) {
                latestQuizzes[result.quizId] = {
                    score: result.percentage || (result.score / 20) * 100,
                    incorrectQuestions: result.incorrectQuestions || []
                };
            }
        }

        const modules_data = Object.keys(latestQuizzes).map(quizId => {
            // map Q1.1 -> 1.1
            const moduleId = quizId.replace('Q', '');
            return {
                module_id: moduleId,
                score: latestQuizzes[quizId].score,
                incorrect_questions: latestQuizzes[quizId].incorrectQuestions
            };
        });

        if (modules_data.length === 0) {
            return res.status(400).json({ message: 'No module quizzes found to analyze for weak areas.' });
        }

        // 3. Call RAG service to generate the exact 20 questions
        const ragUrl = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:8000/generate_followup_quiz';
        
        const ragPayload = {
            student_id: studentId,
            overall_score: modules_data.reduce((acc, curr) => acc + curr.score, 0) / modules_data.length,
            modules_data: modules_data
        };

        const response = await fetch(ragUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ragPayload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to generate quiz from RAG service');
        }

        const data = await response.json();
        const generatedQuestions = data.quiz;

        if (!Array.isArray(generatedQuestions) || generatedQuestions.length !== 20) {
            throw new Error('RAG service did not return exactly 20 questions.');
        }

        // 4. Transform and Save to DB
        // Format to match FollowUpQuiz Schema
        const quizToSave = new FollowupQuiz({
            quizCode: `FQ_${lessonId}_${studentId}_${Date.now()}`,
            title: `Adaptive Follow-up Quiz - ${lessonId}`,
            moduleId: lessonId,
            bundleTopic: `Adaptive assessment for ${studentId}`,
            questions: generatedQuestions.map(q => ({
                text: q.question,
                options: q.options,
                correctOption: q.correctAnswer
            }))
        });

        await quizToSave.save();

        res.status(201).json({
            message: 'Adaptive Follow-up Quiz generated successfully.',
            quiz: quizToSave,
            metadata: {
                difficulty: generatedQuestions[0]?.difficulty || 'Medium'
            }
        });

    } catch (error) {
        console.error('Error generating follow-up quiz:', error);
        res.status(500).json({ message: 'Error generating adaptive follow-up quiz', error: error.message });
    }
};

module.exports = {
    generateFollowUpQuiz
};
