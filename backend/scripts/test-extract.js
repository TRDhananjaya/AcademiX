const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});
const mongoose = require('mongoose');
const StudyPlan = require('../models/StudyPlan');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const plans = await StudyPlan.find({});
  
  const isHeading = (line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) return true;
    if (/^\d+\.\s+[A-Z\s]{4,}/.test(trimmed)) return true;
    return false;
  };

  const oldPlan = plans.find(p => !p.generatedStudyPlan.includes('PERSONALIZED STUDY NOTES'));
  const newPlan = plans.find(p => p.generatedStudyPlan.includes('PERSONALIZED STUDY NOTES'));

  console.log("OLD PLAN HEADERS:");
  if (oldPlan) {
      oldPlan.generatedStudyPlan.split('\n').forEach(l => {
          if (isHeading(l)) console.log(l);
      });
  }

  console.log("\nNEW PLAN HEADERS:");
  if (newPlan) {
      newPlan.generatedStudyPlan.split('\n').forEach(l => {
          if (isHeading(l)) console.log(l);
      });
  }
  process.exit(0);
}
run();
