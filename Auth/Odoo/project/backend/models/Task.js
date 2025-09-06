const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  attachments: [
    {
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  tags: [String],
  estimatedHours: {
    type: Number
  },
  actualHours: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
TaskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
