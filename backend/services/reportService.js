const mongoose = require('mongoose');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');

/**
 * Helper to get the quizCode (which is stored as quizId in results) from the MongoDB ObjectId
 */
const getQuizCodeFromId = async (quizId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new Error('Quiz not found');
  return quiz.quizCode;
};

/**
 * Get Quiz Analytics Dashboard Data
 */
const getQuizAnalytics = async (quizId) => {
  const targetQuizCode = await getQuizCodeFromId(quizId);

  const pipeline = [
    { $match: { quizId: targetQuizCode } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageScore: { $avg: "$percentage" },
        highestScore: { $max: "$percentage" },
        lowestScore: { $min: "$percentage" },
        standardDeviation: { $stdDevPop: "$percentage" }
      }
    }
  ];

  const basicStats = await QuizResult.aggregate(pipeline);

  if (!basicStats || basicStats.length === 0) {
    return {
      averageScore: 0,
      highestScore: 0,
      highestStudent: "-",
      lowestScore: 0,
      lowestStudent: "-",
      totalSubmissions: 0,
      medianScore: 0,
      standardDeviation: 0
    };
  }

  const stats = basicStats[0];

  // Get Highest Student
  const highestStudentData = await QuizResult.findOne({ quizId: targetQuizCode }).sort({ percentage: -1 }).select('studentName');
  // Get Lowest Student
  const lowestStudentData = await QuizResult.findOne({ quizId: targetQuizCode }).sort({ percentage: 1 }).select('studentName');

  // Calculate Median
  const medianPipeline = [
    { $match: { quizId: targetQuizCode } },
    { $sort: { percentage: 1 } },
    {
      $group: {
        _id: null,
        percentages: { $push: "$percentage" }
      }
    }
  ];

  const medianResult = await QuizResult.aggregate(medianPipeline);
  let medianScore = 0;
  if (medianResult.length > 0) {
    const percentages = medianResult[0].percentages;
    const mid = Math.floor(percentages.length / 2);
    if (percentages.length % 2 === 0) {
      medianScore = (percentages[mid - 1] + percentages[mid]) / 2;
    } else {
      medianScore = percentages[mid];
    }
  }

  return {
    averageScore: Math.round(stats.averageScore * 10) / 10,
    highestScore: stats.highestScore,
    highestStudent: highestStudentData ? highestStudentData.studentName : "-",
    lowestScore: stats.lowestScore,
    lowestStudent: lowestStudentData ? lowestStudentData.studentName : "-",
    totalSubmissions: stats.totalSubmissions,
    medianScore: Math.round(medianScore * 10) / 10,
    standardDeviation: Math.round(stats.standardDeviation * 10) / 10
  };
};

/**
 * Get Student Performance Graph Data
 */
const getStudentPerformanceGraph = async (quizId) => {
  const targetQuizCode = await getQuizCodeFromId(quizId);
  return await QuizResult.find({ quizId: targetQuizCode })
    .select('studentId studentName percentage -_id')
    .sort({ submittedAt: 1 });
};

/**
 * Get Grade Distribution
 */
const getGradeDistribution = async (quizId) => {
  const targetQuizCode = await getQuizCodeFromId(quizId);

  const pipeline = [
    { $match: { quizId: targetQuizCode } },
    {
      $bucket: {
        groupBy: "$percentage",
        boundaries: [0, 60, 70, 80, 90, 101], // 101 because upper bound is exclusive
        default: "Invalid",
        output: { count: { $sum: 1 } }
      }
    }
  ];

  const results = await QuizResult.aggregate(pipeline);

  // Initialize distribution
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  results.forEach(bucket => {
    if (bucket._id === 0) distribution.F = bucket.count;
    else if (bucket._id === 60) distribution.D = bucket.count;
    else if (bucket._id === 70) distribution.C = bucket.count;
    else if (bucket._id === 80) distribution.B = bucket.count;
    else if (bucket._id === 90) distribution.A = bucket.count;
  });

  return distribution;
};

/**
 * Get Student Rankings
 */
const getStudentRankings = async (quizId) => {
  const targetQuizCode = await getQuizCodeFromId(quizId);
  
  const pipeline = [
    { $match: { quizId: targetQuizCode } },
    { $sort: { percentage: -1, submittedAt: 1 } },
    {
      $setWindowFields: {
        sortBy: { percentage: -1 },
        output: {
          rank: { $documentNumber: {} }
        }
      }
    },
    {
      $project: {
        _id: 0,
        rank: 1,
        studentId: 1,
        studentName: 1,
        percentage: 1
      }
    }
  ];

  return await QuizResult.aggregate(pipeline);
};

/**
 * Get Top Performers
 */
const getTopPerformers = async (quizId) => {
  const targetQuizCode = await getQuizCodeFromId(quizId);
  return await QuizResult.find({ quizId: targetQuizCode })
    .select('studentId studentName percentage timeTaken submittedAt')
    .sort({ percentage: -1, timeTaken: 1 })
    .limit(10);
};

/**
 * Get Lowest Performers
 */
const getLowestPerformers = async (quizId) => {
  const targetQuizCode = await getQuizCodeFromId(quizId);
  return await QuizResult.find({ quizId: targetQuizCode })
    .select('studentId studentName percentage timeTaken submittedAt')
    .sort({ percentage: 1, timeTaken: -1 })
    .limit(10);
};

/**
 * Get Module Comparison Analytics
 */
const getModuleComparison = async (moduleId) => {
  // First find all quizzes in this module
  const quizzes = await Quiz.find({ moduleId }).select('_id quizCode title');
  
  if (!quizzes.length) return [];

  const quizCodes = quizzes.map(q => q.quizCode);

  const pipeline = [
    { $match: { quizId: { $in: quizCodes } } },
    {
      $group: {
        _id: "$quizId",
        averageScore: { $avg: "$percentage" }
      }
    }
  ];

  const results = await QuizResult.aggregate(pipeline);

  // Merge quiz title and code with average score
  return quizzes.map(quiz => {
    const result = results.find(r => r._id === quiz.quizCode);
    return {
      quizCode: quiz.quizCode,
      title: quiz.title,
      averageScore: result ? Math.round(result.averageScore * 10) / 10 : 0
    };
  });
};

module.exports = {
  getQuizAnalytics,
  getStudentPerformanceGraph,
  getGradeDistribution,
  getStudentRankings,
  getTopPerformers,
  getLowestPerformers,
  getModuleComparison
};
