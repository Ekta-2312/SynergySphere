const TaskAuditLog = require('../models/TaskAuditLog');

/**
 * Middleware to automatically log task changes
 */
class TaskAuditMiddleware {
  
  /**
   * Log task creation
   * @param {Object} task - The created task
   * @param {String} performedBy - User ID who created the task
   * @param {Object} metadata - Additional metadata (userAgent, ipAddress, etc.)
   */
  static async logTaskCreation(task, performedBy, metadata = {}) {
    try {
      await TaskAuditLog.logTaskChange(
        task._id,
        'created',
        performedBy,
        { task: task.toObject() },
        {},
        { task: task.toObject() },
        metadata
      );
    } catch (error) {
      console.error('Failed to log task creation:', error);
    }
  }

  /**
   * Log task update
   * @param {Object} originalTask - Task before changes
   * @param {Object} updatedTask - Task after changes
   * @param {String} performedBy - User ID who updated the task
   * @param {Object} metadata - Additional metadata
   */
  static async logTaskUpdate(originalTask, updatedTask, performedBy, metadata = {}) {
    try {
      const changes = {};
      const previousValues = {};
      const newValues = {};

      // Compare fields and identify changes
      const fieldsToCheck = [
        'title', 'description', 'status', 'priority', 'assignee', 
        'dueDate', 'estimatedHours', 'actualHours', 'tags'
      ];

      let hasChanges = false;
      fieldsToCheck.forEach(field => {
        const oldValue = originalTask[field];
        const newValue = updatedTask[field];
        
        // Handle ObjectId comparison
        const oldStr = oldValue && oldValue.toString ? oldValue.toString() : oldValue;
        const newStr = newValue && newValue.toString ? newValue.toString() : newValue;
        
        if (oldStr !== newStr) {
          hasChanges = true;
          changes[field] = { from: oldValue, to: newValue };
          previousValues[field] = oldValue;
          newValues[field] = newValue;
        }
      });

      if (hasChanges) {
        // Determine specific action type
        let action = 'updated';
        if (changes.status) {
          action = 'status_changed';
        } else if (changes.assignee) {
          action = changes.assignee.to ? 'assigned' : 'unassigned';
        } else if (changes.priority) {
          action = 'priority_changed';
        } else if (changes.dueDate) {
          action = 'due_date_changed';
        }

        await TaskAuditLog.logTaskChange(
          updatedTask._id,
          action,
          performedBy,
          changes,
          previousValues,
          newValues,
          metadata
        );
      }
    } catch (error) {
      console.error('Failed to log task update:', error);
    }
  }

  /**
   * Log task completion
   * @param {Object} task - The completed task
   * @param {String} performedBy - User ID who completed the task
   * @param {Object} metadata - Additional metadata
   */
  static async logTaskCompletion(task, performedBy, metadata = {}) {
    try {
      await TaskAuditLog.logTaskChange(
        task._id,
        'completed',
        performedBy,
        { status: { from: task.status, to: 'done' } },
        { status: task.status, completedAt: null },
        { status: 'done', completedAt: new Date() },
        metadata
      );
    } catch (error) {
      console.error('Failed to log task completion:', error);
    }
  }

  /**
   * Log task deletion (soft delete)
   * @param {Object} task - The deleted task
   * @param {String} performedBy - User ID who deleted the task
   * @param {Object} metadata - Additional metadata
   */
  static async logTaskDeletion(task, performedBy, metadata = {}) {
    try {
      await TaskAuditLog.logTaskChange(
        task._id,
        'deleted',
        performedBy,
        { isDeleted: { from: false, to: true } },
        { isDeleted: false },
        { isDeleted: true, deletedAt: new Date(), deletedBy: performedBy },
        metadata
      );
    } catch (error) {
      console.error('Failed to log task deletion:', error);
    }
  }

  /**
   * Log task restoration
   * @param {Object} task - The restored task
   * @param {String} performedBy - User ID who restored the task
   * @param {Object} metadata - Additional metadata
   */
  static async logTaskRestoration(task, performedBy, metadata = {}) {
    try {
      await TaskAuditLog.logTaskChange(
        task._id,
        'restored',
        performedBy,
        { isDeleted: { from: true, to: false } },
        { isDeleted: true },
        { isDeleted: false, deletedAt: null, deletedBy: null },
        metadata
      );
    } catch (error) {
      console.error('Failed to log task restoration:', error);
    }
  }

  /**
   * Extract metadata from request object
   * @param {Object} req - Express request object
   * @returns {Object} Metadata object
   */
  static extractMetadata(req) {
    return {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      timestamp: new Date()
    };
  }
}

module.exports = TaskAuditMiddleware;
