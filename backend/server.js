const express = require('express');
const cors = require('cors');
const { connectDb } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDb();

app.get('/', (req, res) => {
    res.send('AcademiX API is running...');
});

// Import basic routes (placeholders)
// app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});