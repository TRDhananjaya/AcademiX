const StudyPlan = require('../models/StudyPlan');
const Student = require('../models/Student');
const User = require('../models/User');
const puppeteer = require('puppeteer');
const { generatePdfTemplate } = require('../utils/pdfTemplate');

// @desc    Get study plans for the logged-in student
// @route   GET /api/study-plans
// @access  Private
const getStudyPlans = async (req, res) => {
  try {
    // If the logged in user is a student, we might need to find their Student record first
    let studentIdsToQuery = [];
    if (req.user.role === 'student') {
      if (req.user.username) {
        studentIdsToQuery.push(req.user.username);
      }
      // Use userId reference for reliable lookup
      const student = await Student.findOne({ userId: req.user._id });
      if (student && student.studentId) {
        studentIdsToQuery.push(student.studentId);
      } else {
        // Fallback for legacy records without userId
        const studentByEmail = await Student.findOne({ email: req.user.email });
        if (studentByEmail && studentByEmail.studentId) {
          studentIdsToQuery.push(studentByEmail.studentId);
        }
      }
    }
    
    // Fallback: maybe they query by passing studentId in query string?
    if (studentIdsToQuery.length === 0 && req.query.studentId) {
      studentIdsToQuery.push(req.query.studentId);
    }

    if (studentIdsToQuery.length === 0) {
      return res.status(400).json({ message: 'Could not determine student ID for study plans' });
    }

    const studyPlans = await StudyPlan.find({ studentId: { $in: studentIdsToQuery } })
      .populate('lessonId', 'title description')
      .sort({ createdAt: -1 });

    // Deduplicate so each lesson only returns the latest study plan
    const uniquePlansMap = new Map();
    studyPlans.forEach(plan => {
      const lessonKey = plan.lessonId?._id?.toString() || plan.lessonId?.toString() || plan._id.toString();
      if (!uniquePlansMap.has(lessonKey)) {
        uniquePlansMap.set(lessonKey, plan);
      }
    });
    const uniqueStudyPlans = Array.from(uniquePlansMap.values());

    res.status(200).json(uniqueStudyPlans);
  } catch (error) {
    console.error('Error fetching study plans:', error);
    res.status(500).json({ message: 'Server error while fetching study plans' });
  }
};

// @desc    Generate PDF for a study plan
// @route   POST /api/study-plans/pdf
// @access  Private
const generateStudyPlanPdf = async (req, res) => {
  try {
    const { planData, user } = req.body;
    if (!planData) {
      return res.status(400).json({ message: 'Missing study plan data' });
    }

    // 1. Generate HTML string from markdown and data
    const html = generatePdfTemplate(planData, user);

    // 2. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // 3. Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      }
    });

    await browser.close();

    // Safely format the filename to avoid HTTP Header errors
    const rawTitle = planData.lessonId?.title || 'Report';
    const safeTitle = rawTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim().replace(/\s+/g, '_');

    // 4. Send PDF to client
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="StudyPlan_${safeTitle}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    res.status(500).json({ message: error.message || 'Failed to generate PDF' });
  }
};

// @desc    Recover missing study plans for a student
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
       const sampleResult = await QuizResult.findOne({ studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') } });
       if (sampleResult) {
           targetStudentName = sampleResult.studentName;
       }
    }

    console.log(`[StudyPlanRecovery] Starting recovery for student: ${targetStudentId}`);

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

        const studentResults = await QuizResult.find({
          studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
          quizId: { $in: quizCodes }
        });

        const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

        // If fully completed
        if (completedQuizCodes.length === quizCodes.length) {
          completedLessonsCount++;
          
          const existingPlan = await StudyPlan.findOne({
            studentId: { $regex: new RegExp(`^${targetStudentId}$`, 'i') },
            lessonId: lesson._id
          });

          if (existingPlan) {
            existingPlansCount++;
            console.log(`[StudyPlanRecovery] Lesson ${lesson.title} -> Study Plan already exists.`);
          } else {
            console.log(`[StudyPlanRecovery] Lesson ${lesson.title} -> Missing Study Plan detected. Triggering generation.`);
            
            // Trigger asynchronous generation
            // The generation logic includes an in-memory duplicate lock and a 429 quota exception catcher
            generateStudyPlanAsync(targetStudentId, targetStudentName, lesson._id.toString())
               .catch(err => console.error(`[StudyPlanRecovery] Generation error for lesson ${lesson.title}:`, err));
               
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
        ? `Triggered recovery for ${generatedPlansCount} missing study plan(s).` 
        : 'All completed lessons already have a study plan.'
    });

  } catch (error) {
    console.error('[StudyPlanRecovery] Error:', error);
    res.status(500).json({ message: 'Server error during study plan recovery' });
  }
};

module.exports = {
  getStudyPlans,
  generateStudyPlanPdf,
  recoverMissingStudyPlans
};
