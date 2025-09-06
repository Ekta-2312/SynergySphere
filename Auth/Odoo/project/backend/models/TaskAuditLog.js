const mongoose = require('mongoose');

const TaskAuditLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'unassigned',
      'priority_changed',
      'due_date_changed',
      'completed',
      'deleted',
      'restored'
    ],
    required: true,
    index: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true,
    index: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Store the actual changes
    required: false
  },
  previousValues: {
    type: mongoose.Schema.Types.Mixed, // Store previous values for comparison
    required: false
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed, // Store new values
    required: false
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient querying
TaskAuditLogSchema.index({ task: 1, createdAt: -1 });
TaskAuditLogSchema.index({ performedBy: 1, createdAt: -1 });
TaskAuditLogSchema.index({ action: 1, createdAt: -1 });

// Static method to log task changes
TaskAuditLogSchema.statics.logTaskChange = function(taskId, action, performedBy, changes = {}, previousValues = {}, newValues = {}, metadata = {}) {
  return this.create({
    task: taskId,
    action,
    performedBy,
    changes,
    previousValues,
    newValues,
    metadata: {
      ...metadata,
      timestamp: new Date()
    }
  });
};

// Method to get task history
TaskAuditLogSchema.statics.getTaskHistory = function(taskId, limit = 50) {
  return this.find({ task: taskId })
    .populate('performedBy', 'name email username')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('TaskAuditLog', TaskAuditLogSchema);
