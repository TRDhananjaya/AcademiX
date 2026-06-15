const mongoose = require('mongoose');
require('dotenv').config();
const { connectDb } = require('../config/db');
const AnalyticsRecord = require('../models/AnalyticsRecord');

const dummyData = [
    { studentId: 'S001', studentName: 'John Silva', lessonNumber: 1, quizNumber: 1, quizId: 'Q1.1', score: 8, totalMarks: 10, timeTaken: '03:25', submissionDate: new Date('2026-06-15T10:00:00Z') },
    { studentId: 'S002', studentName: 'Emma Watson', lessonNumber: 1, quizNumber: 1, quizId: 'Q1.1', score: 9, totalMarks: 10, timeTaken: '02:50', submissionDate: new Date('2026-06-15T10:15:00Z') },
    { studentId: 'S001', studentName: 'John Silva', lessonNumber: 1, quizNumber: 2, quizId: 'Q1.2', score: 7, totalMarks: 10, timeTaken: '04:10', submissionDate: new Date('2026-06-16T11:00:00Z') },
    { studentId: 'S003', studentName: 'Michael Brown', lessonNumber: 1, quizNumber: 1, quizId: 'Q1.1', score: 6, totalMarks: 10, timeTaken: '05:00', submissionDate: new Date('2026-06-15T10:30:00Z') },
    { studentId: 'S002', studentName: 'Emma Watson', lessonNumber: 2, quizNumber: 1, quizId: 'Q2.1', score: 10, totalMarks: 10, timeTaken: '02:30', submissionDate: new Date('2026-06-17T09:00:00Z') },
    { studentId: 'S004', studentName: 'Sarah Connor', lessonNumber: 2, quizNumber: 1, quizId: 'Q2.1', score: 8, totalMarks: 10, timeTaken: '03:45', submissionDate: new Date('2026-06-17T09:45:00Z') },
    { studentId: 'S001', studentName: 'John Silva', lessonNumber: 2, quizNumber: 2, quizId: 'Q2.2', score: 9, totalMarks: 10, timeTaken: '03:15', submissionDate: new Date('2026-06-18T14:20:00Z') },
];

// Add more records for pagination
for (let i = 5; i <= 30; i++) {
    dummyData.push({
        studentId: `S00${i}`,
        studentName: `Student ${i}`,
        lessonNumber: 1,
        quizNumber: 1,
        quizId: i % 2 === 0 ? 'Q1.1' : 'Q1.2',
        score: Math.floor(Math.random() * 5) + 5,
        totalMarks: 10,
        timeTaken: `0${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 50) + 10}`,
        submissionDate: new Date(`2026-06-${Math.floor(Math.random() * 10) + 10}T10:00:00Z`)
    });
}

const seedDatabase = async () => {
    try {
        await connectDb();
        await AnalyticsRecord.deleteMany({});
        console.log('Cleared existing records');

        await AnalyticsRecord.insertMany(dummyData);
        console.log('Successfully inserted dummy analytics data');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
