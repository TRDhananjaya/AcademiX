require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const StudyPlan = require('./backend/models/StudyPlan');

const extractSection = (text, startNumber, endNumber) => {
  if (!text) return '';
  const startRegex = new RegExp(`(?:^|\\n)[#\\*\\s]*${startNumber}\\.\\s+.*?\\n`, 'i');
  const startMatch = text.match(startRegex);
  
  if (!startMatch) {
    return null;
  }
  
  const startIndex = startMatch.index + startMatch[0].length;
  
  const endRegex = endNumber ? new RegExp(`(?:^|\\n)[#\\*\\s]*${endNumber}\\.\\s+`, 'i') : null;
  const endMatch = endRegex ? text.substring(startIndex).match(endRegex) : null;
  
  if (endMatch) {
    return text.substring(startIndex, startIndex + endMatch.index).trim();
  }
  
  return text.substring(startIndex).trim();
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const plans = await StudyPlan.find({}).sort({createdAt: -1}).limit(5);
  plans.forEach((p, i) => {
    console.log(`\n--- Plan ${i+1} (${p.createdAt}) ---`);
    const c2 = extractSection(p.generatedStudyPlan, 2, 3);
    console.log("C2 Extracted?", c2 ? "YES (" + c2.length + " chars)" : "NO");
    if (!c2) {
       console.log("Snippet:", p.generatedStudyPlan.substring(0, 300));
    }
  });
  process.exit(0);
});

