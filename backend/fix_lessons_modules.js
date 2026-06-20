require('dotenv').config();
const mongoose = require('mongoose');

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    console.log('Starting migration...');

    // 1. Migrate Lessons
    const lessonsCursor = db.collection('lessons').find({});
    const lessons = await lessonsCursor.toArray();
    console.log(`Found ${lessons.length} lessons to process.`);

    for (const lesson of lessons) {
      const updates = {};
      
      // Rename name -> title
      if (lesson.name && !lesson.title) {
        updates.title = lesson.name;
        // Optionally remove old field
        updates.name = undefined; 
      }

      // Convert term -> number
      if (lesson.term) {
        const termStr = lesson.term.toString();
        if (termStr === '6a33c6b3d67ba7d81f63916a') {
          updates.term = 1;
        } else if (termStr === '6a33c6b6d67ba7d81f639177') {
          updates.term = 2;
        } else if (termStr === '6a33c6bad67ba7d81f639184') {
          updates.term = 3;
        } else if (typeof lesson.term !== 'number') {
          updates.term = 1; // Default
        }
      }

      if (Object.keys(updates).length > 0) {
        const queryUpdates = {};
        const unsetUpdates = {};
        for (const [key, val] of Object.entries(updates)) {
          if (val === undefined) {
            unsetUpdates[key] = "";
          } else {
            queryUpdates[key] = val;
          }
        }
        
        const updateObj = {};
        if (Object.keys(queryUpdates).length > 0) updateObj.$set = queryUpdates;
        if (Object.keys(unsetUpdates).length > 0) updateObj.$unset = unsetUpdates;

        await db.collection('lessons').updateOne({ _id: lesson._id }, updateObj);
      }
    }
    console.log('Lessons migration complete!');

    // 2. Migrate Modules
    const modulesCursor = db.collection('modules').find({});
    const modules = await modulesCursor.toArray();
    console.log(`Found ${modules.length} modules to process.`);

    for (const mod of modules) {
      const updates = {};
      
      // Rename name -> title
      if (mod.name && !mod.title) {
        updates.title = mod.name;
        updates.name = undefined;
      }

      // Map lesson (ObjectId) -> lessonId
      if (mod.lesson && !mod.lessonId) {
        updates.lessonId = mod.lesson;
        updates.lesson = undefined;
      }

      if (Object.keys(updates).length > 0) {
        const queryUpdates = {};
        const unsetUpdates = {};
        for (const [key, val] of Object.entries(updates)) {
          if (val === undefined) {
            unsetUpdates[key] = "";
          } else {
            queryUpdates[key] = val;
          }
        }

        const updateObj = {};
        if (Object.keys(queryUpdates).length > 0) updateObj.$set = queryUpdates;
        if (Object.keys(unsetUpdates).length > 0) updateObj.$unset = unsetUpdates;

        await db.collection('modules').updateOne({ _id: mod._id }, updateObj);
      }
    }
    console.log('Modules migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
