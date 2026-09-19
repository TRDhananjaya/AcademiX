const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { getResources, getResourceById, createResource, deleteResource } = require('../controllers/resourceController');

// Both students and teachers can view resources
router.get('/', getResources);
router.get('/:id', getResourceById);

// Only teachers can create/delete resources
router.post('/', roleMiddleware('teacher'), createResource);
router.delete('/:id', roleMiddleware('teacher'), deleteResource);

module.exports = router;
