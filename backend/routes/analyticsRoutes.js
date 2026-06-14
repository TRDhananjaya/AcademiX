const express = require('express');
const router = express.Router();
const { getAnalyticsDashboard } = require('../controllers/analyticsController');

router.get('/', getAnalyticsDashboard);

module.exports = router;
