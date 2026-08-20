const fs = require('fs');

const path = 'backend/controllers/studyPlanController.js';
let code = fs.readFileSync(path, 'utf8');

const targetFunction = `// @desc    Generate PDF for a study plan`;

const replacementFunction = `// @desc    Recover missing study plans for a student
// @route   POST /api/study-plans/recover-missing
// @access  Private
const recoverMissingStudyPlans = async (req, res) => {
  try {
    let targetStudentId = req.body.studentId;
    let targetStudentName = 'Unknown Student';

    // If studentId not provided, deduce it from logged in user (if they are a student)
    if (!targetStudentId && req.user && req.user.role === 'student') {
      const studentRecord = await Student.findOne({ userId: req.user._id }) || await Student.findOne({ email: req.user.email });
      if (studentRecord) {
        targetStudentId = studentRecord.studentId;
        targetStudentName = studentRecord.name;
      } else {
        targetStudentId = req.user.username;
      }
    }

    if (!targetStudentId) {
      return res.status(400).json({ message: 'studentId is required or could not be determined.' });
    }

    // Try to get a proper name if we only have the ID
    if (targetStudentName === 'Unknown Student') {
       const QuizResult = require('../models/QuizResult');
       const sampleResult = await QuizResult.findOne({ studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') } });
       if (sampleResult) {
           targetStudentName = sampleResult.studentName;
       }
    }

    console.log(\`[StudyPlanRecovery] Starting recovery for student: \${targetStudentId}\`);

    const QuizResult = require('../models/QuizResult');
    const Quiz = require('../models/Quiz');
    const Lesson = require('../models/Lesson');
    const Module = require('../models/Module');
    const { generateStudyPlanAsync } = require('../services/studyPlanService');

    const allLessons = await Lesson.find({});
    
    let completedLessonsCount = 0;
    let existingPlansCount = 0;
    let generatedPlansCount = 0;

    for (const lesson of allLessons) {
      const lessonModules = await Module.find({ lessonId: lesson._id });
      if (lessonModules.length === 0) continue;

      const moduleIds = lessonModules.map(m => m._id.toString());
      const stringModuleIds = lessonModules.map(m => {
        const match = m.title.match(/Module\\s+(\\d+)\\.(\\d+)/i);
        if (match) return \`MODULE_\${match[1]}_\${match[2]}\`;
        return null;
      }).filter(Boolean);

      const lessonQuizzes = await Quiz.find({
        $or: [
          { moduleId: { $in: moduleIds } },
          { moduleId: { $in: lessonModules.map(m => m._id) } },
          { moduleId: { $in: stringModuleIds } }
        ]
      });

      if (lessonQuizzes.length > 0) {
        const quizCodes = lessonQuizzes.map(q => q.quizCode);

        const studentResults = await QuizResult.find({
          studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
          quizId: { $in: quizCodes }
        });

        const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

        // If fully completed
        if (completedQuizCodes.length === quizCodes.length) {
          completedLessonsCount++;
          
          const existingPlan = await StudyPlan.findOne({
            studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
            lessonId: lesson._id
          });

          if (existingPlan) {
            existingPlansCount++;
            console.log(\`[StudyPlanRecovery] Lesson \${lesson.title} -> Study Plan already exists.\`);
          } else {
            console.log(\`[StudyPlanRecovery] Lesson \${lesson.title} -> Missing Study Plan detected. Triggering generation.\`);
            
            // Trigger asynchronous generation
            // The generation logic includes an in-memory duplicate lock and a 429 quota exception catcher
            generateStudyPlanAsync(targetStudentId, targetStudentName, lesson._id.toString())
               .catch(err => console.error(\`[StudyPlanRecovery] Generation error for lesson \${lesson.title}:\`, err));
               
            generatedPlansCount++;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      studentId: targetStudentId,
      completedLessons: completedLessonsCount,
      existingPlans: existingPlansCount,
      generatedPlans: generatedPlansCount,
      message: generatedPlansCount > 0 
        ? \`Triggered recovery for \${generatedPlansCount} missing study plan(s).\` 
        : 'All completed lessons already have a study plan.'
    });

  } catch (error) {
    console.error('[StudyPlanRecovery] Error:', error);
    res.status(500).json({ message: 'Server error during study plan recovery' });
  }
};

// @desc    Generate PDF for a study plan`;

code = code.replace(targetFunction, replacementFunction);

const targetExport = `module.exports = {
  getStudyPlans,
  generateStudyPlanPdf
};`;

const replacementExport = `module.exports = {
  getStudyPlans,
  generateStudyPlanPdf,
  recoverMissingStudyPlans
};`;

code = code.replace(targetExport, replacementExport);

fs.writeFileSync(path, code);
