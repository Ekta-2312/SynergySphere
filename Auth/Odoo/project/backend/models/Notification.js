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
      'task_status_changed',
      'task_priority_changed',
      'task_unassigned',
      'task_deleted',
      'project_invitation', 
      'project_created',
      'project_updated',
      'project_deleted',
      'discussion_reply', 
      'new_discussion',
      'discussion_updated',
      'discussion_deleted',
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
