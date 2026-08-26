const fs = require('fs');

const path = 'backend/services/studyPlanService.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix Notification
code = code.replace("status: 'Unread'", "status: 'Pending'");
code = code.replace("status: 'Unread' // Fixed from 'N/A' which might be invalid", "status: 'Pending'");

// 2. Add Duplicate Check
const target = `const generateStudyPlanAsync = async (studentId, studentName, lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);`;

const replacement = `const generateStudyPlanAsync = async (studentId, studentName, lessonId) => {
  try {
    // STRICT DUPLICATE PREVENTION: Check if a plan already exists
    const existingPlan = await StudyPlan.findOne({
      studentId: { $regex: new RegExp(\`^\${studentId}$\`, 'i') },
      lessonId: lessonId
    });

    if (existingPlan) {
      console.log(\`[StudyPlanService] Plan already exists for student: \${studentId}, lesson: \${lessonId}. Aborting generation.\`);
      return;
    }

    const lesson = await Lesson.findById(lessonId);`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
