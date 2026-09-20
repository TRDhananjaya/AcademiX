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
    const targetStudentId = (studentId || '').trim();

    // 1. PREVENT FUTURE DUPLICATE GENERATION
    const existingPlan = await StudyPlan.findOne({
      studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
      lessonId: lessonId
    });

    if (existingPlan) {
      console.log(`[StudyPlanService] Study plan already exists for student ${targetStudentId} and lesson ${lessonId}. Skipping generation.`);
      return existingPlan;
    }

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
      studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
      quizId: { $in: quizCodes }
    });

    let totalScore = 0;
    let totalQuestions = 0;
    studentResults.forEach(r => {
      totalScore += (r.correctAnswers || 0);
      totalQuestions += (r.totalQuestions || 0);
    });
    
    let averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

    // Build a lookup map: questionId (string) → { text, options, correctOption }
    // from the already-loaded Quiz documents so we can resolve option indices to text
    const questionLookup = {};
    lessonQuizzes.forEach(q => {
       if (q.questions && q.questions.length > 0) {
          q.questions.forEach(qn => {
             if (qn._id) {
                questionLookup[qn._id.toString()] = {
                   text: qn.text,
                   options: qn.options || [],
                   correctOption: qn.correctOption
                };
             }
          });
       }
    });

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
       let answersAnalysis = [];

       moduleQuizzes.forEach(q => {
          const result = studentResults.find(r => r.quizId === q.quizCode);
          if (result) {
             mScore += (result.correctAnswers || 0);
             mTotal += (result.totalQuestions || 0);
             
             if (result.answersDetails && result.answersDetails.length > 0) {
                result.answersDetails.forEach(ans => {
                   // Legacy: keep the text-only incorrect_questions for backward compatibility
                   if (!ans.isCorrect) {
                      incorrectQuestions.push(ans.questionText);
                   }

                   // New: build rich answer analysis with resolved option text
                   const qId = ans.questionId ? ans.questionId.toString() : null;
                   const quizQuestion = qId ? questionLookup[qId] : null;

                   let studentAnswerText = null;
                   let correctAnswerText = null;

                   if (quizQuestion && quizQuestion.options && quizQuestion.options.length > 0) {
                      // Safely resolve selectedOption index to text
                      if (typeof ans.selectedOption === 'number' && 
                          ans.selectedOption >= 0 && 
                          ans.selectedOption < quizQuestion.options.length) {
                         studentAnswerText = quizQuestion.options[ans.selectedOption];
                      } else {
                         console.warn(`[StudyPlanService] Could not resolve selectedOption=${ans.selectedOption} for questionId=${qId} (options length: ${quizQuestion.options.length})`);
                      }

                      // Safely resolve correctOption index to text
                      if (typeof ans.correctOption === 'number' && 
                          ans.correctOption >= 0 && 
                          ans.correctOption < quizQuestion.options.length) {
                         correctAnswerText = quizQuestion.options[ans.correctOption];
                      } else {
                         console.warn(`[StudyPlanService] Could not resolve correctOption=${ans.correctOption} for questionId=${qId} (options length: ${quizQuestion.options.length})`);
                      }
                   } else {
                      if (qId) {
                         console.warn(`[StudyPlanService] Question not found in Quiz lookup for questionId=${qId}`);
                      }
                   }

                   // Only include in analysis if we successfully resolved both answer texts
                   if (studentAnswerText !== null && correctAnswerText !== null) {
                      answersAnalysis.push({
                         questionText: ans.questionText || '',
                         studentAnswer: studentAnswerText,
                         correctAnswer: correctAnswerText,
                         isCorrect: ans.isCorrect
                      });
                   } else if (ans.questionText) {
                      // Fallback: include question text without answer details
                      // so Gemini still knows the question but cannot assume the specific misconception
                      answersAnalysis.push({
                         questionText: ans.questionText,
                         studentAnswer: 'Unable to resolve',
                         correctAnswer: 'Unable to resolve',
                         isCorrect: ans.isCorrect
                      });
                   }
                });
             }
          }
       });

       const mScorePct = mTotal > 0 ? (mScore / mTotal) * 100 : 0;
       
       modulesData.push({
          module_id: moduleIdStr,
          score: mScorePct,
          incorrect_questions: incorrectQuestions,
          answers_analysis: answersAnalysis
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

    // Save the study plan securely to prevent duplicates
    let studyPlan;
    try {
      studyPlan = new StudyPlan({
        studentId: targetStudentId,
        lessonId: lessonId,
        generatedStudyPlan: studyPlanData.studyPlan,
        status: 'Active'
      });
      await studyPlan.save();
      console.log(`[StudyPlanService] Saved study plan ${studyPlan._id} for student ${targetStudentId}`);
    } catch (dbError) {
      if (dbError.code === 11000) {
        console.warn(`[StudyPlanService] Race condition prevented. Study plan already saved for student ${targetStudentId} and lesson ${lessonId}.`);
        return await StudyPlan.findOne({
          studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
          lessonId: lessonId
        });
      }
      throw dbError;
    }

    // Create notification for the student
    let linkedUser = null;
    const studentRecord = await Student.findOne({ studentId: targetStudentId }).populate('userId');
    if (studentRecord && studentRecord.userId) {
      linkedUser = studentRecord.userId;
    } else {
      // Fallback for legacy records: try matching by username
      linkedUser = await User.findOne({ username: targetStudentId.toLowerCase() });
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
        status: 'Pending' // Fixed from 'N/A' which might be invalid
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
