const Module = require('../models/Module');
const Resource = require('../models/Resource');

// @desc    Get all modules (optionally filtered by lessonId)
// @route   GET /api/modules
const getModules = async (req, res) => {
  try {
    const { lessonId } = req.query;
    const filter = lessonId ? { lessonId } : {};
    const modules = await Module.find(filter).sort({ createdAt: 1 });
    res.status(200).json(modules);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Server error fetching modules' });
  }
};

// @desc    Create a new module
// @route   POST /api/modules
const createModule = async (req, res) => {
  try {
    const { title, topics, lessonId, description } = req.body;
    if (!title || !lessonId) {
      return res.status(400).json({ message: 'Title and Lesson ID are required' });
    }

    const newModule = new Module({
      title,
      topics: topics || [],
      lessonId,
      description: description || ''
    });

    const savedModule = await newModule.save();
    res.status(201).json(savedModule);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ message: 'Server error creating module' });
  }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
const updateModule = async (req, res) => {
  try {
    const { title, topics, description } = req.body;
    const moduleItem = await Module.findById(req.params.id);

    if (!moduleItem) {
      return res.status(404).json({ message: 'Module not found' });
    }

    moduleItem.title = title || moduleItem.title;
    moduleItem.topics = topics !== undefined ? topics : moduleItem.topics;
    moduleItem.description = description !== undefined ? description : moduleItem.description;

    const updatedModule = await moduleItem.save();
    res.status(200).json(updatedModule);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error updating module' });
  }
};

// @desc    Delete a module
// @route   DELETE /api/modules/:id
const deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const moduleItem = await Module.findById(moduleId);

    if (!moduleItem) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await Module.findByIdAndDelete(moduleId);
    await Resource.deleteMany({ moduleId });

    res.status(200).json({ message: 'Module deleted successfully along with its resources' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error deleting module' });
  }
};

module.exports = {
  getModules,
  createModule,
  updateModule,
  deleteModule
};
