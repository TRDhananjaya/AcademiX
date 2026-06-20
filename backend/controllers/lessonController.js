const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Resource = require('../models/Resource');

// @desc    Get all lessons
// @route   GET /api/lessons
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({}).sort({ lessonNumber: 1 });
    res.status(200).json(lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error fetching lessons' });
  }
};

// @desc    Create a new lesson
// @route   POST /api/lessons
const createLesson = async (req, res) => {
  try {
    const { title, lessonNumber, term, image, description } = req.body;
    if (!title || !lessonNumber) {
      return res.status(400).json({ message: 'Title and Lesson Number are required' });
    }

    const newLesson = new Lesson({
      title,
      lessonNumber: Number(lessonNumber),
      term: Number(term) || 1,
      image: image || '',
      description: description || ''
    });

    const savedLesson = await newLesson.save();
    res.status(201).json(savedLesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Server error creating lesson' });
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
const updateLesson = async (req, res) => {
  try {
    const { title, lessonNumber, term, image, description } = req.body;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.title = title || lesson.title;
    lesson.lessonNumber = lessonNumber !== undefined ? Number(lessonNumber) : lesson.lessonNumber;
    lesson.term = term !== undefined ? Number(term) : lesson.term;
    lesson.image = image !== undefined ? image : lesson.image;
    lesson.description = description !== undefined ? description : lesson.description;

    const updatedLesson = await lesson.save();
    res.status(200).json(updatedLesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error updating lesson' });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Delete lesson
    await Lesson.findByIdAndDelete(lessonId);

    // Delete child modules & resources
    const childModules = await Module.find({ lessonId });
    const moduleIds = childModules.map(m => m._id);

    await Module.deleteMany({ lessonId });
    await Resource.deleteMany({
      $or: [
        { moduleId: { $in: moduleIds } },
        { lessonId: lessonId }
      ]
    });

    res.status(200).json({ message: 'Lesson deleted successfully along with child modules and resources' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error deleting lesson' });
  }
};

module.exports = {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson
};
