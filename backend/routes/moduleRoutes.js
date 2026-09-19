const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { getModules, createModule, updateModule, deleteModule } = require('../controllers/moduleController');

// Both students and teachers can view modules
router.get('/', getModules);

// Only teachers can create/update/delete modules
router.post('/', roleMiddleware('teacher'), createModule);
router.put('/:id', roleMiddleware('teacher'), updateModule);
router.delete('/:id', roleMiddleware('teacher'), deleteModule);

module.exports = router;
