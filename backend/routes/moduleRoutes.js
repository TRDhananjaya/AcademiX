const express = require('express');
const router = express.Router();
const { getModules, createModule, updateModule, deleteModule } = require('../controllers/moduleController');

router.get('/', getModules);
router.post('/', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

module.exports = router;
