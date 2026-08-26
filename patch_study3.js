const fs = require('fs');

const path = 'backend/services/studyPlanService.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Add global Set for in-flight requests
const targetHeader = `const StudyPlan = require('../models/StudyPlan');
const Notification = require('../models/Notification');
const User = require('../models/User');`;

const replacementHeader = `const StudyPlan = require('../models/StudyPlan');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Track in-flight study plan generations to prevent duplicates
const inProgressGenerations = new Set();`;

if (!code.includes('inProgressGenerations = new Set()')) {
    code = code.replace(targetHeader, replacementHeader);
}

// 2. Wrap generateStudyPlanAsync logic to check the Set
const targetFunctionStart = `    // STRICT DUPLICATE PREVENTION: Check if a plan already exists
    const existingPlan = await StudyPlan.findOne({`;

const replacementFunctionStart = `    const generationKey = \`\${studentId}_\${lessonId}\`;
    
    if (inProgressGenerations.has(generationKey)) {
      console.log(\`[StudyPlanService] Generation already in progress for student: \${studentId}, lesson: \${lessonId}. Skipping.\`);
      return;
    }
    
    inProgressGenerations.add(generationKey);
    
    try {
      // STRICT DUPLICATE PREVENTION: Check if a plan already exists
      const existingPlan = await StudyPlan.findOne({`;

// 3. Close the try-finally block at the end of generateStudyPlanAsync
const targetFunctionEnd = `      await studentNotification.save();
      console.log(\`[StudyPlanService] Notification sent to student \${studentId}\`);
    }

  } catch (err) {
    console.error(\`[StudyPlanService] Error in background generation:\`, err);
  }
};`;

const replacementFunctionEnd = `      await studentNotification.save();
      console.log(\`[StudyPlanService] Notification sent to student \${studentId}\`);
    }

  } catch (err) {
    console.error(\`[StudyPlanService] Error in background generation:\`, err);
  } finally {
    inProgressGenerations.delete(generationKey);
  }
};`;

code = code.replace(targetFunctionStart, replacementFunctionStart);
code = code.replace(targetFunctionEnd, replacementFunctionEnd);

// 4. Handle 429 specifically in fetch response
const targetFetch = `      if (!response.ok) {
        throw new Error(\`RAG service responded with status \${response.status}\`);
      }`;

const replacementFetch = `      if (response.status === 429) {
        console.error('[StudyPlanService] RAG Service returned 429: Gemini quota exhausted. Plan not generated, quiz result is safe.');
        return; // gracefully exit without throwing, so we can retry later safely
      }
      
      if (!response.ok) {
        throw new Error(\`RAG service responded with status \${response.status}\`);
      }`;

code = code.replace(targetFetch, replacementFetch);

fs.writeFileSync(path, code);
