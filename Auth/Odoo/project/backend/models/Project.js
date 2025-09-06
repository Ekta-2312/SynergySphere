const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Register'
    }
  ],
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#4A00E0'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register'
  },
  image: {
    type: String // URL or filename for uploaded image
  },
  dueDate: {
    type: Date
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
ProjectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for task count and completion percentage
ProjectSchema.virtual('taskStats', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false
});

module.exports = mongoose.model('Project', ProjectSchema);
