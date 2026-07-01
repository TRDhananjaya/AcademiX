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

    // Call RAG Service (FastAPI)
    const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:8000';
    const requestBody = {
      studentId: studentId,
      module: lesson.title, // passing lesson title as module context for AI
      score: averageScore,
      lessonId: lessonId.toString()
    };

    console.log('[StudyPlanService] Calling RAG service with:', requestBody);
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
    const studentUser = await Student.findOne({ studentId });
    if (studentUser) {
      const linkedUser = await User.findOne({ email: studentUser.email });
      if (linkedUser) {
        const studentNotification = new Notification({
          recipientId: linkedUser._id,
          recipientRole: 'student',
          title: 'AI Study Plan Ready',
          message: `Your personalized AI Study Plan for "${lesson.title}" has been generated successfully.`,
          notificationType: 'StudyPlanGenerated',
          relatedLessonId: lessonId,
          relatedStudentId: studentId,
          status: 'N/A'
        });
        await studentNotification.save();
        console.log(`[StudyPlanService] Notification sent to student ${studentId}`);
      }
    }
  } catch (error) {
    console.error('[StudyPlanService] Unexpected error:', error);
  }
};

module.exports = {
  generateStudyPlanAsync
};
