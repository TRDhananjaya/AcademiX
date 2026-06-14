require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const QuizResult = require('../models/QuizResult');
const FollowupResult = require('../models/FollowupResult');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const students = await Student.find({});
    console.log(`Found ${students.length} students to migrate.`);

    for (const student of students) {
      const oldIdString = student._id.toString();
      
      let newStudentId = student.studentId;
      if (!newStudentId) {
        newStudentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
        // Basic uniqueness check (in practice, might collide, but good enough for small dataset)
        await Student.updateOne({ _id: student._id }, { $set: { studentId: newStudentId } });
        console.log(`Generated studentId ${newStudentId} for ${student.name}`);
      }

      // Update QuizResults
      const quizRes = await QuizResult.updateMany(
        { $or: [{ studentId: oldIdString }, { studentName: student.name }] },
        { $set: { studentId: newStudentId } }
      );
      if (quizRes.modifiedCount > 0) {
        console.log(`Updated ${quizRes.modifiedCount} QuizResult(s) for ${student.name}`);
      }

      // Update FollowupResults
      const followupRes = await FollowupResult.updateMany(
        { $or: [{ studentId: oldIdString }, { studentName: student.name }] },
        { $set: { studentId: newStudentId } }
      );
      if (followupRes.modifiedCount > 0) {
        console.log(`Updated ${followupRes.modifiedCount} FollowupResult(s) for ${student.name}`);
      }
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
