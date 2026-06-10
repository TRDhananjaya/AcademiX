const express = require('express');
const cors = require('cors');
const { connectDb } = require('./config/db');
const { errorMiddleware } = require('./middleware/errorMiddleware');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const quizResultRoutes = require('./routes/quizResultRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDb();

app.get('/', (req, res) => {
    res.send('AcademiX API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-results', quizResultRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});