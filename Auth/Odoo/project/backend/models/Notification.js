const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Register', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Register' 
  },
  type: { 
    type: String, 
    enum: [
      'task_assigned', 
      'task_completed', 
      'task_due_soon', 
      'project_invitation', 
      'discussion_reply', 
      'project_update',
      'deadline_reminder'
    ], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedProject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  },
  relatedTask: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  },
  relatedDiscussion: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Discussion' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  readAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Mark as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);
