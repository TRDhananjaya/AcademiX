const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Prediction = require('./models/Prediction');
const { backfillPredictions } = require('./controllers/predictionController');
require('dotenv').config({ path: './.env' });

async function run() {
    console.log("=== PHASE 1: READ-ONLY ANALYSIS ===");
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix');
    
    const allPredictions = await Prediction.find({});
    console.log(`Total prediction documents: ${allPredictions.length}`);
    
    const lessonWisePredictions = allPredictions.filter(p => 
        !['General', 'Final Exam', 'Final Exam (All Lessons)', '', null].includes(p.lessonId)
    );
    
    const grouped = {};
    for (const p of lessonWisePredictions) {
        if (!p.studentId) continue;
        const key = `${p.studentId.toString()}_${p.lessonId}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
    }
    
    const uniqueCombinations = Object.keys(grouped).length;
    console.log(`Unique student + lesson combinations: ${uniqueCombinations}`);
    
    let duplicateDocumentsCount = 0;
    const affectedStudents = new Set();
    const affectedLessons = new Set();
    const groupsWithDuplicates = [];
    
    for (const [key, records] of Object.entries(grouped)) {
        if (records.length > 1) {
            duplicateDocumentsCount += records.length; // all records in the duplicate group
            affectedStudents.add(records[0].studentId.toString());
            affectedLessons.add(records[0].lessonId);
            groupsWithDuplicates.push(records);
        }
    }
    
    console.log(`Duplicate documents (in groups > 1): ${duplicateDocumentsCount}`);
    console.log(`Affected students: ${affectedStudents.size}`);
    console.log(`Affected lessons: ${Array.from(affectedLessons).join(', ')}`);
    
    console.log("\n=== PHASE 2: BACKUP / SAFETY ===");
    const backupPath = path.join(__dirname, 'predictions_backup.json');
    try {
        fs.writeFileSync(backupPath, JSON.stringify(allPredictions, null, 2));
        console.log(`Backup successfully created at ${backupPath}`);
    } catch (err) {
        console.error("Failed to create backup! Aborting.", err);
        process.exit(1);
    }
    
    console.log("\n=== PHASE 3: REMOVE HISTORICAL DUPLICATES ===");
    let deletedCount = 0;
    for (const records of groupsWithDuplicates) {
        const studentId = records[0].studentId;
        const lessonId = records[0].lessonId;
        
        // Delete ALL records for this student+lesson so it gets rebuilt freshly
        const res = await Prediction.deleteMany({ studentId, lessonId });
        deletedCount += res.deletedCount;
    }
    console.log(`Successfully deleted ${deletedCount} stale historical prediction records.`);
    
    console.log("\n=== PHASE 4 & 5: REGENERATE USING EXISTING ML MODEL ===");
    console.log("Calling existing backfill logic to regenerate missing predictions...");
    
    // Mock req/res for backfill
    const req = {};
    let backfillResult = null;
    const res = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { backfillResult = data; }
    };
    
    await backfillPredictions(req, res, (err) => console.error(err));
    
    if (backfillResult) {
        console.log(`Backfill result: ${JSON.stringify(backfillResult, null, 2)}`);
    } else {
        console.log("Backfill completed but no JSON response was captured.");
    }
    
    console.log("\n=== PHASE 6 & 9: VERIFY WITH REAL DATA ===");
    const postPredictions = await Prediction.find({});
    console.log(`Total prediction records after rebuild: ${postPredictions.length}`);
    
    // Check duplicates again
    const postLessonWise = postPredictions.filter(p => 
        !['General', 'Final Exam', 'Final Exam (All Lessons)', '', null].includes(p.lessonId)
    );
    const postGrouped = {};
    for (const p of postLessonWise) {
        if (!p.studentId) continue;
        const key = `${p.studentId.toString()}_${p.lessonId}`;
        if (!postGrouped[key]) postGrouped[key] = [];
        postGrouped[key].push(p);
    }
    
    let postDuplicates = 0;
    for (const [key, records] of Object.entries(postGrouped)) {
        if (records.length > 1) postDuplicates++;
    }
    
    console.log(`Duplicate Student+Lesson combinations remaining: ${postDuplicates}`);
    
    // Check specific student
    const testStudentId = "6a32bb0ae96ff57e8fe3f505";
    const testRecords = await Prediction.find({ studentId: new mongoose.Types.ObjectId(testStudentId), lessonId: 'Q1' });
    console.log(`Records for student 505 + Q1: ${testRecords.length}`);
    if (testRecords.length === 1) {
        console.log(`Predicted Score: ${testRecords[0].predictedScore}`);
    }
    
    console.log("Script finished successfully.");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
