const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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
const notificationRoutes = require('./routes/notificationRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const communityRoutes = require('./routes/communityRoutes');
const messageRoutes = require('./routes/messageRoutes');
const commonMessageRoutes = require('./routes/commonMessageRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const followUpRoutes = require('./routes/followUpRoutes');

const app = express();

// Security: HTTP headers hardening
app.use(helmet());

// Security: CORS — restrict to frontend origin(s)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. Postman, server-to-server)
        if (!origin) return callback(null, true);
        // In development, allow any localhost port
        if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Security: Rate limiting on authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,                   // max 15 attempts per window
    message: { message: 'Too many attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 PDF uploads!
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDb();

app.get('/', (req, res) => {
    res.send('AcademiX API is running...');
});

const { authMiddleware } = require('./middleware/authMiddleware');

// Routes — Public (with rate limiting on sensitive endpoints)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth', authRoutes);

// Routes — Protected (require authentication)
app.use('/api/quizzes', authMiddleware, quizRoutes);
app.use('/api/quiz-results', authMiddleware, quizResultRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/ml', authMiddleware, predictionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/lessons', authMiddleware, lessonRoutes);
app.use('/api/modules', authMiddleware, moduleRoutes);
app.use('/api/resources', authMiddleware, resourceRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/study-plans', authMiddleware, studyPlanRoutes);
app.use('/api/followup', authMiddleware, followUpRoutes);
app.use('/api/community', authMiddleware, communityRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/common-messages', authMiddleware, commonMessageRoutes);

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});