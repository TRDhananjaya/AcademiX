const mongoose = require('mongoose');
const uri = 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const Module = mongoose.model('Module', new mongoose.Schema({}, { strict: false }));
  const Lesson = mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }), 'quizzes');
  const QuizResult = mongoose.model('QuizResult', new mongoose.Schema({}, { strict: false }), 'quizz_results');
  const StudyPlan = mongoose.model('StudyPlan', new mongoose.Schema({}, { strict: false }));

  const quiz = await Quiz.findOne({ quizCode: 'Q1.3' });
  const studentId = 'st059';
  const studentName = 'st059';
  
  let currentModule = null;
  if (mongoose.Types.ObjectId.isValid(quiz.moduleId)) {
      currentModule = await Module.findById(quiz.moduleId);
  } else if (typeof quiz.moduleId === 'string' && quiz.moduleId.startsWith('MODULE_')) {
      const parts = quiz.moduleId.split('_');
      if (parts.length >= 3) {
        const modulePrefix = `Module ${parts[1]}.${parts[2]}`;
        currentModule = await Module.findOne({ title: { $regex: `^${modulePrefix}`, $options: 'i' } });
      }
  }

  if (currentModule && currentModule.lessonId) {
    const lessonModules = await Module.find({ lessonId: currentModule.lessonId });
    const moduleIds = lessonModules.map(m => m._id.toString());
    const stringModuleIds = lessonModules.map(m => {
       const match = m.title.match(/Module\s+(\d+)\.(\d+)/i);
       if (match) return `MODULE_${match[1]}_${match[2]}`;
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
      const studentResults = await QuizResult.find({ studentId, quizId: { $in: quizCodes } });
      const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];
      
      console.log('Quizzes for lesson:', quizCodes);
      console.log('Completed by ST059:', completedQuizCodes);
      
      if (completedQuizCodes.length === quizCodes.length) {
         console.log('ALL COMPLETED!');
         const existingPlan = await StudyPlan.findOne({ studentId, lessonId: currentModule.lessonId });
         const existingNotification = await Notification.findOne({
            relatedStudentId: studentId,
            relatedLessonId: currentModule.lessonId,
            notificationType: 'StudyPlanApproval',
            status: { $in: ['Pending', 'Approved'] }
         });
         
         console.log('Existing Plan:', !!existingPlan, 'Existing Notification:', !!existingNotification);
         
         if (!existingPlan && !existingNotification) {
            const lesson = await Lesson.findById(currentModule.lessonId);
            const lessonName = lesson ? lesson.title : 'the lesson';
            const teachers = await User.find({ role: 'teacher' });
            
            if (teachers.length > 0) {
              console.log('Would insert notifications for', teachers.length, 'teachers');
              const notificationsToCreate = teachers.map(teacher => ({
                  recipientId: teacher._id,
                  recipientRole: 'teacher',
                  title: 'Study Plan Approval Needed',
                  message: `Student ${studentName || studentId} has completed all quizzes for "${lessonName}". Would you like to generate a personalized AI Study Plan?`,
                  notificationType: 'StudyPlanApproval',
                  relatedLessonId: currentModule.lessonId,
                  relatedStudentId: studentId,
                  status: 'Pending'
                }));
              // Insert!
              await Notification.insertMany(notificationsToCreate);
              console.log('Inserted notifications!');
            }
         }
      }
    }
  }

  mongoose.disconnect();
}).catch(console.error);
