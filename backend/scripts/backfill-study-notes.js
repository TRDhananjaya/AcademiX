const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const StudyPlan = require('../models/StudyPlan');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

const DRY_RUN = process.argv.includes('--dry-run');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 4) {
  let retries = 0;
  while (retries <= maxRetries) {
    const res = await fetch(url, options);
    if (res.ok) {
      return res;
    }
    
    if (res.status === 429) {
      if (retries === maxRetries) {
        throw new Error('RAG_RATE_LIMITED');
      }
      retries++;
      // Wait 10, 20, 40, 80 seconds
      const delaySeconds = 5 * Math.pow(2, retries);
      console.log(`[RAG] Gemini 429`);
      console.log(`[RAG] Waiting ${delaySeconds} seconds before retry ${retries}/${maxRetries}`);
      await wait(delaySeconds * 1000);
      continue;
    }
    
    throw new Error(`Status ${res.status}`);
  }
}

async function backfill() {
  console.log(`Starting backfill operation... DRY_RUN: ${DRY_RUN}`);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const plans = await StudyPlan.find({});
    console.log(`\nTotal Study Plans found: ${plans.length}`);

    let alreadyUpdated = 0;
    let successfullyUpdated = 0;
    let skippedNoIncorrect = 0;
    let skippedMissingData = 0;
    let parseFailures = 0;
    let ragFailures = 0;
    let rateLimited = 0;
    let otherErrors = 0;

    let index = 0;

    for (const plan of plans) {
      index++;
      console.log(`\n[Backfill] Processing ${index}/${plans.length}`);
      console.log(`[Backfill] StudentPlan: ${plan._id}`);

      // 4. Resume-safe behavior
      // If it already has exactly "PERSONALIZED STUDY NOTES", we consider it newly updated
      if (plan.generatedStudyPlan.includes('PERSONALIZED STUDY NOTES')) {
        console.log(`[Backfill] SKIPPED_ALREADY_UPDATED`);
        alreadyUpdated++;
        continue;
      }

      // 1. Data Collection
      const lessonId = plan.lessonId.toString();
      const targetStudentId = plan.studentId;
      
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        console.log(`[Backfill] SKIPPED - Missing Data (Lesson ${lessonId} not found)`);
        skippedMissingData++;
        continue;
      }

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

      if (!studentResults || studentResults.length === 0) {
        console.log(`[Backfill] SKIPPED - Missing Data (No QuizResult data for student ${targetStudentId})`);
        skippedMissingData++;
        continue;
      }

      let totalScore = 0;
      let totalQuestions = 0;
      studentResults.forEach(r => {
        totalScore += (r.correctAnswers || 0);
        totalQuestions += (r.totalQuestions || 0);
      });
      
      let averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
      
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
      let planHasIncorrectQuestions = false;
      
      lessonModules.forEach(m => {
         const match = m.title.match(/Module\s+(\d+)\.(\d+)/i);
         let moduleIdStr = "";
         if (match) {
           moduleIdStr = `${match[1]}.${match[2]}`; 
         } else {
           moduleIdStr = m.title;
         }

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
                     const qIdStr = ans.questionId ? ans.questionId.toString() : null;
                     const quizQ = qIdStr ? questionLookup[qIdStr] : null;

                     let studentAnsText = null;
                     let correctAnsText = null;
                     if (quizQ && quizQ.options && quizQ.options.length > 0) {
                         if (typeof ans.selectedOption === 'number' && ans.selectedOption >= 0 && ans.selectedOption < quizQ.options.length) {
                             studentAnsText = quizQ.options[ans.selectedOption];
                         }
                         if (typeof ans.correctOption === 'number' && ans.correctOption >= 0 && ans.correctOption < quizQ.options.length) {
                             correctAnsText = quizQ.options[ans.correctOption];
                         }
                     }

                     if (studentAnsText !== null && correctAnsText !== null) {
                         answersAnalysis.push({
                             questionText: ans.questionText || '',
                             studentAnswer: studentAnsText,
                             correctAnswer: correctAnsText,
                             isCorrect: ans.isCorrect
                         });
                     }

                     if (!ans.isCorrect) {
                        incorrectQuestions.push(ans.questionText);
                        planHasIncorrectQuestions = true;
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

      if (!planHasIncorrectQuestions) {
         console.log(`[Backfill] No answersDetails - Using Fallback`);
      }

      // 2. Original string parsing
      const oldPlan = plan.generatedStudyPlan;
      
      function replaceNotesSection(oldMarkdown, newMarkdown) {
         // Find what we want to insert
         let newStart = newMarkdown.search(/(?:^|\n)(?:#+|\*\*|^\d+\.)?\s*(?:4\.\s*|5\.\s*)?(?:PERSONALIZED STUDY NOTES|TOPICS TO FOCUS|KEY DEFINITIONS)/i);
         let newEnd = newMarkdown.search(/(?:^|\n)(?:#+|\*\*|^\d+\.)?\s*(?:6\.\s*)?(?:PERSONAL REVISION CHECKLIST|STUDY PLAN SCHEDULE|PRACTICE QUIZ|STUDY TIME|MOTIVATION)/i);
         
         if (newStart === -1) return null;
         let newContent = newEnd !== -1 ? newMarkdown.substring(newStart, newEnd) : newMarkdown.substring(newStart);

         // Find where to replace in OLD
         let oldStart = oldMarkdown.search(/(?:^|\n)(?:#+|\*\*|^\d+\.)?\s*(?:(?:4|5|2|3)\.\s*)?(?:PERSONALIZED STUDY NOTES|TOPICS TO FOCUS|KEY DEFINITIONS|WEAK TOPICS|KNOWLEDGE GAPS|CONCEPTS TO REVIEW)/i);
         let oldEnd = oldMarkdown.search(/(?:^|\n)(?:#+|\*\*|^\d+\.)?\s*(?:(?:6|7|8)\.\s*)?(?:PERSONAL REVISION CHECKLIST|STUDY PLAN SCHEDULE|PRACTICE QUIZ|STUDY TIME|MOTIVATION|STUDY SCHEDULE)/i);

         if (oldStart !== -1 && oldEnd !== -1 && oldEnd > oldStart) {
             return oldMarkdown.substring(0, oldStart) + '\n' + newContent.trim() + '\n\n' + oldMarkdown.substring(oldEnd).trim();
         } else if (oldStart !== -1) {
             return oldMarkdown.substring(0, oldStart) + '\n' + newContent.trim() + '\n';
         } else if (oldEnd !== -1) {
             return oldMarkdown.substring(0, oldEnd) + '\n' + newContent.trim() + '\n\n' + oldMarkdown.substring(oldEnd).trim();
         } else {
             return oldMarkdown + '\n\n' + newContent.trim() + '\n';
         }
      }

      const ragApiUrl = process.env.RAG_API_URL || 'http://localhost:8000';
      const requestBody = {
        studentId: targetStudentId,
        overall_score: averageScore,
        lessonId: lessonId.toString(),
        modules_data: modulesData
      };

      let newPlanResponse;
      if (DRY_RUN) {
        console.log(`[Backfill] RAG request started (DRY RUN)`);
        newPlanResponse = {
          success: true,
          studyPlan: "==================================================\n## 4. PERSONALIZED STUDY NOTES\n==================================================\nMock Notes\n==================================================\n## 6. PERSONAL REVISION CHECKLIST\n=================================================="
        };
        console.log(`[Backfill] RAG success`);
      } else {
        console.log(`[Backfill] RAG request started`);
        try {
          const response = await fetchWithRetry(`${ragApiUrl}/generate_plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          }, 4);
          newPlanResponse = await response.json();
          console.log(`[Backfill] RAG success`);
        } catch (err) {
          if (err.message === 'RAG_RATE_LIMITED') {
             console.log(`[Backfill] SKIPPED - RAG_RATE_LIMITED`);
             rateLimited++;
          } else {
             console.log(`[Backfill] SKIPPED - RAG Failure (${err.message})`);
             ragFailures++;
          }
          otherErrors++;
          continue;
        }
      }

      if (!newPlanResponse || !newPlanResponse.success || !newPlanResponse.studyPlan) {
        console.log(`[Backfill] SKIPPED - RAG Failure (Invalid Response)`);
        ragFailures++;
        otherErrors++;
        continue;
      }

      // 4. Safely Splice the new content into the existing plan
      const updatedPlanMarkdown = replaceNotesSection(oldPlan, newPlanResponse.studyPlan);

      if (!updatedPlanMarkdown) {
        console.log(`[Backfill] SKIPPED - Parse Failure (Could not parse boundaries)`);
        parseFailures++;
        otherErrors++;
        continue;
      }

      if (!DRY_RUN) {
        plan.generatedStudyPlan = updatedPlanMarkdown;
        await plan.save();
        console.log(`[Backfill] Updated successfully`);
        successfullyUpdated++;
        
        console.log(`[Backfill] Waiting 3 seconds before next request...`);
        await wait(3000);
      } else {
        console.log(`[Backfill] DRY RUN - Would update successfully`);
        successfullyUpdated++;
      }
    }

    console.log(`\n================================`);
    console.log(`FINAL REPORT`);
    console.log(`================================`);
    console.log(`Total Plans: ${plans.length}`);
    console.log(`Already Updated: ${alreadyUpdated}`);
    console.log(`Successfully Updated: ${successfullyUpdated}`);
    console.log(`Skipped - No Incorrect Questions: ${skippedNoIncorrect}`);
    console.log(`Skipped - Missing Data: ${skippedMissingData}`);
    console.log(`Skipped - Parse Failure: ${parseFailures}`);
    console.log(`Skipped - RAG Failure: ${ragFailures}`);
    console.log(`Skipped - Rate Limited: ${rateLimited}`);
    console.log(`Other Errors: ${otherErrors}`);
    
  } catch (err) {
    console.error("Backfill failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected. Exiting.");
    process.exit(0);
  }
}

backfill();
