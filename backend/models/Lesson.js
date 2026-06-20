const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessonNumber: { type: Number, required: true },
  term: { type: Number, required: true, default: 1 },
  image: { type: String }, // Base64 data URL
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);
