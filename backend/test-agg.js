const mongoose = require('mongoose');
const Prediction = require('./models/Prediction');
require('dotenv').config({ path: './.env' });

async function runMockTests() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');

  const pipeline = [
    { $match: { lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: { studentId: "$studentId", lessonId: "$lessonId" }, latestPrediction: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$latestPrediction" } },
    { $match: { predictedScore: { $lt: 50 } } },
    { $group: { _id: "$studentId" } },
    { $count: "uniqueStudents" }
  ];

  const Model = mongoose.model('MockPrediction', new mongoose.Schema({
    studentId: String,
    lessonId: String,
    predictedScore: Number,
    createdAt: Date
  }));

  async function mockDb(docs) {
    await Model.deleteMany({});
    await Model.insertMany(docs);
    const res = await Model.aggregate(pipeline);
    return res.length > 0 ? res[0].uniqueStudents : 0;
  }

  try {
    let res1 = await mockDb([
      { studentId: 'S1', lessonId: 'Q1', predictedScore: 42, createdAt: new Date() },
      { studentId: 'S1', lessonId: 'Q2', predictedScore: 70, createdAt: new Date() }
    ]);
    console.log("Test 1:", res1 === 1 ? 'PASS' : 'FAIL', `(Got ${res1})`);

    let res2 = await mockDb([
      { studentId: 'S2', lessonId: 'Q1', predictedScore: 35, createdAt: new Date() },
      { studentId: 'S2', lessonId: 'Q2', predictedScore: 40, createdAt: new Date() }
    ]);
    console.log("Test 2:", res2 === 1 ? 'PASS' : 'FAIL', `(Got ${res2})`);

    let res3 = await mockDb([
      { studentId: 'S3', lessonId: 'Q1', predictedScore: 50, createdAt: new Date() },
      { studentId: 'S3', lessonId: 'Q2', predictedScore: 70, createdAt: new Date() }
    ]);
    console.log("Test 3:", res3 === 0 ? 'PASS' : 'FAIL', `(Got ${res3})`);

    let res4 = await mockDb([
      { studentId: 'S4', lessonId: 'Q1', predictedScore: 49.99, createdAt: new Date() }
    ]);
    console.log("Test 4:", res4 === 1 ? 'PASS' : 'FAIL', `(Got ${res4})`);

    let res5 = await mockDb([
      { studentId: 'S5', lessonId: 'Q1', predictedScore: 0, createdAt: new Date() }
    ]);
    console.log("Test 5:", res5 === 1 ? 'PASS' : 'FAIL', `(Got ${res5})`);

    let res6 = await mockDb([
      { studentId: 'S6', lessonId: 'Q1', predictedScore: 70, createdAt: new Date(Date.now() - 10000) },
      { studentId: 'S6', lessonId: 'Q1', predictedScore: 40, createdAt: new Date() }
    ]);
    console.log("Test 6 (Duplicate new<50):", res6 === 1 ? 'PASS' : 'FAIL', `(Got ${res6})`);

    let res7 = await mockDb([
      { studentId: 'S7', lessonId: 'Q1', predictedScore: 40, createdAt: new Date(Date.now() - 10000) },
      { studentId: 'S7', lessonId: 'Q1', predictedScore: 70, createdAt: new Date() }
    ]);
    console.log("Test 7 (Duplicate old<50, new>50):", res7 === 0 ? 'PASS' : 'FAIL', `(Got ${res7})`);
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
runMockTests();
