const StudyPlan = require('../models/StudyPlan');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Asynchronously generates an AI Study Plan for a student who completed a lesson.
 * This function handles its own errors so it can be used as a background "fire-and-forget" task.
 * 
 * @param {String} studentId - The ID of the student
 * @param {String} studentName - The name of the student
 * @param {ObjectId} lessonId - The lesson they completed
 */
const generateStudyPlanAsync = async (studentId, studentName, lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.error(`[StudyPlanService] Lesson ${lessonId} not found`);
      return;
    }

    // Calculate average score for the lesson
    const lessonModules = await Module.find({ lessonId });
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
    const quizCodes = lessonQuizzes.map(q => q.quizCode);
    
    const studentResults = await QuizResult.find({
      studentId,
      quizId: { $in: quizCodes }
    });

    let totalScore = 0;
    let totalQuestions = 0;
    studentResults.forEach(r => {
      totalScore += (r.correctAnswers || 0);
      totalQuestions += (r.totalQuestions || 0);
    });
    
    let averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    let modulesData = [];
    
    lessonModules.forEach(m => {
       const match = m.title.match(/Module\s+(\d+)\.(\d+)/i);
       let moduleIdStr = "";
       if (match) {
         moduleIdStr = `${match[1]}.${match[2]}`; // e.g., "1.1"
       } else {
         moduleIdStr = m.title;
       }

       // find quizzes for this module
       const moduleQuizzes = lessonQuizzes.filter(q => 
           q.moduleId === m._id.toString() || 
           (match && q.moduleId === `MODULE_${match[1]}_${match[2]}`)
       );
       
       let mScore = 0;
       let mTotal = 0;
       let incorrectQuestions = [];

       moduleQuizzes.forEach(q => {
          const result = studentResults.find(r => r.quizId === q.quizCode);
          if (result) {
             mScore += (result.correctAnswers || 0);
             mTotal += (result.totalQuestions || 0);
             
             if (result.answersDetails && result.answersDetails.length > 0) {
                result.answersDetails.forEach(ans => {
                   if (!ans.isCorrect) {
                      incorrectQuestions.push(ans.questionText);
                   }
                });
             }
          }
       });

       const mScorePct = mTotal > 0 ? (mScore / mTotal) * 100 : 0;
       
       modulesData.push({
          module_id: moduleIdStr,
          score: mScorePct,
          incorrect_questions: incorrectQuestions
       });
    });

    // Call RAG Service (FastAPI)
    const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:8000';
    const requestBody = {
      studentId: studentId,
      overall_score: averageScore,
      lessonId: lessonId.toString(),
      modules_data: modulesData
    };

    console.log('[StudyPlanService] Calling RAG service with:', JSON.stringify(requestBody, null, 2));
    let studyPlanData;
    
    try {
      const response = await fetch(`${ragApiUrl}/generate_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`RAG service responded with status ${response.status}`);
      }
      
      studyPlanData = await response.json();
    } catch (apiError) {
      console.error('[StudyPlanService] Error calling RAG service:', apiError);
      return;
    }

    if (!studyPlanData || !studyPlanData.success) {
      console.error('[StudyPlanService] AI service failed to generate a plan');
      return;
    }

    // Save the generated study plan
    const newStudyPlan = new StudyPlan({
      studentId,
      lessonId,
      generatedStudyPlan: studyPlanData.studyPlan,
      // We don't have a specific req.user._id since this is automated
      // Let's set it to null or a system ID, or we can omit it if it's optional.
      status: 'Active'
    });
    
    await newStudyPlan.save();
    console.log(`[StudyPlanService] Saved generated study plan for student ${studentId}`);

    // Create notification for the student
    let linkedUser = null;
    const studentUser = await Student.findOne({ studentId });
    if (studentUser) {
      linkedUser = await User.findOne({ email: studentUser.email });
    } else {
      // Fallback: the frontend often sends user.username as studentId
      linkedUser = await User.findOne({ username: studentId });
    }

    if (linkedUser) {
      const studentNotification = new Notification({
        recipientId: linkedUser._id,
        recipientRole: 'student',
        title: 'AI Study Plan Ready',
        message: `Your personalized AI Study Plan for "${lesson.title}" has been generated successfully.`,
        notificationType: 'StudyPlanGenerated',
        relatedLessonId: lessonId,
        relatedStudentId: studentId,
        status: 'Unread' // Fixed from 'N/A' which might be invalid
      });
      await studentNotification.save();
      console.log(`[StudyPlanService] Notification sent to student ${studentId}`);
    }
  } catch (error) {
    console.error('[StudyPlanService] Unexpected error:', error);
  }
};

module.exports = {
  generateStudyPlanAsync
};
