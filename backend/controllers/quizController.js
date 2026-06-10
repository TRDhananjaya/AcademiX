const Quiz = require('../models/Quiz');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Public (for now)
const createQuiz = async (req, res) => {
  try {
    const { title, bundleTopic, instructions, questions, settings } = req.body;

    const quiz = new Quiz({
      title,
      bundleTopic,
      instructions,
      questions,
      settings
    });

    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error while creating quiz' });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public (for now)
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error while fetching quizzes' });
  }
};

module.exports = {
  createQuiz,
  getQuizzes
};
