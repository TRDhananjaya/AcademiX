/**
 * Migration Script: Link existing Student records to User records via userId
 * 
 * This script finds matching User accounts for each Student by:
 * 1. Matching studentId (lowercase) to username
 * 2. Falling back to email matching
 * 
 * Run: node scripts/linkStudentsToUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.\n');

        const students = await Student.find({ userId: { $exists: false } });
        console.log(`Found ${students.length} student(s) without userId link.\n`);

        let linked = 0;
        let notFound = 0;

        for (const student of students) {
            // Try matching by studentId -> username
            let user = null;
            if (student.studentId) {
                user = await User.findOne({ username: student.studentId.toLowerCase() });
            }

            // Fallback: match by email
            if (!user && student.email) {
                user = await User.findOne({ email: student.email.toLowerCase() });
            }

            if (user) {
                await Student.updateOne(
                    { _id: student._id },
                    { $set: { userId: user._id } }
                );
                console.log(`✅ Linked: ${student.name} (${student.studentId}) -> User ${user.username}`);
                linked++;
            } else {
                console.log(`⚠️  No User found for: ${student.name} (${student.studentId}, ${student.email})`);
                notFound++;
            }
        }

        console.log(`\n--- Migration Complete ---`);
        console.log(`Linked: ${linked}`);
        console.log(`No match: ${notFound}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
