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
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Discussion' 
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
    type: { type: String, enum: ['like', 'love', 'laugh', 'angry', 'sad'] }
  }],
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
  }
});

// Update the updatedAt field before saving
DiscussionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
