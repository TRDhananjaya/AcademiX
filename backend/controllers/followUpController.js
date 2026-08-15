const FollowupQuiz = require('../models/FollowUpQuiz');
const FollowupResult = require('../models/FollowupResult');
const Quiz = require('../models/Quiz');
const QuizQuestions = require('../models/QuizQuestions');
const QuizResult = require('../models/QuizResult');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const mongoose = require('mongoose');

/**
 * Get or generate an adaptive 20-question follow-up quiz for a student and lesson
 * @route GET /api/followup/lesson/:lessonId
 */
const getOrGenerateFollowUpQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.query.studentId || req.user?.username || 'STU-0001';

    // 1. Check if student has already completed a follow-up quiz for this lesson
    const pastResult = await FollowupResult.findOne({
      lessonId: String(lessonId),
      studentId: { $regex: new RegExp(`^${studentId.trim()}$`, 'i') }
    }).sort({ submittedAt: -1 });

    // 2. Check if a FollowupQuiz document already exists for this lesson & student
    const existingQuizCode = `FQ_${lessonId}_${studentId}`;
    let quiz = await FollowupQuiz.findOne({
      $or: [
        { quizCode: existingQuizCode },
        { moduleId: String(lessonId), bundleTopic: { $regex: new RegExp(studentId.trim(), 'i') } }
      ]
    });

    if (quiz && quiz.questions && quiz.questions.length >= 20) {
      return res.status(200).json({
        quiz,
        completed: !!pastResult,
        pastResult: pastResult || null
      });
    }

    // 3. Otherwise, fetch lesson & modules to build an adaptive 20-question quiz from DB
    let lessonTitle = 'Lesson Study Plan';
    if (mongoose.Types.ObjectId.isValid(lessonId)) {
      const lessonObj = await Lesson.findById(lessonId);
      if (lessonObj) lessonTitle = lessonObj.title;
    }

    let lessonModules = [];
    if (mongoose.Types.ObjectId.isValid(lessonId)) {
      lessonModules = await Module.find({ lessonId }).sort({ title: 1 });
    }

    // Fallback if no modules found by ObjectId
    if (lessonModules.length === 0) {
      lessonModules = await Module.find({}).limit(4);
    }

    // 4. Determine student's performance percentage per module from previous QuizResult
    const targetStudentId = studentId.trim();
    const studentResults = await QuizResult.find({
      studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') }
    }).sort({ submittedAt: -1 });

    // Map each module to its percentage score
    const moduleScores = [];
    for (const mod of lessonModules) {
      // Extract numeric prefix e.g. "Module 1.1" -> "Q1.1"
      const match = mod.title ? mod.title.match(/Module\s+(\d+\.\d+)/i) : null;
      const quizCode = match ? `Q${match[1]}` : null;

      let score = 50; // default 50% if unattempted
      const matchedResult = studentResults.find(r => 
        (quizCode && r.quizId === quizCode) || 
        (mod._id && r.quizId === mod._id.toString())
      );

      if (matchedResult) {
        score = typeof matchedResult.percentage === 'number' ? matchedResult.percentage : 50;
      }

      moduleScores.push({
        module: mod,
        quizCode,
        title: mod.title || 'Module',
        score
      });
    }

    // 5. Calculate question allocation (total 20 questions) based on weakness weight
    // Weakness weight = max(5, 100 - score + 1)
    const weights = moduleScores.map(ms => Math.max(5, 100 - ms.score + 1));
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);

    let rawCounts = weights.map(w => Math.round(20 * (w / totalWeight)));
    let sumCounts = rawCounts.reduce((acc, c) => acc + c, 0);

    // Adjust counts so the sum equals exactly 20
    if (sumCounts !== 20 && rawCounts.length > 0) {
      const diff = 20 - sumCounts;
      // find index with largest weight
      let maxIdx = 0;
      for (let i = 1; i < weights.length; i++) {
        if (weights[i] > weights[maxIdx]) maxIdx = i;
      }
      rawCounts[maxIdx] = Math.max(1, rawCounts[maxIdx] + diff);
    }

    const moduleBreakdown = moduleScores.map((ms, idx) => ({
      moduleTitle: ms.title,
      quizCode: ms.quizCode,
      score: ms.score,
      targetQuestionCount: rawCounts[idx] || 5
    }));

    // 6. Fetch questions from DB Question Banks (QuizQuestions & Quiz models)
    let selectedQuestions = [];

    for (let i = 0; i < moduleScores.length; i++) {
      const ms = moduleScores[i];
      const targetCount = rawCounts[i] || 5;

      // Find question bank doc in QuizQuestions
      let bankDoc = null;
      if (ms.quizCode) {
        bankDoc = await QuizQuestions.findOne({ quizCode: ms.quizCode });
      }
      if (!bankDoc && ms.module._id) {
        bankDoc = await QuizQuestions.findOne({ moduleId: ms.module._id.toString() });
      }
      if (!bankDoc && ms.quizCode) {
        bankDoc = await Quiz.findOne({ quizCode: ms.quizCode });
      }

      let available = (bankDoc && bankDoc.questions) ? bankDoc.questions : [];

      if (available.length > 0) {
        // Shuffle & slice
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, Math.min(targetCount, shuffled.length));
        picked.forEach(q => {
          selectedQuestions.push({
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            difficulty: q.difficulty || 'Medium',
            moduleTitle: ms.title
          });
        });
      }
    }

    // 7. Fallback if database question banks didn't provide full 20 questions
    if (selectedQuestions.length < 20) {
      const allBanks = await QuizQuestions.find({});
      let backupPool = [];
      allBanks.forEach(b => {
        if (b.questions) {
          b.questions.forEach(q => {
            backupPool.push({
              text: q.text,
              options: q.options,
              correctOption: q.correctOption,
              difficulty: q.difficulty || 'Medium',
              moduleTitle: b.title || 'General Module'
            });
          });
        }
      });

      // Filter out duplicates
      const existingTexts = new Set(selectedQuestions.map(q => q.text));
      backupPool = backupPool.filter(q => !existingTexts.has(q.text));

      const needed = 20 - selectedQuestions.length;
      const shuffledBackup = backupPool.sort(() => 0.5 - Math.random());
      const extraPicked = shuffledBackup.slice(0, needed);
      selectedQuestions = [...selectedQuestions, ...extraPicked];
    }

    // Ensure we have exactly 20 (or max possible)
    selectedQuestions = selectedQuestions.slice(0, 20);

    // 8. Save generated FollowupQuiz document
    quiz = new FollowupQuiz({
      quizCode: existingQuizCode,
      title: `Follow-up Quiz - ${lessonTitle}`,
      moduleId: String(lessonId),
      bundleTopic: `Adaptive assessment for ${studentId}`,
      questions: selectedQuestions.map(q => ({
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        difficulty: q.difficulty
      }))
    });

    await quiz.save();

    res.status(200).json({
      quiz,
      completed: !!pastResult,
      pastResult: pastResult || null,
      moduleBreakdown
    });

  } catch (error) {
    console.error('Error fetching/generating follow-up quiz:', error);
    res.status(500).json({ message: 'Server error generating follow-up quiz', error: error.message });
  }
};

/**
 * Submit follow-up quiz results
 * @route POST /api/followup/submit
 */
const submitFollowUpQuiz = async (req, res) => {
  try {
    const { 
      quizId, 
      lessonId, 
      studentId, 
      studentName, 
      score, 
      totalQuestions = 20, 
      timeTaken, 
      answersDetails 
    } = req.body;

    if (!studentId || score === undefined) {
      return res.status(400).json({ message: 'Missing required submission fields' });
    }

    const percentage = Math.round((score / Math.max(1, totalQuestions)) * 100);
    const status = percentage >= 50 ? 'Pass' : 'Fail';

    const result = new FollowupResult({
      quizId: quizId || `FQ_${lessonId}_${studentId}`,
      lessonId: lessonId || '',
      studentId: studentId.trim(),
      studentName: studentName || 'Student',
      score,
      totalQuestions,
      percentage,
      timeTaken: timeTaken || '0m 00s',
      status,
      answersDetails: answersDetails || []
    });

    const savedResult = await result.save();

    res.status(201).json({
      message: 'Follow-up quiz submitted successfully',
      result: savedResult
    });

  } catch (error) {
    console.error('Error submitting follow-up quiz:', error);
    res.status(500).json({ message: 'Server error submitting follow-up quiz', error: error.message });
  }
};

/**
 * Backwards compatible RAG service call endpoint
 * @route POST /api/followup/generate
 */
const generateFollowUpQuiz = async (req, res) => {
  return getOrGenerateFollowUpQuiz(req, res);
};

module.exports = {
  getOrGenerateFollowUpQuiz,
  submitFollowUpQuiz,
  generateFollowUpQuiz
};
