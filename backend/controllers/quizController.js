const Quiz = require('../models/Quiz');
const QuizQuestions = require('../models/QuizQuestions');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Public (for now)
const createQuiz = async (req, res) => {
  try {
    const { quizCode, title, moduleId, bundleTopic, questions } = req.body;

    // Find if quiz with same quizCode exists to update, else create new
    let quiz = await Quiz.findOne({ quizCode });
    if (quiz) {
      quiz.title = title;
      quiz.moduleId = moduleId;
      quiz.bundleTopic = bundleTopic;
      quiz.questions = questions;
      quiz.createdAt = new Date();
      const updatedQuiz = await quiz.save();
      return res.status(200).json(updatedQuiz);
    }

    quiz = new Quiz({
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
          questions: 1,
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
      questions: quiz.questions || [],
      questionCount: quiz.questions ? quiz.questions.length : 0
    };
    
    res.status(200).json(formattedQuiz);
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    res.status(500).json({ message: 'Server error while fetching quiz' });
  }
};

// @desc    Get all question bank modules (without questions)
// @route   GET /api/quizzes/modules
// @access  Public (for now)
const getQuestionModules = async (req, res) => {
  try {
    const modules = await QuizQuestions.find({}, 'quizCode title moduleId bundleTopic').sort({ quizCode: 1 });
    res.status(200).json(modules);
  } catch (error) {
    console.error('Error fetching question modules:', error);
    res.status(500).json({ message: 'Server error while fetching question modules' });
  }
};

// @desc    Get 20 random questions for a specific module
// @route   GET /api/quizzes/modules/:quizCode/questions
// @access  Public (for now)
const getRandomQuestionsFromModule = async (req, res) => {
  try {
    const { quizCode } = req.params;
    const moduleData = await QuizQuestions.findOne({ quizCode });
    if (!moduleData) {
      return res.status(404).json({ message: 'Module question bank not found' });
    }

    const allQuestions = moduleData.questions || [];
    if (allQuestions.length === 0) {
      return res.status(200).json({
        quizCode: moduleData.quizCode,
        moduleId: moduleData.moduleId,
        title: moduleData.title,
        bundleTopic: moduleData.bundleTopic,
        questions: []
      });
    }

    // Shuffle and pick 20 (or fewer if total questions is less than 20)
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(20, shuffled.length));

    res.status(200).json({
      quizCode: moduleData.quizCode,
      moduleId: moduleData.moduleId,
      title: moduleData.title,
      bundleTopic: moduleData.bundleTopic,
      questions: selected
    });
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({ message: 'Server error while fetching questions' });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:quizId
// @access  Public (for now)
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await Quiz.findByIdAndDelete(quizId);
    res.status(200).json({ message: 'Quiz successfully deleted' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error while deleting quiz' });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  getQuestionModules,
  getRandomQuestionsFromModule,
  deleteQuiz
};
