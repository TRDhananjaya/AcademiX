const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');

// @desc    Submit a quiz and save result
// @route   POST /api/quiz-results
// @access  Public (for now)
const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, studentName, selectedAnswers, timeTakenSeconds } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    // Calculate score
    quiz.questions.forEach(q => {
      // Find the answer provided by the student for this question
      const providedAnswer = selectedAnswers[q._id.toString()];
      if (providedAnswer === q.correctOption) {
        score++;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const status = percentage >= 60 ? 'Pass' : 'Fail';

    // Format timeTaken
    const m = Math.floor(timeTakenSeconds / 60);
    const s = timeTakenSeconds % 60;
    const timeTaken = `${m}m ${s}s`;

    const result = new QuizResult({
      quizId,
      studentId,
      studentName,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      status
    });

    const savedResult = await result.save();
    res.status(201).json(savedResult);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error while submitting quiz' });
  }
};

// @desc    Get all results for a specific quiz
// @route   GET /api/quiz-results/quiz/:quizId
// @access  Public (for now)
const getResultsByQuiz = async (req, res) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.quizId }).sort({ submittedAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all results for a specific student
// @route   GET /api/quiz-results/student/:studentId
// @access  Public (for now)
const getResultsByStudent = async (req, res) => {
  try {
    const results = await QuizResult.find({ studentId: req.params.studentId }).sort({ submittedAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitQuiz,
  getResultsByQuiz,
  getResultsByStudent
};
