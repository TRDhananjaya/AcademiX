const fs = require('fs');

const path = 'backend/controllers/quizResultController.js';
let code = fs.readFileSync(path, 'utf8');

const target = `    // --- START AI STUDY PLAN WORKFLOW LOGIC ---
    try {
      const Module = require('../models/Module');
      const Lesson = require('../models/Lesson');
      const StudyPlan = require('../models/StudyPlan');
      const Notification = require('../models/Notification');
      const User = require('../models/User');

      let currentModule = null;
      if (mongoose.Types.ObjectId.isValid(quiz.moduleId)) {
         currentModule = await Module.findById(quiz.moduleId);
      } else if (typeof quiz.moduleId === 'string' && quiz.moduleId.startsWith('MODULE_')) {
         const parts = quiz.moduleId.split('_');
         if (parts.length >= 3) {
            const modulePrefix = \`Module \${parts[1]}.\${parts[2]}\`;
            currentModule = await Module.findOne({ title: { $regex: \`^\${modulePrefix}\`, $options: 'i' } });
         }
      }

      if (currentModule && currentModule.lessonId) {
        // Find all modules for this lesson
        const lessonModules = await Module.find({ lessonId: currentModule.lessonId });
        const moduleIds = lessonModules.map(m => m._id.toString());
        
        const stringModuleIds = lessonModules.map(m => {
           const match = m.title.match(/Module\\s+(\\d+)\\.(\\d+)/i);
           if (match) {
              return \`MODULE_\${match[1]}_\${match[2]}\`;
           }
           return null;
        }).filter(Boolean);
        
        // Find all quizzes for these modules
        const lessonQuizzes = await Quiz.find({ 
          $or: [
             { moduleId: { $in: moduleIds } },
             { moduleId: { $in: lessonModules.map(m => m._id) } },
             { moduleId: { $in: stringModuleIds } }
          ]
        });

        if (lessonQuizzes.length > 0) {
          const quizCodes = lessonQuizzes.map(q => q.quizCode);
          
          // Find all results for this student on these quizzes
          const targetStudentId = (studentId || '').trim();
          const studentResults = await QuizResult.find({
            studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
            quizId: { $in: quizCodes }
          });

          // Unique completed quizzes by this student
          const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

          // Check if all quizzes are completed
          if (completedQuizCodes.length === quizCodes.length) {
            // Verify no pending notification or generated study plan already exists
            const existingPlan = await StudyPlan.findOne({
              studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
              lessonId: currentModule.lessonId
            });

            const existingNotification = await Notification.findOne({
              relatedStudentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
              relatedLessonId: currentModule.lessonId,
              notificationType: 'StudyPlanApproval',
              status: { $in: ['Pending', 'Approved'] }
            });

            if (!existingPlan && !existingNotification) {
              const { generateStudyPlanAsync } = require('../services/studyPlanService');
              
              // Trigger the AI study plan generation in the background!
              // We do not await this, so the quiz submission HTTP request completes immediately.
              generateStudyPlanAsync(studentId, studentName, currentModule.lessonId)
                .catch(err => console.error('Background study plan generation failed:', err));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error triggering study plan workflow:', err);
    }`;

const replacement = `    // --- START AI STUDY PLAN WORKFLOW LOGIC ---
    try {
      const Module = require('../models/Module');
      const Lesson = require('../models/Lesson');
      const StudyPlan = require('../models/StudyPlan');
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      
      const targetStudentId = (studentId || '').trim();

      // Find ALL lessons
      const allLessons = await Lesson.find({});

      for (const lesson of allLessons) {
        // Find all modules for this lesson
        const lessonModules = await Module.find({ lessonId: lesson._id });
        if (lessonModules.length === 0) continue;

        const moduleIds = lessonModules.map(m => m._id.toString());
        
        const stringModuleIds = lessonModules.map(m => {
           const match = m.title.match(/Module\\s+(\\d+)\\.(\\d+)/i);
           if (match) {
              return \`MODULE_\${match[1]}_\${match[2]}\`;
           }
           return null;
        }).filter(Boolean);
        
        // Find all quizzes for these modules
        const lessonQuizzes = await Quiz.find({ 
          $or: [
             { moduleId: { $in: moduleIds } },
             { moduleId: { $in: lessonModules.map(m => m._id) } },
             { moduleId: { $in: stringModuleIds } }
          ]
        });

        if (lessonQuizzes.length > 0) {
          const quizCodes = lessonQuizzes.map(q => q.quizCode);
          
          // Find all results for this student on these quizzes
          const studentResults = await QuizResult.find({
            studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
            quizId: { $in: quizCodes }
          });

          // Unique completed quizzes by this student
          const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

          // Check if all quizzes are completed
          if (completedQuizCodes.length === quizCodes.length) {
            // Verify no pending notification or generated study plan already exists for this lesson
            const existingPlan = await StudyPlan.findOne({
              studentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
              lessonId: lesson._id
            });

            const existingNotification = await Notification.findOne({
              relatedStudentId: { $regex: new RegExp(\`^\${targetStudentId}$\`, 'i') },
              relatedLessonId: lesson._id,
              notificationType: 'StudyPlanApproval',
              status: { $in: ['Pending', 'Approved', 'StudyPlanGenerated'] } // Including StudyPlanGenerated as generated status
            });

            if (!existingPlan && !existingNotification) {
              const { generateStudyPlanAsync } = require('../services/studyPlanService');
              
              // Trigger the AI study plan generation in the background!
              console.log(\`[StudyPlan Workflow] Triggering plan generation for student \${studentId}, lesson \${lesson.title}\`);
              generateStudyPlanAsync(studentId, studentName, lesson._id.toString())
                .catch(err => console.error('Background study plan generation failed:', err));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error triggering study plan workflow:', err);
    }`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
