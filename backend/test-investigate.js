const mongoose = require('mongoose');
const Prediction = require('./models/Prediction');
require('dotenv').config({ path: './.env' });

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
    
    // Aggregation test
    const latestPredictions = await Prediction.aggregate([
        {
            $match: {
                lessonId: { $nin: ['General', 'Final Exam', 'Final Exam (All Lessons)', '', null] }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: { studentId: "$studentId", lessonId: "$lessonId" },
                latestPrediction: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$latestPrediction" }
        },
        {
            $match: {
                predictedScore: { $lt: 50 }
            }
        }
    ]);
    
    const predictions = await Prediction.populate(latestPredictions, { path: 'studentId' });
    
    console.log("=== Canonical Intervention Alerts ===");
    console.log(`Found ${predictions.length} alerts.`);
    
    // Specifically verify 6a32bb0ae96ff57e8fe3f505 + Q1
    const targetStudentIdObj = new mongoose.Types.ObjectId("6a32bb0ae96ff57e8fe3f505");
    const test1 = await Prediction.findOne({ studentId: targetStudentIdObj, lessonId: "Q1" }).sort({ createdAt: -1 });
    console.log("Latest Prediction for 505 Q1:", test1?.predictedScore); // should be 36.5
    
    // Check if it's in the populated alerts
    const inAlerts = predictions.find(p => 
        p.studentId && p.studentId._id && p.studentId._id.toString() === "6a32bb0ae96ff57e8fe3f505" && p.lessonId === "Q1"
    );
    console.log("Is in alerts:", !!inAlerts, "Score:", inAlerts?.predictedScore);
    
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
