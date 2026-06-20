const express = require('express');
const router = express.Router();
const { getResources, getResourceById, createResource, deleteResource } = require('../controllers/resourceController');

router.get('/', getResources);
router.get('/:id', getResourceById);
router.post('/', createResource);
router.delete('/:id', deleteResource);

module.exports = router;
