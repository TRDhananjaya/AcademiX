require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academix';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  
  // Fetch all records
  const allRecords = await db.collection('quizz_results').find({}).toArray();
  console.log(`Total records found: ${allRecords.length}`);

  if (allRecords.length === 177) {
    // Distribute them evenly: 59 for Q1.1, 59 for Q1.2, 59 for Q1.3
    const batch1 = allRecords.slice(0, 59);
    const batch2 = allRecords.slice(59, 118);
    const batch3 = allRecords.slice(118, 177);

    // Update batch 1
    const ids1 = batch1.map(r => r._id);
    await db.collection('quizz_results').updateMany(
      { _id: { $in: ids1 } },
      { $set: { quizId: "Q1.1" } }
    );

    // Update batch 2
    const ids2 = batch2.map(r => r._id);
    await db.collection('quizz_results').updateMany(
      { _id: { $in: ids2 } },
      { $set: { quizId: "Q1.2" } }
    );

    // Update batch 3
    const ids3 = batch3.map(r => r._id);
    await db.collection('quizz_results').updateMany(
      { _id: { $in: ids3 } },
      { $set: { quizId: "Q1.3" } }
    );

    console.log(`Successfully distributed!`);
    console.log(`- 59 records assigned to Module 1.1 (Q1.1)`);
    console.log(`- 59 records assigned to Module 1.2 (Q1.2)`);
    console.log(`- 59 records assigned to Module 1.3 (Q1.3)`);
  } else {
    console.log(`Unexpected number of records: ${allRecords.length}. Expected 177.`);
    
    // Fallback: just divide whatever we have by 3
    const third = Math.floor(allRecords.length / 3);
    const batch1 = allRecords.slice(0, third);
    const batch2 = allRecords.slice(third, third * 2);
    const batch3 = allRecords.slice(third * 2);

    await db.collection('quizz_results').updateMany({ _id: { $in: batch1.map(r => r._id) } }, { $set: { quizId: "Q1.1" } });
    await db.collection('quizz_results').updateMany({ _id: { $in: batch2.map(r => r._id) } }, { $set: { quizId: "Q1.2" } });
    await db.collection('quizz_results').updateMany({ _id: { $in: batch3.map(r => r._id) } }, { $set: { quizId: "Q1.3" } });
    
    console.log(`Fallback distribution completed.`);
  }

  process.exit(0);
}).catch(console.error);
