const mongoose = require('mongoose');
const StudyPlan = require('./backend/models/StudyPlan');
require('dotenv').config({ path: './backend/.env' });

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Aggregate to find duplicate combinations of studentId and lessonId
    const duplicates = await StudyPlan.aggregate([
      {
        $group: {
          _id: { studentId: { $toLower: "$studentId" }, lessonId: "$lessonId" },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let duplicateCount = 0;
    let removedCount = 0;

    for (const dup of duplicates) {
      duplicateCount++;
      const { studentId, lessonId } = dup._id;
      console.log(`\nDuplicate found for studentId: ${studentId}, lessonId: ${lessonId}`);

      // Fetch the full documents sorted by createdAt ascending, then by _id ascending
      const plans = await StudyPlan.find({ 
        _id: { $in: dup.docs } 
      }).sort({ createdAt: 1, _id: 1 });

      const firstPlan = plans[0];
      console.log(`- Kept original Study Plan: ${firstPlan._id} (Created At: ${firstPlan.createdAt})`);

      for (let i = 1; i < plans.length; i++) {
        const planToRemove = plans[i];
        console.log(`- Removed duplicate Study Plan: ${planToRemove._id} (Created At: ${planToRemove.createdAt})`);
        await StudyPlan.deleteOne({ _id: planToRemove._id });
        removedCount++;
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Number of duplicate studentId + lessonId combinations found: ${duplicateCount}`);
    console.log(`Total duplicate records removed: ${removedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupDuplicates();
