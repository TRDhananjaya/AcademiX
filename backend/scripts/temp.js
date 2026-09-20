const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});
const mongoose = require('mongoose');
const StudyPlan = require('../models/StudyPlan');
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const plans = await StudyPlan.find({});
  let hasNew = 0;
  let hasOld = 0;
  for (const p of plans) {
    if (p.generatedStudyPlan.includes('PERSONALIZED STUDY NOTES')) hasNew++;
    else hasOld++;
  }
  console.log(`Has NEW format: ${hasNew}, Has OLD format: ${hasOld}`);
  const newPlan = plans.find(p => p.generatedStudyPlan.includes('PERSONALIZED STUDY NOTES'));
  if (newPlan) console.log(newPlan.generatedStudyPlan.substring(0, 1500));
  process.exit(0);
}
run();
