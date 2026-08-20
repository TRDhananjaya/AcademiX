const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI || 'mongodb://root:root@ac-xc33ipv-shard-00-00.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-01.6mzunvs.mongodb.net:27017,ac-xc33ipv-shard-00-02.6mzunvs.mongodb.net:27017/test?ssl=true&replicaSet=atlas-asahlb-shard-0&authSource=admin&retryWrites=true&w=majority';

const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlanAsync } = require('../services/studyPlanService');

async function backfill() {
    await mongoose.connect(uri);
    console.log('Connected to DB. Starting backfill...');

    // 1. Get all students who have taken quizzes
    const uniqueStudents = await QuizResult.distinct('studentId');
    console.log(`Found ${uniqueStudents.length} unique students.`);

    // 2. Get all lessons and modules
    const allLessons = await Lesson.find({});
    
    let generatedCount = 0;

    for (const studentId of uniqueStudents) {
        // Get student name from one of their results
        const sampleResult = await QuizResult.findOne({ studentId });
        const studentName = sampleResult ? sampleResult.studentName : 'Unknown Student';

        for (const lesson of allLessons) {
            const lessonModules = await Module.find({ lessonId: lesson._id });
            if (lessonModules.length === 0) continue;

            const moduleIds = lessonModules.map(m => m._id.toString());
            const stringModuleIds = lessonModules.map(m => {
                const match = m.title.match(/Module\s+(\d+)\.(\d+)/i);
                if (match) return `MODULE_${match[1]}_${match[2]}`;
                return null;
            }).filter(Boolean);

            const lessonQuizzes = await Quiz.find({
                $or: [
                    { moduleId: { $in: moduleIds } },
                    { moduleId: { $in: lessonModules.map(m => m._id) } },
                    { moduleId: { $in: stringModuleIds } }
                ]
            });

            if (lessonQuizzes.length > 0) {
                const quizCodes = lessonQuizzes.map(q => q.quizCode);

                const studentResults = await QuizResult.find({
                    studentId: { $regex: new RegExp(`^${studentId}$`, 'i') },
                    quizId: { $in: quizCodes }
                });

                const completedQuizCodes = [...new Set(studentResults.map(r => r.quizId))];

                // If fully completed
                if (completedQuizCodes.length === quizCodes.length) {
                    const existingPlan = await StudyPlan.findOne({
                        studentId: { $regex: new RegExp(`^${studentId}$`, 'i') },
                        lessonId: lesson._id
                    });

                    if (!existingPlan) {
                        console.log(`[Backfill] Missing plan detected for student: ${studentId}, lesson: ${lesson.title}`);
                        try {
                            await generateStudyPlanAsync(studentId, studentName, lesson._id.toString());
                            generatedCount++;
                            // Wait a bit to not overwhelm RAG service
                            await new Promise(resolve => setTimeout(resolve, 3000));
                        } catch (err) {
                            console.error(`[Backfill Error] Failed to generate for ${studentId}, lesson ${lesson.title}:`, err);
                        }
                    }
                }
            }
        }
    }

    console.log(`\nBackfill complete. Triggered ${generatedCount} missing study plans.`);
    process.exit(0);
}

backfill().catch(console.error);
