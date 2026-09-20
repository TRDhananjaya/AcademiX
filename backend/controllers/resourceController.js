const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource');

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, '../public/uploads/resources');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
      },
      { $sort: { createdAt: 1 } }
    ]).allowDiskUse(true);

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

    let finalUrl = url;

    // Save Base64 file directly to disk for 0ms download speed!
    if (url.startsWith('data:')) {
      const commaIdx = url.indexOf(',');
      if (commaIdx !== -1) {
        const meta = url.substring(0, commaIdx);
        const base64Data = url.substring(commaIdx + 1);

        const mimeMatch = meta.match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const fileBuffer = Buffer.from(base64Data, 'base64');

        let extension = 'pdf';
        if (mimeType.includes('pdf')) extension = 'pdf';
        else if (mimeType.includes('png')) extension = 'png';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('word') || mimeType.includes('docx')) extension = 'docx';

        const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, fileBuffer);

        finalUrl = `/public/uploads/resources/${filename}`;
      }
    }

    const newResource = new Resource({
      title,
      type,
      size: size || '',
      url: finalUrl,
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

// @desc    Download/stream resource file directly as binary data
// @route   GET /api/resources/:id/file
const getResourceFile = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).select('title type size url').lean();
    if (!resource || !resource.url) {
      return res.status(404).json({ message: 'Resource file not found' });
    }

    let extension = 'pdf';
    let safeFilename = (resource.title || 'resource')
      .trim()
      .replace(/["';\/\\]/g, '_');

    // Case 1: File stored on disk -> Instant read stream (1ms)!
    if (resource.url.startsWith('/public/uploads/') || resource.url.startsWith('public/uploads/')) {
      const relPath = resource.url.startsWith('/') ? resource.url.substring(1) : resource.url;
      const diskPath = path.join(__dirname, '..', relPath);

      if (fs.existsSync(diskPath)) {
        const extMatch = path.extname(diskPath);
        if (extMatch) extension = extMatch.replace('.', '');
        if (!safeFilename.toLowerCase().endsWith(`.${extension}`)) {
          safeFilename += `.${extension}`;
        }

        const stat = fs.statSync(diskPath);
        res.setHeader('Content-Type', extension === 'pdf' ? 'application/pdf' : 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
        res.setHeader('Content-Length', stat.size);

        return fs.createReadStream(diskPath).pipe(res);
      }
    }

    // Case 2: Legacy Base64 in MongoDB -> Convert, cache to disk, and stream
    if (resource.url.startsWith('data:')) {
      const commaIdx = resource.url.indexOf(',');
      if (commaIdx !== -1) {
        const meta = resource.url.substring(0, commaIdx);
        const base64Data = resource.url.substring(commaIdx + 1);

        const mimeMatch = meta.match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const fileBuffer = Buffer.from(base64Data, 'base64');

        if (mimeType.includes('pdf')) extension = 'pdf';
        else if (mimeType.includes('png')) extension = 'png';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('word') || mimeType.includes('docx')) extension = 'docx';

        if (!safeFilename.toLowerCase().endsWith(`.${extension}`)) {
          safeFilename += `.${extension}`;
        }

        // Cache on disk for instant subsequent downloads
        const diskFilename = `${resource._id}.${extension}`;
        const diskPath = path.join(uploadsDir, diskFilename);
        const diskUrl = `/public/uploads/resources/${diskFilename}`;

        fs.writeFile(diskPath, fileBuffer, (err) => {
          if (!err) {
            Resource.findByIdAndUpdate(resource._id, { url: diskUrl }).catch(() => {});
          }
        });

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
        res.setHeader('Content-Length', fileBuffer.length);
        return res.end(fileBuffer);
      }
    }

    // Case 3: External web link
    return res.redirect(resource.url);
  } catch (error) {
    console.error('Download resource file error:', error);
    res.status(500).json({ message: 'Server error serving file' });
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

    // If file is on disk, remove it as well
    if (resource.url && (resource.url.startsWith('/public/uploads/') || resource.url.startsWith('public/uploads/'))) {
      const relPath = resource.url.startsWith('/') ? resource.url.substring(1) : resource.url;
      const diskPath = path.join(__dirname, '..', relPath);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (_) {}
      }
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
  getResourceFile,
  createResource,
  deleteResource
};
