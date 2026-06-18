const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function run() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI not defined in environment variables');
    }
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected.');

    const db = mongoose.connection.db;

    // 1. Update teacher user(s) to Akila Savinda
    const teacherResult = await db.collection('users').updateMany(
      { role: 'teacher' },
      { $set: { firstName: 'Akila', lastName: 'Savinda' } }
    );
    console.log(`Updated ${teacherResult.modifiedCount} teacher user(s) to Akila Savinda.`);

    // 2. Update student user(s) to John Doe (or similar, let's use John Doe)
    const studentResult = await db.collection('users').updateMany(
      { role: 'student' },
      { $set: { firstName: 'John', lastName: 'Doe' } }
    );
    console.log(`Updated ${studentResult.modifiedCount} student user(s) to John Doe.`);

    // 3. Print final state
    const users = await db.collection('users').find({}).toArray();
    console.log('Current users in DB:', users.map(u => ({
      username: u.username,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email
    })));

    process.exit(0);
  } catch (error) {
    console.error('Error running fix script:', error);
    process.exit(1);
  }
}

run();
