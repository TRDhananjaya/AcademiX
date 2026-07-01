const Notification = require('../models/Notification');
const StudyPlan = require('../models/StudyPlan');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Verify ownership
    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve Study Plan generation
// @route   POST /api/notifications/:id/approve
// @access  Private
const approveStudyPlan = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (notification.notificationType !== 'StudyPlanApproval') {
      return res.status(400).json({ message: 'Invalid notification type' });
    }
    if (notification.status === 'Approved') {
      return res.status(400).json({ message: 'Already approved' });
    }

    // 1. Mark as approved
    notification.status = 'Approved';
    notification.isRead = true;
    await notification.save();

    // 2. Gather data for RAG Service
    const studentId = notification.relatedStudentId;
    const lessonId = notification.relatedLessonId;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Related lesson not found' });
    }

    // Calculate average score for the lesson
    const lessonModules = await Module.find({ lessonId });
    const moduleIds = lessonModules.map(m => m._id.toString());
    
    const lessonQuizzes = await Quiz.find({ 
      $or: [
          { moduleId: { $in: moduleIds } },
          { moduleId: { $in: lessonModules.map(m => m._id) } }
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

    // 3. Call RAG Service (FastAPI)
    const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:8000';
    const requestBody = {
      studentId: studentId,
      module: lesson.title, // passing lesson title as module context for AI
      score: averageScore,
      lessonId: lessonId.toString()
    };

    console.log('Calling RAG service with:', requestBody);
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
      console.error('Error calling RAG service:', apiError);
      return res.status(500).json({ message: 'Failed to communicate with AI service', error: apiError.message });
    }

    if (!studyPlanData || !studyPlanData.success) {
      return res.status(500).json({ message: 'AI service failed to generate a plan' });
    }

    // 4. Save the generated study plan
    const newStudyPlan = new StudyPlan({
      studentId,
      lessonId,
      generatedStudyPlan: studyPlanData.studyPlan,
      generatedBy: req.user._id,
      status: 'Active'
    });
    
    await newStudyPlan.save();

    // 5. Create notification for the student
    const studentUser = await Student.findOne({ studentId });
    if (studentUser) {
      // Find the user account linked to this student to get the recipientId
      // Sometimes email links them, but for now we create a notification where we can search by studentId later
      const linkedUser = await require('../models/User').findOne({ email: studentUser.email });
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
      }
    }

    res.status(200).json({ message: 'Study plan generated and saved successfully', studyPlan: newStudyPlan });
  } catch (error) {
    console.error('Error approving study plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  approveStudyPlan
};
