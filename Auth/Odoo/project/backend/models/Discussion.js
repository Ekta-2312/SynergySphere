const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  parentDiscussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion'
    }
  ],
  attachments: [
    {
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
      type: { type: String, enum: ['like', 'love', 'laugh', 'angry', 'sad'] }
    }
  ],
  isPinned: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
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
DiscussionSchema.index({ project: 1 });
DiscussionSchema.index({ project: 1, createdAt: -1 });
DiscussionSchema.index({ author: 1 });
DiscussionSchema.index({ parentDiscussion: 1 });
DiscussionSchema.index({ isPinned: 1, project: 1 });
DiscussionSchema.index({ isResolved: 1, project: 1 });

// Update the updatedAt field before saving
DiscussionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Soft delete method
DiscussionSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = deletedBy;
  return this.save();
};

// Restore method
DiscussionSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Query helper to exclude deleted documents
DiscussionSchema.query.notDeleted = function() {
  return this.where({ isDeleted: { $ne: true } });
};

module.exports = mongoose.model('Discussion', DiscussionSchema);
