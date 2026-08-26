const fs = require('fs');
let code = fs.readFileSync('backend/services/studyPlanService.js', 'utf8');

// 1. Notification Fix
code = code.replace("status: 'Unread'", "status: 'Pending'");

// 2. Duplicate Check Fix
const target = '    const newStudyPlan = new StudyPlan({';
const replacement = `    // STRICT DUPLICATE PREVENTION: Check if a plan already exists
    const existingPlan = await StudyPlan.findOne({
      studentId: { $regex: new RegExp(\`^\${studentId}$\`, 'i') },
      lessonId: lessonId
    });

    if (existingPlan) {
      console.log(\`[StudyPlanService] Plan already exists for student: \${studentId}, lesson: \${lessonId}. Aborting generation.\`);
      return;
    }

    const newStudyPlan = new StudyPlan({`;

code = code.replace(target, replacement);

fs.writeFileSync('backend/services/studyPlanService.js', code);
