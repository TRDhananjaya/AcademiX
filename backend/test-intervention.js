const mongoose = require('mongoose');
const Prediction = require('./models/Prediction');
const { getAdminInterventionAlerts } = require('./controllers/analyticsController');
require('dotenv').config({ path: './.env' });

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
  console.log("Connected to DB. Starting test cases...\n");

  const sId1 = new mongoose.Types.ObjectId(); // ST999
  const sId2 = new mongoose.Types.ObjectId(); // ST888

  // Clean old test data
  await Prediction.deleteMany({ studentId: { $in: [sId1, sId2] } });

  const getAlerts = async () => {
    let result = null;
    const req = { user: { role: 'teacher' } };
    const res = {
      json: (data) => { result = data; },
      status: () => res
    };
    await getAdminInterventionAlerts(req, res, console.error);
    return result;
  };

  const getAtRiskCount = async () => {
    const atRiskAggregation = await Prediction.aggregate([
        { $match: { lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: { studentId: "$studentId", lessonId: "$lessonId" }, latestPrediction: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$latestPrediction" } },
        { $match: { predictedScore: { $lt: 50 }, teacherMet: { $ne: true } } },
        { $group: { _id: "$studentId" } },
        { $count: "uniqueStudents" }
    ]);
    return atRiskAggregation.length > 0 ? atRiskAggregation[0].uniqueStudents : 0;
  };

  const createPred = async (sId, lId, score, met = false, createdDaysAgo = 0) => {
    const p = new Prediction({
      studentId: sId,
      lessonId: lId,
      predictedScore: score,
      teacherMet: met,
      features: {
        Module_1_Score: 0, Module_2_Score: 0, Module_3_Score: 0, Avg_Module_Score: 0,
        Weak_Module_Count: 0, Priority_Score: 0, Followup_Quiz_Score: 0, Improvement_Percentage: 0,
        Lesson_Performance: 'Poor', Quiz_Difficulty: 'Easy'
      },
      createdAt: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000)
    });
    await p.save();
    return p;
  };

  // === Case A ===
  // Prediction = 46.90%, teacherMet = false
  await createPred(sId1, '1', 46.90, false);
  let c = await getAtRiskCount();
  console.log(`Case A: At Risk Count = ${c} (Expected: 1)`);
  
  // === Case B ===
  // Prediction = 46.90%, teacherMet = true
  await Prediction.updateOne({ studentId: sId1, lessonId: '1' }, { teacherMet: true });
  c = await getAtRiskCount();
  console.log(`Case B: At Risk Count = ${c} (Expected: 0)`);

  // === Case C ===
  // Lesson 1 = 46.90, unresolved. Lesson 2 = 42.00, unresolved
  await Prediction.deleteMany({ studentId: sId1 });
  await createPred(sId1, '1', 46.90, false);
  await createPred(sId1, '2', 42.00, false);
  c = await getAtRiskCount();
  console.log(`Case C (Both unresolved): At Risk = ${c} (Expected: 1)`);
  
  await Prediction.updateOne({ studentId: sId1, lessonId: '1' }, { teacherMet: true });
  c = await getAtRiskCount();
  console.log(`Case C (1 resolved): At Risk = ${c} (Expected: 1)`);

  await Prediction.updateOne({ studentId: sId1, lessonId: '2' }, { teacherMet: true });
  c = await getAtRiskCount();
  console.log(`Case C (Both resolved): At Risk = ${c} (Expected: 0)`);

  // === Case D ===
  // Prediction = 50.00
  await Prediction.deleteMany({ studentId: sId1 });
  await createPred(sId1, '1', 50.00, false);
  c = await getAtRiskCount();
  console.log(`Case D (50%): At Risk = ${c} (Expected: 0)`);

  // === Case E ===
  // Prediction = 0.00
  await Prediction.deleteMany({ studentId: sId1 });
  await createPred(sId1, '1', 0.00, false);
  c = await getAtRiskCount();
  console.log(`Case E (0%): At Risk = ${c} (Expected: 1)`);

  // === Case F - Historical Duplicate Safety ===
  await Prediction.deleteMany({ studentId: sId1 });
  // OLD duplicate that is NOT resolved but is 40%
  await createPred(sId1, '1', 40.0, false, 10);
  // NEW duplicate that IS resolved and is 45%
  await createPred(sId1, '1', 45.0, true, 0);

  c = await getAtRiskCount();
  // It should pick the NEW one first (teacherMet=true), then filter it out, so AtRisk=0.
  // If it filtered teacherMet!=true FIRST, it would grab the OLD duplicate and AtRisk would be 1 (BAD!).
  console.log(`Case F (Duplicates): At Risk = ${c} (Expected: 0)`);

  // Cleanup
  await Prediction.deleteMany({ studentId: { $in: [sId1, sId2] } });
  
  process.exit();
}

runTests();
