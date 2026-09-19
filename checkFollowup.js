const mongoose = require('mongoose');
const FollowupResult = require('./backend/models/FollowupResult');
const Lesson = require('./backend/models/Lesson');

require('dotenv').config({ path: './backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const results = await FollowupResult.find();
    console.log(`Found ${results.length} FollowupResult records`);
    
    // Group by lessonId
    const lessonGroups = {};
    for (const r of results) {
        if (!lessonGroups[r.lessonId]) lessonGroups[r.lessonId] = [];
        lessonGroups[r.lessonId].push(r);
    }
    
    for (const [lId, docs] of Object.entries(lessonGroups)) {
        let lesson = null;
        if (mongoose.Types.ObjectId.isValid(lId)) {
            lesson = await Lesson.findById(lId);
        }
        console.log(`\nLesson ID: ${lId} (Name: ${lesson ? lesson.title : 'Unknown'}) - ${docs.length} records`);
        for (let i = 0; i < Math.min(docs.length, 3); i++) {
            console.log(`  - Student: ${docs[i].studentId}, Score: ${docs[i].score}, Percentage: ${docs[i].percentage}`);
        }
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
