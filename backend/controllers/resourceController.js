const Resource = require('../models/Resource');

// @desc    Get all resources (optionally filtered by moduleId or lessonId)
// @route   GET /api/resources
const getResources = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.query;
    let query = {};
    if (moduleId && lessonId) {
      query = { $or: [{ moduleId }, { lessonId }] };
    } else if (moduleId) {
      query = { moduleId };
    } else if (lessonId) {
      query = { lessonId };
    }

    const resources = await Resource.aggregate([
      { $match: query },
      { $sort: { createdAt: 1 } },
      {
        $project: {
          title: 1,
          type: 1,
          size: 1,
          moduleId: 1,
          lessonId: 1,
          description: 1,
          createdAt: 1,
          url: {
            $cond: {
              if: { $eq: [{ $substrCP: [{ $ifNull: ["$url", ""] }, 0, 5] }, "data:"] },
              then: "#",
              else: "$url"
            }
          }
        }
      }
    ]);

    res.status(200).json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error fetching resources' });
  }
};

// @desc    Get a single resource by ID (includes heavy url field)
// @route   GET /api/resources/:id
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(200).json(resource);
  } catch (error) {
    console.error('Get resource by id error:', error);
    res.status(500).json({ message: 'Server error fetching resource' });
  }
};

// @desc    Create a new resource
// @route   POST /api/resources
const createResource = async (req, res) => {
  try {
    const { title, type, size, url, moduleId, lessonId, description } = req.body;
    if (!title || !type || !url) {
      return res.status(400).json({ message: 'Title, Type, and URL are required' });
    }

    const newResource = new Resource({
      title,
      type,
      size: size || '',
      url,
      moduleId: moduleId || null,
      lessonId: lessonId || null,
      description: description || ''
    });

    const savedResource = await newResource.save();
    const resObj = savedResource.toObject();
    if (resObj.type !== 'Link' && resObj.url && resObj.url.startsWith('data:')) {
      resObj.url = '#';
    }
    res.status(201).json(resObj);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Server error creating resource' });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error deleting resource' });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  deleteResource
};
