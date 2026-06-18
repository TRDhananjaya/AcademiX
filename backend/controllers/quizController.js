const Quiz = require('../models/Quiz');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Public (for now)
const createQuiz = async (req, res) => {
  try {
    const { quizCode, title, moduleId, bundleTopic, questions } = req.body;

    const quiz = new Quiz({
      quizCode,
      title,
      moduleId,
      bundleTopic,
      questions
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
    const quizzes = await Quiz.aggregate([
      {
        $project: {
          quizCode: 1,
          title: 1,
          moduleId: 1,
          bundleTopic: 1,
          questionCount: { $size: { $ifNull: ["$questions", []] } }
        }
      },
      { $sort: { quizCode: 1 } }
    ]);
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error while fetching quizzes' });
  }
};

// @desc    Get a specific quiz by ID
// @route   GET /api/quizzes/:quizId
// @access  Public (for now)
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).select('quizCode title bundleTopic moduleId questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Format the response to return questionCount and specific fields
    const formattedQuiz = {
      _id: quiz._id,
      quizCode: quiz.quizCode,
      title: quiz.title,
      bundleTopic: quiz.bundleTopic,
      moduleId: quiz.moduleId,
      questionCount: quiz.questions ? quiz.questions.length : 0
    };
    
    res.status(200).json(formattedQuiz);
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    res.status(500).json({ message: 'Server error while fetching quiz' });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById
};
