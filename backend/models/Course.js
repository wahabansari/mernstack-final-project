const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Lesson title is required'], trim: true },
    content: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'], default: 0 },
    lessons: [lessonSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
