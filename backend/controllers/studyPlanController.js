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
      const student = await Student.findOne({ email: req.user.email });
      if (student && student.studentId) {
        studentIdsToQuery.push(student.studentId);
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

    res.status(200).json(studyPlans);
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

module.exports = {
  getStudyPlans,
  generateStudyPlanPdf
};
