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
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register'
  }
});

// Indexes for frequently queried fields
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ project: 1, assignee: 1 });
TaskSchema.index({ assignee: 1, status: 1 });
TaskSchema.index({ project: 1, status: 1, assignee: 1 });
TaskSchema.index({ creator: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ updatedAt: -1 });

// Update the updatedAt field before saving
TaskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

// Soft delete method
TaskSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = deletedBy;
  return this.save();
};

// Restore method
TaskSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Query helper to exclude deleted documents
TaskSchema.query.notDeleted = function() {
  return this.where({ isDeleted: { $ne: true } });
};

module.exports = mongoose.model('Task', TaskSchema);
