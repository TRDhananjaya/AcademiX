const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});
const mongoose = require('mongoose');
const StudyPlan = require('../models/StudyPlan');

async function testRegex() {
  await mongoose.connect(process.env.MONGO_URI);
  const plans = await StudyPlan.find({});
  
  // Flexible Regex to find Notes & Definitions block
  // Start: Heading containing STUDY NOTES or TOPICS TO FOCUS or PERSONALIZED STUDY NOTE
  // End: Next heading containing REVISION CHECKLIST or PRACTICE QUIZ or PRACTICE QUESTIONS or STUDY TIME
  const notesBlockRegex = /((?:^|\n)[#\s]*\d*\.?\s*(?:PERSONALIZED STUDY NOTES|ADVANCED STUDY NOTES|STUDY NOTES|TOPICS TO FOCUS)[^\n]*\n)([\s\S]*?)((?:^|\n)[#\s]*\d*\.?\s*(?:PERSONAL REVISION CHECKLIST|REVISION CHECKLIST|PRACTICE QUIZ|PRACTICE QUESTIONS|INTERACTIVE QUIZ|STUDY TIME|STUDY SCHEDULE)[^\n]*\n)/i;

  let success = 0;
  let fail = 0;
  let newPlans = 0;
  let oldPlans = 0;

  for (const p of plans) {
    const isNew = p.generatedStudyPlan.includes('PERSONALIZED STUDY NOTES');
    if (isNew) newPlans++;
    else oldPlans++;

    const match = p.generatedStudyPlan.match(notesBlockRegex);
    if (match) {
      success++;
    } else {
      fail++;
      console.log(`Failed to match plan ${p._id}. IsNew? ${isNew}`);
      console.log(p.generatedStudyPlan.substring(0, 500));
    }
  }

  console.log(`Total: ${plans.length}, Success: ${success}, Fail: ${fail}`);
  console.log(`New Plans: ${newPlans}, Old Plans: ${oldPlans}`);
  process.exit(0);
}

testRegex();
