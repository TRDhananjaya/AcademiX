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

    if (quiz) {
      if (quiz.isAvailable === false) {
        return res.status(200).json({
          available: false,
          message: 'This follow-up quiz is currently hidden by your teacher.',
          quiz: null
        });
      }
      if (quiz.questions && quiz.questions.length >= 20) {
        return res.status(200).json({
          quiz,
          completed: !!pastResult,
          pastResult: pastResult || null
        });
      }
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

    // 6. Fetch questions from DB Teacher Question Banks (QuizQuestions & Quiz models)
    let selectedQuestions = [];

    for (let i = 0; i < moduleScores.length; i++) {
      const ms = moduleScores[i];
      const targetCount = rawCounts[i] || 5;

      // Find all teacher preadded question bank documents for this module across QuizQuestions & Quiz
      let matchingBankDocs = [];

      const queryConds = [];
      if (ms.quizCode) {
        queryConds.push({ quizCode: ms.quizCode });
        queryConds.push({ quizCode: { $regex: new RegExp(ms.quizCode.replace('.', '\\.'), 'i') } });
      }
      if (ms.module._id) {
        queryConds.push({ moduleId: ms.module._id.toString() });
      }
      if (ms.title) {
        const titleMatch = ms.title.match(/Module\s+(\d+\.\d+)/i);
        if (titleMatch) {
          queryConds.push({ bundleTopic: { $regex: new RegExp(titleMatch[1], 'i') } });
          queryConds.push({ title: { $regex: new RegExp(titleMatch[1], 'i') } });
        }
      }

      if (queryConds.length > 0) {
        const [quizQDocs, quizDocs] = await Promise.all([
          QuizQuestions.find({ $or: queryConds }),
          Quiz.find({ $or: queryConds })
        ]);
        matchingBankDocs = [...(quizQDocs || []), ...(quizDocs || [])];
      }

      // Aggregate all available teacher preadded questions for this module
      let availableQuestions = [];
      matchingBankDocs.forEach(b => {
        if (b.questions && Array.isArray(b.questions)) {
          b.questions.forEach(q => {
            if (q.text && q.options && q.options.length > 0) {
              availableQuestions.push({
                text: q.text,
                options: q.options,
                correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
                difficulty: q.difficulty || 'Medium',
                moduleTitle: ms.title
              });
            }
          });
        }
      });

      if (availableQuestions.length > 0) {
        // Filter out any duplicates already selected
        const existingTexts = new Set(selectedQuestions.map(sq => sq.text));
        const uniqueAvailable = availableQuestions.filter(q => !existingTexts.has(q.text));

        // Shuffle & pick targetCount questions based on percentage mark weight
        const shuffled = [...uniqueAvailable].sort(() => 0.5 - Math.random());
        const picked = shuffled.slice(0, Math.min(targetCount, shuffled.length));
        selectedQuestions = [...selectedQuestions, ...picked];
      }
    }

    // 7. Fallback if database question banks didn't provide full 20 questions
    if (selectedQuestions.length < 20) {
      const [allQuizQuestions, allQuizzes] = await Promise.all([
        QuizQuestions.find({}),
        Quiz.find({})
      ]);

      let backupPool = [];
      const allTeacherBanks = [...(allQuizQuestions || []), ...(allQuizzes || [])];

      allTeacherBanks.forEach(b => {
        if (b.questions && Array.isArray(b.questions)) {
          b.questions.forEach(q => {
            if (q.text && q.options && q.options.length > 0) {
              backupPool.push({
                text: q.text,
                options: q.options,
                correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
                difficulty: q.difficulty || 'Medium',
                moduleTitle: b.title || 'General Practice Module'
              });
            }
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

    // Ensure we have exactly 20 (or max available teacher questions)
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

    if (!studentId || score === undefined || score === null) {
      return res.status(400).json({ message: 'Missing required submission fields' });
    }

    const percentage = Math.round((score / Math.max(1, totalQuestions)) * 100);
    const status = percentage >= 50 ? 'Pass' : 'Fail';

    const query = {
      studentId: new RegExp(`^${studentId.trim()}$`, 'i'),
      $or: [
        { lessonId: lessonId || '' },
        { quizId: quizId || `FQ_${lessonId}_${studentId.trim()}` }
      ]
    };

    // Prevent duplicate attempts
    const existingResult = await FollowupResult.findOne(query);
    if (existingResult) {
      return res.status(403).json({ message: 'Follow-up Quiz has already been completed' });
    }

    const newResult = new FollowupResult({
      quizId: quizId || `FQ_${lessonId}_${studentId.trim()}`,
      lessonId: lessonId || '',
      studentId: studentId.trim(),
      studentName: studentName || 'Student',
      score,
      totalQuestions,
      percentage,
      timeTaken: timeTaken || '0m 00s',
      status,
      answersDetails: answersDetails || [],
      submittedAt: new Date()
    });

    const savedResult = await newResult.save();

    res.status(200).json({
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

/**
 * @desc Get all follow-up quizzes for teacher management
 * @route GET /api/followup/all
 */
const getAllFollowUpQuizzes = async (req, res) => {
  try {
    let quizzes = await FollowupQuiz.find({}).sort({ createdAt: 1 }).lean();

    // If none exist yet, seed default follow-up quizzes for standard modules
    if (!quizzes || quizzes.length === 0) {
      const defaultFollowUps = [
        {
          quizCode: 'FQ1.1',
          title: 'FQ1.1 - Intro to ICT Remedial Quiz',
          moduleId: 'MODULE_1_1',
          bundleTopic: 'Lesson 1: Information and Communication Technology (ICT) Concepts',
          isAvailable: true,
          questions: [
            { text: 'Which of the following best defines Information in ICT?', options: ['Processed Data', 'Raw Facts', 'Hardware Only', 'Electrical Signals'], correctOption: 0 },
            { text: 'What is the primary function of an Input Device?', options: ['Enter Data into System', 'Display Data to User', 'Store Data Long-Term', 'Process Data'], correctOption: 0 }
          ]
        },
        {
          quizCode: 'FQ1.2',
          title: 'FQ1.2 - Applications of ICT Remedial Quiz',
          moduleId: 'MODULE_1_2',
          bundleTopic: 'Lesson 1: Applications of ICT in Daily Life',
          isAvailable: true,
          questions: [
            { text: 'Which ICT application is widely used in modern healthcare for patient diagnosis?', options: ['Telemedicine', 'E-Banking', 'E-Commerce', 'Smart Grids'], correctOption: 0 }
          ]
        },
        {
          quizCode: 'FQ1.3',
          title: 'FQ1.3 - ICT Trends & Ethics Remedial Quiz',
          moduleId: 'MODULE_1_3',
          bundleTopic: 'Lesson 1: Benefits and Challenges of ICT',
          isAvailable: true,
          questions: [
            { text: 'What is a major ethical concern associated with widespread cloud storage?', options: ['Data Privacy & Security', 'Faster Network Speeds', 'Increased Storage Space', 'High Display Resolution'], correctOption: 0 }
          ]
        },
        {
          quizCode: 'FQ2.1',
          title: 'FQ2.1 - Computer Concepts Remedial Quiz',
          moduleId: 'MODULE_2_1',
          bundleTopic: 'Lesson 2: Computer Concepts & Characteristics',
          isAvailable: true,
          questions: [
            { text: 'Which computer component executes arithmetic and logic calculations?', options: ['ALU inside CPU', 'RAM', 'Hard Drive', 'BIOS'], correctOption: 0 }
          ]
        },
        {
          quizCode: 'FQ2.2',
          title: 'FQ2.2 - System Architecture Remedial Quiz',
          moduleId: 'MODULE_2_2',
          bundleTopic: 'Lesson 2: Von Neumann Architecture & Memory',
          isAvailable: true,
          questions: [
            { text: 'Which memory type retains its data even when the computer power is turned off?', options: ['ROM (Non-volatile)', 'RAM (Volatile)', 'Cache Level 1', 'CPU Registers'], correctOption: 0 }
          ]
        },
        {
          quizCode: 'FQ2.3',
          title: 'FQ2.3 - Operating Systems Remedial Quiz',
          moduleId: 'MODULE_2_3',
          bundleTopic: 'Lesson 2: Operating Systems & System Configuration',
          isAvailable: true,
          questions: [
            { text: 'In UNIX system configuration, which file stores encrypted user passwords securely?', options: ['/etc/shadow', '/etc/passwd', '/etc/group', '/etc/hosts'], correctOption: 0 }
          ]
        }
      ];

      await FollowupQuiz.insertMany(defaultFollowUps);
      quizzes = await FollowupQuiz.find({}).sort({ createdAt: 1 }).lean();
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching all follow-up quizzes:', error);
    res.status(500).json({ message: 'Server error fetching follow-up quizzes' });
  }
};

/**
 * @desc Toggle availability of a follow-up quiz for students
 * @route PUT /api/followup/:id/toggle
 */
const toggleFollowUpAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    let quiz = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      quiz = await FollowupQuiz.findById(id);
    }
    if (!quiz) {
      quiz = await FollowupQuiz.findOne({ quizCode: id });
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Follow-up quiz not found' });
    }

    quiz.isAvailable = !quiz.isAvailable;
    await quiz.save();

    res.status(200).json({
      message: `Follow-up quiz ${quiz.quizCode} is now ${quiz.isAvailable ? 'Available' : 'Hidden'} for students.`,
      quiz
    });
  } catch (error) {
    console.error('Error toggling follow-up quiz availability:', error);
    res.status(500).json({ message: 'Server error toggling availability' });
  }
};

/**
 * @desc Delete a follow-up quiz
 * @route DELETE /api/followup/:id
 */
const deleteFollowUpQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await FollowupQuiz.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await FollowupQuiz.findOneAndDelete({ quizCode: id });
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Follow-up quiz not found' });
    }

    res.status(200).json({ message: 'Follow-up quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting follow-up quiz:', error);
    res.status(500).json({ message: 'Server error deleting follow-up quiz' });
  }
};

/**
 * @desc Toggle availability of all follow-up quizzes at once
 * @route PUT /api/followup/toggle-all
 */
const toggleAllFollowUpAvailability = async (req, res) => {
  try {
    const { targetState } = req.body;
    const isAvailable = typeof targetState === 'boolean' ? targetState : true;
    await FollowupQuiz.updateMany({}, { isAvailable });
    res.status(200).json({
      message: `All follow-up quizzes have been ${isAvailable ? 'enabled' : 'disabled'} for students.`
    });
  } catch (error) {
    console.error('Error toggling all follow-up quizzes:', error);
    res.status(500).json({ message: 'Server error toggling all follow-up quizzes' });
  }
};

const getFilterForGroup = (quizNumber) => {
  if (Number(quizNumber) === 1) {
    return {
      $or: [
        { moduleId: '6a3671282181b4065bba4afc' },
        { quizCode: { $regex: /6a3671282181b4065bba4afc|FQ1|MODULE_1/i } },
        { title: { $regex: /Fundamentals|Quiz 1/i } }
      ]
    };
  } else {
    return {
      $or: [
        { moduleId: '6a33c6b4d67ba7d81f63916b' },
        { quizCode: { $regex: /6a33c6b4d67ba7d81f63916b|FQ2|MODULE_2/i } },
        { title: { $regex: /Information|Quiz 2/i } }
      ]
    };
  }
};

/**
 * @desc Get status of Follow-Up Quiz 1 and Follow-Up Quiz 2
 * @route GET /api/followup/group-status
 */
const getFollowUpGroupStatus = async (req, res) => {
  try {
    const q1List = await FollowupQuiz.find(getFilterForGroup(1)).lean();
    const q2List = await FollowupQuiz.find(getFilterForGroup(2)).lean();

    const quiz1Available = q1List.length === 0 || q1List.every(q => q.isAvailable !== false);
    const quiz2Available = q2List.length === 0 || q2List.every(q => q.isAvailable !== false);

    res.status(200).json({
      quiz1: {
        quizNumber: 1,
        title: 'Follow-Up Quiz 1 (Fundamentals of a Computer System)',
        isAvailable: quiz1Available,
        totalCount: q1List.length
      },
      quiz2: {
        quizNumber: 2,
        title: 'Follow-Up Quiz 2 (Information and Communication Technology)',
        isAvailable: quiz2Available,
        totalCount: q2List.length
      }
    });
  } catch (error) {
    console.error('Error getting follow-up group status:', error);
    res.status(500).json({ message: 'Server error fetching group status' });
  }
};

/**
 * @desc Toggle availability of Follow-Up Quiz 1 or Follow-Up Quiz 2 for all students
 * @route PUT /api/followup/toggle-group
 */
const toggleFollowUpQuizGroup = async (req, res) => {
  try {
    const { quizNumber, targetState } = req.body;
    const num = Number(quizNumber);
    if (num !== 1 && num !== 2) {
      return res.status(400).json({ message: 'Invalid quizNumber. Must be 1 or 2.' });
    }
    const filter = getFilterForGroup(num);
    const isAvailable = typeof targetState === 'boolean' ? targetState : true;

    await FollowupQuiz.updateMany(filter, { isAvailable });

    res.status(200).json({
      message: `Follow-Up Quiz ${num} is now ${isAvailable ? 'Allowed' : 'Disabled'} for all students.`,
      quizNumber: num,
      isAvailable
    });
  } catch (error) {
    console.error('Error toggling follow-up quiz group:', error);
    res.status(500).json({ message: 'Server error toggling group availability' });
  }
};

module.exports = {
  getOrGenerateFollowUpQuiz,
  submitFollowUpQuiz,
  generateFollowUpQuiz,
  getAllFollowUpQuizzes,
  toggleFollowUpAvailability,
  toggleAllFollowUpAvailability,
  getFollowUpGroupStatus,
  toggleFollowUpQuizGroup,
  deleteFollowUpQuiz
};
