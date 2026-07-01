const express = require('express');
const cors = require('cors');
const { connectDb } = require('./config/db');
const { errorMiddleware } = require('./middleware/errorMiddleware');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const quizResultRoutes = require('./routes/quizResultRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
<<<<<<< HEAD
const notificationRoutes = require('./routes/notificationRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
=======
const communityRoutes = require('./routes/communityRoutes');
const messageRoutes = require('./routes/messageRoutes');
const commonMessageRoutes = require('./routes/commonMessageRoutes');
>>>>>>> main

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 PDF uploads!
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDb();

app.get('/', (req, res) => {
    res.send('AcademiX API is running...');
});

const { authMiddleware } = require('./middleware/authMiddleware');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', authMiddleware, quizRoutes);
app.use('/api/quiz-results', authMiddleware, quizResultRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/ml', authMiddleware, predictionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/lessons', authMiddleware, lessonRoutes);
app.use('/api/modules', authMiddleware, moduleRoutes);
app.use('/api/resources', authMiddleware, resourceRoutes);
<<<<<<< HEAD
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/study-plans', authMiddleware, studyPlanRoutes);
=======
app.use('/api/community', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/common-messages', commonMessageRoutes);
>>>>>>> main

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});