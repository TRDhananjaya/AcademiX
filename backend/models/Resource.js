const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null, index: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null, index: true }, // For shared resources
  title: { type: String, required: true },
  type: { type: String, required: true }, // PDF, Video, Presentation, Document, Link
  size: { type: String, default: '' },
  url: { type: String, required: true }, // Base64 data or external link URL
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);
