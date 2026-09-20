const express = require('express');
const router = express.Router();
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { getResources, getResourceById, getResourceFile, createResource, deleteResource } = require('../controllers/resourceController');

// Both students and teachers can view resources and download files
router.get('/', getResources);
router.get('/:id/file', getResourceFile);
router.get('/:id', getResourceById);

// Only teachers can create/delete resources
router.post('/', roleMiddleware('teacher'), createResource);
router.delete('/:id', roleMiddleware('teacher'), deleteResource);

module.exports = router;
